import { useCallback, useEffect, useMemo, useState } from "react";
import { chooseAiMove } from "../gameLogic/ai";
import { createGame, getActivePlayer, getLegalMoves, skipTurn, applyMove, rollDice } from "../gameLogic/rules";
import type { GameMode, GameState } from "../gameLogic/types";
import { useAudio } from "./useAudio";

export type Screen = "menu" | "setup" | "settings" | "game";

export interface SoundSettings {
  muted: boolean;
  volume: number;
}

const DEFAULT_SETTINGS: SoundSettings = {
  muted: false,
  volume: 0.75,
};

export function useLudoGame() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [mode, setMode] = useState<GameMode>("pvp");
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [settings, setSettings] = useState<SoundSettings>(DEFAULT_SETTINGS);
  const [state, setState] = useState<GameState>(() => createGame({ mode: "pvp", playerCount: 4 }));
  const [isRolling, setIsRolling] = useState(false);
  const { play, unlockAudio } = useAudio(settings.muted, settings.volume);

  const activePlayer = useMemo(() => getActivePlayer(state), [state]);
  const legalMoves = useMemo(() => getLegalMoves(state), [state]);
  const legalTokenIds = useMemo(() => new Set(legalMoves.map((move) => move.token.id)), [legalMoves]);

  const startGame = useCallback(
    (nextMode = mode, nextPlayerCount = playerCount) => {
      unlockAudio();
      setMode(nextMode);
      setPlayerCount(nextPlayerCount);
      setState(createGame({ mode: nextMode, playerCount: nextPlayerCount }));
      setScreen("game");
      setIsRolling(false);
      play("click");
    },
    [mode, playerCount, play, unlockAudio],
  );

  const roll = useCallback(() => {
    if (state.phase !== "awaiting-roll" || isRolling || activePlayer.kind === "ai") return;
    unlockAudio();
    play("dice");
    setIsRolling(true);
    window.setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1;
      setState((current) => rollDice(current, value));
      setIsRolling(false);
    }, 620);
  }, [activePlayer.kind, isRolling, play, state.phase, unlockAudio]);

  const rollForAi = useCallback(() => {
    if (state.phase !== "awaiting-roll" || isRolling) return;
    play("dice");
    setIsRolling(true);
    window.setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1;
      setState((current) => rollDice(current, value));
      setIsRolling(false);
    }, 620);
  }, [isRolling, play, state.phase]);

  const moveToken = useCallback(
    (tokenId: string) => {
      if (!legalTokenIds.has(tokenId) || activePlayer.kind === "ai") return;
      setState((current) => {
        const next = applyMove(current, tokenId);
        const captured = next.lastMove?.capturedTokenIds.length ?? 0;
        if (next.winnerId) play("victory");
        else if (captured) play("capture");
        else play("move");
        return next;
      });
    },
    [activePlayer.kind, legalTokenIds, play],
  );

  const moveTokenForAi = useCallback(
    (tokenId: string) => {
      setState((current) => {
        const next = applyMove(current, tokenId);
        const captured = next.lastMove?.capturedTokenIds.length ?? 0;
        if (next.winnerId) play("victory");
        else if (captured) play("capture");
        else play("move");
        return next;
      });
    },
    [play],
  );

  const restart = useCallback(() => startGame(mode, playerCount), [mode, playerCount, startGame]);

  useEffect(() => {
    if (screen !== "game" || state.phase !== "awaiting-move" || legalMoves.length > 0 || state.winnerId) return;
    const timeout = window.setTimeout(() => {
      setState((current) => {
        const currentMoves = getLegalMoves(current);
        if (current.phase !== "awaiting-move" || currentMoves.length > 0) return current;
        if (current.diceValue === 6) {
          return {
            ...current,
            diceValue: null,
            phase: "awaiting-roll",
            message: `${getActivePlayer(current).name} keeps the turn after rolling 6.`,
          };
        }
        return skipTurn(current);
      });
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [legalMoves.length, screen, state.phase, state.winnerId]);

  useEffect(() => {
    if (screen !== "game" || activePlayer.kind !== "ai" || state.phase !== "awaiting-roll" || isRolling) return;
    const timeout = window.setTimeout(rollForAi, 760);
    return () => window.clearTimeout(timeout);
  }, [activePlayer.kind, isRolling, rollForAi, screen, state.phase]);

  useEffect(() => {
    if (screen !== "game" || activePlayer.kind !== "ai" || state.phase !== "awaiting-move" || !legalMoves.length) return;
    const timeout = window.setTimeout(() => {
      const tokenId = chooseAiMove(state);
      if (tokenId) moveTokenForAi(tokenId);
    }, 760);
    return () => window.clearTimeout(timeout);
  }, [activePlayer.kind, legalMoves.length, moveTokenForAi, screen, state, state.phase]);

  return {
    activePlayer,
    isRolling,
    legalMoves,
    legalTokenIds,
    mode,
    moveToken,
    playerCount,
    restart,
    roll,
    screen,
    setMode,
    setPlayerCount,
    setScreen,
    setSettings,
    settings,
    startGame,
    state,
  };
}
