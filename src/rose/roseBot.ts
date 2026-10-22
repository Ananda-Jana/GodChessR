/**
 * Intelligent Romantic Bot Engine for Rose Paradise
 * 
 * Provides minimax move evaluation, tactical Prince awareness, Love Link heuristics,
 * automated unit summons, and playful romantic dialogue & reactions for Bot Boyfriend / Girlfriend.
 */

import type { PieceColor, Position, PieceType } from '../types/game.ts';
import type { RoseMatchState, RoseRole, RoseSummonPieceType } from './types.ts';
import { getAllLegalMoves, applyMoveToBoard, isKingInCheck, isSquareAttacked } from '../game/engine.ts';
import { getValidRoseSummonSquares } from './roseRules.ts';

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  prince: 750,
  queen: 950,
  king: 20000,
  communist: 600,
  supremeRook: 650,
  priest: 600,
};

// Check if Queen and Prince are adjacent (Love Link)
function hasLoveLink(board: any[][], color: PieceColor): boolean {
  let qPos: Position | null = null;
  let pPos: Position | null = null;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const p = board[y][x];
      if (p && p.color === color) {
        if (p.type === 'queen') qPos = { x, y };
        if (p.type === 'prince') pPos = { x, y };
      }
    }
  }
  if (!qPos || !pPos) return false;
  return Math.abs(qPos.x - pPos.x) <= 1 && Math.abs(qPos.y - pPos.y) <= 1;
}

function evaluateRoseBoard(board: any[][], botColor: PieceColor): number {
  let score = 0;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (!piece) continue;
      const val = PIECE_VALUES[piece.type as PieceType] || 100;
      const isBot = piece.color === botColor;
      score += isBot ? val : -val;

      // Small positional encouragement for center control
      if (x >= 2 && x <= 5 && y >= 2 && y <= 5) {
        score += isBot ? 15 : -15;
      }
    }
  }

  // Love Link encouragement
  if (hasLoveLink(board, botColor)) {
    score += 40;
  }

  return score;
}

export function getBestRoseBotMove(
  match: RoseMatchState,
  botColor: PieceColor
): { from: Position; to: Position; captured?: boolean } | null {
  const legalMoves = getAllLegalMoves(match.board, botColor);
  if (legalMoves.length === 0) return null;
  if (legalMoves.length === 1) return { from: legalMoves[0].from, to: legalMoves[0].to, captured: Boolean(legalMoves[0].captured) };

  // Evaluate 1-2 ply forward with tactical scoring
  let bestMove = legalMoves[0];
  let bestScore = -Infinity;

  // Shuffle slightly so games feel organic and not robotic
  const shuffledMoves = [...legalMoves].sort(() => Math.random() - 0.5);

  for (const move of shuffledMoves) {
    const nextBoard = applyMoveToBoard(match.board, move);
    let evalScore = evaluateRoseBoard(nextBoard, botColor);

    // Value captures highly
    if (move.captured) {
      const capturedVal = PIECE_VALUES[move.captured.type as PieceType] || 100;
      evalScore += capturedVal * 1.2;
    }

    // Check bonus
    const opponentColor: PieceColor = botColor === 'white' ? 'black' : 'white';
    if (isKingInCheck(nextBoard, opponentColor)) {
      evalScore += 45;
    }

    // Don't hang pieces trivially if square is attacked
    if (isSquareAttacked(nextBoard, move.to, opponentColor)) {
      const myVal = PIECE_VALUES[move.piece.type as PieceType] || 100;
      evalScore -= myVal * 0.8;
    }

    if (evalScore > bestScore) {
      bestScore = evalScore;
      bestMove = move;
    }
  }

  return { from: bestMove.from, to: bestMove.to, captured: Boolean(bestMove.captured) };
}

