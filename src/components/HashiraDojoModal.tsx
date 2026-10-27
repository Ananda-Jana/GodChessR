import React, { useState, useEffect } from 'react';
import {
  Flame,
  X,
  Swords,
  BookOpen,
  Sparkles,
  Zap,
  Shield,
  Layers,
  ChevronRight,
  Trophy,
  Award,
  Crosshair,
  ArrowLeft,
} from 'lucide-react';
import { ModeArtPanel } from './ModeArtPanel';
import {
  TRAINER_PROFILES,
  HASHIRA_RANKS,
  loadHashiraProgress,
} from '../training/data';
import type { TrainerId, TrainingToolId, HashiraRankId } from '../training/types';

export interface HashiraDojoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrainerId?: TrainerId;
  onStartTraining: (trainerId: TrainerId, toolId: TrainingToolId) => void;
}

interface DisciplineOption {
  id: TrainingToolId;
  title: string;
  kanji: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  accentBorder: string;
  badgeBg: string;
}

const DOJO_DISCIPLINES: DisciplineOption[] = [
  {
    id: 'opening',
    title: 'Opening Dojo',
    kanji: '序',
    badge: 'Foundations & Center',
    description: 'Pawn structures, Prince piece development, and classical central domination.',
    icon: <Layers className="w-4 h-4 text-amber-400" />,
    accentBorder: 'border-amber-400',
    badgeBg: 'bg-amber-400 text-black',
  },
  {
    id: 'tactics',
    title: 'Tactical Dojo',
    kanji: '技',
    badge: 'Forks, Pins & Mates',
    description: 'Knight forks, skewer attacks, Queen sacrifices, and lethal smothered mates.',
    icon: <Zap className="w-4 h-4 text-sky-400" />,
    accentBorder: 'border-sky-400',
    badgeBg: 'bg-sky-400 text-black',
  },
  {
    id: 'culling',
    title: 'Culling Dojo',
    kanji: '死',
    badge: '88-Square Cross Grid',
    description: 'Sorcerer combat, 5-turn King immunity laws, and character domain abilities.',
    icon: <Crosshair className="w-4 h-4 text-red-500" />,
    accentBorder: 'border-red-500',
    badgeBg: 'bg-red-600 text-white',
  },
  {
    id: 'practice',
    title: 'Sparring Arena',
    kanji: '戦',
    badge: 'Instant Live Match',
    description: 'Free interactive sandbox board and direct practice sparring against your chosen mentor.',
    icon: <Swords className="w-4 h-4 text-emerald-400" />,
    accentBorder: 'border-emerald-400',
    badgeBg: 'bg-emerald-500 text-black',
  },
  {
    id: 'theory',
    title: 'Theory Scrolls',
    kanji: '書',
    badge: 'Sacred Codex',
    description: 'Ancient tactical manuscripts, piece moveset rules, and grandmaster philosophy.',
    icon: <BookOpen className="w-4 h-4 text-purple-400" />,
    accentBorder: 'border-purple-400',
    badgeBg: 'bg-purple-600 text-white',
  },
];

