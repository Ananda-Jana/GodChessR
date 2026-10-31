import { CollectibleHeroCard } from '../types/cardTypes';
import { HERO_PIECE_ART, HeroPieceType } from '../art/HeroPiecex';
import { heroIdToPieceType } from '../art/heroAvatarHelper';
import { CardRarity } from '../config/rarityConfig';
import { HeroId } from '../types/heroDuelTypes';

export const CARD_WIDTH = 750;
export const CARD_HEIGHT = 1050;
export const CARD_W = 750;
export const CARD_H = 1050;

export const CARD_BACKGROUND_IMAGES: string[] = [];

export type PieceBox = { x: number; y: number; w: number; h: number };
export type PiecePalette = { main: string; light: string; shade: string };
export type PieceDrawer = (ctx: CanvasRenderingContext2D, box: PieceBox, pal: PiecePalette) => void;

/** Only the fields the design reads. CollectibleHeroCard already satisfies this. */
export interface DesignCard {
  code: string;
  heroName: string;
  heroTitle?: string;
  rarity: string;
  loreSentence?: string;
  quoteLine?: string;
  defeatedBy?: string;
  mintedAt?: number;
  paletteIndex?: number;
  backgroundIndex?: number;
  visualSeed?: number;
  japaneseWord?: { kanji?: string; romaji?: string; meaning?: string; english?: string };
  word?: { kanji?: string; romaji?: string; meaning?: string; english?: string };
}

/* ------------------------------ themes ------------------------------ */

interface Theme {
  id: string;
  frame: [string, string];   // outer frame gradient, top -> bottom
  panel: [string, string];   // inner panel gradient, top -> bottom
  accent: string;            // name tag + pills
  accentInk: string;         // text on accent
  ink: string;               // main text on the panel
  inkSoft: string;           // small labels
  bolt: string;              // lightning tint
  dark: boolean;             // dark panel (light text)
  pal: PiecePalette;         // colors offered to the piece drawer
}

