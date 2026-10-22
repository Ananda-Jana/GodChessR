import React, { useState } from 'react';
import { Bot, Sparkles, X, Swords, Sun, Moon } from 'lucide-react';
import { PieceColor } from '../types/game';
import { useTheme } from '../context/ThemeContext';

interface BotMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGameMode?: 'standard' | 'crafted';
  onStartBotMatch: (
    playerColor: PieceColor,
    difficulty: 'grandmaster' | 'master',
    timeControl: 120 | 300,
    moveSuggestions: 'included' | 'excluded',
    gameMode: 'standard' | 'crafted'
  ) => void;
}

export const BotMatchModal: React.FC<BotMatchModalProps> = ({
  isOpen,
  onClose,
  initialGameMode = 'standard',
  onStartBotMatch,
}) => {
  const { theme, setTheme } = useTheme();
  const [playerColor, setPlayerColor] = useState<PieceColor>('white');
  const [difficulty, setDifficulty] = useState<'grandmaster' | 'master'>('grandmaster');
  const [timeControl, setTimeControl] = useState<120 | 300>(300); // 5 mins default
  const [moveSuggestions, setMoveSuggestions] = useState<'included' | 'excluded'>('included');
  const [gameMode, setGameMode] = useState<'standard' | 'crafted'>(initialGameMode);

  React.useEffect(() => {
    if (isOpen) {
      setGameMode(initialGameMode);
    }
  }, [isOpen, initialGameMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-none">
      <div className="bg-white dark:bg-[#0a0a0c] border-4 border-black dark:border-white max-w-md w-full max-h-[90dvh] [max-height:90vh] shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#ffffff] text-black dark:text-white flex flex-col overflow-hidden">
        
        {/* Sticky Top Header with Title and Close Button */}
        <div className={`p-3 sm:p-4 border-b-3 border-black dark:border-white flex items-center justify-between shrink-0 ${
          gameMode === 'crafted' ? 'bg-[#0f172a] text-white' : 'bg-neutral-100 dark:bg-[#141416]'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 border-2 border-black flex items-center justify-center font-black ${
              gameMode === 'crafted' ? 'bg-amber-400 text-black' : 'bg-amber-400 text-black'
            }`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight flex items-center gap-1.5">
                {gameMode === 'crafted' ? 'Play vs Bot (Crafted Pieces)' : 'Play vs Bot'}
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className={`text-[10px] font-bold uppercase ${
                gameMode === 'crafted' ? 'text-amber-400' : 'text-neutral-600 dark:text-neutral-400'
              }`}>
                {gameMode === 'crafted'
                  ? 'Communists · Priests · Supreme Rook'
                  : 'Instant play · Top calculation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* EDIT D: Sticky Top Action Bar so mobile players do not need to scroll */}
        <div className={`p-3 border-b-3 border-black dark:border-white shrink-0 ${
          gameMode === 'crafted' ? 'bg-[#1e293b]' : 'bg-amber-400'
        }`}>
          <button
            onClick={() => onStartBotMatch(playerColor, difficulty, timeControl, moveSuggestions, gameMode)}
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

          {/* Difficulty Choice */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5">
              Engine Strength
            </label>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setDifficulty('grandmaster')}
                className={`w-full p-2.5 border-2 border-black dark:border-white text-left flex items-start justify-between cursor-pointer ${
                  difficulty === 'grandmaster'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)]'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div>
                  <span className="font-black uppercase block">Grandmaster Level</span>
                  <span className="text-[10px] font-normal block">Depth 3 minimax + positional piece-square tables</span>
                </div>
                {difficulty === 'grandmaster' && (
                  <span className="text-[10px] bg-black text-amber-400 px-1 border border-black font-black uppercase">
                    Active
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDifficulty('master')}
                className={`w-full p-2.5 border-2 border-black dark:border-white text-left flex items-start justify-between cursor-pointer ${
                  difficulty === 'master'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)]'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div>
                  <span className="font-black uppercase block">Master Level</span>
                  <span className="text-[10px] font-normal block">Depth 2 tactical engine</span>
                </div>
                {difficulty === 'master' && (
                  <span className="text-[10px] bg-black text-amber-400 px-1 border border-black font-black uppercase">
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
