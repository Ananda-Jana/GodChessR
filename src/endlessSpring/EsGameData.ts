import {
  EsBoardConfig,
  EsGameId,
  EsPiece,
  EsPieceType,
  EsPosition,
  EsSpecialTile,
} from './EsTypes';

export const ES_PIECE_VALUES: Record<EsPieceType, number> = {
  footman: 1,
  shade: 3,
  wind: 3,
  beam: 4,
  guide: 4,
  keeper: 2,
  dreamer: 2,
  observer: 1,
  banded: 1,
  guest: 1,
  undertow: 2,
  rescuer: 4,
  angel: 3,
  scarecrow: 0,
  echo: 0,
  investigator: 0,
  boat: 0,
  crowd: 0,
  torchbearer: 0,
  kin: 0,
  watcher: 0,
  yjkstra: 5,
};

export interface EsStoryScript {
  intro: string;
  win: string;
  loss: string;
  draw?: string;
  variants?: Record<string, string>;
}

export const ES_STORY_SCRIPTS: Record<EsGameId, EsStoryScript> = {
  1: {
    intro:
      'A schoolyard split by a creeping line of shadow. You hold the dark half of the kingdom, and Sunanda holds the light. Hold your scarecrow until dusk.',
    win: 'The shadow held until the bell. The light recedes into memory.',
    loss: 'The light reached the scarecrow. The kingdom fell to the noon sun.',
    draw: 'The dusk bell rings over an unyielding stalemate. Neither light nor shadow yields.',
  },
  2: {
    intro:
      'A Saturday school with no one in it, and a helmet that grins without a mouth. Carry the notebook and the hotel slip to the way out, and do not let him ask too much.',
    win: 'You walked out holding what you were meant to keep.',
    loss: 'He asked, and you answered too much.',
  },
  3: {
    intro:
      'A hotel by the sea that repeats itself, water that rises where it should not, and a fair gate that is gone when you look back. Keep the paper boat afloat.',
    win: 'The boat sailed on into uncharted waters.',
    loss: 'The boat was lost again.',
  },
  4: {
    intro:
      'The fair has turned. Find the gap with AJX, then the quiet of home, then the red door.',
    win: 'You left, but part of you did not.',
    loss: 'The crowd closed over you.',
    variants: {
      mercy: 'Mercy: The crowd parted and few were harmed along the way.',
      cost: 'The Cost: You found the red door, but the wake of the fair was heavy.',
      silence: 'Silence: The fair dissolved into an uneasy, breathless quiet.',
    },
  },
  5: {
    intro:
      'Spring that refuses to end, a home that feels too perfect, and papers you were not meant to read. Trust no one until they are revealed.',
    win: 'END OF PART ONE. The spring opens into an endless horizon.',
    loss: 'The held breath breaks.',
  },
};

export const ES_ROUND_LIMITS: Record<EsGameId, number | number[]> = {
  1: 30,
  2: 30,
  3: [10, 9, 8], // stage 1, 2, 3
  4: [14, 12, 8], // act 1, 2, 3
  5: [10, 14, 8], // phase 1, 2, 3
};

export const ES_FIRE_SCHEDULE: EsPosition[] = [
  { x: 3, y: 3 },
  { x: 4, y: 4 },
  { x: 3, y: 4 },
  { x: 4, y: 3 },
  { x: 2, y: 3 },
  { x: 5, y: 4 },
  { x: 2, y: 4 },
  { x: 5, y: 3 },
  { x: 3, y: 2 },
  { x: 4, y: 5 },
];

/**
 * Parses ASCII board strings (top row first, y = height - 1 - rowIdx)
 */
export function esParseAsciiBoard(rows: string[], wrapTorus = false): EsBoardConfig {
  const height = rows.length;
  const width = rows[0].length;
  const voidSquares: EsPosition[] = [];

  for (let r = 0; r < height; r++) {
    const y = height - 1 - r;
    for (let x = 0; x < width; x++) {
      if (rows[r][x] === '#') {
        voidSquares.push({ x, y });
      }
    }
  }

  return { width, height, voidSquares, wrapTorus };
}

