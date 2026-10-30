import React, { useState } from 'react';
import { HeroId } from '../types/heroDuelTypes';
import { HEROES } from '../heroes/heroRegistry';
import { HeroPieceSvg } from '../art/heroPieceSvg';
import { X, BookOpen, Sparkles, Check, ChevronRight } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [selectedHeroId, setSelectedHeroId] = useState<HeroId>('mugen-king');
  const heroList: HeroId[] = [
    'mugen-king',
    'malevolent-priest',
    'dr-methanogenic',
    'captain-englland',
    'ajx-assassin',
    'yjkstra-pathfinder',
    'ironclad-warden',
    'black-monkey',
    'part-king-kong',
  ];
  const activeHero = HEROES[selectedHeroId];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-[#141419] border-3 border-white max-w-3xl w-full max-h-[92vh] overflow-y-auto rounded-xl p-4 sm:p-6 shadow-2xl text-white flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 border-b-2 border-white/20 pb-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-black uppercase tracking-tight">
            How to Play Hero Duel • Interactive Codex
          </h2>
        </div>

        {/* Core Rules Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 bg-black/60 border border-white/15 rounded">
            <div className="font-black text-amber-400 uppercase mb-0.5">1. 7×8 Battlefield</div>
            <p className="text-neutral-300 text-[11px]">
              No pawns. 4 heroes per team drafted before battle. High tactical density in a 56-square grid.
            </p>
          </div>
          <div className="p-2.5 bg-black/60 border border-white/15 rounded">
            <div className="font-black text-amber-400 uppercase mb-0.5">2. Captain Victory</div>
            <p className="text-neutral-300 text-[11px]">
              Appoint 1 Captain. Slaying the enemy Captain wins instantly, or eliminate all 4 heroes!
            </p>
          </div>
          <div className="p-2.5 bg-black/60 border border-white/15 rounded">
            <div className="font-black text-amber-400 uppercase mb-0.5">3. Collect Cards</div>
            <p className="text-neutral-300 text-[11px]">
              Every defeated hero yields a collectible 750×1050 card with procedural background artwork.
            </p>
          </div>
        </div>

        {/* Interactive Hero Previewer */}
        <div className="border-t border-white/20 pt-3">
          <div className="text-xs font-mono font-black uppercase text-amber-400 mb-2">
            Select a Hero to Inspect Tactics & Moves:
          </div>

          {/* Hero Picker Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
            {heroList.map((id) => {
              const h = HEROES[id];
              const isSelected = selectedHeroId === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedHeroId(id)}
                  className={`px-3 py-1.5 rounded-lg border-2 text-xs font-black uppercase whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-400 text-black border-white shadow-md'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="w-4 h-4 inline-block">
                    <HeroPieceSvg heroId={id} team={1} />
                  </span>
                  <span>{h.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Hero Detailed Preview */}
          <div className="mt-3 p-4 bg-black/70 border-2 border-white/15 rounded-xl flex flex-col md:flex-row gap-4 items-center">
            <div className="w-24 h-24 bg-neutral-950 border-2 border-amber-400 p-2 rounded-xl shrink-0 shadow-lg flex items-center justify-center">
              <HeroPieceSvg heroId={selectedHeroId} team={1} size={80} />
            </div>

            <div className="flex-1 text-left space-y-2">
              <div>
                <span className="text-[10px] font-mono font-black text-amber-400 uppercase">
                  {activeHero.title} • {activeHero.role.toUpperCase()}
                </span>
                <h3 className="text-lg font-black uppercase text-white">
                  {activeHero.name}
                </h3>
              </div>

              <div className="text-xs space-y-1">
                <div>
                  <span className="font-black text-blue-400">⚡ Active: {activeHero.active.name}</span>{' '}
                  <span className="text-[10px] text-neutral-400 font-mono">(CD: {activeHero.active.baseCooldown})</span>:
                  <span className="text-neutral-300 ml-1">{activeHero.active.description}</span>
                </div>
                <div>
                  <span className="font-black text-amber-300">✨ Key Passive:</span>{' '}
                  <span className="text-neutral-300">{activeHero.passives[0]?.name} - {activeHero.passives[0]?.description}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="hd-btn-brutal w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase cursor-pointer"
        >
          Got It • Ready to Duel
        </button>
      </div>
    </div>
  );
};
