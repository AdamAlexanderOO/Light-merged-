import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TelemetryReadout, OpticsConfig } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Sparkles } from 'lucide-react';
import { DEFAULT_OPTICS_CONFIG } from './OpticsDeckModal';

interface SkyViewCanvasEngineProps {
  telemetry: TelemetryReadout;
  opticsConfig?: OpticsConfig;
  stationName: string;
}

export const SkyViewCanvasEngine: React.FC<SkyViewCanvasEngineProps> = ({
  telemetry,
  opticsConfig = DEFAULT_OPTICS_CONFIG,
  stationName,
}) => {
  const activeOptics = opticsConfig || DEFAULT_OPTICS_CONFIG;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const { obscurationPercentage, currentPhase, sunAltitudeDegrees } = telemetry;
  const isTotality = currentPhase === 'TOTALITY!';
  const isDiamondRing = currentPhase === 'Diamond Ring!';
  const isSunset = sunAltitudeDegrees <= 0;
  const obscurationRatio = Math.min(100, Math.max(0, obscurationPercentage)) / 100;
  const isEgress = currentPhase === 'Partial (Egress)' || (telemetry.timeToNextPhase?.includes('Eclipse ends') ?? false);

  const handleZoom = (factor: number) => {
    setZoomLevel((prev) => Math.max(0.75, Math.min(6.0, prev * factor)));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  // Continuous Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.02;

      // Handle High-DPI canvas sizing
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const w = rect.width;
      const h = rect.height;

      // 1. DYNAMIC ATMOSPHERIC SKY BACKGROUND
      let topColor = '#0f172a';
      let bottomColor = '#1e293b';

      if (isSunset) {
        topColor = '#09050d';
        bottomColor = '#3b1218';
      } else if (isTotality) {
        topColor = '#030509';
        bottomColor = '#0a101d';
      } else if (obscurationRatio > 0.85) {
        const factor = (obscurationRatio - 0.85) / 0.15;
        const r1 = Math.round(14 - factor * 10);
        const g1 = Math.round(24 - factor * 18);
        const b1 = Math.round(48 - factor * 35);
        const r2 = Math.round(24 - factor * 18);
        const g2 = Math.round(38 - factor * 30);
        const b2 = Math.round(72 - factor * 55);
        topColor = `rgb(${r1}, ${g1}, ${b1})`;
        bottomColor = `rgb(${r2}, ${g2}, ${b2})`;
      } else {
        const factor = obscurationRatio / 0.85;
        const r1 = Math.round(28 - factor * 14);
        const g1 = Math.round(65 - factor * 41);
        const b1 = Math.round(135 - factor * 87);
        const r2 = Math.round(70 - factor * 46);
        const g2 = Math.round(130 - factor * 92);
        const b2 = Math.round(210 - factor * 138);
        topColor = `rgb(${r1}, ${g1}, ${b1})`;
        bottomColor = `rgb(${r2}, ${g2}, ${b2})`;
      }

      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, topColor);
      skyGrad.addColorStop(1, bottomColor);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle sky grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 2. STARS & PLANETS (Deep twilight / Totality view)
      if (isTotality || obscurationRatio > 0.88) {
        const starAlpha = Math.min(1.0, (obscurationRatio - 0.88) / 0.12);
        ctx.save();
        ctx.globalAlpha = starAlpha;

        // Venus (Brilliant Evening Star at magnitude -4.0, ~20 degrees east)
        const venusX = w * 0.76 + panOffset.x * 0.3;
        const venusY = h * 0.32 + panOffset.y * 0.3;
        const venusGrad = ctx.createRadialGradient(venusX, venusY, 1, venusX, venusY, 8);
        venusGrad.addColorStop(0, '#ffffff');
        venusGrad.addColorStop(0.3, 'rgba(165, 243, 252, 0.9)');
        venusGrad.addColorStop(1, 'rgba(165, 243, 252, 0)');
        ctx.fillStyle = venusGrad;
        ctx.beginPath();
        ctx.arc(venusX, venusY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#a5f3fc';
        ctx.fillText('VENUS (mag -4.0)', venusX + 9, venusY + 3);

        // Mercury (Magnitude +0.5, ~10 degrees west)
        const mercX = w * 0.24 + panOffset.x * 0.3;
        const mercY = h * 0.28 + panOffset.y * 0.3;
        const mercGrad = ctx.createRadialGradient(mercX, mercY, 1, mercX, mercY, 6);
        mercGrad.addColorStop(0, '#ffffff');
        mercGrad.addColorStop(0.4, 'rgba(254, 215, 170, 0.8)');
        mercGrad.addColorStop(1, 'rgba(254, 215, 170, 0)');
        ctx.fillStyle = mercGrad;
        ctx.beginPath();
        ctx.arc(mercX, mercY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fed7aa';
        ctx.fillText('MERCURY (mag +0.5)', mercX + 7, mercY + 3);

        // Background Stars
        const fixedStars = [
          { x: 0.15, y: 0.18, r: 1.2, color: '#ffffff' },
          { x: 0.35, y: 0.15, r: 1.0, color: '#e0f2fe' },
          { x: 0.82, y: 0.22, r: 1.4, color: '#fef08a' },
          { x: 0.65, y: 0.18, r: 1.1, color: '#ffffff' },
          { x: 0.18, y: 0.65, r: 1.3, color: '#fbcfe8' },
          { x: 0.88, y: 0.60, r: 1.0, color: '#ffffff' },
        ];
        fixedStars.forEach((star) => {
          const sx = w * star.x + panOffset.x * 0.2;
          const sy = h * star.y + panOffset.y * 0.2;
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(sx, sy, star.r, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      }

      // 3. SUN & MOON CELESTIAL STAGE
      const centerX = w / 2 + panOffset.x;
      const centerY = h / 2 + panOffset.y;
      const baseSunRadius = Math.min(w, h) * 0.22 * zoomLevel;

      // Base trajectory angle for August 2026 (~65° in horizon frame)
      const trajectoryAngleRad = 1.13;
      const activeAngle = isEgress ? trajectoryAngleRad + Math.PI : trajectoryAngleRad;
      const moonShiftDistance = isTotality ? 0 : (1.0 - obscurationRatio) * (baseSunRadius * 2.1);
      const moonCenterX = centerX + Math.cos(activeAngle) * moonShiftDistance;
      const moonCenterY = centerY + Math.sin(activeAngle) * moonShiftDistance;

      // A. SOLAR CORONA & LIGHT FUSION STREAMERS (Totality & Near-Totality)
      if (isTotality || obscurationRatio > 0.94) {
        ctx.save();
        const coronaIntensity = activeOptics.lightFusionBoost * activeOptics.coronaBloom;
        const streamerCount = 32;

        // Dynamic Coronal Rays
        for (let i = 0; i < streamerCount; i++) {
          const angle = (i / streamerCount) * Math.PI * 2 + time * 0.05;
          const noise = Math.sin(angle * 4 + time) * 0.2 + Math.cos(angle * 7 - time * 1.2) * 0.15;
          const rayLength = baseSunRadius * (1.8 + noise * 0.8) * coronaIntensity;

          const endX = centerX + Math.cos(angle) * rayLength;
          const endY = centerY + Math.sin(angle) * rayLength;

          const rayGrad = ctx.createLinearGradient(centerX, centerY, endX, endY);
          rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          rayGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.65)');
          rayGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.25)');
          rayGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, rayLength, angle - 0.08, angle + 0.08);
          ctx.closePath();
          ctx.fill();
        }

        // Coronal Core Soft Bloom Halo
        const haloGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          baseSunRadius * 0.9,
          centerX,
          centerY,
          baseSunRadius * 2.4 * coronaIntensity
        );
        haloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        haloGrad.addColorStop(0.2, 'rgba(253, 230, 138, 0.7)');
        haloGrad.addColorStop(0.5, 'rgba(125, 211, 252, 0.3)');
        haloGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseSunRadius * 2.5 * coronaIntensity, 0, Math.PI * 2);
        ctx.fill();

        // B. CHROMOSPHERE RED PROMINENCES (Hydrogen-Alpha 656nm Ruby Flare Jets)
        if (activeOptics.plasmaLoops) {
          const prominenceAngles = [0.4, 1.8, 3.2, 4.7, 5.8];
          prominenceAngles.forEach((pAngle, idx) => {
            const pX = centerX + Math.cos(pAngle) * (baseSunRadius * 1.01);
            const pY = centerY + Math.sin(pAngle) * (baseSunRadius * 1.01);
            const pHeight = baseSunRadius * (0.08 + Math.sin(time * 2 + idx) * 0.03);

            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(pX, pY, pHeight, pAngle - 0.15, pAngle + 0.15);
            ctx.fill();
            ctx.shadowBlur = 0;
          });
        }

        ctx.restore();
      }

      // B. SUN DISK (When not in 100% totality)
      if (!isTotality) {
        ctx.save();
        // Solar Limb Darkening Gradient
        const sunGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          baseSunRadius * 0.1,
          centerX,
          centerY,
          baseSunRadius
        );
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.65, '#fef08a');
        sunGrad.addColorStop(0.9, '#f59e0b');
        sunGrad.addColorStop(1, '#b45309'); // Limb darkening edge

        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseSunRadius, 0, Math.PI * 2);
        ctx.fill();

        // Solar Outer Atmospheric Bloom
        const sunBloom = ctx.createRadialGradient(
          centerX,
          centerY,
          baseSunRadius,
          centerX,
          centerY,
          baseSunRadius * 1.8 * activeOptics.lightFusionBoost
        );
        sunBloom.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
        sunBloom.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
        sunBloom.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = sunBloom;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseSunRadius * 1.8 * activeOptics.lightFusionBoost, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // C. MOON SILHOUETTE DISK
      ctx.save();
      const moonRadius = baseSunRadius * 1.03; // Moon appears slightly larger than Sun during this eclipse!
      ctx.fillStyle = '#06080d';
      ctx.beginPath();
      ctx.arc(moonCenterX, moonCenterY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Delicate lunar limb edge
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = isTotality ? 'rgba(56, 189, 248, 0.4)' : 'rgba(0, 0, 0, 0.8)';
      ctx.stroke();
      ctx.restore();

      // D. DIAMOND RING & BAILY'S BEADS DIFFRACTION FLARE
      if (isDiamondRing || (obscurationRatio > 0.985 && obscurationRatio < 0.999)) {
        ctx.save();
        // Location of the bursting sunlight bead
        const beadAngle = activeAngle + Math.PI;
        const beadX = centerX + Math.cos(beadAngle) * baseSunRadius;
        const beadY = centerY + Math.sin(beadAngle) * baseSunRadius;

        // Diamond Flash Core
        const diamondGrad = ctx.createRadialGradient(beadX, beadY, 2, beadX, beadY, 40 * zoomLevel);
        diamondGrad.addColorStop(0, '#ffffff');
        diamondGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.95)');
        diamondGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.6)');
        diamondGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = diamondGrad;
        ctx.beginPath();
        ctx.arc(beadX, beadY, 40 * zoomLevel, 0, Math.PI * 2);
        ctx.fill();

        // 8-Point Diffraction Spikes
        if (activeOptics.diffractionSpikes) {
          const spikeLen = 80 * zoomLevel * activeOptics.lightFusionBoost;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 2;

          for (let s = 0; s < 4; s++) {
            const sAngle = (s * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(beadX - Math.cos(sAngle) * spikeLen, beadY - Math.sin(sAngle) * spikeLen);
            ctx.lineTo(beadX + Math.cos(sAngle) * spikeLen, beadY + Math.sin(sAngle) * spikeLen);
            ctx.stroke();
          }

          // Anamorphic horizontal flare line
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(beadX - spikeLen * 1.8, beadY);
          ctx.lineTo(beadX + spikeLen * 1.8, beadY);
          ctx.stroke();
        }

        ctx.restore();
      }

      // 4. COMBAT DECK RETICLES & TELEMETRY HUD
      ctx.save();
      // Center targeting crosshairs
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.lineWidth = 1;
      const crossSize = 16;
      ctx.beginPath();
      ctx.moveTo(centerX - crossSize, centerY);
      ctx.lineTo(centerX + crossSize, centerY);
      ctx.moveTo(centerX, centerY - crossSize);
      ctx.lineTo(centerX, centerY + crossSize);
      ctx.stroke();

      // HUD Coordinate Rings
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseSunRadius * 1.3, 0, Math.PI * 2);
      ctx.stroke();

      // Top corner telemetry
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = 'rgba(0, 242, 254, 0.85)';
      ctx.fillText(`FIELD OF VIEW: ${(2.5 / zoomLevel).toFixed(1)}°`, 14, 20);
      ctx.fillText(`ZOOM: ${zoomLevel.toFixed(1)}x`, 14, 34);

      // Bottom corner telemetry
      ctx.fillStyle = isTotality ? '#38bdf8' : isDiamondRing ? '#f59e0b' : '#94a3b8';
      ctx.fillText(`PHASE: ${currentPhase.toUpperCase()}`, 14, h - 14);

      ctx.restore();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    isTotality,
    isDiamondRing,
    isSunset,
    obscurationRatio,
    isEgress,
    zoomLevel,
    panOffset,
    opticsConfig,
    currentPhase,
  ]);

  return (
    <div className="relative w-full h-full min-h-[220px] bg-black select-none overflow-hidden group">
      {/* 2D Canvas Engine Viewport */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Floating Tactical Canvas Controls */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded border border-white/20 z-10 font-mono text-xs">
        <button
          onClick={() => handleZoom(1.3)}
          className="p-1 text-slate-300 hover:text-cyan-300 hover:bg-white/10 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom(0.77)}
          className="p-1 text-slate-300 hover:text-cyan-300 hover:bg-white/10 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleReset}
          className="p-1 text-slate-300 hover:text-cyan-300 hover:bg-white/10 rounded transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Optical Engine Status Badge */}
      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded border border-cyan-500/30 text-[10px] font-mono text-cyan-400 flex items-center gap-1 pointer-events-none">
        <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
        <span>CANVAS ENGINE: 60 FPS</span>
      </div>
    </div>
  );
};
