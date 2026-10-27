# Craft Your Own Game: Architecture & Delivery

A completely isolated, self-contained game mode built under `src/craftgame/` offering 5 playable chess variants (Micro Chess 3×3, Speed Chess 4×4, Rank War 8×2, One Lane 8×1, and Open Canvas 8×8 officer laboratory), calibrated bot difficulty levels (Rookie, Tactician, Punisher with Grandmaster bot bridge), and a high-energy neo-arcade UI.

## Status: COMPLETE & VERIFIED (0 errors)

---

## 1. System Overview

- **Isolated Layer**: Built exclusively inside `src/craftgame/` without altering core game loops, chest vaults, predictor contexts, or external rulesets.
- **Entry Point**: Replaced the previous Craft Theory / Piece Encyclopedia card on the Dashboard with the **Craft Your Own Game** launcher card triggering `<CraftGameHub>`.
- **5 Playable Variants**:
  1. **Micro Chess (3×3)**: Pocket skirmish with Rook, King, and Bishop; instant tactical win on King capture or checkmate.
  2. **Speed Chess (4×4)**: Hyper warfare with front-line pawns promoting to Queen on opposite ranks.
  3. **Rank War (8×2)**: Point-blank royal officer melee with zero pawn buffer.
  4. **One Lane (8×1)**: Single-track corridor tug-of-war with horizontal-only movement and knight jump leaps.
  5. **Open Canvas (8×8)**: Full 64-square battlefield with customizable back-rank officers (Prince, Supreme Rook, Priest, Communist).
- **3 Bot Tiers**:
  - **Rookie (600 ELO)**: Casual, 35% chance to blunder tactical opportunities.
  - **Tactician (1400 ELO)**: Fast 2-ply Minimax with material and positional evaluation.
  - **Punisher (1900 ELO)**: 3-ply Minimax with Alpha-Beta pruning on non-8×8 boards; automatically bridges to `punisherBot` (`chrome-reaper`) for full 8×8 Open Canvas matches.

---

## 2. Deliverables & File Architecture

### New Files Created in `src/craftgame/`:
1. **`craftGameTypes.ts`**: Strict TypeScript interfaces for boards, moves, pieces, variants, bot tiers, and match state.
2. **`craftGameVariants.ts`**: Configuration and initial board factories for all 5 variants with verified existing character avatars.
3. **`CraftGameEngine.ts`**: Autonomous chess engine supporting arbitrary width × height grids, legal move filtering, check/checkmate detection, and minimax evaluation.
4. **`CraftGamePieces.tsx`**: High-contrast SVG piece silhouettes for all standard and special pieces (Prince, Supreme Rook, Priest, Communist).
5. **`CraftGameBoard.tsx`**: Dynamic responsive board grid with coordinate indices, selection rings, legal move target pulses, and check alerts.
6. **`CraftGameMatchView.tsx`**: Turn-based match view with move ticker, captured piece trays, bot automation, sound responsive alerts, and game-over dialog.
7. **`CraftGameHub.tsx`**: Master selection modal featuring 5 variant cards and match setup drawer.
8. **`CraftGameBotBridge.ts`**: Bridge connecting 8×8 matches to the grandmaster `punisherBot` engine and routing others to minimax.
9. **`craftGame.css`**: Scoped `.cg-` animation and layout rules.

### Surgical Edit in `src/components/Dashboard.tsx`:
- Imported `CraftGameHub`.
- Added `const [isCraftGameHubOpen, setIsCraftGameHubOpen] = useState(false)`.
- Replaced the Craft Theory button card with the **Craft Your Own Game** entry button.
- Rendered `<CraftGameHub isOpen={isCraftGameHubOpen} onClose={() => setIsCraftGameHubOpen(false)} />` alongside other root modals.

---

## 3. Verification Results

- **`tsc --noEmit`**: 0 errors.
- **`compile_applet`**: Build succeeded cleanly.
- **Zero-touch rule honored**: No edits to `src/game/**`, `src/punisher/**`, `src/chest/**`, `src/secret/**`, `src/context/**`, or server files.
