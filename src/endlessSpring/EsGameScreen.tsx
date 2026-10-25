import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, BookOpen, RotateCcw, Sparkles, MoveRight, ShieldAlert } from 'lucide-react';
import {
  EsGameId,
  EsGameState,
  EsMove,
  EsPiece,
  EsPosition,
} from './EsTypes';
import {
  esApplyMove,
  esChebyshevDistance,
  esGetPieceAt,
  esIsPlayableSquare,
  esIsSamePos,
} from './EsRules';
import {
  esApplyEndOfRoundEvents,
  esCheckObjectives,
  esCreateInitialGameState,
} from './EsEvents';
import { esGetBestBotMove } from './EsBotBrain';
import { esSaveGameState } from './EsSaveStore';
import { esAudio } from './EsAudio';
import { EsBoardView } from './EsBoardView';
import { EsBoardDecor } from './EsBoardDecor';
import { EsHud } from './EsHud';
import { EsRulesSheet } from './EsRulesSheet';
import { EsEndModal } from './EsEndModal';
import { ES_GAME_METADATA } from './EsConfig';

export interface EsGameScreenProps {
  initialState: EsGameState;
  onExit: () => void;
}

export const EsGameScreen: React.FC<EsGameScreenProps> = ({
  initialState,
  onExit,
}) => {
  const [gameState, setGameState] = useState<EsGameState>(initialState);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<EsPiece | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [specialMode, setSpecialMode] = useState<'imagine' | 'lift' | 'part_crowd' | null>(null);

  // Auto-save on every state change
  useEffect(() => {
    esSaveGameState(gameState);
  }, [gameState]);

  // Turn management: Check if Bot turn
  const runBotTurn = useCallback((currentState: EsGameState) => {
    if (currentState.outcome !== 'ongoing') return;
    if (currentState.turn !== 'B') return;

    setIsBotThinking(true);

    setTimeout(() => {
      // Game 4 Act 1: Double move for Banded
      const isDoubleMove = currentState.gameId === 4 && currentState.stageOrAct === 1;

      let afterBMove = currentState;
      const firstBotMove = esGetBestBotMove(afterBMove, 2);

      if (firstBotMove) {
        afterBMove = esApplyMove(afterBMove, firstBotMove);
        if (firstBotMove.capturedPieceId) {
          esAudio.playCapture();
        } else {
          esAudio.playMove();
        }

        // Second move if double move allowed and game still ongoing
        if (isDoubleMove) {
          // Find legal move with a DIFFERENT banded piece
          const secondBotMove = esGetBestBotMove(afterBMove, 1);
          if (secondBotMove && secondBotMove.pieceId !== firstBotMove.pieceId) {
            afterBMove = esApplyMove(afterBMove, secondBotMove);
            if (secondBotMove.capturedPieceId) {
              esAudio.playCapture();
            } else {
              esAudio.playMove();
            }
          }
        }
      }

      // Check for Questioning in Game 2
      if (afterBMove.gameId === 2) {
        const investigator = afterBMove.pieces.find((p) => p.type === 'investigator');
        const aj = afterBMove.pieces.find((p) => p.side === 'A' && p.type === 'dreamer');

        if (investigator) {
          // (a) Every echo within 1 square of investigator is destroyed
          const remainingPieces = afterBMove.pieces.filter((p) => {
            if (p.type === 'echo' && !p.isRealFootman && esChebyshevDistance(p.pos, investigator.pos) <= 1) {
              return false;
            }
            return true;
          });

          // (b) If investigator within 1 square of AJ, question count +1
          let newQuestions = afterBMove.questionsCount;
          if (aj && esChebyshevDistance(investigator.pos, aj.pos) <= 1) {
            newQuestions += 1;
          }

          afterBMove = {
            ...afterBMove,
            pieces: remainingPieces,
            questionsCount: newQuestions,
          };
        }
      }

      // End of round events and round increment
      const afterRoundState = esApplyEndOfRoundEvents(afterBMove);
      esAudio.playEvent();

      if (afterRoundState.outcome === 'win') {
        esAudio.playVictory();
      }

      setGameState(afterRoundState);
      setIsBotThinking(false);
    }, 450);
  }, []);

  // Player Half-Move Handler
  const handlePlayerMove = (move: EsMove) => {
    if (gameState.outcome !== 'ongoing') return;
    if (gameState.turn !== 'A') return;

    const nextState = esApplyMove(gameState, move);
    if (move.capturedPieceId) {
      esAudio.playCapture();
    } else {
      esAudio.playMove();
    }

    // Kin reveal trigger in Game 5 Phase 1: when any piece ends move next to kin in O4
    let stateWithReveals = nextState;
    if (nextState.gameId === 5 && nextState.stageOrAct === 1) {
      const kinPieces = nextState.pieces.filter((p) => p.type === 'kin');
      let piecesUpdated = [...nextState.pieces];
      let revealedAny = false;

      for (const kin of kinPieces) {
        const dist = Math.abs(kin.pos.x - move.to.x) + Math.abs(kin.pos.y - move.to.y);
        if (dist === 1) {
          // Reveal kin!
          revealedAny = true;
          const isAlly = nextState.kinAllies.includes(kin.id);
          piecesUpdated = piecesUpdated.map((p) => {
            if (p.id === kin.id) {
              return isAlly
                ? { ...p, type: 'footman', side: 'A' as const, kinRevealed: true }
                : { ...p, type: 'banded', side: 'B' as const, kinRevealed: true };
            }
            return p;
          });
        }
      }

      if (revealedAny) {
        stateWithReveals = { ...nextState, pieces: piecesUpdated };
        esAudio.playEvent();
      }
    }

    // Check intermediate objectives after player move
    const check = esCheckObjectives(stateWithReveals);
    if (check.outcome !== 'ongoing') {
      const finalState = {
        ...stateWithReveals,
        outcome: check.outcome,
        outcomeReason: check.reason,
        outcomeTextVariant: check.variant,
      };
      if (check.outcome === 'win') esAudio.playVictory();
      setGameState(finalState);
      return;
    }

    // Pass turn to B
    const bTurnState: EsGameState = {
      ...stateWithReveals,
      turn: 'B',
      updatedAt: Date.now(),
    };

    setGameState(bTurnState);
    runBotTurn(bTurnState);
  };

  // Special Action: Imagine (Game 2)
  const handleImagineAction = (targetPos: EsPosition) => {
    if (gameState.gameId !== 2 || gameState.imagineCooldown > 0) return;
    const aj = gameState.pieces.find((p) => p.side === 'A' && p.type === 'dreamer');
    if (!aj) return;

    const existingEchoes = gameState.pieces.filter((p) => p.type === 'echo' && !p.isRealFootman);
    if (existingEchoes.length >= 3) return;

    if (esChebyshevDistance(aj.pos, targetPos) > 2) return;
    if (esGetPieceAt(gameState.pieces, targetPos)) return;
    if (!esIsPlayableSquare(gameState.board, targetPos)) return;

    const newEcho: EsPiece = {
      id: `es_echo_${Date.now()}`,
      type: 'echo',
      side: 'A',
      pos: targetPos,
    };

    const nextState: EsGameState = {
      ...gameState,
      pieces: [...gameState.pieces, newEcho],
      imagineCooldown: 3,
      turn: 'B',
    };

    setSpecialMode(null);
    esAudio.playEvent();
    setGameState(nextState);
    runBotTurn(nextState);
  };

  // Special Action: Lift (Game 3 Stage 2)
  const handleLiftAction = () => {
    if (gameState.gameId !== 3 || gameState.stageOrAct !== 2 || gameState.liftCooldown > 0) return;
    const rescuer = gameState.pieces.find((p) => p.side === 'A' && p.type === 'rescuer');
    const boat = gameState.pieces.find((p) => p.type === 'boat');
    if (!rescuer || !boat) return;

    const sameCol = rescuer.pos.x === boat.pos.x;
    const sameRow = rescuer.pos.y === boat.pos.y;
    if (!sameCol && !sameRow) return;

    const dist = esChebyshevDistance(rescuer.pos, boat.pos);
    if (dist > 3) return;

    // Verify squares between are empty
    const stepX = Math.sign(boat.pos.x - rescuer.pos.x);
    const stepY = Math.sign(boat.pos.y - rescuer.pos.y);
    let curr = { x: rescuer.pos.x + stepX, y: rescuer.pos.y + stepY };
    let blocked = false;
    while (!esIsSamePos(curr, boat.pos)) {
      if (esGetPieceAt(gameState.pieces, curr)) {
        blocked = true;
        break;
      }
      curr = { x: curr.x + stepX, y: curr.y + stepY };
    }
    if (blocked) return;

    // Swap places!
    const swappedPieces = gameState.pieces.map((p) => {
      if (p.id === rescuer.id) return { ...p, pos: boat.pos };
      if (p.id === boat.id) return { ...p, pos: rescuer.pos };
      return p;
    });

    const nextState: EsGameState = {
      ...gameState,
      pieces: swappedPieces,
      liftCooldown: 3,
      turn: 'B',
    };

    esAudio.playEvent();
    setGameState(nextState);
    runBotTurn(nextState);
  };

  // Special Action: Part the Crowd (Game 4 Act 1)
  const handlePartCrowdAction = (targetToken: EsPosition) => {
    if (gameState.gameId !== 4 || gameState.stageOrAct !== 1) return;
    const ajx = gameState.pieces.find((p) => p.side === 'A' && p.type === 'guide');
    if (!ajx) return;

    if (esChebyshevDistance(ajx.pos, targetToken) !== 1) return;

    // Swap AJX with token
    const newTokens = gameState.crowdTokens.map((t) => (esIsSamePos(t, targetToken) ? ajx.pos : t));
    const newPieces = gameState.pieces.map((p) => (p.id === ajx.id ? { ...p, pos: targetToken } : p));

    const nextState: EsGameState = {
      ...gameState,
      pieces: newPieces,
      crowdTokens: newTokens,
      turn: 'B',
    };

    setSpecialMode(null);
    esAudio.playEvent();
    setGameState(nextState);
    runBotTurn(nextState);
  };

  const restartGame = () => {
    const fresh = esCreateInitialGameState(gameState.gameId, 1);
    setGameState(fresh);
  };

  const meta = ES_GAME_METADATA[gameState.gameId];

  return (
    <div className="fixed inset-0 h-[100dvh] flex flex-col overflow-hidden bg-black text-white select-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Top Bar (Height: 48px) */}
      <header className="h-12 px-3 sm:px-4 border-b border-white/10 bg-zinc-950 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            aria-label="Exit game"
            className="p-1.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="truncate">
            <h2 className="text-xs sm:text-sm font-black uppercase text-amber-300 truncate">
              {meta.title}
            </h2>
            <span className="text-[10px] text-neutral-400 block truncate font-mono">
              {meta.chapterRange} · {meta.arcName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isBotThinking && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[11px] font-mono rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Opponent</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            aria-label="View rules and legend"
            className="h-8 px-2.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Rules</span>
          </button>
        </div>
      </header>

      {/* Real-Time HUD */}
      <EsHud state={gameState} />

      {/* Main Board Stage (flex-1 min-h-0 min-w-0) */}
      <main className="flex-1 min-h-0 min-w-0 flex items-center justify-center relative overflow-hidden bg-[#090a0f]">
        {/* Left Side Themed Decor (hidden md:block) */}
        <EsBoardDecor gameId={gameState.gameId} stageOrAct={gameState.stageOrAct} side="left" />

        {/* Board View */}
        <div className="flex-1 h-full min-h-0 min-w-0 flex items-center justify-center">
          <EsBoardView
            state={gameState}
            onMove={handlePlayerMove}
            onSelectPiece={setSelectedPiece}
          />
        </div>

        {/* Right Side Themed Decor (hidden md:block) */}
        <EsBoardDecor gameId={gameState.gameId} stageOrAct={gameState.stageOrAct} side="right" />
      </main>

      {/* Bottom Action Bar (Min 52px height, touch targets >= 44px) */}
      <footer className="min-h-[52px] px-3 sm:px-4 py-1.5 border-t border-white/10 bg-zinc-950 flex items-center justify-between gap-2 shrink-0 overflow-x-auto no-scrollbar z-30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={restartGame}
            aria-label="Restart episode"
            className="h-10 px-3 rounded border border-white/15 hover:bg-white/10 text-neutral-300 text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>

        {/* Phase-Specific Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Game 2: Imagine Button */}
          {gameState.gameId === 2 && (
            <button
              type="button"
              disabled={gameState.imagineCooldown > 0 || gameState.turn !== 'A'}
              onClick={() => setSpecialMode(specialMode === 'imagine' ? null : 'imagine')}
              className={`h-10 px-3.5 rounded text-xs font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                specialMode === 'imagine'
                  ? 'bg-amber-400 text-black ring-2 ring-white'
                  : gameState.imagineCooldown > 0 || gameState.turn !== 'A'
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Imagine {gameState.imagineCooldown > 0 ? `(${gameState.imagineCooldown}r)` : ''}</span>
            </button>
          )}

          {/* Game 3 Stage 2: Lift Button */}
          {gameState.gameId === 3 && gameState.stageOrAct === 2 && (
            <button
              type="button"
              disabled={gameState.liftCooldown > 0 || gameState.turn !== 'A'}
              onClick={handleLiftAction}
              className={`h-10 px-3.5 rounded text-xs font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                gameState.liftCooldown > 0 || gameState.turn !== 'A'
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
              }`}
            >
              <MoveRight className="w-4 h-4 rotate-90" />
              <span>Lift {gameState.liftCooldown > 0 ? `(${gameState.liftCooldown}r)` : ''}</span>
            </button>
          )}

          {/* Game 4 Act 1: Part the Crowd Button */}
          {gameState.gameId === 4 && gameState.stageOrAct === 1 && (
            <button
              type="button"
              disabled={gameState.turn !== 'A'}
              onClick={() => setSpecialMode(specialMode === 'part_crowd' ? null : 'part_crowd')}
              className={`h-10 px-3.5 rounded text-xs font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                specialMode === 'part_crowd'
                  ? 'bg-rose-500 text-white ring-2 ring-white'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Part Crowd</span>
            </button>
          )}
        </div>
      </footer>

      {/* Rules Modal / Sheet */}
      <EsRulesSheet
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        gameId={gameState.gameId}
      />

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="w-full max-w-xs bg-zinc-950 border border-white/20 rounded-xl p-5 shadow-2xl text-center space-y-4">
            <h3 className="text-base font-bold text-white uppercase">
              Exit to Dashboard?
            </h3>
            <p className="text-xs text-neutral-400">
              Your exact game state is saved automatically and can be continued anytime.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 border border-white/20 rounded text-xs font-bold uppercase text-neutral-300 hover:bg-white/10 cursor-pointer"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={onExit}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 rounded text-xs font-black uppercase text-black cursor-pointer"
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Modal */}
      <EsEndModal
        isOpen={gameState.outcome !== 'ongoing'}
        gameId={gameState.gameId}
        outcome={gameState.outcome}
        outcomeReason={gameState.outcomeReason}
        outcomeVariant={gameState.outcomeTextVariant}
        onReplay={restartGame}
        onBackToSelect={onExit}
      />
    </div>
  );
};
