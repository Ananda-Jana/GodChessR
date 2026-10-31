import React, { useState } from 'react';
import { HeroId } from '../../types/heroDuelTypes';
import { FormationType } from '../../engine/siege/siegeTypes';
import { getHeroById, ALL_HEROES } from '../../heroes/heroRegistry';
import { HeroPiece, heroIdToPieceType } from '../../art/heroAvatarHelper';
import {
  Swords,
  ArrowLeft,
  Shield,
  Sparkles,
  LayoutGrid,
  Users,
  BookOpen,
  Info,
  Zap,
  GripVertical,
  X,
  CheckCircle2,
  Shuffle,
  RotateCcw,
  Check,
  MousePointerClick,
  Palette,
} from 'lucide-react';
import { haptics } from '../../utils/haptics';
import { SiegeRulebookModal } from './SiegeRulebookModal';
import { PieceThemeModal } from '../PieceThemeModal';
import {
  getHeroEquipmentAbility,
  AbilitySummary,
} from '../../config/siegeRulesCodex';
import { AbilityTile } from '../AbilityTiles';

interface DeploymentScreenProps {
  heroes: HeroId[];
  onStartBattle: (
    placements: { heroId: HeroId; pos: { x: number; y: number } }[],
    formation: FormationType
  ) => void;
  onBack: () => void;
}

const DEFAULT_POSITIONS = [
  { x: 1, y: 7 },
  { x: 3, y: 7 },
  { x: 5, y: 7 },
  { x: 7, y: 7 },
];

