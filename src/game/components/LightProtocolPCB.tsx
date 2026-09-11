import React, { useRef, useEffect, useState } from 'react';
import { soundEffects } from '../utils/soundEffects';
import { Cpu, Zap, Activity, RotateCcw, Power } from 'lucide-react';

interface GateNode {
  id: string;
  name: string;
  x: number;
  y: number;
  active: boolean;
  type: 'gate' | 'emitter' | 'collector' | 'diode';
}

export const LightProtocolPCB: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pulseSpeed, setPulseSpeed] = useState<number>(1.5);
  const [activeFrequency, setActiveFrequency] = useState<number>(440);

  const [nodes, setNodes] = useState<GateNode[]>([
    { id: 'clk-0', name: 'OPTICAL CLK 100MHz', x: 80, y: 120, active: true, type: 'emitter' },
    { id: 'gate-1', name: 'NAND PHOTON GATE', x: 240, y: 120, active: true, type: 'gate' },
    { id: 'gate-2', name: 'SYNAPTIC DIODE ARRAY', x: 420, y: 120, active: true, type: 'diode' },
    { id: 'out-0', name: 'MOSAIC FORGE BUS', x: 580, y: 120, active: true, type: 'collector' },

    { id: 'clk-1', name: 'SUBPIXEL BIAS +5V', x: 80, y: 260, active: true, type: 'emitter' },
    { id: 'gate-3', name: 'TRANSISTOR LATCH', x: 240, y: 260, active: false, type: 'gate' },
    { id: 'gate-4', name: 'SCHOTTKY ISOLATOR', x: 420, y: 260, active: true, type: 'diode' },
    { id: 'out-1', name: 'RGB PHOSPHOR ARRAY', x: 580, y: 260, active: true, type: 'collector' },

    { id: 'clk-2', name: 'TACTICAL RADAR SYNC', x: 80, y: 400, active: true, type: 'emitter' },
    { id: 'gate-5', name: 'H-ALPHA FREQ FILTER', x: 240, y: 400, active: true, type: 'gate' },
    { id: 'gate-6', name: 'QUANTUM OP-AMP', x: 420, y: 400, active: false, type: 'gate' },
    { id: 'out-2', name: 'SOLAR CORONA ENGINE', x: 580, y: 400, active: true, type: 'collector' },
  ]);

  // Toggle Node
  const toggleNode = (id: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const next = !n.active;
          if (next) soundEffects.playPixelChime(660);
          else soundEffects.playStoneClick();
          return { ...n, active: next };
        }
        return n;
      })
    );
  };

  // Canvas animated photon traces loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let reqId: number;
    let time = 0;

    const render = () => {
      time += 0.03 * pulseSpeed;
      const w = (canvas.width = 680);
      const h = (canvas.height = 520);

      // Dark PCB Substrate (Matte Green/Dark Charcoal)
      ctx.fillStyle = '#060c0b';
      ctx.fillRect(0, 0, w, h);

      // Grid vias & grounding pads
      ctx.fillStyle = '#0f201d';
      for (let x = 20; x < w; x += 40) {
        for (let y = 20; y < h; y += 40) {
          ctx.fillRect(x, y, 2, 2);
        }
      }

      // Copper Traces connecting nodes horizontally
      const rows = [
        ['clk-0', 'gate-1', 'gate-2', 'out-0'],
        ['clk-1', 'gate-3', 'gate-4', 'out-1'],
        ['clk-2', 'gate-5', 'gate-6', 'out-2'],
      ];

      rows.forEach((row) => {
        for (let i = 0; i < row.length - 1; i++) {
          const n1 = nodes.find((n) => n.id === row[i]);
          const n2 = nodes.find((n) => n.id === row[i + 1]);
          if (!n1 || !n2) continue;

          const isPowered = n1.active && n2.active;

          // Inactive copper trace
          ctx.strokeStyle = isPowered ? '#0d9488' : '#134e4a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();

          // Animated Photonic Pulses traveling along active traces
          if (isPowered) {
            const dist = n2.x - n1.x;
            const pulsePos = (time * 60) % dist;
            const px = n1.x + pulsePos;
            const py = n1.y;

            // Pulse glowing light packet
            const pGrad = ctx.createRadialGradient(px, py, 1, px, py, 8);
            pGrad.addColorStop(0, '#5eead4');
            pGrad.addColorStop(0.5, '#14b8a6');
            pGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.arc(px, py, 8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Render Nodes
      nodes.forEach((n) => {
        // Outer housing ring
        ctx.strokeStyle = n.active ? '#14b8a6' : '#374151';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 16, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing core
        ctx.fillStyle = n.active ? '#2dd4bf' : '#1f2937';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
        ctx.fill();
      });

      reqId = requestAnimationFrame(render);
    };

    reqId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(reqId);
  }, [nodes, pulseSpeed]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-6 bg-[#050811] text-slate-100 font-sans select-none overflow-y-auto no-scrollbar">
      <div className="w-full max-w-4xl bg-[#09101d] border border-teal-500/30 rounded-xl p-4 sm:p-5 shadow-[0_0_40px_rgba(20,184,166,0.15)] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-sm sm:text-base font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
                <span>Light Protocol PCB • Transistor Matrix</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  PHOTON BUS
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Click logic gates to toggle photonic current & subpixel bus routing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-teal-400 font-bold hidden sm:inline">CLK SPEED: {pulseSpeed.toFixed(1)}x</span>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={pulseSpeed}
              onChange={(e) => setPulseSpeed(parseFloat(e.target.value))}
              className="w-24 accent-teal-400 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Interactive PCB Canvas */}
        <div className="relative w-full flex items-center justify-center bg-black/80 rounded-lg border border-teal-500/20 p-2 overflow-x-auto no-scrollbar">
          <canvas ref={canvasRef} className="max-w-full h-auto rounded" />
        </div>

        {/* Node Toggle Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
          {nodes.map((n) => (
            <button
              key={n.id}
              onClick={() => toggleNode(n.id)}
              className={`p-2 rounded-lg text-left border transition-all flex items-center justify-between ${
                n.active
                  ? 'bg-teal-950/40 border-teal-400 text-teal-200'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <div className="min-w-0 pr-1">
                <div className="text-[11px] font-bold font-mono truncate">{n.name}</div>
                <div className="text-[9px] text-slate-400 uppercase">{n.type}</div>
              </div>
              <Power className={`w-3.5 h-3.5 shrink-0 ${n.active ? 'text-teal-400' : 'text-slate-600'}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
