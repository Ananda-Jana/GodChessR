# Implementation Plan - Redesign Downloadable Cards to Warm Golden Yellow & Black/White Style

Redesign the achievement cards rendered in the Trophy Room and PNG download exporter (`canvasCardRenderer.ts` & `TrophyRoomModal.tsx`) to match the user's reference design: a warm golden yellow card background, high-contrast black-and-white piece artwork in the center, clean top-left typography, and vertical right-edge branding text. All rating calculations, locking systems, stats, and download mechanisms remain completely unchanged.

## Proposed Changes

### 1. Canvas 2D Card Generator (`src/predictor/canvasCardRenderer.ts`)
- **Background**: Replace dark gradient fills with a rich warm golden yellow background (`#F5A623` / `#F59E0B`).
- **Center Artwork**: Render a central card frame with high-contrast black-and-white piece artwork (white fill + bold black outlines and details) instead of colored motifs or emojis.
- **Top-Left Typography**: Render title, mode origin badge, and rarity indicator in crisp bold black text in the top-left area.
- **Right Vertical Text**: Add clean vertical black text along the right border (e.g., `MUGENCHESSX · VERIFIED ACHIEVER`).
- **Stats & Rating Box**: Display the performance rating, ELO delta, and achievement highlights inside clean black-bordered white/black callout containers that stand out boldly on the yellow background.
- **PNG Download**: Ensure `downloadCardAsPng` exports 600×600 high-resolution PNGs matching this new visual layout.

### 2. Trophy Room Modal & Preview (`src/components/TrophyRoomModal.tsx`)
- **Card Preview**: Update the live Canvas preview container and surrounding card frame to display the warm golden yellow aesthetic.
- **Card Grid & Locked States**: Maintain the padlock icons, grayscale filter for locked cards, and selection logic while updating thumbnail card frames to use yellow accent borders and black-and-white piece thumbnails.
- **Download Action**: Keep the instant PNG download button (`downloadCardAsPng`), ensuring 1-click export of the newly designed card.

---

## Verification Plan

### Automated Tests
- Run `npm run test` and `npx tsx test/rbRulebookSnapshot.test.tsx` to verify no regressions in game state or test suites.
- Run `compile_applet` to confirm build succeeds cleanly.

### Manual Verification
1. Open **Trophy Room** from the Dashboard.
2. Select locked and unlocked cards across Standard, Culling, Rose Paradise, and Crafted modes.
3. Verify that the card preview displays a warm golden yellow background with crisp black-and-white piece artwork, top-left typography, and right vertical edge text.
4. Click **Download Card (PNG)** and verify the downloaded 600×600 image matches the new reference style.
