import * as THREE from 'three';

/**
 * Procedural Earth Texture Engine
 * Generates self-contained, high-fidelity day, night, and water specular maps
 * entirely in memory using HTML5 Canvas. Zero external CDN dependencies,
 * completely offline-capable and instantaneous.
 */

// Cache textures in module memory so they are only generated once
let cachedDayTexture: THREE.CanvasTexture | null = null;
let cachedNightTexture: THREE.CanvasTexture | null = null;
let cachedWaterTexture: THREE.CanvasTexture | null = null;

/**
 * Generates a realistic high-resolution Earth Day texture with continental landmasses,
 * Greenland ice sheet, Iceland, Iberian peninsula, British Isles, Europe, Africa, and North America.
 */
export function getProceduralDayTexture(): THREE.CanvasTexture {
  if (cachedDayTexture) return cachedDayTexture;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Ocean Base (Deep Atlantic / Arctic / Mediterranean blue gradients)
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#061325'); // Arctic deep blue
  oceanGrad.addColorStop(0.2, '#0c223f');
  oceanGrad.addColorStop(0.5, '#0e2a4e'); // Mid-Atlantic
  oceanGrad.addColorStop(0.7, '#0d2544');
  oceanGrad.addColorStop(1, '#08172c'); // Antarctic deep blue
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle bathymetric ocean ridges
  ctx.strokeStyle = 'rgba(20, 60, 100, 0.25)';
  ctx.lineWidth = 1.5;
  for (let y = 0; y < height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 2. Latitude & Longitude Navigational Grids
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Helper to convert Lat/Lon to Canvas UV coordinates (Equirectangular projection)
  const toUV = (lat: number, lon: number): [number, number] => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [x, y];
  };

  // Helper to draw realistic landmass polygon
  const drawLandmass = (
    coords: [number, number][],
    fillColor: string,
    strokeColor: string = 'rgba(255, 255, 255, 0.2)'
  ) => {
    if (coords.length < 3) return;
    ctx.beginPath();
    const [startX, startY] = toUV(coords[0][0], coords[0][1]);
    ctx.moveTo(startX, startY);
    for (let i = 1; i < coords.length; i++) {
      const [px, py] = toUV(coords[i][0], coords[i][1]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  // 3. CONTINENTS (Realistic geopolitical boundaries for August 12, 2026 Eclipse Path)
  
  // Greenland (Glacial Ice Cap & coastal tundra)
  drawLandmass(
    [
      [83, -30], [82, -20], [80, -18], [76, -19], [70, -22], [65, -35],
      [60, -43], [60, -47], [64, -52], [69, -54], [72, -56], [76, -65],
      [78, -72], [82, -60], [83, -40]
    ],
    '#e2e8f0', // Glacial white
    '#94a3b8'
  );

  // Iceland (Volcanic basalt & highlands)
  drawLandmass(
    [
      [66.5, -23], [66.5, -14], [64.8, -13.5], [63.8, -18], [63.8, -22.5], [65.5, -24.5]
    ],
    '#334155', // Volcanic basalt
    '#059669'
  );

  // Iberian Peninsula (Spain & Portugal - Core totality zone)
  drawLandmass(
    [
      [43.8, -8], [43.6, -3], [42.5, 3.2], [41.2, 1.8], [38.5, 0],
      [36.8, -2], [36.0, -5.5], [37.0, -8.9], [39.0, -9.5], [42.0, -8.8]
    ],
    '#d97706', // Mediterranean summer amber/ochre
    '#b45309'
  );

  // Balearic Islands (Mallorca, Menorca, Ibiza)
  const [mallX, mallY] = toUV(39.6, 2.9);
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(mallX, mallY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Continental Europe & Scandinavia
  drawLandmass(
    [
      [71, 28], [69, 16], [58, 6], [54, 9], [51, 2], [47, -2], [43.5, -1.8],
      [43.5, 7.5], [40, 18], [38, 24], [41, 29], [46, 30], [54, 20], [60, 30], [68, 40]
    ],
    '#15803d', // Summer European vegetation green
    '#166534'
  );

  // British Isles (UK & Ireland)
  drawLandmass(
    [
      [58.6, -3.5], [55.8, -1.9], [51.5, 1.3], [50.0, -5.2], [53.5, -4.5], [55.0, -5.8]
    ],
    '#16a34a',
    '#15803d'
  );

  // North Africa (Morocco, Algeria, Tunisia, Sahara)
  drawLandmass(
    [
      [36, -6], [37, 10], [33, 11], [30, 32], [22, 36], [12, 44],
      [12, 15], [5, 2], [5, -4], [15, -17], [21, -17], [28, -13], [33, -9]
    ],
    '#b45309', // Sahara desert gold
    '#92400e'
  );

  // North America (Eastern Seaboard & Canada)
  drawLandmass(
    [
      [75, -85], [70, -68], [55, -60], [45, -65], [35, -75], [25, -80],
      [28, -96], [40, -90], [50, -95], [60, -110], [70, -120]
    ],
    '#166534',
    '#14532d'
  );

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  cachedDayTexture = texture;
  return texture;
}

/**
 * Generates Earth Night lights texture with glowing urban city clusters across
 * Europe, Iberia, Iceland, UK, and the Atlantic seaboard.
 */
export function getProceduralNightTexture(): THREE.CanvasTexture {
  if (cachedNightTexture) return cachedNightTexture;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Pitch black oceanic night
  ctx.fillStyle = '#020408';
  ctx.fillRect(0, 0, width, height);

  const toUV = (lat: number, lon: number): [number, number] => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [x, y];
  };

  // Major metropolitan illumination centers
  const cities = [
    { name: 'Madrid', lat: 40.41, lon: -3.7, intensity: 12, color: '#fef08a' },
    { name: 'Barcelona', lat: 41.38, lon: 2.17, intensity: 10, color: '#fef08a' },
    { name: 'Valencia', lat: 39.46, lon: -0.37, intensity: 8, color: '#fed7aa' },
    { name: 'Seville', lat: 37.38, lon: -5.98, intensity: 7, color: '#fed7aa' },
    { name: 'Bilbao', lat: 43.26, lon: -2.93, intensity: 7, color: '#fed7aa' },
    { name: 'Palma', lat: 39.56, lon: 2.65, intensity: 6, color: '#fed7aa' },
    { name: 'Reykjavik', lat: 64.14, lon: -21.94, intensity: 8, color: '#bae6fd' },
    { name: 'London', lat: 51.50, lon: -0.12, intensity: 16, color: '#fef08a' },
    { name: 'Paris', lat: 48.85, lon: 2.35, intensity: 15, color: '#fef08a' },
    { name: 'Lisbon', lat: 38.72, lon: -9.13, intensity: 9, color: '#fed7aa' },
    { name: 'New York', lat: 40.71, lon: -74.00, intensity: 18, color: '#fef08a' },
    { name: 'Rome', lat: 41.90, lon: 12.49, intensity: 11, color: '#fed7aa' },
  ];

  cities.forEach((city) => {
    const [cx, cy] = toUV(city.lat, city.lon);
    const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, city.intensity * 2.2);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, city.color);
    grad.addColorStop(0.6, 'rgba(251, 191, 36, 0.35)');
    grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, city.intensity * 2.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Secondary highway and regional town networks
  ctx.fillStyle = 'rgba(253, 224, 71, 0.65)';
  for (let i = 0; i < 900; i++) {
    // Bias random dots towards European/North American landmasses
    const lon = -15 + (Math.random() - 0.5) * 60;
    const lat = 36 + Math.random() * 25;
    const [px, py] = toUV(lat, lon);
    const r = Math.random() * 1.5 + 0.4;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  cachedNightTexture = texture;
  return texture;
}

/**
 * Generates ocean specular mask (White = water / reflective, Black = land / matte)
 */
export function getProceduralWaterTexture(): THREE.CanvasTexture {
  if (cachedWaterTexture) return cachedWaterTexture;

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Default ocean is 100% white specular
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const toUV = (lat: number, lon: number): [number, number] => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [x, y];
  };

  const maskLand = (coords: [number, number][]) => {
    if (coords.length < 3) return;
    ctx.beginPath();
    const [startX, startY] = toUV(coords[0][0], coords[0][1]);
    ctx.moveTo(startX, startY);
    for (let i = 1; i < coords.length; i++) {
      const [px, py] = toUV(coords[i][0], coords[i][1]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#000000'; // Non-reflective land
    ctx.fill();
  };

  // Mask major landmasses
  maskLand([[83, -30], [80, -18], [65, -35], [60, -43], [69, -54], [83, -40]]);
  maskLand([[66.5, -23], [66.5, -14], [63.8, -18], [65.5, -24.5]]);
  maskLand([[43.8, -8], [42.5, 3.2], [36.8, -2], [36.0, -5.5], [42.0, -8.8]]);
  maskLand([[71, 28], [58, 6], [51, 2], [43.5, 7.5], [40, 18], [46, 30], [68, 40]]);
  maskLand([[58.6, -3.5], [51.5, 1.3], [50.0, -5.2], [55.0, -5.8]]);
  maskLand([[36, -6], [37, 10], [22, 36], [12, 15], [15, -17], [33, -9]]);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  cachedWaterTexture = texture;
  return texture;
}
