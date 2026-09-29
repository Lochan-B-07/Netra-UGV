# 🛰️ NETRA-UGV: Off-Road Terrain AI & Model Pipeline Work Completion Report
### Comprehensive Engineering Synthesis: Dataset Auditing, Model Training, ONNX Acceleration & ROS 2 Integration
**Author:** Aditya Tummuri (`adityafrom2007@gmail.com`)  
**Repository:** [github.com/AdityaTummuri/Netra-UGV](https://github.com/AdityaTummuri/Netra-UGV)  
**System Module:** `src/netra_perception` & `weights/`  
**Target Hardware:** NVIDIA GeForce RTX 4050 Laptop GPU (Development) / NVIDIA Jetson Orin Nano (Target UGV)  

---

## 1. Executive Summary

This report documents the end-to-end design, implementation, training, verification, and ROS 2 integration of the **BiSeNetV2 off-road terrain semantic segmentation neural network** for the NETRA-UGV autonomous defence ground vehicle.

The vision pipeline enables the unmanned ground vehicle to analyze front-facing stereo camera imagery in real time, segmenting every pixel into one of **4 sovereign tactical terrain classes** to command speed governance, traction control, and collision avoidance without relying on paved roads or lane markers.

---

## 2. Dataset Auditing & Tactical Re-Mapping

### 2.1 Dataset Staging
The multimodal **RELLIS-3D** dataset was extracted and verified across sequences `00000` through `00004`:
* **Raw Camera Imagery:** `13,556` RGB frames ($1920 \times 1200$)
* **Annotated Ground Truth Masks:** `6,234` keyframe semantic ID masks
* **Standard Benchmark Splits:**
  * `train.lst`: **3,302** image-mask pairs
  * `val.lst`: **983** image-mask pairs
  * `test.lst`: **1,672** image-mask pairs
  * **Total matched split pairs:** **5,957** pairs (**0** pairing errors, 100% verified match)

### 2.2 Tactical Ontology Re-Mapping
The 20 raw RELLIS-3D classes were mathematically re-mapped to NETRA's 4 tactical reaction classes:

| Raw ID | RELLIS-3D Label | NETRA Class ID | Tactical Label | Vehicle Operational Response | Costmap Value |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **1, 10, 23** | Dirt, Asphalt, Concrete | **0** | `SOLID_GROUND` | Full mission speed ($\le 1.5$ m/s) | **0** |
| **3, 19** | Grass, Bush | **1** | `PLIANT_VEGETATION` | Governed velocity ($\le 0.5$ m/s) | **35** |
| **6, 31, 33** | Water, Puddle, Mud | **2** | `MUD_HAZARD` | Slip precaution ($\le 0.4$ m/s, gentle steering) | **75** |
| **4, 5, 8, 9, 12, 15, 17, 18, 27, 34** | Trees, Poles, Vehicles, Objects, Buildings, Logs, Persons, Fences, Barriers, Rubble | **3** | `RIGID_OBSTACLE` | Hard collision barrier (Repel / Virtual obstacle) | **255 (Lethal)** |
| **0, 7** | Void / Unlabeled, Sky | **255** | `IGNORE` | Excluded from training loss | N/A |

### 2.3 Verification Script & Visual Audit
We developed `scripts/verify_rellis_dataset.py` to audit dataset integrity and generate multi-sample verification overlays:
* Output generated at [`weights/dataset_sample_verification.png`](file:///c:/Users/Aditya/Desktop/Netra-UGV/weights/dataset_sample_verification.png).
* Confirmed that grass is mapped to green, mud/ruts to orange, solid paths to tan, obstacles/trees to red, and the sky is ignored.

---

## 3. BiSeNetV2 Architecture Implementation

Implemented clean PyTorch BiSeNetV2 architecture in [`src/netra_perception/netra_perception/bisenetv2_model.py`](file:///c:/Users/Aditya/Desktop/Netra-UGV/src/netra_perception/netra_perception/bisenetv2_model.py):
* **Detail Branch:** 3 convolution stages ($1/8$ spatial reduction, 128 channels) preserving fine spatial details (trail edges, ditches, grass stems).
* **Semantic Branch:** Stem Block ($1/4$ reduction) + Gather-and-Expansion (GE) Layers + Context Embedding Block (GAP + Sigmoid channel gating) capturing high-level global context.
* **Bilateral Guided Aggregation (BGA) Layer:** Fuses low-level edge features with semantic context.
* **Segment Head:** Predicts 4 tactical logits with bilinear upsampling back to input resolution ($1024 \times 448$).
* **Training Boosters:** Added 4 auxiliary heads during training (`use_aux=True`) for deep supervision, automatically stripped during export/evaluation.
* **Total Parameters:** **2.31M** parameters.

---

## 4. Model Training Pipeline

Developed [`scripts/train_bisenetv2.py`](file:///c:/Users/Aditya/Desktop/Netra-UGV/scripts/train_bisenetv2.py) optimized for the **NVIDIA GeForce RTX 4050 Laptop GPU**:
* **Hardware Acceleration:** PyTorch CUDA 12.1 with Automatic Mixed Precision (`torch.amp.autocast`).
* **Batch Configuration:** Batch size `4` utilizing ~2.5 GB of VRAM (well within the 6 GB physical ceiling).
* **Optimization:** AdamW optimizer (`lr=1e-3`, `weight_decay=1e-4`) with Cosine Annealing learning rate schedule.
* **Loss Function:** 4-class Cross-Entropy Loss with auxiliary loss supervision and `ignore_index=255`.
* **Validation Metric:** Real-time confusion matrix computing per-class IoU and mean IoU (mIoU).
* **Training Result:** Best validation mIoU of **76.25%** achieved across all 4 tactical classes.
* **Artifact Saved:** [`weights/bisenetv2_rellis_best.pth`](file:///c:/Users/Aditya/Desktop/Netra-UGV/weights/bisenetv2_rellis_best.pth) (29.59 MB).

---

## 5. ONNX Export & Edge Verification

### 5.1 Graph Export
Developed [`scripts/export_bisenetv2_onnx.py`](file:///c:/Users/Aditya/Desktop/Netra-UGV/scripts/export_bisenetv2_onnx.py):
* **Input Tensor:** `input_rgb` $\rightarrow [1, 3, 448, 1024]$ float32.
* **Output Tensor:** `output_mask` $\rightarrow [1, 4, 448, 1024]$ float32 logits.
* **Opset Version:** 17 with constant folding enabled.
* **Artifact Exported:** [`weights/bisenetv2_rellis.onnx`](file:///c:/Users/Aditya/Desktop/Netra-UGV/weights/bisenetv2_rellis.onnx) (8.79 MB, SHA-256: `01292717e549416361beee6fa49ab0a70632faedaa19d25cb1f02156dc13fc28`).
* **Numerical Validation:** PyTorch vs ONNX Runtime output difference $< 10^{-4}$.

### 5.2 Standalone Test Inference
Created [`scripts/test_bisenetv2_onnx.py`](file:///c:/Users/Aditya/Desktop/Netra-UGV/scripts/test_bisenetv2_onnx.py) and benchmarked on test frame `frame000000-1581624652_750.jpg`:
* **Active Execution Provider:** `CUDAExecutionProvider` (RTX 4050 GPU).
* **Inference Latency:** **14.06 ms** per frame ($> 70\text{ FPS}$).
* **Predicted Class Distribution:**
  * Solid Ground: **3.14%**
  * Pliant Vegetation: **29.65%**
  * Mud Hazard: **27.13%**
  * Rigid Obstacle: **40.08%**
* **Verification Images:**
  * Colorized Segmentation Mask: [`weights/test_segmentation_mask.png`](file:///c:/Users/Aditya/Desktop/Netra-UGV/weights/test_segmentation_mask.png)
  * 50/50 Scene Overlay: [`weights/test_segmentation_overlay.png`](file:///c:/Users/Aditya/Desktop/Netra-UGV/weights/test_segmentation_overlay.png)

---

## 6. ROS 2 Perception Pipeline Integration

Integrated the trained model directly into the existing ROS 2 architecture:

1. **[`src/netra_perception/netra_perception/bisenetv2_inference.py`](file:///c:/Users/Aditya/Desktop/Netra-UGV/src/netra_perception/netra_perception/bisenetv2_inference.py):**
   * Priority hierarchy: `TensorRT INT8` $\rightarrow$ `ONNX Runtime (CUDAExecutionProvider)` $\rightarrow$ `OpenCV DNN` $\rightarrow$ `HSV Heuristic`.
   * Integrated exact training preprocessing: BGR $\rightarrow$ RGB conversion, resize to $1024 \times 448$, divide by $255.0$, and ImageNet normalization.
   * Dynamic Windows CUDA DLL registration for seamless GPU execution.
   * Telemetry tracking for latency and class distributions.

2. **[`src/netra_perception/netra_perception/perception_node.py`](file:///c:/Users/Aditya/Desktop/Netra-UGV/src/netra_perception/netra_perception/perception_node.py):**
   * Added startup logging displaying backend, active provider, and input resolution.
   * Added warning checks for accidental CPU fallback.
   * Added periodic telemetry logging every 15 frames:
     ```text
     [INFO] [perception_node]: [BiSeNetV2 AI] Latency: 22.1 ms | Provider: CUDAExecutionProvider | Dist: [Gnd:3.1% Veg:29.7% Mud:27.1% Obs:40.1%] | Conf: 0.95
     ```

3. **[`src/netra_perception/config/perception_params.yaml`](file:///c:/Users/Aditya/Desktop/Netra-UGV/src/netra_perception/config/perception_params.yaml):**
   * Configured `onnx_model_path: "weights/bisenetv2_rellis.onnx"`.

4. **[`src/netra_perception/package.xml`](file:///c:/Users/Aditya/Desktop/Netra-UGV/src/netra_perception/package.xml):**
   * Declared `python3-onnxruntime` dependency.

---

## 7. Repository Structure & Artifacts

All files were organized according to [`docs/WEIGHTS_AND_MODELS_GUIDE.md`](file:///c:/Users/Aditya/Desktop/Netra-UGV/docs/WEIGHTS_AND_MODELS_GUIDE.md):

```
Netra-UGV/
├── docs/
│   ├── MASTER_PROJECT_REPORT.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── WEIGHTS_AND_MODELS_GUIDE.md
│   ├── WEIGHTS_AND_MODELS_TRAINING.md
│   └── WORK_COMPLETION_REPORT_TERRAIN_AI.md   # <--- THIS REPORT
├── scripts/
│   ├── verify_rellis_dataset.py              # Dataset pairing audit & visualization
│   ├── train_bisenetv2.py                    # PyTorch AMP training pipeline
│   ├── export_bisenetv2_onnx.py              # ONNX opset 17 export & verification
│   ├── test_bisenetv2_onnx.py                # Standalone ONNX runtime test
│   └── prepare_rellis.py                     # Offline pre-caching helper
├── src/
│   └── netra_perception/
│       ├── config/perception_params.yaml     # Points to weights/bisenetv2_rellis.onnx
│       ├── netra_perception/
│       │   ├── bisenetv2_model.py            # BiSeNetV2 PyTorch definition
│       │   ├── bisenetv2_inference.py        # ONNX Runtime CUDA multi-backend
│       │   └── perception_node.py            # ROS 2 perception node + telemetry
│       └── package.xml                       # Updated dependencies
└── weights/
    ├── README.md                             # Provenance & SHA-256 hashes
    ├── bisenetv2_rellis.onnx                 # Trained ONNX model (8.79 MB)
    ├── bisenetv2_rellis_best.pth             # Trained PyTorch checkpoint (29.59 MB)
    ├── bisenetv2_rellis_int8.trt             # Fallback stub for CPU / non-Jetson
    ├── dataset_sample_verification.png       # Dataset audit visual image
    ├── test_segmentation_mask.png            # Inference test output mask
    ├── test_segmentation_overlay.png         # Inference test 50/50 overlay
    └── scripts/                              # Deployment scripts for Jetson Orin Nano
        ├── build_trt_engine.sh
        ├── calibrate_int8.py
        ├── download_dataset_sample.sh
        ├── export_onnx.py
        └── generate_stub.py
```

---

## 8. Git Commit & Remote Synchronization

* **Tracked Model Weights:** `.gitignore` was configured to explicitly allow `weights/bisenetv2_rellis.onnx` and `weights/bisenetv2_rellis_best.pth` while excluding heavy raw datasets and `.trt` binary files.
* **Commit Hash:** `4cfeffe` (`4cfeffe93b74689641d7df7d49a39e9e48e8ec87`)
* **Branch:** `main`
* **Remote Repository:** `https://github.com/AdityaTummuri/Netra-UGV.git`
* **Commit Message:** `"Add RELLIS-3D BiSeNetV2 terrain segmentation model"`
* **Remote Status:** Successfully pushed and synchronized with `origin/main`.
