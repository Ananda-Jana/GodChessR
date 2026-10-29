import React from 'react';
import { MatchState } from '../types/game';
import { useAuth } from '../context/AuthContext';
import { AvatarDisplay } from './Avatars';
import { Swords, Flag, Play, Clock, Crown, Shield } from 'lucide-react';

interface AbandonedMatchModalProps {
  match: MatchState | null;
  onResume: () => void;
  onResign: () => void;
}

export const AbandonedMatchModal: React.FC<AbandonedMatchModalProps> = ({
  match,
  onResume,
  onResign,
}) => {
  const { user } = useAuth();

  if (!match || match.status !== 'active') return null;

  const isWhite = match.whitePlayer.userId === user?.id;
  const myColor = isWhite ? 'white' : 'black';
  const opponent = isWhite ? match.blackPlayer : match.whitePlayer;
  const isMyTurn = match.turn === myColor;
  const timeControlLabel = match.timeControl ? `${match.timeControl / 60}m` : '5m';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="abandoned-match-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#121214] border-4 border-black dark:border-white shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#ffffff] p-5 sm:p-6 text-black dark:text-white flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="w-10 h-10 rounded-lg bg-amber-400 text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_#000] shrink-0">
            <Swords className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="abandoned-match-title" className="text-base sm:text-lg font-black uppercase tracking-tight">
              Active Match Found
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
              You have an unfinished game in progress.
            </p>
          </div>
        </div>

        {/* Match Card Preview */}
        <div className="bg-neutral-100 dark:bg-[#1a1a1e] border-2 border-black dark:border-white/20 p-3.5 rounded-lg flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <AvatarDisplay avatarId={opponent.avatarId} className="w-9 h-9 border border-black dark:border-white shrink-0" />
              <div className="min-w-0">
                <span className="text-xs text-neutral-500 uppercase font-black block">Opponent</span>
                <span className="text-sm font-black truncate block">{opponent.displayName || opponent.username}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Playing As</span>
              <span className="text-xs font-black uppercase flex items-center gap-1 justify-end">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full border border-black ${
                    myColor === 'white' ? 'bg-white' : 'bg-black'
                  }`}
                />
                {myColor}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <div className="bg-white dark:bg-[#121214] p-1.5 rounded border border-neutral-300 dark:border-neutral-700">
              <span className="text-[9px] uppercase font-bold text-neutral-500 block">Mode</span>
              <span className="text-xs font-black uppercase text-amber-500">
                {match.gameMode || 'standard'}
              </span>
            </div>
            <div className="bg-white dark:bg-[#121214] p-1.5 rounded border border-neutral-300 dark:border-neutral-700">
              <span className="text-[9px] uppercase font-bold text-neutral-500 block">Time</span>
              <span className="text-xs font-black uppercase flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                {timeControlLabel}
              </span>
            </div>
            <div className="bg-white dark:bg-[#121214] p-1.5 rounded border border-neutral-300 dark:border-neutral-700">
              <span className="text-[9px] uppercase font-bold text-neutral-500 block">Turn</span>
              <span
                className={`text-xs font-black uppercase ${
                  isMyTurn ? 'text-emerald-500' : 'text-neutral-400'
                }`}
              >
                {isMyTurn ? 'Your Turn' : 'Waiting'}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Would you like to return to this match or resign to award the victory to your opponent?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onResume}
            className="w-full sm:flex-1 min-h-[46px] px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            Resume Match
          </button>
          <button
            type="button"
            onClick={onResign}
            className="w-full sm:w-auto min-h-[46px] px-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            Resign
          </button>
        </div>
      </div>
    </div>
  );
};
