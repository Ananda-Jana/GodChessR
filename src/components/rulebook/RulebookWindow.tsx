import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  X,
  Bot,
  Sparkles,
  Flame,
  Heart,
  Users,
  Compass,
  Shield,
  ChevronDown,
  ChevronUp,
  Target,
  Crown,
  Zap,
  Check,
  ChevronRight,
} from 'lucide-react';
import { RulebookModeId, RulebookSubTab, TacticalOpening } from './types';
import { RULEBOOK_MODES, getRulebookDataByMode } from './rulebookData';
import { RulebookBoardDiagram } from './RulebookBoardDiagram';
import { MatchState } from '../../types/game';
import { useModalFocus } from '../../utils/useModalFocus';
import {
  ALL_PIECE_MOVEMENTS,
  LEAPING_PIECES,
  PieceMovementDef,
} from './pieceMovementData';
import { PieceMovementGrid } from './PieceMovementGrid';
import {
  CULLING_ABILITY_SCENARIOS,
} from './cullingAbilityScenarios';
import { CullingAbilityScenarioCard } from './CullingAbilityScenarioCard';

export interface RulebookWindowProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: RulebookModeId;
  initialSubTab?: RulebookSubTab;
  activeMatch?: MatchState | null;
  isBotMatch?: boolean;
  isModal?: boolean;
}

type MovementBookFilter = 'all' | 'leaping' | 'culling_abilities' | 'crafted' | 'standard';

