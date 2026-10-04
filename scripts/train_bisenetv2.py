"""
NETRA-UGV BiSeNetV2 Terrain Segmentation Training Pipeline
===========================================================
Trains the BiSeNetV2 network on RELLIS-3D off-road camera imagery
mapped to NETRA's 4 outdoor off-road terrain traversability classes:
  0: SOLID_GROUND
  1: PLIANT_VEGETATION
  2: MUD_HAZARD
  3: RIGID_OBSTACLE
  (255: IGNORE / VOID / SKY)

Hardware Optimized for NVIDIA RTX 4050 Laptop GPU (6GB VRAM) using
Automatic Mixed Precision (AMP) and memory-conscious batching.

Outputs:
  weights/bisenetv2_rellis_best.pth

Usage:
  python scripts/train_bisenetv2.py --epochs 40 --batch-size 4 --lr 1e-3 --amp
"""

import os
import sys
import argparse
import time
import math
import random
import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from tqdm import tqdm
from typing import Dict, List, Tuple, Optional

# Add perception package to sys.path to load BiSeNetV2
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PERCEPTION_PKG = os.path.join(PROJECT_ROOT, "src", "netra_perception", "netra_perception")
if PERCEPTION_PKG not in sys.path:
    sys.path.insert(0, PERCEPTION_PKG)

from bisenetv2_model import BiSeNetV2

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Class mappings
CLASS_NAMES = ["SOLID_GROUND", "PLIANT_VEGETATION", "MUD_HAZARD", "RIGID_OBSTACLE"]
NUM_CLASSES = 4
IGNORE_INDEX = 255

# Fast LUT for raw RELLIS-3D IDs to NETRA 4 Classes
LUT_CONVERT = np.full(256, IGNORE_INDEX, dtype=np.uint8)
LUT_CONVERT[1] = 0   # dirt -> SOLID_GROUND
LUT_CONVERT[10] = 0  # asphalt -> SOLID_GROUND
LUT_CONVERT[23] = 0  # concrete -> SOLID_GROUND
LUT_CONVERT[3] = 1   # grass -> PLIANT_VEGETATION
LUT_CONVERT[19] = 1  # bush -> PLIANT_VEGETATION
LUT_CONVERT[6] = 2   # water -> MUD_HAZARD
LUT_CONVERT[31] = 2  # puddle -> MUD_HAZARD
LUT_CONVERT[33] = 2  # mud -> MUD_HAZARD
LUT_CONVERT[4] = 3   # tree -> RIGID_OBSTACLE
LUT_CONVERT[5] = 3   # pole -> RIGID_OBSTACLE
LUT_CONVERT[8] = 3   # vehicle -> RIGID_OBSTACLE
LUT_CONVERT[9] = 3   # object -> RIGID_OBSTACLE
LUT_CONVERT[12] = 3  # building -> RIGID_OBSTACLE
LUT_CONVERT[15] = 3  # log -> RIGID_OBSTACLE
LUT_CONVERT[17] = 3  # person -> RIGID_OBSTACLE
LUT_CONVERT[18] = 3  # fence -> RIGID_OBSTACLE
LUT_CONVERT[27] = 3  # barrier -> RIGID_OBSTACLE
LUT_CONVERT[34] = 3  # rubble -> RIGID_OBSTACLE


