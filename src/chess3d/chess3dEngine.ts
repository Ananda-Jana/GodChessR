import type { PieceType, Team } from './3dchesspieces';
import type { PlacedPiece, Position3D, Move3D, Chess3dMatchState, TimeControl3D, Player3DInfo, GameStatus3D } from './types';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

export function posToNotation(pos: Position3D): string {
  return `${FILES[pos.c]}${RANKS[pos.r]}`;
}

export function createInitialPieces(): PlacedPiece[] {
  const pieces: PlacedPiece[] = [];
  let idCount = 0;
  const makeId = (team: Team, type: PieceType) => `${team}_${type}_${++idCount}`;

  // Black / Red (ranks 8..7, r: 0..1)
  const backRowRed: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  backRowRed.forEach((type, c) => {
    pieces.push({ id: makeId('red', type), type, team: 'red', c, r: 0, hasMoved: false });
  });
  for (let c = 0; c < 8; c++) {
    pieces.push({ id: makeId('red', 'pawn'), type: 'pawn', team: 'red', c, r: 1, hasMoved: false });
  }

  // White / Orange (ranks 2..1, r: 6..7)
  for (let c = 0; c < 8; c++) {
    pieces.push({ id: makeId('orange', 'pawn'), type: 'pawn', team: 'orange', c, r: 6, hasMoved: false });
  }
  const backRowOrange: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  backRowOrange.forEach((type, c) => {
    pieces.push({ id: makeId('orange', type), type, team: 'orange', c, r: 7, hasMoved: false });
  });

  return pieces;
}

export function getPieceAt(pieces: PlacedPiece[], c: number, r: number): PlacedPiece | undefined {
  return pieces.find((p) => p.c === c && p.r === r);
}

export function isInsideBoard(c: number, r: number): boolean {
  return c >= 0 && c < 8 && r >= 0 && r < 8;
}

export function isSquareAttacked(
  pieces: PlacedPiece[],
  targetC: number,
  targetR: number,
  byTeam: Team
): boolean {
  for (const p of pieces) {
    if (p.team !== byTeam) continue;

    if (p.type === 'pawn') {
      const forward = byTeam === 'orange' ? -1 : 1;
      if (p.r + forward === targetR && (p.c - 1 === targetC || p.c + 1 === targetC)) {
        return true;
      }
      continue;
    }

    if (p.type === 'knight') {
      const jumps = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      for (const [dc, dr] of jumps) {
        if (p.c + dc === targetC && p.r + dr === targetR) return true;
      }
      continue;
    }

    if (p.type === 'king') {
      const distC = Math.abs(p.c - targetC);
      const distR = Math.abs(p.r - targetR);
      if (distC <= 1 && distR <= 1 && (distC > 0 || distR > 0)) return true;
      continue;
    }

    // Ray sliding pieces: bishop, rook, queen
    const directions: [number, number][] = [];
    if (p.type === 'rook' || p.type === 'queen') {
      directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    }
    if (p.type === 'bishop' || p.type === 'queen') {
      directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }

    for (const [dc, dr] of directions) {
      let curC = p.c + dc;
      let curR = p.r + dr;
      while (isInsideBoard(curC, curR)) {
        if (curC === targetC && curR === targetR) return true;
        if (getPieceAt(pieces, curC, curR)) break; // ray blocked
        curC += dc;
        curR += dr;
      }
    }
  }
  return false;
}

export function isKingInCheck(pieces: PlacedPiece[], team: Team): boolean {
  const king = pieces.find((p) => p.type === 'king' && p.team === team);
  if (!king) return false;
  const oppTeam: Team = team === 'orange' ? 'red' : 'orange';
  return isSquareAttacked(pieces, king.c, king.r, oppTeam);
}

