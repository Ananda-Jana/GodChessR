import React from 'react';
import { HeroId } from '../types/heroDuelTypes';
import { HEROES } from '../heroes/heroRegistry';
import { HeroPieceSvg } from '../art/heroPieceSvg';
import { X, Shield, Zap, Sparkles, AlertTriangle } from 'lucide-react';

interface HeroInfoModalProps {
  heroId: HeroId;
  onClose: () => void;
}

export const HeroInfoModal: React.FC<HeroInfoModalProps> = ({ heroId, onClose }) => {
  const hero = HEROES[heroId];
  if (!hero) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-[#141419] border-3 border-white max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-white/20 pb-3">
          <div className="w-14 h-14 bg-black border-2 border-amber-400 p-1 rounded-lg shrink-0 shadow-md">
            <HeroPieceSvg heroId={heroId} team={1} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-amber-400 font-mono">
              {hero.title}
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase text-white tracking-tight">
              {hero.name}
            </h2>
            <div className="text-xs text-neutral-400 font-mono">
              Role: {hero.role.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3.5 my-4 text-xs">
          {/* Active Ability */}
          <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-lg">
            <div className="flex items-center justify-between text-blue-400 font-black uppercase mb-1">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Active: {hero.active.name}
              </span>
              <span className="text-[10px] font-mono bg-blue-900/60 px-1.5 py-0.5 rounded">
                CD: {hero.active.baseCooldown} Turns
              </span>
            </div>
            <p className="text-neutral-300 text-xs leading-relaxed">
              {hero.active.description}
            </p>
          </div>

          {/* Passives */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-black uppercase text-neutral-400">
              Innate Passives
            </div>
            {hero.passives.map((p, idx) => (
              <div key={idx} className="p-2.5 bg-black/60 border border-white/15 rounded-lg">
                <div className="font-black text-amber-300 text-xs flex items-center gap-1.5 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{p.name}</span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>

          {/* Tactical Weakness */}
          <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-1.5 text-red-400 font-black uppercase text-xs mb-0.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Tactical Vulnerability</span>
            </div>
            <p className="text-neutral-300 text-[11px]">
              {hero.weakness}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="hd-btn-brutal w-full py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase cursor-pointer"
        >
          Close Dossier
        </button>
      </div>
    </div>
  );
};
