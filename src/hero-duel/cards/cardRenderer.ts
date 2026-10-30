import { CollectibleHeroCard } from '../types/cardTypes';
import { getPaletteForCard, CardPaletteDef } from './cardPalettes';
import { getSceneRecipeForCard, SceneRecipe } from './cardStories';
import { HERO_CARD_VECTOR_ART, HeroVectorArtDef } from './art/heroCardArt';
import { RARITY_CONFIGS } from '../config/rarityConfig';

export const CARD_WIDTH = 750;
export const CARD_HEIGHT = 1050;

export const CARD_BACKGROUND_IMAGES = [
  '/assets/aistudio/image_3043ca82.png',
  '/assets/aistudio/image_b9c390da.png',
  '/assets/aistudio/image_75790540.png',
  '/assets/aistudio/image_cd6ac775.png',
  '/assets/aistudio/image_e66dcdcb.png',
  '/assets/aistudio/image_d155feb3.png',
  '/assets/aistudio/image_335bc26c.png',
  '/assets/aistudio/image_1414f352.png',
  '/assets/aistudio/image_e3f1a1f0.png',
  '/assets/aistudio/image_880e78e2.png',
  '/assets/aistudio/image_1e8dde45.png',
  '/assets/aistudio/007c5c6dcab68b90b1fc2dbdbb307cef_949f61bf.jpg',
  '/assets/aistudio/7c7afc2a-c919-447b-bdd3-a01f6abeb4e3_1cd6e9c1.png',
  '/assets/aistudio/142a267298d4d2c449bc7b1a5d1591e7_f07da55b.jpg',
  '/assets/aistudio/922b8801-3353-40c8-a10a-1a039cef830e_c4c310a4.jpg',
  '/assets/aistudio/977e49ab-a0b6-432f-97f3-9539ca7f3f27_4c0be097.jpg',
  '/assets/aistudio/rio_-_Copy_e5c709df.png',
  '/assets/aistudio/013b0428-767e-4b82-90d4-5807ac930b96_e8298bb4.png',
  '/assets/aistudio/000z_a65f07b6.png',
  '/assets/aistudio/c1dbda89-1823-4fd0-b688-d1224a8c97d6_deeb3057.png',
  '/assets/aistudio/28a1109a-b678-45fa-8b09-49562285e5cc_798ef255.png',
];

const imageCache: Map<string, HTMLImageElement> = new Map();

