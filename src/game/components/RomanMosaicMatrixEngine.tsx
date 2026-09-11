import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  MosaicTesseraStyle,
  MosaicPalette,
  PictureEffectsConfig,
  TesseraOptions,
  PresetAsset,
} from '../types';
import { GAME_PRESET_ASSETS } from '../data/gameModulesMetadata';
import { soundEffects } from '../utils/soundEffects';
import {
  Sparkles,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  Type,
  Grid,
  Sun,
  Flame,
  Tv,
  Layers,
  Palette,
  Check,
  Eye,
  Camera,
  Copy,
} from 'lucide-react';

const DEFAULT_EFFECTS: PictureEffectsConfig = {
  bloom: 0.5,
  chromaticAberration: 2,
  scanlines: 0.25,
  ancientPatina: 0.2,
  edgeContours: true,
  dither: false,
  brightness: 1.05,
  contrast: 1.15,
  saturation: 1.2,
  lightFusion: true,
  colorShift: 0,
};

const DEFAULT_TESSERA: TesseraOptions = {
  tileSize: 12,
  groutWidth: 2,
  groutColor: '#1a1614',
  jitterAngle: 0.12,
  chippedRoughness: 0.25,
  bevelDepth: 1.1,
  lightAngle: 315,
  subpixelMask: false,
};

// Imperial Roman Palette (authentic stone smalti colors: Pompeian red, Egyptian blue, marble white, volcanic basalt, travertine, imperial gold)
const PALETTES: Record<MosaicPalette, { name: string; colors?: [number, number, number][] }> = {
  truecolor: { name: 'True Color (24-bit RGB)' },
  'imperial-rome': {
    name: 'Imperial Roman Stone',
    colors: [
      [245, 240, 230], // Travertine White
      [160, 40, 40],   // Pompeian Red
      [30, 70, 140],   // Egyptian Blue
      [215, 170, 50],  // Imperial Gold Leaf
      [40, 35, 35],    // Volcanic Basalt
      [190, 110, 70],  // Terracotta
      [120, 130, 110], // Cipollino Marble Green
      [90, 60, 45],    // Burnt Sienna Mortar
    ],
  },
  'cyber-neon': {
    name: 'Cyberpunk 2099',
    colors: [
      [0, 242, 254],   // Neon Cyan
      [236, 72, 153],  // Hot Magenta
      [168, 85, 247],  // Synth Violet
      [250, 204, 21],  // Electric Amber
      [16, 185, 129],  // Emerald Data
      [10, 15, 30],    // Deep Void Navy
      [255, 255, 255], // Laser White
    ],
  },
  gameboy: {
    name: 'GameBoy 4-Color LCD',
    colors: [
      [15, 56, 15],
      [48, 98, 48],
      [139, 172, 15],
      [155, 188, 15],
    ],
  },
  'phosphor-amber': {
    name: 'Amber CRT Terminal',
    colors: [
      [20, 10, 0],
      [90, 45, 0],
      [170, 90, 0],
      [255, 176, 0],
      [255, 220, 100],
    ],
  },
  'solar-corona': {
    name: 'Solar Coronal & H-Alpha',
    colors: [
      [10, 5, 5],
      [120, 20, 20],   // H-Alpha Ruby
      [217, 119, 6],   // Coronal Amber
      [251, 191, 36],  // Chromosphere Gold
      [255, 255, 255], // Core Flare White
    ],
  },
  monochrome: {
    name: 'Monochrome Basalt',
    colors: [
      [15, 15, 15],
      [75, 75, 75],
      [145, 145, 145],
      [215, 215, 215],
      [255, 255, 255],
    ],
  },
};

