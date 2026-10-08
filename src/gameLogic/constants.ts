import type { BoardCoord, PlayerColor } from "./types";

export const BOARD_SIZE = 15;
export const TRACK_LENGTH = 52;
export const HOME_ENTRANCE_PROGRESS = 51;
export const HOME_FINISH_PROGRESS = 57;

export const PLAYER_ORDER_BY_COUNT: Record<2 | 3 | 4, PlayerColor[]> = {
  2: ["red", "yellow"],
  3: ["red", "green", "yellow"],
  4: ["red", "green", "yellow", "blue"],
};

export const PLAYER_LABELS: Record<PlayerColor, string> = {
  red: "Ruby",
  green: "Emerald",
  yellow: "Solar",
  blue: "Azure",
};

export const PLAYER_START_INDEX: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

export const PLAYER_COLORS: Record<PlayerColor, { primary: string; deep: string; soft: string }> = {
  red: { primary: "#f04456", deep: "#b71d35", soft: "#ffe1e7" },
  green: { primary: "#16b981", deep: "#087455", soft: "#d7f8eb" },
  yellow: { primary: "#f7c948", deep: "#b7791f", soft: "#fff4bf" },
  blue: { primary: "#2f80ed", deep: "#1a4f9f", soft: "#dcecff" },
};

export const TRACK_COORDS: BoardCoord[] = [
  { row: 14, col: 6 },
  { row: 13, col: 6 },
  { row: 12, col: 6 },
  { row: 11, col: 6 },
  { row: 10, col: 6 },
  { row: 9, col: 5 },
  { row: 9, col: 4 },
  { row: 9, col: 3 },
  { row: 9, col: 2 },
  { row: 9, col: 1 },
  { row: 9, col: 0 },
  { row: 8, col: 0 },
  { row: 7, col: 0 },
  { row: 6, col: 0 },
  { row: 6, col: 1 },
  { row: 6, col: 2 },
  { row: 6, col: 3 },
  { row: 6, col: 4 },
  { row: 6, col: 5 },
  { row: 5, col: 6 },
  { row: 4, col: 6 },
  { row: 3, col: 6 },
  { row: 2, col: 6 },
  { row: 1, col: 6 },
  { row: 0, col: 6 },
  { row: 0, col: 7 },
  { row: 0, col: 8 },
  { row: 1, col: 8 },
  { row: 2, col: 8 },
  { row: 3, col: 8 },
  { row: 4, col: 8 },
  { row: 5, col: 8 },
  { row: 6, col: 9 },
  { row: 6, col: 10 },
  { row: 6, col: 11 },
  { row: 6, col: 12 },
  { row: 6, col: 13 },
  { row: 6, col: 14 },
  { row: 7, col: 14 },
  { row: 8, col: 14 },
  { row: 8, col: 13 },
  { row: 8, col: 12 },
  { row: 8, col: 11 },
  { row: 8, col: 10 },
  { row: 8, col: 9 },
  { row: 9, col: 8 },
  { row: 10, col: 8 },
  { row: 11, col: 8 },
  { row: 12, col: 8 },
  { row: 13, col: 8 },
  { row: 14, col: 8 },
  { row: 14, col: 7 },
];

export const HOME_COORDS: Record<PlayerColor, BoardCoord[]> = {
  red: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
    { row: 8, col: 7 },
  ],
  green: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
    { row: 7, col: 6 },
  ],
  yellow: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
    { row: 6, col: 7 },
  ],
  blue: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
    { row: 7, col: 8 },
  ],
};

export const BASE_COORDS: Record<PlayerColor, BoardCoord[]> = {
  red: [
    { row: 11, col: 1 },
    { row: 11, col: 3 },
    { row: 13, col: 1 },
    { row: 13, col: 3 },
  ],
  green: [
    { row: 1, col: 1 },
    { row: 1, col: 3 },
    { row: 3, col: 1 },
    { row: 3, col: 3 },
  ],
  yellow: [
    { row: 1, col: 11 },
    { row: 1, col: 13 },
    { row: 3, col: 11 },
    { row: 3, col: 13 },
  ],
  blue: [
    { row: 11, col: 11 },
    { row: 11, col: 13 },
    { row: 13, col: 11 },
    { row: 13, col: 13 },
  ],
};

export const SAFE_GLOBAL_INDEXES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
