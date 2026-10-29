/**
 * RankBadge.tsx - Reusable Polished League Rank Badge Component
 */

import React from 'react';
import { RankDefinition } from '../../league/rankConfig';
import './rankAnimations.css';

interface RankBadgeProps {
  rank: RankDefinition;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  showLabel?: boolean;
  isLocked?: boolean;
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  size = 'md',
  showLabel = false,
  isLocked = false,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-16 h-16 text-sm',
    hero: 'w-24 h-24 sm:w-28 sm:h-28 text-base',
  };

  const animClass = `rank-anim-${rank.animationId}`;

  return (
    <div className={`inline-flex flex-col items-center gap-1 shrink-0 ${className}`}>
      <div
        className={`relative ${sizeClasses[size]} rounded-md border-2 flex items-center justify-center font-mono font-black select-none transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.8)] ${
          isLocked ? 'opacity-40 grayscale border-slate-700 bg-slate-900' : animClass
        }`}
        style={{
          borderColor: isLocked ? '#334155' : rank.primaryColor,
          backgroundColor: isLocked ? '#0f172a' : `${rank.accentColor}33`,
          boxShadow: isLocked ? 'none' : `0 0 12px ${rank.glowColor}`,
        }}
        title={`${rank.name} (Tier ${rank.tierNumber})`}
      >
        {rank.artUrl ? (
          <img
            src={rank.artUrl}
            alt={rank.name}
            className="w-full h-full object-cover rounded-sm"
          />
        ) : (
          /* Polished Crest SVG Placeholder */
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full p-1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: isLocked ? '#64748b' : rank.primaryColor }}
          >
            {/* Shield Outline */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={`${rank.primaryColor}22`} />
            {/* Center Tier Number */}
            <text
              x="12"
              y="15"
              textAnchor="middle"
              fill={isLocked ? '#94a3b8' : rank.primaryColor}
              fontSize="9"
              fontWeight="900"
              fontFamily="monospace"
              stroke="none"
            >
              {rank.tierNumber}
            </text>
          </svg>
        )}

        {isLocked && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center rounded-md">
            <span className="text-[10px]">🔒</span>
          </div>
        )}
      </div>

      {showLabel && (
        <span
          className="text-[10px] font-mono font-black uppercase tracking-wider text-center leading-tight truncate max-w-[100px]"
          style={{ color: isLocked ? '#64748b' : rank.primaryColor }}
        >
          {rank.name}
        </span>
      )}
    </div>
  );
};
