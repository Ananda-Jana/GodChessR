import {
  CraftPiece,
  CraftPieceColor,
  CraftPieceType,
  CraftPosition,
  CraftMove,
  CraftVariantConfig,
} from './craftGameTypes';

const PIECE_VALUES: Record<CraftPieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
  prince: 650,
  communist: 400,
  priest: 450,
  supremeRook: 800,
};

export function cloneBoard(board: (CraftPiece | null)[][]): (CraftPiece | null)[][] {
  return board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
}

export function isWithinBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

export function findKing(
  board: (CraftPiece | null)[][],
  color: CraftPieceColor
): CraftPosition | null {
  const height = board.length;
  const width = board[0].length;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = board[y][x];
      if (p && p.color === color && p.type === 'king') {
        return { x, y };
      }
    }
  }
  return null;
}

/**
 * Returns raw pseudo-legal moves for a piece at (x, y).
 */
export function getPseudoLegalMoves(
  board: (CraftPiece | null)[][],
  pos: CraftPosition,
  variant: CraftVariantConfig
): CraftMove[] {
  const { width, height } = variant;
  const piece = board[pos.y]?.[pos.x];
  if (!piece) return [];

  const moves: CraftMove[] = [];
  const color = piece.color;
  const enemyColor: CraftPieceColor = color === 'white' ? 'black' : 'white';

  const addRayMoves = (dx: number, dy: number, maxSteps: number = 8) => {
    let nx = pos.x + dx;
    let ny = pos.y + dy;
    let steps = 0;
    while (isWithinBounds(nx, ny, width, height) && steps < maxSteps) {
      const target = board[ny][nx];
      if (!target) {
        moves.push({ from: pos, to: { x: nx, y: ny }, piece });
      } else {
        if (target.color === enemyColor) {
          moves.push({ from: pos, to: { x: nx, y: ny }, piece, captured: target });
        }
        break; // obstructed
      }
      nx += dx;
      ny += dy;
      steps++;
    }
  };

  const addSingleStep = (dx: number, dy: number) => {
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (isWithinBounds(nx, ny, width, height)) {
      const target = board[ny][nx];
      if (!target) {
        moves.push({ from: pos, to: { x: nx, y: ny }, piece });
      } else if (target.color === enemyColor) {
        moves.push({ from: pos, to: { x: nx, y: ny }, piece, captured: target });
      }
    }
  };

  // One-lane 8×1 special movement
  if (height === 1) {
    const forwardX = color === 'white' ? 1 : -1;
    if (piece.type === 'king' || piece.type === 'pawn') {
      // 1 step left or right
      addSingleStep(-1, 0);
      addSingleStep(1, 0);
    } else if (piece.type === 'queen' || piece.type === 'rook') {
      addRayMoves(-1, 0);
      addRayMoves(1, 0);
    } else if (piece.type === 'knight') {
      // Knight leaps over 1 or 2 squares horizontally
      for (const jump of [-2, -3, 2, 3]) {
        addSingleStep(jump, 0);
      }
    } else {
      addRayMoves(-1, 0);
      addRayMoves(1, 0);
    }
    return moves;
  }

  switch (piece.type) {
    case 'pawn': {
      const forwardY = color === 'white' ? -1 : 1;
      const startY = color === 'white' ? height - 2 : 1;
      const promotionRank = color === 'white' ? 0 : height - 1;

      // 1-step forward
      const f1y = pos.y + forwardY;
      if (isWithinBounds(pos.x, f1y, width, height) && !board[f1y][pos.x]) {
        const isPromotion = f1y === promotionRank;
        moves.push({
          from: pos,
          to: { x: pos.x, y: f1y },
          piece,
          isPromotion,
          promotionType: isPromotion ? 'queen' : undefined,
        });

        // 2-step forward
        const f2y = pos.y + forwardY * 2;
        if (
          pos.y === startY &&
          isWithinBounds(pos.x, f2y, width, height) &&
          !board[f2y][pos.x]
        ) {
          moves.push({ from: pos, to: { x: pos.x, y: f2y }, piece });
        }
      }

      // Diagonal captures
      for (const dx of [-1, 1]) {
        const cx = pos.x + dx;
        const cy = pos.y + forwardY;
        if (isWithinBounds(cx, cy, width, height)) {
          const target = board[cy][cx];
          if (target && target.color === enemyColor) {
            const isPromotion = cy === promotionRank;
            moves.push({
              from: pos,
              to: { x: cx, y: cy },
              piece,
              captured: target,
              isPromotion,
              promotionType: isPromotion ? 'queen' : undefined,
            });
          }
        }
      }
      break;
    }

    case 'knight': {
      const jumps = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      for (const [dx, dy] of jumps) {
        addSingleStep(dx, dy);
      }
      break;
    }

    case 'bishop': {
      addRayMoves(-1, -1);
      addRayMoves(-1, 1);
      addRayMoves(1, -1);
      addRayMoves(1, 1);
      break;
    }

    case 'rook': {
      addRayMoves(0, -1);
      addRayMoves(0, 1);
      addRayMoves(-1, 0);
      addRayMoves(1, 0);
      break;
    }

    case 'queen': {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx !== 0 || dy !== 0) {
            addRayMoves(dx, dy);
          }
        }
      }
      break;
    }

    case 'king': {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx !== 0 || dy !== 0) {
            addSingleStep(dx, dy);
          }
        }
      }
      break;
    }

    case 'prince': {
      // Knight leaps + diagonals up to 4 squares
      const jumps = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      for (const [dx, dy] of jumps) {
        addSingleStep(dx, dy);
      }
      addRayMoves(-1, -1, 4);
      addRayMoves(-1, 1, 4);
      addRayMoves(1, -1, 4);
      addRayMoves(1, 1, 4);
      break;
    }

    case 'supremeRook': {
      // Rook rays + Knight jumps
      addRayMoves(0, -1);
      addRayMoves(0, 1);
      addRayMoves(-1, 0);
      addRayMoves(1, 0);
      const jumps = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      for (const [dx, dy] of jumps) {
        addSingleStep(dx, dy);
      }
      break;
    }

    case 'priest': {
      // Bishop rays + 1-step cardinal
      addRayMoves(-1, -1);
      addRayMoves(-1, 1);
      addRayMoves(1, -1);
      addRayMoves(1, 1);
      addSingleStep(0, -1);
      addSingleStep(0, 1);
      addSingleStep(-1, 0);
      addSingleStep(1, 0);
      break;
    }

    case 'communist': {
      // King steps + 2-step forward leap
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx !== 0 || dy !== 0) {
            addSingleStep(dx, dy);
          }
        }
      }
      const forwardY = color === 'white' ? -2 : 2;
      addSingleStep(0, forwardY);
      break;
    }
  }

  return moves;
}