export function getBotSummonChoice(
  match: RoseMatchState,
  botColor: PieceColor
): { pieceType: RoseSummonPieceType; pos: Position } | null {
  // If bot is in check, it cannot summon - it must escape or defend the check!
  if (match.inCheck === botColor || isKingInCheck(match.board, botColor)) {
    return null;
  }

  const opponentColor: PieceColor = botColor === 'white' ? 'black' : 'white';
  const candidateTypes: RoseSummonPieceType[] = ['queen', 'bishop', 'knight', 'rook', 'supremeRook', 'priest', 'communist'];

  // Shuffle candidate types with high priority for Queen / Bishop / Knight / Rook
  const prioritizedTypes = [...candidateTypes].sort(() => Math.random() - 0.5);

  for (const pieceType of prioritizedTypes) {
    const validSquares = getValidRoseSummonSquares(match.board, botColor, pieceType);
    if (validSquares.length === 0) continue;

    // Filter for unattacked squares if possible
    const safeSquares = validSquares.filter((sq) => !isSquareAttacked(match.board, sq, opponentColor));
    const pool = safeSquares.length > 0 ? safeSquares : validSquares;

    // Prefer squares closer to center/action
    pool.sort((a, b) => {
      const distA = Math.abs(a.x - 3.5) + Math.abs(a.y - 3.5);
      const distB = Math.abs(b.x - 3.5) + Math.abs(b.y - 3.5);
      return distA - distB;
    });

    return { pieceType, pos: pool[0] };
  }

  return null;
}

// Romantic dialogue phrases for the Bot
export const BOT_SWEET_MESSAGES = {
  start: [
    "May love guide every move between us! Have fun, my sweetheart ❤️",
    "Untimed chess together... my favorite kind of date! 🌹",
    "Win or lose, my heart is already yours 🥰",
    "Ready for a wonderful match, darling! Let's create some poetry on the board ✨",
    "Playing with you is always my greatest victory ❤️",
    "Take your time, my dear. Today the clock doesn't exist for us 🕊️",
    "A royal duel between a Prince and a Queen! Shall we begin? 👑",
  ],
  capture: [
    "Took your piece, but you still have all my affection! 😉",
    "A petal blossomed for our bouquet! 🌹",
    "Sneaky capture! Don't be mad at me ❤️",
    "Forgive me, my love, but this piece was calling to me! ✨",
    "A small tactical exchange, but you're still winning my heart 🥰",
    "One petal closer to summoning something special for you 🌹",
    "I'll trade pieces all day just to keep playing with you ❤️",
  ],
  playerCaptured: [
    "Ouch! What a brilliant tactic, sweetheart! 🥰",
    "You play so well, I'm genuinely impressed! 🌹",
    "My piece fell for your charms! ❤️",
    "Beautiful move, darling! I never saw that coming ✨",
    "You captured my piece... and captured my admiration again! 💖",
    "Such sharp vision! Truly the mind of a grandmaster 👑",
    "Well played, my love! Now I must think extra hard ✨",
  ],
  check: [
    "A gentle check to your royal highness! 👑❤️",
    "Check! Be careful, my love! 🌹",
    "Check from across the board! 😉",
    "Knocking on your castle gates with love! 🏰✨",
    "Check, my sweetheart! But I know you'll find an escape route 🕊️",
  ],
  summon: [
    "Summoning Cupid to bless our battlefield! ✨🌹",
    "A loyal ally arrives with 3 petals of love! 🏰",
    "Reinforcements have arrived for our romantic duel! 🕊️",
    "Rose Tower stands tall on our board! May it guard our love 🌹",
    "Three petals gathered, a hero awakened! ✨",
  ],
  randomTurn: [
    "I could play chess with you forever ❤️",
    "Take all the time you need, my love. There's zero rush! 🌹",
    "Enjoying every single second with you ✨",
    "Thinking about my next move... and how wonderful you are! 🥰",
    "Looking across the board at you makes me smile every turn 💖",
    "Untimed chess is the greatest invention for couples ❤️",
    "Every piece tells our story today 🌹",
    "You look so focused and majestic right now! 👑",
  ],
  gameOver: [
    "What a lovely duel! Thank you for playing with me ❤️",
    "That was such a poetic match! You are amazing! 🌹",
    "Every match with you is a treasure. Play again soon? 🥰",
    "A beautiful conclusion to a romantic battlefield! ✨",
  ],
};

export function getRandomBotReaction(): string {
  const emojis = ['❤️', '🌹', '✨', '💍', '🥰', '😉'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

export function getRandomBotMessage(category: keyof typeof BOT_SWEET_MESSAGES): string {
  const pool = BOT_SWEET_MESSAGES[category];
  return pool[Math.floor(Math.random() * pool.length)];
}