const THEMES: Theme[] = [
  { id: "sunset",     frame: ["#ff3d57", "#ffb81f"], panel: ["#ffc9d2", "#fff1ee"], accent: "#ffc21a", accentInk: "#3a1400", ink: "#3b0d12", inkSoft: "#8a2a38", bolt: "#ffd23f", dark: false, pal: { main: "#e8283f", light: "#ff8a8a", shade: "#8a0f26" } },
  { id: "deepBlue",   frame: ["#0a2a9a", "#2f78ff"], panel: ["#cfdcff", "#f2f6ff"], accent: "#ffd23f", accentInk: "#1a1200", ink: "#0b1d55", inkSoft: "#3b55a8", bolt: "#7fc4ff", dark: false, pal: { main: "#1f56e0", light: "#8fb4ff", shade: "#0a2a7a" } },
  { id: "skyBlue",    frame: ["#0097ff", "#7ff0ff"], panel: ["#c9f1ff", "#f1fcff"], accent: "#0b4fb8", accentInk: "#ffffff", ink: "#06304f", inkSoft: "#2f7396", bolt: "#ffffff", dark: false, pal: { main: "#12a8ff", light: "#aee8ff", shade: "#0a6aa8" } },
  { id: "purple",     frame: ["#6a1fd0", "#f06bff"], panel: ["#e6cfff", "#faf1ff"], accent: "#ffe14a", accentInk: "#2a0a4a", ink: "#2a0a4a", inkSoft: "#7a3fb0", bolt: "#ffe9ff", dark: false, pal: { main: "#8a3ae8", light: "#d8a8ff", shade: "#4a1590" } },
  { id: "indigoNight",frame: ["#1a1060", "#6a4cff"], panel: ["#2a1d7a", "#120a40"], accent: "#8fe9ff", accentInk: "#0a0838", ink: "#f1eeff", inkSoft: "#b4a8ff", bolt: "#a8c4ff", dark: true,  pal: { main: "#7a62ff", light: "#c4baff", shade: "#2a1d7a" } },
  { id: "green",      frame: ["#04925c", "#9be82a"], panel: ["#c7f5de", "#f1fff6"], accent: "#ffe14a", accentInk: "#0a2a14", ink: "#08301c", inkSoft: "#2f7a52", bolt: "#f3ff9a", dark: false, pal: { main: "#14b36e", light: "#8ef0bd", shade: "#066b42" } },
  { id: "lightGreen", frame: ["#37d89a", "#e2fba8"], panel: ["#dcfbe9", "#fbfffa"], accent: "#12805a", accentInk: "#ffffff", ink: "#0a3a26", inkSoft: "#3f8a68", bolt: "#ffffff", dark: false, pal: { main: "#43d69c", light: "#b8f5da", shade: "#16875f" } },
  { id: "yellow",     frame: ["#f59a00", "#ffe84a"], panel: ["#fff0b0", "#fffcea"], accent: "#2a1a00", accentInk: "#ffe14a", ink: "#3a2600", inkSoft: "#8a6410", bolt: "#ffffff", dark: false, pal: { main: "#f5b400", light: "#ffe27a", shade: "#a86a00" } },
  { id: "black",      frame: ["#07070c", "#44445a"], panel: ["#20202e", "#0c0c12"], accent: "#f5c518", accentInk: "#141000", ink: "#f4f4ff", inkSoft: "#a6a6c4", bolt: "#f5c518", dark: true,  pal: { main: "#4a4a62", light: "#9a9ab8", shade: "#12121c" } },
  { id: "pearl",      frame: ["#c4cce0", "#ffffff"], panel: ["#ffffff", "#eaeffb"], accent: "#1a2236", accentInk: "#ffffff", ink: "#1a2236", inkSoft: "#66708c", bolt: "#9ab4ff", dark: false, pal: { main: "#8f9ab8", light: "#e4e9f6", shade: "#4a5472" } },
  { id: "deepRed",    frame: ["#6a0614", "#e11d48"], panel: ["#4a0c1a", "#1e0409"], accent: "#ffb8c6", accentInk: "#3a0610", ink: "#fff1f3", inkSoft: "#ff9fb0", bolt: "#ff9a6a", dark: true,  pal: { main: "#e11d48", light: "#ff8aa0", shade: "#6a0614" } },
  { id: "orange",     frame: ["#ff5a00", "#ffcf1f"], panel: ["#ffd6b0", "#fff5e8"], accent: "#2a1200", accentInk: "#ffcf1f", ink: "#401a00", inkSoft: "#9a4a10", bolt: "#fff0a0", dark: false, pal: { main: "#ff7a1a", light: "#ffc08a", shade: "#a83a00" } },
  { id: "pink",       frame: ["#ff2f92", "#ffb0d8"], panel: ["#ffd0e8", "#fff2f9"], accent: "#8a0a4a", accentInk: "#ffffff", ink: "#4a0a2c", inkSoft: "#a83a78", bolt: "#ffffff", dark: false, pal: { main: "#ff4fa6", light: "#ffb0d8", shade: "#a8186a" } },
  { id: "teal",       frame: ["#0a6a70", "#4fe8d4"], panel: ["#bff3ee", "#effffd"], accent: "#ffd23f", accentInk: "#06323a", ink: "#06323a", inkSoft: "#2f7f86", bolt: "#d8fffa", dark: false, pal: { main: "#12a6a0", light: "#8af0e2", shade: "#0a5a60" } },
];

const RARITY: Record<string, { color: string; stars: number }> = {
  common: { color: "#8a97ad", stars: 1 },
  rare: { color: "#2f7bff", stars: 2 },
  epic: { color: "#a43cff", stars: 3 },
  master: { color: "#ff7a1a", stars: 4 },
  mythic: { color: "#ee2a4a", stars: 5 },
  legendary: { color: "#ffb800", stars: 6 },
};

/* ------------------------------ fonts ------------------------------- */

const SANS = `"Poppins","Nunito","Segoe UI","Helvetica Neue",Arial,sans-serif`;
const HEAD = `"Arial Black","Impact","Helvetica Neue",Arial,sans-serif`;
const JP = `"Noto Sans JP","Yu Gothic","Hiragino Kaku Gothic ProN","Meiryo",sans-serif`;