export function applyMoveToBoard(
  board: (CraftPiece | null)[][],
  move: CraftMove
): (CraftPiece | null)[][] {
  const newBoard = cloneBoard(board);
  const movingPiece: CraftPiece = {
    ...move.piece,
    hasMoved: true,
    type: move.isPromotion && move.promotionType ? move.promotionType : move.piece.type,
  };

  newBoard[move.from.y][move.from.x] = null;
  newBoard[move.to.y][move.to.x] = movingPiece;
  return newBoard;
}

export function isSquareAttacked(
  board: (CraftPiece | null)[][],
  targetPos: CraftPosition,
  attackerColor: CraftPieceColor,
  variant: CraftVariantConfig
): boolean {
  const height = board.length;
  const width = board[0].length;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const piece = board[y][x];
      if (piece && piece.color === attackerColor) {
        const moves = getPseudoLegalMoves(board, { x, y }, variant);
        if (moves.some((m) => m.to.x === targetPos.x && m.to.y === targetPos.y)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function isKingInCheck(
  board: (CraftPiece | null)[][],
  color: CraftPieceColor,
  variant: CraftVariantConfig
): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const opponentColor: CraftPieceColor = color === 'white' ? 'black' : 'white';
  return isSquareAttacked(board, kingPos, opponentColor, variant);
}

/**
 * Filter legal moves. In 'checkmate' win condition, cannot leave king in check.
 * In 'capture-king', king captures are allowed and pseudo-legal moves are valid.
 */
export function getLegalMovesForSquare(
  board: (CraftPiece | null)[][],
  pos: CraftPosition,
  variant: CraftVariantConfig
): CraftMove[] {
  const pseudoMoves = getPseudoLegalMoves(board, pos, variant);
  const piece = board[pos.y]?.[pos.x];
  if (!piece) return [];

  if (variant.winCondition === 'capture-king') {
    return pseudoMoves;
  }

  // Filter moves that leave king in check
  return pseudoMoves.filter((m) => {
    const nextBoard = applyMoveToBoard(board, m);
    return !isKingInCheck(nextBoard, piece.color, variant);
  });
}

export function getAllLegalMoves(
  board: (CraftPiece | null)[][],
  turn: CraftPieceColor,
  variant: CraftVariantConfig
): CraftMove[] {
  const allMoves: CraftMove[] = [];
  const height = board.length;
  const width = board[0].length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = board[y][x];
      if (p && p.color === turn) {
        const moves = getLegalMovesForSquare(board, { x, y }, variant);
        allMoves.push(...moves);
      }
    }
  }

  // Sort captures first for faster alpha-beta cutoff
  allMoves.sort((a, b) => {
    const valA = a.captured ? PIECE_VALUES[a.captured.type] : 0;
    const valB = b.captured ? PIECE_VALUES[b.captured.type] : 0;
    return valB - valA;
  });

  return allMoves;
}

