import React, { useState } from 'react';
import { HeroId, Coord } from '../types/heroDuelTypes';
import { HEROES } from '../heroes/heroRegistry';
import { HeroPieceSvg } from '../art/heroPieceSvg';
import { Swords, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface PlacedHero {
  heroId: HeroId;
  pos: Coord;
  isCaptain: boolean;
}

interface PlacementProps {
  draftedHeroIds: HeroId[];
  captainId: HeroId;
  onConfirmPlacement: (placements: PlacedHero[]) => void;
  onBack: () => void;
}

export const Placement: React.FC<PlacementProps> = ({
  draftedHeroIds,
  captainId,
  onConfirmPlacement,
  onBack,
}) => {
  // Default positions: files B, C, E, F on row 1 (y=0)
  const defaultSlots: Coord[] = [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 4, y: 0 },
    { x: 5, y: 0 },
  ];

  const [placements, setPlacements] = useState<PlacedHero[]>(() =>
    draftedHeroIds.map((id, index) => ({
      heroId: id,
      pos: defaultSlots[index] || { x: index, y: 0 },
      isCaptain: id === captainId,
    }))
  );

  const [selectedPlacementIndex, setSelectedPlacementIndex] = useState<number | null>(null);

  // Allow placing in home rows 1 and 2 (y=0 and y=1)
  const handleSquareClick = (x: number, y: number) => {
    if (y > 1) return; // Only rows 1 & 2 allowed for Team 1 placement

    const occupantIndex = placements.findIndex((p) => p.pos.x === x && p.pos.y === y);

    if (selectedPlacementIndex !== null) {
      if (occupantIndex === selectedPlacementIndex) {
        setSelectedPlacementIndex(null);
        return;
      }

      if (occupantIndex !== -1) {
        // Swap positions of the two heroes
        const next = [...placements];
        const temp = next[selectedPlacementIndex].pos;
        next[selectedPlacementIndex].pos = next[occupantIndex].pos;
        next[occupantIndex].pos = temp;
        setPlacements(next);
        setSelectedPlacementIndex(null);
      } else {
        // Move selected hero to empty square
        const next = [...placements];
        next[selectedPlacementIndex].pos = { x, y };
        setPlacements(next);
        setSelectedPlacementIndex(null);
      }
    } else {
      if (occupantIndex !== -1) {
        setSelectedPlacementIndex(occupantIndex);
      }
    }
  };

  const handleReset = () => {
    setPlacements(
      draftedHeroIds.map((id, index) => ({
        heroId: id,
        pos: defaultSlots[index] || { x: index, y: 0 },
        isCaptain: id === captainId,
      }))
    );
    setSelectedPlacementIndex(null);
  };

  const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  return (
    <div className="hd-root min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans select-none p-3 sm:p-5">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-3 border-b-2 border-white/20">
        <button
          onClick={onBack}
          className="hd-btn-brutal px-3 py-1.5 bg-neutral-900 text-white border-2 border-white hover:bg-neutral-800 flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Draft</span>
        </button>

        <div className="text-center">
          <div className="text-[10px] font-mono font-black uppercase text-amber-400">
            Phase 2 of 2
          </div>
          <h1 className="text-base sm:text-lg font-black uppercase tracking-tight">
            Arrange Starting Formation
          </h1>
        </div>

        <button
          onClick={handleReset}
          className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase rounded border border-white/20 cursor-pointer flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </header>

      {/* Main Board Placement Grid */}
      <main className="max-w-4xl w-full mx-auto py-4 flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-xs text-neutral-400 font-mono text-center max-w-md">
          Tap any hero, then tap any square in Rows 1 or 2 (highlighted zone) to position or swap them.
        </div>

        {/* Mini 7x4 preview showing rows 1-4 */}
        <div className="w-full max-w-[420px] aspect-[7/4] grid grid-cols-7 grid-rows-4 border-3 border-black shadow-2xl bg-[#0e0e12] overflow-hidden rounded-lg">
          {[3, 2, 1, 0].map((y) =>
            [0, 1, 2, 3, 4, 5, 6].map((x) => {
              const isHomeZone = y <= 1;
              const isLight = (x + y) % 2 === 0;
              const occupant = placements.find((p) => p.pos.x === x && p.pos.y === y);
              const isSelected =
                selectedPlacementIndex !== null &&
                placements[selectedPlacementIndex].pos.x === x &&
                placements[selectedPlacementIndex].pos.y === y;

              return (
                <button
                  key={`${x}-${y}`}
                  type="button"
                  onClick={() => handleSquareClick(x, y)}
                  disabled={!isHomeZone}
                  className={`relative aspect-square flex items-center justify-center transition-all ${
                    isHomeZone
                      ? isLight
                        ? 'bg-[#F2EFE4] text-black'
                        : 'bg-[#BC1434] text-white'
                      : 'bg-[#18181f] text-neutral-600 border border-black/40'
                  } ${isSelected ? 'outline-3 outline-amber-400 z-10' : ''}`}
                >
                  {isHomeZone && !occupant && isSelected && (
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  )}

                  {occupant && (
                    <div className="w-[85%] h-[85%] relative flex items-center justify-center">
                      <HeroPieceSvg
                        heroId={occupant.heroId}
                        team={1}
                        isCaptain={occupant.isCaptain}
                      />
                    </div>
                  )}

                  <span className="absolute bottom-0.5 right-1 text-[8px] font-mono opacity-50 pointer-events-none">
                    {colLabels[x]}{y + 1}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Selected Hero Label */}
        <div className="text-xs font-mono text-center">
          {selectedPlacementIndex !== null ? (
            <span className="text-amber-400 font-black">
              Selected: {HEROES[placements[selectedPlacementIndex].heroId]?.name} — Tap destination square
            </span>
          ) : (
            <span className="text-neutral-500">Tap a hero to move or swap</span>
          )}
        </div>

        {/* Launch Button */}
        <button
          onClick={() => onConfirmPlacement(placements)}
          className="hd-btn-brutal w-full max-w-md py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-sm uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#000]"
        >
          <Swords className="w-5 h-5" />
          <span>Deploy to Battlefield • Begin Duel</span>
        </button>
      </main>
    </div>
  );
};