export const HashiraDojoModal: React.FC<HashiraDojoModalProps> = ({
  isOpen,
  onClose,
  initialTrainerId,
  onStartTraining,
}) => {
  const [selectedTrainerId, setSelectedTrainerId] = useState<TrainerId>(
    initialTrainerId || 'thukuna'
  );
  const [selectedToolId, setSelectedToolId] = useState<TrainingToolId>('opening');
  const [progress, setProgress] = useState(() => loadHashiraProgress());

  // Sync initial trainer if prop changes
  useEffect(() => {
    if (initialTrainerId) {
      setSelectedTrainerId(initialTrainerId);
    }
  }, [initialTrainerId]);

  // Refresh progress when modal opens
  useEffect(() => {
    if (isOpen) {
      const current = loadHashiraProgress();
      setProgress(current);
      if (!initialTrainerId && current.selectedTrainerId) {
        setSelectedTrainerId(current.selectedTrainerId);
      }
    }
  }, [isOpen, initialTrainerId]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  // Listen for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTrainer = TRAINER_PROFILES[selectedTrainerId];
  const currentRank =
    HASHIRA_RANKS.find((r) => r.id === (progress.selectedRank || 'mizunoto')) ||
    HASHIRA_RANKS[0];

  // Calculate total completed katas
  const completedKatasCount = progress.completedKataIds?.length || 0;

  const handleLaunch = (overrideToolId?: TrainingToolId) => {
    const tool = overrideToolId || selectedToolId;
    onStartTraining(selectedTrainerId, tool);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/85 backdrop-blur-md overflow-hidden md:overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Hashira Training Dojo Opening Modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-5xl bg-[#0a0a0c] border-t-4 border-x-4 md:border-4 border-black dark:border-white text-white shadow-[6px_6px_0px_#ffffff] md:shadow-[10px_10px_0px_#ffffff] relative flex flex-col md:flex-row rounded-t-2xl md:rounded-none h-[94dvh] md:h-auto max-h-[94dvh] md:max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Hero Banner (160px, md:hidden) */}
        <div className="md:hidden relative h-40 w-full shrink-0 overflow-hidden bg-black select-none border-b-3 border-black dark:border-white">
          <img
            src="/assets/aistudio/image_e0bfff75.png"
            alt="Hashira Training Artwork"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-top filter brightness-105 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-amber-400 text-black border border-black shadow-[1px_1px_0px_#000]">
              鬼殺チェス柱稽古
            </span>
            <span className="text-[10px] font-mono font-bold text-white/90 bg-black/70 px-2 py-0.5 border border-white/20">
              {currentRank.element.toUpperCase()} · TIER {currentRank.tierNumber}
            </span>
          </div>
        </div>

        {/* Desktop Left Artwork Panel (hidden on mobile, kept pristine for desktop) */}
        <ModeArtPanel
          modeKey="hashira-training"
          title="Hashira Dojo"
          subtitle="鬼殺チェス柱稽古 · 6 Pillar Ranks"
        />

        {/* Right Configuration & Selection Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="px-4 md:px-6 py-3.5 md:py-4 border-b-3 border-black dark:border-white bg-[#0e1015] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <button
                type="button"
                onClick={onClose}
                className="min-w-[40px] min-h-[40px] px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border-2 border-white text-white flex items-center justify-center rounded-lg gap-1.5 shadow-[2px_2px_0px_#fff] text-xs font-bold uppercase cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="w-8 h-8 md:w-9 md:h-9 bg-amber-400 text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] shrink-0">
                <Flame className="w-4 h-4 md:w-5 md:h-5 fill-black" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm md:text-lg font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                    Hashira Training Dojo
                    <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-950/60 px-1.5 py-0.2 border border-amber-500/40">
                      柱稽古
                    </span>
                  </h2>
                </div>
                <p className="text-[10px] md:text-xs text-neutral-400 font-bold truncate max-w-xs sm:max-w-md">
                  Train under legendary Sensei across 6 ranks. Master Openings, Tactics & Sorcerer Katas.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] p-2 bg-red-600 hover:bg-red-700 active:translate-x-0.5 active:translate-y-0.5 border-2 border-black text-white flex items-center justify-center shadow-[2px_2px_0px_#000] rounded-lg cursor-pointer shrink-0"
              aria-label="Close Hashira Dojo Modal"
              title="Close"
            >
              <X className="w-4 h-4 text-white stroke-[2.5]" />
            </button>
          </div>

          {/* Desktop Sticky Top Quick Action Bar */}
          <div className="hidden md:flex items-center justify-between gap-3 p-3 border-b-3 border-black dark:border-white bg-amber-400 text-black shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs font-black uppercase">
              <Sparkles className="w-4 h-4 text-black" />
              <span>
                Selected: {currentTrainer.name} ({currentTrainer.title}) ·{' '}
                {DOJO_DISCIPLINES.find((d) => d.id === selectedToolId)?.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleLaunch('practice')}
                className="py-1.5 px-3 bg-white text-black hover:bg-neutral-100 border-2 border-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                <Swords className="w-3.5 h-3.5 text-black" />
                Quick Sparring
              </button>
              <button
                type="button"
                onClick={() => handleLaunch()}
                className="py-1.5 px-4 bg-black text-amber-400 hover:bg-neutral-900 border-2 border-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Enter Dojo Hub
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 p-3.5 md:p-5 overflow-y-auto overscroll-contain space-y-4 text-xs font-bold">
            {/* Section 1: Choose Your Sensei / Mentor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Step 1: Choose Your Master Sensei
                </label>
                <span className="text-[10px] font-mono text-neutral-400">
                  Dual-Mentor Studio
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(['thukuna', 'gatoru'] as TrainerId[]).map((trainerId) => {
                  const trainer = TRAINER_PROFILES[trainerId];
                  const isSelected = selectedTrainerId === trainerId;
                  const isThukuna = trainerId === 'thukuna';

                  return (
                    <div
                      key={trainer.id}
                      onClick={() => setSelectedTrainerId(trainer.id)}
                      className={`min-h-[58px] p-2.5 sm:p-3 border-3 cursor-pointer transition-all relative overflow-hidden flex items-center gap-3 ${
                        isSelected
                          ? isThukuna
                            ? 'bg-red-950/50 border-amber-400 shadow-[3px_3px_0px_#fbbf24]'
                            : 'bg-sky-950/50 border-sky-400 shadow-[3px_3px_0px_#38bdf8]'
                          : 'bg-[#121318] border-neutral-700 hover:border-neutral-500'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-none border-2 overflow-hidden bg-black ${
                          isSelected
                            ? isThukuna
                              ? 'border-amber-400 shadow-[1px_1px_0px_#fbbf24]'
                              : 'border-sky-400 shadow-[1px_1px_0px_#38bdf8]'
                            : 'border-neutral-600'
                        }`}
                      >
                        <img
                          src={trainer.avatarSrc}
                          alt={trainer.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-xs sm:text-sm uppercase text-white tracking-wide">
                            {trainer.name}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.2 border border-black shadow-[1px_1px_0px_#000] ${
                              isThukuna
                                ? 'bg-red-600 text-white'
                                : 'bg-sky-500 text-black'
                            }`}
                          >
                            {trainer.kanji} · {isThukuna ? 'Plasma' : 'Void'}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-neutral-300 mt-0.5 truncate">
                          {trainer.title}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5 line-clamp-1 italic">
                          "{trainer.greetingPrompt}"
                        </p>
                      </div>

                      {/* Selected Radio Pill */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? isThukuna
                              ? 'border-amber-400 bg-amber-400 text-black'
                              : 'border-sky-400 bg-sky-400 text-black'
                            : 'border-neutral-600 bg-transparent'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Choose Dojo Discipline / Kata Focus */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Step 2: Select Training Discipline
                </label>
                <span className="text-[10px] font-mono text-neutral-400">
                  5 Specialist Katas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {DOJO_DISCIPLINES.map((discipline) => {
                  const isSelected = selectedToolId === discipline.id;

                  return (
                    <button
                      key={discipline.id}
                      type="button"
                      onClick={() => setSelectedToolId(discipline.id)}
                      className={`min-h-[52px] p-2.5 text-left border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? `bg-[#1a1c24] ${discipline.accentBorder} shadow-[3px_3px_0px_#ffffff]`
                          : 'bg-[#121318] border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      <div className="p-1.5 bg-black border border-neutral-700 shrink-0 mt-0.5">
                        {discipline.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-black text-xs uppercase text-white truncate">
                            {discipline.title}
                          </span>
                          <span
                            className={`text-[8px] font-black uppercase px-1 py-0.2 border border-black ${discipline.badgeBg} shrink-0`}
                          >
                            {discipline.kanji}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-neutral-400 mt-0.5 line-clamp-1">
                          {discipline.badge}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Hashira Rank & Progression Card */}
            <div className="p-3 bg-[#121318] border-2 border-neutral-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 shrink-0 border-2 border-black flex flex-col items-center justify-center font-black text-black shadow-[2px_2px_0px_#fff]"
                  style={{ backgroundColor: currentRank.accentColor }}
                >
                  <span className="text-xs leading-none">{currentRank.kanji}</span>
                  <span className="text-[8px] font-mono leading-none">
                    T{currentRank.tierNumber}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-xs uppercase text-white">
                      Your Current Rank: {currentRank.name}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/70 px-1.5 py-0.2 border border-amber-500/40">
                      {currentRank.element}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-medium mt-0.5">
                    {currentRank.subtitle} · Sparring Engine Depth {currentRank.botDifficulty.depth}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <div className="text-right">
                  <span className="text-[9px] font-mono uppercase text-neutral-500 block">
                    Mastered Katas
                  </span>
                  <span className="text-xs font-mono font-black text-amber-400">
                    {completedKatasCount} Solved
                  </span>
                </div>
                <div className="w-8 h-8 bg-neutral-900 border border-neutral-700 flex items-center justify-center text-amber-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Sticky Bottom Action Bar (md:hidden) */}
          <div className="md:hidden p-3 border-t-3 border-black dark:border-white bg-[#0a0a0c] shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))] space-y-2">
            <button
              type="button"
              onClick={() => handleLaunch()}
              className="w-full min-h-[46px] py-3 px-4 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
            >
              <Flame className="w-4 h-4 fill-black" />
              <span>
                Enter Dojo · {DOJO_DISCIPLINES.find((d) => d.id === selectedToolId)?.title}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleLaunch('practice')}
              className="w-full min-h-[44px] py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white border-2 border-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Sparring vs. {currentTrainer.name}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
