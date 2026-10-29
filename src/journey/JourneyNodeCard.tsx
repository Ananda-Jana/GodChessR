/**
 * JourneyNodeCard.tsx - Checkpoint Node Card along the Progression Path
 */

import React from 'react';
import { Lock, Star, Crown, Skull, Swords, Gift, CheckCircle2 } from 'lucide-react';
import type { JourneyNodeDef, JourneyNodeProgress } from './journeyTypes';
import { JourneyAvatar } from './JourneyAvatar';

interface JourneyNodeCardProps {
  node: JourneyNodeDef;
  progress: JourneyNodeProgress;
  isActive: boolean;
  isChestClaimed: boolean;
  onSelectNode: (node: JourneyNodeDef) => void;
  onClaimChest: (nodeId: string) => void;
}

export const JourneyNodeCard: React.FC<JourneyNodeCardProps> = ({
  node,
  progress,
  isActive,
  isChestClaimed,
  onSelectNode,
  onClaimChest,
}) => {
  const isLocked = !progress.unlocked;
  const isCompleted = progress.completed;
  const isBoss = node.type === 'boss';
  const isElite = node.type === 'elite';

  const stars = progress.stars || 0;

  return (
    <div className="relative flex flex-col items-center">
      {/* Node Main Card */}
      <button
        type="button"
        disabled={isLocked}
        onClick={() => onSelectNode(node)}
        className={`w-44 md:w-52 p-3 rounded-lg border-2 text-left transition-all relative overflow-hidden select-none cursor-pointer ${
          isLocked
            ? 'bg-slate-950/80 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
            : isActive
            ? 'bg-slate-900 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-105 ring-2 ring-amber-400/50'
            : isCompleted
            ? 'bg-slate-900/90 border-emerald-500/80 shadow-[2px_2px_0px_#000]'
            : 'bg-slate-900 border-slate-700 hover:border-slate-500'
        }`}
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-xs border ${
                isBoss
                  ? 'bg-rose-950 text-rose-400 border-rose-600'
                  : isElite
                  ? 'bg-purple-950 text-purple-400 border-purple-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              NODE {node.stepIndex}
            </span>

            {isBoss && (
              <span className="flex items-center gap-0.5 text-[9px] font-black uppercase text-amber-400 bg-amber-950/80 px-1 py-0.5 rounded-xs border border-amber-600">
                <Crown className="w-3 h-3 text-amber-400" />
                BOSS
              </span>
            )}
          </div>

          {/* Status Icon */}
          {isLocked ? (
            <Lock className="w-3.5 h-3.5 text-slate-600" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : isActive ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
          ) : null}
        </div>

        {/* Bot Info Row */}
        <div className="flex items-center gap-2.5 my-1.5">
          <JourneyAvatar
            avatarKey={node.botConfig.avatarKey}
            size="md"
            accentColor={node.botConfig.accentColor}
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black uppercase text-white truncate leading-tight">
              {node.name}
            </h4>
            <div className="text-[10px] font-mono text-slate-400 truncate">
              {node.botConfig.name}
            </div>
            <div className="text-[9px] font-mono font-bold text-amber-400">
              {node.botConfig.rating} ELO
            </div>
          </div>
        </div>

        {/* Stars Display */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((starIndex) => (
              <Star
                key={starIndex}
                className={`w-3.5 h-3.5 ${
                  stars >= starIndex
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
            <span>+{node.rewardPoints} PTS</span>
          </div>
        </div>
      </button>

      {/* Bonus Reward Chest Milestone (if defined) */}
      {node.bonusChestRarity && (
        <div className="mt-2 flex items-center">
          {isCompleted && !isChestClaimed ? (
            <button
              type="button"
              onClick={() => onClaimChest(node.id)}
              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black font-mono font-black text-[10px] uppercase rounded-sm border border-black shadow-[2px_2px_0px_#fff] flex items-center gap-1.5 animate-bounce cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>CLAIM REWARD</span>
            </button>
          ) : isChestClaimed ? (
            <div className="px-2 py-0.5 bg-slate-950 text-slate-500 font-mono text-[9px] uppercase rounded-xs border border-slate-800 flex items-center gap-1">
              <Gift className="w-3 h-3 text-slate-600" />
              <span>CLAIMED</span>
            </div>
          ) : (
            <div className="px-2 py-0.5 bg-slate-950 text-slate-600 font-mono text-[9px] uppercase rounded-xs border border-slate-900 flex items-center gap-1">
              <Gift className="w-3 h-3 text-slate-700" />
              <span>CLEAR TO UNLOCK</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
