import React, { useState } from 'react';
import { HeroId } from '../../types/heroDuelTypes';
import { getHeroById } from '../../heroes/heroRegistry';
import { SIEGE_CONFIG } from '../../config/siegeConfig';
import { Swords, ArrowLeft, Shield, Sparkles } from 'lucide-react';

interface DeploymentScreenProps {
  heroes: HeroId[];
  onStartBattle: (placements: { heroId: HeroId; pos: { x: number; y: number } }[]) => void;
  onBack: () => void;
}

export const DeploymentScreen: React.FC<DeploymentScreenProps> = ({
  heroes,
  onStartBattle,
  onBack,
}) => {
  // Default positions on rows 1-2 (y=0 or y=1)
  const defaultPositions = [
    { x: 1, y: 1 },
    { x: 3, y: 1 },
    { x: 5, y: 1 },
    { x: 7, y: 1 },
  ];

  const [placements, setPlacements] = useState<{ heroId: HeroId; pos: { x: number; y: number } }[]>(
    heroes.map((hId, idx) => ({
      heroId: hId,
      pos: defaultPositions[idx] || { x: idx * 2, y: 1 },
    }))
  );

  const [selectedHeroIdx, setSelectedHeroIdx] = useState<number | null>(0);

  const handleCellClick = (x: number, y: number) => {
    // Only allow deployment in rows 0 and 1 (player home half)
    if (y > 1) return;
    // Check if cell occupied
    if (placements.some((p, i) => i !== selectedHeroIdx && p.pos.x === x && p.pos.y === y)) return;

    if (selectedHeroIdx !== null) {
      const updated = [...placements];
      updated[selectedHeroIdx].pos = { x, y };
      setPlacements(updated);
    }
  };

  const handleAutoDeploy = () => {
    setPlacements(
      heroes.map((hId, idx) => ({
        heroId: hId,
        pos: defaultPositions[idx] || { x: idx * 2, y: 1 },
      }))
    );
  };

  return (
    <div className="hd-root min-h-screen bg-[#08080a] text-white flex flex-col font-sans select-none p-4 sm:p-6">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b border-white/20 mb-6">
        <button
          onClick={onBack}
          className="hd-btn-brutal px-3 py-1.5 bg-neutral-900 text-white border-2 border-white flex items-center gap-2 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          <h1 className="text-base font-black uppercase tracking-wider text-amber-400">
            Shrine Siege • Pre-Battle Deployment
          </h1>
        </div>
        <button
          onClick={handleAutoDeploy}
          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold border border-white/30 rounded cursor-pointer"
        >
          Auto Deploy
        </button>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl w-full mx-auto flex flex-col md:flex-row gap-6 items-center justify-center flex-1">
        {/* Interactive Deployment Grid (Rows 0-3 for preview) */}
        <div className="bg-[#121218] border-3 border-amber-400 p-4 rounded-xl shadow-2xl flex flex-col items-center">
          <div className="text-xs font-mono font-bold text-neutral-400 mb-3 uppercase">
            Select Champion & Tap Deployment Cell (Rows 1–2)
          </div>

          <div
            className="grid gap-1.5 bg-black p-3 border-2 border-white/25 rounded-lg"
            style={{ gridTemplateColumns: `repeat(${SIEGE_CONFIG.COLS}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: 4 }).map((_, y) =>
              Array.from({ length: SIEGE_CONFIG.COLS }).map((_, x) => {
                const placementIndex = placements.findIndex((p) => p.pos.x === x && p.pos.y === y);
                const isPlaced = placementIndex !== -1;
                const heroId = isPlaced ? placements[placementIndex].heroId : null;
                const heroDef = heroId ? getHeroById(heroId) : null;
                const isHomeRow = y <= 1;

                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 border flex items-center justify-center font-bold text-xs rounded transition-all cursor-pointer ${
                      isPlaced
                        ? 'bg-amber-500 text-black border-white shadow-md scale-105'
                        : isHomeRow
                        ? 'bg-blue-950/40 border-blue-400/40 hover:bg-blue-900/60'
                        : 'bg-neutral-900/50 border-neutral-800 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {heroDef ? heroDef.name.substring(0, 3).toUpperCase() : `${x},${y}`}
                  </div>
                );
              })
            )}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-2">
            Showing deployment zone (Rows 1–2)
          </div>
        </div>

        {/* Hero Selector Panel */}
        <div className="flex-1 bg-[#14141c] border-2 border-white/20 p-5 rounded-xl shadow-xl flex flex-col gap-4">
          <h3 className="text-sm font-black uppercase text-amber-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Your 4 Champions
          </h3>

          <div className="flex flex-col gap-2.5">
            {placements.map((p, idx) => {
              const def = getHeroById(p.heroId);
              const isSelected = selectedHeroIdx === idx;
              return (
                <div
                  key={p.heroId}
                  onClick={() => setSelectedHeroIdx(idx)}
                  className={`p-3 rounded-lg border-2 flex items-center justify-between cursor-pointer transition-all ${
                    isSelected ? 'bg-amber-400/20 border-amber-400' : 'bg-neutral-900 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div>
                    <div className="text-xs font-black uppercase text-white">{def.name}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      Pos: ({p.pos.x + 1}, {p.pos.y + 1})
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-amber-400 rounded">
                    Slot {idx + 1}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onStartBattle(placements)}
            className="hd-btn-brutal w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-4"
          >
            <Swords className="w-4 h-4" />
            <span>Start Shrine Siege</span>
          </button>
        </div>
      </div>
    </div>
  );
};