function getLoadedImage(src: string, onLoaded?: () => void): HTMLImageElement | null {
  if (imageCache.has(src)) {
    const img = imageCache.get(src)!;
    if (img.complete && img.naturalWidth > 0) {
      return img;
    }
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  img.onload = () => {
    imageCache.set(src, img);
    if (onLoaded) onLoaded();
  };
  imageCache.set(src, img);
  return null;
}

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
 * Renders a Collectible Hero Card using authentic background image assets.
 * Features ONE single outer border framing the card (no multiple/nested borders).
 * Logical dimensions: 750 x 1050 px (export at 2x = 1500 x 2100 px).
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
  const rand = mulberry32(seed);

  const palette: CardPaletteDef = getPaletteForCard(seed, card.rarity || 'common');
  const scene: SceneRecipe = getSceneRecipeForCard(card.heroId || 'mugen-king', seed);
  const heroVector: HeroVectorArtDef =
    HERO_CARD_VECTOR_ART[card.heroId] || HERO_CARD_VECTOR_ART['mugen-king'];

  const ink = '#0B0B0F';
  const paper = '#F3EDE0';
  const rarityColor = getRarityColor(card.rarity);

  // ------------------------------------------------------------------
  // 1. SINGLE OUTER CARD BASE & BORDER (No multiple/nested borders)
  // ------------------------------------------------------------------
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 32);
  ctx.fill();

  // ------------------------------------------------------------------
  // 2. ART WINDOW (x=0, y=0, w=750, h=720 with rounded top corners)
  // ------------------------------------------------------------------
  const artX = 0;
  const artY = 0;
  const artW = CARD_WIDTH;
  const artH = 720;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(artX, artY, artW, artH, [32, 32, 0, 0]);
  ctx.clip();

  // Selected Image Asset for Background
  const bgImgIndex = Math.abs(card.backgroundIndex ?? seed) % CARD_BACKGROUND_IMAGES.length;
  const bgSrc = CARD_BACKGROUND_IMAGES[bgImgIndex];
  const bgImg = getLoadedImage(bgSrc, () => {
    renderCardToCanvas(canvas, card, scale);
  });

  if (bgImg) {
    drawImageCover(ctx, bgImg, artX, artY, artW, artH);
  } else {
    // Atmospheric fallback gradient while loading image
    const fillGrad = ctx.createLinearGradient(0, 0, 0, artH);
    fillGrad.addColorStop(0, palette.bg || '#1a102f');
    fillGrad.addColorStop(1, '#05020a');
    ctx.fillStyle = fillGrad;
    ctx.fillRect(artX, artY, artW, artH);
  }

  // Soft contrast gradient overlay at lower art section for high text readability
  const shadowGrad = ctx.createLinearGradient(0, 360, 0, artH);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
  shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.55)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.88)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(artX, artY, artW, artH);

  // HERO NAME & ROLE LINE (Carved Typography over art window bottom)
  drawCarvedHeroName(ctx, card.heroName || heroVector.name, heroVector.roleTitle, palette, ink);

  ctx.restore(); // Unclip Art Window

  // ------------------------------------------------------------------
  // 3. TOP-LEFT JAPANESE KANJI & ROMAJI
  // ------------------------------------------------------------------
  const kanjiWord = scene.japaneseWord.kanji;
  const romajiWord = scene.japaneseWord.romaji;

  // Vertical Accent Bar left of Kanji (x=36, y=48, w=6, h=54)
  ctx.fillStyle = palette.spot;
  ctx.fillRect(36, 48, 6, 54);

  ctx.save();
  ctx.font = '900 108px "Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // 10px Stroke in dark ink behind text for pop over images
  ctx.lineWidth = 12;
  ctx.strokeStyle = ink;
  ctx.strokeText(kanjiWord, 48, 114);

  // Hard Offset Shadow in Spot Color
  ctx.fillStyle = palette.spot;
  ctx.fillText(kanjiWord, 52, 118);

  // White Fill
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(kanjiWord, 48, 114);

  // Romaji beneath
  ctx.font = '700 24px "Bebas Neue", "Anton", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.letterSpacing = '4px';
  ctx.fillText(romajiWord.toUpperCase(), 52, 148);
  ctx.restore();

  // ------------------------------------------------------------------
  // 4. TOP-RIGHT RARITY BADGE (x=714 right-aligned, y=36)
  // ------------------------------------------------------------------
  drawRarityBadge(ctx, card.rarity || 'common', 714, 36, rarityColor, ink);

  // ------------------------------------------------------------------
  // 5. STORY BOX (x=16, y=734, w=718, h=146, fill #F3EDE0)
  // ------------------------------------------------------------------
  ctx.save();
  ctx.fillStyle = paper;
  ctx.beginPath();
  ctx.roundRect(16, 734, 718, 146, 12);
  ctx.fill();

  // Story Text
  const taleText = scene.tales[seed % scene.tales.length];
  ctx.fillStyle = '#111111';
  ctx.font = 'italic 500 24px "Playfair Display", "IM Fell English", Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  wrapTextLeft(ctx, `“${taleText}”`, 38, 750, 640, 30);

  // Spot Color Corner Dot (r=10 at x=710, y=858)
  ctx.fillStyle = palette.spot;
  ctx.beginPath();
  ctx.arc(710, 858, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ------------------------------------------------------------------
  // 6. FOOTER STRIP (x=16, y=892, w=718, h=142, fill #0B0B0F)
  // ------------------------------------------------------------------
  ctx.save();
  ctx.fillStyle = ink;
  ctx.fillRect(16, 892, 718, 142);

  // Left Footer Text: "HERO DUEL" & Defeated Info
  ctx.fillStyle = paper;
  ctx.font = '900 30px "Bebas Neue", "Anton", sans-serif';
  ctx.textAlign = 'left';
  ctx.letterSpacing = '6px';
  ctx.fillText('HERO DUEL', 38, 938);

  const defeatedName = card.defeatedBy || 'Guest';
  const mintDateStr = new Date(card.mintedAt || card.unlockedAt || Date.now()).toLocaleDateString();

  ctx.fillStyle = '#9A9AA5';
  ctx.font = '600 20px sans-serif';
  ctx.letterSpacing = '0px';
  ctx.fillText(`Defeated by ${defeatedName} • ${mintDateStr}`, 38, 978);

  // Right Footer Text: Small "No." + HUGE Focal Card Code
  ctx.fillStyle = paper;
  ctx.font = '800 22px "Bebas Neue", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('No.', 718 - 270, 942);

  // HUGE CARD CODE (118px)
  const codeStr = card.code || 'HD100';
  let codeFontSize = 118;
  ctx.font = `900 ${codeFontSize}px "Anton", "Bebas Neue", "Impact", sans-serif`;
  while (ctx.measureText(codeStr).width > 350 && codeFontSize > 70) {
    codeFontSize -= 4;
    ctx.font = `900 ${codeFontSize}px "Anton", "Bebas Neue", "Impact", sans-serif`;
  }

  // 4px Hard Offset Shadow in White at 35% Alpha
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillText(codeStr, 718, 1002);

  // 6px Stroke Outline
  ctx.lineWidth = 12;
  ctx.strokeStyle = ink;
  ctx.strokeText(codeStr, 714, 998);

  // Spot Color Fill
  ctx.fillStyle = palette.spot;
  ctx.fillText(codeStr, 714, 998);

  ctx.restore();

  // ------------------------------------------------------------------
  // 7. SINGLE CLEAN OUTER BORDER (ONLY ONE BORDER)
  // ------------------------------------------------------------------
  ctx.strokeStyle = rarityColor;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(3, 3, CARD_WIDTH - 6, CARD_HEIGHT - 6, 30);
  ctx.stroke();

  ctx.restore(); // Final Scale Restore
}

