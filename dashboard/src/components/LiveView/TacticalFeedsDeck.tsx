import React, { useRef, useEffect, useState } from 'react';
import { 
  Camera, 
  Radio, 
  Navigation, 
  ShieldCheck, 
  Wind, 
  ChevronUp, 
  ChevronDown, 
  Activity
} from 'lucide-react';
import type { UGVPose, Waypoint, FailsafeState, PerceptionObstacle } from '../../types/telemetry';
import { playTacticalBlip } from '../../utils/audio';

interface TacticalFeedsDeckProps {
  pose: UGVPose;
  waypoints: Waypoint[];
  obstacles: PerceptionObstacle[];
  failsafe: FailsafeState;
  onTriggerAirPurge: () => void;
}

export const TacticalFeedsDeck: React.FC<TacticalFeedsDeckProps> = ({
  pose,
  waypoints,
  obstacles,
  failsafe,
  onTriggerAirPurge,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const camCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active waypoint calculation
  const activeWp = waypoints.find(w => w.status === 'active') || waypoints.find(w => w.status === 'pending');
  const distToActive = activeWp ? Math.hypot(activeWp.x - pose.x, activeWp.y - pose.y).toFixed(1) : '0.0';
  const completedCount = waypoints.filter(w => w.status === 'reached').length;
  const progressPct = waypoints.length > 0 ? (completedCount / waypoints.length) * 100 : 0;

  // Radar Mini-Canvas Render Loop
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let sweepAngle = 0;

    const render = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(cx, cy) - 6;

      // Range rings (5m, 10m, 15m)
      [0.33, 0.66, 1.0].forEach((ratio, idx) => {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * ratio, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.font = '8px monospace';
        ctx.fillText(`${(idx + 1) * 5}m`, cx + maxR * ratio - 14, cy - 2);
      });

      // Axis Crosshairs
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.stroke();

      // Radar Sweep Cone & Beam
      sweepAngle = (sweepAngle + 0.05) % (Math.PI * 2);
      const sweepGrad = ctx.createConicGradient(sweepAngle, cx, cy);
      sweepGrad.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
      sweepGrad.addColorStop(0.12, 'rgba(6, 182, 212, 0.02)');
      sweepGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.fill();

      // Sweep Line
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
      ctx.stroke();

      // Plot Obstacle Blips
      obstacles.forEach(obs => {
        const dx = obs.x - pose.x;
        const dy = obs.y - pose.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= 15) {
          const angle = Math.atan2(dy, dx);
          const r = (dist / 15) * maxR;
          const ox = cx + Math.cos(angle) * r;
          const oy = cy - Math.sin(angle) * r; // invert Y for screen

          ctx.fillStyle = obs.type === 'NEGATIVE_VOID' ? '#ef4444' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Center UGV blip
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [pose, obstacles]);

  // Camera Mini-Canvas Render Loop
  useEffect(() => {
    const canvas = camCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      const cx = w / 2;
      const cy = h / 2;
      const horizonOffset = (pose.pitch / 20) * (h * 0.3);

      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, cy + horizonOffset);
      skyGrad.addColorStop(0, '#0a101d');
      skyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, Math.max(0, cy + horizonOffset));

      // Ground (Tactical AI Semantic Green tint)
      const groundGrad = ctx.createLinearGradient(0, cy + horizonOffset, 0, h);
      groundGrad.addColorStop(0, '#143823');
      groundGrad.addColorStop(1, '#091a10');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, Math.max(0, cy + horizonOffset), w, h);

      // Perspective Grid Lines
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * (w * 0.08), cy + horizonOffset);
        ctx.lineTo(cx + i * (w * 0.35), h);
        ctx.stroke();
      }

      // Crosshairs / Boresight
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy);
      ctx.lineTo(cx + 14, cy);
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx, cy + 10);
      ctx.stroke();

      // Nearest Obstacle Target Bracket
      const closest = [...obstacles].sort((a, b) => a.distance - b.distance)[0];
      if (closest && closest.distance < 12) {
        ctx.strokeStyle = closest.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b';
        ctx.lineWidth = 1.5;
        const boxW = Math.max(26, 48 - closest.distance * 2.5);
        const boxH = Math.max(18, 34 - closest.distance * 1.8);
        const bx = cx - boxW / 2;
        const by = cy + 10;
        ctx.strokeRect(bx, by, boxW, boxH);

        ctx.fillStyle = '#ffffff';
        ctx.font = '7px monospace';
        ctx.fillText(`${closest.type}: ${closest.distance}m`, bx - 2, by - 3);
      }

      // Air Purge blast effect if firing
      if (failsafe.airPurgeFiring) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(0, 0, w, h);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [pose, obstacles, failsafe]);

  return (
    <div className="w-full bg-tactical-900 border-t border-tactical-800 flex flex-col shrink-0 select-none z-20 transition-all duration-200">
      {/* Deck Header & Mode Switcher */}
      <div className="h-8 bg-tactical-950 px-3 flex items-center justify-between border-b border-tactical-800">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wider">
            Tactical Subsystem Streams & Mission Telemetry
          </span>
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[9px] font-mono text-emerald-400 font-semibold">
              ● STEREO EO/IR (30 FPS)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[9px] font-mono text-cyan-400 font-semibold">
              ● FMCW RADAR (15m)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-[9px] font-mono text-amber-400 font-semibold">
              ● VIO MSCKF (500Hz)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-[9px] font-mono text-purple-300 font-semibold">
              ● SecOC CAN-FD (#10420)
            </span>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <button
          onClick={() => { setIsExpanded(!isExpanded); playTacticalBlip(750); }}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-tactical-800 hover:bg-tactical-700 text-slate-400 hover:text-slate-200 text-xs font-mono border border-tactical-700 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronDown className="w-3 h-3" />
              <span>MINIMIZE FEEDS</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-3 h-3 text-cyan-400" />
              <span className="text-cyan-400 font-bold">EXPAND FEEDS DECK</span>
            </>
          )}
        </button>
      </div>

      {/* Expanded Multi-Feed Strip */}
      {isExpanded && (
        <div className="h-40 w-full p-2.5 grid grid-cols-1 md:grid-cols-4 gap-2.5 overflow-hidden bg-tactical-950/60 backdrop-blur-sm">
          {/* Card 1: Forward Camera Mini-Feed */}
          <div className="bg-tactical-900/90 rounded-lg border border-tactical-800 overflow-hidden flex flex-col relative group">
            <div className="h-6 bg-tactical-950 px-2 flex items-center justify-between border-b border-tactical-800 shrink-0">
              <div className="flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-mono font-bold text-slate-200">FORWARD EO/IR OPTICAL</span>
              </div>
              <button
                onClick={onTriggerAirPurge}
                className="px-1.5 py-0.5 rounded bg-cyan-900/50 hover:bg-cyan-800 text-[9px] font-mono text-cyan-300 border border-cyan-700/60 transition-colors flex items-center gap-1"
                title="Trigger CO2 Air-Purge"
              >
                <Wind className="w-2.5 h-2.5" />
                <span>PURGE</span>
              </button>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <canvas ref={camCanvasRef} className="w-full h-full" />
              <div className="absolute bottom-1 left-2 text-[9px] font-mono text-emerald-400/90 bg-tactical-950/70 px-1 rounded pointer-events-none">
                AI SEG: 2.6ms [JETSON ORIN]
              </div>
            </div>
          </div>

          {/* Card 2: 360° FMCW Radar & Void Scanner */}
          <div className="bg-tactical-900/90 rounded-lg border border-tactical-800 overflow-hidden flex flex-col relative">
            <div className="h-6 bg-tactical-950 px-2 flex items-center justify-between border-b border-tactical-800 shrink-0">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-cyan-400 animate-spin" />
                <span className="text-[10px] font-mono font-bold text-slate-200">POLAR RADAR / VOID RAYCASTER</span>
              </div>
              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/80 px-1 rounded border border-cyan-800">
                15m SWEEP
              </span>
            </div>
            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
              <canvas ref={radarCanvasRef} className="w-full h-full" />
              <div className="absolute bottom-1 right-2 text-[9px] font-mono text-cyan-300/90 bg-tactical-950/70 px-1 rounded pointer-events-none">
                OBSTACLES: {obstacles.filter(o => o.distance <= 15).length} IN RANGE
              </div>
            </div>
          </div>

          {/* Card 3: Autonomous Waypoint Sequence Tracker */}
          <div className="bg-tactical-900/90 rounded-lg border border-tactical-800 overflow-hidden flex flex-col p-2.5 justify-between">
            <div className="flex items-center justify-between border-b border-tactical-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Navigation className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-mono font-bold text-slate-200">AUTONOMOUS MISSION PROGRESS</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-amber-400">
                {completedCount}/{waypoints.length} WAYPOINTS
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>ACTIVE: <strong className="text-white">{activeWp ? activeWp.label : 'IDLE / HOLD'}</strong></span>
                <span>DIST: <strong className="text-cyan-300">{distToActive}m</strong></span>
              </div>
              <div className="w-full h-2 bg-tactical-950 rounded-full overflow-hidden border border-tactical-700">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Stepper nodes */}
            <div className="flex items-center justify-between gap-1 pt-1 overflow-x-auto">
              {waypoints.slice(0, 5).map((wp, idx) => (
                <div 
                  key={wp.id} 
                  className={`flex-1 flex flex-col items-center p-1 rounded border text-center font-mono ${
                    wp.status === 'reached' 
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300' 
                      : wp.status === 'active'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 animate-pulse'
                      : 'bg-tactical-950/60 border-tactical-800 text-slate-500'
                  }`}
                >
                  <span className="text-[9px] font-bold">WP-{idx + 1}</span>
                  <span className="text-[8px] truncate max-w-[50px]">{wp.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: 6-DOF VIO Horizon & Cyber Security Status */}
          <div className="bg-tactical-900/90 rounded-lg border border-tactical-800 overflow-hidden flex flex-col p-2.5 justify-between font-mono">
            <div className="flex items-center justify-between border-b border-tactical-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] font-bold text-slate-200">VIO 6-DOF & CAN-FD SecOC</span>
              </div>
              <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1 rounded border border-emerald-800">
                AUTHENTICATED
              </span>
            </div>

            {/* VIO Incline Gauges */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-tactical-950 p-1 rounded border border-tactical-800">
                <div className="text-[9px] text-slate-500">PITCH</div>
                <div className="text-xs font-bold text-cyan-300">{pose.pitch.toFixed(1)}°</div>
              </div>
              <div className="bg-tactical-950 p-1 rounded border border-tactical-800">
                <div className="text-[9px] text-slate-500">ROLL</div>
                <div className="text-xs font-bold text-amber-300">{pose.roll.toFixed(1)}°</div>
              </div>
              <div className="bg-tactical-950 p-1 rounded border border-tactical-800">
                <div className="text-[9px] text-slate-500">SPEED</div>
                <div className="text-xs font-bold text-emerald-300">{pose.linearVelocity.toFixed(2)} m/s</div>
              </div>
            </div>

            {/* SecOC Monotonic Packet Log */}
            <div className="bg-tactical-950 p-1.5 rounded border border-tactical-800 text-[9px] space-y-0.5 text-slate-400">
              <div className="flex justify-between">
                <span>CAN-FD CMAC:</span>
                <span className="text-purple-300 font-bold">0x8F3A2190</span>
              </div>
              <div className="flex justify-between">
                <span>ANTI-REPLAY MONOTONIC:</span>
                <span className="text-cyan-300 font-bold">#10420 PASS</span>
              </div>
              <div className="flex justify-between">
                <span>GPS SIGNAL STATUS:</span>
                <span className="text-amber-400 font-bold">DENIED (VIO ONLY)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
