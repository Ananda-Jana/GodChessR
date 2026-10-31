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

  // Mandatory Win Condition: 60-second continuous shrine hold
  DOMINION_WIN_HOLD_TURNS: 60,
  DOMINION_WIN_HOLD_SECONDS: 60.0,
  SINGLE_SHRINE_WIN_SECONDS: 60.0,

  // Rebalanced Unit Stats for 3-5 Minute Strategic Matches
  HERO_DEFAULT_HP: 35,
  SHRINE_HEAL_PER_SEC: 1,
  HERO_ATTACK_COOLDOWN_SEC: 1.5,
  PAWN_DEFAULT_HP: 8,
  PAWN_ATTACK_DAMAGE: 1.5,
  PAWN_DEFENSE: 0,
};
