import React, { useEffect, useMemo } from 'react';
import { HeroInstance } from '../types/heroDuelTypes';
import { HeroBottomDock, HeroDockItem } from './HeroBottomDock';
import { Zap } from 'lucide-react';
import { heroDuelAudio } from '../utils/heroDuelAudio';
import { getHeroEquipmentAbility } from '../config/siegeRulesCodex';

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

const abilityIconMap: Record<number, 'meteor' | 'jetpack' | 'spiky_ball' | 'shield_barrier'> = {
  0: 'meteor',
  1: 'jetpack',
  2: 'spiky_ball',
  3: 'shield_barrier',
};

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
          heroDuelAudio.unlock();
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
          heroDuelAudio.playAbilityWhoosh();
          onSelectHeroAndTriggerAbility(selectedHero);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isMyTurn,
    activeTargetMode,
    myHeroes,
    selectedHero,
    onCancelActive,
    onSelectHero,
    onSelectHeroAndTriggerAbility,
    hasValidTargets,
  ]);

  const dockHeroes: HeroDockItem[] = useMemo(() => {
    return myHeroes.map((hero) => {
      const ability = getHeroEquipmentAbility(hero.heroId || 'mugen-king');
      return {
        instanceId: hero.instanceId,
        name: hero.name,
        hp: 15,
        maxHp: 15,
        isAlive: hero.isAlive,
        abilityId: ability.id,
        abilityUnlocked: hero.isAlive && !hero.isSilenced,
        cooldownSeconds: hero.currentCooldown,
        initialCooldownSeconds: ability.cooldownSec,
        level: 1,
        maxLevel: 3,
        isActive: selectedHero?.instanceId === hero.instanceId,
      };
    });
  }, [myHeroes, selectedHero]);

  if (activeTargetMode && selectedHero) {
    return (
      <div className="w-full bg-blue-950/90 border-2 border-blue-400 p-2 sm:p-2.5 shadow-lg flex items-center justify-between gap-3 text-white rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <Zap className="w-5 h-5 text-blue-400 animate-pulse shrink-0" />
          <div className="truncate">
            <span className="text-xs font-black uppercase text-blue-300 block truncate">
              Targeting: {selectedHero.active.name} ({selectedHero.name})
            </span>
            <span className="text-[10px] text-neutral-300 font-mono">
              Tap any highlighted blue target square on the board.
            </span>
          </div>
        </div>

        <button
          onClick={onCancelActive}
          className="hd-btn-brutal px-3 py-1 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase border border-white cursor-pointer shrink-0"
        >
          Cancel (Esc)
        </button>
      </div>
    );
  }

  return (
    <HeroBottomDock
      heroes={dockHeroes}
      onActivateAbility={(instanceId) => {
        const hero = myHeroes.find((h) => h.instanceId === instanceId);
        if (!hero || !isMyTurn || !hero.isAlive) return;

        if (hero.currentCooldown === 0 && !hero.isSilenced && hasValidTargets(hero)) {
          heroDuelAudio.playAbilityWhoosh();
          onSelectHeroAndTriggerAbility(hero);
        } else {
          heroDuelAudio.triggerHaptic(15);
          onSelectHero(hero);
        }
      }}
    />
  );
};
