export type PlayerColor = "red" | "green" | "yellow" | "blue";
export type GameMode = "pvp" | "pvai";
export type PlayerKind = "human" | "ai";
export type GamePhase = "awaiting-roll" | "awaiting-move" | "finished";

export interface BoardCoord {
  row: number;
  col: number;
}

export interface TokenState {
  id: string;
  playerId: PlayerColor;
  index: number;
  progress: number;
}

export interface PlayerState {
  id: PlayerColor;
  name: string;
  color: PlayerColor;
  kind: PlayerKind;
  tokens: TokenState[];
}

export interface MoveResult {
  tokenId: string;
  playerId: PlayerColor;
  fromProgress: number;
  toProgress: number;
  capturedTokenIds: string[];
  capturedPlayerIds: PlayerColor[];
  reachedHome: boolean;
  extraTurn: boolean;
}

export interface GameState {
  players: PlayerState[];
  currentPlayerIndex: number;
  diceValue: number | null;
  phase: GamePhase;
  winnerId: PlayerColor | null;
  turnNumber: number;
  lastMove: MoveResult | null;
  message: string;
}

export interface LegalMove {
  token: TokenState;
  targetProgress: number;
  captures: TokenState[];
  reachesHome: boolean;
  leavesBase: boolean;
  isSafeLanding: boolean;
}

export interface NewGameOptions {
  mode: GameMode;
  playerCount: 2 | 3 | 4;
}
