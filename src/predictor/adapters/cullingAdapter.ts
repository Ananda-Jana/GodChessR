/**
 * Jujutsu Kaisen Culling Game Predictor Adapter
 */

import type { CullingMatchState, CullingPieceColor } from '../../types/cullingGame';
import type { PlayerActionObserved, TacticalMetrics } from '../types';

export function extractCullingMetrics(match: CullingMatchState, playerColor: CullingPieceColor): TacticalMetrics {
  const isWhite = playerColor === 'white';
  const capturesMade = isWhite ? match.whiteCaptureCount || 0 : match.blackCaptureCount || 0;
  const piecesLost = isWhite ? match.blackCaptureCount || 0 : match.whiteCaptureCount || 0;

  const playerMoves = match.history.filter((m) => m.piece.color === playerColor);
  const specialAbilitiesUsed = playerMoves.filter((m) => m.isSpecialAbility || m.actionType === 'domain' || m.actionType === 'black_flash').length;

  let checksDefended = 0;
  if (match.inCheck === playerColor) {
    checksDefended = 1;
  }

  let inCheckCount = 0;
  if (match.inCheck && match.inCheck !== playerColor) {
    inCheckCount = 1;
  }

  let gameOutcome: 'win' | 'loss' | 'draw' | 'active' = 'active';
  if (match.status === 'completed') {
    if (match.winner === playerColor) {
      gameOutcome = 'win';
    } else if (match.winner === null || match.winReason?.toLowerCase().includes('draw')) {
      gameOutcome = 'draw';
    } else {
      gameOutcome = 'loss';
    }
  }

  return {
    materialBalance: capturesMade - piecesLost,
    inCheckCount,
    checksDefendedCount: checksDefended,
    capturesMade,
    piecesLost,
    specialActionsCount: specialAbilitiesUsed,
    bestTacticalSequence: Math.min(5, capturesMade),
    turnsSurvived: playerMoves.length,
    gameOutcome,
  };
}

export function observeCullingMove(
  match: CullingMatchState,
  playerColor: CullingPieceColor
): PlayerActionObserved | null {
  const history = match.history;
  if (!history || history.length === 0) return null;

  const lastMove = history[history.length - 1];
  if (lastMove.piece.color !== playerColor) return null;

  const actionId = `cul_${lastMove.timestamp}_${lastMove.from.x}_${lastMove.from.y}_to_${lastMove.to.x}_${lastMove.to.y}`;

  return {
    id: actionId,
    turnIndex: history.length,
    playerColor,
    mode: 'culling',
    moveSan: lastMove.san || `${lastMove.piece.type} action`,
    pieceType: lastMove.piece.type,
    isCapture: !!lastMove.captured,
    capturedType: lastMove.captured?.type,
    isCheck: match.inCheck !== null && match.inCheck !== playerColor,
    isSpecialAbility: lastMove.isSpecialAbility || lastMove.actionType === 'domain' || lastMove.actionType === 'black_flash',
    abilityName: lastMove.specialAbilityName || lastMove.actionType,
    timestamp: lastMove.timestamp,
  };
}
