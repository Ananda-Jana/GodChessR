import React from 'react';
import { SiegeState, SiegeHeroInstance } from '../../engine/siege/siegeTypes';
import { SIEGE_CONFIG } from '../../config/siegeConfig';
import { getHeroById } from '../../heroes/heroRegistry';
import { Shield, Flag, Zap, Crown } from 'lucide-react';

interface SiegeBoardProps {
  state: SiegeState;
  selectedHero: SiegeHeroInstance | null;
  onSelectHero: (hero: SiegeHeroInstance) => void;
  onOrderCellClick: (pos: { x: number; y: number }) => void;
}

export const SiegeBoard: React.FC<SiegeBoardProps> = ({
  state,
  selectedHero,
  onSelectHero,
  onOrderCellClick,
}) => {
  return (
    <div className="relative bg-[#121218] border-3 border-amber-400 p-3 rounded-2xl shadow-2xl overflow-x-auto flex items-center justify-center">
      <div
        className="grid gap-1 bg-black p-3 border-2 border-white/20 rounded-xl"
        style={{ gridTemplateColumns: `repeat(${SIEGE_CONFIG.COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: SIEGE_CONFIG.ROWS }).map((_, y) =>
          Array.from({ length: SIEGE_CONFIG.COLS }).map((_, x) => {
            const cellKey = `${x},${y}`;
            const isObstacle = SIEGE_CONFIG.OBSTACLES.some((o) => o.x === x && o.y === y);
            const shrine = state.shrines.find((s) => s.pos.x === x && s.pos.y === y);
            const tower = state.towers.find((t) => t.isAlive && t.pos.x === x && t.pos.y === y);
            const throne = state.thrones.find((th) => th.pos.x === x && th.pos.y === y);
            const hero = state.heroes.find((h) => h.isAlive && h.pos.x === x && h.pos.y === y);

            const isSelected = selectedHero?.instanceId === hero?.instanceId;

            return (
              <div
                key={cellKey}
                onClick={() => onOrderCellClick({ x, y })}
                className={`w-10 h-10 sm:w-12 sm:h-12 border flex flex-col items-center justify-center relative rounded transition-all cursor-pointer ${
                  isObstacle
                    ? 'bg-neutral-800 border-neutral-700 opacity-60'
                    : shrine
                    ? 'bg-emerald-950/60 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                    : throne
                    ? 'bg-amber-950/70 border-amber-500'
                    : tower
                    ? 'bg-blue-950/60 border-blue-400'
                    : 'bg-[#181822] border-white/10 hover:border-white/30'
                }`}
              >
                {/* Shrine Indicator */}
                {shrine && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] font-black uppercase text-emerald-400">
                      {shrine.owner ? `T${shrine.owner}` : 'Shrine'}
                    </span>
                  </div>
                )}

                {/* Throne Indicator */}
                {throne && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <Crown className={`w-4 h-4 ${throne.team === 1 ? 'text-blue-400' : 'text-red-400'}`} />
                    <span className="text-[8px] font-mono font-bold text-white">{throne.hp}HP</span>
                  </div>
                )}

                {/* Tower Indicator */}
                {tower && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <Shield className={`w-3.5 h-3.5 ${tower.team === 1 ? 'text-blue-400' : 'text-red-400'}`} />
                    <span className="text-[8px] font-mono font-bold text-white">{tower.hp}HP</span>
                  </div>
                )}

                {/* Hero Piece */}
                {hero && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectHero(hero);
                    }}
                    className={`w-full h-full flex flex-col items-center justify-center rounded p-0.5 relative z-10 transition-transform ${
                      isSelected ? 'ring-2 ring-amber-400 scale-105 bg-amber-400/20' : ''
                    }`}
                  >
                    <span className={`text-[10px] sm:text-xs font-black uppercase ${hero.team === 1 ? 'text-blue-300' : 'text-red-300'}`}>
                      {hero.name.substring(0, 3)}
                    </span>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: hero.hp }).map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-emerald-400 rounded-full" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
