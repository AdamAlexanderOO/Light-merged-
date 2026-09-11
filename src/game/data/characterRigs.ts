export interface CharacterRig {
  id: string;
  name: string;
  classification: string;
  faction: string;
  heightMeters: number;
  armorType: string;
  primaryWeapon: string;
  secondaryWeapon: string;
  shieldGenerator: string;
  speedMach: number;
  colorScheme: {
    primary: string;
    secondary: string;
    glow: string;
  };
}

export const CHARACTER_RIGS: CharacterRig[] = [
  {
    id: 'valkyrie-gundam',
    name: 'Valkyrie Gundam MK-IV',
    classification: 'High-Mobility Combat Mobile Suit',
    faction: 'Earth Alliance Vanguard',
    heightMeters: 18.5,
    armorType: 'Luna-Titanium Composite + Ceramic Smalti',
    primaryWeapon: 'Twin Beam Saber (10MW Plasma)',
    secondaryWeapon: 'Hyper Gauss Railgun (Sabot 8km/s)',
    shieldGenerator: 'Antimatter Dispersion Field',
    speedMach: 4.8,
    colorScheme: {
      primary: '#1e3a8a',
      secondary: '#f8fafc',
      glow: '#10b981',
    },
  },
  {
    id: 'cyber-mech-titan',
    name: 'Goliath Dreadnought Mech',
    classification: 'Heavy Siege Bipedal Exoskeleton',
    faction: 'Neo-Roman Praetorian Guard',
    heightMeters: 22.0,
    armorType: 'Volcanic Basalt Composite + Tungsten Mesh',
    primaryWeapon: 'Quad 120mm Autocannon',
    secondaryWeapon: 'Thermionic Rocket Pods (x24)',
    shieldGenerator: 'Kinetic Deflector Barrier',
    speedMach: 1.6,
    colorScheme: {
      primary: '#334155',
      secondary: '#eab308',
      glow: '#38bdf8',
    },
  },
  {
    id: 'phantom-corvette',
    name: 'Wraith Stealth Interceptor',
    classification: 'Covert Deep Space Strike Corvette',
    faction: 'Black Fleet Syndicate',
    heightMeters: 38.0,
    armorType: 'Carbon-Nanotube Radar-Absorbent Skin',
    primaryWeapon: 'Twin Tachyon Pulse Lasers',
    secondaryWeapon: 'Quantum Torpedo Bay (x4)',
    shieldGenerator: 'Phase-Cloak Resonator',
    speedMach: 9.2,
    colorScheme: {
      primary: '#1e1b4b',
      secondary: '#312e81',
      glow: '#a855f7',
    },
  },
  {
    id: 'sentinel-assault',
    name: 'Apex Sentinel Drone',
    classification: 'Autonomous Quad-Leg Defense Automaton',
    faction: 'Cyber Imperial Foundry',
    heightMeters: 12.0,
    armorType: 'Reinforced Ceramic Smalti Composite',
    primaryWeapon: 'Heavy Rotary Gatling Cannon',
    secondaryWeapon: 'Microwave Crowd-Control Emitter',
    shieldGenerator: 'Active Faraday Mesh',
    speedMach: 2.2,
    colorScheme: {
      primary: '#292524',
      secondary: '#78716c',
      glow: '#ef4444',
    },
  },
];
