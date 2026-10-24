import React, { useState } from 'react';
import { Bot, Sparkles, X, Swords, Sun, Moon, Palette } from 'lucide-react';
import { PieceColor, PieceTheme } from '../types/game';
import { useTheme } from '../context/ThemeContext';
import { ChessPiece } from './ChessPiece';
import { useModalFocus } from '../utils/useModalFocus';

interface BotMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGameMode?: 'standard' | 'crafted';
  onStartBotMatch: (
    playerColor: PieceColor,
    difficulty: 'grandmaster' | 'master',
    timeControl: 120 | 300,
    moveSuggestions: 'included' | 'excluded',
    gameMode: 'standard' | 'crafted',
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
  const [gameMode, setGameMode] = useState<'standard' | 'crafted'>(initialGameMode);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bot-match-modal-title"
        className="bg-white dark:bg-[#0a0a0c] border-4 border-black dark:border-white max-w-md w-full max-h-[90dvh] [max-height:90vh] shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#ffffff] text-black dark:text-white flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sticky Top Header with Title and Close Button */}
        <div className={`p-3 sm:px-4 sm:py-3 border-b-3 border-black dark:border-white flex items-center justify-between shrink-0 bg-black text-white`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 border-2 border-white flex items-center justify-center font-black bg-amber-400 text-black`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 id="bot-match-modal-title" className="text-sm sm:text-base font-black uppercase tracking-tight flex items-center gap-1.5">
                {gameMode === 'crafted' ? 'Play vs Bot (Crafted Pieces)' : 'Play vs Bot'}
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

        {/* EDIT D: Sticky Top Action Bar so mobile players do not need to scroll */}
        <div className={`p-3 border-b-3 border-black dark:border-white shrink-0 ${
          gameMode === 'crafted' ? 'bg-[#1e293b]' : 'bg-amber-400'
        }`}>
          <button
            onClick={() => onStartBotMatch(playerColor, difficulty, timeControl, moveSuggestions, gameMode, craftingAllowed, pieceTheme)}
            className="w-full py-2.5 px-4 bg-black text-amber-400 hover:bg-neutral-900 border-2 border-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000000]"
          >
            <Swords className="w-4 h-4" />
            Start {gameMode === 'crafted' ? 'Crafted Game' : 'Game'} Now
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 text-xs font-bold">

          {/* Game Mode Choice */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5">
              Select Game Mode / Pieces
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGameMode('standard')}
                className={`p-2.5 border-2 border-black dark:border-white flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  gameMode === 'standard'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)]'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <span className="font-black uppercase text-xs">Standard Dice Chess</span>
                <span className="text-[10px] text-center font-normal">Queens, Prince, Rooks, Bishops, Knights</span>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('crafted')}
                className={`p-2.5 border-2 border-black dark:border-white flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  gameMode === 'crafted'
                    ? 'bg-[#0f172a] text-amber-400 border-amber-400 shadow-[3px_3px_0px_var(--shadow)]'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-black uppercase text-xs">Crafted Pieces</span>
                </div>
                <span className="text-[10px] text-center font-normal">Communists, Priests &amp; Supreme Rook</span>
              </button>
            </div>

            {/* Mid-Game Crafting Option for Both Standard and Crafted Game Modes */}
            <div className="mt-2.5 p-2.5 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider">Mid-Game Crafting Perk</span>
                  <span className="text-[9px] text-neutral-500 font-normal">
                    {gameMode === 'crafted' ? '(Mid-game triggers)' : '(Mid-game triggers)'}
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
                  <span className="text-[9px] text-center opacity-85">No mid-game piece summons</span>
                </button>
              </div>
              <p className="mt-1.5 text-[9px] text-neutral-500 dark:text-neutral-400 font-normal">
                {craftingAllowed
                  ? 'Crafting triggers once 2 expensive pieces (Queen, Rook, Prince, Communist, etc.) are lost. Pawns never trigger crafting.'
                  : 'Mid-game crafting will be completely avoided throughout the match.'}
              </p>
            </div>
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
      </div>
    </div>
  );
};
