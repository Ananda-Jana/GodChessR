# Mobile UI Architecture: Chess Hashira Training Game Console

A dedicated, responsive UI architectural overhaul transforming the mobile Hashira Training screen into a brutalist mobile game console. This plan eliminates mobile clipping, removes oversized headers and duplicate controls, establishes a strict 4-row mobile layout grid, calculates dynamic board bounds to ensure 100% board visibility across all screen sizes (320px–430px wide, 568px–932px tall), and preserves the desktop three-column studio without regression.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Summary of Key Architectural Decisions:**
> - **Mobile Viewport (`< lg`)**: Converted into a purpose-built game console with a strict 4-row grid (`44px` top nav, `~68px` Sensei strip, `minmax(0, 1fr)` dynamic board stage, `48px` bottom bar + safe areas).
> - **Zero-Scroll Invariant**: All gameplay screens (Opening, Tactical, Culling, Practice Sandbox/Sparring) are strictly non-scrollable (`overflow-hidden`, `h-[100dvh]`). Reading screens (Theory Library) retain natural scrollability.
> - **Top Navigation**: Replaced the previous bulky header with a single 44px strip containing a compact back button and three equal-width dropdown triggers (`RANK`, `DOJO`, `LESSON`) that open floating overlays without shifting the gameplay layout.
> - **Sensei Panel**: Refactored into a shallow 68px horizontal communication strip (48px avatar + concise message), removing duplicate action buttons which now live exclusively in the bottom bar.
> - **Dynamic Board Sizing**: Implemented a responsive container measurement in the board stage so the board renders at `min(availableWidth, availableHeight)`, ensuring all 8 ranks/files and the Culling Game cross are completely visible without cropping on any device.
> - **Desktop Invariant**: The desktop 3-column layout (`lg:` breakpoint) remains completely preserved.

---

## 1. Overview & Core Concept

- **What It Does**: Renders the Master Chess Hashira Training Dojo as a high-performance, compact brutalist game console on mobile devices, ensuring the chessboard remains the dominant, fully visible focal anchor while keeping Sensei guidance and martial navigation accessible in single-tap overlays.
- **Target Audience**: Chess pupils and mobile gamers training tactics, openings, culling forms, and bot sparring on mobile devices without fighting page scrolling or clipped board squares.
- **Key Value**: Immediate tactical clarity, zero layout shifts, zero page scrolling, and full visual accessibility across all mobile viewports from iPhone SE (320x568) to iPhone 15 Pro Max (430x932).

---

## 2. User Experience & Visual Design

### Mobile Layout Hierarchy & Proportions
The mobile interface strictly allocates vertical space according to the game console hierarchy:

```
┌────────────────────────────────────────────────────────┐
│ [<]  [  RANK: 癸 MIZUNOTO ▼ ] [ DOJO: ⛩️ ▼ ] [ KATA (8) ▼] │  44px (Top Nav Strip)
├────────────────────────────────────────────────────────┤
│ [AVATAR] "Advance your knight to control the center!"  │  68px (Shallow Sensei Strip)
├────────────────────────────────────────────────────────┤
│                                                        │
│                    CHESSBOARD STAGE                    │
│             width: min(stageW, stageH)                 │  Remaining (1fr)
│                 aspect-ratio: 1 / 1                    │  (e.g., 340px–370px)
│               100% visible, centered                   │
│                                                        │
├────────────────────────────────────────────────────────┤
│ Kata #1: Tiger's Stride     [Hint] [Reset] [Next]     │  48px + safe area (Bottom Bar)
└────────────────────────────────────────────────────────┘
```

### Visual Identity & Theme Tokens
- **Canvas Background**: `#070709` (near-black tactical dojo).
- **Surface Elevation**: `#0c0c10` (card surface), `#121216` (dropdown overlay surface).
- **Hairline Borders**: `1px solid rgba(255, 255, 255, 0.15)` and `2px solid #000000` with subtle golden highlights (`border-amber-400`).
- **Accent Tokens**: Amber gold (`#f59e0b` / `#fbbf24`) for active states, selected ranks, and golden guide indicators.
- **Typography**: Bold condensed uppercase headers, clean tabular numerals (`tabular-nums`), 11–12px readable dialogue prose.

### Dropdown Overlay Architecture
- Tapping `RANK`, `DOJO`, or `LESSON` opens an absolute dropdown panel positioned at `top: 44px`.
- Fixed z-index (`z-50`) with backdrop scrim, thin amber border, max height `50dvh`, and internal scrolling only when item count exceeds height.
- Auto-closes immediately upon option selection or tap outside, causing zero shift to the board dimensions.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Relocating Actions Exclusively to the Bottom Bar**
  - *Chosen Approach*: Remove `Hint`, `Reset`, and `Next` buttons from the mobile Sensei panel; place them exclusively in the single-stripe bottom bar alongside the truncated lesson title.
  - *Why*: Eliminates control duplication, saves 60px of vertical space, and places the primary action buttons within the ergonomic thumb zone.
