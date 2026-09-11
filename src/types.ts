export interface LatLon {
  lat: number;
  lon: number;
}

export interface EclipseTimeWindow {
  startPartial: string; // UTC HH:MM:SS
  startTotality: string; // UTC HH:MM:SS
  peakTotality: string; // UTC HH:MM:SS
  endTotality: string; // UTC HH:MM:SS
  endPartial: string; // UTC HH:MM:SS
  durationSeconds: number; // Duration of totality in seconds
}

export interface ObservationStation {
  id: string;
  name: string;
  country: 'Greenland' | 'Iceland' | 'Spain' | 'Ocean' | 'Custom';
  countryCode: 'GL' | 'IS' | 'ES' | 'INTL' | 'CUSTOM';
  coords: LatLon;
  elevationMeters?: number;
  description: string;
  weatherProspects: string;
  eclipseTimes: EclipseTimeWindow;
  maxSunAltitude: number; // Degrees at peak
  isCustom?: boolean;
}

export interface EclipseMilestone {
  id: string;
  timeUTC: string; // HH:MM:SS
  timeSeconds: number; // Seconds since midnight UTC
  title: string;
  country: 'Greenland' | 'Iceland' | 'Spain' | 'Global';
  description: string;
  targetCoords?: LatLon;
  stationId?: string;
}

export interface SimulationState {
  currentTimestamp: number; // Seconds since midnight Aug 12, 2026 UTC
  isPlaying: boolean;
  speedMultiplier: number; // 1, 5, 20, 60, 300, 600, 1800
  selectedStationId: string;
  customStation: ObservationStation | null;
  cameraMode: 'free' | 'follow-shadow' | 'focused-station' | 'top-down' | 'spain-fixed';
  showPathLine: boolean;
  showPenumbra: boolean;
  showDayNightTerminator: boolean;
  showCelestialIcons?: boolean;
  showSkyView: boolean;
}

export interface TelemetryReadout {
  obscurationPercentage: number; // 0 to 100
  sunAltitudeDegrees: number;
  currentPhase: 'No Eclipse' | 'Partial (Ingress)' | 'Diamond Ring!' | 'TOTALITY!' | 'Partial (Egress)' | 'Sunset During Eclipse';
  timeToNextPhase: string;
  distanceToUmbraKm: number;
}

export type VisionMode = 'optical' | 'light-fusion' | 'infrared' | 'sdo-uv' | 'tactical';

export interface OpticsConfig {
  lightFusionBoost: number; // 0.0 - 3.0 (default 1.5)
  coronaBloom: number; // 0.0 - 3.0 (default 1.6)
  rayleighScattering: number; // 0.0 - 2.5 (default 1.2)
  sunsetGlow: number; // 0.0 - 2.0 (default 1.0)
  oceanSpecular: number; // 0.0 - 2.0 (default 1.2)
  nightLights: number; // 0.5 - 4.0 (default 1.8)
  solarWindFlux: number; // 0 - 800 (default 350)
  tacticalGrid: number; // 0.0 - 1.0 (default 0.7)
  diffractionSpikes: boolean;
  plasmaLoops: boolean;
}

export interface CombatDeckTelemetry {
  umbraSpeedKmh: number;
  machNumber: number;
  solarFluxSfu: number;
  solarWindSpeedKmS: number;
  geomagneticKp: number;
  interceptStatus: 'STANDBY' | 'APPROACH' | 'LOCK' | 'EGRESS';
}

export interface CountryTimeInfo {
  country: string;
  code: string;
  timezoneName: string;
  utcOffsetHours: number;
  localTimeFormatted: string;
  isEclipseActiveNow: boolean;
  isTotalityNow: boolean;
  flagEmoji: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'oracle';
  text: string;
  timestamp: string;
}
