import React, { useState, useEffect } from 'react';
import { getShrineTheme, subscribeShrineTheme, ShrineTheme } from '../art/shrineThemeStore';

interface ShrineStructureProps {
  owner: 'player' | 'enemy' | 'neutral';
  captureProgress?: number;
  contested?: boolean;
  size?: number;
}

// ── THEME 1 (Classic Grand Temple) ──────────────────────────────────────────
const OWNER_GLOW_1: Record<string, string> = {
  player: '#3b82f6', // Sapphire Blue
  enemy: '#ef4444',  // Crimson Red
  neutral: '#f97316', // Radiant Orange
};

const ROOF_THEMES_1 = {
  player: {
    main: '#2563eb',
    highlight: '#60a5fa',
    shadow: '#1e3a8a',
    eave: '#d97706',
    base: '#334155',
    pillars: '#78350f',
    spire: '#d97706',
  },
  enemy: {
    main: '#b91c1c',
    highlight: '#f87171',
    shadow: '#450a0a',
    eave: '#92400e',
    base: '#1e1b4b',
    pillars: '#450a0a',
    spire: '#dc2626',
  },
  neutral: {
    main: '#ea580c',
    highlight: '#fb923c',
    shadow: '#7c2d12',
    eave: '#b45309',
    base: '#374151',
    pillars: '#78350f',
    spire: '#f59e0b',
  },
};

const ShrineTheme1: React.FC<ShrineStructureProps> = ({
  owner = 'neutral',
  size = 52,
}) => {
  const s = size * 1.4;
  const cx = s / 2;

  const glowColor = OWNER_GLOW_1[owner];
  const theme = ROOF_THEMES_1[owner] || ROOF_THEMES_1.neutral;

  const tooth = (x: number, y: number, len: number, fill: string) => (
    <path
      d={`M${x - 0.5} ${y} Q${x - 0.25} ${y + len * 0.7} ${x} ${y + len} Q${x + 0.25} ${y + len * 0.7} ${x + 0.5} ${y} Q${x} ${y - 0.15} ${x - 0.5} ${y} Z`}
      fill={fill}
      stroke="#1e293b"
      strokeWidth="0.2"
    />
  );

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <filter id="shrine-glow-1" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="shrine-shadow-1" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.8" floodColor="#00000080" />
        </filter>
      </defs>

      <polygon
        points={`${cx - 11},${s * 0.77} ${cx - 14},${s * 0.82} ${cx - 11},${s * 0.87} ${cx + 11},${s * 0.87} ${cx + 14},${s * 0.82} ${cx + 11},${s * 0.77}`}
        fill={theme.base}
        stroke="#1e293b"
        strokeWidth="0.9"
        filter="url(#shrine-shadow-1)"
      />
      <polygon
        points={`${cx - 8},${s * 0.785} ${cx - 10},${s * 0.82} ${cx - 8},${s * 0.855} ${cx + 8},${s * 0.855} ${cx + 10},${s * 0.82} ${cx + 8},${s * 0.785}`}
        fill={theme.highlight}
        stroke="none"
        opacity="0.3"
      />

      {[
        { x: cx - 9, y1: s * 0.55, y2: s * 0.78 },
        { x: cx, y1: s * 0.55, y2: s * 0.78 },
        { x: cx + 9, y1: s * 0.55, y2: s * 0.78 },
        { x: cx - 5, y1: s * 0.55, y2: s * 0.76 },
        { x: cx + 5, y1: s * 0.55, y2: s * 0.76 },
      ].map((p, i) => (
        <g key={i}>
          <rect x={p.x - 1.2} y={p.y1} width={2.4} height={p.y2 - p.y1} fill={theme.pillars} rx="0.6" />
          <rect x={p.x - 1.8} y={p.y1 - 1} width={3.6} height={1.5} fill={theme.eave} rx="0.4" />
          <ellipse cx={p.x} cy={p.y2 + 0.5} rx={2} ry={0.8} fill={theme.base} />
        </g>
      ))}

      <rect x={cx - 13} y={s * 0.465} width={26} height={5} fill="#451a03" rx="0.5" />
      {[-8, -3, 2, 7].map((ox, i) => (
        <line key={i} x1={cx + ox} y1={s * 0.465} x2={cx + ox} y2={s * 0.515} stroke={theme.eave} strokeWidth="0.6" opacity="0.8" />
      ))}

      <path
        d={`M ${cx - 19} ${s * 0.47} Q ${cx - 22} ${s * 0.46} ${cx - 24} ${s * 0.455} L ${cx - 16} ${s * 0.44} L ${cx} ${s * 0.435} L ${cx + 16} ${s * 0.44} L ${cx + 24} ${s * 0.455} Q ${cx + 22} ${s * 0.46} ${cx + 19} ${s * 0.47} Z`}
        fill={theme.eave}
      />
      <path
        d={`M ${cx - 16} ${s * 0.44} Q ${cx - 20} ${s * 0.41} ${cx - 23} ${s * 0.395} L ${cx - 13} ${s * 0.37} L ${cx} ${s * 0.36} L ${cx + 13} ${s * 0.37} L ${cx + 23} ${s * 0.395} Q ${cx + 20} ${s * 0.41} ${cx + 16} ${s * 0.44} Z`}
        fill={theme.main}
        filter="url(#shrine-shadow-1)"
      />

      <rect x={cx - 10} y={s * 0.29} width={20} height={s * 0.075} fill="#451a03" rx="0.5" />
      <path
        d={`M ${cx - 13} ${s * 0.295} Q ${cx - 16} ${s * 0.285} ${cx - 18} ${s * 0.275} L ${cx - 11} ${s * 0.255} L ${cx} ${s * 0.25} L ${cx + 11} ${s * 0.255} L ${cx + 18} ${s * 0.275} Q ${cx + 16} ${s * 0.285} ${cx + 13} ${s * 0.295} Z`}
        fill={theme.eave}
      />
      <path
        d={`M ${cx - 11} ${s * 0.255} Q ${cx - 15} ${s * 0.23} ${cx - 17} ${s * 0.215} L ${cx - 8} ${s * 0.195} L ${cx} ${s * 0.185} L ${cx + 8} ${s * 0.195} L ${cx + 17} ${s * 0.215} Q ${cx + 15} ${s * 0.23} ${cx + 11} ${s * 0.255} Z`}
        fill={theme.main}
        filter="url(#shrine-shadow-1)"
      />

      <ellipse cx={cx} cy={s * 0.185} rx={3} ry={1.2} fill={theme.spire} />
      <line x1={cx} y1={s * 0.185} x2={cx} y2={s * 0.065} stroke={theme.spire} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx={cx} cy={s * 0.062} r={1.3} fill={theme.spire} filter="url(#shrine-shadow-1)" />

      <ellipse cx={cx} cy={s * 0.83} rx={15} ry={4.5} fill={glowColor} opacity={owner === 'neutral' ? 0.15 : 0.3} filter="url(#shrine-glow-1)" />
    </svg>
  );
};