class RELLISDataset(Dataset):
    """RELLIS-3D Semantic Segmentation PyTorch Dataset."""

    def __init__(
        self,
        split_file: str,
        img_root: str,
        label_root: str,
        target_w: int = 1024,
        target_h: int = 448,
        is_train: bool = True,
        cache_dir: Optional[str] = None,
    ):
        self.img_root = img_root
        self.label_root = label_root
        self.target_w = target_w
        self.target_h = target_h
        self.is_train = is_train
        self.cache_dir = cache_dir

        with open(split_file, "r") as f:
            lines = [l.strip() for l in f if l.strip()]

        self.samples = []
        for line in lines:
            parts = line.split()
            if len(parts) >= 2:
                r_img, r_lbl = parts[0], parts[1]
            else:
                r_img = parts[0]
                r_lbl = r_img.replace("pylon_camera_node", "pylon_camera_node_label_id").replace(".jpg", ".png")
            f_img = os.path.join(img_root, r_img)
            f_lbl = os.path.join(label_root, r_lbl)
            if os.path.isfile(f_img) and os.path.isfile(f_lbl):
                self.samples.append((f_img, f_lbl, r_lbl))

        # Standard ImageNet normalization parameters
        self.mean = np.array([0.485, 0.456, 0.406], dtype=np.float32).reshape(1, 1, 3)
        self.std = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(1, 1, 3)

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        f_img, f_lbl, r_lbl = self.samples[idx]

        # 1. Read RGB image
        bgr = cv2.imread(f_img)
        if bgr is None:
            raise IOError(f"Could not load image: {f_img}")
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)

        # 2. Read mask
        if self.cache_dir and os.path.isfile(os.path.join(self.cache_dir, r_lbl)):
            mask = cv2.imread(os.path.join(self.cache_dir, r_lbl), cv2.IMREAD_UNCHANGED)
        else:
            raw_mask = cv2.imread(f_lbl, cv2.IMREAD_UNCHANGED)
            if raw_mask is None:
                raise IOError(f"Could not load mask: {f_lbl}")
            mask = LUT_CONVERT[raw_mask]

        # 3. Resize to target dimension (1024 x 448)
        if rgb.shape[1] != self.target_w or rgb.shape[0] != self.target_h:
            rgb = cv2.resize(rgb, (self.target_w, self.target_h), interpolation=cv2.INTER_LINEAR)
        if mask.shape[1] != self.target_w or mask.shape[0] != self.target_h:
            mask = cv2.resize(mask, (self.target_w, self.target_h), interpolation=cv2.INTER_NEAREST)

        # 4. Augmentations (Train only)
        if self.is_train:
            # Random horizontal flip
            if random.random() > 0.5:
                rgb = np.fliplr(rgb).copy()
                mask = np.fliplr(mask).copy()

            # Random brightness & contrast
            if random.random() > 0.5:
                alpha = random.uniform(0.85, 1.15)
                beta = random.uniform(-15, 15)
                rgb = np.clip(alpha * rgb + beta, 0, 255).astype(np.uint8)

        # 5. Normalize and convert to PyTorch tensors
        rgb_norm = rgb.astype(np.float32) / 255.0
        rgb_norm = (rgb_norm - self.mean) / self.std
        tensor_img = torch.from_numpy(rgb_norm.transpose(2, 0, 1)).float()
        tensor_mask = torch.from_numpy(mask).long()

        return tensor_img, tensor_mask


class ConfusionMatrix:
    """Confusion matrix tracker for multi-class semantic segmentation IoU."""

    def __init__(self, num_classes: int, ignore_index: int = 255):
        self.num_classes = num_classes
        self.ignore_index = ignore_index
        self.matrix = np.zeros((num_classes, num_classes), dtype=np.int64)

    def update(self, preds: np.ndarray, targets: np.ndarray):
        valid = (targets != self.ignore_index)
        t = targets[valid]
        p = preds[valid]
        valid_p = (p >= 0) & (p < self.num_classes)
        t = t[valid_p]
        p = p[valid_p]
        indices = self.num_classes * t + p
        counts = np.bincount(indices, minlength=self.num_classes ** 2)
        self.matrix += counts.reshape(self.num_classes, self.num_classes)

    def get_iou(self) -> Tuple[np.ndarray, float]:
        tp = np.diag(self.matrix)
        fp = np.sum(self.matrix, axis=0) - tp
        fn = np.sum(self.matrix, axis=1) - tp
        denom = tp + fp + fn
        iou = np.divide(tp, denom, out=np.zeros_like(tp, dtype=float), where=denom != 0)
        valid_classes = (np.sum(self.matrix, axis=1) > 0)
        miou = float(np.mean(iou[valid_classes])) if np.any(valid_classes) else 0.0
        return iou, miou

    def reset(self):
        self.matrix.fill(0)


