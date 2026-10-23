import type { Piece, Position, PieceColor, PieceType } from '../types/game.ts';
import {
  createInitialBoard,
  executeMove as engineExecuteMove,
  isKingInCheck,
  isSquareAttacked,
  getLegalMovesForSquare,
  findKingPosition,
  getPseudoLegalMoves,
} from '../game/engine.ts';
import type { RoseMatchState, RoseSeat, RoseMatchStatus, RoseRole, RoseSummonPieceType } from './types.ts';

export interface RoseCheckDetails {
  inCheck: boolean;
  kingPos: Position | null;
  attackerPositions: Position[];
  rayPositions: Position[];
}

/**
 * Computes check details for a given color:
 * 1. Attacker square(s) delivering check
 * 2. Ray squares between sliding attackers and the King
 */
export function getRoseCheckDetails(
  board: (Piece | null)[][],
  color: PieceColor
): RoseCheckDetails {
  const kingPos = findKingPosition(board, color);
  if (!kingPos) {
    return { inCheck: false, kingPos: null, attackerPositions: [], rayPositions: [] };
  }

  const attackerPositions: Position[] = [];
  const rayPositions: Position[] = [];
  const enemyColor: PieceColor = color === 'white' ? 'black' : 'white';
  const boardHeight = board.length;
  const boardWidth = board[0]?.length || 8;

  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const piece = board[y][x];
      if (piece && piece.color === enemyColor) {
        const enemyMoves = getPseudoLegalMoves(board, { x, y });
        const attacksKing = enemyMoves.some(
          (m) => m.to.x === kingPos.x && m.to.y === kingPos.y
        );

        if (attacksKing) {
          attackerPositions.push({ x, y });

          // Ray computation for sliding pieces
          const dx = Math.sign(kingPos.x - x);
          const dy = Math.sign(kingPos.y - y);
          const isOrth = (x === kingPos.x && y !== kingPos.y) || (y === kingPos.y && x !== kingPos.x);
          const isDiag = Math.abs(kingPos.x - x) === Math.abs(kingPos.y - y);

          if (
            (isOrth || isDiag) &&
            (piece.type === 'queen' ||
              piece.type === 'rook' ||
              piece.type === 'bishop' ||
              piece.type === 'supremeRook' ||
              piece.type === 'priest' ||
              piece.type === 'prince')
          ) {
            let cx = x + dx;
            let cy = y + dy;
            while (cx !== kingPos.x || cy !== kingPos.y) {
              if (cx >= 0 && cx < boardWidth && cy >= 0 && cy < boardHeight) {
                rayPositions.push({ x: cx, y: cy });
              }
              cx += dx;
              cy += dy;
            }
          }
        }
      }
    }
  }

  const seenRay = new Set<string>();
  const dedupedRays = rayPositions.filter((p) => {
    const k = `${p.x},${p.y}`;
    if (seenRay.has(k)) return false;
    seenRay.add(k);
    return true;
  });

  return {
    inCheck: attackerPositions.length > 0,
    kingPos,
    attackerPositions,
    rayPositions: dedupedRays,
  };
}

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

  // Use engine executeMove with pure chess rules (dice & mid-game crafting disabled)
  const engineState = {
    ...match,
    diceActive: false,
    craftingAllowed: false,
    expansionUsed: { white: true, black: true },
    craftingUsed: { white: true, black: true },
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
  let winReason: string | undefined = undefined;

  // In Rose Paradise, two_pawns_end_rank_draw is not applicable (couples chess allows normal pawn promotions)
  if (engineRes.state.result?.reason === 'two_pawns_end_rank_draw') {
    status = 'active';
    winner = null;
    winReason = undefined;
  } else if (engineRes.state.result?.winner === 'draw') {
    winner = 'draw';
    winReason = engineRes.state.result.reason === 'stalemate' ? 'Draw by stalemate.' : 'Draw.';
  } else if (engineRes.state.result?.winner === 'white') {
    winner = whiteSeatCopy?.role || 'boyfriend';
    winReason = `Checkmate! ${whiteSeatCopy?.displayName || 'White'} wins with a bouquet of roses.`;
  } else if (engineRes.state.result?.winner === 'black') {
    winner = blackSeatCopy?.role || 'girlfriend';
    winReason = `Checkmate! ${blackSeatCopy?.displayName || 'Black'} wins with a bouquet of roses.`;
  }

  // Check 20-move draw rule without capture or pawn move
  if (status !== 'completed' && halfmove >= 40) {
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

export function getValidRoseSummonSquares(
  board: (Piece | null)[][],
  myColor: PieceColor,
  pieceType: RoseSummonPieceType
): Position[] {
  // Rule: Cannot summon while in check! Defend King first!
  if (isKingInCheck(board, myColor)) {
    return [];
  }

  const validSquares: Position[] = [];
  const enemyColor: PieceColor = myColor === 'white' ? 'black' : 'white';

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (board[y][x] !== null) continue;

      const tempBoard = board.map((row) => [...row]);
      tempBoard[y][x] = {
        id: `rose_test_summon`,
        type: pieceType as PieceType,
        color: myColor,
        hasMoved: true,
      };

      // Rule 1: Cannot leave or place friendly king in check
      if (isKingInCheck(tempBoard, myColor)) continue;

      // Rule 2: Cannot immediately deliver check to enemy king upon initial summon
      if (isKingInCheck(tempBoard, enemyColor)) continue;

      validSquares.push({ x, y });
    }
  }

  return validSquares;
}

