# 🌲 NETRA-UGV BiSeNetV2 Terrain Segmentation Pipeline Guide
### Complete Training, Verification, and Export Workflow for RELLIS-3D

---

## 1. Dataset Configuration & Paths

The RELLIS-3D dataset is extracted and preserved at `C:\Users\Aditya\Desktop\ai`:

| Component | Path | Description |
| :--- | :--- | :--- |
| **RGB Images** | `C:\Users\Aditya\Desktop\ai\Rellis_3D_pylon_camera_node\Rellis-3D` | 13,556 Raw RGB frames across sequences `00000`–`00004` |
| **Label Masks** | `C:\Users\Aditya\Desktop\ai\Rellis_3D_pylon_camera_node_label_id\Rellis-3D` | 6,234 Annotated keyframe ID masks |
| **Split Lists** | `C:\Users\Aditya\Desktop\ai\Rellis_3D_image_split` | `train.lst` (3,302), `val.lst` (983), `test.lst` (1,672) |

---

## 2. RELLIS-3D to NETRA-UGV 4 Terrain Traversability Classes Mapping

The 20 raw RELLIS-3D ontology classes are mapped into NETRA's 4 outdoor terrain traversability classes for unstructured environments:

| Raw ID | RELLIS-3D Class | NETRA Class ID | Traversability Class Name | Autonomous Vehicle Reaction |
| :---: | :--- | :---: | :--- | :--- |
| **1** | Dirt | **0** | `SOLID_GROUND` | Full mission speed ($\le 1.5$ m/s) |
| **10** | Asphalt | **0** | `SOLID_GROUND` | Full mission speed |
| **23** | Concrete | **0** | `SOLID_GROUND` | Full mission speed |
| **3** | Grass | **1** | `PLIANT_VEGETATION` | Governed speed ($\le 0.5$ m/s) |
| **19** | Bush | **1** | `PLIANT_VEGETATION` | Governed speed ($\le 0.5$ m/s) |
| **6** | Water | **2** | `MUD_HAZARD` | Slip precaution ($\le 0.4$ m/s, gentle steering) |
| **31** | Puddle | **2** | `MUD_HAZARD` | Traction caution |
| **33** | Mud | **2** | `MUD_HAZARD` | Anti-slip torque vectoring |
| **4** | Tree | **3** | `RIGID_OBSTACLE` | Hard collision barrier (Repel / Avoid) |
| **5** | Pole | **3** | `RIGID_OBSTACLE` | Hard collision barrier |
| **8** | Vehicle | **3** | `RIGID_OBSTACLE` | Hard collision barrier |
| **9** | Object | **3** | `RIGID_OBSTACLE` | Hard collision barrier |
| **12** | Building | **3** | `RIGID_OBSTACLE` | Hard collision barrier |
| **15** | Log | **3** | `RIGID_OBSTACLE` | Hard collision barrier |
| **17** | Person | **3** | `RIGID_OBSTACLE` | Emergency safety barrier |
| **18** | Fence | **3** | `RIGID_OBSTACLE` | Hard collision barrier |
| **27** | Barrier | **3** | `RIGID_OBSTACLE` | Hard collision barrier |
| **34** | Rubble | **3** | `RIGID_OBSTACLE` | Hard collision barrier |
| **0** | Void / Unlabeled | **255** | `IGNORE` | Excluded from training loss |
| **7** | Sky | **255** | `IGNORE` | Excluded from training loss |

---

## 3. Workflow & Commands

### Step 1: Verify Dataset & Visual Inspection
Audits all split pairings, verifies zero missing files, and creates an alpha-blended visual debug image:
```bash
python scripts/verify_rellis_dataset.py
```
* **Output:** `weights/dataset_sample_verification.png`

### Step 2: Model Training (RTX 4050 GPU)
Trains the lightweight 2.31M parameter BiSeNetV2 network using Automatic Mixed Precision (AMP) and cosine learning rate scheduling:
```bash
python scripts/train_bisenetv2.py --epochs 40 --batch-size 4 --lr 1e-3 --amp
```
* **Hardware:** NVIDIA GeForce RTX 4050 Laptop GPU (6GB VRAM)
* **Target Resolution:** $1024 \times 448$ RGB
* **Output Checkpoint:** `weights/bisenetv2_rellis_best.pth`

### Step 3: ONNX Export & Cross-Backend Verification
Loads the best checkpoint and exports the computation graph into ONNX format with opset 17, validating numerical equivalence:
```bash
python scripts/export_bisenetv2_onnx.py --weights weights/bisenetv2_rellis_best.pth --output weights/bisenetv2_rellis.onnx --opset 17
```
* **Input Tensor:** `input_rgb` (`1, 3, 448, 1024`)
* **Output Tensor:** `output_mask` (`1, 4, 448, 1024`)
* **Output Model:** `weights/bisenetv2_rellis.onnx`

---

## 4. Perception Pipeline Integration

The exported `bisenetv2_rellis.onnx` model is natively loaded by `src/netra_perception/netra_perception/bisenetv2_inference.py`.

In `src/netra_perception/config/perception_params.yaml`:
```yaml
perception_node:
  ros__parameters:
    onnx_model_path: "weights/bisenetv2_rellis.onnx"
```
The node automatically runs GPU or OpenCV DNN inference without any code modification.
