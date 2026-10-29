/**
 * PassTicketGraphic.tsx - Scalloped Vector Pass Ticket Component in TSX
 * Designed from inspiration image_583b46bf.png with ticket notches, inner rounded frame,
 * perforated stub lines, star emblem, and custom theme colors:
 * - VIP Pass: Red Theme
 * - Mecha Mugen Pass: Yellow Theme
 * - Nu Pass: Navy Blue Theme
 */

import React from 'react';
import { MugenPassId } from './mugenPassStore';

interface PassTicketGraphicProps {
  passId: MugenPassId;
  multiplierText: string;
  passName?: string;
  badgeLabel?: string;
  className?: string;
  isEquipped?: boolean;
}

interface ThemeConfig {
  bgOuter: string;
  bgInner: string;
  strokeOuter: string;
  strokeInner: string;
  starColor: string;
  textColor: string;
  dashedLineColor: string;
  badgeBg: string;
  badgeText: string;
}

const TICKET_THEMES: Record<MugenPassId, ThemeConfig> = {
  // VIP Pass: Red Color (Inspired by attached image top ticket)
  vip_pass: {
    bgOuter: '#dc2626', // Vibrant Red
    bgInner: '#be123c', // Deep Crimson
    strokeOuter: '#881337', // Dark Maroon Stroke
    strokeInner: '#9f1239',
    starColor: '#fde047', // Glowing Yellow Star
    textColor: '#ffffff',
    dashedLineColor: '#fda4af',
    badgeBg: '#fde047',
    badgeText: '#000000',
  },
  // Mecha Mugen Pass: Yellow Color (Inspired by attached image front ticket)
  mecha_pass: {
    bgOuter: '#f59e0b', // Vibrant Gold/Yellow
    bgInner: '#d97706', // Warm Amber
    strokeOuter: '#78350f', // Deep Amber Stroke
    strokeInner: '#b45309',
    starColor: '#ffffff', // Crisp White Star
    textColor: '#ffffff',
    dashedLineColor: '#fef08a',
    badgeBg: '#1e293b',
    badgeText: '#f59e0b',
  },
  // Nu Pass: Navy Blue Color
  nu_pass: {
    bgOuter: '#1e3a8a', // Deep Navy Blue
    bgInner: '#1e40af', // Royal Blue
    strokeOuter: '#0f172a', // Dark Midnight Stroke
    strokeInner: '#1d4ed8',
    starColor: '#38bdf8', // Sky Blue Star
    textColor: '#ffffff',
    dashedLineColor: '#93c5fd',
    badgeBg: '#38bdf8',
    badgeText: '#0f172a',
  },
};

