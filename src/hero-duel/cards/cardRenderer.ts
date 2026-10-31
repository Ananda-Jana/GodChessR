import { CollectibleHeroCard } from '../types/cardTypes';
import { getPaletteForCard, CardPaletteDef } from './cardPalettes';
import { getSceneRecipeForCard, SceneRecipe } from './cardStories';
import { HERO_CARD_VECTOR_ART, HeroVectorArtDef } from './art/heroCardArt';
import { HERO_PIECE_ART, HeroPieceType } from '../art/HeroPiecex';
import { heroIdToPieceType } from '../art/heroAvatarHelper';
import { CardRarity } from '../config/rarityConfig';

export const CARD_WIDTH = 750;
export const CARD_HEIGHT = 1050;

export const CARD_BACKGROUND_IMAGES: string[] = [];

/**
 * Seeded PRNG (Mulberry32)
 */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hero Unicolor Theme Map
 * Each hero has a signature solid-gradient unicolor background color palette
 */
const HERO_UNICOLOR_THEMES: Record<string, { bg: string; radial: string; spot: string }> = {
  'mugen-king': { bg: '#0F172A', radial: 'rgba(56, 189, 248, 0.35)', spot: '#38BDF8' },
  'malevolent-priest': { bg: '#1F050B', radial: 'rgba(239, 68, 68, 0.35)', spot: '#EF4444' },
  'dr-methanogenic': { bg: '#042016', radial: 'rgba(34, 197, 94, 0.35)', spot: '#22C55E' },
  'captain-englland': { bg: '#0A192F', radial: 'rgba(99, 102, 241, 0.35)', spot: '#6366F1' },
  'ajx-assassin': { bg: '#09090B', radial: 'rgba(168, 85, 247, 0.35)', spot: '#A855F7' },
  'yjkstra-pathfinder': { bg: '#111827', radial: 'rgba(234, 179, 8, 0.35)', spot: '#EAB308' },
  'ironclad-warden': { bg: '#1F2937', radial: 'rgba(156, 163, 175, 0.35)', spot: '#9CA3AF' },
  'black-monkey': { bg: '#18181B', radial: 'rgba(249, 115, 22, 0.35)', spot: '#F97316' },
  'part-king-kong': { bg: '#241408', radial: 'rgba(245, 158, 11, 0.35)', spot: '#F59E0B' },
};

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
 * Renders a Collectible Hero Card for Hero Duel mode.
 * Features:
 * 1. Clean Unicolor Theme background framing the central art window.
 * 2. Center Hero Icon rendered from vector artwork in HeroPiecex.tsx with smooth shadow.
 * 3. High-contrast top-left Japanese text (Kanji + Romaji).
 * 4. Distinct Rarity Category Badge with custom color styling (Epic = Purple, Legendary = Yellow/Gold, etc.).
 * 5. Mugen Gem Icon & calculated Gem Value display.
 * 6. Card Code strictly formatted in ALL UPPERCASE (no lowercase letters).
 *
 * Dimensions: 750px width x 1050px height (2x PNG export: 1500 x 2100 px).
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

  const seed = card.visualSeed || Math.abs(hashCode(card.code || 'HD100'));
  const palette: CardPaletteDef = getPaletteForCard(seed, card.rarity || 'common');
  const scene: SceneRecipe = getSceneRecipeForCard(card.heroId || 'mugen-king', seed);
  const heroVector: HeroVectorArtDef =
    HERO_CARD_VECTOR_ART[card.heroId] || HERO_CARD_VECTOR_ART['mugen-king'];

  const theme = HERO_UNICOLOR_THEMES[card.heroId] || HERO_UNICOLOR_THEMES['mugen-king'];
  const rarityColor = getRarityColor(card.rarity);
  const gemValue = getCardGemValue(card.rarity, seed);
  const uppercaseCode = (card.code || 'HD100').toUpperCase();

  const ink = '#0B0B0F';
  const paper = '#F3EDE0';

  // ------------------------------------------------------------------
  // 1. BASE CARD CONTAINER (Solid Ink Base with Rounded Corners)
  // ------------------------------------------------------------------
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 32);
  ctx.fill();

  // ------------------------------------------------------------------
  // 2. UNICOLOR ART WINDOW (x=0, y=0, w=750, h=720)
  // ------------------------------------------------------------------
  const artX = 0;
  const artY = 0;
  const artW = CARD_WIDTH;
  const artH = 720;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(artX, artY, artW, artH, [32, 32, 0, 0]);
  ctx.clip();

  // Unicolor Background Fill
  ctx.fillStyle = theme.bg;
  ctx.fillRect(artX, artY, artW, artH);

  // Soft Radial Spotlight Beam in Center
  const radialGlow = ctx.createRadialGradient(375, 360, 20, 375, 360, 380);
  radialGlow.addColorStop(0, theme.radial);
  radialGlow.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(artX, artY, artW, artH);

  // Plinth Base Ring beneath the Hero Artwork
  drawHeroPlinthRing(ctx, 375, 520, 220, theme.spot, rarityColor);

  // ------------------------------------------------------------------
  // CENTER HERO ICON ARTWORK (Imported from HeroPiecex.tsx)
  // ------------------------------------------------------------------
  const pieceType: HeroPieceType = heroIdToPieceType(card.heroId);
  drawCenterHeroPiece(ctx, pieceType, 375, 350, 340, theme.spot);

  // Soft contrast gradient overlay at lower art section for high text readability
  const shadowGrad = ctx.createLinearGradient(0, 420, 0, artH);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
  shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.65)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(artX, artY, artW, artH);

  // HERO NAME & ROLE LINE (Carved Typography over art window bottom)
  drawCarvedHeroName(ctx, card.heroName || heroVector.name, heroVector.roleTitle, theme.spot, ink);

  ctx.restore(); // Unclip Art Window

  // ------------------------------------------------------------------
  // 3. TOP-LEFT JAPANESE KANJI & ROMAJI (WELL CONTRASTED)
  // ------------------------------------------------------------------
  const kanjiWord = scene.japaneseWord.kanji;
  const romajiWord = scene.japaneseWord.romaji;

  ctx.save();
  // Vertical Accent Bar left of Kanji (x=34, y=44, w=7, h=64)
  ctx.fillStyle = theme.spot;
  ctx.fillRect(34, 44, 7, 64);

  ctx.font = '900 108px "Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // 16px Heavy Dark Stroke Outline behind Kanji for maximum contrast
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(kanjiWord, 48, 114);

  // 3D Hard Offset Shadow in Spot Accent Color
  ctx.fillStyle = theme.spot;
  ctx.fillText(kanjiWord, 53, 118);

  // Bright White Fill
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(kanjiWord, 48, 114);

  // Romaji beneath Kanji with Dark Outline
  ctx.font = '900 24px "Bebas Neue", "Anton", sans-serif';
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(romajiWord.toUpperCase(), 52, 148);
  ctx.fillStyle = '#FFFFFF';
  ctx.letterSpacing = '4px';
  ctx.fillText(romajiWord.toUpperCase(), 52, 148);
  ctx.restore();

  // ------------------------------------------------------------------
  // 4. TOP-RIGHT RARITY CATEGORY BADGE (x=714 right-aligned, y=36)
  // ------------------------------------------------------------------
  drawRarityBadge(ctx, card.rarity || 'common', 714, 36, rarityColor, ink);

  // ------------------------------------------------------------------
  // 5. REWARD & STORY BOX (x=16, y=734, w=718, h=146, fill #F3EDE0)
  // ------------------------------------------------------------------
  ctx.save();
  ctx.fillStyle = paper;
  ctx.beginPath();
  ctx.roundRect(16, 734, 718, 146, 14);
  ctx.fill();

  // Outer border for story box
  ctx.lineWidth = 2;
  ctx.strokeStyle = theme.spot;
  ctx.stroke();

  // Mugen Gem Icon & Gem Value Badge (Top Right of Story Box)
  drawGemRewardBadge(ctx, 718 - 180, 746, gemValue);

  // Story Text Quote
  const taleText = scene.tales[seed % scene.tales.length];
  ctx.fillStyle = '#111111';
  ctx.font = 'italic 500 23px "Playfair Display", "IM Fell English", Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  wrapTextLeft(ctx, `“${taleText}”`, 36, 750, 480, 28);

  // Lore Meaning Subtitle Line
  ctx.fillStyle = '#4B5563';
  ctx.font = '600 18px sans-serif';
  ctx.fillText(`Attribute: ${scene.japaneseWord.meaning.toUpperCase()}`, 36, 842);

  ctx.restore();

  // ------------------------------------------------------------------
  // 6. FOOTER STRIP (x=16, y=892, w=718, h=142, fill #0B0B0F)
  // ------------------------------------------------------------------
  ctx.save();
  ctx.fillStyle = ink;
  ctx.fillRect(16, 892, 718, 142);

  // Left Footer Text: "HERO DUEL" & Mint/Defeated Info
  ctx.fillStyle = paper;
  ctx.font = '900 30px "Bebas Neue", "Anton", sans-serif';
  ctx.textAlign = 'left';
  ctx.letterSpacing = '6px';
  ctx.fillText('HERO DUEL', 38, 938);

  const defeatedName = card.defeatedBy || 'Guest';
  const mintDateStr = new Date(card.mintedAt || card.unlockedAt || Date.now()).toLocaleDateString();

  ctx.fillStyle = '#9A9AA5';
  ctx.font = '600 19px sans-serif';
  ctx.letterSpacing = '0px';
  ctx.fillText(`Issued by ${defeatedName} • ${mintDateStr}`, 38, 978);

  // Right Footer Text: Small "No." + HUGE Focal Card Code (STRICTLY UPPERCASE)
  ctx.fillStyle = paper;
  ctx.font = '800 22px "Bebas Neue", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('CODE NO.', 718 - 270, 942);

  // HUGE CARD CODE (118px)
  let codeFontSize = 118;
  ctx.font = `900 ${codeFontSize}px "Anton", "Bebas Neue", "Impact", sans-serif`;
  while (ctx.measureText(uppercaseCode).width > 350 && codeFontSize > 70) {
    codeFontSize -= 4;
    ctx.font = `900 ${codeFontSize}px "Anton", "Bebas Neue", "Impact", sans-serif`;
  }

  // 4px Hard Offset Shadow in White at 30% Alpha
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText(uppercaseCode, 718, 1002);

  // 12px Stroke Outline in Black Ink
  ctx.lineWidth = 12;
  ctx.strokeStyle = ink;
  ctx.strokeText(uppercaseCode, 714, 998);

  // Spot Color Fill
  ctx.fillStyle = theme.spot;
  ctx.fillText(uppercaseCode, 714, 998);

  ctx.restore();

  // ------------------------------------------------------------------
  // 7. SINGLE CLEAN OUTER FRAMING BORDER
  // ------------------------------------------------------------------
  ctx.strokeStyle = rarityColor;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(3, 3, CARD_WIDTH - 6, CARD_HEIGHT - 6, 30);
  ctx.stroke();

  ctx.restore(); // Final Scale Restore
}

