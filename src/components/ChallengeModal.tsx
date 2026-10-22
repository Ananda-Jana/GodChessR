import React from 'react';
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
  if (!challenge) return null;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-white dark:bg-[#0a0a0c] border-4 border-black dark:border-white p-4 shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#ffffff] text-black dark:text-white">
      <div className="flex items-start gap-3">
        <div className="border-2 border-black dark:border-white p-0.5 shrink-0 bg-neutral-100 dark:bg-neutral-900">
          <AvatarDisplay avatarId={challenge.challenger.avatarId} size="md" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-black dark:text-amber-400 text-xs font-black uppercase tracking-wider">
            <Swords className="w-4 h-4 text-amber-500" />
            MATCH CHALLENGE!
          </div>
          <h4 className="text-sm font-black uppercase truncate mt-0.5">
            {challenge.challenger.displayName}
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">
            @{challenge.challenger.username} challenged you!
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 border border-black text-[11px] font-black uppercase text-black">
              <span>⏱️ {challenge.timeControl === 120 ? '2 Minutes' : '5 Minutes'}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-200 dark:bg-neutral-800 border border-black dark:border-white text-[11px] font-black uppercase">
              <span>💡 Hints: {challenge.moveSuggestions === 'excluded' ? 'Excluded' : 'Included'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onAccept(challenge.id)}
              className="flex-1 py-2 px-3 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1 shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={() => onDecline(challenge.id)}
              className="py-2 px-3 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-black dark:text-white border-2 border-black dark:border-white font-black text-xs uppercase flex items-center justify-center gap-1 shadow-[2px_2px_0px_var(--shadow)] cursor-pointer"
            >
              <X className="w-4 h-4" />
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
