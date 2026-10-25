import {
  EsBoardConfig,
  EsGameState,
  EsMove,
  EsPiece,
  EsPieceType,
  EsPosition,
} from './EsTypes';

export function esChebyshevDistance(a: EsPosition, b: EsPosition): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function esManhattanDistance(a: EsPosition, b: EsPosition): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function esIsSamePos(a: EsPosition, b: EsPosition): boolean {
  return a.x === b.x && a.y === b.y;
}

export function esIsPlayableSquare(board: EsBoardConfig, pos: EsPosition): boolean {
  if (pos.x < 0 || pos.x >= board.width || pos.y < 0 || pos.y >= board.height) {
    return false;
  }
  return !board.voidSquares.some((v) => esIsSamePos(v, pos));
}

export function esGetPieceAt(pieces: EsPiece[], pos: EsPosition): EsPiece | undefined {
  return pieces.find((p) => esIsSamePos(p.pos, pos));
}

export function esIsNeutralTokenAt(state: EsGameState, pos: EsPosition): boolean {
  if (state.crowdTokens && state.crowdTokens.some((t) => esIsSamePos(t, pos))) {
    return true;
  }
  return false;
}

const O4_DIRECTIONS: EsPosition[] = [
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: -1, y: 0 },
];

const D4_DIRECTIONS: EsPosition[] = [
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
  { x: -1, y: -1 },
];

const ALL_8_DIRECTIONS: EsPosition[] = [...O4_DIRECTIONS, ...D4_DIRECTIONS];

const KNIGHT_OFFSETS: EsPosition[] = [
  { x: 1, y: 2 },
  { x: 2, y: 1 },
  { x: 2, y: -1 },
  { x: 1, y: -2 },
  { x: -1, y: -2 },
  { x: -2, y: -1 },
  { x: -2, y: 1 },
  { x: -1, y: 2 },
];

export function esPieceCanCapture(piece: EsPiece): boolean {
  if (piece.type === 'echo' && piece.isRealFootman) return true;
  const noCaptureTypes: EsPieceType[] = ['scarecrow', 'echo', 'investigator', 'boat', 'crowd', 'kin', 'torchbearer'];
  return !noCaptureTypes.includes(piece.type);
}

export function esPieceCanBeCaptured(target: EsPiece): boolean {
  if (target.type === 'echo' && !target.isRealFootman) return false;
  if (target.type === 'torchbearer' || target.type === 'watcher') return false;
  return true;
}

/**
 * Normalizes coordinate on a toroidal board (Game 3 Stage 1)
 */
export function esWrapCoord(coord: number, max: number): number {
  return ((coord % max) + max) % max;
}

/**
 * Computes legal target positions for a specific piece given the current game state
 */