export const DeploymentScreen: React.FC<DeploymentScreenProps> = ({
  heroes,
  onStartBattle,
  onBack,
}) => {
  // Placements state: 0 to 4 heroes placed on Row 7
  const [placements, setPlacements] = useState<{ heroId: HeroId; pos: { x: number; y: number } }[]>(
    () =>
      heroes.slice(0, 4).map((hId, idx) => ({
        heroId: hId,
        pos: DEFAULT_POSITIONS[idx] || { x: idx * 2 + 1, y: 7 },
      }))
  );

  // Selected hero for tap-to-place flow (mobile & desktop friendly)
  const [selectedHeroForPlacement, setSelectedHeroForPlacement] = useState<HeroId | null>(
    heroes[0] || 'mugen-king'
  );

  // Active slot index for tap-to-place (0..3)
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number>(0);

  // Inspected hero for details preview card
  const [inspectedHeroId, setInspectedHeroId] = useState<HeroId>(
    heroes[0] || 'mugen-king'
  );

  const [selectedFormation, setSelectedFormation] = useState<FormationType>('spread');
  const [showRulebook, setShowRulebook] = useState<boolean>(false);
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [inspectAbilityModal, setInspectAbilityModal] = useState<AbilitySummary | null>(null);

  // Drag-and-Drop state tracking
  const [draggedHeroId, setDraggedHeroId] = useState<HeroId | null>(null);

  // Helper: Get available unplaced heroes from ALL_HEROES (9 total)
  const getUnplacedHeroes = (currentPlacements = placements): HeroId[] => {
    const placedSet = new Set(currentPlacements.map((p) => p.heroId));
    return ALL_HEROES.map((h) => h.id).filter((id) => !placedSet.has(id));
  };

  // Assign a hero to a specific squad slot index (0..3)
  const assignHeroToSlot = (heroId: HeroId, slotIdx: number) => {
    haptics.select();
    setPlacements((prev) => {
      const updated = [...prev];
      const existingIdx = updated.findIndex((p) => p.heroId === heroId);
      const targetPos = updated[slotIdx]?.pos || DEFAULT_POSITIONS[slotIdx] || { x: slotIdx * 2 + 1, y: 7 };

      if (existingIdx !== -1) {
        if (existingIdx !== slotIdx) {
          // Swap positions
          const swapPos = updated[existingIdx].pos;
          const prevHeroInSlot = updated[slotIdx]?.heroId;
          if (prevHeroInSlot) {
            updated[existingIdx] = { heroId: prevHeroInSlot, pos: swapPos };
          } else {
            updated.splice(existingIdx, 1);
          }
        }
      }

      const existingSlotItem = updated.find((_, i) => i === slotIdx);
      if (existingSlotItem) {
        updated[slotIdx] = { heroId, pos: targetPos };
      } else {
        updated.push({ heroId, pos: targetPos });
      }

      return updated;
    });
    setInspectedHeroId(heroId);
    setSelectedHeroForPlacement(heroId);
    setSelectedSlotIdx(slotIdx);
  };

  // Move or place a hero onto a row 7 cell (x: 0..7)
  const placeHeroOnCell = (heroId: HeroId, x: number) => {
    haptics.move();
    setPlacements((prev) => {
      const updated = [...prev];
      const existingCellOccupantIdx = updated.findIndex((p) => p.pos.x === x && p.pos.y === 7);
      const existingHeroIdx = updated.findIndex((p) => p.heroId === heroId);

      if (existingCellOccupantIdx !== -1 && existingCellOccupantIdx !== existingHeroIdx) {
        // Swap or replace
        if (existingHeroIdx !== -1) {
          const oldX = updated[existingHeroIdx].pos.x;
          updated[existingCellOccupantIdx] = { ...updated[existingCellOccupantIdx], pos: { x: oldX, y: 7 } };
        } else {
          updated.splice(existingCellOccupantIdx, 1);
        }
      }

      if (existingHeroIdx !== -1) {
        updated[existingHeroIdx] = { heroId, pos: { x, y: 7 } };
      } else {
        if (updated.length < 4) {
          updated.push({ heroId, pos: { x, y: 7 } });
        } else {
          updated[selectedSlotIdx] = { heroId, pos: { x, y: 7 } };
        }
      }
      return updated;
    });

    setInspectedHeroId(heroId);

    // Auto advance selection to next unplaced hero for rapid placement on mobile
    const remaining = getUnplacedHeroes().filter((id) => id !== heroId);
    if (remaining.length > 0) {
      setSelectedHeroForPlacement(remaining[0]);
    } else {
      setSelectedHeroForPlacement(heroId);
    }
  };

  // Auto Select: Picks default 4 heroes and places on Spread formation
  const handleAutoSelect = () => {
    haptics.select();
    const picked = ALL_HEROES.slice(0, 4).map((h, idx) => ({
      heroId: h.id,
      pos: DEFAULT_POSITIONS[idx],
    }));
    setPlacements(picked);
    setSelectedFormation('spread');
    setInspectedHeroId(picked[0].heroId);
    setSelectedHeroForPlacement(picked[0].heroId);
  };

  // Shuffle: Randomly picks 4 distinct heroes and randomizes row 7 positions
  const handleShuffle = () => {
    haptics.select();
    const shuffledHeroes = [...ALL_HEROES].sort(() => Math.random() - 0.5).slice(0, 4);
    const availableCols = [0, 1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - 0.5).slice(0, 4);
    availableCols.sort((a, b) => a - b); // Keep left-to-right order

    const nextPlacements = shuffledHeroes.map((h, idx) => ({
      heroId: h.id,
      pos: { x: availableCols[idx], y: 7 },
    }));

    setPlacements(nextPlacements);
    setSelectedFormation('spread');
    setInspectedHeroId(nextPlacements[0].heroId);
    setSelectedHeroForPlacement(nextPlacements[0].heroId);
  };

  // Clear All: Empties placements
  const handleClearAll = () => {
    haptics.select();
    setPlacements([]);
    setSelectedHeroForPlacement(ALL_HEROES[0].id);
  };

  // Preset formations
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

    setPlacements((prev) => {
      let activeHeroes = prev.map((p) => p.heroId);
      if (activeHeroes.length < 4) {
        const remaining = getUnplacedHeroes(prev);
        activeHeroes = [...activeHeroes, ...remaining].slice(0, 4);
      }
      return activeHeroes.map((hId, idx) => ({
        heroId: hId,
        pos: presetCoords[idx] || { x: idx * 2 + 1, y: 7 },
      }));
    });
  };

  // Start Battle action: preserves exact user placements!
  const handleStartBattleClick = () => {
    haptics.attack();
    let finalPlacements = [...placements];

    // Auto fill remaining empty slots without altering existing placed positions
    if (finalPlacements.length < 4) {
      const remainingPool = getUnplacedHeroes(finalPlacements).sort(() => Math.random() - 0.5);
      const usedCols = new Set(finalPlacements.map((p) => p.pos.x));
      const freeCols = [0, 1, 2, 3, 4, 5, 6, 7].filter((c) => !usedCols.has(c));

      while (finalPlacements.length < 4 && remainingPool.length > 0) {
        const nextHero = remainingPool.pop()!;
        const nextCol = freeCols.length > 0 ? freeCols.shift()! : finalPlacements.length * 2;
        finalPlacements.push({ heroId: nextHero, pos: { x: nextCol, y: 7 } });
      }
    }

    onStartBattle(finalPlacements, selectedFormation);
  };

  // Drag handlers
  const handleDragStartHero = (heroId: HeroId) => {
    setDraggedHeroId(heroId);
    setSelectedHeroForPlacement(heroId);
    setInspectedHeroId(heroId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnBoardCell = (e: React.DragEvent, x: number) => {
    e.preventDefault();
    if (draggedHeroId) {
      placeHeroOnCell(draggedHeroId, x);
    }
    setDraggedHeroId(null);
  };

  const handleDropOnSlot = (e: React.DragEvent, targetSlotIdx: number) => {
    e.preventDefault();
    if (draggedHeroId) {
      assignHeroToSlot(draggedHeroId, targetSlotIdx);
    }
    setDraggedHeroId(null);
  };

  const inspectedHeroDef = getHeroById(inspectedHeroId);
  const inspectedAbility = getHeroEquipmentAbility(inspectedHeroId);
  const activeSelectedDef = selectedHeroForPlacement ? getHeroById(selectedHeroForPlacement) : null;

  return (
    <div className="hd-root min-h-screen bg-[#08080a] text-white flex flex-col font-sans select-none p-2 sm:p-5">
      {/* Top Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/20 mb-3 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="hd-btn-brutal px-3 py-1.5 bg-neutral-900 text-white border-2 border-white flex items-center gap-2 text-xs cursor-pointer hover:bg-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h1 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-400 leading-tight">
                Shrine Siege Setup
              </h1>
              <p className="text-[10px] text-neutral-400 font-mono hidden sm:block">
                Tap to select hero & tap Row 7 cell to place • Drag and drop supported
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={handleAutoSelect}
            className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-black uppercase rounded border border-amber-400/40 flex items-center gap-1 cursor-pointer"
            title="Auto select 4 champions on default positions"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto Select</span>
          </button>

          <button
            type="button"
            onClick={handleShuffle}
            className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-purple-300 text-xs font-black uppercase rounded border border-purple-400/40 flex items-center gap-1 cursor-pointer"
            title="Randomize 4 champions & positions"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold rounded border border-white/20 flex items-center gap-1 cursor-pointer"
            title="Clear all squad slots"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={() => {
              haptics.select();
              setShowThemeModal(true);
            }}
            className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-black uppercase rounded border border-amber-400/40 flex items-center gap-1 cursor-pointer"
            title="Customise Piece Theme (Vector vs Faceted Busts)"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Theme</span>
          </button>

          <button
            type="button"
            onClick={() => {
              haptics.select();
              setShowRulebook(true);
            }}
            className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-sky-300 text-xs font-black uppercase rounded border border-sky-400/40 flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rules</span>
          </button>

          {/* Prominent Start Battle CTA */}
          <button
            type="button"
            onClick={handleStartBattleClick}
            className="hd-btn-brutal px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-lg rounded border-2 border-black"
          >
            <Swords className="w-4 h-4" />
            <span>Start Battle</span>
          </button>
        </div>
      </header>

      {/* Piece Theme Selector & Preview Modal */}
      <PieceThemeModal
        isOpen={showThemeModal}
        onClose={() => {
          haptics.select();
          setShowThemeModal(false);
        }}
      />

      {/* Rulebook Modal */}
      <SiegeRulebookModal
        isOpen={showRulebook}
        onClose={() => {
          haptics.select();
          setShowRulebook(false);
        }}
      />

      {/* Equipment Inspection Details Modal */}
      {inspectAbilityModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setInspectAbilityModal(null)}
        >
          <div
            className="bg-[#12141d] border-3 border-purple-500 max-w-md w-full p-5 rounded-2xl shadow-2xl space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-purple-500/40 pb-2">
              <div className="flex items-center gap-3">
                <AbilityTile
                  ability={inspectAbilityModal.id}
                  rarity={inspectAbilityModal.rarity}
                  state="ready"
                  size={58}
                />
                <div>
                  <span className="text-[10px] font-mono font-black text-amber-400 uppercase">
                    {inspectAbilityModal.heroName}'S EQUIPMENT
                  </span>
                  <h3 className="text-base font-black uppercase text-purple-300">
                    {inspectAbilityModal.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectAbilityModal(null)}
                className="p-1 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-200 leading-relaxed font-mono bg-black/50 p-3 rounded-xl border border-white/10">
              {inspectAbilityModal.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-purple-950/50 p-2 rounded-lg border border-purple-500/30">
                <div className="text-[10px] text-purple-300 font-bold uppercase">Cooldown</div>
                <div className="text-white font-bold">{inspectAbilityModal.cooldownSec}s Base</div>
              </div>
              <div className="bg-amber-950/50 p-2 rounded-lg border border-amber-500/30">
                <div className="text-[10px] text-amber-300 font-bold uppercase">Unlock Condition</div>
                <div className="text-white font-bold">Auto on Shrine Reach</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInspectAbilityModal(null)}
              className="hd-btn-brutal w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase rounded cursor-pointer"
            >
              Close Equipment Preview
            </button>
          </div>
        </div>
      )}

      {/* Tap-to-Place Instruction Banner */}
      <div className="max-w-5xl w-full mx-auto mb-2 p-2 bg-gradient-to-r from-amber-950/80 via-neutral-900 to-amber-950/80 border border-amber-400/60 rounded-xl flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
          {activeSelectedDef ? (
            <span>
              <strong className="text-amber-300 uppercase">{activeSelectedDef.name}</strong> Selected • Tap any Row 7 square below to place!
            </span>
          ) : (
            <span className="text-neutral-300">Tap a champion in drawer then tap any Row 7 cell to deploy</span>
          )}
        </div>
        <span className="text-[10px] text-amber-400 font-bold uppercase hidden sm:inline">
          {placements.length}/4 Squad Ready
        </span>
      </div>

      {/* Main Setup Layout Container */}
      <div className="max-w-5xl w-full mx-auto flex flex-col lg:flex-row gap-4 items-center lg:items-start justify-center flex-1">
        {/* LEFT COLUMN: 8x8 Board Preview Grid (Responsive scaling for Mobile View) */}
        <div className="bg-[#0f172a] border-4 border-slate-700/70 p-2.5 sm:p-3.5 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-[340px] sm:max-w-[380px] shrink-0">
          <div className="text-xs font-mono font-bold text-amber-400 mb-2 uppercase flex items-center justify-between w-full">
            <span className="flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4" />
              <span>Back Rank Placement (Row 7)</span>
            </span>
            <span className="text-[10px] text-slate-400">Cols 1–8</span>
          </div>

          {/* 8x8 Board Grid - Responsive Aspect Ratio Box */}
          <div className="w-full aspect-square grid grid-cols-8 grid-rows-8 gap-0.5 bg-[#101726] p-1 border border-slate-700/60 rounded-xl select-none">
            {Array.from({ length: 8 }).map((_, y) =>
              Array.from({ length: 8 }).map((_, x) => {
                const isPlayerDeployRow = y === 7;
                const isOpponentRow = y <= 1;
                const isShrine = (y === 3 || y === 4) && (x === 1 || x === 2 || x === 5 || x === 6);
                const isLight = (x + y) % 2 === 1;

                const placedHero = placements.find((p) => p.pos.x === x && p.pos.y === y);

                // Square Background styling matching HeroBoard
                let squareBg = isLight ? 'bg-[#2b3c5a]' : 'bg-[#101726]';

                if (isPlayerDeployRow) {
                  squareBg = placedHero
                    ? 'bg-amber-400/30 ring-2 ring-amber-400 border border-amber-300 shadow-md'
                    : 'bg-amber-950/60 hover:bg-amber-900/80 border-2 border-dashed border-amber-400/80 cursor-pointer animate-pulse';
                } else if (isOpponentRow) {
                  squareBg = 'bg-red-950/30 border border-red-500/20';
                } else if (isShrine) {
                  squareBg = 'bg-purple-900/40 border border-purple-500/40';
                }

                return (
                  <div
                    key={`${x}-${y}`}
                    onDragOver={isPlayerDeployRow ? handleDragOver : undefined}
                    onDrop={isPlayerDeployRow ? (e) => handleDropOnBoardCell(e, x) : undefined}
                    onClick={() => {
                      if (isPlayerDeployRow) {
                        if (selectedHeroForPlacement) {
                          placeHeroOnCell(selectedHeroForPlacement, x);
                        } else if (placedHero) {
                          setSelectedHeroForPlacement(placedHero.heroId);
                          setInspectedHeroId(placedHero.heroId);
                        } else {
                          const nextUnplaced = getUnplacedHeroes()[0];
                          if (nextUnplaced) {
                            placeHeroOnCell(nextUnplaced, x);
                          }
                        }
                      }
                    }}
                    className={`relative aspect-square flex items-center justify-center transition-colors ${squareBg}`}
                    title={isPlayerDeployRow ? `Row 7 Placement (Col ${x + 1})` : `Cell (${x + 1}, ${8 - y})`}
                  >
                    {/* Placed Hero Piece */}
                    {placedHero && (
                      <div
                        draggable
                        onDragStart={() => handleDragStartHero(placedHero.heroId)}
                        className="w-full h-full p-1 flex items-center justify-center drop-shadow-md cursor-grab active:cursor-grabbing z-20"
                      >
                        <HeroPiece type={heroIdToPieceType(placedHero.heroId)} color="white" className="w-full h-full" />
                      </div>
                    )}

                    {/* Shrine Pulse Indicator */}
                    {isShrine && !placedHero && (
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-400/70 animate-pulse pointer-events-none" />
                    )}

                    {/* Row 7 Column Number Indicator */}
                    {isPlayerDeployRow && !placedHero && (
                      <span className="text-[10px] font-mono font-black text-amber-300 pointer-events-none">
                        {x + 1}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Preset Quick Formations Selector */}
          <div className="w-full mt-2.5 border-t border-slate-700/60 pt-2">
            <div className="text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Quick Formations:
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('spread')}
                className={`py-1.5 border text-[10px] font-black uppercase rounded cursor-pointer transition-colors ${
                  selectedFormation === 'spread'
                    ? 'bg-amber-400 text-black border-white'
                    : 'bg-neutral-900 text-neutral-300 border-white/10 hover:border-white/30'
                }`}
              >
                Spread
              </button>
              <button
                type="button"
                onClick={() => applyPreset('clustered_left')}
                className={`py-1.5 border text-[10px] font-black uppercase rounded cursor-pointer transition-colors ${
                  selectedFormation === 'clustered_left'
                    ? 'bg-amber-400 text-black border-white'
                    : 'bg-neutral-900 text-neutral-300 border-white/10 hover:border-white/30'
                }`}
              >
                Left Flank
              </button>
              <button
                type="button"
                onClick={() => applyPreset('clustered_right')}
                className={`py-1.5 border text-[10px] font-black uppercase rounded cursor-pointer transition-colors ${
                  selectedFormation === 'clustered_right'
                    ? 'bg-amber-400 text-black border-white'
                    : 'bg-neutral-900 text-neutral-300 border-white/10 hover:border-white/30'
                }`}
              >
                Right Flank
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Active 4-Hero Squad Slots, All 9 Champions Drawer & Inline Preview */}
        <div className="flex-1 flex flex-col gap-3 w-full min-w-0">
          {/* ALL-HERO DRAWER (9 Champions) - Tap to select for mobile ease */}
          <div className="bg-[#10131e] border-2 border-white/15 p-3 rounded-xl shadow-xl flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <h3 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>Select Champion to Deploy</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Tap hero then tap Row 7 cell
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
              {ALL_HEROES.map((h) => {
                const isPlaced = placements.some((p) => p.heroId === h.id);
                const isSelectedForPlacement = selectedHeroForPlacement === h.id;
                const eq = getHeroEquipmentAbility(h.id);

                return (
                  <div
                    key={h.id}
                    role="button"
                    tabIndex={0}
                    draggable
                    onDragStart={() => handleDragStartHero(h.id)}
                    onClick={() => {
                      haptics.select();
                      setSelectedHeroForPlacement(h.id);
                      setInspectedHeroId(h.id);
                      if (isPlaced) {
                        const placedIndex = placements.findIndex((p) => p.heroId === h.id);
                        if (placedIndex !== -1) setSelectedSlotIdx(placedIndex);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        haptics.select();
                        setSelectedHeroForPlacement(h.id);
                        setInspectedHeroId(h.id);
                        if (isPlaced) {
                          const placedIndex = placements.findIndex((p) => p.heroId === h.id);
                          if (placedIndex !== -1) setSelectedSlotIdx(placedIndex);
                        }
                      }
                    }}
                    className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all text-center relative ${
                      isSelectedForPlacement
                        ? 'bg-amber-400/40 border-amber-400 ring-2 ring-amber-400 shadow-lg scale-105'
                        : isPlaced
                        ? 'bg-blue-950/70 border-blue-500/50'
                        : 'bg-black/50 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="w-7 h-7 flex items-center justify-center drop-shadow-md">
                      <HeroPiece type={heroIdToPieceType(h.id)} color="white" className="w-full h-full" />
                    </div>
                    <span className="text-[9px] font-bold text-white truncate w-full">{h.name}</span>

                    {/* Equipment Icon Badge */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectAbilityModal(eq);
                      }}
                      className="mt-0.5"
                      title={`${eq.name} (${eq.cooldownSec}s CD)`}
                    >
                      <AbilityTile ability={eq.id} rarity={eq.rarity} state="ready" size={20} />
                    </div>

                    {isPlaced && (
                      <span className="text-[8px] font-mono font-bold text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" /> Placed
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active 4-Hero Squad Slots */}
          <div className="bg-[#14141c] border-2 border-white/20 p-3 rounded-xl shadow-xl flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <h3 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Active Squad & Equipment ({placements.length}/4 Slots)</span>
              </h3>
              <span className="text-[10px] font-mono text-neutral-400">
                Tap slot to target
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, idx) => {
                const placement = placements[idx];
                const def = placement ? getHeroById(placement.heroId) : null;
                const equipment = placement ? getHeroEquipmentAbility(placement.heroId) : null;
                const isSelected = selectedSlotIdx === idx;

                return (
                  <div
                    key={idx}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnSlot(e, idx)}
                    onClick={() => {
                      haptics.select();
                      setSelectedSlotIdx(idx);
                      if (placement) {
                        setInspectedHeroId(placement.heroId);
                        setSelectedHeroForPlacement(placement.heroId);
                      }
                    }}
                    className={`p-2 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all min-h-[100px] ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 shadow-lg ring-1 ring-amber-400'
                        : placement
                        ? 'bg-neutral-900 border-white/15 hover:border-white/30'
                        : 'bg-black/40 border-dashed border-white/20 hover:border-amber-400/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-black text-amber-400 uppercase">
                        Slot {idx + 1}
                      </span>
                      <GripVertical className="w-3.5 h-3.5 text-neutral-500" />
                    </div>

                    {placement && def ? (
                      <>
                        <div className="flex items-center gap-2 my-1">
                          <div
                            draggable
                            onDragStart={() => handleDragStartHero(placement.heroId)}
                            className="w-8 h-8 flex items-center justify-center shrink-0 drop-shadow cursor-grab active:cursor-grabbing"
                          >
                            <HeroPiece type={heroIdToPieceType(placement.heroId)} color="white" className="w-full h-full" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-black uppercase text-white truncate">{def.name}</div>
                            <div className="text-[9px] text-amber-300 font-mono">
                              Col {placement.pos.x + 1} • Row 8
                            </div>
                          </div>
                        </div>

                        {/* Equipment Tile Badge on Slot */}
                        {equipment && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectAbilityModal(equipment);
                            }}
                            className="mt-1 p-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-400/50 rounded-lg flex items-center justify-between gap-1 text-[9px] font-mono text-purple-200 cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <AbilityTile ability={equipment.id} rarity={equipment.rarity} state="ready" size={20} />
                              <span className="truncate font-bold text-amber-300">{equipment.name}</span>
                            </div>
                            <Info className="w-3 h-3 text-purple-300 shrink-0" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center py-2 text-neutral-500">
                        <span className="text-xs font-bold uppercase">+ Empty Slot</span>
                        <span className="text-[8px] font-mono">Tap Hero to Place</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* INLINE HERO & EQUIPMENT DETAILS INSPECTION CARD */}
          <div className="bg-[#161422] border-2 border-purple-500/40 p-3 rounded-xl shadow-xl flex flex-col sm:flex-row items-center gap-3">
            <div className="w-12 h-12 p-1 shrink-0 bg-black/60 rounded-xl border border-white/10 flex items-center justify-center drop-shadow-lg">
              <HeroPiece type={heroIdToPieceType(inspectedHeroId)} color="white" className="w-full h-full" />
            </div>

            <div className="flex-1 space-y-1 text-left min-w-0 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono font-black text-amber-400 uppercase">
                    {inspectedHeroDef.title} • {inspectedHeroDef.role.toUpperCase()}
                  </span>
                  <h4 className="text-sm font-black uppercase text-white truncate">
                    {inspectedHeroDef.name}
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-300 bg-black/40 px-2 py-1 rounded border border-white/10">
                  <span>HP: <strong className="text-emerald-400">35</strong></span>
                  <span>ATK: <strong className="text-amber-400">3.5</strong></span>
                </div>
              </div>

              {/* Equipment Preview */}
              <div
                onClick={() => setInspectAbilityModal(inspectedAbility)}
                className="p-2 bg-purple-950/70 hover:bg-purple-900 border border-purple-400/40 rounded-xl cursor-pointer flex items-center justify-between gap-2 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AbilityTile ability={inspectedAbility.id} rarity={inspectedAbility.rarity} state="ready" size={32} />
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase text-amber-300 truncate">
                      Equipment: {inspectedAbility.name} ({inspectedAbility.cooldownSec}s CD)
                    </div>
                    <div className="text-[9px] text-neutral-300 truncate font-mono">
                      {inspectedAbility.description}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold text-purple-300 underline shrink-0">
                  Inspect
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