// ------------------------------------------------------------------
// HELPER DRAWING FUNCTIONS
// ------------------------------------------------------------------

/**
 * Draws the vector hero piece from HeroPiecex.tsx in the center of the card
 */
function drawCenterHeroPiece(
  ctx: CanvasRenderingContext2D,
  pieceType: HeroPieceType,
  cx: number,
  cy: number,
  size: number,
  spotColor: string
) {
  const art = HERO_PIECE_ART[pieceType];
  if (!art) return;

  ctx.save();

  // Translate to center hero position (the vector paths are 24x24 box with feet at y=19)
  const scale = size / 24;
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(scale, scale);

  // 1. Smooth Backdrop Shadow for Silhouette
  if (art.sil) {
    const silPath = new Path2D(art.sil);
    ctx.save();
    ctx.shadowColor = spotColor;
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#1A2236';
    ctx.fill(silPath);
    ctx.restore();

    // Fill main dark silhouette
    ctx.fillStyle = '#1A2236';
    ctx.fill(silPath);

    // Golden/Spot outline stroke around silhouette
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = spotColor;
    ctx.stroke(silPath);
  }

  // 2. White/Ivory accent shapes (`lite`)
  if (art.lite) {
    const litePath = new Path2D(art.lite);
    ctx.fillStyle = '#FFFAF0';
    ctx.fill(litePath);
  }

  // 3. Highlight accent shapes (`acc`)
  if (art.acc) {
    const accPath = new Path2D(art.acc);
    ctx.fillStyle = spotColor;
    ctx.fill(accPath);
  }

  ctx.restore();
}

