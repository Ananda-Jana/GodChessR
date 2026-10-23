/**
 * Dynamic 1:1 Square Canvas 2D Achievement Card Generator & PNG Exporter (600x600)
 */

import type { AchievementCard } from './types';

const CARD_SIZE = 600;

/**
 * Draws a 1:1 square mode-specific achievement card onto Canvas 2D context.
 */
export function drawAchievementCard(
  ctx: CanvasRenderingContext2D,
  card: AchievementCard
): void {
  const mode = card.mode;

  // Clear canvas
  ctx.clearRect(0, 0, CARD_SIZE, CARD_SIZE);

  // 1. Background Fill according to Game Mode
  if (mode === 'culling') {
    // Dark Anime Brutalist Charcoal & Crimson
    const bgGrad = ctx.createRadialGradient(300, 300, 30, 300, 300, 380);
    bgGrad.addColorStop(0, '#1E1B2E');
    bgGrad.addColorStop(0.6, '#0F0E17');
    bgGrad.addColorStop(1, '#050508');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

    // Red aura glow
    const redGlow = ctx.createRadialGradient(300, 240, 10, 300, 240, 200);
    redGlow.addColorStop(0, 'rgba(220, 38, 38, 0.3)');
    redGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = redGlow;
    ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);
  } else if (mode === 'rose') {
    // Romantic Crimson & Blush Pink
    const bgGrad = ctx.createLinearGradient(0, 0, CARD_SIZE, CARD_SIZE);
    bgGrad.addColorStop(0, '#4C0519');
    bgGrad.addColorStop(0.5, '#881337');
    bgGrad.addColorStop(1, '#2E0616');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

    const roseGlow = ctx.createRadialGradient(300, 240, 10, 300, 240, 220);
    roseGlow.addColorStop(0, 'rgba(251, 113, 133, 0.35)');
    roseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = roseGlow;
    ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);
  } else if (mode === 'crafted') {
    // Cyber Steel & Neon Cyan
    const bgGrad = ctx.createLinearGradient(0, 0, CARD_SIZE, CARD_SIZE);
    bgGrad.addColorStop(0, '#020617');
    bgGrad.addColorStop(0.5, '#0F172A');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

    const cyanGlow = ctx.createRadialGradient(300, 240, 10, 300, 240, 200);
    cyanGlow.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
    cyanGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cyanGlow;
    ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);
  } else {
    // Standard Royal Obsidian & Gold
    const bgGrad = ctx.createRadialGradient(300, 300, 30, 300, 300, 380);
    bgGrad.addColorStop(0, '#1E293B');
    bgGrad.addColorStop(0.6, '#0F172A');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

    const goldGlow = ctx.createRadialGradient(300, 240, 10, 300, 240, 200);
    goldGlow.addColorStop(0, 'rgba(234, 179, 8, 0.25)');
    goldGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = goldGlow;
    ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);
  }

  // 2. Brutalist Outer Double-Border
  const borderColor = card.accentColor || '#EAB308';
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, CARD_SIZE - 40, CARD_SIZE - 40);

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(30, 30, CARD_SIZE - 60, CARD_SIZE - 60);

  // 3. Header: Origin Label & Rarity Badge
  const modeLabel = (card.modeLabel || `EARNED IN: ${(card.mode || 'standard').toUpperCase()} CHESS`).toUpperCase();
  ctx.fillStyle = '#94A3B8';
  ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(modeLabel, 45, 60);

  const rarity = card.rarity || 'Common';
  let rarityBg = '#374151';
  if (rarity === 'Legendary') rarityBg = '#B45309';
  if (rarity === 'Epic') rarityBg = '#6B21A8';
  if (rarity === 'Rare') rarityBg = '#1E40AF';

  ctx.fillStyle = rarityBg;
  ctx.fillRect(CARD_SIZE - 165, 42, 120, 26);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(CARD_SIZE - 165, 42, 120, 26);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(rarity.toUpperCase(), CARD_SIZE - 105, 59);

  // 4. Central Piece Motif Square Box (180x180 at X=210, Y=90)
  const boxX = 210;
  const boxY = 90;
  const boxDim = 180;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(boxX, boxY, boxDim, boxDim);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(boxX, boxY, boxDim, boxDim);

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(boxX + 6, boxY + 6, boxDim - 12, boxDim - 12);

  // Draw piece symbol / icon in center box
  const motif = card.motifSymbol || '♔';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '84px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(motif, CARD_SIZE / 2, boxY + 120);

  // 5. Card Title
  const title = (card.title || 'ACHIEVEMENT BADGE').toUpperCase();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, CARD_SIZE / 2, 312);

  // Divider Line
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(100, 330);
  ctx.lineTo(500, 330);
  ctx.stroke();

  // 6. Rating Callout Banner Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(45, 350, 510, 68);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(45, 350, 510, 68);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('PREDICTED PERFORMANCE RATING', CARD_SIZE / 2, 372);

  const predictedRating = card.predictedRating ?? 500;
  const delta = card.ratingDelta ?? 0;
  const deltaSign = delta >= 0 ? `+${delta}` : `${delta}`;
  ctx.fillStyle = '#F8FAFC';
  ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${predictedRating}  (${deltaSign})`, CARD_SIZE / 2, 404);

  // 7. Highlight & Description Area
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fillRect(45, 430, 510, 105);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(45, 430, 510, 105);

  const highlight = card.highlight || `Rating: ${predictedRating}`;
  ctx.fillStyle = borderColor;
  ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(highlight, CARD_SIZE / 2, 456);

  const description = card.description || 'Verified tactical achievement badge.';
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '500 13px "DM Sans", sans-serif';
  drawWrappedText(ctx, description, CARD_SIZE / 2, 482, 480, 20);

  // 8. Footer Tagline
  ctx.fillStyle = '#64748B';
  ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('MUGENCHESSX · 1:1 SQUARE ACHIEVEMENT BADGE', CARD_SIZE / 2, 562);
}

/**
 * Helper to wrap multi-line text cleanly on Canvas.
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string | undefined | null,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  if (!text) return;
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

/**
 * Renders 1:1 square card to hidden HTML5 Canvas 2D and triggers PNG download.
 */
export function downloadCardAsPng(card: AchievementCard): void {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = CARD_SIZE;
    canvas.height = CARD_SIZE;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawAchievementCard(ctx, card);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = (card.title || 'badge').toLowerCase().replace(/[^a-z0-9]/g, '_');
      a.download = `MugenChessX_Badge_${safeTitle}_${card.id || Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  } catch (err) {
    console.error('Failed to export achievement card PNG:', err);
  }
}
