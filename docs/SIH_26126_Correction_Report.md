# 🔴 NETRA-UGV: SIH 2026 PS-26126 — Complete Correction Report
### Organization: Bharat Electronics Limited (BEL) | Theme: Smart Automation
**Report Date:** 2026-10-02 | **Edit Window Closes:** 2026-10-05

---

> [!CAUTION]
> This is a critical, root-level realignment. The submission was designed around **Ministry of Defence military-grade tactical warfare** use cases. The actual problem statement (PS 26126, BEL) asks for **civilian/industrial-grade autonomous outdoor UGV navigation**. Every deliverable needs to be corrected accordingly.

---

## 📋 SECTION 1: THE CORE PROBLEM — WHAT YOU BUILT VS. WHAT WAS ASKED

### What PS 26126 Actually Asks For
| Requirement | Exact Wording from Portal |
|---|---|
| **Context** | Unpredictable terrain, changing light, **unreliable GPS** (not "jammed GPS") |
| **Application Domains** | **Search-and-rescue, agriculture, or delivery** |
| **Challenge 1** | Path Detection: traversable paths vs. hazards |
| **Challenge 2** | Visual Localization: position/orientation **without GPS** using visual data |
| **Challenge 3** | Collision Avoidance: dynamically routing around **sudden obstacles** |
| **Deliverable 1** | Perception AI: lightweight model for obstacle and path detection |
| **Deliverable 2** | Visual SLAM/Odometry: pipeline to track vehicle movement |
| **Deliverable 3** | Path Planner: algorithm translating visual data to wheel/motor commands |
| **Success Criterion** | Collision-free navigation from **Point A to Point B across outdoor scenarios** |
| **Organization** | **Bharat Electronics Limited** (Civilian PSU) — NOT Ministry of Defence |

### What You Actually Built (The Military Tactical System)
Your entire system — NETRA-UGV — is architected around **defence-grade military combat needs**:
- Threat model: *Enemy Electronic Warfare (EW) jammers, Laser Warning Receivers, battlefield capture*
- Security layer: *FIPS 140-3 zeroization, AES-256 LUKS2, SecOC CAN-FD, S-ROS 2, hardware crowbar circuits*
- Hardware: *MIL-STD-461G/810H chassis, sapphire glass optics, -30°C to +55°C range for LoC/LAC/Thar*
- Framing: *Tactical combat, Line of Control, EW jamming, Krasukha-class jammers, DRDO Daksh*
- Impact pillars: *Combat survivability, optical stealth, Atmanirbhar Bharat for Indian Armed Forces*

### The Verdict
**The core algorithms (BiSeNetV2 perception, OpenVINS MSCKF, TEB planner) are 100% correct and highly capable.** The technical stack directly solves PS 26126. The critical problem is the *entire framing, language, use-case, and security architecture* which is built for a Ministry of Defence submission, not BEL's civilian robotics problem.

---

## 📋 SECTION 2: WHAT STAYS (TECHNICAL STRENGTHS — DO NOT CHANGE)

These are genuinely strong and directly aligned to PS 26126:

| Component | Why It's Correct & Strong |
|---|---|
| **BiSeNetV2-Lite on RELLIS-3D** | Directly solves "Path Detection" — off-road outdoor terrain segmentation |
| **OpenVINS MSCKF + KLT tracker** | Directly solves "Visual Localization" — GPS-denied visual odometry |
| **TEB Planner (Nav2)** | Directly solves "Path Planner" — translates costmap to motor commands |
| **v-Disparity negative obstacle detection** | Strong innovation — detects ditches/drop-offs (hazards) |
| **ROS 2 Humble architecture** | Industry-standard, exactly right |
| **Webots + Gazebo simulation** | Correct validation approach |
| **RELLIS-3D training pipeline** | Correct off-road dataset |
| **INT8 TensorRT quantization** | Correct edge-AI optimization |
| **2.5D rolling costmap** | Correct approach to terrain mapping |
| **Dashboard (GCS React app)** | Strong visualization — just needs re-framing |

