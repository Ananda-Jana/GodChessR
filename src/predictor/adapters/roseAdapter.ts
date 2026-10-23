/**
 * Rose Paradise Couples Mode Predictor Adapter
 */

import type { PieceColor } from '../../types/game';
import type { RoseMatchState } from '../../rose/types';
import type { PlayerActionObserved, TacticalMetrics } from '../types';

export function extractRoseMetrics(match: RoseMatchState, playerColor: PieceColor): TacticalMetrics {
  const isWhite = playerColor === 'white';
  const playerSeat = isWhite ? match.whiteSeat : match.blackSeat;
  const partnerSeat = isWhite ? match.blackSeat : match.whiteSeat;

  const petalsHarvested = playerSeat?.petals || 0;
  const summonsUsed = playerSeat?.summonsUsed || 0;

  const playerMoves = match.history.filter((m) => m.piece.color === playerColor);
  const capturesMade = playerMoves.filter((m) => !!m.captured).length;

  let gameOutcome: 'win' | 'loss' | 'draw' | 'active' = 'active';
  if (match.status === 'completed') {
    if (match.winner === playerSeat?.role) {
      gameOutcome = 'win';
    } else if (match.winner === 'draw') {
      gameOutcome = 'draw';
    } else if (match.winner) {
      gameOutcome = 'loss';
    }
  }

  return {
    materialBalance: petalsHarvested * 2,
    inCheckCount: match.inCheck && match.inCheck !== playerColor ? 1 : 0,
    checksDefendedCount: match.inCheck === playerColor ? 1 : 0,
    capturesMade,
    piecesLost: 0, // Rose mode emphasizes peaceful harmony
    specialActionsCount: petalsHarvested + summonsUsed,
    bestTacticalSequence: Math.min(5, petalsHarvested + 1),
    turnsSurvived: playerMoves.length,
    gameOutcome,
    opponentDifficulty: 'couples_partner',
  };
}

export function observeRoseMove(
  match: RoseMatchState,
  playerColor: PieceColor
): PlayerActionObserved | null {
  const history = match.history;
  if (!history || history.length === 0) return null;

  const lastMove = history[history.length - 1];
  if (lastMove.piece.color !== playerColor) return null;

  const actionId = `rose_${lastMove.timestamp}_${lastMove.from.x}_${lastMove.from.y}_to_${lastMove.to.x}_${lastMove.to.y}`;

  return {
    id: actionId,
    turnIndex: history.length,
    playerColor,
    mode: 'rose',
    moveSan: lastMove.san || `${lastMove.piece.type} move`,
    pieceType: lastMove.piece.type,
    isCapture: !!lastMove.captured,
    capturedType: lastMove.captured?.type,
    isCheck: match.inCheck !== null && match.inCheck !== playerColor,
    isSpecialAbility: lastMove.isSummon,
    abilityName: lastMove.isSummon ? 'Rose Piece Summon' : undefined,
    timestamp: lastMove.timestamp,
  };
}