export function esGetLegalMovesForPiece(state: EsGameState, piece: EsPiece): EsPosition[] {
  // If frozen by Torchbearer stillness (Game 4 Act 3)
  if (piece.frozenRounds && piece.frozenRounds > 0) {
    return [];
  }

  // Yjkstra acts on odd rounds only
  if (piece.type === 'yjkstra' && state.round % 2 === 0) {
    return [];
  }

  const { board, pieces } = state;
  const isTorus = !!board.wrapTorus;
  const targets: EsPosition[] = [];
  const canCapture = esPieceCanCapture(piece);

  // Check if piece is on a flooded row in Game 3 Stage 2
  const isFlooded = state.gameId === 3 && state.stageOrAct === 2 && state.floodedRows.includes(piece.pos.y);

  // Helper to validate and add square
  const considerSquare = (dest: EsPosition): boolean => {
    // If destination is not playable (out of bounds or void), cannot enter
    if (!isTorus) {
      if (!esIsPlayableSquare(board, dest)) return false;
    } else {
      // In torus, dest.x and dest.y are wrapped
      if (!esIsPlayableSquare(board, dest)) return false;
    }

    // Fire squares (Game 1) are void
    if (state.fireSquares && state.fireSquares.some((f) => esIsSamePos(f, dest))) {
      return false;
    }

    // Cannot land on neutral crowd tokens
    if (esIsNeutralTokenAt(state, dest)) {
      return false;
    }

    const occupant = esGetPieceAt(pieces, dest);
    if (!occupant) {
      // Empty playable square
      targets.push(dest);
      return true; // Ray may continue if sliding
    }

    // Friendly piece -> cannot land, ray stops
    if (occupant.side === piece.side) {
      return false;
    }

    // Neutral piece (kin, scarecrow in G4A2)
    if (occupant.side === 'neutral') {
      // AJ moving onto scarecrow in G4A2 wins
      if (state.gameId === 4 && state.stageOrAct === 2 && occupant.type === 'scarecrow') {
        targets.push(dest);
      }
      return false; // Ray stops
    }

    // Enemy piece
    if (!canCapture || !esPieceCanBeCaptured(occupant)) {
      return false; // Cannot capture, ray stops
    }

    // Game 1 Shadow Line rule:
    // If target stands in shadow (x < state.shadowLineS), attacker must be within Chebyshev distance 1
    if (state.gameId === 1 && state.shadowLineS !== undefined) {
      const inShadow = dest.x < state.shadowLineS;
      if (inShadow) {
        const dist = esChebyshevDistance(piece.pos, dest);
        if (dist > 1) {
          return false; // Cannot capture from afar
        }
      }
    }

    // Valid capture!
    targets.push(dest);
    return false; // Ray stops at captured enemy
  };

  // Helper for ray sliding
  const castRay = (dir: EsPosition, maxSteps: number) => {
    let curr = { ...piece.pos };
    for (let step = 1; step <= maxSteps; step++) {
      let nextX = curr.x + dir.x;
      let nextY = curr.y + dir.y;
      if (isTorus) {
        nextX = esWrapCoord(nextX, board.width);
        nextY = esWrapCoord(nextY, board.height);
        // Sliders wrap but cannot pass through their own starting square!
        if (nextX === piece.pos.x && nextY === piece.pos.y) {
          break;
        }
      }
      const nextPos = { x: nextX, y: nextY };
      const continueRay = considerSquare(nextPos);
      if (!continueRay) break;
      curr = nextPos;
    }
  };

  // Helper for 1-step moves in given directions
  const stepMoves = (dirs: EsPosition[]) => {
    for (const dir of dirs) {
      let nextX = piece.pos.x + dir.x;
      let nextY = piece.pos.y + dir.y;
      if (isTorus) {
        nextX = esWrapCoord(nextX, board.width);
        nextY = esWrapCoord(nextY, board.height);
      }
      considerSquare({ x: nextX, y: nextY });
    }
  };

  // If flooded (Game 3 Stage 2), any piece is limited to Chebyshev distance 1!
  if (isFlooded) {
    stepMoves(ALL_8_DIRECTIONS);
    return targets;
  }

  // Normal movement based on piece type
  const actualType = piece.type === 'echo' && piece.isRealFootman ? 'footman' : piece.type;

  switch (actualType) {
    case 'dreamer':
    case 'keeper':
    case 'undertow':
    case 'banded':
      // 1 step in 8
      stepMoves(ALL_8_DIRECTIONS);
      break;

    case 'footman':
    case 'scarecrow':
    case 'echo':
    case 'observer':
    case 'boat':
    case 'guest':
    case 'torchbearer':
    case 'watcher':
      // 1 step in O4
      stepMoves(O4_DIRECTIONS);
      break;

    case 'guide':
      // slides up to 3 in O4 OR 1 step in D4
      for (const dir of O4_DIRECTIONS) {
        castRay(dir, 3);
      }
      stepMoves(D4_DIRECTIONS);
      break;

    case 'shade':
      // Knight jump (wraps if torus)
      for (const offset of KNIGHT_OFFSETS) {
        let nx = piece.pos.x + offset.x;
        let ny = piece.pos.y + offset.y;
        if (isTorus) {
          nx = esWrapCoord(nx, board.width);
          ny = esWrapCoord(ny, board.height);
        }
        considerSquare({ x: nx, y: ny });
      }
      break;

    case 'wind': {
      // slides up to 3 in D4 (max 2 if storm)
      const maxWind = state.isStorm ? 2 : 3;
      for (const dir of D4_DIRECTIONS) {
        castRay(dir, maxWind);
      }
      break;
    }

    case 'beam': {
      // slides up to 4 in O4 (max 2 if storm)
      const maxBeam = state.isStorm ? 2 : 4;
      for (const dir of O4_DIRECTIONS) {
        castRay(dir, maxBeam);
      }
      break;
    }

    case 'angel':
      // slides up to 3 in D4
      for (const dir of D4_DIRECTIONS) {
        castRay(dir, 3);
      }
      break;

    case 'investigator':
      // slides up to 2 in O4, NO capture
      for (const dir of O4_DIRECTIONS) {
        castRay(dir, 2);
      }
      break;

    case 'rescuer':
      // slides up to 4 in O4
      for (const dir of O4_DIRECTIONS) {
        castRay(dir, 4);
      }
      break;

    case 'yjkstra':
      // slides up to 2 in 8 directions
      for (const dir of ALL_8_DIRECTIONS) {
        castRay(dir, 2);
      }
      break;

    case 'kin':
      // Neutral piece, does not move until revealed
      break;
  }

  return targets;
}

