import React, { useRef, useEffect, useState } from 'react';
import { 
  Eye, 
  Flame, 
  Moon, 
  Wind,
  Cpu,
  Layers,
  Crosshair,
  Zap
} from 'lucide-react';
import type { UGVPose, FailsafeState, PerceptionObstacle } from '../../types/telemetry';
import { playTacticalBlip } from '../../utils/audio';

interface CameraHUDProps {
  pose: UGVPose;
  failsafe: FailsafeState;
  obstacles: PerceptionObstacle[];
  onTriggerAirPurge: () => void;
  isPip?: boolean;
  isSplit?: boolean;
}

type VisionMode = 'RGB' | 'AI_SEMANTIC' | 'THERMAL' | 'NVG';

export const CameraHUD: React.FC<CameraHUDProps> = ({
  pose,
  failsafe,
  obstacles,
  onTriggerAirPurge,
  isPip = false,
  isSplit = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visionMode, setVisionMode] = useState<VisionMode>('RGB');
  const [showStadia, setShowStadia] = useState<boolean>(true);
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null);

  // Preload authentic BiSeNetV2 segmentation overlay image
  useEffect(() => {
    const img = new Image();
    img.src = '/test_segmentation_overlay.png';
    img.onload = () => setOverlayImage(img);
  }, []);

  const switchVisionMode = (mode: VisionMode) => {
    setVisionMode(mode);
    playTacticalBlip(900);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const cx = width / 2;
      const cy = height / 2;
      const rollRad = (pose.roll * Math.PI) / 180;
      const pitchOffset = (pose.pitch / 25) * (height * 0.35);
      const horizonY = cy + pitchOffset;

      // Color scheme based on vision mode
      let skyGradientTop = '#0a101d';
      let skyGradientBottom = '#1e293b';
      let groundColor1 = '#1c1917';
      let groundColor2 = '#292524';
      let hudColor = '#10b981';

      if (visionMode === 'AI_SEMANTIC') {
        skyGradientTop = '#030712';
        skyGradientBottom = '#111827';
        groundColor1 = '#132e1b';
        groundColor2 = '#0d2013';
        hudColor = '#22c55e';
      } else if (visionMode === 'THERMAL') {
        skyGradientTop = '#11051b';
        skyGradientBottom = '#240838';
        groundColor1 = '#3b0764';
        groundColor2 = '#1e0533';
        hudColor = '#fbbf24';
      } else if (visionMode === 'NVG') {
        skyGradientTop = '#021807';
        skyGradientBottom = '#052e0f';
        groundColor1 = '#063a12';
        groundColor2 = '#021a07';
        hudColor = '#4ade80';
      }

      // 1. Sky & Atmospheric Perspective
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, skyGradientTop);
      skyGrad.addColorStop(1, skyGradientBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, Math.max(0, horizonY));

      // 2. Ground Terrain Perspective
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      groundGrad.addColorStop(0, groundColor1);
      groundGrad.addColorStop(1, groundColor2);
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, Math.max(0, horizonY), width, height - Math.max(0, horizonY));

      // If AI_SEMANTIC and image loaded, draw authentic segmentation overlay as ground background
      if (visionMode === 'AI_SEMANTIC' && overlayImage) {
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.drawImage(overlayImage, 0, horizonY, width, height - horizonY);
        ctx.restore();
      }

      // 3. Perspective Ground Grid & Elevation Contours
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, Math.max(0, horizonY), width, height - Math.max(0, horizonY));
      ctx.clip();

      ctx.strokeStyle = visionMode === 'AI_SEMANTIC' 
        ? 'rgba(34, 197, 94, 0.35)' 
        : visionMode === 'THERMAL' 
        ? 'rgba(251, 191, 36, 0.25)' 
        : 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;

      // Longitudinal perspective lines radiating from horizon vanishing point
      const numRays = 18;
      for (let i = -numRays; i <= numRays; i++) {
        const spread = i * (width / 14);
        ctx.beginPath();
        ctx.moveTo(cx + spread * 0.1, horizonY);
        ctx.lineTo(cx + spread * 2.8, height);
        ctx.stroke();
      }

      // Transverse distance bars (curving with pitch/roll)
      for (let dist = 1; dist <= 9; dist++) {
        const yProg = Math.pow(dist / 9, 2);
        const barY = horizonY + (height - horizonY) * yProg;
        ctx.beginPath();
        ctx.moveTo(0, barY);
        ctx.lineTo(width, barY);
        ctx.stroke();
      }
      ctx.restore();

      // NVG Phosphor Noise & Vignette
      if (visionMode === 'NVG') {
        const vig = ctx.createRadialGradient(cx, cy, Math.min(cx, cy) * 0.4, cx, cy, Math.max(cx, cy));
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(0.7, 'rgba(2, 26, 7, 0.35)');
        vig.addColorStop(1, 'rgba(0, 10, 2, 0.85)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, width, height);

        // Subtle phosphor scanlines
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.04)';
        for (let l = 0; l < height; l += 4) {
          ctx.beginPath();
          ctx.moveTo(0, l);
          ctx.lineTo(width, l);
          ctx.stroke();
        }
      }

      // 4. Traversable Driving Corridor (Kinodynamic TEB Path)
      ctx.save();
      const corridorGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      corridorGrad.addColorStop(0, 'rgba(16, 185, 129, 0.05)');
      corridorGrad.addColorStop(1, 'rgba(16, 185, 129, 0.25)');
      ctx.fillStyle = corridorGrad;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.lineWidth = 1.5;

      const steerAngleOffset = (pose.angularVelocity || 0) * 45;
      ctx.beginPath();
      ctx.moveTo(cx - 100, height);
      ctx.quadraticCurveTo(cx - 40 + steerAngleOffset, cy + 50, cx - 20 + steerAngleOffset * 0.5, horizonY + 10);
      ctx.lineTo(cx + 20 + steerAngleOffset * 0.5, horizonY + 10);
      ctx.quadraticCurveTo(cx + 40 + steerAngleOffset, cy + 50, cx + 100, height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 5. Artificial Horizon & Pitch Ladder
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-rollRad);

      ctx.strokeStyle = hudColor;
      ctx.lineWidth = 1.5;
      ctx.fillStyle = hudColor;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';

      // Pitch rungs: +/- 10, 20 deg
      for (let pDeg of [-20, -10, 10, 20]) {
        const rungY = - (pDeg - pose.pitch) * (height / 60);
        if (Math.abs(rungY) < cy * 0.85) {
          const rungW = pDeg % 20 === 0 ? 70 : 45;
          ctx.beginPath();
          ctx.moveTo(-rungW, rungY);
          ctx.lineTo(-15, rungY);
          ctx.moveTo(15, rungY);
          ctx.lineTo(rungW, rungY);
          ctx.stroke();

          // Notch ticks
          ctx.beginPath();
          ctx.moveTo(-rungW, rungY);
          ctx.lineTo(-rungW, rungY + (pDeg > 0 ? 5 : -5));
          ctx.moveTo(rungW, rungY);
          ctx.lineTo(rungW, rungY + (pDeg > 0 ? 5 : -5));
          ctx.stroke();

          ctx.fillText(`${Math.abs(pDeg)}°`, -rungW - 14, rungY + 3);
          ctx.fillText(`${Math.abs(pDeg)}°`, rungW + 14, rungY + 3);
        }
      }

      // Roll bank angle pointer
      const bankR = Math.min(cx, cy) * 0.72;
      ctx.beginPath();
      ctx.arc(0, 0, bankR, -Math.PI * 0.75, -Math.PI * 0.25);
      ctx.stroke();
      for (let bDeg of [-60, -45, -30, -15, 0, 15, 30, 45, 60]) {
        const rad = ((bDeg - 90) * Math.PI) / 180;
        const x1 = Math.cos(rad) * bankR;
        const y1 = Math.sin(rad) * bankR;
        const x2 = Math.cos(rad) * (bankR - (bDeg % 30 === 0 ? 10 : 5));
        const y2 = Math.sin(rad) * (bankR - (bDeg % 30 === 0 ? 10 : 5));
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // 6. Center Stadiametric Gunsight / Driver Crosshair
      if (showStadia) {
        ctx.save();
        ctx.strokeStyle = hudColor;
        ctx.lineWidth = 1.5;

        // Boresight reticle
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx - 30, cy);
        ctx.lineTo(cx - 20, cy);
        ctx.moveTo(cx + 20, cy);
        ctx.lineTo(cx + 30, cy);
        ctx.moveTo(cx, cy - 30);
        ctx.lineTo(cx, cy - 20);
        ctx.moveTo(cx, cy + 20);
        ctx.lineTo(cx, cy + 30);
        ctx.stroke();

        // Stadiametric mil-dots
        ctx.fillStyle = hudColor;
        ctx.fillRect(cx - 1, cy - 1, 2, 2);
        ctx.restore();
      }

      // 7. Top Compass Heading Tape
      const tapeY = 38;
      ctx.save();
      ctx.fillStyle = 'rgba(7, 10, 15, 0.75)';
      ctx.fillRect(cx - 160, tapeY - 14, 320, 32);
      ctx.strokeStyle = 'rgba(70, 90, 120, 0.4)';
      ctx.strokeRect(cx - 160, tapeY - 14, 320, 32);

      // Central lubber line (heading indicator)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(cx, tapeY - 14);
      ctx.lineTo(cx - 5, tapeY - 5);
      ctx.lineTo(cx + 5, tapeY - 5);
      ctx.closePath();
      ctx.fill();

      // Heading ticks
      const heading = pose.heading;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';

      for (let deg = -60; deg <= 60; deg += 10) {
        const markHeading = ((Math.round(heading) + deg + 360) % 360);
        const xPos = cx + (deg * 2.5);
        if (xPos >= cx - 150 && xPos <= cx + 150) {
          ctx.strokeStyle = hudColor;
          ctx.beginPath();
          ctx.moveTo(xPos, tapeY - 4);
          ctx.lineTo(xPos, tapeY + (deg % 30 === 0 ? 6 : 2));
          ctx.stroke();

          if (deg % 30 === 0) {
            let card = `${markHeading}°`;
            if (markHeading === 0 || markHeading === 360) card = 'N';
            if (markHeading === 45) card = 'NE';
            if (markHeading === 90) card = 'E';
            if (markHeading === 135) card = 'SE';
            if (markHeading === 180) card = 'S';
            if (markHeading === 225) card = 'SW';
            if (markHeading === 270) card = 'W';
            if (markHeading === 315) card = 'NW';
            ctx.fillStyle = hudColor;
            ctx.fillText(card, xPos, tapeY + 14);
          }
        }
      }
      ctx.restore();

      // 8. AI Target Detection Bounding Boxes (Tactical Brackets)
      const sortedObstacles = [...obstacles].sort((a, b) => a.distance - b.distance);
      sortedObstacles.slice(0, 3).forEach((obs, idx) => {
        const distRatio = Math.max(0.25, Math.min(1.0, 1.0 - obs.distance / 50));
        const boxW = Math.max(80, 130 * distRatio);
        const boxH = Math.max(60, 90 * distRatio);
        
        // Spread targets horizontally by index and relative coords
        const targetX = cx + (obs.y * 3.8) - boxW / 2 + (idx === 1 ? -60 : idx === 2 ? 60 : 0);
        const targetY = cy + 25 - (boxH / 2) - (obs.distance * 1.5);

        if (targetY > horizonY - 40 && targetY < height - 60) {
          ctx.save();
          const isLethal = obs.severity === 'CRITICAL' || obs.type === 'NEGATIVE_VOID' || obs.type === 'TRENCH';
          const bracketColor = isLethal ? '#ef4444' : obs.severity === 'MEDIUM' ? '#f59e0b' : '#06b6d4';

          ctx.strokeStyle = bracketColor;
          ctx.lineWidth = 2;

          // Corner brackets style
          const cornerLen = 14;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(targetX, targetY + cornerLen);
          ctx.lineTo(targetX, targetY);
          ctx.lineTo(targetX + cornerLen, targetY);
          ctx.stroke();

          // Top-right
          ctx.beginPath();
          ctx.moveTo(targetX + boxW - cornerLen, targetY);
          ctx.lineTo(targetX + boxW, targetY);
          ctx.lineTo(targetX + boxW, targetY + cornerLen);
          ctx.stroke();

          // Bottom-left
          ctx.beginPath();
          ctx.moveTo(targetX, targetY + boxH - cornerLen);
          ctx.lineTo(targetX, targetY + boxH);
          ctx.lineTo(targetX + cornerLen, targetY + boxH);
          ctx.stroke();

          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(targetX + boxW - cornerLen, targetY + boxH);
          ctx.lineTo(targetX + boxW, targetY + boxH);
          ctx.lineTo(targetX + boxW, targetY + boxH - cornerLen);
          ctx.stroke();

          // Header Tag
          ctx.fillStyle = isLethal ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.9)';
          ctx.fillRect(targetX, targetY - 18, boxW, 18);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`[${obs.type}] ${obs.distance.toFixed(1)}m`, targetX + 4, targetY - 5);

          // Sub-tag with confidence & action
          ctx.fillStyle = 'rgba(7, 10, 15, 0.85)';
          ctx.fillRect(targetX, targetY + boxH, boxW, 14);
          ctx.fillStyle = bracketColor;
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillText(`CONF: ${(obs.confidence * 100).toFixed(0)}% | BRG: ${(pose.heading + (obs.y * 2) + 360) % 360 | 0}°`, targetX + 4, targetY + boxH + 10);

          ctx.restore();
        }
      });

      // 9. Camera Lens Obscuration Filter (Mud / Dust Splatter)
      if (failsafe.cameraLensObscuration > 0.05) {
        const obscuration = failsafe.cameraLensObscuration;
        ctx.save();
        ctx.fillStyle = `rgba(90, 58, 28, ${Math.min(0.88, obscuration * 0.95)})`;
        ctx.fillRect(0, 0, width, height);

        // Procedural Mud blobs
        ctx.fillStyle = 'rgba(40, 24, 12, 0.8)';
        for (let i = 0; i < Math.floor(obscuration * 110); i++) {
          const sx = (Math.sin(i * 997 + 1.2) * 0.5 + 0.5) * width;
          const sy = (Math.cos(i * 443 + 0.8) * 0.5 + 0.5) * height;
          const sr = 4 + (i % 12);
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Lens degradation warning banner
        ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
        ctx.fillRect(cx - 180, cy - 70, 360, 34);
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 180, cy - 70, 360, 34);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`⚠️ LENS CONTAMINATION: ${(obscuration * 100).toFixed(0)}% (FAILSAFE L2 ARMED)`, cx, cy - 52);
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`OPTICAL PURGE REQUIRED — HIGH PRESSURE CO2 READY`, cx, cy - 40);
        ctx.restore();
      }

      // 10. Air-Purge Active Blast Animation (CO2 Cloud)
      if (failsafe.airPurgeFiring) {
        ctx.save();
        const blastGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, width * 0.7);
        blastGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        blastGrad.addColorStop(0.3, 'rgba(186, 230, 253, 0.8)');
        blastGrad.addColorStop(1, 'rgba(14, 165, 233, 0.2)');
        ctx.fillStyle = blastGrad;
        ctx.fillRect(0, 0, width, height);

        // Expanding blast rings
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        for (let r = 80; r < width * 0.6; r += 90) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('>> HIGH-PRESSURE CO2 AIR-PURGE NOZZLE ACTIVE <<', cx, cy - 10);
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('CLEANING LENS SURFACE — RESIDUAL DUST WIPED', cx, cy + 14);
        ctx.restore();
      }

      // 11. OSD Tactical Telemetry Overlays
      ctx.save();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'left';
      ctx.fillText(`SENSOR: LUXONIS OAK-D STEREO NOSE`, 12, height - 24);
      ctx.fillText(`RES: 1280x720 @ 30 FPS | HFOV: 73°`, 12, height - 12);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`BiSeNetV2 INT8: 2.6ms [RASPBERRY PI 5 + NPU]`, width - 12, height - 24);
      ctx.fillStyle = hudColor;
      ctx.fillText(`VIO ESTIMATE: 500 Hz OpenVINS EKF`, width - 12, height - 12);
      ctx.restore();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [pose, failsafe, obstacles, visionMode, showStadia, overlayImage]);

  return (
    <div className="relative w-full h-full flex flex-col bg-tactical-950 overflow-hidden select-none">
      {/* Top Vision Mode Toolbar (Hidden in PIP) */}
      {!isPip && (
      <div className={`absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 gap-2 ${isSplit ? "flex-wrap" : ""}`}>

        <div className="flex items-center gap-1.5 pointer-events-auto bg-tactical-900/90 backdrop-blur-md border border-tactical-700/80 p-1 rounded-lg shadow-xl">
          <button
            onClick={() => switchVisionMode('RGB')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-mono text-xs transition-all ${
              visionMode === 'RGB' ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>RGB OPTICAL</span>
          </button>

          <button
            onClick={() => switchVisionMode('AI_SEMANTIC')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-mono text-xs transition-all ${
              visionMode === 'AI_SEMANTIC' ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-900/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>AI SEMANTIC HUD</span>
          </button>

          <button
            onClick={() => switchVisionMode('THERMAL')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-mono text-xs transition-all ${
              visionMode === 'THERMAL' ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-900/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>FLIR THERMAL</span>
          </button>

          <button
            onClick={() => switchVisionMode('NVG')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-mono text-xs transition-all ${
              visionMode === 'NVG' ? 'bg-green-700 text-white font-bold shadow-md shadow-green-900/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>NVG IR</span>
          </button>

          <div className="h-4 w-px bg-tactical-700 mx-1" />

          <button
            onClick={() => setShowStadia(!showStadia)}
            className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
              showStadia ? 'bg-tactical-800 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Gunsight Crosshair"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Vision Status Badge */}
        <div className="flex items-center gap-3 pointer-events-auto bg-tactical-900/90 backdrop-blur-md border border-tactical-700/80 px-3 py-1.5 rounded-lg text-xs font-mono shadow-xl">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Cpu className="w-3.5 h-3.5" />
            <span className="text-slate-400">MODEL:</span>
            <span className="font-bold text-white">BiSeNetV2 INT8</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            <span>2.6 ms</span>
          </div>
        </div>
      </div>
      )}

      {/* Main Canvas Feed */}
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* AI Semantic Color Legend (shown when AI_SEMANTIC is active) */}
      {!isPip && visionMode === 'AI_SEMANTIC' && (
        <div className="absolute top-16 left-3 pointer-events-none z-10 bg-tactical-950/85 backdrop-blur-md border border-tactical-700/80 p-2.5 rounded-lg text-[11px] font-mono shadow-xl flex flex-col gap-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">BiSeNetV2 Sovereign Classes</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 shadow-sm" />
            <span className="text-slate-200">SOLID GROUND (1.5 m/s)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-lime-400 shadow-sm" />
            <span className="text-slate-200">PLIANT VEGETATION (≤ 0.5 m/s)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-amber-500 shadow-sm" />
            <span className="text-slate-200">MUD HAZARD (Slip Governor)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-red-500 shadow-sm" />
            <span className="text-slate-200">RIGID / VOID (Lethal Avoid)</span>
          </div>
        </div>
      )}

      {/* Bottom Camera Action Bar (Hidden in PIP) */}
      {!isPip && (
      <div className={`absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 gap-2 ${isSplit ? "flex-wrap" : ""}`}>

        <div className="flex items-center gap-3 pointer-events-auto bg-tactical-900/90 backdrop-blur-md border border-tactical-700/80 px-3 py-1.5 rounded-lg text-xs font-mono shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">PITCH:</span>
            <span className="text-cyan-300 font-semibold">{pose.pitch.toFixed(1)}°</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">ROLL:</span>
            <span className="text-cyan-300 font-semibold">{pose.roll.toFixed(1)}°</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">SPEED:</span>
            <span className="text-emerald-400 font-semibold">{pose.linearVelocity.toFixed(2)} m/s</span>
          </div>
        </div>

        {/* Air-Purge Nozzle Button */}
        <div className="pointer-events-auto">
          <button
            onClick={onTriggerAirPurge}
            disabled={failsafe.airPurgeFiring}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-bold transition-all shadow-xl ${
              failsafe.cameraLensObscuration > 0.25
                ? 'bg-red-600 hover:bg-red-500 text-white glow-danger animate-pulse'
                : 'bg-tactical-800 hover:bg-tactical-700 text-cyan-300 border border-tactical-600'
            }`}
          >
            <Wind className={`w-4 h-4 ${failsafe.airPurgeFiring ? 'animate-spin' : ''}`} />
            <span>{failsafe.airPurgeFiring ? 'FIRING CO2 AIR-PURGE...' : 'TRIGGER CO2 AIR-PURGE'}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${failsafe.cameraLensObscuration > 0.25 ? 'bg-red-950 text-red-200' : 'bg-tactical-950 text-slate-300'}`}>
              {(failsafe.cameraLensObscuration * 100).toFixed(0)}% OBSCURED
            </span>
          </button>
        </div>
      </div>
      )}
    </div>
  );
};
