/**
 * CullingOpeningDojo.tsx
 *
 * Culling Game Opening Dojo — Tukuna's Classroom
 *
 * Interactive 3-panel classroom featuring:
 * 1. Dual Curriculum: OPENING DOJO & MID-GAME STRATEGY (16 total 8-step lessons)
 * 2. VIEW FULL OPENING STRATEGY mode with step timeline, auto playback, move list, and red pattern highlights
 * 3. Collapsible Sensei Tukuna lesson sidebar for mobile screens
 * 4. Responsive 88-square Culling board stage with vector overlays
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  CullingOpeningLesson,
  CullingOpeningTier,
  CullingCurriculumType,
  CullingOpeningStep,
} from './types';
import { CULLING_OPENING_LESSONS } from './cullingOpeningData';
import {
  createInitialCullingMatch,
  cloneCullingBoard,
  executeCullingMove,
} from '../game/cullingEngine';
import type { CullingMatchState, CullingPos, CullingSpecialAction } from '../types/cullingGame';
import { CULLING_ROSTER } from '../types/cullingGame';
import { CullingBoard } from '../components/CullingBoard';
import { CullingOpeningVectorOverlay } from './CullingOpeningVectorOverlay';
import { sounds } from '../utils/audio';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Flame,
  Layers,
  ListOrdered,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react';

interface CullingOpeningDojoProps {
  onBackToDojo: () => void;
}

export const CullingOpeningDojo: React.FC<CullingOpeningDojoProps> = ({ onBackToDojo }) => {
  // Curriculum Tab: 'opening' | 'midgame'
  const [activeCurriculum, setActiveCurriculum] = useState<CullingCurriculumType>('opening');

  // Tier filter: 'all' | 'beginner' | 'intermediate' | 'advanced'
  const [selectedTier, setSelectedTier] = useState<'all' | CullingOpeningTier>('all');
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  // Filter lessons by active curriculum and tier
  const filteredLessons = useMemo(() => {
    return CULLING_OPENING_LESSONS.filter((l) => {
      const typeMatches =
        activeCurriculum === 'opening'
          ? !l.curriculumType || l.curriculumType === 'opening'
          : l.curriculumType === 'midgame';
      const tierMatches = selectedTier === 'all' || l.tier === selectedTier;
      return typeMatches && tierMatches;
    });
  }, [activeCurriculum, selectedTier]);

  const activeLesson: CullingOpeningLesson = filteredLessons[activeLessonIndex] || filteredLessons[0] || CULLING_OPENING_LESSONS[0];

  // Lesson step state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('culling_opening_completed_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Toggles & Modes
  const [showArrows, setShowArrows] = useState(true);
  const [isFreePractice, setIsFreePractice] = useState(false);
  const [isFullStrategyMode, setIsFullStrategyMode] = useState(false);
  const [isLessonFinished, setIsLessonFinished] = useState(false);

  // Playback state for Full Strategy Mode
  const [isPlaying, setIsPlaying] = useState(false);

  // Mobile drawer collapse state for Sensei Tukuna
  const [isMobileTukunaOpen, setIsMobileTukunaOpen] = useState(false);

  // Off-Book Error Feedback Modal State
  const [offBookError, setOffBookError] = useState<{
    attemptedFrom: CullingPos;
    attemptedTo: CullingPos;
    reason: string;
  } | null>(null);

  // Active Culling Match State for current lesson
  const [matchState, setMatchState] = useState<CullingMatchState>(() => {
    const init = createInitialCullingMatch(
      `dojo_${activeLesson.id}`,
      { userId: 'player', username: 'Learner', displayName: 'Pupil' },
      { userId: 'tukuna_bot', username: 'Tukuna', displayName: 'Sensei Tukuna' }
    );
    if (activeLesson.initialBoard) {
      init.board = cloneCullingBoard(activeLesson.initialBoard);
    }
    return init;
  });

  // Active step
  const currentStep: CullingOpeningStep | undefined = activeLesson.steps[currentStepIndex];

  // Save progress
  const markLessonCompleted = (lessonId: string) => {
    setCompletedLessonIds((prev) => {
      const updated = Array.from(new Set([...prev, lessonId]));
      try {
        localStorage.setItem('culling_opening_completed_ids', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Build match state up to a given step index (0 to N)
  const buildBoardForStepIndex = useCallback(
    (targetStepIdx: number) => {
      let match = createInitialCullingMatch(
        `dojo_${activeLesson.id}_step_${targetStepIdx}`,
        { userId: 'player', username: 'Learner', displayName: 'Pupil' },
        { userId: 'tukuna_bot', username: 'Tukuna', displayName: 'Sensei Tukuna' }
      );
      if (activeLesson.initialBoard) {
        match.board = cloneCullingBoard(activeLesson.initialBoard);
      }

      for (let i = 0; i <= targetStepIdx && i < activeLesson.steps.length; i++) {
        const step = activeLesson.steps[i];
        const res = executeCullingMove(match, step.from, step.to, step.actionType || 'move');
        if (res.success) {
          match = res.state;
          if (step.opponentResponse) {
            const opp = step.opponentResponse;
            const oppRes = executeCullingMove(match, opp.from, opp.to, 'move');
            if (oppRes.success) {
              match = oppRes.state;
            }
          }
        }
      }
      return match;
    },
    [activeLesson]
  );

  // Reset lesson state when active lesson or curriculum changes
  const resetCurrentLesson = useCallback(() => {
    const init = createInitialCullingMatch(
      `dojo_${activeLesson.id}_${Date.now()}`,
      { userId: 'player', username: 'Learner', displayName: 'Pupil' },
      { userId: 'tukuna_bot', username: 'Tukuna', displayName: 'Sensei Tukuna' }
    );
    if (activeLesson.initialBoard) {
      init.board = cloneCullingBoard(activeLesson.initialBoard);
    }
    setMatchState(init);
    setCurrentStepIndex(0);
    setIsLessonFinished(false);
    setIsPlaying(false);
    setOffBookError(null);
  }, [activeLesson]);

  useEffect(() => {
    resetCurrentLesson();
  }, [activeLesson.id, resetCurrentLesson]);

  // Handle Full Strategy Jump to Step
  const handleJumpToStep = (stepIdx: number) => {
    setCurrentStepIndex(stepIdx);
    const newMatch = buildBoardForStepIndex(stepIdx);
    setMatchState(newMatch);
    sounds.playSelect();
  };

  // Full Strategy Auto-Play Timer
  useEffect(() => {
    if (!isFullStrategyMode || !isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next >= activeLesson.steps.length) {
          setIsPlaying(false);
          return prev;
        }
        setMatchState(buildBoardForStepIndex(next));
        sounds.playMove();
        return next;
      });
    }, 1600);

    return () => clearInterval(timer);
  }, [isFullStrategyMode, isPlaying, activeLesson, buildBoardForStepIndex]);

  // Execute step or handle off-book attempt in Interactive Mode
  const handleBoardMove = (from: CullingPos, to: CullingPos, actionType?: string) => {
    if (isLessonFinished || isFullStrategyMode) return;

    // Free Practice Mode: execute any legal move
    if (isFreePractice) {
      const chosenAction = (actionType || 'move') as CullingSpecialAction;
      const res = executeCullingMove(matchState, from, to, chosenAction);
      if (res.success) {
        setMatchState(res.state);
        sounds.playMove();
      }
      return;
    }

    // Strict Mode validation
    if (!currentStep) return;

    const isMatch =
      from.x === currentStep.from.x &&
      from.y === currentStep.from.y &&
      to.x === currentStep.to.x &&
      to.y === currentStep.to.y;

    if (!isMatch) {
      const movingPiece = matchState.board[from.y]?.[from.x];
      const pieceName = movingPiece ? CULLING_ROSTER[movingPiece.type]?.name || 'unit' : 'piece';

      let reason = `Moving your ${pieceName} from (${from.x},${from.y}) to (${to.x},${to.y}) departs from Sensei Tukuna's recommended line.`;
      if (from.x !== currentStep.from.x || from.y !== currentStep.from.y) {
        reason = `Discipline, pupil! You moved your ${pieceName} instead of deploying the designated opening unit.`;
      } else {
        reason = `Inaccurate square! Moving your ${pieceName} there weakens your tactical alignment. Follow the crimson vector!`;
      }

      sounds.playCheck();
      setOffBookError({ attemptedFrom: from, attemptedTo: to, reason });
      return;
    }

    // Executing the correct target move!
    setOffBookError(null);
    const chosenAction = (currentStep.actionType || actionType || 'move') as CullingSpecialAction;
    const res = executeCullingMove(matchState, from, to, chosenAction);

    if (!res.success) {
      setOffBookError({
        attemptedFrom: from,
        attemptedTo: to,
        reason: res.error || 'The cursed barrier rejected this move.',
      });
      return;
    }

    setMatchState(res.state);
    sounds.playMove();

    // Check if next step exists or lesson is finished
    const nextIdx = currentStepIndex + 1;
    if (nextIdx >= activeLesson.steps.length) {
      setIsLessonFinished(true);
      markLessonCompleted(activeLesson.id);
      sounds.playGameOver();
    } else {
      setCurrentStepIndex(nextIdx);

      // Execute automated opponent response if configured
      if (currentStep.opponentResponse) {
        const opp = currentStep.opponentResponse;
        setTimeout(() => {
          setMatchState((prev) => {
            const oppRes = executeCullingMove(prev, opp.from, opp.to, 'move');
            if (oppRes.success) {
              sounds.playMove();
              return oppRes.state;
            }
            return prev;
          });
        }, 350);
      }
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#080709] text-white flex flex-col font-sans select-none overflow-hidden">
      {/* 1. Header Stripe */}
      <header className="bg-black border-b-2 border-red-600 px-3 py-2 shrink-0 flex items-center justify-between shadow-[0_4px_16px_rgba(220,38,38,0.3)] z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sounds.playMove();
              onBackToDojo();
            }}
            className="px-2.5 py-1 bg-red-950 hover:bg-red-900 border-2 border-red-500 text-red-200 font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            <ArrowLeft className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Return to Dojo</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
            <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-red-400 flex items-center gap-1.5">
              <span>CULLING GAME DOJO</span>
              <span className="text-[10px] sm:text-xs font-mono text-neutral-400 font-normal hidden md:inline">
                | Tukuna&apos;s Classroom
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Tukuna Sidebar Toggle */}
          <button
            onClick={() => setIsMobileTukunaOpen(!isMobileTukunaOpen)}
            className="lg:hidden px-2 py-1 bg-red-950 border border-red-600 text-red-300 text-xs font-black uppercase flex items-center gap-1"
          >
            <span>Sensei Tukuna</span>
            {isMobileTukunaOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <span className="text-[10px] sm:text-xs font-black uppercase text-red-400 bg-red-950/80 px-2 py-1 border border-red-800">
            {completedLessonIds.length}/{CULLING_OPENING_LESSONS.length} Cleared
          </span>
        </div>
      </header>

      {/* 2. Main 3-Panel Classroom Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Panel: Curriculum Navigation & Strategy Selector */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r-2 border-red-950 bg-[#0c090c] p-2.5 flex flex-col shrink-0 overflow-y-auto max-h-48 lg:max-h-none">
          {/* Main Curriculum Tabs: Opening Dojo vs Mid-Game Strategy */}
          <div className="mb-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-red-400 block mb-1">
              Select Training Curriculum:
            </span>
            <div className="grid grid-cols-2 gap-1 bg-neutral-950 p-1 border border-neutral-800">
              <button
                onClick={() => {
                  setActiveCurriculum('opening');
                  setActiveLessonIndex(0);
                  sounds.playSelect();
                }}
                className={`py-1.5 text-[10px] font-black uppercase border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  activeCurriculum === 'opening'
                    ? 'bg-red-600 text-white border-white shadow-[1px_1px_0px_#000]'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Opening Dojo</span>
              </button>

              <button
                onClick={() => {
                  setActiveCurriculum('midgame');
                  setActiveLessonIndex(0);
                  sounds.playSelect();
                }}
                className={`py-1.5 text-[10px] font-black uppercase border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  activeCurriculum === 'midgame'
                    ? 'bg-red-600 text-white border-white shadow-[1px_1px_0px_#000]'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                }`}
              >
                <Swords className="w-3 h-3" />
                <span>Mid-Game Strategy</span>
              </button>
            </div>
          </div>

          {/* Tier Selection Tabs */}
          <div className="mb-2">
            <div className="grid grid-cols-4 gap-1 bg-neutral-950 p-0.5 border border-neutral-800">
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => {
                    setSelectedTier(tier);
                    setActiveLessonIndex(0);
                    sounds.playSelect();
                  }}
                  className={`py-0.5 text-[9px] font-black uppercase border transition-all cursor-pointer ${
                    selectedTier === tier
                      ? 'bg-red-900 text-red-100 border-red-500'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Lesson List */}
          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {filteredLessons.map((lesson, idx) => {
              const isSelected = idx === activeLessonIndex;
              const isPassed = completedLessonIds.includes(lesson.id);

              return (
                <div
                  key={lesson.id}
                  onClick={() => {
                    setActiveLessonIndex(idx);
                    sounds.playMove();
                  }}
                  className={`p-2 border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-950/90 border-red-500 shadow-[2px_2px_0px_#ef4444]'
                      : 'bg-neutral-900/80 border-neutral-800 hover:border-red-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[8px] font-black uppercase text-red-400">
                      {lesson.tier} • {lesson.steps.length} Steps
                    </span>
                    {isPassed && (
                      <span className="text-[8px] font-black text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Cleared
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black uppercase text-white leading-tight">
                    {lesson.title}
                  </h4>
                  {lesson.namedStrategy && (
                    <span className="text-[9px] font-mono text-amber-400 block font-semibold">
                      Strategy: {lesson.namedStrategy}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center Panel: Interactive 88-Square Board Stage */}
        <main className="flex-1 min-h-0 min-w-0 flex flex-col items-center justify-center p-2 bg-[#070608] relative overflow-hidden">
          {/* Top Controls Bar */}
          <div className="mb-1.5 flex items-center gap-1.5 flex-wrap justify-center z-20 shrink-0">
            {/* View Full Strategy Mode Toggle */}
            <button
              onClick={() => {
                setIsFullStrategyMode(!isFullStrategyMode);
                setIsPlaying(false);
                setIsFreePractice(false);
                handleJumpToStep(0);
              }}
              className={`px-2.5 py-1 text-[11px] font-black uppercase border flex items-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_#000] ${
                isFullStrategyMode
                  ? 'bg-red-600 text-white border-white animate-pulse'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-red-600'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>{isFullStrategyMode ? 'Full Strategy Review' : 'View Full Strategy'}</span>
            </button>

            {/* Vector Arrows Toggle */}
            <button
              onClick={() => {
                setShowArrows(!showArrows);
                sounds.playSelect();
              }}
              className={`px-2 py-1 text-[11px] font-black uppercase border flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_#000] ${
                showArrows
                  ? 'bg-red-950 text-red-200 border-red-600'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800'
              }`}
            >
              {showArrows ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Vectors</span>
            </button>

            {/* Free Practice Toggle */}
            <button
              onClick={() => {
                setIsFreePractice(!isFreePractice);
                setIsFullStrategyMode(false);
                sounds.playSelect();
              }}
              className={`px-2 py-1 text-[11px] font-black uppercase border flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_#000] ${
                isFreePractice
                  ? 'bg-amber-400 text-black border-black font-bold'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>{isFreePractice ? 'Free Practice' : 'Free Sandbox'}</span>
            </button>

            {/* Reset Lesson */}
            <button
              onClick={resetCurrentLesson}
              className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-[11px] font-black uppercase flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_#000]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Full Strategy Playback Controls Bar */}
          {isFullStrategyMode && (
            <div className="mb-1.5 px-3 py-1 bg-neutral-950 border border-red-900/80 flex items-center gap-2 z-20">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase flex items-center gap-1 cursor-pointer border border-white"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play Sequence'}</span>
              </button>

              <button
                onClick={() => handleJumpToStep(Math.max(0, currentStepIndex - 1))}
                disabled={currentStepIndex === 0}
                className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 border border-neutral-700 text-[10px] font-black cursor-pointer"
              >
                Prev Step
              </button>

              <span className="text-[10px] font-mono text-red-400 font-bold">
                Step {currentStepIndex + 1} / {activeLesson.steps.length}
              </span>

              <button
                onClick={() => handleJumpToStep(Math.min(activeLesson.steps.length - 1, currentStepIndex + 1))}
                disabled={currentStepIndex >= activeLesson.steps.length - 1}
                className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 border border-neutral-700 text-[10px] font-black cursor-pointer"
              >
                Next Step
              </button>
            </div>
          )}

          {/* Interactive Culling Board Container */}
          <div className="relative flex items-center justify-center shrink-0 w-full max-w-[360px] sm:max-w-[400px] aspect-square">
            <CullingBoard
              match={matchState}
              myColor={activeLesson.playerColor}
              isInteractive={!isLessonFinished && !isFullStrategyMode}
              onMove={handleBoardMove}
              maxDimension={360}
            />

            {/* Vector Arrow Overlay */}
            {showArrows && currentStep && !isFreePractice && (
              <CullingOpeningVectorOverlay
                arrows={currentStep.vectorArrows}
                boardDimension={360}
              />
            )}

            {/* Strategic Red Pattern Overlay Squares */}
            {(isFullStrategyMode || showArrows) && activeLesson.patternHighlights && (
              <div className="absolute inset-0 pointer-events-none z-20 grid grid-cols-10 grid-rows-10 p-1">
                {activeLesson.patternHighlights.map((pos, pIdx) => {
                  const col = pos.x;
                  const row = 9 - pos.y;
                  return (
                    <div
                      key={`pattern_${pIdx}_${pos.x}_${pos.y}`}
                      style={{
                        gridColumnStart: col + 1,
                        gridRowStart: row + 1,
                      }}
                      className="w-full h-full bg-red-600/30 border-2 border-red-500 rounded-sm animate-pulse"
                    />
                  );
                })}
              </div>
            )}

            {/* Lesson Completion Overlay Banner */}
            {isLessonFinished && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-40">
                <div className="w-12 h-12 bg-red-600 text-white border-2 border-white flex items-center justify-center mb-2 shadow-[0_0_20px_#ef4444]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-wider text-red-400">
                  Lesson Cleared!
                </h3>
                <p className="text-xs font-bold text-neutral-200 max-w-xs mt-1 mb-3">
                  {activeLesson.completionMessage}
                </p>
                <button
                  onClick={() => {
                    if (activeLessonIndex < filteredLessons.length - 1) {
                      setActiveLessonIndex(activeLessonIndex + 1);
                    } else {
                      setIsLessonFinished(false);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase border-2 border-white shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  Proceed to Next Lesson →
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Right Panel / Mobile Collapsible Drawer: Sensei Tukuna's Crimson Panel */}
        <aside
          className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l-2 border-red-950 bg-[#0d0a0d] p-3 flex flex-col justify-between shrink-0 overflow-y-auto transition-all ${
            isMobileTukunaOpen ? 'block fixed inset-x-0 bottom-0 top-14 z-50 bg-[#0d0a0d]' : 'hidden lg:flex'
          }`}
        >
          <div>
            {/* Mobile Header Close Button */}
            <div className="flex items-center justify-between lg:hidden mb-2 pb-1 border-b border-red-900">
              <span className="text-xs font-black text-red-400 uppercase">
                Sensei Tukuna Commentary
              </span>
              <button
                onClick={() => setIsMobileTukunaOpen(false)}
                className="px-2 py-0.5 bg-red-900 text-white text-xs font-bold"
              >
                Close Drawer ✕
              </button>
            </div>

            {/* Sensei Tukuna Banner */}
            <div className="bg-gradient-to-r from-red-950 to-neutral-900 border-2 border-red-600 p-2.5 mb-2.5 flex items-center gap-3 shadow-[0_0_12px_rgba(220,38,38,0.2)]">
              <div className="w-10 h-10 bg-red-900 border border-red-400 flex items-center justify-center text-red-200 font-serif text-xl font-black shrink-0">
                宿
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-red-400 block">
                  Culling Game Instructor
                </span>
                <h3 className="text-sm font-black uppercase text-white tracking-tight">
                  Sensei Tukuna
                </h3>
              </div>
            </div>

            {/* Strategy Title & Subtitle */}
            <div className="bg-neutral-950 border border-neutral-800 p-2 mb-2">
              <span className="text-[9px] font-mono uppercase text-amber-400 block">
                {activeLesson.namedStrategy || activeLesson.title}
              </span>
              <p className="text-[10px] font-medium text-neutral-300 leading-tight">
                {activeLesson.subtitle}
              </p>
            </div>

            {/* Full Strategy Mode: Step List Timeline */}
            {isFullStrategyMode ? (
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                <span className="text-[10px] font-black uppercase text-red-400 block mb-1">
                  Full Sequence Timeline ({activeLesson.steps.length} Steps):
                </span>
                {activeLesson.steps.map((st, sIdx) => {
                  const isActive = sIdx === currentStepIndex;
                  return (
                    <div
                      key={`seq_step_${sIdx}`}
                      onClick={() => handleJumpToStep(sIdx)}
                      className={`p-2 border cursor-pointer transition-all ${
                        isActive
                          ? 'bg-red-900/90 border-red-500 font-bold'
                          : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                        <span className={isActive ? 'text-white font-black' : 'text-red-400'}>
                          Step {st.stepNumber}
                        </span>
                        <span className="bg-neutral-950 px-1.5 py-0.2 border border-neutral-800">
                          {st.notation}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-300 line-clamp-2">
                        {st.tukunaInstruction}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : isFreePractice ? (
              <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-2">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1">
                  <Swords className="w-4 h-4" /> Free Practice Mode
                </span>
                <p className="text-xs font-medium text-neutral-300 leading-relaxed">
                  Experiment freely with any legal move on the 88-square Culling board. Sensei Tukuna is observing your positional balance and colony extensions.
                </p>
              </div>
            ) : currentStep ? (
              <div className="space-y-2.5">
                {/* Step Indicator */}
                <div className="flex items-center justify-between border-b border-red-950 pb-1">
                  <span className="text-xs font-black uppercase text-red-400">
                    Step {currentStep.stepNumber} of {activeLesson.steps.length}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 border border-neutral-800">
                    {currentStep.notation}
                  </span>
                </div>

                {/* Instruction */}
                <div className="bg-neutral-900/90 border border-red-900/60 p-2.5">
                  <span className="text-[9px] font-black uppercase text-red-400 block mb-1">
                    Instruction:
                  </span>
                  <p className="text-xs font-bold text-white leading-relaxed">
                    {currentStep.tukunaInstruction}
                  </p>
                </div>

                {/* Tactical Purpose */}
                <div className="bg-neutral-900/90 border border-neutral-800 p-2.5">
                  <span className="text-[9px] font-black uppercase text-amber-400 block mb-1">
                    Tactical Purpose:
                  </span>
                  <p className="text-xs font-medium text-neutral-300 leading-relaxed">
                    {currentStep.tacticalBreakdown}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Off-Book Error Modal / Banner */}
          {offBookError && !isFullStrategyMode && (
            <div className="mt-2 p-2.5 bg-red-950/90 border-2 border-red-500 text-white space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-red-300">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Off-Book Deviation</span>
              </div>
              <p className="text-xs font-medium leading-relaxed text-red-100">
                {offBookError.reason}
              </p>
              <button
                onClick={() => setOffBookError(null)}
                className="w-full py-1 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase border border-white cursor-pointer"
              >
                Retry Stance
              </button>
            </div>
          )}

          {/* Lesson Navigation Controls */}
          <div className="mt-3 pt-2 border-t border-red-950 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                if (currentStepIndex > 0) {
                  handleJumpToStep(currentStepIndex - 1);
                }
              }}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-neutral-200 border border-neutral-700 text-xs font-black uppercase flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Prev
            </button>

            <button
              onClick={() => {
                if (activeLessonIndex < filteredLessons.length - 1) {
                  setActiveLessonIndex(activeLessonIndex + 1);
                  sounds.playSelect();
                }
              }}
              disabled={activeLessonIndex >= filteredLessons.length - 1}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white border border-white text-xs font-black uppercase flex items-center gap-1 cursor-pointer"
            >
              Next Lesson <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
