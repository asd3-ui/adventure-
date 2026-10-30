/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Procedural Web Audio API Sound Synthesizer & Dynamic Background Music Engine.
 * Zero external audio assets required. Completely synthesizes footsteps, heartbeats,
 * item pickups, monster alert growls, victory fanfares, and multi-layered dynamic BGM.
 */

// Musical scale presets for each level environment
const MOOD_SCALES: Record<string, number[]> = {
  ancient: [55.0, 73.42, 82.41, 110.0, 146.83, 164.81, 220.0], // D Minor
  magma: [46.25, 61.74, 69.3, 92.5, 123.47, 138.59, 185.0], // F# Phrygian / Heavy Lows
  toxic: [51.91, 65.41, 77.78, 103.83, 130.81, 155.56, 207.65], // G# Locrian eerie detuned
  frozen: [65.41, 87.31, 98.0, 130.81, 174.61, 196.0, 261.63], // C Aeolian Crystalline Highs
  void: [58.27, 77.78, 92.5, 116.54, 155.56, 185.0, 233.08], // Bb Suspended Cosmic
  sunken: [55.0, 65.41, 82.41, 110.0, 130.81, 164.81, 220.0], // D Abyssal Depth
  inferno: [43.65, 58.27, 65.41, 87.31, 116.54, 130.81, 174.61], // F Furious Hellfire
  crystal: [65.41, 82.41, 98.0, 130.81, 164.81, 196.0, 261.63], // C Major Lydian Resonant
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Ambient Drone
  private droneOscA: OscillatorNode | null = null;
  private droneOscB: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;

  // Background Music Sequencer
  private bgmGain: GainNode | null = null;
  private bgmIntervalId: number | null = null;
  private currentMood: string = "ancient";
  private tensionRatio: number = 0; // 0 = safe, 1 = max threat
  private stepCounter: number = 0;

  constructor() {
    // AudioContext will initialize on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ctx) {
      if (this.isMuted) {
        if (this.droneGain) {
          this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
        if (this.bgmGain) {
          this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
      } else {
        if (this.droneGain) {
          this.droneGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        }
        if (this.bgmGain) {
          this.bgmGain.gain.setValueAtTime(0.09, this.ctx.currentTime);
        }
      }
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Starts multi-layered procedural Background Music (BGM)
   */
  public startBGM(mood: string = "ancient") {
    this.currentMood = mood;
    if (this.isMuted) return;

    try {
      this.initCtx();
      if (!this.ctx) return;

      this.stopBGM();

      // Master BGM Gain
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
      masterGain.connect(this.ctx.destination);
      this.bgmGain = masterGain;

      // 1. Dual Ambient Drone Sub-layer
      const oscA = this.ctx.createOscillator();
      const oscB = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);
      filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

      const baseFreq = MOOD_SCALES[mood]?.[0] || 55.0;
      oscA.type = "sawtooth";
      oscA.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

      oscB.type = "triangle";
      oscB.frequency.setValueAtTime(baseFreq * 1.006, this.ctx.currentTime); // subtle chorus detune

      oscA.connect(filter);
      oscB.connect(filter);
      filter.connect(masterGain);

      oscA.start();
      oscB.start();

      this.droneOscA = oscA;
      this.droneOscB = oscB;
      this.droneFilter = filter;

      // 2. Dynamic Procedural Melody Sequencer Loop
      const stepTimeMs = 380; // tempo
      this.stepCounter = 0;

      this.bgmIntervalId = window.setInterval(() => {
        this.tickBGMStep();
      }, stepTimeMs);
    } catch {
      // Audio fallback
    }
  }

  /**
   * One step of the procedural musical arpeggiator
   */
  private tickBGMStep() {
    if (!this.ctx || this.isMuted || !this.bgmGain) return;

    const scale = MOOD_SCALES[this.currentMood] || MOOD_SCALES["ancient"];
    this.stepCounter++;

    const now = this.ctx.currentTime;

    // Filter sweep breath on drone
    if (this.droneFilter) {
      const targetFreq = 110 + Math.sin(this.stepCounter * 0.25) * 50 + this.tensionRatio * 200;
      this.droneFilter.frequency.setTargetAtTime(targetFreq, now, 0.2);
    }

    // Melodic notes triggered rhythmically
    const isMajorBeat = this.stepCounter % 4 === 0;
    const isOffBeat = this.stepCounter % 2 === 1;

    // Higher tension plays faster and more disquieting intervals
    const playNote = isMajorBeat || (this.tensionRatio > 0.4 && isOffBeat) || (this.tensionRatio > 0.75);

    if (playNote) {
      try {
        const noteIdx = Math.floor(Math.random() * scale.length);
        const freq = scale[noteIdx];

        const noteOsc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // High tension switches to harsher wave for suspense
        noteOsc.type = this.tensionRatio > 0.6 ? "sawtooth" : "triangle";
        noteOsc.frequency.setValueAtTime(freq * (this.tensionRatio > 0.7 ? 2 : 1), now);

        const noteVol = (isMajorBeat ? 0.08 : 0.04) * (1 + this.tensionRatio * 0.5);
        noteGain.gain.setValueAtTime(noteVol, now);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        noteOsc.connect(noteGain);
        noteGain.connect(this.bgmGain);

        noteOsc.start(now);
        noteOsc.stop(now + 0.48);
      } catch {
        // ignore note failure
      }
    }

    // High tension sub-pulse (heartbeat/war-drum beat)
    if (this.tensionRatio > 0.35 && this.stepCounter % 2 === 0) {
      try {
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();

        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(55, now);
        subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.15);

        subGain.gain.setValueAtTime(0.12 * this.tensionRatio, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        subOsc.connect(subGain);
        subGain.connect(this.bgmGain);

        subOsc.start(now);
        subOsc.stop(now + 0.18);
      } catch {
        // ignore
      }
    }
  }

  /**
   * Updates BGM dynamic tension based on beast proximity
   * @param enemyDist distance in grid tiles/meters
   */
  public updateBGMTension(enemyDist: number) {
    // 0 when distance > 10, ramps up to 1.0 when distance < 2.0
    const ratio = Math.max(0, Math.min(1, (10 - enemyDist) / 8));
    this.tensionRatio = ratio;
  }

  public setLevelMood(mood: string) {
    if (this.currentMood !== mood) {
      this.currentMood = mood;
      if (this.droneOscA && this.ctx) {
        const baseFreq = MOOD_SCALES[mood]?.[0] || 55.0;
        this.droneOscA.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.3);
        if (this.droneOscB) {
          this.droneOscB.frequency.setTargetAtTime(baseFreq * 1.006, this.ctx.currentTime, 0.3);
        }
      }
    }
  }

  public stopBGM() {
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    if (this.droneOscA) {
      try {
        this.droneOscA.stop();
        this.droneOscA.disconnect();
      } catch {
        // ignore
      }
      this.droneOscA = null;
    }
    if (this.droneOscB) {
      try {
        this.droneOscB.stop();
        this.droneOscB.disconnect();
      } catch {
        // ignore
      }
      this.droneOscB = null;
    }
    if (this.bgmGain) {
      try {
        this.bgmGain.disconnect();
      } catch {
        // ignore
      }
      this.bgmGain = null;
    }
  }

  // Legacy alias
  public startAtmosphere() {
    this.startBGM("ancient");
  }

  public playHeartbeat() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(65, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {
      // ignore
    }
  }

  public playFootstep() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch {
      // ignore
    }
  }

  public playKeyCollect() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const freqs = [659.25, 880.0, 1174.66, 1318.51, 1567.98];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        const startTime = this.ctx.currentTime + idx * 0.05;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.22, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch {
      // ignore
    }
  }

  public playAlert() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.46);
    } catch {
      // ignore
    }
  }

  public playVictory() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        const startTime = this.ctx.currentTime + idx * 0.1;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();