def train_epoch(
    model: nn.Module,
    loader: DataLoader,
    optimizer: torch.optim.Optimizer,
    criterion: nn.Module,
    scaler: Optional[torch.amp.GradScaler],
    device: torch.device,
    use_amp: bool = True,
    use_aux: bool = True,
) -> float:
    """Runs a single training epoch."""
    model.train()
    total_loss = 0.0
    num_batches = len(loader)

    for images, masks in tqdm(loader, desc="Training", leave=False):
        images = images.to(device, non_blocking=True)
        masks = masks.to(device, non_blocking=True)

        optimizer.zero_grad(set_to_none=True)

        with torch.amp.autocast('cuda', enabled=use_amp):
            if use_aux:
                out, a2, a3, a4, a5 = model(images)
                loss_main = criterion(out, masks)
                loss_a2 = criterion(a2, masks)
                loss_a3 = criterion(a3, masks)
                loss_a4 = criterion(a4, masks)
                loss_a5 = criterion(a5, masks)
                loss = loss_main + 0.25 * (loss_a2 + loss_a3 + loss_a4 + loss_a5)
            else:
                out = model(images)
                loss = criterion(out, masks)

        if use_amp and scaler is not None:
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
        else:
            loss.backward()
            optimizer.step()

        total_loss += loss.item()

    return total_loss / max(1, num_batches)


@torch.no_grad()
def validate_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
    use_amp: bool = True,
) -> Tuple[float, np.ndarray, float]:
    """Runs validation, computing loss, per-class IoU, and mean IoU."""
    model.eval()
    total_loss = 0.0
    num_batches = len(loader)
    cm = ConfusionMatrix(num_classes=NUM_CLASSES, ignore_index=IGNORE_INDEX)

    for images, masks in tqdm(loader, desc="Validation", leave=False):
        images = images.to(device, non_blocking=True)
        masks = masks.to(device, non_blocking=True)

        with torch.amp.autocast('cuda', enabled=use_amp):
            out = model(images)
            loss = criterion(out, masks)

        total_loss += loss.item()
        preds = torch.argmax(out, dim=1).cpu().numpy()
        targets = masks.cpu().numpy()
        cm.update(preds, targets)

    iou_per_class, miou = cm.get_iou()
    avg_loss = total_loss / max(1, num_batches)
    return avg_loss, iou_per_class, miou


