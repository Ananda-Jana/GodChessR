/**
 * Intelligent Romantic Bot Engine for Rose Paradise
 *
 * Provides minimax move evaluation, tactical Prince awareness, Love Link heuristics,
 * automated unit summons, and rich romantic dialogue & reactions for Bot Boyfriend and Bot Girlfriend.
 */

import type { PieceColor, Position, PieceType } from '../types/game';
import type { RoseMatchState, RoseRole, RoseSummonPieceType } from './types';
import { getAllLegalMoves, applyMoveToBoard, isKingInCheck, isSquareAttacked } from '../game/engine';
import { getValidRoseSummonSquares } from './roseRules';

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
  if (legalMoves.length === 1) {
    return {
      from: legalMoves[0].from,
      to: legalMoves[0].to,
      captured: Boolean(legalMoves[0].captured),
    };
  }

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
  const candidateTypes: RoseSummonPieceType[] = [
    'queen',
    'bishop',
    'knight',
    'rook',
    'supremeRook',
    'priest',
    'communist',
  ];

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

export type RoseBotMessageCategory =
  | 'start'
  | 'capture'
  | 'playerCaptured'
  | 'check'
  | 'botInCheck'
  | 'summon'
  | 'playerSummon'
  | 'randomTurn'
  | 'replyToChat'
  | 'replyToReaction'
  | 'concede'
  | 'gameOverWin'
  | 'gameOverLose'
  | 'loveLink';

