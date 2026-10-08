export type SoundName = "dice" | "move" | "capture" | "victory" | "click";

export const AUDIO_PRESETS: Record<SoundName, { frequencies: number[]; duration: number; type: OscillatorType; gain: number }> = {
  dice: { frequencies: [180, 280, 420, 610], duration: 0.42, type: "square", gain: 0.16 },
  move: { frequencies: [360, 520, 700], duration: 0.2, type: "sine", gain: 0.12 },
  capture: { frequencies: [760, 340, 180], duration: 0.38, type: "sawtooth", gain: 0.14 },
  victory: { frequencies: [392, 523, 659, 784, 988], duration: 1.05, type: "triangle", gain: 0.13 },
  click: { frequencies: [520], duration: 0.1, type: "sine", gain: 0.08 },
};
