import React, { useState } from 'react';
import { HeroId } from '../types/heroDuelTypes';
import { HEROES } from '../heroes/heroRegistry';
import { HeroPiece, heroIdToPieceType } from '../art/heroAvatarHelper';
import { X, BookOpen, Shield, Swords, Flag, RefreshCw, Zap, Crown, AlertTriangle } from 'lucide-react';

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
        className="relative bg-[#141419] border-3 border-amber-400 max-w-3xl w-full max-h-[92vh] overflow-y-auto rounded-xl p-4 sm:p-6 shadow-2xl text-white flex flex-col gap-4"
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
          <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-amber-400">
            Shrine Siege • Tactical Codex & Guide
          </h2>
        </div>

        {/* Shrine Siege Turn-Based Rules */}
        <div className="bg-black/70 border-2 border-amber-400/40 p-4 rounded-xl space-y-2.5 text-xs font-mono">
          <div className="text-sm font-black uppercase text-amber-400 border-b border-white/10 pb-1 flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" />
            <span>SHRINE SIEGE RULES:</span>
          </div>
          <ul className="space-y-1.5 text-neutral-200 text-[11px] list-disc list-inside leading-relaxed">
            <li>Turn-based tactical battle on an 8x8 chessboard.</li>
            <li>Each turn, choose up to [limit based on difficulty] heroes to move or attack.</li>
            <li>All units move 1 square in any direction.</li>
            <li>Moving onto an enemy attacks them. Moving onto a shrine captures it.</li>
            <li>Capture shrines to unlock powerful active abilities for your heroes.</li>
            <li>Pawns advance automatically each turn.</li>
            <li>Win by eliminating all enemy heroes OR holding both shrines for 8 turns.</li>
          </ul>
        </div>

        {/* Interactive Hero Previewer */}
        <div className="border-t border-white/20 pt-3">
          <div className="text-xs font-mono font-black uppercase text-amber-400 mb-2">
            Select a Hero to Inspect Skills & Attributes:
          </div>

          {/* Hero Picker Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {heroList.map((id) => {
              const h = HEROES[id];
              const isSelected = selectedHeroId === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedHeroId(id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-black uppercase whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-400 text-black border-white shadow-md'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="w-4 h-4 inline-block">
                    <HeroPiece type={heroIdToPieceType(id)} color={isSelected ? 'black' : 'white'} />
                  </span>
                  <span>{h.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Hero Detailed Preview */}
          <div className="mt-3 p-4 bg-black/70 border-2 border-white/15 rounded-xl flex flex-col md:flex-row gap-4 items-center">
            <div className="w-20 h-20 p-1 shrink-0 drop-shadow-xl flex items-center justify-center">
              <HeroPiece type={heroIdToPieceType(selectedHeroId)} color="white" className="w-full h-full" />
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
                  <span className="font-black text-purple-400">⚡ Active Skill: {activeHero.active.name}</span>{' '}
                  <span className="text-[10px] text-neutral-400 font-mono">(CD: {activeHero.active.baseCooldown}s)</span>:
                  <span className="text-neutral-300 ml-1">{activeHero.active.description}</span>
                </div>
                <div>
                  <span className="font-black text-amber-300">✨ Strategic Passive:</span>{' '}
                  <span className="text-neutral-300">{activeHero.passives[0]?.name} - {activeHero.passives[0]?.description}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="hd-btn-brutal w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase cursor-pointer shadow-lg"
        >
          Got It • Ready for Siege
        </button>
      </div>
    </div>
  );
};

