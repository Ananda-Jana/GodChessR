import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface RoseParadiseEntryButtonProps {
  onClick: () => void;
}

export const RoseParadiseEntryButton: React.FC<RoseParadiseEntryButtonProps> = ({ onClick }) => {
  return (
    <div className="bg-[#1b0a2e] text-white border-4 border-[#c084fc] p-4 sm:p-5 shadow-[6px_6px_0px_#c084fc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 bg-[#a855f7] border-2 border-black flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_#000]">
          <Heart className="w-7 h-7 text-pink-200 fill-pink-200" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-black uppercase text-[#f0abfc]">
              Rose Paradise (Couples 1v1)
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 bg-[#a855f7] text-white font-black uppercase">
              Petals & Summons
            </span>
          </div>
          <p className="text-xs text-purple-200 mt-0.5">
            A romantic, fast-paced tactical duel with Petals, Summons, and Love Links.
          </p>
        </div>
      </div>
      <button
        onClick={onClick}
        className="py-3 px-5 bg-[#a855f7] hover:bg-[#c084fc] text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-transform hover:-translate-y-0.5"
      >
        <Sparkles className="w-4 h-4 text-pink-200" />
        🌹 Enter Rose Paradise
      </button>
    </div>
  );
};
