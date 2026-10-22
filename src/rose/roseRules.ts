import type { Piece, Position, PieceColor, PieceType } from '../types/game.ts';
import {
  createInitialBoard,
  executeMove as engineExecuteMove,
  isKingInCheck,
  isSquareAttacked,
  getLegalMovesForSquare,
} from '../game/engine.ts';
import type { RoseMatchState, RoseSeat, RoseMatchStatus, RoseRole } from './types.ts';

export function createInitialRoseMatch(
  id: string,
  code: string,
  hostSeat: RoseSeat,
  timeControl: number = 0,
  moveSuggestions = true
): RoseMatchState {
  const board = createInitialBoard('standard');
  const now = Date.now();
  const isWhite = hostSeat.color === 'white';

  return {
    id,
    code,
    status: 'waiting_guest',
    timeControl,
    moveSuggestions,
    board,
    turn: 'white',
    turnCount: 1,
    winner: null,
    inCheck: null,
    whiteSeat: isWhite ? hostSeat : null,
    blackSeat: !isWhite ? hostSeat : null,
    whiteTimeRemaining: timeControl,
    blackTimeRemaining: timeControl,
    lastTurnStartTime: now,
    history: [],
    halfmoveClock: 0,
    positionHistory: [JSON.stringify(board)],
    seq: 1,
    createdAt: now,
    updatedAt: now,
  };
}

export function getSeatByColor(match: RoseMatchState, color: PieceColor): RoseSeat | null {
  return color === 'white' ? match.whiteSeat : match.blackSeat;
}

export function getSeatByUserId(match: RoseMatchState, userId: string): RoseSeat | null {
  if (match.whiteSeat?.userId === userId) return match.whiteSeat;
  if (match.blackSeat?.userId === userId) return match.blackSeat;
  return null;
}

/**
  * Check if Queen and Prince are adjacent in 8-neighborhood for Love Link petal gain.
  */
function checkLoveLink(board: (Piece | null)[][], color: PieceColor): boolean {
  let queenPos: Position | null = null;
  let princePos: Position | null = null;

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const p = board[y][x];
      if (p && p.color === color) {
        if (p.type === 'queen') queenPos = { x, y };
        if (p.type === 'prince') princePos = { x, y };
      }
    }
  }

  if (!queenPos || !princePos) return false;
  return Math.abs(queenPos.x - princePos.x) <= 1 && Math.abs(queenPos.y - princePos.y) <= 1;
}

export function applyRoseMove(
  match: RoseMatchState,
  from: Position,
  to: Position
): { success: boolean; state?: RoseMatchState; error?: string } {
  if (match.status !== 'active') {
    return { success: false, error: 'Match is not active.' };
  }

  const movingPiece = match.board[from.y]?.[from.x];
  if (!movingPiece || movingPiece.color !== match.turn) {
    return { success: false, error: 'No piece of your color at source square.' };
  }

  const currentSeat = getSeatByColor(match, match.turn);
  if (!currentSeat) {
    return { success: false, error: 'No seat assigned for current turn.' };
  }

  // Use engine executeMove with pure chess rules (dice disabled)
  const engineState = {
    ...match,
    diceActive: false,
    dice: null,
    capturedByWhite: (match as any).capturedByWhite || [],
    capturedByBlack: (match as any).capturedByBlack || [],
    whitePlayer: { userId: match.whiteSeat?.userId || 'w', username: match.whiteSeat?.username || 'w', displayName: match.whiteSeat?.displayName || 'w' },
    blackPlayer: { userId: match.blackSeat?.userId || 'b', username: match.blackSeat?.username || 'b', displayName: match.blackSeat?.displayName || 'b' },
    whitePawnsReachedEndRank: (match as any).whitePawnsReachedEndRank || 0,
    blackPawnsReachedEndRank: (match as any).blackPawnsReachedEndRank || 0,
    moveHistory: (match as any).moveHistory || [],
  };
  const engineRes = engineExecuteMove(engineState as any, from, to);
  if (!engineRes.success || !engineRes.state) {
    return { success: false, error: engineRes.error || 'Invalid move.' };
  }

  const whiteSeatCopy: RoseSeat | null = match.whiteSeat ? { ...match.whiteSeat } : null;
  const blackSeatCopy: RoseSeat | null = match.blackSeat ? { ...match.blackSeat } : null;
  const activeSeat = match.turn === 'white' ? whiteSeatCopy : blackSeatCopy;

  const targetPiece = match.board[to.y][to.x];
  const isCapture = targetPiece !== null;
  const isPawn = movingPiece.type === 'pawn';

  // Petal accumulation
  let petalsGained = 0;
  if (isCapture) petalsGained++;

  // Check gave check
  if (engineRes.state.inCheck && engineRes.state.inCheck !== match.turn) {
    petalsGained++;
  }

  // Love Link check (once per 4 moves)
  if (activeSeat && match.turnCount - activeSeat.lastLoveLinkTurn >= 4) {
    if (checkLoveLink(engineRes.state.board, match.turn)) {
      petalsGained++;
      activeSeat.lastLoveLinkTurn = match.turnCount;
    }
  }

  if (activeSeat && petalsGained > 0) {
    activeSeat.petals = Math.min(3, activeSeat.petals + petalsGained);
  }

  let halfmove = (isCapture || isPawn) ? 0 : (match.halfmoveClock || 0) + 1;
  let status: RoseMatchStatus = engineRes.state.status === 'completed' ? 'completed' : match.status;
  let winner: RoseRole | 'draw' | null = null;
  let winReason: string | undefined = engineRes.state.result?.reason ? String(engineRes.state.result.reason) : undefined;

  if (engineRes.state.result?.winner === 'draw') {
    winner = 'draw';
  } else if (engineRes.state.result?.winner === 'white') {
    winner = whiteSeatCopy?.role || 'boyfriend';
  } else if (engineRes.state.result?.winner === 'black') {
    winner = blackSeatCopy?.role || 'girlfriend';
  }

  // Check 20-move draw rule
  if (halfmove >= 40) {
    status = 'completed';
    winner = 'draw';
    winReason = 'Draw by 20 moves without capture or pawn advance.';
  }

  const nextMatch: RoseMatchState = {
    ...match,
    whiteSeat: whiteSeatCopy,
    blackSeat: blackSeatCopy,
    board: engineRes.state.board,
    turn: engineRes.state.turn,
    turnCount: match.turnCount + (match.turn === 'black' ? 1 : 0),
    inCheck: engineRes.state.inCheck,
    status,
    winner,
    winReason,
    lastMove: { from, to, piece: movingPiece },
    halfmoveClock: halfmove,
    history: [
      ...match.history,
      {
        from,
        to,
        piece: movingPiece,
        captured: targetPiece || undefined,
        san: `${movingPiece.type} to ${to.x},${to.y}`,
        timestamp: Date.now(),
      },
    ],
    seq: match.seq + 1,
    updatedAt: Date.now(),
    lastTurnStartTime: Date.now(),
  };

  return { success: true, state: nextMatch };
}

