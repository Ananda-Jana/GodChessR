import React from 'react';
import { AbilityTile, AbilityId, Rarity } from './AbilityTiles';

export interface HeroDockItem {
  instanceId: string;
  name: string;
  hp: number;
  maxHp: number; // Always 15
  isAlive: boolean;
  abilityId: AbilityId;
  abilityUnlocked: boolean;
  cooldownSeconds: number;
  initialCooldownSeconds: number;
  level: number;
  maxLevel: number;
  rarity?: Rarity;
  isActive?: boolean;
}

interface HeroColumnProps {
  hero: HeroDockItem;
  onActivateAbility: (instanceId: string) => void;
}

const HeroColumn: React.FC<HeroColumnProps> = React.memo(({ hero, onActivateAbility }) => {
  const maxHp = hero.maxHp || 35;
  const safeHp = Math.max(0, Math.min(maxHp, hero.hp));
  const hpRatio = safeHp / maxHp;

  const tileState = !hero.isAlive || !hero.abilityUnlocked
    ? 'locked'
    : hero.cooldownSeconds > 0
    ? 'cooldown'
    : hero.isActive
    ? 'active'
    : 'ready';

  return (
    <div className="flex flex-col items-center justify-end gap-1.5 min-w-[70px] sm:min-w-[80px] shrink-0">
      {/* 1. HERO NAME (ONLY above HP bar) */}
      <div className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-white truncate max-w-[84px] text-center drop-shadow-sm">
        {hero.name}
      </div>

      {/* 2. HP BAR (Directly under name, separate from ability square, shows x / 35) */}
      <div className="w-16 sm:w-20 flex flex-col items-center gap-0.5">
        <div className="w-full h-2.5 bg-black/80 rounded-sm border border-white/20 p-[1px] overflow-hidden relative">
          <div
            className={`h-full w-full rounded-xs transition-transform duration-150 origin-left ${
              hero.isAlive
                ? safeHp > 17
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : safeHp > 8
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-rose-600 to-red-500'
                : 'bg-neutral-700'
            }`}
            style={{
              transform: `scaleX(${hero.isAlive ? hpRatio : 0})`,
              transformOrigin: 'left',
            }}
          />
        </div>
        <span className="text-[9px] font-mono font-bold text-neutral-300 leading-none">
          {hero.isAlive ? `${safeHp} / ${maxHp}` : `0 / ${maxHp}`}
        </span>
      </div>

      {/* 3. ABILITY SQUARE (64px Equipment Tile from AbilityTiles.tsx) */}
      <div className="mt-0.5">
        <AbilityTile
          ability={hero.abilityId}
          rarity={hero.rarity || (hero.level >= hero.maxLevel ? 'legendary' : 'epic')}
          state={tileState}
          cooldownMs={(hero.initialCooldownSeconds || 7) * 1000}
          secondsLeft={hero.cooldownSeconds}
          size={64}
          onActivate={() => onActivateAbility(hero.instanceId)}
        />
      </div>
    </div>
  );
});

HeroColumn.displayName = 'HeroColumn';

interface HeroBottomDockProps {
  heroes: HeroDockItem[];
  onActivateAbility: (instanceId: string) => void;
}

export const HeroBottomDock: React.FC<HeroBottomDockProps> = React.memo(
  ({ heroes, onActivateAbility }) => {
    return (
      <footer className="w-full bg-[#0b0c14]/95 border-t-2 border-purple-500/30 px-3 py-2 sm:py-3 z-30 shrink-0 shadow-[0_-6px_25px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <div className="max-w-xl mx-auto flex items-end justify-around gap-2 sm:gap-4">
          {heroes.map((hero) => (
            <HeroColumn
              key={hero.instanceId}
              hero={hero}
              onActivateAbility={onActivateAbility}
            />
          ))}
        </div>
      </footer>
    );
  }
);

HeroBottomDock.displayName = 'HeroBottomDock';
