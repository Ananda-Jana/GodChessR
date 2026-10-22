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
    hasMoved: true,
    pandaCore: (pieceType === 'culling_panda' || pieceType === 'culling_yorozu') ? 'panda' : undefined,
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
  match.turnCount = 1;

  const moves: CullingMove[] = getPseudoLegalMovesForSquare(match, centerPos);

  cellMap.set('0,0', { type: 'center', pieceType, pieceColor: color });

  for (const m of moves) {
    const dx = m.to.x - 4;
    const dy = m.to.y - 4;
    if (dx >= -4 && dx <= 4 && dy >= -4 && dy <= 4) {
      const key = `${dx},${dy}`;
      if (m.actionType === 'teleport' || m.actionType === 'shoot' || m.actionType === 'black_flash') {
        cellMap.set(key, { type: 'special', label: 'Tech' });
      } else if (m.captured) {
        cellMap.set(key, { type: 'capture', label: 'Cap' });
      } else {
        cellMap.set(key, { type: 'move' });
      }
    }
  }

  if (scenario === 'combat') {
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
          const dy = 4 - r;
          return Array.from({ length: 9 }).map((__, c) => {
            const dx = c - 4;
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

  // Symmetrical articles detailing all 8 Culling Game roles strictly aligned with cullingEngine.ts
  const pieceArticles: PieceArticle[] = useMemo(
    () => [
      {
        id: 'culling_gojo',
        counterpartId: 'culling_sukuna',
        name: 'Satoru Gojo',
        counterpartName: 'Ryomen Sukuna',
        role: 'Sovereign',
        materialValue: 99,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Moves/captures 1 step in all 8 directions. Sovereign piece whose loss is fatal.',
        activeAbility:
          'Domain Step (Once per game): Move to an empty square exactly 2 away along a straight or diagonal line (8 targets), jumping intervening pieces. Unusable while in check; landing square must not be attacked.',
        strengths: [
          'Omnidirectional 1-step flexibility controls adjacent key squares.',
          'Domain Step allows jumping over obstacles to escape entrapment or rapidly reposition across choke points.',
          'Immune to trivial checkmate traps when saving Domain Step for emergency evasions.',
        ],
        weaknesses: [
          'If captured or checkmated, the match is instantly lost.',
          'Domain Step CANNOT be used while in check; you must escape check with a standard step or interposition.',
        ],
        commonMistakes: [
          'Using Domain Step prematurely on turn 2 instead of saving it as a late-game tactical escape.',
          'Assuming Domain Step can capture an enemy piece (it can only land on an empty, unattacked square).',
        ],
        tactics: [
          'Domain Vault: Use Domain Step to jump over your own pawn rank into safe central territory.',
          'King Shelter: When facing long-range sliding pressure, maneuver into the extended arms (B0..G0 or B9..G9).',
        ],
        specialScenario: {
          title: 'Domain Step Evasion',
          description:
            'When not in check, the Sovereign leaps exactly 2 squares in any of 8 straight or diagonal lines, vaulting cleanly over an intervening piece to land on an unattacked empty square.',
          tip: 'Ensure the destination is completely unattacked by any opponent piece before committing.',
          limits: 'Once per match. Cannot capture. Cannot be activated while in check. Landing cell must not be attacked.',
        },
      },
      {
        id: 'culling_yuji',
        counterpartId: 'culling_kenjaku',
        name: 'Yuji Itadori',
        counterpartName: 'Kenjaku',
        role: 'Vanguard',
        materialValue: 8.0,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Slides up to 3 squares in all 8 directions (orthogonal and diagonal). Does not leap over pieces.',
        activeAbility:
          'Black Flash: A capture of an enemy at exactly distance 2 in a straight line strikes in place (the Vanguard does NOT move; the target is removed). Captures at distance 1 or 3 move normally.',
        strengths: [
          'Multi-square sliding coverage across 8 directions dominates central files and open ranks.',
          'Black Flash allows remote decapitation at distance 2 without vacating defensive outposts.',
        ],
        weaknesses: [
          'Cannot leap over any pieces—sliding rays stop at the first unit or void cell.',
          'Restricted to 1 square max when standing adjacent to an enemy Warden (Nanami/Reggie).',
        ],
        commonMistakes: [
          'Expecting to jump over pawns (leaping is strictly exclusive to Bulwark and Skirmisher).',
          'Forgetting that Black Flash only triggers at exactly distance 2 (distance 1 and 3 captures move the Vanguard).',
        ],
        tactics: [
          'Anchor Strike: Position the Vanguard on D3 and use Black Flash to smash enemy pieces on D5 without advancing into crossfire.',
          'Rook-Battery Support: Pair Vanguard with Artillery to create impenetrable 2-square exclusion corridors.',
        ],
        specialScenario: {
          title: 'Black Flash Strike in Place',
          description:
            'When capturing an enemy precisely 2 squares away along a straight or diagonal line with an empty middle square, Black Flash obliterates the target while the Vanguard remains anchored on its origin square.',
          tip: 'Use Black Flash to eliminate hostile pieces without surrendering control of your defensive square.',
          limits: 'Applies only at distance 2. Middle square must be empty. Distance 1 and 3 captures move normally.',
        },
      },
      {
        id: 'culling_mechamaru',
        counterpartId: 'culling_uraume',
        name: 'Kokichi Muta (Mechamaru)',
        counterpartName: 'Uraume',
        role: 'Artillery',
        materialValue: 4.0,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Moves/captures 1 step in all 8 directions. Features long-range Ranged Strike.',
        activeAbility:
          'Ranged Strike: Removes an enemy exactly 2 squares away along a straight or diagonal line, only if the middle square is empty; the Artillery does not move.',
        strengths: [
          'Safe stationary sniping removes enemy attackers without exposing the Artillery to counter-attacks.',
          'Controls all 8 radial directions at distance 2 when middle squares are clear.',
        ],
        weaknesses: [
          'Normal movement is only 1 step, making positional redeployment deliberate.',
          'Ranged Strike is completely DISABLED if adjacent to an enemy Warden (Ratio Field restriction).',
        ],
        commonMistakes: [
          'Trying to fire through a blocked middle square (middle cell MUST be empty).',
          'Allowing an enemy Warden to step adjacent, shutting down all Ranged Strike capabilities.',
        ],
        tactics: [
          'Choke-Point Sentry: Station Artillery behind friendly pawns and snipe incoming hostiles across open ranks.',
          'Corner Arm Fortress: Post Artillery on B1 or G1 to command diagonal entrance routes into the back rank.',
        ],
        specialScenario: {
          title: 'Stationary Ranged Strike',
          description:
            'Artillery eliminates an enemy piece 2 squares away along any orthogonal or diagonal vector without moving, provided the intervening cell is unoccupied.',
          tip: 'Keep the intermediate square vacant to preserve your strike line.',
          limits: 'Target must be exactly distance 2. Middle square must be empty. Disabled when restricted by Warden.',
        },
      },
      {
        id: 'culling_panda',
        counterpartId: 'culling_yorozu',
        name: 'Panda',
        counterpartName: 'Yorozu',
        role: 'Bulwark',
        materialValue: 3.5,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Moves/captures as a Knight (8 L-jumps: 2x1). Leaps freely over intervening pieces.',
        passiveAbility:
          'Shell: The first capture attempt on this piece fails; the attacker stays on its square, the shell breaks, and the turn is spent. The next capture works normally.',
        strengths: [
          'One of only two roles in the game capable of leaping over pieces in normal play.',
          'Shell absorbs the first enemy attack completely, forcing the opponent to waste an entire turn.',
        ],
        weaknesses: [
          'Once the shell breaks, the Bulwark can be captured normally.',
          'Knight geometry cannot slide across open ranks or files.',
        ],
        commonMistakes: [
          'Assuming the shell regenerates (it breaks permanently upon the first attack).',
          'Expecting extra king-steps after the shell breaks (movement remains knight L-jumps only).',
        ],
        tactics: [
          'Tempo Sponge: Place Bulwark directly in the path of an enemy Vanguard or Rusher; their first attack fails, surrendering tempo.',
          'Fork Infiltration: Leap over congested pawn ranks to fork the enemy Sovereign and major pieces.',
        ],
        specialScenario: {
          title: 'Shell Hardening Barrier',
          description:
            'When an opponent attacks a Bulwark with shell intact, the attack fails entirely. The attacking piece is stopped on its origin square, the shell breaks, and the enemy turn ends with zero progress.',
          tip: 'Use the Bulwark as a frontline buffer to nullify an opponent’s aggressive momentum.',
          limits: 'Works once per Bulwark. Attacker stays on its origin square. Second capture attempt succeeds normally.',
        },
      },
      {
        id: 'culling_nanami',
        counterpartId: 'culling_reggie',
        name: 'Kento Nanami',
        counterpartName: 'Reggie Star',
        role: 'Warden',
        materialValue: 4.5,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Slides up to 3 squares orthogonally (horizontal/vertical). Does not leap.',
        passiveAbility:
          'Ratio Field: Any enemy piece in the 8 adjacent squares is restricted to moving/capturing 1 square max, and Artillery strikes are disabled for it.',
        strengths: [
          'Paralyzing zone of control cuts enemy multi-square sliders down to 1 step.',
          'Disables enemy Artillery strikes completely within its adjacent perimeter.',
          'Fast orthogonal repositioning up to 3 squares across open files.',
        ],
        weaknesses: [
          'No diagonal movement whatsoever.',
          'Has NO capture immunity (can be captured by pawns, sovereigns, and any piece).',
          'Cannot restrict Skirmishers (Maki/Naoya ignore Ratio Field due to Heavenly Restriction).',
        ],
        commonMistakes: [
          'Assuming Nanami is immune to pawn captures (all pawn immunities have been removed).',
          'Trying to restrict Maki or Naoya (Skirmishers ignore Ratio Field).',
        ],
        tactics: [
          'Queen Cager: Step adjacent to the enemy Vanguard to shut down its 3-square sliding sweeps.',
          'Artillery Silencer: Walk adjacent to Mechamaru or Uraume to immediately deactivate their Ranged Strike.',
        ],
        specialScenario: {
          title: 'Ratio Field Suppression',
          description:
            'Any enemy unit standing in the 8 squares surrounding the Warden is restricted to a maximum movement/capture distance of 1 square, and Artillery ranged strikes are disabled.',
          tip: 'Lock down enemy heavy pieces by pressing the Warden into close-quarters combat.',
          limits: 'Applies dynamically from board position. Skirmishers are immune due to Heavenly Restriction.',
        },
      },
      {
        id: 'culling_maki',
        counterpartId: 'culling_naoya',
        name: 'Maki Zenin',
        counterpartName: 'Naoya Zenin',
        role: 'Skirmisher',
        materialValue: 3.5,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Moves/captures 1 step in all 8 directions, OR hops exactly 2 squares orthogonally (leaping over anything).',
        passiveAbility:
          'Heavenly Restriction: Completely immune to the Warden’s Ratio Field restriction.',
        strengths: [
          'One of only two roles capable of leaping over pieces (2-square orthogonal hops).',
          'Ignores the Warden Ratio Field, retaining full leaping mobility even when adjacent to Nanami or Reggie.',
          'High unpredictability leaping through congested pawn chains.',
        ],
        weaknesses: [
          'Cannot slide beyond 2 squares in a single turn.',
          'Vulnerable to long-range sliding attacks across open lines.',
        ],
        commonMistakes: [
          'Confusing the 2-square orthogonal hop with a Knight L-jump (hop is strictly horizontal or vertical).',
          'Trying to hop diagonally over pieces (diagonal moves are strictly 1-step sliding).',
        ],
        tactics: [
          'Pawn Vault: Hop over your own Rank 2 pawns directly onto Rank 4 to establish immediate central control.',
          'Warden Hunter: Use Heavenly Restriction to leap right past a Warden without suffering mobility penalties.',
        ],
        specialScenario: {
          title: 'Heavenly Restriction Vault',
          description:
            'The Skirmisher hops exactly 2 squares along ranks and files, ignoring any intermediate piece, and is completely immune to movement restrictions imposed by enemy Wardens.',
          tip: 'Use Skirmishers to dismantle enemy Warden anchors that other pieces cannot approach safely.',
          limits: 'Orthogonal hops are fixed at distance 2. Diagonal movement is capped at 1 step.',
        },
      },
      {
        id: 'culling_hakari',
        counterpartId: 'culling_kurourushi',
        name: 'Kinji Hakari',
        counterpartName: 'Kurourushi',
        role: 'Rusher',
        materialValue: 3.5,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Slides up to 2 squares diagonally (no leaping), or steps 1 square orthogonally.',
        passiveAbility:
          'Jackpot: After this piece captures an enemy, the same player earns ONE extra move with that SAME piece: a single 1-square step in 8 directions, no capture, to an unattacked square keeping Sovereign safe.',
        strengths: [
          'The only role that grants an immediate consecutive player turn upon capturing.',
          'Hit-and-Run Mastery: Capture an enemy piece and immediately retreat to a safe unattacked square in the same turn.',
        ],
        weaknesses: [
          'Jackpot bonus step CANNOT capture and MUST be to an unattacked square.',
          'If no safe unattacked square exists, the Jackpot bonus is forfeited automatically.',
        ],
        commonMistakes: [
          'Expecting to capture a second piece during the Jackpot bonus step (bonus step is non-capturing only).',
          'Capturing when all surrounding squares are covered by opponent attacks (forfeits bonus).',
        ],
        tactics: [
          'Tactical Retreat: Capture a forward enemy pawn, activate Jackpot, and step safely back behind friendly lines.',
          'Diagonal Skewer: Use 2-square diagonal slides to threaten enemy minor pieces on flank corridors.',
        ],
        specialScenario: {
          title: 'Idle Death Gamble Jackpot',
          description:
            'Upon executing a capture, the Rusher triggers Jackpot, granting an immediate consecutive move consisting of a single 1-square step in any of 8 directions to an unattacked empty square.',
          tip: 'Verify an unattacked escape square exists before committing the Rusher to a capture.',
          limits: 'Bonus move must be with the same Rusher piece. Cannot capture. Cannot step into enemy attack. Non-recursive.',
        },
      },
      {
        id: 'culling_pawn',
        name: 'Culling Pawn',
        role: 'Pawn',
        materialValue: 1.0,
        whiteColor: 'white',
        blackColor: 'black',
        movementSummary:
          'Steps 1 square forward; captures 1 square diagonally forward. Promotes to Warden upon reaching the far edge of its file.',
        strengths: [
          'Crucial for space control and establishing board structure across the 88 playable squares.',
          'Promotes automatically to Warden (Nanami for White, Reggie for Black) upon reaching the file’s far edge.',
        ],
        weaknesses: [
          'No initial 2-square double step; no en passant.',
          'Single-step forward pace requires careful advance coordination.',
        ],
        commonMistakes: [
          'Forgetting that different files have different far-edge ranks due to the cross board geometry.',
          'Expecting promotion into Vanguard or Sovereign (promotion is strictly to Warden).',
        ],
        tactics: [
          'Wing Infiltration: March pawns along files L and R (far edge is Rank 7 for White, Rank 2 for Black) for rapid promotion.',
          'Pocket Advance: Advance pawns into the top/bottom arms (ranks 0 and 9) where defense is scarce.',
        ],
        specialScenario: {
          title: 'Far-Edge Warden Promotion',
          description:
            'When a pawn advances or captures into the far edge of its file (White: Rank 7 on L/R, Rank 8 on A/H, Rank 9 on B..G; Black mirrored at Ranks 2, 1, 0), it promotes automatically to a Warden.',
          tip: 'Use lateral wings L and R for the shortest distance to promotion (only 5 steps!).',
          limits: 'Automatic promotion. White promotes to Nanami; Black promotes to Reggie. Never promotes to Vanguard or Sovereign.',
        },
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
    <div className="min-h-screen w-full bg-white dark:bg-[#0a0e14] text-black dark:text-white flex flex-col font-sans select-text touch-pan-y overflow-y-auto">
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
                Chapter 1: Objective, 88-Square Cross Battlefield & Rebalanced Rules
              </div>

              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                Welcome to the Culling Game
              </h2>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-300 font-bold leading-relaxed">
                The Culling Game is an authoritative, 100% deterministic chess battleground played on an
                88-square cross-shaped board. Both armies are exact 180° rotational mirror twins with
                identical role laws, strict check and checkmate rules from Move 1, and balanced tactical techniques.
              </p>

              {/* Mirror-Twin Table */}
              <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[3px_3px_0px_#000]">
                <h3 className="text-xs font-black uppercase text-amber-500 mb-2 flex items-center gap-1.5">
                  <Swords className="w-4 h-4" />
                  Symmetrical Mirror-Twin Army Roles
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono font-bold">
                  <div className="p-2 bg-white dark:bg-[#0f172a] border border-black dark:border-white">
                    <span className="text-amber-500 block uppercase font-black">Sovereign (V: 99)</span>
                    <span>Gojo ⚔ Sukuna</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#0f172a] border border-black dark:border-white">
                    <span className="text-amber-500 block uppercase font-black">Vanguard (V: 8.0)</span>
                    <span>Yuji ⚔ Kenjaku</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#0f172a] border border-black dark:border-white">
                    <span className="text-amber-500 block uppercase font-black">Artillery (V: 4.0)</span>
                    <span>Mechamaru ⚔ Uraume</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#0f172a] border border-black dark:border-white">
                    <span className="text-amber-500 block uppercase font-black">Bulwark (V: 3.5)</span>
                    <span>Panda ⚔ Yorozu</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#0f172a] border border-black dark:border-white">
                    <span className="text-amber-500 block uppercase font-black">Warden (V: 4.5)</span>
                    <span>Nanami ⚔ Reggie</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#0f172a] border border-black dark:border-white">
                    <span className="text-amber-500 block uppercase font-black">Skirmisher (V: 3.5)</span>
                    <span>Maki ⚔ Naoya</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#0f172a] border border-black dark:border-white">
                    <span className="text-amber-500 block uppercase font-black">Rusher (V: 3.5)</span>
                    <span>Hakari ⚔ Kurourushi</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#0f172a] border border-black dark:border-white">
                    <span className="text-amber-500 block uppercase font-black">Pawn (V: 1.0)</span>
                    <span>Frontline Infantry</span>
                  </div>
                </div>
              </div>

              {/* Quick-Reference Table */}
              <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[3px_3px_0px_#000]">
                <h3 className="text-xs font-black uppercase text-amber-500 mb-2 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Quick-Reference Mobility & Ability Table
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono font-bold">
                    <thead>
                      <tr className="border-b border-black dark:border-white text-neutral-500 uppercase">
                        <th className="py-1">Role</th>
                        <th className="py-1">Mobility / Reach</th>
                        <th className="py-1">Special Technique</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10 dark:divide-white/10 text-neutral-700 dark:text-slate-300">
                      <tr>
                        <td className="py-1.5 font-black text-amber-500">Sovereign</td>
                        <td className="py-1.5">8 directions (1 step)</td>
                        <td className="py-1.5">Domain Step (2-step jump to safe empty cell, once/game)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-black text-amber-500">Vanguard</td>
                        <td className="py-1.5">Up to 24 steps (up to 3 in 8 dirs, no leap)</td>
                        <td className="py-1.5">Black Flash (distance-2 capture strikes in place)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-black text-amber-500">Artillery</td>
                        <td className="py-1.5">8 steps (1 step in 8 dirs)</td>
                        <td className="py-1.5">8 Ranged Strikes (distance-2 strike-in-place if middle empty)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-black text-amber-500">Bulwark</td>
                        <td className="py-1.5">8 Knight L-jumps (leaps freely)</td>
                        <td className="py-1.5">Shell (absorbs 1st attack completely; attacker stays)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-black text-amber-500">Warden</td>
                        <td className="py-1.5">12 steps (up to 3 in 4 cardinal dirs)</td>
                        <td className="py-1.5">Ratio Field (adjacent enemies restricted to 1 step max)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-black text-amber-500">Skirmisher</td>
                        <td className="py-1.5">12 moves (8 steps + 4 orthogonal 2-hops)</td>
                        <td className="py-1.5">Heavenly Restriction (immune to Warden Ratio Field)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-black text-amber-500">Rusher</td>
                        <td className="py-1.5">12 moves (8 diag steps + 4 ortho steps)</td>
                        <td className="py-1.5">Jackpot (capture grants 1 extra non-capturing safe step)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-black text-amber-500">Pawn</td>
                        <td className="py-1.5">1 forward step; 1 diagonal capture</td>
                        <td className="py-1.5">Far-edge automatic promotion to Warden (Nanami/Reggie)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Core Laws Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
                  <h3 className="text-xs font-black uppercase text-amber-500 mb-1 flex items-center gap-1.5">
                    <Swords className="w-4 h-4" />
                    Win & Draw Conditions
                  </h3>
                  <ul className="text-xs text-neutral-600 dark:text-slate-300 font-bold space-y-1.5 list-disc list-inside">
                    <li>
                      <strong>Checkmate:</strong> Trap the enemy Sovereign with no legal escape or interposition.
                    </li>
                    <li>
                      <strong>Suppression Loss:</strong> If a player has zero legal moves on their turn, they lose immediately (no stalemate draw).
                    </li>
                    <li>
                      <strong>Draw by Repetition:</strong> Threefold repetition of the same board position.
                    </li>
                    <li>
                      <strong>30-Move Draw:</strong> 30 consecutive full moves (60 plies) without a capture or pawn advance.
                    </li>
                    <li>
                      <strong>Clock Timeout:</strong> Depleting match time results in an immediate loss.
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
                  <h3 className="text-xs font-black uppercase text-amber-500 mb-1 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Universal Leaping & Movement Laws
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-slate-300 font-bold leading-relaxed">
                    <strong>Only Bulwark and Skirmisher may leap over pieces in normal play!</strong> All other sliding pieces
                    (Vanguard, Artillery, Warden, Rusher, Pawn) stop at the first piece (friend or foe) and at any void cell.
                    Check applies strictly from Move 1.
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
                    The four outer 2x2 corners are non-playable VOID space.
                  </p>
                </div>

                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
                  <h3 className="text-xs font-black uppercase text-amber-500 mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Far-Edge Pawn Promotion
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-slate-300 font-bold leading-relaxed">
                    When a pawn reaches the far edge of its file (White: Rank 7 on L/R, Rank 8 on A/H, Rank 9 on B..G;
                    Black mirrored at Ranks 2, 1, 0), it automatically promotes into a Warden (Nanami for White, Reggie for Black).
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
                    The Opening — Classical Development & Sovereign Security
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-slate-300 font-bold leading-relaxed mb-2">
                    Check applies from Move 1. Do not rush your Sovereign into the open!
                  </p>
                  <ul className="text-xs text-neutral-600 dark:text-slate-300 font-bold space-y-1 list-disc list-inside">
                    <li>Push the D2 and E2 pawns forward to liberate your Vanguard and Warden diagonals.</li>
                    <li>Develop Bulwarks (Panda / Yorozu) into the center; their Shell absorbs early hostile threats.</li>
                    <li>
                      Hop Skirmishers (Maki / Naoya) over your pawn chain to contest the central files (D4, E4).
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[3px_3px_0px_#000]">
                  <h3 className="text-sm font-black uppercase text-amber-500 mb-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-black text-amber-400 text-[10px] font-mono">PHASE 2</span>
                    The Midgame — Tactical Combinations & Zone Suppression
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-slate-300 font-bold leading-relaxed mb-2">
                    Leverage asymmetric strike-in-place techniques and restriction fields:
                  </p>
                  <ul className="text-xs text-neutral-600 dark:text-slate-300 font-bold space-y-1 list-disc list-inside">
                    <li>
                      Position your Vanguard for Black Flash strikes at distance 2, eliminating enemy pieces without giving up position.
                    </li>
                    <li>
                      Advance your Warden into close contact with the enemy Vanguard to restrict its movement to 1 square.
                    </li>
                    <li>
                      Use Artillery to snipe enemy pieces across clear ranks, and trigger Rusher Jackpot to hit-and-run safely.
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white shadow-[3px_3px_0px_#000]">
                  <h3 className="text-sm font-black uppercase text-amber-500 mb-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-black text-amber-400 text-[10px] font-mono">PHASE 3</span>
                    The Endgame — Wing Pawn Promotion & Sovereign Duels
                  </h3>
                  <ul className="text-xs text-neutral-600 dark:text-slate-300 font-bold space-y-1 list-disc list-inside">
                    <li>
                      March pawns through files L and R (only 5 steps to reach the far edge Rank 7 for White, Rank 2 for Black) for rapid Warden promotion.
                    </li>
                    <li>
                      Hold Domain Step for late-game Sovereign escapes against mating nets. Remember: Domain Step cannot be used while in check, so deploy it before check is delivered!
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
