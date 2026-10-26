import React, { useState } from 'react';
import { SecretPlayerRewardDef } from './chestConfig';

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

  return (
    <div className="relative select-none">
      {/* Outer soft glow layer behind the card (blurred, rgba(99,102,241,0.7), pulsing opacity) */}
      <div className="chest-card-outer-glow rounded-[16px]" aria-hidden="true" />

      {/* Glow Shell: Clips the rotating blue-violet conic-gradient border ring */}
      <div className="chest-card-glow-shell w-[148px] max-w-[148px] h-[236px] min-h-[236px] max-360:w-[128px] max-360:h-[208px] max-360:min-h-[208px] rounded-[14px]">
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

          {/* Centered Avatar (84x84 px, 3px accent border, rounded 10px) */}
          <div className="flex items-center justify-center my-0.5 z-10 shrink-0">
            <div
              className="w-[84px] h-[84px] max-360:w-[72px] max-360:h-[72px] rounded-[10px] border-[3px] overflow-hidden flex items-center justify-center bg-[#0a0a1a] shrink-0"
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

          {/* Player Name (14px, bold, uppercase, white, truncated) */}
          <div className="text-center min-w-0 z-10 shrink-0 my-0.5">
            <h4 className="text-[14px] max-360:text-xs font-black uppercase tracking-wide text-white truncate px-1 leading-tight">
              {reward.name}
            </h4>
          </div>

          {/* Six-digit CODE Pill (monospace bold 15px, #fde68a, dark pill #0b0b1f, dashed border) */}
          <div className="flex flex-col items-center justify-center z-10 shrink-0 my-0.5">
            <div
              className="w-full py-0.5 px-1 rounded-[8px] bg-[#0b0b1f] border border-dashed flex flex-col items-center justify-center"
              style={{ borderColor: reward.accentColor }}
            >
              <span className="text-[8px] font-bold uppercase text-slate-400 leading-none">
                CODE
              </span>
              <span className="font-mono font-black text-[15px] max-360:text-[13px] tracking-[1.5px] text-[#fde68a] leading-tight">
                {reward.code}
              </span>
            </div>
          </div>

          {/* Full-width PLAY button (36px high, accent fill, 8px radius, shadow - strictly contained) */}
          <button
            onClick={onPlay}
            className="w-full h-[36px] max-360:h-[32px] mt-0.5 text-xs font-black uppercase tracking-wider rounded-[8px] border border-black/40 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000000] cursor-pointer transition-all flex items-center justify-center z-20 shrink-0"
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