export function evaluateBoard(
  board: (CraftPiece | null)[][],
  turn: CraftPieceColor,
  variant: CraftVariantConfig
): number {
  let score = 0;
  const height = board.length;
  const width = board[0].length;
  const opponentColor: CraftPieceColor = turn === 'white' ? 'black' : 'white';

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = board[y][x];
      if (!p) continue;
      const val = PIECE_VALUES[p.type] || 100;
      // Center control bonus
      const centerDist = Math.abs(x - (width - 1) / 2) + Math.abs(y - (height - 1) / 2);
      const positionBonus = (width + height - centerDist) * 3;

      if (p.color === turn) {
        score += val + positionBonus;
      } else {
        score -= val + positionBonus;
      }
    }
  }

  if (isKingInCheck(board, opponentColor, variant)) {
    score += 80;
  }
  if (isKingInCheck(board, turn, variant)) {
    score -= 80;
  }

  return score;
}

export function minimax(
  board: (CraftPiece | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  botColor: CraftPieceColor,
  variant: CraftVariantConfig
): number {
  const currentTurn: CraftPieceColor = isMaximizing
    ? botColor
    : botColor === 'white'
    ? 'black'
    : 'white';

  const moves = getAllLegalMoves(board, currentTurn, variant);

  // Terminal checks
  if (moves.length === 0) {
    if (isKingInCheck(board, currentTurn, variant)) {
      return isMaximizing ? -999999 + (5 - depth) * 1000 : 999999 - (5 - depth) * 1000;
    }
    return 0; // Stalemate
  }

  if (depth === 0) {
    return evaluateBoard(board, botColor, variant);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      if (move.captured?.type === 'king') return 999999;
      const nextBoard = applyMoveToBoard(board, move);
      const evaluation = minimax(nextBoard, depth - 1, alpha, beta, false, botColor, variant);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      if (move.captured?.type === 'king') return -999999;
      const nextBoard = applyMoveToBoard(board, move);
      const evaluation = minimax(nextBoard, depth - 1, alpha, beta, true, botColor, variant);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function calculateCraftBotMove(
  board: (CraftPiece | null)[][],
  botColor: CraftPieceColor,
  botLevel: 'rookie' | 'tactician' | 'punisher',
  variant: CraftVariantConfig
): CraftMove | null {
  const legalMoves = getAllLegalMoves(board, botColor, variant);
  if (legalMoves.length === 0) return null;

  // Instant king capture check
  const kingCapture = legalMoves.find((m) => m.captured?.type === 'king');
  if (kingCapture) return kingCapture;

  // Single move fast return
  if (legalMoves.length === 1) return legalMoves[0];

  // Rookie: 35% chance to blunder a random move, otherwise 1-ply greedy
  if (botLevel === 'rookie') {
    if (Math.random() < 0.35) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }
    let bestScore = -Infinity;
    let bestMove = legalMoves[0];
    for (const move of legalMoves) {
      const nextBoard = applyMoveToBoard(board, move);
      const score = evaluateBoard(nextBoard, botColor, variant);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // Tactician: 2-ply Minimax
  if (botLevel === 'tactician') {
    let bestScore = -Infinity;
    let bestMove = legalMoves[0];
    for (const move of legalMoves) {
      const nextBoard = applyMoveToBoard(board, move);
      const score = minimax(nextBoard, 2, -Infinity, Infinity, false, botColor, variant);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // Punisher: 3-ply Minimax with Alpha-Beta
  let bestScore = -Infinity;
  let bestMove = legalMoves[0];
  for (const move of legalMoves) {
    const nextBoard = applyMoveToBoard(board, move);
    const score = minimax(nextBoard, 3, -Infinity, Infinity, false, botColor, variant);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}
