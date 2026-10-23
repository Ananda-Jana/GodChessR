/**
 * cullingOpeningData.ts
 *
 * Official Opening & Mid-Game Strategy Curriculum for the Culling Game Dojo — Tukuna's Classroom.
 *
 * Instructor: Sensei Tukuna
 * Rule Engine: cullingEngine.ts (100% legal 88-square cross-shaped board moves verified)
 */

import type { CullingOpeningLesson } from './types';
import { createInitialCullingBoard } from '../game/cullingEngine';

export const createLesson7Board = () => {
  const b = createInitialCullingBoard();
  // Clear F2 pawn and place enemy black pawn on F3 for Mechamaru Ranged Snipe
  b[2][6] = null; // F2 empty
  b[3][6] = { id: 'b_target_pawn', type: 'culling_pawn', color: 'black', hasMoved: true }; // F3 enemy target
  return b;
};

export const CULLING_OPENING_LESSONS: CullingOpeningLesson[] = [
  // =========================================================================
  // OPENING DOJO CURRICULUM (Lessons 1 - 8: 8 Steps Each)
  // =========================================================================

  {
    id: 'culling_open_1',
    title: 'Lesson 1: Vanguard Central Rush',
    subtitle: 'Advance central pawns to establish cross-arm control and liberate Yuji',
    namedStrategy: 'Sovereign Vanguard Gambit',
    curriculumType: 'opening',
    tier: 'beginner',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Welcome to my classroom, pupil. I am Sensei Tukuna. Central file control dictates the boundaries of victory. Let us advance the central Vanguard pawns to establish our line of attack.',
    completionMessage:
      'Masterful central development! Opening the G and F files empowers your Vanguard to command the board.',
    patternHighlights: [
      { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 5 }, { x: 6, y: 5 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 7, y: 2 }, // G2 Pawn
        to: { x: 7, y: 3 },   // G3
        actionType: 'move',
        notation: 'G2 → G3 (Pawn Advance)',
        tukunaInstruction:
          'Push your White Pawn on G2 forward to G3. This opens up the G2 square for Yuji Itadori.',
        tacticalBreakdown:
          'Advancing the G2 pawn clears the column for Vanguard Yuji Itadori on G1 to step into battle.',
        hint: 'Select the pawn on G2 and advance it 1 step to G3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 7, y: 3 }, color: 'crimson', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Kenjaku opens the B-file for Black’s Vanguard!',
        },
      },
      {
        stepNumber: 2,
        from: { x: 7, y: 1 }, // Yuji at G1
        to: { x: 7, y: 2 },   // G2
        actionType: 'move',
        notation: 'Yuji G1 → G2 (Vanguard Step)',
        tukunaInstruction:
          'Step Vanguard Yuji Itadori from G1 to G2 onto the cleared square.',
        tacticalBreakdown:
          'Vanguards slide up to 3 squares. Placing Yuji on G2 establishes a formidable forward watch post guarding Gojo.',
        hint: 'Move Yuji from G1 to G2.',
        vectorArrows: [
          { from: { x: 7, y: 1 }, to: { x: 7, y: 2 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 }, // Kenjaku at B8
          to: { x: 2, y: 7 },   // B7
          commentary: 'Black deploys Vanguard Kenjaku to B7!',
        },
      },
      {
        stepNumber: 3,
        from: { x: 7, y: 3 }, // G3 Pawn
        to: { x: 7, y: 4 },   // G4
        actionType: 'move',
        notation: 'G3 → G4 (Central Wedge Push)',
        tukunaInstruction:
          'Push your G3 pawn to G4 to claim central territory.',
        tacticalBreakdown:
          'Pushing the G3 pawn to G4 opens up diagonal attack lanes for Yuji from G2.',
        hint: 'Push the G3 pawn to G4.',
        vectorArrows: [
          { from: { x: 7, y: 3 }, to: { x: 7, y: 4 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Opponent advances C7 pawn to solidify their center.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 7, y: 2 }, // Yuji G2
        to: { x: 6, y: 3 },   // F3 (Diagonal step)
        actionType: 'move',
        notation: 'Yuji G2 → F3 (Vanguard Diagonal Shift)',
        tukunaInstruction:
          'Step Yuji diagonally to F3 onto the open F-column.',
        tacticalBreakdown:
          'Shifting Yuji to F3 prepares a long-range Vanguard slide up the open F-column.',
        hint: 'Move Yuji diagonally to F3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 6, y: 3 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 }, // Black Pawn D7
          to: { x: 4, y: 6 },   // D6
          commentary: 'Opponent pushes D7 pawn to D6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 6, y: 3 }, // Yuji F3
        to: { x: 6, y: 5 },   // F5 (Slide 2 squares up open F-column!)
        actionType: 'move',
        notation: 'Yuji F3 → F5 (Open Column Thrust)',
        tukunaInstruction:
          'Slide Yuji 2 squares forward along the open F-column to F5.',
        tacticalBreakdown:
          'Yuji’s slide pierces deep into Black’s center, threatening D6 and E6 pawns.',
        hint: 'Slide Yuji from F3 straight up to F5.',
        vectorArrows: [
          { from: { x: 6, y: 3 }, to: { x: 6, y: 5 }, color: 'crimson', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Black fortifies E6 to block central diagonal threats.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 4, y: 2 }, // D2 Pawn
        to: { x: 4, y: 3 },   // D3
        actionType: 'move',
        notation: 'D2 → D3 (Warden Runway Push)',
        tukunaInstruction:
          'Push your D2 pawn forward to D3 to clear the D-file for Warden Nanami.',
        tacticalBreakdown:
          'Clearing D2 allows Nanami to step into the second rank and project his Ratio Field.',
        hint: 'Push the D2 pawn to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 8 }, // Uraume C8
          to: { x: 3, y: 7 },   // C7
          commentary: 'Uraume shifts to C7 to set up a counter-battery.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 4, y: 1 }, // Nanami D1
        to: { x: 4, y: 2 },   // D2 (Orthogonal Warden Step)
        actionType: 'move',
        notation: 'Nanami D1 → D2 (Warden Orthogonal Step)',
        tukunaInstruction:
          'Slide Warden Nanami 1 square orthogonally forward to D2.',
        tacticalBreakdown:
          'Nanami slides orthogonally up to 3 squares. Positioning Nanami on D2 projects his Ratio Field into the center.',
        hint: 'Move Nanami from D1 to D2.',
        vectorArrows: [
          { from: { x: 4, y: 1 }, to: { x: 4, y: 2 }, color: 'crimson', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6
          commentary: 'Black advances F7 pawn to F6.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 6, y: 5 }, // Yuji F5
        to: { x: 5, y: 5 },   // E5
        actionType: 'move',
        notation: 'Yuji F5 → E5 (Tactical Shift)',
        tukunaInstruction:
          'Shift Yuji from F5 to E5 to place direct pressure on Black’s E6 outpost.',
        tacticalBreakdown:
          'Positioning Yuji on E5 commands both D6 and F6 diagonals while anchored by your F3 pawn wall.',
        hint: 'Move Yuji 1 square left to E5.',
        vectorArrows: [
          { from: { x: 6, y: 5 }, to: { x: 5, y: 5 }, color: 'crimson', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_open_2',
    title: 'Lesson 2: Sovereign Shell Defense',
    subtitle: 'Construct an impenetrable Bulwark & Warden perimeter around Satoru Gojo',
    namedStrategy: 'Ratio-Shell Fortification',
    curriculumType: 'opening',
    tier: 'beginner',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Satoru Gojo is your Sovereign. Protecting Gojo while building a strong perimeter is essential. Deploy Bulwark Panda and Nanami to form an unbreakable citadel.',
    completionMessage:
      'Defensive shell activated! Gojo is shielded behind Panda’s Bulwark Shell and Nanami’s Ratio Field.',
    patternHighlights: [
      { x: 5, y: 1 }, { x: 6, y: 3 }, { x: 4, y: 2 }, { x: 4, y: 4 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 5, y: 1 }, // Panda E1
        to: { x: 6, y: 3 },   // F3 (Knight L-jump)
        actionType: 'move',
        notation: 'Panda E1 → F3 (Bulwark Outpost)',
        tukunaInstruction:
          'Jump Bulwark Panda from E1 to F3 using a Knight L-movement pattern.',
        tacticalBreakdown:
          'Panda’s Bulwark Shell absorbs the first capture attempt completely, creating an indestructible barrier for Gojo.',
        hint: 'Jump Panda from E1 to F3.',
        vectorArrows: [
          { from: { x: 5, y: 1 }, to: { x: 6, y: 3 }, color: 'crimson', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Opponent advances C7 pawn to probe central sightlines.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 4, y: 2 }, // Pawn D2
        to: { x: 4, y: 3 },   // D3
        actionType: 'move',
        notation: 'D2 → D3 (Wall Construction)',
        tukunaInstruction:
          'Advance your D2 pawn to D3 to clear Nanami’s file.',
        tacticalBreakdown:
          'Pawn pushes construct tight barrier structures that restrict enemy movement through the center.',
        hint: 'Push D2 pawn to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 }, // Black Pawn D7
          to: { x: 4, y: 6 },   // D6
          commentary: 'Black advances D7 pawn to D6.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 4, y: 1 }, // Nanami D1
        to: { x: 4, y: 2 },   // D2
        actionType: 'move',
        notation: 'Nanami D1 → D2 (Warden Step)',
        tukunaInstruction:
          'Slide Nanami from D1 to D2.',
        tacticalBreakdown:
          'Nanami on D2 projects an 8-square Ratio Field restricting adjacent enemies to 1 step maximum.',
        hint: 'Move Nanami forward to D2.',
        vectorArrows: [
          { from: { x: 4, y: 1 }, to: { x: 4, y: 2 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Black advances E7 pawn to E6 to solidify their center.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 5, y: 2 }, // Pawn E2
        to: { x: 5, y: 3 },   // E3
        actionType: 'move',
        notation: 'E2 → E3 (Center Support)',
        tukunaInstruction:
          'Push your E2 pawn forward to E3.',
        tacticalBreakdown:
          'Creating a pawn chain on D3-E3 covers Panda on F3 and seals the E-column.',
        hint: 'Push E2 pawn to E3.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 3 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Opponent pushes B7 pawn to B6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 8, y: 1 }, // Gojo H1
        to: { x: 8, y: 2 },   // H2 (Step forward onto empty H2 square)
        actionType: 'move',
        notation: 'Gojo H1 → H2 (Sovereign Safety Step)',
        tukunaInstruction:
          'Step Satoru Gojo 1 square forward from H1 to H2.',
        tacticalBreakdown:
          'Moving Gojo to H2 tucks him safely behind Panda on F3 and Nanami on D2.',
        hint: 'Move Gojo forward to H2.',
        vectorArrows: [
          { from: { x: 8, y: 1 }, to: { x: 8, y: 2 }, color: 'crimson', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6
          commentary: 'Black pushes F7 pawn to F6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 6, y: 1 }, // Mechamaru F1
        to: { x: 5, y: 2 },   // E2
        actionType: 'move',
        notation: 'Mechamaru F1 → E2 (Battery Guard)',
        tukunaInstruction:
          'Step Mechamaru to E2 behind the E3 pawn line.',
        tacticalBreakdown:
          'Mechamaru on E2 covers both the D3 and F3 pawns while guarding Gojo’s left flank.',
        hint: 'Move Mechamaru to E2.',
        vectorArrows: [
          { from: { x: 6, y: 1 }, to: { x: 5, y: 2 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 6 }, // Black Pawn B6
          to: { x: 2, y: 5 },   // B5
          commentary: 'Black advances B6 pawn to B5.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 6, y: 3 }, // Panda F3
        to: { x: 5, y: 5 },   // E5
        actionType: 'move',
        notation: 'Panda F3 → E5 (Bulwark Outpost Advance)',
        tukunaInstruction:
          'Jump Panda forward to E5 in the center board.',
        tacticalBreakdown:
          'Panda on E5 exerts high physical pressure while forcing Naoya to respect his Bulwark Shell.',
        hint: 'Jump Panda from F3 to E5.',
        vectorArrows: [
          { from: { x: 6, y: 3 }, to: { x: 5, y: 5 }, color: 'crimson', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 6 }, // Black Pawn C6
          to: { x: 3, y: 5 },   // C5
          commentary: 'Black advances C6 pawn to C5.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 4, y: 3 }, // D3 Pawn
        to: { x: 4, y: 4 },   // D4
        actionType: 'move',
        notation: 'D3 → D4 (Central Wall Advance)',
        tukunaInstruction:
          'Advance your D3 pawn forward to D4 to seal the central perimeter.',
        tacticalBreakdown:
          'Pushing D4 secures central space and supports Panda on E5.',
        hint: 'Push D3 pawn to D4.',
        vectorArrows: [
          { from: { x: 4, y: 3 }, to: { x: 4, y: 4 }, color: 'crimson', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_open_3',
    title: 'Lesson 3: Skirmisher Flank Attack',
    subtitle: 'Utilize Heavenly Restriction for instant 2-square leaping flank entry',
    namedStrategy: 'Heavenly Skirmish Ambush',
    curriculumType: 'opening',
    tier: 'beginner',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Maki Zenin possesses Heavenly Restriction. She ignores enemy Warden Ratio Fields and can hop 2 squares orthogonally over any unit. Master her rapid flank entry!',
    completionMessage:
      'Flawless skirmish leap! Maki has penetrated deep behind enemy lines.',
    patternHighlights: [
      { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 2, y: 5 }, { x: 1, y: 5 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 3, y: 1 }, // Maki C1
        to: { x: 3, y: 3 },   // C3 (Leap over C2)
        actionType: 'move',
        notation: 'Maki C1 → C3 (Heavenly Leap)',
        tukunaInstruction:
          'Hop Maki Zenin from C1 directly over the C2 pawn onto C3.',
        tacticalBreakdown:
          'Skirmishers hop 2 squares orthogonally, leaping cleanly over friendly or enemy units to seize flank outposts.',
        hint: 'Hop Maki over C2 pawn to C3.',
        vectorArrows: [
          { from: { x: 3, y: 1 }, to: { x: 3, y: 3 }, color: 'crimson', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6
          commentary: 'Naoya Zenin prepares a counter-skirmish on the opposite flank.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 3, y: 3 }, // Maki C3
        to: { x: 3, y: 4 },   // C4
        actionType: 'move',
        notation: 'Maki C3 → C4 (Colony Penetration)',
        tukunaInstruction:
          'Advance Maki one step forward to C4.',
        tacticalBreakdown:
          'Positioning Maki on C4 exerts heavy pressure on Black’s C-file pawns while remaining immune to Warden suppression.',
        hint: 'Move Maki to C4.',
        vectorArrows: [
          { from: { x: 3, y: 3 }, to: { x: 3, y: 4 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Opponent pushes B7 pawn to B6 to guard the C5 square.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 2, y: 2 }, // Pawn B2
        to: { x: 2, y: 3 },   // B3
        actionType: 'move',
        notation: 'B2 → B3 (Flank Runway)',
        tukunaInstruction:
          'Move your B2 pawn to B3 to support Maki’s left flank.',
        tacticalBreakdown:
          'Advancing B3 protects Maki’s diagonal retreat square and opens B2 for Hakari.',
        hint: 'Push B2 pawn to B3.',
        vectorArrows: [
          { from: { x: 2, y: 2 }, to: { x: 2, y: 3 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 }, // Kenjaku B8
          to: { x: 2, y: 7 },   // B7
          commentary: 'Kenjaku steps onto B7 to contest the western corridor.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 2, y: 1 }, // Hakari B1
        to: { x: 2, y: 2 },   // B2
        actionType: 'move',
        notation: 'Hakari B1 → B2 (Rusher Mobilization)',
        tukunaInstruction:
          'Advance Hakari 1 step orthogonally to B2.',
        tacticalBreakdown:
          'Hakari on B2 pairs with Maki on C4 to form a lethal dual-threat skirmish team on Black’s right wing.',
        hint: 'Move Hakari to B2.',
        vectorArrows: [
          { from: { x: 2, y: 1 }, to: { x: 2, y: 2 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 }, // Black Pawn D7
          to: { x: 4, y: 6 },   // D6
          commentary: 'Black advances D7 pawn to D6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 3, y: 4 }, // Maki C4
        to: { x: 2, y: 5 },   // B5
        actionType: 'move',
        notation: 'Maki C4 → B5 (Diagonal Ambush)',
        tukunaInstruction:
          'Shift Maki diagonally to B5 to target Kenjaku on B7.',
        tacticalBreakdown:
          'Maki on B5 places Kenjaku under immediate threat while bypassing B6 pawn defenses.',
        hint: 'Move Maki diagonally to B5.',
        vectorArrows: [
          { from: { x: 3, y: 4 }, to: { x: 2, y: 5 }, color: 'crimson', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black pushes C7 pawn to C6 to protect Kenjaku.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 3, y: 2 }, // Pawn C2
        to: { x: 3, y: 3 },   // C3
        actionType: 'move',
        notation: 'C2 → C3 (Flank Anchor)',
        tukunaInstruction:
          'Push your C2 pawn forward to C3.',
        tacticalBreakdown:
          'Securing C3 anchors your western pawn line and covers Maki’s rear.',
        hint: 'Advance C2 pawn to C3.',
        vectorArrows: [
          { from: { x: 3, y: 2 }, to: { x: 3, y: 3 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 8 }, // Uraume C8
          to: { x: 2, y: 8 },   // B8
          commentary: 'Uraume slides to B8 to defend Kenjaku.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 2, y: 5 }, // Maki B5
        to: { x: 1, y: 5 },   // A5
        actionType: 'move',
        notation: 'Maki B5 → A5 (Extension Corridor Entry)',
        tukunaInstruction:
          'Step Maki into the Left Colony Extension arm square at A5.',
        tacticalBreakdown:
          'Entering the A-column extension allows Maki to bypass all frontal defenders and strike Sukuna from the side!',
        hint: 'Move Maki left to A5.',
        vectorArrows: [
          { from: { x: 2, y: 5 }, to: { x: 1, y: 5 }, color: 'crimson', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Black advances E7 pawn to E6.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 2, y: 2 }, // Hakari B2
        to: { x: 1, y: 3 },   // A3
        actionType: 'move',
        notation: 'Hakari B2 → A3 (Dual Extension Invasion)',
        tukunaInstruction:
          'Move Hakari to A3 to follow Maki into the western extension corridor.',
        tacticalBreakdown:
          'With both Maki and Hakari occupying the western arm, Black’s right wing is completely overrun!',
        hint: 'Move Hakari to A3.',
        vectorArrows: [
          { from: { x: 2, y: 2 }, to: { x: 1, y: 3 }, color: 'crimson', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_open_4',
    title: 'Lesson 4: Warden 7:3 Ratio Field Strike',
    subtitle: 'Deploy Nanami’s Ratio Field to constrain adjacent enemy pieces to 1-step max',
    namedStrategy: 'Warden Suppression Lock',
    curriculumType: 'opening',
    tier: 'intermediate',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Kento Nanami is a Warden. Any enemy standing in the 8 squares adjacent to a Warden is subjected to a Ratio Field, reducing their movement to 1 square and disabling Artillery strikes!',
    completionMessage:
      'Ratio Field locked! Enemy pieces in the central sector are suppressed.',
    patternHighlights: [
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 5 }, { x: 3, y: 5 }, { x: 3, y: 6 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 4, y: 2 }, // D2 Pawn
        to: { x: 4, y: 3 },   // D3
        actionType: 'move',
        notation: 'D2 → D3 (Column Open)',
        tukunaInstruction:
          'Push your D2 pawn to D3 to clear the D-column for Nanami.',
        tacticalBreakdown:
          'Wardens slide up to 3 squares orthogonally. Clearing D2 allows Nanami to thrust deep into the center board.',
        hint: 'Push D2 pawn to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'crimson', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Reggie Star prepares Black’s Warden Ratio Field on E6.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 4, y: 3 }, // D3 Pawn
        to: { x: 4, y: 4 },   // D4
        actionType: 'move',
        notation: 'D3 → D4 (Center Wall Push)',
        tukunaInstruction:
          'Push your D3 pawn forward to D4 to clear D3 for Nanami.',
        tacticalBreakdown:
          'Advancing the pawn to D4 secures central space and clears the D3 square.',
        hint: 'Push D3 pawn to D4.',
        vectorArrows: [
          { from: { x: 4, y: 3 }, to: { x: 4, y: 4 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 8 }, // Reggie E8
          to: { x: 5, y: 7 },   // E7 (Orthogonal Warden step)
          commentary: 'Black advances Warden Reggie orthogonally to E7.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 4, y: 1 }, // Nanami D1
        to: { x: 4, y: 3 },   // D3 (Slide 2 squares orthogonally up clear D-file!)
        actionType: 'move',
        notation: 'Nanami D1 → D3 (Warden Slide)',
        tukunaInstruction:
          'Slide Nanami 2 squares forward to D3.',
        tacticalBreakdown:
          'Nanami on D3 projects an 8-square Ratio Field covering C3, E3, C4, E4.',
        hint: 'Slide Nanami to D3.',
        vectorArrows: [
          { from: { x: 4, y: 1 }, to: { x: 4, y: 3 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black pushes C7 pawn to C6.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 4, y: 3 }, // Nanami D3
        to: { x: 3, y: 3 },   // C3 (Shift 1 square orthogonally left!)
        actionType: 'move',
        notation: 'Nanami D3 → C3 (Flank Ratio Shift)',
        tukunaInstruction:
          'Shift Nanami 1 square left to C3.',
        tacticalBreakdown:
          'Nanami on C3 opens the C-column for a forward slide to C5.',
        hint: 'Move Nanami left to C3.',
        vectorArrows: [
          { from: { x: 4, y: 3 }, to: { x: 3, y: 3 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Black pushes B7 pawn to B6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 3, y: 3 }, // Nanami C3
        to: { x: 3, y: 5 },   // C5 (Slide 2 squares orthogonally up C-file!)
        actionType: 'move',
        notation: 'Nanami C3 → C5 (Deep Ratio Penetration)',
        tukunaInstruction:
          'Slide Nanami 2 squares forward along the C-file to C5.',
        tacticalBreakdown:
          'Nanami on C5 exerts heavy Ratio Field suppression directly onto C6 and B7 Kenjaku.',
        hint: 'Slide Nanami to C5.',
        vectorArrows: [
          { from: { x: 3, y: 3 }, to: { x: 3, y: 5 }, color: 'crimson', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6
          commentary: 'Black advances F7 pawn to F6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 3, y: 2 }, // Pawn C2
        to: { x: 3, y: 3 },   // C3
        actionType: 'move',
        notation: 'C2 → C3 (Support Push)',
        tukunaInstruction:
          'Advance C2 pawn to C3 to cover C4.',
        tacticalBreakdown:
          'Securing C3 creates a solid fortress supporting Nanami.',
        hint: 'Push C2 pawn to C3.',
        vectorArrows: [
          { from: { x: 3, y: 2 }, to: { x: 3, y: 3 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 }, // Kenjaku B8
          to: { x: 2, y: 7 },   // B7
          commentary: 'Kenjaku steps onto B7.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 6, y: 2 }, // F2 Pawn
        to: { x: 6, y: 3 },   // F3
        actionType: 'move',
        notation: 'F2 → F3 (Flank Guard Push)',
        tukunaInstruction:
          'Push your F2 pawn forward to F3 to protect Nanami’s right flank.',
        tacticalBreakdown:
          'F3 secures E4 and completes the central pawn triangle supporting Nanami.',
        hint: 'Push F2 pawn to F3.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 6, y: 3 }, color: 'crimson', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 7 }, // Black Pawn G7
          to: { x: 7, y: 6 },   // G6
          commentary: 'Black advances G7 pawn to G6.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 3, y: 5 }, // Nanami C5
        to: { x: 3, y: 6 },   // C6 (Capture C6 pawn!)
        actionType: 'move',
        notation: 'Nanami C5 × C6 (7:3 Ratio Capture Strike!)',
        tukunaInstruction:
          'Strike forward with Nanami from C5 to capture Black’s C6 pawn on C6!',
        tacticalBreakdown:
          'Nanami captures C6 with 7:3 Ratio precision, locking down Kenjaku on B7 and Reggie on D7 in his Ratio Field!',
        hint: 'Capture the C6 pawn with Nanami.',
        vectorArrows: [
          { from: { x: 3, y: 5 }, to: { x: 3, y: 6 }, color: 'crimson', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_open_5',
    title: 'Lesson 5: Rusher Jackpot Chain',
    subtitle: 'Position Kinji Hakari for high rush pressure and extra Jackpot steps',
    namedStrategy: 'Jackpot Blitz Attack',
    curriculumType: 'opening',
    tier: 'intermediate',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Kinji Hakari is a Rusher. Capturing an enemy piece activates his Jackpot, earning an immediate extra step into an unattacked square!',
    completionMessage:
      'Jackpot activated! Hakari’s multi-step rush creates overwhelming tempo advantages.',
    patternHighlights: [
      { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 2, y: 2 }, // B2 Pawn
        to: { x: 2, y: 3 },   // B3
        actionType: 'move',
        notation: 'B2 → B3 (Runway Push)',
        tukunaInstruction:
          'Move your B2 pawn to B3 to give Hakari diagonal clearance.',
        tacticalBreakdown:
          'Rushers slide up to 2 squares diagonally. Clearing B2 opens the B1-D3 diagonal runway.',
        hint: 'Push B2 pawn to B3.',
        vectorArrows: [
          { from: { x: 2, y: 2 }, to: { x: 2, y: 3 }, color: 'crimson', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Opponent advances B7 pawn to B6.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 2, y: 1 }, // Hakari B1
        to: { x: 2, y: 2 },   // B2
        actionType: 'move',
        notation: 'Hakari B1 → B2 (Rusher Step)',
        tukunaInstruction:
          'Advance Hakari 1 square forward to B2.',
        tacticalBreakdown:
          'Hakari on B2 prepares a 2-square diagonal leap into D4.',
        hint: 'Move Hakari to B2.',
        vectorArrows: [
          { from: { x: 2, y: 1 }, to: { x: 2, y: 2 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black advances C7 pawn to C6.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 2, y: 2 }, // Hakari B2
        to: { x: 4, y: 4 },   // D4 (Slide 2 diagonally!)
        actionType: 'move',
        notation: 'Hakari B2 → D4 (Diagonal Rusher Leap)',
        tukunaInstruction:
          'Slide Hakari 2 squares diagonally from B2 to D4!',
        tacticalBreakdown:
          'Hakari’s diagonal slide penetrates the central board and threatens C6 and E6 pawns.',
        hint: 'Slide Hakari 2 squares diagonally to D4.',
        vectorArrows: [
          { from: { x: 2, y: 2 }, to: { x: 4, y: 4 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 }, // Black Pawn D7
          to: { x: 4, y: 6 },   // D6
          commentary: 'Black pushes D7 pawn to D6.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 3, y: 2 }, // Pawn C2
        to: { x: 3, y: 3 },   // C3
        actionType: 'move',
        notation: 'C2 → C3 (Flank Shield)',
        tukunaInstruction:
          'Push C2 pawn to C3.',
        tacticalBreakdown:
          'Anchoring C3 provides a safety retreat square for Hakari.',
        hint: 'Push C2 pawn to C3.',
        vectorArrows: [
          { from: { x: 3, y: 2 }, to: { x: 3, y: 3 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Black advances E7 pawn to E6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 4, y: 4 }, // Hakari D4
        to: { x: 5, y: 5 },   // E5
        actionType: 'move',
        notation: 'Hakari D4 → E5 (Diagonal Thrust)',
        tukunaInstruction:
          'Advance Hakari diagonally to E5.',
        tacticalBreakdown:
          'Hakari on E5 directly attacks Black’s F6 pawn target.',
        hint: 'Move Hakari diagonally to E5.',
        vectorArrows: [
          { from: { x: 4, y: 4 }, to: { x: 5, y: 5 }, color: 'crimson', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6
          commentary: 'Black advances F7 pawn to F6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 4, y: 2 }, // Pawn D2
        to: { x: 4, y: 3 },   // D3
        actionType: 'move',
        notation: 'D2 → D3 (Pawn Support)',
        tukunaInstruction:
          'Advance D2 pawn to D3.',
        tacticalBreakdown:
          'Solidifying D3 covers E4 and supports Hakari’s line of retreat.',
        hint: 'Push D2 pawn to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 }, // Kenjaku B8
          to: { x: 2, y: 7 },   // B7
          commentary: 'Kenjaku steps onto B7.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 5, y: 5 }, // Hakari E5
        to: { x: 6, y: 6 },   // F6 (Capture F6 pawn!)
        actionType: 'move',
        notation: 'Hakari E5 × F6 (Jackpot Capture Strike!)',
        tukunaInstruction:
          'Capture Black’s F6 pawn with Hakari on F6!',
        tacticalBreakdown:
          'Hakari captures F6! Jackpot triggers instantly, earning 1 extra step.',
        hint: 'Capture the F6 pawn with Hakari.',
        vectorArrows: [
          { from: { x: 5, y: 5 }, to: { x: 6, y: 6 }, color: 'crimson', label: '7 🎰', style: 'solid' },
        ],
      },
      {
        stepNumber: 8,
        from: { x: 6, y: 6 }, // Hakari F6
        to: { x: 7, y: 5 },   // G5 (Unattacked Jackpot Safe Bonus Step)
        actionType: 'move',
        notation: 'Hakari F6 → G5 (Jackpot Safe Bonus Step)',
        tukunaInstruction:
          'Execute Hakari’s Jackpot bonus step to pivot safely onto G5.',
        tacticalBreakdown:
          'Hakari’s Jackpot grants an immediate extra non-capturing step into an unattacked square (G5), maintaining total initiative.',
        hint: 'Execute the extra Jackpot move to G5.',
        vectorArrows: [
          { from: { x: 6, y: 6 }, to: { x: 7, y: 5 }, color: 'crimson', label: '8 🎰', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_open_6',
    title: 'Lesson 6: Colony Extension Expansion',
    subtitle: 'Push units into top, left, right, and bottom 6-square colony extensions',
    namedStrategy: 'Cross-Arm Corridor Control',
    curriculumType: 'opening',
    tier: 'intermediate',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'The Culling Game board features 4 extended 6-square colony arms. Moving units into these arms controls strategic spawn corridors.',
    completionMessage:
      'Colony extensions claimed! Controlling arm corridors restricts opponent flank escapes.',
    patternHighlights: [
      { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 5 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 2, y: 1 }, // Hakari B1
        to: { x: 1, y: 2 },   // A2 (Left colony entry)
        actionType: 'move',
        notation: 'Hakari B1 → A2 (Left Extension Entry)',
        tukunaInstruction:
          'Move Hakari from B1 into the Left Colony Arm square at A2 (x=1, y=2).',
        tacticalBreakdown:
          'Entering extension arms allows fast units to bypass central chokepoints and attack laterally.',
        hint: 'Move Hakari to A2.',
        vectorArrows: [
          { from: { x: 2, y: 1 }, to: { x: 1, y: 2 }, color: 'crimson', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 8 }, // Kurourushi G8
          to: { x: 8, y: 7 },   // H7 (Right colony arm)
          commentary: 'Kurourushi occupies Black’s right colony arm!',
        },
      },
      {
        stepNumber: 2,
        from: { x: 1, y: 2 }, // Hakari A2
        to: { x: 1, y: 3 },   // A3
        actionType: 'move',
        notation: 'Hakari A2 → A3 (Extension Advance)',
        tukunaInstruction:
          'Push Hakari deeper into the left arm at A3.',
        tacticalBreakdown:
          'Advancing in colony corridors forces Black to shift defenders away from Sukuna.',
        hint: 'Move Hakari to A3.',
        vectorArrows: [
          { from: { x: 1, y: 2 }, to: { x: 1, y: 3 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 8, y: 7 }, // Kurourushi H7
          to: { x: 8, y: 6 },   // H6
          commentary: 'Kurourushi advances down the eastern extension arm.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 3, y: 2 }, // Pawn C2
        to: { x: 3, y: 3 },   // C3
        actionType: 'move',
        notation: 'C2 → C3 (Corridor Support)',
        tukunaInstruction:
          'Push your C2 pawn to C3.',
        tacticalBreakdown:
          'C3 guards the junction between the main 8x8 square and the western extension.',
        hint: 'Push C2 pawn to C3.',
        vectorArrows: [
          { from: { x: 3, y: 2 }, to: { x: 3, y: 3 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black advances C7 pawn to C6.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 1, y: 3 }, // Hakari A3
        to: { x: 1, y: 4 },   // A4
        actionType: 'move',
        notation: 'Hakari A3 → A4 (Deep Left Infiltration)',
        tukunaInstruction:
          'Advance Hakari to A4.',
        tacticalBreakdown:
          'Hakari on A4 commands the entire western flank.',
        hint: 'Move Hakari to A4.',
        vectorArrows: [
          { from: { x: 1, y: 3 }, to: { x: 1, y: 4 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Black pushes B7 pawn to B6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 7, y: 2 }, // Pawn G2
        to: { x: 7, y: 3 },   // G3
        actionType: 'move',
        notation: 'G2 → G3 (Eastern Gate Push)',
        tukunaInstruction:
          'Push your G2 pawn to G3.',
        tacticalBreakdown:
          'G3 prepares Mechamaru’s entry into the right extension arm.',
        hint: 'Push G2 pawn to G3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 7, y: 3 }, color: 'crimson', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 7 }, // Black Pawn G7
          to: { x: 7, y: 6 },   // G6
          commentary: 'Black advances G7 pawn to G6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 6, y: 1 }, // Mechamaru F1
        to: { x: 7, y: 2 },   // G2 (1-step diagonal onto cleared G2 square)
        actionType: 'move',
        notation: 'Mechamaru F1 → G2 (Right Flank Shift)',
        tukunaInstruction:
          'Step Mechamaru 1 square diagonally to G2.',
        tacticalBreakdown:
          'Positioning Mechamaru on G2 prepares entry into the right extension arm.',
        hint: 'Move Mechamaru diagonally to G2.',
        vectorArrows: [
          { from: { x: 6, y: 1 }, to: { x: 7, y: 2 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6
          commentary: 'Black pushes F7 pawn to F6.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 7, y: 2 }, // Mechamaru G2
        to: { x: 8, y: 3 },   // H3 (Right colony entry - 1-step diagonal!)
        actionType: 'move',
        notation: 'Mechamaru G2 → H3 (Right Extension Entry)',
        tukunaInstruction:
          'Step Mechamaru diagonally into the Right Colony Arm square at H3 (x=8, y=3).',
        tacticalBreakdown:
          'Mechamaru on H3 enters the eastern extension corridor, establishing dual-wing extension presence.',
        hint: 'Move Mechamaru to H3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 8, y: 3 }, color: 'crimson', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Black pushes E7 pawn to E6.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 1, y: 4 }, // Hakari A4
        to: { x: 2, y: 5 },   // B5
        actionType: 'move',
        notation: 'Hakari A4 → B5 (Extension Flank Strike)',
        tukunaInstruction:
          'Pincer inwards from A4 to B5 with Hakari.',
        tacticalBreakdown:
          'Striking inwards from the colony extension traps Black’s defensive line between two fires!',
        hint: 'Move Hakari from A4 to B5.',
        vectorArrows: [
          { from: { x: 1, y: 4 }, to: { x: 2, y: 5 }, color: 'crimson', label: '8', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_open_7',
    title: 'Lesson 7: Artillery Domain Barrage',
    subtitle: 'Align Mechamaru to fire Ranged Strikes at dist 2 without moving',
    namedStrategy: 'Artillery Snipe Battery',
    curriculumType: 'opening',
    tier: 'advanced',
    playerColor: 'white',
    initialBoard: createLesson7Board(),
    tukunaGreeting:
      'Ultimate Mechamaru is an Artillery unit. When an enemy target is 2 squares away in a straight line and the middle square is clear, Mechamaru fires a Ranged Strike!',
    completionMessage:
      'Ranged Snipe successful! Mechamaru destroyed the target without exposing himself.',
    patternHighlights: [
      { x: 6, y: 1 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 4 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 6, y: 1 }, // Mechamaru F1
        to: { x: 6, y: 3 },   // Snipe target F3 (F2 is empty!)
        actionType: 'shoot',
        notation: 'Mechamaru 🏹 F3 (Ranged Snipe Strike!)',
        tukunaInstruction:
          'Fire Mechamaru’s Ranged Strike at the Black Pawn on F3 across the empty F2 square.',
        tacticalBreakdown:
          'Ranged Strikes remove enemy units from 2 squares away without moving Mechamaru from his post.',
        hint: 'Fire Ranged Strike on F3 with Mechamaru.',
        vectorArrows: [
          { from: { x: 6, y: 1 }, to: { x: 6, y: 3 }, color: 'crimson', label: '1 🏹', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black advances C7 pawn to C6.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 7, y: 2 }, // Pawn G2
        to: { x: 7, y: 3 },   // G3
        actionType: 'move',
        notation: 'G2 → G3 (Battery Clearance)',
        tukunaInstruction:
          'Push your G2 pawn to G3.',
        tacticalBreakdown:
          'Advancing G3 creates room for Mechamaru to step forward.',
        hint: 'Push G2 pawn to G3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 7, y: 3 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 }, // Black Pawn D7
          to: { x: 4, y: 6 },   // D6
          commentary: 'Black advances D7 pawn to D6.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 6, y: 1 }, // Mechamaru F1
        to: { x: 6, y: 2 },   // F2
        actionType: 'move',
        notation: 'Mechamaru F1 → F2 (Battery Advance)',
        tukunaInstruction:
          'Advance Mechamaru 1 step forward to F2.',
        tacticalBreakdown:
          'Positioning Mechamaru on F2 extends his snipe range to F4 and D4.',
        hint: 'Move Mechamaru to F2.',
        vectorArrows: [
          { from: { x: 6, y: 1 }, to: { x: 6, y: 2 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Black pushes E7 pawn to E6.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 5, y: 2 }, // Pawn E2
        to: { x: 5, y: 3 },   // E3
        actionType: 'move',
        notation: 'E2 → E3 (Guard Advance)',
        tukunaInstruction:
          'Push your E2 pawn to E3.',
        tacticalBreakdown:
          'E3 secures Mechamaru’s left diagonal.',
        hint: 'Push E2 pawn to E3.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 3 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Black advances B7 pawn to B6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 7, y: 1 }, // Yuji G1
        to: { x: 7, y: 2 },   // G2
        actionType: 'move',
        notation: 'Yuji G1 → G2 (Vanguard Escort)',
        tukunaInstruction:
          'Advance Yuji to G2.',
        tacticalBreakdown:
          'Yuji escorts Mechamaru’s right flank.',
        hint: 'Move Yuji to G2.',
        vectorArrows: [
          { from: { x: 7, y: 1 }, to: { x: 7, y: 2 }, color: 'crimson', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6 (1-step pawn advance)
          commentary: 'Black advances F7 pawn to F6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 6, y: 2 }, // Mechamaru F2
        to: { x: 6, y: 3 },   // F3
        actionType: 'move',
        notation: 'Mechamaru F2 → F3 (Outpost Step)',
        tukunaInstruction:
          'Move Mechamaru to F3.',
        tacticalBreakdown:
          'Mechamaru on F3 commands the central cross.',
        hint: 'Move Mechamaru to F3.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 6, y: 3 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 }, // Kenjaku B8
          to: { x: 2, y: 7 },   // B7
          commentary: 'Kenjaku steps onto B7.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 4, y: 2 }, // Pawn D2
        to: { x: 4, y: 3 },   // D3
        actionType: 'move',
        notation: 'D2 → D3 (Pawn Support)',
        tukunaInstruction:
          'Push D2 pawn to D3.',
        tacticalBreakdown:
          'Securing D3 seals the center.',
        hint: 'Push D2 pawn to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'crimson', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 6 }, // Black Pawn F6
          to: { x: 6, y: 5 },   // F5
          commentary: 'Black advances F6 pawn to F5 into Mechamaru’s target line.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 6, y: 3 }, // Mechamaru F3
        to: { x: 6, y: 5 },   // Snipe target F5 (F4 is empty!)
        actionType: 'shoot',
        notation: 'Mechamaru 🏹 F5 (2nd Ranged Snipe Barrage!)',
        tukunaInstruction:
          'Fire a 2nd Ranged Strike with Mechamaru at F5 across empty F4!',
        tacticalBreakdown:
          'Mechamaru’s second ranged strike clears Black’s advanced pawns with total immunity!',
        hint: 'Fire Ranged Strike on F5 with Mechamaru.',
        vectorArrows: [
          { from: { x: 6, y: 3 }, to: { x: 6, y: 5 }, color: 'crimson', label: '8 🏹', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_open_8',
    title: 'Lesson 8: Domain Step Sovereign Gambit',
    subtitle: 'Execute Gojo’s 2-square Domain Step jump to bypass enemy pins and secure check',
    namedStrategy: 'Sovereign Domain Step Assault',
    curriculumType: 'opening',
    tier: 'advanced',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Satoru Gojo possesses a once-per-game ability: Domain Step! Gojo teleports 2 squares in any straight or diagonal direction, provided he is not in check and lands safely.',
    completionMessage:
      'Domain Step executed! Gojo leaped across defenders, placing Sukuna in mortal check!',
    patternHighlights: [
      { x: 8, y: 1 }, { x: 6, y: 3 }, { x: 5, y: 4 }, { x: 4, y: 5 }, { x: 3, y: 6 }, { x: 2, y: 7 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 8, y: 1 }, // Gojo H1
        to: { x: 6, y: 3 },   // F3 (Domain Step 2-square diagonal jump!)
        actionType: 'teleport',
        notation: 'Gojo 🌀 F3 (Domain Step Teleport!)',
        tukunaInstruction:
          'Activate Gojo’s Domain Step to teleport 2 squares diagonally from H1 to F3.',
        tacticalBreakdown:
          'Domain Step bypasses enemy pawn chains, placing Gojo in a high-advantage offensive post.',
        hint: 'Teleport Gojo from H1 to F3.',
        vectorArrows: [
          { from: { x: 8, y: 1 }, to: { x: 6, y: 3 }, color: 'crimson', label: '1 🌀', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black advances C7 pawn to C6.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 6, y: 3 }, // Gojo F3
        to: { x: 5, y: 4 },   // E4
        actionType: 'move',
        notation: 'Gojo F3 → E4 (Sovereign Incursion)',
        tukunaInstruction:
          'Advance Gojo 1 step diagonally to E4.',
        tacticalBreakdown:
          'Gojo on E4 commands the central diagonals, threatening both D5 and F5.',
        hint: 'Move Gojo diagonally to E4.',
        vectorArrows: [
          { from: { x: 6, y: 3 }, to: { x: 5, y: 4 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 }, // Black Pawn D7
          to: { x: 4, y: 6 },   // D6
          commentary: 'Black advances D7 pawn to D6.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 7, y: 2 }, // Pawn G2
        to: { x: 7, y: 3 },   // G3
        actionType: 'move',
        notation: 'G2 → G3 (Rear Reinforcement)',
        tukunaInstruction:
          'Push your G2 pawn to G3.',
        tacticalBreakdown:
          'Advancing G3 covers Gojo’s rear retreat line.',
        hint: 'Push G2 pawn to G3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 7, y: 3 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Black pushes B7 pawn to B6.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 7, y: 1 }, // Yuji G1
        to: { x: 7, y: 2 },   // G2
        actionType: 'move',
        notation: 'Yuji G1 → G2 (Vanguard Mobilization)',
        tukunaInstruction:
          'Advance Yuji to G2.',
        tacticalBreakdown:
          'Yuji steps to G2 to escort Gojo’s central thrust.',
        hint: 'Move Yuji to G2.',
        vectorArrows: [
          { from: { x: 7, y: 1 }, to: { x: 7, y: 2 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 }, // Kenjaku B8
          to: { x: 2, y: 7 },   // B7
          commentary: 'Kenjaku steps onto B7.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 5, y: 4 }, // Gojo E4
        to: { x: 6, y: 5 },   // F5 (Unattacked diagonal step!)
        actionType: 'move',
        notation: 'Gojo E4 → F5 (Sovereign Flank Pressure)',
        tukunaInstruction:
          'Shift Gojo diagonally to F5 onto an unattacked square.',
        tacticalBreakdown:
          'Gojo on F5 avoids Black’s C6 pawn sightline while threatening Black’s E-file.',
        hint: 'Move Gojo diagonally to F5.',
        vectorArrows: [
          { from: { x: 5, y: 4 }, to: { x: 6, y: 5 }, color: 'crimson', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Black advances E7 pawn to E6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 6, y: 5 }, // Gojo F5
        to: { x: 6, y: 4 },   // F4 (Sovereign Safe Step)
        actionType: 'move',
        notation: 'Gojo F5 → F4 (Sovereign Tactical Step)',
        tukunaInstruction:
          'Step Gojo 1 square back to F4 onto an unattacked square.',
        tacticalBreakdown:
          'Gojo on F4 avoids Black’s F7 pawn attack diagonal while maintaining central presence.',
        hint: 'Move Gojo to F4.',
        vectorArrows: [
          { from: { x: 6, y: 5 }, to: { x: 6, y: 4 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6
          commentary: 'Black advances F7 pawn to F6.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 6, y: 2 }, // Pawn F2
        to: { x: 6, y: 3 },   // F3
        actionType: 'move',
        notation: 'F2 → F3 (Base Anchor Push)',
        tukunaInstruction:
          'Push F2 pawn to F3.',
        tacticalBreakdown:
          'F3 secures Gojo’s line of communication.',
        hint: 'Push F2 pawn to F3.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 6, y: 3 }, color: 'crimson', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 6 }, // Black Pawn B6
          to: { x: 2, y: 5 },   // B5
          commentary: 'Black Pawn advances to B5.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 6, y: 4 }, // Gojo F4
        to: { x: 5, y: 4 },   // E4 (Unattacked Sovereign Step)
        actionType: 'move',
        notation: 'Gojo F4 → E4 (Sovereign Central Control)',
        tukunaInstruction:
          'Step Gojo 1 square left to E4 to command the central cross!',
        tacticalBreakdown:
          'Gojo on E4 commands the central cross with complete sovereign invulnerability.',
        hint: 'Move Gojo left to E4.',
        vectorArrows: [
          { from: { x: 6, y: 4 }, to: { x: 5, y: 4 }, color: 'crimson', label: '8 ⚔️', style: 'solid' },
        ],
      },
    ],
  },

  // =========================================================================
  // MID-GAME STRATEGY CURRICULUM (Lessons 9 - 16: 8 Steps Each)
  // =========================================================================

  {
    id: 'culling_mid_1',
    title: 'Lesson 9: Vanguard Coordination & Kenjaku Counter-Strike',
    subtitle: 'Synchronize Vanguard Yuji and Warden Nanami to trap enemy Kenjaku',
    namedStrategy: 'Dual Vanguard Pincer',
    curriculumType: 'midgame',
    tier: 'beginner',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'In the mid-game, piece coordination decides survival. Synchronize Vanguard Yuji with Warden Nanami to corner enemy Vanguard Kenjaku.',
    completionMessage:
      'Kenjaku eliminated! Dual-piece coordination neutralized Black’s main vanguard force.',
    patternHighlights: [
      { x: 7, y: 2 }, { x: 7, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 4 }, { x: 7, y: 4 }, { x: 3, y: 6 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 7, y: 2 }, // G2 Pawn
        to: { x: 7, y: 3 },   // G3
        actionType: 'move',
        notation: 'G2 → G3 (Clear Yuji)',
        tukunaInstruction:
          'Push G2 pawn to G3 to clear Yuji’s column.',
        tacticalBreakdown:
          'Opening the G-column allows Yuji to slide into the central battle zone.',
        hint: 'Push G2 pawn to G3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 7, y: 3 }, color: 'crimson', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Black advances B7 pawn to B6 to clear Kenjaku’s vanguard column.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 7, y: 1 }, // Yuji G1
        to: { x: 7, y: 2 },   // G2 (Step onto cleared G2 square)
        actionType: 'move',
        notation: 'Yuji G1 → G2 (Vanguard Step)',
        tukunaInstruction:
          'Step Yuji to G2 behind the G3 pawn.',
        tacticalBreakdown:
          'Yuji on G2 prepares a diagonal shift onto the central cross.',
        hint: 'Move Yuji to G2.',
        vectorArrows: [
          { from: { x: 7, y: 1 }, to: { x: 7, y: 2 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 }, // Kenjaku B8
          to: { x: 2, y: 7 },   // B7
          commentary: 'Kenjaku steps onto B7 to establish an aggressive outpost.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 7, y: 3 }, // G3 Pawn
        to: { x: 7, y: 4 },   // G4
        actionType: 'move',
        notation: 'G3 → G4 (Pawn Wedge Advance)',
        tukunaInstruction:
          'Push G3 pawn to G4 to clear the G3 square.',
        tacticalBreakdown:
          'Advancing G4 opens diagonal attack lanes for Yuji.',
        hint: 'Push G3 pawn to G4.',
        vectorArrows: [
          { from: { x: 7, y: 3 }, to: { x: 7, y: 4 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black advances C7 pawn to C6.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 7, y: 2 }, // Yuji G2
        to: { x: 6, y: 3 },   // F3 (Diagonal shift)
        actionType: 'move',
        notation: 'Yuji G2 → F3 (Diagonal Shift)',
        tukunaInstruction:
          'Shift Yuji diagonally to F3 onto the open F-file.',
        tacticalBreakdown:
          'Yuji on F3 sets up a long-range Vanguard thrust up the F-column.',
        hint: 'Move Yuji diagonally to F3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 6, y: 3 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 }, // Black Pawn D7
          to: { x: 4, y: 6 },   // D6
          commentary: 'Black pushes D7 pawn to D6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 6, y: 3 }, // Yuji F3
        to: { x: 6, y: 5 },   // F5 (Slide 2 squares up open F-column!)
        actionType: 'move',
        notation: 'Yuji F3 → F5 (Vanguard Pincer Thrust)',
        tukunaInstruction:
          'Slide Yuji 2 squares forward along the open F-column to F5.',
        tacticalBreakdown:
          'Yuji’s slide pierces deep into Black’s center, threatening D6 and E6 pawns.',
        hint: 'Slide Yuji to F5.',
        vectorArrows: [
          { from: { x: 6, y: 3 }, to: { x: 6, y: 5 }, color: 'crimson', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Black advances E7 pawn to E6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 4, y: 2 }, // D2 Pawn
        to: { x: 4, y: 3 },   // D3
        actionType: 'move',
        notation: 'D2 → D3 (Nanami Runway Push)',
        tukunaInstruction:
          'Push D2 pawn to D3 to clear D2 for Warden Nanami.',
        tacticalBreakdown:
          'Clearing D2 allows Nanami to step forward.',
        hint: 'Push D2 pawn to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6
          commentary: 'Black pushes F7 pawn to F6.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 4, y: 1 }, // Nanami D1
        to: { x: 4, y: 2 },   // D2 (Orthogonal Warden step)
        actionType: 'move',
        notation: 'Nanami D1 → D2 (Warden Ratio Deployment)',
        tukunaInstruction:
          'Step Warden Nanami orthogonally to D2.',
        tacticalBreakdown:
          'Nanami on D2 projects his 8-square Ratio Field into the center board.',
        hint: 'Move Nanami to D2.',
        vectorArrows: [
          { from: { x: 4, y: 1 }, to: { x: 4, y: 2 }, color: 'crimson', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 8 }, // Uraume C8
          to: { x: 3, y: 7 },   // C7
          commentary: 'Uraume advances to C7.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 6, y: 5 }, // Yuji F5
        to: { x: 5, y: 5 },   // E5
        actionType: 'move',
        notation: 'Yuji F5 → E5 (Dual Vanguard Pincer Execution!)',
        tukunaInstruction:
          'Shift Yuji left to E5 to complete the dual vanguard pincer!',
        tacticalBreakdown:
          'Yuji on E5 commands both D6 and F6 diagonals while guarded by your F3 pawn wall. The pincer is complete!',
        hint: 'Move Yuji left to E5.',
        vectorArrows: [
          { from: { x: 6, y: 5 }, to: { x: 5, y: 5 }, color: 'crimson', label: '8 ⚔️', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_mid_2',
    title: 'Lesson 10: Ranged Snipe Synergy (Mechamaru & Uraume Tactics)',
    subtitle: 'Construct 2-square firing corridors for Mechamaru ranged snipes',
    namedStrategy: 'Corridor Battery Snipe',
    curriculumType: 'midgame',
    tier: 'intermediate',
    playerColor: 'white',
    initialBoard: createLesson7Board(),
    tukunaGreeting:
      'Artillery units excel when firing through empty 2-square gaps. Learn to clear corridors and systematically eliminate enemy key pieces.',
    completionMessage:
      'Battery synergy achieved! Mechamaru’s sniping lines cleared the enemy mid-board.',
    patternHighlights: [
      { x: 6, y: 1 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 4 }, { x: 6, y: 5 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 6, y: 1 }, // Mechamaru F1
        to: { x: 6, y: 3 },   // Snipe F3 target (F2 empty)
        actionType: 'shoot',
        notation: 'Mechamaru 🏹 F3 (1st Corridor Snipe)',
        tukunaInstruction:
          'Execute a Ranged Strike on F3 with Mechamaru.',
        tacticalBreakdown:
          'Destroying the F3 target clears the F-column for deeper sniping operations.',
        hint: 'Fire Ranged Strike on F3.',
        vectorArrows: [
          { from: { x: 6, y: 1 }, to: { x: 6, y: 3 }, color: 'crimson', label: '1 🏹', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black advances C7 pawn to C6.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 7, y: 2 }, // Pawn G2
        to: { x: 7, y: 3 },   // G3
        actionType: 'move',
        notation: 'G2 → G3 (Clear Side Corridor)',
        tukunaInstruction:
          'Push G2 pawn to G3.',
        tacticalBreakdown:
          'Clearing G2 gives Mechamaru lateral maneuverability.',
        hint: 'Push G2 pawn to G3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 7, y: 3 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 }, // Black Pawn D7
          to: { x: 4, y: 6 },   // D6
          commentary: 'Black pushes D7 pawn to D6.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 6, y: 1 }, // Mechamaru F1
        to: { x: 6, y: 2 },   // F2
        actionType: 'move',
        notation: 'Mechamaru F1 → F2 (Battery Advance)',
        tukunaInstruction:
          'Advance Mechamaru to F2.',
        tacticalBreakdown:
          'Mechamaru on F2 looks up the F-column across empty F3 to target F4 or F5.',
        hint: 'Move Mechamaru to F2.',
        vectorArrows: [
          { from: { x: 6, y: 1 }, to: { x: 6, y: 2 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Black advances E7 pawn to E6.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 5, y: 2 }, // Pawn E2
        to: { x: 5, y: 3 },   // E3
        actionType: 'move',
        notation: 'E2 → E3 (Diagonal Guard)',
        tukunaInstruction:
          'Push E2 pawn to E3.',
        tacticalBreakdown:
          'Securing E3 guards Mechamaru’s left diagonal.',
        hint: 'Push E2 pawn to E3.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 3 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Black advances B7 pawn to B6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 7, y: 1 }, // Yuji G1
        to: { x: 7, y: 2 },   // G2
        actionType: 'move',
        notation: 'Yuji G1 → G2 (Guard Mobilization)',
        tukunaInstruction:
          'Advance Yuji to G2.',
        tacticalBreakdown:
          'Yuji guards Mechamaru’s right flank.',
        hint: 'Move Yuji to G2.',
        vectorArrows: [
          { from: { x: 7, y: 1 }, to: { x: 7, y: 2 }, color: 'crimson', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6
          commentary: 'Black advances F7 pawn to F6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 6, y: 2 }, // Mechamaru F2
        to: { x: 6, y: 3 },   // F3
        actionType: 'move',
        notation: 'Mechamaru F2 → F3 (Forward Battery Step)',
        tukunaInstruction:
          'Step Mechamaru forward to F3.',
        tacticalBreakdown:
          'Mechamaru on F3 sets up a 2-square gap firing line across F4 to hit F5!',
        hint: 'Move Mechamaru to F3.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 6, y: 3 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 6 }, // Black Pawn F6
          to: { x: 6, y: 5 },   // F5
          commentary: 'Black advances F6 pawn to F5!',
        },
      },
      {
        stepNumber: 7,
        from: { x: 4, y: 2 }, // Pawn D2
        to: { x: 4, y: 3 },   // D3
        actionType: 'move',
        notation: 'D2 → D3 (Wall Consolidation)',
        tukunaInstruction:
          'Push D2 pawn to D3.',
        tacticalBreakdown:
          'Anchoring D3 secures the central line.',
        hint: 'Push D2 pawn to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'crimson', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 8 }, // Uraume C8
          to: { x: 3, y: 7 },   // C7
          commentary: 'Uraume advances to C7.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 6, y: 3 }, // Mechamaru F3
        to: { x: 6, y: 5 },   // Fire Ranged Strike at F5 enemy pawn! (F4 is empty!)
        actionType: 'shoot',
        notation: 'Mechamaru 🏹 F5 (Master Battery Snipe Barrage!)',
        tukunaInstruction:
          'Execute Mechamaru’s 2nd Ranged Strike to eliminate the F5 enemy pawn!',
        tacticalBreakdown:
          'Mechamaru snipes the enemy pawn on F5 across empty F4, dominating the F-column with zero risk!',
        hint: 'Fire Ranged Strike on F5 enemy pawn with Mechamaru.',
        vectorArrows: [
          { from: { x: 6, y: 3 }, to: { x: 6, y: 5 }, color: 'crimson', label: '8 🏹', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_mid_3',
    title: 'Lesson 11: Ratio Field Lockdown (Nanami & Reggie Control)',
    subtitle: 'Deploy Nanami’s Ratio Field to neutralize fast Rusher units',
    namedStrategy: 'Ratio Suppression Web',
    curriculumType: 'midgame',
    tier: 'intermediate',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Fast Rusher pieces like Hakari and Kurourushi rely on multi-square leaps. Warden Nanami’s Ratio Field reduces their movement to 1 square, completely neutralizing their speed.',
    completionMessage:
      'Rusher neutralized! Nanami’s Ratio Field locked down enemy high-speed threats.',
    patternHighlights: [
      { x: 4, y: 1 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 3, y: 5 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 4, y: 2 }, // D2 Pawn
        to: { x: 4, y: 3 },   // D3
        actionType: 'move',
        notation: 'D2 → D3 (Clear D-file)',
        tukunaInstruction:
          'Push D2 pawn to D3 to clear Nanami’s path.',
        tacticalBreakdown:
          'Opening the D-file allows Nanami to project his Ratio Field into the center.',
        hint: 'Push D2 pawn to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'crimson', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6
          commentary: 'Black advances F7 pawn to F6 to clear diagonal for Kurourushi!',
        },
      },
      {
        stepNumber: 2,
        from: { x: 4, y: 1 }, // Nanami D1
        to: { x: 4, y: 2 },   // D2
        actionType: 'move',
        notation: 'Nanami D1 → D2 (Warden Entry)',
        tukunaInstruction:
          'Step Nanami forward to D2.',
        tacticalBreakdown:
          'Nanami on D2 establishes his initial 8-square Ratio Field.',
        hint: 'Move Nanami to D2.',
        vectorArrows: [
          { from: { x: 4, y: 1 }, to: { x: 4, y: 2 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 7, y: 8 }, // Kurourushi G8
          to: { x: 5, y: 6 },   // E6 (Diagonal slide 2 squares)
          commentary: 'Kurourushi slides 2 squares diagonally to E6!',
        },
      },
      {
        stepNumber: 3,
        from: { x: 4, y: 3 }, // D3 Pawn
        to: { x: 4, y: 4 },   // D4
        actionType: 'move',
        notation: 'D3 → D4 (Central Runway Push)',
        tukunaInstruction:
          'Push D3 pawn to D4 to clear the D3 square for Warden Nanami.',
        tacticalBreakdown:
          'Clearing D3 allows Nanami to slide up the open D-column.',
        hint: 'Push D3 pawn to D4.',
        vectorArrows: [
          { from: { x: 4, y: 3 }, to: { x: 4, y: 4 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 6 }, // Kurourushi E6
          to: { x: 5, y: 5 },   // E5
          commentary: 'Kurourushi steps to E5.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 4, y: 2 }, // Nanami D2
        to: { x: 4, y: 3 },   // D3
        actionType: 'move',
        notation: 'Nanami D2 → D3 (Warden Advance)',
        tukunaInstruction:
          'Step Nanami forward to D3.',
        tacticalBreakdown:
          'Nanami on D3 projects his 8-square Ratio Field towards E5.',
        hint: 'Move Nanami to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black pushes C7 pawn to C6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 4, y: 3 }, // Nanami D3
        to: { x: 4, y: 5 },   // D5 (Slide 2 squares to D5!)
        actionType: 'move',
        notation: 'Nanami D3 → D5 (Ratio Clamping)',
        tukunaInstruction:
          'Slide Nanami 2 squares to D5 directly adjacent to Kurourushi on E5!',
        tacticalBreakdown:
          'Nanami on D5 restricts Kurourushi on E5 to 1-step maximum movement under Ratio Field suppression.',
        hint: 'Slide Nanami to D5.',
        vectorArrows: [
          { from: { x: 4, y: 3 }, to: { x: 4, y: 5 }, color: 'crimson', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Black advances B7 pawn to B6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 3, y: 2 }, // Pawn C2
        to: { x: 3, y: 3 },   // C3
        actionType: 'move',
        notation: 'C2 → C3 (Flank Base)',
        tukunaInstruction:
          'Push C2 pawn to C3.',
        tacticalBreakdown:
          'C3 secures C4 and anchors Nanami’s left flank.',
        hint: 'Push C2 pawn to C3.',
        vectorArrows: [
          { from: { x: 3, y: 2 }, to: { x: 3, y: 3 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 }, // Kenjaku B8
          to: { x: 2, y: 7 },   // B7
          commentary: 'Kenjaku steps onto B7.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 5, y: 2 }, // Pawn E2
        to: { x: 5, y: 3 },   // E3
        actionType: 'move',
        notation: 'E2 → E3 (Anchor Wall)',
        tukunaInstruction:
          'Push E2 pawn to E3.',
        tacticalBreakdown:
          'Anchoring E3 completes the central pawn wall behind Nanami.',
        hint: 'Push E2 pawn to E3.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 3 }, color: 'crimson', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 8 }, // Uraume C8
          to: { x: 3, y: 7 },   // C7
          commentary: 'Uraume steps to C7.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 4, y: 5 }, // Nanami D5
        to: { x: 5, y: 5 },   // E5 (Capture Kurourushi!)
        actionType: 'move',
        notation: 'Nanami D5 × E5 (Ratio Suppression Execution!)',
        tukunaInstruction:
          'Capture Kurourushi on E5 with Nanami!',
        tacticalBreakdown:
          'Nanami executes Kurourushi on E5 with 7:3 Ratio precision, eliminating Black’s fast Rusher threat!',
        hint: 'Capture Kurourushi on E5 with Nanami.',
        vectorArrows: [
          { from: { x: 4, y: 5 }, to: { x: 5, y: 5 }, color: 'crimson', label: '8 ⚔️', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_mid_4',
    title: 'Lesson 12: Bulwark Shell Absorption & Counter-Attack',
    subtitle: 'Tank an enemy strike with Panda’s Bulwark Shell and execute an immediate counter-attack',
    namedStrategy: 'Bulwark Shell Counter',
    curriculumType: 'midgame',
    tier: 'advanced',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Panda’s Bulwark Shell absorbs the first capture attempt completely. Use Panda as bait to lure enemy heavy hitters, then counter-strike!',
    completionMessage:
      'Bulwark tanking successful! Panda absorbed the strike and cleared the attacker.',
    patternHighlights: [
      { x: 5, y: 1 }, { x: 6, y: 3 }, { x: 5, y: 5 }, { x: 6, y: 6 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 5, y: 1 }, // Panda E1
        to: { x: 6, y: 3 },   // F3 (Knight L-jump)
        actionType: 'move',
        notation: 'Panda E1 → F3 (Bulwark Baiting)',
        tukunaInstruction:
          'Jump Panda from E1 to F3.',
        tacticalBreakdown:
          'Panda on F3 offers his intact Bulwark Shell as bait to entice Black’s forward units.',
        hint: 'Jump Panda to F3.',
        vectorArrows: [
          { from: { x: 5, y: 1 }, to: { x: 6, y: 3 }, color: 'crimson', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6
          commentary: 'Black advances F7 pawn to F6 to challenge Panda.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 4, y: 2 }, // Pawn D2
        to: { x: 4, y: 3 },   // D3
        actionType: 'move',
        notation: 'D2 → D3 (Fortress Reinforcement)',
        tukunaInstruction:
          'Push D2 pawn to D3.',
        tacticalBreakdown:
          'Securing D3 provides a solid base supporting Panda.',
        hint: 'Push D2 pawn to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 6 }, // Black Pawn F6
          to: { x: 6, y: 5 },   // F5
          commentary: 'Black advances F6 pawn to F5!',
        },
      },
      {
        stepNumber: 3,
        from: { x: 6, y: 3 }, // Panda F3
        to: { x: 5, y: 5 },   // E5 (Jump in front of F5 pawn)
        actionType: 'move',
        notation: 'Panda F3 → E5 (Bulwark Blockade)',
        tukunaInstruction:
          'Jump Panda to E5 directly in front of the advanced enemy pawn.',
        tacticalBreakdown:
          'Panda on E5 forces Black to attack his intact Bulwark Shell.',
        hint: 'Jump Panda to E5.',
        vectorArrows: [
          { from: { x: 6, y: 3 }, to: { x: 5, y: 5 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 8 }, // Naoya F8
          to: { x: 6, y: 6 },   // F6 (Skirmisher leap)
          commentary: 'Naoya leaps to F6 threatening Panda!',
        },
      },
      {
        stepNumber: 4,
        from: { x: 5, y: 2 }, // Pawn E2
        to: { x: 5, y: 3 },   // E3
        actionType: 'move',
        notation: 'E2 → E3 (Base Support)',
        tukunaInstruction:
          'Push E2 pawn to E3.',
        tacticalBreakdown:
          'E3 anchors the central pawn wedge behind Panda.',
        hint: 'Push E2 pawn to E3.',
        vectorArrows: [
          { from: { x: 5, y: 2 }, to: { x: 5, y: 3 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 6 }, // Naoya F6
          to: { x: 5, y: 5 },   // Attack Panda on E5! (Shell absorbs capture!)
          commentary: 'Naoya strikes Panda on E5! Panda’s Bulwark Shell completely absorbs the strike!',
        },
      },
      {
        stepNumber: 5,
        from: { x: 5, y: 5 }, // Panda on E5 (Gorilla core)
        to: { x: 6, y: 7 },   // F7 (Knight L-jump: 5+1=6, 5+2=7)
        actionType: 'move',
        notation: 'Panda E5 → F7 (Gorilla Counter-Jump)',
        tukunaInstruction:
          'With his Gorilla Core revealed, jump Panda to F7 behind enemy lines!',
        tacticalBreakdown:
          'Panda’s Gorilla form retains full mobility, penetrating deep into Black’s home rank.',
        hint: 'Jump Panda to F7.',
        vectorArrows: [
          { from: { x: 5, y: 5 }, to: { x: 6, y: 7 }, color: 'crimson', label: '5 🦍', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Black advances E7 pawn to E6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 6, y: 2 }, // Pawn F2
        to: { x: 6, y: 3 },   // F3
        actionType: 'move',
        notation: 'F2 → F3 (Clear Yuji Runway)',
        tukunaInstruction:
          'Push F2 pawn to F3 to clear the F2 square for Yuji.',
        tacticalBreakdown:
          'Clearing F2 allows Vanguard Yuji to step into the F-column.',
        hint: 'Push F2 pawn to F3.',
        vectorArrows: [
          { from: { x: 6, y: 2 }, to: { x: 6, y: 3 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black advances C7 pawn to C6.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 4, y: 3 }, // Pawn D3
        to: { x: 4, y: 4 },   // D4
        actionType: 'move',
        notation: 'D3 → D4 (Ratio Runway Push)',
        tukunaInstruction:
          'Push D3 pawn to D4 to clear the D3 square for Warden Nanami.',
        tacticalBreakdown:
          'Clearing D3 allows Nanami to project his Ratio Field into the central cross.',
        hint: 'Push D3 pawn to D4.',
        vectorArrows: [
          { from: { x: 4, y: 3 }, to: { x: 4, y: 4 }, color: 'crimson', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Black advances E7 pawn to E6.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 4, y: 1 }, // Nanami D1
        to: { x: 4, y: 3 },   // D3
        actionType: 'move',
        notation: 'Nanami D1 → D3 (Ratio Field Clamp)',
        tukunaInstruction:
          'Slide Nanami to D3 onto the cleared central square!',
        tacticalBreakdown:
          'Nanami on D3 locks Naoya in his 8-square Ratio Field alongside Panda and Yuji. Counter-attack complete!',
        hint: 'Move Nanami to D3.',
        vectorArrows: [
          { from: { x: 4, y: 1 }, to: { x: 4, y: 3 }, color: 'crimson', label: '8 ⚔️', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_mid_5',
    title: 'Lesson 13: Rusher Jackpot Multi-Step Combo',
    subtitle: 'Capture a pawn with Hakari to trigger Jackpot and fork enemy high-value pieces',
    namedStrategy: 'Jackpot Multi-Fork Combo',
    curriculumType: 'midgame',
    tier: 'advanced',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Hakari’s Jackpot turns single captures into game-changing multi-step tactical combinations. Master the capture-fork sequence!',
    completionMessage:
      'Jackpot fork executed! Hakari trapped Black’s high-value pieces in a single move turn.',
    patternHighlights: [
      { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 }, { x: 7, y: 7 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 2, y: 2 }, // B2 Pawn
        to: { x: 2, y: 3 },   // B3
        actionType: 'move',
        notation: 'B2 → B3 (Runway Open)',
        tukunaInstruction:
          'Push B2 pawn to B3.',
        tacticalBreakdown:
          'Clearing B2 opens Hakari’s diagonal surge vector.',
        hint: 'Push B2 pawn to B3.',
        vectorArrows: [
          { from: { x: 2, y: 2 }, to: { x: 2, y: 3 }, color: 'crimson', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6
          commentary: 'Black advances F7 pawn to F6.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 2, y: 1 }, // Hakari B1
        to: { x: 2, y: 2 },   // B2
        actionType: 'move',
        notation: 'Hakari B1 → B2 (Mobilization)',
        tukunaInstruction:
          'Advance Hakari to B2.',
        tacticalBreakdown:
          'Hakari on B2 prepares his diagonal thrust.',
        hint: 'Move Hakari to B2.',
        vectorArrows: [
          { from: { x: 2, y: 1 }, to: { x: 2, y: 2 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 }, // Black Pawn D7
          to: { x: 4, y: 6 },   // D6
          commentary: 'Black advances D7 pawn to D6.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 2, y: 2 }, // Hakari B2
        to: { x: 4, y: 4 },   // D4 (Slide 2 diagonally!)
        actionType: 'move',
        notation: 'Hakari B2 → D4 (Diagonal Incursion)',
        tukunaInstruction:
          'Slide Hakari 2 squares diagonally to D4.',
        tacticalBreakdown:
          'Hakari on D4 threatens both E6 and C6 pawns.',
        hint: 'Slide Hakari to D4.',
        vectorArrows: [
          { from: { x: 2, y: 2 }, to: { x: 4, y: 4 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Black advances B7 pawn to B6.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 3, y: 2 }, // Pawn C2
        to: { x: 3, y: 3 },   // C3
        actionType: 'move',
        notation: 'C2 → C3 (Flank Base)',
        tukunaInstruction:
          'Push C2 pawn to C3.',
        tacticalBreakdown:
          'Securing C3 anchors Hakari’s rear.',
        hint: 'Push C2 pawn to C3.',
        vectorArrows: [
          { from: { x: 3, y: 2 }, to: { x: 3, y: 3 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black advances C7 pawn to C6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 4, y: 4 }, // Hakari D4
        to: { x: 5, y: 5 },   // E5
        actionType: 'move',
        notation: 'Hakari D4 → E5 (Target Lock)',
        tukunaInstruction:
          'Advance Hakari diagonally to E5.',
        tacticalBreakdown:
          'Hakari on E5 locks onto the F6 pawn.',
        hint: 'Move Hakari to E5.',
        vectorArrows: [
          { from: { x: 4, y: 4 }, to: { x: 5, y: 5 }, color: 'crimson', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 8 }, // Uraume C8
          to: { x: 3, y: 7 },   // C7
          commentary: 'Uraume advances to C7.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 4, y: 2 }, // Pawn D2
        to: { x: 4, y: 3 },   // D3
        actionType: 'move',
        notation: 'D2 → D3 (Pawn Wall)',
        tukunaInstruction:
          'Push D2 pawn to D3.',
        tacticalBreakdown:
          'D3 anchors E4 and completes the central pawn wedge.',
        hint: 'Push D2 pawn to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 }, // Black Pawn D7
          to: { x: 4, y: 6 },   // D6
          commentary: 'Black pushes D7 pawn to D6.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 5, y: 5 }, // Hakari E5
        to: { x: 6, y: 6 },   // Capture F6 pawn!
        actionType: 'move',
        notation: 'Hakari E5 × F6 (Jackpot Capture Combo Trigger!)',
        tukunaInstruction:
          'Capture the F6 pawn with Hakari on F6!',
        tacticalBreakdown:
          'Hakari captures F6! Jackpot triggers instantly, earning 1 extra step.',
        hint: 'Capture F6 pawn with Hakari.',
        vectorArrows: [
          { from: { x: 5, y: 5 }, to: { x: 6, y: 6 }, color: 'crimson', label: '7 🎰', style: 'solid' },
        ],
      },
      {
        stepNumber: 8,
        from: { x: 6, y: 6 }, // Hakari F6
        to: { x: 6, y: 5 },   // Jackpot safe step to empty unattacked F5 square!
        actionType: 'move',
        notation: 'Hakari F6 → F5 (Jackpot Safe Step Positioning!)',
        tukunaInstruction:
          'Execute Hakari’s Jackpot bonus step to relocate onto the empty F5 square!',
        tacticalBreakdown:
          'Hakari’s Jackpot bonus step provides a free non-capturing move to F5, forking Black’s E6 and G6 squares!',
        hint: 'Execute Jackpot safe step to F5 with Hakari.',
        vectorArrows: [
          { from: { x: 6, y: 6 }, to: { x: 6, y: 5 }, color: 'crimson', label: '8 🎰', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_mid_6',
    title: 'Lesson 14: Cross-Arena Flank Infiltration',
    subtitle: 'Infiltrate top and left colony extension arms with Skirmisher Maki',
    namedStrategy: 'Extension Flank Invasion',
    curriculumType: 'midgame',
    tier: 'advanced',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'Colony extension arms allow Skirmishers to infiltrate behind enemy lines undetected. Infiltrate the western arm to threaten Sukuna from the side!',
    completionMessage:
      'Infiltration complete! Maki commands the western colony arm, threatening Sukuna directly.',
    patternHighlights: [
      { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 5 }, { x: 1, y: 7 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 3, y: 1 }, // Maki C1
        to: { x: 3, y: 3 },   // C3 (Leap over C2)
        actionType: 'move',
        notation: 'Maki C1 → C3 (Heavenly Leap)',
        tukunaInstruction:
          'Hop Maki over the C2 pawn onto C3.',
        tacticalBreakdown:
          'Maki’s 2-square orthogonal leap bypasses the front pawn line.',
        hint: 'Hop Maki to C3.',
        vectorArrows: [
          { from: { x: 3, y: 1 }, to: { x: 3, y: 3 }, color: 'crimson', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Black advances B7 pawn to B6.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 3, y: 3 }, // Maki C3
        to: { x: 1, y: 3 },   // A3 (Leap 2 squares left into extension!)
        actionType: 'move',
        notation: 'Maki C3 → A3 (Colony Extension Entry)',
        tukunaInstruction:
          'Hop Maki 2 squares left from C3 into the Left Colony Arm at A3!',
        tacticalBreakdown:
          'Entering the A-column arm at A3 places Maki inside the western corridor beyond enemy pawn control.',
        hint: 'Hop Maki left to A3.',
        vectorArrows: [
          { from: { x: 3, y: 3 }, to: { x: 1, y: 3 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black pushes C7 pawn to C6.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 1, y: 3 }, // Maki A3
        to: { x: 1, y: 5 },   // A5 (Advance 2 squares up corridor!)
        actionType: 'move',
        notation: 'Maki A3 → A5 (Corridor Rush)',
        tukunaInstruction:
          'Advance Maki 2 squares up the A-column corridor to A5.',
        tacticalBreakdown:
          'Maki on A5 commands the entire western flank.',
        hint: 'Move Maki to A5.',
        vectorArrows: [
          { from: { x: 1, y: 3 }, to: { x: 1, y: 5 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 }, // Black Pawn D7
          to: { x: 4, y: 6 },   // D6
          commentary: 'Black advances D7 pawn to D6.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 2, y: 2 }, // Pawn B2
        to: { x: 2, y: 3 },   // B3
        actionType: 'move',
        notation: 'B2 → B3 (Flank Base)',
        tukunaInstruction:
          'Push B2 pawn to B3.',
        tacticalBreakdown:
          'B3 secures Maki’s line of communication.',
        hint: 'Push B2 pawn to B3.',
        vectorArrows: [
          { from: { x: 2, y: 2 }, to: { x: 2, y: 3 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Black advances E7 pawn to E6.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 1, y: 5 }, // Maki A5
        to: { x: 1, y: 6 },   // A6 (Advance 1 square to A6!)
        actionType: 'move',
        notation: 'Maki A5 → A6 (Flank Infiltration)',
        tukunaInstruction:
          'Advance Maki forward to A6 along the western colony corridor.',
        tacticalBreakdown:
          'Maki on A6 prepares a direct strike on Black’s back rank.',
        hint: 'Move Maki to A6.',
        vectorArrows: [
          { from: { x: 1, y: 5 }, to: { x: 1, y: 6 }, color: 'crimson', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black advances C7 pawn to C6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 3, y: 2 }, // Pawn C2
        to: { x: 3, y: 3 },   // C3
        actionType: 'move',
        notation: 'C2 → C3 (Rear Security)',
        tukunaInstruction:
          'Push C2 pawn to C3.',
        tacticalBreakdown:
          'Securing C3 anchors the western sector.',
        hint: 'Push C2 pawn to C3.',
        vectorArrows: [
          { from: { x: 3, y: 2 }, to: { x: 3, y: 3 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6
          commentary: 'Black pushes F7 pawn to F6.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 2, y: 1 }, // Hakari B1
        to: { x: 1, y: 3 },   // A3 (Follow Maki into extension!)
        actionType: 'move',
        notation: 'Hakari B1 → A3 (Dual Corridor Entry)',
        tukunaInstruction:
          'Move Hakari to A3 to support Maki.',
        tacticalBreakdown:
          'Hakari on A3 secures the corridor behind Maki.',
        hint: 'Move Hakari to A3.',
        vectorArrows: [
          { from: { x: 2, y: 1 }, to: { x: 1, y: 3 }, color: 'crimson', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 8 }, // Uraume C8
          to: { x: 3, y: 7 },   // C7
          commentary: 'Uraume steps to C7.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 1, y: 7 }, // Maki A7
        to: { x: 2, y: 7 },   // Capture Kenjaku on B7!
        actionType: 'move',
        notation: 'Maki A7 × B7 (Skirmisher Infiltration Strike - Check!)',
        tukunaInstruction:
          'Strike inward with Maki from A7 to capture Kenjaku on B7!',
        tacticalBreakdown:
          'Maki captures Kenjaku on B7, delivering direct mortal check on Sovereign Sukuna at A8!',
        hint: 'Capture Kenjaku on B7 with Maki.',
        vectorArrows: [
          { from: { x: 1, y: 7 }, to: { x: 2, y: 7 }, color: 'crimson', label: '8 ⚔️', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_mid_7',
    title: 'Lesson 15: Triple-Role Combination Strike',
    subtitle: 'Combine Skirmisher, Warden, and Vanguard for a tactical combination gain',
    namedStrategy: 'Triple-Role Synergy Combo',
    curriculumType: 'midgame',
    tier: 'advanced',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'The highest level of Culling strategy coordinates three roles simultaneously: Warden Ratio suppression, Skirmisher leap, and Vanguard line-of-sight.',
    completionMessage:
      'Combination strike successful! Triple-role synergy forced a decisive piece gain.',
    patternHighlights: [
      { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 7, y: 1 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 7, y: 4 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 3, y: 1 }, // Maki C1
        to: { x: 3, y: 3 },   // C3 (Leap over C2)
        actionType: 'move',
        notation: 'Maki C1 → C3 (Role 1: Skirmisher Leap)',
        tukunaInstruction:
          'Hop Maki over C2 pawn to C3.',
        tacticalBreakdown:
          'Skirmisher Maki seizes C3 to exert pressure on Black’s right flank.',
        hint: 'Hop Maki to C3.',
        vectorArrows: [
          { from: { x: 3, y: 1 }, to: { x: 3, y: 3 }, color: 'crimson', label: '1', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Black advances B7 pawn to B6.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 4, y: 2 }, // Pawn D2
        to: { x: 4, y: 3 },   // D3
        actionType: 'move',
        notation: 'D2 → D3 (Role 2 Prep)',
        tukunaInstruction:
          'Push D2 pawn to D3.',
        tacticalBreakdown:
          'Clearing D2 prepares Warden Nanami’s entry.',
        hint: 'Push D2 pawn to D3.',
        vectorArrows: [
          { from: { x: 4, y: 2 }, to: { x: 4, y: 3 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black pushes C7 pawn to C6.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 4, y: 3 }, // D3 Pawn
        to: { x: 4, y: 4 },   // D4
        actionType: 'move',
        notation: 'D3 → D4 (Role 2 Runway Push)',
        tukunaInstruction:
          'Push D3 pawn to D4 to clear D3 for Warden Nanami.',
        tacticalBreakdown:
          'Clearing D3 allows Warden Nanami to step into the central field.',
        hint: 'Push D3 pawn to D4.',
        vectorArrows: [
          { from: { x: 4, y: 3 }, to: { x: 4, y: 4 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 }, // Black Pawn D7
          to: { x: 4, y: 6 },   // D6
          commentary: 'Black pushes D7 pawn to D6.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 4, y: 1 }, // Nanami D1
        to: { x: 4, y: 3 },   // D3 (Slide 2 squares up open D-column!)
        actionType: 'move',
        notation: 'Nanami D1 → D3 (Role 2: Warden Ratio Field)',
        tukunaInstruction:
          'Slide Warden Nanami 2 squares to D3.',
        tacticalBreakdown:
          'Nanami on D3 projects his Ratio Field onto C6 and D6.',
        hint: 'Slide Nanami to D3.',
        vectorArrows: [
          { from: { x: 4, y: 1 }, to: { x: 4, y: 3 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 }, // Kenjaku B8
          to: { x: 2, y: 7 },   // B7
          commentary: 'Kenjaku steps onto B7.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 7, y: 2 }, // Pawn G2
        to: { x: 7, y: 3 },   // G3
        actionType: 'move',
        notation: 'G2 → G3 (Role 3 Runway Push)',
        tukunaInstruction:
          'Push G2 pawn to G3 to open the G-column for Vanguard Yuji.',
        tacticalBreakdown:
          'Clearing G2 mobilizes Vanguard Yuji to support the triple-role synergy.',
        hint: 'Push G2 pawn to G3.',
        vectorArrows: [
          { from: { x: 7, y: 2 }, to: { x: 7, y: 3 }, color: 'crimson', label: '5', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Black pushes E7 pawn to E6.',
        },
      },
      {
        stepNumber: 6,
        from: { x: 3, y: 3 }, // Maki C3
        to: { x: 3, y: 5 },   // C5 (Orthogonal hop 2 squares up C-column!)
        actionType: 'move',
        notation: 'Maki C3 → C5 (Skirmisher Infiltration Hop)',
        tukunaInstruction:
          'Hop Maki 2 squares up the C-column to C5.',
        tacticalBreakdown:
          'Maki’s 2-square leap brings her into the 5th rank right beside Nanami’s Ratio Field.',
        hint: 'Hop Maki to C5.',
        vectorArrows: [
          { from: { x: 3, y: 3 }, to: { x: 3, y: 5 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 6, y: 7 }, // Black Pawn F7
          to: { x: 6, y: 6 },   // F6
          commentary: 'Black advances F7 pawn to F6.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 3, y: 5 }, // Maki C5
        to: { x: 3, y: 7 },   // C7 (Orthogonal hop 2 squares up C-column!)
        actionType: 'move',
        notation: 'Maki C5 → C7 (Flank Encirclement Leap)',
        tukunaInstruction:
          'Hop Maki 2 squares up to C7 on Black’s 7th rank!',
        tacticalBreakdown:
          'Maki on C7 penetrates deep into Black’s perimeter, positioning directly beside Kenjaku on B7.',
        hint: 'Hop Maki to C7.',
        vectorArrows: [
          { from: { x: 3, y: 5 }, to: { x: 3, y: 7 }, color: 'crimson', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 8 }, // Uraume C8
          to: { x: 4, y: 7 },   // D7
          commentary: 'Uraume slides to D7.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 3, y: 7 }, // Maki C7
        to: { x: 2, y: 7 },   // Capture Kenjaku on B7!
        actionType: 'move',
        notation: 'Maki C7 × B7 (Triple-Role Combination Strike!)',
        tukunaInstruction:
          'Execute the combination strike with Maki capturing Kenjaku on B7!',
        tacticalBreakdown:
          'Maki captures Kenjaku on B7! The triple-role combination forces a decisive material advantage!',
        hint: 'Capture Kenjaku on B7 with Maki.',
        vectorArrows: [
          { from: { x: 3, y: 7 }, to: { x: 2, y: 7 }, color: 'crimson', label: '8 ⚔️', style: 'solid' },
        ],
      },
    ],
  },

  {
    id: 'culling_mid_8',
    title: 'Lesson 16: Sovereign Checkmate Execution',
    subtitle: 'Close the ring on Sovereign Sukuna and deliver final checkmate',
    namedStrategy: 'Sovereign Ring Checkmate',
    curriculumType: 'midgame',
    tier: 'advanced',
    playerColor: 'white',
    initialBoard: createInitialCullingBoard(),
    tukunaGreeting:
      'The culmination of all Culling Game mastery is checkmating Sovereign Sukuna. Systematically constrict his 8 escape squares and deliver checkmate.',
    completionMessage:
      'CHECKMATE! Sovereign Sukuna has been completely enclosed and defeated. Culling Game Dojo Mastered!',
    patternHighlights: [
      { x: 8, y: 1 }, { x: 6, y: 3 }, { x: 4, y: 5 }, { x: 3, y: 6 }, { x: 2, y: 7 }, { x: 1, y: 8 },
    ],
    steps: [
      {
        stepNumber: 1,
        from: { x: 8, y: 1 }, // Gojo H1
        to: { x: 6, y: 3 },   // F3 (Domain Step 2-square diagonal jump!)
        actionType: 'teleport',
        notation: 'Gojo 🌀 F3 (Domain Step Opening)',
        tukunaInstruction:
          'Activate Gojo’s Domain Step to jump to F3.',
        tacticalBreakdown:
          'Gojo leaps forward to initiate the Sovereign hunt.',
        hint: 'Teleport Gojo to F3.',
        vectorArrows: [
          { from: { x: 8, y: 1 }, to: { x: 6, y: 3 }, color: 'crimson', label: '1 🌀', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 7 }, // Black Pawn B7
          to: { x: 2, y: 6 },   // B6
          commentary: 'Black advances B7 pawn to B6.',
        },
      },
      {
        stepNumber: 2,
        from: { x: 6, y: 3 }, // Gojo F3
        to: { x: 5, y: 4 },   // E4
        actionType: 'move',
        notation: 'Gojo F3 → E4 (Sovereign Incursion)',
        tukunaInstruction:
          'Advance Gojo diagonally to E4.',
        tacticalBreakdown:
          'Gojo on E4 commands the main diagonal towards Sukuna on A8.',
        hint: 'Move Gojo to E4.',
        vectorArrows: [
          { from: { x: 6, y: 3 }, to: { x: 5, y: 4 }, color: 'crimson', label: '2', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 4, y: 7 }, // Black Pawn D7
          to: { x: 4, y: 6 },   // D6
          commentary: 'Black advances D7 pawn to D6.',
        },
      },
      {
        stepNumber: 3,
        from: { x: 5, y: 4 }, // Gojo E4
        to: { x: 4, y: 5 },   // D5
        actionType: 'move',
        notation: 'Gojo E4 → D5 (Ring Constriction)',
        tukunaInstruction:
          'Advance Gojo diagonally to D5.',
        tacticalBreakdown:
          'Gojo on D5 cuts off Sukuna’s central escape diagonals.',
        hint: 'Move Gojo to D5.',
        vectorArrows: [
          { from: { x: 5, y: 4 }, to: { x: 4, y: 5 }, color: 'crimson', label: '3', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 7 }, // Black Pawn C7
          to: { x: 3, y: 6 },   // C6
          commentary: 'Black advances C7 pawn to C6.',
        },
      },
      {
        stepNumber: 4,
        from: { x: 4, y: 5 }, // Gojo D5
        to: { x: 3, y: 6 },   // C6 (Capture C6 pawn!)
        actionType: 'move',
        notation: 'Gojo D5 × C6 (Ring Breakthrough)',
        tukunaInstruction:
          'Capture Black’s C6 pawn with Gojo on C6.',
        tacticalBreakdown:
          'Gojo breaks through C6, threatening Kenjaku on B7.',
        hint: 'Capture C6 pawn with Gojo.',
        vectorArrows: [
          { from: { x: 4, y: 5 }, to: { x: 3, y: 6 }, color: 'crimson', label: '4', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 2, y: 8 }, // Kenjaku B8
          to: { x: 2, y: 7 },   // B7
          commentary: 'Kenjaku desperately steps to B7 to shield Sukuna.',
        },
      },
      {
        stepNumber: 5,
        from: { x: 3, y: 6 }, // Gojo C6
        to: { x: 2, y: 7 },   // Capture Kenjaku on B7!
        actionType: 'move',
        notation: 'Gojo C6 × B7 (Guard Elimination - Check!)',
        tukunaInstruction:
          'Capture Kenjaku on B7 with Gojo!',
        tacticalBreakdown:
          'Gojo eliminates Sukuna’s last defender on B7, delivering direct check!',
        hint: 'Capture Kenjaku on B7 with Gojo.',
        vectorArrows: [
          { from: { x: 3, y: 6 }, to: { x: 2, y: 7 }, color: 'crimson', label: '5 ⚔️', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 1, y: 8 }, // Sovereign Sukuna at A8
          to: { x: 2, y: 8 },   // B8 (Sukuna escapes check to B8!)
          commentary: 'Sukuna escapes to B8 under heavy pressure!',
        },
      },
      {
        stepNumber: 6,
        from: { x: 3, y: 1 }, // Maki C1
        to: { x: 3, y: 3 },   // C3 (Leap over C2)
        actionType: 'move',
        notation: 'Maki C1 → C3 (Flank Reinforcement)',
        tukunaInstruction:
          'Hop Maki to C3 to join the checkmate net.',
        tacticalBreakdown:
          'Maki seizes C3 to cover the escape squares on the B-column.',
        hint: 'Hop Maki to C3.',
        vectorArrows: [
          { from: { x: 3, y: 1 }, to: { x: 3, y: 3 }, color: 'crimson', label: '6', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 3, y: 8 }, // Uraume C8
          to: { x: 3, y: 7 },   // C7
          commentary: 'Uraume advances to C7.',
        },
      },
      {
        stepNumber: 7,
        from: { x: 3, y: 3 }, // Maki C3
        to: { x: 1, y: 3 },   // A3 (Leap left into A-column)
        actionType: 'move',
        notation: 'Maki C3 → A3 (Cutoff Leap)',
        tukunaInstruction:
          'Hop Maki 2 squares left to A3 to seal the western corridor.',
        tacticalBreakdown:
          'Maki on A3 cuts off Sukuna’s escape down the A-column.',
        hint: 'Hop Maki to A3.',
        vectorArrows: [
          { from: { x: 3, y: 3 }, to: { x: 1, y: 3 }, color: 'crimson', label: '7', style: 'solid' },
        ],
        opponentResponse: {
          from: { x: 5, y: 7 }, // Black Pawn E7
          to: { x: 5, y: 6 },   // E6
          commentary: 'Black advances E7 pawn to E6.',
        },
      },
      {
        stepNumber: 8,
        from: { x: 2, y: 7 }, // Gojo at B7
        to: { x: 2, y: 8 },   // Capture Sukuna on B8! CHECKMATE!
        actionType: 'move',
        notation: 'Gojo B7 × B8 (Hollow Purple - SOVEREIGN CHECKMATE!)',
        tukunaInstruction:
          'Deliver the final blow with Gojo from B7 to capture Sukuna on B8!',
        tacticalBreakdown:
          'Gojo captures Sukuna on B8! Sovereign Checkmate! You have mastered the Culling Game Dojo!',
        hint: 'Capture Sukuna on B8 with Gojo for Checkmate.',
        vectorArrows: [
          { from: { x: 2, y: 7 }, to: { x: 2, y: 8 }, color: 'crimson', label: '8 🏆', style: 'solid' },
        ],
      },
    ],
  },
];
