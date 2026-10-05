# 🎬 NETRA-UGV: Official 5-Minute Technical Video Script
### *Vision-Based Autonomous Navigation for Outdoor UGVs in GPS-Denied Environments*
**Initiative:** Smart India Hackathon (SIH 2026) | **Problem Statement ID:** SIH26126  
**Host Organization:** Bharat Electronics Limited (BEL) — Navratna PSU, Dept. of Defence Production  
**Theme:** Smart Automation / Robotics and Drones | **Category:** Software  
**Team Name:** KernelCrew | **Team ID:** 158370  
**Target Duration:** Exactly 5 Minutes (300 Seconds) | **Target Speaking Pace:** 130–140 words/min (~680 words total)  
**Primary Reference Files:** [README.md](../README.md) · [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) · [MASTER_PROJECT_REPORT.md](./MASTER_PROJECT_REPORT.md)

---

## ⏱️ Video Structure & Timeline Overview

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        5-MINUTE VIDEO MASTER TIMELINE (PS-26126)                       │
├─────────┬───────────────────────────────┬──────────────────────────────────────────────┤
│ Time    │ Chapter / Deliverable         │ Key Visual & Core Demonstration              │
├─────────┼───────────────────────────────┼──────────────────────────────────────────────┤
│ 00:00 - │ Chapter 1: The Problem        │ GPS Outage in Canopy/Ruins, Mud/Grass Stalls,│
│ 00:45   │ (Outdoor Autonomy Bottlenecks)│ Negative Obstacles, Why Costly LiDAR Fails   │
├─────────┼───────────────────────────────┼──────────────────────────────────────────────┤
│ 00:45 - │ Chapter 2: Deliverable 1      │ BiSeNetV2-Lite 4-Class Overlay on RELLIS-3D, │
│ 02:00   │ (Perception AI - Path Detect) │ 76.25% mIoU, Dynamic Lighting & Lens Purge   │
├─────────┼───────────────────────────────┼──────────────────────────────────────────────┤
│ 02:00 - │ Chapter 3: Deliverable 2      │ OpenVINS 50Hz MSCKF Keypoint Tracker,        │
│ 03:15   │ (Visual SLAM & Localization)  │ <1.2% Drift over 500m, Split-Compute ASIC    │
├─────────┼───────────────────────────────┼──────────────────────────────────────────────┤
│ 03:15 - │ Chapter 4: Deliverable 3      │ TEB Kinodynamic Planner (Point A -> Point B),│
│ 04:15   │ (Planning & Ditch Avoidance)  │ Geometric v-Disparity Void Raycaster (<0.6ms)│
├─────────┼───────────────────────────────┼──────────────────────────────────────────────┤
│ 04:15 - │ Chapter 5: System Integration │ Live GCS Dashboard, Multi-Scenario Sim,      │
│ 05:00   │ Multi-Scenario Demo & Impact  │ 18.5ms Latency, Sub-13.5W, BEL Application   │
└─────────┴───────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 📽️ Detailed Segment-by-Segment Production Script

---

### ⏱️ MINUTE 00:00 – 00:45 | CHAPTER 1: The Problem — Outdoor Navigation Challenges

#### 📺 Visual Cues & Screen Directions:
* **00:00 – 00:15:** Title Slide animation with official metadata:
  - Text: *Smart India Hackathon 2026 | Problem Statement 26126*.
  - Subtitle: *NETRA-UGV: Vision-Based Autonomous Navigation for Outdoor UGVs*.
  - Logos: Bharat Electronics Limited (BEL) & Team KernelCrew (ID: 158370).
* **00:15 – 00:30:** Real-world footage / split-screen simulation of outdoor failure modes:
  - Failure 1: Satellite GPS lost under dense forest canopy and collapsed concrete rubble.
  - Failure 2: Conventional rover halting falsely on 50 cm tall pliant grass.
  - Failure 3: Rover tumbling into an unmapped irrigation ditch or erosion trench that planar sensors missed.