export function getPseudoLegalMoves(
  pieces: PlacedPiece[],
  piece: PlacedPiece,
  enPassantTarget: Position3D | null
): { to: Position3D; isEnPassant?: boolean; isCastling?: 'kingside' | 'queenside' }[] {
  const moves: { to: Position3D; isEnPassant?: boolean; isCastling?: 'kingside' | 'queenside' }[] = [];
  const oppTeam: Team = piece.team === 'orange' ? 'red' : 'orange';

  if (piece.type === 'pawn') {
    const fwd = piece.team === 'orange' ? -1 : 1;
    const startRow = piece.team === 'orange' ? 6 : 1;

    // 1-step forward
    if (isInsideBoard(piece.c, piece.r + fwd) && !getPieceAt(pieces, piece.c, piece.r + fwd)) {
      moves.push({ to: { c: piece.c, r: piece.r + fwd } });

      // 2-steps forward from starting rank
      if (piece.r === startRow && !getPieceAt(pieces, piece.c, piece.r + 2 * fwd)) {
        moves.push({ to: { c: piece.c, r: piece.r + 2 * fwd } });
      }
    }

    // Diagonal captures
    for (const dc of [-1, 1]) {
      const targetC = piece.c + dc;
      const targetR = piece.r + fwd;
      if (!isInsideBoard(targetC, targetR)) continue;

      const targetPiece = getPieceAt(pieces, targetC, targetR);
      if (targetPiece && targetPiece.team === oppTeam) {
        moves.push({ to: { c: targetC, r: targetR } });
      } else if (
        enPassantTarget &&
        enPassantTarget.c === targetC &&
        enPassantTarget.r === targetR
      ) {
        // En passant capture
        moves.push({ to: { c: targetC, r: targetR }, isEnPassant: true });
      }
    }
  } else if (piece.type === 'knight') {
    const jumps = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    for (const [dc, dr] of jumps) {
      const tc = piece.c + dc;
      const tr = piece.r + dr;
      if (!isInsideBoard(tc, tr)) continue;
      const occ = getPieceAt(pieces, tc, tr);
      if (!occ || occ.team === oppTeam) {
        moves.push({ to: { c: tc, r: tr } });
      }
    }
  } else if (piece.type === 'king') {
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (dc === 0 && dr === 0) continue;
        const tc = piece.c + dc;
        const tr = piece.r + dr;
        if (!isInsideBoard(tc, tr)) continue;
        const occ = getPieceAt(pieces, tc, tr);
        if (!occ || occ.team === oppTeam) {
          moves.push({ to: { c: tc, r: tr } });
        }
      }
    }

    // Castling
    if (!piece.hasMoved && !isKingInCheck(pieces, piece.team)) {
      const row = piece.team === 'orange' ? 7 : 0;
      if (piece.r === row && piece.c === 4) {
        // Kingside castling (O-O) -> King to (6, row), Rook at (7, row)
        const rookK = getPieceAt(pieces, 7, row);
        if (
          rookK &&
          rookK.type === 'rook' &&
          !rookK.hasMoved &&
          !getPieceAt(pieces, 5, row) &&
          !getPieceAt(pieces, 6, row) &&
          !isSquareAttacked(pieces, 5, row, oppTeam) &&
          !isSquareAttacked(pieces, 6, row, oppTeam)
        ) {
          moves.push({ to: { c: 6, r: row }, isCastling: 'kingside' });
        }

        // Queenside castling (O-O-O) -> King to (2, row), Rook at (0, row)
        const rookQ = getPieceAt(pieces, 0, row);
        if (
          rookQ &&
          rookQ.type === 'rook' &&
          !rookQ.hasMoved &&
          !getPieceAt(pieces, 1, row) &&
          !getPieceAt(pieces, 2, row) &&
          !getPieceAt(pieces, 3, row) &&
          !isSquareAttacked(pieces, 2, row, oppTeam) &&
          !isSquareAttacked(pieces, 3, row, oppTeam)
        ) {
          moves.push({ to: { c: 2, r: row }, isCastling: 'queenside' });
        }
      }
    }
  } else {
    // Sliding: bishop, rook, queen
    const directions: [number, number][] = [];
    if (piece.type === 'rook' || piece.type === 'queen') {
      directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    }
    if (piece.type === 'bishop' || piece.type === 'queen') {
      directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }

    for (const [dc, dr] of directions) {
      let tc = piece.c + dc;
      let tr = piece.r + dr;
      while (isInsideBoard(tc, tr)) {
        const occ = getPieceAt(pieces, tc, tr);
        if (!occ) {
          moves.push({ to: { c: tc, r: tr } });
        } else {
          if (occ.team === oppTeam) {
            moves.push({ to: { c: tc, r: tr } });
          }
          break; // hit a piece, stop ray
        }
        tc += dc;
        tr += dr;
      }
    }
  }

  return moves;
}

