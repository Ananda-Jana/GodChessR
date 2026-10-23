/**
 * Curriculum, Rank Definitions, and Lesson Katas for Chess Hashira Training
 *
 * Fully expanded with multiple lessons per Dojo across all 6 ranks:
 * 1. Opening Dojo (Foundational control, Prince development, pawn structures)
 * 2. Tactical Dojo (Knight forks, pins, skewers, sacrifices, smothered mates)
 * 3. Culling Dojo (Authentic Jujutsu Kaisen cross board, Gojo/Sukuna abilities,
 *    Nanami Warden Ratio Field, Mechamaru Artillery, Maki Heavenly Restriction,
 *    Panda Bulwark Shell, Hakari Rusher Jackpot)
 */

import type {
  HashiraRankId,
  HashiraRankInfo,
  DojoLesson,
  TheoryScroll,
  HashiraUserProgress,
  TrainerId,
  TrainerProfile,
} from './types';
import type { Piece } from '../types/game';
import type { CullingPiece, CullingPieceType, CullingPieceColor, CullingBoard } from '../types/cullingGame';

export const TRAINER_PROFILES: Record<TrainerId, TrainerProfile> = {
  thukuna: {
    id: 'thukuna',
    name: 'Thukuna',
    title: 'The Plasma Hashira',
    kanji: '宿',
    themeColor: '#fbbf24',
    accentBg: 'bg-red-600 text-white border-black',
    bannerBadgeBg: 'bg-red-600/90 text-white border-black',
    badgeTextColor: 'text-amber-400',
    personality: 'fiery_mentor',
    avatarSrc: '/assets/aistudio/image_77c93c63.png',
    greetingPrompt: 'Welcome to the Dojo, pupil. I am Thukuna, the Plasma Hashira. Forge your moves in fire and seize the center!',
  },
  gatoru: {
    id: 'gatoru',
    name: 'Gatoru Luchha',
    title: 'The Void Hashira',
    kanji: '悟',
    themeColor: '#38bdf8',
    accentBg: 'bg-sky-500 text-black border-black',
    bannerBadgeBg: 'bg-sky-600/90 text-white border-black',
    badgeTextColor: 'text-sky-400',
    personality: 'strict_void',
    avatarSrc: '/assets/aistudio/Screenshot_2026-10-24_002819_6214e7b9.png',
    greetingPrompt: 'I am Gatoru Luchha, the Void Hashira. No sluggish or careless blunders are tolerated. Calculate every vector with absolute perfection.',
  },
};

export const HASHIRA_RANKS: HashiraRankInfo[] = [
  {
    id: 'mizunoto',
    tierNumber: 1,
    name: 'Mizunoto',
    kanji: '癸',
    element: 'Water Initiate',
    subtitle: 'Novice Kata — Pure Flow & Foundations',
    description: 'Learn the first forms of movement. Sparring opponents are extremely forgiving and blunders are frequent, ensuring any initiate achieves victory.',
    accentColor: '#38bdf8',
    bgGradient: 'from-sky-950 via-slate-900 to-black',
    badgeTitle: 'Mizunoto Water Badge',
    botDifficulty: {
      depth: 1,
      blunderChance: 0.75,
      label: 'Mizunoto Sparring Partner',
      description: 'Extremely forgiving novice play. Leaves pieces open for capture and misses basic checks.',
    },
  },
  {
    id: 'kanoe',
    tierNumber: 2,
    name: 'Kanoe',
    kanji: '庚',
    element: 'Iron Blade',
    subtitle: 'Apprentice Kata — Tactical Sharpness',
    description: 'Sharpen your piece coordination and king safety. The opponent begins recognizing straightforward threats but still falters under pressure.',
    accentColor: '#cbd5e1',
    bgGradient: 'from-slate-800 via-neutral-900 to-black',
    badgeTitle: 'Kanoe Iron Badge',
    botDifficulty: {
      depth: 1,
      blunderChance: 0.35,
      label: 'Kanoe Iron Sparrer',
      description: 'Apprentice play. Defends some direct captures but commits positional oversights.',
    },
  },
  {
    id: 'tsuchinoe',
    tierNumber: 3,
    name: 'Tsuchinoe',
    kanji: '戊',
    element: 'Earth Bastion',
    subtitle: 'Adept Kata — Solid Defensive Shields',
    description: 'Master board expansion files and fortress defense. The opponent plays disciplined standard chess with few free blunders.',
    accentColor: '#f59e0b',
    bgGradient: 'from-amber-950 via-neutral-900 to-black',
    badgeTitle: 'Tsuchinoe Bastion Badge',
    botDifficulty: {
      depth: 2,
      blunderChance: 0.15,
      label: 'Tsuchinoe Sentinel',
      description: 'Disciplined intermediate combatant. Builds pawn chains and watches open files.',
    },
  },
  {
    id: 'hinoe',
    tierNumber: 4,
    name: 'Hinoe',
    kanji: '丙',
    element: 'Flame Strategist',
    subtitle: 'Veteran Kata — Blazing Combinations',
    description: 'Execute tactical forks, sacrifices, and fairy piece incursions. Opponent responds aggressively to checks and seizes open center lines.',
    accentColor: '#ef4444',
    bgGradient: 'from-red-950 via-neutral-900 to-black',
    badgeTitle: 'Hinoe Flame Badge',
    botDifficulty: {
      depth: 2,
      blunderChance: 0.05,
      label: 'Hinoe Fire Vanguard',
      description: 'Sharp veteran player. Calculates tactical traps and punishes undefended officers.',
    },
  },
  {
    id: 'kinoe',
    tierNumber: 5,
    name: 'Kinoe',
    kanji: '甲',
    element: 'Tree of Mastery',
    subtitle: 'Master Kata — Deep Positional Roots',
    description: 'Precision calculation required. Suboptimal moves are met with swift counter-strikes and positional suppression.',
    accentColor: '#10b981',
    bgGradient: 'from-emerald-950 via-neutral-900 to-black',
    badgeTitle: 'Kinoe Master Badge',
    botDifficulty: {
      depth: 3,
      blunderChance: 0.0,
      label: 'Kinoe Elite Combatant',
      description: 'Expert level depth. Zero unprovoked blunders; seizes every opening inaccuracy ruthlessly.',
    },
  },
  {
    id: 'hashira',
    tierNumber: 6,
    name: 'Hashira',
    kanji: '柱',
    element: 'The Supreme Pillar',
    subtitle: 'Grandmaster Kata — Absolute Martial Dominion',
    description: 'Face the pinnacle of chess mastery. Full minimax depth with Prince tactical tables. Any mistake results in swift and punishing defeat.',
    accentColor: '#eab308',
    bgGradient: 'from-yellow-950 via-neutral-950 to-black',
    badgeTitle: 'Chess Hashira Grand Pillar',
    botDifficulty: {
      depth: 3,
      blunderChance: 0.0,
      label: 'Hashira Grandmaster Pillar',
      description: 'The highest tier. Flawless tactical evaluation, lethal king hunts, and uncompromising punishment.',
    },
  },
];