---

## 📋 SECTION 3: IDEA / CONCEPT — CHANGES NEEDED

### 3.1 Problem Framing — COMPLETE REWRITE NEEDED

**Current (Wrong):** "GPS-jammed combat theater... EW warfare... tactical battlefield survival..."

**Correct Framing:** The problem is an **outdoor UGV operating in unstructured, GPS-unreliable environments** for civil/industrial purposes. Frame it around three target areas from the PS:
1. **Search & Rescue:** A UGV needs to navigate disaster zones (rubble, uneven terrain, collapsed structures) where GPS is blocked by buildings, debris, and indoor environments.
2. **Precision Agriculture:** A UGV navigating crop rows, uneven fields, and muddy terrains where GPS has multipath errors.
3. **Last-Mile Delivery in Remote Areas:** GPS-denied areas like dense forests, hilly terrain, or urban canyons.

> [!IMPORTANT]
> BEL is a defence PSU, so you can keep the "outdoor rugged terrain" angle. But the framing must be civilian/industrial application of autonomous UGV — not "combat zone" or "tactical warfare." The judges are from BEL's unmanned systems division, which covers border surveillance, search-and-rescue, and disaster response — all legitimate civilian BEL applications.

### 3.2 The Three Core Challenges — Mapping & Corrections

| PS 26126 Challenge | What You Have | What Needs to Change |
|---|---|---|
| **Path Detection** | BiSeNetV2 segmenting RELLIS-3D classes | ✅ Keep, but re-label classes. Remove "mud purge trigger" language. Call it "traversability detection" |
| **Visual Localization** | OpenVINS MSCKF + KLT + loop closure | ✅ Keep entirely. Drop military framing ("ZUPT for battlefield") |
| **Collision Avoidance** | TEB planner + v-disparity | ✅ Keep. Rename scenarios from "tactical terrain" to "outdoor terrain" |

### 3.3 Features to REMOVE or TONE DOWN SIGNIFICANTLY

| Current Feature | Action Required | Reason |
|---|---|---|
| **SecOC CAN-FD authentication** | ❌ Remove or reduce to footnote | Not asked for. Adds noise to the submission — irrelevant to PS |
| **FIPS 140-3 hardware zeroization** | ❌ Remove entirely | Military-grade self-destruct — completely irrelevant to civilian BEL PS |
| **S-ROS 2 DDS encryption / X.509 certs** | ❌ Remove or mention briefly | Not part of the 3 challenges. Off-topic |
| **LUKS2 AES-256 disk encryption** | ❌ Remove | Not a deliverable |
| **MIL-STD-461G/810H shielding** | ⚠️ Tone down heavily | Replace with "ruggedized outdoor enclosure, IP65/67" |
| **"Enemy LWR detection" / LiDAR stealth** | ❌ Remove entirely | Combat framing, not civilian |
| **Krasukha-class EW jammers** | ❌ Remove entirely | Military threat modeling |
| **LoC/LAC/Thar Desert battlefield** | ❌ Remove entirely | Replace with: forest, farmland, urban canyons, disaster zones |
| **Tamper crowbar circuit** | ❌ Remove | Military anti-capture, not relevant |
| **Atmanirbhar Bharat / DRDO Daksh** | ⚠️ Soften | Can mention "Make in India" angle but drop the defence weapon system references |
| **"NETRA = Eyes of Tactical Battlefield"** | ⚠️ Rebrand | Change to "Eyes for Outdoor Autonomous Navigation" |

### 3.4 Features to ADD or EMPHASIZE

