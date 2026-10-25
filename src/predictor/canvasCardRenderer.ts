/**
 * Dynamic 1:1 Square Canvas 2D Achievement Card Generator & PNG Exporter (600x600)
 * Redesigned in Warm Golden Yellow + High-Contrast Black & White Graphic Art Style
 */

import type { AchievementCard } from './types';

const CARD_SIZE = 600;

/**
 * Draws a 1:1 square mode-specific achievement card onto Canvas 2D context.
 * Aesthetic: Warm Golden Yellow background, high-contrast B&W artwork, sharp black typography.
 */
export function drawAchievementCard(
  ctx: CanvasRenderingContext2D,
  card: AchievementCard
): void {
  // Clear canvas
  ctx.clearRect(0, 0, CARD_SIZE, CARD_SIZE);

  // 1. Warm Golden Yellow Background Fill (Matching Reference Image)
  ctx.fillStyle = '#F5A623';
  ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

  // 2. Brutalist Outer Black Framing Border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, CARD_SIZE - 32, CARD_SIZE - 32);

  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, CARD_SIZE - 48, CARD_SIZE - 48);

  // 3. Top-Left Header: Title & Subtitle/Mode in Solid Black
  const titleText = (card.title || 'ACHIEVEMENT BADGE').toUpperCase();
  ctx.fillStyle = '#000000';
  ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(titleText, 42, 60);

  const modeLabel = (card.modeLabel || `${(card.mode || 'standard').toUpperCase()} CHESS`).toUpperCase();
  const rarityLabel = (card.rarity || 'Common').toUpperCase();
  ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${modeLabel}  ·  ${rarityLabel}`, 42, 82);

  // 4. Vertical Right Edge Text (Rotated 90 degrees)
  ctx.save();
  ctx.translate(CARD_SIZE - 36, 120);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = '#000000';
  ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`MUGENCHESSX · VERIFIED ACHIEVER · ID:${(card.id || '000').slice(0, 10).toUpperCase()}`, 0, 0);
  ctx.restore();

  // 5. Central High-Contrast Black & White Illustration Box
  const boxX = 170;
  const boxY = 105;
  const boxW = 260;
  const boxH = 260;

  // Solid White Canvas for Character / Piece Illustration
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 5;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Inner Offset Frame
  ctx.lineWidth = 1.5;
  ctx.strokeRect(boxX + 6, boxY + 6, boxW - 12, boxH - 12);

  // Draw High-Contrast Black & White Vector Motif Artwork
  const motif = card.motifSymbol || '♔';
  ctx.fillStyle = '#000000';
  ctx.font = '120px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(motif, CARD_SIZE / 2, boxY + 170);

  // Crisp White Accent Highlights inside black motif box
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(boxX + 20, boxY + boxH - 28, boxW - 40, 4);

  // 6. Rating Callout Banner Box (White Box with Bold Black Border on Yellow)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(42, 385, 516, 62);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeRect(42, 385, 516, 62);

  ctx.fillStyle = '#000000';
  ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PREDICTED PERFORMANCE RATING', CARD_SIZE / 2, 404);

  const predictedRating = card.predictedRating ?? 500;
  const delta = card.ratingDelta ?? 0;
  const deltaSign = delta >= 0 ? `+${delta}` : `${delta}`;
  ctx.font = '900 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${predictedRating}  (${deltaSign} ELO)`, CARD_SIZE / 2, 434);

  // 7. Highlight & Description Container
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(42, 460, 516, 90);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(42, 460, 516, 90);

  const highlight = (card.highlight || `Rating: ${predictedRating}`).toUpperCase();
  ctx.fillStyle = '#000000';
  ctx.font = '900 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(highlight, CARD_SIZE / 2, 482);

  const description = card.description || 'Verified tactical achievement badge.';
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  drawWrappedText(ctx, description, CARD_SIZE / 2, 504, 480, 18);

  // 8. Footer Brand Tagline
  ctx.fillStyle = '#000000';
  ctx.font = '800 10px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('MUGENCHESSX OFFICIAL REWARD DECK · 1:1 SQUARE BADGE', CARD_SIZE / 2, 568);
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
