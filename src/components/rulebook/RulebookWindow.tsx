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
  Layers,
  ChevronDown,
  ChevronUp,
  Target,
  Swords,
  Clock,
  Crown,
  Zap,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { RulebookModeId, RulebookSubTab, TacticalOpening } from './types';
import { RULEBOOK_MODES, getRulebookDataByMode } from './rulebookData';
import { RulebookBoardDiagram } from './RulebookBoardDiagram';
import { MatchState } from '../../types/game';
import { useModalFocus } from '../../utils/useModalFocus';
import {
  ALL_PIECE_MOVEMENTS,
  LEAPING_PIECES,
  SPECIAL_ABILITY_PIECES,
  PieceMovementDef,
} from './pieceMovementData';
import { PieceMovementGrid } from './PieceMovementGrid';
import {
  CULLING_ABILITY_SCENARIOS,
  CullingAbilityScenario,
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
        return activeMatch.gameMode === 'crafted' ? 'crafted' : 'standard';
      }
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

  if (!isOpen) return null;

  const isInMatch = Boolean(activeMatch);

  const innerContent = (
    <div className="flex flex-col h-full w-full bg-[#080b11] text-white select-text overflow-hidden">
      {/* ================= STICKY TOP APP HEADER ================= */}
      <header className="shrink-0 bg-black border-b-4 border-white px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-[0_4px_0px_#000]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-500 text-black border-2 border-white flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-black" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-black uppercase tracking-tight truncate flex items-center gap-2">
              <span>MugenChessX Codex</span>
              <span className="hidden md:inline px-1.5 py-0.2 bg-neutral-800 text-amber-400 border border-neutral-700 text-[10px] font-mono">
                {isModal ? 'QUICK MODAL' : 'OFFICIAL RULEBOOK'}
              </span>
            </h1>
            <p className="text-[10px] text-neutral-400 font-mono hidden sm:block truncate">
              Comprehensive game mode mechanics, leaping compendium, and tactical scenario blueprints
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClose}
            className={`h-9 sm:h-10 px-3 sm:px-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase border-2 border-white flex items-center gap-1.5 shadow-[2px_2px_0px_#fff] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all ${
              isModal ? 'ring-2 ring-amber-400 font-extrabold animate-pulse bg-red-600' : ''
            }`}
            title="Close Rulebook (Esc)"
          >
            <X className="w-4 h-4 text-white" />
            <span>{isModal ? 'Close & Play' : 'Close'}</span>
          </button>
        </div>
      </header>

      {/* ================= IN-MATCH ACTIVE BANNER ================= */}
      {isInMatch && (
        <div className="shrink-0 px-3 sm:px-6 py-1.5 bg-amber-400 text-black border-b-2 border-black font-mono text-[11px] font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 bg-black shrink-0 animate-ping" />
            <span className="uppercase font-black truncate">
              ★ Active Match: {currentModeData.title}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold shrink-0 opacity-80 hidden sm:inline">
            Press ESC or Close to return to your move
          </span>
        </div>
      )}

      {/* ================= MODE SELECTION TAB BAR (RESPONSIVE COLLAPSIBLE ON MOBILE) ================= */}
      <div className="shrink-0 bg-[#0f1420] border-b-3 border-black dark:border-white px-2 sm:px-6 py-1.5">
        <div className="flex items-center justify-between gap-2">
          {/* Mobile Collapse/Expand Trigger Button */}
          <button
            onClick={() => setIsMobileModesExpanded((prev) => !prev)}
            className="md:hidden px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-600 text-[10px] font-mono font-bold uppercase flex items-center gap-1 shrink-0 cursor-pointer"
            aria-expanded={isMobileModesExpanded}
            title="Toggle All Modes Menu"
          >
            <span>Modes (6)</span>
            {isMobileModesExpanded ? (
              <ChevronUp className="w-3 h-3 text-amber-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-amber-400" />
            )}
          </button>

          {/* Active Mode Tag on Mobile when collapsed */}
          {!isMobileModesExpanded && (
            <div className="md:hidden flex-1 truncate text-[11px] font-mono font-bold text-neutral-300">
              <span className="text-amber-400 uppercase">{currentModeData.badge}</span>
            </div>
          )}

          {/* Mode Tabs: Horizontal Scroll Strip (or expanded grid on mobile) */}
          <div
            className={`w-full overflow-x-auto scrollbar-none flex items-center gap-1.5 sm:gap-2 ${
              isMobileModesExpanded ? 'flex flex-wrap pt-2' : 'hidden md:flex'
            }`}
          >
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
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-black uppercase whitespace-nowrap shrink-0 border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-black border-white shadow-[3px_3px_0px_#f59e0b]'
                      : 'bg-black/60 text-neutral-400 hover:text-white border-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  {mode.id === 'standard' && <Bot className="w-3.5 h-3.5" />}
                  {mode.id === 'crafted' && <Sparkles className="w-3.5 h-3.5" />}
                  {mode.id === 'culling' && <Flame className="w-3.5 h-3.5 text-red-500" />}
                  {mode.id === 'rose' && <Heart className="w-3.5 h-3.5 text-rose-500" />}
                  {mode.id === 'training' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                  {mode.id === 'multiplayer' && <Users className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{mode.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= SECONDARY SUB-NAVIGATION TABS (WITH PROMINENT WHITE ACTION BUTTON) ================= */}
      <div className="shrink-0 bg-black/95 border-b-2 border-neutral-800 px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <button
            onClick={() => setSelectedSubTab('overview')}
            className={`px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
              selectedSubTab === 'overview'
                ? 'border-amber-400 text-amber-400 bg-amber-400/10'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setSelectedSubTab('rules')}
            className={`px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
              selectedSubTab === 'rules'
                ? 'border-amber-400 text-amber-400 bg-amber-400/10'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Rules & Movement
          </button>

          {/* ================= PROMINENT WHITE BUTTON FOR MOVEMENT & ABILITY BOOK ================= */}
          <button
            onClick={() => {
              setSelectedSubTab('movement_book');
              if (selectedMode === 'culling') {
                setMovementFilter('culling_abilities');
              } else if (selectedMode === 'crafted') {
                setMovementFilter('crafted');
              } else {
                setMovementFilter('all');
              }
            }}
            className={`px-3 py-1 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 flex items-center gap-1.5 ${
              selectedSubTab === 'movement_book'
                ? 'bg-amber-400 text-black border-white shadow-[2px_2px_0px_#fff]'
                : 'bg-white text-black border-white hover:bg-neutral-200 shadow-[2px_2px_0px_#f59e0b]'
            }`}
            title="Open Movement Theory & Culling Sorcery Codex"
          >
            <Zap className="w-3.5 h-3.5 text-black fill-black" />
            <span>Movement & Ability Book</span>
          </button>

          <button
            onClick={() => setSelectedSubTab('strategy')}
            className={`px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
              selectedSubTab === 'strategy'
                ? 'border-amber-400 text-amber-400 bg-amber-400/10'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Strategy Playbook
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-neutral-400 uppercase">
          <span>Active Codex:</span>
          <span className="text-white font-bold">{currentModeData.title}</span>
        </div>
      </div>

      {/* ================= SCROLLABLE CONTENT STAGE ================= */}
      <main
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 space-y-6 max-w-7xl w-full mx-auto focus:outline-none touch-pan-y"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {/* ================= SUB-TAB 1: OVERVIEW ================= */}
        {selectedSubTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Hero Header Card */}
            <div className="border-3 border-black dark:border-white p-5 bg-neutral-900 shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider font-mono">
                  {currentModeData.badge}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Time Control: {currentModeData.overview.timeControl}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white">
                {currentModeData.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 font-mono mt-1">
                {currentModeData.subtitle}
              </p>
              <div className="mt-4 p-3 bg-black/60 border border-neutral-700 text-xs sm:text-sm text-neutral-200 leading-relaxed">
                <strong>Primary Objective:</strong> {currentModeData.overview.objective}
              </div>
            </div>

            {/* Geometry & Armies Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-900 border-2 border-neutral-700">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase mb-1">
                  <Compass className="w-4 h-4" />
                  <span>Board Geometry</span>
                </div>
                <p className="text-xs text-neutral-300 font-mono leading-relaxed">
                  {currentModeData.overview.boardGeometry}
                </p>
              </div>

              <div className="p-4 bg-neutral-900 border-2 border-neutral-700">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase mb-1">
                  <Crown className="w-4 h-4" />
                  <span>Starting Army Configuration</span>
                </div>
                <p className="text-xs text-neutral-300 font-mono leading-relaxed">
                  {currentModeData.overview.armySize}
                </p>
              </div>
            </div>

            {/* Key Mode Highlights */}
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Distinctive Mode Highlights</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentModeData.overview.keyHighlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-neutral-900 border-2 border-neutral-700 hover:border-amber-400 transition-colors flex flex-col justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-xs font-black uppercase text-amber-400 mb-1">
                        {hl.title}
                      </h4>
                      <p className="text-xs text-neutral-300 font-normal leading-relaxed">
                        {hl.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Win & Draw Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-900 border-2 border-emerald-600/60 shadow-[3px_3px_0px_#059669]">
                <h4 className="text-xs font-black uppercase text-emerald-400 mb-2 flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  <span>Win Conditions</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-200">
                  {currentModeData.overview.winConditions.map((cond, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-neutral-900 border-2 border-neutral-700">
                <h4 className="text-xs font-black uppercase text-neutral-300 mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Draw / Concession Conditions</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-400">
                  {currentModeData.overview.drawConditions.map((cond, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-neutral-500 font-bold">·</span>
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
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-3 border-black dark:border-white p-4 sm:p-5 bg-neutral-900 shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-black uppercase text-amber-400 mb-1">
                  {currentModeData.title} — Official Movement & Invariants
                </h3>
                <p className="text-xs text-neutral-300 font-mono">
                  The strict mathematical and tactical rules governing piece trajectories, special abilities, and game state transitions.
                </p>
              </div>

              {/* Quick shortcut to Movement Theory */}
              <button
                onClick={() => setSelectedSubTab('movement_book')}
                className="px-3 py-1.5 bg-white text-black font-black text-xs uppercase border-2 border-black hover:bg-neutral-200 shadow-[2px_2px_0px_#f59e0b] shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-black" />
                <span>Open Full Movement Book</span>
              </button>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {currentModeData.rules.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 bg-neutral-900 border-2 border-neutral-700 space-y-3"
                >
                  <h4 className="text-sm font-black uppercase text-white flex items-center gap-2 border-b border-neutral-800 pb-2">
                    <span className="w-2 h-2 bg-amber-400" />
                    <span>{sec.title}</span>
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed font-mono">
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
                            className="p-3 bg-black/70 border border-neutral-800 flex flex-col justify-between gap-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-black uppercase text-amber-300">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-1">
                                {item.badge && (
                                  <span className="px-1.5 py-0.2 bg-neutral-800 text-neutral-300 border border-neutral-700 text-[9px] font-mono uppercase">
                                    {item.badge}
                                  </span>
                                )}
                                {matchedPiece && (
                                  <button
                                    onClick={() => togglePieceExpanded(matchedPiece.id)}
                                    className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-600 text-[9px] font-mono font-bold uppercase cursor-pointer"
                                    title="Toggle 9x9 Movement Preview"
                                  >
                                    {isExpanded ? 'Hide Grid ▲' : 'View Grid ▼'}
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-neutral-300 font-normal leading-relaxed">
                              {item.details}
                            </p>

                            {/* Inline Expandable 9x9 Movement Grid */}
                            {matchedPiece && isExpanded && (
                              <div className="pt-2 border-t border-neutral-800 animate-in fade-in duration-150 flex flex-col items-center">
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

        {/* ================= SUB-TAB 3: MOVEMENT & ABILITY BOOK (COMPREHENSIVE THEORY) ================= */}
        {selectedSubTab === 'movement_book' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header Banner */}
            <div className="bg-white text-black border-4 border-black p-4 sm:p-5 shadow-[6px_6px_0px_#f59e0b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black text-amber-400 border-2 border-black flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
                    Movement & Ability Encyclopedia
                  </h3>
                  <p className="text-xs text-neutral-800 font-mono">
                    Visual 9×9 / 7×7 movement grids, comprehensive leaping unit compendium, and Culling Game sorcery scenarios.
                  </p>
                </div>
              </div>

              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono font-bold">
                <button
                  onClick={() => setMovementFilter('all')}
                  className={`px-2.5 py-1 uppercase border cursor-pointer ${
                    movementFilter === 'all'
                      ? 'bg-black text-amber-400 border-black'
                      : 'bg-neutral-100 text-black border-neutral-400 hover:bg-neutral-200'
                  }`}
                >
                  All ({ALL_PIECE_MOVEMENTS.length})
                </button>
                <button
                  onClick={() => setMovementFilter('standard')}
                  className={`px-2.5 py-1 uppercase border cursor-pointer ${
                    movementFilter === 'standard'
                      ? 'bg-black text-amber-400 border-black'
                      : 'bg-neutral-100 text-black border-neutral-400 hover:bg-neutral-200'
                  }`}
                >
                  Standard (5)
                </button>
                <button
                  onClick={() => setMovementFilter('leaping')}
                  className={`px-2.5 py-1 uppercase border cursor-pointer flex items-center gap-1 ${
                    movementFilter === 'leaping'
                      ? 'bg-black text-emerald-400 border-black'
                      : 'bg-neutral-100 text-black border-neutral-400 hover:bg-neutral-200'
                  }`}
                >
                  <span>Leaping Units ({LEAPING_PIECES.length})</span>
                </button>
                <button
                  onClick={() => setMovementFilter('culling_abilities')}
                  className={`px-2.5 py-1 uppercase border cursor-pointer flex items-center gap-1 ${
                    movementFilter === 'culling_abilities'
                      ? 'bg-black text-red-400 border-black'
                      : 'bg-neutral-100 text-black border-neutral-400 hover:bg-neutral-200'
                  }`}
                >
                  <span>Culling Sorcery ({CULLING_ABILITY_SCENARIOS.length})</span>
                </button>
                <button
                  onClick={() => setMovementFilter('crafted')}
                  className={`px-2.5 py-1 uppercase border cursor-pointer ${
                    movementFilter === 'crafted'
                      ? 'bg-black text-cyan-400 border-black'
                      : 'bg-neutral-100 text-black border-neutral-400 hover:bg-neutral-200'
                  }`}
                >
                  Crafted (3)
                </button>
              </div>
            </div>

            {/* Prominent Highlighted Red Button to Culling Game Rules */}
            <div className="p-3.5 bg-red-950/80 border-2 border-red-500 shadow-[4px_4px_0px_#ef4444] flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
                <div>
                  <span className="text-xs font-black uppercase text-red-400 block">
                    Looking for Jujutsu Kaisen Culling Sorcery & Abilities?
                  </span>
                  <span className="text-[11px] text-neutral-300 font-mono">
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
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase border-2 border-white shadow-[2px_2px_0px_#fff] cursor-pointer whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5 text-white" />
                <span>Read Culling Game Rules</span>
              </button>
            </div>

            {/* ================= SECTION A: ORIGINAL & STANDARD CHESS PIECE MOVEMENT MATRICES ================= */}
            {movementFilter !== 'culling_abilities' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Piece Movement Matrices (Original & Custom Units)</span>
                  </h4>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Showing {filteredMovementPieces.length} pieces
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredMovementPieces.map((item) => (
                    <div
                      key={item.id}
                      className="bg-neutral-900 border-2 border-neutral-700 p-4 shadow-[4px_4px_0px_#000] flex flex-col justify-between gap-4"
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
                            <span className="px-2 py-0.5 bg-emerald-500 text-black font-black text-[9px] uppercase font-mono">
                              Leaper
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-neutral-300 font-mono mb-2">
                          {item.description}
                        </p>

                        <div className="p-2.5 bg-black/60 border border-neutral-800 text-xs font-mono text-neutral-200">
                          <span className="text-[10px] text-amber-400 font-bold uppercase block mb-0.5">
                            Movement Trajectory:
                          </span>
                          {item.movementText}
                        </div>
                      </div>

                      {/* Visual Movement Grid Component */}
                      <div className="pt-2 border-t border-neutral-800 flex flex-col items-center">
                        <PieceMovementGrid item={item} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= SECTION B: LEAPING UNITS COMPENDIUM ================= */}
            {(movementFilter === 'leaping' || movementFilter === 'all') && (
              <div className="p-4 sm:p-5 bg-neutral-900 border-2 border-emerald-500 shadow-[4px_4px_0px_#10b981] space-y-4">
                <div className="border-b border-neutral-800 pb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-400 ring-1 ring-white" />
                    <h4 className="text-sm sm:text-base font-black uppercase text-emerald-400 tracking-wider">
                      Compendium of All Leaping Units across MugenChessX
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-300 uppercase">
                    10 Total Leaping Units Identified
                  </span>
                </div>

                <p className="text-xs text-neutral-300 font-mono leading-relaxed">
                  Leaping units possess the rare tactical privilege of jumping directly over intervening friendly or enemy pieces without being blocked. Review their exact jump patterns below:
                </p>

                {/* Leap Geometries Summary Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-black/60 border border-neutral-800">
                    <span className="text-amber-400 font-bold block mb-1">1. 2×1 Knight L-Hop:</span>
                    <span className="text-neutral-300 text-[11px]">
                      Standard Knight, The Prince, Panda (Bulwark) / Yorozu (Bulwark). Jumps 2 squares in one axis and 1 square in the perpendicular axis.
                    </span>
                  </div>
                  <div className="p-3 bg-black/60 border border-neutral-800">
                    <span className="text-sky-400 font-bold block mb-1">2. 2-Square Orthogonal Leap:</span>
                    <span className="text-neutral-300 text-[11px]">
                      Priest, Cupid Priest, Maki Zenin (Skirmisher) / Naoya Zenin (Skirmisher). Leaps exactly 2 squares vertically or horizontally over any piece.
                    </span>
                  </div>
                  <div className="p-3 bg-black/60 border border-neutral-800">
                    <span className="text-amber-300 font-bold block mb-1">3. 2-Square Diagonal Leap:</span>
                    <span className="text-neutral-300 text-[11px]">
                      Supreme Rook, Rose Tower. Jumps 2 squares along diagonals over pawn walls.
                    </span>
                  </div>
                  <div className="p-3 bg-black/60 border border-neutral-800">
                    <span className="text-red-400 font-bold block mb-1">4. Alternating Zigzag Hop:</span>
                    <span className="text-neutral-300 text-[11px]">
                      Communist, Thorn Guard. Zigzags ±2 or ±4 squares along orthogonal vectors via diagonal branches.
                    </span>
                  </div>
                  <div className="p-3 bg-black/60 border border-neutral-800 sm:col-span-2 lg:col-span-1">
                    <span className="text-purple-400 font-bold block mb-1">5. Domain Step Evasion Leap:</span>
                    <span className="text-neutral-300 text-[11px]">
                      Satoru Gojo (Sovereign) / Ryomen Sukuna (Sovereign). Once per game: jumps 2 squares in all 8 directions over obstacles to an unattacked empty square.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= SECTION C: CULLING SORCERY SCENARIO BOARDS (WITH ARROWS) ================= */}
            {(movementFilter === 'culling_abilities' || movementFilter === 'all') && (
              <div className="space-y-4">
                <div className="p-4 bg-red-950/40 border-2 border-red-500 shadow-[4px_4px_0px_#ef4444] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm sm:text-base font-black uppercase text-red-400 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-400" />
                      <span>Culling Game Sorcery Scenarios & Tactical Vector Breakdowns</span>
                    </h4>
                    <p className="text-xs text-neutral-300 font-mono mt-0.5">
                      Static scenario boards with black-and-white directional arrows, annotated strike lines, and student takeaways.
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
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Tactical Principles Bar */}
            <div className="p-4 bg-neutral-900 border-2 border-neutral-700">
              <h3 className="text-xs font-black uppercase text-amber-400 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Governing Strategic Principles</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-neutral-200">
                {currentModeData.strategy.tacticalPrinciples.map((principle, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-black/60 border-l-2 border-amber-400 flex items-start gap-2"
                  >
                    <span className="text-amber-400 font-mono font-bold shrink-0">{idx + 1}.</span>
                    <span className="leading-snug">{principle}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Opening Selector Buttons */}
            {currentModeData.strategy.openings.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                <span className="text-[11px] font-mono uppercase text-neutral-400 font-bold shrink-0">
                  Select Opening Scenario:
                </span>
                {currentModeData.strategy.openings.map((opening) => {
                  const isSelected = activeOpening?.id === opening.id;
                  return (
                    <button
                      key={opening.id}
                      onClick={() => setSelectedOpeningId(opening.id)}
                      className={`px-3 py-1.5 text-xs font-black uppercase border-2 transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-amber-400 text-black border-amber-400 shadow-[2px_2px_0px_#fff]'
                          : 'bg-black text-neutral-300 border-neutral-700 hover:border-neutral-500'
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
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-150 select-text overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Official Rulebook Quick Modal"
      >
        <div className="max-w-4xl w-full max-h-[85vh] sm:max-h-[88vh] bg-[#080b11] text-white border-4 border-rose-500 shadow-[8px_8px_0px_#f43f5e] flex flex-col overflow-hidden relative my-auto">
          {innerContent}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] h-full w-full flex flex-col bg-[#080b11] text-white animate-in fade-in duration-150 select-text overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Official Rulebook and Tactical Codex"
    >
      {innerContent}
    </div>
  );
};