| Missing Feature / Framing | Why It's Needed |
|---|---|
| **Explicit Point A → Point B demo** | The success criterion is specifically A→B navigation. Emphasize this in every deliverable |
| **Civilian use-case scenarios** | Search & rescue rubble field, agricultural field, dense forest canopy — replace all "tactical" scenarios |
| **Changing light conditions** | PS specifically mentions "changing light." Add handling: dawn/dusk, shadows, direct sunlight — mention your model's RELLIS-3D covers this |
| **GPS unreliability (not jamming)** | Reframe as "urban canyons, forest canopy, indoor-outdoor transitions" causing GPS loss |
| **Multi-scenario outdoor validation** | PS says "across outdoor scenarios" — your sim covers this, just re-name the scenarios |
| **BEL civilian product alignment** | BEL makes border surveillance robots, search-and-rescue bots — reference these civilian applications |

---

## 📋 SECTION 4: THE PPT SLIDES — SLIDE-BY-SLIDE CORRECTION

### Slide 1: Title Page

| Element | Current (Wrong) | Fix Required |
|---|---|---|
| Organization line | "Bharat Electronics Limited (BEL) — **Ministry of Defence**" | Change to: "Bharat Electronics Limited (BEL) — **Navratna PSU, Department of Defence Production**" *(BEL is under DoDP, not MoD directly — but more importantly remove the "Ministry of Defence" framing that makes this sound like a combat weapon system)* |
| Subtitle | "Hardware-Shielded, Encrypted, Passive Vision-Inertial Autonomous Navigation Brain for **Tactical UGVs in GPS-Denied Combat Theaters**" | Change to: "Vision-Based Autonomous Navigation for Outdoor UGVs in GPS-Denied Environments" |
| Presenter spoken script | "...respected members from Bharat Electronics Limited and **the Ministry of Defence**..." | Remove Ministry of Defence reference. "Respected members of the jury from Bharat Electronics Limited..." |
| Category tag | "Software (**Defence Robotics**)" | Change to: "Software (**Autonomous Robotics**)" or just "Software" |

### Slide 2: Proposed Solution

| Element | Current (Wrong) | Fix Required |
|---|---|---|
| Headline framing | "NETRA-UGV — Passive Vision-Inertial Navigation Brain for **Tactical Combat UGVs**" | Change to: "NETRA-UGV — Vision-Based Autonomous Navigation for **Outdoor UGVs**" |
| Bullet 1 | "100% Passive & Covert Navigation... avoiding **hostile Laser Warning Receivers (LWR) and Night Vision Devices**" | Rewrite: "Camera-only navigation operating under complete GPS outage using onboard stereo vision, requiring zero active sensors" |
| Bullet 5 | "FIPS 140-3 Hardware Cryptography & Zeroization... **electronic crowbar circuit**..." | ❌ Remove entirely. Replace with a bullet on **multi-scenario outdoor validation** (forest, disaster zone, field) |
| Key innovation plot | *Disparity triangulation error* graph | ✅ Keep — this is a strong technical graph demonstrating ditch detection |
| Innovation section | "Defence-Grade Non-Repudiated Bus Security... **SecOC, FIPS, zeroization**" | ❌ Replace with: "Bayesian Temporal Costmap: eliminates false stops in tall grass while detecting true hazards" |
| Presenter script | "...encrypted storage, authenticated CAN bus... **zeroize in under 85ms if captured**" | Remove entirely. Replace with emphasis on the 3 PS challenges solved |

### Slide 3: Technical Approach

| Element | Current (Wrong) | Fix Required |
|---|---|---|
| Tech Stack line | "Middleware & Security: ROS 2 Humble + CycloneDDS + **S-ROS 2 (X.509 + AES-GCM-256)**" | Remove S-ROS 2 security line. Keep: "ROS 2 Humble + CycloneDDS" |
| Terrain classification table | "Level 2 Degraded (Fog) — **Failsafe**, Air-purge wash fires; **inertial dead-reckon**" | ✅ Keep the terrain table — it's directly relevant. Rename "tactical" language: "Level 2 Vision-Degraded" instead of "Level 2 Degraded (Fog)" |
| Latency flow last step | "5. **SecOC CAN-FD**: AES-128 CMAC, Motor Bus (1ms)" | Change to: "5. **Motor Command Dispatch**: geometry_msgs/Twist → PWM signals (1ms)" |
| Presenter script | "...dispatching **authenticated CAN commands**..." | Change to: "...dispatching velocity commands to wheel motor drivers..." |
| All "tactical" references | "Tactical Terrain/Failsafe Classification Table" | Rename: "Outdoor Terrain Classification & Traversability Table" |

