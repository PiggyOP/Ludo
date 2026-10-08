import { motion } from "framer-motion";
import { Bot, Users } from "lucide-react";
import { panelVariants } from "../animations/variants";
import type { GameMode } from "../gameLogic/types";
import { cx } from "../utils/classNames";

interface GameSetupProps {
  mode: GameMode;
  playerCount: 2 | 3 | 4;
  onBack: () => void;
  onModeChange: (mode: GameMode) => void;
  onPlayerCountChange: (count: 2 | 3 | 4) => void;
  onStart: (mode: GameMode, count: 2 | 3 | 4) => void;
}

export function GameSetup({ mode, playerCount, onBack, onModeChange, onPlayerCountChange, onStart }: GameSetupProps) {
  return (
    <motion.section className="panel-screen" variants={panelVariants} initial="initial" animate="animate" exit="exit">
      <div className="screen-heading">
        <span className="eyebrow">New Match</span>
        <h1>Choose Players</h1>
      </div>

      <div className="option-grid">
        <button className={cx("mode-tile", mode === "pvp" && "selected")} type="button" onClick={() => onModeChange("pvp")}>
          <Users size={30} />
          <span>Player vs Player</span>
        </button>
        <button className={cx("mode-tile", mode === "pvai" && "selected")} type="button" onClick={() => onModeChange("pvai")}>
          <Bot size={30} />
          <span>Player vs AI</span>
        </button>
      </div>

      <div className="segmented-wrap">
        <span className="label">Players</span>
        <div className="segmented-control">
          {[2, 3, 4].map((count) => (
            <button
              key={count}
              className={cx(playerCount === count && "selected")}
              type="button"
              onClick={() => onPlayerCountChange(count as 2 | 3 | 4)}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="screen-actions">
        <button className="secondary-button" type="button" onClick={onBack}>
          Back
        </button>
        <button className="primary-button" type="button" onClick={() => onStart(mode, playerCount)}>
          Start Match
        </button>
      </div>
    </motion.section>
  );
}