/**
 * Gets all legal moves for a given side ('A' or 'B')
 */
export function esGetAllLegalMoves(state: EsGameState, side: 'A' | 'B'): EsMove[] {
  const moves: EsMove[] = [];
  const sidePieces = state.pieces.filter((p) => p.side === side);

  for (const piece of sidePieces) {
    const legalDests = esGetLegalMovesForPiece(state, piece);
    for (const to of legalDests) {
      const captured = esGetPieceAt(state.pieces, to);
      moves.push({
        pieceId: piece.id,
        from: piece.pos,
        to,
        capturedPieceId: captured?.id,
      });
    }
  }

  return moves;
}

/**
 * Executes a move and returns a new game state (immutable)
 */
export function esApplyMove(state: EsGameState, move: EsMove): EsGameState {
  const pieces = state.pieces.map((p) => ({ ...p, pos: { ...p.pos } }));
  const mover = pieces.find((p) => p.id === move.pieceId);
  if (!mover) return state;

  let capturedPiece: EsPiece | undefined;
  const filteredPieces = pieces.filter((p) => {
    if (p.id === move.capturedPieceId || (esIsSamePos(p.pos, move.to) && p.id !== move.pieceId)) {
      capturedPiece = p;
      return false;
    }
    return true;
  });

  const movingPieceIndex = filteredPieces.findIndex((p) => p.id === move.pieceId);
  if (movingPieceIndex !== -1) {
    filteredPieces[movingPieceIndex].pos = { ...move.to };
  }

  let loopsCount = state.loopsCount;
  // Game 3 Stage 1: If the boat itself wraps across an edge, loops +1
  if (state.gameId === 3 && state.stageOrAct === 1 && mover.type === 'boat') {
    const wrappedX = Math.abs(move.to.x - move.from.x) > 1;
    const wrappedY = Math.abs(move.to.y - move.from.y) > 1;
    if (wrappedX || wrappedY) {
      loopsCount++;
    }
  }

  // Game 2 item collection (Notebook / Slip)
  const itemsCollected = { ...state.itemsCollected };
  if (state.gameId === 2 && mover.type === 'dreamer') {
    const tileOnLanding = state.specialTiles.find((t) => esIsSamePos(t.pos, move.to) && !t.collected);
    if (tileOnLanding) {
      if (tileOnLanding.type === 'notebook') itemsCollected.notebook = true;
      if (tileOnLanding.type === 'slip') itemsCollected.slip = true;
    }
  }

  // Game 5 Phase 2 paper collection
  let papersCollected = state.papersCollected;
  if (state.gameId === 5 && state.stageOrAct === 2 && mover.type === 'dreamer') {
    const paperTile = state.specialTiles.find((t) => esIsSamePos(t.pos, move.to) && t.type === 'paper' && !t.collected);
    if (paperTile) {
      papersCollected++;
    }
  }

  const specialTiles = state.specialTiles.map((t) => {
    if (esIsSamePos(t.pos, move.to)) {
      if (t.type === 'notebook' && mover.type === 'dreamer') return { ...t, collected: true };
      if (t.type === 'slip' && mover.type === 'dreamer') return { ...t, collected: true };
      if (t.type === 'paper' && mover.type === 'dreamer') return { ...t, collected: true };
    }
    return t;
  });

  // Check Game 1 Ryoshin Shrine capture
  let hasRyoshinBlessing = state.hasRyoshinBlessing;
  let blessingTurnMovesLeft = state.blessingTurnMovesLeft;
  let blessingMovedPieceId = state.blessingMovedPieceId;

  if (state.gameId === 1) {
    const shrineTile = state.specialTiles.find((t) => t.type === 'shrine' && esIsSamePos(t.pos, move.to));
    if (shrineTile && !state.hasRyoshinBlessing) {
      hasRyoshinBlessing = mover.side as 'A' | 'B';
    }
  }

  return {
    ...state,
    pieces: filteredPieces,
    specialTiles,
    loopsCount,
    itemsCollected,
    papersCollected,
    hasRyoshinBlessing,
    blessingTurnMovesLeft,
    blessingMovedPieceId,
    updatedAt: Date.now(),
  };
}