* **00:30 – 00:45:** System introduction graphic showing the NETRA-UGV platform (stereo optical head + Jetson Orin Nano edge brain).

#### 🎙️ Presenter Delivery Guide:
* **Tone:** Clear, authoritative, problem-focused.

#### 🗣️ Spoken Script (105 Words):
> *"Respected members of the jury from Bharat Electronics Limited: We are Team KernelCrew, presenting **NETRA-UGV** for Problem Statement 26126.
>
> Deploying autonomous ground vehicles in real-world outdoor environments—such as disaster search-and-rescue, precision agriculture, and remote logistics—presents three major bottlenecks: satellite GPS signals frequently drop under forest canopies and urban rubble; expensive 3D LiDARs cannot tell driveable grass from solid barriers; and standard 2D detectors miss ground drop-offs entirely.
>
> NETRA-UGV is an indigenous, end-to-end vision-inertial autonomous navigation brain that navigates reliably from Point A to Point B without satellite GPS, active LiDAR, or pre-mapped roads."*

---

### ⏱️ MINUTE 00:45 – 02:00 | CHAPTER 2: Deliverable 1 — Perception AI & Path Detection

#### 📺 Visual Cues & Screen Directions:
* **00:45 – 01:10:** Live semantic segmentation inference demonstration:
  - Display raw 1080p stereo video feed alongside real-time semantic segmentation output.
  - Highlight 4 color-coded classes:
    * 🟩 **Solid Traversable Ground** (Soil/Gravel)
    * 🟨 **Pliant Vegetation** (Tall Grass)
    * 🟧 **Loose Mud / Sand** (Caution Zone)
    * 🟥 **Rigid Obstacles & Boundaries** (Rocks, Trunks, Walls)
* **01:10 – 01:35:** Technical metrics overlay:
  - Benchmark callout: **BiSeNetV2-Lite on RELLIS-3D off-road benchmark**.
  - Accuracy: **76.25% mIoU** | Model Size: **2.31M parameters** | INT8 Precision.
  - Inference Latency: **2.6 ms** via TensorRT on NVIDIA Jetson Orin Nano.
* **01:35 – 02:00:** Dynamic lighting resilience demo:
  - Video clips showing direct sunlight glare, high-contrast tree shadows, and lens mud splatter.
  - Show ground-weighted auto-exposure recovering exposure in **< 35 ms**.
  - Show pulse air-purge nozzle graphic clearing lens contamination.

#### 🎙️ Presenter Delivery Guide:
* **Tone:** Technical, confident, data-driven.

#### 🗣️ Spoken Script (165 Words):
> *"Our first deliverable solves Path Detection through a lightweight bilateral segmentation network—**BiSeNetV2-Lite**—trained on the challenging off-road RELLIS-3D dataset.
>
> Rather than relying on simple bounding boxes, our model evaluates ground traversability at the pixel level across four distinct classes: solid ground, pliant brush, mud hazards, and impassable obstacles. Running via INT8 TensorRT on an NVIDIA Jetson Orin Nano, it achieves **76.25% mean IoU** with an ultra-low inference latency of just **2.6 milliseconds**.
>
> Critically, this eliminates the notorious 'false stop' problem of outdoor robotics. When encountering 50-centimeter tall soft grass, traditional LiDAR treats it as a concrete wall. NETRA identifies it as pliant vegetation, activating an adaptive speed governor at 0.5 meters per second—cutting false stops by more than 70%.
>
> To handle changing outdoor illumination—from glaring midday sun to dark forest canopies—our ground-weighted auto-exposure re-locks in under 35 milliseconds, while integrated air nozzles purge optical mud splatter automatically."*

---

### ⏱️ MINUTE 02:00 – 03:15 | CHAPTER 3: Deliverable 2 — Visual Localization Without GPS