export function applyRoseSummon(
  match: RoseMatchState,
  userId: string,
  pieceType: 'priest' | 'communist' | 'supremeRook',
  pos: Position
): { success: boolean; state?: RoseMatchState; error?: string } {
  if (match.status !== 'active') {
    return { success: false, error: 'Match is not active.' };
  }

  const seat = getSeatByUserId(match, userId);
  if (!seat || seat.color !== match.turn) {
    return { success: false, error: 'Not your turn or not seated.' };
  }

  if (seat.petals < 3) {
    return { success: false, error: 'Summon requires 3 Petals.' };
  }

  if (seat.summonsUsed >= 2) {
    return { success: false, error: 'Maximum 2 summons per game reached.' };
  }

  if (match.inCheck === seat.color) {
    return { success: false, error: 'Cannot summon while in check.' };
  }

  // Check home zone (2 rows nearest player's own edge)
  const homeRows = seat.color === 'white' ? [0, 1] : [6, 7];
  if (!homeRows.includes(pos.y)) {
    return { success: false, error: 'Summon must be placed in your 2-row home zone.' };
  }

  if (match.board[pos.y][pos.x] !== null) {
    return { success: false, error: 'Summon square must be empty.' };
  }

  const enemyColor: PieceColor = seat.color === 'white' ? 'black' : 'white';
  if (isSquareAttacked(match.board, pos, enemyColor)) {
    return { success: false, error: 'Summon square cannot be attacked by an enemy piece.' };
  }

  const tempBoard = match.board.map((row) => [...row]);
  tempBoard[pos.y][pos.x] = {
    id: `rose_summon_${seat.color}_${Date.now()}`,
    type: pieceType,
    color: seat.color,
    hasMoved: true,
  };

  if (isKingInCheck(tempBoard, seat.color)) {
    return { success: false, error: 'Summon would leave your King in check.' };
  }

  if (isKingInCheck(tempBoard, enemyColor)) {
    return { success: false, error: 'Summon cannot immediately give check to enemy King.' };
  }

  // Apply summon
  seat.petals -= 3;
  seat.summonsUsed++;

  const nextBoard = tempBoard;
  const nextTurn: PieceColor = seat.color === 'white' ? 'black' : 'white';
  const nextInCheck = isKingInCheck(nextBoard, nextTurn) ? nextTurn : null;

  let nextStatus: RoseMatchStatus = match.status;
  let nextWinner = match.winner;
  let winReason = match.winReason;

  // Check checkmate / stalemate after summon turn ends
  const enemySeat = getSeatByColor(match, nextTurn);
  let hasLegalMoves = false;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const p = nextBoard[y][x];
      if (p && p.color === nextTurn) {
        const moves = getLegalMovesForSquare(match as any, { x, y });
        if (moves.length > 0) {
          hasLegalMoves = true;
          break;
        }
      }
    }
    if (hasLegalMoves) break;
  }

  if (!hasLegalMoves) {
    nextStatus = 'completed';
    if (nextInCheck) {
      nextWinner = seat.role;
      winReason = `Checkmate by summon! ${seat.role} wins.`;
    } else {
      nextWinner = 'draw';
      winReason = 'Draw by stalemate.';
    }
  }

  const nextState: RoseMatchState = {
    ...match,
    board: nextBoard,
    turn: nextTurn,
    turnCount: match.turnCount + 1,
    inCheck: nextInCheck,
    status: nextStatus,
    winner: nextWinner,
    winReason,
    halfmoveClock: 0,
    seq: match.seq + 1,
    updatedAt: Date.now(),
    lastTurnStartTime: Date.now(),
    history: [
      ...match.history,
      {
        from: pos,
        to: pos,
        piece: nextBoard[pos.y][pos.x]!,
        san: `SUMMON ${pieceType.toUpperCase()} @ ${pos.x},${pos.y}`,
        isSummon: true,
        timestamp: Date.now(),
      },
    ],
  };

  return { success: true, state: nextState };
}
