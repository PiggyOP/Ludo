import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { BOARD_SIZE, HOME_COORDS, PLAYER_COLORS, TRACK_COORDS } from "../gameLogic/constants";
import { getTokenCoord, isSafeCoord } from "../gameLogic/rules";
import type { BoardCoord, GameState, PlayerColor, TokenState } from "../gameLogic/types";
import { cx } from "../utils/classNames";

interface GameBoardProps {
  activePlayerId: PlayerColor;
  canSelectTokens: boolean;
  legalTokenIds: Set<string>;
  onTokenClick: (tokenId: string) => void;
  state: GameState;
}

const BASE_AREAS: Array<{ color: PlayerColor; className: string }> = [
  { color: "green", className: "base-green" },
  { color: "yellow", className: "base-yellow" },
  { color: "red", className: "base-red" },
  { color: "blue", className: "base-blue" },
];

export function GameBoard({ activePlayerId, canSelectTokens, legalTokenIds, onTokenClick, state }: GameBoardProps) {
  const allTokens = state.players.flatMap((player) => player.tokens);
  const groups = groupTokensByCoord(allTokens);

  return (
    <div className="board-wrap">
      <div className="ludo-board">
        {BASE_AREAS.map((area) => (
          <div key={area.color} className={cx("base-area", area.className)} style={{ "--accent": PLAYER_COLORS[area.color].primary } as CSSProperties}>
            <span>{area.color}</span>
            <div className="base-inner" />
          </div>
        ))}

        <div className="center-diamond">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="board-grid" aria-hidden="true">
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
            const coord = { row: Math.floor(index / BOARD_SIZE), col: index % BOARD_SIZE };
            return <span key={index} className={getCellClass(coord)} style={getCellStyle(coord)} />;
          })}
        </div>

        <div className="token-layer">
          {allTokens.map((token) => {
            const coord = getTokenCoord(token);
            const key = `${coord.row}-${coord.col}`;
            const stack = groups.get(key) ?? [];
            const stackIndex = stack.findIndex((stacked) => stacked.id === token.id);
            const offset = getStackOffset(stackIndex, stack.length);
            const position = toPercentPosition(coord);
            const isLegal = canSelectTokens && legalTokenIds.has(token.id) && token.playerId === activePlayerId && state.phase === "awaiting-move";
            const wasCaptured = state.lastMove?.capturedTokenIds.includes(token.id);
            const justMoved = state.lastMove?.tokenId === token.id;

            return (
              <motion.button
                key={token.id}
                aria-label={`${token.playerId} token ${token.index + 1}`}
                className={cx("token", `token-${token.playerId}`, isLegal && "legal", justMoved && "just-moved")}
                disabled={!isLegal}
                style={
                  {
                    left: `calc(${position.left}% + ${offset.x}px - (var(--token-size) / 2))`,
                    top: `calc(${position.top}% + ${offset.y}px - (var(--token-size) / 2))`,
                    "--accent": PLAYER_COLORS[token.playerId].primary,
                    "--deep": PLAYER_COLORS[token.playerId].deep,
                  } as CSSProperties
                }
                animate={{
                  scale: wasCaptured ? [1, 1.35, 0.85, 1] : justMoved ? [1, 1.18, 1] : 1,
                  rotate: wasCaptured ? [0, -12, 12, 0] : 0,
                }}
                transition={{ type: "spring", stiffness: 360, damping: 18 }}
                whileHover={isLegal ? { scale: 1.15 } : undefined}
                whileTap={isLegal ? { scale: 0.92 } : undefined}
                onClick={() => onTokenClick(token.id)}
              >
                <span />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getCellClass(coord: BoardCoord): string {
  const trackIndex = TRACK_COORDS.findIndex((cell) => cell.row === coord.row && cell.col === coord.col);
  const homeColor = (Object.keys(HOME_COORDS) as PlayerColor[]).find((color) =>
    HOME_COORDS[color].some((cell) => cell.row === coord.row && cell.col === coord.col),
  );
  return cx("board-cell", trackIndex >= 0 && "track-cell", trackIndex >= 0 && isSafeCoord(coord) && "safe-cell", homeColor && `home-cell home-${homeColor}`);
}

function getCellStyle(coord: BoardCoord): CSSProperties {
  const homeColor = (Object.keys(HOME_COORDS) as PlayerColor[]).find((color) =>
    HOME_COORDS[color].some((cell) => cell.row === coord.row && cell.col === coord.col),
  );
  return homeColor ? ({ "--accent": PLAYER_COLORS[homeColor].primary } as CSSProperties) : {};
}

function toPercentPosition(coord: BoardCoord) {
  return {
    left: ((coord.col + 0.5) / BOARD_SIZE) * 100,
    top: ((coord.row + 0.5) / BOARD_SIZE) * 100,
  };
}

function groupTokensByCoord(tokens: TokenState[]): Map<string, TokenState[]> {
  return tokens.reduce((map, token) => {
    const coord = getTokenCoord(token);
    const key = `${coord.row}-${coord.col}`;
    const group = map.get(key) ?? [];
    group.push(token);
    map.set(key, group);
    return map;
  }, new Map<string, TokenState[]>());
}

function getStackOffset(index: number, total: number) {
  if (total <= 1) return { x: 0, y: 0 };
  const angle = (Math.PI * 2 * index) / total;
  const radius = total > 2 ? 9 : 6;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}
