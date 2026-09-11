import React, { useState } from 'react';
import { ActiveStudioView } from './types';
import { RomanMosaicMatrixEngine } from './components/RomanMosaicMatrixEngine';
import { HologramGearEngine } from './components/HologramGearEngine';
import { PixelArcade64x64 } from './components/games/PixelArcade64x64';
import { SpaceDogfightSim3D } from './components/games/SpaceDogfightSim3D';
import { LightProtocolPCB } from './components/LightProtocolPCB';
import { soundEffects } from './utils/soundEffects';
import {
  Sparkles,
  Gamepad2,
  Cpu,
  Layers,
  Crosshair,
  Volume2,
  VolumeX,
  Compass,
} from 'lucide-react';

interface HubAppProps {
  onBackToEclipse?: () => void;
}

export const HubApp: React.FC<HubAppProps> = ({ onBackToEclipse }) => {
  const [activeView, setActiveView] = useState<ActiveStudioView>('mosaic-forge');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const navItems: { id: ActiveStudioView; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'mosaic-forge',
      label: 'MOSAIC FORGE',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
      color: 'text-amber-300 border-amber-500/50',
    },
    {
      id: 'character-rigs',
      label: 'HOLOGRAM RIGS',
      icon: <Layers className="w-3.5 h-3.5 text-cyan-400" />,
      color: 'text-cyan-300 border-cyan-500/50',
    },
    {
      id: 'pixel-arcade',
      label: 'PIXEL ARCADE 64×64',
      icon: <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'text-emerald-300 border-emerald-500/50',
    },
    {
      id: 'space-dogfight',
      label: '3D DOGFIGHT SIM',
      icon: <Crosshair className="w-3.5 h-3.5 text-rose-400" />,
      color: 'text-rose-300 border-rose-500/50',
    },
    {
      id: 'light-pcb',
      label: 'LIGHT PROTOCOL PCB',
      icon: <Cpu className="w-3.5 h-3.5 text-teal-400" />,
      color: 'text-teal-300 border-teal-500/50',
    },
  ];

  const handleSelectView = (view: ActiveStudioView) => {
    setActiveView(view);
    soundEffects.playPixelChime(750);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEffects.setMuted(next);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050811] text-slate-100 overflow-hidden font-sans">
      {/* Studio Navigation Header */}
      <nav className="flex items-center justify-between px-3 sm:px-6 py-2.5 border-b border-white/10 bg-[#060a14] shrink-0 gap-2 flex-wrap sm:flex-nowrap">
        {/* Left Title / Branding */}
        <div className="flex items-center gap-3">
          {onBackToEclipse && (
            <button
              onClick={onBackToEclipse}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 transition-all mr-1"
              title="Return to 3D Solar Eclipse Mission Deck"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>ECLIPSE DECK</span>
            </button>
          )}

          <div className="text-xs sm:text-sm font-bold font-mono text-white flex items-center gap-2">
            <span className="text-amber-400">PIXEL ENGINE</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-300 text-xs hidden sm:inline">MOSAIC FORGE STUDIO</span>
          </div>
        </div>

        {/* Center Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-cyan-500/20 text-white border-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                    : 'bg-white/5 text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded border transition-all ${
              isMuted
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
            }`}
            title={isMuted ? 'Unmute Web Audio' : 'Mute Web Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Active Studio Screen */}
      <div className="flex-1 relative min-h-0 w-full overflow-hidden">
        {activeView === 'mosaic-forge' && <RomanMosaicMatrixEngine />}
        {activeView === 'character-rigs' && <HologramGearEngine />}
        {activeView === 'pixel-arcade' && <PixelArcade64x64 />}
        {activeView === 'space-dogfight' && <SpaceDogfightSim3D />}
        {activeView === 'light-pcb' && <LightProtocolPCB />}
      </div>
    </div>
  );
};
