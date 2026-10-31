import React from 'react';
import { Sparkles, Timer, Zap, ArrowUpCircle } from 'lucide-react';
import { heroDuelAudio } from '../utils/heroDuelAudio';
import { AbilityIcon, AbilityIconId } from './AbilityIcon';

export interface AbilityUpgradeChoice {
  type: 'cooldown' | 'potency_range';
  title: string;
  badge: string;
  description: string;
  statBonus: string;
}

interface MidGameUpgradeModalProps {
  isOpen: boolean;
  heroName: string;
  abilityId: AbilityIconId;
  abilityName: string;
  currentLevel: number;
  onSelectUpgrade: (choiceType: 'cooldown' | 'potency_range') => void;
  onDismiss: () => void;
}

export const MidGameUpgradeModal: React.FC<MidGameUpgradeModalProps> = ({
  isOpen,
  heroName,
  abilityId,
  abilityName,
  currentLevel,
  onSelectUpgrade,
  onDismiss,
}) => {
  if (!isOpen) return null;

  const choices: AbilityUpgradeChoice[] = [
    {
      type: 'cooldown',
      title: 'Cooldown Acceleration',
      badge: '-25% COOLDOWN',
      description: 'Dramatically reduces ability recharge time so you can cast faster in combat.',
      statBonus: 'Cooldown: -1s / -1 Turn',
    },
    {
      type: 'potency_range',
      title: 'Potency & Range Surge',
      badge: '+35% POWER / REACH',
      description: 'Increases direct strike impact, blast radius, or barrier protection potency.',
      statBonus: 'Potency: +2 DMG / Expanded Radius',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-[#12121c] border-3 border-amber-400 p-5 rounded-2xl max-w-md w-full shadow-2xl flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="font-black text-sm uppercase tracking-wider text-amber-400">
              Enemy Elimination Bonus!
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded">
            LVL {currentLevel} → {Math.min(3, currentLevel + 1)}
          </span>
        </div>

        {/* Hero & Ability Overview Banner */}
        <div className="flex items-center gap-3 bg-black/60 p-3 rounded-xl border border-white/10">
          <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-400/50 flex items-center justify-center shrink-0 shadow">
            <AbilityIcon abilityId={abilityId} className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
              {heroName}'s Equipment
            </span>
            <h4 className="text-sm font-black uppercase text-white truncate">{abilityName}</h4>
            <p className="text-[11px] text-neutral-300">Choose 1 mid-game attribute enhancement:</p>
          </div>
        </div>

        {/* The 2 Choices */}
        <div className="grid grid-cols-1 gap-2.5">
          {choices.map((choice) => (
            <button
              key={choice.type}
              type="button"
              onClick={() => {
                heroDuelAudio.playAbilityWhoosh();
                onSelectUpgrade(choice.type);
              }}
              className="p-3 bg-gradient-to-r from-purple-950/70 to-indigo-950/70 hover:from-purple-900/90 hover:to-indigo-900/90 border-2 border-purple-500/60 hover:border-amber-400 rounded-xl cursor-pointer transition-all flex items-start gap-3 text-left active:scale-[0.98] group"
            >
              <div className="p-2 rounded-lg bg-black/50 border border-white/20 text-amber-400 group-hover:text-amber-300 shrink-0 mt-0.5">
                {choice.type === 'cooldown' ? (
                  <Timer className="w-5 h-5 text-sky-400" />
                ) : (
                  <Zap className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-black text-xs uppercase text-white group-hover:text-amber-300">
                    {choice.title}
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-emerald-300 border border-emerald-500/30">
                    {choice.badge}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-snug">{choice.description}</p>
                <div className="text-[10px] font-mono text-amber-300/90 font-bold flex items-center gap-1">
                  <ArrowUpCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{choice.statBonus}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Optional Skip */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-mono font-bold rounded cursor-pointer border border-white/10"
          >
            Keep Current Stats
          </button>
        </div>
      </div>
    </div>
  );
};
