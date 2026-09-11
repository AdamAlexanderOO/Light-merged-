/**
 * Tactical Web Audio Synthesizer Engine
 * Generates procedural astronomical audio environments, contact alert chimes,
 * and totality atmospheric soundscapes using native Web Audio API oscillators.
 * Zero external audio files, completely self-contained.
 */

class TacticalAudioDeck {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private isInitialized: boolean = false;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Start gentle celestial background ambient drone (65 Hz fundamental)
      this.startAmbientDrone();
      this.isInitialized = true;
    } catch {
      // AudioContext blocked or unsupported in current environment
    }
  }

  private startAmbientDrone() {
    if (!this.ctx || !this.masterGain) return;

    try {
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, this.ctx.currentTime);

      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(65.41, this.ctx.currentTime); // C2

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(98.0, this.ctx.currentTime); // G2

      this.droneOsc1.connect(filter);
      this.droneOsc2.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();
    } catch {
      // Ignore background oscillator failure
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.4, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Harmonic alert chime for Totality onset (C#5 - G#5 harmonic fifths)
   */
  public playTotalityAlert() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const notes = [554.37, 830.61, 1108.73]; // C#5, G#5, C#6

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 2.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 2.4);
    });
  }

  /**
   * Subtle high-frequency UI radar click/chirp
   */
  public playChirp(freq: number = 880) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.06);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }
}

export const audioDeck = new TacticalAudioDeck();