export function esGetInitialBoard(gameId: EsGameId, stageOrAct = 1): EsBoardConfig {
  switch (gameId) {
    case 1:
      return { width: 8, height: 8, voidSquares: [] };
    case 2:
      return esParseAsciiBoard([
        '#...#...#', // y4
        '##.###.##', // y3
        '.........', // y2
        '##.###.##', // y1
        '#...#...#', // y0
      ]);
    case 3:
      if (stageOrAct === 1) {
        return { width: 5, height: 5, voidSquares: [], wrapTorus: true };
      } else if (stageOrAct === 2) {
        return esParseAsciiBoard([
          '.......', // y6
          '.#...#.', // y5
          '.......', // y4
          '..#.#..', // y3
          '.......', // y2
          '.#...#.', // y1
          '.......', // y0
        ]);
      } else {
        return esParseAsciiBoard([
          '........', // y5
          '..#..#..', // y4
          '........', // y3
          '.#....#.', // y2
          '........', // y1
          '........', // y0
        ]);
      }
    case 4:
      if (stageOrAct === 1) {
        const voids: EsPosition[] = [];
        for (let x = 3; x <= 5; x++) {
          voids.push({ x, y: 7 }, { x, y: 8 });
        }
        return { width: 9, height: 9, voidSquares: voids };
      } else if (stageOrAct === 2) {
        return esParseAsciiBoard([
          '.......', // y6
          '.#...#.', // y5
          '.......', // y4
          '...#...', // y3
          '.......', // y2
          '.#...#.', // y1
          '.......', // y0
        ]);
      } else {
        return esParseAsciiBoard([
          '.....', // y6
          '.....', // y5
          '.....', // y4
          '.#.#.', // y3
          '.....', // y2
          '.....', // y1
          '.....', // y0
        ]);
      }
    case 5:
      if (stageOrAct === 1) {
        return { width: 7, height: 7, voidSquares: [{ x: 3, y: 3 }] };
      } else if (stageOrAct === 2) {
        return esParseAsciiBoard([
          '.........', // y6
          '.##.#.##.', // y5
          '.........', // y4
          '.#.###.#.', // y3
          '.........', // y2
          '.##.#.##.', // y1
          '.........', // y0
        ]);
      } else {
        return { width: 5, height: 5, voidSquares: [] };
      }
  }
}

export function esGetInitialPieces(gameId: EsGameId, stageOrAct = 1, carriedAllies: EsPieceType[] = []): EsPiece[] {
  let counter = 1;
  const p = (type: EsPieceType, side: 'A' | 'B' | 'neutral', x: number, y: number): EsPiece => ({
    id: `es_${type}_${counter++}`,
    type,
    side,
    pos: { x, y },
  });

  switch (gameId) {
    case 1: {
      const pieces: EsPiece[] = [
        p('shade', 'A', 1, 0),
        p('wind', 'A', 2, 0),
        p('scarecrow', 'A', 3, 0),
        p('dreamer', 'A', 4, 0),
        p('beam', 'A', 5, 0),
        p('footman', 'A', 2, 1),
        p('footman', 'A', 3, 1),
        p('footman', 'A', 4, 1),
      ];
      // Mirror for side B: x -> 7-x, y -> 7-y with keeper instead of dreamer
      pieces.push(
        p('shade', 'B', 7 - 1, 7 - 0),
        p('wind', 'B', 7 - 2, 7 - 0),
        p('scarecrow', 'B', 7 - 3, 7 - 0),
        p('keeper', 'B', 7 - 4, 7 - 0),
        p('beam', 'B', 7 - 5, 7 - 0),
        p('footman', 'B', 7 - 2, 7 - 1),
        p('footman', 'B', 7 - 3, 7 - 1),
        p('footman', 'B', 7 - 4, 7 - 1)
      );
      return pieces;
    }
    case 2:
      return [
        p('dreamer', 'A', 4, 2),
        p('footman', 'A', 3, 2),
        p('footman', 'A', 5, 2),
        p('investigator', 'B', 7, 2),
        p('observer', 'B', 6, 0),
        p('observer', 'B', 2, 4),
      ];
    case 3:
      if (stageOrAct === 1) {
        return [
          p('boat', 'A', 2, 0),
          p('shade', 'A', 1, 0),
          p('wind', 'A', 3, 0),
          p('guest', 'B', 0, 2),
          p('guest', 'B', 4, 2),
        ];
      } else if (stageOrAct === 2) {
        return [
          p('boat', 'A', 3, 0),
          p('rescuer', 'A', 2, 0),
          p('wind', 'A', 4, 0),
          p('undertow', 'B', 1, 4),
          p('undertow', 'B', 5, 4),
        ];
      } else {
        return [
          p('boat', 'A', 3, 0),
          p('dreamer', 'A', 4, 0),
          p('shade', 'A', 2, 0),
          p('guest', 'B', 1, 3),
          p('guest', 'B', 6, 3),
        ];
      }
    case 4:
      if (stageOrAct === 1) {
        return [
          p('dreamer', 'A', 4, 6),
          p('guide', 'A', 3, 6),
          p('banded', 'B', 1, 8),
          p('banded', 'B', 7, 8),
          p('banded', 'B', 0, 6),
          p('banded', 'B', 8, 6),
        ];
      } else if (stageOrAct === 2) {
        return [
          p('dreamer', 'A', 3, 0),
          p('guide', 'A', 0, 0),
          p('scarecrow', 'neutral', 3, 6),
        ];
      } else {
        return [
          p('dreamer', 'A', 2, 0),
          p('guide', 'A', 1, 0),
          p('torchbearer', 'neutral', 2, 5),
        ];
      }
    case 5:
      if (stageOrAct === 1) {
        return [
          p('dreamer', 'A', 3, 0),
          p('kin', 'neutral', 1, 2),
          p('kin', 'neutral', 5, 2),
          p('kin', 'neutral', 0, 4),
          p('kin', 'neutral', 6, 4),
          p('kin', 'neutral', 2, 5),
          p('kin', 'neutral', 4, 5),
        ];
      } else if (stageOrAct === 2) {
        const pieces: EsPiece[] = [
          p('dreamer', 'A', 0, 0),
          p('watcher', 'B', 8, 6),
        ];
        const candidatePos: EsPosition[] = [
          { x: 0, y: 1 },
          { x: 1, y: 0 },
          { x: 0, y: 2 },
        ];
        let cIdx = 0;
        for (const allyType of carriedAllies.slice(0, 3)) {
          if (cIdx < candidatePos.length) {
            pieces.push(p(allyType, 'A', candidatePos[cIdx].x, candidatePos[cIdx].y));
            cIdx++;
          }
        }
        return pieces;
      } else {
        const pieces: EsPiece[] = [
          p('dreamer', 'A', 2, 0),
          p('yjkstra', 'B', 2, 4),
        ];
        const candidatePos: EsPosition[] = [
          { x: 1, y: 0 },
          { x: 3, y: 0 },
          { x: 2, y: 1 },
        ];
        let cIdx = 0;
        for (const allyType of carriedAllies.slice(0, 3)) {
          if (cIdx < candidatePos.length) {
            pieces.push(p(allyType, 'A', candidatePos[cIdx].x, candidatePos[cIdx].y));
            cIdx++;
          }
        }
        return pieces;
      }
  }
}

