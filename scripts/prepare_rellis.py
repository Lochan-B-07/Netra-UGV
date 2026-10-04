"""
NETRA-UGV RELLIS-3D Dataset Preparation & Pre-caching Helper
============================================================
Prepares or pre-caches 4-class converted masks for fast offline loading,
or provides index verification for the RELLIS-3D dataset.

Usage:
    python scripts/prepare_rellis.py [OPTIONS]
"""

import os
import sys
import argparse
import cv2
import numpy as np
from tqdm import tqdm

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# RELLIS-3D to NETRA-UGV 4 Terrain Traversability Classes Lookup Table
LUT_CONVERT = np.full(256, 255, dtype=np.uint8)
# 0 = SOLID_GROUND
LUT_CONVERT[1] = 0   # dirt
LUT_CONVERT[10] = 0  # asphalt
LUT_CONVERT[23] = 0  # concrete
# 1 = PLIANT_VEGETATION
LUT_CONVERT[3] = 1   # grass
LUT_CONVERT[19] = 1  # bush
# 2 = MUD_HAZARD
LUT_CONVERT[6] = 2   # water
LUT_CONVERT[31] = 2  # puddle
LUT_CONVERT[33] = 2  # mud
# 3 = RIGID_OBSTACLE
LUT_CONVERT[4] = 3   # tree
LUT_CONVERT[5] = 3   # pole
LUT_CONVERT[8] = 3   # vehicle
LUT_CONVERT[9] = 3   # object
LUT_CONVERT[12] = 3  # building
LUT_CONVERT[15] = 3  # log
LUT_CONVERT[17] = 3  # person
LUT_CONVERT[18] = 3  # fence
LUT_CONVERT[27] = 3  # barrier
LUT_CONVERT[34] = 3  # rubble
# 255 = IGNORE
LUT_CONVERT[0] = 255 # void
LUT_CONVERT[7] = 255 # sky


def precompute_converted_masks(
    label_root: str,
    split_root: str,
    cache_dir: str,
    target_size: tuple = (1024, 448),
):
    """
    Optional offline pre-caching: resizes and converts raw ID masks to 4-class
    NETRA masks and stores them in `cache_dir`.
    """
    print("=" * 70)
    print(f"[PREPARE] Pre-caching converted masks to: {cache_dir}")
    print(f"Target Resolution: {target_size[0]}x{target_size[1]}")
    print("=" * 70)

    for split in ["train.lst", "val.lst", "test.lst"]:
        spath = os.path.join(split_root, split)
        with open(spath, "r") as f:
            lines = [l.strip() for l in f if l.strip()]

        print(f"Processing split {split} ({len(lines)} files)...")
        for line in tqdm(lines, desc=split):
            parts = line.split()
            r_lbl = parts[1] if len(parts) >= 2 else parts[0].replace("pylon_camera_node", "pylon_camera_node_label_id").replace(".jpg", ".png")
            src_path = os.path.join(label_root, r_lbl)
            dst_path = os.path.join(cache_dir, r_lbl)

            if os.path.isfile(dst_path):
                continue

            os.makedirs(os.path.dirname(dst_path), exist_ok=True)
            raw = cv2.imread(src_path, cv2.IMREAD_UNCHANGED)
            if raw is None:
                continue
            if (raw.shape[1], raw.shape[0]) != target_size:
                raw = cv2.resize(raw, target_size, interpolation=cv2.INTER_NEAREST)
            conv = LUT_CONVERT[raw]
            cv2.imwrite(dst_path, conv)

    print("[OK] Pre-caching complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prepare and pre-cache RELLIS-3D masks.")
    parser.add_argument(
        "--label-root",
        type=str,
        default=r"C:\Users\Aditya\Desktop\ai\Rellis_3D_pylon_camera_node_label_id\Rellis-3D",
    )
    parser.add_argument(
        "--split-root",
        type=str,
        default=r"C:\Users\Aditya\Desktop\ai\Rellis_3D_image_split",
    )
    parser.add_argument(
        "--cache-dir",
        type=str,
        default=r"weights\cached_masks",
        help="Directory to store pre-converted masks (optional).",
    )
    parser.add_argument(
        "--width",
        type=int,
        default=1024,
    )
    parser.add_argument(
        "--height",
        type=int,
        default=448,
    )
    args = parser.parse_args()

    precompute_converted_masks(
        label_root=args.label_root,
        split_root=args.split_root,
        cache_dir=args.cache_dir,
        target_size=(args.width, args.height),
    )
