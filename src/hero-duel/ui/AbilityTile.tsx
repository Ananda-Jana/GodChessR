import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AbilityIcon, AbilityIconId } from './AbilityIcon';
import { Lock } from 'lucide-react';
import { heroDuelAudio } from '../utils/heroDuelAudio';

export interface AbilityTileProps {
  abilityId: AbilityIconId;
  isUnlocked: boolean;
  isAlive: boolean;
  isActive?: boolean;
  cooldownSeconds: number; // Whole seconds remaining
  initialCooldownSeconds?: number;
  level: number;
  maxLevel?: number;
  onActivate: () => void;
}

export const AbilityTile: React.FC<AbilityTileProps> = React.memo(
  ({
    abilityId,
    isUnlocked,
    isAlive,
    isActive = false,
    cooldownSeconds,
    initialCooldownSeconds = 10,
    level = 1,
    maxLevel = 3,
    onActivate,
  }) => {
    const isLocked = !isUnlocked || !isAlive;
    const isCooldown = !isLocked && cooldownSeconds > 0;
    const isReady = !isLocked && !isCooldown && !isActive;
    const isMax = level >= maxLevel;

    // Guard against synthetic double fire from pointer down + click
    const lastTriggerRef = useRef<number>(0);

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        // Unlock Web Audio on first gesture
        heroDuelAudio.unlock();

        if (isLocked || isCooldown) {
          heroDuelAudio.triggerHaptic(10);
          return;
        }

        const now = performance.now();
        if (now - lastTriggerRef.current < 250) {
          return;
        }
        lastTriggerRef.current = now;

        // Dispatch ability logic first
        onActivate();

        // Synthesize audio after dispatch
        heroDuelAudio.playAbilityWhoosh();
      },
      [isLocked, isCooldown, onActivate]
    );

    // CSS variables for conic cooldown sweep animation
    const cdDurationMs = Math.max(1000, (initialCooldownSeconds || cooldownSeconds || 1) * 1000);
    const style: React.CSSProperties = {
      ['--cd-ms' as string]: `${cdDurationMs}ms`,
    };

    return (
      <div
        className={`ability-tile ${isLocked ? 'locked' : ''} ${isReady ? 'ready' : ''} ${
          isCooldown ? 'cooldown' : ''
        } ${isActive ? 'active' : ''}`}
        style={style}
        onPointerDown={handlePointerDown}
        role="button"
        tabIndex={isLocked ? -1 : 0}
        aria-label={`${abilityId} ability`}
      >
        {/* Ability Icon */}
        <AbilityIcon abilityId={abilityId} className="icon" />

        {/* Small lock glyph if locked */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 rounded-[20px] pointer-events-none">
            <Lock className="w-5 h-5 text-white/90 drop-shadow" />
          </div>
        )}

        {/* Cooldown conic sweep & center number */}
        {isCooldown && (
          <div className="cd">
            <div className="cd-num">{cooldownSeconds}</div>
          </div>
        )}

        {/* Level badge in bottom-left */}
        <div className={`lvl ${isMax ? 'max' : ''}`}>{isMax ? 'MAX' : level}</div>
      </div>
    );
  }
);

AbilityTile.displayName = 'AbilityTile';
