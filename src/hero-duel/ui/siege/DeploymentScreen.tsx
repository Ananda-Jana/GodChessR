import React, { useState } from 'react';
import { HeroId } from '../../types/heroDuelTypes';
import { FormationType } from '../../engine/siege/siegeTypes';
import { getHeroById, ALL_HEROES } from '../../heroes/heroRegistry';
import { HeroPiece, heroIdToPieceType } from '../../art/heroAvatarHelper';
import { Swords, ArrowLeft, Shield, Sparkles, LayoutGrid, Users, BookOpen } from 'lucide-react';
import { haptics } from '../../utils/haptics';
import { SiegeRulebookModal } from './SiegeRulebookModal';

interface DeploymentScreenProps {
  heroes: HeroId[];
  onStartBattle: (
    placements: { heroId: HeroId; pos: { x: number; y: number } }[],
    formation: FormationType
  ) => void;
  onBack: () => void;
}

export const DeploymentScreen: React.FC<DeploymentScreenProps> = ({
  heroes,
  onStartBattle,
  onBack,
}) => {
  const defaultPositions = [
    { x: 1, y: 7 },
    { x: 3, y: 7 },
    { x: 5, y: 7 },
    { x: 7, y: 7 },
  ];

  const [placements, setPlacements] = useState<{ heroId: HeroId; pos: { x: number; y: number } }[]>(
    heroes.slice(0, 4).map((hId, idx) => ({
      heroId: hId,
      pos: defaultPositions[idx] || { x: idx * 2 + 1, y: 7 },
    }))
  );

  const [selectedHeroIdx, setSelectedHeroIdx] = useState<number | null>(0);
  const [selectedFormation, setSelectedFormation] = useState<FormationType>('spread');
  const [showRulebook, setShowRulebook] = useState<boolean>(false);

  const handleCellClick = (x: number, y: number) => {
    if (y < 6) return; // Player deployment rows 6 and 7
    if (placements.some((p, i) => i !== selectedHeroIdx && p.pos.x === x && p.pos.y === y)) return;

    if (selectedHeroIdx !== null) {
      haptics.move();
      const updated = [...placements];
      updated[selectedHeroIdx].pos = { x, y };
      setPlacements(updated);
    }
  };

  const handleSwapHero = (heroId: HeroId) => {
    if (selectedHeroIdx === null) return;
    haptics.select();
    const updated = [...placements];
    // If this hero is already deployed in another slot, swap them
    const existingIdx = updated.findIndex((p) => p.heroId === heroId);
    if (existingIdx !== -1 && existingIdx !== selectedHeroIdx) {
      const prevHeroId = updated[selectedHeroIdx].heroId;
      updated[existingIdx].heroId = prevHeroId;
    }
    updated[selectedHeroIdx].heroId = heroId;
    setPlacements(updated);
  };

  const applyPreset = (type: 'spread' | 'clustered_left' | 'clustered_right') => {
    haptics.select();
    let presetCoords: { x: number; y: number }[] = [];
    if (type === 'spread') {
      presetCoords = [{ x: 1, y: 7 }, { x: 3, y: 7 }, { x: 5, y: 7 }, { x: 7, y: 7 }];
      setSelectedFormation('spread');
    } else if (type === 'clustered_left') {
      presetCoords = [{ x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }];
      setSelectedFormation('clustered_left');
    } else {
      presetCoords = [{ x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }];
      setSelectedFormation('clustered_right');
    }

    setPlacements((prev) =>
      prev.map((p, idx) => ({
        ...p,
        pos: presetCoords[idx] || { x: idx * 2 + 1, y: 7 },
      }))
    );
  };

  return (
    <div className="hd-root min-h-screen bg-[#08080a] text-white flex flex-col font-sans select-none p-3 sm:p-5">
      {/* Header */}
      <header className="flex items-center justify-between pb-3 border-b border-white/20 mb-3 max-w-4xl mx-auto w-full">
        <button
          onClick={onBack}
          className="hd-btn-brutal px-3 py-1.5 bg-neutral-900 text-white border-2 border-white flex items-center gap-2 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          <h1 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-400">
            Shrine Siege 8×8 • Squad & Deployment
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              haptics.select();
              setShowRulebook(true);
            }}
            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-black uppercase rounded border border-amber-400/50 flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rules</span>
          </button>
          <button
            onClick={() => applyPreset('spread')}
            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold border border-white/30 rounded cursor-pointer"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Rulebook Modal */}
      <SiegeRulebookModal
        isOpen={showRulebook}
        onClose={() => {
          haptics.select();
          setShowRulebook(false);
        }}
      />

      {/* Main Content */}
      <div className="max-w-4xl w-full mx-auto flex flex-col md:flex-row gap-5 items-start justify-center flex-1">
        {/* 8x8 Board Preview Grid */}
        <div className="bg-[#0f172a] border-4 border-slate-700/70 p-3 rounded-2xl shadow-2xl flex flex-col items-center w-full md:w-auto">
          <div className="text-xs font-mono font-bold text-amber-400 mb-2 uppercase flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4" />
            <span>Tap Bottom Rows (6–7) to Deploy</span>
          </div>

          <div
            className="grid gap-0.5 bg-[#0b1120] p-1.5 border border-slate-700/60 rounded-xl"
            style={{
              gridTemplateColumns: 'repeat(8, 42px)',
              gridTemplateRows: 'repeat(8, 42px)',
            }}
          >
            {Array.from({ length: 8 }).map((_, y) =>
              Array.from({ length: 8 }).map((_, x) => {
                const isPlayerDeployRow = y >= 6;
                const isOpponentRow = y <= 1;
                const isShrine = (y === 3 || y === 4) && (x === 1 || x === 2 || x === 5 || x === 6);
                const placedHero = placements.find((p) => p.pos.x === x && p.pos.y === y);
                const isSelectedPlacement =
                  selectedHeroIdx !== null &&
                  placements[selectedHeroIdx]?.pos.x === x &&
                  placements[selectedHeroIdx]?.pos.y === y;

                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    className={`relative flex items-center justify-center transition-all ${
                      isSelectedPlacement
                        ? 'bg-amber-500/40 ring-2 ring-amber-400 z-10'
                        : placedHero
                        ? 'bg-blue-600/30'
                        : isPlayerDeployRow
                        ? 'bg-slate-800/80 hover:bg-slate-700/90 cursor-pointer border border-dashed border-amber-400/40'
                        : isOpponentRow
                        ? 'bg-red-950/30 border border-red-500/20'
                        : isShrine
                        ? 'bg-sky-900/30 border border-sky-400/30'
                        : (x + y) % 2 === 1
                        ? 'bg-[#1e293b]'
                        : 'bg-[#0f172a]'
                    }`}
                  >
                    {placedHero && (
                      <div className="w-8 h-8 flex items-center justify-center drop-shadow-md">
                        <HeroPiece type={heroIdToPieceType(placedHero.heroId)} color="white" className="w-full h-full" />
                      </div>
                    )}
                    {isShrine && !placedHero && (
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-400/60 animate-pulse" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Section: Formations, Squad Slots, and 9-Hero Bench Picker */}
        <div className="flex-1 bg-[#14141c] border-2 border-white/20 p-4 rounded-xl shadow-xl flex flex-col gap-4 w-full">
          <div>
            <h3 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Starting Formations</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => applyPreset('spread')}
                className={`py-2 border text-[10px] font-black uppercase rounded cursor-pointer ${
                  selectedFormation === 'spread' ? 'bg-amber-400 text-black border-white' : 'bg-neutral-900 text-neutral-300 border-white/10'
                }`}
              >
                Spread
              </button>
              <button
                onClick={() => applyPreset('clustered_left')}
                className={`py-2 border text-[10px] font-black uppercase rounded cursor-pointer ${
                  selectedFormation === 'clustered_left' ? 'bg-amber-400 text-black border-white' : 'bg-neutral-900 text-neutral-300 border-white/10'
                }`}
              >
                Left Flank
              </button>
              <button
                onClick={() => applyPreset('clustered_right')}
                className={`py-2 border text-[10px] font-black uppercase rounded cursor-pointer ${
                  selectedFormation === 'clustered_right' ? 'bg-amber-400 text-black border-white' : 'bg-neutral-900 text-neutral-300 border-white/10'
                }`}
              >
                Right Flank
              </button>
            </div>
          </div>

          {/* Active 4-Hero Squad Slots */}
          <div className="flex flex-col gap-1.5">
            <h4 className="text-xs font-black uppercase text-neutral-400 flex items-center justify-between">
              <span>Active Squad (4 Slots)</span>
              <span className="text-[10px] font-mono text-amber-400">Tap slot, then pick hero below</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {placements.map((p, idx) => {
                const def = getHeroById(p.heroId);
                const isSelected = selectedHeroIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      haptics.select();
                      setSelectedHeroIdx(idx);
                    }}
                    className={`p-2 rounded-lg border-2 flex items-center gap-2 cursor-pointer transition-all ${
                      isSelected ? 'bg-amber-400/20 border-amber-400 shadow-md' : 'bg-neutral-900 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="w-7 h-7 flex items-center justify-center shrink-0 drop-shadow-md">
                      <HeroPiece type={heroIdToPieceType(p.heroId)} color="white" className="w-full h-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-black uppercase text-white truncate">{def.name}</div>
                      <div className="text-[9px] text-amber-300 font-mono">
                        Slot {idx + 1} • ({p.pos.x + 1},{8 - p.pos.y})
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 9-Hero Roster Picker */}
          <div className="flex flex-col gap-1.5 border-t border-white/10 pt-2">
            <h4 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Choose from All 9 Champions</span>
            </h4>
            <div className="grid grid-cols-3 gap-1.5">
              {ALL_HEROES.map((h) => {
                const isDeployed = placements.some((p) => p.heroId === h.id);
                const isCurrent = selectedHeroIdx !== null && placements[selectedHeroIdx]?.heroId === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleSwapHero(h.id)}
                    className={`p-1.5 rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all text-center ${
                      isCurrent
                        ? 'bg-amber-400/30 border-amber-400 ring-1 ring-amber-400'
                        : isDeployed
                        ? 'bg-blue-950/60 border-blue-500/50'
                        : 'bg-black/40 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center drop-shadow-md">
                      <HeroPiece type={heroIdToPieceType(h.id)} color="white" className="w-full h-full" />
                    </div>
                    <span className="text-[9px] font-bold text-white truncate w-full">{h.name}</span>
                    <span className="text-[8px] font-mono text-neutral-400 capitalize">{h.role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => {
              haptics.attack();
              onStartBattle(placements, selectedFormation);
            }}
            className="hd-btn-brutal w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-1"
          >
            <Swords className="w-4 h-4" />
            <span>Start Shrine Siege</span>
          </button>
        </div>
      </div>
    </div>
  );
};
