import React from 'react';
import { BookOpen } from 'lucide-react';

export interface EsEntryCardProps {
  onOpen: () => void;
}

export const EsEntryCard: React.FC<EsEntryCardProps> = ({ onOpen }) => {
  return (
    <div className="bg-[#1a1407] text-white border-4 border-[#d9a441] p-4 sm:p-5 shadow-[6px_6px_0px_#d9a441] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_#000]">
          <BookOpen className="w-7 h-7 text-black stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-black uppercase text-amber-400">
              ENDLESS SPRING
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-400 text-black font-black uppercase">
              Story Mode · 5 Games, ~15 Min Each
            </span>
          </div>
          <p className="text-xs font-bold text-amber-100/90 mt-0.5">
            Narrative chess-variants from "Endless Spring: Part One - Mind Opens" by Ananda Jana. Non-standard boards, custom pieces &amp; scripted story arcs!
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
      >
        <BookOpen className="w-4 h-4" />
        <span>📖 Endless Spring</span>
      </button>
    </div>
  );
};
