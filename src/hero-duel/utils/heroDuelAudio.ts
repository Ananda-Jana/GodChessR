/**
 * Synthesized Web Audio API sound & haptic engine for Hero Duel.
 * Zero external audio assets, zero blocking in click handlers.
 */

class HeroDuelAudioEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    if (this.isUnlocked) return;
    const ctx = this.getContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          this.isUnlocked = true;
        }).catch(() => {});
      } else {
        this.isUnlocked = true;
      }
    }
  }

  /**
   * Short wood-tap "thock" on piece moves:
   * Quick low-frequency pulse with rapid exponential decay and subtle filtered snap.
   */
  public playMoveThock(): void {
    try {
      this.triggerHaptic(15);
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(100, t + 0.045);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.045);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch {
      // Ignore audio synthesis errors on strict platforms
    }
  }

  /**
   * Distinct whoosh/impact sound per ability activation:
   * Swept noise whoosh transitioning into a deep punchy impact burst.
   */
  public playAbilityWhoosh(): void {
    try {
      this.triggerHaptic(20);
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 1. Low punch
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.22);
      oscGain.gain.setValueAtTime(0.65, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.23);

      // 2. Whoosh / Air sweep
      const bufferSize = ctx.sampleRate * 0.18;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, t);
      filter.frequency.exponentialRampToValueAtTime(1800, t + 0.09);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.18);
      filter.Q.setValueAtTime(2.5, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      whiteNoise.start(t);
      whiteNoise.stop(t + 0.19);
    } catch {}
  }

  /**
   * Rising chime when a shrine is acquired:
   * Four melodic bell-like sine harmonics (C5, E5, G5, C6).
   */
  public playShrineAcquired(): void {
    try {
      this.triggerHaptic(18);
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const noteStart = t + idx * 0.065;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.3, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.3);
      });
    } catch {}
  }

  /**
   * Soft tick each second while holding shrine:
   * Ultra-short 1.6kHz wood clock click.
   */
  public playShrineHoldTick(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.015);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.018);
    } catch {}
  }

  /**
   * Urgent high-pitch double tick when 5 or fewer seconds remain on shrine countdown
   */
  public playWarningTick(): void {
    try {
      this.triggerHaptic(20);
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // Two quick clicks: "tic-tic"
      [0, 0.07].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(2400, t + delay);
        osc.frequency.exponentialRampToValueAtTime(1200, t + delay + 0.025);

        gain.gain.setValueAtTime(0.22, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.025);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.03);
      });
    } catch {}
  }

  /**
   * Feature-checked tactile vibration (10-20ms)
   */
  public triggerHaptic(durationMs = 15): void {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(Math.min(20, Math.max(10, durationMs)));
      }
    } catch {}
  }
}

export const heroDuelAudio = new HeroDuelAudioEngine();
