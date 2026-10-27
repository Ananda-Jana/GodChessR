import {
  CraftMatchState,
  CraftMove,
  CraftPieceColor,
  CraftBotLevel,
  CraftVariantConfig,
  CraftPiece,
} from './craftGameTypes';
import { calculateCraftBotMove, getLegalMovesForSquare } from './CraftGameEngine';
import { getPunisherBotMove, PunisherBotId } from '../punisher/punisherBot';
import { MatchState, Piece, Move } from '../types/game';

/**
 * Maps a CraftPiece to a standard Game Engine Piece
 */
function toStandardPiece(cp: CraftPiece): Piece {
  return {
    id: cp.id,
    type: cp.type as any,
    color: cp.color,
    hasMoved: cp.hasMoved,
  };
}

/**
 * Maps a standard Move back to a CraftMove
 */
function toCraftMove(m: Move, craftBoard: (CraftPiece | null)[][]): CraftMove {
  const piece = craftBoard[m.from.y][m.from.x]!;
  const target = craftBoard[m.to.y][m.to.x] || undefined;
  return {
    from: { x: m.from.x, y: m.from.y },
    to: { x: m.to.x, y: m.to.y },
    piece,
    captured: target,
    isPromotion: m.isPromotion,
    promotionType: m.promotedTo as any,
  };
}

/**
 * Resolves the bot move for any variant and difficulty.
 * If 8×8 and Punisher level, delegates to the calibrated Punisher bot engine.
 * Otherwise uses the specialized autonomous Minimax engine.
 */
export async function getNextBotMove(
  board: (CraftPiece | null)[][],
  botColor: CraftPieceColor,
  botLevel: CraftBotLevel,
  variant: CraftVariantConfig,
  moveHistory: CraftMove[] = []
): Promise<CraftMove | null> {
  // Thinking delay for natural arcade feel
  const delayMs = botLevel === 'rookie' ? 300 : botLevel === 'tactician' ? 450 : 600;
  await new Promise((res) => setTimeout(res, delayMs));

  // If 8×8 and Punisher level, bridge to the Grandmaster Punisher Bot
  if (variant.width === 8 && variant.height === 8 && botLevel === 'punisher') {
    try {
      const standardBoard: (Piece | null)[][] = board.map((row) =>
        row.map((cp) => (cp ? toStandardPiece(cp) : null))
      );

      const standardMoveHistory: Move[] = moveHistory.map((cm) => ({
        from: { x: cm.from.x, y: cm.from.y },
        to: { x: cm.to.x, y: cm.to.y },
        piece: toStandardPiece(cm.piece),
        captured: cm.captured ? toStandardPiece(cm.captured) : undefined,
        timestamp: Date.now(),
      }));

      const syntheticMatch: MatchState = {
        id: 'craft_bot_bridge',
        status: 'active',
        whitePlayer: {
          userId: 'p1',
          username: 'player',
          displayName: 'Player',
          avatarId: '1',
        },
        blackPlayer: {
          userId: 'bot',
          username: 'punisher',
          displayName: 'Punisher Bot',
          avatarId: '2',
        },
        board: standardBoard,
        turn: botColor,
        moveHistory: standardMoveHistory,
        capturedByWhite: [],
        capturedByBlack: [],
        whitePawnsReachedEndRank: 0,
        blackPawnsReachedEndRank: 0,
        inCheck: null,
        result: null,
        dice: null,
        moveSuggestions: 'included',
        totalCaptures: 0,
        diceActive: false,
        timeControl: 300,
        whiteTimeRemaining: 300,
        blackTimeRemaining: 300,
        lastTurnStartTime: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const punisherId: PunisherBotId = 'chrome-reaper';
      const pMove = getPunisherBotMove(syntheticMatch, punisherId);
      if (pMove) {
        // Validate that this move is also legal in our craft engine
        const craftLegalMoves = getLegalMovesForSquare(board, pMove.from, variant);
        const matchFound = craftLegalMoves.find(
          (m) => m.to.x === pMove.to.x && m.to.y === pMove.to.y
        );
        if (matchFound) {
          return matchFound;
        }
      }
    } catch (err) {
      console.warn('[CraftGameBotBridge] Punisher bridge fallback to minimax:', err);
    }
  }

  // Autonomous Minimax calculation
  return calculateCraftBotMove(board, botColor, botLevel, variant);
}