/* ------------------------------ helpers ----------------------------- */

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const k = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + k, y);
  ctx.arcTo(x + w, y, x + w, y + h, k);
  ctx.arcTo(x + w, y + h, x, y + h, k);
  ctx.arcTo(x, y + h, x, y, k);
  ctx.arcTo(x, y, x + w, y, k);
  ctx.closePath();
}

function setFont(ctx: CanvasRenderingContext2D, weight: number | string, size: number, family: string) {
  ctx.font = `${weight} ${size}px ${family}`;
}

function width(ctx: CanvasRenderingContext2D, t: string) {
  return ctx.measureText(t).width;
}

/** Largest size in [min, max] whose single line fits maxW. */
function fitSize(ctx: CanvasRenderingContext2D, text: string, maxW: number, max: number, min: number, weight: number | string, family: string) {
  for (let s = max; s >= min; s--) {
    setFont(ctx, weight, s, family);
    if (width(ctx, text) <= maxW) return s;
  }
  return min;
}

function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  if (width(ctx, text) <= maxW) return text;
  let t = text;
  while (t.length > 1 && width(ctx, t + "…") > maxW) t = t.slice(0, -1);
  return t.trimEnd() + "…";
}

/** Word-wrap into at most maxLines; the last line is ellipsized if text remains. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): { lines: string[]; cut: boolean } {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  let i = 0;
  for (; i < words.length; i++) {
    const test = cur ? cur + " " + words[i] : words[i];
    if (width(ctx, test) <= maxW) {
      cur = test;
    } else if (!cur) {
      cur = ellipsize(ctx, words[i], maxW);
    } else {
      if (lines.length === maxLines - 1) break;
      lines.push(cur);
      cur = words[i];
    }
  }
  const rest = words.slice(i).join(" ");
  if (rest && lines.length === maxLines - 1) {
    lines.push(ellipsize(ctx, cur + " " + rest, maxW));
    return { lines, cut: true };
  }
  if (cur) lines.push(cur);
  return { lines, cut: false };
}

function pickTheme(card: DesignCard): Theme {
  const i = (hashStr(card.code || "") + (card.paletteIndex || 0) * 7 + (card.backgroundIndex || 0) * 3) % THEMES.length;
  return THEMES[i];
}

function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x + s * 0.12, y - s * 0.12, x + s, y);
  ctx.quadraticCurveTo(x + s * 0.12, y + s * 0.12, x, y + s);
  ctx.quadraticCurveTo(x - s * 0.12, y + s * 0.12, x - s, y);
  ctx.quadraticCurveTo(x - s * 0.12, y - s * 0.12, x, y - s);
  ctx.closePath();
  ctx.fill();
}

function bolt(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number, tint: string) {
  const P = [[0.2, -1], [-0.45, 0.12], [-0.05, 0.12], [-0.3, 1], [0.45, -0.22], [0.06, -0.22]];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.beginPath();
  P.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  const g = ctx.createLinearGradient(0, -1, 0, 1);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, tint);
  ctx.shadowColor = tint;
  ctx.shadowBlur = 22;
  ctx.fillStyle = g;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 0.05;
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.restore();
}

function star5(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.45 : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + rad * Math.cos(a), py = cy + rad * Math.sin(a);
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/* ------------------------------ main -------------------------------- */

