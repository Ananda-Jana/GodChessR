import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface RoseParadiseEntryButtonProps {
  onClick: () => void;
}

export const RoseParadiseEntryButton: React.FC<RoseParadiseEntryButtonProps> = ({ onClick }) => {
  return (
    <div 
      className="relative overflow-hidden bg-cover bg-center border-4 border-[#2f2ee1] p-4 sm:p-5 shadow-[6px_6px_0px_#634adb] flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-start justify-between gap-4 min-w-0 h-full"
      style={{ backgroundImage: "url('/assets/aistudio/image_58fb144c.png')" }}
    >
      {/* Vignette / Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.85)_95%)] z-0 pointer-events-none" />

      <div className="flex items-center gap-3.5 relative z-10 bg-black/75 p-3 border border-white/20 backdrop-blur-sm rounded-xl shadow-lg">
        <div className="w-12 h-12 bg-[#2f2ee1] border-2 border-black flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_#6755be]">
          <Heart className="w-7 h-7 text-pink-200 fill-pink-200" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-black uppercase text-white drop-shadow-md">
              Rose Paradise (Couples 1v1)
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 bg-[#2f2ee1] text-white font-black uppercase border border-[#634adb] shadow-sm">
              Petals & Summons
            </span>
          </div>
          <p className="text-xs text-purple-200 mt-0.5 font-bold drop-shadow">
            A romantic, fast-paced tactical duel with Petals, Summons, and Love Links.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
        <button
          onClick={onClick}
          className="py-3 px-5 bg-[#2f2ee1] hover:bg-blue-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#634adb] flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-transform hover:-translate-y-0.5 relative z-10"
        >
          <Sparkles className="w-4 h-4 text-pink-200" />
          🌹 Enter Rose Paradise
        </button>
      </div>
    </div>
  );
};