// -------------------------------------------------------------
// BOARD BUILDERS
// -------------------------------------------------------------
export function createEmptyBoard(): (Piece | null)[][] {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

function p(type: any, color: 'white' | 'black', id: string, hasMoved = false): Piece {
  return { id, type, color, hasMoved };
}

export function createEmptyCullingKataBoard(): CullingBoard {
  const board: CullingBoard = [];
  for (let y = 0; y < 10; y++) {
    const row: (CullingPiece | null)[] = [];
    for (let x = 0; x < 10; x++) {
      row.push(null);
    }
    board.push(row);
  }
  return board;
}

function cp(
  type: CullingPieceType,
  color: CullingPieceColor,
  id: string,
  hasMoved = false,
  extra: Partial<CullingPiece> = {}
): CullingPiece {
  return { id, type, color, hasMoved, ...extra };
}

// -------------------------------------------------------------
// EXPANDED DOJO LESSONS CATALOGUE
// -------------------------------------------------------------
export const DOJO_LESSONS: DojoLesson[] = [
  // ==========================================
  // RANK 1: MIZUNOTO (Water Initiate)
  // ==========================================
  {
    id: 'mizunoto_opening_1',
    rank: 'mizunoto',
    tool: 'opening',
    title: 'First Form: Center Vanguard',
    subtitle: 'Controlling e4 and unleashing the diagonals',
    mode: 'standard',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][4] = p('king', 'white', 'wk1');
      b[0][3] = p('queen', 'white', 'wq1');
      b[0][2] = p('bishop', 'white', 'wb1');
      b[1][4] = p('pawn', 'white', 'wp_e');
      b[1][3] = p('pawn', 'white', 'wp_d');
      b[7][4] = p('king', 'black', 'bk1');
      b[7][3] = p('queen', 'black', 'bq1');
      b[6][4] = p('pawn', 'black', 'bp_e');
      return b;
    })(),
    mentorPrompt: 'Pupil! In the martial art of chess, control of the center decides who commands the battleground. Advance your King\'s Pawn two strides forward to e4!',
    hint: 'Move the white pawn at e2 (x=4, y=1) to e4 (x=4, y=3). This stakes claim to the high ground.',
    mentorFailure: 'Tsk! Sluggish hesitation! Move the e-pawn forward to e4 with decisive authority!',
    mentorSuccess: 'Splendid form! You commanded the central squares and established complete dominion over the opening.',
    mistakeExplanations: {
      '3,1->3,3': 'You pushed the d-pawn instead! The King\'s e-pawn is the primary spearhead of this kata!',
      '4,1->4,2': 'A single push to e3 is timid! Stake your full claim on the center with e4!',
    },
    correctSteps: [
      {
        from: { x: 4, y: 1 },
        to: { x: 4, y: 3 },
        explanation: '1. e4 controls d5/f5 and immediately opens diagonal vectors for your officers.',
        tacticalBreakdown: 'Advancing the King pawn two strides stakes claim over d5 and f5 while freeing both your Queen (d1) and Bishop (c1) for immediate deployment.',
        hint: 'Push White e2-pawn (x=4, y=1) two squares forward to e4 (x=4, y=3).',
        mentorPrompt: 'Pupil! Advance your King\'s Pawn two strides forward to e4 to command the center!',
        mentorReaction: 'approving',
        mentorCommentary: 'Strong posture. The foundation of water begins with central command.',
      },
      {
        from: { x: 3, y: 1 },
        to: { x: 3, y: 3 },
        explanation: '2. d4 forms a dual-pawn center, challenging Black\'s e5 outpost directly.',
        tacticalBreakdown: 'Striking with 2. d4 establishes a dual-pawn battering ram that breaks Black\'s center and forces Black into defensive concessions.',
        hint: 'Push White d2-pawn (x=3, y=1) forward two squares to d4 (x=3, y=3).',
        mentorPrompt: 'Black contests the center! Strike now with your Queen\'s pawn to d4 to form a dual-pawn battering ram!',
        mentorReaction: 'approving',
        mentorCommentary: 'Superb! The center is blown wide open under White\'s terms.',
      },
      {
        from: { x: 3, y: 0 },
        to: { x: 3, y: 3 },
        explanation: '3. Qxd4 recaptures the pawn and posts the Queen on a commanding central square.',
        tacticalBreakdown: 'Recapturing with the Queen restores material balance while dominating open ranks, files, and diagonals with overwhelming tactical presence.',
        hint: 'Recapture on d4 (x=3, y=3) using your Queen from d1 (x=3, y=0).',
        mentorPrompt: 'The pawn has fallen! Recapture with your Queen on d4 to dominate the battlefield!',
        mentorReaction: 'approving',
        mentorCommentary: 'Perfection! The Center Game sequence is cleanly executed.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 4, y: 6 },
        to: { x: 4, y: 4 },
        commentary: 'Black responds with 1... e5 to dispute the high ground.',
      },
      {
        triggerStepIndex: 1,
        from: { x: 4, y: 4 },
        to: { x: 3, y: 3 },
        commentary: 'Black captures on d4! Recapture with your Queen!',
      },
    ],
  },
  {
    id: 'mizunoto_opening_2',
    rank: 'mizunoto',
    tool: 'opening',
    title: 'Second Form: Royal Steed Deployment',
    subtitle: 'Deploying the Knight to Nf3 to exert central pressure',
    mode: 'standard',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][4] = p('king', 'white', 'wk1');
      b[0][6] = p('knight', 'white', 'wn_g'); // g1
      b[0][1] = p('knight', 'white', 'wn_b'); // b1
      b[0][5] = p('bishop', 'white', 'wb_f'); // f1
      b[3][4] = p('pawn', 'white', 'wp_e');   // e4
      b[7][4] = p('king', 'black', 'bk1');
      b[4][4] = p('pawn', 'black', 'bp_e');   // e5
      b[7][1] = p('knight', 'black', 'bn_b'); // b8
      b[6][3] = p('pawn', 'black', 'bp_d');   // d7
      return b;
    })(),
    mentorPrompt: 'Officers must not sleep in barracks! Leap your Knight from g1 to f3 to attack the black pawn on e5 while shielding your monarch.',
    hint: 'Move your Knight from g1 (x=6, y=0) to f3 (x=5, y=2).',
    mentorFailure: 'That leap misses the vital outpost! Direct the steed to f3!',
    mentorSuccess: 'Swift and disciplined! You developed your minor officers in perfect harmony.',
    mistakeExplanations: {
      '6,0->7,2': 'Developing to the rim (Nh3) is passive! A Knight on the rim is dim!',
      '6,0->4,1': 'Do not step in front of your King on e2! Develop outward toward f3!',
    },
    correctSteps: [
      {
        from: { x: 6, y: 0 },
        to: { x: 5, y: 2 },
        explanation: '1. Nf3 develops with tempo, attacking Black\'s e5 pawn while preparing King castling.',
        tacticalBreakdown: 'Developing the Knight toward the center exerts direct pressure on Black\'s e5 pawn while preparing rapid castling.',
        hint: 'Move your Knight from g1 (x=6, y=0) to f3 (x=5, y=2).',
        mentorPrompt: 'Leap your Knight from g1 to f3 to attack Black\'s e5 pawn with tempo!',
        mentorReaction: 'approving',
        mentorCommentary: 'Excellent! Developing with an active threat robs the opponent of easy development.',
      },
      {
        from: { x: 5, y: 0 },
        to: { x: 2, y: 3 },
        explanation: '2. Bc4 targets the vulnerable f7 square, defended only by the Black King.',
        tacticalBreakdown: 'Developing the Bishop to c4 in the Italian Game aims a lethal laser at f7, the weakest square in the enemy camp.',
        hint: 'Develop your light-squared Bishop from f1 (x=5, y=0) to c4 (x=2, y=3).',
        mentorPrompt: 'Black defends e5! Now deploy your Bishop from f1 to c4 to pressure Black\'s vulnerable f7 square!',
        mentorReaction: 'approving',
        mentorCommentary: 'Sharp eye! The Italian Bishop exerts tremendous diagonal pressure.',
      },
      {
        from: { x: 1, y: 0 },
        to: { x: 2, y: 2 },
        explanation: '3. Nc3 completes harmonious minor piece mobilization.',
        tacticalBreakdown: 'Developing both Knights and the Bishop in the opening phase establishes complete classical control over all key central squares.',
        hint: 'Develop your queenside Knight from b1 (x=1, y=0) to c3 (x=2, y=2).',
        mentorPrompt: 'Mobilize your queenside steed from b1 to c3 to complete harmonious development!',
        mentorReaction: 'approving',
        mentorCommentary: 'Magnificent triad development. All minor officers are mobilized!',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 1, y: 7 },
        to: { x: 2, y: 5 },
        commentary: 'Black defends e5 with 1... Nc6.',
      },
      {
        triggerStepIndex: 1,
        from: { x: 3, y: 6 },
        to: { x: 3, y: 5 },
        commentary: 'Black plays 2... d6 to reinforce the center.',
      },
    ],
  },
  {
    id: 'mizunoto_tactics_1',
    rank: 'mizunoto',
    tool: 'tactics',
    title: 'Twin Fang Strike: Knight Fork',
    subtitle: 'Simultaneous assault on King and Rook',
    mode: 'standard',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][4] = p('king', 'white', 'wk1');
      b[4][3] = p('knight', 'white', 'wn1'); // d5 Knight
      b[7][4] = p('king', 'black', 'bk1');   // e8 King
      b[7][0] = p('rook', 'black', 'br1');   // a8 Rook
      b[6][2] = p('pawn', 'black', 'bp1');   // c7 pawn target
      return b;
    })(),
    mentorPrompt: 'Observe the enemy King on e8 and the undefended Rook on a8. Leaping through the air, strike the c7 square to deliver a fatal double assault!',
    hint: 'Move your Knight from d5 (x=3, y=4) to c7 (x=2, y=6) to check the black King while threatening the Rook!',
    mentorFailure: 'Blindness! You strike air while the enemy monarch slips away. Focus your leap on c7!',
    mentorSuccess: 'Flawless execution! A classic twin-fang fork followed by decisive material capture.',
    mistakeExplanations: {
      '3,4->4,6': 'Moving to e7 gives check, but misses the fork on the a8 Rook! Strike c7!',
      '3,4->1,3': 'Nb4 misses the attack completely! Strike c7 with check!',
    },
    correctSteps: [
      {
        from: { x: 3, y: 4 },
        to: { x: 2, y: 6 },
        explanation: '1. Nxc7+ checks e8 King while forking the a8 Rook.',
        tacticalBreakdown: 'The Knight leap to c7 simultaneously attacks the enemy monarch and the corner Rook. Because check must be resolved, the Rook cannot escape.',
        hint: 'Leap your Knight from d5 (x=3, y=4) to c7 (x=2, y=6) with check!',
        mentorPrompt: 'Leap your Knight to c7 with check, delivering a fatal twin-fang royal fork!',
        mentorReaction: 'approving',
        mentorCommentary: 'Notice how the Knight bypasses enemy sightlines completely. This is the essence of tactical fangs.',
      },
      {
        from: { x: 2, y: 6 },
        to: { x: 0, y: 7 },
        explanation: '2. Nxa8 captures the corner Rook, converting the tactical fork into a +5 material lead.',
        tacticalBreakdown: 'Executing the fork payoff captures a full Rook, permanently crippling Black\'s defensive power.',
        hint: 'Capture the trapped Rook on a8 (x=0, y=7) with your Knight from c7 (x=2, y=6).',
        mentorPrompt: 'The King has fled! Capture the helpless Rook on a8 to seal the victory!',
        mentorReaction: 'approving',
        mentorCommentary: 'Decisive strike! The material advantage is overwhelming.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 4, y: 7 },
        to: { x: 3, y: 7 },
        commentary: 'The Black King is forced to flee to d8!',
      },
    ],
  },
  {
    id: 'mizunoto_tactics_2',
    rank: 'mizunoto',
    tool: 'tactics',
    title: 'Corridor Cleave: Back-Rank Mate',
    subtitle: 'Punishing the monarch trapped behind his own pawns',
    mode: 'standard',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][6] = p('king', 'white', 'wk1'); // g1
      b[1][5] = p('pawn', 'white', 'wp_f'); // f2
      b[1][6] = p('pawn', 'white', 'wp_g'); // g2
      b[1][7] = p('pawn', 'white', 'wp_h'); // h2
      b[0][3] = p('queen', 'white', 'wq1'); // d1
      b[0][4] = p('rook', 'white', 'wr1');  // e1
      b[7][6] = p('king', 'black', 'bk1');  // g8
      b[6][5] = p('pawn', 'black', 'bp_f'); // f7
      b[6][6] = p('pawn', 'black', 'bp_g'); // g7
      b[6][7] = p('pawn', 'black', 'bp_h'); // h7
      b[7][3] = p('rook', 'black', 'br1');  // d8
      b[7][2] = p('queen', 'black', 'bq1'); // c8
      return b;
    })(),
    mentorPrompt: 'Black\'s King is sealed behind his pawns, but guarded by a Rook on d8. Execute the deflection sacrifice on d8 with your Queen to open the kill corridor!',
    hint: 'Capture Black Rook on d8 (x=3, y=7) using your Queen from d1 (x=3, y=0) with check!',
    mentorFailure: 'Do not fear the sacrifice! Clear the back corridor with Qxd8+!',
    mentorSuccess: 'CHECKMATE! The corridor is sealed. The King was trapped by his own loyal pawns.',
    mistakeExplanations: {
      '4,0->4,7': 'Moving the Rook to e8 immediately allows Black to capture with Rook or Queen! Deflect with Qxd8+ first!',
    },
    correctSteps: [
      {
        from: { x: 3, y: 0 },
        to: { x: 3, y: 7 },
        explanation: '1. Qxd8+ sacrifices the Queen to deflect the Black defender.',
        tacticalBreakdown: 'Sacrificing the Queen on d8 forces Black\'s Queen away from the defense of e8, setting up an immediate back-rank corridor mate.',
        hint: 'Capture Black Rook on d8 (x=3, y=7) using your Queen from d1 (x=3, y=0) with check!',
        mentorPrompt: 'Deliver a shocking Queen sacrifice on d8 to shatter Black back-rank defense!',
        mentorReaction: 'approving',
        mentorCommentary: 'Brilliant deflection! Black has no choice but to recapture.',
      },
      {
        from: { x: 4, y: 0 },
        to: { x: 4, y: 7 },
        explanation: '2. Re8# delivers decisive back-rank checkmate.',
        tacticalBreakdown: 'The Black King is trapped behind his own pawns on f7, g7, and h7. With the 8th rank sealed by the Rook, escape is impossible.',
        hint: 'Rush White Rook from e1 (x=4, y=0) all the way to e8 (x=4, y=7) for checkmate!',
        mentorPrompt: 'Deliver the final cut! Invade e8 with your Rook for checkmate!',
        mentorReaction: 'approving',
        mentorCommentary: 'Always be mindful of back-rank vulnerability, pupil. Checkmate is achieved.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 2, y: 7 },
        to: { x: 3, y: 7 },
        commentary: 'Black is forced to recapture: 1... Qxd8.',
      },
    ],
  },
  {
    id: 'mizunoto_culling_1',
    rank: 'mizunoto',
    tool: 'culling',
    title: 'Sovereign Domain Step: Satoru Gojo',
    subtitle: 'Executing Gojo\'s spatial leap on the 88-square cross board',
    mode: 'culling',
    playerColor: 'white',
    cullingPlayerColor: 'white',
    initialBoard: createEmptyBoard(),
    cullingBoard: (() => {
      const b = createEmptyCullingKataBoard();
      b[1][8] = cp('culling_gojo', 'white', 'w_gojo');
      b[1][7] = cp('culling_yuji', 'white', 'w_yuji');
      b[1][6] = cp('culling_mechamaru', 'white', 'w_mechamaru');
      b[8][1] = cp('culling_sukuna', 'black', 'b_sukuna');
      b[8][2] = cp('culling_kenjaku', 'black', 'b_kenjaku');
      b[4][6] = cp('culling_pawn', 'black', 'b_pawn_f4'); // F4 cursed pawn
      return b;
    })(),
    mentorPrompt: 'Pupil! In the Culling Game, Satoru Gojo is the Sovereign. Unlike an ordinary King, Gojo possesses Domain Step: once per game, he can leap 2 squares over obstacles! Leap Gojo forward to F3 to seize spatial superiority!',
    hint: 'Move Satoru Gojo from H1 (x=8, y=1) to F3 (x=6, y=3) utilizing his 2-square diagonal Domain Step.',
    mentorFailure: 'Hesitation! Gojo\'s Domain Step requires fearless spatial mastery. Land precisely on F3!',
    mentorSuccess: 'LIMITLESS! Satoru Gojo warped across space with Domain Step and shattered Black\'s forward line.',
    mistakeExplanations: {
      '8,1->8,2': 'A mundane 1-step move fails to utilize Gojo\'s Sovereign Domain Step! Leap 2 squares to F3!',
      '7,1->7,4': 'You moved Yuji instead! The trial commands Satoru Gojo to demonstrate the Domain Step!',
    },
    correctSteps: [
      {
        from: { x: 8, y: 1 },
        to: { x: 6, y: 3 },
        explanation: '1. Domain Step allows Gojo to leap 2 squares diagonally over obstacles to anchor central control.',
        tacticalBreakdown: 'Gojo Sovereign Domain Step enables a 2-square diagonal leap over pieces to establish supreme central spatial control on F3.',
        hint: 'Move Satoru Gojo from H1 (x=8, y=1) to F3 (x=6, y=3) using Domain Step.',
        mentorPrompt: 'Leap Gojo forward to F3 utilizing his 2-square diagonal Domain Step!',
        mentorReaction: 'approving',
        mentorCommentary: 'Remember: Domain Step cannot be used while in check, and the landing square must be safe.',
        cullingActionType: 'teleport',
      },
      {
        from: { x: 6, y: 3 },
        to: { x: 6, y: 4 },
        explanation: '2. Gojo strikes forward to eliminate the cursed vanguard pawn on F4.',
        tacticalBreakdown: 'Neutralizing the outpost pawn dismantles Black\'s forward defense line and opens an invasion lane toward Sukuna\'s sector.',
        hint: 'Advance Gojo from F3 (x=6, y=3) forward to F4 (x=6, y=4) to capture the cursed pawn.',
        mentorPrompt: 'From F3, strike forward! Capture Black\'s outpost pawn on F4 with Sovereign authority!',
        mentorReaction: 'approving',
        mentorCommentary: 'Flawless precision. The cross-board sector is completely dominated.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 2, y: 8 },
        to: { x: 2, y: 6 },
        commentary: 'Kenjaku shifts his barrier stance to B6.',
      },
    ],
  },
  {
    id: 'mizunoto_culling_2',
    rank: 'mizunoto',
    tool: 'culling',
    title: 'Vanguard Incursion: Yuji Itadori',
    subtitle: 'Sliding 3 squares through the cross board to claim high ground',
    mode: 'culling',
    playerColor: 'white',
    cullingPlayerColor: 'white',
    initialBoard: createEmptyBoard(),
    cullingBoard: (() => {
      const b = createEmptyCullingKataBoard();
      b[1][8] = cp('culling_gojo', 'white', 'w_gojo');
      b[1][7] = cp('culling_yuji', 'white', 'w_yuji'); // G1
      b[8][1] = cp('culling_sukuna', 'black', 'b_sukuna');
      b[4][7] = cp('culling_pawn', 'black', 'b_pawn_g4'); // G4 target
      b[7][7] = cp('culling_pawn', 'black', 'b_pawn_g7'); // G7 target
      return b;
    })(),
    mentorPrompt: 'Yuji Itadori is White\'s Vanguard! He slides up to 3 squares in all 8 directions without leaping. Charge Yuji 3 squares up the G-file to G4 to capture the cursed pawn!',
    hint: 'Slide Yuji from G1 (x=7, y=1) to G4 (x=7, y=4) to smash the outpost pawn.',
    mentorFailure: 'Do not hold back Yuji\'s explosive physical prowess! Drive straight to G4!',
    mentorSuccess: 'BLACK FLASH IMPACT! Yuji charges through the corridor, shattering both cursed outposts.',
    mistakeExplanations: {
      '7,1->7,2': 'Too hesitant! Yuji can slide up to 3 squares—drive directly to G4!',
      '8,1->7,2': 'Do not move Gojo! This drill tests the Vanguard\'s long-range slide!',
    },
    correctSteps: [
      {
        from: { x: 7, y: 1 },
        to: { x: 7, y: 4 },
        explanation: '1. Yuji slides 3 squares orthogonally, capturing Black\'s G4 pawn with Vanguard momentum.',
        tacticalBreakdown: 'Vanguards move up to 3 squares in all 8 directions. Striking G4 smashes Black\'s forward sentry.',
        hint: 'Slide Yuji from G1 (x=7, y=1) to G4 (x=7, y=4) to smash the outpost pawn.',
        mentorPrompt: 'Slide Vanguard Yuji 3 squares up the G-file to G4 to capture the cursed pawn!',
        mentorReaction: 'approving',
        mentorCommentary: 'Vanguards are your primary offensive battering rams in the Culling Game.',
      },
      {
        from: { x: 7, y: 4 },
        to: { x: 7, y: 7 },
        explanation: '2. Yuji strikes again with Black Flash momentum, penetrating deep into Black\'s back ranks.',
        tacticalBreakdown: 'Maintaining explosive forward momentum breaks through Black\'s second defense tier and directly threatens Sukuna.',
        hint: 'Drive Yuji 3 squares further from G4 (x=7, y=4) to G7 (x=7, y=7).',
        mentorPrompt: 'Keep the offensive momentum! Drive Yuji another 3 squares to G7 to smash the second defensive rank!',
        mentorReaction: 'approving',
        mentorCommentary: 'Unstoppable physical might! Black\'s flank is completely overrun.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 1, y: 8 },
        to: { x: 2, y: 7 },
        commentary: 'Sukuna prepares his cursed counter-stance on B7.',
      },
    ],
  },

  // ==========================================
  // RANK 2: KANOE (Iron Blade)
  // ==========================================
  {
    id: 'kanoe_opening_1',
    rank: 'kanoe',
    tool: 'opening',
    title: 'Iron Stance: The Prince Guard',
    subtitle: 'Activating the Prince to form an impenetrable royal citadel',
    mode: 'standard',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][4] = p('king', 'white', 'wk1');
      b[0][3] = p('prince', 'white', 'wpr1'); // d1 Prince
      b[1][3] = p('pawn', 'white', 'wp_d');   // d2 pawn
      b[1][4] = p('pawn', 'white', 'wp_e');   // e2 pawn
      b[7][4] = p('king', 'black', 'bk1');
      b[6][4] = p('pawn', 'black', 'bp_e');   // e7
      b[6][3] = p('pawn', 'black', 'bp_d');   // d7
      return b;
    })(),
    mentorPrompt: 'The Prince possesses royal blood: moving one square in any direction or vaulting like a Knight. Leap your Prince over the pawn line to c3 to support the monarch and stake central control!',
    hint: 'Move your Prince from d1 (x=3, y=0) to c3 (x=2, y=2) using a Knight leap.',
    mentorFailure: 'Do not leave the Prince idle in the back rank! Leap forward to c3!',
    mentorSuccess: 'Resolute discipline! The Prince fortified c3 and established command over the central high ground.',
    mistakeExplanations: {
      '3,0->3,2': 'Illegal jump! The Prince cannot jump straight over d2 without Knight angles! Leap to c3!',
      '3,0->4,2': 'e3 is acceptable in battle, but c3 is the disciplined kata stance of this drill!',
    },
    correctSteps: [
      {
        from: { x: 3, y: 0 },
        to: { x: 2, y: 2 },
        explanation: '1. Prince leaps to c3 like a Knight, controlling d5 and e4 while maintaining royal proximity.',
        tacticalBreakdown: 'The Prince possesses royal blood with dual movement: 1 square like a King or L-hops like a Knight. Vaulting over the pawns to c3 controls central outposts.',
        hint: 'Move your Prince from d1 (x=3, y=0) to c3 (x=2, y=2) using a Knight leap.',
        mentorPrompt: 'Leap your Prince over your pawns to c3 to fortify the royal perimeter!',
        mentorReaction: 'approving',
        mentorCommentary: 'Remember: if your King falls, the Prince ascends to the throne! Keep him active and vigilant.',
      },
      {
        from: { x: 2, y: 2 },
        to: { x: 3, y: 3 },
        explanation: '2. Prince steps 1 square diagonally like a King to d4, putting immediate pressure on Black\'s d5 pawn.',
        tacticalBreakdown: 'Switching to King-stride movement allows the Prince to occupy the d4 central high ground and directly contest Black\'s advanced pawn.',
        hint: 'Step the Prince 1 square diagonally from c3 (x=2, y=2) to d4 (x=3, y=3).',
        mentorPrompt: 'Now utilize the Prince\'s King-stride! Step 1 square diagonally to d4 to contest Black\'s center!',
        mentorReaction: 'approving',
        mentorCommentary: 'Splendid mastery of dual movement! The Prince commands the heart of the board.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 3, y: 6 },
        to: { x: 3, y: 4 },
        commentary: 'Black pushes d5 to claim central space.',
      },
    ],
  },
  {
    id: 'kanoe_tactics_1',
    rank: 'kanoe',
    tool: 'tactics',
    title: 'Iron Binding: Absolute Pin',
    subtitle: 'Paralyzing the enemy officer against their monarch',
    mode: 'standard',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][4] = p('king', 'white', 'wk1');
      b[3][0] = p('bishop', 'white', 'wb1'); // a4 Bishop
      b[7][4] = p('king', 'black', 'bk1');   // e8 King
      b[6][3] = p('knight', 'black', 'bn1'); // d7 Knight
      b[6][0] = p('pawn', 'black', 'bp_a');  // a7 pawn
      return b;
    })(),
    mentorPrompt: 'The black Knight on d7 shields the King on e8. Slide your Bishop from a4 to b5 along the diagonal to pin the Knight with iron shackles!',
    hint: 'Move Bishop from a4 (x=0, y=3) to b5 (x=1, y=4). It pins the Knight to the King along the a4-e8 diagonal.',
    mentorFailure: 'That square misses the diagonal line of fire! Aim for b5 to pin the Knight against e8!',
    mentorSuccess: 'Immovable iron pin! You neutralized the defender and harvested the piece cleanly.',
    mistakeExplanations: {
      '0,3->2,5': 'Bc6 is captured by the Knight! Anchor on b5 to maintain the pin safely!',
    },
    correctSteps: [
      {
        from: { x: 0, y: 3 },
        to: { x: 1, y: 4 },
        explanation: '1. Bb5 creates an absolute pin on the d7 Knight along the a4-e8 diagonal.',
        tacticalBreakdown: 'An absolute pin freezes the Knight because moving it would expose the Black King to illegal check. The piece is rendered completely paralyzed.',
        hint: 'Move Bishop from a4 (x=0, y=3) to b5 (x=1, y=4) to pin the Knight.',
        mentorPrompt: 'Slide your Bishop to b5 to pin the Black Knight against its monarch!',
        mentorReaction: 'approving',
        mentorCommentary: 'A pinned piece ceases to be an attacker. Use pins to shatter enemy coordination.',
      },
      {
        from: { x: 1, y: 4 },
        to: { x: 3, y: 6 },
        explanation: '2. Bxd7+ cashes in the pin, capturing the paralyzed Knight with check.',
        tacticalBreakdown: 'Striking the pinned piece converts the tactical bind into a clean material advantage while forcing the Black King to respond to check.',
        hint: 'Capture the pinned Knight on d7 (x=3, y=6) using your Bishop from b5 (x=1, y=4) with check!',
        mentorPrompt: 'Strike the pinned officer! Capture the Knight on d7 with decisive check!',
        mentorReaction: 'approving',
        mentorCommentary: 'Decisive execution. The pinned officer has fallen.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 0, y: 6 },
        to: { x: 0, y: 5 },
        commentary: 'Black plays 1... a6 in a desperate attempt to dislodge your Bishop.',
      },
    ],
  },
  {
    id: 'kanoe_culling_1',
    rank: 'kanoe',
    tool: 'culling',
    title: 'Warden 7:3 Ratio Field: Kento Nanami',
    subtitle: 'Restricting enemy mobility to 1 square with the Ratio Field',
    mode: 'culling',
    playerColor: 'white',
    cullingPlayerColor: 'white',
    initialBoard: createEmptyBoard(),
    cullingBoard: (() => {
      const b = createEmptyCullingKataBoard();
      b[1][8] = cp('culling_gojo', 'white', 'w_gojo');
      b[1][4] = cp('culling_nanami', 'white', 'w_nanami'); // D1 Nanami (4,1)
      b[8][1] = cp('culling_sukuna', 'black', 'b_sukuna');
      b[6][4] = cp('culling_kenjaku', 'black', 'b_kenjaku'); // D6 Kenjaku (4,6)
      return b;
    })(),
    mentorPrompt: 'Kento Nanami is White\'s Warden! He creates a passive Ratio Field: any enemy within 1 adjacent square is restricted to 1 square max movement! Slide Warden Nanami from D1 (x=4, y=1) to D4 (x=4, y=4) to suppress Kenjaku!',
    hint: 'Move Warden Nanami from D1 (x=4, y=1) to D4 (x=4, y=4).',
    mentorFailure: 'You failed to enter adjacent contact! Bring Warden Nanami to D4 (x=4, y=4) to activate the Ratio Field!',
    mentorSuccess: 'OVERTIME ACTIVATED! Kenjaku was clamped in Nanami\'s Ratio Field and destroyed at the 7:3 ratio point.',
    correctSteps: [
      {
        from: { x: 4, y: 1 },
        to: { x: 4, y: 4 },
        explanation: '1. Warden Nanami establishes contact at D4 (x=4, y=4), restricting adjacent enemies to 1 square mobility.',
        tacticalBreakdown: 'Kento Nanami Warden Ratio Field passively clamps any adjacent enemy to a maximum of 1 square movement, neutralizing Kenjaku\'s 3-square sliding power.',
        hint: 'Move Warden Nanami from D1 (x=4, y=1) to D4 (x=4, y=4).',
        mentorPrompt: 'Bring Warden Nanami from D1 (x=4, y=1) to D4 (x=4, y=4) to activate the 7:3 Ratio Field and clamp Kenjaku!',
        mentorReaction: 'approving',
        mentorCommentary: 'Wardens are vital anti-vanguard shields. Use them to cage enemy officers.',
      },
      {
        from: { x: 4, y: 4 },
        to: { x: 4, y: 5 },
        explanation: '2. Warden Nanami strikes the 7:3 ratio critical point on D5 (x=4, y=5), eliminating Kenjaku.',
        tacticalBreakdown: 'Because the Ratio Field prevented Kenjaku from fleeing into the distance, Warden Nanami executes a fatal critical strike, capturing the enemy commander.',
        hint: 'Attack Kenjaku on D5 (x=4, y=5) using Warden Nanami from D4 (x=4, y=4).',
        mentorPrompt: 'Kenjaku could only crawl 1 square to D5! Strike his critical 7:3 ratio point on D5 (x=4, y=5) with Warden Nanami from D4 (x=4, y=4) to finish him!',
        mentorReaction: 'approving',
        mentorCommentary: 'Overtime concluded. The 7:3 ratio strike never misses its mark.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 4, y: 6 },
        to: { x: 4, y: 5 },
        commentary: 'Kenjaku (restricted to 1 square) steps weakly to D5 (x=4, y=5).',
      },
    ],
  },

  // ==========================================
  // RANK 3: TSUCHINOE (Earth Bastion)
  // ==========================================
  {
    id: 'tsuchinoe_tactics_1',
    rank: 'tsuchinoe',
    tool: 'tactics',
    title: 'Earth Breaker: Communist Infiltration',
    subtitle: 'Using crafted piece zigzag penetration through enemy defenses',
    mode: 'crafted',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][4] = p('king', 'white', 'wk1'); // e1
      b[2][1] = p('communist', 'white', 'wcom1'); // b3 Communist (x=1, y=2)
      b[7][6] = p('king', 'black', 'bk1'); // g8 King (x=6, y=7)
      b[6][1] = p('queen', 'black', 'bq1'); // b7 Queen target (x=1, y=6)
      b[7][0] = p('rook', 'black', 'br1'); // a8 Rook (x=0, y=7)
      return b;
    })(),
    mentorPrompt: 'The Communist moves along orthogonal lines via alternating diagonal zigzags (distances ±2 or ±4). Advance your Communist from b3 (x=1, y=2) 4 strides up the b-file to capture the enemy Queen on b7 (x=1, y=6)!',
    hint: 'Move Communist from b3 (x=1, y=2) straight up the b-file to b7 (x=1, y=6) to capture the Queen.',
    mentorFailure: 'Hesitation is death! Strike the enemy Queen directly on b7 (x=1, y=6)!',
    mentorSuccess: 'Devastating strike! The Communist penetrated with zigzag velocity, captured the Queen, and retreated safely.',
    mistakeExplanations: {
      '1,2->1,4': 'Stopping on b5 leaves the Queen alive to counter-attack! Advance all 4 steps to b7!',
    },
    correctSteps: [
      {
        from: { x: 1, y: 2 },
        to: { x: 1, y: 6 },
        explanation: '1. Communist executes an orthogonal 4-square zigzag advance up the b-file, capturing the black Queen on b7 (x=1, y=6).',
        tacticalBreakdown: 'The Communist moves along orthogonal lines via alternating diagonal zigzags (distances ±2 or ±4). Striking b7 removes the most powerful enemy piece.',
        hint: 'Advance Communist from b3 (x=1, y=2) up the b-file to b7 (x=1, y=6) to capture the Queen.',
        mentorPrompt: 'Advance your Communist from b3 (x=1, y=2) 4 strides up the b-file to capture the enemy Queen on b7 (x=1, y=6)!',
        mentorReaction: 'approving',
        mentorCommentary: 'Formidable! Crafted pieces shatter ordinary chess assumptions. Master their geometry.',
      },
      {
        from: { x: 1, y: 6 },
        to: { x: 1, y: 4 },
        explanation: '2. Communist retreats 2 squares down the b-file to b5 (x=1, y=4) with a zigzag stride, preserving the decisive material gain.',
        tacticalBreakdown: 'Having eliminated the Queen, the Communist uses its ±2 zigzag jump to evade the Rook attack and anchor a dominant midboard position.',
        hint: 'Retreat Communist 2 squares down the b-file from b7 (x=1, y=6) to b5 (x=1, y=4).',
        mentorPrompt: 'The Black Rook seeks revenge on a6! Retreat your Communist from b7 (x=1, y=6) 2 squares down to b5 (x=1, y=4) to secure the victory!',
        mentorReaction: 'approving',
        mentorCommentary: 'Masterful retreat. The material advantage is locked and secure.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 0, y: 7 },
        to: { x: 0, y: 5 },
        commentary: 'Black Rook slides from a8 (x=0, y=7) down to a6 (x=0, y=5), attempting to flank your Communist!',
      },
    ],
  },
  {
    id: 'tsuchinoe_culling_1',
    rank: 'tsuchinoe',
    tool: 'culling',
    title: 'Bulwark Shell: Panda\'s Gorilla Core',
    subtitle: 'Surviving lethal strikes with the Bulwark shell passive',
    mode: 'culling',
    playerColor: 'white',
    cullingPlayerColor: 'white',
    initialBoard: createEmptyBoard(),
    cullingBoard: (() => {
      const b = createEmptyCullingKataBoard();
      b[1][8] = cp('culling_gojo', 'white', 'w_gojo');
      b[1][5] = cp('culling_panda', 'white', 'w_panda', false, { pandaCore: 'panda' }); // E1 Panda
      b[8][1] = cp('culling_sukuna', 'black', 'b_sukuna');
      b[4][5] = cp('culling_naoya', 'black', 'b_naoya'); // E5 Naoya
      return b;
    })(),
    mentorPrompt: 'Panda is White\'s Bulwark! He moves in Knight L-jumps. His Shell passive absorbs the first enemy capture attempt completely! Advance Panda from E1 to D3 to bait the enemy attack!',
    hint: 'Jump Panda like a Knight from E1 (x=5, y=1) to D3 (x=4, y=3).',
    mentorFailure: 'Panda moves with Knight L-jumps! Land on D3!',
    mentorSuccess: 'Solid Bastion! Panda anchored D3 and executed a decisive counter-hop behind enemy lines.',
    correctSteps: [
      {
        from: { x: 5, y: 1 },
        to: { x: 4, y: 3 },
        explanation: '1. Panda L-jumps to D3. His shell absorbs hits and unlocks Gorilla mode.',
        tacticalBreakdown: 'Panda Bulwark moves like a Knight. His Shell passive allows him to absorb the first enemy attack without being captured, granting supreme counter-attack potential.',
        hint: 'Jump Panda like a Knight from E1 (x=5, y=1) to D3 (x=4, y=3).',
        mentorPrompt: 'Jump Panda like a Knight from E1 to D3 to bait the enemy attack!',
        mentorReaction: 'approving',
        mentorCommentary: 'Bulwarks are your ultimate bait officers. Force enemies to waste turns cracking shells.',
      },
      {
        from: { x: 4, y: 3 },
        to: { x: 5, y: 5 },
        explanation: '2. Panda hops over defensive lines to seize the E5 high ground.',
        tacticalBreakdown: 'Bulwark units retain Knight hopping mobility, enabling them to leap over surrounding obstacles and dominate key infiltration squares.',
        hint: 'Jump Panda from D3 (x=4, y=3) to E5 (x=5, y=5).',
        mentorPrompt: 'Now leap Panda over the line from D3 to E5 to complete the Bulwark envelopment!',
        mentorReaction: 'approving',
        mentorCommentary: 'Gorilla strength demonstrated! The enemy sector is breached.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 5, y: 4 },
        to: { x: 5, y: 3 },
        commentary: 'Naoya charges down to E4, probing the defense.',
      },
    ],
  },

  // ==========================================
  // RANK 4: HINOE (Flame Strategist)
  // ==========================================
  {
    id: 'hinoe_tactics_1',
    rank: 'hinoe',
    tool: 'tactics',
    title: 'Blazing Decapitation: Rook Sacrifice',
    subtitle: 'Breaching the castled sanctuary with an unyielding sacrifice',
    mode: 'standard',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][4] = p('king', 'white', 'wk1'); // e1
      b[4][7] = p('rook', 'white', 'wr1');   // h5 Rook (x=7, y=4)
      b[2][5] = p('queen', 'white', 'wq1');  // f3 Queen (x=5, y=2)
      b[0][0] = p('bishop', 'white', 'wb1'); // a1 Bishop (x=0, y=0)
      b[7][6] = p('king', 'black', 'bk1');   // g8 King (x=6, y=7)
      b[6][6] = p('pawn', 'black', 'bp_g');  // g7 pawn (x=6, y=6)
      b[6][7] = p('pawn', 'black', 'bp_h');  // h7 pawn (x=7, y=6)
      return b;
    })(),
    mentorPrompt: 'The black King cowers behind g7 and h7. Sacrifice your Rook from h5 (x=7, y=4) to h7 (x=7, y=6) to shatter the fortress and open the kill line!',
    hint: 'Move Rook from h5 (x=7, y=4) to h7 (x=7, y=6) capturing the defending pawn with check.',
    mentorFailure: 'Do not fear losing wood! Without sacrifice, there is no decisive victory. Take h7 (x=7, y=6)!',
    mentorSuccess: 'Magnificent fury! The wall was turned to ash and Queen checkmate delivered.',
    correctSteps: [
      {
        from: { x: 7, y: 4 },
        to: { x: 7, y: 6 },
        explanation: '1. Rxh7+ rips open the h-file, forcing the black monarch into the crosshairs.',
        tacticalBreakdown: 'Sacrificing the Rook on h7 strips the Black King of his pawn cover and opens an immediate file for the Queen.',
        hint: 'Move Rook from h5 (x=7, y=4) to h7 (x=7, y=6) capturing the pawn with check.',
        mentorPrompt: 'Sacrifice your Rook from h5 (x=7, y=4) on h7 (x=7, y=6) to shatter the fortress and open the kill line!',
        mentorReaction: 'approving',
        mentorCommentary: 'A true swordsman knows when to discard the scabbard to deliver the lethal cut.',
      },
      {
        from: { x: 5, y: 2 },
        to: { x: 7, y: 4 },
        explanation: '2. Qh5# delivers unstoppable checkmate on the open h-file.',
        tacticalBreakdown: 'The Queen invasion from f3 (x=5, y=2) to h5 (x=7, y=4) leaves the exposed Black King with zero legal moves. Checkmate!',
        hint: 'Slide Queen from f3 (x=5, y=2) to h5 (x=7, y=4) for checkmate!',
        mentorPrompt: 'The King stepped out to capture the Rook on h7! Slide your Queen from f3 (x=5, y=2) to h5 (x=7, y=4) to deliver checkmate!',
        mentorReaction: 'approving',
        mentorCommentary: 'Perfection! The blazing sacrificial hunt is complete.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 6, y: 7 },
        to: { x: 7, y: 6 },
        commentary: 'Black captures 1... Kxh7 on h7 (x=7, y=6). Finish the monarch with Qh5#!',
      },
    ],
  },
  {
    id: 'hinoe_culling_1',
    rank: 'hinoe',
    tool: 'culling',
    title: 'Heavenly Restriction: Maki Zen\'in',
    subtitle: 'Bypassing Warden Ratio barriers with 2-square hopping mobility',
    mode: 'culling',
    playerColor: 'white',
    cullingPlayerColor: 'white',
    initialBoard: createEmptyBoard(),
    cullingBoard: (() => {
      const b = createEmptyCullingKataBoard();
      b[1][8] = cp('culling_gojo', 'white', 'w_gojo');
      b[1][3] = cp('culling_maki', 'white', 'w_maki'); // C1 Maki
      b[8][1] = cp('culling_sukuna', 'black', 'b_sukuna');
      b[3][3] = cp('culling_reggie', 'black', 'b_reggie'); // C3 Reggie (Warden)
      b[5][3] = cp('culling_uraume', 'black', 'b_uraume'); // C5 Uraume
      return b;
    })(),
    mentorPrompt: 'Maki Zen\'in carries Heavenly Restriction: she completely ignores Warden Ratio Fields! Furthermore, she can hop 2 squares orthogonally! Hop Maki from C1 directly to C3 to strike Reggie Star down!',
    hint: 'Move Maki from C1 (x=3, y=1) to C3 (x=3, y=3) capturing the enemy Warden.',
    mentorFailure: 'Maki does not fear the Ratio Field! Hop straight to C3!',
    mentorSuccess: 'ZERO CURSED ENERGY! Maki eliminated the Warden and claimed total corridor control.',
    correctSteps: [
      {
        from: { x: 3, y: 1 },
        to: { x: 3, y: 3 },
        explanation: '1. Maki hops 2 squares orthogonally, bypassing Warden aura to eliminate Reggie Star.',
        tacticalBreakdown: 'Maki Heavenly Restriction ignores all Warden Ratio Field penalties. Her 2-square orthogonal hops pierce straight through enemy aura fields.',
        hint: 'Move Maki from C1 (x=3, y=1) to C3 (x=3, y=3) capturing the enemy Warden.',
        mentorPrompt: 'Hop Maki from C1 directly to C3 to strike Reggie Star down!',
        mentorReaction: 'approving',
        mentorCommentary: 'Against defensive Warden players, Maki is your sharpest scalpel.',
      },
      {
        from: { x: 3, y: 3 },
        to: { x: 3, y: 5 },
        explanation: '2. Maki hops 2 squares forward to C5, establishing complete corridor dominance.',
        tacticalBreakdown: 'Unchecked by cursed barriers, Maki\'s physical dominance secures total corridor suppression.',
        hint: 'Hop Maki 2 squares forward from C3 (x=3, y=3) to C5 (x=3, y=5).',
        mentorPrompt: 'Keep advancing! Hop Maki 2 squares forward to C5 to claim absolute corridor control!',
        mentorReaction: 'approving',
        mentorCommentary: 'Supreme physical prowess! The central barrier has disintegrated.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 3, y: 5 },
        to: { x: 4, y: 5 },
        commentary: 'Uraume retreats weakly to D5.',
      },
    ],
  },

  // ==========================================
  // RANK 5: KINOE (Master of Trees)
  // ==========================================
  {
    id: 'kinoe_tactics_1',
    rank: 'kinoe',
    tool: 'tactics',
    title: 'Deflection of the Guard: Queen Decoy',
    subtitle: 'Luring the enemy defender away from checkmate',
    mode: 'standard',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][4] = p('king', 'white', 'wk1');
      b[6][3] = p('queen', 'white', 'wq1'); // d7 Queen
      b[0][3] = p('rook', 'white', 'wr1');  // d1 Rook
      b[7][7] = p('king', 'black', 'bk1');  // h8 King
      b[7][6] = p('rook', 'black', 'br1');  // g8 Rook
      b[6][7] = p('pawn', 'black', 'bp_h'); // h7 pawn
      return b;
    })(),
    mentorPrompt: 'Black\'s Rook guards the g8 square tenaciously. Sacrifice your Queen on d8 to deflect the enemy defense and deliver checkmate!',
    hint: 'Move Queen from d7 (x=3, y=6) to d8 (x=3, y=7) with check!',
    mentorFailure: 'Do not hesitate! Strike the back rank with Qd8+!',
    mentorSuccess: 'Sublime deflection! Black surrendered the back rank, and checkmate was cleanly delivered.',
    correctSteps: [
      {
        from: { x: 3, y: 6 },
        to: { x: 3, y: 7 },
        explanation: '1. Qd8+ forces Black Rook to capture on d8, vacating the g-file defense.',
        tacticalBreakdown: 'Qd8+ delivers check, forcing Black Rook to capture on d8 and abandon defense of the g-file and king perimeter.',
        hint: 'Move Queen from d7 (x=3, y=6) to d8 (x=3, y=7) with check!',
        mentorPrompt: 'Thrust your Queen to d8 with check to overload the defending enemy Rook!',
        mentorReaction: 'approving',
        mentorCommentary: 'When a piece guards two critical duties, overload it until it breaks.',
      },
      {
        from: { x: 3, y: 0 },
        to: { x: 3, y: 7 },
        explanation: '2. Rxd8# recaptures on the back rank, delivering checkmate.',
        tacticalBreakdown: 'With Black King completely trapped on h8 and all defenders eliminated, the Rook recapture delivers absolute checkmate.',
        hint: 'Recapture on d8 (x=3, y=7) with your Rook from d1 (x=3, y=0) for checkmate!',
        mentorPrompt: 'The defender took the bait! Recapture on d8 with your Rook for checkmate!',
        mentorReaction: 'approving',
        mentorCommentary: 'Flawless execution! The overloaded piece succumbed completely.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 6, y: 7 },
        to: { x: 3, y: 7 },
        commentary: 'Black Rook captures 1... Rxd8. Deliver checkmate with Rxd8#!',
      },
    ],
  },
  {
    id: 'kinoe_culling_1',
    rank: 'kinoe',
    tool: 'culling',
    title: 'Fever Jackpot: Kinji Hakari',
    subtitle: 'Capturing and triggering the bonus repositioning step',
    mode: 'culling',
    playerColor: 'white',
    cullingPlayerColor: 'white',
    initialBoard: createEmptyBoard(),
    cullingBoard: (() => {
      const b = createEmptyCullingKataBoard();
      b[1][8] = cp('culling_gojo', 'white', 'w_gojo');
      b[1][2] = cp('culling_hakari', 'white', 'w_hakari'); // B1 Hakari
      b[3][4] = cp('culling_pawn', 'black', 'b_pawn_d3');  // D3 pawn
      b[6][6] = cp('culling_pawn', 'black', 'b_pawn_f5');  // F5 pawn
      b[8][1] = cp('culling_sukuna', 'black', 'b_sukuna');
      return b;
    })(),
    mentorPrompt: 'Kinji Hakari is White\'s Rusher! He slides up to 2 squares diagonally. Upon capture, his Jackpot triggers an instant bonus safe repositioning step! Slide Hakari diagonally from B1 to D3 to capture the cursed pawn!',
    hint: 'Move Hakari from B1 (x=2, y=1) to D3 (x=4, y=3) capturing the pawn.',
    mentorFailure: 'Hakari slides up to 2 diagonally! Aim your cut directly at D3!',
    mentorSuccess: 'JACKPOT ROLLING! Hakari triggered his bonus step and wiped both enemy outposts cleanly!',
    correctSteps: [
      {
        from: { x: 2, y: 1 },
        to: { x: 4, y: 3 },
        explanation: '1. Hakari slides 2 diagonal squares to capture D3, triggering Rusher Jackpot bonus.',
        tacticalBreakdown: 'Hakari Rusher Jackpot triggers an immediate extra repositioning turn upon making any capture, granting fluid tactical momentum.',
        hint: 'Move Hakari from B1 (x=2, y=1) to D3 (x=4, y=3) capturing the pawn.',
        mentorPrompt: 'Slide Hakari diagonally from B1 to D3 to capture the cursed pawn and roll the Jackpot!',
        mentorReaction: 'approving',
        mentorCommentary: 'In high-level Culling matches, Hakari\'s extra step breaks enemy pincers completely.',
      },
      {
        from: { x: 4, y: 3 },
        to: { x: 5, y: 4 },
        explanation: '2. Hakari capitalizes on Jackpot momentum, taking a 1-square safe bonus step to E4 (x=5, y=4).',
        tacticalBreakdown: 'Executing the Jackpot 1-square bonus step repositions Hakari to an unattacked outpost on E4.',
        hint: 'Step Hakari 1 square from D3 (x=4, y=3) to E4 (x=5, y=4).',
        mentorPrompt: 'The Jackpot fever is alive! Take Hakari\'s 1-square Jackpot bonus step to E4 (x=5, y=4)!',
        mentorReaction: 'approving',
        mentorCommentary: 'Continuous Jackpot flow! Hakari secures dominant position.',
      },
    ],
    opponentResponses: [],
  },

  // ==========================================
  // RANK 6: HASHIRA (Supreme Grandmaster)
  // ==========================================
  {
    id: 'hashira_tactics_1',
    rank: 'hashira',
    tool: 'tactics',
    title: 'Pillar Form: Absolute Smothered Mate',
    subtitle: 'Grandmaster lethal combination on a crowded 14-piece battlefield',
    mode: 'standard',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      // White pieces
      b[0][6] = p('king', 'white', 'wk1');   // g1 King (x=6, y=0)
      b[6][5] = p('queen', 'white', 'wq1');  // f7 Queen (x=5, y=6)
      b[4][5] = p('knight', 'white', 'wn1'); // f5 Knight (x=5, y=4)
      b[0][4] = p('rook', 'white', 'wr1');   // e1 Rook (x=4, y=0)
      b[3][2] = p('bishop', 'white', 'wb1'); // c4 Bishop (x=2, y=3)
      b[1][0] = p('pawn', 'white', 'wp_a');  // a2 pawn
      b[1][1] = p('pawn', 'white', 'wp_b');  // b2 pawn
      b[2][2] = p('pawn', 'white', 'wp_c');  // c3 pawn
      b[1][5] = p('pawn', 'white', 'wp_f');  // f2 pawn
      b[1][6] = p('pawn', 'white', 'wp_g');  // g2 pawn
      b[1][7] = p('pawn', 'white', 'wp_h');  // h2 pawn
      // Black pieces
      b[7][7] = p('king', 'black', 'bk1');   // h8 King (x=7, y=7)
      b[7][5] = p('rook', 'black', 'br1');   // f8 Rook (x=5, y=7)
      b[7][3] = p('queen', 'black', 'bq1');  // d8 Queen (x=3, y=7)
      b[6][7] = p('pawn', 'black', 'bp_h');  // h7 pawn (x=7, y=6)
      b[6][6] = p('pawn', 'black', 'bp_g');  // g7 pawn (x=6, y=6)
      b[6][0] = p('pawn', 'black', 'bp_a');  // a7 pawn
      b[6][1] = p('pawn', 'black', 'bp_b');  // b7 pawn
      return b;
    })(),
    mentorPrompt: 'Pupil! You stand before the Hashira trial. On this crowded battlefield, sacrifice your Queen from f7 (x=5, y=6) to g8 (x=6, y=7) with check to force the enemy Rook to smother its own King!',
    hint: 'Play Qg8+ (move Queen from f7 [x=5, y=6] to g8 [x=6, y=7]) with check!',
    mentorFailure: 'Unacceptable! A Hashira does not falter in sight of checkmate! Strike g8 with your Queen!',
    mentorSuccess: 'MAGNIFICENT! You executed the eternal Pillar technique. Smothered checkmate is complete.',
    correctSteps: [
      {
        from: { x: 5, y: 6 },
        to: { x: 6, y: 7 },
        explanation: '1. Qg8+ forces 1... Rxg8, completely suffocating the black monarch on h8.',
        tacticalBreakdown: 'A legendary smothered mate sequence. Sacrificing the Queen from f7 to g8 forces the Black Rook on f8 to capture on g8, blocking the King\'s only escape square.',
        hint: 'Play Qg8+ (move Queen from f7 [x=5, y=6] to g8 [x=6, y=7]) with check!',
        mentorPrompt: 'Deliver the legendary Queen sacrifice from f7 (x=5, y=6) to g8 (x=6, y=7) with check!',
        mentorReaction: 'approving',
        mentorCommentary: 'Perfection. The enemy gave up their life to their own fortress.',
      },
      {
        from: { x: 5, y: 4 },
        to: { x: 7, y: 5 },
        explanation: '2. Nh6# delivers eternal smothered checkmate.',
        tacticalBreakdown: 'Nh6# leaps from f5 (x=5, y=4) to h6 (x=7, y=5), delivering checkmate to the King smothered on h8 by his own Rook on g8 and pawn on h7.',
        hint: 'Leap your Knight from f5 (x=5, y=4) to h6 (x=7, y=5) for smothered mate!',
        mentorPrompt: 'The trap is operating! Leap your Knight from f5 (x=5, y=4) to h6 (x=7, y=5) to deliver smothered checkmate!',
        mentorReaction: 'approving',
        mentorCommentary: 'Supreme Pillar mastery! The ultimate smothered checkmate is accomplished.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 5, y: 7 },
        to: { x: 6, y: 7 },
        commentary: 'Black is forced to capture 1... Rxg8 on g8 (x=6, y=7). Finish with Nf7#!',
      },
    ],
  },
  {
    id: 'hashira_culling_1',
    rank: 'hashira',
    tool: 'culling',
    title: 'Grandmaster Culling Showdown: Vanguard Blitz',
    subtitle: 'Coordinating White\'s roster on a crowded 12-unit cross board',
    mode: 'culling',
    playerColor: 'white',
    cullingPlayerColor: 'white',
    initialBoard: createEmptyBoard(),
    cullingBoard: (() => {
      const b = createEmptyCullingKataBoard();
      // White team
      b[1][8] = cp('culling_gojo', 'white', 'w_gojo'); // H1 Gojo (8,1)
      b[1][7] = cp('culling_yuji', 'white', 'w_yuji'); // G1 Yuji (7,1)
      b[1][6] = cp('culling_mechamaru', 'white', 'w_mechamaru'); // F1 Mechamaru (6,1)
      b[3][4] = cp('culling_nanami', 'white', 'w_nanami'); // D3 Nanami (4,3)
      b[2][3] = cp('culling_maki', 'white', 'w_maki'); // C2 Maki (3,2)
      b[2][2] = cp('culling_hakari', 'white', 'w_hakari'); // B2 Hakari (2,2)
      // Black team
      b[8][1] = cp('culling_sukuna', 'black', 'b_sukuna'); // A8 Sukuna (1,8)
      b[8][2] = cp('culling_kenjaku', 'black', 'b_kenjaku'); // B8 Kenjaku (2,8)
      b[8][3] = cp('culling_uraume', 'black', 'b_uraume'); // C8 Uraume (3,8)
      b[7][4] = cp('culling_yorozu', 'black', 'b_yorozu'); // D7 Yorozu (4,7)
      b[4][7] = cp('culling_pawn', 'black', 'b_pawn_g4'); // G4 Cursed Pawn (7,4)
      return b;
    })(),
    mentorPrompt: 'Pupil of the Supreme Pillar! On this crowded Culling battlefield, command your Vanguard (Yuji Itadori) at G1 (x=7, y=1) to slide 3 squares up the G-file to G4 (x=7, y=4) to shatter Black\'s outpost pawn!',
    hint: 'Move Vanguard Yuji from G1 (x=7, y=1) to G4 (x=7, y=4) to capture the pawn.',
    mentorFailure: 'Do not hesitate! Charge Vanguard Yuji to G4 (x=7, y=4)!',
    mentorSuccess: 'DOMAIN MASTERY ACHIEVED! Vanguard momentum followed by Sovereign Domain Step claims complete strategic victory!',
    correctSteps: [
      {
        from: { x: 7, y: 1 },
        to: { x: 7, y: 4 },
        explanation: '1. Vanguard Yuji slides 3 squares to G4 (x=7, y=4), smashing Black\'s outpost pawn.',
        tacticalBreakdown: 'Advancing Vanguard Yuji to G4 clears the right flank and creates a forward anchor threatening Sukuna\'s sector.',
        hint: 'Slide Vanguard Yuji from G1 (x=7, y=1) to G4 (x=7, y=4).',
        mentorPrompt: 'Slide Vanguard Yuji from G1 (x=7, y=1) to G4 (x=7, y=4) to smash the outpost pawn!',
        mentorReaction: 'approving',
        mentorCommentary: 'Vanguard strike landed! Now unleash Sovereign Gojo\'s Domain Step!',
      },
      {
        from: { x: 8, y: 1 },
        to: { x: 6, y: 3 },
        explanation: '2. Sovereign Gojo executes Domain Step from H1 (x=8, y=1) to F3 (x=6, y=3), anchoring central dominion.',
        tacticalBreakdown: 'Gojo Domain Step enables a 2-square diagonal jump over pieces, establishing supreme spatial control on F3.',
        hint: 'Leap Sovereign Gojo from H1 (x=8, y=1) to F3 (x=6, y=3) using Domain Step.',
        mentorPrompt: 'Leap Sovereign Gojo from H1 (x=8, y=1) to F3 (x=6, y=3) utilizing Domain Step!',
        mentorReaction: 'approving',
        mentorCommentary: 'You have conquered the Culling Game trial. The Chess Hashira acknowledges your supreme mastery.',
        cullingActionType: 'teleport',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 2, y: 8 },
        to: { x: 2, y: 6 },
        commentary: 'Kenjaku shifts his barrier stance down to B6 (x=2, y=6).',
      },
    ],
  },
  // ==========================================
  // EXPANDED MULTI-STEP LESSONS & CHALLENGES
  // ==========================================
  {
    id: 'mizunoto_opening_3',
    rank: 'mizunoto',
    tool: 'opening',
    title: 'Third Form: Classical Harmonious Triad',
    subtitle: 'Executing a 3-step fundamental development against enemy responses',
    mode: 'standard',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][4] = p('king', 'white', 'wk1');
      b[0][3] = p('queen', 'white', 'wq1');
      b[0][2] = p('bishop', 'white', 'wb_c');
      b[0][5] = p('bishop', 'white', 'wb_f');
      b[0][1] = p('knight', 'white', 'wn_b');
      b[0][6] = p('knight', 'white', 'wn_g');
      for (let x = 0; x < 8; x++) b[1][x] = p('pawn', 'white', `wp_${x}`);
      b[7][4] = p('king', 'black', 'bk1');
      b[7][3] = p('queen', 'black', 'bq1');
      b[7][1] = p('knight', 'black', 'bn_b');
      b[7][6] = p('knight', 'black', 'bn_g');
      for (let x = 0; x < 8; x++) b[6][x] = p('pawn', 'black', `bp_${x}`);
      return b;
    })(),
    mentorPrompt: 'Pupil! Real martial engagements are conversations of blades. You must advance your center, deploy your steed, and position your bishop across three harmonious strides!',
    hint: 'Step 1: Advance e2-pawn to e4. Then watch the enemy reply and develop Nf3 and Bc4.',
    mentorFailure: 'Lacking rhythm! The triad development requires e4, then Nf3, then Bc4!',
    mentorSuccess: 'EXEMPLARY HARMONY! You completed the Classical Triad. Center commanded, officers mobilized, monarch castling ready.',
    mistakeExplanations: {
      '3,1->3,3': 'Advance e4 first to liberate the King\'s Bishop on f1!',
      '6,0->5,2': 'Stake center claim with e4 before deploying the knight!',
    },
    correctSteps: [
      {
        from: { x: 4, y: 1 },
        to: { x: 4, y: 3 },
        explanation: '1. e4 stakes claim to the high ground and frees diagonals.',
        tacticalBreakdown: 'Advancing the King\'s pawn two squares immediately establishes strong central presence, controls d5/f5, and opens diagonals for both Queen and Bishop.',
        hint: 'Push White e2-pawn (x=4, y=1) forward two squares to e4 (x=4, y=3).',
        mentorPrompt: 'Step 1: Advance your King\'s Pawn two strides forward to e4 to claim the central high ground!',
        mentorReaction: 'approving',
        mentorCommentary: 'Strong. The opponent mirrors with 1... e5. Now bring out your knight to pressure e5!',
      },
      {
        from: { x: 6, y: 0 },
        to: { x: 5, y: 2 },
        explanation: '2. Nf3 develops with tempo, attacking the e5 pawn.',
        tacticalBreakdown: '2. Nf3 develops a minor piece with tempo, directly threatening Black\'s e5 pawn while preparing king castling.',
        hint: 'Leap your Knight from g1 (x=6, y=0) to f3 (x=5, y=2).',
        mentorPrompt: 'Step 2: Deploy your Knight to f3 with tempo to attack Black\'s e5 outpost!',
        mentorReaction: 'approving',
        mentorCommentary: 'Black defended with 2... Nc6. Now unleash the Bishop to the active c4 outpost!',
      },
      {
        from: { x: 5, y: 0 },
        to: { x: 2, y: 3 },
        explanation: '3. Bc4 aims directly at the sensitive f7 vulnerability.',
        tacticalBreakdown: '3. Bc4 targets the f7 square, which is defended only by Black\'s King. This completes the classical Italian Game triad.',
        hint: 'Develop your Bishop from f1 (x=5, y=0) to c4 (x=2, y=3).',
        mentorPrompt: 'Step 3: Deploy your light-squared Bishop to c4 to complete the triad and pressure f7!',
        mentorReaction: 'approving',
        mentorCommentary: 'Perfection. The Italian Game opening triad is firmly established.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 4, y: 6 },
        to: { x: 4, y: 4 },
        commentary: 'Enemy plays 1... e5 to dispute the center. Strike e5 with your Knight on f3!',
      },
      {
        triggerStepIndex: 1,
        from: { x: 1, y: 7 },
        to: { x: 2, y: 5 },
        commentary: 'Enemy plays 2... Nc6 to guard e5. Now deploy your Bishop to c4!',
      },
    ],
  },
  {
    id: 'kanoe_tactics_2',
    rank: 'kanoe',
    tool: 'tactics',
    title: 'Rook Elevator: Lethal Triple Strike',
    subtitle: 'Coordinating Rook and Queen to breach the enemy castled shelter',
    mode: 'standard',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][6] = p('king', 'white', 'wk1');
      b[2][5] = p('rook', 'white', 'wr1');   // f3 Rook
      b[4][7] = p('queen', 'white', 'wq1');  // h5 Queen
      b[7][6] = p('king', 'black', 'bk1');   // g8 King
      b[6][5] = p('pawn', 'black', 'bp_f');  // f7 pawn
      b[6][6] = p('pawn', 'black', 'bp_g');  // g7 pawn
      b[6][7] = p('pawn', 'black', 'bp_h');  // h7 pawn
      return b;
    })(),
    mentorPrompt: 'The black King feels safe behind his pawns. Elevate your Rook across the 3rd rank to h3 to double your battery against h7!',
    hint: 'Step 1: Move Rook from f3 (x=5, y=2) to h3 (x=7, y=2).',
    mentorFailure: 'Elevate the Rook to h3 to create the unstoppable battery on the h-file!',
    mentorSuccess: 'CHECKMATE! The Rook elevator and Queen sacrifice breached the fortress completely.',
    correctSteps: [
      {
        from: { x: 5, y: 2 },
        to: { x: 7, y: 2 },
        explanation: '1. Rh3 creates an overwhelming battery with the Queen against h7.',
        tacticalBreakdown: 'The Rook elevator slides across the 3rd rank behind your pawns to form a doubled heavy-piece battery along the h-file aimed directly at Black\'s monarch.',
        hint: 'Move Rook from f3 (x=5, y=2) to h3 (x=7, y=2).',
        mentorPrompt: 'Step 1: Elevate your Rook across the rank to h3 to forge an unstoppable battery!',
        mentorReaction: 'approving',
        mentorCommentary: 'Black is terrified and pushes h6 to create breathing space. Now strike h6 with your Queen!',
      },
      {
        from: { x: 7, y: 4 },
        to: { x: 7, y: 5 },
        explanation: '2. Qxh6! sac forces open the g-file and king shelter.',
        tacticalBreakdown: 'Sacrificing the Queen on h6 eliminates Black\'s barricade pawn and forces Black to open the h-file with gxh6, leaving the King defenceless.',
        hint: 'Capture the pawn on h6 (x=7, y=5) using your Queen from h5 (x=7, y=4)!',
        mentorPrompt: 'Step 2: Shatter the shield! Sacrifice your Queen on h6 to blow the shelter open!',
        mentorReaction: 'approving',
        mentorCommentary: 'Black takes the Queen with gxh6. Now deliver checkmate with your Rook on h6!',
      },
      {
        from: { x: 7, y: 2 },
        to: { x: 7, y: 5 },
        explanation: '3. Rxh6# delivers clean checkmate as the g8 King has zero escape.',
        tacticalBreakdown: 'Recapturing on h6 with the Rook delivers absolute checkmate. Black King is sealed behind f7 and trapped against the board corner.',
        hint: 'Move Rook from h3 (x=7, y=2) to h6 (x=7, y=5) to deliver checkmate!',
        mentorPrompt: 'Step 3: Deliver the coup de grâce: move your Rook to h6 for checkmate!',
        mentorReaction: 'approving',
        mentorCommentary: 'Magnificent tactical mastery! The elevator battery shattered the shield.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 7, y: 6 },
        to: { x: 7, y: 5 },
        commentary: 'Black plays 1... h6 trying to block mate. Shatter the pawn with your Queen on h6!',
      },
      {
        triggerStepIndex: 1,
        from: { x: 6, y: 6 },
        to: { x: 7, y: 5 },
        commentary: 'Black captures gxh6. Finish him with Rxh6# checkmate!',
      },
    ],
  },
  {
    id: 'tsuchinoe_opening_2',
    rank: 'tsuchinoe',
    tool: 'opening',
    title: 'Bastion Citadel: King\'s Fianchetto',
    subtitle: 'Constructing the unbreakable long-diagonal sniper fortress',
    mode: 'standard',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][4] = p('king', 'white', 'wk1');
      b[0][5] = p('bishop', 'white', 'wb_f'); // f1 Bishop
      b[0][6] = p('knight', 'white', 'wn_g'); // g1 Knight
      b[1][6] = p('pawn', 'white', 'wp_g');   // g2 pawn
      b[1][4] = p('pawn', 'white', 'wp_e');   // e2 pawn
      b[1][3] = p('pawn', 'white', 'wp_d');   // d2 pawn
      b[7][4] = p('king', 'black', 'bk1');
      b[6][3] = p('pawn', 'black', 'bp_d');   // d7 pawn
      b[6][2] = p('pawn', 'black', 'bp_c');   // c7 pawn
      return b;
    })(),
    mentorPrompt: 'The Earth Bastion values impenetrable structures. Construct the King\'s Fianchetto: advance g3, place the Bishop on g2, and anchor with Nf3!',
    hint: 'Step 1: Move g2 pawn to g3 (x=6, y=2).',
    mentorFailure: 'The fianchetto requires opening the g2 pocket! Play g3 first!',
    mentorSuccess: 'IMPREGNABLE CITADEL! The Bishop on g2 snipes the entire h1-a8 long diagonal.',
    correctSteps: [
      {
        from: { x: 6, y: 1 },
        to: { x: 6, y: 2 },
        explanation: '1. g3 prepares the fianchetto house for the Bishop.',
        tacticalBreakdown: '1. g3 creates a secure pocket on g2 while keeping pawn chains intact and preparing long-diagonal domination.',
        hint: 'Push g2 pawn (x=6, y=1) forward to g3 (x=6, y=2).',
        mentorPrompt: 'Step 1: Push g3 to hollow out the pocket for your King\'s Bishop!',
        mentorReaction: 'approving',
        mentorCommentary: 'Black stakes center claim with d5. Now place your Bishop in the pocket on g2!',
      },
      {
        from: { x: 5, y: 0 },
        to: { x: 6, y: 1 },
        explanation: '2. Bg2 commands the longest diagonal on the chessboard.',
        tacticalBreakdown: 'Stationing the Bishop on g2 gives it maximum scope across the entire h1-a8 diagonal, pressuring Black\'s queenside from safety.',
        hint: 'Move Bishop from f1 (x=5, y=0) into the pocket at g2 (x=6, y=1).',
        mentorPrompt: 'Step 2: Place your Bishop on g2 to command the long diagonal!',
        mentorReaction: 'approving',
        mentorCommentary: 'Black plays c5. Anchor the position by leaping your Knight to f3!',
      },
      {
        from: { x: 6, y: 0 },
        to: { x: 5, y: 2 },
        explanation: '3. Nf3 completes the King-side bastion, preparing safe castling.',
        tacticalBreakdown: '3. Nf3 covers d4 and e5 while clearing the path for King-side castling, cementing an impenetrable fortress.',
        hint: 'Leap Knight from g1 (x=6, y=0) to f3 (x=5, y=2).',
        mentorPrompt: 'Step 3: Deploy your Knight to f3 to seal the citadel and prepare castling!',
        mentorReaction: 'approving',
        mentorCommentary: 'Superb! The fianchetto fortress stands unyielding.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 3, y: 6 },
        to: { x: 3, y: 4 },
        commentary: 'Black plays 1... d5. Place your Bishop on g2!',
      },
      {
        triggerStepIndex: 1,
        from: { x: 2, y: 6 },
        to: { x: 2, y: 4 },
        commentary: 'Black plays 2... c5. Complete the setup by developing Nf3!',
      },
    ],
  },
  {
    id: 'hinoe_tactics_2',
    rank: 'hinoe',
    tool: 'tactics',
    title: 'The Greek Gift Sacrificial Hunt',
    subtitle: 'Classic Bishop sacrifice on h7 shattering the enemy castled King',
    mode: 'standard',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][6] = p('king', 'white', 'wk1');   // g1 King (x=6, y=0)
      b[0][3] = p('queen', 'white', 'wq1');  // d1 Queen (x=3, y=0)
      b[2][3] = p('bishop', 'white', 'wb1'); // d3 Bishop (x=3, y=2)
      b[2][5] = p('knight', 'white', 'wn1'); // f3 Knight (x=5, y=2)
      b[4][4] = p('pawn', 'white', 'wp_e');  // e5 pawn (x=4, y=4)
      b[7][6] = p('king', 'black', 'bk1');   // g8 King (x=6, y=7)
      b[6][5] = p('pawn', 'black', 'bp_f');  // f7 pawn (x=5, y=6)
      b[6][6] = p('pawn', 'black', 'bp_g');  // g7 pawn (x=6, y=6)
      b[6][7] = p('pawn', 'black', 'bp_h');  // h7 pawn (x=7, y=6)
      return b;
    })(),
    mentorPrompt: 'Pupil of the Flame! The enemy castled King is vulnerable on h7. Execute the eternal Greek Gift: sacrifice your Bishop on h7 with check!',
    hint: 'Step 1: Move Bishop from d3 (x=3, y=2) to h7 (x=7, y=6) with check.',
    mentorFailure: 'Do not hesitate! Strike h7 with Bxh7+!',
    mentorSuccess: 'LETHAL CONVERGENCE! The enemy King is flushed into the open. The Queen and Knight battery seals the win.',
    correctSteps: [
      {
        from: { x: 3, y: 2 },
        to: { x: 7, y: 6 },
        explanation: '1. Bxh7+! The Greek Gift sacrifice strips the King of his shield.',
        tacticalBreakdown: 'The Greek Gift sacrifice on h7 draws the enemy monarch into the open where it cannot find refuge from Knight and Queen follow-up checks.',
        hint: 'Capture the pawn on h7 (x=7, y=6) with your Bishop from d3 (x=3, y=2) with check!',
        mentorPrompt: 'Step 1: Sacrifice your Bishop on h7 with check to strip Black\'s monarch of his shield!',
        mentorReaction: 'approving',
        mentorCommentary: 'Black captures with Kxh7. Now leap your Knight forward to g5 with check!',
      },
      {
        from: { x: 5, y: 2 },
        to: { x: 6, y: 4 },
        explanation: '2. Ng5+ forces the King back while clearing d1-h5 for the Queen.',
        tacticalBreakdown: '2. Ng5+ delivers check with tempo and clears the d1-h5 diagonal, setting up an unavoidable mating net with the Queen.',
        hint: 'Leap Knight from f3 (x=5, y=2) to g5 (x=6, y=4) with check!',
        mentorPrompt: 'Step 2: Leap your Knight to g5 with check to force the King into the corner!',
        mentorReaction: 'approving',
        mentorCommentary: 'Black retreats King to g8. Now slide your Queen to h5 to threaten unstoppable mate on h7!',
      },
      {
        from: { x: 3, y: 0 },
        to: { x: 7, y: 4 },
        explanation: '3. Qh5 delivers a terminal mating threat on h7 and f7.',
        tacticalBreakdown: 'Deploying the Queen to h5 creates an unstoppable battery with the Knight on g5. Black cannot defend both h7 and f7 simultaneously.',
        hint: 'Slide Queen from d1 (x=3, y=0) to h5 (x=7, y=4) to threaten mate!',
        mentorPrompt: 'Step 3: Launch your Queen to h5 to seal the inescapable mating net!',
        mentorReaction: 'approving',
        mentorCommentary: 'Masterful! A classic tactical combination recognized by grandmasters worldwide.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 6, y: 7 },
        to: { x: 7, y: 6 },
        commentary: 'Black captures Kxh7. Follow up immediately with Ng5+ check!',
      },
      {
        triggerStepIndex: 1,
        from: { x: 7, y: 6 },
        to: { x: 6, y: 7 },
        commentary: 'Black retreats to g8. Now launch Queen to h5!',
      },
    ],
  },
  {
    id: 'kinoe_culling_2',
    rank: 'kinoe',
    tool: 'culling',
    title: 'Artillery Pincer: Mechamaru & Nanami',
    subtitle: 'Combining long-range artillery with Warden aura suppression',
    mode: 'culling',
    playerColor: 'white',
    cullingPlayerColor: 'white',
    initialBoard: createEmptyBoard(),
    cullingBoard: (() => {
      const b = createEmptyCullingKataBoard();
      b[1][8] = cp('culling_gojo', 'white', 'w_gojo');
      b[1][5] = cp('culling_mechamaru', 'white', 'w_mecha'); // E1 Mechamaru (5,1)
      b[2][4] = cp('culling_nanami', 'white', 'w_nanami');   // D2 Nanami (4,2)
      b[3][5] = cp('culling_uraume', 'black', 'b_uraume');   // E3 Uraume (5,3)
      b[8][1] = cp('culling_sukuna', 'black', 'b_sukuna');   // A8 Sukuna (1,8)
      return b;
    })(),
    mentorPrompt: 'Ultimate Mechamaru possesses Long-Range Artillery: he can blast any straight-line square at distance 2! Fire Mechamaru\'s cannon straight at Uraume on E3 (x=5, y=3)!',
    hint: 'Select Mechamaru at E1 (x=5, y=1) and click E3 (x=5, y=3) to unleash the artillery shot.',
    mentorFailure: 'Aim straight down the E-file! Blast Uraume at E3 (x=5, y=3)!',
    mentorSuccess: 'DIRECT ARTILLERY HIT! Mechamaru vaporized the officer, and Nanami clamped the forward sector.',
    correctSteps: [
      {
        from: { x: 5, y: 1 },
        to: { x: 5, y: 3 },
        explanation: '1. Mechamaru uses Ranged Strike to eliminate Uraume along the clear E-file at distance 2.',
        tacticalBreakdown: 'Mechamaru Artillery strike snipes high-value enemy officers at distance 2 without moving his chassis, preserving defensive formation.',
        hint: 'Fire Mechamaru from E1 (x=5, y=1) to blast Uraume on E3 (x=5, y=3).',
        mentorPrompt: 'Step 1: Fire Mechamaru\'s long-range cannon along the E-file to eliminate Uraume on E3 (x=5, y=3)!',
        mentorReaction: 'approving',
        mentorCommentary: 'Direct hit! Now advance Warden Nanami from D2 (x=4, y=2) to D4 (x=4, y=4) to seal the central perimeter.',
        cullingActionType: 'shoot',
      },
      {
        from: { x: 4, y: 2 },
        to: { x: 4, y: 4 },
        explanation: '2. Warden Nanami advances from D2 (x=4, y=2) to D4 (x=4, y=4), establishing his 7:3 Ratio Field across the midboard.',
        tacticalBreakdown: 'Following the artillery strike, Warden Nanami steps up to D4 to establish an impenetrable Warden containment aura across all central files.',
        hint: 'Move Warden Nanami from D2 (x=4, y=2) forward to D4 (x=4, y=4).',
        mentorPrompt: 'Step 2: Advance Warden Nanami from D2 (x=4, y=2) to D4 (x=4, y=4) to anchor the central containment field!',
        mentorReaction: 'approving',
        mentorCommentary: 'Superb coordination! Artillery firepower followed by Warden spatial lockdown.',
      },
    ],
    opponentResponses: [
      {
        triggerStepIndex: 0,
        from: { x: 1, y: 8 },
        to: { x: 2, y: 8 },
        commentary: 'Sukuna attempts to reposition to B8.',
      },
    ],
  },
];

