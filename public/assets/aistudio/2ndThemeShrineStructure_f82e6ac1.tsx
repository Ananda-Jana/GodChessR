import React from 'react';

interface ShrineStructureProps {
  owner: 'player' | 'enemy' | 'neutral';
  captureProgress?: number;
  contested?: boolean;
  size?: number;
}

const OWNER_GLOW: Record<string, string> = {
  player:  '#3b82f6',
  enemy:   '#ef4444',
  neutral: '#f97316',
};

const THEMES = {
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
    roof:       '#1c0f06',   // very dark brown (almost black-brown)
    roofMid:    '#2d1a0a',   // slightly lighter brown
    roofTick:   '#5a3820',   // brown tick marks on roof
    body:       '#c2410c',   // orange-red body
    bodyDark:   '#7c2d12',   // dark red-brown
    bodySide:   '#3d1508',   // very dark sides
    railing:    '#d97706',   // amber gold
    arch:       '#fef3c7',   // cream arches
    panel:      '#fde68a',   // pale gold panels
    spire:      '#1c0f06',   // dark brown spire
    spireHi:    '#78350f',   // spire ring highlight
    glow:       '#f97316',
  },
};

export const ShrineStructure: React.FC<ShrineStructureProps> = ({
  owner = 'neutral',
  captureProgress = 0,
  contested = false,
  size = 52,
}) => {
  const s  = size * 1.4;
  const cx = s / 2;
  const th = THEMES[owner] || THEMES.neutral;
  const gl = OWNER_GLOW[owner];

  /*
   * ROOF PATH ANATOMY (traced from reference):
   *
   * The roof has:
   *  - A narrow flat ridge at the top center
   *  - Two slopes that curve DOWNWARD (concave when viewed from above)
   *    toward the eave edge — like a gentle bowl shape on each side
   *  - The eave edge itself sags slightly below the midpoint, then
   *    the very TIP curls back UP — the classic pagoda horn
   *  - A dark soffit visible just under the eave edge
   *
   * We use cubic beziers (C) for the main slope and a small
   * quadratic (Q) for the tip curl.
   */

  // Build one full roof path given measurements
  // ridge: y of the flat top ridge, rHW = ridge half-width
  // mid: the belly of the slope (droop point), mHW = x position
  // eave: y of the lowest eave point, eHW = x of the eave edge
  // tipCurl: how many px the tip rises above eaveY
  function roofPath(
    ridgeY: number, rHW: number,
    eaveY: number,  eHW: number,
    tipCurl: number,
  ): string {
    // The slope belly control point — curves outward and slightly down
    // then back up for the curl
    const midX   = eHW * 0.6;
    const midY   = eaveY - (eaveY - ridgeY) * 0.18; // just above eave
    const tipX   = eHW + eHW * 0.12;   // tip extends beyond eave
    const tipY   = eaveY - tipCurl;     // tip is above eave level
    const curlCX = eHW + eHW * 0.06;   // curl control x
    const curlCY = eaveY + tipCurl * 0.35; // curl control y (dips before rising)

    return [
      // ridge (flat top)
      `M ${cx - rHW} ${ridgeY}`,
      `L ${cx + rHW} ${ridgeY}`,
      // right slope: cubic bezier — sweeps out and down to eave
      `C ${cx + rHW + 2} ${ridgeY + 2},`,
      `  ${cx + midX} ${midY},`,
      `  ${cx + eHW} ${eaveY}`,
      // right tip curl: quadratic, dips slightly then rises
      `Q ${cx + curlCX} ${curlCY} ${cx + tipX} ${tipY}`,
      // back along underside — straight-ish inner return
      `L ${cx + eHW * 0.85} ${eaveY + 1.5}`,
      `C ${cx + midX * 0.9} ${midY + 3},`,
      `  ${cx + rHW * 1.2} ${ridgeY + 5},`,
      `  ${cx} ${ridgeY + 4}`,          // bottom of ridge (thick)
      `C ${cx - rHW * 1.2} ${ridgeY + 5},`,
      `  ${cx - midX * 0.9} ${midY + 3},`,
      `  ${cx - eHW * 0.85} ${eaveY + 1.5}`,
      // left tip curl
      `L ${cx - eHW} ${eaveY}`,
      `Q ${cx - curlCX} ${curlCY} ${cx - tipX} ${tipY}`,
      // left slope return
      `C ${cx - midX} ${midY},`,
      `  ${cx - rHW - 2} ${ridgeY + 2},`,
      `  ${cx - rHW} ${ridgeY}`,
      `Z`,
    ].join(' ');
  }

  // Soffit path — just the underside strip below the eave
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

  // Body shape: slightly tapered trapezoid with very subtle curved sides
  // wider at bottom, slightly narrower at top
  function bodyPath(
    topY: number, topHW: number,
    botY: number, botHW: number,
  ): string {
    // gentle S-curve on each side for warmth
    const midY = (topY + botY) / 2;
    return [
      `M ${cx - topHW} ${topY}`,
      `L ${cx + topHW} ${topY}`,
      // right side — very slight outward bow
      `C ${cx + topHW + 1} ${midY} ${cx + botHW + 1} ${midY} ${cx + botHW} ${botY}`,
      `L ${cx - botHW} ${botY}`,
      // left side
      `C ${cx - botHW - 1} ${midY} ${cx - topHW - 1} ${midY} ${cx - topHW} ${topY}`,
      `Z`,
    ].join(' ');
  }

  // Arch window: proper rounded arch shape (flat sides + semicircle top)
  function ArchWindow({
    x, y, w, h, fill,
  }: { x: number; y: number; w: number; h: number; fill: string }) {
    const rx = w / 2;
    const archH = w * 0.6; // height of the arch (semicircle)
    const rectH = h - archH;
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

  // Railing: top rail + bottom rail + vertical balusters
  // Uses curved top/bottom rails that bow slightly outward
  function Railing({
    x, y, w, color, posts = 9, h = 4,
  }: { x: number; y: number; w: number; color: string; posts?: number; h?: number }) {
    return (
      <g>
        {/* top rail */}
        <path
          d={`M ${x} ${y} Q ${x + w / 2} ${y - 0.8} ${x + w} ${y}`}
          fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round"
        />
        {/* bottom rail */}
        <path
          d={`M ${x} ${y + h} Q ${x + w / 2} ${y + h - 0.8} ${x + w} ${y + h}`}
          fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round"
        />
        {/* balusters */}
        {Array.from({ length: posts + 1 }).map((_, i) => {
          const bx = x + (i * w) / posts;
          return (
            <line key={i}
              x1={bx} y1={y}
              x2={bx} y2={y + h}
              stroke={color} strokeWidth="1"
            />
          );
        })}
      </g>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  PIXEL LAYOUT  — traced from reference image proportions
  //  All values relative to s = size * 1.4
  // ─────────────────────────────────────────────────────────────

  // SPIRE (top)
  const spTop   = s * 0.038;
  const spBase  = s * 0.21;

  // ROOF 3 (topmost roof)
  const r3RidgeY = s * 0.212;
  const r3RHW    = s * 0.055;
  const r3EaveY  = s * 0.272;
  const r3EHW    = s * 0.235;
  const r3Curl   = s * 0.028;

  // BODY 3 (between roof3 and roof2)
  const b3Top    = s * 0.275;
  const b3Bot    = s * 0.345;
  const b3TWH    = s * 0.148;   // top half-width
  const b3BWH    = s * 0.158;   // bot half-width (slightly wider)

  // ROOF 2
  const r2RidgeY = s * 0.35;
  const r2RHW    = s * 0.065;
  const r2EaveY  = s * 0.428;
  const r2EHW    = s * 0.305;
  const r2Curl   = s * 0.032;

  // BODY 2
  const b2Top    = s * 0.432;
  const b2Bot    = s * 0.528;
  const b2TWH    = s * 0.198;
  const b2BWH    = s * 0.212;

  // ROOF 1 (lowest, widest)
  const r1RidgeY = s * 0.535;
  const r1RHW    = s * 0.072;
  const r1EaveY  = s * 0.622;
  const r1EHW    = s * 0.375;
  const r1Curl   = s * 0.038;

  // BODY 1 (ground floor — tallest)
  const b1Top    = s * 0.626;
  const b1Bot    = s * 0.762;
  const b1TWH    = s * 0.255;
  const b1BWH    = s * 0.272;

  // BASE TERRACE
  const basTop   = s * 0.762;
  const basBot   = s * 0.810;
  const basHW    = s * 0.292;

  return (
    <svg
      width={s} height={s}
      viewBox={`0 0 ${s} ${s}`}
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <filter id="sh-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sh-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.8" floodColor="#00000080" />
        </filter>
        <filter id="sh-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#00000050" />
        </filter>
      </defs>

      {/* ═══════════════════════════════════════════
          BASE TERRACE  (stone platform)
      ═══════════════════════════════════════════ */}
      {/* main terrace body */}
      <path
        d={bodyPath(basTop, basHW * 1.02, basBot, basHW)}
        fill={th.bodyDark}
        filter="url(#sh-soft)"
      />
      {/* top edge highlight */}
      <rect x={cx - basHW + 1} y={basTop} width={basHW * 2 - 2} height={1.4}
        fill={th.body} opacity="0.35" />
      {/* railing at base of ground floor */}
      <Railing
        x={cx - basHW - 1} y={basTop - 5.5}
        w={basHW * 2 + 2} color={th.railing}
        posts={12} h={5}
      />

      {/* ═══════════════════════════════════════════
          BODY 1  —  GROUND FLOOR
      ═══════════════════════════════════════════ */}
      {/* main body fill */}
      <path d={bodyPath(b1Top, b1TWH, b1Bot, b1BWH)} fill={th.body} />
      {/* left dark side strip */}
      <path
        d={[
          `M ${cx - b1TWH} ${b1Top}`,
          `C ${cx - b1TWH - 1} ${(b1Top + b1Bot) / 2}`,
          `  ${cx - b1BWH - 1} ${(b1Top + b1Bot) / 2}`,
          `  ${cx - b1BWH} ${b1Bot}`,
          `L ${cx - b1BWH + b1BWH * 0.12} ${b1Bot}`,
          `C ${cx - b1BWH * 0.88} ${(b1Top + b1Bot) / 2}`,
          `  ${cx - b1TWH * 0.88} ${(b1Top + b1Bot) / 2}`,
          `  ${cx - b1TWH + b1TWH * 0.12} ${b1Top}`,
          `Z`,
        ].join(' ')}
        fill={th.bodySide}
        opacity="0.55"
      />
      {/* right dark side strip */}
      <path
        d={[
          `M ${cx + b1TWH} ${b1Top}`,
          `C ${cx + b1TWH + 1} ${(b1Top + b1Bot) / 2}`,
          `  ${cx + b1BWH + 1} ${(b1Top + b1Bot) / 2}`,
          `  ${cx + b1BWH} ${b1Bot}`,
          `L ${cx + b1BWH - b1BWH * 0.12} ${b1Bot}`,
          `C ${cx + b1BWH * 0.88} ${(b1Top + b1Bot) / 2}`,
          `  ${cx + b1TWH * 0.88} ${(b1Top + b1Bot) / 2}`,
          `  ${cx + b1TWH - b1TWH * 0.12} ${b1Top}`,
          `Z`,
        ].join(' ')}
        fill={th.bodySide}
        opacity="0.55"
      />

      {/* cream/panel vertical slots — ground floor */}
      {([-0.58, -0.195, 0.195, 0.58] as number[]).map((f, i) => {
        const pw  = b1BWH * 0.28;
        const ph  = (b1Bot - b1Top) * 0.68;
        const px  = cx + f * b1BWH * 0.82;
        const py  = b1Top + (b1Bot - b1Top) * 0.18;
        return (
          <rect key={i}
            x={px - pw / 2} y={py}
            width={pw} height={ph}
            fill={th.panel} rx="1" opacity="0.85"
          />
        );
      })}

      {/* ═══════════════════════════════════════════
          ROOF 1  —  LOWEST / WIDEST
      ═══════════════════════════════════════════ */}
      {/* dark soffit under eave */}
      <path
        d={soffitPath(r1EaveY, r1EHW, r1Curl, 3.5)}
        fill={th.roofMid}
        opacity="0.85"
      />
      {/* main roof surface */}
      <path
        d={roofPath(r1RidgeY, r1RHW, r1EaveY, r1EHW, r1Curl)}
        fill={th.roof}
        filter="url(#sh-drop)"
      />
      {/* tile dash marks on roof */}
      {([
        { fx: -0.48, fy: 0.55 }, { fx: -0.18, fy: 0.62 },
        { fx:  0.15, fy: 0.58 }, { fx:  0.46, fy: 0.52 },
      ]).map((m, i) => {
        const mx  = cx + m.fx * r1EHW;
        const my  = r1RidgeY + (r1EaveY - r1RidgeY) * m.fy;
        const ang = m.fx * -18; // slight angle
        return (
          <line key={i}
            x1={mx - 2} y1={my - 1.5}
            x2={mx + 2} y2={my + 1.5}
            stroke={th.roofTick}
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.75"
            transform={`rotate(${ang}, ${mx}, ${my})`}
          />
        );
      })}

      {/* ═══════════════════════════════════════════
          BODY 2  —  MIDDLE FLOOR
      ═══════════════════════════════════════════ */}
      <path d={bodyPath(b2Top, b2TWH, b2Bot, b2BWH)} fill={th.body} />
      {/* side shadows */}
      <path
        d={[
          `M ${cx - b2TWH} ${b2Top}`,
          `C ${cx - b2TWH - 1} ${(b2Top + b2Bot) / 2} ${cx - b2BWH - 1} ${(b2Top + b2Bot) / 2} ${cx - b2BWH} ${b2Bot}`,
          `L ${cx - b2BWH + b2BWH * 0.14} ${b2Bot}`,
          `C ${cx - b2BWH * 0.86} ${(b2Top + b2Bot) / 2} ${cx - b2TWH * 0.86} ${(b2Top + b2Bot) / 2} ${cx - b2TWH + b2TWH * 0.14} ${b2Top} Z`,
        ].join(' ')}
        fill={th.bodySide} opacity="0.55"
      />
      <path
        d={[
          `M ${cx + b2TWH} ${b2Top}`,
          `C ${cx + b2TWH + 1} ${(b2Top + b2Bot) / 2} ${cx + b2BWH + 1} ${(b2Top + b2Bot) / 2} ${cx + b2BWH} ${b2Bot}`,
          `L ${cx + b2BWH - b2BWH * 0.14} ${b2Bot}`,
          `C ${cx + b2BWH * 0.86} ${(b2Top + b2Bot) / 2} ${cx + b2TWH * 0.86} ${(b2Top + b2Bot) / 2} ${cx + b2TWH - b2TWH * 0.14} ${b2Top} Z`,
        ].join(' ')}
        fill={th.bodySide} opacity="0.55"
      />

      {/* dark header band across top of body 2 */}
      <path
        d={bodyPath(b2Top, b2TWH, b2Top + (b2Bot - b2Top) * 0.22, b2TWH * 1.02)}
        fill={th.bodyDark}
        opacity="0.7"
      />

      {/* arch windows — middle floor: 5 arches */}
      {Array.from({ length: 5 }).map((_, i) => {
        const totalW = b2BWH * 1.5;
        const aw     = totalW / 5 * 0.72;
        const ah     = (b2Bot - b2Top) * 0.52;
        const ax     = cx - totalW / 2 + (i + 0.5) * (totalW / 5) - aw / 2;
        const ay     = b2Top + (b2Bot - b2Top) * 0.3;
        return (
          <ArchWindow key={i} x={ax} y={ay} w={aw} h={ah} fill={th.arch} />
        );
      })}

      {/* railing middle floor */}
      <Railing
        x={cx - b2BWH - 1} y={b2Bot - 5}
        w={b2BWH * 2 + 2} color={th.railing}
        posts={10} h={4.5}
      />

      {/* ═══════════════════════════════════════════
          ROOF 2  —  MIDDLE
      ═══════════════════════════════════════════ */}
      <path d={soffitPath(r2EaveY, r2EHW, r2Curl, 3)} fill={th.roofMid} opacity="0.85" />
      <path
        d={roofPath(r2RidgeY, r2RHW, r2EaveY, r2EHW, r2Curl)}
        fill={th.roof}
        filter="url(#sh-drop)"
      />
      {([
        { fx: -0.44, fy: 0.52 }, { fx: -0.1, fy: 0.62 },
        { fx:  0.28, fy: 0.56 },
      ]).map((m, i) => {
        const mx = cx + m.fx * r2EHW;
        const my = r2RidgeY + (r2EaveY - r2RidgeY) * m.fy;
        return (
          <line key={i}
            x1={mx - 1.8} y1={my - 1.2}
            x2={mx + 1.8} y2={my + 1.2}
            stroke={th.roofTick} strokeWidth="1.2"
            strokeLinecap="round" opacity="0.7"
          />
        );
      })}

      {/* ═══════════════════════════════════════════
          BODY 3  —  TOP FLOOR
      ═══════════════════════════════════════════ */}
      <path d={bodyPath(b3Top, b3TWH, b3Bot, b3BWH)} fill={th.body} />
      {/* side shadows */}
      <path
        d={[
          `M ${cx - b3TWH} ${b3Top}`,
          `C ${cx - b3TWH - 0.8} ${(b3Top + b3Bot) / 2} ${cx - b3BWH - 0.8} ${(b3Top + b3Bot) / 2} ${cx - b3BWH} ${b3Bot}`,
          `L ${cx - b3BWH + b3BWH * 0.15} ${b3Bot}`,
          `C ${cx - b3BWH * 0.85} ${(b3Top + b3Bot) / 2} ${cx - b3TWH * 0.85} ${(b3Top + b3Bot) / 2} ${cx - b3TWH + b3TWH * 0.15} ${b3Top} Z`,
        ].join(' ')}
        fill={th.bodySide} opacity="0.55"
      />
      <path
        d={[
          `M ${cx + b3TWH} ${b3Top}`,
          `C ${cx + b3TWH + 0.8} ${(b3Top + b3Bot) / 2} ${cx + b3BWH + 0.8} ${(b3Top + b3Bot) / 2} ${cx + b3BWH} ${b3Bot}`,
          `L ${cx + b3BWH - b3BWH * 0.15} ${b3Bot}`,
          `C ${cx + b3BWH * 0.85} ${(b3Top + b3Bot) / 2} ${cx + b3TWH * 0.85} ${(b3Top + b3Bot) / 2} ${cx + b3TWH - b3TWH * 0.15} ${b3Top} Z`,
        ].join(' ')}
        fill={th.bodySide} opacity="0.55"
      />

      {/* dark header band top of body 3 */}
      <path
        d={bodyPath(b3Top, b3TWH, b3Top + (b3Bot - b3Top) * 0.24, b3TWH * 1.01)}
        fill={th.bodyDark} opacity="0.65"
      />

      {/* arch windows — top floor: 4 arches */}
      {Array.from({ length: 4 }).map((_, i) => {
        const totalW = b3BWH * 1.5;
        const aw     = totalW / 4 * 0.7;
        const ah     = (b3Bot - b3Top) * 0.52;
        const ax     = cx - totalW / 2 + (i + 0.5) * (totalW / 4) - aw / 2;
        const ay     = b3Top + (b3Bot - b3Top) * 0.3;
        return (
          <ArchWindow key={i} x={ax} y={ay} w={aw} h={ah} fill={th.arch} />
        );
      })}

      {/* railing top floor */}
      <Railing
        x={cx - b3BWH - 1} y={b3Bot - 4.5}
        w={b3BWH * 2 + 2} color={th.railing}
        posts={8} h={4}
      />

      {/* ═══════════════════════════════════════════
          ROOF 3  —  TOPMOST / SMALLEST
      ═══════════════════════════════════════════ */}
      <path d={soffitPath(r3EaveY, r3EHW, r3Curl, 2.5)} fill={th.roofMid} opacity="0.85" />
      <path
        d={roofPath(r3RidgeY, r3RHW, r3EaveY, r3EHW, r3Curl)}
        fill={th.roof}
        filter="url(#sh-drop)"
      />
      {([{ fx: -0.35, fy: 0.54 }, { fx: 0.22, fy: 0.60 }]).map((m, i) => {
        const mx = cx + m.fx * r3EHW;
        const my = r3RidgeY + (r3EaveY - r3RidgeY) * m.fy;
        return (
          <line key={i}
            x1={mx - 1.5} y1={my - 1}
            x2={mx + 1.5} y2={my + 1}
            stroke={th.roofTick} strokeWidth="1.1"
            strokeLinecap="round" opacity="0.65"
          />
        );
      })}

      {/* ═══════════════════════════════════════════
          SPIRE  —  segmented rings narrowing upward
      ═══════════════════════════════════════════ */}
      {/* base disc */}
      <ellipse cx={cx} cy={spBase} rx={s * 0.04} ry={s * 0.018}
        fill={th.spire} />
      {/* shaft line */}
      <line
        x1={cx} y1={spBase - 1}
        x2={cx} y2={spTop + s * 0.018}
        stroke={th.spire} strokeWidth={s * 0.018} strokeLinecap="round"
      />
      {/* rings — 9 segments, tapering */}
      {Array.from({ length: 9 }).map((_, i) => {
        const prog = i / 8;
        // rings are closer together at the top
        const ry_y = spBase - prog * (spBase - spTop) * 0.94;
        const rx   = s * (0.038 - prog * 0.026);
        const rh   = s * (0.016 - prog * 0.009);
        return (
          <g key={i}>
            {/* ring body */}
            <ellipse cx={cx} cy={ry_y} rx={rx} ry={rh}
              fill={th.spire}
            />
            {/* highlight on top of ring */}
            <ellipse cx={cx} cy={ry_y - rh * 0.35}
              rx={rx * 0.62} ry={rh * 0.38}
              fill={th.spireHi} opacity="0.45"
            />
          </g>
        );
      })}
      {/* needle tip */}
      <line
        x1={cx} y1={spTop}
        x2={cx} y2={spTop - s * 0.032}
        stroke={th.spire} strokeWidth="1.2" strokeLinecap="round"
      />

      {/* ═══════════════════════════════════════════
          AMBIENT GLOW
      ═══════════════════════════════════════════ */}
      <ellipse
        cx={cx} cy={basBot + 2}
        rx={basHW * 0.82} ry={s * 0.028}
        fill={gl}
        opacity={owner === 'neutral' ? 0.15 : 0.28}
        filter="url(#sh-glow)"
      />
    </svg>
  );
};

export default ShrineStructure;
