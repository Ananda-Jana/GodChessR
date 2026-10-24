/**
 * CullingOpeningDojo.tsx
 *
 * Culling Game Opening Dojo — Tukuna's Classroom
 *
 * Interactive 3-panel classroom featuring:
 * 1. Dual Curriculum: OPENING DOJO & MID-GAME STRATEGY (16 total 8-step lessons)
 * 2. Mobile Responsive Console: Compact 44px top nav dropdowns, ResizeObserver fitted board,
 *    always-visible Sensei Tukuna small box view, and 48px fixed bottom action bar
 * 3. Desktop 3-column studio layout intact for wide screens
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { CullingRulesModal } from '../components/CullingRulesModal';
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
  HelpCircle,
  Layers,
  ListOrdered,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  SkipForward,
  Sparkles,
  Swords,
  Trophy,
  X,
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

  // Mobile Dropdown Menu State ('none' | 'lessons' | 'tools' | 'rules')
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<'none' | 'lessons' | 'tools' | 'rules'>('none');
  const [showMobileHint, setShowMobileHint] = useState(false);
  const [mobileRuleModalOpen, setMobileRuleModalOpen] = useState(false);

  // Lesson transition declaration banner state
  const [lessonDeclaration, setLessonDeclaration] = useState<{
    visible: boolean;
    title: string;
    index: number;
  } | null>(null);

  const prevLessonIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevLessonIdRef.current !== null && prevLessonIdRef.current !== activeLesson.id) {
      setLessonDeclaration({
        visible: true,
        title: activeLesson.title,
        index: activeLessonIndex + 1,
      });

      const timer = setTimeout(() => {
        setLessonDeclaration((prev) => (prev ? { ...prev, visible: false } : null));
      }, 1800);

      return () => clearTimeout(timer);
    }
    prevLessonIdRef.current = activeLesson.id;
  }, [activeLesson.id, activeLesson.title, activeLessonIndex]);

  // ResizeObserver for Mobile Dynamic Board Fitting
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const [mobileBoardDimension, setMobileBoardDimension] = useState(320);

  useEffect(() => {
    if (!stageContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const available = Math.min(width - 12, height - 12);
        if (available > 100) {
          const clamped = Math.min(available, 400);
          setMobileBoardDimension(clamped);
        }
      }
    });
    observer.observe(stageContainerRef.current);
    return () => observer.disconnect();
  }, []);

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
    // Run dev-time validation check
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      import('./validateLessons').then(({ validateCullingOpeningLesson }) => {
        const valFailures: any[] = [];
        validateCullingOpeningLesson(activeLesson, valFailures);
        if (valFailures.length > 0) {
          console.error(`[DOJO DEV VALIDATION WARNING] Lesson "${activeLesson.id}" (${activeLesson.title}) validation issues:`, valFailures);
        }
      }).catch(() => {});
    }

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
    setShowMobileHint(false);
    setActiveMobileDropdown('none');
  }, [activeLesson]);

  // Anti-stall skip step handler
  const handleSkipStep = useCallback(() => {
    const nextIdx = currentStepIndex + 1;
    if (nextIdx >= activeLesson.steps.length) {
      setIsLessonFinished(true);
      markLessonCompleted(activeLesson.id);
      sounds.playGameOver();
    } else {
      setCurrentStepIndex(nextIdx);
      setMatchState(buildBoardForStepIndex(nextIdx));
      sounds.playMove();
    }
    setOffBookError(null);
  }, [currentStepIndex, activeLesson, markLessonCompleted, buildBoardForStepIndex]);

  // Off-book Undo / Reset to current step handler
  const handleUndoMove = useCallback(() => {
    setMatchState(buildBoardForStepIndex(currentStepIndex));
    setOffBookError(null);
    sounds.playMove();
  }, [currentStepIndex, buildBoardForStepIndex]);

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
    setShowMobileHint(false);
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
    <div className="h-[100dvh] w-full bg-[#080709] text-white flex flex-col font-sans select-none overflow-hidden relative">
      {/* Rules Modal */}
      <CullingRulesModal isOpen={mobileRuleModalOpen} onClose={() => setMobileRuleModalOpen(false)} />

      {/* Instantaneous Lesson Declaration Banner (1.8s flame declaration on lesson switch) */}
      {lessonDeclaration && lessonDeclaration.visible && (
        <div className="fixed top-12 md:top-13 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-3">
          <div className="bg-gradient-to-r from-red-950 via-black to-red-950 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.7)] px-3.5 py-1.5 rounded-sm flex items-center gap-2 max-w-[92vw] md:max-w-md">
            <Flame className="w-4 h-4 md:w-5 md:h-5 text-amber-400 fill-amber-500 animate-bounce shrink-0" />
            <div className="flex items-center gap-2 truncate">
              <span className="text-[10px] md:text-xs font-mono font-black text-amber-300 uppercase tracking-wide shrink-0 bg-red-900/90 px-1.5 py-0.5 border border-amber-400/80">
                LESSON {lessonDeclaration.index}
              </span>
              <span className="text-xs md:text-sm font-black text-white uppercase truncate tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {lessonDeclaration.title}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MOBILE TOP HEADER (44px, md:hidden) */}
      {/* ========================================================================= */}
      <header className="md:hidden h-11 bg-black border-b-2 border-red-600 px-2 shrink-0 flex items-center justify-between z-40 relative shadow-[0_2px_12px_rgba(220,38,38,0.4)]">
        {/* Return Button */}
        <button
          onClick={() => {
            sounds.playMove();
            onBackToDojo();
          }}
          className="h-8 px-2 bg-red-950 border border-red-500 text-red-200 text-xs font-black uppercase flex items-center gap-1 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-red-400" />
          <span>Exit</span>
        </button>

        {/* Center Nav Dropdown Buttons */}
        <div className="flex items-center gap-1">
          {/* Lessons Menu Toggle */}
          <button
            onClick={() => {
              setActiveMobileDropdown((prev) => (prev === 'lessons' ? 'none' : 'lessons'));
              sounds.playSelect();
            }}
            aria-expanded={activeMobileDropdown === 'lessons'}
            aria-haspopup="true"
            className={`h-8 px-2 border text-[11px] font-black uppercase flex items-center gap-1 active:scale-95 transition-transform touch-manipulation ${
              activeMobileDropdown === 'lessons'
                ? 'bg-red-600 text-white border-white'
                : 'bg-neutral-900 text-red-300 border-red-900'
            }`}
          >
            <BookOpen className="w-3 h-3 text-red-400" />
            <span className="max-w-[70px] truncate">L{activeLessonIndex + 1}</span>
            {activeMobileDropdown === 'lessons' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Tools Menu Toggle */}
          <button
            onClick={() => {
              setActiveMobileDropdown((prev) => (prev === 'tools' ? 'none' : 'tools'));
              sounds.playSelect();
            }}
            aria-expanded={activeMobileDropdown === 'tools'}
            aria-haspopup="true"
            className={`h-8 px-2 border text-[11px] font-black uppercase flex items-center gap-1 active:scale-95 transition-transform touch-manipulation ${
              activeMobileDropdown === 'tools'
                ? 'bg-red-600 text-white border-white'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800'
            }`}
          >
            <Layers className="w-3 h-3 text-amber-400" />
            <span>Tools</span>
            {activeMobileDropdown === 'tools' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Rules Dropdown Toggle */}
          <button
            onClick={() => {
              setActiveMobileDropdown((prev) => (prev === 'rules' ? 'none' : 'rules'));
              sounds.playSelect();
            }}
            aria-expanded={activeMobileDropdown === 'rules'}
            aria-haspopup="true"
            className={`h-8 px-2 border text-[11px] font-black uppercase flex items-center gap-1 active:scale-95 transition-transform touch-manipulation ${
              activeMobileDropdown === 'rules'
                ? 'bg-red-600 text-white border-white'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            {activeMobileDropdown === 'rules' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Modernistic Animated Next Lesson Button */}
          <button
            onClick={() => {
              sounds.playSelect();
              setActiveLessonIndex((prev) => (prev + 1) % filteredLessons.length);
              setActiveMobileDropdown('none');
            }}
            aria-label="Next lesson"
            title={`Jump to Next Lesson (L${((activeLessonIndex + 1) % filteredLessons.length) + 1})`}
            className="relative h-11 px-2 bg-gradient-to-r from-red-950 via-red-600 to-amber-600 border border-amber-400/90 text-white font-black text-[10px] uppercase flex items-center gap-1 shrink-0 active:scale-90 hover:scale-105 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.5)] group overflow-hidden rounded-sm"
          >
            {/* Shimmer line transition */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {/* Glowing ring pulse */}
            <span className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-amber-500 rounded-sm opacity-60 group-hover:opacity-100 blur-[2px] transition duration-300 -z-10 animate-pulse" />
            
            <SkipForward className="w-3.5 h-3.5 text-amber-200 group-hover:translate-x-0.5 transition-transform" />
            <span className="font-mono text-[9px] font-bold tracking-tight text-amber-100">L{((activeLessonIndex + 1) % filteredLessons.length) + 1}</span>
          </button>
        </div>

        {/* Progress Counter */}
        <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/90 px-1.5 py-0.5 border border-red-800 shrink-0">
          {completedLessonIds.length}/16
        </span>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE DROPDOWN OVERLAYS (md:hidden) */}
      {/* ========================================================================= */}
      {activeMobileDropdown !== 'none' && (
        <div 
          className="md:hidden fixed top-11 inset-x-0 bottom-0 bg-black/85 backdrop-blur-md z-50 flex flex-col p-3 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveMobileDropdown('none');
          }}
        >
          {/* Lessons Dropdown */}
          {activeMobileDropdown === 'lessons' && (
            <div className="bg-[#0e0a0e] border-2 border-red-600 p-3 rounded-none shadow-[0_4px_24px_rgba(220,38,38,0.5)] flex flex-col max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-red-900 mb-2">
                <span className="text-xs font-black uppercase text-red-400 flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> Select Dojo Lesson
                </span>
                <button
                  onClick={() => setActiveMobileDropdown('none')}
                  className="p-1 bg-red-950 text-red-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Curriculum Selector */}
              <div className="grid grid-cols-2 gap-1 bg-neutral-950 p-1 border border-neutral-800 mb-2 shrink-0">
                <button
                  onClick={() => {
                    setActiveCurriculum('opening');
                    setActiveLessonIndex(0);
                    sounds.playSelect();
                  }}
                  className={`py-1.5 text-[10px] font-black uppercase border flex items-center justify-center gap-1 ${
                    activeCurriculum === 'opening'
                      ? 'bg-red-600 text-white border-white'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                  }`}
                >
                  <span>Opening Dojo</span>
                </button>
                <button
                  onClick={() => {
                    setActiveCurriculum('midgame');
                    setActiveLessonIndex(0);
                    sounds.playSelect();
                  }}
                  className={`py-1.5 text-[10px] font-black uppercase border flex items-center justify-center gap-1 ${
                    activeCurriculum === 'midgame'
                      ? 'bg-red-600 text-white border-white'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                  }`}
                >
                  <span>Mid-Game Strategy</span>
                </button>
              </div>

              {/* Tier Filters */}
              <div className="grid grid-cols-4 gap-1 mb-2 shrink-0">
                {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((tier) => (
                  <button
                    key={`m_tier_${tier}`}
                    onClick={() => {
                      setSelectedTier(tier);
                      setActiveLessonIndex(0);
                      sounds.playSelect();
                    }}
                    className={`py-1 text-[9px] font-black uppercase border text-center ${
                      selectedTier === tier
                        ? 'bg-red-900 text-red-100 border-red-500'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              {/* Lesson Grid List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {filteredLessons.map((lesson, idx) => {
                  const isSelected = idx === activeLessonIndex;
                  const isPassed = completedLessonIds.includes(lesson.id);

                  return (
                    <div
                      key={`m_les_${lesson.id}`}
                      onClick={() => {
                        setActiveLessonIndex(idx);
                        setActiveMobileDropdown('none');
                        sounds.playMove();
                      }}
                      className={`p-2 border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-red-950 border-red-500 shadow-[2px_2px_0px_#ef4444]'
                          : 'bg-neutral-900/90 border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] font-mono text-red-400 font-bold uppercase">
                          {lesson.tier} • {lesson.steps.length} Steps
                        </span>
                        {isPassed && (
                          <span className="text-[9px] font-black text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Cleared
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-black uppercase text-white leading-tight">
                        {lesson.title}
                      </h4>
                      {lesson.namedStrategy && (
                        <span className="text-[9px] font-mono text-amber-400 block mt-0.5">
                          Strategy: {lesson.namedStrategy}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tools Dropdown */}
          {activeMobileDropdown === 'tools' && (
            <div className="bg-[#0e0a0e] border-2 border-amber-600 p-3 rounded-none shadow-[0_4px_24px_rgba(245,158,11,0.4)] space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1">
                  <Layers className="w-4 h-4" /> Dojo Tools & Overlays
                </span>
                <button
                  onClick={() => setActiveMobileDropdown('none')}
                  className="p-1 bg-neutral-900 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* View Full Strategy Review Toggle */}
              <button
                onClick={() => {
                  setIsFullStrategyMode(!isFullStrategyMode);
                  setIsPlaying(false);
                  setIsFreePractice(false);
                  handleJumpToStep(0);
                  setActiveMobileDropdown('none');
                }}
                className={`w-full p-2 text-xs font-black uppercase border flex items-center justify-between ${
                  isFullStrategyMode
                    ? 'bg-red-600 text-white border-white'
                    : 'bg-neutral-900 text-neutral-200 border-neutral-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4" /> Full Strategy Review
                </span>
                <span>{isFullStrategyMode ? 'ON' : 'OFF'}</span>
              </button>

              {/* Vector Overlay Toggle */}
              <button
                onClick={() => {
                  setShowArrows(!showArrows);
                  sounds.playSelect();
                  setActiveMobileDropdown('none');
                }}
                className={`w-full p-2 text-xs font-black uppercase border flex items-center justify-between ${
                  showArrows
                    ? 'bg-red-950 text-red-200 border-red-500'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {showArrows ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} Vector Arrows
                </span>
                <span>{showArrows ? 'VISIBLE' : 'HIDDEN'}</span>
              </button>

              {/* Free Sandbox Practice Toggle */}
              <button
                onClick={() => {
                  setIsFreePractice(!isFreePractice);
                  setIsFullStrategyMode(false);
                  sounds.playSelect();
                  setActiveMobileDropdown('none');
                }}
                className={`w-full p-2 text-xs font-black uppercase border flex items-center justify-between ${
                  isFreePractice
                    ? 'bg-amber-400 text-black border-black font-bold'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Swords className="w-4 h-4" /> Free Sandbox Mode
                </span>
                <span>{isFreePractice ? 'ACTIVE' : 'OFF'}</span>
              </button>
            </div>
          )}

          {/* Rules Dropdown */}
          {activeMobileDropdown === 'rules' && (
            <div className="bg-[#0e0a0e] border-2 border-neutral-600 p-3 rounded-none shadow-xl space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-black uppercase text-neutral-300">
                  Dojo Rules & Controls
                </span>
                <button
                  onClick={() => setActiveMobileDropdown('none')}
                  className="p-1 bg-neutral-900 text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  setMobileRuleModalOpen(true);
                  setActiveMobileDropdown('none');
                }}
                className="w-full p-2.5 bg-red-950 hover:bg-red-900 border border-red-600 text-red-200 font-black text-xs uppercase flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-red-400" /> Read Culling Theory Book
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  resetCurrentLesson();
                  setActiveMobileDropdown('none');
                }}
                className="w-full p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-black text-xs uppercase flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400" /> Reset Current Lesson
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DESKTOP HEADER STRIPE (hidden on mobile, md:flex) */}
      {/* ========================================================================= */}
      <header className="hidden md:flex bg-black border-b-2 border-red-600 px-3 py-2 shrink-0 items-center justify-between shadow-[0_4px_16px_rgba(220,38,38,0.3)] z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sounds.playMove();
              onBackToDojo();
            }}
            className="px-2.5 py-1 bg-red-950 hover:bg-red-900 border-2 border-red-500 text-red-200 font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            <ArrowLeft className="w-4 h-4 text-red-400" />
            <span>Return to Dojo</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
            <h1 className="text-base font-black uppercase tracking-tight text-red-400 flex items-center gap-1.5">
              <span>CULLING GAME DOJO</span>
              <span className="text-xs font-mono text-neutral-400 font-normal">
                | Tukuna&apos;s Classroom
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-red-400 bg-red-950/80 px-2 py-1 border border-red-800">
            {completedLessonIds.length}/{CULLING_OPENING_LESSONS.length} Cleared
          </span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT STAGE */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative pb-12 md:pb-0">
        {/* DESKTOP LEFT PANEL: Curriculum Navigation (hidden on mobile) */}
        <aside className="hidden md:flex w-72 lg:w-80 border-r-4 border-red-950 bg-[#0c090c] p-2.5 flex-col shrink-0 overflow-y-auto">
          {/* Main Curriculum Tabs */}
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

        {/* CENTER STAGE: 88-Square Board & Mobile Controls */}
        <main className="flex-1 flex flex-col items-center justify-between bg-[#070608] relative overflow-hidden p-1.5">
          {/* DESKTOP TOP CONTROLS BAR (hidden on mobile) */}
          <div className="hidden md:flex mb-1.5 items-center gap-1.5 flex-wrap justify-center z-20 shrink-0">
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

          {/* Full Strategy Playback Controls Bar (Desktop) */}
          {isFullStrategyMode && (
            <div className="hidden md:flex mb-1.5 px-3 py-1 bg-neutral-950 border border-red-900/80 items-center gap-2 z-20">
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

          {/* BOARD CONTAINER: Measured via stageContainerRef for perfect mobile fitting */}
          <div
            ref={stageContainerRef}
            className="flex-1 w-full flex items-center justify-center relative overflow-hidden min-h-0"
          >
            <div
              style={{
                width: `${mobileBoardDimension}px`,
                height: `${mobileBoardDimension}px`,
              }}
              className="relative flex items-center justify-center shrink-0 aspect-square"
            >
              <CullingBoard
                match={matchState}
                myColor={activeLesson.playerColor}
                isInteractive={!isLessonFinished && !isFullStrategyMode}
                onMove={handleBoardMove}
                maxDimension={mobileBoardDimension}
              />

              {/* Vector Arrow Overlay */}
              {showArrows && currentStep && !isFreePractice && (
                <CullingOpeningVectorOverlay
                  arrows={currentStep.vectorArrows}
                  boardDimension={mobileBoardDimension}
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
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-3 z-40">
                  <div className="w-10 h-10 bg-red-600 text-white border-2 border-white flex items-center justify-center mb-1.5 shadow-[0_0_20px_#ef4444]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black uppercase tracking-wider text-red-400">
                    Lesson Cleared!
                  </h3>
                  <p className="text-[11px] font-bold text-neutral-200 max-w-xs mt-0.5 mb-2.5">
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
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase border-2 border-white shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    Proceed to Next Lesson →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ALWAYS-VISIBLE SENSEI TUKUNA SMALL BOX VIEW (md:hidden) */}
          {/* ========================================================================= */}
          <div className="md:hidden w-full px-1.5 py-1 z-30 shrink-0">
            <div className="bg-[#0e090e] border-2 border-red-800 p-2 shadow-[0_2px_10px_rgba(220,38,38,0.3)] flex flex-col gap-1">
              {/* Off-Book Error Feedback */}
              {offBookError ? (
                <div className="flex items-center justify-between text-xs font-bold text-red-300 gap-1.5 bg-red-950/90 p-1 border border-red-600">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
                    <span className="text-[10px] leading-tight truncate">{offBookError.reason}</span>
                  </div>
                  <button
                    onClick={() => setOffBookError(null)}
                    className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase shrink-0"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                /* Standard Small Box Tukuna Suggestion */
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-7 h-7 bg-red-950 border border-red-500 flex items-center justify-center text-red-300 font-serif text-sm font-black shrink-0">
                      宿
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase text-red-400 shrink-0">
                          Tukuna:
                        </span>
                        {currentStep && (
                          <span className="text-[9px] font-mono text-amber-300 bg-neutral-900 px-1 border border-neutral-800 shrink-0">
                            {currentStep.notation}
                          </span>
                        )}
                      </div>
                      <div className="max-h-[52px] overflow-y-auto pr-1">
                        <p className="text-[10px] font-medium text-neutral-200 leading-tight">
                          {showMobileHint && currentStep?.hint
                            ? `💡 Hint: ${currentStep.hint}`
                            : isFreePractice
                            ? 'Free Sandbox mode active. Move any piece.'
                            : currentStep
                            ? currentStep.tukunaInstruction
                            : 'Lesson Complete! Select next lesson.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hint Toggle Button */}
                  {!isFreePractice && currentStep?.hint && (
                    <button
                      onClick={() => setShowMobileHint(!showMobileHint)}
                      className={`min-w-[44px] min-h-[44px] px-3 py-1.5 text-[10px] font-black uppercase border shrink-0 flex items-center justify-center gap-1.5 ${
                        showMobileHint
                          ? 'bg-amber-400 text-black border-black font-bold'
                          : 'bg-neutral-900 text-amber-400 border-amber-900/60'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{showMobileHint ? 'Close' : 'Hint'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* DESKTOP RIGHT PANEL: Sensei Tukuna Commentary (hidden on mobile) */}
        <aside className="hidden md:flex w-72 lg:w-80 border-l-4 border-red-950 bg-[#0d0a0d] p-3 flex-col justify-between shrink-0 overflow-y-auto">
          <div>
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
            <div className="mt-2 p-2.5 bg-red-950/90 border-2 border-red-500 text-white space-y-2 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-red-300">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Off-Book Deviation</span>
              </div>
              <p className="text-xs font-medium leading-relaxed text-red-100">
                {offBookError.reason}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleUndoMove}
                  className="flex-1 py-1 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs uppercase border border-amber-300 cursor-pointer flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Undo Move</span>
                </button>
                <button
                  onClick={handleSkipStep}
                  className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs uppercase border border-neutral-600 cursor-pointer flex items-center justify-center gap-1"
                >
                  <SkipForward className="w-3 h-3 text-red-400" />
                  <span>Skip Step</span>
                </button>
              </div>
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
              className="px-2.5 min-h-[44px] bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-neutral-200 border border-neutral-700 text-xs font-black uppercase flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Prev
            </button>

            <button
              onClick={handleSkipStep}
              className="px-2.5 min-h-[44px] bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600 text-xs font-black uppercase flex items-center gap-1 cursor-pointer"
              title="Skip this step if stuck"
            >
              <SkipForward className="w-3.5 h-3.5 text-amber-400" /> Skip
            </button>

            <button
              onClick={() => {
                if (activeLessonIndex < filteredLessons.length - 1) {
                  setActiveLessonIndex(activeLessonIndex + 1);
                  sounds.playSelect();
                }
              }}
              disabled={activeLessonIndex >= filteredLessons.length - 1}
              className="px-2.5 min-h-[44px] bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white border border-white text-xs font-black uppercase flex items-center gap-1 cursor-pointer"
            >
              Next Lesson <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* 4. FIXED MOBILE BOTTOM ACTION BAR (48px, md:hidden) */}
      {/* ========================================================================= */}
      <footer className="md:hidden fixed bottom-0 inset-x-0 h-12 bg-black border-t-2 border-red-600 px-2 flex items-center justify-between z-40 shadow-[0_-4px_16px_rgba(220,38,38,0.4)]">
        {/* Prev Step Button */}
        <button
          onClick={() => {
            if (currentStepIndex > 0) {
              handleJumpToStep(currentStepIndex - 1);
            }
          }}
          disabled={currentStepIndex === 0}
          className="h-9 px-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 border border-neutral-700 text-neutral-200 text-xs font-black uppercase flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>

        {/* Step Indicator & Skip Control */}
        <div className="flex items-center gap-1 bg-red-950/90 border border-red-800 px-2 py-1">
          <span className="text-[10px] font-mono font-bold text-red-400">
            STEP {currentStepIndex + 1}/{activeLesson.steps.length}
          </span>
          <button
            onClick={handleSkipStep}
            className="ml-1 text-[10px] font-bold uppercase text-amber-300 underline underline-offset-2 flex items-center gap-0.5 active:scale-95"
            title="Stuck? Skip step"
          >
            <SkipForward className="w-3 h-3 text-amber-400" />
            <span>Skip</span>
          </button>
        </div>

        {/* Next Step or Auto-Play Button */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (currentStepIndex < activeLesson.steps.length - 1) {
                handleJumpToStep(currentStepIndex + 1);
              } else if (activeLessonIndex < filteredLessons.length - 1) {
                setActiveLessonIndex(activeLessonIndex + 1);
              }
            }}
            disabled={currentStepIndex >= activeLesson.steps.length - 1 && activeLessonIndex >= filteredLessons.length - 1}
            className="h-9 px-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white border border-white text-xs font-black uppercase flex items-center gap-1 shrink-0 active:scale-95 transition-transform shadow-[1px_1px_0px_#000]"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