export const RomanMosaicMatrixEngine: React.FC = () => {
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mosaicCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active States
  const [selectedAsset, setSelectedAsset] = useState<PresetAsset>(GAME_PRESET_ASSETS[0]);
  const [tesseraStyle, setTesseraStyle] = useState<MosaicTesseraStyle>('roman-stone');
  const [palette, setPalette] = useState<MosaicPalette>('imperial-rome');
  const [effects, setEffects] = useState<PictureEffectsConfig>(DEFAULT_EFFECTS);
  const [tessera, setTessera] = useState<TesseraOptions>(DEFAULT_TESSERA);
  const [customText, setCustomText] = useState<string>('ROMA // MECHA-01');
  const [inputMode, setInputMode] = useState<'preset' | 'text-matrix' | 'custom-image'>('preset');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [stats, setStats] = useState({ tileCount: 0, renderTimeMs: 0 });

  // Update a tessera parameter
  const updateTessera = <K extends keyof TesseraOptions>(key: K, val: TesseraOptions[K]) => {
    setTessera((prev) => ({ ...prev, [key]: val }));
    soundEffects.playStoneClick();
  };

  // Update an effect parameter
  const updateEffect = <K extends keyof PictureEffectsConfig>(key: K, val: PictureEffectsConfig[K]) => {
    setEffects((prev) => ({ ...prev, [key]: val }));
  };

  // Color quantization distance helper
  const findClosestColor = useCallback(
    (r: number, g: number, b: number, pal: [number, number, number][]): [number, number, number] => {
      let minDist = Infinity;
      let closest = pal[0];
      for (const [pr, pg, pb] of pal) {
        // Human eye weighted euclidean color difference
        const dist = 0.3 * (r - pr) ** 2 + 0.59 * (g - pg) ** 2 + 0.11 * (b - pb) ** 2;
        if (dist < minDist) {
          minDist = dist;
          closest = [pr, pg, pb];
        }
      }
      return closest;
    },
    []
  );

  // Render Source Canvas based on input mode
  const renderSourceImage = useCallback(() => {
    const sCanvas = sourceCanvasRef.current;
    if (!sCanvas) return;
    const ctx = sCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const w = (sCanvas.width = 640);
    const h = (sCanvas.height = 640);

    if (inputMode === 'preset') {
      selectedAsset.generator(sCanvas);
    } else if (inputMode === 'text-matrix') {
      // User smartphone text-to-pixel / text-matrix renderer
      ctx.fillStyle = '#060910';
      ctx.fillRect(0, 0, w, h);

      // Cyber Matrix Background grid
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x <= w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Golden Roman Medallion Border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, w * 0.42, 0, Math.PI * 2);
      ctx.stroke();

      // Render Central Text Matrix as High-Dynamic glyphs
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Background ambient Roman wreath glyph
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.font = 'bold 180px monospace';
      ctx.fillText('SPQR', w * 0.5, h * 0.38);

      // Primary User Text
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 44px "Courier New", monospace';
      ctx.fillText(customText.toUpperCase(), w * 0.5, h * 0.52);

      // Sub-text decoded telemetry
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('• 64×64 SUBPIXEL GLYPH FORGE •', w * 0.5, h * 0.64);
    }
  }, [inputMode, selectedAsset, customText]);

  // Transform Source Canvas into Roman Mosaic + Post-Processed Picture Effects
  const renderMosaic = useCallback(() => {
    const sCanvas = sourceCanvasRef.current;
    const mCanvas = mosaicCanvasRef.current;
    if (!sCanvas || !mCanvas) return;

    const sCtx = sCanvas.getContext('2d', { willReadFrequently: true });
    const mCtx = mCanvas.getContext('2d');
    if (!sCtx || !mCtx) return;

    const t0 = performance.now();
    const w = sCanvas.width;
    const h = sCanvas.height;
    mCanvas.width = w;
    mCanvas.height = h;

    const srcData = sCtx.getImageData(0, 0, w, h);
    const srcPixels = srcData.data;

    // Fill grout/mortar bed background
    mCtx.fillStyle = tessera.groutColor;
    mCtx.fillRect(0, 0, w, h);

    const size = Math.max(4, tessera.tileSize);
    const grout = Math.max(0, tessera.groutWidth);
    const palConfig = PALETTES[palette];

    let totalTiles = 0;
    const radLight = (tessera.lightAngle * Math.PI) / 180;
    const lx = Math.cos(radLight);
    const ly = Math.sin(radLight);

    // Loop through grid blocks to generate stone tesserae
    for (let y = 0; y < h; y += size) {
      for (let x = 0; x < w; x += size) {
        totalTiles++;

        // Sample center of tile
        const sampX = Math.min(w - 1, Math.floor(x + size * 0.5));
        const sampY = Math.min(h - 1, Math.floor(y + size * 0.5));
        const idx = (sampY * w + sampX) * 4;

        let r = srcPixels[idx];
        let g = srcPixels[idx + 1];
        let b = srcPixels[idx + 2];

        // Apply Brightness & Contrast
        r = Math.min(255, Math.max(0, (r - 128) * effects.contrast + 128 * effects.brightness));
        g = Math.min(255, Math.max(0, (g - 128) * effects.contrast + 128 * effects.brightness));
        b = Math.min(255, Math.max(0, (b - 128) * effects.contrast + 128 * effects.brightness));

        // Color Quantization Palette match if selected
        if (palConfig.colors) {
          [r, g, b] = findClosestColor(r, g, b, palConfig.colors);
        }

        // Calculate tile bounds with grout margin
        const innerW = Math.max(1, size - grout);
        const innerH = Math.max(1, size - grout);
        const tileCx = x + size * 0.5;
        const tileCy = y + size * 0.5;

        mCtx.save();
        mCtx.translate(tileCx, tileCy);

        // Hand-laid Roman stone jitter angle
        if (tessera.jitterAngle > 0) {
          const jitter = (Math.sin(x * 12.9898 + y * 78.233) * tessera.jitterAngle);
          mCtx.rotate(jitter);
        }

        // TESSERA STYLE RENDERING
        if (tesseraStyle === 'roman-stone') {
          // Authentic travertine / marble stone block with chipped rough edges
          mCtx.beginPath();
          const hw = innerW * 0.5;
          const hh = innerH * 0.5;
          const chip = tessera.chippedRoughness * 2;

          mCtx.moveTo(-hw + chip, -hh);
          mCtx.lineTo(hw - chip, -hh);
          mCtx.lineTo(hw, -hh + chip);
          mCtx.lineTo(hw, hh - chip);
          mCtx.lineTo(hw - chip, hh);
          mCtx.lineTo(-hw + chip, hh);
          mCtx.lineTo(-hw, hh - chip);
          mCtx.lineTo(-hw, -hh + chip);
          mCtx.closePath();

          mCtx.fillStyle = `rgb(${r},${g},${b})`;
          mCtx.fill();

          // 3D Bevel & Emboss directional sun light
          if (tessera.bevelDepth > 0) {
            const highlightAlpha = Math.max(0, (lx * -0.5 + ly * -0.5) * 0.35 * tessera.bevelDepth);
            const shadowAlpha = Math.max(0, (lx * 0.5 + ly * 0.5) * 0.4 * tessera.bevelDepth);

            mCtx.strokeStyle = `rgba(255,255,255,${highlightAlpha.toFixed(2)})`;
            mCtx.lineWidth = Math.max(1, size * 0.1);
            mCtx.stroke();

            mCtx.strokeStyle = `rgba(0,0,0,${shadowAlpha.toFixed(2)})`;
            mCtx.stroke();
          }
        } else if (tesseraStyle === 'glass-smalti') {
          // Vitreous Byzantine glass smalti tile with bright surface glint
          const hw = innerW * 0.5;
          const hh = innerH * 0.5;

          mCtx.fillStyle = `rgb(${r},${g},${b})`;
          mCtx.fillRect(-hw, -hh, innerW, innerH);

          // Glass internal refraction bubble / specular glint
          mCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          mCtx.beginPath();
          mCtx.arc(-hw * 0.4, -hh * 0.4, innerW * 0.2, 0, Math.PI * 2);
          mCtx.fill();

          mCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          mCtx.lineWidth = 1;
          mCtx.strokeRect(-hw, -hh, innerW, innerH);
        } else if (tesseraStyle === 'cyber-transistor') {
          // Smartphone subpixel / LED transistor matrix
          const hw = innerW * 0.5;
          const hh = innerH * 0.5;

          // Black bezel housing
          mCtx.fillStyle = '#05070c';
          mCtx.fillRect(-hw, -hh, innerW, innerH);

          // RGB Subpixel vertical triad stripes
          const subW = innerW / 3;
          mCtx.fillStyle = `rgb(${r}, 0, 0)`;
          mCtx.fillRect(-hw, -hh + 1, subW - 0.5, innerH - 2);

          mCtx.fillStyle = `rgb(0, ${g}, 0)`;
          mCtx.fillRect(-hw + subW, -hh + 1, subW - 0.5, innerH - 2);

          mCtx.fillStyle = `rgb(0, 0, ${b})`;
          mCtx.fillRect(-hw + subW * 2, -hh + 1, subW - 0.5, innerH - 2);
        } else if (tesseraStyle === 'gold-leaf') {
          // Gold Leaf Tesserae (Cathedral of Ravenna Byzantine Style)
          const hw = innerW * 0.5;
          const hh = innerH * 0.5;
          const gTintR = Math.min(255, r * 0.6 + 215 * 0.4);
          const gTintG = Math.min(255, g * 0.6 + 175 * 0.4);
          const gTintB = Math.min(255, b * 0.4 + 40 * 0.6);

          mCtx.fillStyle = `rgb(${Math.round(gTintR)},${Math.round(gTintG)},${Math.round(gTintB)})`;
          mCtx.fillRect(-hw, -hh, innerW, innerH);

          mCtx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
          mCtx.lineWidth = 1.2;
          mCtx.strokeRect(-hw, -hh, innerW, innerH);
        } else {
          // Ceramic glazed tile
          const hw = innerW * 0.5;
          const hh = innerH * 0.5;
          mCtx.fillStyle = `rgb(${r},${g},${b})`;
          mCtx.beginPath();
          if ('roundRect' in mCtx && typeof (mCtx as unknown as { roundRect?: unknown }).roundRect === 'function') {
            (mCtx as unknown as { roundRect: (x: number, y: number, w: number, h: number, r: number[]) => void }).roundRect(-hw, -hh, innerW, innerH, [2]);
          } else {
            mCtx.rect(-hw, -hh, innerW, innerH);
          }
          mCtx.fill();
        }

        mCtx.restore();
      }
    }

    // POST-PROCESSING PICTURE EFFECTS PIPELINE
    // 1. Edge Contours (Sobel Roman Silhouette Lines)
    if (effects.edgeContours) {
      mCtx.save();
      mCtx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      mCtx.lineWidth = 1.5;
      for (let y = 0; y < h - size; y += size) {
        for (let x = 0; x < w - size; x += size) {
          const i1 = (y * w + x) * 4;
          const i2 = (y * w + (x + size)) * 4;
          const diff = Math.abs(srcPixels[i1] - srcPixels[i2]) + Math.abs(srcPixels[i1 + 1] - srcPixels[i2 + 1]);
          if (diff > 90) {
            mCtx.beginPath();
            mCtx.moveTo(x + size, y);
            mCtx.lineTo(x + size, y + size);
            mCtx.stroke();
          }
        }
      }
      mCtx.restore();
    }

    // 2. Retro CRT Scanlines
    if (effects.scanlines > 0) {
      mCtx.save();
      mCtx.fillStyle = `rgba(0, 0, 0, ${effects.scanlines * 0.45})`;
      for (let y = 0; y < h; y += 4) {
        mCtx.fillRect(0, y, w, 1.5);
      }
      mCtx.restore();
    }

    // 3. Ancient Archaeological Patina / Terracotta Wash
    if (effects.ancientPatina > 0) {
      mCtx.save();
      mCtx.fillStyle = `rgba(180, 120, 60, ${effects.ancientPatina * 0.25})`;
      mCtx.fillRect(0, 0, w, h);

      // Weathering cracks
      mCtx.strokeStyle = `rgba(80, 50, 20, ${effects.ancientPatina * 0.3})`;
      mCtx.lineWidth = 1;
      mCtx.beginPath();
      mCtx.moveTo(w * 0.15, 0);
      mCtx.lineTo(w * 0.25, h * 0.35);
      mCtx.lineTo(w * 0.22, h * 0.6);
      mCtx.stroke();
      mCtx.restore();
    }

    // 4. Light Fusion & Bloom Glow
    if (effects.lightFusion && effects.bloom > 0) {
      mCtx.save();
      mCtx.globalCompositeOperation = 'screen';
      mCtx.filter = `blur(${Math.round(effects.bloom * 12)}px)`;
      mCtx.drawImage(mCanvas, 0, 0);
      mCtx.restore();
    }

    // 5. Chromatic Aberration (RGB Channel Shift)
    if (effects.chromaticAberration > 0) {
      mCtx.save();
      mCtx.globalCompositeOperation = 'lighter';
      mCtx.drawImage(mCanvas, effects.chromaticAberration, 0);
      mCtx.restore();
    }

    const t1 = performance.now();
    setStats({
      tileCount: totalTiles,
      renderTimeMs: Math.round(t1 - t0),
    });
  }, [tessera, effects, palette, tesseraStyle, findClosestColor]);

  // Lifecycle
  useEffect(() => {
    renderSourceImage();
  }, [renderSourceImage]);

  useEffect(() => {
    renderMosaic();
  }, [renderMosaic]);

  // Handle custom image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const sCanvas = sourceCanvasRef.current;
        if (!sCanvas) return;
        const ctx = sCanvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, sCanvas.width, sCanvas.height);
        ctx.drawImage(img, 0, 0, sCanvas.width, sCanvas.height);
        setInputMode('custom-image');
        renderMosaic();
        soundEffects.playWarpCharge();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Export High-Res PNG
  const handleExportPNG = () => {
    const mCanvas = mosaicCanvasRef.current;
    if (!mCanvas) return;
    soundEffects.playWarpCharge();
    const link = document.createElement('a');
    link.download = `roman_mosaic_forge_${Date.now()}.png`;
    link.href = mCanvas.toDataURL('image/png');
    link.click();
  };

  // Copy text/pixel matrix string (phone text representation!)
  const handleCopyTextCode = () => {
    const code = `// ROMAN MOSAIC GLYPH MATRIX: ${customText}\n// TILES: ${stats.tileCount} | STYLE: ${tesseraStyle}\n// ENCODED FOR PHONE DISPLAY INTERPRETER`;
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    soundEffects.playPixelChime(1000);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050811] text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Banner Toolbar */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-cyan-500/20 bg-black/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
              <span>Pixel Canvas Engine • Mosaic Forge</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ACTIVE V4.8
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Roman Stone Tesserae • Subpixel Phone Matrix • Real-time Picture Effects
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyTextCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-slate-200 rounded border border-white/10 transition-all"
            title="Copy Text-to-Pixel Matrix Code"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden md:inline">{isCopied ? 'Copied' : 'Copy Text-Pixel Code'}</span>
          </button>

          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-black rounded hover:from-cyan-400 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)]"
          >
            <Download className="w-4 h-4" />
            <span>Export Mosaic</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout: 3 Columns (Presets, Canvas Stage, Forge Controls) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left Sidebar: Presets & Input Modalities */}
        <aside className="w-full lg:w-64 border-r border-white/10 bg-black/40 flex flex-col shrink-0 overflow-y-auto no-scrollbar p-3 space-y-3">
          {/* Input Mode Selector */}
          <div className="bg-[#0b101d] p-1 rounded-lg border border-white/10 flex gap-1">
            <button
              onClick={() => {
                setInputMode('preset');
                soundEffects.playStoneClick();
              }}
              className={`flex-1 py-1.5 text-[11px] font-mono font-bold rounded transition-all ${
                inputMode === 'preset'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PRESETS
            </button>
            <button
              onClick={() => {
                setInputMode('text-matrix');
                soundEffects.playStoneClick();
              }}
              className={`flex-1 py-1.5 text-[11px] font-mono font-bold rounded transition-all ${
                inputMode === 'text-matrix'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TEXT MATRIX
            </button>
          </div>

          {/* Text-to-Mosaic Matrix Input (When text mode is active) */}
          {inputMode === 'text-matrix' && (
            <div className="bg-[#0b101d] p-3 rounded-lg border border-amber-500/30 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                <Type className="w-3.5 h-3.5" />
                <span>Text-to-Pixel Interpreter</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Decodes alphanumeric strings into phone subpixel / Roman stone tile mosaics.
              </p>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                maxLength={24}
                className="w-full px-2.5 py-1.5 bg-black/60 border border-amber-500/40 rounded text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                placeholder="Type word or SPQR code..."
              />
            </div>
          )}

          {/* Custom File Upload */}
          <label className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 text-xs font-mono cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>Upload Photo / Sprite</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Preset Assets Roster */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
              Asset Roster ({GAME_PRESET_ASSETS.length})
            </div>
            {GAME_PRESET_ASSETS.map((asset) => {
              const isSel = inputMode === 'preset' && selectedAsset.id === asset.id;
              return (
                <button
                  key={asset.id}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setInputMode('preset');
                    soundEffects.playStoneClick();
                  }}
                  className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between ${
                    isSel
                      ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,242,254,0.2)]'
                      : 'bg-[#080d1a]/80 border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold font-mono truncate">{asset.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{asset.category}</div>
                  </div>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0"
                    style={{ backgroundColor: `${asset.accentColor}25`, color: asset.accentColor }}
                  >
                    {asset.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center: Live Mosaic Canvas Display */}
        <main className="flex-1 relative flex flex-col items-center justify-center p-3 sm:p-6 bg-[#04060c] overflow-hidden">
          {/* Source Canvas (Off-screen / reference) */}
          <canvas ref={sourceCanvasRef} className="hidden" />

          {/* Main Mosaic Forge Output Canvas */}
          <div className="relative max-w-full max-h-full flex items-center justify-center rounded-xl overflow-hidden border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(0,242,254,0.15)] bg-black">
            <canvas
              ref={mosaicCanvasRef}
              className="max-w-full max-h-[70vh] sm:max-h-[78vh] object-contain cursor-crosshair transition-transform"
            />

            {/* Live Stats Overlay Badge */}
            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-cyan-500/30 text-[10px] font-mono text-cyan-300 flex items-center gap-3">
              <span>TILES: {stats.tileCount.toLocaleString()}</span>
              <span>RENDER: {stats.renderTimeMs}ms</span>
              <span className="text-amber-400 uppercase">{tesseraStyle.replace('-', ' ')}</span>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Mosaic Tesserae & Picture Effects Controls */}
        <aside className="w-full lg:w-80 border-l border-white/10 bg-black/50 flex flex-col shrink-0 overflow-y-auto no-scrollbar p-4 space-y-4">
          {/* Section 1: Tessera Style & Material */}
          <div className="space-y-2.5 bg-[#090e1c] p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 uppercase">
              <Grid className="w-3.5 h-3.5" />
              <span>Tessera Material & Cut</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'roman-stone', label: 'Roman Stone' },
                  { id: 'glass-smalti', label: 'Glass Smalti' },
                  { id: 'cyber-transistor', label: 'Subpixel LED' },
                  { id: 'gold-leaf', label: 'Byzantine Gold' },
                  { id: 'ceramic-tile', label: 'Glazed Ceramic' },
                ] as const
              ).map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setTesseraStyle(style.id);
                    soundEffects.playStoneClick();
                  }}
                  className={`px-2 py-1.5 rounded text-[11px] font-mono font-bold border transition-all text-left truncate ${
                    tesseraStyle === style.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                      : 'bg-white/5 text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>

            {/* Tile Size Slider */}
            <div className="pt-2">
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                <span>Tessera Cube Size</span>
                <span className="text-cyan-400 font-bold">{tessera.tileSize}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="36"
                step="1"
                value={tessera.tileSize}
                onChange={(e) => updateTessera('tileSize', parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            {/* Mortar Grout Width */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                <span>Mortar Grout Width</span>
                <span className="text-amber-400 font-bold">{tessera.groutWidth}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={tessera.groutWidth}
                onChange={(e) => updateTessera('groutWidth', parseInt(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            {/* Hand-laid Jitter */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                <span>Hand-laid Stone Jitter</span>
                <span className="text-emerald-400 font-bold">{Math.round(tessera.jitterAngle * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.02"
                value={tessera.jitterAngle}
                onChange={(e) => updateTessera('jitterAngle', parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Section 2: Color Palette Quantization */}
          <div className="space-y-2.5 bg-[#090e1c] p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 uppercase">
              <Palette className="w-3.5 h-3.5" />
              <span>Color Quantization Palette</span>
            </div>

            <div className="space-y-1">
              {(Object.keys(PALETTES) as MosaicPalette[]).map((palKey) => (
                <button
                  key={palKey}
                  onClick={() => {
                    setPalette(palKey);
                    soundEffects.playPixelChime(660);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded text-xs font-mono flex items-center justify-between border transition-all ${
                    palette === palKey
                      ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400'
                      : 'bg-white/5 text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  <span>{PALETTES[palKey].name}</span>
                  {palette === palKey && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Picture Effects Suite */}
          <div className="space-y-2.5 bg-[#090e1c] p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-300 uppercase">
              <Sliders className="w-3.5 h-3.5" />
              <span>Picture Effects Suite</span>
            </div>

            {/* Bloom / Light Fusion */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                <span>Light Fusion Bloom</span>
                <span className="text-pink-400 font-bold">{effects.bloom.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={effects.bloom}
                onChange={(e) => updateEffect('bloom', parseFloat(e.target.value))}
                className="w-full accent-pink-400 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            {/* CRT Scanlines */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                <span>CRT Scanline Mesh</span>
                <span className="text-cyan-400 font-bold">{Math.round(effects.scanlines * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={effects.scanlines}
                onChange={(e) => updateEffect('scanlines', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            {/* Ancient Roman Patina */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                <span>Ancient Patina & Weathering</span>
                <span className="text-amber-400 font-bold">{Math.round(effects.ancientPatina * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={effects.ancientPatina}
                onChange={(e) => updateEffect('ancientPatina', parseFloat(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            {/* Chromatic Aberration */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                <span>Chromatic Aberration (RGB Shift)</span>
                <span className="text-purple-400 font-bold">{effects.chromaticAberration}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={effects.chromaticAberration}
                onChange={(e) => updateEffect('chromaticAberration', parseInt(e.target.value))}
                className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={effects.edgeContours}
                  onChange={(e) => updateEffect('edgeContours', e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Sobel Contours</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={effects.lightFusion}
                  onChange={(e) => updateEffect('lightFusion', e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Light Fusion</span>
              </label>
            </div>
          </div>

          {/* Reset All Controls */}
          <button
            onClick={() => {
              setEffects(DEFAULT_EFFECTS);
              setTessera(DEFAULT_TESSERA);
              setPalette('imperial-rome');
              setTesseraStyle('roman-stone');
              soundEffects.playPixelChime(440);
            }}
            className="w-full py-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-xs font-mono text-slate-300 flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Forge Optics & Tesserae</span>
          </button>
        </aside>
      </div>
    </div>
  );
};
