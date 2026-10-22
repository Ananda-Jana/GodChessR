import React, { useState, useMemo, memo } from 'react';
import {
  CullingPieceType,
  CullingPieceColor,
  CullingMatchState,
  CullingPiece,
  CullingPos,
  CullingMove,
  CULLING_ROSTER,
  posToCullingSquare,
} from '../types/cullingGame';
import {
  createInitialCullingMatch,
  createEmptyCullingBoard,
  getPseudoLegalMovesForSquare,
} from '../game/cullingEngine';
import { CullingPiece as CullingPieceComponent } from './CullingPiece';
import { useTheme } from '../context/ThemeContext';
import {
  ArrowLeft,
  BookOpen,
  Swords,
  Shield,
  Zap,
  Target,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

interface CullingTheoryViewProps {
  onBack: () => void;
}

// Visual Legend Tokens for Mini-Board Diagram
type CellVisualType = 'center' | 'move' | 'capture' | 'special' | 'blocked' | 'ally' | 'empty';

interface CellVisualInfo {
  type: CellVisualType;
  label?: string;
  pieceType?: CullingPieceType;
  pieceColor?: CullingPieceColor;
}

/**
 * Precomputes engine-authoritative move patterns on a 9x9 centered grid (dx: -4..4, dy: -4..4).
 * Center piece is placed at (4, 4).
 */
function getEnginePiecePattern(
  pieceType: CullingPieceType,
  color: CullingPieceColor,
  scenario: 'standard' | 'combat' = 'standard'
): Map<string, CellVisualInfo> {
  const cellMap = new Map<string, CellVisualInfo>();
  const match = createInitialCullingMatch('theory_preview', {
    userId: 'w',
    username: 'White',
    displayName: 'White',
  }, {
    userId: 'b',
    username: 'Black',
    displayName: 'Black',
  });

  const board = createEmptyCullingBoard();
  const centerPos: CullingPos = { x: 4, y: 4 };

  const centerPiece: CullingPiece = {
    id: 'center_preview',
    type: pieceType,
    color,
    hasMoved: true, // test normal move capabilities
    pandaCore: pieceType === 'culling_panda' ? 'panda' : undefined,
  };
  board[centerPos.y][centerPos.x] = centerPiece;

  const oppColor: CullingPieceColor = color === 'white' ? 'black' : 'white';

  if (scenario === 'combat') {
    // Add selective ally and enemy blockers to reveal ray blocking and leaping mechanics
    board[5][4] = { id: 'ally_step', type: 'culling_pawn', color, hasMoved: false };
    board[3][4] = { id: 'enemy_step', type: 'culling_pawn', color: oppColor, hasMoved: false };
    board[4][6] = { id: 'enemy_ortho', type: 'culling_pawn', color: oppColor, hasMoved: false };
    board[6][6] = { id: 'enemy_diag', type: 'culling_pawn', color: oppColor, hasMoved: false };
  }

  match.board = board;
  match.turn = color;
  match.turnCount = 6; // turn 6 to allow full capture engine mechanics

  const moves: CullingMove[] = getPseudoLegalMovesForSquare(match, centerPos);

  cellMap.set('0,0', { type: 'center', pieceType, pieceColor: color });

  for (const m of moves) {
    const dx = m.to.x - 4;
    const dy = m.to.y - 4;
    if (dx >= -4 && dx <= 4 && dy >= -4 && dy <= 4) {
      const key = `${dx},${dy}`;
      if (m.captured) {
        cellMap.set(key, { type: 'capture', label: 'Cap' });
      } else if (
        m.actionType === 'teleport' ||
        m.actionType === 'pierce_shoot' ||
        m.actionType === 'construct_strike' ||
        m.actionType === 'frost_freeze' ||
        m.actionType === 'contract_shield'
      ) {
        cellMap.set(key, { type: 'special', label: 'Tech' });
      } else {
        cellMap.set(key, { type: 'move' });
      }
    }
  }

  if (scenario === 'combat') {
    // Show ally on board
    cellMap.set('0,1', { type: 'ally', label: 'Ally', pieceType: 'culling_pawn', pieceColor: color });
  }

  return cellMap;
}

/**
 * Memoized 9x9 Movement Mini-Board Grid Component
 */
const MiniBoardDiagram: React.FC<{
  pattern: Map<string, CellVisualInfo>;
  pieceType: CullingPieceType;
  color: CullingPieceColor;
  title: string;
}> = memo(({ pattern, pieceType, color, title }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            color === 'white' ? 'bg-white border border-black' : 'bg-black border border-white'
          }`}
        />
        <span>{title}</span>
      </div>

      <div className="grid grid-cols-9 grid-rows-9 w-44 h-44 sm:w-52 sm:h-52 border-2 border-black dark:border-white p-0.5 bg-neutral-900 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff]">
        {Array.from({ length: 9 }).map((_, r) => {
          const dy = 4 - r; // row index to dy: r=0 -> dy=+4, r=8 -> dy=-4
          return Array.from({ length: 9 }).map((__, c) => {
            const dx = c - 4; // col index to dx: c=0 -> dx=-4, c=8 -> dx=+4
            const key = `${dx},${dy}`;
            const info = pattern.get(key);
            const isCenter = dx === 0 && dy === 0;
            const isLightCell = (c + r) % 2 === 0;

            let bgClass = isLightCell ? 'bg-neutral-800' : 'bg-neutral-950';
            let borderClass = 'border-black/20 dark:border-white/10';

            if (info) {
              if (info.type === 'move') {
                bgClass = 'bg-amber-400/90 text-black font-black';
                borderClass = 'border-amber-500';
              } else if (info.type === 'capture') {
                bgClass = 'bg-red-600 text-white font-black';
                borderClass = 'border-red-400';
              } else if (info.type === 'special') {
                bgClass = 'bg-sky-500 text-white font-black animate-pulse';
                borderClass = 'border-sky-300';
              } else if (info.type === 'ally') {
                bgClass = 'bg-emerald-600 text-white font-bold';
              }
            }

            return (
              <div
                key={key}
                className={`relative flex items-center justify-center border ${borderClass} ${bgClass} transition-colors`}
                title={`Offset: (${dx > 0 ? `+${dx}` : dx}, ${dy > 0 ? `+${dy}` : dy})`}
              >
                {isCenter && (
                  <div className="w-full h-full p-0.5 z-10 flex items-center justify-center">
                    <CullingPieceComponent type={pieceType} color={color} />
                  </div>
                )}
                {info && info.type === 'move' && (
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-black rounded-full" />
                )}
                {info && info.type === 'capture' && (
                  <div className="text-[8px] font-black leading-none uppercase">✕</div>
                )}
                {info && info.type === 'special' && (
                  <div className="text-[7px] font-black leading-none uppercase">✦</div>
                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
});

interface PieceArticle {
  id: CullingPieceType;
  counterpartId?: CullingPieceType;
  name: string;
  counterpartName?: string;
  role: string;
  materialValue: number;
  whiteColor: CullingPieceColor;
  blackColor: CullingPieceColor;
  movementSummary: string;
  passiveAbility?: string;
  activeAbility?: string;
  strengths: string[];
  weaknesses: string[];
  commonMistakes: string[];
  tactics: string[];
  specialScenario?: {
    title: string;
    description: string;
    tip: string;
    limits: string;
  };
}

export const CullingTheoryView: React.FC<CullingTheoryViewProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [selectedSection, setSelectedSection] = useState<string>('intro');

  // Comprehensive articles detailing all Culling Game pieces strictly aligned with cullingEngine.ts
  const pieceArticles: PieceArticle[] = useMemo(
    () => [
      {
        id: 'culling_gojo',
        counterpartId: 'culling_sukuna',
        name: 'Satoru Gojo',
        counterpartName: 'Ryomen Sukuna',
        role: 'Protected King-equivalent',
        materialValue: 99,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Steps up to 2 squares in any direction (orthogonal or diagonal). Blocked by intervening pieces along rays.',
        passiveAbility:
          'Infinity: Immune to all enemy captures during the first 5 turns of the match. Cannot be checked or taken while active.',
        activeAbility:
          'Limitless Teleport (Once per game): Translocates instantly to any unoccupied square within radius 3, bypassing obstacles and board blockers completely.',
        strengths: [
          'Total opening immunity for 5 full turns allows forward King positioning without early mate threats.',
          'Two-square radial mobility outpaces standard chess Kings in endgames.',
          'One-time 3-square teleport acts as the ultimate escape button from deep forks or mating nets.',
        ],
        weaknesses: [
          'If captured after Turn 5, your entire faction instantly loses.',
          'Vulnerable to Nanami’s 7:3 restriction if an enemy Nanami steps into adjacent squares.',
        ],
        commonMistakes: [
          'Forgetting that Infinity expires precisely when Turn 6 begins, leaving Gojo exposed in enemy territory.',
          'Using the teleport too early for a trivial step instead of saving it for game-saving defense.',
        ],
        tactics: [
          'Turn 1–5 Central Stride: Use immunity turns to safely centralize Gojo and anchor piece developments.',
          'Emergency Teleport Castle: Teleport directly from the front lines back to the shielded arm (B0..G0) if the King is swarmed.',
        ],
        specialScenario: {
          title: 'Limitless Teleport Escape',
          description:
            'When surrounded by enemy heavy pieces or pinned against the board edge, Gojo bypasses all intervening units to any free cell within a 3-square Chebyshev distance.',
          tip: 'Hold the teleport until the opponent commits heavy resources to a mating attack, rendering their moves wasted.',
          limits: 'Once per match. Cannot land on occupied squares or capture upon landing.',
        },
      },
      {
        id: 'culling_yuji',
        counterpartId: 'culling_kenjaku',
        name: 'Yuji Itadori',
        counterpartName: 'Kenjaku',
        role: 'Queen-equivalent with Leaping Ability',
        materialValue: 9.5,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Slides along ranks, files, and diagonals like a Queen. Features the Divergent Fist leap.',
        activeAbility:
          'Divergent Fist Leap: Can jump over exactly one blocking piece along any movement line to capture or land beyond it.',
        strengths: [
          'Full-board Queen mobility combined with the ability to hop over friendly pawns or enemy sentries.',
          'Creates inescapable discover checks and forks through enemy frontlines.',
        ],
        weaknesses: [
          'Prime target for enemy trades and long-range Mechamaru physical shots.',
          'Restricted to 1 square if standing adjacent to Nanami.',
        ],
        commonMistakes: [
          'Assuming Yuji can leap over TWO pieces—he can only hop over at most one obstacle per ray.',
          'Premature Queen raids into enemy territory before pawns are developed.',
        ],
        tactics: [
          'Shield-Hop Fork: Place Yuji behind your own Pawn and jump directly into the opponent back rank to fork heavy pieces.',
          'Cross-Arm Infiltration: Use the side arms (L2..L7 and R2..R7) to slide behind enemy defenses.',
        ],
        specialScenario: {
          title: 'Divergent Fist Vault',
          description:
            'Unlike a standard chess Queen blocked by a single pawn, Yuji leaps cleanly over the first obstacle and strikes the piece or square behind it.',
          tip: 'Use friendly pawns as springboards rather than clearing them out of the way.',
          limits: 'At most 1 jumped piece per move. Ray continues normally after the jump until second obstacle.',
        },
      },
      {
        id: 'culling_mechamaru',
        counterpartId: 'culling_yorozu',
        name: 'Kokichi Muta (Mechamaru)',
        counterpartName: 'Yorozu',
        role: 'Armored Heavy Rusher',
        materialValue: 5.5,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Heavy physical sliding up to 4 squares in all 8 orthogonal and diagonal directions.',
        passiveAbility:
          'Armored Chassis: Heavy material value that anchors back-rank defense and dominates 4-square diagonals.',
        activeAbility:
          'Ultra Cannon Overdrive Rush (Once per game): Physical thrust leaping over exactly one obstacle to capture or land up to 3 squares away.',
        strengths: [
          'High 4-square speed in all 8 directions covers critical center files (D, E, F).',
          'Overdrive Rush delivers sudden checkmate threats through pawn walls.',
        ],
        weaknesses: [
          'Capped at 4 squares max slide (cannot cross the full 10-rank board in a single move without repositioning).',
          'Vulnerable to diagonal forks from agile leapers like Maki and Kurourushi.',
        ],
        commonMistakes: [
          'Treating Mechamaru as an infinite Rook—remember the 4-square maximum range limitation.',
          'Wasting Overdrive Rush early on a standard pawn instead of breaking an enemy King defense.',
        ],
        tactics: [
          'Arm-to-Center Battery: Deploy Mechamaru along the F-file to control the entry squares of the top and bottom arms.',
          'Overdrive King Snatch: Leap over an opponent bodyguard pawn to strike the enemy King after Turn 5.',
        ],
      },
      {
        id: 'culling_nanami',
        counterpartId: 'culling_kurourushi',
        name: 'Kento Nanami',
        counterpartName: 'Kurourushi',
        role: 'Heavy Orthogonal Slider & Control Anchor',
        materialValue: 6.0,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Slides any distance horizontally and vertically along ranks and files (Rook-equivalent).',
        passiveAbility:
          '7:3 Ratio Technique: Any enemy piece standing adjacent (in the surrounding 3x3 box) is restricted to moving exactly 1 square max. Immune to capture by pawns and swarms!',
        strengths: [
          'Pawn Immunity: Enemy pawns and roach swarms CANNOT capture Nanami—he can walk directly into pawn chains.',
          'Paralyzing Proximity: Moving adjacent to enemy Queens (Yuji/Kenjaku) cuts their sliding range down to a mere 1-square step!',
        ],
        weaknesses: [
          'Higher-tier pieces (Kings, Queens, Mechas, leapers) can still capture Nanami normally.',
          'Cannot slide diagonally—pure orthogonal slider.',
        ],
        commonMistakes: [
          'Forgetting that Nanami is NOT immune to Maki, Panda, or Queen captures.',
          'Letting Nanami get trapped on an outer arm without orthogonal retreat paths.',
        ],
        tactics: [
          'Pawn-Wall Breaker: March Nanami straight into the opponent’s pawn chain without fear of pawn recapture.',
          'Queen Neutralizer: Step adjacent to Kenjaku or Yuji to completely shut down their multi-square diagonal sweeps.',
        ],
      },
      {
        id: 'culling_panda',
        counterpartId: 'culling_reggie',
        name: 'Panda',
        counterpartName: 'Reggie Star',
        role: 'Resilient Support & Core Shifter',
        materialValue: 4.5,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Standard Knight L-shape leaps (2x1). When transformed to Gorilla Core, gains 1-square steps in all 8 directions.',
        passiveAbility:
          'Core Switch: The first time Panda is attacked, the capture is REJECTED! Panda sheds his outer shell and awakens Gorilla Core. Only a second attack can eliminate him.',
        strengths: [
          'Virtually two lives on the board! Forces the enemy to waste two separate turns capturing him.',
          'Gorilla Core expands his moveset from L-leaps to include 1-step orthogonal and diagonal strikes.',
        ],
        weaknesses: [
          'Can be pushed backward or pinned while in Panda form.',
          'Once Gorilla Core is triggered, he has no third life.',
        ],
        commonMistakes: [
          'Failing to use Gorilla Core’s newly acquired 1-step moves to fork adjacent high-value targets.',
          'Sacrificing Panda before he has triggered Core Switch.',
        ],
        tactics: [
          'Bait & Counter: Intentionally leave Panda on an attack line; when the opponent captures him, the attack fails, leaving their piece vulnerable to your immediate counter-strike!',
          'Arm Sentry: Station Panda at the B0/G0 or B9/G9 choke point to absorb two hostile waves.',
        ],
      },
      {
        id: 'culling_maki',
        counterpartId: 'culling_naoya',
        name: 'Maki Zenin',
        counterpartName: 'Naoya Zenin',
        role: 'Agile Leaping Infiltrator',
        materialValue: 4.0,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Slides up to 2 squares diagonally. Leaps exactly 2 squares orthogonally over obstacles.',
        activeAbility:
          'Heavenly Restriction Rush: High tactical agility capable of vaulting over friendly or enemy pieces along ranks and files.',
        strengths: [
          'Obstacle-ignoring 2-square orthogonal leaps provide unmatched escape routes through congested board centers.',
          'Quick 2-square diagonal slides control tight color complexes.',
        ],
        weaknesses: [
          'Lacks infinite sliding distance—cannot cross the full board without multiple maneuvers.',
          'Vulnerable to long-range Rook and Queen lines once caught in the open.',
        ],
        commonMistakes: [
          'Confusing her 2-square orthogonal jump with a standard Knight L-leap.',
          'Leaving Maki on a file with open enemy sliding pieces.',
        ],
        tactics: [
          'Choke-Point Vault: Leap over your own pawn rank at C2 to immediately threaten the enemy D4/E4 center squares.',
          'King Harassment: Use 2-square diagonal slides to deliver unexpected checks from behind cover.',
        ],
      },
      {
        id: 'culling_hakari',
        counterpartId: 'culling_uraume',
        name: 'Kinji Hakari',
        counterpartName: 'Uraume',
        role: 'Jackpot Momentum Specialist',
        materialValue: 4.5,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary: 'Orthogonal sliding up to 3 squares along ranks and files.',
        passiveAbility:
          'Idle Death Gamble: Upon ANY successful piece capture, Hakari hits JACKPOT! Earns an immediate consecutive bonus turn (non-recursive).',
        strengths: [
          'The only piece in the game that grants consecutive player turns upon capturing.',
          'Can capture a piece and instantly retreat or deliver a second capture in the same turn!',
        ],
        weaknesses: [
          'Limited to orthogonal moves (cannot move diagonally).',
          '3-square range cap requires tactical positioning before initiating captures.',
        ],
        commonMistakes: [
          'Forgetting to plan the jackpot bonus step ahead of time, wasting the extra turn on an idle move.',
          'Assuming jackpot triggers on non-capture moves (it only activates on capturing enemy pieces).',
        ],
        tactics: [
          'Double-Strike Combo: Capture an enemy pawn with Hakari, trigger Jackpot, and immediately capture an adjacent Rook or King in the bonus turn!',
          'Hit & Run: Capture an enemy piece on deep enemy squares, then immediately retreat Hakari back to safety in the same breath.',
        ],
      },
      {
        id: 'culling_reggie',
        counterpartId: 'culling_panda',
        name: 'Reggie Star',
        counterpartName: 'Panda',
        role: 'Tactical Support & Shield Bestower',
        materialValue: 4.0,
        whiteColor: 'black',
        blackColor: 'black',
        movementSummary: 'Moves up to 2 squares in any orthogonal or diagonal direction.',
        activeAbility:
          'Receipt Contract (Once per game): Bestows an impenetrable 1-hit contract shield upon self or any adjacent friendly piece. The shield absorbs the next capture attempt completely!',
        strengths: [
          'Can grant a 1-hit invulnerability shield to Ryomen Sukuna or Kenjaku, making them immune to an impending lethal attack.',
          'Solid 2-square all-around radial movement.',
        ],
        weaknesses: [
          'Once the contract is burned, Reggie has no other supernatural abilities.',
          'Low individual offensive firepower compared to heavy hitters.',
        ],
        commonMistakes: [
          'Shielding a piece that was not under immediate danger, wasting the one-time contract.',
          'Using the shield on a low-value pawn instead of your King or Queen.',
        ],
        tactics: [
          'King Guardian Protocol: Stand adjacent to Sukuna and shield him on Turn 6 right as King immunity ends.',
          'Unstoppable Attacker: Shield Kenjaku, allowing him to dive deeply into enemy territory without fear of being traded.',
        ],
      },
      {
        id: 'culling_uraume',
        counterpartId: 'culling_hakari',
        name: 'Uraume',
        counterpartName: 'Kinji Hakari',
        role: 'Control Controller & Freeze Specialist',
        materialValue: 5.0,
        whiteColor: 'black',
        blackColor: 'black',
        movementSummary:
          'Slides diagonally like a Bishop, plus steps 1 square in any orthogonal direction.',
        activeAbility:
          'Frost Calm: Targets a 3x3 sector within line of sight, freezing and completely immobilizing all enemy pieces caught inside for 1 turn (3-turn cooldown).',
        strengths: [
          'Freezes multiple enemy pieces in place, neutralizing attacks or preventing defenders from saving their King.',
          'Combination of Bishop diagonal slides and orthogonal steps avoids single-color diagonal entrapment.',
        ],
        weaknesses: [
          'Frost Calm has a 3-turn cooldown before it can be deployed again.',
          'Weak close-quarters brawler against high-mobility leapers.',
        ],
        commonMistakes: [
          'Freezing an empty sector instead of targeting the cluster around the enemy King.',
          'Targeting friendly pieces inadvertently in overlapping tactical sectors.',
        ],
        tactics: [
          'Turn 6 Deep Freeze: Target Gojo’s guard cluster on Turn 6 to freeze his defenders while Sukuna maneuvers.',
          'Choke-Point Wall: Freeze the narrow bottleneck between the central board and side arms.',
        ],
      },
      {
        id: 'culling_naoya',
        counterpartId: 'culling_maki',
        name: 'Naoya Zenin',
        counterpartName: 'Maki Zenin',
        role: 'High-Speed Sprint Rusher',
        materialValue: 4.5,
        whiteColor: 'black',
        blackColor: 'black',
        movementSummary:
          'Projection Sorcery: High-speed sprint up to 4 squares in any straight line (orthogonal or diagonal).',
        passiveAbility:
          'Subsonic Cooldown: After performing a sprint of 3 or 4 squares, Naoya must rest on the following turn, limiting his next movement to 1 square max.',
        strengths: [
          'Fastest single-turn coverage among support pieces—can cover 4 squares in 8 directions.',
          'Tremendous flanking capability across the outer cross wings (L-file to H-file).',
        ],
        weaknesses: [
          'Sprint cooldown reduces him to a slow 1-step piece right after a deep dash.',
          'Requires clear unobstructed straight lines—cannot jump over pieces.',
        ],
        commonMistakes: [
          'Sprinting into an isolated enemy square and then being captured during the 1-step cooldown turn.',
          'Forgetting that 1 or 2 square moves DO NOT trigger the cooldown penalty.',
        ],
        tactics: [
          'Staggered Approach: Move 2 squares first to retain full sprint readiness, then sprint 4 squares for the decisive capture.',
          'Flank Sweep: Sprint down the L or R file to infiltrate the White team’s back rank at H1.',
        ],
      },
      {
        id: 'culling_pawn',
        name: 'Culling Pawn',
        role: 'Frontline Infantry & Promotion Asset',
        materialValue: 1.0,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Steps 1 square forward. Captures 1 square diagonally forward. Promotes upon reaching the opponent’s end rank (Ranks 8 or 9 for White; Ranks 1 or 0 for Black).',
        strengths: [
          'Essential for territorial space control across the B2..G2 and B7..G7 files.',
          'Promotes automatically to a heavy piece (Nanami or Naoya) upon touching the back row.',
        ],
        weaknesses: [
          'Cannot capture Nanami due to his 7:3 Ratio passive immunity.',
          'Slow single-step forward pace.',
        ],
        commonMistakes: [
          'Moving pawns forward without support, leaving them as easy fodder for Hakari’s Jackpot.',
          'Overlooking the opponent’s pawn marching toward your end rank.',
        ],
        tactics: [
          'End-Rank Infiltration: Advance pawns through the extended top/bottom arms (B0/G0 or B9/G9) where defense is thin.',
          'Jackpot Denial: Never leave unprotected pawns in Hakari’s 3-square orthogonal range.',
        ],
      },
    ],
    []
  );

  const selectedArticle = useMemo(() => {
    return pieceArticles.find((a) => a.id === selectedSection);
  }, [pieceArticles, selectedSection]);

  // Precompute authoritative move diagrams for the active piece
  const whiteStandardPattern = useMemo(() => {
    if (!selectedArticle) return new Map();
    return getEnginePiecePattern(selectedArticle.id, 'white', 'standard');
  }, [selectedArticle]);

  const whiteCombatPattern = useMemo(() => {
    if (!selectedArticle) return new Map();
    return getEnginePiecePattern(selectedArticle.id, 'white', 'combat');
  }, [selectedArticle]);

  const blackStandardPattern = useMemo(() => {
    if (!selectedArticle) return new Map();
    const type = selectedArticle.counterpartId || selectedArticle.id;
    return getEnginePiecePattern(type, 'black', 'standard');
  }, [selectedArticle]);

  const blackCombatPattern = useMemo(() => {
    if (!selectedArticle) return new Map();
    const type = selectedArticle.counterpartId || selectedArticle.id;
    return getEnginePiecePattern(type, 'black', 'combat');
  }, [selectedArticle]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0e14] text-black dark:text-white flex flex-col font-sans select-none">
      {/* Top Header Bar */}
      <header className="px-4 sm:px-6 py-3 border-b-3 border-black dark:border-white bg-white dark:bg-[#0f172a] sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#1e293b] hover:bg-neutral-100 dark:hover:bg-slate-700 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-black uppercase cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h1 className="text-sm sm:text-base font-black uppercase tracking-wider">
              Culling Game Theory Book
            </h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400">
          <span>88 Cross Squares • Authoritative Engine Diagrams</span>
        </div>
      </header>

      {/* Main Layout: Sidebar Tab Index + Dynamic Article Viewer */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col md:flex-row gap-5">
        {/* SIDEBAR TABS INDEX */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <div className="bg-white dark:bg-[#0f172a] border-3 border-black dark:border-white p-3 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
            <span className="text-[10px] font-mono font-black uppercase text-amber-600 dark:text-amber-400 block mb-2">
              📖 Table of Contents
            </span>

            {/* General Chapters */}
            <div className="space-y-1 mb-3">
              <button
                onClick={() => setSelectedSection('intro')}
                className={`w-full text-left px-2.5 py-1.5 border-2 text-xs font-black uppercase flex items-center justify-between cursor-pointer transition-colors ${
                  selectedSection === 'intro'
                    ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#000]'
                    : 'bg-neutral-100 dark:bg-[#1e293b] border-transparent hover:border-black/30 dark:hover:border-white/30 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-500" />
                  1. Core Rules & Field
                </span>
                <ChevronRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => setSelectedSection('guide')}
                className={`w-full text-left px-2.5 py-1.5 border-2 text-xs font-black uppercase flex items-center justify-between cursor-pointer transition-colors ${
                  selectedSection === 'guide'
                    ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#000]'
                    : 'bg-neutral-100 dark:bg-[#1e293b] border-transparent hover:border-black/30 dark:hover:border-white/30 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-500" />
                  2. Decision Guide
                </span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Piece Encyclopedia Index */}
            <span className="text-[10px] font-mono font-black uppercase text-neutral-500 block mb-1.5">
              ♟️ Sorcerer Roster ({pieceArticles.length})
            </span>

            <div className="space-y-1 max-h-[50vh] md:max-h-[60vh] overflow-y-auto pr-1">
              {pieceArticles.map((art) => {
                const isSelected = selectedSection === art.id;
                return (
                  <button
                    key={art.id}
                    onClick={() => setSelectedSection(art.id)}
                    className={`w-full text-left px-2 py-1.5 border-2 text-xs font-bold uppercase flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#000]'
                        : 'bg-neutral-100 dark:bg-[#1e293b] border-transparent hover:border-black/30 dark:hover:border-white/30 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-5 h-5 shrink-0 bg-neutral-900 border border-neutral-700 flex items-center justify-center p-0.5">
                        <CullingPieceComponent type={art.id} color="white" />
                      </div>
                      <span className="truncate">{art.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-black opacity-75 shrink-0">
                      V:{art.materialValue}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* MAIN ARTICLE VIEWER */}
        <main className="flex-1 bg-white dark:bg-[#0f172a] border-3 border-black dark:border-white p-4 sm:p-6 shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff] flex flex-col justify-between">
          {selectedSection === 'intro' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Chapter 1: Objective, 88-Square Battlefield & Core Turn Laws
              </div>

              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                Welcome to the Culling Game
              </h2>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-300 font-bold leading-relaxed">
                The Culling Game is an authoritative, supernatural chess battleground played on an
                88-square cross-shaped board. Two opposing factions—Satoru Gojo’s Protagonists (White)
                and Ryomen Sukuna’s Antagonists (Black)—clash with character-specific techniques,
                five-turn King immunity, and tactical barrier interactions.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
                  <h3 className="text-xs font-black uppercase text-amber-500 mb-1 flex items-center gap-1.5">
                    <Swords className="w-4 h-4" />
                    Objective & Win Conditions
                  </h3>
                  <ul className="text-xs text-neutral-600 dark:text-slate-300 font-bold space-y-1.5 list-disc list-inside">
                    <li>
                      <strong>King Decapitation:</strong> Capture the opponent’s King-equivalent
                      (Satoru Gojo or Ryomen Sukuna) after Turn 5.
                    </li>
                    <li>
                      <strong>Domain Checkmate:</strong> Trap the enemy King with no legal escape or
                      counter-strike.
                    </li>
                    <li>
                      <strong>Clock Timeout:</strong> Depleting your countdown clock results in immediate loss.
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
                  <h3 className="text-xs font-black uppercase text-amber-500 mb-1 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Turn 1–5 King Immunity
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-slate-300 font-bold leading-relaxed">
                    Neither Satoru Gojo nor Ryomen Sukuna can be captured or checkmated during the first
                    5 turns of the match (Infinity & King of Curses shields). This allows aggressive
                    centralization without the threat of instant scholar’s mates.
                  </p>
                </div>

                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
                  <h3 className="text-xs font-black uppercase text-amber-500 mb-1 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    The 88-Square Cross Battlefield
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-slate-300 font-bold leading-relaxed">
                    Standard 8x8 center (Columns A..H, Ranks 1..8) extended by 4 peripheral arms:
                    Top arm (B9..G9), Bottom arm (B0..G0), Left arm (L2..L7), and Right arm (R2..R7).
                    The four outer 2x2 corners are VOID space.
                  </p>
                </div>

                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
                  <h3 className="text-xs font-black uppercase text-amber-500 mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Time Controls & Pacing
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-slate-300 font-bold leading-relaxed">
                    Available in Blitz (2 minutes) and Rapid (5 minutes). There are no random dice rolls
                    in Culling Game Mode—all moves and abilities are 100% deterministic and server-authoritative.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedSection === 'guide' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase">
                <Target className="w-3.5 h-3.5" />
                Chapter 2: Which Piece Should I Move? (Decision Flowchart)
              </div>

              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                Grandmaster Opening, Midgame & Endgame Playbook
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[3px_3px_0px_#000]">
                  <h3 className="text-sm font-black uppercase text-amber-500 mb-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-black text-amber-400 text-[10px] font-mono">PHASE 1</span>
                    The Opening (Turns 1–5) — Seize the Cross Arms
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-slate-300 font-bold leading-relaxed mb-2">
                    During the first 5 turns, your King cannot be eliminated. Do NOT turtle in the corners!
                  </p>
                  <ul className="text-xs text-neutral-600 dark:text-slate-300 font-bold space-y-1 list-disc list-inside">
                    <li>Push the D2 and E2 pawns forward to open diagonals for Maki and Mechamaru.</li>
                    <li>
                      Advance Gojo / Sukuna into the central D4/E4 files to command high-influence squares under total immunity.
                    </li>
                    <li>
                      Deploy Hakari or Nanami into the lateral wings (L-file and R-file) to control perimeter flanking corridors.
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[3px_3px_0px_#000]">
                  <h3 className="text-sm font-black uppercase text-amber-500 mb-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-black text-amber-400 text-[10px] font-mono">PHASE 2</span>
                    The Midgame (Turns 6–15) — Strike with Asymmetric Techniques
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-slate-300 font-bold leading-relaxed mb-2">
                    Turn 6 is the deadly inflection point. Kings are now mortal.
                  </p>
                  <ul className="text-xs text-neutral-600 dark:text-slate-300 font-bold space-y-1 list-disc list-inside">
                    <li>
                      If playing White, leverage Yuji’s Divergent Fist to leap over pawn lines and pin the opponent Queen.
                    </li>
                    <li>
                      If playing Black, burn Reggie Star’s Contract Shield to bestow an indestructible shield on Sukuna immediately on Turn 6.
                    </li>
                    <li>
                      Use Nanami to freeze enemy Queen movements by stepping directly adjacent (7:3 Ratio reduces sliding to 1 step).
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[3px_3px_0px_#000]">
                  <h3 className="text-sm font-black uppercase text-amber-500 mb-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-black text-amber-400 text-[10px] font-mono">PHASE 3</span>
                    The Endgame — Pawns & Teleports
                  </h3>
                  <ul className="text-xs text-neutral-600 dark:text-slate-300 font-bold space-y-1 list-disc list-inside">
                    <li>
                      Pawns reaching Ranks 8/9 or 1/0 promote immediately to heavy hitters. Push pawns through the unmonitored B0/G0 or B9/G9 back arms.
                    </li>
                    <li>
                      Save Gojo’s 3-square Teleport or Sukuna’s Dismantle Rush for the final mating net escape.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedArticle && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Box showing White and Black versions side by side */}
              <div className="bg-neutral-100 dark:bg-[#1e293b] border-3 border-black dark:border-white p-4 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Side-by-side Piece Avatars */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 p-1 bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center">
                      <CullingPieceComponent type={selectedArticle.id} color="white" />
                    </div>
                    <span className="text-xs font-black uppercase text-neutral-400">VS</span>
                    <div className="w-12 h-12 p-1 bg-neutral-950 border-2 border-white shadow-[2px_2px_0px_#fff] flex items-center justify-center">
                      <CullingPieceComponent
                        type={selectedArticle.counterpartId || selectedArticle.id}
                        color="black"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight">
                        {selectedArticle.name}{' '}
                        {selectedArticle.counterpartName && (
                          <span className="text-neutral-500">/ {selectedArticle.counterpartName}</span>
                        )}
                      </h2>
                      <span className="px-2 py-0.5 bg-amber-400 text-black border border-black text-[10px] font-black uppercase">
                        {selectedArticle.role}
                      </span>
                      <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black border border-black text-[10px] font-mono font-black uppercase">
                        Material: {selectedArticle.materialValue}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-slate-300 font-bold mt-1">
                      {selectedArticle.movementSummary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Engine-Authoritative Movement Mini-Boards (White & Black side-by-side) */}
              <div className="bg-neutral-100 dark:bg-[#1e293b] border-3 border-black dark:border-white p-4 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
                <div className="flex items-center justify-between mb-3 border-b-2 border-black/10 dark:border-white/10 pb-2">
                  <span className="text-xs font-black uppercase flex items-center gap-1.5 text-amber-500">
                    <Zap className="w-4 h-4" />
                    Authoritative 9×9 Engine Move Diagrams
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-amber-400 border border-black inline-block" />
                      Move
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-red-600 border border-black inline-block" />
                      Capture
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-sky-500 border border-black inline-block" />
                      Special / Leap
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-emerald-600 border border-black inline-block" />
                      Ally
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center">
                  <MiniBoardDiagram
                    pattern={whiteStandardPattern}
                    pieceType={selectedArticle.id}
                    color="white"
                    title={`${selectedArticle.name} (Open Field)`}
                  />
                  <MiniBoardDiagram
                    pattern={whiteCombatPattern}
                    pieceType={selectedArticle.id}
                    color="white"
                    title={`${selectedArticle.name} (In Combat)`}
                  />
                  <MiniBoardDiagram
                    pattern={blackStandardPattern}
                    pieceType={selectedArticle.counterpartId || selectedArticle.id}
                    color="black"
                    title={`${selectedArticle.counterpartName || selectedArticle.name} (Open)`}
                  />
                  <MiniBoardDiagram
                    pattern={blackCombatPattern}
                    pieceType={selectedArticle.counterpartId || selectedArticle.id}
                    color="black"
                    title={`${selectedArticle.counterpartName || selectedArticle.name} (Combat)`}
                  />
                </div>
              </div>

              {/* Passive & Active Abilities Section */}
              {(selectedArticle.passiveAbility || selectedArticle.activeAbility) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedArticle.passiveAbility && (
                    <div className="p-3.5 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
                      <span className="text-[10px] font-mono font-black uppercase text-amber-500 block mb-1">
                        🛡️ Passive Technique
                      </span>
                      <p className="text-xs text-neutral-700 dark:text-slate-300 font-bold leading-relaxed">
                        {selectedArticle.passiveAbility}
                      </p>
                    </div>
                  )}

                  {selectedArticle.activeAbility && (
                    <div className="p-3.5 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
                      <span className="text-[10px] font-mono font-black uppercase text-sky-400 block mb-1">
                        ⚡ Active Technique
                      </span>
                      <p className="text-xs text-neutral-700 dark:text-slate-300 font-bold leading-relaxed">
                        {selectedArticle.activeAbility}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Strengths, Weaknesses, Common Mistakes & Tactics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
                  <h4 className="text-xs font-black uppercase text-emerald-500 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Key Strengths
                  </h4>
                  <ul className="text-xs text-neutral-600 dark:text-slate-300 font-bold space-y-1.5 list-disc list-inside">
                    {selectedArticle.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
                  <h4 className="text-xs font-black uppercase text-red-500 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Weaknesses & Vulnerabilities
                  </h4>
                  <ul className="text-xs text-neutral-600 dark:text-slate-300 font-bold space-y-1.5 list-disc list-inside">
                    {selectedArticle.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
                  <h4 className="text-xs font-black uppercase text-amber-500 mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    Common Beginner Mistakes
                  </h4>
                  <ul className="text-xs text-neutral-600 dark:text-slate-300 font-bold space-y-1.5 list-disc list-inside">
                    {selectedArticle.commonMistakes.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
                  <h4 className="text-xs font-black uppercase text-sky-400 mb-2 flex items-center gap-1.5">
                    <Target className="w-4 h-4" />
                    Grandmaster Tactics & Endgame Use
                  </h4>
                  <ul className="text-xs text-neutral-600 dark:text-slate-300 font-bold space-y-1.5 list-disc list-inside">
                    {selectedArticle.tactics.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Special Ability Detailed Scenario Box */}
              {selectedArticle.specialScenario && (
                <div className="p-4 bg-amber-400 text-black border-3 border-black shadow-[4px_4px_0px_#000]">
                  <span className="text-[10px] font-mono font-black uppercase block mb-1">
                    ✦ Tactical Deep-Dive: {selectedArticle.specialScenario.title}
                  </span>
                  <p className="text-xs font-bold leading-relaxed mb-2">
                    {selectedArticle.specialScenario.description}
                  </p>
                  <div className="text-[11px] font-mono font-black bg-black text-amber-400 p-2 border border-black mb-1">
                    PRO TIP: {selectedArticle.specialScenario.tip}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-neutral-800">
                    LIMITATIONS: {selectedArticle.specialScenario.limits}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="mt-6 pt-4 border-t-2 border-black/10 dark:border-white/10 flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-neutral-200 dark:bg-[#1e293b] hover:bg-neutral-300 dark:hover:bg-slate-700 text-black dark:text-white font-black text-xs uppercase border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              Close Theory Book
            </button>

            <span className="text-[11px] font-mono font-bold text-neutral-500">
              MugenChessX Jujutsu Kaisen Theory Codex
            </span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CullingTheoryView;
