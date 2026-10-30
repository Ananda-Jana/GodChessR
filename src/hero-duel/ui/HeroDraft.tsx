import React, { useState } from 'react';
import { HeroId } from '../types/heroDuelTypes';
import { ALL_HEROES, getRandomBalancedDraft } from '../heroes/heroRegistry';
import { HeroPieceSvg } from '../art/heroPieceSvg';
import { HeroInfoModal } from './HeroInfoModal';
import {
  Crown,
  Info,
  Sparkles,
  Shuffle,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface HeroDraftProps {
  onConfirmDraft: (draftedHeroes: HeroId[], captainId: HeroId) => void;
  onBack: () => void;
  teamLabel?: string;
}

export const HeroDraft: React.FC<HeroDraftProps> = ({
  onConfirmDraft,
  onBack,
  teamLabel = 'Your Team',
}) => {
  const [selectedHeroIds, setSelectedHeroIds] = useState<HeroId[]>([
    'mugen-king',
    'captain-englland',
    'dr-methanogenic',
    'ironclad-warden',
  ]);
  const [captainId, setCaptainId] = useState<HeroId>('mugen-king');
  const [inspectHeroId, setInspectHeroId] = useState<HeroId | null>(null);

  const toggleSelectHero = (id: HeroId) => {
    if (selectedHeroIds.includes(id)) {
      if (selectedHeroIds.length > 1) {
        const next = selectedHeroIds.filter((h) => h !== id);
        setSelectedHeroIds(next);
        if (captainId === id) {
          setCaptainId(next[0]);
        }
      }
    } else {
      if (selectedHeroIds.length < 4) {
        setSelectedHeroIds([...selectedHeroIds, id]);
      }
    }
  };

  const handleQuickPick = () => {
    setSelectedHeroIds(['mugen-king', 'ajx-assassin', 'malevolent-priest', 'part-king-kong']);
    setCaptainId('mugen-king');
  };

  const handleRandomBalanced = () => {
    const balanced = getRandomBalancedDraft();
    setSelectedHeroIds(balanced.heroes);
    setCaptainId(balanced.captainId);
  };

  const isReady = selectedHeroIds.length === 4 && selectedHeroIds.includes(captainId);

  return (
    <div className="hd-root min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans select-none p-3 sm:p-5">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between pb-3 border-b-2 border-white/20">
        <button
          onClick={onBack}
          className="hd-btn-brutal px-3 py-1.5 bg-neutral-900 text-white border-2 border-white hover:bg-neutral-800 flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-400 text-black text-[10px] font-black uppercase rounded shadow-sm">
            <Sparkles className="w-3 h-3" />
            <span>Draft Phase • Pick 4 Heroes</span>
          </div>
          <h1 className="text-base sm:text-lg font-black uppercase tracking-tight">
            Draft {teamLabel} ({selectedHeroIds.length}/4)
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleQuickPick}
            className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold uppercase rounded border border-white/20 cursor-pointer hidden sm:flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Pick</span>
          </button>
          <button
            onClick={handleRandomBalanced}
            className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold uppercase rounded border border-white/20 cursor-pointer flex items-center gap-1"
          >
            <Shuffle className="w-3.5 h-3.5 text-blue-400" />
            <span>Random</span>
          </button>
        </div>
      </header>

      {/* Main Roster Grid */}
      <main className="max-w-5xl w-full mx-auto py-4 flex-1 flex flex-col justify-between gap-5">
        <div>
          <div className="text-xs font-mono font-bold text-neutral-400 mb-2.5 flex items-center justify-between">
            <span>Select 4 heroes for your vanguard. Tap the crown icon to designate Captain:</span>
            <span className="text-amber-400 font-black">{selectedHeroIds.length} / 4 Selected</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ALL_HEROES.map((hero) => {
              const isSelected = selectedHeroIds.includes(hero.id);
              const isCaptain = isSelected && captainId === hero.id;

              return (
                <div
                  key={hero.id}
                  onClick={() => toggleSelectHero(hero.id)}
                  className={`relative p-3.5 rounded-xl border-3 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#181824] border-amber-400 shadow-[4px_4px_0px_#fbbf24]'
                      : 'bg-[#121216] border-white/20 hover:border-white/50 opacity-80'
                  }`}
                >
                  {/* Top Header of Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-12 bg-black border-2 border-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                        <HeroPieceSvg heroId={hero.id} team={1} isCaptain={isCaptain} />
                      </div>
                      <div className="truncate">
                        <div className="text-[10px] font-mono font-black text-amber-400 uppercase truncate">
                          {hero.role}
                        </div>
                        <div className="font-black text-sm uppercase text-white truncate">
                          {hero.name}
                        </div>
                      </div>
                    </div>

                    {/* Inspect button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectHeroId(hero.id);
                      }}
                      className="p-1 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white cursor-pointer"
                      title="Inspect Hero Details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Active Ability Sneak Peek */}
                  <div className="text-[11px] bg-black/50 p-2 rounded border border-white/10 leading-tight">
                    <span className="font-black text-blue-400 block mb-0.5">
                      ⚡ {hero.active.name}
                    </span>
                    <span className="text-neutral-300 text-[10px] line-clamp-2">
                      {hero.active.description}
                    </span>
                  </div>

                  {/* Captaincy Toggle Bar */}
                  {isSelected && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCaptainId(hero.id);
                      }}
                      className={`w-full py-1 px-2 rounded text-[10px] font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        isCaptain
                          ? 'bg-amber-400 text-black shadow-sm font-black'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <Crown className={`w-3.5 h-3.5 ${isCaptain ? 'text-black fill-black' : ''}`} />
                      <span>{isCaptain ? 'Team Captain ★' : 'Make Captain'}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Confirmation Bar */}
        <div className="pt-3 border-t-2 border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-400 font-mono">
            Captain: <span className="text-amber-400 font-black">{ALL_HEROES.find((h) => h.id === captainId)?.name || 'None'}</span> • Slaying the Captain wins the match!
          </div>

          <button
            onClick={() => onConfirmDraft(selectedHeroIds, captainId)}
            disabled={!isReady}
            className={`hd-btn-brutal w-full sm:w-auto px-6 py-3 font-black text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isReady
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black border-2 border-black shadow-[3px_3px_0px_#000]'
                : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-50'
            }`}
          >
            <span>Proceed to Placement</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Inspect Hero Dossier Modal */}
      {inspectHeroId && (
        <HeroInfoModal heroId={inspectHeroId} onClose={() => setInspectHeroId(null)} />
      )}
    </div>
  );
};
