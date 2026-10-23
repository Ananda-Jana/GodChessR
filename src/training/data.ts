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

import type { HashiraRankId, HashiraRankInfo, DojoLesson, TheoryScroll, HashiraUserProgress } from './types';
import type { Piece } from '../types/game';
import type { CullingPiece, CullingPieceType, CullingPieceColor, CullingBoard } from '../types/cullingGame';

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
    mentorSuccess: 'Splendid form! You command the central squares and clear breathing room for both Queen and Bishop.',
    mistakeExplanations: {
      '3,1->3,3': 'You pushed the d-pawn instead! The King\'s e-pawn is the primary spearhead of this kata!',
      '4,1->4,2': 'A single push to e3 is timid! Stake your full claim on the center with e4!',
    },
    correctSteps: [
      {
        from: { x: 4, y: 1 },
        to: { x: 4, y: 3 },
        explanation: '1. e4 controls d5/f5 and immediately opens diagonal vectors for your officers.',
        mentorReaction: 'approving',
        mentorCommentary: 'Strong posture. The foundation of water begins with central command.',
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
      b[3][4] = p('pawn', 'white', 'wp_e');   // e4
      b[7][4] = p('king', 'black', 'bk1');
      b[4][4] = p('pawn', 'black', 'bp_e');   // e5
      return b;
    })(),
    mentorPrompt: 'Officers must not sleep in barracks! Leap your Knight from g1 to f3 to attack the black pawn on e5 while shielding your monarch.',
    hint: 'Move your Knight from g1 (x=6, y=0) to f3 (x=5, y=2).',
    mentorFailure: 'That leap misses the vital outpost! Direct the steed to f3!',
    mentorSuccess: 'Swift and disciplined! Nf3 develops with tempo, creating immediate tactical tension.',
    mistakeExplanations: {
      '6,0->7,2': 'Developing to the rim (Nh3) is passive! A Knight on the rim is dim!',
      '6,0->4,1': 'Do not step in front of your King on e2! Develop outward toward f3!',
    },
    correctSteps: [
      {
        from: { x: 6, y: 0 },
        to: { x: 5, y: 2 },
        explanation: 'Nf3 develops with tempo, attacking Black\'s e5 pawn while preparing King castling.',
        mentorReaction: 'approving',
        mentorCommentary: 'Excellent! Developing with an active threat robs the opponent of easy development.',
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
      b[2][2] = p('knight', 'white', 'wn1'); // c3
      b[7][4] = p('king', 'black', 'bk1');  // e8
      b[7][7] = p('rook', 'black', 'br1');  // h8
      b[6][2] = p('pawn', 'black', 'bp1');  // c7 target
      return b;
    })(),
    mentorPrompt: 'Observe the enemy King on e8 and the undefended Rook on h8. Leaping through the air, strike the c7 square to deliver a fatal double assault!',
    hint: 'Move your Knight from c3 (x=2, y=2) to c7 (x=2, y=6) to check the black King while threatening the Rook!',
    mentorFailure: 'Blindness! You strike air while the enemy monarch slips away. Focus your leap on c7!',
    mentorSuccess: 'Flawless execution! A classic twin-fang fork. The enemy King must flee, leaving the Rook to your blade.',
    mistakeExplanations: {
      '2,2->3,4': 'Moving to d5 misses the fork! Look closely at the c7 square where King and Rook align!',
      '2,2->4,3': 'Ne4 creates no threat! Strike c7 with check!',
    },
    correctSteps: [
      {
        from: { x: 2, y: 2 },
        to: { x: 2, y: 6 },
        explanation: 'Knight leaps to c7, delivering check to e8 King while skewering the h8 Rook.',
        mentorReaction: 'approving',
        mentorCommentary: 'Notice how the Knight bypasses enemy sightlines completely. This is the essence of tactical fangs.',
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
      b[0][2] = p('king', 'white', 'wk1');
      b[0][3] = p('rook', 'white', 'wr1'); // d1 Rook
      b[7][6] = p('king', 'black', 'bk1'); // g8 King
      b[6][5] = p('pawn', 'black', 'bp_f'); // f7
      b[6][6] = p('pawn', 'black', 'bp_g'); // g7
      b[6][7] = p('pawn', 'black', 'bp_h'); // h7
      return b;
    })(),
    mentorPrompt: 'The black King has castled, but his pawns form an inescapable wall! Rush your Rook to the 8th rank to seal his fate in the corridor!',
    hint: 'Play Rd8# (move Rook from d1 [x=3, y=0] all the way to d8 [x=3, y=7]).',
    mentorFailure: 'Cowardice! Why halt halfway? Drive the blade all the way to the 8th rank!',
    mentorSuccess: 'CHECKMATE! The corridor is sealed. The King is trapped by his own loyal pawns.',
    mistakeExplanations: {
      '3,0->3,6': 'Stopping on d7 is not mate! Drive straight to d8 to trap the King!',
    },
    correctSteps: [
      {
        from: { x: 3, y: 0 },
        to: { x: 3, y: 7 },
        explanation: 'Rd8 delivers back-rank checkmate because Black has no luft (breathing square) on the 7th rank.',
        mentorReaction: 'approving',
        mentorCommentary: 'Always be mindful of your own back rank, pupil. The same blade can turn against you.',
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
      // White: Gojo at H1 (8,1), Yuji at G1 (7,1), Mechamaru at F1 (6,1)
      b[1][8] = cp('culling_gojo', 'white', 'w_gojo');
      b[1][7] = cp('culling_yuji', 'white', 'w_yuji');
      b[1][6] = cp('culling_mechamaru', 'white', 'w_mechamaru');
      // Black: Sukuna at A8 (1,8), Kenjaku at B8 (2,8)
      b[8][1] = cp('culling_sukuna', 'black', 'b_sukuna');
      b[8][2] = cp('culling_kenjaku', 'black', 'b_kenjaku');
      // Black outpost pawn on H3 (8,3) to be targeted
      b[3][8] = cp('culling_pawn', 'black', 'b_pawn_h3');
      return b;
    })(),
    mentorPrompt: 'Pupil! In the Culling Game, Satoru Gojo is the Sovereign. Unlike an ordinary King, Gojo possesses Domain Step: once per game, he can leap 2 squares over obstacles! Leap Gojo forward to F3 to seize spatial superiority!',
    hint: 'Move Satoru Gojo from H1 (x=8, y=1) to F3 (x=6, y=3) utilizing his 2-square diagonal Domain Step.',
    mentorFailure: 'Hesitation! Gojo\'s Domain Step requires fearless spatial mastery. Land precisely on F3!',
    mentorSuccess: 'LIMITLESS! Satoru Gojo warped across space with Domain Step, establishing total control over the sector.',
    mistakeExplanations: {
      '8,1->8,2': 'A mundane 1-step move fails to utilize Gojo\'s Sovereign Domain Step! Leap 2 squares to F3!',
      '7,1->7,4': 'You moved Yuji instead! The trial commands Satoru Gojo to demonstrate the Domain Step!',
    },
    correctSteps: [
      {
        from: { x: 8, y: 1 },
        to: { x: 6, y: 3 },
        explanation: 'Domain Step allows Gojo to leap 2 squares diagonally over obstacles to anchor central control.',
        mentorReaction: 'approving',
        mentorCommentary: 'Remember: Domain Step cannot be used while in check, and the landing square must be safe.',
        cullingActionType: 'teleport',
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
      return b;
    })(),
    mentorPrompt: 'Yuji Itadori is White\'s Vanguard! He slides up to 3 squares in all 8 directions without leaping. Charge Yuji 3 squares up the G-file to G4 to capture the cursed pawn!',
    hint: 'Slide Yuji from G1 (x=7, y=1) to G4 (x=7, y=4) to smash the outpost pawn.',
    mentorFailure: 'Do not hold back Yuji\'s explosive physical prowess! Drive straight to G4!',
    mentorSuccess: 'BLACK FLASH IMPACT! Yuji charges through the corridor, shattering the cursed outpost.',
    mistakeExplanations: {
      '7,1->7,2': 'Too hesitant! Yuji can slide up to 3 squares—drive directly to G4!',
      '8,1->7,2': 'Do not move Gojo! This drill tests the Vanguard\'s long-range slide!',
    },
    correctSteps: [
      {
        from: { x: 7, y: 1 },
        to: { x: 7, y: 4 },
        explanation: 'Yuji slides 3 squares orthogonally, capturing Black\'s G4 pawn with Vanguard momentum.',
        mentorReaction: 'approving',
        mentorCommentary: 'Vanguards are your primary offensive battering rams in the Culling Game.',
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
      b[1][3] = p('pawn', 'white', 'wp_d');   // d2
      b[1][4] = p('pawn', 'white', 'wp_e');   // e2
      b[7][4] = p('king', 'black', 'bk1');
      return b;
    })(),
    mentorPrompt: 'The Prince possesses royal blood: moving one square in any direction or striking as a Knight. Advance the Prince to d3 to support the monarch!',
    hint: 'Move your Prince from d1 (x=3, y=0) to d3 (x=3, y=2).',
    mentorFailure: 'Do not leave the Prince idle in the back rank! Deploy him forward to anchor the center!',
    mentorSuccess: 'Resolute discipline! With the Prince guarding d3, your King is safe and your center is fortified.',
    correctSteps: [
      {
        from: { x: 3, y: 0 },
        to: { x: 3, y: 2 },
        explanation: 'Prince leaps to d3, controlling e5 and c5 with Knight flexibility while maintaining royal proximity.',
        mentorReaction: 'approving',
        mentorCommentary: 'Remember: if your King falls, the Prince ascends to the throne! Keep him active and vigilant.',
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
      b[0][2] = p('bishop', 'white', 'wb1'); // c1 Bishop
      b[7][4] = p('king', 'black', 'bk1');   // e8 King
      b[4][4] = p('knight', 'black', 'bn1'); // e5 Knight
      return b;
    })(),
    mentorPrompt: 'The black Knight on e5 stands directly in line with the black King on e8. Slide your Bishop to g3 to pin the Knight with iron shackles!',
    hint: 'Move Bishop from c1 (x=2, y=0) to g3 (x=6, y=2). It skewers the Knight to the King.',
    mentorFailure: 'That square misses the diagonal line of fire! Aim for g3 to pin the Knight against e8!',
    mentorSuccess: 'Immovable iron pin! The black Knight cannot move without exposing its King to death.',
    correctSteps: [
      {
        from: { x: 2, y: 0 },
        to: { x: 6, y: 2 },
        explanation: 'Bg3 creates an absolute pin on the e5 Knight along the g3-e8 diagonal.',
        mentorReaction: 'approving',
        mentorCommentary: 'A pinned piece ceases to be an attacker. Use pins to shatter enemy coordination.',
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
      b[1][4] = cp('culling_nanami', 'white', 'w_nanami'); // D1 Nanami
      b[8][1] = cp('culling_sukuna', 'black', 'b_sukuna');
      b[5][4] = cp('culling_kenjaku', 'black', 'b_kenjaku'); // D5 Kenjaku
      return b;
    })(),
    mentorPrompt: 'Kento Nanami is White\'s Warden! He creates a passive Ratio Field: any enemy within 1 adjacent square is restricted to 1 square max movement! Slide Nanami to D4 to suppress Kenjaku!',
    hint: 'Move Nanami from D1 (x=4, y=1) to D4 (x=4, y=4).',
    mentorFailure: 'You failed to enter adjacent contact! Bring Nanami to D4 to activate the Ratio Field!',
    mentorSuccess: 'OVERTIME ACTIVATED! Kenjaku is clamped in Nanami\'s Ratio Field. His 3-square sliding power is crushed to 1.',
    correctSteps: [
      {
        from: { x: 4, y: 1 },
        to: { x: 4, y: 4 },
        explanation: 'Nanami establishes contact at D4, restricting adjacent enemies to 1 square mobility.',
        mentorReaction: 'approving',
        mentorCommentary: 'Wardens are vital anti-vanguard shields. Use them to cage enemy officers.',
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
    subtitle: 'Using crafted piece diagonal leaps through enemy defenses',
    mode: 'crafted',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][4] = p('king', 'white', 'wk1');
      b[2][1] = p('communist', 'white', 'wcom1'); // b3 Communist
      b[7][4] = p('king', 'black', 'bk1');
      b[5][4] = p('queen', 'black', 'bq1');      // e6 Queen
      b[6][3] = p('pawn', 'black', 'bp_d');      // d7 pawn
      return b;
    })(),
    mentorPrompt: 'The Communist moves like a King but leaps like an extended Bishop over barriers! Penetrate the black defense to capture the Queen on e6!',
    hint: 'Attack the Queen directly at e6 (x=4, y=5) using your Communist from b3 (x=1, y=2).',
    mentorFailure: 'Hesitation is death! Strike the enemy Queen directly!',
    mentorSuccess: 'Devastating strike! The Communist crushed the enemy Queen without hesitation.',
    correctSteps: [
      {
        from: { x: 1, y: 2 },
        to: { x: 4, y: 5 },
        explanation: 'Communist executes an unstoppable diagonal leap strike, capturing the black Queen on e6.',
        mentorReaction: 'approving',
        mentorCommentary: 'Formidable! Crafted pieces shatter ordinary chess assumptions. Master their geometry.',
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
    mentorSuccess: 'Solid Bastion! Panda anchors D3 with Shell intact, ready to absorb enemy strikes and counter.',
    correctSteps: [
      {
        from: { x: 5, y: 1 },
        to: { x: 4, y: 3 },
        explanation: 'Panda L-jumps to D3. If Naoya attacks, Panda\'s shell absorbs the hit and unlocks Gorilla mode.',
        mentorReaction: 'approving',
        mentorCommentary: 'Bulwarks are your ultimate bait officers. Force enemies to waste turns cracking shells.',
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
      b[0][4] = p('king', 'white', 'wk1');
      b[4][7] = p('rook', 'white', 'wr1');   // h5 Rook
      b[4][5] = p('queen', 'white', 'wq1');  // f5 Queen
      b[7][6] = p('king', 'black', 'bk1');   // g8 King
      b[6][6] = p('pawn', 'black', 'bp_g');  // g7 pawn
      b[6][7] = p('pawn', 'black', 'bp_h');  // h7 pawn
      return b;
    })(),
    mentorPrompt: 'The black King cowers behind g7 and h7. Sacrifice your Rook on h7 to shatter the fortress and open the kill line!',
    hint: 'Move Rook from h5 (x=7, y=4) to h7 (x=7, y=6) capturing the defending pawn.',
    mentorFailure: 'Do not fear losing wood! Without sacrifice, there is no decisive victory. Take h7!',
    mentorSuccess: 'Magnificent fury! The wall is turned to ash. The enemy King is exposed to your Queen\'s follow-up strike.',
    correctSteps: [
      {
        from: { x: 7, y: 4 },
        to: { x: 7, y: 6 },
        explanation: 'Rxh7+ rips open the h-file, forcing the black monarch into the crosshairs.',
        mentorReaction: 'approving',
        mentorCommentary: 'A true swordsman knows when to discard the scabbard to deliver the lethal cut.',
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
    mentorSuccess: 'ZERO CURSED ENERGY! Maki\'s physical mastery cuts through Reggie\'s barrier like paper.',
    correctSteps: [
      {
        from: { x: 3, y: 1 },
        to: { x: 3, y: 3 },
        explanation: 'Maki hops 2 squares orthogonally, bypassing Warden aura to eliminate Reggie Star.',
        mentorReaction: 'approving',
        mentorCommentary: 'Against defensive Warden players, Maki is your sharpest scalpel.',
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
    mentorPrompt: 'Black\'s Rook guards the g8 square tenaciously. Sacrifice your Queen on d8 to deflect the enemy defense or deliver devastating check!',
    hint: 'Move Queen from d7 (x=3, y=6) to d8 (x=3, y=7).',
    mentorFailure: 'Do not hesitate! Strike the back rank with Qd8+!',
    mentorSuccess: 'Sublime deflection! Black must address the lethal Queen thrust, surrendering all coordination.',
    correctSteps: [
      {
        from: { x: 3, y: 6 },
        to: { x: 3, y: 7 },
        explanation: 'Qd8+ forces Black into fatal concessions while opening the back corridor.',
        mentorReaction: 'approving',
        mentorCommentary: 'When a piece guards two critical duties, overload it until it breaks.',
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
      b[8][1] = cp('culling_sukuna', 'black', 'b_sukuna');
      return b;
    })(),
    mentorPrompt: 'Kinji Hakari is White\'s Rusher! He slides up to 2 squares diagonally. Upon capture, his Jackpot triggers an instant bonus safe repositioning step! Slide Hakari diagonally from B1 to D3 to capture the cursed pawn!',
    hint: 'Move Hakari from B1 (x=2, y=1) to D3 (x=4, y=3) capturing the pawn.',
    mentorFailure: 'Hakari slides up to 2 diagonally! Aim your cut directly at D3!',
    mentorSuccess: 'JACKPOT ROLLING! The capture succeeds, unlocking Hakari\'s bonus positioning step!',
    correctSteps: [
      {
        from: { x: 2, y: 1 },
        to: { x: 4, y: 3 },
        explanation: 'Hakari slides 2 diagonal squares to capture D3, triggering Rusher Jackpot bonus.',
        mentorReaction: 'approving',
        mentorCommentary: 'In high-level Culling matches, Hakari\'s extra step breaks enemy pincers completely.',
      },
    ],
  },

  // ==========================================
  // RANK 6: HASHIRA (Supreme Grandmaster)
  // ==========================================
  {
    id: 'hashira_tactics_1',
    rank: 'hashira',
    tool: 'tactics',
    title: 'Pillar Form: Absolute Smothered Mate',
    subtitle: 'Grandmaster lethal combination with zero room for error',
    mode: 'standard',
    playerColor: 'white',
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[0][4] = p('king', 'white', 'wk1');
      b[5][6] = p('queen', 'white', 'wq1');  // g6 Queen
      b[4][5] = p('knight', 'white', 'wn1'); // f5 Knight
      b[7][7] = p('king', 'black', 'bk1');   // h8 King
      b[7][6] = p('rook', 'black', 'br1');   // g8 Rook
      b[6][7] = p('pawn', 'black', 'bp_h');  // h7 pawn
      return b;
    })(),
    mentorPrompt: 'Pupil! You stand before the Hashira trial. Deliver the lethal Queen sacrifice on g8 to force the Rook to smother its own King!',
    hint: 'Play Qg8+ (move Queen from g6 [x=6, y=5] to g8 [x=6, y=7]).',
    mentorFailure: 'Unacceptable! A Hashira does not falter in sight of checkmate! Strike g8 with everything!',
    mentorSuccess: 'MAGNIFICENT! You have executed the eternal Pillar technique. The King is trapped in his own castle by his own loyal guards.',
    correctSteps: [
      {
        from: { x: 6, y: 5 },
        to: { x: 6, y: 7 },
        explanation: 'Qg8+ forces Rxg8, completely suffocating the black monarch on h8.',
        mentorReaction: 'approving',
        mentorCommentary: 'Perfection. The enemy gave up their life to their own fortress.',
      },
    ],
  },
  {
    id: 'hashira_culling_1',
    rank: 'hashira',
    tool: 'culling',
    title: 'The Sealing of Ryomen Sukuna: Cross Checkmate',
    subtitle: 'Coordinating Gojo and Yuji to seal the King of Curses',
    mode: 'culling',
    playerColor: 'white',
    cullingPlayerColor: 'white',
    initialBoard: createEmptyBoard(),
    cullingBoard: (() => {
      const b = createEmptyCullingKataBoard();
      // Gojo at C7 (3,7), Yuji at B6 (2,6)
      b[7][3] = cp('culling_gojo', 'white', 'w_gojo');
      b[6][2] = cp('culling_yuji', 'white', 'w_yuji');
      // Sukuna cornered on A8 (1,8) next to the void out-of-bounds cells!
      b[8][1] = cp('culling_sukuna', 'black', 'b_sukuna');
      return b;
    })(),
    mentorPrompt: 'Ryomen Sukuna is cornered against the out-of-bounds cross barrier at A8! Coordinate your forces: slide Yuji from B6 to B8 to deliver the fatal check and seal the King of Curses!',
    hint: 'Move Yuji from B6 (x=2, y=6) to B8 (x=2, y=8).',
    mentorFailure: 'Do not let Sukuna breathe! Lock the corridor on B8!',
    mentorSuccess: 'DOMAIN EXPANSION: UNLIMITED VOID! Ryomen Sukuna has zero escape squares on the cross board. CHECKMATE!',
    correctSteps: [
      {
        from: { x: 2, y: 6 },
        to: { x: 2, y: 8 },
        explanation: 'Yuji reaches B8, attacking Sukuna while Gojo cuts off all retreat squares. Checkmate!',
        mentorReaction: 'approving',
        mentorCommentary: 'You have conquered the Culling Game. The Chess Hashira acknowledges your supreme mastery.',
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
