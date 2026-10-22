/**
 * Craftable Pieces Data Definitions for GodChess
 *
 * Contains pure movement data structures and metadata for:
 * 1. Communist (zigzag alternating diagonal steps in 4 orthogonal directions)
 * 2. Supreme Rook (unlimited orthogonal slides + diagonal leap 2)
 * 3. Priest (diagonal slide 1-3 + orthogonal leap 2)
 */

import type { PieceType } from '../types/game.ts';

export interface PathMove {
  to: { dx: number; dy: number };
  via: { dx: number; dy: number }[];
}

export interface CraftableMovement {
  leaps?: { dx: number; dy: number }[];
  slides?: { dx: number; dy: number; maxRange?: number }[];
  paths?: PathMove[];
}

export interface CraftablePieceDef {
  id: PieceType;
  name: string;
  shortName: string;
  description: string;
  movementText: string;
  movement: CraftableMovement;
}

export const CRAFTABLE_PIECES: CraftablePieceDef[] = [
  {
    id: 'communist',
    name: 'Communist',
    shortName: 'Communist',
    description: 'Moves along orthogonal directions in an alternating diagonal zigzag. Can stop after 2 or 4 steps if intermediate squares are clear.',
    movementText: 'Zigzag along 4 orthogonal lines (offsets ±2 or ±4). Requires at least one zigzag path to be clear of pieces.',
    movement: {
      paths: [
        // Up (dy = +2, +4)
        { to: { dx: 0, dy: 2 }, via: [{ dx: -1, dy: 1 }] },
        { to: { dx: 0, dy: 2 }, via: [{ dx: 1, dy: 1 }] },
        { to: { dx: 0, dy: 4 }, via: [{ dx: -1, dy: 1 }, { dx: 0, dy: 2 }, { dx: -1, dy: 3 }] },
        { to: { dx: 0, dy: 4 }, via: [{ dx: 1, dy: 1 }, { dx: 0, dy: 2 }, { dx: 1, dy: 3 }] },

        // Down (dy = -2, -4)
        { to: { dx: 0, dy: -2 }, via: [{ dx: -1, dy: -1 }] },
        { to: { dx: 0, dy: -2 }, via: [{ dx: 1, dy: -1 }] },
        { to: { dx: 0, dy: -4 }, via: [{ dx: -1, dy: -1 }, { dx: 0, dy: -2 }, { dx: -1, dy: -3 }] },
        { to: { dx: 0, dy: -4 }, via: [{ dx: 1, dy: -1 }, { dx: 0, dy: -2 }, { dx: 1, dy: -3 }] },

        // Right (dx = +2, +4)
        { to: { dx: 2, dy: 0 }, via: [{ dx: 1, dy: 1 }] },
        { to: { dx: 2, dy: 0 }, via: [{ dx: 1, dy: -1 }] },
        { to: { dx: 4, dy: 0 }, via: [{ dx: 1, dy: 1 }, { dx: 2, dy: 0 }, { dx: 3, dy: 1 }] },
        { to: { dx: 4, dy: 0 }, via: [{ dx: 1, dy: -1 }, { dx: 2, dy: 0 }, { dx: 3, dy: -1 }] },

        // Left (dx = -2, -4)
        { to: { dx: -2, dy: 0 }, via: [{ dx: -1, dy: 1 }] },
        { to: { dx: -2, dy: 0 }, via: [{ dx: -1, dy: -1 }] },
        { to: { dx: -4, dy: 0 }, via: [{ dx: -1, dy: 1 }, { dx: -2, dy: 0 }, { dx: -3, dy: 1 }] },
        { to: { dx: -4, dy: 0 }, via: [{ dx: -1, dy: -1 }, { dx: -2, dy: 0 }, { dx: -3, dy: -1 }] },
      ],
    },
  },
  {
    id: 'supremeRook',
    name: 'Supreme Rook',
    shortName: 'Sup. Rook',
    description: 'Combines full orthogonal sliding of a Rook with diagonal leaping over pieces.',
    movementText: 'Slides any distance orthogonally (blocked by pieces) AND leaps exactly 2 squares diagonally (jumps over pieces).',
    movement: {
      slides: [
        { dx: 0, dy: 1, maxRange: 16 },
        { dx: 0, dy: -1, maxRange: 16 },
        { dx: 1, dy: 0, maxRange: 16 },
        { dx: -1, dy: 0, maxRange: 16 },
      ],
      leaps: [
        { dx: 2, dy: 2 },
        { dx: 2, dy: -2 },
        { dx: -2, dy: 2 },
        { dx: -2, dy: -2 },
      ],
    },
  },
  {
    id: 'priest',
    name: 'Priest',
    shortName: 'Priest',
    description: 'Slides diagonally up to 3 squares and leaps orthogonally 2 squares over pieces.',
    movementText: 'Slides 1–3 squares diagonally (blocked by pieces) AND leaps exactly 2 squares orthogonally (jumps over pieces).',
    movement: {
      slides: [
        { dx: 1, dy: 1, maxRange: 3 },
        { dx: 1, dy: -1, maxRange: 3 },
        { dx: -1, dy: 1, maxRange: 3 },
        { dx: -1, dy: -1, maxRange: 3 },
      ],
      leaps: [
        { dx: 0, dy: 2 },
        { dx: 0, dy: -2 },
        { dx: 2, dy: 0 },
        { dx: -2, dy: 0 },
      ],
    },
  },
];

export const CRAFTABLE_MAP: Record<string, CraftablePieceDef> = {
  communist: CRAFTABLE_PIECES[0],
  supremeRook: CRAFTABLE_PIECES[1],
  priest: CRAFTABLE_PIECES[2],
};

/**
 * Returns static reachable offsets for a 9x9 preview grid (centered at 0,0, radius 4).
 * Generated strictly from the movement definition so the preview and engine logic never diverge.
 */
export function getCraftablePreviewOffsets(def: CraftablePieceDef): { dx: number; dy: number }[] {
  const set = new Set<string>();
  const res: { dx: number; dy: number }[] = [];

  const add = (dx: number, dy: number) => {
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) return;
    if (dx === 0 && dy === 0) return;
    const key = `${dx},${dy}`;
    if (!set.has(key)) {
      set.add(key);
      res.push({ dx, dy });
    }
  };

  if (def.movement.leaps) {
    for (const leap of def.movement.leaps) {
      add(leap.dx, leap.dy);
    }
  }

  if (def.movement.slides) {
    for (const slide of def.movement.slides) {
      const max = Math.min(slide.maxRange ?? 4, 4);
      for (let r = 1; r <= max; r++) {
        add(slide.dx * r, slide.dy * r);
      }
    }
  }

  if (def.movement.paths) {
    for (const p of def.movement.paths) {
      add(p.to.dx, p.to.dy);
    }
  }

  return res;
}