- **Decision 2: Measured Stage Dimensions for the Board**
  - *Chosen Approach*: Use a `ResizeObserver` on the central board stage container to measure exact available width and height, passing the resulting clamped dimension (`Math.min(width, height) - padding`) to `InteractiveKataBoard` and `PracticeBoard`.
  - *Why*: CSS `w-full aspect-square` caused vertical overflow whenever the viewport height was restricted. Calculating from both axes guarantees 100% visibility on all phone aspect ratios.
- **Decision 3: Dedicated Mobile Mode in `HashiraMentor`**
  - *Chosen Approach*: Add `layout="mobile-console"` (or refine `compact`) in `HashiraMentor.tsx` to render a 68px horizontal bar (avatar on left, 11px message on right) without the large title bar and action buttons.
  - *Why*: Keeps Sensei Gensei's dynamic facial expressions and voice without dominating screen real estate.

---

## 4. Technical Architecture & Component Structure

### Component Hierarchy Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     HashiraTrainingView                      │
├──────────────────────────────────────────────────────────────┤
│ Desktop (lg:):                                               │
│ ┌──────────────────┬───────────────────┬───────────────────┐ │
│ │ HashiraMentor    │ Center Board      │ Dojo / Katas List │ │
│ │ (Vertical 320px) │ Stage (Flex)      │ (Sidebar 288px)   │ │
│ └──────────────────┴───────────────────┴───────────────────┘ │
│                                                              │
│ Mobile (< lg):                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Top Nav Strip (44px) [Back] [Rank ▼] [Dojo ▼] [Lesson ▼] │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ Sensei Banner (68px) [Avatar 48px] [Dialogue Text]       │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ Board Stage (1fr, measured via ResizeObserver)           │ │
│ │  -> InteractiveKataBoard / PracticeBoard (Clamped Size)  │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ Bottom Bar (48px + pb-safe) [Title] [Hint] [Reset] [Next]│ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Files Targeted for Polish
1. `/src/training/HashiraTrainingView.tsx`:
   - Implement the 4-row mobile grid (`grid-template-rows: 44px auto minmax(0, 1fr) auto`).
   - Implement stage dimension measurement via `ResizeObserver` for pixel-perfect board clamping.
   - Refactor top navigation into 3 equal-width dropdown triggers with popover menus.
   - Configure bottom bar with truncated lesson title, compact action buttons (32px height), and `pb-[env(safe-area-inset-bottom)]`.
   - Preserve desktop 3-column studio layout.
2. `/src/training/HashiraMentor.tsx`:
   - Add/optimize `mobile-console` layout mode: 48px square avatar, clean status tag, single dialogue box with `line-clamp-2` or `line-clamp-3`, strictly $\le 72\text{px}$ total height.
   - Omit duplicate action buttons when in mobile layout mode.
3. `/src/training/InteractiveKataBoard.tsx`:
   - Accept optional `boardMaxDimension?: number` prop.
   - Clamp the outer board container using `style={{ width: boardSize, height: boardSize }}` when provided.
   - Ensure step status and guidance indicators are integrated compactly without forcing page expansion.
4. `/src/training/PracticeBoard.tsx`:
   - Adopt responsive board sizing so sandbox and sparring bot modes fit within the mobile console without clipping.

---

## 5. Verification Plan

1. **Compilation & Typing**: Run `compile_applet` and `lint_applet` to confirm 0 build errors.
2. **Mobile Viewport Testing**:
   - iPhone SE / Small screen: 320 × 568 px.
   - Standard Android: 360 × 640 px.
   - Modern iPhone: 390 × 844 px.
   - Large mobile: 430 × 932 px.
3. **Scroll Verification**: Verify zero page-level or internal accidental scrolling during active gameplay.
4. **Board Visibility**: Verify every rank (1-8), file (a-h), piece, move indicator, and golden guide highlight is 100% visible.
5. **Dropdown Behavior**: Test tapping `RANK`, `DOJO`, and `LESSON` to ensure dropdowns open as overlays and close on selection without shifting the board.
6. **Actions & Feedback**: Verify `Hint`, `Reset`, and `Next` function accurately from the bottom navigation bar.
7. **Game Mode Compatibility**: Test Standard, Crafted, Culling Game (cross board), and Theory Library (which retains scrolling).
8. **Desktop Preservation**: Verify desktop 3-column studio remains completely unchanged.