export const RulebookWindow: React.FC<RulebookWindowProps> = ({
  isOpen,
  onClose,
  initialMode,
  initialSubTab,
  activeMatch,
  isBotMatch,
  isModal = false,
}) => {
  const modalRef = useModalFocus(isOpen, onClose, true);

  // Auto-detect mode if match is active or initialMode is supplied
  const detectedMode: RulebookModeId = useMemo(() => {
    if (initialMode) return initialMode;
    if (activeMatch) {
      if (activeMatch.id?.startsWith('culling_') || (activeMatch as any).isCulling) {
        return 'culling';
      }
      if (activeMatch.id?.startsWith('rose_') || (activeMatch as any).isRose) {
        return 'rose';
      }
      const isBot = Boolean(
        isBotMatch ||
        activeMatch.id?.startsWith('bot_match') ||
        activeMatch.whitePlayer?.userId === 'usr_bot_gm' ||
        activeMatch.blackPlayer?.userId === 'usr_bot_gm'
      );
      if (isBot) {
        if (activeMatch.gameMode === 'classic') return 'classic';
        return activeMatch.gameMode === 'crafted' ? 'crafted' : 'standard';
      }
      if (activeMatch.gameMode === 'classic') return 'classic';
      return 'multiplayer';
    }
    return 'standard';
  }, [initialMode, activeMatch, isBotMatch]);

  const [selectedMode, setSelectedMode] = useState<RulebookModeId>(detectedMode);
  const [selectedSubTab, setSelectedSubTab] = useState<RulebookSubTab>(
    initialSubTab || (detectedMode === 'culling' ? 'movement_book' : 'overview')
  );
  const [selectedOpeningId, setSelectedOpeningId] = useState<string>('');

  // Mobile mode bar expand/collapse
  const [isMobileModesExpanded, setIsMobileModesExpanded] = useState(false);

  // Movement Book internal filter
  const [movementFilter, setMovementFilter] = useState<MovementBookFilter>(
    detectedMode === 'culling' ? 'culling_abilities' : 'all'
  );

  // Inline expanded piece previews in Rules & Movement
  const [expandedPieceIds, setExpandedPieceIds] = useState<Set<string>>(new Set());

  const togglePieceExpanded = (id: string) => {
    setExpandedPieceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const prevIsOpenRef = useRef(false);

  // Sync mode ONLY when modal transforms from closed to open
  // (Prevents background match clock ticks or re-renders from snapping scroll position back to top)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setSelectedMode(detectedMode);
      const targetSubTab = initialSubTab || (detectedMode === 'culling' ? 'movement_book' : 'overview');
      setSelectedSubTab(targetSubTab);
      if (detectedMode === 'culling' && targetSubTab === 'movement_book') {
        setMovementFilter('culling_abilities');
      } else {
        setMovementFilter('all');
      }
      setIsMobileModesExpanded(false);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Mode Data
  const currentModeData = useMemo(() => {
    return getRulebookDataByMode(selectedMode);
  }, [selectedMode]);

  // Sync opening selection when mode changes
  useEffect(() => {
    if (currentModeData.strategy.openings.length > 0) {
      setSelectedOpeningId(currentModeData.strategy.openings[0].id);
    } else {
      setSelectedOpeningId('');
    }
  }, [currentModeData]);

  const activeOpening: TacticalOpening | undefined = useMemo(() => {
    return (
      currentModeData.strategy.openings.find((o) => o.id === selectedOpeningId) ||
      currentModeData.strategy.openings[0]
    );
  }, [currentModeData, selectedOpeningId]);

  // Filtered pieces for Movement Book (Standard/Original pieces come first)
  const filteredMovementPieces = useMemo(() => {
    if (movementFilter === 'leaping') {
      return LEAPING_PIECES;
    }
    if (movementFilter === 'crafted') {
      return ALL_PIECE_MOVEMENTS.filter((p) => p.category === 'crafted');
    }
    if (movementFilter === 'standard') {
      return ALL_PIECE_MOVEMENTS.filter((p) => p.category === 'standard');
    }
    if (movementFilter === 'culling_abilities') {
      return ALL_PIECE_MOVEMENTS.filter((p) => p.category === 'culling');
    }
    const standard = ALL_PIECE_MOVEMENTS.filter((p) => p.category === 'standard');
    const crafted = ALL_PIECE_MOVEMENTS.filter((p) => p.category === 'crafted');
    const rose = ALL_PIECE_MOVEMENTS.filter((p) => p.category === 'rose');
    const culling = ALL_PIECE_MOVEMENTS.filter((p) => p.category === 'culling');
    return [...standard, ...crafted, ...rose, ...culling];
  }, [movementFilter]);

  // Auto-scroll active section tab into view on mobile without state side-effects
  const subtabRowRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (subtabRowRef.current) {
      const activeBtn = subtabRowRef.current.querySelector<HTMLElement>('[aria-selected="true"]');
      if (activeBtn) {
        const prefersReduced =
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        activeBtn.scrollIntoView({
          inline: 'center',
          block: 'nearest',
          behavior: prefersReduced ? 'auto' : 'smooth',
        });
      }
    }
  }, [selectedSubTab]);

  if (!isOpen) return null;

  const isInMatch = Boolean(activeMatch);

  // Subtab meta map
  const subtabsList: { id: RulebookSubTab; fullLabel: string; mobileLabel: string; icon: React.ReactNode }[] = [
    { id: 'overview', fullLabel: 'Overview', mobileLabel: 'Overview', icon: <Compass className="w-4 h-4 shrink-0" /> },
    { id: 'rules', fullLabel: 'Rules & Movement', mobileLabel: 'Rules', icon: <BookOpen className="w-4 h-4 shrink-0" /> },
    { id: 'movement_book', fullLabel: 'Movement & Ability Book', mobileLabel: 'Moves', icon: <Zap className="w-4 h-4 shrink-0" /> },
    { id: 'strategy', fullLabel: 'Strategy Playbook', mobileLabel: 'Strategy', icon: <Target className="w-4 h-4 shrink-0" /> },
  ];

  const currentSubTabObj = subtabsList.find((s) => s.id === selectedSubTab) || subtabsList[0];

  const renderModeIcon = (modeId: RulebookModeId) => {
    switch (modeId) {
      case 'classic': return <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'standard': return <Bot className="w-3.5 h-3.5 text-zinc-300 shrink-0" />;
      case 'crafted': return <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      case 'culling': return <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />;
      case 'rose': return <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'training': return <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'multiplayer': return <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    }
  };

  const innerContent = (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-white select-text overflow-hidden relative">
      {/* ================= 1. GLASS HEADER ================= */}
      <header className="shrink-0 bg-zinc-950/95 supports-[backdrop-filter]:bg-zinc-950/65 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150 border-b border-white/10 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 z-30 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-lg flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-black uppercase tracking-tight truncate flex items-center gap-2">
              <span>MugenChessX Codex</span>
              <span className="hidden md:inline px-1.5 py-0.5 bg-zinc-900 text-amber-400 border border-zinc-700 text-[10px] font-mono rounded">
                {isModal ? 'QUICK MODAL' : 'OFFICIAL RULEBOOK'}
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-normal hidden md:block truncate">
              Comprehensive game mode mechanics, leaping compendium, and tactical scenario blueprints
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClose}
            aria-label="Close rulebook"
            title="Close Rulebook (Esc)"
            className={`min-w-[44px] min-h-[44px] h-10 px-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase border border-white/20 rounded-lg flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              isModal ? 'ring-2 ring-amber-400 font-extrabold animate-pulse' : ''
            }`}
          >
            <X className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{isModal ? 'Close & Play' : 'Close'}</span>
          </button>
        </div>
      </header>

      {/* ================= IN-MATCH ACTIVE BANNER ================= */}
      {isInMatch && (
        <div className="shrink-0 px-3 sm:px-6 py-1.5 bg-amber-400 text-black font-mono text-xs font-bold flex items-center justify-between gap-2 border-b border-black">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 bg-black shrink-0 animate-ping rounded-full" />
            <span className="uppercase font-black truncate">
              ★ Active Match: {currentModeData.title}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold shrink-0 opacity-80 hidden sm:inline">
            Press ESC or Close to return to your move
          </span>
        </div>
      )}

      {/* ================= 2. STICKY GLASS NAVIGATION BLOCK ================= */}
      <div className="shrink-0 bg-zinc-950/95 supports-[backdrop-filter]:bg-zinc-950/65 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150 border-b border-white/10 px-3 sm:px-6 py-2 space-y-2 z-20 sticky top-0">
        
        {/* Tier 1: Mode Picker (Mobile Dropdown Trigger / Desktop Flex Wrap Strip) */}
        <div className="relative">
          {/* Mobile Single Full-Width Trigger Button */}
          <button
            onClick={() => setIsMobileModesExpanded((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isMobileModesExpanded}
            aria-controls="mobile-modes-list"
            className="md:hidden w-full min-h-[48px] px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-white/10 rounded-lg text-xs font-mono font-bold uppercase flex items-center justify-between gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-zinc-400 font-normal">Game mode:</span>
              <span className="text-amber-400 font-black truncate">{currentModeData.badge}</span>
              <span className="text-[10px] text-zinc-500 font-mono">(7)</span>
            </div>
            {isMobileModesExpanded ? (
              <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-400 shrink-0" />
            )}
          </button>

          {/* Mobile Overlay Dropdown Panel (Overlay content, max-h-[60dvh]) */}
          {isMobileModesExpanded && (
            <div
              id="mobile-modes-list"
              role="listbox"
              aria-label="Game modes"
              className="md:hidden absolute top-full left-0 right-0 z-30 bg-zinc-950 border-b border-white/10 max-h-[60dvh] overflow-y-auto shadow-2xl p-2 flex flex-col gap-1 rounded-b-xl border-x"
            >
              {RULEBOOK_MODES.map((mode) => {
                const isActive = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      setSelectedMode(mode.id);
                      setSelectedSubTab('overview');
                      setIsMobileModesExpanded(false);
                    }}
                    className={`min-h-[48px] w-full px-4 py-3 text-xs font-black uppercase rounded-lg border text-left flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? 'bg-amber-400 text-black border-amber-400 font-black border-l-4'
                        : 'bg-zinc-900/80 text-zinc-300 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {renderModeIcon(mode.id)}
                      <span>{mode.badge}</span>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-black shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Desktop Flex-Wrap Mode Tab Strip */}
          <div className="hidden md:flex flex-wrap items-center gap-1.5 sm:gap-2">
            {RULEBOOK_MODES.map((mode) => {
              const isActive = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    setSelectedMode(mode.id);
                    setSelectedSubTab('overview');
                    setIsMobileModesExpanded(false);
                  }}
                  className={`h-10 px-3.5 py-2 text-xs font-black uppercase whitespace-nowrap border rounded-lg transition-all cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isActive
                      ? 'bg-amber-400 text-black border-amber-400 font-black shadow-[2px_2px_0px_#000]'
                      : 'bg-transparent text-zinc-300 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {renderModeIcon(mode.id)}
                  <span>{mode.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier 2: Section Tabs (Single horizontal scroll row on mobile with right gradient fade) */}
        <div className="relative">
          <div
            ref={subtabRowRef}
            role="tablist"
            aria-label="Rulebook sections"
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none snap-x py-0.5"
          >
            {subtabsList.map((tab) => {
              const isActive = selectedSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`subtab-${tab.id}`}
                  aria-controls={`subtabpanel-${tab.id}`}
                  aria-selected={isActive}
                  aria-label={tab.fullLabel}
                  onClick={() => {
                    setSelectedSubTab(tab.id);
                    if (tab.id === 'movement_book') {
                      if (selectedMode === 'culling') {
                        setMovementFilter('culling_abilities');
                      } else if (selectedMode === 'crafted') {
                        setMovementFilter('crafted');
                      } else {
                        setMovementFilter('all');
                      }
                    }
                  }}
                  className={`min-h-[44px] px-3 sm:px-4 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-3 snap-start whitespace-nowrap flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isActive
                      ? 'border-amber-400 text-white bg-amber-400/10'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.fullLabel}</span>
                  <span className="sm:hidden">{tab.mobileLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Right Edge Gradient Fade on Mobile */}
          <div
            aria-hidden="true"
            className="md:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-zinc-950 to-transparent"
          />
        </div>

        {/* One-Line Breadcrumb Bar */}
        <div className="hidden sm:flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Codex Location:</span>
            <span className="text-amber-400 font-bold">{currentModeData.title}</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-zinc-200 font-bold">{currentSubTabObj.fullLabel}</span>
          </div>
          <span className="text-zinc-500 uppercase">{currentModeData.badge}</span>
        </div>
      </div>

      {/* ================= 3. SCROLLABLE CONTENT STAGE ================= */}
      <main
        role="tabpanel"
        id={`subtabpanel-${selectedSubTab}`}
        aria-labelledby={`subtab-${selectedSubTab}`}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto focus:outline-none touch-pan-y"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {/* ================= SUB-TAB 1: OVERVIEW ================= */}
        {selectedSubTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
            {/* Hero Header Card */}
            <div className="border border-white/10 border-l-4 border-l-amber-400 p-4 sm:p-5 bg-zinc-900/90 rounded-xl shadow-sm max-w-4xl">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider font-mono rounded">
                  {currentModeData.badge}
                </span>
                <span className="text-xs text-zinc-300 font-mono flex-wrap">
                  Time Control: {currentModeData.overview.timeControl}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white">
                {currentModeData.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 font-mono mt-1">
                {currentModeData.subtitle}
              </p>
              <div className="mt-4 p-3 bg-zinc-950/80 border border-white/10 rounded-lg text-sm sm:text-base text-zinc-200 leading-relaxed font-sans">
                <strong className="text-amber-400">Primary Objective:</strong> {currentModeData.overview.objective}
              </div>
            </div>

            {/* Geometry & Armies Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              <div className="p-4 bg-zinc-900/90 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase mb-1">
                  <Compass className="w-4 h-4" />
                  <span>Board Geometry</span>
                </div>
                <p className="text-sm text-zinc-200 font-mono leading-relaxed">
                  {currentModeData.overview.boardGeometry}
                </p>
              </div>

              <div className="p-4 bg-zinc-900/90 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase mb-1">
                  <Crown className="w-4 h-4" />
                  <span>Starting Army Configuration</span>
                </div>
                <p className="text-sm text-zinc-200 font-mono leading-relaxed">
                  {currentModeData.overview.armySize}
                </p>
              </div>
            </div>

            {/* Key Mode Highlights */}
            <div className="space-y-3 max-w-4xl">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Distinctive Mode Highlights</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentModeData.overview.keyHighlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-zinc-900/90 border border-white/10 rounded-xl hover:border-amber-400/50 transition-colors flex flex-col justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-xs font-black uppercase text-amber-400 mb-1">
                        {hl.title}
                      </h4>
                      <p className="text-sm text-zinc-200 font-normal leading-relaxed">
                        {hl.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Win & Draw Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              <div className="p-4 bg-zinc-900/90 border border-emerald-500/30 border-l-4 border-l-emerald-400 rounded-xl">
                <h4 className="text-xs font-black uppercase text-emerald-400 mb-2 flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  <span>Win Conditions</span>
                </h4>
                <ul className="space-y-1.5 text-sm text-zinc-200 leading-relaxed">
                  {currentModeData.overview.winConditions.map((cond, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-zinc-900/90 border border-white/10 rounded-xl">
                <h4 className="text-xs font-black uppercase text-zinc-300 mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Draw / Concession Conditions</span>
                </h4>
                <ul className="space-y-1.5 text-sm text-zinc-300 leading-relaxed">
                  {currentModeData.overview.drawConditions.map((cond, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-zinc-500 font-bold">·</span>
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ================= SUB-TAB 2: RULES & MOVEMENT (WITH INLINE PREVIEWS) ================= */}
        {selectedSubTab === 'rules' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
            <div className="border border-white/10 border-l-4 border-l-amber-400 p-4 sm:p-5 bg-zinc-900/90 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-4xl">
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase text-amber-400 mb-1">
                  {currentModeData.title} — Official Movement & Invariants
                </h3>
                <p className="text-sm text-zinc-200 font-normal leading-relaxed">
                  The strict rules governing piece trajectories, special abilities, and game state transitions.
                </p>
              </div>

              {/* Quick shortcut to Movement Theory */}
              <button
                onClick={() => setSelectedSubTab('movement_book')}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded-lg border border-black shadow-sm shrink-0 cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Zap className="w-4 h-4 text-black" />
                <span>Open Movement Book</span>
              </button>
            </div>

            {/* Sections */}
            <div className="space-y-4 sm:space-y-6 max-w-4xl">
              {currentModeData.rules.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 bg-zinc-900/90 border border-white/10 rounded-xl space-y-3"
                >
                  <h4 className="text-xs sm:text-sm font-black uppercase text-white flex items-center gap-2 border-b border-white/10 pb-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full" />
                    <span>{sec.title}</span>
                  </h4>
                  <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                    {sec.content}
                  </p>

                  {sec.items && sec.items.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {sec.items.map((item, itemIdx) => {
                        const matchedPiece = ALL_PIECE_MOVEMENTS.find(
                          (p) =>
                            p.name.toLowerCase().includes(item.name.toLowerCase()) ||
                            item.name.toLowerCase().includes(p.name.toLowerCase())
                        );
                        const isExpanded = matchedPiece ? expandedPieceIds.has(matchedPiece.id) : false;

                        return (
                          <div
                            key={itemIdx}
                            className="p-3.5 bg-zinc-950/80 border border-white/10 rounded-lg flex flex-col justify-between gap-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-black uppercase text-amber-300">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-1">
                                {item.badge && (
                                  <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-mono uppercase rounded">
                                    {item.badge}
                                  </span>
                                )}
                                {matchedPiece && (
                                  <button
                                    onClick={() => togglePieceExpanded(matchedPiece.id)}
                                    className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-600 text-[10px] font-mono font-bold uppercase cursor-pointer rounded"
                                    title="Toggle Movement Preview Grid"
                                  >
                                    {isExpanded ? 'Hide Grid ▲' : 'View Grid ▼'}
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-zinc-200 font-normal leading-relaxed">
                              {item.details}
                            </p>

                            {/* Inline Expandable Movement Grid */}
                            {matchedPiece && isExpanded && (
                              <div className="pt-2 border-t border-white/10 animate-in fade-in duration-150 flex flex-col items-center">
                                <PieceMovementGrid item={matchedPiece} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SUB-TAB 3: MOVEMENT & ABILITY BOOK ================= */}
        {selectedSubTab === 'movement_book' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
            {/* Header Banner */}
            <div className="bg-zinc-900/90 border border-white/10 border-l-4 border-l-amber-400 p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-lg flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                    Movement & Ability Encyclopedia
                  </h3>
                  <p className="text-xs text-zinc-300 font-mono">
                    Visual 9×9 / 7×7 movement grids, leaping unit compendium, and Culling Game sorcery scenarios.
                  </p>
                </div>
              </div>

              {/* Tier 3 Pill Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono font-bold">
                <button
                  onClick={() => setMovementFilter('all')}
                  className={`px-3 py-1 text-xs uppercase rounded-full border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    movementFilter === 'all'
                      ? 'border-amber-400 bg-amber-400/15 text-amber-300 font-bold'
                      : 'border-white/10 bg-zinc-900 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  All ({ALL_PIECE_MOVEMENTS.length})
                </button>
                <button
                  onClick={() => setMovementFilter('standard')}
                  className={`px-3 py-1 text-xs uppercase rounded-full border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    movementFilter === 'standard'
                      ? 'border-amber-400 bg-amber-400/15 text-amber-300 font-bold'
                      : 'border-white/10 bg-zinc-900 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  Standard (5)
                </button>
                <button
                  onClick={() => setMovementFilter('leaping')}
                  className={`px-3 py-1 text-xs uppercase rounded-full border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    movementFilter === 'leaping'
                      ? 'border-emerald-400 bg-emerald-400/15 text-emerald-300 font-bold'
                      : 'border-white/10 bg-zinc-900 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  Leaping ({LEAPING_PIECES.length})
                </button>
                <button
                  onClick={() => setMovementFilter('culling_abilities')}
                  className={`px-3 py-1 text-xs uppercase rounded-full border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    movementFilter === 'culling_abilities'
                      ? 'border-red-400 bg-red-400/15 text-red-300 font-bold'
                      : 'border-white/10 bg-zinc-900 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  Culling Sorcery ({CULLING_ABILITY_SCENARIOS.length})
                </button>
                <button
                  onClick={() => setMovementFilter('crafted')}
                  className={`px-3 py-1 text-xs uppercase rounded-full border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    movementFilter === 'crafted'
                      ? 'border-cyan-400 bg-cyan-400/15 text-cyan-300 font-bold'
                      : 'border-white/10 bg-zinc-900 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  Crafted (3)
                </button>
              </div>
            </div>

            {/* Prominent Banner to Culling Game Rules */}
            <div className="p-4 bg-red-950/40 border border-red-500/50 border-l-4 border-l-red-500 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
                <div>
                  <span className="text-xs font-black uppercase text-red-400 block">
                    Looking for Jujutsu Kaisen Culling Sorcery & Abilities?
                  </span>
                  <span className="text-xs text-zinc-300 font-mono">
                    Jump directly to Culling Game Mode mechanics or view sorcery scenarios below.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('culling');
                  setSelectedSubTab('rules');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase rounded-lg border border-white/20 shadow-sm cursor-pointer whitespace-nowrap active:scale-95 transition-all flex items-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Flame className="w-4 h-4 text-white" />
                <span>Read Culling Game Rules</span>
              </button>
            </div>

            {/* SECTION A: PIECE MOVEMENT MATRICES */}
            {movementFilter !== 'culling_abilities' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="text-xs sm:text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Piece Movement Matrices (Original & Custom Units)</span>
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Showing {filteredMovementPieces.length} pieces
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredMovementPieces.map((item) => (
                    <div
                      key={item.id}
                      className="bg-zinc-900/90 border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-black uppercase text-white tracking-wide">
                              {item.name}
                            </h4>
                            <span className="text-[10px] font-mono text-amber-400">
                              {item.modeBadge}
                            </span>
                          </div>
                          {item.canLeap && (
                            <span className="px-2 py-0.5 bg-emerald-500 text-black font-black text-[9px] uppercase font-mono rounded">
                              Leaper
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-300 font-mono mb-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="p-2.5 bg-zinc-950/80 border border-white/10 rounded-lg text-xs font-mono text-zinc-200">
                          <span className="text-[10px] text-amber-400 font-bold uppercase block mb-0.5">
                            Movement Trajectory:
                          </span>
                          {item.movementText}
                        </div>
                      </div>

                      {/* Visual Movement Grid Component */}
                      <div className="pt-2 border-t border-white/10 flex flex-col items-center">
                        <PieceMovementGrid item={item} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION B: LEAPING UNITS COMPENDIUM */}
            {(movementFilter === 'leaping' || movementFilter === 'all') && (
              <div className="p-4 sm:p-5 bg-zinc-900/90 border border-emerald-500/30 border-l-4 border-l-emerald-400 rounded-xl space-y-4">
                <div className="border-b border-white/10 pb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-400 rounded-full" />
                    <h4 className="text-xs sm:text-sm font-black uppercase text-emerald-400 tracking-wider">
                      Compendium of All Leaping Units across MugenChessX
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-300 uppercase">
                    10 Total Leaping Units Identified
                  </span>
                </div>

                <p className="text-xs text-zinc-200 font-mono leading-relaxed">
                  Leaping units possess the rare tactical privilege of jumping directly over intervening friendly or enemy pieces without being blocked.
                </p>

                {/* Leap Geometries Summary Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-zinc-950/80 border border-white/10 rounded-lg">
                    <span className="text-amber-400 font-bold block mb-1">1. 2×1 Knight L-Hop:</span>
                    <span className="text-zinc-300 text-[11px] leading-relaxed block">
                      Standard Knight, The Prince, Panda (Bulwark) / Yorozu (Bulwark). Jumps 2 squares in one axis and 1 square perpendicularly.
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-950/80 border border-white/10 rounded-lg">
                    <span className="text-sky-400 font-bold block mb-1">2. 2-Square Orthogonal Leap:</span>
                    <span className="text-zinc-300 text-[11px] leading-relaxed block">
                      Priest, Cupid Priest, Maki Zenin / Naoya Zenin. Leaps exactly 2 squares vertically or horizontally.
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-950/80 border border-white/10 rounded-lg">
                    <span className="text-amber-300 font-bold block mb-1">3. 2-Square Diagonal Leap:</span>
                    <span className="text-zinc-300 text-[11px] leading-relaxed block">
                      Supreme Rook, Rose Tower. Jumps 2 squares along diagonals over pawn walls.
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-950/80 border border-white/10 rounded-lg">
                    <span className="text-red-400 font-bold block mb-1">4. Alternating Zigzag Hop:</span>
                    <span className="text-zinc-300 text-[11px] leading-relaxed block">
                      Communist, Thorn Guard. Zigzags ±2 or ±4 squares along orthogonal vectors.
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-950/80 border border-white/10 rounded-lg sm:col-span-2 lg:col-span-1">
                    <span className="text-purple-400 font-bold block mb-1">5. Domain Step Evasion Leap:</span>
                    <span className="text-zinc-300 text-[11px] leading-relaxed block">
                      Satoru Gojo / Ryomen Sukuna. Once per game: jumps 2 squares in all 8 directions to an unattacked empty square.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION C: CULLING SORCERY SCENARIOS */}
            {(movementFilter === 'culling_abilities' || movementFilter === 'all') && (
              <div className="space-y-4">
                <div className="p-4 bg-red-950/40 border border-red-500/50 border-l-4 border-l-red-500 rounded-xl flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black uppercase text-red-400 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-400" />
                      <span>Culling Game Sorcery Scenarios & Tactical Vector Breakdowns</span>
                    </h4>
                    <p className="text-xs text-zinc-300 font-mono mt-0.5">
                      Static scenario boards with annotated strike lines and student takeaways.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {CULLING_ABILITY_SCENARIOS.map((scenario) => (
                    <CullingAbilityScenarioCard key={scenario.id} scenario={scenario} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SUB-TAB 4: STRATEGY PLAYBOOK ================= */}
        {selectedSubTab === 'strategy' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
            {/* Tactical Principles Bar */}
            <div className="p-4 bg-zinc-900/90 border border-white/10 rounded-xl">
              <h3 className="text-xs font-black uppercase text-amber-400 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Governing Strategic Principles</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-zinc-200">
                {currentModeData.strategy.tacticalPrinciples.map((principle, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-950/80 border-l-2 border-amber-400 rounded-r-lg flex items-start gap-2"
                  >
                    <span className="text-amber-400 font-mono font-bold shrink-0">{idx + 1}.</span>
                    <span className="leading-snug font-sans text-sm text-zinc-200">{principle}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Opening Selector Buttons */}
            {currentModeData.strategy.openings.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold shrink-0">
                  Select Opening Scenario:
                </span>
                {currentModeData.strategy.openings.map((opening) => {
                  const isSelected = activeOpening?.id === opening.id;
                  return (
                    <button
                      key={opening.id}
                      onClick={() => setSelectedOpeningId(opening.id)}
                      className={`px-3 py-1.5 text-xs font-black uppercase border rounded-lg transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                        isSelected
                          ? 'bg-amber-400 text-black border-amber-400 font-black shadow-sm'
                          : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {opening.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Visual Board Diagram Component */}
            {activeOpening && (
              <RulebookBoardDiagram
                cols={activeOpening.boardDimensions.cols}
                rows={activeOpening.boardDimensions.rows}
                pieces={activeOpening.diagramPieces}
                focalSquares={activeOpening.focalSquares}
                notationSteps={activeOpening.notationSteps}
                strategicGoals={activeOpening.strategicGoals}
                title={activeOpening.name}
                tagline={activeOpening.tagline}
                description={activeOpening.description}
                keySquares={activeOpening.keySquares}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );

  if (isModal) {
    return (
      <div
        ref={modalRef}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 select-text overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Official Rulebook Quick Modal"
      >
        <div className="max-w-4xl w-full max-h-[85vh] sm:max-h-[88vh] bg-zinc-950 text-white border border-white/10 shadow-2xl flex flex-col overflow-hidden relative my-auto rounded-xl">
          {innerContent}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] h-[100dvh] w-full flex flex-col bg-zinc-950 text-white select-text overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      role="dialog"
      aria-modal="true"
      aria-label="Official Rulebook and Tactical Codex"
    >
      {innerContent}
    </div>
  );
};