export function drawHeroCard(ctx: CanvasRenderingContext2D, card: DesignCard, drawPiece: PieceDrawer): void {
  const T = pickTheme(card);
  const rarityKey = (card.rarity || "common").toLowerCase();
  const R = RARITY[rarityKey] || RARITY.common;
  const seed = card.visualSeed || hashStr((card.code || "") + card.heroName);
  const rnd = makeRng(seed);
  const word = card.japaneseWord || card.word || {};

  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  /* 1 ── outer frame ------------------------------------------------ */
  rr(ctx, 0, 0, CARD_W, CARD_H, 56);
  const fg = ctx.createLinearGradient(0, 0, 0, CARD_H);
  fg.addColorStop(0, T.frame[0]);
  fg.addColorStop(1, T.frame[1]);
  ctx.fillStyle = fg;
  ctx.fill();
  ctx.save();
  ctx.clip();
  const sheen = ctx.createRadialGradient(120, 60, 10, 120, 60, 520);
  sheen.addColorStop(0, "rgba(255,255,255,0.42)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.restore();

  /* 2 ── inner panel ------------------------------------------------ */
  const P = { x: 34, y: 34, w: 682, h: 962 };
  rr(ctx, P.x, P.y, P.w, P.h, 38);
  const pg = ctx.createLinearGradient(0, P.y, 0, P.y + P.h);
  pg.addColorStop(0, T.panel[0]);
  pg.addColorStop(1, T.panel[1]);
  ctx.fillStyle = pg;
  ctx.fill();

  ctx.save();
  rr(ctx, P.x, P.y, P.w, P.h, 38);
  ctx.clip();

  /* art backdrop: soft circles, glow, lightning, sparkles */
  ctx.fillStyle = T.dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.34)";
  [[170, 250, 150], [585, 235, 120], [400, 420, 175], [640, 500, 90]].forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  const glow = ctx.createRadialGradient(375, 390, 20, 375, 390, 310);
  glow.addColorStop(0, T.dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.65)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(P.x, 130, P.w, 540);

  const j = () => (rnd() - 0.5) * 24;
  bolt(ctx, 118 + j(), 300 + j(), 118, -0.38, T.bolt);
  bolt(ctx, 640 + j(), 268 + j(), 136, 0.32, T.bolt);
  bolt(ctx, 92 + j(), 505 + j(), 62, -0.2, T.bolt);
  bolt(ctx, 662 + j(), 470 + j(), 54, 0.25, T.bolt);

  ctx.fillStyle = T.dark ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.95)";
  const spots: [number, number, number][] = [[250, 168, 13], [520, 190, 10], [160, 420, 9], [585, 395, 14], [300, 600, 8], [120, 168, 7]];
  spots.forEach(([x, y, s]) => sparkle(ctx, x + (rnd() - 0.5) * 12, y + (rnd() - 0.5) * 12, s));
  ctx.restore();

  /* 3 ── hero piece (no plinth, no ellipse) ------------------------- */
  const box: PieceBox = { x: 150, y: 150, w: 450, h: 480 };
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 14;
  drawPiece(ctx, box, T.pal);
  ctx.restore();

  /* 4 ── top row: kanji banner (left) + rarity chip (right) --------- */
  const rowY = 58, rowH = 58, leftX = 62, rightX = 688;
  const chipText = `★ ${rarityKey.toUpperCase()}`;
  let chipSize = 22;
  setFont(ctx, 900, chipSize, SANS);
  let chipW = width(ctx, chipText) + 40;
  if (chipW > 250) {
    chipSize = fitSize(ctx, chipText, 210, 22, 14, 900, SANS);
    chipW = width(ctx, chipText) + 40;
  }
  const chipX = rightX - chipW;
  rr(ctx, chipX, rowY + 6, chipW, rowH - 12, (rowH - 12) / 2);
  ctx.fillStyle = R.color;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.stroke();
  ctx.fillStyle = lum(R.color) > 0.42 ? "#1a1020" : "#ffffff";
  setFont(ctx, 900, chipSize, SANS);
  ctx.textAlign = "center";
  ctx.fillText(chipText, chipX + chipW / 2, rowY + rowH / 2 + chipSize * 0.35);
  ctx.textAlign = "left";

  const bannerMaxW = chipX - 16 - leftX;
  const kanji = word.kanji || card.heroTitle || "HERO DUEL";
  const kSize = fitSize(ctx, kanji, bannerMaxW - 44, 34, 18, 800, JP);
  setFont(ctx, 800, kSize, JP);
  const bannerW = Math.min(bannerMaxW, width(ctx, kanji) + 44);
  rr(ctx, leftX, rowY, bannerW, rowH, rowH / 2);
  ctx.fillStyle = T.dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.62)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = T.dark ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.95)";
  ctx.stroke();
  ctx.fillStyle = T.ink;
  setFont(ctx, 800, kSize, JP);
  ctx.fillText(ellipsize(ctx, kanji, bannerW - 44), leftX + 22, rowY + rowH / 2 + kSize * 0.35);

  /* 5 ── info panel (three rows) ------------------------------------ */
  const I = { x: 58, y: 686, w: 634, h: 294 };
  rr(ctx, I.x, I.y, I.w, I.h, 28);
  ctx.fillStyle = T.dark ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.80)";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = T.dark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.95)";
  ctx.stroke();

  const rows = [{ h: 148 }, { h: 80 }, { h: 66 }];
  const padX = 26;
  const iconR = 17;
  const labelX = I.x + padX + iconR * 2 + 14;
  const valueRight = I.x + I.w - padX;
  const lineCol = T.dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)";

  const icon = (kind: number, cx: number, cy: number) => {
    ctx.beginPath();
    ctx.arc(cx, cy, iconR, 0, Math.PI * 2);
    ctx.fillStyle = T.accent;
    ctx.fill();
    ctx.fillStyle = T.accentInk;
    ctx.strokeStyle = T.accentInk;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    if (kind === 0) {
      [-6, 0, 6].forEach((dy, i) => {
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy + dy);
        ctx.lineTo(cx + (i === 2 ? 2 : 8), cy + dy);
        ctx.stroke();
      });
    } else if (kind === 1) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 9);
      ctx.lineTo(cx + 8, cy);
      ctx.lineTo(cx, cy + 9);
      ctx.lineTo(cx - 8, cy);
      ctx.closePath();
      ctx.fill();
    } else {
      star5(ctx, cx, cy + 0.5, 10);
    }
  };

  const label = (t: string, y: number) => {
    ctx.fillStyle = T.inkSoft;
    setFont(ctx, 800, 19, SANS);
    ctx.fillText(t, labelX, y);
    return width(ctx, t);
  };

  let ry = I.y;

  // row 1 — lore / quote (up to 3 lines, shrinks before it truncates)
  {
    const text = (card.loreSentence || card.quoteLine || "A hero of the Mugen duel.").trim();
    icon(0, I.x + padX + iconR, ry + 40);
    label("LORE", ry + 46);
    const maxW = I.w - padX * 2;
    let size = 24, out = { lines: [text], cut: false };
    for (; size >= 19; size--) {
      setFont(ctx, 600, size, SANS);
      out = wrap(ctx, text, maxW, 3);
      if (!out.cut) break;
    }
    setFont(ctx, 600, size, SANS);
    ctx.fillStyle = T.ink;
    out.lines.forEach((ln, i) => ctx.fillText(ln, I.x + padX, ry + 78 + i * (size + 6)));
  }
  ry += rows[0].h;
  ctx.fillStyle = lineCol;
  ctx.fillRect(I.x + 22, ry, I.w - 44, 2);

  // row 2 — word pill
  {
    const cy = ry + rows[1].h / 2;
    icon(1, I.x + padX + iconR, cy);
    const lw = label("WORD", cy + 7);
    const raw = [word.romaji, word.english || word.meaning].filter(Boolean).join(" · ") || "—";
    const maxPill = valueRight - (labelX + lw + 22);
    const size = fitSize(ctx, raw, maxPill - 40, 25, 15, 800, SANS);
    setFont(ctx, 800, size, SANS);
    const txt = ellipsize(ctx, raw, maxPill - 40);
    const pw = width(ctx, txt) + 40;
    rr(ctx, valueRight - pw, cy - 25, pw, 50, 25);
    ctx.fillStyle = T.accent;
    ctx.fill();
    ctx.fillStyle = T.accentInk;
    ctx.fillText(txt, valueRight - pw + 20, cy + size * 0.35);
  }
  ry += rows[1].h;
  ctx.fillStyle = lineCol;
  ctx.fillRect(I.x + 22, ry, I.w - 44, 2);

  // row 3 — earned by / minted
  {
    const cy = ry + rows[2].h / 2;
    icon(2, I.x + padX + iconR, cy);
    const lw = label("EARNED", cy + 7);
    const d = card.mintedAt ? new Date(card.mintedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";
    const raw = card.defeatedBy || (d ? `Minted ${d}` : "Hero Duel");
    const maxW = valueRight - (labelX + lw + 22);
    const size = fitSize(ctx, raw, maxW, 25, 15, 700, SANS);
    setFont(ctx, 700, size, SANS);
    const txt = ellipsize(ctx, raw, maxW);
    ctx.fillStyle = T.ink;
    ctx.textAlign = "right";
    ctx.fillText(txt, valueRight, cy + size * 0.35);
    ctx.textAlign = "left";
  }

  /* 6 ── name tag (drawn last so it overlaps the art, never the text) */
  {
    const nameUp = card.heroName.toUpperCase();
    const maxTagInner = 400;
    let lines: string[] = [nameUp];
    let size = 30;
    let placed = false;
    for (let s = 70; s >= 36; s -= 2) {
      setFont(ctx, 900, s, HEAD);
      if (width(ctx, nameUp) <= maxTagInner) { size = s; placed = true; break; }
    }
    if (!placed) {
      const words = nameUp.split(/\s+/);
      if (words.length > 1) {
        let best = 1, bestW = Infinity;
        setFont(ctx, 900, 40, HEAD);
        for (let k = 1; k < words.length; k++) {
          const w = Math.max(width(ctx, words.slice(0, k).join(" ")), width(ctx, words.slice(k).join(" ")));
          if (w < bestW) { bestW = w; best = k; }
        }
        lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
      }
      for (let s = 56; s >= 26; s -= 2) {
        setFont(ctx, 900, s, HEAD);
        size = s;
        if (lines.every((l) => width(ctx, l) <= maxTagInner)) break;
      }
      setFont(ctx, 900, size, HEAD);
      lines = lines.map((l) => ellipsize(ctx, l, maxTagInner));
    }
    setFont(ctx, 900, size, HEAD);
    let tw = Math.max(...lines.map((l) => width(ctx, l)));
    const title = (card.heroTitle || "").trim();
    let tSize = 0;
    if (title) {
      tSize = fitSize(ctx, title.toUpperCase(), maxTagInner, 24, 15, 800, SANS);
      setFont(ctx, 800, tSize, SANS);
      tw = Math.max(tw, width(ctx, ellipsize(ctx, title.toUpperCase(), maxTagInner)));
    }
    const padTX = 28, padTY = 16;
    const bw = tw + padTX * 2;
    const bh = padTY * 2 + lines.length * size * 1.02 + (title ? tSize + 8 : 0);
    const bx = 694 - bw;
    const by = 672 - bh;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.30)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    rr(ctx, bx, by, bw, bh, 26);
    ctx.fillStyle = T.accent;
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    rr(ctx, bx, by, bw, bh, 26);
    ctx.stroke();
    ctx.fillStyle = T.accentInk;
    ctx.textAlign = "center";
    let ty = by + padTY + size * 0.86;
    setFont(ctx, 900, size, HEAD);
    lines.forEach((l) => { ctx.fillText(l, bx + bw / 2, ty); ty += size * 1.02; });
    if (title) {
      setFont(ctx, 800, tSize, SANS);
      ctx.globalAlpha = 0.8;
      ctx.fillText(ellipsize(ctx, title.toUpperCase(), maxTagInner), bx + bw / 2, ty - size * 1.02 + tSize + 6);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = "left";
  }

  /* 7 ── rarity finish ---------------------------------------------- */
  if (R.stars >= 3) {
    rr(ctx, P.x + 5, P.y + 5, P.w - 10, P.h - 10, 33);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255,226,120,0.85)";
    ctx.stroke();
  }
  if (R.stars >= 5) {
    ctx.save();
    rr(ctx, 0, 0, CARD_W, CARD_H, 56);
    ctx.clip();
    const foil = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    foil.addColorStop(0.0, "rgba(255,255,255,0)");
    foil.addColorStop(0.42, "rgba(255,255,255,0)");
    foil.addColorStop(0.5, "rgba(255,255,255,0.22)");
    foil.addColorStop(0.58, "rgba(255,255,255,0)");
    foil.addColorStop(1.0, "rgba(255,255,255,0)");
    ctx.fillStyle = foil;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.restore();
  }

  /* 8 ── footer on the frame ---------------------------------------- */
  {
    const footInk = lum(T.frame[1]) > 0.55 ? "rgba(30,20,40,0.78)" : "rgba(255,255,255,0.92)";
    const txt = `HERO DUEL  ·  #${card.code}`;
    setFont(ctx, 800, 20, SANS);
    ctx.fillStyle = footInk;
    ctx.textAlign = "center";
    ctx.fillText(txt, CARD_W / 2, 1026);
    ctx.textAlign = "left";
  }

  ctx.restore();
}

