import React, { useEffect } from 'react';
import { HeroInstance, Coord } from '../types/heroDuelTypes';
import { HeroPieceSvg } from '../art/heroPieceSvg';
import { Zap, X, Check, Shield, AlertCircle } from 'lucide-react';

interface AbilityBarProps {
  myHeroes: HeroInstance[];
  selectedHero: HeroInstance | null;
  activeTargetMode: boolean;
  onSelectHeroAndTriggerAbility: (hero: HeroInstance) => void;
  onSelectHero: (hero: HeroInstance) => void;
  onCancelActive: () => void;
  isMyTurn: boolean;
  hasValidTargets?: (hero: HeroInstance) => boolean;
}

export const AbilityBar: React.FC<AbilityBarProps> = ({
  myHeroes,
  selectedHero,
  activeTargetMode,
  onSelectHeroAndTriggerAbility,
  onSelectHero,
  onCancelActive,
  isMyTurn,
  hasValidTargets = () => true,
}) => {
  // Hotkeys on desktop: 1-4 to select hero, Q to use active ability, Esc to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isMyTurn) return;

      if (e.key === 'Escape' && activeTargetMode) {
        onCancelActive();
        return;
      }

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= myHeroes.length) {
        const hero = myHeroes[num - 1];
        if (hero && hero.isAlive) {
          onSelectHero(hero);
        }
        return;
      }

      if ((e.key === 'q' || e.key === 'Q') && selectedHero) {
        if (
          selectedHero.isAlive &&
          selectedHero.currentCooldown === 0 &&
          !selectedHero.isSilenced &&
          hasValidTargets(selectedHero)
        ) {
          onSelectHeroAndTriggerAbility(selectedHero);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMyTurn, activeTargetMode, myHeroes, selectedHero, onCancelActive, onSelectHero, onSelectHeroAndTriggerAbility, hasValidTargets]);

  if (activeTargetMode && selectedHero) {
    return (
      <div className="w-full bg-blue-950 border-3 border-blue-400 p-2.5 sm:p-3 shadow-lg flex items-center justify-between gap-3 text-white rounded-xl animate-in fade-in">
        <div className="flex items-center gap-2.5 min-w-0">
          <Zap className="w-5 h-5 text-blue-400 animate-pulse shrink-0" />
          <div className="truncate">
            <span className="text-xs font-black uppercase text-blue-300 block truncate">
              Targeting: {selectedHero.active.name} ({selectedHero.name})
            </span>
            <span className="text-[10px] text-neutral-300 font-mono">
              Tap any highlighted blue target square on the 7×8 board.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onCancelActive}
            className="hd-btn-brutal px-3 py-1.5 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase border border-white cursor-pointer"
          >
            Cancel (Esc)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#121218] border-2 border-white/20 p-2 sm:p-2.5 rounded-xl flex flex-col gap-1.5 text-white shadow-lg">
      <div className="flex items-center justify-between px-1 text-[10px] font-mono uppercase text-neutral-400 font-bold">
        <span>Team Active Power Deck (Keys 1-4, Q to Cast)</span>
        <span>{isMyTurn ? 'Your Turn' : 'Waiting...'}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {myHeroes.map((hero, idx) => {
          const isSelected = selectedHero?.instanceId === hero.instanceId;
          const isDead = !hero.isAlive;
          const isSilenced = Boolean(hero.isSilenced);
          const isCooldown = hero.currentCooldown > 0;
          const valid = isMyTurn && !isDead && !isSilenced && !isCooldown && hasValidTargets(hero);
          const noTargets = isMyTurn && !isDead && !isSilenced && !isCooldown && !hasValidTargets(hero);

          return (
            <button
              key={hero.instanceId}
              type="button"
              onClick={() => {
                if (!isMyTurn || isDead) return;
                if (valid) {
                  onSelectHeroAndTriggerAbility(hero);
                } else {
                  onSelectHero(hero);
                }
              }}
              disabled={!isMyTurn || isDead}
              className={`p-2 rounded-lg border-2 flex items-center gap-2 text-left transition-all relative overflow-hidden min-h-[50px] cursor-pointer ${
                isSelected
                  ? 'border-amber-400 bg-amber-950/40 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                  : 'border-white/15 bg-[#181822] hover:border-white/40'
              } ${!isMyTurn || isDead ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {/* Hotkey Number Badge */}
              <span className="absolute top-1 right-1 text-[9px] font-mono font-black text-neutral-500 bg-black/60 px-1 rounded">
                {idx + 1}
              </span>

              {/* Hero Icon */}
              <div className="w-8 h-8 shrink-0 relative flex items-center justify-center bg-black/60 rounded border border-white/20">
                <HeroPieceSvg heroId={hero.heroId} team={hero.team} isCaptain={hero.isCaptain} size={28} />
              </div>

              {/* Ability Info */}
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black uppercase text-white truncate leading-tight">
                  {hero.active.name}
                </div>
                <div className="text-[9px] font-mono truncate leading-tight mt-0.5">
                  {isDead ? (
                    <span className="text-red-500 font-bold">FALLEN</span>
                  ) : isSilenced ? (
                    <span className="text-purple-400 font-bold">SILENCED</span>
                  ) : isCooldown ? (
                    <span className="text-amber-400">CD: {hero.currentCooldown} Turns</span>
                  ) : noTargets ? (
                    <span className="text-neutral-400 italic">No Target Range</span>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 inline" /> READY
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
