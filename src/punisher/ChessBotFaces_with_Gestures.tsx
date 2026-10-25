import React from "react";

/* ============================================================================
 * CHESS BOT FACES - every expression is a fully hard-coded face
 * ----------------------------------------------------------------------------
 * Nothing is drawn on top of a "base" face. Each bot has 12 complete, separate
 * face drawings (one per expression). Eye shape and size, brows, mouth, teeth,
 * horns, hands, halo, crown and antenna are all part of that expression's own
 * path data, so when the expression changes the whole face is swapped.
 *
 * All faces are single-colour (currentColor), so the parent controls the colour:
 * yellow by default, red when angry, #2727F5 while calculating, etc.
 * ========================================================================== */

/** The 9 moods the game already uses. */
export type BotMood =
  | 'neutral'
  | 'thinking'
  | 'happy'
  | 'smug'
  | 'shocked'
  | 'worried'
  | 'angry'
  | 'victory'
  | 'defeat';

/** All 12 hard-coded faces: the 9 moods + 3 show-off faces. */
export type BotExpression = BotMood | 'taunt' | 'devil' | 'wave';

/**
 * Gesture names kept for backwards compatibility. Each one now simply selects a
 * complete hard-coded face:
 *  smile -> happy   rage -> angry   horns -> devil (horns grow out of the head)
 *  hands -> wave (hands shown)   taunt -> taunt (tongue out)
 *  celebrate -> victory (hands raised)   panic -> shocked   none -> use the mood
 */
export type BotGesture = 'none' | 'smile' | 'rage' | 'horns' | 'hands' | 'taunt' | 'celebrate' | 'panic';

export type BotFaceProps = {
  size?: number;
  className?: string;
  mood?: BotMood;
  /** 'auto' (default) = use the mood. Any other value picks the matching face. */
  gesture?: BotGesture | 'auto';
  /** Directly pick any of the 12 faces (overrides mood and gesture). */
  expression?: BotExpression;
};

export const BOT_EXPRESSIONS: readonly BotExpression[] = [
  'neutral', 'thinking', 'happy', 'smug', 'shocked', 'worried',
  'angry', 'victory', 'defeat', 'taunt', 'devil', 'wave',
] as const;

const GESTURE_TO_EXPRESSION: Record<Exclude<BotGesture, 'none'>, BotExpression> = {
  smile: 'happy',
  rage: 'angry',
  horns: 'devil',
  hands: 'wave',
  taunt: 'taunt',
  celebrate: 'victory',
  panic: 'shocked',
};

const resolveExpression = (
  mood: BotMood,
  gesture: BotGesture | 'auto',
  expression?: BotExpression,
): BotExpression => {
  if (expression) return expression;
  if (gesture === 'auto' || gesture === 'none') return mood;
  return GESTURE_TO_EXPRESSION[gesture];
};

/** One piece of a face. 'nonzero' pieces (hands, horns, pixels) may overlap safely. */
type FacePath = { d: string; rule?: 'nonzero' };
type BotFaces = Record<BotExpression, FacePath[]>;