// -------------------------------------------------------------
// THEORY SCROLLS FOR THEORY LIBRARY
// -------------------------------------------------------------
export const THEORY_SCROLLS: TheoryScroll[] = [
  {
    id: 'scroll_center_principle',
    rank: 'mizunoto',
    title: 'Scroll of the Four Central Pillars',
    category: 'Fundamentals',
    readingTimeMin: 2,
    summary: 'Why controlling e4, d4, e5, and d5 dictates every tactical engagement.',
    sections: [
      {
        heading: 'The Mountain High Ground',
        body: 'In traditional combat, the army commanding the hilltop can strike in every direction with gravity assisting their blows. In chess, the center squares (e4, d4, e5, d5) represent that hilltop. Pieces occupying or aiming at the center exert twice the board influence compared to pieces stationed on the flanks.',
        highlightBox: 'Central control gives Knights 8 squares of influence versus just 2 or 4 on the board edge.',
      },
    ],
  },
  {
    id: 'scroll_prince_tactics',
    rank: 'kanoe',
    title: 'The Prince\'s Lineage and Dual Form',
    category: 'Royal Tactics',
    readingTimeMin: 3,
    summary: 'How to utilize the Prince as both knight-leaper, royal protector, and heir to the crown.',
    sections: [
      {
        heading: 'Ascension Mechanics',
        body: 'The Prince possesses royal blood. If the King is captured while a Prince lives, the Prince ascends to Monarch and the battle continues without loss. Furthermore, the Prince combines the 1-step versatility of a King with the leaping fangs of a Knight.',
        highlightBox: 'Never leave the Prince passive. Position him within 2 squares of the King for maximum defensive cohesion.',
      },
    ],
  },
  {
    id: 'scroll_culling_geometry',
    rank: 'tsuchinoe',
    title: 'Geometry of the 88-Square Jujutsu Cross',
    category: 'Culling Mechanics',
    readingTimeMin: 4,
    summary: 'Navigating the 12 deadzone corners and utilizing boundary walls as tactical shields.',
    sections: [
      {
        heading: 'The Cross Boundary Trap',
        body: 'The Culling Game board is not a standard 64-square box. It features 88 playable squares with 4 outer void corners. Pushing an enemy Sovereign toward columns A or H, or ranks 0 or 9, restricts their flight options to a mere 3 directions.',
        highlightBox: 'Satoru Gojo and Ryomen Sukuna can use Domain Step to leap over barriers, but cannot land on void squares.',
      },
    ],
  },
];

