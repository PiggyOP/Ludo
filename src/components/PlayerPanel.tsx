import { Crown, Home } from "lucide-react";
import type { CSSProperties } from "react";
import { PLAYER_COLORS } from "../gameLogic/constants";
import type { PlayerState } from "../gameLogic/types";
import { cx } from "../utils/classNames";

interface PlayerPanelProps {
  active: boolean;
  player: PlayerState;
}

export function PlayerPanel({ active, player }: PlayerPanelProps) {
  const palette = PLAYER_COLORS[player.color];
  const homeCount = player.tokens.filter((token) => token.progress === 57).length;
  const baseCount = player.tokens.filter((token) => token.progress < 0).length;

  return (
    <div className={cx("player-panel", active && "active")} style={{ "--accent": palette.primary } as CSSProperties}>
      <div className="player-avatar" />
      <div className="player-info">
        <strong>{player.name}</strong>
        <span>{player.kind === "ai" ? "AI" : "Human"}</span>
      </div>
      <div className="player-stats">
        <span title="Home tokens">
          <Home size={15} />
          {homeCount}
        </span>
        <span title="Base tokens">
          <Crown size={15} />
          {baseCount}
        </span>
      </div>
    </div>
  );
}
