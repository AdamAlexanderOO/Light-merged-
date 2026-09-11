import React from 'react';
import { X, RotateCcw, Sliders, Sun, Eye, Zap, Layers } from 'lucide-react';
import { OpticsConfig } from '../types';

export const DEFAULT_OPTICS_CONFIG: OpticsConfig = {
  lightFusionBoost: 1.5,
  coronaBloom: 1.6,
  rayleighScattering: 1.2,
  sunsetGlow: 1.2,
  oceanSpecular: 1.4,
  nightLights: 1.8,
  solarWindFlux: 380,
  tacticalGrid: 0.75,
  diffractionSpikes: true,
  plasmaLoops: true,
};

interface OpticsDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: OpticsConfig;
  onChange: (newConfig: OpticsConfig) => void;
  onReset: () => void;
}

export const OpticsDeckModal: React.FC<OpticsDeckModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
  onReset,
}) => {
  if (!isOpen) return null;

  const updateParam = <K extends keyof OpticsConfig>(key: K, value: OpticsConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#070b14] border border-cyan-500/40 rounded-xl shadow-[0_0_50px_rgba(0,242,254,0.15)] flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/30 bg-black/60">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-wider font-mono uppercase text-white flex items-center gap-2">
                <span>Light Fusion & Optics Deck</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  CALIBRATED
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Real-time shader exposure & canvas engine rendering coefficients
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders Body */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* Section 1: Solar & Coronal Optics */}
          <div className="space-y-3 bg-black/40 p-3.5 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Solar Corona & Light Fusion</span>
            </div>

            {/* Light Fusion Boost */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Light Fusion Dynamic Range</span>
                <span className="text-cyan-400 font-bold">{config.lightFusionBoost.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={config.lightFusionBoost}
                onChange={(e) => updateParam('lightFusionBoost', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Corona Bloom */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Corona Streamer Bloom</span>
                <span className="text-amber-400 font-bold">{config.coronaBloom.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={config.coronaBloom}
                onChange={(e) => updateParam('coronaBloom', parseFloat(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.diffractionSpikes}
                  onChange={(e) => updateParam('diffractionSpikes', e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Diffraction Spikes</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.plasmaLoops}
                  onChange={(e) => updateParam('plasmaLoops', e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>H-Alpha Flares</span>
              </label>
            </div>
          </div>

          {/* Section 2: Planetary Atmosphere & Surface */}
          <div className="space-y-3 bg-black/40 p-3.5 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Atmospheric Scattering & Planetary Shaders</span>
            </div>

            {/* Rayleigh Scattering */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Rayleigh Twilight Scattering</span>
                <span className="text-blue-400 font-bold">{config.rayleighScattering.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={config.rayleighScattering}
                onChange={(e) => updateParam('rayleighScattering', parseFloat(e.target.value))}
                className="w-full accent-blue-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Sunset Horizon Glow */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Terminator Sunset Horizon Glow</span>
                <span className="text-orange-400 font-bold">{config.sunsetGlow.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.5"
                step="0.05"
                value={config.sunsetGlow}
                onChange={(e) => updateParam('sunsetGlow', parseFloat(e.target.value))}
                className="w-full accent-orange-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Ocean Specular */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Ocean Specular Sun Glint</span>
                <span className="text-cyan-300 font-bold">{config.oceanSpecular.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.5"
                step="0.05"
                value={config.oceanSpecular}
                onChange={(e) => updateParam('oceanSpecular', parseFloat(e.target.value))}
                className="w-full accent-cyan-300 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Night City Lights */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Night Urban Light Intensity</span>
                <span className="text-yellow-300 font-bold">{config.nightLights.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={config.nightLights}
                onChange={(e) => updateParam('nightLights', parseFloat(e.target.value))}
                className="w-full accent-yellow-300 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Section 3: Space Weather & Tactical */}
          <div className="space-y-3 bg-black/40 p-3.5 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Space Weather & HUD Vector Grid</span>
            </div>

            {/* Solar Wind Flux */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Solar Wind Flux Velocity</span>
                <span className="text-emerald-400 font-bold">{Math.round(config.solarWindFlux)} km/s</span>
              </div>
              <input
                type="range"
                min="150"
                max="800"
                step="10"
                value={config.solarWindFlux}
                onChange={(e) => updateParam('solarWindFlux', parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Tactical Grid Intensity */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Tactical HUD Reticle Opacity</span>
                <span className="text-cyan-400 font-bold">{(config.tacticalGrid * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={config.tacticalGrid}
                onChange={(e) => updateParam('tacticalGrid', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-cyan-500/20 bg-black/60">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Optics</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded transition-colors shadow-[0_0_15px_rgba(0,242,254,0.3)]"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
