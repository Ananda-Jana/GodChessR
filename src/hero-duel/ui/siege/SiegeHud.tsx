import React from 'react';
import { SiegeState } from '../../engine/siege/siegeTypes';
import { SIEGE_CONFIG } from '../../config/siegeConfig';
import { Clock, Pause, Play, FastForward, Flag, Shield } from 'lucide-react';

interface SiegeHudProps {
  state: SiegeState;
  isPaused: boolean;
  gameSpeed: number;
  onTogglePause: () => void;
  onChangeSpeed: (speed: number) => void;
  onResign: () => void;
}

export const SiegeHud: React.FC<SiegeHudProps> = ({
  state,
  isPaused,
  gameSpeed,
  onTogglePause,
  onChangeSpeed,
  onResign,
}) => {
  const timeLeft = Math.max(0, SIEGE_CONFIG.MAX_MATCH_SECONDS - state.elapsedSeconds);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-[#14141c] border-2 border-white/25 rounded-xl shadow-lg mb-4">
      {/* Dominion Meters */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="flex flex-col gap-1 w-32 sm:w-40">
          <div className="flex justify-between text-[10px] font-black uppercase text-blue-400">
            <span>Team 1 Dominion</span>
            <span>{Math.floor(state.dominion[1])}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-white/20">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${state.dominion[1]}%` }} />
          </div>
        </div>

        <div className="flex flex-col gap-1 w-32 sm:w-40">
          <div className="flex justify-between text-[10px] font-black uppercase text-red-400">
            <span>Team 2 Dominion</span>
            <span>{Math.floor(state.dominion[2])}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-white/20">
            <div className="h-full bg-red-500 transition-all" style={{ width: `${state.dominion[2]}%` }} />
          </div>
        </div>
      </div>

      {/* Timer & Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-black border border-white/20 rounded font-mono text-sm font-bold text-amber-400">
          <Clock className="w-4 h-4" />
          <span>
            {minutes}:{seconds < 10 ? '0' : ''}{seconds}
          </span>
        </div>

        <button
          onClick={onTogglePause}
          className="p-2 bg-neutral-800 hover:bg-neutral-700 border border-white/30 rounded text-white cursor-pointer"
          title={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
        </button>

        <button
          onClick={() => onChangeSpeed(gameSpeed === 1 ? 0.5 : 1)}
          className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 border border-white/30 rounded text-xs font-mono font-bold text-white cursor-pointer"
        >
          {gameSpeed}x
        </button>

        <button
          onClick={onResign}
          className="p-2 bg-red-950/60 hover:bg-red-900 border border-red-500/40 rounded text-red-400 cursor-pointer"
          title="Resign Match"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