// -------------------------------------------------------------
// LOCAL STORAGE PROGRESS PERSISTENCE
// -------------------------------------------------------------
const STORAGE_KEY = 'mugen_chess_hashira_progress_v2';

export function loadHashiraProgress(): HashiraUserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        selectedRank: parsed.selectedRank || 'mizunoto',
        selectedTrainerId: parsed.selectedTrainerId || 'thukuna',
        completedKataIds: parsed.completedKataIds || [],
        practiceWinsByRank: parsed.practiceWinsByRank || {
          mizunoto: 0,
          kanoe: 0,
          tsuchinoe: 0,
          hinoe: 0,
          kinoe: 0,
          hashira: 0,
        },
        practiceLossesByRank: parsed.practiceLossesByRank || {
          mizunoto: 0,
          kanoe: 0,
          tsuchinoe: 0,
          hinoe: 0,
          kinoe: 0,
          hashira: 0,
        },
        unlockedScrollIds: parsed.unlockedScrollIds || ['scroll_center_principle'],
      };
    }
  } catch {
    // fallback
  }

  return {
    selectedRank: 'mizunoto',
    selectedTrainerId: 'thukuna',
    completedKataIds: [],
    practiceWinsByRank: {
      mizunoto: 0,
      kanoe: 0,
      tsuchinoe: 0,
      hinoe: 0,
      kinoe: 0,
      hashira: 0,
    },
    practiceLossesByRank: {
      mizunoto: 0,
      kanoe: 0,
      tsuchinoe: 0,
      hinoe: 0,
      kinoe: 0,
      hashira: 0,
    },
    unlockedScrollIds: ['scroll_center_principle'],
  };
}

export function saveHashiraProgress(progress: HashiraUserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}