/**
 * Draws Plinth Ring Base beneath hero artwork
 */
function drawHeroPlinthRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radiusX: number,
  spotColor: string,
  rarityColor: string
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Ellipse Base Shadow
  ctx.beginPath();
  ctx.ellipse(0, 0, radiusX, radiusX * 0.35, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fill();

  // Glowing Outer Ring
  ctx.lineWidth = 4;
  ctx.strokeStyle = spotColor;
  ctx.stroke();

  // Inner Rarity Ring
  ctx.beginPath();
  ctx.ellipse(0, 0, radiusX * 0.75, radiusX * 0.25, 0, 0, Math.PI * 2);
  ctx.strokeStyle = rarityColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws Mugen Gem Icon and Gem Value Pill
 */
function drawGemRewardBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  gemValue: number
) {
  ctx.save();

  const w = 165;
  const h = 42;

  // Badge Container Background
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 21);
  ctx.fillStyle = '#0F172A';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#38BDF8';
  ctx.stroke();

  // 3D Faceted Mugen Gem Icon
  drawMugenGemIcon(ctx, x + 8, y + 9, 24);

  // Gem Value Text
  ctx.fillStyle = '#38BDF8';
  ctx.font = '900 18px "Anton", "Bebas Neue", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${gemValue.toLocaleString()} GEMS`, x + 40, y + h / 2);

  ctx.restore();
}

