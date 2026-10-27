# Custom Lane Chessing Mode: Architecture & Mobile Responsiveness

A completely isolated, self-contained game mode built under `src/craftgame/` offering 5 playable chess variants (Micro Chess 3×3, Speed Chess 4×4, Rank War 8×2, One Lane 8×1, and Open Canvas 8×8 officer laboratory), calibrated bot difficulty levels (Rookie, Tactician, Punisher with Grandmaster bot bridge), and a high-energy neo-arcade UI.

## Status: COMPLETE & VERIFIED (0 errors)

---

## 1. System Overview & Renaming

- **New Identity**: Renamed from "Craft Your Own Game" to **Custom Lane Chessing Mode** across the Dashboard card, modal headers, hub navigation, and status badges.
- **Mobile View Responsiveness (Zero Desktop Impact)**:
  - **Quick Variant Carousel on Mobile (`lg:hidden`)**: A horizontally scrollable tab bar allows players to switch variants instantly without scrolling past 5 large cards.
  - **Sticky Action Launch Bar on Mobile (`lg:hidden`)**: A persistent bottom bar with active variant preview and immediate "Launch Match" button ensures one-tap access anywhere on the screen.
  - **Dynamic Board Fitting**: `CraftGameBoard` adapts dynamically to both viewport width and viewport height using `calc(100dvh - 220px)`, guaranteeing the full board and player cards fit on any mobile display (including iPhone SE) without vertical page scrolling during moves.
  - **Piece Sizing & Touch Targets**: Board square padding reduced to `p-0.5 sm:p-1.5 md:p-2` on mobile, increasing SVG piece size and clarity by ~25%.
  - **Desktop View Preserved**: The two-column 12-grid layout on desktop (`lg:grid lg:grid-cols-12`) remains 100% intact with the full 5-card grid on the left and sticky Battle Configuration Panel on the right.

---

## 2. 5 Playable Variants & Rules

1. **Micro Chess (3×3)**: Pocket skirmish with Rook, King, and Bishop; instant tactical win on King capture or checkmate.
2. **Speed Chess (4×4)**: Hyper warfare with front-line pawns promoting to Queen on opposite ranks.
3. **Rank War (8×2)**: Point-blank royal officer melee with zero pawn buffer.
4. **One Lane (8×1)**: Single-track corridor tug-of-war with horizontal-only movement and knight jump leaps.
5. **Open Canvas (8×8)**: Full 64-square battlefield with customizable back-rank officers (Prince, Supreme Rook, Priest, Communist).

---

## 3. Verification Results

- **`tsc --noEmit`**: 0 errors.
- **`compile_applet`**: Build succeeded cleanly.
- **Zero-touch rule honored**: Only `Dashboard.tsx` (card title & button rename) and `src/craftgame/**` were touched.
