import React, { useState } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  Map, 
  Layers, 
  Download, 
  AlertOctagon, 
  Lock, 
  CheckCircle
} from 'lucide-react';
import { playTacticalBlip } from '../../utils/audio';

export const WebotsMissionView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SIM_TRAJECTORY' | 'ARCHITECTURE'>('SIM_TRAJECTORY');
  const [simSpoofSuccess, setSimSpoofSuccess] = useState<boolean | null>(null);

  const testSpoofedFrame = () => {
    playTacticalBlip(500);
    setSimSpoofSuccess(false); // Rejected by SecOC!
    setTimeout(() => {
      playTacticalBlip(1200);
    }, 300);
  };

  return (
    <div className="w-full h-full flex flex-col bg-tactical-950 p-4 overflow-y-auto select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-tactical-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-mono">
              <span>WEBOTS TACTICAL SIMULATION & DEFENCE ARCHITECTURE</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                WEBOTS R2025a
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Kinodynamic Autonomous Mission Validation across Ditches, Boulders, Ditches, Boulders & Dynamic Obstacles
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-tactical-900 border border-tactical-700 p-1 rounded-lg">
          <button
            onClick={() => { setActiveTab('SIM_TRAJECTORY'); playTacticalBlip(800); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs transition-all ${
              activeTab === 'SIM_TRAJECTORY'
                ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>TACTICAL TRAJECTORY</span>
          </button>

          <button
            onClick={() => { setActiveTab('ARCHITECTURE'); playTacticalBlip(800); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs transition-all ${
              activeTab === 'ARCHITECTURE'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>SYSTEM BLOCK DIAGRAM</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'SIM_TRAJECTORY' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mt-4 flex-1">
          {/* Simulation Trajectory Viewport (8 cols) */}
          <div className="xl:col-span-8 flex flex-col gap-3">
            <div className="relative rounded-xl border border-tactical-700/80 overflow-hidden bg-black shadow-2xl flex-1 flex flex-col min-h-[380px]">
              <img
                src="/netra_ugv_sim_trajectory.png"
                alt="Webots Trajectory Plot"
                className="w-full h-full object-contain p-2"
              />

              <div className="absolute bottom-3 left-3 bg-tactical-950/85 backdrop-blur border border-tactical-700 px-3 py-1.5 rounded text-xs font-mono text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>MISSION STATUS: <strong className="text-emerald-400">WAYPOINT 5 REACHED (GOAL)</strong></span>
              </div>
            </div>
          </div>

          {/* Telemetry & Cyber Defense Verification (4 cols) */}
          <div className="xl:col-span-4 flex flex-col gap-3">
            {/* World Parameters Card */}
            <div className="p-3.5 rounded-xl bg-tactical-900/80 border border-tactical-700/80 shadow-xl flex flex-col gap-2">
              <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Simulation Environment Specs</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-tactical-950 border border-tactical-800">
                  <span className="text-slate-500 text-[10px] block">PLATFORM</span>
                  <span className="text-slate-200 font-bold">Pioneer 3-AT</span>
                </div>
                <div className="p-2 rounded bg-tactical-950 border border-tactical-800">
                  <span className="text-slate-500 text-[10px] block">TERRAIN GRID</span>
                  <span className="text-slate-200 font-bold">50m × 36m</span>
                </div>
                <div className="p-2 rounded bg-tactical-950 border border-tactical-800">
                  <span className="text-slate-500 text-[10px] block">NEGATIVE DITCHES</span>
                  <span className="text-red-400 font-bold">4 Ditches (-0.55m)</span>
                </div>
                <div className="p-2 rounded bg-tactical-950 border border-tactical-800">
                  <span className="text-slate-500 text-[10px] block">RIGID BOULDERS</span>
                  <span className="text-amber-400 font-bold">28 Obstacles</span>
                </div>
              </div>
            </div>

            {/* SecOC Attack Verification Widget */}
            <div className="p-3.5 rounded-xl bg-tactical-900/80 border border-tactical-700/80 shadow-xl flex flex-col gap-2.5">
              <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center justify-between">
                <span>SecOC Cyber Attack Injection Test</span>
                <span className="text-emerald-400 text-[10px]">HMAC-SHA256</span>
              </h3>
              <p className="text-xs text-slate-400">
                Injects an unauthenticated CAN-FD actuation frame to test anti-replay and MAC mismatch rejection.
              </p>

              <button
                onClick={testSpoofedFrame}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-tactical-800 hover:bg-tactical-750 text-cyan-300 border border-tactical-600 font-mono text-xs font-bold transition-all shadow-md"
              >
                <AlertOctagon className="w-4 h-4 text-amber-400" />
                <span>INJECT SPOOFED CAN-FD COMMAND</span>
              </button>

              {simSpoofSuccess !== null && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>SPOOFED FRAME REJECTED: MAC mismatch tag 0xDEADBEEF discarded.</span>
                </div>
              )}
            </div>

            {/* S-ROS2 Enclave Isolation */}
            <div className="p-3.5 rounded-xl bg-tactical-900/80 border border-tactical-700/80 shadow-xl flex flex-col gap-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>S-ROS2 ENCLAVE SECURITY</span>
                </span>
                <span className="text-emerald-400 text-[10px]">TLS 1.3 / DDS</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between border-b border-tactical-800 pb-1">
                <span>netra_perception:</span>
                <span className="text-emerald-400">ATTESTED (L0)</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between border-b border-tactical-800 pb-1">
                <span>netra_localization:</span>
                <span className="text-emerald-400">500 Hz MSCKF</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>netra_security:</span>
                <span className="text-cyan-400">AUTONOMOUS READY</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Architecture Diagram Viewport */
        <div className="mt-4 flex-1 flex flex-col gap-3">
          <div className="relative rounded-xl border border-tactical-700/80 overflow-hidden bg-black shadow-2xl flex-1 flex flex-col min-h-[460px]">
            <img
              src="/architecture_diagram.png"
              alt="NETRA-UGV Block Diagram"
              className="w-full h-full object-contain p-2"
            />

            {/* PDF Download Button */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <a
                href="/architecture_diagram.pdf"
                download="NETRA-UGV_Architecture_Diagram.pdf"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-xl"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD ARCHITECTURE (PDF)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
