/**
 * Standard / Crafted Chess & Bot Match Predictor Adapter
 */

import type { MatchState, PieceColor } from '../../types/game';
import type { PlayerActionObserved, TacticalMetrics } from '../types';

export function extractStandardMetrics(match: MatchState, playerColor: PieceColor): TacticalMetrics {
  const isWhite = playerColor === 'white';
  const playerCaptures = isWhite ? match.capturedByWhite || [] : match.capturedByBlack || [];
  const opponentCaptures = isWhite ? match.capturedByBlack || [] : match.capturedByWhite || [];

  const playerMoves = match.moveHistory.filter((m) => m.piece.color === playerColor);
  const specialPrinceMoves = playerMoves.filter((m) => m.isSpecialPrinceMove).length;
  const craftingActions = match.craftingUsed?.[playerColor] ? 1 : 0;

  let checksDefended = 0;
  if (match.inCheck === playerColor) {
    checksDefended = 1;
  }

  let inCheckCount = 0;
  if (match.inCheck && match.inCheck !== playerColor) {
    inCheckCount = 1;
  }

  let gameOutcome: 'win' | 'loss' | 'draw' | 'active' = 'active';
  if (match.status === 'completed' && match.result) {
    if (match.result.winner === playerColor) {
      gameOutcome = 'win';
    } else if (match.result.winner === 'draw') {
      gameOutcome = 'draw';
    } else if (match.result.winner) {
      gameOutcome = 'loss';
    }
  }

  const materialBalance = playerCaptures.length - opponentCaptures.length;

  return {
    materialBalance,
    inCheckCount,
    checksDefendedCount: checksDefended,
    capturesMade: playerCaptures.length,
    piecesLost: opponentCaptures.length,
    specialActionsCount: specialPrinceMoves + craftingActions,
    bestTacticalSequence: Math.min(5, playerCaptures.length),
    turnsSurvived: playerMoves.length,
    gameOutcome,
  };
}

export function observeStandardMove(
  match: MatchState,
  playerColor: PieceColor
): PlayerActionObserved | null {
  const history = match.moveHistory;
  if (!history || history.length === 0) return null;

  const lastMove = history[history.length - 1];
  if (lastMove.piece.color !== playerColor) return null;

  const actionId = `std_${lastMove.timestamp}_${lastMove.from.x}_${lastMove.from.y}_to_${lastMove.to.x}_${lastMove.to.y}`;

  return {
    id: actionId,
    turnIndex: history.length,
    playerColor,
    mode: match.gameMode === 'crafted' ? 'crafted' : 'standard',
    moveSan: lastMove.san || `${lastMove.piece.type} to (${lastMove.to.x},${lastMove.to.y})`,
    pieceType: lastMove.piece.type,
    isCapture: !!lastMove.captured,
    capturedType: lastMove.captured?.type,
    isCheck: match.inCheck !== null && match.inCheck !== playerColor,
    isSpecialAbility: lastMove.isSpecialPrinceMove,
    abilityName: lastMove.isSpecialPrinceMove ? 'Prince Extended Move' : undefined,
    timestamp: lastMove.timestamp,
  };
}
