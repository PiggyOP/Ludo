import {
  BASE_COORDS,
  HOME_COORDS,
  HOME_FINISH_PROGRESS,
  PLAYER_LABELS,
  PLAYER_ORDER_BY_COUNT,
  PLAYER_START_INDEX,
  SAFE_GLOBAL_INDEXES,
  TRACK_COORDS,
  TRACK_LENGTH,
} from "./constants";
import type { BoardCoord, GameState, LegalMove, NewGameOptions, PlayerColor, PlayerState, TokenState } from "./types";

export function createGame({ mode, playerCount }: NewGameOptions): GameState {
  const order = PLAYER_ORDER_BY_COUNT[playerCount];
  const players = order.map((color, playerIndex) => createPlayer(color, mode === "pvai" && playerIndex > 0 ? "ai" : "human"));

  return {
    players,
    currentPlayerIndex: 0,
    diceValue: null,
    phase: "awaiting-roll",
    winnerId: null,
    turnNumber: 1,
    lastMove: null,
    message: `${players[0].name} starts the match.`,
  };
}

function createPlayer(color: PlayerColor, kind: PlayerState["kind"]): PlayerState {
  return {
    id: color,
    name: PLAYER_LABELS[color],
    color,
    kind,
    tokens: Array.from({ length: 4 }, (_, index) => ({
      id: `${color}-${index}`,
      playerId: color,
      index,
      progress: -1,
    })),
  };
}

export function getActivePlayer(state: GameState): PlayerState {
  return state.players[state.currentPlayerIndex];
}

export function getNextPlayerIndex(state: GameState): number {
  return (state.currentPlayerIndex + 1) % state.players.length;
}

export function rollDice(state: GameState, value: number): GameState {
  if (state.phase !== "awaiting-roll" || state.winnerId) return state;
  const active = getActivePlayer(state);
  const moves = getLegalMoves({ ...state, diceValue: value, phase: "awaiting-move" });

  return {
    ...state,
    diceValue: value,
    phase: "awaiting-move",
    lastMove: null,
    message: moves.length ? `${active.name} rolled ${value}.` : `${active.name} rolled ${value} and has no legal move.`,
  };
}

export function skipTurn(state: GameState): GameState {
  if (state.phase === "finished") return state;
  const nextIndex = getNextPlayerIndex(state);
  const next = state.players[nextIndex];
  return {
    ...state,
    currentPlayerIndex: nextIndex,
    diceValue: null,
    phase: "awaiting-roll",
    turnNumber: state.turnNumber + 1,
    lastMove: null,
    message: `${next.name}'s turn.`,
  };
}

export function applyMove(state: GameState, tokenId: string): GameState {
  if (state.phase !== "awaiting-move" || state.diceValue == null) return state;
  const active = getActivePlayer(state);
  const legalMove = getLegalMoves(state).find((move) => move.token.id === tokenId);
  if (!legalMove) return state;

  const capturedIds = new Set(legalMove.captures.map((token) => token.id));
  const capturedPlayerIds = [...new Set(legalMove.captures.map((token) => token.playerId))];
  const players = state.players.map((player) => ({
    ...player,
    tokens: player.tokens.map((token) => {
      if (token.id === tokenId) {
        return { ...token, progress: legalMove.targetProgress };
      }
      if (capturedIds.has(token.id)) {
        return { ...token, progress: -1 };
      }
      return token;
    }),
  }));

  const updatedActive = players.find((player) => player.id === active.id)!;
  const winnerId = updatedActive.tokens.every((token) => token.progress === HOME_FINISH_PROGRESS) ? active.id : null;
  const extraTurn = state.diceValue === 6 && !winnerId;
  const nextIndex = extraTurn ? state.currentPlayerIndex : getNextPlayerIndex(state);
  const nextPlayer = players[nextIndex];
  const captureText = legalMove.captures.length ? ` Captured ${legalMove.captures.length} token${legalMove.captures.length > 1 ? "s" : ""}.` : "";
  const homeText = legalMove.reachesHome ? " Token reached home." : "";

  return {
    ...state,
    players,
    currentPlayerIndex: winnerId ? state.currentPlayerIndex : nextIndex,
    diceValue: null,
    phase: winnerId ? "finished" : "awaiting-roll",
    winnerId,
    turnNumber: extraTurn || winnerId ? state.turnNumber : state.turnNumber + 1,
    lastMove: {
      tokenId,
      playerId: active.id,
      fromProgress: legalMove.token.progress,
      toProgress: legalMove.targetProgress,
      capturedTokenIds: [...capturedIds],
      capturedPlayerIds,
      reachedHome: legalMove.reachesHome,
      extraTurn,
    },
    message: winnerId
      ? `${active.name} wins the game.`
      : `${active.name} moved.${captureText}${homeText}${extraTurn ? " Extra turn." : ` ${nextPlayer.name}'s turn.`}`,
  };
}

