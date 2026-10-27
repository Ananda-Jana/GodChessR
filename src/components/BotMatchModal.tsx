import React, { useState } from 'react';
import { Bot, Sparkles, X, Swords, Sun, Moon, Palette } from 'lucide-react';
import { PieceColor, PieceTheme } from '../types/game';
import { useTheme } from '../context/ThemeContext';
import { ChessPiece } from './ChessPiece';
import { useModalFocus } from '../utils/useModalFocus';
import { ModeArtPanel } from './ModeArtPanel';

interface BotMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGameMode?: 'standard' | 'crafted' | 'classic';
  onStartBotMatch: (
    playerColor: PieceColor,
    difficulty: 'grandmaster' | 'master',
    timeControl: 120 | 300,
    moveSuggestions: 'included' | 'excluded',
    gameMode: 'standard' | 'crafted' | 'classic',
    craftingAllowed?: boolean,
    pieceTheme?: PieceTheme
  ) => void;
}

export const BotMatchModal: React.FC<BotMatchModalProps> = ({
  isOpen,
  onClose,
  initialGameMode = 'standard',
  onStartBotMatch,
}) => {
  const { theme, setTheme } = useTheme();
  
  const modalRef = useModalFocus(isOpen, onClose, true);

  const [playerColor, setPlayerColor] = useState<PieceColor>('white');
  const [difficulty, setDifficulty] = useState<'grandmaster' | 'master'>('grandmaster');
  const [timeControl, setTimeControl] = useState<120 | 300>(300); // 5 mins default
  const [moveSuggestions, setMoveSuggestions] = useState<'included' | 'excluded'>('included');
  const [gameMode, setGameMode] = useState<'standard' | 'crafted' | 'classic'>(initialGameMode);
  const [craftingAllowed, setCraftingAllowed] = useState<boolean>(true);
  const [pieceTheme, setPieceTheme] = useState<PieceTheme>('classic');

  React.useEffect(() => {
    if (isOpen) {
      setGameMode(initialGameMode);
      setPieceTheme('classic'); // Always reset to default theme for new matches
      setCraftingAllowed(true); // Default to enabled
    }
  }, [isOpen, initialGameMode]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bot-match-modal-title"
        className="bg-white dark:bg-[#0a0a0c] border-t-4 border-x-4 md:border-4 border-black dark:border-white rounded-t-2xl md:rounded-none max-w-3xl w-full h-[94dvh] md:h-auto max-h-[94dvh] md:max-h-[90dvh] shadow-[0_-8px_25px_rgba(0,0,0,0.5)] md:shadow-[8px_8px_0px_#000000] dark:md:shadow-[8px_8px_0px_#ffffff] text-black dark:text-white flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <ModeArtPanel
          modeKey={gameMode === 'crafted' ? 'crafted-pieces' : 'grandmaster-bot'}
          title={gameMode === 'crafted' ? 'Crafted Army' : 'Grandmaster Bot'}
          subtitle="Tactical AI Rival"
        />

        <div className="flex-1 flex flex-col min-w-0 h-full max-h-[94dvh] md:max-h-[90dvh] overflow-hidden">
        
        {/* Sticky Top Header with Title and Close Button */}
        <div className="p-3 sm:px-4 sm:py-3 border-b-3 border-black dark:border-white flex items-center justify-between shrink-0 bg-black text-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-white flex items-center justify-center font-black bg-amber-400 text-black">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 id="bot-match-modal-title" className="text-sm sm:text-base font-black uppercase tracking-tight flex items-center gap-1.5">
                {gameMode === 'classic'
                  ? 'Play vs Bot (Traditional Chess)'
                  : gameMode === 'crafted'
                  ? 'Play vs Bot (Crafted Pieces)'
                  : 'Play vs Bot (Mugen Chess)'}
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center border-2 border-white hover:bg-white hover:text-black transition-colors cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-400 outline-none"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Sticky Top Action Bar (hidden on mobile, kept exactly untouched for desktop) */}
        <div className={`hidden md:block p-3 border-b-3 border-black dark:border-white shrink-0 ${
          gameMode === 'crafted' ? 'bg-[#1e293b]' : 'bg-amber-400'
        }`}>
          <button
            onClick={() => onStartBotMatch(playerColor, difficulty, timeControl, moveSuggestions, gameMode, gameMode === 'classic' ? false : craftingAllowed, pieceTheme)}
            className="w-full py-2.5 px-4 bg-black text-amber-400 hover:bg-neutral-900 border-2 border-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000000]"
          >
            <Swords className="w-4 h-4" />
            Start {gameMode === 'classic' ? 'Traditional Game' : gameMode === 'crafted' ? 'Crafted Game' : 'Mugen Game'} Now
          </button>
        </div>

        {/* Mobile Hero Banner (160px, md:hidden) */}
        <div className="md:hidden relative h-40 w-full shrink-0 overflow-hidden bg-black select-none border-b-3 border-black dark:border-white">
          <img
            src="/assets/aistudio/image_4aa74391.png"
            alt={gameMode === 'crafted' ? 'Crafted Pieces' : 'Grandmaster Bot'}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-top filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/35 to-transparent pointer-events-none" />
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-amber-400 text-black border border-black shadow-[1px_1px_0px_#000]">
              {gameMode === 'crafted' ? 'CRAFTED SPECIALS' : gameMode === 'classic' ? 'FIDE CLASSIC' : 'TACTICAL RIVAL'}
            </span>
            <span className="text-[10px] font-mono font-bold text-white/90 bg-black/70 px-2 py-0.5 border border-white/20">
              DEPTH {difficulty === 'grandmaster' ? '3' : '2'}
            </span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 text-xs font-bold overscroll-contain">

          {/* Game Mode Choice: 3 Options Ordered (Classic Chess, Mugen Chess, Crafted Pieces) */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5">
              Select Game Mode / Pieces
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGameMode('classic')}
                className={`p-2.5 border-2 border-black dark:border-white flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all ${
                  gameMode === 'classic'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)] font-black'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <span className="font-black uppercase text-xs">Classic Chess</span>
                <span className="text-[10px] text-center font-normal">No Prince, Zero Dice, FIDE Layout</span>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('standard')}
                className={`p-2.5 border-2 border-black dark:border-white flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all ${
                  gameMode === 'standard'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)] font-black'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <span className="font-black uppercase text-xs">Mugen Chess</span>
                <span className="text-[10px] text-center font-normal">Prince, Dice Phase, 2-Pawn Draw</span>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('crafted')}
                className={`p-2.5 border-2 border-black dark:border-white flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all ${
                  gameMode === 'crafted'
                    ? 'bg-[#0f172a] text-amber-400 border-amber-400 shadow-[3px_3px_0px_var(--shadow)] font-black'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-black uppercase text-xs">Crafted</span>
                </div>
                <span className="text-[10px] text-center font-normal">Communists, Priests &amp; Supreme Rook</span>
              </button>
            </div>

            {/* Mid-Game Crafting Option (Only for Mugen / Crafted modes, not Classic Chess) */}
            {gameMode !== 'classic' && (
            <div className="mt-2.5 p-2.5 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider">Mid-Game Crafting Perk</span>
                  <span className="text-[9px] text-neutral-500 font-normal">
                    (Mid-game triggers)
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 border border-black ${
                  craftingAllowed ? 'bg-amber-400 text-black font-black' : 'bg-neutral-300 dark:bg-neutral-700 font-bold'
                }`}>
                  {craftingAllowed ? 'Enabled' : 'Avoided'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCraftingAllowed(true)}
                  className={`p-2 border-2 border-black dark:border-white flex flex-col items-center gap-0.5 cursor-pointer ${
                    craftingAllowed
                      ? 'bg-amber-400 text-black shadow-[2px_2px_0px_var(--shadow)]'
                      : 'bg-white dark:bg-black text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <span className="font-black uppercase text-[11px]">Enabled (Default)</span>
                  <span className="text-[9px] text-center opacity-85">Craft after losing 2 expensive pieces</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCraftingAllowed(false)}
                  className={`p-2 border-2 border-black dark:border-white flex flex-col items-center gap-0.5 cursor-pointer ${
                    !craftingAllowed
                      ? 'bg-amber-400 text-black shadow-[2px_2px_0px_var(--shadow)]'
                      : 'bg-white dark:bg-black text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <span className="font-black uppercase text-[11px]">Avoid Crafting</span>
                  <span className="text-[9px] text-center opacity-85">Normal flow without piece summons</span>
                </button>
              </div>
              <p className="mt-1.5 text-[9px] text-neutral-500 dark:text-neutral-400 font-normal">
                {craftingAllowed
                  ? 'Crafting triggers once 2 expensive pieces (Queen, Rook, Prince, Communist, etc.) are lost. Pawns never trigger crafting.'
                  : 'Mid-game crafting will be completely avoided throughout the match.'}
              </p>
            </div>
            )}
          </div>
          
          {/* Board Theme Selection (Light Board vs Dark Board) */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5">
              Board Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-2.5 border-2 border-black dark:border-white flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_#000]'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="font-black uppercase">Light Board</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-2.5 border-2 border-black dark:border-white flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_#fff]'
                    : 'bg-black text-white hover:bg-neutral-900'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="font-black uppercase">Dark Board</span>
              </button>
            </div>
          </div>

          {/* Color Choice */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5">
              Choose Side
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPlayerColor('white')}
                className={`p-2.5 border-2 border-black dark:border-white flex flex-col items-center gap-1 cursor-pointer ${
                  playerColor === 'white'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)]'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div className="w-5 h-5 bg-white border-2 border-black" />
                <span className="font-black uppercase">Play as White</span>
                <span className="text-[10px] font-mono">First move</span>
              </button>

              <button
                type="button"
                onClick={() => setPlayerColor('black')}
                className={`p-2.5 border-2 border-black dark:border-white flex flex-col items-center gap-1 cursor-pointer ${
                  playerColor === 'black'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)]'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div className="w-5 h-5 bg-black border-2 border-white" />
                <span className="font-black uppercase">Play as Black</span>
                <span className="text-[10px] font-mono">Bot moves first</span>
              </button>
            </div>
          </div>

          {/* Piece Theme Selection (Classic Standard vs Retro Playing Cards) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-500" />
                Piece Theme
              </label>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                {pieceTheme === 'classic' ? 'Default Standard' : 'Vintage Cards'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPieceTheme('classic')}
                className={`p-2.5 border-2 border-black dark:border-white flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  pieceTheme === 'classic'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)] ring-2 ring-black dark:ring-white'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 w-full py-0.5">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <ChessPiece type="knight" color="white" theme="classic" />
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <ChessPiece type="queen" color="black" theme="classic" />
                  </div>
                </div>
                <div className="text-center">
                  <span className="font-black uppercase text-xs block">Classic Standard</span>
                  <span className="text-[9px] opacity-80 block font-mono">Clean geometric</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPieceTheme('retro')}
                className={`p-2.5 border-2 border-black dark:border-white flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  pieceTheme === 'retro'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)] ring-2 ring-black dark:ring-white'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 w-full py-0.5">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <ChessPiece type="knight" color="white" theme="retro" />
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <ChessPiece type="queen" color="black" theme="retro" />
                  </div>
                </div>
                <div className="text-center">
                  <span className="font-black uppercase text-xs block">Retro Playing Cards</span>
                  <span className="text-[9px] opacity-80 block font-mono">Royal court art</span>
                </div>
              </button>
            </div>
          </div>

          {/* Difficulty Choice */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5">
              Engine Strength
            </label>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setDifficulty('grandmaster')}
                className={`w-full min-h-[48px] p-3 border-2 border-black dark:border-white text-left flex items-center justify-between cursor-pointer transition-all ${
                  difficulty === 'grandmaster'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)] ring-2 ring-black dark:ring-white'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }`}
              >
                <div>
                  <span className="font-black uppercase block text-xs sm:text-sm">Grandmaster Level</span>
                  <span className="text-[10px] font-normal block opacity-85">Depth 3 minimax + positional piece-square tables</span>
                </div>
                {difficulty === 'grandmaster' && (
                  <span className="text-[10px] bg-black text-amber-400 px-2 py-0.5 border border-black font-black uppercase shrink-0">
                    Active
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDifficulty('master')}
                className={`w-full min-h-[48px] p-3 border-2 border-black dark:border-white text-left flex items-center justify-between cursor-pointer transition-all ${
                  difficulty === 'master'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)] ring-2 ring-black dark:ring-white'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }`}
              >
                <div>
                  <span className="font-black uppercase block text-xs sm:text-sm">Master Level</span>
                  <span className="text-[10px] font-normal block opacity-85">Depth 2 tactical engine</span>
                </div>
                {difficulty === 'master' && (
                  <span className="text-[10px] bg-black text-amber-400 px-2 py-0.5 border border-black font-black uppercase shrink-0">
                    Active
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Timer Choice */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5">
              Match Clock
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTimeControl(300)}
                className={`p-2 border-2 border-black dark:border-white flex flex-col items-center gap-0.5 cursor-pointer ${
                  timeControl === 300
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)]'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <span className="font-black uppercase">⏱️ 5 Minutes</span>
                <span className="text-[10px] font-mono">Fixed clock</span>
              </button>

              <button
                type="button"
                onClick={() => setTimeControl(120)}
                className={`p-2 border-2 border-black dark:border-white flex flex-col items-center gap-0.5 cursor-pointer ${
                  timeControl === 120
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)]'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <span className="font-black uppercase">⚡ 2 Minutes</span>
                <span className="text-[10px] font-mono">Blitz clock</span>
              </button>
            </div>
          </div>

          {/* Move Suggestions */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5">
              Move Suggestions
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMoveSuggestions('included')}
                className={`p-2 border-2 border-black dark:border-white flex flex-col items-center gap-0.5 cursor-pointer ${
                  moveSuggestions === 'included'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)]'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <span className="font-black uppercase">Included</span>
                <span className="text-[10px] font-mono">Show hints</span>
              </button>

              <button
                type="button"
                onClick={() => setMoveSuggestions('excluded')}
                className={`p-2 border-2 border-black dark:border-white flex flex-col items-center gap-0.5 cursor-pointer ${
                  moveSuggestions === 'excluded'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)]'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <span className="font-black uppercase">Excluded</span>
                <span className="text-[10px] font-mono">No dots</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Mobile Bottom Action Bar */}
        <div className={`md:hidden p-3 border-t-3 border-black dark:border-white shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-20 ${
          gameMode === 'crafted' ? 'bg-[#1e293b]' : 'bg-amber-400'
        }`}>
          <button
            onClick={() => onStartBotMatch(playerColor, difficulty, timeControl, moveSuggestions, gameMode, gameMode === 'classic' ? false : craftingAllowed, pieceTheme)}
            className="w-full min-h-[46px] py-2.5 px-4 bg-black text-amber-400 hover:bg-neutral-900 border-2 border-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
          >
            <Swords className="w-4 h-4" />
            Start {gameMode === 'classic' ? 'Traditional Game' : gameMode === 'crafted' ? 'Crafted Game' : 'Mugen Game'}
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};
