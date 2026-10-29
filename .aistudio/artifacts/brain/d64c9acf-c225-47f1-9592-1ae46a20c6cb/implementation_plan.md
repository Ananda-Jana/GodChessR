# Quick Access Drawer Game Mode Square Buttons Refinement

Refine the game mode buttons inside the mobile Quick Access Drawer so images cleanly fill each 10px rounded square button with zero padding, an integrated bottom text overlay, and semi-bold typography.

> [!IMPORTANT]
> All drawer geometry, sliding animation, popup positioning, bottom navigation bar styles, and desktop views remain 100% untouched. Edits are strictly isolated to the mode square buttons inside the mobile quick access drawer.

## Confirmed User Preferences & Decisions

- **Corner Radius**: 10px rounded corners (`rounded-[10px] overflow-hidden`) applied to the outer button container so background images are cleanly capped at all four corners without sharp edges.
- **Image Fit & Padding**: Zero padding around images (`p-0`). Images fill 100% of each square button (`w-full h-full object-cover`).
- **Gradient Overlay**: Smooth dark gradient covering the bottom 45% of each square button (`h-[45%] bg-gradient-to-t from-black/90 via-black/40 to-transparent`).
- **Typography**: White semi-bold text (`text-white font-semibold text-[10px] sm:text-[11px] leading-tight`) floating fixedly over the bottom portion of the gradient fade.

---

## 1. User Experience & Visual Design

### Quick Access Mode Square Anatomy

```
┌─────────────────────────────────┐
│ 10px Rounded Container          │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │   Full-bleed Mode Image     │ │
│ │    (object-cover, 100%)     │ │
│ │                             │ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │ <- Bottom 45% Black Gradient Fade
│ │    [ Mode Name Text ]       │ │ <- White Semi-Bold Text (font-semibold)
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

- **Container Styling**: `aspect-square relative w-full h-full rounded-[10px] overflow-hidden border border-white/15 p-0 bg-zinc-950 flex items-center justify-center`
- **Image Tag**: `w-full h-full object-cover rounded-[10px]`
- **Gradient Layer**: `absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10`
- **Label Layer**: `absolute bottom-1.5 inset-x-1 z-20 text-center text-white font-semibold text-[10px] sm:text-[11px] leading-tight drop-shadow-md truncate`

---

## 2. Component & Implementation Strategy

### Targeted File: `src/components/Dashboard.tsx`

1. **`DropupThumb` & Button Container Structure**:
   - Update `.play-dropup-item` CSS and inline button JSX inside `isMobileNavDropdownOpen` grid to use `p-0` zero padding and 10px rounded corners.
   - Restructure `DropupThumb` component so the `<img />` takes full width/height inside `rounded-[10px]` container, clipping all four corners cleanly.
   - Move mode labels from below the image thumbnail into an absolute overlay positioned over the bottom 45% dark gradient.

2. **Typography Discipline**:
   - Replace heavy `font-black` with `font-semibold` (semi-bold) as specifically required by the user brief.
   - Apply `text-white` with subtle text shadow (`drop-shadow-md`) for optimal contrast over dark gradients across all game mode images (Bot Match, Punisher AI, Classic Bot, Crafted Bot, Culling Game, Hashira Dojo, 3D Arcade, Rose Paradise, Secret Arena, Rulebook, Trophy Vault, All Modes).

3. **Non-Regression Verification**:
   - Verify bottom navigation bar height, position, and icons remain untouched.
   - Verify drawer slide-up animation and drop-up menu bounds remain untouched.
   - Verify non-mobile/desktop screens remain unchanged.

---

## 3. Verification Plan

- Run `lint_applet` (`npm run lint`) to confirm zero TypeScript/ESLint errors.
- Run `compile_applet` (`npm run build`) to ensure build pipeline integrity.
