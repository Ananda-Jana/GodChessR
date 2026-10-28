import React from 'react';
import { MugenGemIcon } from '../economy/MugenGemIcon';
import { Sparkles } from 'lucide-react';

interface GemRewardCardProps {
  amount: number;
  onClaim?: () => void;
}

export const GemRewardCard: React.FC<GemRewardCardProps> = ({
  amount,
  onClaim,
}) => {
  return (
    <div className="relative select-none">
      {/* Outer amber/cyan glowing layer behind the card */}
      <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/50 via-yellow-400/60 to-cyan-400/50 rounded-[18px] blur-md animate-pulse pointer-events-none" />

      {/* Glow Shell */}
      <div className="relative w-[148px] max-w-[148px] h-[236px] min-h-[236px] max-360:w-[128px] max-360:h-[208px] max-360:min-h-[208px] rounded-[14px] bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 p-[2px] shadow-[0_0_20px_rgba(245,158,11,0.5)] box-border">
        
        {/* Card Body Face */}
        <div
          className="relative z-10 w-full h-full rounded-[12px] border border-amber-300/30 flex flex-col justify-between p-2 text-white overflow-hidden box-border"
          style={{
            background: 'radial-gradient(circle at 50% 30%, #2a1b02 0%, #0a0800 100%)',
          }}
        >
          {/* Sheen sweep across card face */}
          <div className="chest-card-sheen" aria-hidden="true" />

          {/* Top Bar */}
          <div className="flex items-center justify-between w-full z-10 shrink-0">
            <div className="px-1.5 py-0.5 rounded-[4px] bg-amber-500 flex items-center gap-1 justify-center">
              <Sparkles className="w-2.5 h-2.5 text-black" />
              <span className="text-[8px] font-black uppercase text-black tracking-wider leading-none">
                CURRENCY LOOT
              </span>
            </div>

            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-[6px] leading-none shrink-0 bg-emerald-500 text-black font-mono shadow-sm">
              EARNED
            </span>
          </div>

          {/* Centered Large Gem Icon */}
          <div className="flex items-center justify-center my-1 z-10 shrink-0">
            <div className="w-[84px] h-[84px] max-360:w-[72px] max-360:h-[72px] rounded-[12px] border-[3px] border-amber-400 overflow-hidden flex items-center justify-center bg-black/80 shadow-[0_0_15px_rgba(245,158,11,0.4)] shrink-0">
              <MugenGemIcon className="w-14 h-14 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center min-w-0 z-10 shrink-0 my-0.5">
            <h4 className="text-[13px] font-black uppercase tracking-wide text-amber-300 truncate px-1 leading-tight">
              MUGEN GEMS
            </h4>
          </div>

          {/* Gem Amount Pill */}
          <div className="flex flex-col items-center justify-center z-10 shrink-0 my-0.5">
            <div className="w-full py-1 px-1 rounded-[8px] bg-[#140e02] border border-amber-400/60 flex flex-col items-center justify-center shadow-inner">
              <span className="text-[7px] font-bold uppercase text-amber-200/80 leading-none tracking-widest">
                PAYOUT
              </span>
              <span className="font-mono font-black text-[17px] max-360:text-[14px] tracking-tight text-amber-300 leading-tight drop-shadow">
                +{amount}
              </span>
            </div>
          </div>

          {/* Action Button */}
          {onClaim && (
            <button
              onClick={onClaim}
              className="w-full h-[34px] max-360:h-[30px] mt-0.5 text-xs font-black uppercase tracking-wider rounded-[8px] bg-amber-400 hover:bg-amber-300 text-black border border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer transition-all flex items-center justify-center z-20 shrink-0"
            >
              COLLECTED
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