export const PassTicketGraphic: React.FC<PassTicketGraphicProps> = ({
  passId,
  multiplierText,
  passName,
  badgeLabel,
  className = 'w-full h-auto',
  isEquipped = false,
}) => {
  const theme = TICKET_THEMES[passId] || TICKET_THEMES.nu_pass;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-[1.02]"
      >
        {/* Outer Shadow / Outline Frame */}
        <path
          d="M 20 10 
             H 300 
             A 10 10 0 0 1 310 20 
             V 45 
             A 12 12 0 0 0 310 69 
             V 91 
             A 12 12 0 0 0 310 115 
             V 140 
             A 10 10 0 0 1 300 150 
             H 20 
             A 10 10 0 0 1 10 140 
             V 115 
             A 12 12 0 0 0 10 91 
             V 69 
             A 12 12 0 0 0 10 45 
             V 20 
             A 10 10 0 0 1 20 10 Z"
          fill={theme.bgOuter}
          stroke={theme.strokeOuter}
          strokeWidth="4"
        />

        {/* Inner Ticket Container Frame */}
        <path
          d="M 28 20 
             H 292 
             A 6 6 0 0 1 298 26 
             V 48 
             A 10 10 0 0 0 298 68 
             V 92 
             A 10 10 0 0 0 298 112 
             V 134 
             A 6 6 0 0 1 292 140 
             H 28 
             A 6 6 0 0 1 22 134 
             V 112 
             A 10 10 0 0 0 22 92 
             V 68 
             A 10 10 0 0 0 22 48 
             V 26 
             A 6 6 0 0 1 28 20 Z"
          fill={theme.bgInner}
          stroke={theme.strokeInner}
          strokeWidth="3"
        />

        {/* Inner Inset Border Frame */}
        <rect
          x="32"
          y="26"
          width="216"
          height="108"
          rx="10"
          fill="none"
          stroke={theme.strokeOuter}
          strokeWidth="2.5"
          opacity="0.6"
        />

        {/* Vertical Perforated Stub Divider Line */}
        <line
          x1="248"
          y1="22"
          x2="248"
          y2="138"
          stroke={theme.dashedLineColor}
          strokeWidth="3"
          strokeDasharray="5 5"
          opacity="0.8"
        />

        {/* Right Stub Area Background Glow */}
        <rect
          x="254"
          y="26"
          width="40"
          height="108"
          rx="6"
          fill={theme.bgOuter}
          opacity="0.4"
        />

        {/* Large Central Star Symbol (Inspired by image_583b46bf.png) */}
        <path
          d="M 140 40 
             L 146 58 
             L 165 58 
             L 150 70 
             L 156 88 
             L 140 76 
             L 124 88 
             L 130 70 
             L 115 58 
             L 134 58 Z"
          fill={theme.starColor}
          opacity="0.3"
        />

        {/* Multiplier Main Text */}
        <text
          x="140"
          y="92"
          fill={theme.textColor}
          fontSize="42"
          fontWeight="900"
          fontFamily="monospace, sans-serif"
          textAnchor="middle"
          filter="drop-shadow(0px 3px 2px rgba(0,0,0,0.6))"
        >
          {multiplierText}
        </text>

        {/* Subtitle Text below Multiplier */}
        <text
          x="140"
          y="114"
          fill="#ffffff"
          fontSize="11"
          fontWeight="800"
          fontFamily="monospace, sans-serif"
          letterSpacing="1.5"
          textAnchor="middle"
          opacity="0.95"
        >
          TROPHY MULTIPLIER
        </text>

        {/* Top Badge Label */}
        {badgeLabel && (
          <g>
            <rect
              x="85"
              y="28"
              width="110"
              height="18"
              rx="4"
              fill={theme.badgeBg}
            />
            <text
              x="140"
              y="41"
              fill={theme.badgeText}
              fontSize="9"
              fontWeight="900"
              fontFamily="sans-serif"
              letterSpacing="1"
              textAnchor="middle"
            >
              {badgeLabel.toUpperCase()}
            </text>
          </g>
        )}

        {/* Right Stub Area Content */}
        {/* Small Stub Star 1 */}
        <path
          d="M 274 45 
             L 276.5 52 
             L 284 52 
             L 278 56.5 
             L 280.5 64 
             L 274 59 
             L 267.5 64 
             L 270 56.5 
             L 264 52 
             L 271.5 52 Z"
          fill={theme.starColor}
        />

        {/* Small Stub Star 2 */}
        <path
          d="M 274 95 
             L 276.5 102 
             L 284 102 
             L 278 106.5 
             L 280.5 114 
             L 274 109 
             L 267.5 114 
             L 270 106.5 
             L 264 102 
             L 271.5 102 Z"
          fill={theme.starColor}
        />

        {/* Equipped Active Stamp Banner if active */}
        {isEquipped && (
          <g>
            <rect
              x="38"
              y="118"
              width="204"
              height="18"
              rx="3"
              fill="#10b981"
            />
            <text
              x="140"
              y="131"
              fill="#ffffff"
              fontSize="10"
              fontWeight="900"
              fontFamily="sans-serif"
              letterSpacing="1.5"
              textAnchor="middle"
            >
              EQUIPPED & ACTIVE
            </text>
          </g>
        )}
      </svg>

      {passName && (
        <span className="mt-2 text-xs font-mono font-black uppercase tracking-wider text-slate-300">
          {passName}
        </span>
      )}
    </div>
  );
};