def main():
    parser = argparse.ArgumentParser(description="Train BiSeNetV2 on RELLIS-3D for NETRA-UGV.")
    parser.add_argument("--epochs", type=int, default=40, help="Number of training epochs (default: 40)")
    parser.add_argument("--batch-size", type=int, default=4, help="Batch size (default: 4, safe for 6GB RTX 4050)")
    parser.add_argument("--lr", type=float, default=1e-3, help="Initial learning rate (default: 0.001)")
    parser.add_argument("--workers", type=int, default=2, help="DataLoader num_workers (default: 2)")
    parser.add_argument("--img-root", type=str, default=r"C:\Users\Aditya\Desktop\ai\Rellis_3D_pylon_camera_node\Rellis-3D")
    parser.add_argument("--label-root", type=str, default=r"C:\Users\Aditya\Desktop\ai\Rellis_3D_pylon_camera_node_label_id\Rellis-3D")
    parser.add_argument("--split-root", type=str, default=r"C:\Users\Aditya\Desktop\ai\Rellis_3D_image_split")
    parser.add_argument("--weights-dir", type=str, default="weights", help="Directory to save checkpoint models")
    parser.add_argument("--amp", action="store_true", default=True, help="Use Automatic Mixed Precision (AMP)")
    parser.add_argument("--use-aux", action="store_true", default=True, help="Use auxiliary booster heads during training")
    args = parser.parse_args()

    print("=" * 70)
    print("🚀 NETRA-UGV BiSeNetV2 TERRAIN SEGMENTATION TRAINING")
    print("=" * 70)

    # 1. Device check
    if not torch.cuda.is_available():
        print("[WARNING] CUDA is NOT available. Running on CPU (will be slow)!")
        device = torch.device("cpu")
        args.amp = False
    else:
        device = torch.device("cuda")
        gpu_name = torch.cuda.get_device_name(0)
        vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
        print(f"[OK] Hardware: {gpu_name} ({vram_gb:.2f} GB VRAM)")
        print(f"[OK] Acceleration: CUDA 12.1 + cuDNN + AMP ({'ENABLED' if args.amp else 'DISABLED'})")

    os.makedirs(args.weights_dir, exist_ok=True)
    best_weights_path = os.path.join(args.weights_dir, "bisenetv2_rellis_best.pth")

    # 2. Datasets & Loaders
    train_split = os.path.join(args.split_root, "train.lst")
    val_split = os.path.join(args.split_root, "val.lst")

    print("\n[DATASET] Loading RELLIS-3D Splits:")
    train_ds = RELLISDataset(train_split, args.img_root, args.label_root, is_train=True)
    val_ds = RELLISDataset(val_split, args.img_root, args.label_root, is_train=False)

    print(f"  * Train samples: {len(train_ds):,}")
    print(f"  * Val samples:   {len(val_ds):,}")
    print(f"  * Batch size:    {args.batch_size}")
    print(f"  * Target Size:   1024 x 448 RGB")

    train_loader = DataLoader(
        train_ds,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=args.workers,
        pin_memory=torch.cuda.is_available(),
        drop_last=True,
    )
    val_loader = DataLoader(
        val_ds,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=args.workers,
        pin_memory=torch.cuda.is_available(),
    )

    # 3. Model, Loss, Optimizer, Scheduler
    model = BiSeNetV2(num_classes=NUM_CLASSES, use_aux=args.use_aux).to(device)
    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"\n[MODEL] BiSeNetV2 initialized ({total_params / 1e6:.2f}M trainable parameters)")

    criterion = nn.CrossEntropyLoss(ignore_index=IGNORE_INDEX)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-5)
    scaler = torch.amp.GradScaler('cuda') if args.amp else None

    # 4. Training Loop
    print("\n" + "=" * 70)
    print(f"Starting Training for {args.epochs} Epochs...")
    print("=" * 70)

    best_miou = 0.0

    for epoch in range(1, args.epochs + 1):
        t0 = time.time()
        curr_lr = optimizer.param_groups[0]["lr"]

        train_loss = train_epoch(
            model=model,
            loader=train_loader,
            optimizer=optimizer,
            criterion=criterion,
            scaler=scaler,
            device=device,
            use_amp=args.amp,
            use_aux=args.use_aux,
        )

        val_loss, ious, miou = validate_epoch(
            model=model,
            loader=val_loader,
            criterion=criterion,
            device=device,
            use_amp=args.amp,
        )

        scheduler.step()
        elapsed = time.time() - t0

        # Status output
        iou_str = " | ".join([f"{CLASS_NAMES[i][:4]}: {ious[i]*100:.1f}%" for i in range(NUM_CLASSES)])
        print(
            f"Epoch [{epoch:02d}/{args.epochs:02d}] ({elapsed:.1f}s, lr={curr_lr:.6f}) "
            f"Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | mIoU: {miou*100:.2f}% | [{iou_str}]"
        )

        # Save best model
        if miou > best_miou:
            best_miou = miou
            checkpoint = {
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "miou": best_miou,
                "class_iou": {CLASS_NAMES[i]: float(ious[i]) for i in range(NUM_CLASSES)},
                "num_classes": NUM_CLASSES,
                "input_size": (1024, 448),
            }
            torch.save(checkpoint, best_weights_path)
            print(f"  --> [SAVED BEST] New best validation mIoU: {best_miou*100:.2f}% -> {best_weights_path}")

    print("\n" + "=" * 70)
    print(f"[COMPLETE] Training finished. Best Validation mIoU: {best_miou*100:.2f}%")
    print(f"[OUTPUT] Best Checkpoint: {best_weights_path}")
    print("=" * 70)


if __name__ == "__main__":
    main()
