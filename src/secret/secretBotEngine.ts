import { MatchState, PieceColor, Move } from '../types/game';
import { SecretPlayerConfig } from './types';
import { getAllLegalMoves, applyMoveToBoard, isKingInCheck } from '../game/engine';
import { getBestBotMove } from '../game/bot';

export interface SecretBotDecisionResult {
  move: Move | null;
  dialogueMessage: string | null;
  dialogueType: 'bot' | 'system';
}

function getRandomMessage(arr: string[]): string {
  if (!arr || arr.length === 0) return '';
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

/**
 * Generates an interactive chat response from the Bot when the user types a message in the chat sidebar
 */
export function respondToUserChat(botConfig: SecretPlayerConfig, userText: string): string {
  const text = userText.toLowerCase().trim();
  const opponentName = botConfig.opponentAddressingName;

  if (botConfig.playstyle === 'boy_friend') {
    if (text.includes('love') || text.includes('bhalo') || text.includes('bhalobashi')) {
      return `I love you so much too ${opponentName}! ❤️ You are my whole world!`;
    }
    if (text.includes('sorry') || text.includes('dukkhto')) {
      return `Arey no sorry ${opponentName}! 🥰 I am always happy with you!`;
    }
    if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
      return `Subho Sokal ${opponentName}! 💕 So excited to play with you!`;
    }
    if (text.includes('win') || text.includes('won') || text.includes('lose')) {
      return `You are going to win ${opponentName}! I will sacrifice all my pieces for you! 🎉`;
    }
    return `Aww ${opponentName}, tumi amar shona! 💕 ${getRandomMessage(botConfig.dialogue.onIdle)}`;
  }

  if (botConfig.playstyle === 'girl_friend') {
    if (text.includes('love') || text.includes('bhalobashi')) {
      return `I love you from my heart ${opponentName} ❤️ Promise I won't argue again!`;
    }
    if (text.includes('angry') || text.includes('rag')) {
      return `I am not angry at you ${opponentName}! 🥰 I love you so much!`;
    }
    if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
      return `Hey ${opponentName}! 💕 You look so handsome today!`;
    }
    if (text.includes('sorry')) {
      return `Don't say sorry ${opponentName}! I promise I won't bother you! ❤️`;
    }
    return `Aww ${opponentName}! ❤️ ${getRandomMessage(botConfig.dialogue.onIdle)}`;
  }

  // War Bot
  if (text.includes('hi') || text.includes('hello')) {
    return `Greetings, ${opponentName}. Silence yourself and make your move.`;
  }
  if (text.includes('love') || text.includes('please')) {
    return `Emotion is weakness. Your defeat is inevitable.`;
  }
  return `Your words mean nothing on the battlefield, ${opponentName}. Calculate deeper.`;
}

/**
 * Secret Bot Move Decision Engine
 */
export function computeSecretBotTurn(
  match: MatchState,
  botConfig: SecretPlayerConfig,
  botColor: PieceColor,
  capturesByBotCount: number
): SecretBotDecisionResult {
  const legalMoves = getAllLegalMoves(match.board, botColor);

  if (legalMoves.length === 0) {
    return {
      move: null,
      dialogueMessage: isKingInCheck(match.board, botColor)
        ? getRandomMessage(botConfig.dialogue.onDefeat)
        : 'Stalemate!',
      dialogueType: 'bot',
    };
  }

  // 1. BOYFRIEND BOT (Babai)
  if (botConfig.playstyle === 'boy_friend') {
    const playerColor: PieceColor = botColor === 'white' ? 'black' : 'white';
    const nonCaptureMoves = legalMoves.filter((m) => !m.captured);
    const captureMoves = legalMoves.filter((m) => m.captured);

    let chosenMove: Move | null = null;
    let dialogueMessage: string | null = null;

    if (captureMoves.length > 0 && capturesByBotCount < 2 && Math.random() < 0.25) {
      chosenMove = captureMoves[Math.floor(Math.random() * captureMoves.length)];
      dialogueMessage = getRandomMessage(botConfig.dialogue.onBotCapture);
    } else if (nonCaptureMoves.length > 0) {
      const safeNonCaptures = nonCaptureMoves.filter((m) => {
        const testBoard = applyMoveToBoard(match.board, m);
        const playerLegal = getAllLegalMoves(testBoard, playerColor);
        return playerLegal.length > 0;
      });

      const pool = safeNonCaptures.length > 0 ? safeNonCaptures : nonCaptureMoves;
      chosenMove = pool[Math.floor(Math.random() * pool.length)];

      if (Math.random() < 0.35) {
        dialogueMessage = getRandomMessage(botConfig.dialogue.onIdle);
      }
    } else {
      chosenMove = legalMoves[0];
      dialogueMessage = getRandomMessage(botConfig.dialogue.onBotCapture);
    }

    if (chosenMove) {
      const testBoard = applyMoveToBoard(match.board, chosenMove);
      if (isKingInCheck(testBoard, playerColor)) {
        dialogueMessage = getRandomMessage(botConfig.dialogue.onBotCheck);
      }
    }

    return {
      move: chosenMove,
      dialogueMessage,
      dialogueType: 'bot',
    };
  }

  // 2. GIRLFRIEND BOT (Golu)
  if (botConfig.playstyle === 'girl_friend') {
    const bestMove = getBestBotMove(match, botColor, 3) || legalMoves[0];
    const playerColor: PieceColor = botColor === 'white' ? 'black' : 'white';
    let dialogueMessage: string | null = null;

    if (bestMove.captured) {
      dialogueMessage = getRandomMessage(botConfig.dialogue.onBotCapture);
    } else {
      const testBoard = applyMoveToBoard(match.board, bestMove);
      if (isKingInCheck(testBoard, playerColor)) {
        dialogueMessage = getRandomMessage(botConfig.dialogue.onBotCheck);
      } else if (Math.random() < 0.3) {
        dialogueMessage = getRandomMessage(botConfig.dialogue.onIdle);
      }
    }

    return {
      move: bestMove,
      dialogueMessage,
      dialogueType: 'bot',
    };
  }

  // 3. WAR BOT
  const bestMove = getBestBotMove(match, botColor, 3) || legalMoves[0];
  const playerColor: PieceColor = botColor === 'white' ? 'black' : 'white';
  let dialogueMessage: string | null = null;

  if (bestMove.captured) {
    dialogueMessage = getRandomMessage(botConfig.dialogue.onBotCapture);
  } else {
    const testBoard = applyMoveToBoard(match.board, bestMove);
    if (isKingInCheck(testBoard, playerColor)) {
      dialogueMessage = getRandomMessage(botConfig.dialogue.onBotCheck);
    } else if (Math.random() < 0.35) {
      dialogueMessage = getRandomMessage(botConfig.dialogue.onIdle);
    }
  }

  return {
    move: bestMove,
    dialogueMessage,
    dialogueType: 'bot',
  };
}

export function getPlayerActionDialogue(
  botConfig: SecretPlayerConfig,
  isCapture: boolean,
  isCheckOnBot: boolean
): string | null {
  if (isCheckOnBot) {
    return getRandomMessage(botConfig.dialogue.onPlayerCheck);
  }
  if (isCapture) {
    return getRandomMessage(botConfig.dialogue.onPlayerCapture);
  }
  return null;
}
