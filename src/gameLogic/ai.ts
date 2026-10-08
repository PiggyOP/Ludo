import { HOME_FINISH_PROGRESS, SAFE_GLOBAL_INDEXES, TRACK_LENGTH } from "./constants";
import { getActivePlayer, getGlobalIndex, getLegalMoves, getProgressToCapture } from "./rules";
import type { GameState, LegalMove, TokenState } from "./types";

export function chooseAiMove(state: GameState): string | null {
  const moves = getLegalMoves(state);
  if (!moves.length) return null;

  const ranked = moves
    .map((move) => ({ move, score: scoreMove(state, move) }))
    .sort((a, b) => b.score - a.score || b.move.targetProgress - a.move.targetProgress);

  return ranked[0].move.token.id;
}

function scoreMove(state: GameState, move: LegalMove): number {
  let score = move.targetProgress;
  const active = getActivePlayer(state);

  if (move.captures.length) score += 140 + move.captures.length * 35;
  if (move.reachesHome) score += 110;
  if (move.leavesBase) score += hasAdvancedToken(active.tokens) ? 26 : 48;
  if (move.isSafeLanding) score += 18;
  if (move.token.progress >= 47 && move.targetProgress < HOME_FINISH_PROGRESS) score += 12;

  score -= estimateLandingRisk(state, move) * 30;

  if (move.leavesBase && active.tokens.filter((token) => token.progress < 0).length <= 1) {
    score -= 8;
  }

  return score;
}

function hasAdvancedToken(tokens: TokenState[]): boolean {
  return tokens.some((token) => token.progress > 0 && token.progress < HOME_FINISH_PROGRESS);
}

function estimateLandingRisk(state: GameState, move: LegalMove): number {
  const landingGlobal = getGlobalIndex(move.token.playerId, move.targetProgress);
  if (landingGlobal == null || SAFE_GLOBAL_INDEXES.has(landingGlobal) || move.targetProgress >= TRACK_LENGTH) return 0;

  return state.players
    .filter((player) => player.id !== move.token.playerId)
    .flatMap((player) => player.tokens)
    .reduce((risk, opponent) => {
      const distance = getProgressToCapture(opponent, { ...move.token, progress: move.targetProgress });
      if (distance == null || distance > 6) return risk;
      return risk + (7 - distance) / 6;
    }, 0);
}
