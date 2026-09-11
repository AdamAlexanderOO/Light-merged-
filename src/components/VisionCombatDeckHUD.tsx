import React from 'react';
import { VisionMode, CombatDeckTelemetry } from '../types';
import {
  Eye,
  Crosshair,
  Flame,
  Radio,
  Sliders,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Activity,
  Compass,
  Wind
} from 'lucide-react';

interface VisionCombatDeckHUDProps {
  visionMode: VisionMode;
  onSelectVisionMode: (mode: VisionMode) => void;
  telemetry: CombatDeckTelemetry;
  onOpenOpticsModal: () => void;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
  isCombatDeckOpen: boolean;
  onToggleCombatDeck: () => void;
}

export const VisionCombatDeckHUD: React.FC<VisionCombatDeckHUDProps> = ({
  visionMode,
  onSelectVisionMode,
  telemetry,
  onOpenOpticsModal,
  isAudioMuted,
  onToggleAudioMute,
  isCombatDeckOpen,
  onToggleCombatDeck,
}) => {
  const visionModes: { id: VisionMode; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'optical', label: 'OPTICAL', icon: <Eye className="w-3.5 h-3.5" />, color: 'text-slate-300 border-slate-500/50' },
    { id: 'light-fusion', label: 'LIGHT FUSION', icon: <Flame className="w-3.5 h-3.5 text-amber-400" />, color: 'text-amber-300 border-amber-500/60' },
    { id: 'infrared', label: 'INFRARED / FLIR', icon: <Radio className="w-3.5 h-3.5 text-rose-400" />, color: 'text-rose-300 border-rose-500/60' },
    { id: 'sdo-uv', label: 'SDO UV 171Å', icon: <Activity className="w-3.5 h-3.5 text-yellow-400" />, color: 'text-yellow-300 border-yellow-500/60' },
    { id: 'tactical', label: 'TACTICAL GRID', icon: <Crosshair className="w-3.5 h-3.5 text-cyan-400" />, color: 'text-cyan-300 border-cyan-500/60' },
  ];

  return (
    <div className="absolute top-14 left-0 right-0 z-20 pointer-events-none px-2 sm:px-4 flex flex-col items-center select-none">
      {/* Tactical Center HUD Bar */}
      <div className="pointer-events-auto bg-[#070b14]/90 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-[0_4px_25px_rgba(0,0,0,0.7)] flex flex-col max-w-4xl w-full transition-all">
        {/* Top Control Bar: Modes + Telemetry + Toggles */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-white/10 gap-2 flex-wrap sm:flex-nowrap">
          {/* Vision Modes Switcher */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider mr-1 hidden sm:inline">
              SPECTRUM:
            </span>
            {visionModes.map((mode) => {
              const isActive = visionMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => onSelectVisionMode(mode.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-all whitespace-nowrap border ${
                    isActive
                      ? `bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.3)]`
                      : 'bg-white/5 text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/10'
                  }`}
                  title={`Switch to ${mode.label} Multi-Spectral Mode`}
                >
                  {mode.icon}
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Tools: Optics Sliders + Audio Synth + Collapse */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <button
              onClick={onOpenOpticsModal}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/60 hover:text-white transition-all shadow-sm"
              title="Open Light Fusion & Canvas Optics Deck"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">OPTICS DECK</span>
            </button>

            <button
              onClick={onToggleAudioMute}
              className={`p-1.5 rounded border transition-all ${
                isAudioMuted
                  ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
              }`}
              title={isAudioMuted ? 'Unmute Astronomical Synthesizer' : 'Mute Tactical Audio'}
            >
              {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onToggleCombatDeck}
              className="p-1.5 rounded bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all"
              title={isCombatDeckOpen ? 'Minimize Combat Telemetry' : 'Expand Combat Telemetry'}
            >
              {isCombatDeckOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Tactical Sub-Telemetry Strip (Collapsible) */}
        {isCombatDeckOpen && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 py-2 text-xs font-mono bg-black/40">
            {/* Shadow Velocity */}
            <div className="flex items-center gap-2 border-r border-white/10 pr-2">
              <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 leading-tight">UMBRA GROUND SPEED</div>
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span>{telemetry.umbraSpeedKmh.toLocaleString()} km/h</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Mach {telemetry.machNumber.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Solar Wind */}
            <div className="flex items-center gap-2 border-r border-white/10 pr-2">
              <Wind className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 leading-tight">SOLAR WIND FLUX</div>
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>{telemetry.solarWindSpeedKmS} km/s</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {telemetry.solarFluxSfu} sfu
                  </span>
                </div>
              </div>
            </div>

            {/* Planetary Kp */}
            <div className="flex items-center gap-2 border-r border-white/10 pr-2">
              <Activity className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 leading-tight">GEOMAGNETIC KP</div>
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>Kp {telemetry.geomagneticKp.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 font-normal">Quiet/Normal</span>
                </div>
              </div>
            </div>

            {/* Intercept Status */}
            <div className="flex items-center gap-2 pl-1">
              <Crosshair className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 leading-tight">INTERCEPT STATUS</div>
                <div className="font-bold flex items-center gap-1.5">
                  <span className={`text-[11px] font-bold ${
                    telemetry.interceptStatus === 'LOCK'
                      ? 'text-red-400 animate-pulse'
                      : telemetry.interceptStatus === 'APPROACH'
                      ? 'text-amber-300'
                      : 'text-cyan-300'
                  }`}>
                    [{telemetry.interceptStatus}]
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal">GEO-TARGET</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