### Slide 4: Feasibility and Viability

| Element | Current (Wrong) | Fix Required |
|---|---|---|
| Header | "**MIL-STD-461G/810H** Compliance | Split-Compute Thermal Envelope & BOM Analysis" | Change to: "IP67 Ruggedization | Edge-AI Compute Budget & Hardware BOM Analysis" |
| Technical Feasibility | "...RT-PREEMPT guarantees worst-case scheduling jitter..." | ✅ Keep — this is relevant |
| Commercial/Cost Feasibility | "₹70,500 vs. ₹3,00,000+ for **imported LiDAR UGV systems**" | Reframe: "₹70,500 full vision-based stack vs. ₹3,00,000+ for LiDAR-dependent platforms — enabling **cost-effective outdoor autonomous UGV deployment**" |
| Operational Feasibility | "**Monolithic billet 6061-T6 aluminum** with silver-fluorosilicone **MIL-STD-461G** gaskets (>85 dB EMI)" | ❌ Replace with: "Ruggedized outdoor enclosure (IP65+), passive fanless cooling for -10°C to +55°C ambient, hydrophobic optical windows" |
| BOM Table — "Physical Shielding Standard" row | "MIL-STD-461G & MIL-STD-810H" | Change to: "IP67 sealed enclosure, weatherproofed connectors" |
| BOM Table — "Actuation Bus" row | "Isolated CAN-FD with **SecOC**" | Change to: "CAN-FD / I2C / PWM motor control interface" |
| Presenter script | "...billet 6061 aluminum... **MIL-STD-461G**, protecting against **high-power microwave pulses**..." | Complete rewrite. Focus on: outdoor durability, thermal management, cost, and edge compute efficiency |

### Slide 5: Impact and Benefits

| Element | Current (Wrong) | Fix Required |
|---|---|---|
| Knockout metric | "< 85 ms WIPE — **Zeroization on Breach**" | ❌ Remove entirely. Replace with a relevant KPI e.g.: "**< 5% False Stops** — Tall Grass Traversal" or "**76.25% mIoU** — RELLIS-3D Validation" |
| Pillar 1 | "**Tactical & Combat Impact**: 100% passive eliminates detection by enemy LWR..." | ❌ Completely rewrite: "**Mission Impact**: Enables autonomous outdoor navigation for search-and-rescue, precision agriculture, and delivery without GPS dependency" |
| Pillar 3 | "**Industrial & BEL Alignment**: plug-and-play with BEL's **Robotic Surveillance Platform and DRDO Daksh**" | Change to: "**Industrial & BEL Alignment**: Directly applicable to BEL's unmanned ground systems portfolio for border surveillance, disaster response, and inspection robots" |
| Pillar 5 | "**Strategic Sovereignty**: 100% indigenous, air-gapped software stack eliminating reliance on **foreign LiDAR suppliers**" | Change to: "**Make in India / Cost Efficiency**: 100% open-source software stack on commercially available hardware — deployable at ₹30,000–₹70,500 per unit" |
| Target Audience | "**Indian Armed Forces & BEL**" | Change to: "**BEL Unmanned Systems Division**, NDRF, Agricultural Automation, Smart Logistics" |
| Presenter script | "...zero-emission navigation prevents optical detection by **enemy forces**..." | Complete rewrite. Focus on the 3 civilian impact areas: search-and-rescue, agriculture, delivery |

### Slide 6: Research and References

