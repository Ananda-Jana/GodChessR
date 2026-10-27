import React, { useState } from 'react';
import {
  CraftVariantConfig,
  CraftVariantId,
  CraftBotLevel,
  CraftPieceColor,
  CraftMatchState,
} from './craftGameTypes';
import { CRAFT_VARIANTS } from './craftGameVariants';
import { CraftGameMatchView } from './CraftGameMatchView';
import {
  X,
  Swords,
  Sparkles,
  Bot,
  Zap,
  Shield,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

interface CraftGameHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CraftGameHub: React.FC<CraftGameHubProps> = ({ isOpen, onClose }) => {
  const [selectedVariantId, setSelectedVariantId] = useState<CraftVariantId>('micro-chess');
  const [selectedBotLevel, setSelectedBotLevel] = useState<CraftBotLevel>('tactician');
  const [selectedPlayerColor, setSelectedPlayerColor] = useState<CraftPieceColor>('white');
  const [activeMatch, setActiveMatch] = useState<CraftMatchState | null>(null);

  if (!isOpen) return null;

  // Active Match Mode
  if (activeMatch) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0f] flex flex-col overflow-hidden">
        <CraftGameMatchView
          initialState={activeMatch}
          onExit={() => setActiveMatch(null)}
        />
      </div>
    );
  }

  const selectedVariant =
    CRAFT_VARIANTS.find((v) => v.id === selectedVariantId) || CRAFT_VARIANTS[0];

  const handleLaunchGame = () => {
    const newMatch: CraftMatchState = {
      id: `craft_${Date.now()}`,
      variant: selectedVariant,
      board: selectedVariant.initialBoard(),
      turn: 'white',
      playerColor: selectedPlayerColor,
      botLevel: selectedBotLevel,
      moveHistory: [],
      capturedWhite: [],
      capturedBlack: [],
      status: selectedVariant.allowCustomSetup ? 'setup' : 'playing',
      winner: null,
      winReason: null,
      inCheck: null,
      isBotThinking: false,
    };
    setActiveMatch(newMatch);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md flex flex-col overflow-hidden text-white select-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Custom Lane Chessing Mode Hub"
    >
      {/* Top Navigation Bar */}
      <header className="shrink-0 h-14 sm:h-16 px-3 sm:px-6 bg-[#12121a] border-b-3 border-black dark:border-white flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000] shrink-0">
            <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-1.5 sm:gap-2 truncate">
              Custom Lane Chessing Mode
              <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-amber-400 text-black font-black uppercase rounded shadow-sm shrink-0">
                5 MODES
              </span>
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate">
              Micro to 8×8 Custom Corridors & Officer Laboratory
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 rounded-xl cursor-pointer transition-all shrink-0 ml-2"
          aria-label="Close Custom Lane Chessing Hub"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Hub Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-6 max-w-6xl w-full mx-auto">
          {/* ============================================================== */}
          {/* MOBILE-OPTIMIZED LAYOUT (< lg)                                 */}
          {/* ============================================================== */}
          <div className="flex flex-col gap-4 lg:hidden pb-20">
            {/* Vertically Stacked Small Variant Cards (Mobile) */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Select Variant (5 Rulesets)
                </span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase">
                  Tap to Select
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {CRAFT_VARIANTS.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2.5 ${
                        isSelected
                          ? 'bg-zinc-900 border-amber-400 shadow-[3px_3px_0px_#f59e0b]'
                          : 'bg-[#14141c] border-white/15 hover:border-white/35 active:scale-[0.99]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Variant Thumbnail */}
                        <div className="w-11 h-11 rounded-lg bg-zinc-950 border border-white/20 overflow-hidden shrink-0">
                          <img
                            src={v.avatar}
                            alt={v.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Text and Badges */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-black text-amber-400 border border-amber-400/40 rounded">
                              {v.badge}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-400">
                              {v.width}×{v.height} • {v.winCondition}
                            </span>
                          </div>
                          <h4 className="text-xs font-black uppercase text-white truncate mt-0.5">
                            {v.name}
                          </h4>
                          <p className="text-[10px] font-bold text-amber-400/90 truncate">
                            {v.subtitle}
                          </p>
                        </div>

                        {/* Selection Radio / Indicator */}
                        <div className="shrink-0 flex items-center justify-center pl-1">
                          {isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center font-black text-xs shadow-sm">
                              ✓
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-white/25 flex items-center justify-center text-transparent">
                              •
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expanded Details when Selected */}
                      {isSelected && (
                        <div className="pt-2.5 border-t border-white/10 space-y-1.5 text-left">
                          <p className="text-[11px] text-zinc-300 leading-relaxed">
                            {v.description}
                          </p>
                          <div className="space-y-1 pt-1 text-[10px] font-mono text-zinc-400">
                            {v.rules.map((rule, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                <span>{rule}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Match Configuration Card */}
            <div className="bg-[#12121a] border-3 border-black dark:border-white p-4 rounded-2xl shadow-[4px_4px_0px_#ffffff] flex flex-col gap-4">
              {/* Bot Difficulty Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-amber-400" /> Bot Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { level: 'rookie', label: 'Rookie', desc: '600 ELO', color: 'text-emerald-400' },
                    { level: 'tactician', label: 'Tactician', desc: '1400 ELO', color: 'text-amber-400' },
                    { level: 'punisher', label: 'Punisher', desc: '1900 ELO', color: 'text-red-400' },
                  ].map((item) => (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setSelectedBotLevel(item.level as CraftBotLevel)}
                      className={`p-2 rounded-xl border-2 text-center cursor-pointer transition-all ${
                        selectedBotLevel === item.level
                          ? 'bg-black border-amber-400 shadow-[2px_2px_0px_#f59e0b]'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className={`text-xs font-black uppercase block ${item.color}`}>
                        {item.label}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 mt-0.5 block">
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Play As Color */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> Choose Your Color
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlayerColor('white')}
                    className={`p-2.5 rounded-xl border-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      selectedPlayerColor === 'white'
                        ? 'bg-white text-black border-amber-400 shadow-[2px_2px_0px_#f59e0b]'
                        : 'bg-white/10 text-white border-white/10'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white border border-black shadow-sm" />
                    <span className="text-xs font-black uppercase">White (First)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlayerColor('black')}
                    className={`p-2.5 rounded-xl border-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      selectedPlayerColor === 'black'
                        ? 'bg-zinc-900 text-white border-amber-400 shadow-[2px_2px_0px_#f59e0b]'
                        : 'bg-white/10 text-white border-white/10'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-black border border-white shadow-sm" />
                    <span className="text-xs font-black uppercase">Black (Second)</span>
                  </button>
                </div>
              </div>

              {/* In-Panel Launch Button */}
              <button
                type="button"
                onClick={handleLaunchGame}
                className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 active:translate-x-0.5 active:translate-y-0.5 text-black font-black text-xs uppercase tracking-wider rounded-xl border-3 border-black shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4 text-black" />
                Launch Match ({selectedVariant.name})
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* DESKTOP LAYOUT (>= lg) — UNTOUCHED, EXACT SAME EXPERIENCE       */}
          {/* ============================================================== */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-6">
            {/* Left Column: 5 Variant Cards Grid (8 cols on desktop) */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Select Game Variant
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  5 CUSTOM RULESETS READY
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CRAFT_VARIANTS.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`relative p-4 rounded-xl border-3 cursor-pointer transition-all flex flex-col justify-between gap-3 text-left overflow-hidden ${
                        isSelected
                          ? 'bg-zinc-900 border-amber-400 shadow-[4px_4px_0px_#f59e0b] scale-[1.01]'
                          : 'bg-[#14141c] border-white/20 hover:border-white/50 hover:bg-[#1a1a24]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 relative z-10">
                        <div>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-black/80 text-amber-400 border border-amber-400/40 rounded inline-block mb-1.5">
                            {v.badge}
                          </span>
                          <h3 className="text-sm font-black uppercase text-white tracking-wide">
                            {v.name}
                          </h3>
                          <p className="text-[11px] font-bold text-zinc-400 mt-0.5">
                            {v.subtitle}
                          </p>
                        </div>

                        <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-white/20 overflow-hidden shrink-0">
                          <img
                            src={v.avatar}
                            alt={v.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-300 line-clamp-2 relative z-10">
                        {v.description}
                      </p>

                      <div className="space-y-1 pt-1 border-t border-white/10 relative z-10 text-[10px] font-mono text-zinc-400">
                        {v.rules.map((rule, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                            <span className="truncate">{rule}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1 relative z-10">
                        <span className="text-[10px] font-black uppercase text-amber-400">
                          Win: {v.winCondition}
                        </span>
                        <button
                          type="button"
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400 text-black shadow-sm'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Pick'}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Battle Configuration Panel (5 cols on desktop) */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
              <div className="bg-[#12121a] border-3 border-black dark:border-white p-5 rounded-2xl shadow-[6px_6px_0px_#ffffff] flex flex-col gap-5 sticky top-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                    Selected Variant
                  </span>
                  <h3 className="text-lg font-black uppercase text-white">
                    {selectedVariant.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {selectedVariant.description}
                  </p>
                </div>

                {/* Bot Difficulty Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-amber-400" /> Bot Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { level: 'rookie', label: 'Rookie', desc: 'Casual (600)', color: 'text-emerald-400' },
                      { level: 'tactician', label: 'Tactician', desc: 'Medium (1400)', color: 'text-amber-400' },
                      { level: 'punisher', label: 'Punisher', desc: 'Expert (1900)', color: 'text-red-400' },
                    ].map((item) => (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => setSelectedBotLevel(item.level as CraftBotLevel)}
                        className={`p-2.5 rounded-xl border-2 text-center cursor-pointer transition-all ${
                          selectedBotLevel === item.level
                            ? 'bg-black border-amber-400 shadow-[2px_2px_0px_#f59e0b]'
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <span className={`text-xs font-black uppercase block ${item.color}`}>
                          {item.label}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400 mt-0.5 block">
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Play As (Color) Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" /> Choose Your Color
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlayerColor('white')}
                      className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        selectedPlayerColor === 'white'
                          ? 'bg-white text-black border-amber-400 shadow-[2px_2px_0px_#f59e0b]'
                          : 'bg-white/10 text-white border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-white border border-black shadow-sm" />
                      <span className="text-xs font-black uppercase">White (First)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlayerColor('black')}
                      className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        selectedPlayerColor === 'black'
                          ? 'bg-zinc-900 text-white border-amber-400 shadow-[2px_2px_0px_#f59e0b]'
                          : 'bg-white/10 text-white border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-black border border-white shadow-sm" />
                      <span className="text-xs font-black uppercase">Black (Second)</span>
                    </button>
                  </div>
                </div>

                {/* Launch Match Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleLaunchGame}
                    className="w-full py-4 px-5 bg-amber-400 hover:bg-amber-300 active:translate-x-0.5 active:translate-y-0.5 text-black font-black text-sm uppercase tracking-wider rounded-xl border-3 border-black shadow-[4px_4px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 transition-transform"
                  >
                    <Swords className="w-5 h-5 text-black" />
                    Launch Match
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Floating Launch Bar on Mobile (< lg) */}
      <div className="lg:hidden shrink-0 p-3 bg-[#12121a]/95 border-t-2 border-white/20 backdrop-blur-md z-40 flex items-center justify-between gap-3 shadow-[0_-8px_20px_rgba(0,0,0,0.6)]">
        <div className="min-w-0">
          <span className="text-[10px] text-zinc-400 uppercase font-mono block">
            Corridor Mode
          </span>
          <span className="text-xs font-black uppercase text-amber-400 truncate block">
            {selectedVariant.name} • {selectedBotLevel}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLaunchGame}
          className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Swords className="w-4 h-4 text-black" />
          Launch Match
        </button>
      </div>
    </div>
  );
};