const Frame: React.FC<{ size?: number; className?: string; label: string; faces: BotFaces; expression: BotExpression }> = ({
  size = 128, className, label, faces, expression,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 200"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
    fillRule="evenodd"
    role="img"
    aria-label={label}
  >
    {faces[expression].map((p, i) => (
      <path key={i} d={p.d} fillRule={p.rule ?? 'evenodd'} />
    ))}
  </svg>
);

/* ============================================================================
 * HARD-CODED FACE DATA
 * ========================================================================== */

/* ----------------------------------------------------------------------------
 * JOYSTICK WRAITH  (retro console with a pixel screen: expressions are drawn as pixel art on the screen, teeth/legs change shape)
 * ---------------------------------------------------------------------------- */
const WRAITH: BotFaces = {
  // neutral: original face, untouched
  neutral: [
    {
      d: `
        M50 40 L62 24 L84 24 L84 44 L116 44 L116 24 L138 24 L150 40 L150 70 L164 78 L164 118 L150 126 L150 140 L140 150 L140 160 L60 160 L60 150 L50 140 L50 126 L36 118 L36 78 L50 70 Z
        M56 76 H144 Q152 76 152 84 V110 Q152 118 144 118 H56 Q48 118 48 110 V84 Q48 76 56 76 Z
        M52 130 H64 V134 H52 Z
        M136 130 H148 V134 H136 Z
        M64 164 H72 V184 H64 Z
        M78 164 H86 V184 H78 Z
        M93 164 H107 V184 H93 Z
        M114 164 H122 V184 H114 Z
        M128 164 H136 V184 H128 Z
        M69 88 H75 V94 H81 V100 H75 V106 H69 V100 H63 V94 H69 Z
        M97 80 H103 V114 H97 Z
        M120 94 H138 V100 H120 Z`,
    },
  ],
  // thinking: one eye squints, the other opens wide, mouth goes flat
  thinking: [
    {
      d: `
        M50 40 L62 24 L84 24 L84 44 L116 44 L116 24 L138 24 L150 40 L150 70 L164 78 L164 118 L150 126 L150 140 L140 150 L140 160 L60 160 L60 150 L50 140 L50 126 L36 118 L36 78 L50 70 Z
        M56 76 H144 Q152 76 152 84 V110 Q152 118 144 118 H56 Q48 118 48 110 V84 Q48 76 56 76 Z
        M52 130 H64 V134 H52 Z
        M136 130 H148 V134 H136 Z
        M64 164 H72 V184 H64 Z
        M78 164 H86 V184 H78 Z
        M93 164 H107 V184 H93 Z
        M114 164 H122 V184 H114 Z
        M128 164 H136 V184 H128 Z`,
    },
    { rule: 'nonzero',
      d: `
        M107.2 79.2 H132.8 V84.8 H107.2 Z M67.2 89.2 H87.8 V94.8 H67.2 Z M112.2 89.2 H132.8 V94.8 H112.2 Z M112.2 94.2 H132.8 V99.8 H112.2 Z M112.2 99.2 H132.8 V104.8 H112.2 Z M92.2 104.2 H117.8 V109.8 H92.2 Z`,
    },
  ],
  // happy: eyes become smiling arches, wide smile
  happy: [
    {
      d: `
        M50 40 L62 24 L84 24 L84 44 L116 44 L116 24 L138 24 L150 40 L150 70 L164 78 L164 118 L150 126 L150 140 L140 150 L140 160 L60 160 L60 150 L50 140 L50 126 L36 118 L36 78 L50 70 Z
        M56 76 H144 Q152 76 152 84 V110 Q152 118 144 118 H56 Q48 118 48 110 V84 Q48 76 56 76 Z
        M52 130 H64 V134 H52 Z
        M136 130 H148 V134 H136 Z
        M64 164 H72 V188 H64 Z
        M78 164 H86 V182 H78 Z
        M93 164 H107 V176 H93 Z
        M114 164 H122 V182 H114 Z
        M128 164 H136 V188 H128 Z`,
    },
    { rule: 'nonzero',
      d: `
        M77.2 84.2 H82.8 V89.8 H77.2 Z M117.2 84.2 H122.8 V89.8 H117.2 Z M72.2 89.2 H77.8 V94.8 H72.2 Z M82.2 89.2 H87.8 V94.8 H82.2 Z M112.2 89.2 H117.8 V94.8 H112.2 Z M122.2 89.2 H127.8 V94.8 H122.2 Z M67.2 94.2 H72.8 V99.8 H67.2 Z M87.2 94.2 H92.8 V99.8 H87.2 Z M107.2 94.2 H112.8 V99.8 H107.2 Z M127.2 94.2 H132.8 V99.8 H127.2 Z M77.2 104.2 H82.8 V109.8 H77.2 Z M117.2 104.2 H122.8 V109.8 H117.2 Z M82.2 109.2 H117.8 V114.8 H82.2 Z`,
    },
  ],
  // smug: half-lidded eye, raised brow, lopsided smirk
  smug: [
    {
      d: `
        M50 40 L62 24 L84 24 L84 44 L116 44 L116 24 L138 24 L150 40 L150 70 L164 78 L164 118 L150 126 L150 140 L140 150 L140 160 L60 160 L60 150 L50 140 L50 126 L36 118 L36 78 L50 70 Z
        M56 76 H144 Q152 76 152 84 V110 Q152 118 144 118 H56 Q48 118 48 110 V84 Q48 76 56 76 Z
        M52 130 H64 V134 H52 Z
        M136 130 H148 V134 H136 Z
        M64 164 H72 V184 H64 Z
        M78 164 H86 V184 H78 Z
        M93 164 H107 V184 H93 Z
        M114 164 H122 V184 H114 Z
        M128 164 H136 V184 H128 Z`,
    },
    { rule: 'nonzero',
      d: `
        M107.2 79.2 H132.8 V84.8 H107.2 Z M67.2 89.2 H92.8 V94.8 H67.2 Z M107.2 89.2 H132.8 V94.8 H107.2 Z M72.2 94.2 H87.8 V99.8 H72.2 Z M112.2 94.2 H127.8 V99.8 H112.2 Z M122.2 99.2 H127.8 V104.8 H122.2 Z M112.2 104.2 H122.8 V109.8 H112.2 Z M77.2 109.2 H112.8 V114.8 H77.2 Z`,
    },
  ],
  // shocked: eyes blown wide with tiny pupils, mouth gapes open
  shocked: [
    {
      d: `
        M50 40 L62 24 L84 24 L84 44 L116 44 L116 24 L138 24 L150 40 L150 70 L164 78 L164 118 L150 126 L150 140 L140 150 L140 160 L60 160 L60 150 L50 140 L50 126 L36 118 L36 78 L50 70 Z
        M56 76 H144 Q152 76 152 84 V110 Q152 118 144 118 H56 Q48 118 48 110 V84 Q48 76 56 76 Z
        M52 130 H64 V134 H52 Z
        M136 130 H148 V134 H136 Z
        M64 164 H72 V190 H64 Z
        M78 164 H86 V190 H78 Z
        M93 164 H107 V190 H93 Z
        M114 164 H122 V190 H114 Z
        M128 164 H136 V190 H128 Z`,
    },
    { rule: 'nonzero',
      d: `
        M67.2 79.2 H87.8 V84.8 H67.2 Z M112.2 79.2 H132.8 V84.8 H112.2 Z M67.2 84.2 H72.8 V89.8 H67.2 Z M82.2 84.2 H87.8 V89.8 H82.2 Z M112.2 84.2 H117.8 V89.8 H112.2 Z M127.2 84.2 H132.8 V89.8 H127.2 Z M67.2 89.2 H72.8 V94.8 H67.2 Z M82.2 89.2 H87.8 V94.8 H82.2 Z M112.2 89.2 H117.8 V94.8 H112.2 Z M127.2 89.2 H132.8 V94.8 H127.2 Z M67.2 94.2 H87.8 V99.8 H67.2 Z M112.2 94.2 H132.8 V99.8 H112.2 Z M92.2 99.2 H107.8 V104.8 H92.2 Z M92.2 104.2 H97.8 V109.8 H92.2 Z M102.2 104.2 H107.8 V109.8 H102.2 Z M92.2 109.2 H107.8 V114.8 H92.2 Z`,
    },
  ],
  // worried: inner brows raised, small eyes, wobbly mouth
  worried: [
    {
      d: `
        M50 40 L62 24 L84 24 L84 44 L116 44 L116 24 L138 24 L150 40 L150 70 L164 78 L164 118 L150 126 L150 140 L140 150 L140 160 L60 160 L60 150 L50 140 L50 126 L36 118 L36 78 L50 70 Z
        M56 76 H144 Q152 76 152 84 V110 Q152 118 144 118 H56 Q48 118 48 110 V84 Q48 76 56 76 Z
        M52 130 H64 V134 H52 Z
        M136 130 H148 V134 H136 Z
        M64 164 H72 V173 H64 Z
        M78 164 H86 V173 H78 Z
        M93 164 H107 V173 H93 Z
        M114 164 H122 V173 H114 Z
        M128 164 H136 V173 H128 Z`,
    },
    { rule: 'nonzero',
      d: `
        M77.2 79.2 H87.8 V84.8 H77.2 Z M112.2 79.2 H122.8 V84.8 H112.2 Z M67.2 84.2 H77.8 V89.8 H67.2 Z M122.2 84.2 H132.8 V89.8 H122.2 Z M72.2 89.2 H82.8 V94.8 H72.2 Z M117.2 89.2 H127.8 V94.8 H117.2 Z M72.2 94.2 H82.8 V99.8 H72.2 Z M117.2 94.2 H127.8 V99.8 H117.2 Z M82.2 104.2 H92.8 V109.8 H82.2 Z M107.2 104.2 H117.8 V109.8 H107.2 Z M92.2 109.2 H107.8 V114.8 H92.2 Z`,
    },
  ],
  // angry: slanted V eyes, brow slash, fanged mouth
  angry: [
    {
      d: `
        M50 40 L62 24 L84 24 L84 44 L116 44 L116 24 L138 24 L150 40 L150 70 L164 78 L164 118 L150 126 L150 140 L140 150 L140 160 L60 160 L60 150 L50 140 L50 126 L36 118 L36 78 L50 70 Z
        M56 76 H144 Q152 76 152 84 V110 Q152 118 144 118 H56 Q48 118 48 110 V84 Q48 76 56 76 Z
        M52 130 H64 V134 H52 Z
        M136 130 H148 V134 H136 Z
        M64 164 H72 L68 186 Z
        M78 164 H86 L82 186 Z
        M93 164 H107 L100 190 Z
        M114 164 H122 L118 186 Z
        M128 164 H136 L132 186 Z`,
    },
    { rule: 'nonzero',
      d: `
        M67.2 79.2 H77.8 V84.8 H67.2 Z M122.2 79.2 H132.8 V84.8 H122.2 Z M77.2 84.2 H87.8 V89.8 H77.2 Z M112.2 84.2 H122.8 V89.8 H112.2 Z M77.2 89.2 H87.8 V94.8 H77.2 Z M112.2 89.2 H122.8 V94.8 H112.2 Z M77.2 94.2 H87.8 V99.8 H77.2 Z M112.2 94.2 H122.8 V99.8 H112.2 Z M77.2 104.2 H122.8 V109.8 H77.2 Z M77.2 109.2 H82.8 V114.8 H77.2 Z M87.2 109.2 H92.8 V114.8 H87.2 Z M97.2 109.2 H102.8 V114.8 H97.2 Z M107.2 109.2 H112.8 V114.8 H107.2 Z M117.2 109.2 H122.8 V114.8 H117.2 Z`,
    },
  ],
  // victory: beaming arches, huge open grin, both hands raised
  victory: [
    {
      d: `
        M50 40 L62 24 L84 24 L84 44 L116 44 L116 24 L138 24 L150 40 L150 70 L164 78 L164 118 L150 126 L150 140 L140 150 L140 160 L60 160 L60 150 L50 140 L50 126 L36 118 L36 78 L50 70 Z
        M56 76 H144 Q152 76 152 84 V110 Q152 118 144 118 H56 Q48 118 48 110 V84 Q48 76 56 76 Z
        M52 130 H64 V134 H52 Z
        M136 130 H148 V134 H136 Z
        M64 164 H72 V188 H64 Z
        M78 164 H86 V182 H78 Z
        M93 164 H107 V176 H93 Z
        M114 164 H122 V182 H114 Z
        M128 164 H136 V188 H128 Z`,
    },
    { rule: 'nonzero',
      d: `
        M77.2 84.2 H82.8 V89.8 H77.2 Z M117.2 84.2 H122.8 V89.8 H117.2 Z M72.2 89.2 H87.8 V94.8 H72.2 Z M112.2 89.2 H127.8 V94.8 H112.2 Z M77.2 94.2 H82.8 V99.8 H77.2 Z M117.2 94.2 H122.8 V99.8 H117.2 Z M72.2 99.2 H127.8 V104.8 H72.2 Z M77.2 104.2 H122.8 V109.8 H77.2 Z M82.2 109.2 H117.8 V114.8 H82.2 Z`,
    },
    { rule: 'nonzero',
      d: `
        M11.5 76.9 L3.5 52.2 L8.3 50.7 L11.3 60.2 L12.6 59.8 L8.6 47.4 L13.3 45.9 L17.3 58.2 L18.7 57.8 L14 43.5 L18.8 42 L23.4 56.2 L24.7 55.8 L20.6 43.5 L25.4 41.9 L29.1 53.3 L33.3 43.6 L38 45.2 L31.9 61.9 L34.4 69.5 Z M188.5 76.9 L196.5 52.2 L191.7 50.7 L188.7 60.2 L187.4 59.8 L191.4 47.4 L186.7 45.9 L182.7 58.2 L181.3 57.8 L186 43.5 L181.2 42 L176.6 56.2 L175.3 55.8 L179.4 43.5 L174.6 41.9 L170.9 53.3 L166.7 43.6 L162 45.2 L168.1 61.9 L165.6 69.5 Z`,
    },
  ],
  // defeat: X-eyes and a deep frown
  defeat: [
    {
      d: `
        M50 40 L62 24 L84 24 L84 44 L116 44 L116 24 L138 24 L150 40 L150 70 L164 78 L164 118 L150 126 L150 140 L140 150 L140 160 L60 160 L60 150 L50 140 L50 126 L36 118 L36 78 L50 70 Z
        M56 76 H144 Q152 76 152 84 V110 Q152 118 144 118 H56 Q48 118 48 110 V84 Q48 76 56 76 Z
        M52 130 H64 V134 H52 Z
        M136 130 H148 V134 H136 Z
        M64 164 H72 V173 H64 Z
        M78 164 H86 V173 H78 Z
        M93 164 H107 V173 H93 Z
        M114 164 H122 V173 H114 Z
        M128 164 H136 V173 H128 Z`,
    },
    { rule: 'nonzero',
      d: `
        M72.2 84.2 H77.8 V89.8 H72.2 Z M82.2 84.2 H87.8 V89.8 H82.2 Z M112.2 84.2 H117.8 V89.8 H112.2 Z M122.2 84.2 H127.8 V89.8 H122.2 Z M77.2 89.2 H82.8 V94.8 H77.2 Z M117.2 89.2 H122.8 V94.8 H117.2 Z M72.2 94.2 H77.8 V99.8 H72.2 Z M82.2 94.2 H87.8 V99.8 H82.2 Z M112.2 94.2 H117.8 V99.8 H112.2 Z M122.2 94.2 H127.8 V99.8 H122.2 Z M92.2 104.2 H107.8 V109.8 H92.2 Z M82.2 109.2 H92.8 V114.8 H82.2 Z M107.2 109.2 H117.8 V114.8 H107.2 Z`,
    },
  ],
  // taunt: wink, mouth open with tongue sticking out
  taunt: [
    {
      d: `
        M50 40 L62 24 L84 24 L84 44 L116 44 L116 24 L138 24 L150 40 L150 70 L164 78 L164 118 L150 126 L150 140 L140 150 L140 160 L60 160 L60 150 L50 140 L50 126 L36 118 L36 78 L50 70 Z
        M56 76 H144 Q152 76 152 84 V110 Q152 118 144 118 H56 Q48 118 48 110 V84 Q48 76 56 76 Z
        M52 130 H64 V134 H52 Z
        M136 130 H148 V134 H136 Z
        M64 164 H72 V184 H64 Z
        M78 164 H86 V184 H78 Z
        M93 164 H107 V184 H93 Z
        M114 164 H122 V184 H114 Z
        M128 164 H136 V184 H128 Z`,
    },
    { rule: 'nonzero',
      d: `
        M112.2 84.2 H132.8 V89.8 H112.2 Z M67.2 89.2 H87.8 V94.8 H67.2 Z M112.2 89.2 H132.8 V94.8 H112.2 Z M112.2 94.2 H132.8 V99.8 H112.2 Z M77.2 104.2 H122.8 V109.8 H77.2 Z M102.2 109.2 H117.8 V114.8 H102.2 Z`,
    },
  ],
  // devil: angry face plus horns growing out of the head
  devil: [
    {
      d: `
        M50 40 L62 24 L84 24 L84 44 L116 44 L116 24 L138 24 L150 40 L150 70 L164 78 L164 118 L150 126 L150 140 L140 150 L140 160 L60 160 L60 150 L50 140 L50 126 L36 118 L36 78 L50 70 Z
        M56 76 H144 Q152 76 152 84 V110 Q152 118 144 118 H56 Q48 118 48 110 V84 Q48 76 56 76 Z
        M52 130 H64 V134 H52 Z
        M136 130 H148 V134 H136 Z
        M64 164 H72 L68 186 Z
        M78 164 H86 L82 186 Z
        M93 164 H107 L100 190 Z
        M114 164 H122 L118 186 Z
        M128 164 H136 L132 186 Z`,
    },
    { rule: 'nonzero',
      d: `
        M67.2 79.2 H77.8 V84.8 H67.2 Z M122.2 79.2 H132.8 V84.8 H122.2 Z M77.2 84.2 H87.8 V89.8 H77.2 Z M112.2 84.2 H122.8 V89.8 H112.2 Z M77.2 89.2 H87.8 V94.8 H77.2 Z M112.2 89.2 H122.8 V94.8 H112.2 Z M77.2 94.2 H87.8 V99.8 H77.2 Z M112.2 94.2 H122.8 V99.8 H112.2 Z M72.2 99.2 H127.8 V104.8 H72.2 Z M72.2 104.2 H127.8 V109.8 H72.2 Z M77.2 109.2 H82.8 V114.8 H77.2 Z M117.2 109.2 H122.8 V114.8 H117.2 Z`,
    },
    { rule: 'nonzero',
      d: `
        M65.9 36.3 Q64.4 12.5 48 2 Q66.7 10.5 80.1 23.7 Z M119.9 23.7 Q128.5 6.2 152 2 Q140.4 16.8 134.1 36.3 Z`,
    },
  ],
  // wave: happy face, both hands shown at the sides
  wave: [
    {
      d: `
        M50 40 L62 24 L84 24 L84 44 L116 44 L116 24 L138 24 L150 40 L150 70 L164 78 L164 118 L150 126 L150 140 L140 150 L140 160 L60 160 L60 150 L50 140 L50 126 L36 118 L36 78 L50 70 Z
        M56 76 H144 Q152 76 152 84 V110 Q152 118 144 118 H56 Q48 118 48 110 V84 Q48 76 56 76 Z
        M52 130 H64 V134 H52 Z
        M136 130 H148 V134 H136 Z
        M64 164 H72 V188 H64 Z
        M78 164 H86 V182 H78 Z
        M93 164 H107 V176 H93 Z
        M114 164 H122 V182 H114 Z
        M128 164 H136 V188 H128 Z`,
    },
    { rule: 'nonzero',
      d: `
        M77.2 84.2 H82.8 V89.8 H77.2 Z M117.2 84.2 H122.8 V89.8 H117.2 Z M72.2 89.2 H77.8 V94.8 H72.2 Z M82.2 89.2 H87.8 V94.8 H82.2 Z M112.2 89.2 H117.8 V94.8 H112.2 Z M122.2 89.2 H127.8 V94.8 H122.2 Z M67.2 94.2 H72.8 V99.8 H67.2 Z M87.2 94.2 H92.8 V99.8 H87.2 Z M107.2 94.2 H112.8 V99.8 H107.2 Z M127.2 94.2 H132.8 V99.8 H127.2 Z M82.2 104.2 H117.8 V109.8 H82.2 Z M87.2 109.2 H112.8 V114.8 H87.2 Z`,
    },
    { rule: 'nonzero',
      d: `
        M9.2 118.4 L2.9 93.2 L7.8 92 L10.2 101.7 L11.5 101.4 L8.3 88.8 L13.2 87.6 L16.3 100.2 L17.7 99.8 L14.1 85.3 L18.9 84.1 L22.5 98.6 L23.8 98.3 L20.6 85.7 L25.5 84.5 L28.4 96.1 L33.3 86.7 L37.9 88.6 L30.6 104.9 L32.5 112.6 Z M190.8 118.4 L197.1 93.2 L192.2 92 L189.8 101.7 L188.5 101.4 L191.7 88.8 L186.8 87.6 L183.7 100.2 L182.3 99.8 L185.9 85.3 L181.1 84.1 L177.5 98.6 L176.2 98.3 L179.4 85.7 L174.5 84.5 L171.6 96.1 L166.7 86.7 L162.1 88.6 L169.4 104.9 L167.5 112.6 Z`,
    },
  ],
};

/* ----------------------------------------------------------------------------
 * STATIC JESTER  (boxy visor head: slanted visors, grille mouth, antenna that droops or stretches)
 * ---------------------------------------------------------------------------- */
const JESTER: BotFaces = {
  // neutral: original face, untouched
  neutral: [
    {
      d: `
        M54 56 H146 Q164 56 164 74 V128 Q164 162 130 162 H70 Q36 162 36 128 V74 Q36 56 54 56 Z
        M100 64 L108 72 L100 80 L92 72 Z
        M50 88 L86 98 L82 116 L54 108 Z
        M150 88 L114 98 L118 116 L146 108 Z
        M62 100 L76 103 L74 110 L64 107 Z
        M138 100 L124 103 L126 110 L136 107 Z
        M56 128 H144 V150 H56 Z
        M67 131 L73 131 L73 147 L67 147 Z
        M79 131 L85 131 L85 147 L79 147 Z
        M91 131 L97 131 L97 147 L91 147 Z
        M103 131 L109 131 L109 147 L103 147 Z
        M115 131 L121 131 L121 147 L115 147 Z
        M127 131 L133 131 L133 147 L127 147 Z`,
    },
    { rule: 'nonzero',
      d: `
        M14 84 H28 V120 H14 Z
        M172 84 H186 V120 H172 Z
        M66 56 L62 32 H68 L74 56 Z
        M134 56 L138 32 H132 L126 56 Z
        M58 24 A7 7 0 1 0 72 24 A7 7 0 1 0 58 24 Z
        M128 24 A7 7 0 1 0 142 24 A7 7 0 1 0 128 24 Z`,
    },
  ],
  // thinking: one eye squints, the other opens wide, mouth goes flat
  thinking: [
    {
      d: `
        M54 56 H146 Q164 56 164 74 V128 Q164 162 130 162 H70 Q36 162 36 128 V74 Q36 56 54 56 Z
        M100 64 L108 72 L100 80 L92 72 Z
        M50 99 L86 100 L86 106 L50 105 Z
        M114 82 L150 88 L148 118 L116 116 Z
        M128 96 L138 97 L137 108 L128 107 Z
        M78 134 H134 V146 H78 Z
        M88 137 H93 V143 H88 Z
        M100 137 H105 V143 H100 Z
        M112 137 H117 V143 H112 Z`,
    },
    { rule: 'nonzero',
      d: `
        M14 84 H28 V120 H14 Z
        M172 84 H186 V120 H172 Z
        M66 56 L62 32 H68 L74 56 Z
        M134 56 L138 32 H132 L126 56 Z
        M58 24 A7 7 0 1 0 72 24 A7 7 0 1 0 58 24 Z
        M128 24 A7 7 0 1 0 142 24 A7 7 0 1 0 128 24 Z`,
    },
  ],
  // happy: eyes become smiling arches, wide smile
  happy: [
    {
      d: `
        M54 56 H146 Q164 56 164 74 V128 Q164 162 130 162 H70 Q36 162 36 128 V74 Q36 56 54 56 Z
        M100 64 L108 72 L100 80 L92 72 Z
        M48 114 Q68 78 90 114 L80 116 Q68 94 58 116 Z
        M152 114 Q132 78 110 114 L120 116 Q132 94 142 116 Z
        M54 124 H146 Q142 156 100 156 Q58 156 54 124 Z
        M67 128 L73 128 L73 149.5 L67 146.8 Z
        M79 128 L85 128 L85 153.3 L79 151.7 Z
        M91 128 L97 128 L97 154.9 L91 154.4 Z
        M103 128 L109 128 L109 154.4 L103 154.9 Z
        M115 128 L121 128 L121 151.7 L115 153.3 Z
        M127 128 L133 128 L133 146.8 L127 149.5 Z`,
    },
    { rule: 'nonzero',
      d: `
        M14 84 H28 V120 H14 Z
        M172 84 H186 V120 H172 Z
        M66 56 L62 32 H68 L74 56 Z
        M134 56 L138 32 H132 L126 56 Z
        M58 24 A7 7 0 1 0 72 24 A7 7 0 1 0 58 24 Z
        M128 24 A7 7 0 1 0 142 24 A7 7 0 1 0 128 24 Z`,
    },
  ],
  // smug: half-lidded eye, raised brow, lopsided smirk
  smug: [
    {
      d: `
        M54 56 H146 Q164 56 164 74 V128 Q164 162 130 162 H70 Q36 162 36 128 V74 Q36 56 54 56 Z
        M100 64 L108 72 L100 80 L92 72 Z
        M50 94 L86 100 L82 116 L54 110 Z
        M114 101 L150 92 L146 106 L118 116 Z
        M64 101 L78 104 L76 111 L66 108 Z
        M56 138 L144 124 L144 146 L56 152 Z
        M67 139.5 L73 138.7 L73 147.8 L67 148.3 Z
        M79 137.9 L85 137 L85 147 L79 147.4 Z
        M91 136.2 L97 135.4 L97 146.2 L91 146.6 Z
        M103 134.6 L109 133.8 L109 145.4 L103 145.8 Z
        M115 133 L121 132.1 L121 144.6 L115 145 Z
        M127 131.3 L133 130.5 L133 143.8 L127 144.2 Z`,
    },
    { rule: 'nonzero',
      d: `
        M14 84 H28 V120 H14 Z
        M172 84 H186 V120 H172 Z
        M66 56 L62 32 H68 L74 56 Z
        M134 56 L138 32 H132 L126 56 Z
        M58 24 A7 7 0 1 0 72 24 A7 7 0 1 0 58 24 Z
        M128 24 A7 7 0 1 0 142 24 A7 7 0 1 0 128 24 Z`,
    },
  ],
  // shocked: eyes blown wide with tiny pupils, mouth gapes open
  shocked: [
    {
      d: `
        M54 56 H146 Q164 56 164 74 V128 Q164 162 130 162 H70 Q36 162 36 128 V74 Q36 56 54 56 Z
        M100 64 L108 72 L100 80 L92 72 Z
        M46 80 L90 84 L90 120 L46 118 Z
        M154 80 L110 84 L110 120 L154 118 Z
        M64 96 H74 V106 H64 Z
        M126 96 H136 V106 H126 Z
        M76 122 H124 V156 H76 Z
        M82 125 H90 V133 H82 Z
        M96 125 H104 V133 H96 Z
        M110 125 H118 V133 H110 Z`,
    },
    { rule: 'nonzero',
      d: `
        M14 84 H28 V120 H14 Z
        M172 84 H186 V120 H172 Z
        M66 56 L60 22 H66 L74 56 Z
        M134 56 L140 22 H134 L126 56 Z
        M56 14 A7 7 0 1 0 70 14 A7 7 0 1 0 56 14 Z
        M130 14 A7 7 0 1 0 144 14 A7 7 0 1 0 130 14 Z`,
    },
  ],
  // worried: inner brows raised, small eyes, wobbly mouth
  worried: [
    {
      d: `
        M54 56 H146 Q164 56 164 74 V128 Q164 162 130 162 H70 Q36 162 36 128 V74 Q36 56 54 56 Z
        M100 64 L108 72 L100 80 L92 72 Z
        M50 108 L88 90 L84 116 L54 116 Z
        M150 108 L112 90 L116 116 L146 116 Z
        M64 106 L76 100 L76 110 L66 112 Z
        M136 106 L124 100 L124 110 L134 112 Z
        M56 142 L72 132 L88 142 L104 132 L120 142 L136 132 L144 138 L144 152 L56 152 Z`,
    },
    { rule: 'nonzero',
      d: `
        M14 84 H28 V120 H14 Z
        M172 84 H186 V120 H172 Z
        M66 56 L62 32 H68 L74 56 Z
        M134 56 L138 32 H132 L126 56 Z
        M58 24 A7 7 0 1 0 72 24 A7 7 0 1 0 58 24 Z
        M128 24 A7 7 0 1 0 142 24 A7 7 0 1 0 128 24 Z`,
    },
  ],
  // angry: slanted V eyes, brow slash, fanged mouth
  angry: [
    {
      d: `
        M54 56 H146 Q164 56 164 74 V128 Q164 162 130 162 H70 Q36 162 36 128 V74 Q36 56 54 56 Z
        M100 64 L108 72 L100 80 L92 72 Z
        M44 82 L90 102 L86 120 L50 112 Z
        M156 82 L110 102 L114 120 L150 112 Z
        M60 102 L80 108 L76 114 L62 110 Z
        M140 102 L120 108 L124 114 L138 110 Z
        M56 126 H144 V152 H56 Z
        M60 129 L72 129 L66 141 Z
        M78 129 L90 129 L84 141 Z
        M96 129 L108 129 L102 141 Z
        M114 129 L126 129 L120 141 Z
        M132 129 L144 129 L138 141 Z
        M69 149 L81 149 L75 137 Z
        M87 149 L99 149 L93 137 Z
        M105 149 L117 149 L111 137 Z
        M123 149 L135 149 L129 137 Z`,
    },
    { rule: 'nonzero',
      d: `
        M14 84 H28 V120 H14 Z
        M172 84 H186 V120 H172 Z
        M66 56 L62 32 H68 L74 56 Z
        M134 56 L138 32 H132 L126 56 Z
        M58 24 A7 7 0 1 0 72 24 A7 7 0 1 0 58 24 Z
        M128 24 A7 7 0 1 0 142 24 A7 7 0 1 0 128 24 Z`,
    },
  ],
  // victory: beaming arches, huge open grin, both hands raised
  victory: [
    {
      d: `
        M54 56 H146 Q164 56 164 74 V128 Q164 162 130 162 H70 Q36 162 36 128 V74 Q36 56 54 56 Z
        M100 64 L108 72 L100 80 L92 72 Z
        M48 114 Q68 78 90 114 L80 116 Q68 94 58 116 Z
        M152 114 Q132 78 110 114 L120 116 Q132 94 142 116 Z
        M54 124 H146 Q142 156 100 156 Q58 156 54 124 Z
        M67 128 L73 128 L73 149.5 L67 146.8 Z
        M79 128 L85 128 L85 153.3 L79 151.7 Z
        M91 128 L97 128 L97 154.9 L91 154.4 Z
        M103 128 L109 128 L109 154.4 L103 154.9 Z
        M115 128 L121 128 L121 151.7 L115 153.3 Z
        M127 128 L133 128 L133 146.8 L127 149.5 Z`,
    },
    { rule: 'nonzero',
      d: `
        M14 84 H28 V120 H14 Z
        M172 84 H186 V120 H172 Z
        M66 56 L62 32 H68 L74 56 Z
        M134 56 L138 32 H132 L126 56 Z
        M58 24 A7 7 0 1 0 72 24 A7 7 0 1 0 58 24 Z
        M128 24 A7 7 0 1 0 142 24 A7 7 0 1 0 128 24 Z`,
    },
    { rule: 'nonzero',
      d: `
        M7.2 77.8 L0.4 54 L5 52.7 L7.6 61.8 L8.8 61.5 L5.4 49.6 L10 48.3 L13.4 60.2 L14.6 59.8 L10.7 46.1 L15.3 44.8 L19.2 58.5 L20.4 58.2 L17 46.3 L21.6 45 L24.7 55.9 L29 46.8 L33.4 48.5 L27.1 64.2 L29.1 71.5 Z M192.8 77.8 L199.6 54 L195 52.7 L192.4 61.8 L191.2 61.5 L194.6 49.6 L190 48.3 L186.6 60.2 L185.4 59.8 L189.3 46.1 L184.7 44.8 L180.8 58.5 L179.6 58.2 L183 46.3 L178.4 45 L175.3 55.9 L171 46.8 L166.6 48.5 L172.9 64.2 L170.9 71.5 Z`,
    },
  ],
  // defeat: X-eyes and a deep frown
  defeat: [
    {
      d: `
        M54 56 H146 Q164 56 164 74 V128 Q164 162 130 162 H70 Q36 162 36 128 V74 Q36 56 54 56 Z
        M100 64 L108 72 L100 80 L92 72 Z
        M57.2 87 L68 97.8 L78.8 87 L83 91.2 L72.2 102 L83 112.8 L78.8 117 L68 106.2 L57.2 117 L53 112.8 L63.8 102 L53 91.2 Z
        M121.2 87 L132 97.8 L142.8 87 L147 91.2 L136.2 102 L147 112.8 L142.8 117 L132 106.2 L121.2 117 L117 112.8 L127.8 102 L117 91.2 Z
        M56 152 Q100 120 144 152 L136 154 Q100 134 64 154 Z`,
    },
    { rule: 'nonzero',
      d: `
        M14 84 H28 V120 H14 Z
        M172 84 H186 V120 H172 Z
        M66 56 L48 46 L51 40 L74 52 Z
        M134 56 L152 46 L149 40 L126 52 Z
        M40 43 A7 7 0 1 0 54 43 A7 7 0 1 0 40 43 Z
        M146 43 A7 7 0 1 0 160 43 A7 7 0 1 0 146 43 Z`,
    },
  ],
  // taunt: wink, mouth open with tongue sticking out
  taunt: [
    {
      d: `
        M54 56 H146 Q164 56 164 74 V128 Q164 162 130 162 H70 Q36 162 36 128 V74 Q36 56 54 56 Z
        M100 64 L108 72 L100 80 L92 72 Z
        M50 88 L86 98 L82 116 L54 108 Z
        M114 104 L150 100 L150 108 L114 112 Z
        M62 100 L76 103 L74 110 L64 107 Z
        M56 126 H144 V148 H56 Z
        M67 129 H73 V137 H67 Z
        M79 129 H85 V137 H79 Z
        M91 129 H97 V137 H91 Z
        M103 129 H109 V137 H103 Z
        M115 129 H121 V137 H115 Z
        M127 129 H133 V137 H127 Z`,
    },
    { rule: 'nonzero',
      d: `
        M14 84 H28 V120 H14 Z
        M172 84 H186 V120 H172 Z
        M66 56 L62 32 H68 L74 56 Z
        M134 56 L138 32 H132 L126 56 Z
        M58 24 A7 7 0 1 0 72 24 A7 7 0 1 0 58 24 Z
        M128 24 A7 7 0 1 0 142 24 A7 7 0 1 0 128 24 Z`,
    },
    {
      d: `
        M96 140 H122 V168 Q109 182 96 168 Z M108 152 H110 V170 H108 Z`,
    },
  ],
  // devil: angry face plus horns growing out of the head
  devil: [
    {
      d: `
        M54 56 H146 Q164 56 164 74 V128 Q164 162 130 162 H70 Q36 162 36 128 V74 Q36 56 54 56 Z
        M100 64 L108 72 L100 80 L92 72 Z
        M44 82 L90 102 L86 120 L50 112 Z
        M156 82 L110 102 L114 120 L150 112 Z
        M60 102 L80 108 L76 114 L62 110 Z
        M140 102 L120 108 L124 114 L138 110 Z
        M56 126 H144 V152 H56 Z
        M60 129 L72 129 L66 141 Z
        M78 129 L90 129 L84 141 Z
        M96 129 L108 129 L102 141 Z
        M114 129 L126 129 L120 141 Z
        M132 129 L144 129 L138 141 Z
        M69 149 L81 149 L75 137 Z
        M87 149 L99 149 L93 137 Z
        M105 149 L117 149 L111 137 Z
        M123 149 L135 149 L129 137 Z`,
    },
    { rule: 'nonzero',
      d: `
        M14 84 H28 V120 H14 Z
        M172 84 H186 V120 H172 Z`,
    },
    { rule: 'nonzero',
      d: `
        M72.5 65 Q70.6 35.9 52 18 Q72.7 34.6 87.5 55 Z M112.5 55 Q121.9 31 148 18 Q134.8 39.6 127.5 65 Z`,
    },
  ],
  // wave: happy face, both hands shown at the sides
  wave: [
    {
      d: `
        M54 56 H146 Q164 56 164 74 V128 Q164 162 130 162 H70 Q36 162 36 128 V74 Q36 56 54 56 Z
        M100 64 L108 72 L100 80 L92 72 Z
        M48 114 Q68 78 90 114 L80 116 Q68 94 58 116 Z
        M152 114 Q132 78 110 114 L120 116 Q132 94 142 116 Z
        M54 124 H146 Q142 156 100 156 Q58 156 54 124 Z
        M67 128 L73 128 L73 149.5 L67 146.8 Z
        M79 128 L85 128 L85 153.3 L79 151.7 Z
        M91 128 L97 128 L97 154.9 L91 154.4 Z
        M103 128 L109 128 L109 154.4 L103 154.9 Z
        M115 128 L121 128 L121 151.7 L115 153.3 Z
        M127 128 L133 128 L133 146.8 L127 149.5 Z`,
    },
    { rule: 'nonzero',
      d: `
        M14 84 H28 V120 H14 Z
        M172 84 H186 V120 H172 Z
        M66 56 L62 32 H68 L74 56 Z
        M134 56 L138 32 H132 L126 56 Z
        M58 24 A7 7 0 1 0 72 24 A7 7 0 1 0 58 24 Z
        M128 24 A7 7 0 1 0 142 24 A7 7 0 1 0 128 24 Z`,
    },
    { rule: 'nonzero',
      d: `
        M6 167.2 L0.9 143.1 L5.5 142.1 L7.5 151.4 L8.7 151.1 L6.1 139 L10.8 138.1 L13.3 150.1 L14.7 149.9 L11.7 135.9 L16.3 134.9 L19.3 148.9 L20.5 148.6 L17.9 136.5 L22.6 135.5 L25 146.7 L29.9 137.9 L34.2 139.9 L26.7 155.1 L28.3 162.5 Z M194 167.2 L199.1 143.1 L194.5 142.1 L192.5 151.4 L191.3 151.1 L193.9 139 L189.2 138.1 L186.7 150.1 L185.3 149.9 L188.3 135.9 L183.7 134.9 L180.7 148.9 L179.5 148.6 L182.1 136.5 L177.4 135.5 L175 146.7 L170.1 137.9 L165.8 139.9 L173.3 155.1 L171.7 162.5 Z`,
    },
  ],
};

/* ----------------------------------------------------------------------------
 * OCTAVIAN HOLLOW  (hollow skull: eye sockets reshape, jaw/teeth change, halo on victory)
 * ---------------------------------------------------------------------------- */
const OCTAVIAN: BotFaces = {
  // neutral: original face, untouched
  neutral: [
    {
      d: `
        M80 40 H120 L148 66 V112 L130 128 V146 H116 V164 L108 170 H92 L84 164 V146 H70 V128 L52 112 V66 Z
        M70 82 L76 76 L84 76 L90 82 L90 94 L84 100 L76 100 L70 94 Z
        M130 82 L124 76 L116 76 L110 82 L110 94 L116 100 L124 100 L130 94 Z
        M96 108 H104 V122 H96 Z
        M88 148 H91 V162 H88 Z
        M109 148 H112 V162 H109 Z`,
    },
    { rule: 'nonzero',
      d: `
        M82 24 L90 14 H110 L118 24 H110 L104 18 H96 L90 24 Z
        M22 118 H36 V150 H58 V164 H22 Z
        M178 118 H164 V150 H142 V164 H178 Z`,
    },
  ],
  // thinking: one eye squints, the other opens wide, mouth goes flat
  thinking: [
    {
      d: `
        M80 40 H120 L148 66 V112 L130 128 V146 H116 V164 L108 170 H92 L84 164 V146 H70 V128 L52 112 V66 Z
        M70 90 L90 90 L90 95 L70 95 Z
        M108 80 L116 72 L126 72 L134 80 L134 98 L126 104 L116 104 L108 98 Z
        M117 86 H125 V94 H117 Z
        M96 108 H104 V122 H96 Z
        M86 132 H112 V136 H86 Z
        M88 148 H91 V162 H88 Z
        M109 148 H112 V162 H109 Z`,
    },
    { rule: 'nonzero',
      d: `
        M82 24 L90 14 H110 L118 24 H110 L104 18 H96 L90 24 Z
        M22 118 H36 V150 H58 V164 H22 Z
        M178 118 H164 V150 H142 V164 H178 Z`,
    },
  ],
  // happy: eyes become smiling arches, wide smile
  happy: [
    {
      d: `
        M80 40 H120 L148 66 V112 L130 128 V146 H116 V164 L108 170 H92 L84 164 V146 H70 V128 L52 112 V66 Z
        M68 98 Q80 68 92 98 L85 100 Q80 86 75 100 Z
        M132 98 Q120 68 108 98 L115 100 Q120 86 125 100 Z
        M96 108 H104 V122 H96 Z
        M76 130 Q100 154 124 130 L120 128 Q100 144 80 128 Z`,
    },
    { rule: 'nonzero',
      d: `
        M82 24 L90 14 H110 L118 24 H110 L104 18 H96 L90 24 Z
        M22 118 H36 V150 H58 V164 H22 Z
        M178 118 H164 V150 H142 V164 H178 Z`,
    },
  ],
  // smug: half-lidded eye, raised brow, lopsided smirk
  smug: [
    {
      d: `
        M80 40 H120 L148 66 V112 L130 128 V146 H116 V164 L108 170 H92 L84 164 V146 H70 V128 L52 112 V66 Z
        M70 88 L90 84 L90 94 L84 100 L76 100 L70 94 Z
        M130 82 L124 76 L116 76 L110 82 L110 94 L116 100 L124 100 L130 94 Z
        M113 86 H121 V94 H113 Z
        M96 108 H104 V122 H96 Z
        M80 138 L96 138 L118 128 L120 133 L98 143 L80 143 Z`,
    },
    { rule: 'nonzero',
      d: `
        M82 24 L90 14 H110 L118 24 H110 L104 18 H96 L90 24 Z
        M22 118 H36 V150 H58 V164 H22 Z
        M178 118 H164 V150 H142 V164 H178 Z`,
    },
  ],
  // shocked: eyes blown wide with tiny pupils, mouth gapes open
  shocked: [
    {
      d: `
        M80 40 H120 L148 66 V112 L130 128 V146 H116 V164 L108 170 H92 L84 164 V146 H70 V128 L52 112 V66 Z
        M68 90 A12 14 0 1 0 92 90 A12 14 0 1 0 68 90 Z
        M108 90 A12 14 0 1 0 132 90 A12 14 0 1 0 108 90 Z
        M76 90 A4 4 0 1 0 84 90 A4 4 0 1 0 76 90 Z
        M116 90 A4 4 0 1 0 124 90 A4 4 0 1 0 116 90 Z
        M96 108 H104 V122 H96 Z
        M91 138 A9 11 0 1 0 109 138 A9 11 0 1 0 91 138 Z`,
    },
    { rule: 'nonzero',
      d: `
        M82 24 L90 14 H110 L118 24 H110 L104 18 H96 L90 24 Z
        M22 118 H36 V150 H58 V164 H22 Z
        M178 118 H164 V150 H142 V164 H178 Z`,
    },
  ],
  // worried: inner brows raised, small eyes, wobbly mouth
  worried: [
    {
      d: `
        M80 40 H120 L148 66 V112 L130 128 V146 H116 V164 L108 170 H92 L84 164 V146 H70 V128 L52 112 V66 Z
        M70 96 L90 80 L90 96 L84 102 L76 102 Z
        M130 96 L110 80 L110 96 L116 102 L124 102 Z
        M96 108 H104 V122 H96 Z
        M84 138 L92 132 L100 138 L108 132 L116 138 L116 142 L108 136 L100 142 L92 136 L84 142 Z
        M88 148 H91 V162 H88 Z
        M109 148 H112 V162 H109 Z`,
    },
    { rule: 'nonzero',
      d: `
        M82 24 L90 14 H110 L118 24 H110 L104 18 H96 L90 24 Z
        M22 118 H36 V150 H58 V164 H22 Z
        M178 118 H164 V150 H142 V164 H178 Z`,
    },
  ],
  // angry: slanted V eyes, brow slash, fanged mouth
  angry: [
    {
      d: `
        M80 40 H120 L148 66 V112 L130 128 V146 H116 V164 L108 170 H92 L84 164 V146 H70 V128 L52 112 V66 Z
        M68 80 L90 92 L90 98 L84 102 L76 102 L68 96 Z
        M132 80 L110 92 L110 98 L116 102 L124 102 L132 96 Z
        M96 108 H104 V122 H96 Z
        M80 130 H120 V144 H80 Z
        M82 132 L90 132 L86 141 Z
        M91 132 L99 132 L95 141 Z
        M100 132 L108 132 L104 141 Z
        M109 132 L117 132 L113 141 Z
        M86 143 L94 143 L90 135 Z
        M96 143 L104 143 L100 135 Z
        M106 143 L114 143 L110 135 Z`,
    },
    { rule: 'nonzero',
      d: `
        M82 24 L90 14 H110 L118 24 H110 L104 18 H96 L90 24 Z
        M22 118 H36 V150 H58 V164 H22 Z
        M178 118 H164 V150 H142 V164 H178 Z`,
    },
  ],
  // victory: beaming arches, huge open grin, both hands raised
  victory: [
    {
      d: `
        M80 40 H120 L148 66 V112 L130 128 V146 H116 V164 L108 170 H92 L84 164 V146 H70 V128 L52 112 V66 Z
        M68 98 Q80 68 92 98 L85 100 Q80 86 75 100 Z
        M132 98 Q120 68 108 98 L115 100 Q120 86 125 100 Z
        M96 108 H104 V122 H96 Z
        M74 128 H126 Q124 152 100 152 Q76 152 74 128 Z
        M78 131 H122 V135 H78 Z`,
    },
    { rule: 'nonzero',
      d: `
        M82 24 L90 14 H110 L118 24 H110 L104 18 H96 L90 24 Z
        M22 118 H36 V150 H58 V164 H22 Z
        M178 118 H164 V150 H142 V164 H178 Z`,
    },
    { rule: 'nonzero',
      d: `
        M9.2 93.8 L2.4 70 L7 68.7 L9.6 77.8 L10.8 77.5 L7.4 65.6 L12 64.3 L15.4 76.2 L16.6 75.8 L12.7 62.1 L17.3 60.8 L21.2 74.5 L22.4 74.2 L19 62.3 L23.6 61 L26.7 71.9 L31 62.8 L35.4 64.5 L29.1 80.2 L31.1 87.5 Z M190.8 93.8 L197.6 70 L193 68.7 L190.4 77.8 L189.2 77.5 L192.6 65.6 L188 64.3 L184.6 76.2 L183.4 75.8 L187.3 62.1 L182.7 60.8 L178.8 74.5 L177.6 74.2 L181 62.3 L176.4 61 L173.3 71.9 L169 62.8 L164.6 64.5 L170.9 80.2 L168.9 87.5 Z`,
    },
    {
      d: `
        M78 7 A22 5 0 1 0 122 7 A22 5 0 1 0 78 7 Z M85 7 A15 2.2 0 1 0 115 7 A15 2.2 0 1 0 85 7 Z`,
    },
  ],
  // defeat: X-eyes and a deep frown
  defeat: [
    {
      d: `
        M80 40 H120 L148 66 V112 L130 128 V146 H116 V164 L108 170 H92 L84 164 V146 H70 V128 L52 112 V66 Z
        M72.5 79 L80 86.5 L87.5 79 L91 82.5 L83.5 90 L91 97.5 L87.5 101 L80 93.5 L72.5 101 L69 97.5 L76.5 90 L69 82.5 Z
        M112.5 79 L120 86.5 L127.5 79 L131 82.5 L123.5 90 L131 97.5 L127.5 101 L120 93.5 L112.5 101 L109 97.5 L116.5 90 L109 82.5 Z
        M96 108 H104 V122 H96 Z
        M80 144 Q100 126 120 144 L116 147 Q100 136 84 147 Z`,
    },
    { rule: 'nonzero',
      d: `
        M82 24 L90 14 H110 L118 24 H110 L104 18 H96 L90 24 Z
        M22 118 H36 V150 H58 V164 H22 Z
        M178 118 H164 V150 H142 V164 H178 Z`,
    },
  ],
  // taunt: wink, mouth open with tongue sticking out
  taunt: [
    {
      d: `
        M80 40 H120 L148 66 V112 L130 128 V146 H116 V164 L108 170 H92 L84 164 V146 H70 V128 L52 112 V66 Z
        M70 82 L76 76 L84 76 L90 82 L90 94 L84 100 L76 100 L70 94 Z
        M110 89 L130 89 L130 94 L110 94 Z
        M96 108 H104 V122 H96 Z
        M82 128 H118 V142 H82 Z
        M88 148 H91 V162 H88 Z
        M109 148 H112 V162 H109 Z`,
    },
    { rule: 'nonzero',
      d: `
        M82 24 L90 14 H110 L118 24 H110 L104 18 H96 L90 24 Z
        M22 118 H36 V150 H58 V164 H22 Z
        M178 118 H164 V150 H142 V164 H178 Z`,
    },
    {
      d: `
        M92 134 H108 V158 Q100 166 92 158 Z M99 136 H101 V144 H99 Z`,
    },
  ],
  // devil: angry face plus horns growing out of the head
  devil: [
    {
      d: `
        M80 40 H120 L148 66 V112 L130 128 V146 H116 V164 L108 170 H92 L84 164 V146 H70 V128 L52 112 V66 Z
        M68 80 L90 92 L90 98 L84 102 L76 102 L68 96 Z
        M132 80 L110 92 L110 98 L116 102 L124 102 L132 96 Z
        M96 108 H104 V122 H96 Z
        M80 130 H120 V144 H80 Z
        M82 132 L90 132 L86 141 Z
        M91 132 L99 132 L95 141 Z
        M100 132 L108 132 L104 141 Z
        M109 132 L117 132 L113 141 Z
        M86 143 L94 143 L90 135 Z
        M96 143 L104 143 L100 135 Z
        M106 143 L114 143 L110 135 Z`,
    },
    { rule: 'nonzero',
      d: `
        M82 24 L90 14 H110 L118 24 H110 L104 18 H96 L90 24 Z
        M22 118 H36 V150 H58 V164 H22 Z
        M178 118 H164 V150 H142 V164 H178 Z`,
    },
    { rule: 'nonzero',
      d: `
        M58.8 57.5 Q58.9 30.5 42 14 Q60.6 29.4 73.2 48.5 Z M126.8 48.5 Q133.9 26 158 14 Q146.6 33.9 141.2 57.5 Z`,
    },
  ],
  // wave: happy face, both hands shown at the sides
  wave: [
    {
      d: `
        M80 40 H120 L148 66 V112 L130 128 V146 H116 V164 L108 170 H92 L84 164 V146 H70 V128 L52 112 V66 Z
        M68 98 Q80 68 92 98 L85 100 Q80 86 75 100 Z
        M132 98 Q120 68 108 98 L115 100 Q120 86 125 100 Z
        M96 108 H104 V122 H96 Z
        M76 130 Q100 154 124 130 L120 128 Q100 144 80 128 Z`,
    },
    { rule: 'nonzero',
      d: `
        M82 24 L90 14 H110 L118 24 H110 L104 18 H96 L90 24 Z
        M22 118 H36 V150 H58 V164 H22 Z
        M178 118 H164 V150 H142 V164 H178 Z`,
    },
    { rule: 'nonzero',
      d: `
        M8 113.2 L2.9 89.1 L7.5 88.1 L9.5 97.4 L10.7 97.1 L8.1 85 L12.8 84.1 L15.3 96.1 L16.7 95.9 L13.7 81.9 L18.3 80.9 L21.3 94.9 L22.5 94.6 L19.9 82.5 L24.6 81.5 L27 92.7 L31.9 83.9 L36.2 85.9 L28.7 101.1 L30.3 108.5 Z M192 113.2 L197.1 89.1 L192.5 88.1 L190.5 97.4 L189.3 97.1 L191.9 85 L187.2 84.1 L184.7 96.1 L183.3 95.9 L186.3 81.9 L181.7 80.9 L178.7 94.9 L177.5 94.6 L180.1 82.5 L175.4 81.5 L173 92.7 L168.1 83.9 L163.8 85.9 L171.3 101.1 L169.7 108.5 Z`,
    },
  ],
};

/* ----------------------------------------------------------------------------
 * IRON REGENT  (crowned king: the T-visor reshapes into arches/V-slits/X, crown droops or rises)
 * ---------------------------------------------------------------------------- */
const REGENT: BotFaces = {
  // neutral: original face, untouched
  neutral: [
    {
      d: `
        M52 60 L60 22 L80 46 L100 14 L120 46 L140 22 L148 60 L156 64 V132 L144 156 L128 172 V186 H72 V172 L56 156 L44 132 V64 Z
        M96 54 H104 V62 H112 V68 H104 V76 H96 V68 H88 V62 H96 Z
        M58 84 H142 V100 H112 V132 H88 V100 H58 Z
        M60 120 H74 V124 H60 Z
        M126 120 H140 V124 H126 Z
        M60 128 H74 V132 H60 Z
        M126 128 H140 V132 H126 Z
        M60 136 H74 V140 H60 Z
        M126 136 H140 V140 H126 Z
        M92 150 H108 V154 H92 Z
        M95 160 H105 V164 H95 Z`,
    },
  ],
  // thinking: one eye squints, the other opens wide, mouth goes flat
  thinking: [
    {
      d: `
        M52 60 L60 22 L80 46 L100 14 L120 46 L140 22 L148 60 L156 64 V132 L144 156 L128 172 V186 H72 V172 L56 156 L44 132 V64 Z
        M96 54 H104 V62 H112 V68 H104 V76 H96 V68 H88 V62 H96 Z
        M58 90 L88 90 L112 78 L142 78 L142 102 L112 102 L112 132 L88 132 L88 96 L58 96 Z
        M60 120 H74 V124 H60 Z
        M126 120 H140 V124 H126 Z
        M60 128 H74 V132 H60 Z
        M126 128 H140 V132 H126 Z
        M60 136 H74 V140 H60 Z
        M126 136 H140 V140 H126 Z
        M96 152 H118 V156 H96 Z`,
    },
  ],
  // happy: eyes become smiling arches, wide smile
  happy: [
    {
      d: `
        M52 60 L60 22 L80 46 L100 14 L120 46 L140 22 L148 60 L156 64 V132 L144 156 L128 172 V186 H72 V172 L56 156 L44 132 V64 Z
        M96 54 H104 V62 H112 V68 H104 V76 H96 V68 H88 V62 H96 Z
        M58 98 L84 86 L100 86 L116 86 L142 98 L142 108 L120 97 L112 97 L112 132 L88 132 L88 97 L80 97 L58 108 Z
        M60 120 H74 V124 H60 Z
        M126 120 H140 V124 H126 Z
        M60 128 H74 V132 H60 Z
        M126 128 H140 V132 H126 Z
        M60 136 H74 V140 H60 Z
        M126 136 H140 V140 H126 Z
        M78 148 Q100 168 122 148 L118 146 Q100 160 82 146 Z`,
    },
  ],
  // smug: half-lidded eye, raised brow, lopsided smirk
  smug: [
    {
      d: `
        M52 60 L60 22 L80 46 L100 14 L120 46 L140 22 L148 60 L156 64 V132 L144 156 L128 172 V186 H72 V172 L56 156 L44 132 V64 Z
        M96 54 H104 V62 H112 V68 H104 V76 H96 V68 H88 V62 H96 Z
        M58 92 L88 92 L112 92 L142 86 L142 100 L112 100 L112 132 L88 132 L88 100 L58 100 Z
        M60 120 H74 V124 H60 Z
        M126 120 H140 V124 H126 Z
        M60 128 H74 V132 H60 Z
        M126 128 H140 V132 H126 Z
        M60 136 H74 V140 H60 Z
        M126 136 H140 V140 H126 Z
        M82 158 L100 158 L122 146 L124 151 L102 163 L82 163 Z`,
    },
  ],
  // shocked: eyes blown wide with tiny pupils, mouth gapes open
  shocked: [
    {
      d: `
        M52 60 L60 22 L80 46 L100 14 L120 46 L140 22 L148 60 L156 64 V132 L144 156 L128 172 V186 H72 V172 L56 156 L44 132 V64 Z
        M96 54 H104 V62 H112 V68 H104 V76 H96 V68 H88 V62 H96 Z
        M58 76 L100 76 L142 76 L142 108 L112 108 L112 136 L88 136 L88 108 L58 108 Z
        M60 120 H74 V124 H60 Z
        M126 120 H140 V124 H126 Z
        M60 128 H74 V132 H60 Z
        M126 128 H140 V132 H126 Z
        M60 136 H74 V140 H60 Z
        M126 136 H140 V140 H126 Z
        M90 146 H110 V168 H90 Z`,
    },
  ],
  // worried: inner brows raised, small eyes, wobbly mouth
  worried: [
    {
      d: `
        M52 60 L60 22 L80 46 L100 14 L120 46 L140 22 L148 60 L156 64 V132 L144 156 L128 172 V186 H72 V172 L56 156 L44 132 V64 Z
        M96 54 H104 V62 H112 V68 H104 V76 H96 V68 H88 V62 H96 Z
        M58 100 L88 84 L100 82 L112 84 L142 100 L142 110 L112 110 L112 132 L88 132 L88 110 L58 110 Z
        M60 120 H74 V124 H60 Z
        M126 120 H140 V124 H126 Z
        M60 128 H74 V132 H60 Z
        M126 128 H140 V132 H126 Z
        M60 136 H74 V140 H60 Z
        M126 136 H140 V140 H126 Z
        M82 158 L91 152 L100 158 L109 152 L118 158 L118 162 L109 156 L100 162 L91 156 L82 162 Z`,
    },
  ],
  // angry: slanted V eyes, brow slash, fanged mouth
  angry: [
    {
      d: `
        M52 60 L60 22 L80 46 L100 14 L120 46 L140 22 L148 60 L156 64 V132 L144 156 L128 172 V186 H72 V172 L56 156 L44 132 V64 Z
        M96 46 H104 V62 H112 V68 H104 V76 H96 V68 H88 V62 H96 Z
        M58 80 L88 98 L100 98 L112 98 L142 80 L142 94 L112 108 L112 132 L88 132 L88 108 L58 94 Z
        M60 120 H74 V124 H60 Z
        M126 120 H140 V124 H126 Z
        M60 128 H74 V132 H60 Z
        M126 128 H140 V132 H126 Z
        M60 136 H74 V140 H60 Z
        M126 136 H140 V140 H126 Z
        M84 148 H116 V166 H84 Z
        M86 150 L95 150 L90.5 160 Z
        M96 150 L105 150 L100.5 160 Z
        M106 150 L115 150 L110.5 160 Z
        M91 164 L100 164 L95.5 154 Z
        M101 164 L110 164 L105.5 154 Z`,
    },
  ],
  // victory: beaming arches, huge open grin, both hands raised
  victory: [
    {
      d: `
        M52 60 L58 16 L80 46 L100 6 L120 46 L142 16 L148 60 L156 64 V132 L144 156 L128 172 V186 H72 V172 L56 156 L44 132 V64 Z
        M96 54 H104 V62 H112 V68 H104 V76 H96 V68 H88 V62 H96 Z
        M58 98 L84 86 L100 86 L116 86 L142 98 L142 108 L120 97 L112 97 L112 132 L88 132 L88 97 L80 97 L58 108 Z
        M60 120 H74 V124 H60 Z
        M126 120 H140 V124 H126 Z
        M60 128 H74 V132 H60 Z
        M126 128 H140 V132 H126 Z
        M60 136 H74 V140 H60 Z
        M126 136 H140 V140 H126 Z
        M76 146 H124 Q122 170 100 170 Q78 170 76 146 Z
        M81 149 H119 V154 H81 Z`,
    },
    { rule: 'nonzero',
      d: `
        M13.2 77.8 L6.4 54 L11 52.7 L13.6 61.8 L14.8 61.5 L11.4 49.6 L16 48.3 L19.4 60.2 L20.6 59.8 L16.7 46.1 L21.3 44.8 L25.2 58.5 L26.4 58.2 L23 46.3 L27.6 45 L30.7 55.9 L35 46.8 L39.4 48.5 L33.1 64.2 L35.1 71.5 Z M186.8 77.8 L193.6 54 L189 52.7 L186.4 61.8 L185.2 61.5 L188.6 49.6 L184 48.3 L180.6 60.2 L179.4 59.8 L183.3 46.1 L178.7 44.8 L174.8 58.5 L173.6 58.2 L177 46.3 L172.4 45 L169.3 55.9 L165 46.8 L160.6 48.5 L166.9 64.2 L164.9 71.5 Z`,
    },
  ],
  // defeat: X-eyes and a deep frown
  defeat: [
    {
      d: `
        M52 60 L60 40 L80 52 L100 36 L120 52 L140 40 L148 60 L156 64 V132 L144 156 L128 172 V186 H72 V172 L56 156 L44 132 V64 Z
        M96 54 H104 V62 H112 V68 H104 V76 H96 V68 H88 V62 H96 Z
        M59.5 78 L70 88.5 L80.5 78 L84 81.5 L73.5 92 L84 102.5 L80.5 106 L70 95.5 L59.5 106 L56 102.5 L66.5 92 L56 81.5 Z
        M119.5 78 L130 88.5 L140.5 78 L144 81.5 L133.5 92 L144 102.5 L140.5 106 L130 95.5 L119.5 106 L116 102.5 L126.5 92 L116 81.5 Z
        M94 104 H106 V128 H94 Z
        M60 120 H74 V124 H60 Z
        M126 120 H140 V124 H126 Z
        M60 128 H74 V132 H60 Z
        M126 128 H140 V132 H126 Z
        M60 136 H74 V140 H60 Z
        M126 136 H140 V140 H126 Z
        M78 166 Q100 146 122 166 L118 168 Q100 156 82 168 Z`,
    },
  ],
  // taunt: wink, mouth open with tongue sticking out
  taunt: [
    {
      d: `
        M52 60 L60 22 L80 46 L100 14 L120 46 L140 22 L148 60 L156 64 V132 L144 156 L128 172 V186 H72 V172 L56 156 L44 132 V64 Z
        M96 54 H104 V62 H112 V68 H104 V76 H96 V68 H88 V62 H96 Z
        M58 84 L88 84 L112 92 L142 92 L142 97 L112 97 L112 132 L88 132 L88 100 L58 100 Z
        M60 120 H74 V124 H60 Z
        M126 120 H140 V124 H126 Z
        M60 128 H74 V132 H60 Z
        M126 128 H140 V132 H126 Z
        M60 136 H74 V140 H60 Z
        M126 136 H140 V140 H126 Z
        M84 148 H116 V168 H84 Z
        M96 156 H112 V165 Q104 172 96 165 Z
        M103.3 158 H104.9 V167 H103.3 Z`,
    },
  ],
  // devil: angry face plus horns growing out of the head
  devil: [
    {
      d: `
        M52 60 L60 22 L80 46 L100 14 L120 46 L140 22 L148 60 L156 64 V132 L144 156 L128 172 V186 H72 V172 L56 156 L44 132 V64 Z
        M96 46 H104 V62 H112 V68 H104 V76 H96 V68 H88 V62 H96 Z
        M58 80 L88 98 L100 98 L112 98 L142 80 L142 94 L112 108 L112 132 L88 132 L88 108 L58 94 Z
        M60 120 H74 V124 H60 Z
        M126 120 H140 V124 H126 Z
        M60 128 H74 V132 H60 Z
        M126 128 H140 V132 H126 Z
        M60 136 H74 V140 H60 Z
        M126 136 H140 V140 H126 Z
        M84 148 H116 V166 H84 Z
        M86 150 L95 150 L90.5 160 Z
        M96 150 L105 150 L100.5 160 Z
        M106 150 L115 150 L110.5 160 Z
        M91 164 L100 164 L95.5 154 Z
        M101 164 L110 164 L105.5 154 Z`,
    },
    { rule: 'nonzero',
      d: `
        M47.1 71.8 Q42.2 43.5 22 28 Q44.1 41.8 60.9 60.2 Z M139.1 60.2 Q150.9 37.7 178 28 Q162.8 47.6 152.9 71.8 Z`,
    },
  ],
  // wave: happy face, both hands shown at the sides
  wave: [
    {
      d: `
        M52 60 L60 22 L80 46 L100 14 L120 46 L140 22 L148 60 L156 64 V132 L144 156 L128 172 V186 H72 V172 L56 156 L44 132 V64 Z
        M96 54 H104 V62 H112 V68 H104 V76 H96 V68 H88 V62 H96 Z
        M58 98 L84 86 L100 86 L116 86 L142 98 L142 108 L120 97 L112 97 L112 132 L88 132 L88 97 L80 97 L58 108 Z
        M60 120 H74 V124 H60 Z
        M126 120 H140 V124 H126 Z
        M60 128 H74 V132 H60 Z
        M126 128 H140 V132 H126 Z
        M60 136 H74 V140 H60 Z
        M126 136 H140 V140 H126 Z
        M78 148 Q100 168 122 148 L118 146 Q100 160 82 146 Z`,
    },
    { rule: 'nonzero',
      d: `
        M10 129.2 L4.9 105.1 L9.5 104.1 L11.5 113.4 L12.7 113.1 L10.1 101 L14.8 100.1 L17.3 112.1 L18.7 111.9 L15.7 97.9 L20.3 96.9 L23.3 110.9 L24.5 110.6 L21.9 98.5 L26.6 97.5 L29 108.7 L33.9 99.9 L38.2 101.9 L30.7 117.1 L32.3 124.5 Z M190 129.2 L195.1 105.1 L190.5 104.1 L188.5 113.4 L187.3 113.1 L189.9 101 L185.2 100.1 L182.7 112.1 L181.3 111.9 L184.3 97.9 L179.7 96.9 L176.7 110.9 L175.5 110.6 L178.1 98.5 L173.4 97.5 L171 108.7 L166.1 99.9 L161.8 101.9 L169.3 117.1 L167.7 124.5 Z`,
    },
  ],
};

/* ----------------------------------------------------------------------------
 * CYCLOPS REVENANT  (one giant eye: lids, iris size and crosshair change, small eye winks)
 * ---------------------------------------------------------------------------- */
const CYCLOPS: BotFaces = {
  // neutral: original face, untouched
  neutral: [
    {
      d: `
        M60 100 C54 62 78 38 104 40 L118 40 L126 50 C150 56 162 76 158 100 C157 112 150 120 142 124 L140 146 L130 146 L128 160 L116 160 L114 148 L106 148 L104 160 L92 160 L90 146 L80 146 L78 130 C66 124 62 112 60 100 Z
        M70 98 L92 106 L88 118 L72 114 Z
        M111 92 A17 17 0 1 0 145 92 A17 17 0 1 0 111 92 Z M117 92 A11 11 0 1 1 139 92 A11 11 0 1 1 117 92 Z M126 83 H130 V90 H137 V94 H130 V101 H126 V94 H119 V90 H126 Z
        M94 126 L100 114 L106 126 Z
        M96 149 H99 V158 H96 Z
        M108 149 H111 V158 H108 Z`,
    },
    { rule: 'nonzero',
      d: `
        M20 40 L36 22 L52 16 L52 24 L40 30 L28 44 Z
        M180 40 L164 22 L148 16 L148 24 L160 30 L172 44 Z
        M20 160 L36 178 L52 184 L52 176 L40 170 L28 156 Z
        M180 160 L164 178 L148 184 L148 176 L160 170 L172 156 Z`,
    },
  ],
  // thinking: one eye squints, the other opens wide, mouth goes flat
  thinking: [
    {
      d: `
        M60 100 C54 62 78 38 104 40 L118 40 L126 50 C150 56 162 76 158 100 C157 112 150 120 142 124 L140 146 L130 146 L128 160 L116 160 L114 148 L106 148 L104 160 L92 160 L90 146 L80 146 L78 130 C66 124 62 112 60 100 Z
        M70 104 L92 106 L90 110 L70 108 Z
        M145 92 L144.6 95.5 L143.5 98.9 L142.3 101 L113.7 101 L112.5 98.9 L111.4 95.5 L111 92 L111.4 88.5 L112.5 85.1 L112.5 85 L143.5 85 L143.5 85.1 L144.6 88.5 Z
        M139 93 L138.8 94.5 L138.4 95.8 L137.7 97.1 L136.7 98.2 L135.5 99.1 L134.2 99.7 L132.7 100 L131.3 100 L129.8 99.7 L128.5 99.1 L127.3 98.2 L126.3 97.1 L125.6 95.8 L125.2 94.5 L125 93 L125.2 91.5 L125.6 90.2 L126.3 88.9 L127.1 88 L136.9 88 L137.7 88.9 L138.4 90.2 L138.8 91.5 Z
        M94 126 L100 114 L106 126 Z
        M88 136 H114 V140 H88 Z
        M96 149 H99 V158 H96 Z
        M108 149 H111 V158 H108 Z`,
    },
    { rule: 'nonzero',
      d: `
        M20 40 L36 22 L52 16 L52 24 L40 30 L28 44 Z
        M180 40 L164 22 L148 16 L148 24 L160 30 L172 44 Z
        M20 160 L36 178 L52 184 L52 176 L40 170 L28 156 Z
        M180 160 L164 178 L148 184 L148 176 L160 170 L172 156 Z`,
    },
  ],
  // happy: eyes become smiling arches, wide smile
  happy: [
    {
      d: `
        M60 100 C54 62 78 38 104 40 L118 40 L126 50 C150 56 162 76 158 100 C157 112 150 120 142 124 L140 146 L130 146 L128 160 L116 160 L114 148 L106 148 L104 160 L92 160 L90 146 L80 146 L78 130 C66 124 62 112 60 100 Z
        M68 114 L80 98 L94 108 L88 113 L80 106 L74 117 Z
        M110 98 Q128 66 146 98 L138 100 Q128 82 118 100 Z
        M94 126 L100 114 L106 126 Z
        M84 134 Q102 152 120 134 L116 132 Q102 144 88 132 Z
        M96 149 H99 V158 H96 Z
        M108 149 H111 V158 H108 Z`,
    },
    { rule: 'nonzero',
      d: `
        M20 40 L36 22 L52 16 L52 24 L40 30 L28 44 Z
        M180 40 L164 22 L148 16 L148 24 L160 30 L172 44 Z
        M20 160 L36 178 L52 184 L52 176 L40 170 L28 156 Z
        M180 160 L164 178 L148 184 L148 176 L160 170 L172 156 Z`,
    },
  ],
  // smug: half-lidded eye, raised brow, lopsided smirk
  smug: [
    {
      d: `
        M60 100 C54 62 78 38 104 40 L118 40 L126 50 C150 56 162 76 158 100 C157 112 150 120 142 124 L140 146 L130 146 L128 160 L116 160 L114 148 L106 148 L104 160 L92 160 L90 146 L80 146 L78 130 C66 124 62 112 60 100 Z
        M70 100 L92 106 L88 118 L72 114 Z
        M145 92 L144.6 95.5 L143.5 98.9 L141.8 102 L139.4 104.6 L136.5 106.7 L133.3 108.2 L129.8 108.9 L126.2 108.9 L122.7 108.2 L119.5 106.7 L116.6 104.6 L114.2 102 L112.5 98.9 L111.4 95.5 L111 92 L111.4 88.5 L111.5 88 L144.5 88 L144.6 88.5 Z
        M138 92 L137.8 94.1 L137.1 96.1 L136.1 97.9 L134.7 99.4 L133 100.7 L131.1 101.5 L129 101.9 L127 101.9 L124.9 101.5 L123 100.7 L121.3 99.4 L119.9 97.9 L118.9 96.1 L118.2 94.1 L118 92 L118.1 91 L137.9 91 Z
        M126.6 85.7 L129.4 85.7 L129.4 90.6 L134.3 90.6 L134.3 93.4 L129.4 93.4 L129.4 98.3 L126.6 98.3 L126.6 93.4 L121.7 93.4 L121.7 90.6 L126.6 90.6 Z
        M94 126 L100 114 L106 126 Z
        M84 140 L102 140 L122 130 L124 135 L104 145 L84 145 Z
        M96 149 H99 V158 H96 Z
        M108 149 H111 V158 H108 Z`,
    },
    { rule: 'nonzero',
      d: `
        M20 40 L36 22 L52 16 L52 24 L40 30 L28 44 Z
        M180 40 L164 22 L148 16 L148 24 L160 30 L172 44 Z
        M20 160 L36 178 L52 184 L52 176 L40 170 L28 156 Z
        M180 160 L164 178 L148 184 L148 176 L160 170 L172 156 Z`,
    },
  ],
  // shocked: eyes blown wide with tiny pupils, mouth gapes open
  shocked: [
    {
      d: `
        M60 100 C54 62 78 38 104 40 L118 40 L126 50 C150 56 162 76 158 100 C157 112 150 120 142 124 L140 146 L130 146 L128 160 L116 160 L114 148 L106 148 L104 160 L92 160 L90 146 L80 146 L78 130 C66 124 62 112 60 100 Z
        M72 110 A8 8 0 1 0 88 110 A8 8 0 1 0 72 110 Z
        M149 92 L148.5 96.4 L147.2 100.5 L145 104.3 L142.1 107.6 L138.5 110.2 L134.5 112 L130.2 112.9 L125.8 112.9 L121.5 112 L117.5 110.2 L113.9 107.6 L111 104.3 L108.8 100.5 L107.5 96.4 L107 92 L107.5 87.6 L108.8 83.5 L111 79.7 L113.9 76.4 L117.5 73.8 L121.5 72 L125.8 71.1 L130.2 71.1 L134.5 72 L138.5 73.8 L142.1 76.4 L145 79.7 L147.2 83.5 L148.5 87.6 Z
        M133 92 L132.9 93 L132.6 94 L132 94.9 L131.3 95.7 L130.5 96.3 L129.5 96.8 L128.5 97 L127.5 97 L126.5 96.8 L125.5 96.3 L124.7 95.7 L124 94.9 L123.4 94 L123.1 93 L123 92 L123.1 91 L123.4 90 L124 89.1 L124.7 88.3 L125.5 87.7 L126.5 87.2 L127.5 87 L128.5 87 L129.5 87.2 L130.5 87.7 L131.3 88.3 L132 89.1 L132.6 90 L132.9 91 Z
        M94 126 L100 114 L106 126 Z
        M96 138 A10 7 0 1 0 116 138 A10 7 0 1 0 96 138 Z
        M96 149 H99 V158 H96 Z
        M108 149 H111 V158 H108 Z`,
    },
    { rule: 'nonzero',
      d: `
        M20 40 L36 22 L52 16 L52 24 L40 30 L28 44 Z
        M180 40 L164 22 L148 16 L148 24 L160 30 L172 44 Z
        M20 160 L36 178 L52 184 L52 176 L40 170 L28 156 Z
        M180 160 L164 178 L148 184 L148 176 L160 170 L172 156 Z`,
    },
  ],
  // worried: inner brows raised, small eyes, wobbly mouth
  worried: [
    {
      d: `
        M60 100 C54 62 78 38 104 40 L118 40 L126 50 C150 56 162 76 158 100 C157 112 150 120 142 124 L140 146 L130 146 L128 160 L116 160 L114 148 L106 148 L104 160 L92 160 L90 146 L80 146 L78 130 C66 124 62 112 60 100 Z
        M70 108 L92 98 L90 112 L72 118 Z
        M145 92 L144.6 95.5 L143.5 98.9 L141.8 102 L139.4 104.6 L136.5 106.7 L133.3 108.2 L129.8 108.9 L126.2 108.9 L122.7 108.2 L119.5 106.7 L116.6 104.6 L114.2 102 L112.5 98.9 L111.4 95.5 L111 92 L111.4 88.5 L112.5 85.1 L113.8 82.8 L145 92 Z
        M136 92.3 L135.8 93.7 L135.3 95.3 L134.5 96.7 L133.4 97.9 L132 98.9 L130.5 99.6 L128.8 100 L127.2 100 L125.5 99.6 L124 98.9 L122.6 97.9 L121.5 96.7 L120.7 95.3 L120.2 93.7 L120 92 L120.2 90.3 L120.7 88.7 L121.1 88 Z
        M126.8 86.6 L129.2 86.6 L129.2 90.8 L133.4 90.8 L133.4 93.2 L129.2 93.2 L129.2 97.4 L126.8 97.4 L126.8 93.2 L122.6 93.2 L122.6 90.8 L126.8 90.8 Z
        M94 126 L100 114 L106 126 Z
        M86 138 L94 132 L102 138 L110 132 L118 138 L118 142 L110 136 L102 142 L94 136 L86 142 Z
        M96 149 H99 V158 H96 Z
        M108 149 H111 V158 H108 Z`,
    },
    { rule: 'nonzero',
      d: `
        M20 40 L36 22 L52 16 L52 24 L40 30 L28 44 Z
        M180 40 L164 22 L148 16 L148 24 L160 30 L172 44 Z
        M20 160 L36 178 L52 184 L52 176 L40 170 L28 156 Z
        M180 160 L164 178 L148 184 L148 176 L160 170 L172 156 Z`,
    },
  ],
  // angry: slanted V eyes, brow slash, fanged mouth
  angry: [
    {
      d: `
        M60 100 C54 62 78 38 104 40 L118 40 L126 50 C150 56 162 76 158 100 C157 112 150 120 142 124 L140 146 L130 146 L128 160 L116 160 L114 148 L106 148 L104 160 L92 160 L90 146 L80 146 L78 130 C66 124 62 112 60 100 Z
        M68 100 L92 110 L88 118 L70 112 Z
        M145 92 L144.6 95.5 L143.5 98.9 L141.8 102 L139.4 104.6 L136.5 106.7 L133.3 108.2 L129.8 108.9 L126.2 108.9 L122.7 108.2 L119.5 106.7 L116.6 104.6 L114.2 102 L112.5 98.9 L111.4 95.5 L111 92 L111.4 88.5 L112.5 85.1 L113.4 83.4 L134.1 76.2 L136.5 77.3 L139.4 79.4 L141.8 82 L143.5 85.1 L144.6 88.5 Z
        M138 92 L137.8 94.1 L137.1 96.1 L136.1 97.9 L134.7 99.4 L133 100.7 L131.1 101.5 L129 101.9 L127 101.9 L124.9 101.5 L123 100.7 L121.3 99.4 L119.9 97.9 L118.9 96.1 L118.2 94.1 L118 92 L118.2 89.9 L118.9 87.9 L119.9 86.1 L121.3 84.6 L123 83.3 L124.9 82.5 L127 82.1 L129 82.1 L131.1 82.5 L133 83.3 L134.7 84.6 L136.1 86.1 L137.1 87.9 L137.8 89.9 Z
        M126.6 85.7 L129.4 85.7 L129.4 90.6 L134.3 90.6 L134.3 93.4 L129.4 93.4 L129.4 98.3 L126.6 98.3 L126.6 93.4 L121.7 93.4 L121.7 90.6 L126.6 90.6 Z
        M104 78 L152 60 L152 65 L104 83 Z
        M94 126 L100 114 L106 126 Z
        M84 133 H128 V143 H84 Z
        M86 134 L95 134 L90.5 141 Z
        M96 134 L105 134 L100.5 141 Z
        M106 134 L115 134 L110.5 141 Z
        M116 134 L125 134 L120.5 141 Z
        M91 142 L100 142 L95.5 135 Z
        M101 142 L110 142 L105.5 135 Z
        M111 142 L120 142 L115.5 135 Z
        M96 149 H99 V158 H96 Z
        M108 149 H111 V158 H108 Z`,
    },
    { rule: 'nonzero',
      d: `
        M20 40 L36 22 L52 16 L52 24 L40 30 L28 44 Z
        M180 40 L164 22 L148 16 L148 24 L160 30 L172 44 Z
        M20 160 L36 178 L52 184 L52 176 L40 170 L28 156 Z
        M180 160 L164 178 L148 184 L148 176 L160 170 L172 156 Z`,
    },
  ],
  // victory: beaming arches, huge open grin, both hands raised
  victory: [
    {
      d: `
        M60 100 C54 62 78 38 104 40 L118 40 L126 50 C150 56 162 76 158 100 C157 112 150 120 142 124 L140 146 L130 146 L128 160 L116 160 L114 148 L106 148 L104 160 L92 160 L90 146 L80 146 L78 130 C66 124 62 112 60 100 Z
        M68 114 L80 98 L94 108 L88 113 L80 106 L74 117 Z
        M108 98 Q128 62 148 98 L139 101 Q128 80 117 101 Z
        M94 126 L100 114 L106 126 Z
        M82 132 H130 Q128 150 106 150 Q84 150 82 132 Z
        M86 135 H126 V139 H86 Z
        M96 149 H99 V158 H96 Z
        M108 149 H111 V158 H108 Z`,
    },
    { rule: 'nonzero',
      d: `
        M20 40 L36 22 L52 16 L52 24 L40 30 L28 44 Z
        M180 40 L164 22 L148 16 L148 24 L160 30 L172 44 Z
        M20 160 L36 178 L52 184 L52 176 L40 170 L28 156 Z
        M180 160 L164 178 L148 184 L148 176 L160 170 L172 156 Z`,
    },
    { rule: 'nonzero',
      d: `
        M11.2 95.8 L4.4 72 L9 70.7 L11.6 79.8 L12.8 79.5 L9.4 67.6 L14 66.3 L17.4 78.2 L18.6 77.8 L14.7 64.1 L19.3 62.8 L23.2 76.5 L24.4 76.2 L21 64.3 L25.6 63 L28.7 73.9 L33 64.8 L37.4 66.5 L31.1 82.2 L33.1 89.5 Z M188.8 95.8 L195.6 72 L191 70.7 L188.4 79.8 L187.2 79.5 L190.6 67.6 L186 66.3 L182.6 78.2 L181.4 77.8 L185.3 64.1 L180.7 62.8 L176.8 76.5 L175.6 76.2 L179 64.3 L174.4 63 L171.3 73.9 L167 64.8 L162.6 66.5 L168.9 82.2 L166.9 89.5 Z`,
    },
  ],
  // defeat: X-eyes and a deep frown
  defeat: [
    {
      d: `
        M60 100 C54 62 78 38 104 40 L118 40 L126 50 C150 56 162 76 158 100 C157 112 150 120 142 124 L140 146 L130 146 L128 160 L116 160 L114 148 L106 148 L104 160 L92 160 L90 146 L80 146 L78 130 C66 124 62 112 60 100 Z
        M74.8 102 L80 107.2 L85.2 102 L88 104.8 L82.8 110 L88 115.2 L85.2 118 L80 112.8 L74.8 118 L72 115.2 L77.2 110 L72 104.8 Z
        M117.2 77 L128 87.8 L138.8 77 L143 81.2 L132.2 92 L143 102.8 L138.8 107 L128 96.2 L117.2 107 L113 102.8 L123.8 92 L113 81.2 Z
        M94 126 L100 114 L106 126 Z
        M84 144 Q102 128 120 144 L116 147 Q102 136 88 147 Z
        M96 149 H99 V158 H96 Z
        M108 149 H111 V158 H108 Z`,
    },
    { rule: 'nonzero',
      d: `
        M20 40 L36 22 L52 16 L52 24 L40 30 L28 44 Z
        M180 40 L164 22 L148 16 L148 24 L160 30 L172 44 Z
        M20 160 L36 178 L52 184 L52 176 L40 170 L28 156 Z
        M180 160 L164 178 L148 184 L148 176 L160 170 L172 156 Z`,
    },
  ],
  // taunt: wink, mouth open with tongue sticking out
  taunt: [
    {
      d: `
        M60 100 C54 62 78 38 104 40 L118 40 L126 50 C150 56 162 76 158 100 C157 112 150 120 142 124 L140 146 L130 146 L128 160 L116 160 L114 148 L106 148 L104 160 L92 160 L90 146 L80 146 L78 130 C66 124 62 112 60 100 Z
        M70 106 L92 104 L92 108 L70 110 Z
        M145 92 L144.6 95.5 L143.5 98.9 L141.8 102 L139.4 104.6 L136.5 106.7 L133.3 108.2 L129.8 108.9 L126.2 108.9 L122.7 108.2 L119.5 106.7 L116.6 104.6 L114.2 102 L112.5 98.9 L111.4 95.5 L111 92 L111.4 88.5 L112.5 85.1 L114.2 82 L116.6 79.4 L119.5 77.3 L122.7 75.8 L126.2 75.1 L129.8 75.1 L133.3 75.8 L136.5 77.3 L139.4 79.4 L141.8 82 L143.5 85.1 L144.6 88.5 Z
        M139 92 L138.8 94.3 L138 96.5 L136.9 98.5 L135.4 100.2 L133.5 101.5 L131.4 102.5 L129.1 102.9 L126.9 102.9 L124.6 102.5 L122.5 101.5 L120.6 100.2 L119.1 98.5 L118 96.5 L117.2 94.3 L117 92 L117.2 89.7 L118 87.5 L119.1 85.5 L120.6 83.8 L122.5 82.5 L124.6 81.5 L126.9 81.1 L129.1 81.1 L131.4 81.5 L133.5 82.5 L135.4 83.8 L136.9 85.5 L138 87.5 L138.8 89.7 Z
        M126.4 84.8 L129.6 84.8 L129.6 90.4 L135.2 90.4 L135.2 93.6 L129.6 93.6 L129.6 99.2 L126.4 99.2 L126.4 93.6 L120.8 93.6 L120.8 90.4 L126.4 90.4 Z
        M94 126 L100 114 L106 126 Z
        M88 132 H128 V142 H88 Z
        M96 149 H99 V158 H96 Z
        M108 149 H111 V158 H108 Z`,
    },
    { rule: 'nonzero',
      d: `
        M20 40 L36 22 L52 16 L52 24 L40 30 L28 44 Z
        M180 40 L164 22 L148 16 L148 24 L160 30 L172 44 Z
        M20 160 L36 178 L52 184 L52 176 L40 170 L28 156 Z
        M180 160 L164 178 L148 184 L148 176 L160 170 L172 156 Z`,
    },
    {
      d: `
        M104 138 H118 V168 Q111 178 104 168 Z M110 144 H112 V168 H110 Z`,
    },
  ],
  // devil: angry face plus horns growing out of the head
  devil: [
    {
      d: `
        M60 100 C54 62 78 38 104 40 L118 40 L126 50 C150 56 162 76 158 100 C157 112 150 120 142 124 L140 146 L130 146 L128 160 L116 160 L114 148 L106 148 L104 160 L92 160 L90 146 L80 146 L78 130 C66 124 62 112 60 100 Z
        M68 100 L92 110 L88 118 L70 112 Z
        M145 92 L144.6 95.5 L143.5 98.9 L141.8 102 L139.4 104.6 L136.5 106.7 L133.3 108.2 L129.8 108.9 L126.2 108.9 L122.7 108.2 L119.5 106.7 L116.6 104.6 L114.2 102 L112.5 98.9 L111.4 95.5 L111 92 L111.4 88.5 L112.5 85.1 L113.4 83.4 L134.1 76.2 L136.5 77.3 L139.4 79.4 L141.8 82 L143.5 85.1 L144.6 88.5 Z
        M138 92 L137.8 94.1 L137.1 96.1 L136.1 97.9 L134.7 99.4 L133 100.7 L131.1 101.5 L129 101.9 L127 101.9 L124.9 101.5 L123 100.7 L121.3 99.4 L119.9 97.9 L118.9 96.1 L118.2 94.1 L118 92 L118.2 89.9 L118.9 87.9 L119.9 86.1 L121.3 84.6 L123 83.3 L124.9 82.5 L127 82.1 L129 82.1 L131.1 82.5 L133 83.3 L134.7 84.6 L136.1 86.1 L137.1 87.9 L137.8 89.9 Z
        M126.6 85.7 L129.4 85.7 L129.4 90.6 L134.3 90.6 L134.3 93.4 L129.4 93.4 L129.4 98.3 L126.6 98.3 L126.6 93.4 L121.7 93.4 L121.7 90.6 L126.6 90.6 Z
        M104 78 L152 60 L152 65 L104 83 Z
        M94 126 L100 114 L106 126 Z
        M84 133 H128 V143 H84 Z
        M86 134 L95 134 L90.5 141 Z
        M96 134 L105 134 L100.5 141 Z
        M106 134 L115 134 L110.5 141 Z
        M116 134 L125 134 L120.5 141 Z
        M91 142 L100 142 L95.5 135 Z
        M101 142 L110 142 L105.5 135 Z
        M111 142 L120 142 L115.5 135 Z
        M96 149 H99 V158 H96 Z
        M108 149 H111 V158 H108 Z`,
    },
    { rule: 'nonzero',
      d: `
        M20 40 L36 22 L52 16 L52 24 L40 30 L28 44 Z
        M180 40 L164 22 L148 16 L148 24 L160 30 L172 44 Z
        M20 160 L36 178 L52 184 L52 176 L40 170 L28 156 Z
        M180 160 L164 178 L148 184 L148 176 L160 170 L172 156 Z`,
    },
    { rule: 'nonzero',
      d: `
        M78.7 49.3 Q79.9 23.6 64 8 Q81.7 22.5 93.3 40.7 Z M113.4 37.7 Q122.9 16.6 148 8 Q134.6 26 126.6 48.3 Z`,
    },
  ],
  // wave: happy face, both hands shown at the sides
  wave: [
    {
      d: `
        M60 100 C54 62 78 38 104 40 L118 40 L126 50 C150 56 162 76 158 100 C157 112 150 120 142 124 L140 146 L130 146 L128 160 L116 160 L114 148 L106 148 L104 160 L92 160 L90 146 L80 146 L78 130 C66 124 62 112 60 100 Z
        M68 114 L80 98 L94 108 L88 113 L80 106 L74 117 Z
        M110 98 Q128 66 146 98 L138 100 Q128 82 118 100 Z
        M94 126 L100 114 L106 126 Z
        M84 134 Q102 152 120 134 L116 132 Q102 144 88 132 Z
        M96 149 H99 V158 H96 Z
        M108 149 H111 V158 H108 Z`,
    },
    { rule: 'nonzero',
      d: `
        M20 40 L36 22 L52 16 L52 24 L40 30 L28 44 Z
        M180 40 L164 22 L148 16 L148 24 L160 30 L172 44 Z
        M20 160 L36 178 L52 184 L52 176 L40 170 L28 156 Z
        M180 160 L164 178 L148 184 L148 176 L160 170 L172 156 Z`,
    },
    { rule: 'nonzero',
      d: `
        M9 125.2 L3.9 101.1 L8.5 100.1 L10.5 109.4 L11.7 109.1 L9.1 97 L13.8 96.1 L16.3 108.1 L17.7 107.9 L14.7 93.9 L19.3 92.9 L22.3 106.9 L23.5 106.6 L20.9 94.5 L25.6 93.5 L28 104.7 L32.9 95.9 L37.2 97.9 L29.7 113.1 L31.3 120.5 Z M191 125.2 L196.1 101.1 L191.5 100.1 L189.5 109.4 L188.3 109.1 L190.9 97 L186.2 96.1 L183.7 108.1 L182.3 107.9 L185.3 93.9 L180.7 92.9 L177.7 106.9 L176.5 106.6 L179.1 94.5 L174.4 93.5 L172 104.7 L167.1 95.9 L162.8 97.9 L170.3 113.1 L168.7 120.5 Z`,
    },
  ],
};

/* ----------------------------------------------------------------------------
 * CHROME REAPER  (chrome skull: sockets, pupils, brow chevrons and jaw change)
 * ---------------------------------------------------------------------------- */
const REAPER: BotFaces = {
  // neutral: original face, untouched
  neutral: [
    {
      d: `
        M84 20 H116 L144 30 L158 56 L160 100 L170 126 L164 150 L152 156 L148 172 L136 184 L134 196 H118 L116 188 H106 L104 196 H96 L94 188 H84 L82 196 H66 L64 184 L52 172 L48 156 L36 150 L30 126 L40 100 L42 56 L56 30 Z
        M100 40 L124 54 V62 L100 48 L76 62 V54 Z
        M100 58 L124 72 V80 L100 66 L76 80 V72 Z
        M92 140 L108 140 L100 162 Z
        M72 30 H75 V46 H72 Z
        M125 30 H128 V46 H125 Z
        M112 112 L142 106 L156 120 L150 138 L134 146 L116 138 Z
        M88 112 L58 106 L44 120 L50 138 L66 146 L84 138 Z
        M120 118 L138 114 L142 126 L130 132 Z
        M80 118 L62 114 L58 126 L70 132 Z
        M87 172 H90 V186 H87 Z
        M110 172 H113 V186 H110 Z`,
    },
  ],
  // thinking: one eye squints, the other opens wide, mouth goes flat
  thinking: [
    {
      d: `
        M84 20 H116 L144 30 L158 56 L160 100 L170 126 L164 150 L152 156 L148 172 L136 184 L134 196 H118 L116 188 H106 L104 196 H96 L94 188 H84 L82 196 H66 L64 184 L52 172 L48 156 L36 150 L30 126 L40 100 L42 56 L56 30 Z
        M100 40 L124 54 V62 L100 48 L76 62 V54 Z
        M100 58 L124 72 V80 L100 66 L76 80 V72 Z
        M92 140 L108 140 L100 162 Z
        M72 30 H75 V46 H72 Z
        M125 30 H128 V46 H125 Z
        M84 124 L58 122 L46 126 L52 132 L84 132 Z
        M112 112 L142 106 L156 120 L150 138 L134 146 L116 138 Z
        M120 118 L138 114 L142 126 L130 132 Z
        M88 170 H118 V174 H88 Z`,
    },
  ],
  // happy: eyes become smiling arches, wide smile
  happy: [
    {
      d: `
        M84 20 H116 L144 30 L158 56 L160 100 L170 126 L164 150 L152 156 L148 172 L136 184 L134 196 H118 L116 188 H106 L104 196 H96 L94 188 H84 L82 196 H66 L64 184 L52 172 L48 156 L36 150 L30 126 L40 100 L42 56 L56 30 Z
        M100 40 L124 54 V62 L100 48 L76 62 V54 Z
        M100 58 L124 72 V80 L100 66 L76 80 V72 Z
        M92 140 L108 140 L100 162 Z
        M72 30 H75 V46 H72 Z
        M125 30 H128 V46 H125 Z
        M112 138 Q134 98 156 134 L146 138 Q134 114 120 142 Z
        M88 138 Q66 98 44 134 L54 138 Q66 114 80 142 Z
        M72 164 Q100 188 128 164 L124 162 Q100 178 76 162 Z`,
    },
  ],
  // smug: half-lidded eye, raised brow, lopsided smirk
  smug: [
    {
      d: `
        M84 20 H116 L144 30 L158 56 L160 100 L170 126 L164 150 L152 156 L148 172 L136 184 L134 196 H118 L116 188 H106 L104 196 H96 L94 188 H84 L82 196 H66 L64 184 L52 172 L48 156 L36 150 L30 126 L40 100 L42 56 L56 30 Z
        M100 40 L124 54 V62 L100 48 L76 62 V54 Z
        M100 58 L124 72 V80 L100 66 L76 80 V72 Z
        M92 140 L108 140 L100 162 Z
        M72 30 H75 V46 H72 Z
        M125 30 H128 V46 H125 Z
        M88 120 L58 120 L44 122 L50 138 L66 146 L84 138 Z
        M112 112 L142 106 L156 120 L150 138 L134 146 L116 138 Z
        M70 128 L62 124 L56 128 L66 134 Z
        M120 118 L138 114 L142 126 L130 132 Z
        M76 170 L98 170 L126 158 L128 163 L100 178 L76 176 Z`,
    },
  ],
  // shocked: eyes blown wide with tiny pupils, mouth gapes open
  shocked: [
    {
      d: `
        M84 20 H116 L144 30 L158 56 L160 100 L170 126 L164 150 L152 156 L148 172 L136 184 L134 196 H118 L116 188 H106 L104 196 H96 L94 188 H84 L82 196 H66 L64 184 L52 172 L48 156 L36 150 L30 126 L40 100 L42 56 L56 30 Z
        M100 40 L124 54 V62 L100 48 L76 62 V54 Z
        M100 58 L124 72 V80 L100 66 L76 80 V72 Z
        M92 140 L108 140 L100 162 Z
        M72 30 H75 V46 H72 Z
        M125 30 H128 V46 H125 Z
        M116 124 A18 22 0 1 0 152 124 A18 22 0 1 0 116 124 Z
        M48 124 A18 22 0 1 0 84 124 A18 22 0 1 0 48 124 Z
        M129 126 A5 5 0 1 0 139 126 A5 5 0 1 0 129 126 Z
        M61 126 A5 5 0 1 0 71 126 A5 5 0 1 0 61 126 Z
        M80 166 H120 V186 H80 Z
        M86 169 H92 V175 H86 Z
        M97 169 H103 V175 H97 Z
        M108 169 H114 V175 H108 Z`,
    },
  ],
  // worried: inner brows raised, small eyes, wobbly mouth
  worried: [
    {
      d: `
        M84 20 H116 L144 30 L158 56 L160 100 L170 126 L164 150 L152 156 L148 172 L136 184 L134 196 H118 L116 188 H106 L104 196 H96 L94 188 H84 L82 196 H66 L64 184 L52 172 L48 156 L36 150 L30 126 L40 100 L42 56 L56 30 Z
        M100 62 L124 48 V40 L100 54 L76 40 V48 Z
        M100 80 L124 66 V58 L100 72 L76 58 V66 Z
        M92 140 L108 140 L100 162 Z
        M72 30 H75 V46 H72 Z
        M125 30 H128 V46 H125 Z
        M112 106 L146 114 L158 128 L150 142 L134 148 L116 138 Z
        M88 106 L54 114 L42 128 L50 142 L66 148 L84 138 Z
        M124 124 L140 122 L142 132 L130 138 Z
        M76 124 L60 122 L58 132 L70 138 Z
        M76 176 L86 168 L96 176 L106 168 L116 176 L124 170 L124 176 L116 182 L106 174 L96 182 L86 174 L76 182 Z`,
    },
  ],
  // angry: slanted V eyes, brow slash, fanged mouth
  angry: [
    {
      d: `
        M84 20 H116 L144 30 L158 56 L160 100 L170 126 L164 150 L152 156 L148 172 L136 184 L134 196 H118 L116 188 H106 L104 196 H96 L94 188 H84 L82 196 H66 L64 184 L52 172 L48 156 L36 150 L30 126 L40 100 L42 56 L56 30 Z
        M100 62 L124 48 V40 L100 54 L76 40 V48 Z
        M100 80 L124 66 V58 L100 72 L76 58 V66 Z
        M92 140 L108 140 L100 162 Z
        M72 30 H75 V46 H72 Z
        M125 30 H128 V46 H125 Z
        M112 122 L156 100 L160 124 L150 140 L134 146 L116 138 Z
        M88 122 L44 100 L40 124 L50 140 L66 146 L84 138 Z
        M124 128 L148 116 L148 130 L136 136 Z
        M76 128 L52 116 L52 130 L64 136 Z
        M74 168 L84 178 L92 168 L100 178 L108 168 L116 178 L126 168 L126 172 L116 182 L108 172 L100 182 L92 172 L84 182 L74 172 Z`,
    },
  ],
  // victory: beaming arches, huge open grin, both hands raised
  victory: [
    {
      d: `
        M84 20 H116 L144 30 L158 56 L160 100 L170 126 L164 150 L152 156 L148 172 L136 184 L134 196 H118 L116 188 H106 L104 196 H96 L94 188 H84 L82 196 H66 L64 184 L52 172 L48 156 L36 150 L30 126 L40 100 L42 56 L56 30 Z
        M100 40 L124 54 V62 L100 48 L76 62 V54 Z
        M100 58 L124 72 V80 L100 66 L76 80 V72 Z
        M92 140 L108 140 L100 162 Z
        M72 30 H75 V46 H72 Z
        M125 30 H128 V46 H125 Z
        M112 138 Q134 98 156 134 L146 138 Q134 114 120 142 Z
        M88 138 Q66 98 44 134 L54 138 Q66 114 80 142 Z
        M70 162 H130 Q128 186 100 186 Q72 186 70 162 Z
        M84 165 H88 V179 H84 Z
        M94 165 H98 V180 H94 Z
        M104 165 H108 V180 H104 Z
        M114 165 H118 V179 H114 Z`,
    },
    { rule: 'nonzero',
      d: `
        M9.6 86.8 L3.1 64.3 L7.5 63.1 L9.9 71.7 L11.1 71.4 L7.8 60.2 L12.2 58.9 L15.4 70.2 L16.6 69.8 L12.9 56.8 L17.2 55.6 L20.9 68.6 L22.1 68.3 L18.8 57 L23.2 55.8 L26.1 66.2 L30.2 57.5 L34.4 59.1 L28.4 73.9 L30.4 80.9 Z M190.4 86.8 L196.9 64.3 L192.5 63.1 L190.1 71.7 L188.9 71.4 L192.2 60.2 L187.8 58.9 L184.6 70.2 L183.4 69.8 L187.1 56.8 L182.8 55.6 L179.1 68.6 L177.9 68.3 L181.2 57 L176.8 55.8 L173.9 66.2 L169.8 57.5 L165.6 59.1 L171.6 73.9 L169.6 80.9 Z`,
    },
  ],
  // defeat: X-eyes and a deep frown
  defeat: [
    {
      d: `
        M84 20 H116 L144 30 L158 56 L160 100 L170 126 L164 150 L152 156 L148 172 L136 184 L134 196 H118 L116 188 H106 L104 196 H96 L94 188 H84 L82 196 H66 L64 184 L52 172 L48 156 L36 150 L30 126 L40 100 L42 56 L56 30 Z
        M100 62 L124 48 V40 L100 54 L76 40 V48 Z
        M100 80 L124 66 V58 L100 72 L76 58 V66 Z
        M92 140 L108 140 L100 162 Z
        M72 30 H75 V46 H72 Z
        M125 30 H128 V46 H125 Z
        M112 112 L142 106 L156 120 L150 138 L134 146 L116 138 Z
        M88 112 L58 106 L44 120 L50 138 L66 146 L84 138 Z
        M126.5 115 L134 122.5 L141.5 115 L145 118.5 L137.5 126 L145 133.5 L141.5 137 L134 129.5 L126.5 137 L123 133.5 L130.5 126 L123 118.5 Z
        M58.5 115 L66 122.5 L73.5 115 L77 118.5 L69.5 126 L77 133.5 L73.5 137 L66 129.5 L58.5 137 L55 133.5 L62.5 126 L55 118.5 Z
        M74 182 Q100 160 126 182 L122 185 Q100 169 78 185 Z`,
    },
  ],
  // taunt: wink, mouth open with tongue sticking out
  taunt: [
    {
      d: `
        M84 20 H116 L144 30 L158 56 L160 100 L170 126 L164 150 L152 156 L148 172 L136 184 L134 196 H118 L116 188 H106 L104 196 H96 L94 188 H84 L82 196 H66 L64 184 L52 172 L48 156 L36 150 L30 126 L40 100 L42 56 L56 30 Z
        M100 40 L124 54 V62 L100 48 L76 62 V54 Z
        M100 58 L124 72 V80 L100 66 L76 80 V72 Z
        M92 140 L108 140 L100 162 Z
        M72 30 H75 V46 H72 Z
        M125 30 H128 V46 H125 Z
        M88 126 L58 124 L46 128 L54 134 L86 133 Z
        M112 112 L142 106 L156 120 L150 138 L134 146 L116 138 Z
        M120 118 L138 114 L142 126 L130 132 Z
        M80 168 H120 V180 H80 Z`,
    },
    {
      d: `
        M92 170 H112 V192 Q102 202 92 192 Z M101 174 H103 V190 H101 Z`,
    },
  ],
  // devil: angry face plus horns growing out of the head
  devil: [
    {
      d: `
        M84 20 H116 L144 30 L158 56 L160 100 L170 126 L164 150 L152 156 L148 172 L136 184 L134 196 H118 L116 188 H106 L104 196 H96 L94 188 H84 L82 196 H66 L64 184 L52 172 L48 156 L36 150 L30 126 L40 100 L42 56 L56 30 Z
        M100 62 L124 48 V40 L100 54 L76 40 V48 Z
        M100 80 L124 66 V58 L100 72 L76 58 V66 Z
        M92 140 L108 140 L100 162 Z
        M72 30 H75 V46 H72 Z
        M125 30 H128 V46 H125 Z
        M112 122 L156 100 L160 124 L150 140 L134 146 L116 138 Z
        M88 122 L44 100 L40 124 L50 140 L66 146 L84 138 Z
        M124 128 L148 116 L148 130 L136 136 Z
        M76 128 L52 116 L52 130 L64 136 Z
        M74 168 L84 178 L92 168 L100 178 L108 168 L116 178 L126 168 L126 172 L116 182 L108 172 L100 182 L92 172 L84 182 L74 172 Z`,
    },
    { rule: 'nonzero',
      d: `
        M59.3 43.2 Q56.5 16.5 38 2 Q58.1 15.2 72.7 32.8 Z M127.3 32.8 Q136.8 11.3 162 2 Q148.6 20.5 140.7 43.2 Z`,
    },
  ],
  // wave: happy face, both hands shown at the sides
  wave: [
    {
      d: `
        M84 20 H116 L144 30 L158 56 L160 100 L170 126 L164 150 L152 156 L148 172 L136 184 L134 196 H118 L116 188 H106 L104 196 H96 L94 188 H84 L82 196 H66 L64 184 L52 172 L48 156 L36 150 L30 126 L40 100 L42 56 L56 30 Z
        M100 40 L124 54 V62 L100 48 L76 62 V54 Z
        M100 58 L124 72 V80 L100 66 L76 80 V72 Z
        M92 140 L108 140 L100 162 Z
        M72 30 H75 V46 H72 Z
        M125 30 H128 V46 H125 Z
        M112 138 Q134 98 156 134 L146 138 Q134 114 120 142 Z
        M88 138 Q66 98 44 134 L54 138 Q66 114 80 142 Z
        M72 164 Q100 188 128 164 L124 162 Q100 178 76 162 Z`,
    },
    { rule: 'nonzero',
      d: `
        M7.4 124.3 L2.6 101.4 L7 100.5 L8.8 109.3 L10 109.1 L7.5 97.6 L12 96.7 L14.4 108.1 L15.6 107.9 L12.8 94.7 L17.2 93.7 L20 106.9 L21.2 106.7 L18.7 95.2 L23.1 94.3 L25.4 104.9 L30 96.5 L34.1 98.4 L27.1 112.8 L28.6 119.8 Z M192.6 124.3 L197.4 101.4 L193 100.5 L191.2 109.3 L190 109.1 L192.5 97.6 L188 96.7 L185.6 108.1 L184.4 107.9 L187.2 94.7 L182.8 93.7 L180 106.9 L178.8 106.7 L181.3 95.2 L176.9 94.3 L174.6 104.9 L170 96.5 L165.9 98.4 L172.9 112.8 L171.4 119.8 Z`,
    },
  ],
};

export const JoystickWraith: React.FC<BotFaceProps> = ({ mood = 'neutral', gesture = 'auto', expression, ...props }) => (
  <Frame {...props} label="Joystick Wraith" faces={WRAITH} expression={resolveExpression(mood, gesture, expression)} />
);

export const StaticJester: React.FC<BotFaceProps> = ({ mood = 'neutral', gesture = 'auto', expression, ...props }) => (
  <Frame {...props} label="Static Jester" faces={JESTER} expression={resolveExpression(mood, gesture, expression)} />
);

export const OctavianHollow: React.FC<BotFaceProps> = ({ mood = 'neutral', gesture = 'auto', expression, ...props }) => (
  <Frame {...props} label="Octavian Hollow" faces={OCTAVIAN} expression={resolveExpression(mood, gesture, expression)} />
);

export const IronRegent: React.FC<BotFaceProps> = ({ mood = 'neutral', gesture = 'auto', expression, ...props }) => (
  <Frame {...props} label="Iron Regent" faces={REGENT} expression={resolveExpression(mood, gesture, expression)} />
);

export const CyclopsRevenant: React.FC<BotFaceProps> = ({ mood = 'neutral', gesture = 'auto', expression, ...props }) => (
  <Frame {...props} label="Cyclops Revenant" faces={CYCLOPS} expression={resolveExpression(mood, gesture, expression)} />
);

export const ChromeReaper: React.FC<BotFaceProps> = ({ mood = 'neutral', gesture = 'auto', expression, ...props }) => (
  <Frame {...props} label="Chrome Reaper" faces={REAPER} expression={resolveExpression(mood, gesture, expression)} />
);

/* ============================================================================
 * BOT REGISTRY
 * ========================================================================== */

export const CHESS_BOTS = [
  { id: "joystick-wraith", name: "Joystick Wraith", Face: JoystickWraith },
  { id: "static-jester", name: "Static Jester", Face: StaticJester },
  { id: "octavian-hollow", name: "Octavian Hollow", Face: OctavianHollow },
  { id: "iron-regent", name: "Iron Regent", Face: IronRegent },
  { id: "cyclops-revenant", name: "Cyclops Revenant", Face: CyclopsRevenant },
  { id: "chrome-reaper", name: "Chrome Reaper", Face: ChromeReaper },
] as const;

export type ChessBotId = (typeof CHESS_BOTS)[number]["id"];

/* ============================================================================
 * IN-GAME PICKER
 * Each bot has its own personality: which faces it uses for each mood.
 * Call pickGesture(botId, mood) once when the mood changes and pass the result:
 *   <Face mood={mood} gesture={pickGesture(botId, mood)} />
 * (Do not call it on every render or the face will flicker.)
 * ========================================================================== */

type GestureSet = Partial<Record<BotMood, BotGesture[]>>;

const DEFAULT_GESTURES: GestureSet = {
  neutral: ['none'],
  thinking: ['none'],
  happy: ['smile', 'hands'],
  smug: ['none', 'taunt'],
  shocked: ['panic'],
  worried: ['none'],
  angry: ['rage', 'horns'],
  victory: ['celebrate', 'taunt'],
  defeat: ['none'],
};

export const BOT_GESTURE_SETS: Record<ChessBotId, GestureSet> = {
  "joystick-wraith": { ...DEFAULT_GESTURES, angry: ['rage'], happy: ['smile', 'hands'], victory: ['celebrate', 'hands'] },
  "static-jester": { ...DEFAULT_GESTURES, angry: ['horns', 'rage'], smug: ['taunt', 'hands'], victory: ['celebrate', 'taunt'] },
  "octavian-hollow": { ...DEFAULT_GESTURES, angry: ['rage', 'horns'], smug: ['none', 'taunt'], victory: ['celebrate'] },
  "iron-regent": { ...DEFAULT_GESTURES, angry: ['rage'], smug: ['none'], happy: ['smile'], victory: ['celebrate', 'smile'] },
  "cyclops-revenant": { ...DEFAULT_GESTURES, angry: ['rage', 'horns'], happy: ['smile'], victory: ['celebrate'] },
  "chrome-reaper": { ...DEFAULT_GESTURES, angry: ['horns', 'rage'], smug: ['taunt', 'none'], victory: ['celebrate', 'taunt'] },
};

/** Returns a random gesture suited to this bot's personality and current mood. */
export const pickGesture = (botId: ChessBotId, mood: BotMood): BotGesture => {
  const pool = BOT_GESTURE_SETS[botId]?.[mood] ?? DEFAULT_GESTURES[mood] ?? ['none'];
  return pool[Math.floor(Math.random() * pool.length)];
};

/* ============================================================================
 * LINEUP (preview of all bots)
 * ========================================================================== */

export const ChessBotLineup: React.FC<{ size?: number; className?: string }> = ({
  size = 120,
  className,
}) => (
  <div
    className={className}
    style={{ display: "grid", gridTemplateColumns: "repeat(3, auto)", gap: 24, justifyItems: "center" }}
  >
    {CHESS_BOTS.map(({ id, name, Face }) => (
      <figure key={id} style={{ margin: 0, textAlign: "center" }}>
        <Face size={size} />
        <figcaption style={{ marginTop: 8 }}>{name}</figcaption>
      </figure>
    ))}
  </div>
);

export default ChessBotLineup;