| Element | Current (Wrong) | Fix Required |
|---|---|---|
| Standards listed | "**MIL-STD-810H**, **MIL-STD-461G**, **FIPS 140-3**, **AUTOSAR SecOC**" | ❌ Remove all military standards. These are irrelevant to the PS and weaken your submission by making it look off-topic. Keep only academic references |
| Government refs | "BEL Unmanned Systems Business Vertical: **Robotic Surveillance Platform Technical Architecture**" | Change to: "BEL Unmanned Systems: Civilian Outdoor Robot Applications (Disaster Response, Border Patrol)" |
| Deliverables section | GitHub link pointing to "sampati" repo | ✅ Update to current repo link |
| ✅ Academic refs | BiSeNetV2, OpenVINS, RELLIS-3D, TartanAir, LightGlue, TEB | These are all correct and strong — keep all of them |

---

## 📋 SECTION 5: THE DASHBOARD — CHANGES NEEDED

### 5.1 HeaderBar Component ([HeaderBar.tsx](file:///home/sunny/Desktop/projects/Netra-UGV/dashboard/src/components/HeaderBar.tsx))

| Current Element | Fix |
|---|---|
| `"BEL DEFENCE"` badge | Change to `"BEL OUTDOOR"` or `"BEL AUTONOMOUS"` |
| `"S-ROS2 SECURE NODE"` tag | Change to `"ROS2 HUMBLE NODE"` |
| `"CAN-FD AUTH: AES-128"` | Change to `"CAN-FD MOTOR BUS"` |
| Demo Scenario 1: `"▶ SCENARIO 1: Perimeter Patrol (5 WPs)"` | Keep concept. Rename to: `"▶ SCENARIO 1: Search & Rescue Route (5 WPs)"` |
| Demo Scenario 2: `"▶ SCENARIO 2: Negative Trench Void Avoidance"` | ✅ Keep — directly relevant to PS hazard detection |
| Demo Scenario 3: `"▶ SCENARIO 3: Mud Splatter & Air-Purge"` | Rename: `"▶ SCENARIO 3: Low Visibility & Obstacle Avoidance"` |

### 5.2 TelemetryHealthPanel — Security Section
- **Remove** the "ZEROIZE" button (hardware key destruction trigger)
- **Remove** the "FIPS 140-3 Zeroization" status display
- **Replace** with a "GPS Signal Quality" indicator (low/medium/high) and "Navigation Mode" display

### 5.3 TacticalMapCanvas ([TacticalMapCanvas.tsx](file:///home/sunny/Desktop/projects/Netra-UGV/dashboard/src/components/LiveView/TacticalMapCanvas.tsx))
| Current Element | Fix |
|---|---|
| `TRENCH-ALPHA`, `TRENCH-BRAVO`, `TRENCH-CHARLIE`, `TRENCH-DELTA` labels | Rename to: `DITCH-01`, `RAVINE-01`, etc. or keep "trench" (a trench is a legitimate outdoor hazard) |
| Map layer `'TOPOGRAPHIC' | 'AI_COSTMAP'` | ✅ Keep — these are appropriate |
| Tactical combat aesthetics | The dark tactical theme is fine for a GCS dashboard. Minor: add a few civilian scenario overlays |

### 5.4 AI Segmentation Lab ([AiSegmentationLab.tsx](file:///home/sunny/Desktop/projects/Netra-UGV/dashboard/src/components/LiveView/AiSegmentationLab.tsx))
- ✅ This component is highly relevant — it directly visualizes the Perception AI deliverable
- Ensure class labels shown are: "Traversable Path / Safe Ground", "Tall Grass / Vegetation", "Mud / Loose Surface", "Obstacle / Barrier"
- Remove any "tactical" or "combat" class naming

---

## 📋 SECTION 6: THE BACKEND / ROS 2 STACK — CHANGES NEEDED

### 6.1 netra_security Package — SIGNIFICANT CHANGES

This entire package is about military-grade crypto and should be **deprioritized or hidden** from the demo. The PS does not ask for it.

| File | Current Purpose | Action |
|---|---|---|
| `secoc_can_driver.py` | SecOC AES-128 CMAC authentication on CAN bus | Keep code (it works), but in the demo/video show the standard `/cmd_vel` path, not the SecOC path |
| `tamper_monitor.py` | Hull breach + zeroization trigger | ❌ Do not demo this in the video — irrelevant to PS judges |
| `crypto_utils.py` | AES key management | Keep as-is, just don't highlight |
| `sros2_policies/` | S-ROS 2 TLS certificates | Keep as-is, just don't highlight |