#### 📺 Visual Cues & Screen Directions:
* **02:00 – 02:25:** OpenVINS MSCKF visual odometry in action:
  - Screen capture of camera feed overlaid with vibrant green KLT optical flow tracks on FAST corners at **50 Hz**.
  - Sliding-window multi-state constraint visualization updating camera poses.
* **02:25 – 02:50:** Localization Drift & Benchmarking Graph:
  - 500-meter closed-loop outdoor trajectory plot comparing Ground Truth vs. OpenVINS VIO.
  - Callout banner: **Cumulative Translation Drift < 1.2% over 500 m** (BEL Requirement: < 2.0%).
  - Highlight tight fusion with 500 Hz ICM-42688-P 6-DoF tactical IMU and Zero-Velocity Updates (ZUPT).
* **02:50 – 03:15:** Split-Compute Architecture diagram:
  - Highlight Luxonis OAK-D Pro Stereo Engine offloading semi-global matching (SGM) disparity directly onto silicon.
  - Callout: **0 ms Host GPU Overhead for Stereo Disparity** — freeing 100% of the Jetson Ampere GPU for AI perception.

#### 🎙️ Presenter Delivery Guide:
* **Tone:** Precise, analytical, highlighting architectural efficiency.

#### 🗣️ Spoken Script (160 Words):
> *"Deliverable 2 achieves robust visual localization in environments where GPS is blocked by dense tree canopies, deep valleys, or collapsed rubble.
>
> We deploy **OpenVINS Multi-State Constraint Kalman Filter (MSCKF)**, tightly fusing stereo visual keypoints with a 500 Hertz 6-DoF inertial measurement unit. By tracking FAST corner features across a sliding historical window using NEON-accelerated KLT optical flow, our estimator computes accurate 6-DoF position and velocity without maintaining an expensive global 3D landmark map.
>
> Across 500-meter off-road closed-loop field evaluations, NETRA achieves a cumulative translational drift of **less than 1.2%**—well within BEL's 2% operational tolerance.
>
> To make this feasible on low-power hardware, we engineered a **Split-Compute Architecture**. Stereo rectification and semi-global disparity matching are executed entirely on an onboard vision coprocessor. This eliminates 25 milliseconds of heavy depth crunching from the host GPU, reserving 100% of our Jetson engine for neural networks."*

---

### ⏱️ MINUTE 03:15 – 04:15 | CHAPTER 4: Deliverable 3 — Path Planning & Collision Avoidance

#### 📺 Visual Cues & Screen Directions:
* **03:15 – 03:35:** Simulation & Path Planning Demonstration:
  - 3D simulation showing the UGV tracking a multi-waypoint path from **Point A to Point B**.
  - Display the real-time **2.5D Rolling Elevation Costmap** updating at 20 Hz around the rover.
  - Timed Elastic Band (TEB) local planner generating smooth, kinodynamically feasible spline trajectories.
* **03:35 – 04:00:** Geometric hBcDisparity Negative Obstacle Detection:
  - Rover approaches a hidden ditch / erosion trench.
  - Animated split-screen: show raw disparity image transformed into **2D hBcdisparity histogram space**.
  - Show the ground plane line breaking into a disparity void gap.
  - Virtual barrier committed to costmap **3.2 meters ahead in < 0.6 ms**; vehicle smoothly banks around the ditch.
* **04:00 – 04:15:** Latency Waterfall Chart:
  - Sensor DMA (3.5ms) $	o$ Perception/VIO (3.8ms) $	o$ Costmap (2.0ms) $	o$ TEB Spline (7.5ms) $	o$ Motor Dispatch (1.0ms).
  - Total Closed-Loop Latency: **18.5 ms (> 50 Hz control rate)**.

#### 🎙️ Presenter Delivery Guide:
* **Tone:** Energetic, solution-driven, demonstrating safety and agility.

