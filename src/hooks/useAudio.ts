import { useCallback, useEffect, useRef } from "react";
import { AUDIO_PRESETS, type SoundName } from "../assets/audioPresets";

export function useAudio(muted: boolean, volume: number) {
  const contextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const ensureContext = useCallback(() => {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!contextRef.current) {
      const context = new AudioCtor();
      const masterGain = context.createGain();
      masterGain.gain.setValueAtTime(0.88, context.currentTime);
      masterGain.connect(context.destination);
      contextRef.current = context;
      masterGainRef.current = masterGain;
    }
    if (contextRef.current.state === "suspended") void contextRef.current.resume();
    return contextRef.current;
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      if (muted) return;
      const context = ensureContext();
      const masterGain = masterGainRef.current;
      if (!context || !masterGain) {
        playFallbackAudio(name, volume);
        return;
      }

      void (async () => {
        if (context.state === "suspended") await context.resume();
        if (context.state !== "running") return;

        const preset = AUDIO_PRESETS[name];
        const now = context.currentTime + 0.015;
        const stepDuration = preset.duration / Math.max(preset.frequencies.length, 1);

        if (name === "dice" || name === "capture") {
          playNoiseBurst(context, masterGain, now, name === "dice" ? 0.2 : 0.14, preset.gain * volume);
        }

        preset.frequencies.forEach((frequency, index) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const start = now + index * stepDuration;
          const end = start + stepDuration;

          oscillator.type = preset.type;
          oscillator.frequency.setValueAtTime(frequency, start);
          oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * 1.12), end);
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, preset.gain * volume), start + 0.018);
          gain.gain.exponentialRampToValueAtTime(0.0001, end);
          oscillator.connect(gain);
          gain.connect(masterGain);
          oscillator.start(start);
          oscillator.stop(end + 0.03);
        });
      })();
    },
    [ensureContext, muted, volume],
  );

  useEffect(() => {
    const unlock = () => {
      const context = ensureContext();
      if (context?.state === "suspended") void context.resume();
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      const context = contextRef.current;
      contextRef.current = null;
      masterGainRef.current = null;
      if (context && context.state !== "closed") void context.close().catch(() => undefined);
    };
  }, [ensureContext]);

  return { play, unlockAudio: ensureContext };
}

function playNoiseBurst(context: AudioContext, destination: AudioNode, start: number, duration: number, amount: number) {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(950, start);
  filter.Q.setValueAtTime(1.8, start);
  gain.gain.setValueAtTime(Math.max(0.0001, amount * 0.55), start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(start);
  source.stop(start + duration + 0.02);
}

declare global {
  interface Window {
    webkitAudioContext?: new () => AudioContext;
  }
}

const fallbackUrls = new Map<SoundName, string>();

function playFallbackAudio(name: SoundName, volume: number) {
  const url = getFallbackUrl(name);
  const audio = new Audio(url);
  audio.volume = Math.max(0, Math.min(1, volume));
  void audio.play().catch(() => undefined);
}

function getFallbackUrl(name: SoundName): string {
  const cached = fallbackUrls.get(name);
  if (cached) return cached;

  const preset = AUDIO_PRESETS[name];
  const sampleRate = 44100;
  const samples = Math.max(1, Math.floor(sampleRate * preset.duration));
  const bytesPerSample = 2;
  const dataSize = samples * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const segment = Math.min(preset.frequencies.length - 1, Math.floor((i / samples) * preset.frequencies.length));
    const frequency = preset.frequencies[segment];
    const envelope = Math.sin(Math.PI * (i / samples));
    const wave = Math.sin(2 * Math.PI * frequency * t);
    view.setInt16(44 + i * bytesPerSample, wave * envelope * preset.gain * 24000, true);
  }

  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  const url = `data:audio/wav;base64,${btoa(binary)}`;
  fallbackUrls.set(name, url);
  return url;
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
}
