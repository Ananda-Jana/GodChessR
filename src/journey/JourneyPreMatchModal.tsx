/**
 * JourneyPreMatchModal.tsx - Mission Briefing Modal Before Entering a Journey Match
 */

import React from 'react';
import {
  X,
  Swords,
  Crown,
  Star,
  Clock,
  Shield,
  Zap,
  Target,
  Gift,
  Bot,
} from 'lucide-react';
import type { JourneyNodeDef, JourneyNodeProgress } from './journeyTypes';
import { JourneyAvatar } from './JourneyAvatar';
import { CurrencyAllocatedSlot } from '../economy/CurrencyIcons';

interface JourneyPreMatchModalProps {
  isOpen: boolean;
  node: JourneyNodeDef | null;
  progress: JourneyNodeProgress | null;
  onClose: () => void;
  onStartMatch: (node: JourneyNodeDef) => void;
}

export const JourneyPreMatchModal: React.FC<JourneyPreMatchModalProps> = ({
  isOpen,
  node,
  progress,
  onClose,
  onStartMatch,
}) => {
  if (!isOpen || !node) return null;

  const isBoss = node.type === 'boss';
  const isElite = node.type === 'elite';
  const currentStars = progress?.stars || 0;

  return (
    <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0f19] border-2 border-white/20 w-full max-w-lg rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col max-h-[90dvh]">
        {/* Header Bar */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b-2 ${
            isBoss
              ? 'bg-rose-950/60 border-rose-500/50'
              : 'bg-black/60 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 bg-black text-amber-400 font-mono font-black text-xs rounded-xs border border-amber-500">
              NODE {node.stepIndex}
            </span>
            <div>
              <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
                {node.name}
                {isBoss && <Crown className="w-4 h-4 text-amber-400" />}
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {node.chapterName} · {node.realm}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200">
          {/* Bot Card Showcase */}
          <div className="p-4 rounded-lg bg-black/50 border border-white/10 flex items-center gap-4">
            <JourneyAvatar
              avatarKey={node.botConfig.avatarKey}
              size="lg"
              accentColor={node.botConfig.accentColor}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black uppercase text-white truncate">
                  {node.botConfig.name}
                </h4>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded-xs border border-amber-500/40">
                  {node.botConfig.rating} ELO
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                {node.botConfig.title}
              </p>
              <div className="mt-2 text-xs italic text-slate-300 bg-slate-900/60 p-2 rounded-md border border-slate-800">
                "{node.botConfig.dialogueIntro}"
              </div>
            </div>
          </div>

          {/* Boss Special Banner (if 3000 ELO / Boss) */}
          {node.botConfig.isPerfectPlayBoss && (
            <div className="p-3 bg-gradient-to-r from-amber-950/60 via-rose-950/60 to-purple-950/60 border border-amber-500/60 rounded-lg flex items-center gap-3">
              <Crown className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <h5 className="text-xs font-black uppercase text-amber-300">
                  3000 ELO Grandmaster Perfect-Play Boss
                </h5>
                <p className="text-[10px] text-amber-200/80 mt-0.5">
                  Deep tactical calculation, quiescence search, and zero blunder margin. Victory requires supreme focus!
                </p>
              </div>
            </div>
          )}

          {/* Star Criteria List */}
          <div className="space-y-2">
            <h5 className="text-xs font-mono font-black uppercase text-slate-400 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>STAR OBJECTIVES</span>
            </h5>

            <div className="space-y-1.5">
              <div className="p-2.5 rounded-md bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <Star
                    className={`w-4 h-4 ${
                      currentStars >= 1
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                  <span>{node.starCriteria.oneStar}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">1 STAR</span>
              </div>

              <div className="p-2.5 rounded-md bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <Star
                    className={`w-4 h-4 ${
                      currentStars >= 2
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                  <span>{node.starCriteria.twoStars}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">2 STARS</span>
              </div>

              <div className="p-2.5 rounded-md bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <Star
                    className={`w-4 h-4 ${
                      currentStars >= 3
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                  <span>{node.starCriteria.threeStars}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">3 STARS</span>
              </div>
            </div>
          </div>

          {/* Rewards Box */}
          <div className="p-3 bg-black/40 border border-white/10 rounded-lg flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300">
              FIRST CLEAR REWARD:
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-emerald-400 font-mono text-xs font-black">
                <span>+{node.rewardPoints} PTS</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 font-mono text-xs font-black">
                <CurrencyAllocatedSlot type="gem" size="sm" />
                <span>+{node.rewardGems} GEMS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-5 border-t border-white/10 bg-black/60 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono font-bold text-xs uppercase cursor-pointer"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={() => onStartMatch(node)}
            className="flex-2 py-3 px-6 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#fff] cursor-pointer"
          >
            <Swords className="w-4 h-4" />
            <span>ENGAGE BATTLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