#### 🗣️ Spoken Script (138 Words):
> *"Deliverable 3 transforms perception into safe, reactive vehicle motion from Point A to Point B.
>
> Our kinodynamic Timed Elastic Band planner optimizes trajectories in real time, respecting wheel acceleration limits, terrain friction, and vehicle chassis dimensions at speeds up to 1.5 meters per second.
>
> But the greatest danger in outdoor navigation is negative obstacles—irrigation ditches, ravines, and sudden ground drop-offs that 2D LiDAR and bounding-box models completely miss.
>
> NETRA solves this using **geometric v-disparity raycasting**. By mapping disparity directly in column-space, downward ground drop-offs appear as instant geometric voids. Our algorithm detects ditches up to 3.2 meters ahead in **under 0.6 milliseconds**—giving more than 2.3 seconds of stopping margin.
>
> The entire closed loop—from photons hitting the lens to motor commands—executes in just **18.5 milliseconds**, guaranteeing an ultra-responsive 50 Hertz control rate."*

---

### ⏱️ MINUTE 04:15 – 05:00 | CHAPTER 5: System Integration, Multi-Scenario Demo & BEL Impact

#### 📺 Visual Cues & Screen Directions:
* **04:15 – 04:35:** Live Ground Control Station (GCS) Dashboard ([netraugv.vercel.app](https://netraugv.vercel.app)):
  - Show live browser telemetry: attitude pitch/roll gauge, real-time 2.5D costmap canvas, camera feeds, and mode switches.
  - Highlight the 3 validated test scenarios:
    1. *Search & Rescue Route (5 Waypoints through Rubble & Obstacles)*
    2. *Negative Obstacle (Ditch & Drop-Off Avoidance)*
    3. *Low Visibility Navigation (Tall Grass & Lighting Variations)*
* **04:35 – 04:50:** Verified System KPI Benchmark Card:
  - Localization Drift: **< 1.2% over 500 m**
  - Terrain mIoU: **76.25% on RELLIS-3D**
  - Closed-Loop Latency: **18.5 ms**
  - Total Compute Power: **< 13.5 Watts**
  - Primary Hardware BOM: **₹70,500** (vs. ₹3,00,000+ for imported LiDAR)
* **04:50 – 05:00:** Presenter closing sign-off with Bharat Electronics Limited and KernelCrew team credentials.

#### 🎙️ Presenter Delivery Guide:
* **Tone:** Inspiring, conclusive, emphasizing cost savings, reliability, and industry readiness.

#### 🗣️ Spoken Script (112 Words):
> *"We validated NETRA-UGV across three diverse outdoor simulation environments: a disaster search-and-rescue rubble zone, an off-road agricultural field, and a forested trail with drop-offs. In every scenario, NETRA completed collision-free Point A to Point B missions with zero human intervention.
>
> Our full stack runs under a strict **13.5-Watt power envelope** and costs just **₹70,500** on commercially available hardware—slashing sensor payload costs by over 75% compared to imported LiDAR systems.
>
> NETRA-UGV provides Bharat Electronics Limited with a field-ready, cost-effective vision navigation brain for outdoor robotic surveillance, search-and-rescue, and smart automation. Thank you."*

---

## 📋 Production & Recording Verification Checklist

| Technical Item | Production Standard | Verified |
| :--- | :--- | :---: |
| **Audio Clarity** | Lapel / Condenser mic, zero echo, normalized to -14 LUFS | [ ] |
| **Pacing Check** | Total word count: ~680 words; spoken duration strictly **04:50 to 04:58** | [ ] |
| **Screen Captures** | 1080p 60 FPS RViz2, Webots simulation, and Live GCS Dashboard | [ ] |
| **No Military Jargon** | Verified 0 mentions of combat, EW, zeroization, or battlefield threats | [x] |
| **Direct PS Alignment** | Explicitly demonstrates all 3 Deliverables of SIH PS-26126 | [x] |

---
*Document Version: 4.0 (Aligned to SIH 26126 BEL Civilian Autonomous Robotics Requirements)*