export function applyRoseSummon(
  match: RoseMatchState,
  userIdOrColor: string,
  pieceType: RoseSummonPieceType,
  pos: Position
): { success: boolean; state?: RoseMatchState; error?: string } {
  if (match.status !== 'active') {
    return { success: false, error: 'Match is not active.' };
  }

  // Resolve seat either by seat color ('white' | 'black') or by userId
  let seat: RoseSeat | null = null;
  if (userIdOrColor === 'white' || userIdOrColor === 'black') {
    seat = getSeatByColor(match, userIdOrColor);
  } else {
    seat = getSeatByUserId(match, userIdOrColor);
  }
  // Safe fallback to active player if single player / bot match
  if (!seat && match.status === 'active') {
    seat = match.turn === 'white' ? match.whiteSeat : match.blackSeat;
  }

  if (!seat || seat.color !== match.turn) {
    return { success: false, error: 'Not your turn or not seated.' };
  }

  if (match.inCheck === seat.color || isKingInCheck(match.board, seat.color)) {
    return { success: false, error: 'Cannot summon while King is in check. Escape check first!' };
  }

  if (seat.petals < 3) {
    return { success: false, error: 'Summon requires 3 Petals.' };
  }

  if (seat.summonsUsed >= 2) {
    return { success: false, error: 'Maximum 2 summons per game reached.' };
  }

  if (pos.x < 0 || pos.x > 7 || pos.y < 0 || pos.y > 7) {
    return { success: false, error: 'Invalid board position.' };
  }

  if (match.board[pos.y][pos.x] !== null) {
    return { success: false, error: 'Summon square must be empty.' };
  }

  const enemyColor: PieceColor = seat.color === 'white' ? 'black' : 'white';
  const tempBoard = match.board.map((row) => [...row]);
  tempBoard[pos.y][pos.x] = {
    id: `rose_summon_${seat.color}_${Date.now()}`,
    type: pieceType as PieceType,
    color: seat.color,
    hasMoved: true,
  };

  if (isKingInCheck(tempBoard, seat.color)) {
    return { success: false, error: 'Summon would leave your King in check.' };
  }

  if (isKingInCheck(tempBoard, enemyColor)) {
    return { success: false, error: 'Summon cannot immediately give check to enemy King.' };
  }

  // Update seats with new petal count & summon usage
  const whiteSeatCopy: RoseSeat | null = match.whiteSeat ? { ...match.whiteSeat } : null;
  const blackSeatCopy: RoseSeat | null = match.blackSeat ? { ...match.blackSeat } : null;
  const activeSeat = match.turn === 'white' ? whiteSeatCopy : blackSeatCopy;

  if (activeSeat) {
    activeSeat.petals = Math.max(0, activeSeat.petals - 3);
    activeSeat.summonsUsed++;
  }

  const nextBoard = tempBoard;
  const nextTurn: PieceColor = seat.color === 'white' ? 'black' : 'white';
  const nextInCheck = isKingInCheck(nextBoard, nextTurn) ? nextTurn : null;

  let nextStatus: RoseMatchStatus = match.status;
  let nextWinner = match.winner;
  let winReason = match.winReason;

  // Check checkmate / stalemate for opponent after summon turn ends
  let hasLegalMoves = false;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const p = nextBoard[y][x];
      if (p && p.color === nextTurn) {
        const moves = getLegalMovesForSquare(nextBoard, { x, y });
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
      winReason = `Checkmate by tactical summon! ${seat.role} wins.`;
    } else {
      nextWinner = 'draw';
      winReason = 'Draw by stalemate after summon.';
    }
  }

  const nextState: RoseMatchState = {
    ...match,
    whiteSeat: whiteSeatCopy,
    blackSeat: blackSeatCopy,
    board: nextBoard,
    turn: nextTurn,
    turnCount: match.turnCount + (match.turn === 'black' ? 1 : 0),
    inCheck: nextInCheck,
    status: nextStatus,
    winner: nextWinner,
    winReason,
    lastMove: { from: pos, to: pos, piece: nextBoard[pos.y][pos.x]! },
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
