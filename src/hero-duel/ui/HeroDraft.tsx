import React, { useState } from 'react';
import { HeroId } from '../types/heroDuelTypes';
import { ALL_HEROES, getRandomBalancedDraft } from '../heroes/heroRegistry';
import { HeroPiece, heroIdToPieceType } from '../art/heroAvatarHelper';
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

  const isReady = selectedHeroIds.length === 4;

  return (
    <div className="hd-root min-h-screen bg-[#08080a] text-white flex flex-col font-sans select-none p-3 sm:p-5">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-3 border-b-2 border-white/20">
        <button
          onClick={onBack}
          className="hd-btn-brutal px-3 py-1.5 bg-neutral-900 text-white border-2 border-white hover:bg-neutral-800 flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-400 text-black text-[10px] font-black uppercase rounded shadow-sm">
            <Sparkles className="w-3 h-3" />
            <span>Draft Phase • Pick Exactly 4 Champions</span>
          </div>
          <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-white mt-1">
            Draft {teamLabel} ({selectedHeroIds.length} / 4 Selected)
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

      {/* Main Roster Grid (3 cols on mobile, 4-5 on desktop) */}
      <main className="max-w-6xl w-full mx-auto py-4 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-neutral-400 mb-3 flex items-center justify-between">
            <span>Select 4 champions. All 9 heroes available:</span>
            <span className="text-amber-400 font-black">{selectedHeroIds.length} / 4 Selected</span>
          </div>

          {/* 3 cols on mobile, 4-5 cols on desktop */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {ALL_HEROES.map((hero) => {
              const isSelected = selectedHeroIds.includes(hero.id);
              const isCaptain = isSelected && captainId === hero.id;

              return (
                <div
                  key={hero.id}
                  onClick={() => toggleSelectHero(hero.id)}
                  className={`relative p-2.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 text-left ${
                    isSelected
                      ? 'bg-[#1e1014] border-amber-400 shadow-[0_0_12px_rgba(255,215,0,0.4)]'
                      : 'bg-[#121218] border-white/10 hover:border-white/30 opacity-85'
                  }`}
                >
                  {/* Selected Badge Checkmark */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-amber-400 text-black p-0.5 rounded-full z-10 shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Hero Avatar & Name */}
                  <div className="flex flex-col items-center text-center gap-1 pt-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900/40 border border-slate-700/60 rounded-lg p-1 flex items-center justify-center drop-shadow-md">
                      <HeroPiece type={heroIdToPieceType(hero.id)} color="white" className="w-full h-full" />
                    </div>
                    <div className="w-full truncate">
                      <div className="text-[9px] font-mono font-black text-amber-400 uppercase truncate">
                        {hero.role}
                      </div>
                      <div className="font-black text-xs uppercase text-white truncate">
                        {hero.name}
                      </div>
                    </div>
                  </div>

                  {/* Two Ability Names */}
                  <div className="text-[9px] bg-black/70 p-1.5 rounded border border-white/10 flex flex-col gap-0.5 leading-tight font-mono">
                    <div className="text-amber-300 font-bold truncate">⚡ {hero.active.name}</div>
                    <div className="text-neutral-400 truncate">🛡️ {hero.passives[0]?.name || 'Passive'}</div>
                  </div>

                  {/* SELECT / UNSELECT Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectHero(hero.id);
                    }}
                    className={`w-full py-1 rounded text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-400 text-black font-black'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {isSelected ? 'SELECTED ★' : 'SELECT'}
                  </button>

                  {/* Captain Button */}
                  {isSelected && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCaptainId(hero.id);
                      }}
                      className={`w-full py-0.5 rounded text-[8px] font-bold uppercase flex items-center justify-center gap-1 cursor-pointer ${
                        isCaptain ? 'bg-amber-500/30 text-amber-300 border border-amber-400' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Crown className="w-2.5 h-2.5" />
                      <span>{isCaptain ? 'Captain' : 'Set Captain'}</span>
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
            Selected: <span className="text-amber-400 font-black">{selectedHeroIds.length} / 4</span> • Captain: <span className="text-amber-400 font-black">{ALL_HEROES.find((h) => h.id === captainId)?.name || 'None'}</span>
          </div>

          <button
            onClick={() => onConfirmDraft(selectedHeroIds, captainId)}
            disabled={!isReady}
            className={`hd-btn-brutal w-full sm:w-auto px-8 py-3.5 font-black text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isReady
                ? 'bg-amber-400 hover:bg-amber-300 text-black border-2 border-white shadow-[3px_3px_0px_#fff]'
                : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-50'
            }`}
          >
            <span>Confirm Roster ({selectedHeroIds.length} / 4)</span>
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