// ── THEME 2 (Ornate Pagoda Spire - User Attachment) ─────────────────────────
const OWNER_GLOW_2: Record<string, string> = {
  player:  '#3b82f6',
  enemy:   '#ef4444',
  neutral: '#f97316',
};

const THEMES_2 = {
  player: {
    roof:       '#1a2e5a',
    roofMid:    '#1e3a8a',
    roofTick:   '#2d4fa0',
    body:       '#1d4ed8',
    bodyDark:   '#1e3a8a',
    bodySide:   '#0f1f4a',
    railing:    '#60a5fa',
    arch:       '#bfdbfe',
    panel:      '#dbeafe',
    spire:      '#1a2e5a',
    spireHi:    '#3b82f6',
    glow:       '#3b82f6',
  },
  enemy: {
    roof:       '#1a0505',
    roofMid:    '#3b0a0a',
    roofTick:   '#5a1212',
    body:       '#b91c1c',
    bodyDark:   '#7f1d1d',
    bodySide:   '#3b0a0a',
    railing:    '#fca5a5',
    arch:       '#fee2e2',
    panel:      '#fef2f2',
    spire:      '#1a0505',
    spireHi:    '#dc2626',
    glow:       '#ef4444',
  },
  neutral: {
    roof:       '#1c0f06',
    roofMid:    '#2d1a0a',
    roofTick:   '#5a3820',
    body:       '#c2410c',
    bodyDark:   '#7c2d12',
    bodySide:   '#3d1508',
    railing:    '#d97706',
    arch:       '#fef3c7',
    panel:      '#fde68a',
    spire:      '#1c0f06',
    spireHi:    '#78350f',
    glow:       '#f97316',
  },
};

