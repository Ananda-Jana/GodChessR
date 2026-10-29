/**
 * cullingOpeningData.ts
 *
 * Official Opening & Mid-Game Strategy Curriculum for the Culling Game Dojo — Tukuna's Classroom.
 *
 * Instructor: Sensei Tukuna
 * Rule Engine: cullingEngine.ts (100% legal 88-square cross-shaped board moves & piece-safety verified)
 *
 * Pedagogical Mandate:
 * 1. Pawns clear lanes and shield expensive units; high-value sorcerers NEVER step undefended into enemy pawn/piece fire.
 * 2. Scripted opponents play realistic, active developing moves and tactical threats that punish carelessness.
 * 3. Every vector uses high-contrast 'emerald' (primary move) and 'navy' (secondary tactical threat/support) on the crimson grid.
 */

import type { CullingOpeningLesson } from './types';
import type { CullingBoard, CullingPiece, CullingPieceColor, CullingPieceType } from '../types/cullingGame';
import { createInitialCullingBoard, createEmptyCullingBoard } from '../game/cullingEngine';

function mPos(pos: { x: number; y: number }): { x: number; y: number } {
  if (!pos) return pos;
  return { x: pos.x, y: pos.y };
}

function createEmptyCullingGrid(): CullingBoard {
  return createEmptyCullingBoard();
}

function putPiece(
  board: CullingBoard,
  x: number,
  y: number,
  type: CullingPieceType,
  color: CullingPieceColor,
  idSuffix: string,
  extra?: Partial<CullingPiece>
): void {
  if (board[y]) {
    board[y][x] = {
      id: `${color[0]}_${type}_${idSuffix}`,
      type,
      color,
      hasMoved: extra?.hasMoved ?? true,
      ...extra,
    };
  }
}

function clearCell(board: CullingBoard, y: number, x: number): void {
  if (board[y]) {
    board[y][x] = null;
  }
}

/**
 * Lesson 7 Custom Opening Position:
 * Black's Skirmisher Naoya has overextended onto F4 hoping to raid White's center,
 * while White's Mechamaru stands ready on F2 behind an open F3 firing corridor.
 */
export const createLesson7Board = (): CullingBoard => {
  const b = createInitialCullingBoard();
  clearCell(b, 2, 6); // F2 pawn traded earlier
  clearCell(b, 1, 6); // Mechamaru moved from F1
  clearCell(b, 2, 5); // E2 pawn advanced to E4
  putPiece(b, 5, 4, 'culling_pawn', 'white', 'e4');
  putPiece(b, 6, 2, 'culling_mechamaru', 'white', 'f2');
  clearCell(b, 8, 6); // Naoya moved from F8
  clearCell(b, 7, 5); // Black E7 pawn traded earlier
  putPiece(b, 6, 4, 'culling_naoya', 'black', 'f4');
  clearCell(b, 7, 4);
  putPiece(b, 4, 6, 'culling_pawn', 'black', 'd6');
  return b;
};

/**
 * Mid-Game Lesson 9 (culling_mid_1): Vanguard Black Flash Strike-in-Place
 * Black's Naoya sits on F5 protected by Black's G6 pawn. Moving onto F5 normally would lose Yuji (8pt) to G6xF5!
 * Instead, Yuji on F3 executes Black Flash (exact 2-square strike-in-place), destroying Naoya while remaining safely on F3.
 */
const createMidLesson1Board = (): CullingBoard => {
  const b = createInitialCullingBoard();
  clearCell(b, 2, 2); putPiece(b, 2, 3, 'culling_pawn', 'white', 'b3');
  clearCell(b, 2, 3); putPiece(b, 3, 3, 'culling_pawn', 'white', 'c3');
  clearCell(b, 2, 4); putPiece(b, 4, 3, 'culling_pawn', 'white', 'd3');
  clearCell(b, 2, 5); putPiece(b, 5, 3, 'culling_pawn', 'white', 'e3');
  clearCell(b, 2, 6);
  clearCell(b, 2, 7); putPiece(b, 7, 3, 'culling_pawn', 'white', 'g3');
  clearCell(b, 1, 7); putPiece(b, 6, 3, 'culling_yuji', 'white', 'f3');
  clearCell(b, 1, 6); putPiece(b, 6, 2, 'culling_mechamaru', 'white', 'f2');

  clearCell(b, 7, 2); putPiece(b, 2, 6, 'culling_pawn', 'black', 'b6');
  clearCell(b, 7, 3); putPiece(b, 3, 6, 'culling_pawn', 'black', 'c6');
  clearCell(b, 7, 4); putPiece(b, 4, 6, 'culling_pawn', 'black', 'd6');
  clearCell(b, 7, 5); putPiece(b, 5, 6, 'culling_pawn', 'black', 'e6');
  clearCell(b, 7, 6);
  clearCell(b, 7, 7); putPiece(b, 7, 6, 'culling_pawn', 'black', 'g6');
  clearCell(b, 8, 6); putPiece(b, 6, 5, 'culling_naoya', 'black', 'f5');
  clearCell(b, 8, 2); putPiece(b, 2, 7, 'culling_kenjaku', 'black', 'b7');
  clearCell(b, 8, 5); putPiece(b, 5, 7, 'culling_reggie', 'black', 'e7');
  return b;
};

/**
 * Mid-Game Lesson 10 (culling_mid_2): Artillery Battery & Diagonal Snipe
 * Mechamaru on E2 uses orthogonal Ranged Strike against Black's E4 vanguard pawn, then clears the D4-C5 diagonal
 * via pawn exchange to snipe Black's defended C5 unit from safety.
 */
const createMidLesson2Board = (): CullingBoard => {
  const b = createInitialCullingBoard();
  clearCell(b, 2, 2); putPiece(b, 2, 3, 'culling_pawn', 'white', 'b3');
  clearCell(b, 2, 3); putPiece(b, 3, 3, 'culling_pawn', 'white', 'c3');
  clearCell(b, 2, 4); putPiece(b, 4, 4, 'culling_pawn', 'white', 'd4');
  clearCell(b, 2, 5); putPiece(b, 5, 2, 'culling_mechamaru', 'white', 'e2');
  clearCell(b, 1, 6);
  clearCell(b, 2, 6); putPiece(b, 6, 3, 'culling_pawn', 'white', 'f3');
  clearCell(b, 2, 7); putPiece(b, 7, 3, 'culling_pawn', 'white', 'g3');
  clearCell(b, 1, 4); putPiece(b, 4, 2, 'culling_nanami', 'white', 'd2');
  clearCell(b, 1, 7); putPiece(b, 7, 2, 'culling_yuji', 'white', 'g2');

  clearCell(b, 7, 2); putPiece(b, 2, 6, 'culling_pawn', 'black', 'b6');
  clearCell(b, 7, 3); putPiece(b, 3, 5, 'culling_pawn', 'black', 'c5');
  clearCell(b, 7, 4);
  clearCell(b, 7, 5); putPiece(b, 5, 4, 'culling_pawn', 'black', 'e4');
  clearCell(b, 7, 6); putPiece(b, 6, 6, 'culling_pawn', 'black', 'f6');
  clearCell(b, 7, 7); putPiece(b, 7, 6, 'culling_pawn', 'black', 'g6');
  clearCell(b, 8, 3); putPiece(b, 3, 7, 'culling_uraume', 'black', 'c7');
  clearCell(b, 8, 5); putPiece(b, 5, 7, 'culling_reggie', 'black', 'e7');
  return b;
};

/**
 * Mid-Game Lesson 11 (culling_mid_3): Ratio Field Suffocation Trap
 * Black's 8-point Vanguard Kenjaku has raided into E5. White steps Warden Nanami (4.5pt) onto double-pawn-defended D4,
 * projecting Ratio Field onto E5 (clamping Kenjaku to 1-step max) and corralling Kenjaku with defended pawns.
 */
const createMidLesson3Board = (): CullingBoard => {
  const b = createInitialCullingBoard();
  clearCell(b, 2, 2); putPiece(b, 2, 3, 'culling_pawn', 'white', 'b3');
  clearCell(b, 2, 3); putPiece(b, 3, 3, 'culling_pawn', 'white', 'c3');
  clearCell(b, 2, 4); putPiece(b, 4, 2, 'culling_nanami', 'white', 'd2');
  clearCell(b, 1, 4);
  clearCell(b, 2, 5); putPiece(b, 5, 3, 'culling_pawn', 'white', 'e3');
  clearCell(b, 2, 6); putPiece(b, 6, 3, 'culling_pawn', 'white', 'f3');
  clearCell(b, 2, 7); putPiece(b, 7, 4, 'culling_pawn', 'white', 'g4');
  clearCell(b, 1, 7); putPiece(b, 7, 2, 'culling_yuji', 'white', 'g2');
  clearCell(b, 1, 6); putPiece(b, 6, 2, 'culling_mechamaru', 'white', 'f2');

  clearCell(b, 8, 2); putPiece(b, 5, 5, 'culling_kenjaku', 'black', 'e5');
  clearCell(b, 7, 2); putPiece(b, 2, 6, 'culling_pawn', 'black', 'b6');
  clearCell(b, 7, 3); putPiece(b, 3, 6, 'culling_pawn', 'black', 'c6');
  clearCell(b, 7, 5);
  return b;
};

/**
 * Mid-Game Lesson 12 (culling_mid_4): Defended Bulwark Shell Bait & Punish
 * Black's Naoya has jumped to F4. White hops intact-Shell Panda to F3, then pushes E2->E3 attacking Naoya.
 * When Naoya tries to strike Panda on F3, Panda's intact Shell absorbs the hit, leaving Naoya stranded on F4 for E3xF4!
 */
const createMidLesson4Board = (): CullingBoard => {
  const b = createInitialCullingBoard();
  clearCell(b, 2, 2); putPiece(b, 2, 3, 'culling_pawn', 'white', 'b3');
  clearCell(b, 2, 3); putPiece(b, 3, 3, 'culling_pawn', 'white', 'c3');
  clearCell(b, 2, 4); putPiece(b, 4, 3, 'culling_pawn', 'white', 'd3');
  // E2 pawn remains on (5,2)
  clearCell(b, 2, 6);
  clearCell(b, 2, 7); putPiece(b, 7, 3, 'culling_pawn', 'white', 'g3');
  clearCell(b, 1, 7); putPiece(b, 7, 2, 'culling_yuji', 'white', 'g2');

  clearCell(b, 7, 2); putPiece(b, 2, 6, 'culling_pawn', 'black', 'b6');
  clearCell(b, 7, 3); putPiece(b, 3, 6, 'culling_pawn', 'black', 'c6');
  clearCell(b, 7, 4); putPiece(b, 4, 6, 'culling_pawn', 'black', 'd6');
  clearCell(b, 7, 5); putPiece(b, 5, 6, 'culling_pawn', 'black', 'e6');
  clearCell(b, 7, 6);
  clearCell(b, 7, 7); putPiece(b, 7, 6, 'culling_pawn', 'black', 'g6');
  clearCell(b, 8, 6); putPiece(b, 6, 4, 'culling_naoya', 'black', 'f4');
  return b;
};

/**
 * Mid-Game Lesson 13 (culling_mid_5): Rusher Jackpot Hit-and-Run vs. Warden
 * Black's Warden Reggie (4.5pt) stands on D5 double-defended by C6 & E6 pawns.
 * Hakari slides 2 diagonally B3 x D5 (through empty C4), triggers Jackpot, and immediately steps D5 -> D4 to safety!
 */
const createMidLesson5Board = (): CullingBoard => {
  const b = createInitialCullingBoard();
  clearCell(b, 2, 2); putPiece(b, 1, 3, 'culling_pawn', 'white', 'a3');
  clearCell(b, 2, 3); putPiece(b, 3, 3, 'culling_pawn', 'white', 'c3');
  clearCell(b, 2, 4);
  clearCell(b, 2, 5); putPiece(b, 5, 3, 'culling_pawn', 'white', 'e3');
  clearCell(b, 2, 6); putPiece(b, 6, 3, 'culling_pawn', 'white', 'f3');
  clearCell(b, 2, 7); putPiece(b, 7, 3, 'culling_pawn', 'white', 'g3');
  clearCell(b, 1, 2); putPiece(b, 2, 2, 'culling_hakari', 'white', 'b2');
  clearCell(b, 1, 4); putPiece(b, 4, 2, 'culling_nanami', 'white', 'd2');
  clearCell(b, 1, 7); putPiece(b, 7, 2, 'culling_yuji', 'white', 'g2');

  clearCell(b, 8, 5); putPiece(b, 4, 5, 'culling_reggie', 'black', 'd5');
  clearCell(b, 7, 2); putPiece(b, 2, 6, 'culling_pawn', 'black', 'b6');
  clearCell(b, 7, 3); putPiece(b, 3, 6, 'culling_pawn', 'black', 'c6');
  clearCell(b, 7, 4);
  clearCell(b, 7, 5); putPiece(b, 5, 6, 'culling_pawn', 'black', 'e6');
  clearCell(b, 7, 6); putPiece(b, 6, 6, 'culling_pawn', 'black', 'f6');
  clearCell(b, 7, 7); putPiece(b, 7, 6, 'culling_pawn', 'black', 'g6');
  clearCell(b, 8, 2); putPiece(b, 2, 7, 'culling_kenjaku', 'black', 'b7');
  return b;
};

/**
 * Mid-Game Lesson 14 (culling_mid_6): Heavenly Restriction Bypassing Ratio Field
 * Black's Warden Reggie on B5 projects a Ratio Field onto C4, assuming Uraume on C6 is untouchable behind C5 pawn.
 * Maki steps onto double-pawn-defended C4, ignores Ratio Field via Heavenly Restriction, and vaults C4 x C6!
 */
const createMidLesson6Board = (): CullingBoard => {
  const b = createInitialCullingBoard();
  clearCell(b, 2, 2); putPiece(b, 2, 3, 'culling_pawn', 'white', 'b3');
  clearCell(b, 2, 3); putPiece(b, 1, 3, 'culling_pawn', 'white', 'a3');
  clearCell(b, 2, 4); putPiece(b, 4, 3, 'culling_pawn', 'white', 'd3');
  clearCell(b, 2, 5); putPiece(b, 5, 3, 'culling_pawn', 'white', 'e3');
  clearCell(b, 2, 6); putPiece(b, 6, 3, 'culling_pawn', 'white', 'f3');
  clearCell(b, 2, 7); putPiece(b, 7, 3, 'culling_pawn', 'white', 'g3');
  clearCell(b, 1, 3); putPiece(b, 3, 3, 'culling_maki', 'white', 'c3');
  clearCell(b, 1, 2); putPiece(b, 2, 2, 'culling_hakari', 'white', 'b2');
  clearCell(b, 1, 4); putPiece(b, 4, 2, 'culling_nanami', 'white', 'd2');
  clearCell(b, 1, 7); putPiece(b, 7, 2, 'culling_yuji', 'white', 'g2');

  clearCell(b, 7, 2); putPiece(b, 1, 6, 'culling_pawn', 'black', 'a6');
  clearCell(b, 7, 3); putPiece(b, 3, 5, 'culling_pawn', 'black', 'c5');
  clearCell(b, 7, 4);
  clearCell(b, 7, 5); putPiece(b, 5, 6, 'culling_pawn', 'black', 'e6');
  clearCell(b, 7, 6); putPiece(b, 6, 6, 'culling_pawn', 'black', 'f6');
  clearCell(b, 7, 7); putPiece(b, 7, 6, 'culling_pawn', 'black', 'g6');
  clearCell(b, 8, 5); putPiece(b, 2, 5, 'culling_reggie', 'black', 'b5');
  clearCell(b, 8, 3); putPiece(b, 3, 6, 'culling_uraume', 'black', 'c6');
  clearCell(b, 8, 4); putPiece(b, 5, 8, 'culling_yorozu', 'black', 'e8', { pandaCore: 'panda' });
  clearCell(b, 8, 6);
  clearCell(b, 8, 7);
  putPiece(b, 7, 8, 'culling_naoya', 'black', 'g8');
  putPiece(b, 8, 7, 'culling_kurourushi', 'black', 'h7');
  return b;
};

/**
 * Mid-Game Lesson 15 (culling_mid_7): Triple-Role Pin, Snipe & Black Flash Synergy
 * Coordinate Yuji (Black Flash), Nanami (Ratio clamp & pawn capture), and Mechamaru (diagonal Ranged Strike)
 * without ever hanging a piece to Black's counterplay.
 */
