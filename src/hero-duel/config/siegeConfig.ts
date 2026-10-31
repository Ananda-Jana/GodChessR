/**
 * Shrine Siege Configuration Constants
 * Configured for 8 columns x 8 rows tactical chessboard
 */

export const SIEGE_CONFIG = {
  COLS: 8,
  ROWS: 8,
  TICK_MS: 100, // 10 ticks per second (0.1s dt)
  MAX_MATCH_SECONDS: 300,

  // 2 Shrines, each taking 2x2 grid areas in the middle
  // Rows 3 and 4 (0-indexed)
  SHRINES: [
    {
      id: 's-left',
      name: 'West Grand Shrine',
      cells: [
        { x: 1, y: 3 }, { x: 2, y: 3 },
        { x: 1, y: 4 }, { x: 2, y: 4 },
      ],
    },
    {
      id: 's-right',
      name: 'East Grand Shrine',
      cells: [
        { x: 5, y: 3 }, { x: 6, y: 3 },
        { x: 5, y: 4 }, { x: 6, y: 4 },
      ],
    },
  ],

  // Win condition constants
  DOMINION_WIN_HOLD_TURNS: 8, // Hold both shrines for 8 cumulative turns to win
  DOMINION_WIN_HOLD_SECONDS: 8.0,

  // Unit Stats
  HERO_DEFAULT_HP: 10,
  HERO_ATTACK_COOLDOWN_SEC: 1.2,
  PAWN_DEFAULT_HP: 3,
  PAWN_ATTACK_DAMAGE: 1,
  PAWN_DEFENSE: 0,
};
