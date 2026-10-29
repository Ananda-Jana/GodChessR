/**
 * PostGameTrophyCardModal.tsx - League Mode Trophy Reward Card Modal
 * Displays a card showing trophies awarded (+90-120 on win, +20-30 on loss), current rank badge, and progress bar.
 * Clicking "OK" stores/claims trophies and returns the player directly to the League Tab in Trophy Room.
 */

import React from 'react';
import { Trophy, Sparkles, CheckCircle2, ChevronRight, Award, Flame, ShieldCheck } from 'lucide-react';
import { RankBadge } from './RankBadge';
import { getRankFromTrophies, getRankProgress, RankDefinition } from '../../league/rankConfig';

export interface LeagueTrophyResult {
  matchId: string;
  outcome: 'win' | 'loss' | 'draw';
  trophiesAwarded: number;
  oldTrophies: number;
  newTrophies: number;
  oldRank: RankDefinition;
  newRank: RankDefinition;
  promoted: boolean;
  gemsAwarded: number;
  passMultiplier?: number;
  passName?: string;
}

interface PostGameTrophyCardModalProps {
  isOpen: boolean;
  result: LeagueTrophyResult | null;
  onClaim: () => void;
}

export const PostGameTrophyCardModal: React.FC<PostGameTrophyCardModalProps> = ({
  isOpen,
  result,
  onClaim,
}) => {
  if (!isOpen || !result) return null;

  const { outcome, trophiesAwarded, oldTrophies, newTrophies, newRank, promoted, gemsAwarded, passMultiplier, passName } = result;
  const progressInfo = getRankProgress(newTrophies);

  const titleText =
    outcome === 'win'
      ? 'VICTORY ATTAINED!'
      : outcome === 'loss'
      ? 'MATCH DEFEAT COMPLETED'
      : 'STALEMATE DRAW';

  const outcomeSubtitle =
    outcome === 'win'
      ? 'Dominant performance in League Mode!'
      : outcome === 'loss'
      ? 'Trophies awarded for competing in League Mode!'
      : 'Evenly matched combatants!';

  const cardBorderColor =
    outcome === 'win'
      ? 'border-amber-400'
      : outcome === 'loss'
      ? 'border-rose-500/80'
      : 'border-sky-400';

  const cardGlowColor =
    outcome === 'win'
      ? 'shadow-[8px_8px_0px_#f59e0b]'
      : outcome === 'loss'
      ? 'shadow-[8px_8px_0px_#ef4444]'
      : 'shadow-[8px_8px_0px_#38bdf8]';

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="League Trophy Award"
    >
      <div
        className={`relative w-full max-w-md bg-[#090d14] border-4 ${cardBorderColor} ${cardGlowColor} p-6 flex flex-col items-center text-center text-white overflow-hidden`}
      >
        {/* Top Gold Foil Stripe */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 font-mono text-[11px] font-black uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>LEAGUE MODE AUTHORITATIVE STAKES</span>
        </div>

        {/* Outcome Title */}
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-white mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {titleText}
        </h2>
        <p className="text-xs font-mono text-slate-300 mt-0.5 mb-2">
          {outcomeSubtitle}
        </p>

        {/* Mugen Pass Active Multiplier Banner */}
        {passMultiplier && passMultiplier > 1 && (
          <div className="w-full my-1.5 py-1.5 px-3 bg-gradient-to-r from-purple-900/90 via-amber-900/90 to-purple-900/90 border-2 border-amber-400 font-mono text-xs font-black uppercase text-amber-300 flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000]">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>MUGEN PASS {passName || ''}: {passMultiplier}X TROPHY MULTIPLIER APPLIED!</span>
          </div>
        )}

        {/* Trophy Award Card Banner */}
        <div className="w-full bg-slate-950/90 border-2 border-white/20 p-5 rounded-none flex flex-col items-center my-2 relative overflow-hidden group">
          {/* Background Ambient Radial Glow */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${newRank.glowColor} 0%, transparent 70%)`,
            }}
          />

          {/* Large Animated Trophy Icon */}
          <div className="relative my-2">
            <div className="w-20 h-20 bg-amber-400/10 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.4)] animate-pulse">
              <Trophy className="w-11 h-11 text-amber-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" />
            </div>
            <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-2 -right-2 animate-bounce" />
          </div>

          {/* Main Trophies Delta Number */}
          <div className="mt-2 text-center">
            <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400 tracking-tight drop-shadow-[0_2px_10px_rgba(245,158,11,0.6)]">
              +{trophiesAwarded} TROPHIES
            </span>
            <span className="block text-[11px] font-mono uppercase text-slate-400 font-bold mt-1">
              {outcome === 'loss' ? 'Reward Given For Participating in League' : 'Stored Directly to Your Account'}
            </span>
          </div>
        </div>

        {/* Rank Progress & Status Card */}
        <div className="w-full bg-slate-900/80 border border-slate-700/80 p-4 mt-3 text-left">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <RankBadge rank={newRank} size="md" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">
                    CURRENT RANK
                  </span>
                  {promoted && (
                    <span className="text-[9px] font-mono font-black px-1.5 py-0.5 bg-emerald-500 text-black uppercase">
                      RANK UP!
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black uppercase text-white tracking-wide" style={{ color: newRank.primaryColor }}>
                  {newRank.name}
                </h3>
                <span className="text-xs font-mono font-bold text-amber-300 block">
                  {newTrophies.toLocaleString()} TR Total
                </span>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase block">Old TR</span>
              <span className="text-xs font-bold text-slate-300">{oldTrophies.toLocaleString()}</span>
            </div>
          </div>

          {/* Progress Bar towards Next Rank */}
          {progressInfo.nextRank && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                <span>Next: <strong className="text-slate-200">{progressInfo.nextRank.name}</strong></span>
                <span className="text-amber-400 font-bold">{progressInfo.trophiesRemaining} TR Needed</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 border border-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500"
                  style={{ width: `${progressInfo.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {promoted && gemsAwarded > 0 && (
            <div className="mt-2.5 p-2 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs font-mono text-emerald-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Promotion Bonus Gems
              </span>
              <span className="font-black text-amber-300">+{gemsAwarded} Gems</span>
            </div>
          )}
        </div>

        {/* Primary OK / Claim Button */}
        <button
          type="button"
          onClick={onClaim}
          className="w-full mt-5 py-3 px-6 bg-amber-400 hover:bg-amber-300 active:translate-y-0.5 text-black font-mono font-black text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#fff] flex items-center justify-center gap-2 cursor-pointer transition-all active:shadow-none"
        >
          <CheckCircle2 className="w-5 h-5 text-black" />
          <span>OK — CLAIM & RETURN TO LEAGUE</span>
          <ChevronRight className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
};