const createMidLesson7Board = (): CullingBoard => {
  const b = createEmptyCullingGrid();
  putPiece(b, 8, 2, 'culling_gojo', 'white', 'h2', { specialUsed: false });
  putPiece(b, 6, 3, 'culling_yuji', 'white', 'f3');
  putPiece(b, 5, 2, 'culling_mechamaru', 'white', 'e2');
  putPiece(b, 4, 4, 'culling_nanami', 'white', 'd4');
  putPiece(b, 3, 2, 'culling_maki', 'white', 'c2');
  putPiece(b, 2, 2, 'culling_hakari', 'white', 'b2');
  putPiece(b, 2, 3, 'culling_pawn', 'white', 'b3');
  putPiece(b, 3, 3, 'culling_pawn', 'white', 'c3');
  putPiece(b, 5, 3, 'culling_pawn', 'white', 'e3');
  putPiece(b, 7, 4, 'culling_pawn', 'white', 'g4');
  putPiece(b, 8, 3, 'culling_pawn', 'white', 'h3');

  putPiece(b, 1, 8, 'culling_sukuna', 'black', 'a8', { specialUsed: true });
  putPiece(b, 2, 8, 'culling_kenjaku', 'black', 'b8');
  putPiece(b, 6, 5, 'culling_naoya', 'black', 'f5');
  putPiece(b, 5, 6, 'culling_pawn', 'black', 'e6');
  putPiece(b, 4, 6, 'culling_reggie', 'black', 'd6');
  putPiece(b, 7, 7, 'culling_kurourushi', 'black', 'g7');
  putPiece(b, 2, 6, 'culling_pawn', 'black', 'b6');
  putPiece(b, 3, 6, 'culling_pawn', 'black', 'c6');
  putPiece(b, 7, 6, 'culling_pawn', 'black', 'g6');
  return b;
};

/**
 * Mid-Game Lesson 16 (culling_mid_8): Coordinated Sovereign Checkmate Net
 * Late-midgame attacking position against Sukuna on B8 (Domain Step already spent).
 * White strips away Sukuna's queenside pawn cover with Maki, anchors B7 with C6 pawn & Nanami on B5,
 * and delivers engine-verified CHECKMATE (#) on A8 with Yuji on B7!
 */
const createMidLesson8Board = (): CullingBoard => {
  const b = createEmptyCullingGrid();
  putPiece(b, 8, 2, 'culling_gojo', 'white', 'h2', { specialUsed: true });
  putPiece(b, 4, 5, 'culling_yuji', 'white', 'd5');
  putPiece(b, 2, 3, 'culling_nanami', 'white', 'b3');
  putPiece(b, 3, 4, 'culling_maki', 'white', 'c4');
  putPiece(b, 6, 2, 'culling_mechamaru', 'white', 'f2');
  putPiece(b, 1, 4, 'culling_pawn', 'white', 'a4');
  putPiece(b, 3, 5, 'culling_pawn', 'white', 'c5');
  putPiece(b, 5, 4, 'culling_pawn', 'white', 'e4');
  putPiece(b, 7, 3, 'culling_pawn', 'white', 'g3');
  putPiece(b, 8, 3, 'culling_pawn', 'white', 'h3');

  putPiece(b, 2, 8, 'culling_sukuna', 'black', 'b8', { specialUsed: true });
  putPiece(b, 2, 7, 'culling_pawn', 'black', 'b7');
  putPiece(b, 7, 8, 'culling_reggie', 'black', 'g8');
  putPiece(b, 8, 8, 'culling_kurourushi', 'black', 'h8');
  putPiece(b, 5, 7, 'culling_pawn', 'black', 'e7');
  putPiece(b, 6, 7, 'culling_pawn', 'black', 'f7');
  putPiece(b, 7, 7, 'culling_pawn', 'black', 'g7');
  return b;
};

