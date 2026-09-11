import { PresetAsset } from '../types';

export const GAME_PRESET_ASSETS: PresetAsset[] = [
  {
    id: 'roman_cyber_mosaic',
    name: 'Roman Cyber Mosaic',
    category: 'Roman & Cyber',
    description: 'Classical Roman Centurion bust fused with cybernetic ocular visor, marble laurel wreath, and imperial terracotta tesserae.',
    badge: 'OPUS TESSALATUM',
    accentColor: '#f59e0b',
    generator: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      const w = canvas.width;
      const h = canvas.height;
      // Background: Dark travertine stone texture
      ctx.fillStyle = '#1c1614';
      ctx.fillRect(0, 0, w, h);

      // Roman arches / border meander
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = Math.max(2, w * 0.015);
      ctx.strokeRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9);

      // Emperor/Gladiator bust silhouette
      const cx = w * 0.5;
      const cy = h * 0.45;
      const r = w * 0.28;

      // Marble Head
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();

      // Golden Laurel Wreath
      ctx.fillStyle = '#fbbf24';
      for (let a = -Math.PI * 0.7; a <= -Math.PI * 0.1; a += 0.2) {
        const lx = cx + Math.cos(a) * (r + w * 0.03);
        const ly = cy + Math.sin(a) * (r + w * 0.03);
        ctx.beginPath();
        ctx.ellipse(lx, ly, w * 0.04, w * 0.015, a, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cybernetic Ocular Visor (Neon Cyan)
      const grad = ctx.createLinearGradient(cx - r * 0.8, cy, cx + r * 0.8, cy);
      grad.addColorStop(0, '#00f2fe');
      grad.addColorStop(0.5, '#4facfe');
      grad.addColorStop(1, '#00f2fe');
      ctx.fillStyle = grad;
      ctx.beginPath();
      if ('roundRect' in ctx && typeof (ctx as unknown as { roundRect?: unknown }).roundRect === 'function') {
        (ctx as unknown as { roundRect: (x: number, y: number, w: number, h: number, r: number[]) => void }).roundRect(cx - r * 0.7, cy - r * 0.15, r * 1.4, r * 0.35, [w * 0.02]);
      } else {
        ctx.rect(cx - r * 0.7, cy - r * 0.15, r * 1.4, r * 0.35);
      }
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, w * 0.008);
      ctx.stroke();

      // Imperial Toga Drapery (Pompeian Red)
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(cx - r * 1.2, h * 0.95);
      ctx.lineTo(cx - r * 0.5, cy + r * 0.6);
      ctx.lineTo(cx, cy + r * 0.9);
      ctx.lineTo(cx + r * 0.8, cy + r * 0.5);
      ctx.lineTo(cx + r * 1.3, h * 0.95);
      ctx.closePath();
      ctx.fill();

      // Gold Imperial Medallion
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.95, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  {
    id: 'cyber_pilot_hero',
    name: 'Cyber Pilot Hero',
    category: 'Mech & Armor',
    description: 'Elite mecha squadron pilot with augmented holographic helmet, neural synaptic interface, and titanium flight collar.',
    badge: 'NEURAL RIG',
    accentColor: '#00f2fe',
    generator: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.42;

      // Pilot Flight Suit Shoulders
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.45, h * 0.95);
      ctx.lineTo(cx - w * 0.2, h * 0.62);
      ctx.lineTo(cx + w * 0.2, h * 0.62);
      ctx.lineTo(cx + w * 0.45, h * 0.95);
      ctx.closePath();
      ctx.fill();

      // Tactical Oxygen / Power Tubes
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = w * 0.02;
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.15, h * 0.68);
      ctx.lineTo(cx - w * 0.35, h * 0.88);
      ctx.moveTo(cx + w * 0.15, h * 0.68);
      ctx.lineTo(cx + w * 0.35, h * 0.88);
      ctx.stroke();

      // Helmet Shell
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.26, h * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Visor Glow
      const vGrad = ctx.createRadialGradient(cx, cy - h * 0.04, 5, cx, cy - h * 0.04, w * 0.25);
      vGrad.addColorStop(0, '#38bdf8');
      vGrad.addColorStop(0.6, '#0284c7');
      vGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = vGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy - h * 0.02, w * 0.2, h * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Neural Reticle HUD in Visor
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - w * 0.08, cy - h * 0.07, w * 0.16, h * 0.1);
      ctx.beginPath();
      ctx.arc(cx, cy - h * 0.02, w * 0.04, 0, Math.PI * 2);
      ctx.stroke();
    },
  },
  {
    id: 'valkyrie_gundam',
    name: 'Valkyrie Gundam Mobile Rig',
    category: 'Mech & Armor',
    description: 'Angelic-wing high-mobility combat frame with twin V-fin gold crest, crimson chest vents, and dual hyper thrusters.',
    badge: 'MK-IV MECHA',
    accentColor: '#f43f5e',
    generator: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.45;

      // Gundam Wings in Background
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.05, cy - h * 0.1);
      ctx.lineTo(cx - w * 0.45, cy - h * 0.35);
      ctx.lineTo(cx - w * 0.3, cy + h * 0.1);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + w * 0.05, cy - h * 0.1);
      ctx.lineTo(cx + w * 0.45, cy - h * 0.35);
      ctx.lineTo(cx + w * 0.3, cy + h * 0.1);
      ctx.closePath();
      ctx.fill();

      // Wing Red Accents
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(cx - w * 0.4, cy - h * 0.3, w * 0.08, h * 0.12);
      ctx.fillRect(cx + w * 0.32, cy - h * 0.3, w * 0.08, h * 0.12);

      // Chest Chassis
      ctx.fillStyle = '#1e3a8a'; // Cobalt blue chest
      ctx.fillRect(cx - w * 0.22, cy + h * 0.05, w * 0.44, h * 0.3);

      // Crimson Chest Exhaust Vents
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx - w * 0.18, cy + h * 0.08, w * 0.12, h * 0.08);
      ctx.fillRect(cx + w * 0.06, cy + h * 0.08, w * 0.12, h * 0.08);

      // Head Base
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.12, cy - h * 0.18);
      ctx.lineTo(cx + w * 0.12, cy - h * 0.18);
      ctx.lineTo(cx + w * 0.08, cy + h * 0.06);
      ctx.lineTo(cx - w * 0.08, cy + h * 0.06);
      ctx.closePath();
      ctx.fill();

      // Green Dual Sensors / Eyes
      ctx.fillStyle = '#10b981';
      ctx.fillRect(cx - w * 0.07, cy - h * 0.05, w * 0.05, h * 0.025);
      ctx.fillRect(cx + w * 0.02, cy - h * 0.05, w * 0.05, h * 0.025);

      // Iconic Golden V-Fin Antenna Crest
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.15);
      ctx.lineTo(cx - w * 0.35, cy - h * 0.38);
      ctx.lineTo(cx - w * 0.1, cy - h * 0.18);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.15);
      ctx.lineTo(cx + w * 0.35, cy - h * 0.38);
      ctx.lineTo(cx + w * 0.1, cy - h * 0.18);
      ctx.closePath();
      ctx.fill();

      // Red Forehead Jewel
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(cx - w * 0.035, cy - h * 0.19, w * 0.07, h * 0.05);
    },
  },
  {
    id: 'cyber_mech_armor',
    name: 'Cyber Mech Exoskeleton',
    category: 'Mech & Armor',
    description: 'Heavy tactical armor suit with reinforced carbon composite plating, reactor core housing, and shoulder ballistics.',
    badge: 'HEAVY ARMOR',
    accentColor: '#38bdf8',
    generator: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;

      // Pauldrons (Heavy shoulders)
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - w * 0.42, cy - h * 0.28, w * 0.22, h * 0.25);
      ctx.fillRect(cx + w * 0.2, cy - h * 0.28, w * 0.22, h * 0.25);

      // Warning hazard stripes on pauldrons
      ctx.fillStyle = '#eab308';
      ctx.fillRect(cx - w * 0.4, cy - h * 0.26, w * 0.18, h * 0.04);
      ctx.fillRect(cx + w * 0.22, cy - h * 0.26, w * 0.18, h * 0.04);

      // Main Torso Chassis
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.24, cy - h * 0.25);
      ctx.lineTo(cx + w * 0.24, cy - h * 0.25);
      ctx.lineTo(cx + w * 0.18, cy + h * 0.35);
      ctx.lineTo(cx - w * 0.18, cy + h * 0.35);
      ctx.closePath();
      ctx.fill();

      // Glowing Arc Reactor Core in Center
      const rGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, w * 0.14);
      rGrad.addColorStop(0, '#ffffff');
      rGrad.addColorStop(0.3, '#38bdf8');
      rGrad.addColorStop(0.8, '#0284c7');
      rGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, w * 0.13, 0, Math.PI * 2);
      ctx.fill();

      // Reinforced Chest Grille
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      for (let y = cy + h * 0.15; y <= cy + h * 0.3; y += h * 0.04) {
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.12, y);
        ctx.lineTo(cx + w * 0.12, y);
        ctx.stroke();
      }
    },
  },
  {
    id: 'beam_saber',
    name: 'High-Output Beam Saber',
    category: 'Weapons & Gear',
    description: 'Cohesive thermal plasma blade emitting high-frequency ionization luminescence with an alloy emitter hilt.',
    badge: 'PLASMA 10MW',
    accentColor: '#ec4899',
    generator: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, w, h);

      // Saber Hilt at bottom
      const hx = w * 0.5;
      const hy = h * 0.72;
      ctx.fillStyle = '#475569';
      ctx.fillRect(hx - w * 0.05, hy, w * 0.1, h * 0.22);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(hx - w * 0.06, hy, w * 0.12, h * 0.04); // Emitter collar

      // Plasma Beam Glow (Hot Magenta / Pink)
      const bGrad = ctx.createLinearGradient(hx - w * 0.15, 0, hx + w * 0.15, 0);
      bGrad.addColorStop(0, 'rgba(236, 72, 153, 0)');
      bGrad.addColorStop(0.3, 'rgba(244, 114, 182, 0.4)');
      bGrad.addColorStop(0.5, '#ffffff'); // pure white plasma core
      bGrad.addColorStop(0.7, 'rgba(244, 114, 182, 0.4)');
      bGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');

      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.moveTo(hx - w * 0.08, hy);
      ctx.lineTo(hx - w * 0.04, h * 0.08);
      ctx.quadraticCurveTo(hx, h * 0.04, hx + w * 0.04, h * 0.08);
      ctx.lineTo(hx + w * 0.08, hy);
      ctx.closePath();
      ctx.fill();

      // Secondary radiant ionization halo
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
      ctx.lineWidth = w * 0.06;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx, h * 0.08);
      ctx.stroke();
    },
  },
  {
    id: 'gauss_railgun',
    name: 'Gauss Hyper-Railgun',
    category: 'Weapons & Gear',
    description: 'Electromagnetic linear accelerator with twin energized stator rails and high-density tungsten sabot chamber.',
    badge: 'MAGNETIC KINETIC',
    accentColor: '#3b82f6',
    generator: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, w, h);

      const cy = h * 0.5;

      // Stock / Receiver at left
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(w * 0.08, cy - h * 0.18, w * 0.28, h * 0.36);

      // Twin Accelerator Rails
      ctx.fillStyle = '#64748b';
      ctx.fillRect(w * 0.36, cy - h * 0.12, w * 0.52, h * 0.07);
      ctx.fillRect(w * 0.36, cy + h * 0.05, w * 0.52, h * 0.07);

      // Glowing Magnetic Coils
      ctx.fillStyle = '#38bdf8';
      for (let x = w * 0.4; x <= w * 0.8; x += w * 0.1) {
        ctx.fillRect(x, cy - h * 0.14, w * 0.04, h * 0.28);
      }

      // Energy Arc in Center Channel
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.34, cy);
      ctx.lineTo(w * 0.92, cy);
      ctx.stroke();

      // Muzzle flash / charged capacitor aura
      const mGrad = ctx.createRadialGradient(w * 0.9, cy, 2, w * 0.9, cy, w * 0.1);
      mGrad.addColorStop(0, '#ffffff');
      mGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.8)');
      mGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.arc(w * 0.9, cy, w * 0.1, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  {
    id: 'space_starfighter_hero',
    name: 'Vanguard Space Starfighter',
    category: 'Space Fleet',
    description: 'Fast interceptor spacecraft with forward particle blasters, aerodynamic canard vectoring, and antimatter pulse drive.',
    badge: 'SPACE CORPS',
    accentColor: '#06b6d4',
    generator: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.48;

      // Delta Main Wing
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.38); // Nose
      ctx.lineTo(cx - w * 0.44, cy + h * 0.28); // Left wingtip
      ctx.lineTo(cx - w * 0.18, cy + h * 0.32);
      ctx.lineTo(cx, cy + h * 0.22);
      ctx.lineTo(cx + w * 0.18, cy + h * 0.32);
      ctx.lineTo(cx + w * 0.44, cy + h * 0.28); // Right wingtip
      ctx.closePath();
      ctx.fill();

      // Cockpit Canopy (Gold reflective glass)
      const cGrad = ctx.createLinearGradient(cx, cy - h * 0.15, cx, cy + h * 0.05);
      cGrad.addColorStop(0, '#fef08a');
      cGrad.addColorStop(0.5, '#f59e0b');
      cGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy - h * 0.05, w * 0.08, h * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dual Ion Engine Exhaust Plumes
      const tGrad = ctx.createLinearGradient(0, cy + h * 0.2, 0, cy + h * 0.48);
      tGrad.addColorStop(0, '#00f2fe');
      tGrad.addColorStop(0.7, '#3b82f6');
      tGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = tGrad;

      ctx.beginPath();
      ctx.moveTo(cx - w * 0.15, cy + h * 0.28);
      ctx.lineTo(cx - w * 0.1, cy + h * 0.45);
      ctx.lineTo(cx - w * 0.05, cy + h * 0.28);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + w * 0.05, cy + h * 0.28);
      ctx.lineTo(cx + w * 0.1, cy + h * 0.45);
      ctx.lineTo(cx + w * 0.15, cy + h * 0.28);
      ctx.fill();
    },
  },
  {
    id: 'stealth_corvette',
    name: 'Phantom Stealth Corvette',
    category: 'Space Fleet',
    description: 'Angular radar-absorbent faceted hull warship with dark matte carbon skin, cloaking emitters, and sensor slits.',
    badge: 'CLASS 7 COVERT',
    accentColor: '#8b5cf6',
    generator: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#020307';
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;

      // Faceted stealth hull (Isometric forward chisel)
      ctx.fillStyle = '#1e1b4b'; // Dark violet shade
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.4);
      ctx.lineTo(cx - w * 0.42, cy + h * 0.2);
      ctx.lineTo(cx, cy + h * 0.12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#312e81'; // Lighter facet
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.4);
      ctx.lineTo(cx + w * 0.42, cy + h * 0.2);
      ctx.lineTo(cx, cy + h * 0.12);
      ctx.closePath();
      ctx.fill();

      // Cloak Emitters / Violet Sensor Lines
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.35);
      ctx.lineTo(cx, cy + h * 0.3);
      ctx.stroke();

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.28, cy + h * 0.12);
      ctx.lineTo(cx, cy - h * 0.2);
      ctx.lineTo(cx + w * 0.28, cy + h * 0.12);
      ctx.stroke();
    },
  },
  {
    id: 'deep_space_nebula',
    name: 'Deep Space Ion Nebula',
    category: 'Space Fleet',
    description: 'Astronomical cosmic nursery showing ionized hydrogen & oxygen filament clouds, young blue hypergiants, and interstellar dust.',
    badge: 'COSMIC ASTRO',
    accentColor: '#6366f1',
    generator: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#030510';
      ctx.fillRect(0, 0, w, h);

      // 1. Nebula clouds
      const nGrad1 = ctx.createRadialGradient(w * 0.35, h * 0.4, 10, w * 0.35, h * 0.4, w * 0.45);
      nGrad1.addColorStop(0, 'rgba(236, 72, 153, 0.7)'); // Hydrogen Alpha pink
      nGrad1.addColorStop(0.5, 'rgba(147, 51, 234, 0.35)');
      nGrad1.addColorStop(1, 'transparent');
      ctx.fillStyle = nGrad1;
      ctx.fillRect(0, 0, w, h);

      const nGrad2 = ctx.createRadialGradient(w * 0.65, h * 0.55, 10, w * 0.65, h * 0.55, w * 0.42);
      nGrad2.addColorStop(0, 'rgba(0, 242, 254, 0.6)'); // Oxygen-III cyan
      nGrad2.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)');
      nGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = nGrad2;
      ctx.fillRect(0, 0, w, h);

      // 2. Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 80; i++) {
        const sx = (Math.sin(i * 99.7) * 0.5 + 0.5) * w;
        const sy = (Math.cos(i * 33.1) * 0.5 + 0.5) * h;
        const sr = Math.random() * 2 + 0.6;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bright hypergiant star with diffraction spikes
      const bx = w * 0.45;
      const by = h * 0.35;
      const bStar = ctx.createRadialGradient(bx, by, 1, bx, by, 18);
      bStar.addColorStop(0, '#ffffff');
      bStar.addColorStop(0.3, '#38bdf8');
      bStar.addColorStop(1, 'transparent');
      ctx.fillStyle = bStar;
      ctx.beginPath();
      ctx.arc(bx, by, 18, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  {
    id: 'enemy_cruiser_boss',
    name: 'Nemesis Cruiser Dreadnought',
    category: 'Space Fleet',
    description: 'Flagship enemy battlecruiser armed with quad heavy plasma batteries, reinforced command bridge, and red deflector shielding.',
    badge: 'BOSS CLASS',
    accentColor: '#ef4444',
    generator: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#090506';
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.45;

      // Heavy Battleship Wedge
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.moveTo(cx, cy + h * 0.4);
      ctx.lineTo(cx - w * 0.38, cy - h * 0.3);
      ctx.lineTo(cx - w * 0.15, cy - h * 0.38);
      ctx.lineTo(cx, cy - h * 0.32);
      ctx.lineTo(cx + w * 0.15, cy - h * 0.38);
      ctx.lineTo(cx + w * 0.38, cy - h * 0.3);
      ctx.closePath();
      ctx.fill();

      // Red Menacing Hull Plating
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(cx - w * 0.22, cy - h * 0.15, w * 0.44, h * 0.22);

      // Glowing Red Bridge Visor / Command Reactor
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy - h * 0.05, w * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Quad Heavy Turrets
      ctx.fillStyle = '#f87171';
      ctx.fillRect(cx - w * 0.28, cy + h * 0.05, w * 0.05, h * 0.1);
      ctx.fillRect(cx + w * 0.23, cy + h * 0.05, w * 0.05, h * 0.1);
    },
  },
  {
    id: 'enemy_fps_sentinel',
    name: 'Cyber Sentinel Heavy Assault',
    category: 'Mech & Armor',
    description: 'Autonomous security sentinel with red multi-optic sensor array, Gatling rotary arm, and hardened bunker armor.',
    badge: 'AUTONOMOUS UNIT',
    accentColor: '#f97316',
    generator: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#0d0908';
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.45;

      // Sentinel Head Dome
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.arc(cx, cy, w * 0.26, Math.PI, Math.PI * 2);
      ctx.lineTo(cx + w * 0.24, cy + h * 0.18);
      ctx.lineTo(cx - w * 0.24, cy + h * 0.18);
      ctx.closePath();
      ctx.fill();

      // Cyclopean Red Eye Scanner
      const eyeGrad = ctx.createRadialGradient(cx, cy - h * 0.05, 2, cx, cy - h * 0.05, w * 0.12);
      eyeGrad.addColorStop(0, '#ffffff');
      eyeGrad.addColorStop(0.4, '#ef4444');
      eyeGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = eyeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy - h * 0.05, w * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Industrial Warning Pattern
      ctx.fillStyle = '#f97316';
      ctx.fillRect(cx - w * 0.22, cy + h * 0.06, w * 0.44, h * 0.04);
    },
  },
  {
    id: 'enemy_drone_fighter',
    name: 'Corvid Attack Drone',
    category: 'Space Fleet',
    description: 'High-speed swarm fighter drone featuring razor swept wings, twin pulse lasers, and swarm neural coordination link.',
    badge: 'SWARM UNIT',
    accentColor: '#10b981',
    generator: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#060c0c';
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;

      // Swept Razor Wings
      ctx.fillStyle = '#134e4a';
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.35);
      ctx.lineTo(cx - w * 0.42, cy + h * 0.15);
      ctx.lineTo(cx - w * 0.15, cy + h * 0.1);
      ctx.lineTo(cx, cy + h * 0.3);
      ctx.lineTo(cx + w * 0.15, cy + h * 0.1);
      ctx.lineTo(cx + w * 0.42, cy + h * 0.15);
      ctx.closePath();
      ctx.fill();

      // Central Emerald Core
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(cx, cy - h * 0.05, w * 0.07, h * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    },
  },
];