// Differentiated Romantic Messages for Boyfriend Bot vs Girlfriend Bot
export const BOT_ROLE_MESSAGES: Record<RoseRole, Record<RoseBotMessageCategory, string[]>> = {
  boyfriend: {
    start: [
      "May love guide every move between us! Have fun, my Queen 👑❤️",
      "Untimed chess together... my absolute favorite kind of date 🌹☕",
      "Win or lose, my King and my heart already belong to you 🥰⚔️",
      "Ready for a wonderful match, darling. Let's create some poetry on the board ✨",
      "Take your time, my love. Today the clock doesn't exist for us 🕊️💍",
      "A royal duel between my Prince and your Queen. Shall we begin? 👑🌹",
      "Seeing that focused look in your eyes is already my victory ❤️✨",
    ],
    capture: [
      "Captured your piece, but you still have my whole heart! 😉❤️",
      "A delicate rose petal for our bouquet! 🌹✨",
      "Forgive me, my love, but this tactical exchange was calling to me! ⚔️🥰",
      "One petal closer to summoning something grand for you, sweetheart 🌹👑",
      "Hands off my Prince, young lady! He's fighting for your honor 😉🛡️",
      "I'll trade pieces all evening if it means staying here with you ❤️",
      "A tactical skirmish, but my defenses remain yours forever 🏰✨",
    ],
    playerCaptured: [
      "Ouch! What a brilliant tactic, sweetheart! You got me 🥰💘",
      "You captured my piece... and captured my admiration all over again! 💖👑",
      "Such sharp vision! My Queen is playing like a true Grandmaster 🌹✨",
      "My piece fell head over heels for your charms! 🙈❤️",
      "Beautiful calculation, darling. Now I need to step up my game! ⚔️😉",
      "Well played, my love! Remind me to treat you to your favorite dinner tonight 🍷✨",
      "A fierce strike! You look dangerously attractive when you play like that 😏🔥",
    ],
    check: [
      "A gentle check to your royal highness! 👑❤️",
      "Check, my Queen! Let's see your brilliant escape maneuver 🏰✨",
      "Knocking on your palace gates with a bouquet of roses! 🌹⚔️",
      "Check! Be careful darling, but I know you've got a clever move ready 😉🕊️",
      "A royal salute to your King. Check, my sweetheart! 👑💍",
    ],
    botInCheck: [
      "Whoa, check on my King! You're really keeping me on my toes, darling 😳⚔️",
      "My King bows to your fierce strategy! Escaping with honor 🛡️❤️",
      "Cornering my King like a champion! You're so impressive 🥰👑",
      "A bold check! My defenses are holding, but only just 🏰✨",
      "I love how fearless you are on the board, my Queen! 🌹⚔️",
    ],
    summon: [
      "Summoning royal reinforcements with 3 petals of love! 🏰🌹",
      "A guardian arrives to protect our romantic battlefield! 🕊️✨",
      "Three petals gathered, a hero awakens to fight for you! ⚔️👑",
      "Rose Tower stands tall! May it watch over our kingdom, darling 🌹🏰",
      "Cupid's blessing arrives on the board! Ready, my love? 💘✨",
    ],
    playerSummon: [
      "Wait, did you just summon that?! Remind me never to underestimate my girl! 😳💘",
      "What a majestic summon! Three petals well spent, sweetheart 🌹✨",
      "Reinforcements for my Queen? Now this is a proper royal battle! 👑⚔️",
      "Incredible placement! You're taking this match to another level 🥰🏰",
    ],
    randomTurn: [
      "I could play chess with you forever, darling ❤️",
      "Take all the time in the world. Looking at you is the sweetest prize 🌹✨",
      "Enjoying every single second with you on this board 🕊️🥰",
      "Thinking about my next move... and how lucky I am to have you 💖👑",
      "You have that adorable thinking frown right now, don't you? 😏❤️",
      "Untimed chess was made for us. No rush, just you and me ☕🌹",
      "Every piece we move tells our story today ✨💍",
    ],
    replyToChat: [
      "Reading your sweet words made my heart skip a beat ❤️🥰",
      "You're the sweetest thing in the world, you know that? 🌹✨",
      "Focusing on chess is so hard when you're being this adorable 😉💖",
      "I love you more than all the pieces on this board 👑💍",
      "Message received loud and clear, my Queen! Sending all my love back 💌❤️",
      "Hearing from you is the best part of every move 🥰✨",
    ],
    replyToReaction: [
      "Sending that right back to you with interest, darling! ❤️🌹",
      "You're so cute! My heart just did a little jump 🥰✨",
      "That reaction suits you perfectly, my Queen 👑😉",
      "A smile from you brightens the entire board 💖✨",
    ],
    concede: [
      "You conceded? Come here, sweetheart—you never have to surrender to me ❤️🌹",
      "A victory by your loving grace! You'll always be my champion 👑🥰",
      "You're so gentle, my love. Let's play another game together soon 🕊️✨",
      "Surrendering with such elegance! I cherish every moment with you ❤️💍",
    ],
    gameOverWin: [
      "What a thrilling duel! Thank you for this wonderful game, my Queen 👑❤️",
      "A close contest, but you made every single move delightful 🌹✨",
      "Victory is sweet, but spending this time with you is the real prize 🥰💍",
      "You played magnificently, darling! Let's rematch anytime 🏰❤️",
    ],
    gameOverLose: [
      "Checkmate! You outplayed me completely, my Grandmaster Queen! 👑🏆💖",
      "I gladly bow to the victor! You were absolutely brilliant today 🌹🥰",
      "What a stunning checkmate! I'm so proud of how sharp you played ✨❤️",
      "Defeated by the love of my life... and I wouldn't have it any other way 💘👑",
    ],
    loveLink: [
      "Our Queen and Prince are standing side by side! A true Love Link ❤️👑",
      "The royal couple unites on the battlefield! Petals blooming for us 🌹✨",
      "Look at them together—just like you and me, darling 🥰💍",
    ],
  },
  girlfriend: {
    start: [
      "Yay, untimed chess with my favorite boy! Prepare to be charmed 🥰💖",
      "No clocks, just us and a bunch of pretty pieces! Let's have fun baby 🌹✨",
      "Don't go easy on me, mister! I've got my eye on your King 😜👑",
      "Aww, look at you looking all handsome and focused across the board 💖💅",
      "Let's make this the most romantic match ever! Good luck, sweetie 🎀✨",
      "Queen power is on today! Let's see what you've got handsome 😉💘",
      "Playing with you is my happy place! Love you baby ❤️🧸",
    ],
    capture: [
      "Hehe, got your piece! But you're still my favorite prize 😉💖",
      "Another rose petal for my bouquet! Pretty, isn't it? 🌹✨",
      "Oopsie! Did you leave that piece there just for me? How sweet 🥰💅",
      "Mine now! Don't pout, handsome, I'll give you a kiss later 💋❤️",
      "Queen power! Stepping forward with style 💅👑",
      "One petal closer to my secret summon! Be afraid, baby 😜🌹",
      "Piece captured! You still adore me though, right? 🥺💖",
    ],
    playerCaptured: [
      "HEY! That was my favorite piece! You owe me boba and chocolate for that! 😤🧋🍫",
      "Ouchie! You play so aggressively today, mister! So fierce 🥰🙈",
      "Aww, you got me! What a smart move, handsome 💖✨",
      "My poor piece! You're taking this seriously, aren't you? 😉🔥",
      "Look at you calculating three moves ahead! So cute and clever 🎀🥰",
      "Fine, take my piece! But my King is still out of your reach 😜👑",
      "Oof, brilliant tactic! Remind me to give you a big hug after this ❤️🧸",
    ],
    check: [
      "Check! Don't look at me with those puppy eyes, find an escape! 😜🎀",
      "Knock knock on your castle gates, handsome! Check! 🏰💅",
      "Check, baby! Queen power coming through ✨👑",
      "A little check for you! Let's see your grandmaster escape plan 😉💖",
      "Surprise check! You looked too comfortable over there, mister 🙈🌹",
    ],
    botInCheck: [
      "Eek! My King! You're so intense today, darling 🙈💖",
      "Hands off my royal highness, mister! Escaping immediately 💅👑",
      "Whoa, what a sneaky check! You really surprised me there 😳✨",
      "My King is under attack?! You're playing so well baby 🥰⚔️",
      "Okay okay, check defended! You're making me sweat a little 😜🎀",
    ],
    summon: [
      "Surprise! Cupid just sent me tactical reinforcements, baby! 🕊️✨",
      "Three petals gathered and poof! A brand new hero on our board 🌹💅",
      "Look who just joined the party to support your girlfriend! 💖🏰",
      "Rose summon complete! Isn't this piece so pretty? 🎀✨",
      "Reinforcements have arrived! Prepare yourself, handsome 😉👑",
    ],
    playerSummon: [
      "Did you just summon against your own girlfriend?! Oh it is ON now! 💅🔥",
      "Whoa, three petals spent on that?! You're bringing out the big guns 😳🌹",
      "What a majestic summon, sweetie! Look at you being all tactical 💖🏰",
      "A summon on that square?! You're so clever, baby 🥰✨",
    ],
    randomTurn: [
      "Thinking so hard over there... you look extra cute when you concentrate 🥰💖",
      "Take your time, baby! No timers means I get to admire you longer 🌹✨",
      "I could sit here playing with you until the stars come out 🌙🧸",
      "Wondering what my next move is? Or just daydreaming about me? 😉💅",
      "Untimed couples chess is literally the cutest thing ever 🎀❤️",
      "Every move you make makes me smile, handsome 💖✨",
      "You're doing amazing, sweetie! Keep going 🌹🥰",
    ],
    replyToChat: [
      "Awwww! You're the absolute sweetest boyfriend ever 🥺💖💐",
      "Reading that made me blush so hard! Stop being so cute 🙈✨",
      "I love you so much baby! Now back to chess before I melt 🥰🧋",
      "You always know exactly what to say to make me smile 💖🎀",
      "Message received! Sending a million hugs and kisses your way 💋❤️🧸",
      "You're my favorite person in the whole universe, handsome 💘✨",
    ],
    replyToReaction: [
      "Aww, cute emoji! Sending you all my love right back 💖🥰",
      "Hehe, right back at you handsome! 💅✨",
      "You're too adorable! My heart is all bubbly 🥺🎀",
      "Love your reactions baby, keep them coming! 🌹💘",
    ],
    concede: [
      "Aww, you conceded? You're the sweetest, most generous gentleman 🥺💐❤️",
      "You let your girl win? Come here and let me give you a big hug! 🥰🧸",
      "A royal concession with so much love! You're my real champion anyway 👑💖",
      "Thank you for such a sweet game, baby. You made my whole day! 🌹✨",
    ],
    gameOverWin: [
      "Yay, I won! But you played so amazingly well, handsome! 🏆💖💅",
      "What a super fun match! Thank you for playing with me baby 🌹🥰",
      "A Queen victory! But you're still the King of my heart 👑❤️",
      "That was the best game ever! Rematch whenever you're ready, sweetie ✨🎀",
    ],
    gameOverLose: [
      "Checkmate! Wow, you totally got me, grandmaster handsome! 👑🏆💖",
      "You won! I'm so proud of your brilliant moves baby 🥰✨",
      "What a gorgeous checkmate! You owe me a celebration ice cream though 🍦😉",
      "I lost to the best guy ever! Best game of my life ❤️🧸",
    ],
    loveLink: [
      "Our Queen and Prince are standing right next to each other! Love Link activated 💖👑",
      "Look at them holding hands on the board! Just like us baby 🥰🎀",
      "Aww, the royal couple is linked! Petals for both of us 🌹✨",
    ],
  },
};

// Legacy fallback dictionary
export const BOT_SWEET_MESSAGES = BOT_ROLE_MESSAGES.boyfriend;

export function getRandomBotReaction(role: RoseRole = 'boyfriend', category?: RoseBotMessageCategory): string {
  const boyfriendEmojis = ['❤️', '🌹', '👑', '⚔️', '💍', '😉', '💘', '🏰', '🥰', '✨', '☕', '🍫'];
  const girlfriendEmojis = ['💖', '💅', '🧋', '🎀', '🧸', '🥺', '💐', '🤭', '🙈', '😜', '✨', '💘'];

  const pool = role === 'girlfriend' ? girlfriendEmojis : boyfriendEmojis;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomBotMessage(
  category: RoseBotMessageCategory,
  role: RoseRole = 'boyfriend'
): string {
  const rolePool = BOT_ROLE_MESSAGES[role] || BOT_ROLE_MESSAGES.boyfriend;
  const pool = rolePool[category] || rolePool.randomTurn;
  return pool[Math.floor(Math.random() * pool.length)];
}