const RAW_CULLING_OPENING_LESSONS: CullingOpeningLesson[] = [
  // =========================================================================
  // OPENING DOJO CURRICULUM (Lessons 1 - 8: 8 Steps Each)
  // =========================================================================

  {
    id: 'culling_open_1',
    title: 'Lesson 1: Safe Vanguard Development & Pawn Shield',
    subtitle: 'Build an unbreakable central pawn shield before deploying high-value sorcerers',
    namedStrategy: 'Shielded Vanguard Formation',
    curriculumType: 'opening',
    tier: 'beginner',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Welcome to the revised Culling Game Dojo. Rule One of survival: NEVER thrust your 8-point Vanguard or expensive sorcerers in front of pawns where a 1-point pawn can strike them. First build the pawn shield, then develop safely behind it.',
    completionMessage:
      'Textbook opening discipline! Every high-value sorcerer stands shielded behind fortified pawns while commanding central lanes and denying Black’s knight and skirmisher outposts.',
    patternHighlights: [
      { x: 7, y: 2 }, { x: 6, y: 3 }, { x: 5, y: 3 }, { x: 4, y: 3 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 7, y: 2 },
        to: { x: 7, y: 3 },
        actionType: 'move',
        notation: 'G2 → G3 (Pawn Shield Advance)',
        tukunaInstruction:
          'Advance your G2 pawn to G3. This vacates G2 as a protected pocket for Vanguard Yuji while guarding Gojo’s flank.',
        tacticalBreakdown:
          'Pawns cost 1 point; Yuji costs 8. Clearing G2 lets Yuji develop behind a pawn shield rather than exposing himself on open ranks.',
        hint: 'Move the White Pawn on G2 forward to G3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 7, y: 3 }, color: 'emerald', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 },
          to: { x: 2, y: 6 },
          commentary: 'Black mirrors good structure, pushing B7 → B6 to prepare Vanguard Kenjaku.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 7, y: 1 },
        to: { x: 7, y: 2 },
        actionType: 'move',
        notation: 'Yuji G1 → G2 (Protected Vanguard Pocket)',
        tukunaInstruction:
          'Step Vanguard Yuji from G1 onto G2 directly behind your G3 pawn.',
        tacticalBreakdown:
          'From G2, Yuji guards Gojo on H1, reinforces F3 and H3, and stays completely immune to enemy pawns and Ranged Strikes.',
        hint: 'Step Yuji from G1 to G2.',
        vectorArrows: [
          { from: { x: 7, y: 1 }, to: { x: 7, y: 2 }, color: 'emerald', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 },
          to: { x: 2, y: 7 },
          commentary: 'Black tucks Vanguard Kenjaku onto B7 behind the B6 pawn.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 6, y: 2 },
        to: { x: 6, y: 3 },
        actionType: 'move',
        notation: 'F2 → F3 (Interlocking Pawn Chain)',
        tukunaInstruction:
          'Push your F2 pawn to F3 to form a connected kingside shield alongside G3.',
        tacticalBreakdown:
          'F3 and G3 control E4, F4, G4, and H4 together—preventing enemy Rushers or Skirmishers from leaping into your territory.',
        hint: 'Advance the F2 pawn to F3.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 6, y: 3 }, color: 'emerald', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 },
          to: { x: 5, y: 6 },
          commentary: 'Black advances E7 → E6, opening the central column for Warden Reggie.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 5, y: 2 },
        to: { x: 5, y: 3 },
        actionType: 'move',
        notation: 'E2 → E3 (Central Phalanx)',
        tukunaInstruction:
          'Advance your E2 pawn to E3 to extend the central pawn phalanx across E3–F3–G3.',
        tacticalBreakdown:
          'E3 controls D4 and F4 while freeing E2 for flexible piece rotation behind the wall.',
        hint: 'Push the E2 pawn one square to E3.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 3 }, color: 'emerald', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 8 },
          to: { x: 5, y: 7 },
          commentary: 'Black develops Warden Reggie to E7 behind the E6 pawn.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 5, y: 1 },
        to: { x: 4, y: 3 },
        actionType: 'move',
        notation: 'Panda E1 → D3 (Central Bulwark Posting)',
        tukunaInstruction:
          'Leap Bulwark Panda from E1 to D3 to reinforce the center and connect your back rank.',
        tacticalBreakdown:
          'Panda’s Knight jump to D3 eyes C5 and E5 while keeping its armored Shell completely intact and out of enemy pawn reach.',
        hint: 'Jump Panda in an L-shape from E1 to D3.',
        vectorArrows: [
          { from: { x: 5, y: 1 }, to: { x: 4, y: 3 }, color: 'emerald', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 8 },
          to: { x: 3, y: 6 },
          commentary: 'Black leaps Bulwark Yorozu to C6, eyeing central squares B4 and D4!',
        },
      },
      {
        stepNumber: 6,
        from: { x: 3, y: 2 },
        to: { x: 3, y: 3 },
        actionType: 'move',
        notation: 'C2 → C3 (Anti-Bulwark Denial)',
        tukunaInstruction:
          'Respond directly to Yorozu’s C6 jump! Push C2 → C3 to strip away both B4 and D4 landing squares.',
        tacticalBreakdown:
          'A single 1-point pawn on C3 shuts down an entire 3.5-point enemy Bulwark on C6—Yorozu would lose to C3×B4 or C3×D4 if she jumped forward.',
        hint: 'Advance the C2 pawn to C3 to cover B4 and D4.',
        vectorArrows: [
          { from: { x: 3, y: 2 }, to: { x: 3, y: 3 }, color: 'emerald', label: '6', style: 'solid' },
          { from: { x: 3, y: 3 }, to: { x: 2, y: 4 }, color: 'navy', style: 'dashed' },
          { from: { x: 3, y: 3 }, to: { x: 4, y: 4 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 6, y: 8 },
          to: { x: 6, y: 6 },
          commentary: 'Black hops Skirmisher Naoya over F7 onto F6, probing your kingside!',
        },
      },
      {
        stepNumber: 7,
        from: { x: 7, y: 3 },
        to: { x: 7, y: 4 },
        actionType: 'move',
        notation: 'G3 → G4 (Supported Space Gain)',
        tukunaInstruction:
          'Push G3 → G4, backed up by both your F3 pawn and Yuji on G2, to clamp down on F5 and H5.',
        tacticalBreakdown:
          'Unlike reckless unsupported pushes, G4 is defended twice (by F3 and Yuji on G2) and stops Naoya from ever stepping to F5 or H5.',
        hint: 'Advance the G3 pawn to G4.',
        vectorArrows: [
          { from: { x: 7, y: 3 }, to: { x: 7, y: 4 }, color: 'emerald', label: '7', style: 'solid' },
          { from: { x: 6, y: 3 }, to: { x: 7, y: 4 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 },
          to: { x: 4, y: 6 },
          commentary: 'Unable to infiltrate on the kingside, Black consolidates with D7 → D6.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 6, y: 1 },
        to: { x: 6, y: 2 },
        actionType: 'move',
        notation: 'Mechamaru F1 → F2 (Artillery Reserve)',
        tukunaInstruction:
          'Step Artillery Mechamaru from F1 to F2 to complete your second-rank battery.',
        tacticalBreakdown:
          'Mechamaru on F2 and Yuji on G2 sit completely safe behind the C3–D3–E3–F3–G4 wall, coiled to punish any enemy breakthrough.',
        hint: 'Step Mechamaru from F1 up to F2.',
        vectorArrows: [
          { from: { x: 6, y: 1 }, to: { x: 6, y: 2 }, color: 'emerald', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_open_2',
    title: 'Lesson 2: Sovereign Fortress vs. Flank Raid',
    subtitle: 'Repel an aggressive H-file Rusher & Skirmisher raid while tucking Gojo into safety',
    namedStrategy: 'Infinity Bastion Defense',
    curriculumType: 'opening',
    tier: 'beginner',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Ambitious opponents love rushing Kurourushi down the H-file toward Gojo on H1. Watch how calm second-rank defense and a well-timed pawn thrust force the raider backward with lost tempo.',
    completionMessage:
      'Impeccable defense! You blunted Black’s H-file Rusher raid without risking a single sorcerer, gained space with tempo, and sheltered Gojo inside an iron fortress.',
    patternHighlights: [
      { x: 8, y: 2 }, { x: 7, y: 2 }, { x: 6, y: 1 }, { x: 7, y: 4 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 7, y: 2 },
        to: { x: 7, y: 3 },
        actionType: 'move',
        notation: 'G2 → G3 (Flank Shield)',
        tukunaInstruction:
          'Open with G2 → G3 to cover H4 and prepare a defensive pocket on G2.',
        tacticalBreakdown:
          'G3 immediately watches H4 so enemy Rushers cannot slide uncontested down the H-column.',
        hint: 'Push the G2 pawn to G3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 7, y: 3 }, color: 'emerald', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 8 },
          to: { x: 8, y: 7 },
          commentary: 'Black launches an immediate flank raid, sliding Rusher Kurourushi to H7!',
        },
      },
      {
        stepNumber: 2,
        from: { x: 6, y: 1 },
        to: { x: 7, y: 2 },
        actionType: 'move',
        notation: 'Mechamaru F1 → G2 (Artillery Overwatch)',
        tukunaInstruction:
          'Step Mechamaru diagonally from F1 to G2 to overprotect the kingside and aim Ranged Strikes at E4 and G4.',
        tacticalBreakdown:
          'Putting Artillery on G2 guards H3 and H1 while freeing F1 for Yuji to rotate toward the center.',
        hint: 'Move Mechamaru from F1 diagonally to G2.',
        vectorArrows: [
          { from: { x: 6, y: 1 }, to: { x: 7, y: 2 }, color: 'emerald', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 8, y: 7 },
          to: { x: 8, y: 6 },
          commentary: 'Kurourushi marches down the flank to H6!',
        },
      },
      {
        stepNumber: 3,
        from: { x: 7, y: 1 },
        to: { x: 6, y: 1 },
        actionType: 'move',
        notation: 'Yuji G1 → F1 (Back-Rank Rotation)',
        tukunaInstruction:
          'Slide Yuji from G1 to F1, clearing the H1–G1 corner for Gojo while keeping Yuji ready to deploy centrally.',
        tacticalBreakdown:
          'Rotating heavy pieces laterally on Rank 1 keeps them 100% untouchable while preparing central counterplay.',
        hint: 'Step Yuji from G1 to F1.',
        vectorArrows: [
          { from: { x: 7, y: 1 }, to: { x: 6, y: 1 }, color: 'emerald', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 8, y: 6 },
          to: { x: 8, y: 5 },
          commentary: 'Kurourushi reaches H5, threatening diagonal slides toward the kingside!',
        },
      },
      {
        stepNumber: 4,
        from: { x: 6, y: 2 },
        to: { x: 6, y: 3 },
        actionType: 'move',
        notation: 'F2 → F3 (Preparing the Repulse)',
        tukunaInstruction:
          'Do not push G3 → G4 prematurely! First play F2 → F3 so your G4 thrust will have rock-solid pawn support.',
        tacticalBreakdown:
          'If you pushed G4 without F3, Kurourushi could capture G4 and trigger Jackpot. Supporting with F3 first turns G4 into a trap.',
        hint: 'Advance the F2 pawn to F3.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 6, y: 3 }, color: 'emerald', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 8 },
          to: { x: 6, y: 6 },
          commentary: 'Black hops Skirmisher Naoya to F6 to reinforce the kingside pressure!',
        },
      },
      {
        stepNumber: 5,
        from: { x: 7, y: 3 },
        to: { x: 7, y: 4 },
        actionType: 'move',
        notation: 'G3 → G4 (Repelling Pawn Thrust!)',
        tukunaInstruction:
          'Now strike with G3 → G4! Backed by F3 and Mechamaru’s Ranged Strike from G2, your 1-point pawn attacks Black’s 3.5-point Rusher on H5!',
        tacticalBreakdown:
          'If Kurourushi dared capture G4, Mechamaru on G2 could snipe G4 or F3×G4 would win material cleanly. Black is forced to retreat.',
        hint: 'Push G3 to G4 to attack Kurourushi on H5.',
        vectorArrows: [
          { from: { x: 7, y: 3 }, to: { x: 7, y: 4 }, color: 'emerald', label: '5', style: 'solid' },
          { from: { x: 7, y: 4 }, to: { x: 8, y: 5 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 8, y: 5 },
          to: { x: 8, y: 6 },
          commentary: 'Forced back! Kurourushi retreats from H5 to H6 to avoid losing a 3.5-point sorcerer to a pawn.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 5, y: 1 },
        to: { x: 4, y: 3 },
        actionType: 'move',
        notation: 'Panda E1 → D3 (Central Reinforcement)',
        tukunaInstruction:
          'Capitalize on the tempo you gained by jumping Bulwark Panda from E1 to D3.',
        tacticalBreakdown:
          'While Black wasted three moves marching Kurourushi up and back, you develop a second minor piece into an ideal central post.',
        hint: 'Jump Panda from E1 to D3.',
        vectorArrows: [
          { from: { x: 5, y: 1 }, to: { x: 4, y: 3 }, color: 'emerald', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 },
          to: { x: 5, y: 6 },
          commentary: 'Black switches plans, advancing E7 → E6 in the center.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 5, y: 2 },
        to: { x: 5, y: 3 },
        actionType: 'move',
        notation: 'E2 → E3 (Sealing the Center)',
        tukunaInstruction:
          'Push E2 → E3 to lock your E3–F3–G4 pawn chain together.',
        tacticalBreakdown:
          'Every pawn in the chain protects the square ahead, denying Naoya on F6 any safe hop onto F4.',
        hint: 'Advance the E2 pawn to E3.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 3 }, color: 'emerald', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 8 },
          to: { x: 5, y: 7 },
          commentary: 'Black steps Warden Reggie to E7.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 8, y: 1 },
        to: { x: 8, y: 2 },
        actionType: 'move',
        notation: 'Gojo H1 → H2 (Fortress Shelter)',
        tukunaInstruction:
          'Step Sovereign Gojo from H1 to H2, connecting your back rank while keeping Domain Step in reserve.',
        tacticalBreakdown:
          'Gojo sits safely behind Mechamaru (G2) and the G4 pawn, with Domain Step still unspent for mid-game emergencies.',
        hint: 'Move Gojo one step up from H1 to H2.',
        vectorArrows: [
          { from: { x: 8, y: 1 }, to: { x: 8, y: 2 }, color: 'emerald', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_open_3',
    title: 'Lesson 3: Skirmisher Flank Discipline & Avoiding Traps',
    subtitle: 'Navigate Maki into the Left Colony Arm while sidestepping pawn forks and Black Flash lanes',
    namedStrategy: 'Zen’in Western Flanking Maneuver',
    curriculumType: 'opening',
    tier: 'beginner',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Maki’s 2-square orthogonal hop lets her vault over pawns effortlessly—which tempts careless players into hopping straight into enemy pawn forks or Kenjaku’s Black Flash diagonal. Watch every enemy threat vector!',
    completionMessage:
      'Razor-sharp positional awareness! You infiltrated the Left Colony Arm to L4 while denying Black’s B5 pawn fork and steering clear of Kenjaku’s B7–A6–L5 Black Flash line.',
    patternHighlights: [
      { x: 3, y: 3 }, { x: 1, y: 3 }, { x: 0, y: 3 }, { x: 0, y: 4 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 3, y: 1 },
        to: { x: 3, y: 3 },
        actionType: 'move',
        notation: 'Maki C1 → C3 (Orthogonal Vault)',
        tukunaInstruction:
          'Vault Skirmisher Maki 2 squares orthogonally over your C2 pawn from C1 to C3.',
        tacticalBreakdown:
          'Skirmishers leap 2 squares orthogonally over friendly or enemy units. C3 is completely safe on Rank 3 and supports a B-file advance.',
        hint: 'Hop Maki from C1 over C2 onto C3.',
        vectorArrows: [
          { from: { x: 3, y: 1 }, to: { x: 3, y: 3 }, color: 'emerald', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 },
          to: { x: 3, y: 6 },
          commentary: 'Black pushes C7 → C6 to contest the western center.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 2, y: 2 },
        to: { x: 2, y: 3 },
        actionType: 'move',
        notation: 'B2 → B3 (Western Escort)',
        tukunaInstruction:
          'Advance your B2 pawn to B3 alongside Maki.',
        tacticalBreakdown:
          'B3 opens B2 for Rusher Hakari and prepares a supported push to B4.',
        hint: 'Move the B2 pawn forward to B3.',
        vectorArrows: [
          { from: { x: 2, y: 2 }, to: { x: 2, y: 3 }, color: 'emerald', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 },
          to: { x: 2, y: 6 },
          commentary: 'Black answers with B7 → B6, opening B7 for Kenjaku.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 2, y: 3 },
        to: { x: 2, y: 4 },
        actionType: 'move',
        notation: 'B3 → B4 (Claiming Western Space)',
        tukunaInstruction:
          'Push B3 → B4! Maki on C3 defends B4 diagonally, allowing your pawn to claim Rank 4 safely.',
        tacticalBreakdown:
          'Advancing pawns WITH piece support behind them gains space while forcing the opponent to react.',
        hint: 'Push your B3 pawn up to B4.',
        vectorArrows: [
          { from: { x: 2, y: 3 }, to: { x: 2, y: 4 }, color: 'emerald', label: '3', style: 'solid' },
          { from: { x: 3, y: 3 }, to: { x: 2, y: 4 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 },
          to: { x: 2, y: 7 },
          commentary: 'Black steps 8-point Vanguard Kenjaku to B7—watch the B7–A6–L5 diagonal carefully!',
        },
      },
      {
        stepNumber: 4,
        from: { x: 2, y: 1 },
        to: { x: 2, y: 2 },
        actionType: 'move',
        notation: 'Hakari B1 → B2 (Rusher Deployment)',
        tukunaInstruction:
          'Step Rusher Hakari from B1 to B2 behind your western structure.',
        tacticalBreakdown:
          'From B2, Hakari controls diagonal runways toward A3/D4 while staying shielded from Black’s Vanguard.',
        hint: 'Move Hakari one square forward from B1 to B2.',
        vectorArrows: [
          { from: { x: 2, y: 1 }, to: { x: 2, y: 2 }, color: 'emerald', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 6 },
          to: { x: 2, y: 5 },
          commentary: 'Black pushes B6 → B5! Notice how Black’s B5 pawn now attacks BOTH A4 and C4!',
        },
      },
      {
        stepNumber: 5,
        from: { x: 3, y: 3 },
        to: { x: 1, y: 3 },
        actionType: 'move',
        notation: 'Maki C3 → A3 (Lateral Hop Around B5 Pawn)',
        tukunaInstruction:
          'Do NOT step Maki to C4—Black’s B5 pawn would capture her for 1 point! Instead hop 2 squares laterally C3 → A3.',
        tacticalBreakdown:
          'Recognizing enemy pawn diagonals saves expensive sorcerers. A3 bypasses B5’s control over A4 and C4 cleanly.',
        hint: 'Hop Maki 2 squares left from C3 to A3.',
        vectorArrows: [
          { from: { x: 3, y: 3 }, to: { x: 1, y: 3 }, color: 'emerald', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 },
          to: { x: 4, y: 6 },
          commentary: 'Black reinforces the center with D7 → D6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 3, y: 2 },
        to: { x: 3, y: 3 },
        actionType: 'move',
        notation: 'C2 → C3 (Anchor the B4 Outpost)',
        tukunaInstruction:
          'Before sending Maki deeper into the Left Arm, push C2 → C3 to permanently anchor your B4 pawn.',
        tacticalBreakdown:
          'Now that Maki vacated C3, your C3 pawn locks B4 into an unassailable wedge.',
        hint: 'Advance the C2 pawn to C3.',
        vectorArrows: [
          { from: { x: 3, y: 2 }, to: { x: 3, y: 3 }, color: 'emerald', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 8 },
          to: { x: 5, y: 6 },
          commentary: 'Black develops Bulwark Yorozu from D8 to E6.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 1, y: 3 },
        to: { x: 0, y: 3 },
        actionType: 'move',
        notation: 'Maki A3 → L3 (Left Colony Arm Entry)',
        tukunaInstruction:
          'Step Maki into the Left Colony Arm from A3 to L3, completely bypassing Black’s B5 pawn.',
        tacticalBreakdown:
          'The outer L-file (L2..L7) lets Skirmishers outflank A-file and B-file pawn walls without touching A4.',
        hint: 'Step Maki left from A3 onto L3.',
        vectorArrows: [
          { from: { x: 1, y: 3 }, to: { x: 0, y: 3 }, color: 'emerald', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 },
          to: { x: 6, y: 6 },
          commentary: 'Black pushes F7 → F6—hoping you will carelessly walk Maki onto L5!',
        },
      },
      {
        stepNumber: 8,
        from: { x: 0, y: 3 },
        to: { x: 0, y: 4 },
        actionType: 'move',
        notation: 'Maki L3 → L4 (Disciplined Outpost — Avoiding L5 Black Flash)',
        tukunaInstruction:
          'Advance Maki ONLY 1 square to L4! Look at B7–A6–L5: if you hopped to L5, Kenjaku on B7 would destroy Maki via 2-square Black Flash!',
        tacticalBreakdown:
          'On L4, Maki is 100% untouchable while threatening to hop into A4/L6 once A6 is blocked or B7 moves. Restraint separates masters from novices.',
        hint: 'Step Maki 1 square up from L3 to L4 (do NOT hop to L5!).',
        vectorArrows: [
          { from: { x: 0, y: 3 }, to: { x: 0, y: 4 }, color: 'emerald', label: '8', style: 'solid' },
          { from: { x: 2, y: 7 }, to: { x: 0, y: 5 }, color: 'navy', style: 'dashed' },
        ],
      },
    ],
  },

  {
    id: 'culling_open_4',
    title: 'Lesson 4: Escorted Warden Ratio Advance',
    subtitle: 'March Nanami behind a central pawn escort while neutralizing enemy Rusher outposts',
    namedStrategy: '7:3 Ratio Phalanx',
    curriculumType: 'opening',
    tier: 'intermediate',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Warden Nanami’s Ratio Field cripples any non-Skirmisher within 1 square—but Nanami costs 4.5 points! Never march your Warden naked in front of pawns. Advance pawns first, escort Nanami behind them, and kick intruders away with pawns.',
    completionMessage:
      'Clinical Warden progression! Nanami stands entrenched on D3 behind a fortified D4–E3–F3–G4 pawn phalanx while Black’s invading Rusher has been forced off F5.',
    patternHighlights: [
      { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 3 }, { x: 7, y: 4 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 4, y: 2 },
        to: { x: 4, y: 3 },
        actionType: 'move',
        notation: 'D2 → D3 (Warden Vanguard Escort)',
        tukunaInstruction:
          'Push your D2 pawn to D3 to clear D2 for Warden Nanami.',
        tacticalBreakdown:
          'Opening D2 lets Nanami step up orthogonally while keeping a pawn directly in front of him.',
        hint: 'Advance the D2 pawn to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'emerald', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 8 },
          to: { x: 8, y: 7 },
          commentary: 'Black slides Rusher Kurourushi to H7, preparing a diagonal strike toward the center.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 4, y: 1 },
        to: { x: 4, y: 2 },
        actionType: 'move',
        notation: 'Nanami D1 → D2 (Warden Step)',
        tukunaInstruction:
          'Step Warden Nanami from D1 to D2 directly behind your D3 pawn.',
        tacticalBreakdown:
          'Nanami slides up to 3 orthogonally. Positioning on D2 prepares him to escort D3 → D4.',
        hint: 'Move Nanami from D1 up to D2.',
        vectorArrows: [
          { from: { x: 4, y: 1 }, to: { x: 4, y: 2 }, color: 'emerald', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 8, y: 7 },
          to: { x: 6, y: 5 },
          commentary: 'Kurourushi slides 2 squares diagonally H7 → F5, eyeing central squares D3, E4, and G4!',
        },
      },
      {
        stepNumber: 3,
        from: { x: 5, y: 2 },
        to: { x: 5, y: 3 },
        actionType: 'move',
        notation: 'E2 → E3 (Blocking the F5–D3 Diagonal!)',
        tukunaInstruction:
          'Kurourushi on F5 is aiming down the F5–E4–D3 diagonal! Push E2 → E3 to reinforce D4 and blunt Black’s center.',
        tacticalBreakdown:
          'E3 controls D4 and F4 while working alongside C2 and Nanami (D2) to shut down Kurourushi’s diagonal lanes.',
        hint: 'Push the E2 pawn to E3.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 3 }, color: 'emerald', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 },
          to: { x: 5, y: 6 },
          commentary: 'Black pushes E7 → E6 to anchor Kurourushi’s F5 outpost!',
        },
      },
      {
        stepNumber: 4,
        from: { x: 6, y: 2 },
        to: { x: 6, y: 3 },
        actionType: 'move',
        notation: 'F2 → F3 (Caging the F5 Rusher)',
        tukunaInstruction:
          'Push F2 → F3! Together with E3, this shuts off E4 and G4 so Kurourushi on F5 cannot slide deeper.',
        tacticalBreakdown:
          'F3 also prepares a supported G2 → G3 → G4 pawn lever to evict Kurourushi from F5.',
        hint: 'Advance the F2 pawn to F3.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 6, y: 3 }, color: 'emerald', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 },
          to: { x: 4, y: 6 },
          commentary: 'Black reinforces the central column with D7 → D6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 4, y: 3 },
        to: { x: 4, y: 4 },
        actionType: 'move',
        notation: 'D3 → D4 (Escorted Central Push)',
        tukunaInstruction:
          'Advance D3 → D4, double-supported by your E3 pawn and Warden Nanami on D2.',
        tacticalBreakdown:
          'Pushing D4 claims central territory and vacates D3 as a heavily fortified third-rank perch for Nanami.',
        hint: 'Push the D3 pawn forward to D4.',
        vectorArrows: [
          { from: { x: 4, y: 3 }, to: { x: 4, y: 4 }, color: 'emerald', label: '5', style: 'solid' },
          { from: { x: 5, y: 3 }, to: { x: 4, y: 4 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 },
          to: { x: 3, y: 6 },
          commentary: 'Black plays C7 → C6 to contest your D4 spearhead.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 7, y: 2 },
        to: { x: 7, y: 3 },
        actionType: 'move',
        notation: 'G2 → G3 (Preparing to Evict F5 First!)',
        tukunaInstruction:
          'Wait before stepping Nanami onto D3—Kurourushi on F5 still eyes D3 across empty E4! First push G2 → G3 to prepare a pawn eviction!',
        tacticalBreakdown:
          'Spotting that 3.5-point Kurourushi on F5 would threaten 4.5-point Nanami on D3 is elite threat awareness. Kick the Rusher away first!',
        hint: 'Advance the G2 pawn to G3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 7, y: 3 }, color: 'emerald', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 8 },
          to: { x: 5, y: 7 },
          commentary: 'Black develops Warden Reggie to E7.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 7, y: 3 },
        to: { x: 7, y: 4 },
        actionType: 'move',
        notation: 'G3 → G4 (Evicting the F5 Rusher!)',
        tukunaInstruction:
          'Thrust G3 → G4 (protected by F3), attacking Kurourushi on F5 and forcing Black’s Rusher off the central diagonal!',
        tacticalBreakdown:
          'Once Kurourushi retreats from F5, the F5–E4–D3 diagonal is completely neutralized.',
        hint: 'Push G3 to G4 to attack Kurourushi on F5.',
        vectorArrows: [
          { from: { x: 7, y: 3 }, to: { x: 7, y: 4 }, color: 'emerald', label: '7', style: 'solid' },
          { from: { x: 7, y: 4 }, to: { x: 6, y: 5 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 6, y: 5 },
          to: { x: 8, y: 7 },
          commentary: 'Driven back! Kurourushi retreats 2 squares diagonally from F5 to H7.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 4, y: 2 },
        to: { x: 4, y: 3 },
        actionType: 'move',
        notation: 'Nanami D2 → D3 (Safe Third-Rank Ratio Command)',
        tukunaInstruction:
          'With F5 cleared, step Warden Nanami onto D3 behind your D4 pawn! His Ratio Field now dominates C4, D4, and E4 with zero risk.',
        tacticalBreakdown:
          'Eliminating enemy threats BEFORE advancing high-value sorcerers guarantees an unbreakable position.',
        hint: 'Step Nanami forward from D2 to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'emerald', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_open_5',
    title: 'Lesson 5: Rusher Hit-and-Run Jackpot vs. Defended Pawn',
    subtitle: 'Exploit Hakari’s Jackpot Safe Step to snatch a double-defended pawn without being recaptured',
    namedStrategy: 'Idle Death Gamble Hit-and-Run',
    curriculumType: 'opening',
    tier: 'intermediate',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Why is Rusher Hakari uniquely feared in the opening? Normally, capturing a pawn defended by two enemy pawns loses your 3.5-point piece. Watch how Hakari captures on C5, triggers Jackpot, and steps to safety BEFORE Black even gets a turn!',
    completionMessage:
      'Pure Jackpot mastery! You won Black’s double-defended C5 spearhead pawn and retreated to B4 on the exact same turn, leaving Black’s B6 and D6 pawns punching empty air.',
    patternHighlights: [
      { x: 1, y: 3 }, { x: 3, y: 5 }, { x: 2, y: 4 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 2, y: 2 },
        to: { x: 2, y: 3 },
        actionType: 'move',
        notation: 'B2 → B3 (Opening the Rusher Pocket)',
        tukunaInstruction:
          'Advance B2 → B3 to vacate B2 for Rusher Hakari while keeping the B4 diagonal lane clear.',
        tacticalBreakdown:
          'Rushers slide up to 2 diagonally without leaping, so keeping diagonal corridors open is essential.',
        hint: 'Push the B2 pawn to B3.',
        vectorArrows: [
          { from: { x: 2, y: 2 }, to: { x: 2, y: 3 }, color: 'emerald', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 },
          to: { x: 3, y: 6 },
          commentary: 'Black advances C7 → C6, preparing an ambitious queenside space push.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 2, y: 1 },
        to: { x: 2, y: 2 },
        actionType: 'move',
        notation: 'Hakari B1 → B2 (Staging on B2)',
        tukunaInstruction:
          'Step Hakari orthogonally from B1 to B2.',
        tacticalBreakdown:
          'From B2, Hakari can pivot to A3 or slide diagonally toward the center once Black overextends.',
        hint: 'Move Hakari from B1 to B2.',
        vectorArrows: [
          { from: { x: 2, y: 1 }, to: { x: 2, y: 2 }, color: 'emerald', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 6 },
          to: { x: 3, y: 5 },
          commentary: 'Black pushes C6 → C5 to seize early queenside space!',
        },
      },
      {
        stepNumber: 3,
        from: { x: 3, y: 2 },
        to: { x: 3, y: 3 },
        actionType: 'move',
        notation: 'C2 → C3 (Fortifying Rank 3)',
        tukunaInstruction:
          'Play C2 → C3 to solidify Rank 3 and keep B4 open as a future diagonal thoroughfare.',
        tacticalBreakdown:
          'Notice how B3 and C3 sit side-by-side while leaving B4 unobstructed for diagonal Rusher slides.',
        hint: 'Advance the C2 pawn to C3.',
        vectorArrows: [
          { from: { x: 3, y: 2 }, to: { x: 3, y: 3 }, color: 'emerald', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 },
          to: { x: 4, y: 6 },
          commentary: 'Black defends the C5 pawn with D7 → D6.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 4, y: 2 },
        to: { x: 4, y: 3 },
        actionType: 'move',
        notation: 'D2 → D3 (Central Reinforcement)',
        tukunaInstruction:
          'Push D2 → D3 to guard C4 and E4 while letting Black commit further to the C5 wedge.',
        tacticalBreakdown:
          'Solid pawn structure ensures Black has zero counter-tactics when Hakari strikes.',
        hint: 'Move the D2 pawn to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'emerald', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 },
          to: { x: 2, y: 6 },
          commentary: 'Black plays B7 → B6—now C5 is double-defended by BOTH B6 and D6 pawns!',
        },
      },
      {
        stepNumber: 5,
        from: { x: 5, y: 2 },
        to: { x: 5, y: 3 },
        actionType: 'move',
        notation: 'E2 → E3 (Completing the Shield)',
        tukunaInstruction:
          'Advance E2 → E3 to complete your central wall before springing the trap.',
        tacticalBreakdown:
          'Black assumes C5 is untouchable because two pawns guard it. Next move we line up the diagonal!',
        hint: 'Push the E2 pawn to E3.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 3 }, color: 'emerald', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 },
          to: { x: 2, y: 7 },
          commentary: 'Black calmly develops Kenjaku to B7, certain that C5 is rock-solid.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 2, y: 2 },
        to: { x: 1, y: 3 },
        actionType: 'move',
        notation: 'Hakari B2 → A3 (Lining Up the A3–B4–C5 Diagonal)',
        tukunaInstruction:
          'Slide Hakari 1 square diagonally from B2 to A3, aiming straight up the open A3–B4–C5 diagonal!',
        tacticalBreakdown:
          'From A3, Hakari sits outside all enemy threats while locking onto C5 across empty B4.',
        hint: 'Move Hakari diagonally from B2 to A3.',
        vectorArrows: [
          { from: { x: 2, y: 2 }, to: { x: 1, y: 3 }, color: 'emerald', label: '6', style: 'solid' },
          { from: { x: 1, y: 3 }, to: { x: 3, y: 5 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 },
          to: { x: 5, y: 6 },
          commentary: 'Black pushes E7 → E6, missing the Jackpot hit-and-run mechanic!',
        },
      },
      {
        stepNumber: 7,
        from: { x: 1, y: 3 },
        to: { x: 3, y: 5 },
        actionType: 'move',
        notation: 'Hakari A3 × C5 (Jackpot Capture!)',
        tukunaInstruction:
          'Strike! Slide Hakari 2 squares diagonally A3 × C5 to capture Black’s C5 pawn and trigger JACKPOT!',
        tacticalBreakdown:
          'Capturing with a Rusher grants an immediate same-turn 1-square Safe Step to any empty unattacked square BEFORE Black can recapture!',
        hint: 'Capture the Black Pawn on C5 with Hakari from A3.',
        vectorArrows: [
          { from: { x: 1, y: 3 }, to: { x: 3, y: 5 }, color: 'emerald', label: '7', style: 'solid' },
        ],
      },
      {
        stepNumber: 8,
        from: { x: 3, y: 5 },
        to: { x: 2, y: 4 },
        actionType: 'move',
        notation: 'Hakari C5 → B4 (Jackpot Safe Step Escape!)',
        tukunaInstruction:
          'JACKPOT ACTIVE! Immediately use your bonus Safe Step to glide Hakari from C5 back to B4—out of reach of Black’s B6 and D6 pawns!',
        tacticalBreakdown:
          'You won a central pawn for free AND parked Hakari on B4 defended by your C3 pawn. That is true Rusher mastery!',
        hint: 'Step Hakari diagonally back from C5 to the unattacked B4 square.',
        vectorArrows: [
          { from: { x: 3, y: 5 }, to: { x: 2, y: 4 }, color: 'emerald', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_open_6',
    title: 'Lesson 6: Dual Colony Arm Control & Gate Seal',
    subtitle: 'Seal the Right Colony Arm against Kurourushi while seizing the Left Arm with Hakari & Maki',
    namedStrategy: 'Twin Colony Gate Clamp',
    curriculumType: 'opening',
    tier: 'intermediate',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'The 88-square Culling Game board adds Left (L2..L7) and Right (R2..R7) Colony Arms. If an enemy Rusher enters R6, seal the gate with Artillery overwatch—while infiltrating the opposite arm safely!',
    completionMessage:
      'Total perimeter dominance! Mechamaru locked down the Right Colony Arm from H3 while Hakari and Maki claimed an unassailable western stronghold.',
    patternHighlights: [
      { x: 8, y: 3 }, { x: 0, y: 3 }, { x: 1, y: 4 }, { x: 3, y: 3 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 2, y: 1 },
        to: { x: 1, y: 2 },
        actionType: 'move',
        notation: 'Hakari B1 → A2 (Western Gate Pivot)',
        tukunaInstruction:
          'Slide Rusher Hakari 1 square diagonally from B1 to empty A2, aiming toward the Left Colony Arm.',
        tacticalBreakdown:
          'A2 starts empty in Culling Game setups—making B1 → A2 → L3 the fastest, safest route into the Left Arm.',
        hint: 'Move Hakari diagonally from B1 to A2.',
        vectorArrows: [
          { from: { x: 2, y: 1 }, to: { x: 1, y: 2 }, color: 'emerald', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 8 },
          to: { x: 8, y: 7 },
          commentary: 'Black mirrors on the east, sliding Rusher Kurourushi from G8 to H7!',
        },
      },
      {
        stepNumber: 2,
        from: { x: 7, y: 2 },
        to: { x: 7, y: 3 },
        actionType: 'move',
        notation: 'G2 → G3 (Opening Eastern Overwatch)',
        tukunaInstruction:
          'Push G2 → G3 immediately so Mechamaru can step out to seal the Right Colony Arm.',
        tacticalBreakdown:
          'Spotting Kurourushi on H7 tells you Black plans H7 → R6. Prepare the counter-deployment before Black reaches R4.',
        hint: 'Advance the G2 pawn to G3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 7, y: 3 }, color: 'emerald', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 8, y: 7 },
          to: { x: 9, y: 6 },
          commentary: 'Kurourushi enters the Right Colony Arm at R6!',
        },
      },
      {
        stepNumber: 3,
        from: { x: 6, y: 1 },
        to: { x: 7, y: 2 },
        actionType: 'move',
        notation: 'Mechamaru F1 → G2 (Rotating Artillery East)',
        tukunaInstruction:
          'Step Artillery Mechamaru diagonally from F1 to G2 to intercept Black’s Right-Arm incursion.',
        tacticalBreakdown:
          'Artillery is the ultimate gatekeeper: its 1-step perimeter and 2-square Ranged Strike lock down narrow Colony Arm bottlenecks.',
        hint: 'Move Mechamaru from F1 to G2.',
        vectorArrows: [
          { from: { x: 6, y: 1 }, to: { x: 7, y: 2 }, color: 'emerald', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 9, y: 6 },
          to: { x: 9, y: 5 },
          commentary: 'Kurourushi creeps down the Right Arm to R5!',
        },
      },
      {
        stepNumber: 4,
        from: { x: 7, y: 2 },
        to: { x: 8, y: 3 },
        actionType: 'move',
        notation: 'Mechamaru G2 → H3 (Right Gate Seal!)',
        tukunaInstruction:
          'Step Mechamaru to H3! From H3, Mechamaru controls R4, H4, and H5 (via Ranged Strike), completely sealing the Right Colony Gate!',
        tacticalBreakdown:
          'Kurourushi on R5 cannot hit H3, cannot step onto R4 or H4, and cannot step onto H5 without getting sniped from H3!',
        hint: 'Step Mechamaru diagonally from G2 to H3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 8, y: 3 }, color: 'emerald', label: '4', style: 'solid' },
          { from: { x: 8, y: 3 }, to: { x: 9, y: 4 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 9, y: 5 },
          to: { x: 9, y: 6 },
          commentary: 'Shut out! Seeing R4, H4, and H5 locked down by Mechamaru, Kurourushi retreats to R6!',
        },
      },
      {
        stepNumber: 5,
        from: { x: 1, y: 2 },
        to: { x: 0, y: 3 },
        actionType: 'move',
        notation: 'Hakari A2 → L3 (Left Arm Deployment)',
        tukunaInstruction:
          'With the Right Gate sealed, slide Hakari diagonally from A2 into the Left Colony Arm at L3.',
        tacticalBreakdown:
          'From L3, Hakari commands the A4–B5 diagonal while remaining untouched by Black’s central pawns.',
        hint: 'Slide Hakari diagonally from A2 to L3.',
        vectorArrows: [
          { from: { x: 1, y: 2 }, to: { x: 0, y: 3 }, color: 'emerald', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 },
          to: { x: 3, y: 6 },
          commentary: 'Black pushes C7 → C6 to guard B5.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 3, y: 1 },
        to: { x: 3, y: 3 },
        actionType: 'move',
        notation: 'Maki C1 → C3 (Western Tandem Hop)',
        tukunaInstruction:
          'Hop Skirmisher Maki 2 squares orthogonally from C1 over C2 onto C3 to team up with Hakari.',
        tacticalBreakdown:
          'Coordinating a Rusher in the Left Arm with a Skirmisher on the C-file creates tremendous queenside pressure.',
        hint: 'Hop Maki from C1 to C3.',
        vectorArrows: [
          { from: { x: 3, y: 1 }, to: { x: 3, y: 3 }, color: 'emerald', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 },
          to: { x: 2, y: 6 },
          commentary: 'Black reinforces the B-file with B7 → B6.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 2, y: 2 },
        to: { x: 2, y: 3 },
        actionType: 'move',
        notation: 'B2 → B3 (Preparing the A4 Anchor)',
        tukunaInstruction:
          'Push B2 → B3 so that A4 is firmly protected by a friendly pawn before Hakari steps onto it!',
        tacticalBreakdown:
          'Always establish pawn support on Rank 3 before stationing a sorcerer on Rank 4.',
        hint: 'Advance the B2 pawn to B3.',
        vectorArrows: [
          { from: { x: 2, y: 2 }, to: { x: 2, y: 3 }, color: 'emerald', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 },
          to: { x: 5, y: 6 },
          commentary: 'Black plays E7 → E6 in the center.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 0, y: 3 },
        to: { x: 1, y: 4 },
        actionType: 'move',
        notation: 'Hakari L3 → A4 (Anchored Flank Outpost)',
        tukunaInstruction:
          'Step Hakari diagonally from L3 onto A4—supported by your B3 pawn and safely clear of Black’s B6/C6 pawns!',
        tacticalBreakdown:
          'Both Colony Gates now belong to White: Mechamaru locks down H3 on the right while Hakari & Maki dominate A4/C3 on the left.',
        hint: 'Move Hakari diagonally from L3 to A4.',
        vectorArrows: [
          { from: { x: 0, y: 3 }, to: { x: 1, y: 4 }, color: 'emerald', label: '8', style: 'solid' },
          { from: { x: 2, y: 3 }, to: { x: 1, y: 4 }, color: 'navy', style: 'dashed' },
        ],
      },
    ],
  },

  {
    id: 'culling_open_7',
    title: 'Lesson 7: Artillery Snipe Corridor & Counter-Battery',
    subtitle: 'Punish overextended invaders with Mechamaru’s 2-square Ranged Strike without exposing your shooter',
    namedStrategy: 'Ultimate Mechamaru Cannon Line',
    curriculumType: 'opening',
    tier: 'advanced',
    playerColor: 'white',
    initialBoard: createLesson7Board(),
    tukunaGreeting:
      'Look at F4: Black’s Skirmisher Naoya hopped too far forward! Artillery Mechamaru on F2 can fire a 2-square Ranged Strike across empty F3—eliminating Naoya while remaining safely stationed behind your lines!',
    completionMessage:
      'Devastating Artillery precision! You punished two separate F-file intrusions with Ranged Strikes while building an impenetrable Yuji + Mechamaru vertical battery.',
    patternHighlights: [
      { x: 6, y: 2 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 5 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 6, y: 2 },
        to: { x: 6, y: 4 },
        actionType: 'shoot',
        notation: 'Mechamaru F2 🏹 F4 (Ranged Strike Punish!)',
        tukunaInstruction:
          'Select Mechamaru on F2 and execute a Ranged Strike on F4! Because F3 is empty, Mechamaru vaporizes Black’s 3.5-point Skirmisher without moving off F2!',
        tacticalBreakdown:
          'Artillery Ranged Strike eliminates enemies at exact distance 2 orthogonally or diagonally across an empty middle square—risking zero counter-capture.',
        hint: 'Click Mechamaru on F2, then click Naoya on F4 to fire Ranged Strike.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 6, y: 4 }, color: 'emerald', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 },
          to: { x: 6, y: 6 },
          commentary: 'Reeling from losing Naoya, Black pushes F7 → F6 to contest the F-column.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 7, y: 2 },
        to: { x: 7, y: 3 },
        actionType: 'move',
        notation: 'G2 → G3 (Flank Reinforcement)',
        tukunaInstruction:
          'Advance G2 → G3 to secure G2 for Vanguard Yuji and shield Gojo’s kingside.',
        tacticalBreakdown:
          'Even when ahead by a full piece, keep reinforcing your pawn shield so the opponent gets zero counterplay.',
        hint: 'Push the G2 pawn to G3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 7, y: 3 }, color: 'emerald', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 8 },
          to: { x: 5, y: 6 },
          commentary: 'Black slides Warden Reggie from E8 to E6 to pressure your E4 pawn!',
        },
      },
      {
        stepNumber: 3,
        from: { x: 4, y: 2 },
        to: { x: 4, y: 3 },
        actionType: 'move',
        notation: 'D2 → D3 (Defending the E4 Spearhead)',
        tukunaInstruction:
          'Protect your E4 pawn immediately by pushing D2 → D3!',
        tacticalBreakdown:
          'D3 anchors E4 with a pawn while opening D2 for Warden Nanami.',
        hint: 'Advance the D2 pawn to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'emerald', label: '3', style: 'solid' },
          { from: { x: 4, y: 3 }, to: { x: 5, y: 4 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 },
          to: { x: 2, y: 6 },
          commentary: 'Black pushes B7 → B6 on the queenside.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 7, y: 1 },
        to: { x: 7, y: 2 },
        actionType: 'move',
        notation: 'Yuji G1 → G2 (Vanguard Overwatch)',
        tukunaInstruction:
          'Step Vanguard Yuji from G1 to G2 behind your G3 pawn.',
        tacticalBreakdown:
          'Yuji on G2 supports F3 and H3 while preparing to double on the open F-file behind Mechamaru.',
        hint: 'Move Yuji from G1 to G2.',
        vectorArrows: [
          { from: { x: 7, y: 1 }, to: { x: 7, y: 2 }, color: 'emerald', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 },
          to: { x: 2, y: 7 },
          commentary: 'Black develops Vanguard Kenjaku to B7.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 6, y: 2 },
        to: { x: 6, y: 3 },
        actionType: 'move',
        notation: 'Mechamaru F2 → F3 (Advancing the Firing Line)',
        tukunaInstruction:
          'Step Mechamaru forward from F2 to F3 (defended by Yuji on G2 and supporting E4)!',
        tacticalBreakdown:
          'On F3, Mechamaru is guarded by Yuji and aims a 2-square Ranged Strike at D5, F5, and H5!',
        hint: 'Step Mechamaru one square up from F2 to F3.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 6, y: 3 }, color: 'emerald', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 },
          to: { x: 3, y: 6 },
          commentary: 'Black plays C7 → C6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 4, y: 1 },
        to: { x: 4, y: 2 },
        actionType: 'move',
        notation: 'Nanami D1 → D2 (Warden Reserve)',
        tukunaInstruction:
          'Step Warden Nanami from D1 to D2 to reinforce your central column.',
        tacticalBreakdown:
          'Every White piece now stands harmoniously connected behind the D3–E4–G3 structure.',
        hint: 'Move Nanami from D1 to D2.',
        vectorArrows: [
          { from: { x: 4, y: 1 }, to: { x: 4, y: 2 }, color: 'emerald', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 6 },
          to: { x: 6, y: 5 },
          commentary: 'Black pushes F6 → F5 to attack your E4 pawn—forgetting Mechamaru’s firing range from F3!',
        },
      },
      {
        stepNumber: 7,
        from: { x: 6, y: 3 },
        to: { x: 6, y: 5 },
        actionType: 'shoot',
        notation: 'Mechamaru F3 🏹 F5 (Corridor Snipe!)',
        tukunaInstruction:
          'Fire Mechamaru’s Ranged Strike from F3 across empty F4 to obliterate Black’s F5 pawn!',
        tacticalBreakdown:
          'Even though Black’s Reggie on E6 defended F5 against normal captures, Ranged Strike destroys F5 from F3 without ever stepping onto F5!',
        hint: 'Select Mechamaru on F3 and click Black’s pawn on F5 to shoot.',
        vectorArrows: [
          { from: { x: 6, y: 3 }, to: { x: 6, y: 5 }, color: 'emerald', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 7 },
          to: { x: 7, y: 6 },
          commentary: 'With the F-file blasted wide open, Black plays G7 → G6 defensively.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 7, y: 2 },
        to: { x: 6, y: 2 },
        actionType: 'move',
        notation: 'Yuji G2 → F2 (Vertical Cannon & Vanguard Battery)',
        tukunaInstruction:
          'Step Yuji from G2 onto F2 directly behind Mechamaru to complete an unstoppable F-file battery!',
        tacticalBreakdown:
          'Stacking Yuji on F2 behind Mechamaru on F3 overprotects your Artillery and dominates the open F-column.',
        hint: 'Move Yuji laterally from G2 to F2.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 6, y: 2 }, color: 'emerald', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_open_8',
    title: 'Lesson 8: Domain Step Castling & H-File Reversal',
    subtitle: 'Evacuate Gojo over Yuji via Domain Step, then seize the H-file with Vanguard counter-pressure',
    namedStrategy: 'Limitless Castling Reversal',
    curriculumType: 'opening',
    tier: 'advanced',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Sovereign Gojo possesses a once-per-game Domain Step: a 2-square jump orthogonally or diagonally onto an empty unattacked square—even vaulting over friendly pieces! Watch how we "castle" Gojo from H1 to F1 and turn the H-file over to Yuji!',
    completionMessage:
      'Grandmaster-level reversal! By castling Gojo to F1 with Domain Step, you turned Black’s H-file attack lane into Yuji’s personal Black Flash hunting ground.',
    patternHighlights: [
      { x: 8, y: 1 }, { x: 6, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 4 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 6, y: 2 },
        to: { x: 6, y: 3 },
        actionType: 'move',
        notation: 'F2 → F3 (Preparing the F1 Sanctuary)',
        tukunaInstruction:
          'Advance F2 → F3 so Mechamaru can vacate F1 for Gojo’s Domain Step castling maneuver.',
        tacticalBreakdown:
          'F3 shields F2 while controlling E4 and G4.',
        hint: 'Push the F2 pawn to F3.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 6, y: 3 }, color: 'emerald', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 8 },
          to: { x: 8, y: 7 },
          commentary: 'Black slides Kurourushi to H7, preparing a heavy H-file battery aimed at Gojo on H1!',
        },
      },
      {
        stepNumber: 2,
        from: { x: 6, y: 1 },
        to: { x: 6, y: 2 },
        actionType: 'move',
        notation: 'Mechamaru F1 → F2 (Vacating F1)',
        tukunaInstruction:
          'Step Mechamaru from F1 up to F2, clearing F1 as a shielded sanctuary for Gojo.',
        tacticalBreakdown:
          'Once F1 is empty and unattacked, Gojo on H1 can leap straight over Yuji on G1 onto F1!',
        hint: 'Move Mechamaru from F1 to F2.',
        vectorArrows: [
          { from: { x: 6, y: 1 }, to: { x: 6, y: 2 }, color: 'emerald', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 8 },
          to: { x: 8, y: 8 },
          commentary: 'Black hops Naoya to H8 behind Kurourushi—doubling raiders on the H-column!',
        },
      },
      {
        stepNumber: 3,
        from: { x: 8, y: 1 },
        to: { x: 6, y: 1 },
        actionType: 'teleport',
        notation: 'Gojo H1 🌀 F1 (Domain Step Castling!)',
        tukunaInstruction:
          'Execute Gojo’s once-per-game Domain Step from H1 across G1 onto F1!',
        tacticalBreakdown:
          'In a single move, Gojo evacuates the H-column into the fortified F1 sanctuary behind Panda (E1), Mechamaru (F2), and F3—rendering Black’s H-file battery harmless against your Sovereign!',
        hint: 'Select Gojo on H1 and click F1 to perform Domain Step.',
        vectorArrows: [
          { from: { x: 8, y: 1 }, to: { x: 6, y: 1 }, color: 'emerald', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 8, y: 7 },
          to: { x: 8, y: 6 },
          commentary: 'Kurourushi advances to H6 anyway, trying to salvage Black’s flank initiative.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 7, y: 2 },
        to: { x: 7, y: 3 },
        actionType: 'move',
        notation: 'G2 → G3 (Securing H4 Control)',
        tukunaInstruction:
          'Push G2 → G3! Now your G3 pawn controls H4—providing pawn protection for Yuji to seize the H-file!',
        tacticalBreakdown:
          'G3 covers H4 while sealing the diagonal toward Gojo on F1.',
        hint: 'Advance the G2 pawn to G3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 7, y: 3 }, color: 'emerald', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 },
          to: { x: 5, y: 6 },
          commentary: 'Realizing H4 is covered by G3, Black plays E7 → E6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 7, y: 1 },
        to: { x: 8, y: 2 },
        actionType: 'move',
        notation: 'Yuji G1 → H2 (Vanguard Seizes the H-File)',
        tukunaInstruction:
          'Step Vanguard Yuji diagonally from G1 onto H2—claiming the open H-file with your 8-point powerhouse!',
        tacticalBreakdown:
          'With Gojo safely castled on F1, the H-file transforms from a defensive liability into Yuji’s open highway.',
        hint: 'Move Yuji diagonally from G1 to H2.',
        vectorArrows: [
          { from: { x: 7, y: 1 }, to: { x: 8, y: 2 }, color: 'emerald', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 8, y: 8 },
          to: { x: 6, y: 8 },
          commentary: 'Black aborts the H-file plan, hopping Naoya back from H8 to F8.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 5, y: 2 },
        to: { x: 5, y: 3 },
        actionType: 'move',
        notation: 'E2 → E3 (Central Shield Extension)',
        tukunaInstruction:
          'Push E2 → E3 to extend Gojo’s central shield across E3–F3–G3.',
        tacticalBreakdown:
          'Gojo on F1 now enjoys a triple-layered shelter of pawns and pieces.',
        hint: 'Advance the E2 pawn to E3.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 3 }, color: 'emerald', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 },
          to: { x: 4, y: 6 },
          commentary: 'Black pushes D7 → D6.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 5, y: 1 },
        to: { x: 4, y: 3 },
        actionType: 'move',
        notation: 'Panda E1 → D3 (Central Bulwark Development)',
        tukunaInstruction:
          'Develop Bulwark Panda from E1 to D3 to connect your entire back rank.',
        tacticalBreakdown:
          'Every minor and major sorcerer on your eastern half is now actively developed and completely safe.',
        hint: 'Jump Panda from E1 to D3.',
        vectorArrows: [
          { from: { x: 5, y: 1 }, to: { x: 4, y: 3 }, color: 'emerald', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 8 },
          to: { x: 5, y: 7 },
          commentary: 'Black develops Warden Reggie to E7—leaving Kurourushi exposed on H6!',
        },
      },
      {
        stepNumber: 8,
        from: { x: 8, y: 2 },
        to: { x: 8, y: 4 },
        actionType: 'move',
        notation: 'Yuji H2 → H4 (Protected Thrust — Threatening H6!)',
        tukunaInstruction:
          'Slide Yuji 2 squares up the H-file from H2 to H4 (guarded by your G3 pawn), threatening an unstoppable 2-square Black Flash on Kurourushi at H6!',
        tacticalBreakdown:
          'Yuji on H4 is protected by G3, untouched by any Black pawn or sorcerer, and forces Kurourushi to flee H6 immediately!',
        hint: 'Slide Yuji from H2 up to H4.',
        vectorArrows: [
          { from: { x: 8, y: 2 }, to: { x: 8, y: 4 }, color: 'emerald', label: '8', style: 'solid' },
          { from: { x: 8, y: 4 }, to: { x: 8, y: 6 }, color: 'navy', style: 'dashed' },
        ],
      },
    ],
  },

  // =========================================================================
  // MID-GAME STRATEGY CURRICULUM (Lessons 9 - 16: 8 Steps Each)
  // =========================================================================

  {
    id: 'culling_mid_1',
    title: 'Lesson 9: Vanguard Black Flash Strike-in-Place',
    subtitle: 'Eliminate pawn-protected enemy pieces from 2 squares away without stepping into pawn recapture',
    namedStrategy: 'Divergent Fist Black Flash',
    curriculumType: 'midgame',
    tier: 'beginner',
    playerColor: 'white',
    initialBoard: createMidLesson1Board(),
    tukunaGreeting:
      'Study F5 carefully: Black’s Skirmisher Naoya (3.5pt) is defended by Black’s G6 pawn (1pt). If Yuji captured normally by landing on F5, G6×F5 would cost you an 8-point Vanguard! Instead, Yuji’s exact 2-square Black Flash strikes in place—destroying Naoya while staying safely on F3!',
    completionMessage:
      'Flawless Black Flash execution! You won a full Skirmisher without ever exposing your 8-point Vanguard to Black’s G6 pawn, then capped off the sequence with a diagonal Ranged Strike.',
    patternHighlights: [
      { x: 6, y: 3 }, { x: 6, y: 5 }, { x: 4, y: 4 }, { x: 5, y: 3 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 6, y: 3 },
        to: { x: 6, y: 5 },
        actionType: 'black_flash',
        notation: 'Yuji F3 ⚡ F5 (Black Flash Strike-in-Place!)',
        tukunaInstruction:
          'Unleash Yuji’s Black Flash from F3 onto Naoya at F5! Because F4 is empty and F5 is exactly 2 squares away, Yuji obliterates Naoya without stepping into Black’s G6 pawn!',
        tacticalBreakdown:
          'Vanguard captures at exact distance 2 trigger Black Flash (strike-in-place). Distance 1 or 3 captures move onto the target square—so maintaining exact 2-square spacing is priceless!',
        hint: 'Select Yuji on F3 and click Naoya on F5 to execute Black Flash.',
        vectorArrows: [
          { from: { x: 6, y: 3 }, to: { x: 6, y: 5 }, color: 'emerald', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 6 },
          to: { x: 5, y: 5 },
          commentary: 'Stung by losing Naoya, Black pushes E6 → E5 to contest central lines!',
        },
      },
      {
        stepNumber: 2,
        from: { x: 4, y: 3 },
        to: { x: 4, y: 4 },
        actionType: 'move',
        notation: 'D3 → D4 (Challenging the E5 Pawn)',
        tukunaInstruction:
          'Challenge Black’s E5 pawn immediately with D3 → D4 (supported by your C3 and E3 pawns)!',
        tacticalBreakdown:
          'When ahead in material, use supported pawn levers to pry open lines for your superior pieces.',
        hint: 'Push the D3 pawn to D4.',
        vectorArrows: [
          { from: { x: 4, y: 3 }, to: { x: 4, y: 4 }, color: 'emerald', label: '2', style: 'solid' },
          { from: { x: 4, y: 4 }, to: { x: 5, y: 5 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 5, y: 5 },
          to: { x: 4, y: 4 },
          commentary: 'Black exchanges E5 × D4, hoping to break up your center.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 5, y: 3 },
        to: { x: 4, y: 4 },
        actionType: 'move',
        notation: 'E3 × D4 (Recapturing Toward the Center)',
        tukunaInstruction:
          'Recapture on D4 with your E3 pawn (E3 × D4), opening the E-column while maintaining a central spearhead!',
        tacticalBreakdown:
          'Recapturing with a pawn keeps Yuji safely behind the line and opens the E-file toward Black’s Warden Reggie on E7.',
        hint: 'Capture Black’s pawn on D4 with your E3 pawn.',
        vectorArrows: [
          { from: { x: 5, y: 3 }, to: { x: 4, y: 4 }, color: 'emerald', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 },
          to: { x: 5, y: 6 },
          commentary: 'Black steps Warden Reggie forward to E6 to guard the open E-column.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 4, y: 1 },
        to: { x: 4, y: 3 },
        actionType: 'move',
        notation: 'Nanami D1 → D3 (Warden Column Lift)',
        tukunaInstruction:
          'Slide Warden Nanami 2 squares orthogonally from D1 to D3 behind your D4 pawn!',
        tacticalBreakdown:
          'Nanami overprotects D4 and anchors your central pawn structure.',
        hint: 'Slide Nanami from D1 up to D3.',
        vectorArrows: [
          { from: { x: 4, y: 1 }, to: { x: 4, y: 3 }, color: 'emerald', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 8 },
          to: { x: 8, y: 7 },
          commentary: 'Black activates Rusher Kurourushi to H7 on the eastern flank.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 6, y: 2 },
        to: { x: 5, y: 2 },
        actionType: 'move',
        notation: 'Mechamaru F2 → E2 (Rotating Artillery to Open File)',
        tukunaInstruction:
          'Shift Artillery Mechamaru laterally from F2 to E2 to prepare a third-rank firing post on E3.',
        tacticalBreakdown:
          'Placing Mechamaru on E3 between Nanami (D3) and Yuji (F3) creates a lethal 3-piece command line.',
        hint: 'Step Mechamaru left from F2 to E2.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 5, y: 2 }, color: 'emerald', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 8 },
          to: { x: 6, y: 7 },
          commentary: 'Black jumps Bulwark Yorozu from D8 to F7.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 5, y: 2 },
        to: { x: 5, y: 3 },
        actionType: 'move',
        notation: 'Mechamaru E2 → E3 (Central Firing Perch)',
        tukunaInstruction:
          'Step Mechamaru up to E3—flanked by Nanami on D3 and Yuji on F3!',
        tacticalBreakdown:
          'From E3, Mechamaru aims 2-square Ranged Strikes at C5, E5, and G5 across empty Rank 4 squares!',
        hint: 'Step Mechamaru forward from E2 to E3.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 3 }, color: 'emerald', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 8, y: 7 },
          to: { x: 8, y: 6 },
          commentary: 'Kurourushi advances to H6.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 7, y: 3 },
        to: { x: 7, y: 4 },
        actionType: 'move',
        notation: 'G3 → G4 (Kingside Clamp)',
        tukunaInstruction:
          'Push G3 → G4 (protected by Yuji on F3) to clamp down on H5 and challenge Black’s kingside.',
        tacticalBreakdown:
          'G4 shuts down Kurourushi’s H6–G5–F4 diagonal.',
        hint: 'Advance the G3 pawn to G4.',
        vectorArrows: [
          { from: { x: 7, y: 3 }, to: { x: 7, y: 4 }, color: 'emerald', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 6 },
          to: { x: 7, y: 5 },
          commentary: 'Black blocks with G6 → G5—walking straight into Mechamaru’s E3–F4–G5 diagonal firing line!',
        },
      },
      {
        stepNumber: 8,
        from: { x: 5, y: 3 },
        to: { x: 7, y: 5 },
        actionType: 'shoot',
        notation: 'Mechamaru E3 🏹 G5 (Diagonal Ranged Strike!)',
        tukunaInstruction:
          'Finish the lesson in style! Fire Mechamaru’s diagonal Ranged Strike from E3 across empty F4 to snipe Black’s G5 pawn!',
        tacticalBreakdown:
          'Combining Black Flash on Step 1 with diagonal Artillery snipes on Step 8 dismantles pawn-protected formations without risking a single sorcerer.',
        hint: 'Select Mechamaru on E3 and click Black’s pawn on G5 to shoot.',
        vectorArrows: [
          { from: { x: 5, y: 3 }, to: { x: 7, y: 5 }, color: 'emerald', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_mid_2',
    title: 'Lesson 10: Artillery Battery & Diagonal Snipe',
    subtitle: 'Clear diagonal firing lanes via pawn exchange to snipe piece-defended targets from safety',
    namedStrategy: 'Diagonal Puppet Barrage',
    curriculumType: 'midgame',
    tier: 'intermediate',
    playerColor: 'white',
    initialBoard: createMidLesson2Board(),
    tukunaGreeting:
      'Artillery Mechamaru doesn’t only shoot straight—he also fires diagonally across any empty square! Watch how we snipe Black’s E4 pawn orthogonally, trade off our D4 pawn to vacate D4, and fire diagonally at C5!',
    completionMessage:
      'Brilliant lane clearance! By trading D4×C5 first, you opened the E3–D4–C5 diagonal so Mechamaru could snipe C5 right under Artillery Uraume’s nose.',
    patternHighlights: [
      { x: 5, y: 2 }, { x: 5, y: 4 }, { x: 5, y: 3 }, { x: 3, y: 5 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 5, y: 2 },
        to: { x: 5, y: 4 },
        actionType: 'shoot',
        notation: 'Mechamaru E2 🏹 E4 (Orthogonal Vanguard Snipe)',
        tukunaInstruction:
          'Fire Mechamaru’s orthogonal Ranged Strike from E2 across empty E3 to eliminate Black’s advanced E4 pawn!',
        tacticalBreakdown:
          'Eliminating Black’s E4 pawn removes all pressure against F3 and clears E3 for Mechamaru to step forward.',
        hint: 'Select Mechamaru on E2 and click Black’s pawn on E4.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 4 }, color: 'emerald', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 },
          to: { x: 2, y: 7 },
          commentary: 'Black develops Vanguard Kenjaku from B8 to B7.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 4, y: 4 },
        to: { x: 3, y: 5 },
        actionType: 'move',
        notation: 'D4 × C5 (Line-Clearing Pawn Exchange!)',
        tukunaInstruction:
          'Capture Black’s C5 pawn with your D4 pawn (D4 × C5) specifically to vacate the D4 square!',
        tacticalBreakdown:
          'Why trade pawns here? Because once D4 is empty, the E3–D4–C5 diagonal opens up for Mechamaru!',
        hint: 'Capture the C5 pawn with your D4 pawn.',
        vectorArrows: [
          { from: { x: 4, y: 4 }, to: { x: 3, y: 5 }, color: 'emerald', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 6 },
          to: { x: 3, y: 5 },
          commentary: 'Black recaptures B6 × C5, assuming Uraume on C7 keeps C5 completely safe.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 5, y: 2 },
        to: { x: 5, y: 3 },
        actionType: 'move',
        notation: 'Mechamaru E2 → E3 (Aiming Down E3–D4–C5)',
        tukunaInstruction:
          'Step Mechamaru up from E2 to E3! Notice the clear diagonal line of sight across empty D4 straight at C5!',
        tacticalBreakdown:
          'On E3, Mechamaru stands safely behind F3 while locking onto Black’s C5 pawn.',
        hint: 'Step Mechamaru forward from E2 to E3.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 3 }, color: 'emerald', label: '3', style: 'solid' },
          { from: { x: 5, y: 3 }, to: { x: 3, y: 5 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 6, y: 6 },
          to: { x: 6, y: 5 },
          commentary: 'Black pushes F6 → F5 on the kingside.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 5, y: 3 },
        to: { x: 3, y: 5 },
        actionType: 'shoot',
        notation: 'Mechamaru E3 🏹 C5 (Diagonal Snipe!)',
        tukunaInstruction:
          'Execute Mechamaru’s diagonal Ranged Strike from E3 across empty D4 to destroy Black’s C5 pawn!',
        tacticalBreakdown:
          'Even though Artillery Uraume on C7 aimed at C5, Mechamaru never steps onto C5—winning a second clean pawn!',
        hint: 'Select Mechamaru on E3 and click Black’s C5 pawn to shoot.',
        vectorArrows: [
          { from: { x: 5, y: 3 }, to: { x: 3, y: 5 }, color: 'emerald', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 },
          to: { x: 3, y: 6 },
          commentary: 'Black steps Uraume forward to C6 to plug the C-file.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 4, y: 2 },
        to: { x: 4, y: 4 },
        actionType: 'move',
        notation: 'Nanami D2 → D4 (Central Warden Dominance)',
        tukunaInstruction:
          'Slide Warden Nanami from D2 to D4—defended by both your C3 pawn and Mechamaru on E3!',
        tacticalBreakdown:
          'Because we cleared Black’s B6, C5, and E4 pawns, zero enemy pawns can challenge Nanami’s commanding D4 post!',
        hint: 'Slide Nanami 2 squares up from D2 to D4.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 4 }, color: 'emerald', label: '5', style: 'solid' },
          { from: { x: 3, y: 3 }, to: { x: 4, y: 4 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 },
          to: { x: 5, y: 6 },
          commentary: 'Black steps Warden Reggie to E6 defensively.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 5, y: 3 },
        to: { x: 6, y: 2 },
        actionType: 'move',
        notation: 'Mechamaru E3 → F2 (Pivoting Artillery Behind F3 Shield!)',
        tukunaInstruction:
          'Alert! Reggie on E6 just aimed 3 squares down the open E-file at Mechamaru on E3! Step Mechamaru diagonally back from E3 to F2 behind your F3 pawn!',
        tacticalBreakdown:
          'Never leave an undefended 4-point Artillery on an open column in front of a 4.5-point enemy Warden. Pivoting to F2 keeps your 2-pawn lead rock-solid!',
        hint: 'Step Mechamaru diagonally from E3 to F2.',
        vectorArrows: [
          { from: { x: 5, y: 3 }, to: { x: 6, y: 2 }, color: 'emerald', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 8 },
          to: { x: 8, y: 7 },
          commentary: 'With E3 evacuated, Black moves Kurourushi to H7.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 3, y: 1 },
        to: { x: 3, y: 2 },
        actionType: 'move',
        notation: 'Maki C1 → C2 (Connecting the Queenside)',
        tukunaInstruction:
          'Step Skirmisher Maki from C1 to C2 to reinforce your queenside second rank.',
        tacticalBreakdown:
          'From C2, Maki connects Hakari and prepares to vault over C3 whenever needed.',
        hint: 'Move Maki from C1 to C2.',
        vectorArrows: [
          { from: { x: 3, y: 1 }, to: { x: 3, y: 2 }, color: 'emerald', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 6 },
          to: { x: 7, y: 5 },
          commentary: 'Black advances G6 → G5.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 8, y: 1 },
        to: { x: 8, y: 2 },
        actionType: 'move',
        notation: 'Gojo H1 → H2 (Sovereign Consolidation)',
        tukunaInstruction:
          'Step Gojo from H1 to H2 to complete your two-pawn-up mid-game clamp.',
        tacticalBreakdown:
          'Up two central pawns with every piece protected, White owns a decisive strategic advantage.',
        hint: 'Step Gojo from H1 to H2.',
        vectorArrows: [
          { from: { x: 8, y: 1 }, to: { x: 8, y: 2 }, color: 'emerald', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_mid_3',
    title: 'Lesson 11: Ratio Field Suffocation Trap',
    subtitle: 'Clamp an invading 8-point Vanguard with Nanami’s Ratio Field from a double-pawn-defended square',
    namedStrategy: 'Overtime Ratio Clamp',
    curriculumType: 'midgame',
    tier: 'intermediate',
    playerColor: 'white',
    initialBoard: createMidLesson3Board(),
    tukunaGreeting:
      'Black’s 8-point Vanguard Kenjaku has raided into E5! Never throw an undefended piece at him—instead slide Warden Nanami (4.5pt) onto D4, DOUBLE-DEFENDED by your C3 and E3 pawns! Kenjaku cannot take Nanami without losing 8 points for 4.5, and Ratio Field strips Kenjaku down to 1-square steps!',
    completionMessage:
      'Masterclass in Ratio Field geometry! You suffocated Black’s 8-point Vanguard, chased him backward with pawns, and calmly sidestepped Black’s C5 counter-poke.',
    patternHighlights: [
      { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 4, y: 3 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 4, y: 2 },
        to: { x: 4, y: 4 },
        actionType: 'move',
        notation: 'Nanami D2 → D4 (Double-Defended Ratio Clamp!)',
        tukunaInstruction:
          'Slide Warden Nanami from D2 to D4! Protected by BOTH C3 and E3 pawns, Nanami projects his Ratio Field onto Kenjaku at E5!',
        tacticalBreakdown:
          'Inside Nanami’s Ratio Field, Kenjaku loses his 3-square slide and Black Flash, capped at a single 1-square retreat! And if Kenjaku captured D4, C3×D4 wins an 8-point Vanguard for 4.5!',
        hint: 'Slide Nanami 2 squares up from D2 to D4.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 4 }, color: 'emerald', label: '1', style: 'solid' },
          { from: { x: 4, y: 4 }, to: { x: 5, y: 5 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 5, y: 5 },
          to: { x: 5, y: 6 },
          commentary: 'Crippled to 1-square movement by Ratio Field, Kenjaku limps backward from E5 to E6!',
        },
      },
      {
        stepNumber: 2,
        from: { x: 6, y: 3 },
        to: { x: 6, y: 4 },
        actionType: 'move',
        notation: 'F3 → F4 (Advancing the Pawn Wave)',
        tukunaInstruction:
          'Push F3 → F4 (supported by E3 and Mechamaru on F2) to prepare a direct pawn chase against Kenjaku on E6!',
        tacticalBreakdown:
          'Note that Yuji on G2 still defends your G4 pawn vertically while F4 prepares F4 → F5.',
        hint: 'Advance the F3 pawn to F4.',
        vectorArrows: [
          { from: { x: 6, y: 3 }, to: { x: 6, y: 4 }, color: 'emerald', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 },
          to: { x: 4, y: 6 },
          commentary: 'Black plays D7 → D6 to cover E5.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 6, y: 4 },
        to: { x: 6, y: 5 },
        actionType: 'move',
        notation: 'F4 → F5 (Harassing the Enemy Vanguard!)',
        tukunaInstruction:
          'Push F4 → F5 (protected by your G4 pawn), directly attacking 8-point Kenjaku on E6!',
        tacticalBreakdown:
          'Using defended 1-point pawns to hound an 8-point Vanguard wins massive space and tempo for free.',
        hint: 'Push F4 to F5 to attack Kenjaku on E6.',
        vectorArrows: [
          { from: { x: 6, y: 4 }, to: { x: 6, y: 5 }, color: 'emerald', label: '3', style: 'solid' },
          { from: { x: 6, y: 5 }, to: { x: 5, y: 6 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 5, y: 6 },
          to: { x: 5, y: 7 },
          commentary: 'Forced back again! Kenjaku retreats onto E7 behind Black’s D6 pawn.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 7, y: 2 },
        to: { x: 7, y: 3 },
        actionType: 'move',
        notation: 'Yuji G2 → G3 (Reinforcing the Kingside Wedge)',
        tukunaInstruction:
          'Step Yuji from G2 to G3 directly behind your G4 pawn.',
        tacticalBreakdown:
          'Yuji on G3 overprotects F4, G4, and H4 while staying completely shielded.',
        hint: 'Step Yuji forward from G2 to G3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 7, y: 3 }, color: 'emerald', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 7 },
          to: { x: 7, y: 6 },
          commentary: 'Black pushes G7 → G6 to contest your F5 spearhead.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 6, y: 2 },
        to: { x: 6, y: 3 },
        actionType: 'move',
        notation: 'Mechamaru F2 → F3 (Supporting the Spearhead)',
        tukunaInstruction:
          'Step Mechamaru from F2 up to F3! Now Mechamaru supports E4 and aims Ranged Strikes up the F-column.',
        tacticalBreakdown:
          'Your heavy pieces march forward step-by-step behind the pawn wall, never ahead of it.',
        hint: 'Move Mechamaru from F2 to F3.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 6, y: 3 }, color: 'emerald', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 8 },
          to: { x: 8, y: 7 },
          commentary: 'Black develops Kurourushi to H7.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 5, y: 3 },
        to: { x: 5, y: 4 },
        actionType: 'move',
        notation: 'E3 → E4 (Rolling Central Wedge)',
        tukunaInstruction:
          'Advance E3 → E4 (protected by Nanami on D4 and Mechamaru on F3)!',
        tacticalBreakdown:
          'Your E4–F5–G4 pawn wedge cramps Black’s entire half of the board.',
        hint: 'Push the E3 pawn to E4.',
        vectorArrows: [
          { from: { x: 5, y: 3 }, to: { x: 5, y: 4 }, color: 'emerald', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 6 },
          to: { x: 3, y: 5 },
          commentary: 'Watch out! Black plays a smart countermove C6 → C5, attacking Warden Nanami on D4 with a 1-point pawn!',
        },
      },
      {
        stepNumber: 7,
        from: { x: 4, y: 4 },
        to: { x: 4, y: 3 },
        actionType: 'move',
        notation: 'Nanami D4 → D3 (Principled Retreat from Pawn Attack!)',
        tukunaInstruction:
          'Respect Black’s C5 pawn threat! Immediately step Nanami back from D4 to D3 so Black’s 1-point pawn cannot capture your 4.5-point Warden!',
        tacticalBreakdown:
          'Good players never leave a piece in front of an enemy pawn. On D3, Nanami stays completely safe while still guarding D4 and E3.',
        hint: 'Retreat Nanami one square from D4 to D3.',
        vectorArrows: [
          { from: { x: 4, y: 4 }, to: { x: 4, y: 3 }, color: 'emerald', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 8 },
          to: { x: 3, y: 7 },
          commentary: 'With Nanami safe, Black steps Artillery Uraume from C8 to C7.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 3, y: 3 },
        to: { x: 3, y: 4 },
        actionType: 'move',
        notation: 'C3 → C4 (Locking the Queenside)',
        tukunaInstruction:
          'Push C3 → C4 to freeze Black’s C5 pawn in its tracks and lock in your massive space advantage!',
        tacticalBreakdown:
          'From C4–E4–F5–G4, White controls four ranks of territory with zero hanging pieces.',
        hint: 'Advance the C3 pawn to C4.',
        vectorArrows: [
          { from: { x: 3, y: 3 }, to: { x: 3, y: 4 }, color: 'emerald', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_mid_4',
    title: 'Lesson 12: Defended Bulwark Shell Bait & Punish',
    subtitle: 'Use Panda’s intact Bulwark Shell to absorb an enemy strike and win the stranded attacker with a pawn',
    namedStrategy: 'Gorilla Core Counter-Bait',
    curriculumType: 'midgame',
    tier: 'advanced',
    playerColor: 'white',
    initialBoard: createMidLesson4Board(),
    tukunaGreeting:
      'Bulwark Panda starts with an intact Shell: the first enemy non-pawn strike cracks the Shell into Gorilla Mode WITHOUT capturing Panda, leaving the attacker stuck on its origin square! Watch how we trap Black’s invading Naoya on F4!',
    completionMessage:
      'Brilliant Bulwark mechanics! Panda’s Shell absorbed Naoya’s desperate strike, leaving Naoya stranded on F4 for your E3 pawn to capture cleanly—and then you wisely withdrew Gorilla-Mode Panda to safety!',
    patternHighlights: [
      { x: 6, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 4 }, { x: 4, y: 2 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 5, y: 1 },
        to: { x: 6, y: 3 },
        actionType: 'move',
        notation: 'Panda E1 → F3 (Intact-Shell Blockade!)',
        tukunaInstruction:
          'Leap Bulwark Panda from E1 onto F3 directly in front of Black’s invading Skirmisher Naoya on F4!',
        tacticalBreakdown:
          'Because Panda’s Shell is intact (and F3 is backed by E2, Mechamaru F1, and Yuji G2), Naoya cannot capture Panda on this turn!',
        hint: 'Jump Panda from E1 to F3.',
        vectorArrows: [
          { from: { x: 5, y: 1 }, to: { x: 6, y: 3 }, color: 'emerald', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 8 },
          to: { x: 8, y: 7 },
          commentary: 'Black slides Kurourushi to H7, keeping Naoya on F4.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 5, y: 2 },
        to: { x: 5, y: 3 },
        actionType: 'move',
        notation: 'E2 → E3 (Pawn Attack on Stranded Naoya!)',
        tukunaInstruction:
          'Push E2 → E3 to attack Naoya on F4 with a 1-point pawn!',
        tacticalBreakdown:
          'Cornered on F4, Naoya tries to smash through Panda on F3—falling straight into our Shell trap!',
        hint: 'Advance the E2 pawn to E3 to attack F4.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 3 }, color: 'emerald', label: '2', style: 'solid' },
          { from: { x: 5, y: 3 }, to: { x: 6, y: 4 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 6, y: 4 },
          to: { x: 6, y: 3 },
          commentary: 'CLANG! Naoya strikes Panda on F3, cracking Panda’s Shell into Gorilla Mode—but Naoya bounces back and stays stuck on F4!',
        },
      },
      {
        stepNumber: 3,
        from: { x: 5, y: 3 },
        to: { x: 6, y: 4 },
        actionType: 'move',
        notation: 'E3 × F4 (Winning the Rebounded Skirmisher!)',
        tukunaInstruction:
          'Capture Black’s stranded Skirmisher Naoya on F4 with your E3 pawn (E3 × F4)!',
        tacticalBreakdown:
          'Trading Panda’s replaceable Shell to win a full 3.5-point enemy Skirmisher with a 1-point pawn is massive profit.',
        hint: 'Capture Naoya on F4 with your E3 pawn.',
        vectorArrows: [
          { from: { x: 5, y: 3 }, to: { x: 6, y: 4 }, color: 'emerald', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 6 },
          to: { x: 5, y: 5 },
          commentary: 'Black lashes out with E6 → E5, challenging your F4 pawn!',
        },
      },
      {
        stepNumber: 4,
        from: { x: 6, y: 4 },
        to: { x: 5, y: 5 },
        actionType: 'move',
        notation: 'F4 × E5 (Central Pawn Capture)',
        tukunaInstruction:
          'Capture Black’s E5 pawn with your F4 pawn (F4 × E5)—do NOT jump broken-Shell Panda into D6’s pawn fire!',
        tacticalBreakdown:
          'Crucial detail: once Panda’s Shell is broken (Gorilla Mode), Panda can be captured normally! Never jump a broken-Shell Bulwark into a pawn-guarded square.',
        hint: 'Capture on E5 with your F4 pawn.',
        vectorArrows: [
          { from: { x: 6, y: 4 }, to: { x: 5, y: 5 }, color: 'emerald', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 6 },
          to: { x: 5, y: 5 },
          commentary: 'Black recaptures D6 × E5.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 6, y: 3 },
        to: { x: 4, y: 2 },
        actionType: 'move',
        notation: 'Panda F3 → D2 (Rotating Gorilla-Mode Panda to Safety)',
        tukunaInstruction:
          'Hop Gorilla-Mode Panda from F3 back to D2 behind your D3 pawn, simultaneously opening the F-file for Mechamaru!',
        tacticalBreakdown:
          'Rotating a damaged Bulwark behind your pawn chain preserves its full 3.5-point Knight value for the endgame.',
        hint: 'Jump Panda from F3 to D2.',
        vectorArrows: [
          { from: { x: 6, y: 3 }, to: { x: 4, y: 2 }, color: 'emerald', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 8 },
          to: { x: 5, y: 6 },
          commentary: 'Black slides Warden Reggie from E8 to E6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 6, y: 1 },
        to: { x: 6, y: 2 },
        actionType: 'move',
        notation: 'Mechamaru F1 → F2 (Activating Artillery)',
        tukunaInstruction:
          'Step Artillery Mechamaru from F1 to F2 along the newly cleared F-column.',
        tacticalBreakdown:
          'Mechamaru takes over the F-column behind Yuji’s protection.',
        hint: 'Step Mechamaru from F1 up to F2.',
        vectorArrows: [
          { from: { x: 6, y: 1 }, to: { x: 6, y: 2 }, color: 'emerald', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 },
          to: { x: 2, y: 7 },
          commentary: 'Black steps Kenjaku to B7.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 6, y: 2 },
        to: { x: 6, y: 3 },
        actionType: 'move',
        notation: 'Mechamaru F2 → F3 (Guarded Third-Rank Cannon)',
        tukunaInstruction:
          'Advance Mechamaru to F3 (guarded by Yuji on G2), locking down D5 via diagonal Ranged Strike!',
        tacticalBreakdown:
          'Black’s E5 pawn cannot advance to E4 without weakening D5, and Mechamaru stays 100% protected.',
        hint: 'Step Mechamaru from F2 to F3.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 6, y: 3 }, color: 'emerald', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 8 },
          to: { x: 6, y: 7 },
          commentary: 'Black develops Yorozu to F7.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 8, y: 1 },
        to: { x: 8, y: 2 },
        actionType: 'move',
        notation: 'Gojo H1 → H2 (Fortress Complete)',
        tukunaInstruction:
          'Step Gojo from H1 to H2 to secure your winning material lead.',
        tacticalBreakdown:
          'A clean piece ahead with zero weaknesses—textbook Bulwark bait-and-punish.',
        hint: 'Move Gojo from H1 to H2.',
        vectorArrows: [
          { from: { x: 8, y: 1 }, to: { x: 8, y: 2 }, color: 'emerald', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_mid_5',
    title: 'Lesson 13: Rusher Jackpot Hit-and-Run vs. Warden',
    subtitle: 'Assassinate a double-pawn-defended 4.5-point Warden and vanish with Jackpot Safe Step',
    namedStrategy: 'Fever Pitch Warden Assassination',
    curriculumType: 'midgame',
    tier: 'advanced',
    playerColor: 'white',
    initialBoard: createMidLesson5Board(),
    tukunaGreeting:
      'Look at D5: Black’s 4.5-point Warden Reggie is double-defended by C6 and E6 pawns! No normal piece can touch Reggie without getting recaptured by a pawn—except Rusher Hakari! Line up B3, strike D5, and vanish via Jackpot!',
    completionMessage:
      'Spectacular hit-and-run! You assassinated Black’s 4.5-point central Warden right out from between two defending pawns, escaped with Jackpot, and sidestepped Black’s E5 counter-thrust!',
    patternHighlights: [
      { x: 2, y: 3 }, { x: 4, y: 5 }, { x: 4, y: 4 }, { x: 4, y: 3 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 2, y: 2 },
        to: { x: 2, y: 3 },
        actionType: 'move',
        notation: 'Hakari B2 → B3 (Aligning the B3–C4–D5 Diagonal!)',
        tukunaInstruction:
          'Step Rusher Hakari orthogonally from B2 to B3, aligning a 2-square diagonal strike across empty C4 onto Warden Reggie at D5!',
        tacticalBreakdown:
          ' Note: B3 sits outside Reggie’s adjacent Ratio Field, preserving Hakari’s full 2-square diagonal slide!',
        hint: 'Step Hakari forward from B2 to B3.',
        vectorArrows: [
          { from: { x: 2, y: 2 }, to: { x: 2, y: 3 }, color: 'emerald', label: '1', style: 'solid' },
          { from: { x: 2, y: 3 }, to: { x: 4, y: 5 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 7, y: 8 },
          to: { x: 8, y: 7 },
          commentary: 'Black slides Kurourushi to H7, trusting C6 and E6 pawns to protect Reggie on D5!',
        },
      },
      {
        stepNumber: 2,
        from: { x: 2, y: 3 },
        to: { x: 4, y: 5 },
        actionType: 'move',
        notation: 'Hakari B3 × D5 (Assassinating the Warden — JACKPOT!)',
        tukunaInstruction:
          'Slide Hakari 2 squares diagonally B3 × D5 to eliminate Black’s 4.5-point Warden Reggie and trigger JACKPOT!',
        tacticalBreakdown:
          'Capturing triggers Jackpot immediately—giving Hakari a free non-capturing 1-square step to an unattacked square BEFORE C6 or E6 can recapture!',
        hint: 'Capture Warden Reggie on D5 with Hakari from B3.',
        vectorArrows: [
          { from: { x: 2, y: 3 }, to: { x: 4, y: 5 }, color: 'emerald', label: '2', style: 'solid' },
        ],
      },
      {
        stepNumber: 3,
        from: { x: 4, y: 5 },
        to: { x: 4, y: 4 },
        actionType: 'move',
        notation: 'Hakari D5 → D4 (Jackpot Safe Step Escape!)',
        tukunaInstruction:
          'JACKPOT BONUS! Step Hakari orthogonally down from D5 to unattacked D4—slipping straight out of C6 and E6’s pawn jaws!',
        tacticalBreakdown:
          'A clean +4.5-point Warden won for zero material lost!',
        hint: 'Step Hakari from D5 down to D4.',
        vectorArrows: [
          { from: { x: 4, y: 5 }, to: { x: 4, y: 4 }, color: 'emerald', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 6 },
          to: { x: 5, y: 5 },
          commentary: 'Furious, Black pushes E6 → E5 to attack Hakari on D4 with a pawn!',
        },
      },
      {
        stepNumber: 4,
        from: { x: 4, y: 4 },
        to: { x: 4, y: 3 },
        actionType: 'move',
        notation: 'Hakari D4 → D3 (Stepping Out of Pawn Range!)',
        tukunaInstruction:
          'Never leave Hakari in front of Black’s E5 pawn! Step Hakari calmly down from D4 to D3 behind your C3 and E3 pawns.',
        tacticalBreakdown:
          'Protecting your newly won material lead with disciplined retreats stamps out all opponent counterplay.',
        hint: 'Step Hakari down from D4 to D3.',
        vectorArrows: [
          { from: { x: 4, y: 4 }, to: { x: 4, y: 3 }, color: 'emerald', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 8 },
          to: { x: 6, y: 7 },
          commentary: 'Black steps Naoya to F7.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 3, y: 1 },
        to: { x: 3, y: 2 },
        actionType: 'move',
        notation: 'Maki C1 → C2 (Queenside Mobilization)',
        tukunaInstruction:
          'Step Skirmisher Maki from C1 to C2, preparing an orthogonal vault onto C4.',
        tacticalBreakdown:
          'Bring your remaining reserves into active play.',
        hint: 'Move Maki from C1 to C2.',
        vectorArrows: [
          { from: { x: 3, y: 1 }, to: { x: 3, y: 2 }, color: 'emerald', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 8 },
          to: { x: 3, y: 7 },
          commentary: 'Black steps Artillery Uraume from C8 to C7.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 3, y: 2 },
        to: { x: 3, y: 4 },
        actionType: 'move',
        notation: 'Maki C2 → C4 (Central Skirmisher Outpost)',
        tukunaInstruction:
          'Hop Maki 2 squares orthogonally over your C3 pawn onto C4!',
        tacticalBreakdown:
          'Note that Black’s E5 pawn attacks D4 and F4—not C4! Maki stands completely safe on C4.',
        hint: 'Hop Maki from C2 over C3 onto C4.',
        vectorArrows: [
          { from: { x: 3, y: 2 }, to: { x: 3, y: 4 }, color: 'emerald', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 6 },
          to: { x: 3, y: 5 },
          commentary: 'Black pushes C6 → C5 in front of Maki.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 5, y: 3 },
        to: { x: 5, y: 4 },
        actionType: 'move',
        notation: 'E3 → E4 (Freezing Black’s Center)',
        tukunaInstruction:
          'Push E3 → E4 (protected by F3 and Maki on C4? Guarded by F3 pawn and Maki steps 1 to D4, while E4 blocks E5 cold)!',
        tacticalBreakdown:
          'E4 locks Black’s E5 pawn permanently in place, backed by your F3 pawn.',
        hint: 'Advance the E3 pawn to E4.',
        vectorArrows: [
          { from: { x: 5, y: 3 }, to: { x: 5, y: 4 }, color: 'emerald', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 8, y: 7 },
          to: { x: 8, y: 6 },
          commentary: 'Black moves Kurourushi to H6.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 8, y: 1 },
        to: { x: 8, y: 2 },
        actionType: 'move',
        notation: 'Gojo H1 → H2 (Securing the Victory)',
        tukunaInstruction:
          'Step Gojo from H1 to H2 to complete your fortress up a full 4.5-point Warden.',
        tacticalBreakdown:
          'Hit-and-run precision followed by airtight defense leaves Black zero hope of recovery.',
        hint: 'Move Gojo from H1 to H2.',
        vectorArrows: [
          { from: { x: 8, y: 1 }, to: { x: 8, y: 2 }, color: 'emerald', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_mid_6',
    title: 'Lesson 14: Heavenly Restriction Bypassing Ratio Field',
    subtitle: 'Use Maki’s Ratio-Field immunity to vault straight over a pawn shield and win Black’s Artillery',
    namedStrategy: 'Zero Cursed Energy Vault',
    curriculumType: 'midgame',
    tier: 'advanced',
    playerColor: 'white',
    initialBoard: createMidLesson6Board(),
    tukunaGreeting:
      'Black’s Warden Reggie on B5 projects a Ratio Field onto C4—which caps every normal sorcerer to 1 square! Black assumes Artillery Uraume on C6 is safe behind the C5 pawn. Show them why Skirmisher Maki’s Heavenly Restriction ignores Ratio Fields completely!',
    completionMessage:
      'Unstoppable Heavenly Restriction! Maki stepped right into Reggie’s Ratio Field on C4, vaulted C5 to eliminate Uraume on C6, and hopped cleanly back out of Kenjaku’s reach!',
    patternHighlights: [
      { x: 3, y: 4 }, { x: 3, y: 6 }, { x: 2, y: 4 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 3, y: 3 },
        to: { x: 3, y: 4 },
        actionType: 'move',
        notation: 'Maki C3 → C4 (Entering the Ratio Field Protected!)',
        tukunaInstruction:
          'Step Maki from C3 onto C4—double-defended by your B3 and D3 pawns! Notice: Reggie on B5 moves only orthogonally (cannot touch C4), and C5 blocks Uraume’s Ranged Strike!',
        tacticalBreakdown:
          'Any other piece on C4 would be restricted to 1-step movement by Reggie on B5—but Maki’s Heavenly Restriction ignores Ratio Field completely!',
        hint: 'Step Maki forward from C3 to C4.',
        vectorArrows: [
          { from: { x: 3, y: 3 }, to: { x: 3, y: 4 }, color: 'emerald', label: '1', style: 'solid' },
          { from: { x: 3, y: 4 }, to: { x: 3, y: 6 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 8, y: 7 },
          to: { x: 8, y: 6 },
          commentary: 'Blind to Heavenly Restriction, Black advances Kurourushi H7 → H6 assuming Reggie’s Ratio Field holds C4!',
        },
      },
      {
        stepNumber: 2,
        from: { x: 3, y: 4 },
        to: { x: 3, y: 6 },
        actionType: 'move',
        notation: 'Maki C4 × C6 (Heavenly Restriction Vault Capture!)',
        tukunaInstruction:
          'Vault Maki 2 squares orthogonally over Black’s C5 pawn (C4 × C6) to eliminate 4-point Artillery Uraume!',
        tacticalBreakdown:
          'Zero Cursed Energy bypasses Reggie’s Ratio Field on C4, and C6 is unattacked by every remaining Black piece!',
        hint: 'Hop Maki from C4 over C5 to capture Uraume on C6.',
        vectorArrows: [
          { from: { x: 3, y: 4 }, to: { x: 3, y: 6 }, color: 'emerald', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 },
          to: { x: 2, y: 7 },
          commentary: 'Black rushes Vanguard Kenjaku from B8 to B7, threatening to capture Maki on C6!',
        },
      },
      {
        stepNumber: 3,
        from: { x: 3, y: 6 },
        to: { x: 3, y: 4 },
        actionType: 'move',
        notation: 'Maki C6 → C4 (Clean Extraction Vault!)',
        tukunaInstruction:
          'Extract Maki immediately! Vault 2 squares orthogonally back over C5 from C6 to pawn-defended C4!',
        tacticalBreakdown:
          'Strike and extract: never leave a 3.5-point Skirmisher sitting in front of an 8-point Vanguard after winning your target.',
        hint: 'Hop Maki back from C6 over C5 onto C4.',
        vectorArrows: [
          { from: { x: 3, y: 6 }, to: { x: 3, y: 4 }, color: 'emerald', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 5 },
          to: { x: 2, y: 6 },
          commentary: 'With Uraume gone, Warden Reggie retreats from B5 to B6.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 2, y: 3 },
        to: { x: 2, y: 4 },
        actionType: 'move',
        notation: 'B3 → B4 (Undermining Black’s C5 Pawn)',
        tukunaInstruction:
          'Push B3 → B4 (supported by your A3 pawn and Maki on C4) to attack Black’s isolated C5 pawn!',
        tacticalBreakdown:
          'Trade off Black’s advanced pawn to open queenside lanes for Hakari and Nanami.',
        hint: 'Advance the B3 pawn to B4.',
        vectorArrows: [
          { from: { x: 2, y: 3 }, to: { x: 2, y: 4 }, color: 'emerald', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 5 },
          to: { x: 2, y: 4 },
          commentary: 'Black captures C5 × B4.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 1, y: 3 },
        to: { x: 2, y: 4 },
        actionType: 'move',
        notation: 'A3 × B4 (Anchored Recapture)',
        tukunaInstruction:
          'Recapture on B4 with your A3 pawn (A3 × B4), backed by Hakari (B2) and Maki (C4)!',
        tacticalBreakdown:
          'Maki on C4 and the B4 pawn form an iron queenside duo.',
        hint: 'Capture Black’s pawn on B4 with your A3 pawn.',
        vectorArrows: [
          { from: { x: 1, y: 3 }, to: { x: 2, y: 4 }, color: 'emerald', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 6 },
          to: { x: 5, y: 5 },
          commentary: 'Black pushes E6 → E5.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 6, y: 1 },
        to: { x: 6, y: 2 },
        actionType: 'move',
        notation: 'Mechamaru F1 → F2 (Central Artillery Support)',
        tukunaInstruction:
          'Step Mechamaru from F1 to F2.',
        tacticalBreakdown:
          'Developing your remaining back-rank pieces extinguishes all counterplay.',
        hint: 'Move Mechamaru from F1 to F2.',
        vectorArrows: [
          { from: { x: 6, y: 1 }, to: { x: 6, y: 2 }, color: 'emerald', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 8 },
          to: { x: 7, y: 7 },
          commentary: 'Black steps Naoya from G8 to G7.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 5, y: 1 },
        to: { x: 3, y: 2 },
        actionType: 'move',
        notation: 'Panda E1 → C2 (Bulwark Queenside Link)',
        tukunaInstruction:
          'Jump Bulwark Panda from E1 to C2 behind Maki.',
        tacticalBreakdown:
          'Panda connects Gojo and Mechamaru with your dominant queenside wing.',
        hint: 'Jump Panda in an L-shape from E1 to C2.',
        vectorArrows: [
          { from: { x: 5, y: 1 }, to: { x: 3, y: 2 }, color: 'emerald', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 8 },
          to: { x: 4, y: 6 },
          commentary: 'Black jumps Yorozu from E8 to D6.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 8, y: 1 },
        to: { x: 8, y: 2 },
        actionType: 'move',
        notation: 'Gojo H1 → H2 (Winning Consolidation)',
        tukunaInstruction:
          'Step Gojo from H1 to H2 to seal your clean 4-point Artillery advantage.',
        tacticalBreakdown:
          'Heavenly Restriction turned Black’s Ratio Field trap into a clean one-piece victory.',
        hint: 'Move Gojo from H1 to H2.',
        vectorArrows: [
          { from: { x: 8, y: 1 }, to: { x: 8, y: 2 }, color: 'emerald', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_mid_7',
    title: 'Lesson 15: Triple-Role Pin, Snipe & Black Flash Synergy',
    subtitle: 'Weave Vanguard Black Flash, Warden captures, and Artillery diagonal snipes into one seamless plan',
    namedStrategy: 'Tokyo Jujutsu High Trinity',
    curriculumType: 'midgame',
    tier: 'advanced',
    playerColor: 'white',
    initialBoard: createMidLesson7Board(),
    tukunaGreeting:
      'True Culling Game mastery means combining roles: use Yuji’s Black Flash against pawn-defended pieces, Nanami (4.5pt) rather than Yuji (8pt) when contesting enemy Wardens, and Mechamaru’s diagonal snipes to pick off flanking pawns!',
    completionMessage:
      'Supreme tactical harmony! Every role executed its specialty without once exposing a higher-value sorcerer to a lower-value trade.',
    patternHighlights: [
      { x: 6, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 5, y: 3 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 6, y: 3 },
        to: { x: 6, y: 5 },
        actionType: 'black_flash',
        notation: 'Yuji F3 ⚡ F5 (Black Flash Elimination!)',
        tukunaInstruction:
          'Open with Yuji’s 2-square Black Flash from F3 onto Naoya at F5, destroying Naoya without stepping into Black’s G6 pawn!',
        tacticalBreakdown:
          'Strike-in-place keeps Yuji anchored on F3 where he defends E4 and G4.',
        hint: 'Select Yuji on F3 and click Naoya on F5.',
        vectorArrows: [
          { from: { x: 6, y: 3 }, to: { x: 6, y: 5 }, color: 'emerald', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 6 },
          to: { x: 5, y: 5 },
          commentary: 'Black pushes E6 → E5, attacking Warden Nanami on D4 with a 1-point pawn!',
        },
      },
      {
        stepNumber: 2,
        from: { x: 4, y: 4 },
        to: { x: 4, y: 3 },
        actionType: 'move',
        notation: 'Nanami D4 → D3 (Disciplined Warden Retreat!)',
        tukunaInstruction:
          'Respect Black’s E5 pawn threat! Step Warden Nanami back from D4 to D3—keeping him safe while vacating D4 as a future sniping window!',
        tacticalBreakdown:
          'Retreating Nanami from a 1-point pawn poke preserves your 4.5-point Warden and opens the E3–D4–C5 diagonal.',
        hint: 'Step Nanami down from D4 to D3.',
        vectorArrows: [
          { from: { x: 4, y: 4 }, to: { x: 4, y: 3 }, color: 'emerald', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 6 },
          to: { x: 3, y: 5 },
          commentary: 'Black advances C6 → C5 to claim queenside space.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 5, y: 3 },
        to: { x: 5, y: 4 },
        actionType: 'move',
        notation: 'E3 → E4 (Freezing E5 & Vacating E3!)',
        tukunaInstruction:
          'Push E3 → E4 (guarded by Yuji on F3) to freeze Black’s E5 pawn in place and vacate E3 for Mechamaru!',
        tacticalBreakdown:
          'Now E3 is open and D4 is empty—giving Mechamaru a crystal-clear diagonal toward C5!',
        hint: 'Advance the E3 pawn to E4.',
        vectorArrows: [
          { from: { x: 5, y: 3 }, to: { x: 5, y: 4 }, color: 'emerald', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 },
          to: { x: 2, y: 7 },
          commentary: 'Black develops Kenjaku from B8 to B7.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 5, y: 2 },
        to: { x: 5, y: 3 },
        actionType: 'move',
        notation: 'Mechamaru E2 → E3 (Tokyo Jujutsu High Trinity!)',
        tukunaInstruction:
          'Step Artillery Mechamaru from E2 onto E3 between Nanami (D3) and Yuji (F3), locking onto C5 across empty D4!',
        tacticalBreakdown:
          'Three distinct roles—Warden, Artillery, Vanguard—stand shoulder-to-shoulder behind your pawn wall.',
        hint: 'Step Mechamaru forward from E2 to E3.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 3 }, color: 'emerald', label: '4', style: 'solid' },
          { from: { x: 5, y: 3 }, to: { x: 3, y: 5 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 7, y: 7 },
          to: { x: 8, y: 6 },
          commentary: 'Black slides Kurourushi from G7 to H6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 5, y: 3 },
        to: { x: 3, y: 5 },
        actionType: 'shoot',
        notation: 'Mechamaru E3 🏹 C5 (Diagonal Ranged Strike!)',
        tukunaInstruction:
          'Fire Mechamaru’s diagonal Ranged Strike from E3 across empty D4 to obliterate Black’s C5 pawn!',
        tacticalBreakdown:
          'First Yuji erased Naoya with Black Flash; now Mechamaru erases C5 with Ranged Strike!',
        hint: 'Select Mechamaru on E3 and click Black’s pawn on C5.',
        vectorArrows: [
          { from: { x: 5, y: 3 }, to: { x: 3, y: 5 }, color: 'emerald', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 6 },
          to: { x: 3, y: 6 },
          commentary: 'Black shifts Warden Reggie from D6 to C6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 3, y: 3 },
        to: { x: 3, y: 4 },
        actionType: 'move',
        notation: 'C3 → C4 (Supported Queenside Clamp)',
        tukunaInstruction:
          'Advance C3 → C4 (protected by your B3 pawn) to seize the vacated queenside!',
        tacticalBreakdown:
          'C4 and E4 form a classic central clamp while vacating C3 for Skirmisher Maki.',
        hint: 'Push the C3 pawn to C4.',
        vectorArrows: [
          { from: { x: 3, y: 3 }, to: { x: 3, y: 4 }, color: 'emerald', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 8, y: 6 },
          to: { x: 8, y: 5 },
          commentary: 'Kurourushi steps to H5—completely blocked from F3 by your G4 pawn!',
        },
      },
      {
        stepNumber: 7,
        from: { x: 3, y: 2 },
        to: { x: 3, y: 3 },
        actionType: 'move',
        notation: 'Maki C2 → C3 (Four-Sorcerer Third-Rank Line!)',
        tukunaInstruction:
          'Step Skirmisher Maki from C2 to C3, completing an iron 4-sorcerer line across C3–D3–E3–F3!',
        tacticalBreakdown:
          'Maki (C3), Nanami (D3), Mechamaru (E3), and Yuji (F3) stand completely shielded behind B3–C4–E4–G4–H3.',
        hint: 'Step Maki forward from C2 to C3.',
        vectorArrows: [
          { from: { x: 3, y: 2 }, to: { x: 3, y: 3 }, color: 'emerald', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 6 },
          to: { x: 4, y: 6 },
          commentary: 'Unable to find any weakness, Reggie shifts back to D6.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 8, y: 2 },
        to: { x: 7, y: 2 },
        actionType: 'move',
        notation: 'Gojo H2 → G2 (Sovereign Overwatch)',
        tukunaInstruction:
          'Step Sovereign Gojo from H2 to G2 to centralize your King behind the fortress!',
        tacticalBreakdown:
          'Zero blunders, two clean special-action eliminations, and total board control.',
        hint: 'Step Gojo left from H2 to G2.',
        vectorArrows: [
          { from: { x: 8, y: 2 }, to: { x: 7, y: 2 }, color: 'emerald', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_mid_8',
    title: 'Lesson 16: Coordinated Sovereign Checkmate Net',
    subtitle: 'Strip away Sukuna’s pawn cover and weave an inescapable 5-square corner checkmate on A8',
    namedStrategy: 'Six Eyes Sovereign Execution',
    curriculumType: 'midgame',
    tier: 'advanced',
    playerColor: 'white',
    initialBoard: createMidLesson8Board(),
    tukunaGreeting:
      'Final exam, sorcerer! Sukuna’s Domain Step is spent, and he lurks near A8. Remember cross-board geometry: A8 borders FIVE playable squares—B9, B8, B7, A7, and L7! Strip away his B7 pawn shield, anchor B7 with C6 and Nanami, and deliver Checkmate with Yuji!',
    completionMessage:
      'SUPREME VICTORY! Yuji on B7—defended by both your C6 pawn and Warden Nanami on B5—checks Sukuna on A8 while sealing B8, B9, A7, and L7 simultaneously! You have graduated the Culling Game Dojo!',
    patternHighlights: [
      { x: 3, y: 6 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 2, y: 7 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 3, y: 5 },
        to: { x: 3, y: 6 },
        actionType: 'move',
        notation: 'C5 → C6 (Cracking Sukuna’s B7 Shield!)',
        tukunaInstruction:
          'Advance your C5 pawn to C6 (defended by Vanguard Yuji on D5), attacking Sukuna’s B7 shield pawn and permanently controlling B7!',
        tacticalBreakdown:
          'C6 is the linchpin of the entire checkmate net: once planted on C6, it guards B7 for Yuji’s final blow.',
        hint: 'Push the C5 pawn to C6.',
        vectorArrows: [
          { from: { x: 3, y: 5 }, to: { x: 3, y: 6 }, color: 'emerald', label: '1', style: 'solid' },
          { from: { x: 3, y: 6 }, to: { x: 2, y: 7 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 },
          to: { x: 2, y: 6 },
          commentary: 'Black pushes B7 → B6 to avoid losing the shield pawn immediately!',
        },
      },
      {
        stepNumber: 2,
        from: { x: 1, y: 4 },
        to: { x: 1, y: 5 },
        actionType: 'move',
        notation: 'A4 → A5 (Prying Open the A & B Files)',
        tukunaInstruction:
          'Push A4 → A5 to challenge Black’s B6 pawn and pry open the western files!',
        tacticalBreakdown:
          'Clearing B6 removes the last obstacle between Warden Nanami and the B5 anchor square.',
        hint: 'Advance the A4 pawn to A5.',
        vectorArrows: [
          { from: { x: 1, y: 4 }, to: { x: 1, y: 5 }, color: 'emerald', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 6 },
          to: { x: 1, y: 5 },
          commentary: 'Black captures B6 × A5.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 3, y: 4 },
        to: { x: 1, y: 4 },
        actionType: 'move',
        notation: 'Maki C4 → A4 (Lateral Skirmisher Pursuit)',
        tukunaInstruction:
          'Hop Skirmisher Maki 2 squares laterally from C4 to A4 to eliminate Black’s A5 pawn!',
        tacticalBreakdown:
          'Capturing A5 with Maki also seals A7 via her 2-square orthogonal hop.',
        hint: 'Hop Maki left from C4 to A4.',
        vectorArrows: [
          { from: { x: 3, y: 4 }, to: { x: 1, y: 4 }, color: 'emerald', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 },
          to: { x: 1, y: 8 },
          commentary: 'Sensing danger on the open B-file, Sukuna steps into the A8 corner!',
        },
      },
      {
        stepNumber: 4,
        from: { x: 1, y: 4 },
        to: { x: 1, y: 5 },
        actionType: 'move',
        notation: 'Maki A4 × A5 (Eliminating the Last Western Pawn)',
        tukunaInstruction:
          'Capture Black’s A5 pawn with Maki (A4 × A5)! From A5, Maki locks onto A7.',
        tacticalBreakdown:
          'Every Black defender on the western wing has been liquidated.',
        hint: 'Capture the A5 pawn with Maki.',
        vectorArrows: [
          { from: { x: 1, y: 4 }, to: { x: 1, y: 5 }, color: 'emerald', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 },
          to: { x: 5, y: 6 },
          commentary: 'Black pushes E7 → E6, trying desperately to open lines from the east.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 4, y: 5 },
        to: { x: 4, y: 7 },
        actionType: 'move',
        notation: 'Yuji D5 → D7 (Dodging E6 Pawn Into Rank 7!)',
        tukunaInstruction:
          'Alert! Black’s E6 pawn just threatened 8-point Yuji on D5! Slide Yuji 2 squares forward from D5 to D7—dodging E6 while still guarding C6 and infiltrating the mating rank!',
        tacticalBreakdown:
          'Turning an opponent’s pawn poke into a forward infiltration onto Rank 7 saves Yuji and accelerates checkmate.',
        hint: 'Slide Yuji 2 squares up from D5 to D7.',
        vectorArrows: [
          { from: { x: 4, y: 5 }, to: { x: 4, y: 7 }, color: 'emerald', label: '5', style: 'solid' },
          { from: { x: 4, y: 7 }, to: { x: 2, y: 7 }, color: 'navy', style: 'dashed' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 },
          to: { x: 6, y: 6 },
          commentary: 'Black pushes F7 → F6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 2, y: 3 },
        to: { x: 2, y: 5 },
        actionType: 'move',
        notation: 'Nanami B3 → B5 (Warden B-File Anchor)',
        tukunaInstruction:
          'Slide Warden Nanami 2 squares orthogonally from B3 to B5, double-guarding B7 alongside your C6 pawn!',
        tacticalBreakdown:
          'Overprotecting B7 ensures Sukuna cannot capture Yuji when checkmate lands.',
        hint: 'Slide Nanami from B3 up to B5.',
        vectorArrows: [
          { from: { x: 2, y: 3 }, to: { x: 2, y: 5 }, color: 'emerald', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 8 },
          to: { x: 6, y: 8 },
          commentary: 'Black rushes Warden Reggie toward the queenside (G8 → F8), but he is far too late!',
        },
      },
      {
        stepNumber: 7,
        from: { x: 6, y: 2 },
        to: { x: 5, y: 3 },
        actionType: 'move',
        notation: 'Mechamaru F2 → E3 (Reinforcing the Center Before the Kill)',
        tukunaInstruction:
          'Step Mechamaru from F2 to E3 to anchor your E4 pawn before delivering the finishing strike.',
        tacticalBreakdown:
          'Every friendly unit stands rock-solid as the checkmate net snaps shut.',
        hint: 'Step Mechamaru diagonally from F2 to E3.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 5, y: 3 }, color: 'emerald', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 7 },
          to: { x: 7, y: 6 },
          commentary: 'Helpless to reach B7 or A8 from F8, Black plays G7 → G6.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 4, y: 7 },
        to: { x: 2, y: 7 },
        actionType: 'move',
        notation: 'Yuji D7 → B7 # (SOVEREIGN CHECKMATE!)',
        tukunaInstruction:
          'Deliver the finishing blow! Slide Vanguard Yuji from D7 onto B7 for SOVEREIGN CHECKMATE!',
        tacticalBreakdown:
          'From B7 (double-guarded by C6 and Nanami on B5), Yuji checks Sukuna on A8 while simultaneously sealing B8, B9, A7, and L7! Checkmate!',
        hint: 'Slide Yuji 2 squares left from D7 to B7 for Checkmate!',
        vectorArrows: [
          { from: { x: 4, y: 7 }, to: { x: 2, y: 7 }, color: 'emerald', label: '8', style: 'solid' },
          { from: { x: 2, y: 7 }, to: { x: 1, y: 8 }, color: 'navy', style: 'dashed' },
        ],
      },
    ],
  },
];

function mapLessonPositions(lesson: CullingOpeningLesson): CullingOpeningLesson {
  return {
    ...lesson,
    patternHighlights: lesson.patternHighlights?.map(mPos),
    steps: lesson.steps.map((step) => ({
      ...step,
      from: mPos(step.from),
      to: mPos(step.to),
      vectorArrows: step.vectorArrows?.map((arrow) => ({
        ...arrow,
        from: mPos(arrow.from),
        to: mPos(arrow.to),
      })),
      opponentResponse: step.opponentResponse
        ? {
            ...step.opponentResponse,
            from: mPos(step.opponentResponse.from),
            to: mPos(step.opponentResponse.to),
          }
        : undefined,
    })),
  };
}

export const CULLING_OPENING_LESSONS: CullingOpeningLesson[] = RAW_CULLING_OPENING_LESSONS.map(mapLessonPositions);