> [!TIP]
> The security code can remain in the repo as a "bonus feature / future BEL deployment consideration" — but the demo video and PPT should NOT spend any time on it. All 5 minutes of video time should go to the 3 PS challenges.

### 6.2 netra_msgs Custom Messages
| Message | Status |
|---|---|
| `TerrainClassification.msg` | ✅ Directly relevant to Path Detection |
| `NegativeObstacleVoid.msg` | ✅ Directly relevant to Collision Avoidance |
| `FailsafeState.msg` | ✅ Relevant (failsafe/degraded navigation) |
| `SecuredTwist.msg` | ⚠️ Security-specific — keep in code, just don't demo |

### 6.3 netra_planning Package
- The `planner_node.py` docstring mentions "**Tactical**" terrain. Rename comments to "**Outdoor**" terrain.
- Remove references to "DRDO Daksh integration" in comments
- The TEB planner itself is 100% correct

### 6.4 netra_perception Package
- ✅ Fully correct as-is
- One comment change: in `perception_params.yaml`, if it mentions "tactical" classes, rename to "outdoor terrain" classes

---

## 📋 SECTION 7: THE SIMULATION — CHANGES NEEDED

### 7.1 Webots World ([netra_tactical.wbt](file:///home/sunny/Desktop/projects/Netra-UGV/sim/webots/worlds/netra_tactical.wbt))
| Current | Fix |
|---|---|
| World name / comments mentioning "tactical" | Rename to "netra_outdoor.wbt" or keep name but change description |
| Controller uses `lidar_down` for negative obstacle | ✅ Keep — this is the right approach |
| Controller uses GPS + IMU as "stand-in for OpenVINS" | ✅ Acceptable for simulation. Add comment: "GPS stand-in for visual odometry in simulation" |
| Security demo keys (HMAC, T/S/R keypress) | ⚠️ Don't demo this in the video. The T/S/R keyboard security demo is off-topic |
| 5 waypoints: `(-12,-10)` → `(21,13)` | ✅ Keep the A→B navigation demo — this directly shows success criterion |

### 7.2 Gazebo World ([tactical_obstacle.world](file:///home/sunny/Desktop/projects/Netra-UGV/sim/worlds/tactical_obstacle.world))
- ✅ Outdoor obstacle terrain is correct
- Remove any "tactical" / military terminology in SDF comments

### 7.3 Scenarios to Demonstrate in Video (Revised)
Replace military scenarios with these civilian-aligned outdoor scenarios:

| Old Scenario | New Scenario (Aligned to PS) |
|---|---|
| "EW Jamming battlefield patrol" | **Scenario A: Search & Rescue** — UGV navigating rubble/rough terrain from Point A to Point B (GPS denied by building occlusion) |
| "Anti-tank ditch avoidance" | **Scenario B: Ditch/Ravine Avoidance** — ✅ Keep! Just rename "ditch" instead of "anti-tank ditch." This directly tests Path Detection + Collision Avoidance |
| "Mud splatter air-purge tactical" | **Scenario C: Low-Visibility Navigation** — UGV navigating through tall grass, changing lighting, maintaining path detection |

---

## 📋 SECTION 8: THE MODEL TRAINING — NO MAJOR CHANGES NEEDED ✅ [COMPLETED]

The AI model training is 100% aligned to the PS:

| Aspect | Status |
|---|---|
| Dataset: RELLIS-3D (outdoor off-road) | ✅ Correct |
| Architecture: BiSeNetV2-Lite | ✅ Correct (lightweight model as asked) |
| mIoU: 76.25% | ✅ Strong result |
| TensorRT INT8 export | ✅ Shows edge-AI deployment |
| Classes: terrain traversability | ✅ Correct |

