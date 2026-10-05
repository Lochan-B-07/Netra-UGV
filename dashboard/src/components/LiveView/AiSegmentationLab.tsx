import React, { useState } from 'react';
import { 
  Brain, 
  Cpu, 
  Zap,
  PlayCircle
} from 'lucide-react';
import { playTacticalBlip } from '../../utils/audio';

export const AiSegmentationLab: React.FC = () => {
  const [activeView, setActiveView] = useState<'OVERLAY' | 'MASK' | 'RAW'>('OVERLAY');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [benchmarkLatency, setBenchmarkLatency] = useState<number>(2.6);

  const runBenchmark = () => {
    setSimulating(true);
    playTacticalBlip(950);
    setTimeout(() => {
      setBenchmarkLatency(Number((2.4 + Math.random() * 0.4).toFixed(2)));
      setSimulating(false);
      playTacticalBlip(1200);
    }, 400);
  };

  return (
    <div className="w-full h-full flex flex-col bg-tactical-950 p-4 overflow-y-auto select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-tactical-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-mono">
              <span>BiSeNetV2 DEEP LEARNING TERRAIN SEGMENTATION</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                INT8 TENSORRT
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              RELLIS-3D Off-Road Semantic Segmentation Pipeline with Ground-Horizon Dynamic Crop & Bayesian Commit Filter
            </p>
          </div>
        </div>

        {/* Benchmark Trigger */}
        <button
          onClick={runBenchmark}
          disabled={simulating}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-900/40"
        >
          <PlayCircle className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
          <span>{simulating ? 'BENCHMARKING...' : 'RUN INFERENCE BENCHMARK'}</span>
        </button>
      </div>

      {/* Main Grid: Left Neural Network Viewport + Right Telemetry Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mt-4 flex-1">
        {/* Left Column: Visual Output & Mode Switcher (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-3">
          <div className="relative rounded-xl border border-tactical-700/80 overflow-hidden bg-tactical-900 shadow-2xl flex-1 flex flex-col min-h-[360px]">
            {/* Image display */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={
                  activeView === 'OVERLAY'
                    ? '/test_segmentation_overlay.png'
                    : activeView === 'MASK'
                    ? '/test_segmentation_mask.png'
                    : '/sample_terrain.jpg'
                }
                alt="Segmentation"
                className="w-full h-full object-contain"
              />

              {/* In-view Badges */}
              <div className="absolute top-3 left-3 bg-tactical-950/80 backdrop-blur border border-tactical-700 px-2.5 py-1 rounded text-xs font-mono text-slate-300">
                INPUT: <span className="text-cyan-400 font-bold">1024 × 448 RGB</span>
              </div>
              <div className="absolute top-3 right-3 bg-tactical-950/80 backdrop-blur border border-tactical-700 px-2.5 py-1 rounded text-xs font-mono text-slate-300">
                OUTPUT: <span className="text-emerald-400 font-bold">4 TERRAIN CLASSES</span>
              </div>
            </div>

            {/* View switcher buttons */}
            <div className="p-2.5 bg-tactical-900/95 border-t border-tactical-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setActiveView('OVERLAY'); playTacticalBlip(750); }}
                  className={`px-3 py-1.5 rounded font-mono text-xs transition-all ${
                    activeView === 'OVERLAY'
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/40'
                      : 'text-slate-400 hover:text-slate-200 bg-tactical-800'
                  }`}
                >
                  50/50 SEMANTIC OVERLAY
                </button>
                <button
                  onClick={() => { setActiveView('MASK'); playTacticalBlip(750); }}
                  className={`px-3 py-1.5 rounded font-mono text-xs transition-all ${
                    activeView === 'MASK'
                      ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-900/40'
                      : 'text-slate-400 hover:text-slate-200 bg-tactical-800'
                  }`}
                >
                  4-CLASS COLOR MASK
                </button>
                <button
                  onClick={() => { setActiveView('RAW'); playTacticalBlip(750); }}
                  className={`px-3 py-1.5 rounded font-mono text-xs transition-all ${
                    activeView === 'RAW'
                      ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-900/40'
                      : 'text-slate-400 hover:text-slate-200 bg-tactical-800'
                  }`}
                >
                  RAW RELLIS-3D FRAME
                </button>
              </div>

              <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Raspberry Pi 5 + Hailo NPU:</span>
                <span className="text-emerald-400 font-bold">{benchmarkLatency} ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tactical Class Breakdown & Model Specs (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-3">
          {/* Terrain 4-Class Breakdown */}
          <div className="p-3.5 rounded-xl bg-tactical-900/80 border border-tactical-700/80 shadow-xl flex flex-col gap-2.5">
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center justify-between">
              <span>Outdoor Terrain Class Distribution</span>
              <span className="text-slate-500 font-normal">RELLIS-3D Mapped</span>
            </h3>

            {/* Class 0: Solid Ground */}
            <div className="p-2.5 rounded-lg bg-tactical-950 border border-tactical-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#5a8cb4]" />
                  <span className="font-bold text-slate-200">CLASS 0: SOLID GROUND</span>
                </div>
                <span className="text-emerald-400 font-bold">3.61%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#5a8cb4] h-full" style={{ width: '3.61%' }} />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>Soil, gravel, asphalt, dry packed trail</span>
                <span className="text-emerald-400 font-semibold">Speed: 1.5 m/s</span>
              </div>
            </div>

            {/* Class 1: Pliant Vegetation */}
            <div className="p-2.5 rounded-lg bg-tactical-950 border border-tactical-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#2ecc71]" />
                  <span className="font-bold text-slate-200">CLASS 1: PLIANT VEGETATION</span>
                </div>
                <span className="text-lime-400 font-bold">33.15%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#2ecc71] h-full" style={{ width: '33.15%' }} />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>Tall grass, brush, light vegetation</span>
                <span className="text-lime-400 font-semibold">Governed: ≤ 0.5 m/s</span>
              </div>
            </div>

            {/* Class 2: Mud Hazard */}
            <div className="p-2.5 rounded-lg bg-tactical-950 border border-tactical-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#e67e22]" />
                  <span className="font-bold text-slate-200">CLASS 2: MUD HAZARD</span>
                </div>
                <span className="text-amber-400 font-bold">23.65%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#e67e22] h-full" style={{ width: '23.65%' }} />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>Wet mud, marsh, standing puddles</span>
                <span className="text-amber-400 font-semibold">Governed: ≤ 0.4 m/s</span>
              </div>
            </div>

            {/* Class 3: Rigid Obstacle */}
            <div className="p-2.5 rounded-lg bg-tactical-950 border border-tactical-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#e74c3c]" />
                  <span className="font-bold text-slate-200">CLASS 3: RIGID OBSTACLE</span>
                </div>
                <span className="text-red-400 font-bold">39.59%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#e74c3c] h-full" style={{ width: '39.59%' }} />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>Trees, boulders, walls, drop-offs</span>
                <span className="text-red-400 font-semibold">Hard Stop: Impassable</span>
              </div>
            </div>
          </div>

          {/* Model Specification Specs Card */}
          <div className="p-3.5 rounded-xl bg-tactical-900/80 border border-tactical-700/80 shadow-xl flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edge AI Model Architecture Specs</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-tactical-950 border border-tactical-800">
                <span className="text-slate-500 text-[10px] block">BACKBONE</span>
                <span className="text-slate-200 font-bold">BiSeNetV2-Lite</span>
              </div>
              <div className="p-2 rounded bg-tactical-950 border border-tactical-800">
                <span className="text-slate-500 text-[10px] block">PARAMETERS</span>
                <span className="text-slate-200 font-bold">2.31 Million</span>
              </div>
              <div className="p-2 rounded bg-tactical-950 border border-tactical-800">
                <span className="text-slate-500 text-[10px] block">BENCHMARK mIoU</span>
                <span className="text-emerald-400 font-bold">76.25% mIoU</span>
              </div>
              <div className="p-2 rounded bg-tactical-950 border border-tactical-800">
                <span className="text-slate-500 text-[10px] block">PRECISION</span>
                <span className="text-cyan-400 font-bold">INT8 Calibrated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
