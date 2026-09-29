## 📁 Repository Structure & Project Documentation

All complete engineering reports, slide decks, technical specifications, and presentation video scripts have been consolidated into [`docs/`](./docs/):

```
SIH-2/
├── README.md                         # Main repository overview, specs & direct links
├── dashboard/                        # Tactical Ground Control Station (GCS) Web Dashboard (pnpm, React, Vite)
├── docs/                             # Complete project technical documentation
│   ├── MASTER_PROJECT_REPORT.md      # Comprehensive defence master engineering report
│   ├── TECHNICAL_ARCHITECTURE.md     # Deep-dive engineering blueprint & POSIX scheduling
│   ├── VIDEO_SCRIPT_5MIN.md          # Timed 5-minute technical presentation script
│   ├── PPT_SLIDES_DECK.md            # Official 5-slide SIH submission deck & presenter notes
│   ├── RESEARCH_FEEDER_BEL_UGV.md    # Domain research, threat modeling & rubric alignment
│   └── architecture_diagram.pdf      # High-resolution system architecture diagram
├── src/                              # Clean ROS 2 Humble packages
│   ├── netra_security/               # S-ROS 2 policies, SecOC CAN authentication & zeroization
│   ├── netra_perception/             # BiSeNetV2 TensorRT INT8 inference + Ground-ROI crop
│   ├── netra_localization/           # OpenVINS EKF-MSCKF + KLT tracker + 500 Hz IMU fusion
│   ├── netra_mapping/                # 2.5D risk costmap + v-Disparity negative obstacle raycaster
│   └── netra_planning/               # Kinodynamic TEB local planner + tip-over & shock safety guards
├── weights/                          # TensorRT INT8 engines & encrypted model binaries
└── sim/                              # Gazebo Garden tactical world & UGV URDF models
```

### 🎛️ Tactical Web Dashboard (Ground Control Station)
* 👉 **[`dashboard/`](./dashboard/)** — Live control panel, central HUD & tactical 2D map with click-and-control waypoints, autonomous simulation engine, and multi-scenario Demo Mode built with `pnpm`.

### 📖 Direct Links to Documentation
* 👉 **[Defence Master Engineering Report](./docs/MASTER_PROJECT_REPORT.md)** — In-depth technical synthesis, FIPS 140-3 cryptography, MIL-STD shielding, deterministic math, and failsafe hierarchy.
* 👉 **[Technical Architecture & System Specs](./docs/TECHNICAL_ARCHITECTURE.md)** — Detailed POSIX scheduling, CPU core isolation, S-ROS 2 XML permission manifests, custom message definitions, and bus topology.
* 👉 **[Official 5-Minute Video Presentation Script](./docs/VIDEO_SCRIPT_5MIN.md)** — Exact timing breakdown (0:00 to 5:00), visual screen directions, verbatim spoken script (~135 words/min), and production checklist.
* 👉 **[Official 5-Slide Presentation Deck & Notes](./docs/PPT_SLIDES_DECK.md)** — Verbatim slide copy, visual layouts, and 30-to-60 second presenter speaking scripts focusing on security and robustness.
* 👉 **[Research Feeder & Threat Modeling](./docs/RESEARCH_FEEDER_BEL_UGV.md)** — Deep battlefield threat analysis, cyber-physical attack vectors, hardware BOM spectrum, and SIH evaluation rubric alignment.
* 👉 **[Terrain Segmentation AI & Training Report](./docs/WORK_COMPLETION_REPORT_TERRAIN_AI.md)** — Complete synthesis of RELLIS-3D dataset auditing, BiSeNetV2 training (76.25% mIoU), ONNX acceleration, and ROS 2 perception integration.