export function simulateMove(
  pieces: PlacedPiece[],
  piece: PlacedPiece,
  to: Position3D,
  isEnPassant?: boolean,
  isCastling?: 'kingside' | 'queenside'
): PlacedPiece[] {
  const nextPieces = pieces
    .filter((p) => {
      if (p.id === piece.id) return false;
      if (isEnPassant && p.c === to.c && p.r === piece.r) return false;
      return !(p.c === to.c && p.r === to.r);
    })
    .map((p) => ({ ...p }));

  // Move the piece
  nextPieces.push({
    ...piece,
    c: to.c,
    r: to.r,
    hasMoved: true,
  });

  // Handle castling rook reposition
  if (isCastling) {
    const row = to.r;
    if (isCastling === 'kingside') {
      const rookIdx = nextPieces.findIndex((p) => p.c === 7 && p.r === row && p.type === 'rook');
      if (rookIdx !== -1) {
        nextPieces[rookIdx] = { ...nextPieces[rookIdx], c: 5, hasMoved: true };
      }
    } else if (isCastling === 'queenside') {
      const rookIdx = nextPieces.findIndex((p) => p.c === 0 && p.r === row && p.type === 'rook');
      if (rookIdx !== -1) {
        nextPieces[rookIdx] = { ...nextPieces[rookIdx], c: 3, hasMoved: true };
      }
    }
  }

  return nextPieces;
}

export function getLegalMoves(
  pieces: PlacedPiece[],
  piece: PlacedPiece,
  enPassantTarget: Position3D | null
): { to: Position3D; isEnPassant?: boolean; isCastling?: 'kingside' | 'queenside' }[] {
  const pseudoMoves = getPseudoLegalMoves(pieces, piece, enPassantTarget);
  return pseudoMoves.filter((m) => {
    const simulated = simulateMove(pieces, piece, m.to, m.isEnPassant, m.isCastling);
    return !isKingInCheck(simulated, piece.team);
  });
}

export function getAllLegalMoves(
  pieces: PlacedPiece[],
  team: Team,
  enPassantTarget: Position3D | null
): { piece: PlacedPiece; to: Position3D; isEnPassant?: boolean; isCastling?: 'kingside' | 'queenside' }[] {
  const allMoves: { piece: PlacedPiece; to: Position3D; isEnPassant?: boolean; isCastling?: 'kingside' | 'queenside' }[] = [];
  for (const p of pieces) {
    if (p.team !== team) continue;
    const legals = getLegalMoves(pieces, p, enPassantTarget);
    for (const m of legals) {
      allMoves.push({ piece: p, ...m });
    }
  }
  return allMoves;
}

export function formatSAN(
  piece: PlacedPiece,
  from: Position3D,
  to: Position3D,
  captured: boolean,
  isCastling?: 'kingside' | 'queenside',
  promotion?: PieceType,
  isCheck?: boolean,
  isMate?: boolean
): string {
  if (isCastling === 'kingside') return isMate ? 'O-O#' : isCheck ? 'O-O+' : 'O-O';
  if (isCastling === 'queenside') return isMate ? 'O-O-O#' : isCheck ? 'O-O-O+' : 'O-O-O';

  let san = '';
  if (piece.type === 'pawn') {
    if (captured) {
      san += `${FILES[from.c]}x`;
    }
    san += `${FILES[to.c]}${RANKS[to.r]}`;
    if (promotion) {
      const pChar = promotion === 'knight' ? 'N' : promotion[0].toUpperCase();
      san += `=${pChar}`;
    }
  } else {
    const pChar = piece.type === 'knight' ? 'N' : piece.type[0].toUpperCase();
    san += pChar;
    if (captured) san += 'x';
    san += `${FILES[to.c]}${RANKS[to.r]}`;
  }

  if (isMate) san += '#';
  else if (isCheck) san += '+';

  return san;
}

