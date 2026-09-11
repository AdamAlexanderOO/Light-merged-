import React from 'react';
import { ObservationStation, TelemetryReadout, OpticsConfig } from '../types';
import { SkyViewCanvasEngine } from './SkyViewCanvasEngine';

interface SkyViewPanelProps {
  selectedStation: ObservationStation | null;
  telemetry: TelemetryReadout;
  currentTimestamp?: number;
  opticsConfig?: OpticsConfig;
}

export const SkyViewPanel: React.FC<SkyViewPanelProps> = ({
  selectedStation,
  telemetry,
  opticsConfig,
}) => {
  if (!selectedStation) return null;

  const { obscurationPercentage, currentPhase, sunAltitudeDegrees } = telemetry;
  const isTotality = currentPhase === 'TOTALITY!';
  const isDiamondRing = currentPhase === 'Diamond Ring!';
  const isSunset = sunAltitudeDegrees <= 0;

  return (
    <div 
      className="w-full md:w-88 lg:w-96 xl:w-[410px] bg-[#050505]/95 backdrop-blur-2xl border border-cyan-500/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.9)] flex flex-col shrink-0 font-sans select-none"
      style={{
        clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))'
      }}
    >
      {/* Combat Deck Tactical Header */}
      <div className="flex items-center justify-between px-4 py-2.5 lg:px-5 lg:py-3 border-b border-cyan-500/20 bg-black/80 font-mono">
        <div className="flex items-center gap-2">
          <span 
            className={`w-2.5 h-2.5 rounded-xs ${
              isTotality ? 'bg-cyan-400 animate-ping' : isDiamondRing ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400 animate-pulse'
            } shadow-[0_0_8px_#00f2fe]`} 
            title="Optical Sky Sensor" 
          />
          <span className="text-xs lg:text-[12px] tracking-[0.2em] uppercase text-cyan-300 font-bold">
            GROUND SKY SENSOR // HIGH RES
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
          <span className="text-slate-400 text-[10px]">ALT</span>
          <span className={`font-bold ${isSunset ? 'text-rose-400' : 'text-white'}`}>
            {sunAltitudeDegrees.toFixed(1)}°
          </span>
        </div>
      </div>

      {/* Central Celestial Stage powered by 2D Canvas Engine */}
      <div className="relative w-full h-52 sm:h-60 lg:h-68 bg-black">
        <SkyViewCanvasEngine
          telemetry={telemetry}
          opticsConfig={opticsConfig}
          stationName={selectedStation.name}
        />

        {/* Horizon Warning Indicator */}
        {isSunset && (
          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/90 border border-rose-500/50 backdrop-blur-md z-20 pointer-events-none">
            <span className="text-[10px] font-mono tracking-widest uppercase text-rose-400 font-bold">
              HORIZON OCCLUSION • {sunAltitudeDegrees.toFixed(1)}°
            </span>
          </div>
        )}
      </div>

      {/* Combat Deck Tactical Telemetry Bar */}
      <div className="px-4 py-2.5 lg:px-5 lg:py-3 bg-black/90 border-t border-cyan-500/20 flex flex-col gap-2 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 tracking-wider uppercase text-[11px] font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Target Phase</span>
          </span>
          <span className={`font-bold tracking-wider uppercase text-[11px] ${
            isTotality ? 'text-cyan-300 animate-pulse font-extrabold' : isDiamondRing ? 'text-amber-300 font-extrabold' : 'text-white'
          }`}>
            {currentPhase}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 tracking-wider uppercase text-[11px] font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Solar Obscuration</span>
          </span>
          <span className="text-amber-400 font-bold tracking-wider">
            {obscurationPercentage.toFixed(1)}%
          </span>
        </div>

        {/* Tactical Obscuration Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5 rounded-xs overflow-hidden border border-white/10 mt-0.5">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-amber-500 transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            style={{ width: `${obscurationPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
