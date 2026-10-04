"""
NETRA-UGV BiSeNetV2 ONNX Model Test & Inference Script
======================================================
Standalone test script to validate the exported BiSeNetV2 ONNX model
using ONNX Runtime on a test image from the RELLIS-3D dataset.

Requirements:
  - Model: weights/bisenetv2_rellis.onnx
  - Image: C:\\Users\\Aditya\\Desktop\\ai\\Rellis_3D_pylon_camera_node\\Rellis-3D\\00000\\pylon_camera_node\\frame000000-1581624652_750.jpg
  - Target input: 1024 x 448 RGB
  - Output shape: (1, 4, 448, 1024)
  - Classes:
      0 = SOLID_GROUND
      1 = PLIANT_VEGETATION
      2 = MUD_HAZARD
      3 = RIGID_OBSTACLE
  - Outputs:
      weights/test_segmentation_mask.png
      weights/test_segmentation_overlay.png

Usage:
  python scripts/test_bisenetv2_onnx.py
"""

import os
import sys
import time
import argparse
import cv2
import numpy as np

# Configure Windows console stdout for clean output
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add torch's CUDA DLLs if available so ONNX Runtime can use CUDAExecutionProvider
try:
    import torch
    torch_lib = os.path.join(os.path.dirname(torch.__file__), "lib")
    if os.path.exists(torch_lib) and hasattr(os, "add_dll_directory"):
        os.add_dll_directory(torch_lib)
except Exception:
    pass

try:
    import onnxruntime as ort
except ImportError:
    ort = None

# 4 Outdoor Terrain Traversability Classes
CLASS_NAMES = [
    "SOLID_GROUND",       # 0: Soil, dirt road, gravel, asphalt
    "PLIANT_VEGETATION",  # 1: Grass, light brush
    "MUD_HAZARD",         # 2: Wet mud, marsh, puddles, water
    "RIGID_OBSTACLE",     # 3: Trees, rocks, poles, obstacles
]
NUM_CLASSES = 4

# Colormap for visualization (in BGR format for cv2.imwrite)
# 0 = SOLID_GROUND:      Warm Dirt / Tan -> RGB [180, 140, 90]  -> BGR [90, 140, 180]
# 1 = PLIANT_VEGETATION: Vibrant Green   -> RGB [46, 204, 113]  -> BGR [113, 204, 46]
# 2 = MUD_HAZARD:        Orange / Mud    -> RGB [230, 126, 34]  -> BGR [34, 126, 230]
# 3 = RIGID_OBSTACLE:    Lethal Red      -> RGB [231, 76, 60]   -> BGR [60, 76, 231]
COLORMAP_BGR = np.zeros((NUM_CLASSES, 3), dtype=np.uint8)
COLORMAP_BGR[0] = [90, 140, 180]   # SOLID_GROUND
COLORMAP_BGR[1] = [113, 204, 46]   # PLIANT_VEGETATION
COLORMAP_BGR[2] = [34, 126, 230]   # MUD_HAZARD
COLORMAP_BGR[3] = [60, 76, 231]    # RIGID_OBSTACLE


