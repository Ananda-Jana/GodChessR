/**
 * RankBadge.tsx - Polished Geometric Emblem Badge Component for League Ranks
 * Uses geometric emblem designs built from chess pieces + frames + tier pips.
 */

import React from 'react';
import { RankDefinition } from '../../league/rankConfig';
import { EmblemBadge, BadgeSet, RankId } from './LeagueRankBadges';

export type { BadgeSet, RankId };

export interface RankBadgeProps {
  rank?: RankDefinition;
  rankId?: RankId | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero' | number;
  set?: BadgeSet;
  showLabel?: boolean;
  isLocked?: boolean;
  className?: string;
  artUrl?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  rankId,
  size = 'md',
  set = 'solid',
  showLabel = false,
  isLocked = false,
  className = '',
  artUrl,
}) => {
  const effectiveId = (rankId || rank?.id || 'rusted_chrome') as RankId;
  const effectiveName = rank?.name || effectiveId.replace(/_/g, ' ');

  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'xs'
      ? 24
      : size === 'sm'
      ? 32
      : size === 'md'
      ? 48
      : size === 'lg'
      ? 64
      : 112; // 'hero'

  return (
    <div className={`inline-flex flex-col items-center gap-1 shrink-0 ${className}`}>
      <div
        className={`relative flex items-center justify-center select-none transition-all ${
          isLocked ? 'opacity-40 grayscale' : ''
        }`}
        title={`${effectiveName}`}
      >
        <EmblemBadge
          rankId={effectiveId}
          size={pixelSize}
          set={set}
          artUrl={artUrl || rank?.artUrl}
        />

        {isLocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center rounded-full">
            <span className="text-[12px]">🔒</span>
          </div>
        )}
      </div>

      {showLabel && (
        <span
          className="text-[10px] font-mono font-black uppercase tracking-wider text-center leading-tight truncate max-w-[110px]"
          style={{ color: rank?.primaryColor || '#fbbf24' }}
        >
          {effectiveName}
        </span>
      )}
    </div>
  );
};
