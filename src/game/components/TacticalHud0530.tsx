import React, { useState, useEffect, useRef } from 'react';
import { soundEffects } from '../utils/soundEffects';
import {
  Activity,
  Radio,
  Crosshair,
  Shield,
  Zap,
  Eye,
  Sliders,
  Maximize2,
  RefreshCw,
  Terminal,
  Target,
  Orbit,
  Sparkles,
  Layers,
  Compass,
  Wifi,
  Cloud,
} from 'lucide-react';

interface TacticalHudProps {
  onSwitchToMosaic?: () => void;
  onSwitchToCockpitSim?: () => void;
  onSwitchToPcb?: () => void;
}

type CentralHoloMode = 'cloud-matrix' | 'wireframe-ship' | 'orbital-globe' | 'roman-mosaic';

export const TacticalHud0530: React.FC<TacticalHudProps> = ({
  onSwitchToMosaic,
  onSwitchToCockpitSim,
  onSwitchToPcb,
}) => {
  // Central holographic mode (Default is 'cloud-matrix' as in IMG_0530)
  const [holoMode, setHoloMode] = useState<CentralHoloMode>('cloud-matrix');
  const [cockpitCanopy, setCockpitCanopy] = useState<boolean>(false);
  const [targetLocked, setTargetLocked] = useState<boolean>(true);
  const [activeSector, setActiveSector] = useState<number>(36);
  const [radarZoom, setRadarZoom] = useState<number>(1);
  const [systemAlert, setSystemAlert] = useState<string>('TELEMETRY NOMINAL');

  // Interactive Sector Power Levels
  const [powerLevels, setPowerLevels] = useState<{ [key: number]: number }>({
    36: 78,
    78: 82,
    70: 70,
    3: 24,
  });

  // Animated Telemetry Values (simulating live fluctuating metrics)
  const [metrics, setMetrics] = useState({
    aam: 27,
    acs: 89,
    qta: 91,
    azimuth: 182.4,
    elevation: 34.2,
    freq: 1420.405,
    flux: 98.4,
  });

  // Canvas Refs for high-performance 60fps HUD graphics
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const holoCenterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarFanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const circularRadarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const gyroDialsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spectrumCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Periodic Telemetry fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        aam: Math.min(99, Math.max(15, prev.aam + (Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
        acs: Math.min(99, Math.max(80, prev.acs + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
        qta: Math.min(99, Math.max(85, prev.qta + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
        azimuth: parseFloat((prev.azimuth + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        elevation: parseFloat((prev.elevation + (Math.random() * 0.2 - 0.1)).toFixed(1)),
        flux: parseFloat((95 + Math.random() * 4).toFixed(1)),
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // 1. TOP-LEFT WAVEFORM OSCILLOSCOPE (As in top-left of IMG_0530)
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      phase += 0.04;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid background
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw multi-layered glowing sine/frequency waves
      // Main smooth harmonic wave
      ctx.beginPath();
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 8;

      for (let x = 0; x < w; x++) {
        const normX = x / w;
        // Composite wave: fundamental + harmonic + modulation
        const y =
          h / 2 +
          Math.sin(normX * 12 + phase) * 14 * Math.sin(normX * Math.PI) +
          Math.cos(normX * 24 - phase * 1.5) * 5 * Math.sin(normX * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Second harmonic sub-wave
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      for (let x = 0; x < w; x += 2) {
        const normX = x / w;
        const y =
          h / 2 +
          Math.sin(normX * 8 - phase * 0.8) * 8 * Math.sin(normX * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // 2. TOP-RIGHT EQUALIZER / SPECTRUM HISTOGRAM (As in top-right of IMG_0530)
  useEffect(() => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    const barCount = 36;

    const render = () => {
      time += 0.05;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barWidth = (w - (barCount - 1) * 2) / barCount;

      for (let i = 0; i < barCount; i++) {
        const norm = i / barCount;
        // Pseudo-random dynamic bar heights with organic rhythm
        const wave = Math.sin(time * 2 + norm * 8) * 0.3 + 0.5;
        const noise = Math.sin(time * 5 + i * 13) * 0.2;
        const barHeight = Math.max(4, Math.min(h - 4, (wave + noise) * h));

        const x = i * (barWidth + 2);
        const y = h - barHeight;

        // Gradient for bar: cyan into electric blue
        const grad = ctx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(1, '#0284c7');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Peak dot
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(x, Math.max(0, y - 2), barWidth, 1.5);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // 3. CENTERPIECE TACTICAL HOLOGRAM CHAMBER (Concentric HUD rings + Cloud / Wireframe)
  useEffect(() => {
    const canvas = holoCenterCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotationAngle = 0;

    // Particle field for cloud hologram
    const particles: { x: number; y: number; vx: number; vy: number; char: string; alpha: number }[] = [];
    const chars = '0123456789ABCDEFΣΩΨλπΔ';
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 160,
        y: (Math.random() - 0.5) * 110,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        char: chars[Math.floor(Math.random() * chars.length)],
        alpha: 0.3 + Math.random() * 0.7,
      });
    }

    const render = () => {
      rotationAngle += 0.008;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      // --- LAYER A: CONCENTRIC SCI-FI HUD RINGS (As in IMG_0530) ---
      const baseRadius = Math.min(w, h) * 0.42;

      // 1. Outer Ring with Ticks & Segmented Arcs
      ctx.save();
      ctx.translate(cx, cy);

      // Smooth outer dashed ring
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Rotating Segmented Caliper Ring
      ctx.save();
      ctx.rotate(rotationAngle);
      const segments = 24;
      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const tickLength = i % 4 === 0 ? 8 : 4;
        const r1 = baseRadius - 2;
        const r2 = r1 - tickLength;

        ctx.beginPath();
        ctx.moveTo(Math.cos(theta) * r1, Math.sin(theta) * r1);
        ctx.lineTo(Math.cos(theta) * r2, Math.sin(theta) * r2);
        ctx.strokeStyle = i % 4 === 0 ? '#00f2fe' : 'rgba(0, 229, 255, 0.4)';
        ctx.lineWidth = i % 4 === 0 ? 2 : 1;
        ctx.stroke();
      }

      // Three major rotating arc wedges
      for (let a = 0; a < 3; a++) {
        const arcStart = a * ((Math.PI * 2) / 3) + 0.2;
        const arcEnd = arcStart + 0.6;
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius + 7, arcStart, arcEnd);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      // 3. Counter-rotating inner degree ring
      ctx.save();
      ctx.rotate(-rotationAngle * 0.7);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 0.75, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Quadrant brackets
      for (let q = 0; q < 4; q++) {
        const angle = q * (Math.PI / 2);
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * 0.75, angle - 0.2, angle + 0.2);
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();

      // --- LAYER B: CENTRAL HOLOGRAPHIC PROJECTION ---
      if (holoMode === 'cloud-matrix') {
        // --- 1. CLOUD MATRIX ICON (Faithful recreation from IMG_0530) ---
        // A glowing digital cloud containing matrix runes & shimmering light
        ctx.save();
        const cloudW = baseRadius * 0.9;
        const cloudH = baseRadius * 0.55;

        // Subtle pulsing glow
        const pulse = 1 + Math.sin(rotationAngle * 4) * 0.04;
        ctx.scale(pulse, pulse);

        // Ambient cyan backlight behind cloud
        const cloudGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, cloudW * 0.8);
        cloudGlow.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
        cloudGlow.addColorStop(0.7, 'rgba(0, 150, 220, 0.08)');
        cloudGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = cloudGlow;
        ctx.beginPath();
        ctx.arc(0, 0, cloudW * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Path of Cloud shape:
        ctx.beginPath();
        // Custom cloud contour using arcs
        ctx.arc(-cloudW * 0.25, 0, cloudH * 0.45, Math.PI * 0.7, Math.PI * 1.7);
        ctx.arc(0, -cloudH * 0.35, cloudH * 0.55, Math.PI * 1.1, Math.PI * 1.9);
        ctx.arc(cloudW * 0.25, -cloudH * 0.1, cloudH * 0.48, Math.PI * 1.5, Math.PI * 0.3);
        ctx.arc(cloudW * 0.15, cloudH * 0.35, cloudH * 0.38, 0, Math.PI * 0.6);
        ctx.arc(-cloudW * 0.15, cloudH * 0.4, cloudH * 0.4, Math.PI * 0.4, Math.PI);
        ctx.closePath();

        // Cloud boundary styling
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Inner translucent wash
        ctx.fillStyle = 'rgba(6, 30, 54, 0.65)';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Render digital matrix particles flowing inside the cloud
        ctx.clip(); // Restrict code rain to inside the cloud shape

        ctx.font = '9px "JetBrains Mono", monospace';
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -cloudW * 0.5) p.x = cloudW * 0.5;
          if (p.x > cloudW * 0.5) p.x = -cloudW * 0.5;
          if (p.y < -cloudH * 0.5) p.y = cloudH * 0.5;
          if (p.y > cloudH * 0.5) p.y = -cloudH * 0.5;

          ctx.fillStyle = `rgba(0, 242, 254, ${p.alpha})`;
          ctx.fillText(p.char, p.x, p.y);
        });

        // Vertical scan raster lines inside cloud
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
        ctx.lineWidth = 1;
        const scanY = (rotationAngle * 60) % cloudH - cloudH / 2;
        ctx.beginPath();
        ctx.moveTo(-cloudW, scanY);
        ctx.lineTo(cloudW, scanY);
        ctx.stroke();

        ctx.restore();
      } else if (holoMode === 'wireframe-ship') {
        // --- 2. 3D ROTATING WIREFRAME STARSHIP ---
        ctx.save();
        const shipScale = baseRadius * 0.55;
        const angleY = rotationAngle * 2;
        const angleX = 0.4;

        // 3D vertices of a tactical stealth starfighter
        const vertices = [
          [0, -1.2, 0], // Nose
          [-0.8, 0.5, 0.3], // Left wingtip
          [0.8, 0.5, 0.3], // Right wingtip
          [0, 0.7, -0.4], // Dorsal cockpit fin
          [-0.3, 0.9, 0.1], // Left engine
          [0.3, 0.9, 0.1], // Right engine
          [0, 0.2, 0.5], // Ventral belly
        ];

        // Wireframe edges
        const edges = [
          [0, 1],
          [0, 2],
          [1, 4],
          [2, 5],
          [4, 5],
          [0, 3],
          [3, 4],
          [3, 5],
          [0, 6],
          [6, 1],
          [6, 2],
        ];

        // 3D rotation projection
        const proj = vertices.map(([vx, vy, vz]) => {
          // Rotate around Y
          let x1 = vx * Math.cos(angleY) + vz * Math.sin(angleY);
          let z1 = -vx * Math.sin(angleY) + vz * Math.cos(angleY);
          // Rotate around X
          let y2 = vy * Math.cos(angleX) - z1 * Math.sin(angleX);
          let z2 = vy * Math.sin(angleX) + z1 * Math.cos(angleX);
          // Perspective projection
          const f = 3 / (3 + z2);
          return [x1 * shipScale * f, y2 * shipScale * f];
        });

        // Draw wireframe edges
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 8;
        edges.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(proj[i][0], proj[i][1]);
          ctx.lineTo(proj[j][0], proj[j][1]);
          ctx.stroke();
        });

        // Glowing vertex vertices
        ctx.fillStyle = '#bae6fd';
        proj.forEach(([px, py]) => {
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      } else if (holoMode === 'orbital-globe') {
        // --- 3. WIREFRAME PLANETARY GLOBE ---
        ctx.save();
        const rGlobe = baseRadius * 0.45;
        const globeRot = rotationAngle * 1.5;

        // Longitudes
        for (let i = 0; i < 8; i++) {
          const phi = (i / 8) * Math.PI + globeRot;
          ctx.beginPath();
          ctx.ellipse(0, 0, Math.abs(Math.cos(phi)) * rGlobe, rGlobe, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Latitudes
        for (let lat = -2; lat <= 2; lat++) {
          const y = (lat / 3) * (rGlobe * 0.85);
          const rLat = Math.sqrt(Math.max(0, rGlobe * rGlobe - y * y));
          ctx.beginPath();
          ctx.ellipse(0, y, rLat, rLat * 0.3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = lat === 0 ? '#00f2fe' : 'rgba(0, 229, 255, 0.2)';
          ctx.lineWidth = lat === 0 ? 1.5 : 0.8;
          ctx.stroke();
        }

        // Satellite orbital ring
        ctx.save();
        ctx.rotate(-0.5);
        ctx.beginPath();
        ctx.ellipse(0, 0, rGlobe * 1.3, rGlobe * 0.5, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();

        // Orbiting beacon satellite
        const satAngle = rotationAngle * 3;
        const sx = Math.cos(satAngle) * (rGlobe * 1.3);
        const sy = Math.sin(satAngle) * (rGlobe * 0.5);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
      } else {
        // --- 4. ROMAN MOSAIC MATRIX PREVIEW ---
        ctx.save();
        const gridSize = 12;
        const tileW = 10;
        const startX = -((gridSize * tileW) / 2);
        const startY = -((gridSize * tileW) / 2);

        for (let gx = 0; gx < gridSize; gx++) {
          for (let gy = 0; gy < gridSize; gy++) {
            const dist = Math.hypot(gx - gridSize / 2, gy - gridSize / 2);
            const wave = Math.sin(dist - rotationAngle * 3);
            const isRed = (gx + gy) % 2 === 0;
            ctx.fillStyle = isRed ? `rgba(220, 38, 38, ${0.4 + wave * 0.3})` : `rgba(2, 132, 199, ${0.4 + wave * 0.3})`;
            ctx.fillRect(startX + gx * tileW + 1, startY + gy * tileW + 1, tileW - 2, tileW - 2);
          }
        }
        ctx.strokeStyle = '#00f2fe';
        ctx.strokeRect(startX, startY, gridSize * tileW, gridSize * tileW);
        ctx.restore();
      }

      // --- LAYER C: TARGETING RETICLE OVERLAY ---
      if (targetLocked) {
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 1.5;
        const reticleSize = baseRadius * 0.28;

        // Corner brackets [ + ]
        const bLen = 14;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(-reticleSize, -reticleSize + bLen);
        ctx.lineTo(-reticleSize, -reticleSize);
        ctx.lineTo(-reticleSize + bLen, -reticleSize);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(reticleSize - bLen, -reticleSize);
        ctx.lineTo(reticleSize, -reticleSize);
        ctx.lineTo(reticleSize, -reticleSize + bLen);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(-reticleSize, reticleSize - bLen);
        ctx.lineTo(-reticleSize, reticleSize);
        ctx.lineTo(-reticleSize + bLen, reticleSize);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(reticleSize - bLen, reticleSize);
        ctx.lineTo(reticleSize, reticleSize);
        ctx.lineTo(reticleSize, reticleSize - bLen);
        ctx.stroke();

        // Center crosshair
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(8, 0);
        ctx.moveTo(0, -8);
        ctx.lineTo(0, 8);
        ctx.stroke();
      }

      ctx.restore(); // Restore translate(cx, cy)

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [holoMode, targetLocked]);

  // 4. S-208 FAN RADAR (Bottom-left of IMG_0530)
  useEffect(() => {
    const canvas = radarFanCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let sweepAngle = 0;

    const render = () => {
      sweepAngle += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Pivot point at bottom center
      const ox = w / 2;
      const oy = h * 0.95;
      const maxR = h * 0.85;

      // Fan angle span (-60 to +60 degrees from vertical)
      const span = Math.PI * 0.65;
      const startAngle = -Math.PI / 2 - span / 2;
      const endAngle = -Math.PI / 2 + span / 2;

      // Draw fan concentric range arcs
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let r = maxR * 0.33; r <= maxR; r += maxR * 0.33) {
        ctx.beginPath();
        ctx.arc(ox, oy, r, startAngle, endAngle);
        ctx.stroke();
      }

      // Draw radial boundary lines
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(startAngle) * maxR, oy + Math.sin(startAngle) * maxR);
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(endAngle) * maxR, oy + Math.sin(endAngle) * maxR);
      ctx.stroke();

      // Sweeping beam oscillating back and forth across fan
      const osc = Math.sin(sweepAngle);
      const curAngle = -Math.PI / 2 + (osc * span) / 2;

      // Sweep gradient
      const grad = ctx.createLinearGradient(
        ox,
        oy,
        ox + Math.cos(curAngle) * maxR,
        oy + Math.sin(curAngle) * maxR
      );
      grad.addColorStop(0, 'rgba(0, 242, 254, 0.05)');
      grad.addColorStop(1, 'rgba(0, 242, 254, 0.6)');

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(curAngle) * maxR, oy + Math.sin(curAngle) * maxR);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Simulated target pings on fan
      const pings = [
        { r: maxR * 0.6, a: -Math.PI / 2 - 0.2, id: 'T1' },
        { r: maxR * 0.8, a: -Math.PI / 2 + 0.35, id: 'T2' },
        { r: maxR * 0.45, a: -Math.PI / 2 + 0.1, id: 'T3' },
      ];

      pings.forEach((p) => {
        const px = ox + Math.cos(p.a) * p.r;
        const py = oy + Math.sin(p.a) * p.r;
        const isIlluminated = Math.abs(curAngle - p.a) < 0.15;

        ctx.fillStyle = isIlluminated ? '#00f2fe' : 'rgba(0, 229, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(px, py, isIlluminated ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fill();

        if (isIlluminated) {
          ctx.strokeStyle = 'rgba(0, 242, 254, 0.5)';
          ctx.beginPath();
          ctx.arc(px, py, 7, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // 5. CIRCULAR 360° TACTICAL RADAR (Bottom center-left of IMG_0530)
  useEffect(() => {
    const canvas = circularRadarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let radarSweep = 0;

    const render = () => {
      radarSweep += 0.035;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.44;
      ctx.clearRect(0, 0, w, h);

      // Radar rings
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.arc(cx, cy, r * 0.66, 0, Math.PI * 2);
      ctx.arc(cx, cy, r * 0.33, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();

      // Sweeping beam wedge with trail
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(radarSweep);

      const sweepGrad = ctx.createLinearGradient(0, 0, r, 0);
      sweepGrad.addColorStop(0, 'rgba(0, 242, 254, 0.1)');
      sweepGrad.addColorStop(1, 'rgba(0, 242, 254, 0.8)');

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, 0, -0.4, true);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.fill();

      // Lead sweep line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r, 0);
      ctx.strokeStyle = sweepGrad;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // 6. TRIPLE GYRO DIALS (Right side of IMG_0530)
  useEffect(() => {
    const canvas = gyroDialsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Three vertically stacked circular dials
      const dialRadius = Math.min(w * 0.42, (h / 3) * 0.4);
      const centers = [
        { cx: w / 2, cy: h * 0.18, speed: 1.2, label: 'ATTITUDE' },
        { cx: w / 2, cy: h * 0.5, speed: -0.8, label: 'BEARING' },
        { cx: w / 2, cy: h * 0.82, speed: 1.5, label: 'VECTOR' },
      ];

      centers.forEach((d, idx) => {
        const { cx, cy, speed } = d;
        const rot = t * speed;

        // Outer circular border
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, dialRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Rotating gear teeth
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        const teeth = 12;
        for (let i = 0; i < teeth; i++) {
          const a = (i / teeth) * Math.PI * 2;
          const r1 = dialRadius - 1;
          const r2 = dialRadius - (i % 3 === 0 ? 5 : 3);
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
          ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
          ctx.strokeStyle = i % 3 === 0 ? '#00f2fe' : 'rgba(0, 229, 255, 0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Inner pointer / arc
        ctx.beginPath();
        ctx.arc(0, 0, dialRadius * 0.5, 0, Math.PI * (0.8 + idx * 0.3));
        ctx.strokeStyle = idx === 0 ? '#38bdf8' : idx === 1 ? '#00f2fe' : '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleToggleTargetLock = () => {
    soundEffects.playLaserBolt(440);
    setTargetLocked(!targetLocked);
  };

  const handleSelectHoloMode = (mode: CentralHoloMode) => {
    soundEffects.playShieldPulse();
    setHoloMode(mode);
  };

  const handlePowerChange = (sector: number, delta: number) => {
    soundEffects.playThrusterHum(300);
    setPowerLevels((prev) => {
      const current = prev[sector] ?? 50;
      const next = Math.max(5, Math.min(100, current + delta));
      return { ...prev, [sector]: next };
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#030712] text-slate-100 select-none overflow-hidden font-mono">
      {/* Background Starfield & Space Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#06152a]/60 via-[#030712] to-[#01040a] z-0" />
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#00e5ff12_1px,transparent_1px),linear-gradient(to_bottom,#00e5ff12_1px,transparent_1px)] bg-[size:32px_32px] z-0" />

      {/* Optional Cockpit Canopy Glass Effect (Inspired by IMG_0529) */}
      {cockpitCanopy && (
        <div className="absolute inset-0 pointer-events-none z-20 border-[28px] border-black/80 rounded-[48px] shadow-[inset_0_0_80px_rgba(0,229,255,0.15)]">
          {/* Top cockpit strut */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/90 rounded-b-xl border-b border-cyan-500/30 flex items-center justify-center text-[10px] text-cyan-400">
            <span>CANOPY HUD-LOCK</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 1: TOP SCI-FI TELEMETRY BAR (Directly from IMG_0530) */}
      {/* ========================================================= */}
      <header className="relative z-10 w-full px-3 py-2 border-b border-cyan-500/30 bg-[#040c1a]/90 backdrop-blur-md flex items-center justify-between shrink-0 gap-3">
        {/* Top-Left: Waveform Oscilloscope Box */}
        <div className="flex items-center gap-2">
          <div className="border border-cyan-500/40 rounded bg-black/50 p-1 flex flex-col shadow-[0_0_10px_rgba(0,229,255,0.15)]">
            <div className="flex items-center justify-between px-1 text-[9px] text-cyan-400 font-bold tracking-wider">
              <span>WAVE SPECTRUM</span>
              <span className="text-emerald-400">SIG: {metrics.freq.toFixed(1)}M</span>
            </div>
            <canvas
              ref={waveformCanvasRef}
              width={160}
              height={38}
              className="w-[120px] sm:w-[160px] h-[34px] block"
            />
          </div>

          {/* Level indicators */}
          <div className="hidden lg:flex flex-col gap-1 text-[10px] text-slate-300">
            <div className="flex items-center gap-1">
              <span className="text-cyan-400">SYS_BUFFER:</span>
              <div className="w-16 h-1.5 bg-black/60 rounded overflow-hidden border border-cyan-500/30">
                <div className="h-full bg-cyan-400 w-[74%]" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-amber-400">FLUX_STAB:</span>
              <div className="w-16 h-1.5 bg-black/60 rounded overflow-hidden border border-amber-500/30">
                <div className="h-full bg-amber-400 w-[89%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Top-Center: System Telemetry & Title */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold tracking-widest text-cyan-300 uppercase shadow-[0_0_8px_rgba(0,229,255,0.4)]">
              TACTICAL HUD COMMAND DECK // BC-717
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span>
              STATUS: <strong className="text-cyan-300">{systemAlert}</strong>
            </span>
            <span className="hidden sm:inline text-cyan-600">•</span>
            <span className="hidden sm:inline">
              AZ: <strong className="text-cyan-200">{metrics.azimuth}°</strong>
            </span>
            <span className="hidden sm:inline">
              EL: <strong className="text-cyan-200">{metrics.elevation}°</strong>
            </span>
          </div>
        </div>

        {/* Top-Right: Spectrum Equalizer & Quick Controls */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex border border-cyan-500/40 rounded bg-black/50 p-1 flex-col shadow-[0_0_10px_rgba(0,229,255,0.15)]">
            <div className="flex items-center justify-between px-1 text-[9px] text-cyan-400 font-bold tracking-wider">
              <span>EQUALIZER</span>
              <span className="text-cyan-200">HISTOGRAM</span>
            </div>
            <canvas
              ref={spectrumCanvasRef}
              width={140}
              height={38}
              className="w-[120px] sm:w-[140px] h-[34px] block"
            />
          </div>

          {/* Quick Canopy & Lock Toggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCockpitCanopy(!cockpitCanopy)}
              className={`p-1.5 rounded border text-[10px] flex items-center gap-1 transition-all ${
                cockpitCanopy
                  ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                  : 'bg-black/50 text-slate-400 border-white/20 hover:text-white'
              }`}
              title="Toggle Cockpit View Overlay (IMG_0529)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CANOPY</span>
            </button>

            <button
              onClick={handleToggleTargetLock}
              className={`p-1.5 rounded border text-[10px] flex items-center gap-1 transition-all ${
                targetLocked
                  ? 'bg-red-500/30 text-red-300 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                  : 'bg-black/50 text-slate-400 border-white/20 hover:text-white'
              }`}
              title="Target Lock Reticle"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOCK</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* SECTION 2: MAIN TACTICAL HUD COCKPIT (IMG_0530)            */}
      {/* ========================================================= */}
      <main className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-12 gap-2 p-2 sm:p-3 overflow-y-auto lg:overflow-hidden">
        {/* ===================================================== */}
        {/* LEFT WING (Cols 1-3): METRICS & RADAR FAN (IMG_0530)  */}
        {/* ===================================================== */}
        <div className="md:col-span-3 flex flex-col gap-2.5 justify-between">
          {/* A. Prominent Numeric Readouts: 27, 89, 91 (From IMG_0530 left cluster) */}
          <div className="border border-cyan-500/30 rounded-lg bg-[#051020]/85 p-2.5 backdrop-blur shadow-[0_0_15px_rgba(0,229,255,0.08)]">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold border-b border-cyan-500/20 pb-1 mb-2">
              <span>METRIC CLUSTER</span>
              <span className="text-emerald-400">SYNC OK</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Metric 27 (AAM) */}
              <div className="border border-cyan-500/40 rounded p-1.5 bg-black/40">
                <div className="text-2xl font-bold text-cyan-300 font-mono tracking-tight shadow-[0_0_8px_rgba(0,229,255,0.3)]">
                  {metrics.aam}
                </div>
                <div className="text-[9px] font-bold text-cyan-400 mt-0.5">AAM</div>
                <div className="text-[7px] text-slate-400">ARRAY MON</div>
              </div>

              {/* Metric 89 (ACS) */}
              <div className="border border-cyan-500/40 rounded p-1.5 bg-black/40">
                <div className="text-2xl font-bold text-cyan-200 font-mono tracking-tight shadow-[0_0_8px_rgba(0,229,255,0.3)]">
                  {metrics.acs}
                </div>
                <div className="text-[9px] font-bold text-cyan-400 mt-0.5">ACS</div>
                <div className="text-[7px] text-slate-400">ATTITUDE</div>
              </div>

              {/* Metric 91 (QTA) */}
              <div className="border border-cyan-500/40 rounded p-1.5 bg-black/40">
                <div className="text-2xl font-bold text-cyan-100 font-mono tracking-tight shadow-[0_0_8px_rgba(0,229,255,0.3)]">
                  {metrics.qta}
                </div>
                <div className="text-[9px] font-bold text-cyan-400 mt-0.5">QTA</div>
                <div className="text-[7px] text-slate-400">QUANTUM</div>
              </div>
            </div>

            {/* Diagnostic Sub-Table (IMG_0530) */}
            <div className="mt-2.5 pt-2 border-t border-cyan-500/20 grid grid-cols-2 gap-1 text-[9px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">ACC TEM:</span>
                <span className="text-cyan-300">0.82 G</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SECTOR:</span>
                <span className="text-cyan-300">08-B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">FREQ MOD:</span>
                <span className="text-emerald-400">ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DIVERG:</span>
                <span className="text-cyan-300">0.003</span>
              </div>
            </div>
          </div>

          {/* B. S-208 Polar Fan Radar Scanner (As in bottom-left of IMG_0530) */}
          <div className="border border-cyan-500/30 rounded-lg bg-[#051020]/85 p-2.5 backdrop-blur shadow-[0_0_15px_rgba(0,229,255,0.08)] flex-1 flex flex-col">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold border-b border-cyan-500/20 pb-1 mb-1">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-cyan-400" />
                <span>S-208 POLAR SECTOR RADAR</span>
              </span>
              <span className="text-slate-400 text-[9px]">27 / 55 / 60</span>
            </div>

            <div className="relative flex-1 min-h-[140px] flex items-center justify-center overflow-hidden">
              <canvas
                ref={radarFanCanvasRef}
                width={260}
                height={150}
                className="w-full h-full object-contain block"
              />
              <div className="absolute top-1 left-2 text-[8px] text-cyan-500 font-mono">
                RANGE: 240 KM
              </div>
              <div className="absolute bottom-1 right-2 text-[8px] text-emerald-400 font-mono">
                3 TARGETS ACQUIRED
              </div>
            </div>
          </div>

          {/* C. 360° Circular Tactical Radar (Bottom-left of IMG_0530) */}
          <div className="border border-cyan-500/30 rounded-lg bg-[#051020]/85 p-2 backdrop-blur shadow-[0_0_15px_rgba(0,229,255,0.08)] flex items-center gap-3">
            <canvas
              ref={circularRadarCanvasRef}
              width={80}
              height={80}
              className="w-20 h-20 shrink-0 block"
            />
            <div className="flex flex-col text-[9px] text-slate-300 space-y-1 flex-1">
              <div className="font-bold text-cyan-300 flex items-center justify-between">
                <span>CIRCULAR SWEEP</span>
                <span className="text-emerald-400">360°</span>
              </div>
              <div className="text-[8px] text-slate-400">SWEEP INTERVAL: 1.8s</div>
              <div className="text-[8px] text-cyan-400">IFF TRANS: ALLIED</div>
              <button
                onClick={() => {
                  soundEffects.playLaserBolt(580);
                  setSystemAlert('RADAR BEACON PINGED');
                }}
                className="mt-1 py-1 px-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold text-center transition-all"
              >
                PULSE ACTIVE PING
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================== */}
        {/* CENTERPIECE (Cols 4-9): MAIN HOLOGRAM CHAMBER         */}
        {/* ===================================================== */}
        <div className="md:col-span-6 flex flex-col items-center justify-between border border-cyan-500/40 rounded-xl bg-[#040e1d]/90 p-3 relative shadow-[0_0_30px_rgba(0,229,255,0.12)]">
          {/* Chamfered Sci-Fi Corner Brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />

          {/* Chamber Header & Hologram Mode Switcher */}
          <div className="w-full flex items-center justify-between border-b border-cyan-500/30 pb-2 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>PRIMARY HOLOGRAPHIC PROJECTION CORE</span>
            </div>

            {/* Switchable Hologram View Modes (Cloud Matrix, Wireframe Ship, Globe, Mosaic) */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-cyan-500/30">
              <button
                onClick={() => handleSelectHoloMode('cloud-matrix')}
                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                  holoMode === 'cloud-matrix'
                    ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,229,255,0.6)]'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
                title="Neural Cloud Matrix (IMG_0530 Icon)"
              >
                <Cloud className="w-3 h-3" />
                <span className="hidden sm:inline">CLOUD</span>
              </button>

              <button
                onClick={() => handleSelectHoloMode('wireframe-ship')}
                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                  holoMode === 'wireframe-ship'
                    ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,229,255,0.6)]'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
                title="3D Tactical Starfighter Wireframe"
              >
                <Target className="w-3 h-3" />
                <span className="hidden sm:inline">3D RIG</span>
              </button>

              <button
                onClick={() => handleSelectHoloMode('orbital-globe')}
                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                  holoMode === 'orbital-globe'
                    ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,229,255,0.6)]'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
                title="Planetary Orbital Globe"
              >
                <Orbit className="w-3 h-3" />
                <span className="hidden sm:inline">ORBIT</span>
              </button>

              <button
                onClick={() => handleSelectHoloMode('roman-mosaic')}
                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                  holoMode === 'roman-mosaic'
                    ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
                title="Roman Mosaic Matrix"
              >
                <Layers className="w-3 h-3" />
                <span className="hidden sm:inline">MOSAIC</span>
              </button>
            </div>
          </div>

          {/* Central Animated Canvas (Concentric Dial + Hologram) */}
          <div className="relative w-full flex-1 min-h-[300px] sm:min-h-[380px] flex items-center justify-center">
            <canvas
              ref={holoCenterCanvasRef}
              width={420}
              height={420}
              className="w-full max-w-[420px] max-h-[420px] object-contain block"
            />

            {/* Live Reticle Readout Overlays (Surrounding the central ring) */}
            <div className="absolute top-2 left-4 text-[9px] text-cyan-400/80 font-mono">
              <div>FREQ: 247.50 GHz</div>
              <div>RETICLE: LOCK [{targetLocked ? 'ACTIVE' : 'IDLE'}]</div>
            </div>
            <div className="absolute top-2 right-4 text-[9px] text-right text-cyan-400/80 font-mono">
              <div>AZIMUTH: {metrics.azimuth}°</div>
              <div>ELEVATION: {metrics.elevation}°</div>
            </div>
            <div className="absolute bottom-2 left-4 text-[9px] text-slate-400 font-mono">
              <div>RESOLUTION: 2048×2048</div>
              <div>FLUX: {metrics.flux}% NOMINAL</div>
            </div>
            <div className="absolute bottom-2 right-4 text-[9px] text-right text-slate-400 font-mono">
              <div>BEARING: 042° TRUE</div>
              <div>STABILIZER: GYRO-V5</div>
            </div>
          </div>

          {/* Bottom Interactive Targeting & Action Bar */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-cyan-500/20 text-[10px] text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">RETICLE CALIBRATION:</span>
              <button
                onClick={() => {
                  soundEffects.playThrusterHum(400);
                  setMetrics((m) => ({
                    ...m,
                    azimuth: parseFloat((Math.random() * 360).toFixed(1)),
                    elevation: parseFloat((Math.random() * 90).toFixed(1)),
                  }));
                }}
                className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 transition-all flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>RE-ACQUIRE</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400">CORE TEMPERATURE:</span>
              <span className="text-emerald-400 font-bold">294.1 K (STABLE)</span>
            </div>
          </div>
        </div>

        {/* ===================================================== */}
        {/* RIGHT WING (Cols 10-12): BC-717 & SECTOR POWER BARS   */}
        {/* ===================================================== */}
        <div className="md:col-span-3 flex flex-col gap-2.5 justify-between">
          {/* A. BC-717 Analytics & Triple Gyro Dials (Top-right of IMG_0530) */}
          <div className="border border-cyan-500/30 rounded-lg bg-[#051020]/85 p-2.5 backdrop-blur shadow-[0_0_15px_rgba(0,229,255,0.08)]">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold border-b border-cyan-500/20 pb-1 mb-2">
              <span className="text-cyan-300 font-bold">BC-717 ANALYTICS</span>
              <span className="text-cyan-400">TRIPLE GYRO</span>
            </div>

            {/* Triple Gyro Dials Canvas */}
            <div className="flex items-center justify-center">
              <canvas
                ref={gyroDialsCanvasRef}
                width={220}
                height={140}
                className="w-full max-w-[220px] h-[130px] block"
              />
            </div>
            <div className="flex items-center justify-between text-[8px] text-slate-400 px-2 mt-1">
              <span>ATTITUDE</span>
              <span>BEARING</span>
              <span>VECTOR</span>
            </div>
          </div>

          {/* B. Power Output Analytics & Sector Bars (IMG_0530 right side) */}
          <div className="border border-cyan-500/30 rounded-lg bg-[#051020]/85 p-2.5 backdrop-blur shadow-[0_0_15px_rgba(0,229,255,0.08)] flex-1 flex flex-col">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold border-b border-cyan-500/20 pb-1 mb-2">
              <span>POWER OUTPUT ANALYTICS</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>

            {/* Sector Meters (36, 78, 70, 03 - exact sectors from IMG_0530) */}
            <div className="space-y-2.5 flex-1 justify-center flex flex-col">
              {[
                { sector: 36, label: 'SECTOR 36', defaultPct: 78, color: 'bg-cyan-400' },
                { sector: 78, label: 'SECTOR 78', defaultPct: 82, color: 'bg-cyan-400' },
                { sector: 70, label: 'SECTOR 70', defaultPct: 70, color: 'bg-cyan-400' },
                { sector: 3, label: 'SECTOR 03', defaultPct: 24, color: 'bg-amber-400' },
              ].map((item) => {
                const pct = powerLevels[item.sector] ?? item.defaultPct;
                return (
                  <div key={item.sector} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="font-bold text-slate-300">{item.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-cyan-300 font-mono font-bold">{pct}%</span>
                        <button
                          onClick={() => handlePowerChange(item.sector, 5)}
                          className="w-4 h-4 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 flex items-center justify-center text-[10px]"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handlePowerChange(item.sector, -5)}
                          className="w-4 h-4 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 flex items-center justify-center text-[10px]"
                        >
                          -
                        </button>
                      </div>
                    </div>
                    {/* Progress Track */}
                    <div className="w-full h-2 bg-black/60 rounded overflow-hidden border border-cyan-500/20">
                      <div
                        className={`h-full ${item.color} transition-all duration-300 shadow-[0_0_8px_rgba(0,229,255,0.4)]`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hexagonal Sensor Status Readout */}
            <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[9px] text-slate-400">
              <span>HEX SENSORS:</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_6px_rgba(0,229,255,0.8)]" />
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_6px_rgba(0,229,255,0.8)]" />
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_6px_rgba(0,229,255,0.8)]" />
              </div>
            </div>
          </div>

          {/* C. Tactical Diagnostics Block */}
          <div className="border border-cyan-500/30 rounded-lg bg-[#051020]/85 p-2 backdrop-blur shadow-[0_0_15px_rgba(0,229,255,0.08)] text-[9px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between text-cyan-400 font-bold">
              <span>SYSTEM DIAGNOSTIC</span>
              <span className="text-emerald-400">READY</span>
            </div>
            <div className="text-slate-400 leading-tight">
              ENCRYPTION: QUANTUM RSA-4096
              <br />
              COMM CH: TACTICAL-7 ENCRYPTED
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* SECTION 3: BOTTOM FLOATING NEON NAVIGATION SUITE          */}
      {/* Inspired by IMG_0532 (Glowing Chamfered Neon Action Pods) */}
      {/* ========================================================= */}
      <footer className="relative z-10 w-full px-3 py-2 bg-[#020610]/95 border-t border-cyan-500/30 flex items-center justify-between shrink-0 gap-2 flex-wrap sm:flex-nowrap">
        {/* Left: Quick System Indicator */}
        <div className="flex items-center gap-2 text-[10px] text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold tracking-wider">HUD PROTOCOL ACTIVE</span>
        </div>

        {/* Center: Glowing Chamfered Neon Action Buttons (Inspired by IMG_0532) */}
        <div className="flex items-center gap-2">
          {/* 1. Tactical HUD (Current) */}
          <div className="relative group">
            <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-300 border border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)] text-[10px] font-bold tracking-wider flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-cyan-300" />
              <span>TACTICAL HUD (0530)</span>
            </button>
            {/* Downward ambient neon spot beam (From IMG_0532) */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-cyan-400/40 blur-sm rounded-full pointer-events-none" />
          </div>

          {/* 2. Cockpit Dogfight Sim (IMG_0529) */}
          {onSwitchToCockpitSim && (
            <div className="relative group">
              <button
                onClick={onSwitchToCockpitSim}
                className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-cyan-950 text-slate-300 hover:text-cyan-200 border border-white/20 hover:border-cyan-500/50 text-[10px] font-bold tracking-wider flex items-center gap-1.5 transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
                <span>3D COCKPIT (0529)</span>
              </button>
            </div>
          )}

          {/* 3. Light Protocol Circuit PCB (IMG_0528) */}
          {onSwitchToPcb && (
            <div className="relative group">
              <button
                onClick={onSwitchToPcb}
                className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-teal-950 text-slate-300 hover:text-teal-200 border border-white/20 hover:border-teal-500/50 text-[10px] font-bold tracking-wider flex items-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400" />
                <span>CIRCUIT PCB (0528)</span>
              </button>
            </div>
          )}

          {/* 4. Roman Mosaic Forge */}
          {onSwitchToMosaic && (
            <div className="relative group">
              <button
                onClick={onSwitchToMosaic}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500/30 hover:to-amber-600/40 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] text-[10px] font-bold tracking-wider flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>MOSAIC FORGE</span>
              </button>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-amber-400/40 blur-sm rounded-full pointer-events-none" />
            </div>
          )}
        </div>

        {/* Right: Sound & Alert Controls */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="hidden sm:inline">AI DECK v4.8</span>
        </div>
      </footer>
    </div>
  );
};
