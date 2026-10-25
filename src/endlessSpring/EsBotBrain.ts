import {
  esApplyMove,
  esChebyshevDistance,
  esGetAllLegalMoves,
  esGetPieceAt,
  esManhattanDistance,
} from './EsRules';
import { ES_PIECE_VALUES } from './EsGameData';
import { EsGameState, EsMove, EsPiece } from './EsTypes';

export function esEvaluatePosition(state: EsGameState): number {
  let score = 0;

  // Material evaluation from B's perspective (positive = good for B)
  for (const p of state.pieces) {
    const val = ES_PIECE_VALUES[p.type] || 0;
    if (p.side === 'B') score += val * 10;
    if (p.side === 'A') score -= val * 10;
  }

  // Game-specific heuristics
  const aj = state.pieces.find((p) => p.side === 'A' && p.type === 'dreamer');
  const bScarecrow = state.pieces.find((p) => p.side === 'B' && p.type === 'scarecrow');
  const boat = state.pieces.find((p) => p.type === 'boat');

  switch (state.gameId) {
    case 1: {
      // +3 for each own piece on shadow square
      for (const p of state.pieces) {
        if (p.side === 'B' && p.pos.x < state.shadowLineS) {
          score += 3;
        }
      }
      // -8 if own scarecrow is on light square with enemy beam or wind in line
      if (bScarecrow && bScarecrow.pos.x >= state.shadowLineS) {
        const threat = state.pieces.some(
          (p) =>
            p.side === 'A' &&
            (p.type === 'beam' || p.type === 'wind') &&
            (p.pos.x === bScarecrow.pos.x || p.pos.y === bScarecrow.pos.y)
        );
        if (threat) score -= 8;
      }
      // +20 for adjacency to Shrine when it exists
      const shrine = state.specialTiles.find((t) => t.type === 'shrine');
      if (shrine) {
        const nearShrine = state.pieces.some(
          (p) => p.side === 'B' && esChebyshevDistance(p.pos, shrine.pos) <= 1
        );
        if (nearShrine) score += 20;
      }
      break;
    }

    case 2: {
      // Investigator moves toward AJ
      const investigator = state.pieces.find((p) => p.type === 'investigator');
      if (investigator && aj) {
        score -= esManhattanDistance(investigator.pos, aj.pos) * 5;
      }
      // Observers move toward items and AJ
      const observers = state.pieces.filter((p) => p.type === 'observer');
      for (const obs of observers) {
        if (aj) score -= esManhattanDistance(obs.pos, aj.pos) * 2;
      }
      // -50 if AJ holds both items
      if (state.itemsCollected.notebook && state.itemsCollected.slip) {
        score -= 50;
      }
      break;
    }

    case 3: {
      // +10 for each step a guest gets closer to the boat
      if (boat) {
        for (const p of state.pieces) {
          if (p.side === 'B') {
            const dist = esChebyshevDistance(p.pos, boat.pos);
            score += (10 - dist) * 10;
          }
        }
      }
      break;
    }

    case 4: {
      // Act 1: Banded move toward row 0 to intercept AJ
      if (state.stageOrAct === 1 && aj) {
        for (const p of state.pieces) {
          if (p.side === 'B') {
            score -= esManhattanDistance(p.pos, aj.pos) * 3;
          }
        }
      }
      break;
    }

    case 5: {
      // Phase 3: Yjkstra moves toward AJ
      const yjkstra = state.pieces.find((p) => p.type === 'yjkstra');
      if (yjkstra && aj) {
        score -= esChebyshevDistance(yjkstra.pos, aj.pos) * 5;
      }
      break;
    }
  }

  return score;
}

export function esTieBreakMoves(a: EsMove, b: EsMove): number {
  if (a.pieceId !== b.pieceId) {
    return a.pieceId.localeCompare(b.pieceId);
  }
  if (a.to.y !== b.to.y) {
    return a.to.y - b.to.y;
  }
  return a.to.x - b.to.x;
}

/**
 * Deterministic Minimax with Alpha-Beta pruning for Bot (Side B)
 */
export function esGetBestBotMove(state: EsGameState, maxDepth = 2): EsMove | null {
  const legalMoves = esGetAllLegalMoves(state, 'B');
  if (legalMoves.length === 0) return null;

  // Stable sort for strict determinism
  legalMoves.sort(esTieBreakMoves);

  let bestMove: EsMove = legalMoves[0];
  let bestScore = -Infinity;

  for (const move of legalMoves) {
    const nextState = esApplyMove(state, move);
    let score = 0;

    if (maxDepth > 1) {
      // Depth 2 evaluation: Simulate player's counter-move (minimizing B's score)
      const counterMoves = esGetAllLegalMoves(nextState, 'A');
      if (counterMoves.length > 0) {
        let minScore = Infinity;
        for (const cm of counterMoves) {
          const afterCounter = esApplyMove(nextState, cm);
          const evalScore = esEvaluatePosition(afterCounter);
          if (evalScore < minScore) {
            minScore = evalScore;
          }
        }
        score = minScore;
      } else {
        score = esEvaluatePosition(nextState);
      }
    } else {
      score = esEvaluatePosition(nextState);
    }

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