**Completed changes:**
- [x] In `train_bisenetv2.py` docstrings and `WEIGHTS_AND_MODELS_TRAINING.md`: Removed references to "tactical terrain" and "battlefield" contexts. Replaced with "outdoor off-road terrain" and "unstructured outdoor environments".
- [x] In `WEIGHTS_AND_MODELS_GUIDE.md`: Removed references to "MIL-spec" deployment, military FIPS 140-3 zeroization, and replaced with standard Jetson Orin Nano / embedded edge compute deployment and integrity verification.
- [x] In supporting scripts (`verify_rellis_dataset.py`, `test_bisenetv2_onnx.py`, `prepare_rellis.py`) and `WORK_COMPLETION_REPORT_TERRAIN_AI.md`: Aligned class nomenclature to "outdoor terrain traversability classes".

---

## 📋 SECTION 9: THE VIDEO SCRIPT — COMPLETE RESTRUCTURE NEEDED

### Current 5-Minute Chapter Structure (Wrong)
| Chapter | Current Topic | Problem |
|---|---|---|
| 00:00–01:00 | **The Tactical Crisis & Battlefield Failures** | Combat framing, LoC/LAC, EW jammers |
| 01:00–02:00 | **Security-First: Encryption & Shielding** | MIL-STD, AES-256, zeroization — not in PS |
| 02:00–03:00 | Deterministic Core Perception & Ditch Detection | ✅ Relevant |
| 03:00–04:00 | **Split-Compute BOM & Latency** | Partially relevant |
| 04:00–05:00 | **Failsafe Hierarchy & KPIs** | Too tactical |

### Correct 5-Minute Chapter Structure (Revised for PS 26126)
| Time | Chapter | Focus |
|---|---|---|
| 00:00–00:45 | **The Problem** | Outdoor UGVs fail in GPS-denied unstructured environments. Show 3 failure modes: no path detection, no localization, no collision avoidance |
| 00:45–02:00 | **Deliverable 1: Perception AI** | BiSeNetV2 live on RELLIS-3D. Show 4-class segmentation overlay (path/grass/mud/obstacle). Show changing light handling |
| 02:00–03:15 | **Deliverable 2: Visual SLAM/Odometry** | OpenVINS KLT tracking at 50Hz, MSCKF pose estimation. Show GPS-denied localization maintaining <1.2% drift over 500m |
| 03:15–04:15 | **Deliverable 3: Path Planner** | TEB planner navigating Point A → Point B. Show v-disparity ditch avoidance. Show the Webots sim with the full autonomous run |
| 04:15–05:00 | **Results & Demo** | Dashboard showing real-time telemetry, successful A→B navigation across 3 outdoor scenarios. Show mIoU 76.25%, 18.5ms latency |

> [!WARNING]
> Spend **ZERO seconds** in the video on: FIPS zeroization, MIL-STD shielding, SecOC CAN authentication, S-ROS 2 encryption, hull breach detection, AES-256, or LoC/LAC. These topics will confuse and distract the PS 26126 judges, who are evaluating a vision-based navigation solution.

---

## 📋 SECTION 10: THE MASTER PROJECT REPORT & TECHNICAL DOCS — CHANGES NEEDED

### MASTER_PROJECT_REPORT.md
- Section headers like "**The 4 Combat Failure Modes**" → Rename "**4 Navigation Failure Modes in GPS-Denied Outdoor Environments**"
- Remove entire Section B (Defence Security, Shielding & Cryptography) from the main body — move to an appendix as "Optional BEL Hardware Security Integration"
- Section 2 opening: "BEL designs robotic systems for the Indian Army, BSF, CRPF..." → Correct to: "BEL designs unmanned systems for disaster response, border surveillance, and industrial inspection"
- Replace "4 Battlefield Failure Modes" table with "4 Navigation Challenges in Outdoor Environments"
- Keep all algorithmic sections (BiSeNetV2, MSCKF, TEB, v-Disparity) — they are excellent

