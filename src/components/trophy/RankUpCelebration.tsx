/**
 * RankUpCelebration.tsx - Animated Promotion Celebration Modal
 */

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RankDefinition } from '../../league/rankConfig';
import { RankBadge } from './RankBadge';
import { Sparkles, Trophy, Gift, ArrowRight } from 'lucide-react';
import { CurrencyAllocatedSlot } from '../../economy/CurrencyIcons';

interface RankUpCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  oldRank: RankDefinition;
  newRank: RankDefinition;
  newTrophies: number;
  gemsAwarded: number;
}

export const RankUpCelebration: React.FC<RankUpCelebrationProps> = ({
  isOpen,
  onClose,
  oldRank,
  newRank,
  newTrophies,
  gemsAwarded,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-[#0a0d14] border-4 border-amber-400 p-6 shadow-[0_0_50px_rgba(245,158,11,0.5)] flex flex-col items-center text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${newRank.primaryColor} 0%, transparent 70%)`,
              }}
            />

            {/* Header Banner */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-black font-mono font-black text-xs uppercase mb-4 border border-black shadow-[2px_2px_0px_#000]">
              <Sparkles className="w-4 h-4 animate-bounce" />
              <span>LEAGUE PROMOTION!</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight mb-6">
              RANK PROMOTED!
            </h2>

            {/* Old Rank -> New Rank Animation Row */}
            <div className="flex items-center justify-center gap-4 my-4 w-full">
              <div className="flex flex-col items-center opacity-60 scale-90">
                <RankBadge rank={oldRank} size="lg" />
                <span className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase">
                  {oldRank.name}
                </span>
              </div>

              <ArrowRight className="w-6 h-6 text-amber-400 animate-pulse shrink-0" />

              <div className="flex flex-col items-center scale-110">
                <RankBadge rank={newRank} size="hero" />
                <span
                  className="text-xs font-mono font-black uppercase mt-2 tracking-wider"
                  style={{ color: newRank.primaryColor }}
                >
                  {newRank.name}
                </span>
              </div>
            </div>

            {/* Trophies & Rewards */}
            <div className="w-full bg-slate-900/90 border-2 border-slate-700 p-3 my-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Trophy className="w-4 h-4" /> League Trophies:
                </span>
                <span className="text-sm font-black text-white">{newTrophies} TR</span>
              </div>

              {gemsAwarded > 0 && (
                <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 border-t border-slate-800 pt-2">
                  <span className="flex items-center gap-1.5">
                    <Gift className="w-4 h-4" /> Promotion Reward:
                  </span>
                  <span className="text-sm font-black text-amber-300 flex items-center gap-1">
                    +{gemsAwarded} <CurrencyAllocatedSlot type="gem" size="sm" />
                  </span>
                </div>
              )}
            </div>

            {/* Shield Protection Notice */}
            <p className="text-[11px] font-mono text-slate-400 mb-6 px-2">
              🛡️ Promotion Shield active for your next 3 matches! Demotion protection granted.
            </p>

            {/* Continue Button */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#fff] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer transition-all"
            >
              CLAIM & CONTINUE →
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