def run_test(
    model_path: str = r"weights/bisenetv2_rellis.onnx",
    image_path: str = r"weights/sample_terrain.jpg",
    mask_out_path: str = r"weights/test_segmentation_mask.png",
    overlay_out_path: str = r"weights/test_segmentation_overlay.png",
    target_w: int = 1024,
    target_h: int = 448,
):
    print("=" * 70)
    print("[TEST] NETRA-UGV BiSeNetV2 ONNX Inference Test")
    print("=" * 70)

    # 1. Validate files
    if not os.path.isfile(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    if not os.path.isfile(image_path):
        raise FileNotFoundError(f"Test image not found: {image_path}")

    print(f"Model: {model_path}")
    print(f"Image: {image_path}")

    # 2. Load ONNX model with available backend (ONNX Runtime or OpenCV DNN)
    if ort is not None:
        providers = ["CUDAExecutionProvider", "CPUExecutionProvider"] if "CUDAExecutionProvider" in ort.get_available_providers() else ["CPUExecutionProvider"]
        try:
            session = ort.InferenceSession(model_path, providers=providers)
        except Exception:
            session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
        active_provider = session.get_providers()[0]
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        print(f"Backend: ONNX Runtime ({active_provider})")
        print(f"Input Node: '{input_name}', Output Node: '{output_name}'")
    else:
        print("Backend: OpenCV DNN (ONNX Runtime not installed, using OpenCV DNN)")
        net = cv2.dnn.readNetFromONNX(model_path)

    # 3. Read image and preprocess
    bgr_orig = cv2.imread(image_path)
    if bgr_orig is None:
        raise IOError(f"Failed to load image from {image_path}")
    h_orig, w_orig = bgr_orig.shape[:2]

    # Convert BGR to RGB
    rgb_orig = cv2.cvtColor(bgr_orig, cv2.COLOR_BGR2RGB)

    # Resize to target resolution (1024 x 448)
    rgb_resized = cv2.resize(rgb_orig, (target_w, target_h), interpolation=cv2.INTER_LINEAR)
    bgr_resized = cv2.resize(bgr_orig, (target_w, target_h), interpolation=cv2.INTER_LINEAR)

    # Standard ImageNet normalization matching training pipeline
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32).reshape(1, 1, 3)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(1, 1, 3)
    rgb_norm = (rgb_resized.astype(np.float32) / 255.0 - mean) / std

    # Transpose to (1, 3, 448, 1024)
    blob = np.expand_dims(rgb_norm.transpose(2, 0, 1), axis=0).astype(np.float32)

    # 4. Warm-up and benchmark inference
    if ort is not None:
        session.run([output_name], {input_name: blob})
        t_start = time.perf_counter()
        output_tensor = session.run([output_name], {input_name: blob})[0]
        infer_time_ms = (time.perf_counter() - t_start) * 1000.0
    else:
        net.setInput(blob)
        _ = net.forward()
        t_start = time.perf_counter()
        output_tensor = net.forward()
        infer_time_ms = (time.perf_counter() - t_start) * 1000.0

    # 5. Argmax over classes
    # output_tensor shape: (1, 4, 448, 1024) -> pred_mask shape: (448, 1024)
    pred_mask = np.argmax(output_tensor[0], axis=0).astype(np.uint8)

    # 6. Generate colored segmentation mask
    color_mask_bgr = COLORMAP_BGR[pred_mask]

    # 7. Generate 50/50 overlay
    overlay_bgr = cv2.addWeighted(bgr_resized, 0.5, color_mask_bgr, 0.5, 0.0)

    # 8. Save output files
    os.makedirs(os.path.dirname(os.path.abspath(mask_out_path)), exist_ok=True)
    os.makedirs(os.path.dirname(os.path.abspath(overlay_out_path)), exist_ok=True)
    cv2.imwrite(mask_out_path, color_mask_bgr)
    cv2.imwrite(overlay_out_path, overlay_bgr)

    # 9. Compute class pixel percentages
    total_pixels = pred_mask.size
    counts = np.bincount(pred_mask.flatten(), minlength=NUM_CLASSES)
    percentages = (counts / total_pixels) * 100.0

    # 10. Print required results
    print("-" * 70)
    print(f"Input Shape:      {blob.shape}  (Batch=1, Channels=3, Height={target_h}, Width={target_w})")
    print(f"Output Shape:     {output_tensor.shape}  (Batch=1, Classes={NUM_CLASSES}, Height={target_h}, Width={target_w})")
    print(f"Inference Time:   {infer_time_ms:.2f} ms")
    print("-" * 70)
    print("Class Distribution:")
    for idx, (name, pct, cnt) in enumerate(zip(CLASS_NAMES, percentages, counts)):
        print(f"  Class {idx} ({name:18s}): {cnt:7,d} pixels ({pct:5.2f}%)")
    print("-" * 70)
    print("Output Files:")
    print(f"  Segmentation Mask:    {os.path.abspath(mask_out_path)}")
    print(f"  50/50 Overlay Image:  {os.path.abspath(overlay_out_path)}")
    print("=" * 70)
    print("[OK] Test completed successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test NETRA-UGV BiSeNetV2 ONNX model.")
    parser.add_argument(
        "--model",
        type=str,
        default=r"weights/bisenetv2_rellis.onnx",
        help="Path to BiSeNetV2 ONNX model.",
    )
    parser.add_argument(
        "--image",
        type=str,
        default=r"weights/sample_terrain.jpg",
        help="Path to test image.",
    )
    parser.add_argument(
        "--mask-out",
        type=str,
        default=r"weights/test_segmentation_mask.png",
        help="Path to save segmentation mask.",
    )
    parser.add_argument(
        "--overlay-out",
        type=str,
        default=r"weights/test_segmentation_overlay.png",
        help="Path to save 50/50 overlay image.",
    )
    parser.add_argument("--width", type=int, default=1024, help="Input width (default: 1024).")
    parser.add_argument("--height", type=int, default=448, help="Input height (default: 448).")
    args = parser.parse_args()

    run_test(
        model_path=args.model,
        image_path=args.image,
        mask_out_path=args.mask_out,
        overlay_out_path=args.overlay_out,
        target_w=args.width,
        target_h=args.height,
    )
