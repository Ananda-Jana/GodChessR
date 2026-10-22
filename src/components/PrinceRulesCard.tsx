import React from 'react';
import { Crown, Sparkles, ShieldCheck } from 'lucide-react';
import { ChessPiece } from './ChessPiece';
import { PieceColor } from '../types/game';

interface PrinceRulesCardProps {
  myColor: PieceColor;
  princeSpecialUsed?: boolean;
}

export const PrinceRulesCard: React.FC<PrinceRulesCardProps> = ({
  myColor,
  princeSpecialUsed = false,
}) => {
  return (
    <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-4 flex flex-col gap-3 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] text-black dark:text-white">
      <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <ChessPiece type="prince" color={myColor} className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight flex items-center gap-1.5">
            The Prince
            <Crown className="w-3.5 h-3.5 text-amber-500" />
          </h4>
        </div>
        <span className="text-[10px] font-mono font-bold bg-neutral-200 dark:bg-neutral-800 px-1 border border-black dark:border-white">
          Corner (h1 / a8)
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="bg-neutral-100 dark:bg-neutral-900 p-2 border border-black dark:border-white">
          <div className="flex items-center justify-between font-black uppercase text-amber-600 dark:text-amber-400 mb-0.5">
            <span>Ability A · Knight Leap</span>
            <span className="text-[10px] font-mono text-neutral-500 font-normal">2×1 L-shape</span>
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 font-medium leading-tight">
            Standard Knight jump over intervening pieces.
          </p>
        </div>

        <div className="bg-neutral-100 dark:bg-neutral-900 p-2 border border-black dark:border-white">
          <div className="flex items-center justify-between font-black uppercase text-amber-600 dark:text-amber-400 mb-0.5">
            <span>Ability B · Bounded Diagonal</span>
            <span className="text-[10px] font-mono text-neutral-500 font-normal">1 to 4 squares</span>
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 font-medium leading-tight">
            Diagonal slide of 1 to 4 clear squares. Cannot jump.
          </p>
        </div>

        <div className="bg-neutral-100 dark:bg-neutral-900 p-2 border border-black dark:border-white">
          <div className="flex items-center justify-between font-black uppercase text-amber-600 dark:text-amber-400 mb-0.5">
            <span className="flex items-center gap-1">
              Ability C · Special 1st Move
              <Sparkles className="w-3 h-3 text-amber-500" />
            </span>
            <span
              className={`text-[9px] px-1 font-black uppercase border border-black dark:border-white ${
                princeSpecialUsed
                  ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                  : 'bg-amber-400 text-black'
              }`}
            >
              {princeSpecialUsed ? 'Used' : 'Available'}
            </span>
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 font-medium leading-tight">
            Extended 3×1 leap on 1st move over pieces (1x per match).
          </p>
        </div>
      </div>

      <div className="text-[10px] font-bold pt-1 border-t-2 border-black dark:border-white flex flex-col gap-1">
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 uppercase">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Expensive piece category (Rolls 4, 5, 6).</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono">
            <span className="w-2.5 h-2.5 bg-[#1e3a8a] border border-black inline-block" />
            White: Navy
          </span>
          <span className="flex items-center gap-1 font-mono">
            <span className="w-2.5 h-2.5 bg-[#881337] border border-black inline-block" />
            Black: Dark Red
          </span>
        </div>
      </div>
    </div>
  );
};
