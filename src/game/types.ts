export type MosaicTesseraStyle =
  | 'roman-stone'
  | 'glass-smalti'
  | 'cyber-transistor'
  | 'ceramic-tile'
  | 'gold-leaf';

export type MosaicPalette =
  | 'truecolor'
  | 'imperial-rome'
  | 'cyber-neon'
  | 'gameboy'
  | 'phosphor-amber'
  | 'solar-corona'
  | 'monochrome';

export interface PictureEffectsConfig {
  bloom: number; // 0 to 2
  chromaticAberration: number; // 0 to 10px
  scanlines: number; // 0 to 1
  ancientPatina: number; // 0 to 1 (weathering crackle/sepia)
  edgeContours: boolean; // Sobel silhouette lines
  dither: boolean; // Matrix/Floyd-Steinberg error diffusion
  brightness: number; // 0.5 to 2.0
  contrast: number; // 0.5 to 2.0
  saturation: number; // 0 to 2.0
  lightFusion: boolean; // HDR Coronal flare enhancement
  colorShift: number; // 0 to 360 deg
}

export interface TesseraOptions {
  tileSize: number; // 4 to 48 px
  groutWidth: number; // 0 to 8 px
  groutColor: string; // Hex color
  jitterAngle: number; // 0 to 0.5 rad (hand-laid stone randomness)
  chippedRoughness: number; // 0 to 1
  bevelDepth: number; // 0 to 2 (3D emboss lighting)
  lightAngle: number; // 0 to 360 degrees
  subpixelMask: boolean; // phone screen subpixel stripe effect
}

export interface PresetAsset {
  id: string;
  name: string;
  category: 'Mech & Armor' | 'Weapons & Gear' | 'Space Fleet' | 'Roman & Cyber';
  description: string;
  badge: string;
  accentColor: string;
  generator: (canvas: HTMLCanvasElement) => void;
}

export type ActiveStudioView =
  | 'tactical-hud'
  | 'mosaic-forge'
  | 'text-matrix'
  | 'character-rigs'
  | 'pixel-arcade'
  | 'space-dogfight'
  | 'light-pcb';
