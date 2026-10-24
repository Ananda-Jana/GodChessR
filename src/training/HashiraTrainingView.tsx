/**
 * HashiraTrainingView.tsx - Master Chess Hashira Training Dojo Studio
 *
 * Responsive Architecture:
 * - Mobile (< lg): Strict zero-scroll layout (`h-[100dvh] overflow-hidden`).
 *   - Fixed top nav stripe with 3 horizontal dropdown buttons (Rank, Dojo Mode, Katas).
 *   - Wide Sensei banner (`layout="compact"`) displaying Sensei Gensei avatar and prompt message.
 *   - Center board stage pushed slightly downward and sized to fit without scrolling.
 *   - Fixed bottom nav stripe with current kata title and quick controls (Hint, Reset, Next).
 * - Desktop (>= lg): 3-column workspace with left sidebar, center stage, and right sidebar.
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { HashiraRankId, TrainingToolId, MentorExpression, DojoLesson, TrainerId } from './types';
import { HASHIRA_RANKS, DOJO_LESSONS, TRAINER_PROFILES, loadHashiraProgress, saveHashiraProgress } from './data';
import { HashiraMentor } from './HashiraMentor';
import { InteractiveKataBoard } from './InteractiveKataBoard';
import { PracticeBoard } from './PracticeBoard';
import { TheoryLibraryView } from './TheoryLibraryView';
import { CullingOpeningDojo } from './CullingOpeningDojo';
import { TrophyRoomModal } from '../components/TrophyRoomModal';
import { RulesModal } from '../components/RulesModal';
import { CullingRulesModal } from '../components/CullingRulesModal';
import { sounds } from '../utils/audio';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Layers,
  RotateCcw,
  Trophy,
} from 'lucide-react';

interface HashiraTrainingViewProps {
  onBack: () => void;
  initialTrainerId?: TrainerId;
}

export const HashiraTrainingView: React.FC<HashiraTrainingViewProps> = ({ onBack, initialTrainerId }) => {
  // Load persistent user progress
  const [progress, setProgress] = useState(() => loadHashiraProgress());
  const [selectedRankId, setSelectedRankId] = useState<HashiraRankId>(progress.selectedRank || 'mizunoto');
  const [selectedTrainerId, setSelectedTrainerId] = useState<TrainerId>(initialTrainerId || progress.selectedTrainerId || 'thukuna');
  const [activeTool, setActiveTool] = useState<TrainingToolId>('opening');

  // Mobile Dropdown & Collapse States
  const [isMobileRankOpen, setIsMobileRankOpen] = useState(false);
  const [isMobileDojoOpen, setIsMobileDojoOpen] = useState(false);
  const [isMobileKatasOpen, setIsMobileKatasOpen] = useState(false);
  const [isMobileTrainerCollapsed, setIsMobileTrainerCollapsed] = useState(false);
  const [isRulebookOpen, setIsRulebookOpen] = useState(false);
  const [isCullingRulesOpen, setIsCullingRulesOpen] = useState(false);
  const [flashSuccess, setFlashSuccess] = useState(false);

  // Timer ref for reversible blunder feedback
  const promptRestoreTimerRef = useRef<NodeJS.Timeout | null>(null);

  const closeAllMobileMenus = () => {
    setIsMobileRankOpen(false);
    setIsMobileDojoOpen(false);
    setIsMobileKatasOpen(false);
  };


  // Dynamic Stage Dimension Observer for 100% visible, non-overflowing board
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageDimensions, setStageDimensions] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? Math.min(window.innerWidth - 16, 440) : 360,
    height: typeof window !== 'undefined' ? Math.min(window.innerHeight - 200, 440) : 360,
  });

  useEffect(() => {
    if (!stageRef.current) return;
    const updateSize = () => {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setStageDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(stageRef.current);
    }

    window.addEventListener('resize', updateSize);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const maxBoardDimension = useMemo(() => {
    // Stage height minus margins and the bottom status strip (~32px)
    const availableHeight = stageDimensions.height - 34;
    const availableWidth = stageDimensions.width - 12;
    const dim = Math.floor(Math.min(availableWidth, availableHeight, 460));
    return Math.max(220, dim);
  }, [stageDimensions]);

  // Trophy Room modal state
  const [isTrophyRoomOpen, setIsTrophyRoomOpen] = useState(false);

  // Active rank configuration
  const currentRankInfo = useMemo(() => {
    return HASHIRA_RANKS.find((r) => r.id === selectedRankId) || HASHIRA_RANKS[0];
  }, [selectedRankId]);

  // Lessons filtered by active rank & tool
  const currentLessons = useMemo(() => {
    if (activeTool === 'practice' || activeTool === 'theory') return [];
    const toolLessons = DOJO_LESSONS.filter(
      (l) => l.tool === activeTool && l.rank === selectedRankId
    );
    if (toolLessons.length === 0) {
      return DOJO_LESSONS.filter((l) => l.tool === activeTool);
    }
    return toolLessons;
  }, [activeTool, selectedRankId]);

  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const activeLesson: DojoLesson | undefined = currentLessons[activeLessonIndex] || currentLessons[0];
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Lesson transition declaration banner state
  const [lessonDeclaration, setLessonDeclaration] = useState<{
    visible: boolean;
    title: string;
    index: number;
  } | null>(null);

  const prevLessonIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeLesson && prevLessonIdRef.current !== null && prevLessonIdRef.current !== activeLesson.id) {
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
    if (activeLesson) {
      prevLessonIdRef.current = activeLesson.id;
    }
  }, [activeLesson?.id, activeLesson?.title, activeLessonIndex]);

  // Sensei Mentor Expression & Dialogue State
  const [mentorExpression, setMentorExpression] = useState<MentorExpression>('stern');
  const [mentorMessage, setMentorMessage] = useState<string>(
    activeLesson?.mentorPrompt || 'Welcome to the Dojo, pupil. Choose your form and discipline.'
  );
  const [resetSignal, setResetSignal] = useState(0);
  const [activeHintText, setActiveHintText] = useState<string | null>(null);

  // Save progress helper
  const updateProgress = (updater: (prev: typeof progress) => typeof progress) => {
    setProgress((prev) => {
      const updated = updater(prev);
      saveHashiraProgress(updated);
      return updated;
    });
  };

  // Dynamic step prompt based on active step, rank, and active trainer
  const getCurrentStepPrompt = useCallback(() => {
    if (activeTool === 'practice') {
      return selectedTrainerId === 'gatoru'
        ? `Gatoru observes your calculation. Face the ${currentRankInfo.name} sparring partner with absolute composure.`
        : `Welcome to the Sparring Ground. Face the ${currentRankInfo.name} sparring partner or experiment freely in sandbox.`;
    }
    if (activeTool === 'theory') {
      return selectedTrainerId === 'gatoru'
        ? 'The Six Eyes perceive infinite geometrical paths. Study the scrolls with clarity.'
        : 'Knowledge is the sheath that protects the blade. Study the sacred chess scrolls.';
    }
    if (activeLesson) {
      const currentStep = activeLesson.correctSteps[activeStepIndex];
      return currentStep?.mentorPrompt || activeLesson.mentorPrompt;
    }
    return 'Welcome to the Dojo, pupil. Choose your form and discipline.';
  }, [activeTool, selectedTrainerId, currentRankInfo.name, activeLesson, activeStepIndex]);

  // Sensei Reaction handler with reversible blunder auto-restoration (~3.5s)
  const handleMentorReaction = useCallback(
    (expr: MentorExpression, text: string) => {
      if (promptRestoreTimerRef.current) {
        clearTimeout(promptRestoreTimerRef.current);
        promptRestoreTimerRef.current = null;
      }

      setMentorExpression(expr);
      setMentorMessage(text);

      // Blunder rebuke: show critique for ~3.5s then automatically bring back the step instruction
      if (expr === 'scowl') {
        promptRestoreTimerRef.current = setTimeout(() => {
          setMentorExpression('stern');
          setMentorMessage(getCurrentStepPrompt());
        }, 3500);
      }
    },
    [getCurrentStepPrompt]
  );

  // Switch between Thukuna (Crimson) and Gatoru Luchha (Neon Blue)
  const handleToggleTrainer = () => {
    const nextTrainerId: TrainerId = selectedTrainerId === 'thukuna' ? 'gatoru' : 'thukuna';
    setSelectedTrainerId(nextTrainerId);
    updateProgress((p) => ({ ...p, selectedTrainerId: nextTrainerId }));
    sounds.playMove();

    if (promptRestoreTimerRef.current) {
      clearTimeout(promptRestoreTimerRef.current);
      promptRestoreTimerRef.current = null;
    }

    const profile = TRAINER_PROFILES[nextTrainerId];
    setMentorExpression('stern');
    setMentorMessage(profile.greetingPrompt);
  };

  // Cleanup prompt restore timer on unmount
  useEffect(() => {
    return () => {
      if (promptRestoreTimerRef.current) {
        clearTimeout(promptRestoreTimerRef.current);
      }
    };
  }, []);

  // Reset lesson and prompt when tool, rank, or trainer changes
  useEffect(() => {
    if (promptRestoreTimerRef.current) {
      clearTimeout(promptRestoreTimerRef.current);
      promptRestoreTimerRef.current = null;
    }
    setActiveLessonIndex(0);
    setActiveHintText(null);
    setActiveStepIndex(0);
    if (activeLesson) {
      setMentorExpression('stern');
      setMentorMessage(activeLesson.mentorPrompt);
    } else if (activeTool === 'practice') {
      setMentorExpression('analytical');
      setMentorMessage(
        selectedTrainerId === 'gatoru'
          ? `Gatoru observes your calculation. Face the ${currentRankInfo.name} sparring partner with absolute composure.`
          : `Welcome to the Sparring Ground. Face the ${currentRankInfo.name} sparring partner or experiment freely in sandbox.`
      );
    } else if (activeTool === 'theory') {
      setMentorExpression('analytical');
      setMentorMessage(
        selectedTrainerId === 'gatoru'
          ? 'The Six Eyes perceive infinite geometrical paths. Study the scrolls with clarity.'
          : 'Knowledge is the sheath that protects the blade. Study the sacred chess scrolls.'
      );
    }
  }, [selectedRankId, activeTool, selectedTrainerId]);

  // Handle kata completion
  const handleKataCompleted = () => {
    if (!activeLesson) return;
    setActiveHintText(null);
    updateProgress((prev) => ({
      ...prev,
      completedKataIds: Array.from(new Set([...prev.completedKataIds, activeLesson.id])),
    }));
  };

  const handleNextKata = () => {
    if (activeLessonIndex < currentLessons.length - 1) {
      if (promptRestoreTimerRef.current) {
        clearTimeout(promptRestoreTimerRef.current);
        promptRestoreTimerRef.current = null;
      }
      const nextIdx = activeLessonIndex + 1;
      setActiveLessonIndex(nextIdx);
      setActiveHintText(null);
      setActiveStepIndex(0);
      const nextLesson = currentLessons[nextIdx];
      setMentorExpression('stern');
      setMentorMessage(nextLesson.mentorPrompt);
      sounds.playMove();
    }
  };

  const handleResetKata = () => {
    if (promptRestoreTimerRef.current) {
      clearTimeout(promptRestoreTimerRef.current);
      promptRestoreTimerRef.current = null;
    }
    setResetSignal((s) => s + 1);
    setActiveHintText(null);
    setActiveStepIndex(0);
    if (activeLesson) {
      setMentorExpression('stern');
      setMentorMessage(activeLesson.mentorPrompt);
    }
    sounds.playMove();
  };

  const handleStepChange = useCallback((stepIdx: number) => {
    if (promptRestoreTimerRef.current) {
      clearTimeout(promptRestoreTimerRef.current);
      promptRestoreTimerRef.current = null;
    }
    setActiveStepIndex(stepIdx);
    if (activeLesson) {
      const currentStep = activeLesson.correctSteps[stepIdx];
      const prompt = currentStep?.mentorPrompt || activeLesson.mentorPrompt;
      setMentorExpression('stern');
      setMentorMessage(prompt);
      
      // Trigger success flash for mentor border
      setFlashSuccess(true);
      setTimeout(() => setFlashSuccess(false), 1000);
    }
  }, [activeLesson]);

  const handleSeekHint = () => {
    if (!activeLesson) return;
    const currentStep = activeLesson.correctSteps[activeStepIndex];
    const dynamicHint = currentStep?.hint || activeLesson.hint;
    if (dynamicHint) {
      setActiveHintText(dynamicHint);
      setMentorExpression('analytical');
      sounds.playSelect();
    }
  };

  const isCurrentKataCompleted = activeLesson ? progress.completedKataIds.includes(activeLesson.id) : false;

  const dojoTabs: Array<{ id: TrainingToolId; label: string; icon: string }> = [
    { id: 'culling_opening', label: 'Culling Opening Dojo', icon: '🩸' },
    { id: 'opening', label: 'Opening Dojo', icon: '⛩️' },
    { id: 'tactics', label: 'Tactical Dojo', icon: '⚔️' },
    { id: 'culling', label: 'Culling Dojo', icon: '🩸' },
    { id: 'practice', label: 'Practice Board', icon: '🥋' },
    { id: 'theory', label: 'Theory Library', icon: '📜' },
  ];

  if (activeTool === 'culling_opening') {
    return <CullingOpeningDojo onBackToDojo={() => setActiveTool('culling')} />;
  }

  return (
    <div className="h-[100dvh] w-full bg-[#070709] text-white flex flex-col font-sans select-none antialiased overflow-hidden relative">
      {/* Lesson Declaration Banner */}
      {lessonDeclaration && lessonDeclaration.visible && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[60] pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-3">
          <div className="bg-gradient-to-r from-neutral-900 via-black to-neutral-900 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] px-3.5 py-1.5 rounded-none flex items-center gap-2 max-w-[92vw]">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-500 animate-bounce shrink-0" />
            <div className="flex items-center gap-2 truncate">
              <span className="text-[10px] font-mono font-black text-amber-300 uppercase tracking-wide shrink-0 bg-neutral-800 px-1.5 py-0.5 border border-amber-400/80">
                KATA {lessonDeclaration.index}
              </span>
              <span className="text-xs font-black text-white uppercase truncate tracking-tight">
                {lessonDeclaration.title}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 1. Top Navigation Stripe (Mobile: single 44px fixed stripe) */}
      <header className="bg-black border-b-2 border-amber-400 px-2.5 py-1.5 h-11 shrink-0 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.8)] z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playMove();
              onBack();
            }}
            className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase border-2 border-white shadow-[2px_2px_0px_#fff] flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            title="Return to Main Sanctuary"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sanctuary</span>
          </button>

          {/* Desktop Title Only */}
          <h1 className="hidden lg:flex text-base font-black uppercase tracking-tight text-amber-400 items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            CHESS HASHIRA TRAINING
          </h1>

          {/* Desktop Rulebook Button */}
          <button
            onClick={() => {
              sounds.playMove();
              if (activeTool === 'culling' || activeLesson?.mode === 'culling') {
                setIsCullingRulesOpen(true);
              } else {
                setIsRulebookOpen(true);
              }
            }}
            className="hidden lg:flex px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-400 text-amber-400 items-center gap-1.5 text-xs font-black uppercase cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            title="Open Rules & Codex"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Rulebook</span>
          </button>

          {/* Desktop Trainer Switch Button (Thukuna Crimson <-> Gatoru Luchha Neon Blue) */}
          <button
            onClick={handleToggleTrainer}
            className={`hidden lg:flex px-2.5 py-1 items-center gap-1.5 text-xs font-black uppercase cursor-pointer border-2 transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
              selectedTrainerId === 'thukuna'
                ? 'bg-gradient-to-r from-red-950 to-neutral-900 border-amber-400 text-amber-300 hover:border-amber-300'
                : 'bg-gradient-to-r from-sky-950 to-neutral-900 border-sky-400 text-sky-300 hover:border-sky-300'
            }`}
            title="Switch Sensei between Thukuna and Gatoru Luchha"
          >
            <span className="font-serif font-black">{selectedTrainerId === 'thukuna' ? '宿' : '悟'}</span>
            <span>Sensei: {selectedTrainerId === 'thukuna' ? 'Thukuna' : 'Gatoru Luchha'}</span>
            <span className="text-[9px] opacity-75 font-mono">⇄ Switch Trainer</span>
          </button>
        </div>

        {/* Mobile 3 Horizontal Buttons in Top Navigation Bar + Trainer Toggle */}
        <div className="flex lg:hidden items-center gap-1.5 relative">
          {/* Mobile Trainer Switch Toggle Button */}
          <button
            onClick={handleToggleTrainer}
            className={`px-1.5 py-1 items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase border cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all z-40 flex shrink-0 ${
              selectedTrainerId === 'thukuna'
                ? 'bg-red-950 text-amber-300 border-amber-400 shadow-[1px_1px_0px_#000]'
                : 'bg-sky-950 text-sky-300 border-sky-400 shadow-[1px_1px_0px_#000]'
            }`}
            title="Switch Sensei between Thukuna and Gatoru Luchha"
          >
            <span className="font-serif font-black">{selectedTrainerId === 'thukuna' ? '宿' : '悟'}</span>
            <span className="hidden min-[380px]:inline">{selectedTrainerId === 'thukuna' ? 'Thukuna' : 'Gatoru'}</span>
            <span className="text-[8px] font-mono opacity-80">⇄</span>
          </button>

          {/* Backdrop when any mobile dropdown is open */}
          {(isMobileRankOpen || isMobileDojoOpen || isMobileKatasOpen) && (
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
              onClick={closeAllMobileMenus}
            />
          )}

          {/* 1. Rank Selector Trigger */}
          <button
            onClick={() => {
              setIsMobileRankOpen(!isMobileRankOpen);
              setIsMobileDojoOpen(false);
              setIsMobileKatasOpen(false);
              sounds.playMove();
            }}
            aria-expanded={isMobileRankOpen}
            aria-haspopup="true"
            className={`px-2 py-1 border text-[10px] sm:text-[11px] font-black uppercase flex items-center gap-1 cursor-pointer transition-colors z-40 active:scale-95 ${
              isMobileRankOpen
                ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                : 'bg-neutral-900 border-neutral-700 text-amber-400'
            }`}
          >
            <span className="font-serif">{currentRankInfo.kanji}</span>
            <span className="truncate max-w-[60px] sm:max-w-[76px]">{currentRankInfo.name}</span>
            {isMobileRankOpen ? <ChevronUp className="w-2.5 h-2.5 shrink-0" /> : <ChevronDown className="w-2.5 h-2.5 shrink-0" />}
          </button>

          {/* 2. Dojo Mode Selector Trigger */}
          <button
            onClick={() => {
              setIsMobileDojoOpen(!isMobileDojoOpen);
              setIsMobileRankOpen(false);
              setIsMobileKatasOpen(false);
              sounds.playMove();
            }}
            aria-expanded={isMobileDojoOpen}
            aria-haspopup="true"
            className={`px-2 py-1 border text-[10px] sm:text-[11px] font-black uppercase flex items-center gap-1 cursor-pointer transition-colors z-40 active:scale-95 ${
              isMobileDojoOpen
                ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                : 'bg-neutral-900 border-neutral-700 text-amber-400'
            }`}
          >
            <span>{dojoTabs.find((t) => t.id === activeTool)?.icon}</span>
            <span className="truncate max-w-[62px] sm:max-w-[78px]">
              {dojoTabs.find((t) => t.id === activeTool)?.label.replace(' Dojo', '')}
            </span>
            {isMobileDojoOpen ? <ChevronUp className="w-2.5 h-2.5 shrink-0" /> : <ChevronDown className="w-2.5 h-2.5 shrink-0" />}
          </button>

          {/* Small Square Rulebook Opening Button next to Dojo Selector */}
          <button
            onClick={() => {
              sounds.playMove();
              if (activeTool === 'culling' || activeLesson?.mode === 'culling') {
                setIsCullingRulesOpen(true);
              } else {
                setIsRulebookOpen(true);
              }
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-400 text-amber-400 flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 z-40 shrink-0"
            title="Open Rules & Codex"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* 3. Katas Trigger OR Trophy Button */}
          {activeTool !== 'practice' && activeTool !== 'theory' ? (
            <button
              onClick={() => {
                setIsMobileKatasOpen(!isMobileKatasOpen);
                setIsMobileRankOpen(false);
                setIsMobileDojoOpen(false);
                sounds.playMove();
              }}
              aria-expanded={isMobileKatasOpen}
              aria-haspopup="true"
              className={`px-2 py-1 border text-[10px] sm:text-[11px] font-black uppercase flex items-center gap-1 cursor-pointer transition-colors z-40 active:scale-95 ${
                isMobileKatasOpen
                  ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-200'
              }`}
            >
              <Layers className="w-3 h-3 text-amber-500 shrink-0" />
              <span>{activeLessonIndex + 1}/{currentLessons.length}</span>
              {isMobileKatasOpen ? <ChevronUp className="w-2.5 h-2.5 shrink-0" /> : <ChevronDown className="w-2.5 h-2.5 shrink-0" />}
            </button>
          ) : (
            <button
              onClick={() => {
                setIsTrophyRoomOpen(true);
                sounds.playMove();
              }}
              className="px-2 py-1 bg-neutral-900 border border-neutral-700 text-amber-400 font-black text-[10px] sm:text-[11px] uppercase flex items-center gap-1 cursor-pointer z-40"
            >
              <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Trophies</span>
            </button>
          )}

          {/* Rank Dropdown Panel (Auto-closes on select) */}
          {isMobileRankOpen && (
            <div className="absolute top-full right-0 mt-1 bg-[#121216] border-2 border-amber-400 p-2 shadow-2xl z-50 grid grid-cols-3 gap-1.5 w-72 max-h-[50dvh] overflow-y-auto">
              {HASHIRA_RANKS.map((rank) => (
                <button
                  key={rank.id}
                  onClick={() => {
                    setSelectedRankId(rank.id);
                    updateProgress((p) => ({ ...p, selectedRank: rank.id }));
                    setIsMobileRankOpen(false);
                    sounds.playMove();
                  }}
                  className={`p-1.5 text-[10px] font-black uppercase border text-center cursor-pointer ${
                    rank.id === selectedRankId
                      ? 'bg-amber-400 text-black border-black'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-700'
                  }`}
                >
                  <div className="font-serif text-sm">{rank.kanji}</div>
                  <div className="truncate">{rank.name}</div>
                </button>
              ))}
            </div>
          )}

          {/* Dojo Mode Dropdown Panel (Auto-closes on select) */}
          {isMobileDojoOpen && (
            <div className="absolute top-full right-0 mt-1 bg-[#121216] border-2 border-amber-400 p-2 shadow-2xl z-50 flex flex-col gap-1 w-64 max-h-[50dvh] overflow-y-auto">
              {dojoTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTool(tab.id);
                    setIsMobileDojoOpen(false);
                    sounds.playMove();
                  }}
                  className={`px-2.5 py-2 text-xs font-black uppercase border flex items-center justify-between cursor-pointer ${
                    activeTool === tab.id
                      ? 'bg-amber-400 text-black border-black'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                  {activeTool === tab.id && <span>✓</span>}
                </button>
              ))}
            </div>
          )}

          {/* Katas Drawer Panel (Auto-closes on select) */}
          {isMobileKatasOpen && activeTool !== 'practice' && activeTool !== 'theory' && (
            <div className="absolute top-full right-0 mt-1 bg-[#121216] border-2 border-amber-400 p-2 shadow-2xl z-50 max-h-[50dvh] overflow-y-auto flex flex-col gap-1 w-72">
              {currentLessons.map((lesson, idx) => {
                const isSelected = idx === activeLessonIndex;
                const isDone = progress.completedKataIds.includes(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      setActiveLessonIndex(idx);
                      setMentorExpression('stern');
                      setMentorMessage(lesson.mentorPrompt);
                      setIsMobileKatasOpen(false);
                      sounds.playMove();
                    }}
                    className={`p-2 border cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-black border-black font-black'
                        : 'bg-neutral-900 text-white border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] mb-0.5">
                      <span className="uppercase">Kata #{idx + 1}</span>
                      {isDone && <span className="text-emerald-400 font-bold">Passed</span>}
                    </div>
                    <div className="text-xs font-black truncate">{lesson.title}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Rank & Trophy */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#121216] px-2 py-1 border border-neutral-700">
            <span className="text-[10px] font-black uppercase text-neutral-400 mr-1">Rank:</span>
            {HASHIRA_RANKS.map((rank) => {
              const isSelected = rank.id === selectedRankId;
              return (
                <button
                  key={rank.id}
                  onClick={() => {
                    setSelectedRankId(rank.id);
                    updateProgress((p) => ({ ...p, selectedRank: rank.id }));
                    sounds.playMove();
                  }}
                  className={`px-2 py-0.5 text-[11px] font-black uppercase border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000] scale-105'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  <span className="font-serif font-bold mr-1 opacity-70">{rank.kanji}</span>
                  <span>{rank.name}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              sounds.playMove();
              setIsTrophyRoomOpen(true);
            }}
            className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Trophies</span>
          </button>
        </div>
      </header>

      {/* 2. Mobile Wide Rectangle Banner for Sensei (Just below top nav) */}
      <div className="lg:hidden bg-[#0b0b0e] border-b border-neutral-800 px-2 py-1 shrink-0 flex flex-col">
        {/* Mobile Collapsible Header for Practice Mode */}
        {activeTool === 'practice' && (
          <div className="flex items-center justify-between pb-1 text-[9px] font-black uppercase text-neutral-400">
            <span className="flex items-center gap-1 text-neutral-300">
              <span className="font-serif">{selectedTrainerId === 'thukuna' ? '宿' : '悟'}</span>
              <span>{selectedTrainerId === 'thukuna' ? 'Thukuna Sensei' : 'Gatoru Sensei'}</span>
            </span>
            <button
              onClick={() => setIsMobileTrainerCollapsed(!isMobileTrainerCollapsed)}
              className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 hover:border-amber-400 text-amber-400 font-mono text-[9px] uppercase flex items-center gap-1 cursor-pointer"
            >
              <span>{isMobileTrainerCollapsed ? 'Expand Sensei ▼' : 'Collapse ▲'}</span>
            </button>
          </div>
        )}

        {/* If practice mode is collapsed, show compact tap bar */}
        {activeTool === 'practice' && isMobileTrainerCollapsed ? (
          <div
            onClick={() => setIsMobileTrainerCollapsed(false)}
            className="w-full py-1 px-2 bg-neutral-900/90 border border-neutral-800 text-[10px] font-bold text-neutral-300 flex items-center justify-between cursor-pointer"
          >
            <span className="truncate">
              🥋 {selectedTrainerId === 'thukuna' ? 'Thukuna' : 'Gatoru Luchha'}: &ldquo;{mentorMessage}&rdquo;
            </span>
            <span className="text-[9px] text-amber-400 shrink-0 ml-1">Expand ▼</span>
          </div>
        ) : (
          <HashiraMentor
            expression={mentorExpression}
            message={mentorMessage}
            hintText={activeLesson?.hint}
            activeHint={activeHintText}
            isCompleted={isCurrentKataCompleted}
            onAskHint={handleSeekHint}
            onReset={handleResetKata}
            onNext={handleNextKata}
            canNext={activeLessonIndex < currentLessons.length - 1}
            rankTitle={currentRankInfo.name}
            kanji={currentRankInfo.kanji}
            trainerId={selectedTrainerId}
            layout="compact"
            flashSuccess={flashSuccess}
          />
        )}
      </div>

      {/* 3. Main Studio Workspace (Desktop 3-Column / Mobile Single Fixed View) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Desktop Left Sidebar: Sensei Avatar & Dialogue */}
        <aside className="hidden lg:flex w-80 h-full flex-col p-3 border-r-2 border-neutral-800 bg-[#0b0b0e] shrink-0 overflow-y-auto">
          <HashiraMentor
            expression={mentorExpression}
            message={mentorMessage}
            hintText={activeLesson?.hint}
            activeHint={activeHintText}
            isCompleted={isCurrentKataCompleted}
            onAskHint={handleSeekHint}
            onReset={handleResetKata}
            onNext={handleNextKata}
            canNext={activeLessonIndex < currentLessons.length - 1}
            rankTitle={currentRankInfo.name}
            kanji={currentRankInfo.kanji}
            trainerId={selectedTrainerId}
            layout="vertical"
            flashSuccess={flashSuccess}
          />

          <div className="mt-3 p-2.5 bg-neutral-900 border border-neutral-800 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-neutral-400">
                {selectedTrainerId === 'gatoru' ? 'Void Hashira Discipline:' : 'Pillar Discipline:'}
              </span>
              <span className={`text-[10px] font-bold ${selectedTrainerId === 'gatoru' ? 'text-sky-400' : 'text-amber-400'}`}>
                {currentRankInfo.element}
              </span>
            </div>
            <p className="text-[11px] font-medium text-neutral-400 leading-tight">
              {currentRankInfo.description}
            </p>
          </div>
        </aside>

        {/* Center Column: Main Fixed Board Stage (Zero Scroll) */}
        <main
          ref={stageRef}
          className="flex-1 min-h-0 min-w-0 flex flex-col items-center justify-center p-1 sm:p-2 lg:p-4 overflow-hidden relative bg-[#070709]"
        >
          {activeTool === 'practice' ? (
            <div className="w-full h-full flex flex-col items-center justify-start overflow-y-auto pb-24 scroll-smooth">
              <PracticeBoard
                rankInfo={currentRankInfo}
                trainerId={selectedTrainerId}
                onReaction={handleMentorReaction}
                onOpenTrophyRoom={() => setIsTrophyRoomOpen(true)}
                onRecordResult={(outcome) => {
                  updateProgress((p) => {
                    const wins = outcome === 'win' ? p.practiceWinsByRank[selectedRankId] + 1 : p.practiceWinsByRank[selectedRankId];
                    const losses = outcome === 'loss' ? p.practiceLossesByRank[selectedRankId] + 1 : p.practiceLossesByRank[selectedRankId];
                    return {
                      ...p,
                      practiceWinsByRank: { ...p.practiceWinsByRank, [selectedRankId]: wins },
                      practiceLossesByRank: { ...p.practiceLossesByRank, [selectedRankId]: losses },
                    };
                  });
                }}
                maxBoardDimension={maxBoardDimension}
              />
            </div>
          ) : activeTool === 'theory' ? (
            <div className="w-full h-full overflow-y-auto p-2">
              <TheoryLibraryView currentRank={selectedRankId} />
            </div>
          ) : activeLesson ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="hidden lg:block mb-1 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Kata #{activeLessonIndex + 1}: {activeLesson.title}
                </span>
              </div>
              <InteractiveKataBoard
                key={activeLesson.id}
                lesson={activeLesson}
                trainerId={selectedTrainerId}
                onComplete={handleKataCompleted}
                onReaction={handleMentorReaction}
                onResetSignal={resetSignal}
                maxBoardDimension={maxBoardDimension}
                onMoveMade={() => setActiveHintText(null)}
                onStepChange={handleStepChange}
                onNext={handleNextKata}
              />
            </div>
          ) : (
            <div className="p-8 bg-neutral-900 border-2 border-neutral-700 text-center text-xs font-bold uppercase text-neutral-400">
              No katas recorded for this rank yet. Select another rank or train in the Practice Board!
            </div>
          )}
        </main>

        {/* Desktop Right Sidebar: Dojo Modes & Lessons List */}
        <aside className="hidden lg:flex w-72 h-full flex-col border-l-2 border-neutral-800 bg-[#0c0c10] shrink-0 select-none overflow-hidden">
          {/* Prominent Red Entry Button for Culling Game Opening Dojo */}
          <div className="p-2 bg-[#0d0a0d] border-b border-red-900">
            <div
              onClick={() => {
                setActiveTool('culling_opening');
                sounds.playMove();
              }}
              className="p-2.5 bg-gradient-to-r from-red-950 via-neutral-900 to-black border-2 border-red-500 hover:border-red-400 text-white cursor-pointer transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] active:scale-[0.99] group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black uppercase text-red-400 tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-400 fill-red-400" />
                  NEW OPENING CLASSROOM
                </span>
                <span className="text-[8px] font-mono font-bold bg-red-900/90 text-red-200 px-1.5 py-0.2 border border-red-500">
                  Tukuna&apos;s Dojo
                </span>
              </div>
              <h3 className="text-xs font-black uppercase text-white tracking-wide group-hover:text-red-300">
                CULLING GAME OPENING DOJO
              </h3>
              <p className="text-[10px] text-neutral-300 font-medium leading-tight mt-0.5">
                Learn openings, protect your Sovereign, and master the battlefield.
              </p>
              <div className="mt-2 text-[10px] font-black uppercase text-red-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Enter Tukuna&apos;s Classroom</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          <div className="flex flex-col p-2.5 bg-[#121216] border-b border-neutral-800">
            <span className="text-[10px] font-black uppercase text-neutral-400 mb-1.5 pl-0.5">
              Select Dojo Mode:
            </span>
            <div className="grid grid-cols-1 gap-1">
              {dojoTabs.map((tab) => {
                const isActive = activeTool === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTool(tab.id);
                      sounds.playMove();
                    }}
                    className={`px-2.5 py-1.5 text-xs font-black uppercase border flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#000]'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-600'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </span>
                    {isActive && <span className="text-[10px]">▶</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTool !== 'practice' && activeTool !== 'theory' ? (
            <div className="flex-1 flex flex-col p-2.5 overflow-hidden">
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-neutral-800">
                <h4 className="text-[11px] font-black uppercase text-neutral-300 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  Katas ({currentLessons.length})
                </h4>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {currentLessons.map((lesson, idx) => {
                  const isSelected = idx === activeLessonIndex;
                  const isDone = progress.completedKataIds.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        setActiveLessonIndex(idx);
                        setMentorExpression('stern');
                        setMentorMessage(lesson.mentorPrompt);
                        sounds.playMove();
                      }}
                      className={`p-2 border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#000]'
                          : 'bg-neutral-900 text-white border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-[9px] font-black uppercase ${isSelected ? 'text-black/70' : 'text-neutral-500'}`}>
                          Kata #{idx + 1}
                        </span>
                        {isDone && (
                          <span className={`text-[9px] font-black flex items-center gap-0.5 ${isSelected ? 'text-black' : 'text-emerald-400'}`}>
                            <CheckCircle2 className="w-3 h-3" />
                            Passed
                          </span>
                        )}
                      </div>
                      <h5 className="text-[11px] font-black uppercase leading-tight line-clamp-1">
                        {lesson.title}
                      </h5>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 p-3 flex flex-col justify-center text-center text-xs font-bold text-neutral-500">
              <p>
                {activeTool === 'practice'
                  ? 'Sparring Arena active. Test strategies against rank bots or analyze positions freely.'
                  : 'Sacred scrolls active. Study master theories and fairy piece geometry.'}
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* 4. Mobile Bottom Navigation Bar (Fixed 1 Single Stripe) */}
      <div className="lg:hidden bg-black border-t-2 border-neutral-800 px-2.5 py-1.5 shrink-0 flex items-center justify-between z-30 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-1.5 min-w-0 pr-2">
          <span className="text-[10px] sm:text-[11px] font-black uppercase text-amber-400 truncate">
            {activeLesson
              ? `Kata #${activeLessonIndex + 1}: ${activeLesson.title}`
              : activeTool === 'practice'
              ? '🥋 Sparring Arena'
              : '📜 Sacred Scrolls'}
          </span>
          {isCurrentKataCompleted && (
            <span className="text-[9px] text-emerald-400 font-bold shrink-0">✓ Passed</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {activeLesson?.hint && (
            <button
              onClick={handleSeekHint}
              className={`px-2 py-1 font-black text-[10px] uppercase border cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                activeHintText
                  ? 'bg-sky-300 text-black border-black shadow-[1px_1px_0px_#000] ring-2 ring-sky-400'
                  : 'bg-sky-400 hover:bg-sky-300 text-black border-black shadow-[1px_1px_0px_#000]'
              }`}
              title="Seek tactical advice from Sensei"
            >
              Hint
            </button>
          )}
          <button
            onClick={handleResetKata}
            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-white font-black text-[10px] uppercase border border-neutral-600 shadow-[1px_1px_0px_#fff] flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            title="Reset current kata"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          {activeLessonIndex < currentLessons.length - 1 && (
            <button
              onClick={handleNextKata}
              className={`px-2 py-1 bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] uppercase border border-black shadow-[1px_1px_0px_#000] flex items-center gap-0.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                isCurrentKataCompleted ? 'animate-pulse' : ''
              }`}
              title="Advance to next kata"
            >
              <span>Next</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Trophy Room Modal */}
      <TrophyRoomModal
        isOpen={isTrophyRoomOpen}
        onClose={() => setIsTrophyRoomOpen(false)}
      />

      {/* Rules & Codex Modals */}
      <RulesModal
        isOpen={isRulebookOpen}
        onClose={() => setIsRulebookOpen(false)}
        isBotMatch={true}
        activeMatch={{ gameMode: activeLesson?.mode || 'standard' } as any}
      />
      <CullingRulesModal
        isOpen={isCullingRulesOpen}
        onClose={() => setIsCullingRulesOpen(false)}
      />
    </div>
  );
};