const ShrineTheme2: React.FC<ShrineStructureProps> = ({
  owner = 'neutral',
  size = 52,
}) => {
  const s  = size * 1.4;
  const cx = s / 2;
  const th = THEMES_2[owner] || THEMES_2.neutral;
  const gl = OWNER_GLOW_2[owner];

  function roofPath(
    ridgeY: number, rHW: number,
    eaveY: number,  eHW: number,
    tipCurl: number,
  ): string {
    const midX   = eHW * 0.6;
    const midY   = eaveY - (eaveY - ridgeY) * 0.18;
    const tipX   = eHW + eHW * 0.12;
    const tipY   = eaveY - tipCurl;
    const curlCX = eHW + eHW * 0.06;
    const curlCY = eaveY + tipCurl * 0.35;

    return [
      `M ${cx - rHW} ${ridgeY}`,
      `L ${cx + rHW} ${ridgeY}`,
      `C ${cx + rHW + 2} ${ridgeY + 2},`,
      `  ${cx + midX} ${midY},`,
      `  ${cx + eHW} ${eaveY}`,
      `Q ${cx + curlCX} ${curlCY} ${cx + tipX} ${tipY}`,
      `L ${cx + eHW * 0.85} ${eaveY + 1.5}`,
      `C ${cx + midX * 0.9} ${midY + 3},`,
      `  ${cx + rHW * 1.2} ${ridgeY + 5},`,
      `  ${cx} ${ridgeY + 4}`,
      `C ${cx - rHW * 1.2} ${ridgeY + 5},`,
      `  ${cx - midX * 0.9} ${midY + 3},`,
      `  ${cx - eHW * 0.85} ${eaveY + 1.5}`,
      `L ${cx - eHW} ${eaveY}`,
      `Q ${cx - curlCX} ${curlCY} ${cx - tipX} ${tipY}`,
      `C ${cx - midX} ${midY},`,
      `  ${cx - rHW - 2} ${ridgeY + 2},`,
      `  ${cx - rHW} ${ridgeY}`,
      `Z`,
    ].join(' ');
  }

  function soffitPath(
    eaveY: number, eHW: number, tipCurl: number, thickness: number,
  ): string {
    const tipX  = eHW + eHW * 0.12;
    const tipY  = eaveY - tipCurl;
    const curlCX = eHW + eHW * 0.06;
    const curlCY = eaveY + tipCurl * 0.35;
    return [
      `M ${cx - eHW} ${eaveY}`,
      `Q ${cx - curlCX} ${curlCY} ${cx - tipX} ${tipY}`,
      `L ${cx - tipX + 1} ${tipY + thickness}`,
      `Q ${cx - curlCX + 0.5} ${curlCY + thickness * 0.7}`,
      `  ${cx - eHW + 1} ${eaveY + thickness}`,
      `L ${cx + eHW - 1} ${eaveY + thickness}`,
      `Q ${cx + curlCX - 0.5} ${curlCY + thickness * 0.7}`,
      `  ${cx + tipX - 1} ${tipY + thickness}`,
      `L ${cx + tipX} ${tipY}`,
      `Q ${cx + curlCX} ${curlCY} ${cx + eHW} ${eaveY}`,
      `Z`,
    ].join(' ');
  }

  function bodyPath(
    topY: number, topHW: number,
    botY: number, botHW: number,
  ): string {
    const midY = (topY + botY) / 2;
    return [
      `M ${cx - topHW} ${topY}`,
      `L ${cx + topHW} ${topY}`,
      `C ${cx + topHW + 1} ${midY} ${cx + botHW + 1} ${midY} ${cx + botHW} ${botY}`,
      `L ${cx - botHW} ${botY}`,
      `C ${cx - botHW - 1} ${midY} ${cx - topHW - 1} ${midY} ${cx - topHW} ${topY}`,
      `Z`,
    ].join(' ');
  }

  function ArchWindow({
    x, y, w, h, fill,
  }: { x: number; y: number; w: number; h: number; fill: string }) {
    const rx = w / 2;
    const archH = w * 0.6;
    return (
      <path
        d={[
          `M ${x} ${y + h}`,
          `L ${x} ${y + archH}`,
          `A ${rx} ${archH} 0 0 1 ${x + w} ${y + archH}`,
          `L ${x + w} ${y + h}`,
          `Z`,
        ].join(' ')}
        fill={fill}
      />
    );
  }

  function Railing({
    x, y, w, color, posts = 9, h = 4,
  }: { x: number; y: number; w: number; color: string; posts?: number; h?: number }) {
    return (
      <g>
        <path d={`M ${x} ${y} Q ${x + w / 2} ${y - 0.8} ${x + w} ${y}`} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        <path d={`M ${x} ${y + h} Q ${x + w / 2} ${y + h - 0.8} ${x + w} ${y + h}`} fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
        {Array.from({ length: posts + 1 }).map((_, i) => {
          const bx = x + (i * w) / posts;
          return <line key={i} x1={bx} y1={y} x2={bx} y2={y + h} stroke={color} strokeWidth="1" />;
        })}
      </g>
    );
  }

// ── TUNED VERTICAL METRICS FOR TALLER WALLS (FIXED TRACKING) ─────────────────────────
  const spTop   = s * 0.0342;
  const spBase  = s * 0.189;
  
  // Tier 3 Roof (Top)
  const r3RidgeY = s * 0.1908;
  const r3RHW    = s * 0.055;
  const r3EaveY  = s * 0.2358;
  const r3EHW    = s * 0.235;
  const r3Curl   = s * 0.028;

  // Tier 3 Body (Top Floor) - Elongated wall segment
  const b3Top    = s * 0.2385;
  const b3Bot    = s * 0.3825; 
  const b3TWH    = s * 0.148;
  const b3BWH    = s * 0.158;

  // Tier 2 Roof (Middle)
  const r2RidgeY = s * 0.3852;   
  const r2RHW    = s * 0.065;
  const r2EaveY  = s * 0.4365; 
  const r2EHW    = s * 0.305;
  const r2Curl   = s * 0.032;

  // Tier 2 Body (Middle Floor) - Elongated wall segment
  const b2Top    = s * 0.4392; 
  const b2Bot    = s * 0.6192; 
  const b2TWH    = s * 0.198;
  const b2BWH    = s * 0.212;

  // Tier 1 Roof (Bottom)
  const r1RidgeY = s * 0.6228; 
  const r1RHW    = s * 0.072;
  const r1EaveY  = s * 0.6795; 
  const r1EHW    = s * 0.375;
  const r1Curl   = s * 0.038;

  // Tier 1 Body (Bottom Floor) - Elongated wall segment
  const b1Top    = s * 0.6822; 
  const b1Bot    = s * 0.9225; 
  const b1TWH    = s * 0.255;
  const b1BWH    = s * 0.272;

  // Base Pedestal
  const basTop   = s * 0.9225; 
  const basBot   = s * 0.9765; 
  const basHW    = s * 0.292;


  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <filter id="sh-glow-2" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sh-drop-2" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.8" floodColor="#00000080" />
        </filter>
        <filter id="sh-soft-2" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#00000050" />
        </filter>
      </defs>

      <path d={bodyPath(basTop, basHW * 1.02, basBot, basHW)} fill={th.bodyDark} filter="url(#sh-soft-2)" />
      <rect x={cx - basHW + 1} y={basTop} width={basHW * 2 - 2} height={1.4} fill={th.body} opacity="0.35" />
      <Railing x={cx - basHW - 1} y={basTop - 5.5} w={basHW * 2 + 2} color={th.railing} posts={12} h={5} />

      <path d={bodyPath(b1Top, b1TWH, b1Bot, b1BWH)} fill={th.body} />
      {([-0.58, -0.195, 0.195, 0.58] as number[]).map((f, i) => {
        const pw  = b1BWH * 0.28;
        const ph  = (b1Bot - b1Top) * 0.68;
        const px  = cx + f * b1BWH * 0.82;
        const py  = b1Top + (b1Bot - b1Top) * 0.18;
        return <rect key={i} x={px - pw / 2} y={py} width={pw} height={ph} fill={th.panel} rx="1" opacity="0.85" />;
      })}

      <path d={soffitPath(r1EaveY, r1EHW, r1Curl, 3.5)} fill={th.roofMid} opacity="0.85" />
      <path d={roofPath(r1RidgeY, r1RHW, r1EaveY, r1EHW, r1Curl)} fill={th.roof} filter="url(#sh-drop-2)" />

      <path d={bodyPath(b2Top, b2TWH, b2Bot, b2BWH)} fill={th.body} />
      <path d={bodyPath(b2Top, b2TWH, b2Top + (b2Bot - b2Top) * 0.22, b2TWH * 1.02)} fill={th.bodyDark} opacity="0.7" />
      {Array.from({ length: 5 }).map((_, i) => {
        const totalW = b2BWH * 1.5;
        const aw     = totalW / 5 * 0.72;
        const ah     = (b2Bot - b2Top) * 0.52;
        const ax     = cx - totalW / 2 + (i + 0.5) * (totalW / 5) - aw / 2;
        const ay     = b2Top + (b2Bot - b2Top) * 0.3;
        return <ArchWindow key={i} x={ax} y={ay} w={aw} h={ah} fill={th.arch} />;
      })}
      <Railing x={cx - b2BWH - 1} y={b2Bot - 5} w={b2BWH * 2 + 2} color={th.railing} posts={10} h={4.5} />

      <path d={soffitPath(r2EaveY, r2EHW, r2Curl, 3)} fill={th.roofMid} opacity="0.85" />
      <path d={roofPath(r2RidgeY, r2RHW, r2EaveY, r2EHW, r2Curl)} fill={th.roof} filter="url(#sh-drop-2)" />

      <path d={bodyPath(b3Top, b3TWH, b3Bot, b3BWH)} fill={th.body} />
      <path d={bodyPath(b3Top, b3TWH, b3Top + (b3Bot - b3Top) * 0.24, b3TWH * 1.01)} fill={th.bodyDark} opacity="0.65" />
      {Array.from({ length: 4 }).map((_, i) => {
        const totalW = b3BWH * 1.5;
        const aw     = totalW / 4 * 0.7;
        const ah     = (b3Bot - b3Top) * 0.52;
        const ax     = cx - totalW / 2 + (i + 0.5) * (totalW / 4) - aw / 2;
        const ay     = b3Top + (b3Bot - b3Top) * 0.3;
        return <ArchWindow key={i} x={ax} y={ay} w={aw} h={ah} fill={th.arch} />;
      })}
      <Railing x={cx - b3BWH - 1} y={b3Bot - 4.5} w={b3BWH * 2 + 2} color={th.railing} posts={8} h={4} />

      <path d={soffitPath(r3EaveY, r3EHW, r3Curl, 2.5)} fill={th.roofMid} opacity="0.85" />
      <path d={roofPath(r3RidgeY, r3RHW, r3EaveY, r3EHW, r3Curl)} fill={th.roof} filter="url(#sh-drop-2)" />

      <ellipse cx={cx} cy={spBase} rx={s * 0.04} ry={s * 0.018} fill={th.spire} />
      <line x1={cx} y1={spBase - 1} x2={cx} y2={spTop + s * 0.018} stroke={th.spire} strokeWidth={s * 0.018} strokeLinecap="round" />
      {Array.from({ length: 9 }).map((_, i) => {
        const prog = i / 8;
        const ry_y = spBase - prog * (spBase - spTop) * 0.94;
        const rx   = s * (0.038 - prog * 0.026);
        const rh   = s * (0.016 - prog * 0.009);
        return (
          <g key={i}>
            <ellipse cx={cx} cy={ry_y} rx={rx} ry={rh} fill={th.spire} />
            <ellipse cx={cx} cy={ry_y - rh * 0.35} rx={rx * 0.62} ry={rh * 0.38} fill={th.spireHi} opacity="0.45" />
          </g>
        );
      })}
      <line x1={cx} y1={spTop} x2={cx} y2={spTop - s * 0.032} stroke={th.spire} strokeWidth="1.2" strokeLinecap="round" />

      <ellipse cx={cx} cy={basBot + 2} rx={basHW * 0.82} ry={s * 0.028} fill={gl} opacity={owner === 'neutral' ? 0.15 : 0.28} filter="url(#sh-glow-2)" />
    </svg>
  );
};

export const ShrineStructure: React.FC<ShrineStructureProps> = (props) => {
  const [activeTheme, setActiveTheme] = useState<ShrineTheme>(() => getShrineTheme());

  useEffect(() => {
    return subscribeShrineTheme(() => {
      setActiveTheme(getShrineTheme());
    });
  }, []);

  if (activeTheme === 'theme2') {
    return <ShrineTheme2 {...props} />;
  }

  return <ShrineTheme1 {...props} />;
};

export default ShrineStructure;
