# Mobile Dashboard PLAY Button & Drop-Up Menu Refinement

A targeted UI refinement for the mobile dashboard (`md:hidden`) bottom navigation bar and its quick access drop-up menu. This update modifies the central `PLAY` button to be square-shaped with `20px` rounded squircle corners, applies `20px` border-radius across its CSS layers, and ensures the drop-up menu is horizontally centered on the mobile viewport.

## User Review & Critical Decisions

> [!IMPORTANT] All changes are strictly UI-only and constrained exclusively to `/src/components/Dashboard.tsx`. No other files, components, or game logic are touched.

- **Square-Shaped PLAY Button**: Changed from wide rectangular (`112px × 50px`) to a square squircle (`52px × 52px`).
- **20px Border Radius Discipline**: All button wrapper layers (`.play-glass-button`, `.play-glass-molten`, `.play-glass-corner-bloom`, `.play-glass-gleam`) updated to `border-radius: 20px`.
- **Centered Drop-Up Menu**: Positioned smoothly at the horizontal center of the mobile screen (`left-1/2 -translate-x-1/2 w-[92vw] max-w-sm`).

---

## 1. Overview & Core Concept

- **What It Does**: Refines the mobile bottom navigation bar's central trigger into a square fiery-glass keycap with smooth `20px` bent corners and centers the drop-up quick access menu when opened.
- **Scope**: Mobile responsive view only (`md:hidden`), strictly within `/src/components/Dashboard.tsx`.
- **Key Value**: Clean, balanced visual ergonomics on mobile touch screens with responsive centering.

---

## 2. User Experience & Visual Design

- **PLAY Button Styling**:
  - Dimensions: `52px × 52px` square.
  - Corner Radius: `20px` border radius across all glass and glow layers.
  - Fiery Glass Aesthetic: Dark translucent upper body (`#0A0808` to `#100A09`), fiery molten amber/red bottom illumination (`#EF4216`, `#FF7818`), warm-white rim highlight (`#FFF0CC`), and top specular glass reflection.
  - Label: Clean, crisp `PLAY` typography in `#FFF8F0`, 12px, weight 850, letter-spacing 1.2px, uppercase.
  - Animations:
    - `playGlassGleam`: Continuous diagonal glass gleam sweep.
    - `playMoltenFlow`: Moving molten light flow across the lower interior.
    - `playAmbientBreath`: Soft ambient breathing external glow.
- **Centered Drop-Up Menu**:
  - Horizontal Position: `left-1/2 -translate-x-1/2 w-[92vw] max-w-sm` anchored directly above the central PLAY button.
  - Downward Caret Pointer: Centered at `left-1/2 -translate-x-1/2`.
  - Non-Modal Behavior: Smooth upward slide-in (`playMenuSlideUp`) with transparent click-outside dismisser.
  - Preserved Menu Items: All 9 quick-access modes (All Modes, Matches, Players, Culling, Rose Paradise, 3D Arcade, Masters, Rules, Trophies & Chests) remain completely intact.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Square Proportion (`52px × 52px`)**:
  - *Chosen Approach*: `52px × 52px` square size with `20px` border radius.
  - *Why*: Fits naturally in the 5-column mobile navigation bar grid without crowding adjacent tab items, fulfilling the user's request for a square button with bent corners.
- **Decision 2: Strict Single-File Scope**:
  - *Chosen Approach*: Touch only `/src/components/Dashboard.tsx`.
  - *Why*: Fulfills the explicit user mandate to avoid touching any other file or game logic.

---

## 4. Technical Architecture & Data Strategy

```
[ MOBILE VIEWPORT (375px - 430px) ]

+-------------------------------------------------------+
|  DROP-UP QUICK ACCESS MENU (Centered: left-1/2)       |
|  bg: rgba(10,8,8,0.94) | border: 20px radius          |
|  [All Modes]  [Matches]  [Players]  [Culling]  ...    |
+-------------------------------------------------------+
                           /\ (Centered Caret)
+-------------------------------------------------------+
| FIXED BOTTOM NAVIGATION BAR (h-16)                    |
| [Play]   [Matches]   [  PLAY  ]   [Hashira]  [Trophies]|
|                       (52x52px                        |
|                       20px radius)                    |
+-------------------------------------------------------+
```

- **CSS Updates**:
  - Update `.play-glass-button` width and height from `112px / 50px` to `52px / 52px`.
  - Update `border-radius: 20px` in `.play-glass-button`, `.play-glass-molten`, `.play-glass-corner-bloom`, `.play-glass-gleam`.
  - Ensure `.play-dropup-menu` has `left-1/2 -translate-x-1/2` centering on the screen.