/**
 * Calculates Mugen Gem Value based on card rarity & seed
 */
export function getCardGemValue(rarity: CardRarity | string, seed: number): number {
  const baseOffset = (seed % 100) * 5;
  switch (rarity) {
    case 'legendary':
      return 10000 + baseOffset * 50;
    case 'mythic':
      return 5000 + baseOffset * 25;
    case 'master':
      return 2500 + baseOffset * 15;
    case 'epic':
      return 1200 + baseOffset * 8;
    case 'rare':
      return 600 + baseOffset * 4;
    default:
      return 150 + (seed % 200);
  }
}

/**
 * Draws hero vector piece in box without plinths or rings
 */
const drawHeroPieceInBox: PieceDrawer = (ctx, box, pal) => {
  const heroId = (ctx as any).__currentHeroId || 'mugen-king';
  const pieceType: HeroPieceType = heroIdToPieceType(heroId as HeroId);
  const art = HERO_PIECE_ART[pieceType];
  if (!art) return;

  ctx.save();
  const pieceSize = Math.min(box.w, box.h * 0.95);
  const scale = pieceSize / 24;
  const cx = box.x + box.w / 2;
  const bottomY = box.y + box.h;

  ctx.translate(cx - pieceSize / 2, bottomY - pieceSize);
  ctx.scale(scale, scale);

  // 1. Dark silhouette with crisp outline
  if (art.sil) {
    const silPath = new Path2D(art.sil);
    ctx.save();
    ctx.fillStyle = pal.shade || '#1A2236';
    ctx.fill(silPath);

    ctx.lineWidth = 0.8;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke(silPath);
    ctx.restore();
  }

  // 2. Lite shape
  if (art.lite) {
    const litePath = new Path2D(art.lite);
    ctx.fillStyle = pal.light || '#FFFAF0';
    ctx.fill(litePath);
  }

  // 3. Acc shape
  if (art.acc) {
    const accPath = new Path2D(art.acc);
    ctx.fillStyle = pal.main || '#FFD700';
    ctx.fill(accPath);
  }

  ctx.restore();
};

/**
 * Renders a Collectible Hero Card for Hero Duel mode.
 */
export function renderCardToCanvas(
  canvas: HTMLCanvasElement,
  card: CollectibleHeroCard,
  scale: number = 1
): void {
  canvas.width = CARD_WIDTH * scale;
  canvas.height = CARD_HEIGHT * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.scale(scale, scale);

  // Attach heroId temporarily to context for drawHeroPieceInBox
  (ctx as any).__currentHeroId = card.heroId || 'mugen-king';

  drawHeroCard(ctx, card, drawHeroPieceInBox);

  ctx.restore();
}

export async function exportCardAsPng(card: CollectibleHeroCard): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  renderCardToCanvas(canvas, card, 2);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export async function downloadCardPng(card: CollectibleHeroCard): Promise<void> {
  const blob = await exportCardAsPng(card);
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `HeroDuel_${card.heroId}_${(card.code || 'HD100').toUpperCase()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
