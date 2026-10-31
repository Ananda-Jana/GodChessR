import React from 'react';

interface ShrineStructureProps {
  owner: 'player' | 'enemy' | 'neutral';
  captureProgress?: number; // 0–100
  contested?: boolean;
  size?: number; // cell size in px, default 52
}

const OWNER_GLOW: Record<string, string> = {
  player: '#3b82f6', // Sapphire Blue
  enemy: '#ef4444',  // Crimson Red
  neutral: '#f97316', // Radiant Orange
};

const ROOF_THEMES = {
  player: {
    main: '#2563eb',   // Royal blue roof
    highlight: '#60a5fa',
    shadow: '#1e3a8a',
    eave: '#d97706',   // Gold/terracotta trim
    base: '#334155',   // Slate base
    pillars: '#78350f',// Cedar wood pillars
    spire: '#d97706',  // Gilded finial
  },
  enemy: {
    main: '#b91c1c',   // Crimson ruby roof
    highlight: '#f87171',
    shadow: '#450a0a',
    eave: '#92400e',
    base: '#1e1b4b',
    pillars: '#450a0a',
    spire: '#dc2626',
  },
  neutral: {
    main: '#ea580c',   // Warm amber orange roof
    highlight: '#fb923c',
    shadow: '#7c2d12',
    eave: '#b45309',
    base: '#374151',
    pillars: '#78350f',
    spire: '#f59e0b',
  },
};

