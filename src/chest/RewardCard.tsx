import React, { useState } from 'react';
import { SecretPlayerRewardDef } from './chestConfig';
import { Copy, Check } from 'lucide-react';

interface RewardCardProps {
  reward: SecretPlayerRewardDef;
  isOwned: boolean;
  onPlay: () => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  isOwned,
  onPlay,
}) => {
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(reward.code).catch(() => {});
      }
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem('mugen_last_copied_pin', reward.code);
        window.sessionStorage?.setItem('mugen_last_copied_pin', reward.code);
        window.dispatchEvent(new CustomEvent('mugen_pin_copied', { detail: { pin: reward.code } }));
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fail safe
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="relative select-none">
      {/* Outer soft glow layer behind the card */}
      <div className="chest-card-outer-glow rounded-[16px]" aria-hidden="true" />

      {/* Glow Shell: Clips the rotating border ring */}
      <div className="chest-card-glow-shell w-[156px] max-w-[156px] h-[256px] min-h-[256px] max-360:w-[136px] max-360:h-[230px] max-360:min-h-[230px] rounded-[14px]">
        {/* Rotating Blue-Violet Conic-Gradient Ring */}
        <div className="chest-card-border-ring" aria-hidden="true" />

        {/* Card Body Face: Dark premium look (#1d1b4b to #0f0e2a) */}
        <div
          className="relative z-10 w-full h-full rounded-[12px] border border-white/12 flex flex-col justify-between p-2 text-white overflow-hidden box-border"
          style={{
            background: 'linear-gradient(180deg, #1d1b4b 0%, #0f0e2a 100%)',
          }}
        >
          {/* Sheen sweep across card face */}
          <div className="chest-card-sheen" aria-hidden="true" />

          {/* Top Bar: Accent color top band caption + NEW/OWNED badge */}
          <div className="flex items-center justify-between w-full z-10 shrink-0">
            <div
              className="px-1.5 py-0.5 rounded-[4px] flex items-center justify-center"
              style={{ backgroundColor: reward.accentColor }}
            >
              <span className="text-[8px] font-black uppercase text-white tracking-wider leading-none">
                SECRET PLAYER
              </span>
            </div>

            <span
              className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-[6px] leading-none shrink-0 ${
                isOwned
                  ? 'bg-slate-700/80 text-slate-300 border border-slate-500/50'
                  : 'bg-[#dc2626] text-white shadow-sm'
              }`}
            >
              {isOwned ? 'OWNED' : 'NEW'}
            </span>
          </div>

          {/* Centered Avatar (78x78 px, 3px accent border, rounded 10px) */}
          <div className="flex items-center justify-center my-0.5 z-10 shrink-0">
            <div
              className="w-[78px] h-[78px] max-360:w-[68px] max-360:h-[68px] rounded-[10px] border-[3px] overflow-hidden flex items-center justify-center bg-[#0a0a1a] shrink-0"
              style={{ borderColor: reward.accentColor }}
            >
              {!imageError ? (
                <img
                  src={reward.avatarSrc}
                  alt={reward.name}
                  loading="lazy"
                  decoding="async"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                /* Fallback Avatar */
                <div
                  className="w-full h-full flex items-center justify-center text-white font-black"
                  style={{ backgroundColor: reward.accentColor }}
                >
                  <span className="text-xl font-black drop-shadow-md">
                    {reward.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Player Name */}
          <div className="text-center min-w-0 z-10 shrink-0 my-0.5">
            <h4 className="text-[13px] max-360:text-xs font-black uppercase tracking-wide text-white truncate px-1 leading-tight">
              {reward.name}
            </h4>
          </div>

          {/* Six-digit CODE with dedicated Copy Option */}
          <div className="flex flex-col items-center justify-center z-10 shrink-0 my-0.5 w-full">
            <div
              className="w-full py-1 px-1.5 rounded-[8px] bg-[#0b0b1f] border border-dashed flex items-center justify-between gap-1 shadow-inner"
              style={{ borderColor: reward.accentColor }}
            >
              <div className="flex flex-col text-left leading-none pl-0.5">
                <span className="text-[7px] font-bold uppercase text-slate-400">PIN CODE</span>
                <span className="font-mono font-black text-[13px] max-360:text-[12px] tracking-[1.5px] text-[#fde68a]">
                  {reward.code}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-1.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[8px] uppercase tracking-wider rounded border border-black shadow-[1px_1px_0px_#000] flex items-center gap-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0 transition-transform"
                title="Copy 6-Digit PIN"
                aria-label={`Copy PIN for ${reward.name}`}
              >
                {copied ? (
                  <>
                    <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5 text-black stroke-[2.5]" />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Full-width PLAY button */}
          <button
            onClick={onPlay}
            className="w-full h-[34px] max-360:h-[30px] mt-0.5 text-xs font-black uppercase tracking-wider rounded-[8px] border border-black/40 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000000] cursor-pointer transition-all flex items-center justify-center z-20 shrink-0"
            style={{
              backgroundColor: reward.accentColor,
              color: reward.buttonTextColor,
            }}
            aria-label={`Play against ${reward.name} now`}
          >
            PLAY
          </button>
        </div>
      </div>
    </div>
  );
};
