/**
 * Board and theme configurations for Hero Duel (7x8 Arena)
 */

export const BOARD_COLS = 7; // Columns A through G (0 to 6)
export const BOARD_ROWS = 8; // Rows 1 through 8 (0 to 7)

export const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;
export const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export type ColIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type RowIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface BoardPosition {
  x: number; // 0 to 6
  y: number; // 0 to 7
}

/**
 * Cream & Crimson Palette Configuration
 * Light square: Parchment Ivory (#F2EFE4)
 * Dark square: Hashira Crimson (#BC1434)
 */
export const HERO_BOARD_THEME = {
  id: 'cream-crimson',
  name: 'Demon Slayer Cream & Crimson',
  lightSquareHex: '#F2EFE4',
  darkSquareHex: '#BC1434',
  lightSquareClass: 'bg-[#F2EFE4]',
  darkSquareClass: 'bg-[#BC1434]',
  coordLightClass: 'text-[#BC1434]/80',
  coordDarkClass: 'text-[#F2EFE4]/85',
  highlightMoveHex: 'rgba(251, 191, 36, 0.45)',
  highlightKillHex: 'rgba(239, 68, 68, 0.65)',
  highlightAbilityHex: 'rgba(59, 130, 246, 0.55)',
  highlightSelectedHex: 'rgba(251, 191, 36, 0.8)',
};

/**
 * Default starting mirrored slots on ranks 1 & 8 (columns B, C, E, F)
 */
export const DEFAULT_PLAYER_1_SPOTS: BoardPosition[] = [
  { x: 1, y: 0 }, // B1
  { x: 2, y: 0 }, // C1
  { x: 4, y: 0 }, // E1
  { x: 5, y: 0 }, // F1
];

export const DEFAULT_PLAYER_2_SPOTS: BoardPosition[] = [
  { x: 1, y: 7 }, // B8
  { x: 2, y: 7 }, // C8
  { x: 4, y: 7 }, // E8
  { x: 5, y: 7 }, // F8
];
