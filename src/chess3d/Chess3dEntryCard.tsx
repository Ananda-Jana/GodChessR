import React from 'react';
import { Crown, Sparkles, Swords, Bot, Users } from 'lucide-react';
import { Piece3DStandalone } from './3dchesspieces';

interface Chess3dEntryCardProps {
  onOpen: () => void;
}

export const Chess3dEntryCard: React.FC<Chess3dEntryCardProps> = ({ onOpen }) => {
  return (
    <div className="relative border-4 border-blue-500 bg-gradient-to-br from-[#0c101c] via-[#0f172a] to-[#080d1a] p-4 sm:p-5 shadow-[6px_6px_0px_#2563eb] flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-start justify-between gap-4 overflow-hidden min-w-0 transition-all duration-200 group">
      {/* Background cyber radial glow */}
      <div
        aria-hidden="true"
        className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"
      />

      {/* Header & Piece Icon */}
      <div className="flex items-center gap-3.5 relative z-10 min-w-0">
        <div className="w-14 h-14 bg-[#0c0d10] border-2 border-blue-500 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000] overflow-hidden group-hover:scale-105 transition-transform">
          <Piece3DStandalone type="king" team="orange" size={54} background="transparent" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-black uppercase text-white tracking-wide">
              3D Annihilatic Chess Arcade
            </h3>
            <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 bg-blue-600 text-white border border-blue-400/40 shadow-sm">
              NEW MODE
            </span>
          </div>
          <p className="text-xs font-bold text-neutral-300 mt-0.5 max-w-md">
            Flat 8x8 FIDE board with 3D feline pieces (White & Black). Battle Punisher bots or challenge friends in real-time rooms.
          </p>
        </div>
      </div>

      {/* Badges and Enter Action Button */}
      <div className="flex flex-wrap items-center justify-between w-full gap-3 relative z-10 lg:mt-auto pt-2 border-t border-blue-500/20">
        <div className="flex items-center gap-2 text-[10px] font-mono text-blue-300">
          <span className="px-1.5 py-0.5 bg-black/50 border border-blue-500/30 rounded">
            FIDE 8x8
          </span>
          <span className="px-1.5 py-0.5 bg-black/50 border border-blue-500/30 rounded">
            Punisher AI
          </span>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 ml-auto"
        >
          <Swords className="w-4 h-4" />
          Enter 3D Arcade
        </button>
      </div>
    </div>
  );
};