export const ShrineStructure: React.FC<ShrineStructureProps> = ({
  owner = 'neutral',
  captureProgress = 0,
  contested = false,
  size = 52,
}) => {
  const s = size;
  const cx = s / 2;

  const glowColor = OWNER_GLOW[owner];
  const theme = ROOF_THEMES[owner] || ROOF_THEMES.neutral;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <filter id="shrine-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="shrine-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.8" floodColor="#00000080" />
        </filter>
      </defs>

      {/* NO CIRCLE AROUND SHRINE - Pure architectural pagoda structure */}

      {/* ── HEXAGONAL BASE PLATFORM (Stone terrace) ── */}
      <polygon
        points={`
          ${cx - 11},${s * 0.77}
          ${cx - 14},${s * 0.82}
          ${cx - 11},${s * 0.87}
          ${cx + 11},${s * 0.87}
          ${cx + 14},${s * 0.82}
          ${cx + 11},${s * 0.77}
        `}
        fill={theme.base}
        stroke="#1e293b"
        strokeWidth="0.9"
        filter="url(#shrine-shadow)"
      />
      {/* inner hex highlight */}
      <polygon
        points={`
          ${cx - 8},${s * 0.785}
          ${cx - 10},${s * 0.82}
          ${cx - 8},${s * 0.855}
          ${cx + 8},${s * 0.855}
          ${cx + 10},${s * 0.82}
          ${cx + 8},${s * 0.785}
        `}
        fill={theme.highlight}
        stroke="none"
        opacity="0.3"
      />

      {/* ── PILLARS ── */}
      {[
        { x: cx - 9,  y1: s * 0.55, y2: s * 0.78 },
        { x: cx,      y1: s * 0.55, y2: s * 0.78 },
        { x: cx + 9,  y1: s * 0.55, y2: s * 0.78 },
        { x: cx - 5,  y1: s * 0.55, y2: s * 0.76 },
        { x: cx + 5,  y1: s * 0.55, y2: s * 0.76 },
      ].map((p, i) => (
        <g key={i}>
          {/* pillar shaft */}
          <rect
            x={p.x - 1.2}
            y={p.y1}
            width={2.4}
            height={p.y2 - p.y1}
            fill={theme.pillars}
            rx="0.6"
          />
          {/* pillar cap */}
          <rect
            x={p.x - 1.8}
            y={p.y1 - 1}
            width={3.6}
            height={1.5}
            fill={theme.eave}
            rx="0.4"
          />
          {/* pillar base */}
          <ellipse
            cx={p.x}
            cy={p.y2 + 0.5}
            rx={2}
            ry={0.8}
            fill={theme.base}
          />
        </g>
      ))}

      {/* ── LATTICE / DECORATIVE BAND (between tiers) ── */}
      <rect
        x={cx - 13}
        y={s * 0.465}
        width={26}
        height={5}
        fill="#451a03"
        rx="0.5"
      />
      {[-8, -3, 2, 7].map((ox, i) => (
        <line
          key={i}
          x1={cx + ox} y1={s * 0.465}
          x2={cx + ox} y2={s * 0.515}
          stroke={theme.eave}
          strokeWidth="0.6"
          opacity="0.8"
        />
      ))}
      {[s * 0.477, s * 0.490, s * 0.503].map((oy, i) => (
        <line
          key={i}
          x1={cx - 13} y1={oy}
          x2={cx + 13} y2={oy}
          stroke={theme.eave}
          strokeWidth="0.5"
          opacity="0.6"
        />
      ))}

      {/* ── LOWER ROOF TIER (BLUE / ORANGE / RED - NOT GREEN) ── */}
      {/* eave underside (terracotta / bronze trim) */}
      <path
        d={`
          M ${cx - 19} ${s * 0.47}
          Q ${cx - 22} ${s * 0.46} ${cx - 24} ${s * 0.455}
          L ${cx - 16} ${s * 0.44}
          L ${cx} ${s * 0.435}
          L ${cx + 16} ${s * 0.44}
          L ${cx + 24} ${s * 0.455}
          Q ${cx + 22} ${s * 0.46} ${cx + 19} ${s * 0.47}
          Z
        `}
        fill={theme.eave}
      />
      {/* main lower roof surface */}
      <path
        d={`
          M ${cx - 16} ${s * 0.44}
          Q ${cx - 20} ${s * 0.41} ${cx - 23} ${s * 0.395}
          L ${cx - 13} ${s * 0.37}
          L ${cx} ${s * 0.36}
          L ${cx + 13} ${s * 0.37}
          L ${cx + 23} ${s * 0.395}
          Q ${cx + 20} ${s * 0.41} ${cx + 16} ${s * 0.44}
          Z
        `}
        fill={theme.main}
        filter="url(#shrine-shadow)"
      />
      {/* roof tile ridge lines */}
      {[-10, -5, 0, 5, 10].map((ox, i) => (
        <line
          key={i}
          x1={cx + ox * 0.6} y1={s * 0.365}
          x2={cx + ox} y2={s * 0.44}
          stroke={theme.highlight}
          strokeWidth="0.6"
          opacity="0.75"
        />
      ))}
      {/* eave tips curl up on sides */}
      <path
        d={`M ${cx - 23} ${s * 0.395} Q ${cx - 26} ${s * 0.375} ${cx - 25} ${s * 0.36}`}
        fill="none" stroke={theme.highlight} strokeWidth="1.2"
      />
      <path
        d={`M ${cx + 23} ${s * 0.395} Q ${cx + 26} ${s * 0.375} ${cx + 25} ${s * 0.36}`}
        fill="none" stroke={theme.highlight} strokeWidth="1.2"
      />

      {/* ── UPPER BODY (between tiers) ── */}
      <rect
        x={cx - 10}
        y={s * 0.29}
        width={20}
        height={s * 0.075}
        fill="#451a03"
        rx="0.5"
      />
      {[-5, 0, 5].map((ox, i) => (
        <line
          key={i}
          x1={cx + ox} y1={s * 0.29}
          x2={cx + ox} y2={s * 0.365}
          stroke={theme.eave}
          strokeWidth="0.5"
          opacity="0.7"
        />
      ))}

      {/* ── UPPER ROOF TIER (BLUE / ORANGE / RED - NOT GREEN) ── */}
      {/* eave underside */}
      <path
        d={`
          M ${cx - 13} ${s * 0.295}
          Q ${cx - 16} ${s * 0.285} ${cx - 18} ${s * 0.275}
          L ${cx - 11} ${s * 0.255}
          L ${cx} ${s * 0.25}
          L ${cx + 11} ${s * 0.255}
          L ${cx + 18} ${s * 0.275}
          Q ${cx + 16} ${s * 0.285} ${cx + 13} ${s * 0.295}
          Z
        `}
        fill={theme.eave}
      />
      {/* main upper roof surface */}
      <path
        d={`
          M ${cx - 11} ${s * 0.255}
          Q ${cx - 15} ${s * 0.23} ${cx - 17} ${s * 0.215}
          L ${cx - 8} ${s * 0.195}
          L ${cx} ${s * 0.185}
          L ${cx + 8} ${s * 0.195}
          L ${cx + 17} ${s * 0.215}
          Q ${cx + 15} ${s * 0.23} ${cx + 11} ${s * 0.255}
          Z
        `}
        fill={theme.main}
        filter="url(#shrine-shadow)"
      />
      {/* tile lines upper */}
      {[-6, -2, 2, 6].map((ox, i) => (
        <line
          key={i}
          x1={cx + ox * 0.6} y1={s * 0.19}
          x2={cx + ox} y2={s * 0.255}
          stroke={theme.highlight}
          strokeWidth="0.5"
          opacity="0.7"
        />
      ))}
      {/* upper eave curl tips */}
      <path
        d={`M ${cx - 17} ${s * 0.215} Q ${cx - 19} ${s * 0.2} ${cx - 18} ${s * 0.188}`}
        fill="none" stroke={theme.highlight} strokeWidth="1"
      />
      <path
        d={`M ${cx + 17} ${s * 0.215} Q ${cx + 19} ${s * 0.2} ${cx + 18} ${s * 0.188}`}
        fill="none" stroke={theme.highlight} strokeWidth="1"
      />

      {/* ── SPIRE / FINIAL (GOLD / BRONZE) ── */}
      <ellipse
        cx={cx} cy={s * 0.185}
        rx={3} ry={1.2}
        fill={theme.spire}
      />
      <line
        x1={cx} y1={s * 0.185}
        x2={cx} y2={s * 0.065}
        stroke={theme.spire}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {[0.13, 0.10, 0.08].map((yf, i) => (
        <ellipse
          key={i}
          cx={cx} cy={s * yf}
          rx={2.5 - i * 0.5}
          ry={0.9 - i * 0.15}
          fill={theme.highlight}
          stroke={theme.shadow}
          strokeWidth="0.4"
        />
      ))}
      <circle cx={cx} cy={s * 0.062} r={1.3} fill={theme.spire} filter="url(#shrine-shadow)" />

      {/* ── BASE AMBIENT GLOW ── */}
      <ellipse
        cx={cx}
        cy={s * 0.83}
        rx={15}
        ry={4.5}
        fill={glowColor}
        opacity={owner === 'neutral' ? 0.15 : 0.3}
        filter="url(#shrine-glow)"
      />
    </svg>
  );
};

export default ShrineStructure;