export function getLegalMoves(state: GameState): LegalMove[] {
  const dice = state.diceValue;
  if (dice == null || state.phase !== "awaiting-move") return [];
  const active = getActivePlayer(state);

  return active.tokens.flatMap((token) => {
    const targetProgress = getTargetProgress(token.progress, dice);
    if (targetProgress == null) return [];
    const captures = getCapturesForLanding(state, active.id, targetProgress);
    const globalIndex = getGlobalIndex(active.id, targetProgress);

    return [
      {
        token,
        targetProgress,
        captures,
        reachesHome: targetProgress === HOME_FINISH_PROGRESS,
        leavesBase: token.progress < 0,
        isSafeLanding: globalIndex == null || SAFE_GLOBAL_INDEXES.has(globalIndex),
      },
    ];
  });
}

export function getTargetProgress(currentProgress: number, diceValue: number): number | null {
  if (currentProgress < 0) return diceValue === 6 ? 0 : null;
  if (currentProgress >= HOME_FINISH_PROGRESS) return null;
  const target = currentProgress + diceValue;
  return target <= HOME_FINISH_PROGRESS ? target : null;
}

export function getCapturesForLanding(state: GameState, playerId: PlayerColor, targetProgress: number): TokenState[] {
  const globalIndex = getGlobalIndex(playerId, targetProgress);
  if (globalIndex == null || SAFE_GLOBAL_INDEXES.has(globalIndex)) return [];

  return state.players
    .filter((player) => player.id !== playerId)
    .flatMap((player) => player.tokens)
    .filter((token) => token.progress >= 0 && token.progress < TRACK_LENGTH && getGlobalIndex(token.playerId, token.progress) === globalIndex);
}

export function getGlobalIndex(playerId: PlayerColor, progress: number): number | null {
  if (progress < 0 || progress >= TRACK_LENGTH) return null;
  return (PLAYER_START_INDEX[playerId] + progress) % TRACK_LENGTH;
}

export function getTokenCoord(token: TokenState): BoardCoord {
  if (token.progress < 0) return BASE_COORDS[token.playerId][token.index];
  if (token.progress < TRACK_LENGTH) {
    const globalIndex = getGlobalIndex(token.playerId, token.progress);
    return TRACK_COORDS[globalIndex ?? 0];
  }
  return HOME_COORDS[token.playerId][Math.min(token.progress - TRACK_LENGTH, HOME_COORDS[token.playerId].length - 1)];
}

export function isSafeCoord(coord: BoardCoord): boolean {
  return [...SAFE_GLOBAL_INDEXES].some((index) => {
    const safe = TRACK_COORDS[index];
    return safe.row === coord.row && safe.col === coord.col;
  });
}

export function getProgressToCapture(attacker: TokenState, target: TokenState): number | null {
  if (attacker.progress < 0 || attacker.progress >= TRACK_LENGTH || target.progress < 0 || target.progress >= TRACK_LENGTH) return null;
  const attackerGlobal = getGlobalIndex(attacker.playerId, attacker.progress);
  const targetGlobal = getGlobalIndex(target.playerId, target.progress);
  if (attackerGlobal == null || targetGlobal == null) return null;
  const distance = (targetGlobal - attackerGlobal + TRACK_LENGTH) % TRACK_LENGTH;
  return distance === 0 ? null : distance;
}
