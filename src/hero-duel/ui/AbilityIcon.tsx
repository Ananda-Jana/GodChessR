import React from 'react';

export type AbilityIconId = 'meteor' | 'jetpack' | 'spiky_ball' | 'shield_barrier' | string;

interface AbilityIconProps {
  abilityId: AbilityIconId;
  className?: string;
}

export const AbilityIcon: React.FC<AbilityIconProps> = React.memo(({ abilityId, className = 'icon' }) => {
  switch (abilityId) {
    case 'meteor':
      return (
        <svg className={className} viewBox="0 0 64 64">
          <defs>
            <radialGradient id="mt" cx=".4" cy=".35" r=".7">
              <stop offset="0" stopColor="#fff3b0" />
              <stop offset=".5" stopColor="#ffb02e" />
              <stop offset="1" stopColor="#e5531a" />
            </radialGradient>
          </defs>
          <path
            d="M32 4c4 8 14 12 14 26a14 14 0 0 1-28 0c0-8 6-10 8-18 2 3 4 4 6-8z"
            fill="url(#mt)"
          />
          <path
            d="M22 34c6-8 14-6 20-12"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity=".75"
          />
          <circle cx="32" cy="44" r="14" fill="url(#mt)" />
        </svg>
      );

    case 'jetpack':
      return (
        <svg className={className} viewBox="0 0 64 64">
          <path
            d="M14 10h22v24l16 8c4 2 4 8 0 10H12c-3 0-4-2-4-5V20c0-5 3-10 6-10z"
            fill="#4a4f5c"
            stroke="#23262e"
            strokeWidth="2"
          />
          <rect x="14" y="22" width="14" height="6" rx="2" fill="#aab2c4" />
          <path
            d="M34 6l-10 18h8l-6 18 16-24h-9z"
            fill="#5fd8ff"
            stroke="#e9fbff"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'spiky_ball':
      return (
        <svg className={className} viewBox="0 0 64 64">
          <g fill="#2b2e38" stroke="#12141a" strokeWidth="1.5">
            <path d="M32 2l6 14h-12z" />
            <path d="M32 62l-6-14h12z" />
            <path d="M2 32l14-6v12z" />
            <path d="M62 32l-14 6V26z" />
            <path d="M10 10l15 7-8 8z" />
            <path d="M54 54l-15-7 8-8z" />
            <path d="M54 10l-7 15-8-8z" />
            <path d="M10 54l7-15 8 8z" />
          </g>
          <circle cx="32" cy="32" r="14" fill="#b9c0cf" stroke="#12141a" strokeWidth="2" />
          <circle cx="27" cy="27" r="4" fill="#fff" opacity=".7" />
        </svg>
      );

    case 'shield_barrier':
    default:
      return (
        <svg className={className} viewBox="0 0 64 64">
          <ellipse cx="32" cy="34" rx="20" ry="25" fill="#f2b92e" stroke="#9a6a08" strokeWidth="2" />
          <ellipse cx="32" cy="34" rx="15" ry="20" fill="#bdeaff" />
          <path
            d="M22 24c3-5 9-8 14-8"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity=".85"
          />
          <circle cx="32" cy="9" r="5" fill="#5fd8ff" stroke="#9a6a08" strokeWidth="2" />
        </svg>
      );
  }
});

AbilityIcon.displayName = 'AbilityIcon';
