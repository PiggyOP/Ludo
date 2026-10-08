import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { panelVariants } from "../animations/variants";
import type { SoundSettings } from "../hooks/useLudoGame";

interface SettingsPanelProps {
  settings: SoundSettings;
  onBack: () => void;
  onChange: Dispatch<SetStateAction<SoundSettings>>;
}

export function SettingsPanel({ settings, onBack, onChange }: SettingsPanelProps) {
  return (
    <motion.section className="panel-screen" variants={panelVariants} initial="initial" animate="animate" exit="exit">
      <div className="screen-heading">
        <span className="eyebrow">Settings</span>
        <h1>Sound</h1>
      </div>

      <div className="settings-stack">
        <button className="setting-row" type="button" onClick={() => onChange((current) => ({ ...current, muted: !current.muted }))}>
          {settings.muted ? <VolumeX size={26} /> : <Volume2 size={26} />}
          <span>{settings.muted ? "Muted" : "Sound On"}</span>
          <span className="switch" data-on={!settings.muted} />
        </button>

        <label className="range-row">
          <span>Volume</span>
          <input
            aria-label="Volume"
            disabled={settings.muted}
            max={1}
            min={0}
            step={0.05}
            type="range"
            value={settings.volume}
            onChange={(event) => onChange((current) => ({ ...current, volume: Number(event.target.value) }))}
          />
        </label>
      </div>

      <div className="screen-actions">
        <button className="primary-button" type="button" onClick={onBack}>
          Done
        </button>
      </div>
    </motion.section>
  );
}
