/**
 * InteractiveKataBoard.tsx - Interactive Board for Dojo Katas
 *
 * Runs Opening Dojo, Tactical Dojo, and Culling Dojo drills with step-by-step
 * move verification, dynamic error diagnostics from Sensei Gensei,
 * 2-strike golden pulsing guidance, opponent responses, and authentic
 * Culling Game cross-board + character piece integration.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { DojoLesson, MentorExpression, KataStep, TrainerId } from './types';
import type { Position, Piece, Move } from '../types/game';
import type {
  CullingMatchState,
  CullingPos,
  CullingBoard as CullingBoardType,
  CullingPieceColor,
  CullingSpecialAction,
} from '../types/cullingGame';
import { CULLING_ROSTER } from '../types/cullingGame';
import { getLegalMovesForSquare, applyMoveToBoard, cloneBoard } from '../game/engine';
import {
  createInitialCullingMatch,
  cloneCullingBoard,
  executeCullingMove,
} from '../game/cullingEngine';
import { ChessPiece } from '../components/ChessPiece';
import { CullingBoard } from '../components/CullingBoard';
import { sounds } from '../utils/audio';
import { CheckCircle2, AlertTriangle, Sparkles, ArrowRight, Check } from 'lucide-react';

interface CompletedStepModalData {
  stepNumber: number;
  totalSteps: number;
  notation: string;
  tacticalBreakdown: string;
  isFinal: boolean;
  nextIndex: number;
  completedStep: KataStep;
  triggerStepIndex: number;
}

interface InteractiveKataBoardProps {
  lesson: DojoLesson;
  onComplete: () => void;
  onReaction: (expression: MentorExpression, text: string) => void;
  onResetSignal?: number;
  maxBoardDimension?: number;
  onMoveMade?: () => void;
  onStepChange?: (stepIndex: number) => void;
  onNext?: () => void;
  trainerId?: TrainerId;
}

export const InteractiveKataBoard: React.FC<InteractiveKataBoardProps> = ({
  lesson,
  onComplete,
  onReaction,
  onResetSignal = 0,
  maxBoardDimension,
  onMoveMade,
  onStepChange,
  onNext,
  trainerId = 'thukuna',
}) => {
  const isCullingMode = lesson.tool === 'culling' || Boolean(lesson.cullingBoard);
  const isGatoru = trainerId === 'gatoru';

  // Standard Chess State
  const [board, setBoard] = useState<(Piece | null)[][]>(() =>
    lesson.initialBoard ? cloneBoard(lesson.initialBoard) : []
  );
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);

  // Culling Game State
  const [cullingMatch, setCullingMatch] = useState<CullingMatchState>(() => {
    const baseMatch = createInitialCullingMatch(
      `kata_${lesson.id}`,
      { userId: 'player', username: 'Pupil', displayName: 'Pupil' },
      { userId: 'kata_bot', username: 'Sensei', displayName: 'Sensei' }
    );
    if (lesson.cullingBoard) {
      baseMatch.board = cloneCullingBoard(lesson.cullingBoard);
    }
    if (lesson.cullingPlayerColor) {
      baseMatch.turn = lesson.cullingPlayerColor;
    }
    return baseMatch;
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);
  const [pendingModalData, setPendingModalData] = useState<CompletedStepModalData | null>(null);

  // Use ref for onStepChange callback to avoid effect re-execution
  const onStepChangeRef = useRef(onStepChange);
  useEffect(() => {
    onStepChangeRef.current = onStepChange;
  }, [onStepChange]);

  // Notify parent of step changes for dynamic multi-step hints
  useEffect(() => {
    onStepChangeRef.current?.(currentStepIndex);
  }, [currentStepIndex]);

  // Reset state ONLY when lesson.id or resetSignal triggers
  useEffect(() => {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      import('./validateLessons').then(({ validateDojoKataLesson }) => {
        const valFailures: any[] = [];
        validateDojoKataLesson(lesson, valFailures);
        if (valFailures.length > 0) {
          console.error(`[HASHIRA DEV VALIDATION WARNING] Lesson "${lesson.id}" (${lesson.title}) validation issues:`, valFailures);
        }
      }).catch(() => {});
    }

    if (lesson.initialBoard) {
      setBoard(cloneBoard(lesson.initialBoard));
    }
    const freshCulling = createInitialCullingMatch(
      `kata_${lesson.id}_${Date.now()}`,
      { userId: 'player', username: 'Pupil', displayName: 'Pupil' },
      { userId: 'kata_bot', username: 'Sensei', displayName: 'Sensei' }
    );
    if (lesson.cullingBoard) {
      freshCulling.board = cloneCullingBoard(lesson.cullingBoard);
    }
    if (lesson.cullingPlayerColor) {
      freshCulling.turn = lesson.cullingPlayerColor;
    }
    setCullingMatch(freshCulling);
    setSelectedSquare(null);
    setCurrentStepIndex(0);
    setIsFinished(false);
    setLastMove(null);
    setConsecutiveMistakes(0);
    setPendingModalData(null);
    onStepChangeRef.current?.(0);
  }, [lesson.id, onResetSignal]);

  const expectedStep: KataStep | undefined = lesson.correctSteps[currentStepIndex];

  // Helper to diagnose specific mistake and generate instructive feedback
  const generateMistakeCritique = useCallback(
    (attemptedFrom: Position, attemptedTo: Position, movedPieceName: string): string => {
      if (!expectedStep) return lesson.mentorFailure;

      // 1. Check if custom mistakeExplanation key exists
      const directKey = `${attemptedFrom.x},${attemptedFrom.y}->${attemptedTo.x},${attemptedTo.y}`;
      if (lesson.mistakeExplanations?.[directKey]) {
        return lesson.mistakeExplanations[directKey];
      }
      const toKey = `${attemptedTo.x},${attemptedTo.y}`;
      if (lesson.mistakeExplanations?.[toKey]) {
        return lesson.mistakeExplanations[toKey];
      }

      // 2. Wrong piece moved entirely
      if (attemptedFrom.x !== expectedStep.from.x || attemptedFrom.y !== expectedStep.from.y) {
        let expectedPieceLabel = 'the designated martial unit';
        if (isCullingMode) {
          const expectedPiece = cullingMatch.board[expectedStep.from.y]?.[expectedStep.from.x];
          if (expectedPiece && CULLING_ROSTER[expectedPiece.type]) {
            expectedPieceLabel = CULLING_ROSTER[expectedPiece.type].name;
          }
        } else {
          const expectedPiece = board[expectedStep.from.y]?.[expectedStep.from.x];
          if (expectedPiece) {
            expectedPieceLabel = expectedPiece.type.toUpperCase();
          }
        }
        return `Discipline, pupil! You moved your ${movedPieceName} instead of deploying ${expectedPieceLabel}! Return to your stance!`;
      }

      // 3. Right piece, but wrong destination square
      if (isCullingMode) {
        return `Misguided cursed discharge! Your ${movedPieceName} targeted the wrong coordinate. Keep awareness of barrier lines and tactical pins!`;
      }

      return `Inaccurate square! Moving your ${movedPieceName} there surrenders tactical tempo. Strike with true intention!`;
    },
    [expectedStep, lesson, isCullingMode, cullingMatch.board, board]
  );

  // Standard Chess legal moves
  const legalMovesForSelected = useMemo(() => {
    if (isCullingMode || !selectedSquare || isFinished) return [];
    return getLegalMovesForSquare(board, selectedSquare);
  }, [isCullingMode, board, selectedSquare, isFinished]);

  // Advance step after pupil reads Tactical Breakdown Modal
  const handleContinueStep = useCallback(() => {
    if (!pendingModalData) return;
    const { isFinal, nextIndex, triggerStepIndex, completedStep } = pendingModalData;
    setPendingModalData(null);

    if (isFinal) {
      setIsFinished(true);
      sounds.playGameOver();
      onReaction('approving', lesson.mentorSuccess);
      onComplete();
      return;
    }

    // Advance to next step
    setCurrentStepIndex(nextIndex);
    onStepChangeRef.current?.(nextIndex);

    // Provide feedback for the transition
    if (completedStep.mentorReaction && completedStep.mentorCommentary) {
      onReaction(completedStep.mentorReaction, completedStep.mentorCommentary);
    } else {
      const nextStep = lesson.correctSteps[nextIndex];
      if (nextStep?.mentorPrompt) {
        onReaction('stern', nextStep.mentorPrompt);
      }
    }

    // Scripted opponent response for the completed step
    const oppResponse = lesson.opponentResponses?.find((r) => r.triggerStepIndex === triggerStepIndex);
    if (oppResponse) {
      setTimeout(() => {
        if (isCullingMode) {
          setCullingMatch((prev) => {
            const res = executeCullingMove(prev, oppResponse.from, oppResponse.to, 'move');
            if (res.success) {
              setLastMove({ from: oppResponse.from, to: oppResponse.to });
              sounds.playMove();
              return res.state;
            }
            return prev;
          });
        } else {
          setBoard((prev) => {
            const oppPiece = prev[oppResponse.from.y]?.[oppResponse.from.x];
            if (!oppPiece) return prev;
            const oppMove: Move = {
              from: oppResponse.from,
              to: oppResponse.to,
              piece: oppPiece,
              captured: prev[oppResponse.to.y]?.[oppResponse.to.x] || undefined,
              timestamp: Date.now(),
            };
            const updated = applyMoveToBoard(prev, oppMove);
            setLastMove({ from: oppResponse.from, to: oppResponse.to });
            if (oppMove.captured) sounds.playCapture();
            else sounds.playMove();
            return updated;
          });
        }

        if (oppResponse.commentary) {
          onReaction('analytical', oppResponse.commentary);
        } else {
          const nextStep = lesson.correctSteps[nextIndex];
          if (nextStep?.mentorPrompt) {
            onReaction('stern', nextStep.mentorPrompt);
          }
        }
      }, 350);
    }
  }, [pendingModalData, isCullingMode, lesson, onComplete, onReaction]);

  // Standard Chess square click
  const handleStandardSquareClick = (x: number, y: number) => {
    if (isFinished || pendingModalData) return;
    const clickedPiece = board[y]?.[x];

    // Case 1: Selecting player's own piece
    if (clickedPiece && clickedPiece.color === lesson.playerColor) {
      if (selectedSquare && selectedSquare.x === x && selectedSquare.y === y) {
        setSelectedSquare(null);
      } else {
        setSelectedSquare({ x, y });
        sounds.playSelect();
      }
      return;
    }

    // Case 2: Attempting move with selected piece
    if (selectedSquare) {
      const isLegal = legalMovesForSelected.some((m) => m.to.x === x && m.to.y === y);
      if (!isLegal) {
        setSelectedSquare(null);
        return;
      }

      const movingPiece = board[selectedSquare.y][selectedSquare.x]!;
      const isStepMatch =
        expectedStep &&
        expectedStep.from.x === selectedSquare.x &&
        expectedStep.from.y === selectedSquare.y &&
        expectedStep.to.x === x &&
        expectedStep.to.y === y;

      if (!isStepMatch) {
        const nextMistakes = consecutiveMistakes + 1;
        setConsecutiveMistakes(nextMistakes);
        const critique = generateMistakeCritique(selectedSquare, { x, y }, movingPiece.type.toUpperCase());
        sounds.playCheck();
        setSelectedSquare(null);

        if (nextMistakes >= 2) {
          onReaction('scowl', `${critique} (Sensei points with his cane: heed the golden guide!)`);
        } else {
          onReaction('scowl', critique);
        }
        return;
      }

      // Valid correct step executed!
      setConsecutiveMistakes(0);
      const targetPiece = board[y][x];
      const moveObj: Move = {
        from: selectedSquare,
        to: { x, y },
        piece: movingPiece,
        captured: targetPiece || undefined,
        timestamp: Date.now(),
      };

      const newBoard = applyMoveToBoard(board, moveObj);
      setBoard(newBoard);
      setLastMove({ from: selectedSquare, to: { x, y } });
      setSelectedSquare(null);

      // Dismiss temporary hint as move is made
      onMoveMade?.();

      if (targetPiece) sounds.playCapture();
      else sounds.playMove();

      const nextIndex = currentStepIndex + 1;
      const isFinal = nextIndex >= lesson.correctSteps.length;
      const notation =
        expectedStep.notation ||
        `${String.fromCharCode(97 + selectedSquare.x)}${selectedSquare.y + 1} → ${String.fromCharCode(97 + x)}${y + 1}`;
      const tacticalBreakdown =
        expectedStep.tacticalBreakdown ||
        expectedStep.mentorCommentary ||
        'Decisive tactical precision executed. Maintain positional control and tempo.';

      setPendingModalData({
        stepNumber: currentStepIndex + 1,
        totalSteps: lesson.correctSteps.length,
        notation,
        tacticalBreakdown,
        isFinal,
        nextIndex,
        completedStep: expectedStep,
        triggerStepIndex: currentStepIndex,
      });
    }
  };

  // Culling Game move execution handler
  const handleCullingMove = (from: CullingPos, to: CullingPos, actionType?: string) => {
    if (isFinished || pendingModalData) return;
    const movingPiece = cullingMatch.board[from.y]?.[from.x];
    if (!movingPiece) return;

    const charInfo = CULLING_ROSTER[movingPiece.type];
    const pieceDisplayName = charInfo ? charInfo.name : movingPiece.type;

    const isStepMatch =
      expectedStep &&
      expectedStep.from.x === from.x &&
      expectedStep.from.y === from.y &&
      expectedStep.to.x === to.x &&
      expectedStep.to.y === to.y;

    if (!isStepMatch) {
      const nextMistakes = consecutiveMistakes + 1;
      setConsecutiveMistakes(nextMistakes);
      const critique = generateMistakeCritique(from, to, pieceDisplayName);
      sounds.playCheck();

      if (nextMistakes >= 2) {
        onReaction('scowl', `${critique} (Look at the pulsing golden barrier guide!)`);
      } else {
        onReaction('scowl', critique);
      }
      return;
    }

    // Step match verified! Apply move authoritatively via Culling Engine
    setConsecutiveMistakes(0);
    const chosenAction = (expectedStep.cullingActionType || actionType || 'move') as CullingSpecialAction;
    const execResult = executeCullingMove(cullingMatch, from, to, chosenAction);

    if (!execResult.success) {
      // Fallback in case state rejected action
      onReaction('scowl', execResult.error || 'The cursed barrier repels this action.');
      return;
    }

    setCullingMatch(execResult.state);
    setLastMove({ from, to });
    sounds.playMove();

    // Dismiss temporary hint as move is made
    onMoveMade?.();

    const nextIndex = currentStepIndex + 1;
    const isFinal = nextIndex >= lesson.correctSteps.length;
    const notation = expectedStep.notation || `${pieceDisplayName} strike`;
    const tacticalBreakdown =
      expectedStep.tacticalBreakdown ||
      expectedStep.mentorCommentary ||
      'Flawless cursed energy allocation. Domain control expanded and enemy maneuver denied.';

    setPendingModalData({
      stepNumber: currentStepIndex + 1,
      totalSteps: lesson.correctSteps.length,
      notation,
      tacticalBreakdown,
      isFinal,
      nextIndex,
      completedStep: expectedStep,
      triggerStepIndex: currentStepIndex,
    });
  };

  const showGoldenGuide = consecutiveMistakes >= 2 && Boolean(expectedStep);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-full select-none">
      {/* Main Board View: Either Authentic Culling Cross Board or Standard 8x8 (Zero banner shifts above) */}
      {isCullingMode ? (
        <div className="relative flex flex-col items-center justify-center shrink-0 w-full max-w-[100vw]">
          <CullingBoard
            match={cullingMatch}
            myColor={lesson.cullingPlayerColor || 'white'}
            isInteractive={!isFinished}
            onMove={handleCullingMove}
            pulseGuide={showGoldenGuide && expectedStep ? { from: expectedStep.from, to: expectedStep.to } : undefined}
            maxDimension={maxBoardDimension ? Math.floor(maxBoardDimension) : undefined}
          />

          {isFinished && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-3 z-40">
              <div className="w-10 h-10 bg-amber-400 text-black border-2 border-black flex items-center justify-center mb-1.5 shadow-[2px_2px_0px_#000]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className={`text-base sm:text-lg font-black uppercase ${isGatoru ? 'text-sky-400' : 'text-amber-400'} tracking-wider`}>
                Culling Kata Cleared
              </h4>
              <p className="text-[11px] sm:text-xs font-bold text-white max-w-xs mt-0.5 mb-2">
                {isGatoru
                  ? 'Domain Mastery achieved. Your cursed tactics meet Gatoru Luchha\'s absolute void standard.'
                  : 'Domain Mastery achieved. Your cursed tactics meet Thukuna\'s high standard.'}
              </p>
              <button
                onClick={() => {
                  setIsFinished(false);
                  if (onNext) onNext();
                }}
                className={`px-3.5 py-1.5 ${isGatoru ? 'bg-sky-400 hover:bg-sky-300' : 'bg-amber-400 hover:bg-amber-300'} text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer`}
              >
                Continue / Next Kata →
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Standard / Crafted 8x8 Board Container */
        <div
          style={maxBoardDimension ? { width: `${maxBoardDimension}px`, height: `${maxBoardDimension}px` } : undefined}
          className="relative board-edge-mobile border-0 md:border-4 border-black dark:border-white shadow-none md:shadow-[4px_4px_0px_#000000] dark:md:shadow-[4px_4px_0px_#ffffff] bg-black select-none w-full max-w-[100vw] md:w-[min(calc(100vw-16px),calc(100dvh-224px),520px)] md:h-[min(calc(100vw-16px),calc(100dvh-224px),520px)] lg:w-[min(calc(100dvh-140px),calc(100%-48px),760px)] lg:h-[min(calc(100dvh-140px),calc(100%-48px),760px)] aspect-square shrink-0"
        >
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full board-grid-mobile">
            {Array.from({ length: 8 }).map((_, rankIdx) => {
              const y = 7 - rankIdx;
              return Array.from({ length: 8 }).map((_, x) => {
                const isDark = (x + y) % 2 === 1;
                const piece = board[y] ? board[y][x] : null;
                const isSelected = selectedSquare?.x === x && selectedSquare?.y === y;
                const isLegalDest = legalMovesForSelected.some((m) => m.to.x === x && m.to.y === y);
                const isLastMoveFrom = lastMove?.from.x === x && lastMove?.from.y === y;
                const isLastMoveTo = lastMove?.to.x === x && lastMove?.to.y === y;

                const isGuidedFrom = showGoldenGuide && expectedStep?.from.x === x && expectedStep?.from.y === y;
                const isGuidedTo = showGoldenGuide && expectedStep?.to.x === x && expectedStep?.to.y === y;

                const showFileLabel = rankIdx === 7;
                const showRankLabel = x === 0;

                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleStandardSquareClick(x, y)}
                    className={`relative flex items-center justify-center cursor-pointer transition-colors duration-100 ${
                      isSelected
                        ? 'bg-amber-300 dark:bg-amber-600'
                        : isGuidedFrom
                        ? 'ring-3 ring-amber-400 bg-amber-400/40 animate-pulse z-30 shadow-[0_0_18px_#f59e0b]'
                        : isGuidedTo
                        ? 'ring-3 ring-amber-400 border-2 border-dashed border-amber-300 bg-amber-400/25 animate-pulse z-30 shadow-[0_0_18px_#f59e0b]'
                        : isLastMoveFrom || isLastMoveTo
                        ? isDark
                          ? 'bg-[#800d23]'
                          : 'bg-[#fde68a]'
                        : isDark
                        ? 'bg-[#BC1434]'
                        : 'bg-[#F2EFE4]'
                    }`}
                  >
                    {showRankLabel && (
                      <span className={`absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-black pointer-events-none ${
                        isDark ? 'text-rose-100/70' : 'text-neutral-800/70'
                      }`}>
                        {y + 1}
                      </span>
                    )}
                    {showFileLabel && (
                      <span className={`absolute bottom-0.5 right-1 text-[8px] sm:text-[9px] font-black pointer-events-none uppercase ${
                        isDark ? 'text-rose-100/70' : 'text-neutral-800/70'
                      }`}>
                        {String.fromCharCode(97 + x)}
                      </span>
                    )}

                    {piece && (
                      <div className="w-[85%] h-[85%] flex items-center justify-center drop-shadow-md">
                        <ChessPiece type={piece.type} color={piece.color} />
                      </div>
                    )}

                    {isLegalDest && (
                      <div
                        className={`absolute rounded-full pointer-events-none ${
                          piece
                            ? 'w-full h-full border-3 sm:border-4 border-amber-400/90 animate-pulse'
                            : 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                        }`}
                      />
                    )}
                  </div>
                );
              });
            })}
          </div>

          {isFinished && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-3 z-20">
              <div className="w-10 h-10 bg-amber-400 text-black border-2 border-black flex items-center justify-center mb-1.5 shadow-[2px_2px_0px_#000]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className={`text-base sm:text-lg font-black uppercase ${isGatoru ? 'text-sky-400' : 'text-amber-400'} tracking-wider`}>
                Kata Cleared
              </h4>
              <p className="text-[11px] sm:text-xs font-bold text-white max-w-xs mt-0.5 mb-2">
                {isGatoru
                  ? 'Gatoru Luchha nods in approval. Perfect void calculation achieved.'
                  : 'Thukuna nods in approval. Your discipline honors the Dojo.'}
              </p>
              <button
                onClick={() => {
                  setIsFinished(false);
                  if (onNext) onNext();
                }}
                className={`px-3.5 py-1.5 ${isGatoru ? 'bg-sky-400 hover:bg-sky-300' : 'bg-amber-400 hover:bg-amber-300'} text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer`}
              >
                Continue / Next Kata →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tier 3: Compact 48px–50px Kata Status Bar */}
      <div className="w-full h-12 min-h-[48px] max-h-[48px] mt-1.5 px-0.5 sm:px-1 shrink-0 flex items-stretch">
        <div className="w-full h-full bg-white dark:bg-[#0c0c0e] border-2 md:border-3 border-black dark:border-white px-2.5 py-1.5 shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff] flex items-center justify-between gap-2 overflow-hidden">
          {showGoldenGuide ? (
            <div className="flex items-center gap-2 text-black dark:text-white min-w-0 flex-1">
              <div className="w-7 h-7 bg-amber-400 text-black border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <span className="text-xs font-black uppercase text-amber-500 truncate shrink-0">
                  Golden Guide Active
                </span>
                <span className="text-[10px] text-neutral-400 font-bold shrink-0">·</span>
                <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-300 truncate">
                  Move gold piece to dashed square
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-black dark:text-white min-w-0 flex-1">
              <div
                className={`w-7 h-7 ${
                  isGatoru ? 'bg-sky-400' : 'bg-amber-400'
                } text-black border-2 border-black flex items-center justify-center font-black text-[11px] shrink-0 shadow-[1px_1px_0px_#000]`}
              >
                #{Math.min(currentStepIndex + 1, lesson.correctSteps.length)}
              </div>
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <span className="text-xs font-black uppercase truncate shrink-0">
                  {expectedStep?.notation || lesson.title}
                </span>
                <span className="text-[10px] text-neutral-400 font-bold shrink-0">·</span>
                <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 truncate">
                  Step {Math.min(currentStepIndex + 1, lesson.correctSteps.length)} of {lesson.correctSteps.length}
                </span>
              </div>
            </div>
          )}
          <div className="shrink-0 text-right">
            <span
              className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 border border-black block whitespace-nowrap ${
                isFinished
                  ? 'bg-emerald-400 text-black'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {isFinished ? 'Mastered' : `Step ${Math.min(currentStepIndex + 1, lesson.correctSteps.length)}`}
            </span>
          </div>
        </div>
      </div>
      {/* Post-Step Tactical Breakdown Modal Popup */}
      {pendingModalData && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`relative max-w-md w-full bg-[#0d0d12] border-3 ${
              isGatoru
                ? 'border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.4)]'
                : 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
            } p-4 sm:p-5 flex flex-col gap-3 select-text animate-in zoom-in-95 duration-200`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-700 pb-2">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isGatoru ? 'bg-sky-400' : 'bg-amber-400'} text-black`}>
                  <Check className="w-4 h-4 stroke-[4]" />
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-black uppercase border ${
                    isGatoru
                      ? 'bg-sky-400 text-black border-black'
                      : 'bg-amber-400 text-black border-black'
                  }`}
                >
                  Step {pendingModalData.stepNumber} of {pendingModalData.totalSteps} DONE
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-300">
                  {pendingModalData.isFinal ? 'Decisive Victory' : 'Tactical Mastery'}
                </span>
              </div>
              <span
                className={`font-mono text-xs font-black px-2 py-0.5 bg-neutral-900 border ${
                  isGatoru ? 'border-sky-400 text-sky-400' : 'border-amber-400 text-amber-400'
                }`}
              >
                {pendingModalData.notation}
              </span>
            </div>

            {/* Tactical Breakdown Explanation */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-300">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Why this move matters most:</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-neutral-100 leading-relaxed bg-neutral-900/90 border border-neutral-800 p-3">
                {pendingModalData.tacticalBreakdown}
              </p>
            </div>

            {/* Sensei Validation Stamp */}
            <div
              className={`p-2.5 border text-xs flex items-center gap-2.5 ${
                isGatoru
                  ? 'bg-sky-950/40 border-sky-500/50 text-sky-200'
                  : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              }`}
            >
              <span className="font-serif text-lg select-none">
                {isGatoru ? '悟' : '宿'}
              </span>
              <div className="text-[11px] leading-tight">
                <span className="font-bold uppercase block mb-0.5">
                  {isGatoru ? 'Gatoru Luchha confirms:' : 'Thukuna confirms:'}
                </span>
                {pendingModalData.isFinal
                  ? 'The final tactical objective is achieved. Perfect execution.'
                  : 'Tempo preserved. Opponent is forced onto the defensive.'}
              </div>
            </div>

            {/* Action Continue Button */}
            <button
              onClick={handleContinueStep}
              autoFocus
              className={`w-full py-2.5 px-4 font-black text-xs sm:text-sm uppercase border-2 border-black flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                isGatoru
                  ? 'bg-sky-400 hover:bg-sky-300 text-black'
                  : 'bg-amber-400 hover:bg-amber-300 text-black'
              }`}
            >
              <span>
                {pendingModalData.isFinal
                  ? 'Complete Kata & Claim Victory 🏆'
                  : `Continue Strike (Step ${pendingModalData.stepNumber + 1}/${pendingModalData.totalSteps}) →`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
