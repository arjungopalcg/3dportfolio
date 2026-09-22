/**
 * A small procedurally generated ambient soundscape (warm detuned pad + filtered wind),
 * built entirely from oscillators/noise buffers so no external audio assets are needed.
 * Must be started from within a user gesture (browser autoplay policy) — call
 * setAmbientMuted from a click handler, not a passive effect.
 */
let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let started = false;

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

function ensureContext(): AudioContext {
  if (ctx) return ctx;
  const w = window as WindowWithWebkitAudio;
  const AC = window.AudioContext ?? w.webkitAudioContext;
  ctx = new AC();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(ctx.destination);
  return ctx;
}

function buildPad(c: AudioContext, dest: AudioNode) {
  const freqs = [130.81, 196.0, 261.63]; // C3, G3, C4 — a soft open chord
  const padGain = c.createGain();
  padGain.gain.value = 0.16;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  padGain.connect(filter);
  filter.connect(dest);

  freqs.forEach((f, i) => {
    const osc = c.createOscillator();
    osc.type = i === 2 ? "triangle" : "sine";
    osc.frequency.value = f;

    const detuneLFO = c.createOscillator();
    detuneLFO.frequency.value = 0.05 + i * 0.02;
    const detuneGain = c.createGain();
    detuneGain.gain.value = 4;
    detuneLFO.connect(detuneGain);
    detuneGain.connect(osc.detune);
    detuneLFO.start();

    const voiceGain = c.createGain();
    voiceGain.gain.value = i === 0 ? 0.6 : 0.32;
    osc.connect(voiceGain);
    voiceGain.connect(padGain);
    osc.start();
  });

  const swell = c.createOscillator();
  swell.frequency.value = 0.045;
  const swellGain = c.createGain();
  swellGain.gain.value = 0.05;
  swell.connect(swellGain);
  swellGain.connect(padGain.gain);
  swell.start();
}

function buildWind(c: AudioContext, dest: AudioNode) {
  const bufferSize = 2 * c.sampleRate;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = c.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 500;
  filter.Q.value = 0.6;

  const windGain = c.createGain();
  windGain.gain.value = 0.05;

  noise.connect(filter);
  filter.connect(windGain);
  windGain.connect(dest);
  noise.start();

  const lfo = c.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 300;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
}

/** Call synchronously from a click handler — browsers require the audio context to start within a user gesture. */
export function setAmbientMuted(muted: boolean) {
  const c = ensureContext();
  if (!started) {
    buildPad(c, masterGain!);
    buildWind(c, masterGain!);
    started = true;
  }
  if (c.state === "suspended") void c.resume();
  masterGain!.gain.setTargetAtTime(muted ? 0 : 1, c.currentTime, 1.2);
}