export function execute3dMove(
  state: Chess3dMatchState,
  from: Position3D,
  to: Position3D,
  promotionChoice: PieceType = 'queen'
): { success: boolean; state: Chess3dMatchState; error?: string } {
  if (state.status !== 'active') {
    return { success: false, state, error: 'Game is already completed.' };
  }

  const piece = getPieceAt(state.pieces, from.c, from.r);
  if (!piece) {
    return { success: false, state, error: 'No piece at selected square.' };
  }
  if (piece.team !== state.turn) {
    return { success: false, state, error: "Not this player's turn." };
  }

  const legalMoves = getLegalMoves(state.pieces, piece, state.enPassantTarget);
  const matchedMove = legalMoves.find((m) => m.to.c === to.c && m.to.r === to.r);
  if (!matchedMove) {
    return { success: false, state, error: 'Illegal move.' };
  }

  const now = Date.now();
  const elapsedMs = Math.max(0, now - state.lastMoveTime);
  let whiteTime = state.whiteTimeRemainingMs;
  let blackTime = state.blackTimeRemainingMs;

  if (state.timeControl !== 'untimed') {
    if (state.turn === 'orange') {
      whiteTime = Math.max(0, whiteTime - elapsedMs);
      if (whiteTime === 0) {
        return {
          success: true,
          state: {
            ...state,
            whiteTimeRemainingMs: 0,
            status: 'timeout',
            winner: 'red',
            winReason: 'White ran out of time',
          },
        };
      }
    } else {
      blackTime = Math.max(0, blackTime - elapsedMs);
      if (blackTime === 0) {
        return {
          success: true,
          state: {
            ...state,
            blackTimeRemainingMs: 0,
            status: 'timeout',
            winner: 'orange',
            winReason: 'Black ran out of time',
          },
        };
      }
    }
  }

  // Detect capture
  let capturedPiece = getPieceAt(state.pieces, to.c, to.r);
  if (matchedMove.isEnPassant) {
    capturedPiece = getPieceAt(state.pieces, to.c, from.r);
  }

  const capturedOrange = [...state.capturedOrange];
  const capturedRed = [...state.capturedRed];
  if (capturedPiece) {
    if (capturedPiece.team === 'orange') capturedOrange.push(capturedPiece.type);
    else capturedRed.push(capturedPiece.type);
  }

  // Handle promotion
  const isPawnPromotion =
    piece.type === 'pawn' && (to.r === 0 || to.r === 7);
  const finalType: PieceType = isPawnPromotion ? promotionChoice : piece.type;

  let nextPieces = simulateMove(
    state.pieces,
    piece,
    to,
    matchedMove.isEnPassant,
    matchedMove.isCastling
  );

  if (isPawnPromotion) {
    nextPieces = nextPieces.map((p) => {
      if (p.id === piece.id) {
        return { ...p, type: finalType };
      }
      return p;
    });
  }

  // Update en passant target
  let newEnPassant: Position3D | null = null;
  if (piece.type === 'pawn' && Math.abs(to.r - from.r) === 2) {
    newEnPassant = { c: from.c, r: (from.r + to.r) / 2 };
  }

  const nextTurn: Team = state.turn === 'orange' ? 'red' : 'orange';
  const inCheck = isKingInCheck(nextPieces, nextTurn) ? nextTurn : null;
  const oppLegalMoves = getAllLegalMoves(nextPieces, nextTurn, newEnPassant);

  let newStatus: GameStatus3D = 'active';
  let winner = state.winner;
  let winReason = state.winReason;

  if (oppLegalMoves.length === 0) {
    if (inCheck) {
      newStatus = 'checkmate';
      winner = state.turn;
      winReason = `Checkmate! ${state.turn === 'orange' ? 'White' : 'Black'} wins.`;
    } else {
      newStatus = 'stalemate';
      winner = 'draw';
      winReason = 'Stalemate - no legal moves.';
    }
  }

  const san = formatSAN(
    piece,
    from,
    to,
    Boolean(capturedPiece),
    matchedMove.isCastling,
    isPawnPromotion ? finalType : undefined,
    Boolean(inCheck),
    newStatus === 'checkmate'
  );

  const moveRecord: Move3D = {
    from,
    to,
    piece,
    captured: capturedPiece,
    promotion: isPawnPromotion ? finalType : undefined,
    isEnPassant: matchedMove.isEnPassant,
    isCastling: matchedMove.isCastling,
    san,
  };

  const nextState: Chess3dMatchState = {
    ...state,
    pieces: nextPieces,
    turn: nextTurn,
    status: newStatus,
    winner,
    winReason,
    inCheck,
    moveHistory: [...state.moveHistory, moveRecord],
    lastMove: moveRecord,
    capturedOrange,
    capturedRed,
    whiteTimeRemainingMs: whiteTime,
    blackTimeRemainingMs: blackTime,
    lastMoveTime: now,
    enPassantTarget: newEnPassant,
  };

  return { success: true, state: nextState };
}

export function createInitialMatchState(
  id: string,
  whitePlayer: Player3DInfo,
  blackPlayer: Player3DInfo,
  timeControl: TimeControl3D = '5m',
  mode: 'bot' | 'multiplayer' = 'bot'
): Chess3dMatchState {
  const ms =
    timeControl === '3m'
      ? 180 * 1000
      : timeControl === '5m'
      ? 300 * 1000
      : 99999999;

  return {
    id,
    pieces: createInitialPieces(),
    turn: 'orange', // Orange is White and moves first
    status: 'active',
    inCheck: null,
    moveHistory: [],
    capturedOrange: [],
    capturedRed: [],
    timeControl,
    whiteTimeRemainingMs: ms,
    blackTimeRemainingMs: ms,
    lastMoveTime: Date.now(),
    enPassantTarget: null,
    mode,
    whitePlayer,
    blackPlayer,
  };
}
