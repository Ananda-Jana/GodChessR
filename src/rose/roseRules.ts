import type { Piece, Position, PieceColor, PieceType } from '../types/game.ts';
import {
  createInitialBoard,
  executeMove as engineExecuteMove,
  isKingInCheck,
  isSquareAttacked,
  getLegalMovesForSquare,
} from '../game/engine.ts';
import type { RoseMatchState, RoseSeat, RoseMatchStatus } from './types.ts';

export function createInitialRoseMatch(
  id: string,
  code: string,
  hostSeat: RoseSeat,
  timeControl: 60 | 120 = 60,
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

  // Use engine executeMove
  const engineRes = engineExecuteMove(match as any, from, to);
  if (!engineRes.success || !engineRes.state) {
    return { success: false, error: engineRes.error || 'Invalid move.' };
  }

  const nextMatch = { ...(engineRes.state as unknown as RoseMatchState) };
  const targetPiece = match.board[to.y][to.x];
  const isCapture = targetPiece !== null;
  const isPawn = movingPiece.type === 'pawn';

  // Petal accumulation
  let petalsGained = 0;
  if (isCapture) petalsGained++;

  // Check gave check
  if (nextMatch.inCheck && nextMatch.inCheck !== match.turn) {
    petalsGained++;
  }

  // Love Link check (once per 4 moves)
  if (match.turnCount - currentSeat.lastLoveLinkTurn >= 4) {
    if (checkLoveLink(nextMatch.board, match.turn)) {
      petalsGained++;
      currentSeat.lastLoveLinkTurn = match.turnCount;
    }
  }

  if (petalsGained > 0) {
    currentSeat.petals = Math.min(3, currentSeat.petals + petalsGained);
  }

  // Halfmove clock for 20-move rule without capture or pawn move
  if (isCapture || isPawn) {
    nextMatch.halfmoveClock = 0;
  } else {
    nextMatch.halfmoveClock = (match.halfmoveClock || 0) + 1;
  }

  // Check 20-move draw rule
  if (nextMatch.halfmoveClock >= 40) { // 40 plies = 20 full moves
    nextMatch.status = 'completed';
    nextMatch.winner = 'draw';
    nextMatch.winReason = 'Draw by 20 moves without capture or pawn advance.';
  }

  nextMatch.seq = match.seq + 1;
  nextMatch.updatedAt = Date.now();
  nextMatch.lastTurnStartTime = Date.now();

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