/**
 * Renders authentic 3D Faceted Sapphire Mugen Gem Icon
 */
function drawMugenGemIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);

  const s = size / 24;
  ctx.scale(s, s);

  // Top Facet Polygon
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.moveTo(12, 2);
  ctx.lineTo(19, 7);
  ctx.lineTo(5, 7);
  ctx.closePath();
  ctx.fill();

  // Top Left Facet
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.moveTo(12, 2);
  ctx.lineTo(5, 7);
  ctx.lineTo(2, 7);
  ctx.closePath();
  ctx.fill();

  // Top Right Facet
  ctx.fillStyle = '#7DD3FC';
  ctx.beginPath();
  ctx.moveTo(12, 2);
  ctx.lineTo(22, 7);
  ctx.lineTo(19, 7);
  ctx.closePath();
  ctx.fill();

  // Bottom Center Facet
  ctx.fillStyle = '#0EA5E9';
  ctx.beginPath();
  ctx.moveTo(12, 22);
  ctx.lineTo(5, 7);
  ctx.lineTo(19, 7);
  ctx.closePath();
  ctx.fill();

  // Bottom Left Facet
  ctx.fillStyle = '#0369A1';
  ctx.beginPath();
  ctx.moveTo(12, 22);
  ctx.lineTo(2, 7);
  ctx.lineTo(5, 7);
  ctx.closePath();
  ctx.fill();

  // Bottom Right Facet
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.moveTo(12, 22);
  ctx.lineTo(19, 7);
  ctx.lineTo(22, 7);
  ctx.closePath();
  ctx.fill();

  // Facet Stroke Highlights
  ctx.strokeStyle = '#E0F2FE';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.restore();
}

function drawCarvedHeroName(
  ctx: CanvasRenderingContext2D,
  heroName: string,
  roleTitle: string,
  spotColor: string,
  ink: string
) {
  ctx.save();

  // Role Subtitle Line (26px)
  ctx.fillStyle = spotColor;
  ctx.font = '900 26px "Bebas Neue", sans-serif';
  ctx.textAlign = 'left';
  ctx.letterSpacing = '4px';
  ctx.fillText(roleTitle.toUpperCase(), 38, 698);

  // Hero Main Name (Anton / Sans 76px)
  let fontSize = 76;
  ctx.font = `900 ${fontSize}px "Anton", "Bebas Neue", sans-serif`;
  ctx.textAlign = 'left';

  const nameUpper = heroName.toUpperCase();
  while (ctx.measureText(nameUpper).width > 620 && fontSize > 48) {
    fontSize -= 4;
    ctx.font = `900 ${fontSize}px "Anton", "Bebas Neue", sans-serif`;
  }

  // Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.fillText(nameUpper, 38, 666);

  // White Fill
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(nameUpper, 38, 662);

  // Outline
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = ink;
  ctx.strokeText(nameUpper, 38, 662);

  ctx.restore();
}

function drawRarityBadge(
  ctx: CanvasRenderingContext2D,
  rarity: string,
  rightX: number,
  y: number,
  color: string,
  ink: string
) {
  ctx.save();
  const w = 158;
  const h = 46;
  const x = rightX - w;

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 23);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = ink;
  ctx.stroke();

  // Badge Text
  const textColor = rarity === 'legendary' || rarity === 'master' ? '#000000' : '#FFFFFF';
  ctx.fillStyle = textColor;
  ctx.font = '900 22px "Bebas Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(rarity.toUpperCase(), x + w / 2, y + h / 2);

  ctx.restore();
}

function wrapTextLeft(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
}

function getRarityColor(rarity?: string): string {
  switch (rarity) {
    case 'rare': return '#3B82F6';
    case 'epic': return '#A855F7';
    case 'master': return '#F59E0B';
    case 'mythic': return '#F43F5E';
    case 'legendary': return '#EAB308';
    default: return '#6B7280';
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
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