export function esGetInitialSpecialTiles(gameId: EsGameId, stageOrAct = 1): EsSpecialTile[] {
  switch (gameId) {
    case 2:
      return [
        { pos: { x: 2, y: 0 }, type: 'notebook' },
        { pos: { x: 6, y: 4 }, type: 'slip' },
        { pos: { x: 8, y: 2 }, type: 'exit' },
      ];
    case 3:
      if (stageOrAct === 1) {
        return [
          { pos: { x: 2, y: 2 }, type: 'passage' },
          { pos: { x: 3, y: 2 }, type: 'passage' },
        ];
      } else if (stageOrAct === 2) {
        return [
          { pos: { x: 3, y: 6 }, type: 'passage' },
          { pos: { x: 4, y: 6 }, type: 'passage' },
        ];
      } else {
        return [
          { pos: { x: 3, y: 5 }, type: 'passage' },
          { pos: { x: 4, y: 5 }, type: 'passage' },
        ];
      }
    case 4:
      if (stageOrAct === 3) {
        return [{ pos: { x: 2, y: 6 }, type: 'red_door' }];
      }
      return [];
    case 5:
      if (stageOrAct === 2) {
        return [
          { pos: { x: 2, y: 6 }, type: 'paper' },
          { pos: { x: 6, y: 6 }, type: 'paper' },
          { pos: { x: 4, y: 4 }, type: 'paper' },
          { pos: { x: 2, y: 2 }, type: 'paper' },
          { pos: { x: 6, y: 2 }, type: 'paper' },
          { pos: { x: 8, y: 6 }, type: 'stair' },
        ];
      }
      return [];
    default:
      return [];
  }
}

export function esGetInitialCrowdTokens(): EsPosition[] {
  return [
    { x: 1, y: 5 },
    { x: 3, y: 5 },
    { x: 5, y: 5 },
    { x: 7, y: 5 },
    { x: 0, y: 4 },
    { x: 2, y: 4 },
    { x: 6, y: 4 },
    { x: 8, y: 4 },
    { x: 1, y: 3 },
    { x: 4, y: 3 },
    { x: 7, y: 3 },
    { x: 3, y: 2 },
  ];
}