// ------------------------------------------------------------------
// HELPER FUNCTIONS
// ------------------------------------------------------------------

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = w / h;
  let renderW = w;
  let renderH = h;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > targetRatio) {
    renderW = h * imgRatio;
    offsetX = (w - renderW) / 2;
  } else {
    renderH = w / imgRatio;
    offsetY = (h - renderH) / 2;
  }

  ctx.drawImage(img, x + offsetX, y + offsetY, renderW, renderH);
}

function drawCarvedHeroName(
  ctx: CanvasRenderingContext2D,
  heroName: string,
  roleTitle: string,
  palette: CardPaletteDef,
  ink: string
) {
  ctx.save();

  // Role Line (28px)
  ctx.fillStyle = palette.spot;
  ctx.font = '900 28px "Bebas Neue", sans-serif';
  ctx.textAlign = 'left';
  ctx.letterSpacing = '5px';
  ctx.fillText(roleTitle.toUpperCase(), 38, 698);

  // Hero Main Name (Anton / Sans 76px)
  let fontSize = 76;
  ctx.font = `900 ${fontSize}px "Anton", "Bebas Neue", sans-serif`;
  ctx.textAlign = 'left';

  while (ctx.measureText(heroName.toUpperCase()).width > 620 && fontSize > 48) {
    fontSize -= 4;
    ctx.font = `900 ${fontSize}px "Anton", "Bebas Neue", sans-serif`;
  }

  const nameUpper = heroName.toUpperCase();

  // Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
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
  const w = 148;
  const h = 44;
  const x = rightX - w;

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 22);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = ink;
  ctx.stroke();

  ctx.fillStyle = ink;
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
    case 'mythic': return '#EF4444';
    case 'legendary': return '#F59E0B';
    default: return '#9AA0A6';
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
  a.download = `HeroDuel_${card.heroId}_${card.code}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
