/**
 * InteractiveKataBoard.tsx - Interactive Board for Dojo Katas
 *
 * Runs Opening Dojo, Tactical Dojo, and Culling Dojo drills with step-by-step
 * move verification, dynamic error diagnostics from Sensei Gensei,
 * 2-strike golden pulsing guidance, opponent responses, and authentic
 * Culling Game cross-board + character piece integration.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { DojoLesson, MentorExpression, KataStep } from './types';
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
import { CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface InteractiveKataBoardProps {
  lesson: DojoLesson;
  onComplete: () => void;
  onReaction: (expression: MentorExpression, text: string) => void;
  onResetSignal?: number;
  maxBoardDimension?: number;
  onMoveMade?: () => void;
  onStepChange?: (stepIndex: number) => void;
}

export const InteractiveKataBoard: React.FC<InteractiveKataBoardProps> = ({
  lesson,
  onComplete,
  onReaction,
  onResetSignal = 0,
  maxBoardDimension,
  onMoveMade,
  onStepChange,
}) => {
  const isCullingMode = lesson.tool === 'culling' || Boolean(lesson.cullingBoard);

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

  // Notify parent of step changes for dynamic multi-step hints
  useEffect(() => {
    onStepChange?.(currentStepIndex);
  }, [currentStepIndex, onStepChange]);

  // Reset state whenever lesson or resetSignal triggers
  useEffect(() => {
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
    onStepChange?.(0);
  }, [lesson.id, onResetSignal, onStepChange]);

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

  // Standard Chess square click
  const handleStandardSquareClick = (x: number, y: number) => {
    if (isFinished) return;
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
      setCurrentStepIndex(nextIndex);

      if (nextIndex >= lesson.correctSteps.length) {
        setIsFinished(true);
        sounds.playGameOver();
        onReaction('approving', lesson.mentorSuccess);
        onComplete();
        return;
      }

      if (expectedStep.mentorReaction && expectedStep.mentorCommentary) {
        onReaction(expectedStep.mentorReaction, expectedStep.mentorCommentary);
      }

      // Scripted opponent response
      const oppResponse = lesson.opponentResponses?.find((r) => r.triggerStepIndex === currentStepIndex);
      if (oppResponse) {
        setTimeout(() => {
          setBoard((prev) => {
            const oppPiece = prev[oppResponse.from.y][oppResponse.from.x];
            if (!oppPiece) return prev;
            const oppMove: Move = {
              from: oppResponse.from,
              to: oppResponse.to,
              piece: oppPiece,
              captured: prev[oppResponse.to.y][oppResponse.to.x] || undefined,
              timestamp: Date.now(),
            };
            const updated = applyMoveToBoard(prev, oppMove);
            setLastMove({ from: oppResponse.from, to: oppResponse.to });
            if (oppMove.captured) sounds.playCapture();
            else sounds.playMove();
            return updated;
          });

          if (oppResponse.commentary) {
            onReaction('analytical', oppResponse.commentary);
          }
        }, 350);
      }
    }
  };

  // Culling Game move execution handler
  const handleCullingMove = (from: CullingPos, to: CullingPos, actionType?: string) => {
    if (isFinished) return;
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
    setCurrentStepIndex(nextIndex);

    if (nextIndex >= lesson.correctSteps.length) {
      setIsFinished(true);
      sounds.playGameOver();
      onReaction('approving', lesson.mentorSuccess);
      onComplete();
      return;
    }

    if (expectedStep.mentorReaction && expectedStep.mentorCommentary) {
      onReaction(expectedStep.mentorReaction, expectedStep.mentorCommentary);
    }

    // Scripted opponent response in Culling Dojo
    const oppResponse = lesson.opponentResponses?.find((r) => r.triggerStepIndex === currentStepIndex);
    if (oppResponse) {
      setTimeout(() => {
        setCullingMatch((prev) => {
          const res = executeCullingMove(prev, oppResponse.from, oppResponse.to, 'move');
          if (res.success) {
            setLastMove({ from: oppResponse.from, to: oppResponse.to });
            sounds.playMove();
            return res.state;
          }
          return prev;
        });

        if (oppResponse.commentary) {
          onReaction('analytical', oppResponse.commentary);
        }
      }, 350);
    }
  };

  const showGoldenGuide = consecutiveMistakes >= 2 && Boolean(expectedStep);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-full select-none">
      {/* 2-Mistake Guidance Banner (Compact) */}
      {showGoldenGuide && (
        <div className="mb-1 px-2.5 py-0.5 bg-amber-400 text-black font-black text-[10px] sm:text-xs uppercase border border-black flex items-center gap-1 shadow-[1px_1px_0px_#000] animate-bounce shrink-0">
          <Sparkles className="w-3 h-3 text-black shrink-0" />
          <span>Sensei's Golden Guide: Move from pulsing gold to dashed square</span>
        </div>
      )}

      {/* Main Board View: Either Authentic Culling Cross Board or Standard 8x8 */}
      {isCullingMode ? (
        <div className="relative flex flex-col items-center justify-center shrink-0">
          <CullingBoard
            match={cullingMatch}
            myColor={lesson.cullingPlayerColor || 'white'}
            isInteractive={!isFinished}
            onMove={handleCullingMove}
            pulseGuide={showGoldenGuide && expectedStep ? { from: expectedStep.from, to: expectedStep.to } : undefined}
            maxDimension={maxBoardDimension ? Math.floor(maxBoardDimension - 14) : undefined}
          />

          {isFinished && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-3 z-40">
              <div className="w-10 h-10 bg-amber-400 text-black border-2 border-black flex items-center justify-center mb-1.5 shadow-[2px_2px_0px_#000]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base sm:text-lg font-black uppercase text-amber-400 tracking-wider">
                Culling Kata Cleared
              </h4>
              <p className="text-[11px] sm:text-xs font-bold text-white max-w-xs mt-0.5">
                Domain Mastery achieved. Your cursed tactics meet Thukuna's high standard.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Standard / Crafted 8x8 Board Container */
        <div
          style={maxBoardDimension ? { width: `${maxBoardDimension}px`, height: `${maxBoardDimension}px` } : undefined}
          className="relative border-3 sm:border-4 border-black dark:border-white shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] bg-black select-none max-w-[460px] w-full aspect-square shrink-0"
        >
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
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
              <h4 className="text-base sm:text-lg font-black uppercase text-amber-400 tracking-wider">
                Kata Cleared
              </h4>
              <p className="text-[11px] sm:text-xs font-bold text-white max-w-xs mt-0.5">
                Thukuna nods in approval. Your discipline honors the Dojo.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Progress & Error Status Strip */}
      <div className="mt-1.5 flex items-center justify-between w-full max-w-[460px] text-[10px] sm:text-xs font-black uppercase tracking-wider px-1 shrink-0">
        <span className="text-neutral-400">
          Step {Math.min(currentStepIndex + 1, lesson.correctSteps.length)}/{lesson.correctSteps.length}
        </span>
        {consecutiveMistakes > 0 && !isFinished && (
          <span className="text-amber-400 flex items-center gap-1 font-mono text-[10px]">
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Attempts: {consecutiveMistakes}/2 {consecutiveMistakes >= 2 ? '(Guide On)' : ''}</span>
          </span>
        )}
        <span className={isFinished ? 'text-amber-400' : 'text-neutral-500'}>
          {isFinished ? '✓ Mastered' : 'Active Kata'}
        </span>
      </div>
    </div>
  );
};
