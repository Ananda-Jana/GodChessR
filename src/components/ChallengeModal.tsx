import React, { useState, useEffect } from 'react';
import { Challenge } from '../types/game';
import { AvatarDisplay } from './Avatars';
import { Swords, Check, X } from 'lucide-react';

interface ChallengeModalProps {
  challenge: Challenge | null;
  onAccept: (challengeId: string) => void;
  onDecline: (challengeId: string) => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  challenge,
  onAccept,
  onDecline,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    if (!challenge) return;

    const updateTimer = () => {
      const total = challenge.expiresAt - challenge.createdAt;
      const remaining = challenge.expiresAt - Date.now();
      const pct = Math.max(0, (remaining / total) * 100);
      
      setTimeLeft(Math.max(0, Math.ceil(remaining / 1000)));
      setProgress(pct);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [challenge]);

  if (!challenge) return null;

  return (
    <div 
      role="status" 
      aria-live="polite"
      className="fixed top-2 inset-x-2 z-[60] flex justify-center pointer-events-none"
    >
      <div className="max-w-xl w-full bg-white dark:bg-[#0a0a0c] border-4 border-black dark:border-white shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#ffffff] text-black dark:text-white pointer-events-auto animate-in slide-in-from-top-4 duration-200">
        <div className="flex flex-col sm:flex-row items-center gap-3 p-3">
          <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
            <div className="border-2 border-black dark:border-white p-0.5 shrink-0 bg-neutral-100 dark:bg-neutral-900">
              <AvatarDisplay avatarId={challenge.challenger.avatarId} size="sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                <Swords className="w-3.5 h-3.5" />
                <span>New Challenge!</span>
              </div>
              <h4 className="text-xs font-black uppercase truncate">
                {challenge.challenger.displayName}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white text-[10px] font-mono font-bold whitespace-nowrap">
            <span>{challenge.timeControl / 60}m</span>
            <span className="opacity-30">|</span>
            <span>{challenge.moveSuggestions === 'excluded' ? 'No Hints' : 'Hints'}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onDecline(challenge.id)}
              className="flex-1 sm:flex-none w-11 h-11 flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-black dark:text-white border-2 border-black dark:border-white font-black uppercase shadow-[2px_2px_0px_var(--shadow)] cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-400 outline-none"
              aria-label="Decline Challenge"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => onAccept(challenge.id)}
              className="flex-[2] sm:flex-none h-11 px-4 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-400 outline-none"
            >
              <Check className="w-5 h-5" />
              <span>Accept ({timeLeft}s)</span>
            </button>
          </div>
        </div>

        {/* Expiry Progress Bar */}
        <div 
          className="h-1.5 bg-neutral-200 dark:bg-neutral-800"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div 
            className="h-full bg-amber-500 transition-all duration-100" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    </div>
  );
};