### RESEARCH_FEEDER_BEL_UGV.md
- "Threat Modeling" section → Rename "**Challenge Analysis: GPS-Denied Outdoor Navigation**"
- Remove the Electronic Warfare threat matrix
- Remove Krasukha-class jammers, Laser Warning Receivers references
- Keep the technical comparison table (RTK-GPS vs Visual Odometry, LiDAR vs Stereo) — it's a good competitive analysis, just remove the "Combat Failure Mode" framing

### TECHNICAL_ARCHITECTURE.md
- Change "Tactical" to "Outdoor" throughout
- Remove references to "MIL-SPEC hardened" sensors
- Keep all POSIX scheduling, CPU affinity, and latency budget content — highly relevant

---

## 📋 SECTION 11: COMPLETE PRIORITY ACTION LIST

> [!IMPORTANT]
> The edit window closes **October 5, 2026**. You can only submit the PPT. Prioritize the PPT above all else.

### 🔴 CRITICAL (Must Fix Before Oct 5 — These Are in the PPT)
- [ ] **Slide 1:** Remove "Ministry of Defence" from organization. Fix subtitle to remove "combat theater"
- [ ] **Slide 2:** Remove FIPS/SecOC bullet. Add bullet on multi-scenario outdoor A→B navigation
- [ ] **Slide 3:** Remove SecOC from latency chain. Rename "tactical" terrain table to "outdoor terrain"
- [ ] **Slide 4:** Replace MIL-STD shielding section with IP67 outdoor ruggedization
- [ ] **Slide 5:** Remove "Zeroization" KPI metric. Replace Impact Pillar 1 (Combat→Mission). Fix target audience
- [ ] **Slide 6:** Remove all MIL-STD/FIPS/AUTOSAR SecOC from standards section

### 🟠 HIGH PRIORITY (Before Grand Finale / Demo Day)
- [ ] **Video script:** Complete 5-chapter restructure as outlined in Section 9
- [ ] **Dashboard:** Rename 3 demo scenarios. Remove "ZEROIZE" button from UI. Change "BEL DEFENCE" to "BEL AUTONOMOUS" tag
- [ ] **Docs:** Update MASTER_PROJECT_REPORT.md to remove combat framing and security chapter from main body

### 🟡 MEDIUM PRIORITY (Before Grand Finale)
- [ ] **ROS 2 packages:** Update docstrings and comments to use "outdoor" instead of "tactical/battlefield"
- [ ] **Webots sim:** Add comment that GPS is a simulation stand-in for visual odometry
- [ ] **Webots controller:** Optionally disable T/S/R keyboard security demo in the demo video

### 🟢 LOW PRIORITY (Nice to Have)
- [ ] **Simulation scenarios:** Add a search-and-rescue terrain or agricultural field world
- [ ] **Dashboard:** Add a "GPS Signal Quality" indicator showing visual-only navigation mode
- [ ] **README.md:** Update to remove battlefield language and frame around the 3 PS challenges

---

## 📋 SECTION 12: WHAT TO SAY AT GRAND FINALE (Quick Pitch Fix)

**Current (Wrong):**
> *"...NETRA eliminates satellite GPS dependence and active LiDAR vulnerability entirely... combat-hardened autonomous brain built to defend our borders."*

**Correct version:**
> *"Outdoor Unmanned Ground Vehicles face a fundamental challenge: unstructured terrain, unreliable GPS, and unpredictable obstacles. NETRA-UGV solves this through three core modules: a lightweight Perception AI built on BiSeNetV2 trained on real off-road data that identifies traversable paths in real time; a GPS-free Visual Odometry system using OpenVINS that tracks position with less than 1.2% drift over 500 meters; and a kinodynamic path planner that routes the vehicle safely from Point A to Point B, avoiding obstacles including hidden drop-offs. Built for BEL's outdoor autonomous systems portfolio—search-and-rescue, agricultural automation, and unstructured terrain delivery."*

---

*Report generated: 2026-10-02 | Based on full repository audit of `/home/sunny/Desktop/projects/Netra-UGV/`*
