import React, { useState, useEffect } from 'react';
import { ExpansionSide, PieceColor } from '../types/game';
import { useTheme } from '../context/ThemeContext';
import { Maximize2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Clock } from 'lucide-react';

interface ExpansionModalProps {
  playerColor: PieceColor;
  onExpand: (side: ExpansionSide) => void;
  boardWidth: number;
  boardHeight: number;
  expiresAt: number;
}

export const ExpansionModal: React.FC<ExpansionModalProps> = ({
  playerColor,
  onExpand,
  boardWidth,
  boardHeight,
  expiresAt,
}) => {
  const { theme } = useTheme();
  const isThemeLight = theme === 'light';

  const [timeLeft, setTimeLeft] = useState<number>(() =>
    Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        // Auto-pick: own back side (bottom for white, top for black)
        const autoSide: ExpansionSide = playerColor === 'white' ? 'bottom' : 'top';
        onExpand(autoSide);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [expiresAt, playerColor, onExpand]);

  const defaultSide: ExpansionSide = playerColor === 'white' ? 'bottom' : 'top';

  const options: { side: ExpansionSide; label: string; desc: string; icon: React.ReactNode; isDefault: boolean }[] = [
    {
      side: 'top',
      label: 'Add Row (Top)',
      desc: `Extends rank ${boardHeight + 1} across all ${boardWidth} files`,
      icon: <ArrowUp className="w-5 h-5" />,
      isDefault: defaultSide === 'top',
    },
    {
      side: 'bottom',
      label: 'Add Row (Bottom)',
      desc: `Adds back-rank row behind your start position`,
      icon: <ArrowDown className="w-5 h-5" />,
      isDefault: defaultSide === 'bottom',
    },
    {
      side: 'left',
      label: 'Add Column (Left)',
      desc: `Prepends new file before 'a' (${boardHeight} squares)`,
      icon: <ArrowLeft className="w-5 h-5" />,
      isDefault: false,
    },
    {
      side: 'right',
      label: 'Add Column (Right)',
      desc: `Appends file '${String.fromCharCode('a'.charCodeAt(0) + boardWidth)}' (${boardHeight} squares)`,
      icon: <ArrowRight className="w-5 h-5" />,
      isDefault: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg p-5 sm:p-6 border-4 transition-colors bg-black border-white shadow-[8px_8px_0px_#ffffff] text-white"
      >
        {/* Header with Title and 15s Timer */}
        <div className="flex items-center justify-between gap-3 border-b-2 border-current pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500 border border-black text-black">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider">
                Board Expansion
              </h2>
              <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">
                7th Piece Lost Perk
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-500 text-amber-400 font-mono font-black text-sm">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm font-semibold mb-4 leading-relaxed opacity-90">
          You lost your 7th piece! Choose any side to permanently expand the battlefield by one row or column. Clocks are paused.
        </p>

        {/* 4 Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {options.map((opt) => (
            <button
              key={opt.side}
              onClick={() => onExpand(opt.side)}
              className={`flex flex-col text-left p-3 border-2 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${
                opt.isDefault
                  ? 'border-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                  : isThemeLight
                  ? 'border-black hover:bg-neutral-100'
                  : 'border-white hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-black text-sm uppercase flex items-center gap-1.5">
                  <span className="text-amber-500">{opt.icon}</span>
                  {opt.label}
                </span>
                {opt.isDefault && (
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-amber-500 text-black">
                    Auto-Pick
                  </span>
                )}
              </div>
              <span className="text-xs opacity-75 font-mono leading-tight">
                {opt.desc}
              </span>
            </button>
          ))}
        </div>

        <div className="text-[11px] font-mono text-center opacity-60">
          Clocks resume immediately upon selection. Auto-picks in {timeLeft}s.
        </div>
      </div>
    </div>
  );
};

export default ExpansionModal;
