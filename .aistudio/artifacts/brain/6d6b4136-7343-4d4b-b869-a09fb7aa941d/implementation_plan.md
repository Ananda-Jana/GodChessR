# Culling Game Mobile UI Architecture & Rock-Solid Board Stabilization

Stabilize the Culling Game mode with a rock-solid, zero-fluctuation mobile layout, replace vertically shifting sidebars with a tabbed bottom-sheet drawer on mobile, pin a compact game-status header above the board, and integrate Web Audio sound effects, haptic vibration, and cursed aura visual effects.

> [!IMPORTANT]
> **Confirmed User Decisions**:
> 1. **Mobile Sidebar Structure**: Tabbed bottom sheet with quick-toggle icons (`Abilities`, `Logs & Moves`, `Inspector`, `Roster`), keeping desktop 3-column layout intact on `lg:` screens.
> 2. **Timers & Turn HUD**: Compact pinned header bar directly above the board, eliminating fluctuating trays.
> 3. **Sensory & Visual Polish**: Synthesized Web Audio cues, device haptic feedback (`navigator.vibrate`), and animated cursed aura glows for King checks, abilities, and move trails.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        COMPACT PINNED TOP BAR                          │
│  [Exit] Culling Game · White 09:42 [Turn: White] Black 09:30 [Flip] 📖 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                      ROCK-SOLID 10x10 BOARD                            │
│           (Fixed aspect ratio, 100dvh anchored, zero jitter,          │
│            touch-action: none, cursed aura glow effects)               │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                     MOBILE TABBED BOTTOM BAR                           │
│  [⚡ Abilities (2)]   [📜 Log & Moves]   [🔍 Inspector]   [👥 Roster]  │
├────────────────────────────────────────────────────────────────────────┤
│             SLIDE-UP BOTTOM SHEET (When active tab selected)           │
│  - Ability feed / SAN notation / Opponent last move / Piece inspector  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Overview & Core Concept

- **The Problem**: In mobile view, the board fluctuates up and down whenever pieces are tapped or moved. This occurs because variable-height sidebars (move announcements, ability toasts, piece viewers) are stacked vertically above and below the board in flex-column mode. In addition, browser address-bar resizing and Framer Motion layout bounding-box recalculations cause severe layout shifts.
- **The Solution**: 
  1. Lock the mobile layout to strict dynamic viewport height (`100dvh`) with `overflow-hidden` and `touch-action: manipulation / none`.
  2. Pin player timers and turn indicators into a compact, fixed top HUD directly above the board.
  3. Transform the left and right sidebars into a tabbed bottom-sheet navigation drawer on mobile viewports while preserving the 3-column desktop layout on larger screens.
  4. Ensure the board dimensions are derived from `min(calc(100dvh - 140px), calc(100vw - 16px))` with rigid CSS containment so piece selections never alter board coordinates.
  5. Add rich tactile feedback: Web Audio API sound synthesis (move, capture, ability chime, check warning), native haptic vibration, and anime-styled cursed energy glow overlays.

---

## 2. User Experience & Visual Design

### Mobile Layout Ergonomics (375px – 430px)
- **Zero Vertical Fluctuation**: The board container is anchored inside a dedicated, dimension-locked flex center with `contain: layout size` and `overscroll-behavior: none`. No content change in any drawer or log can alter the board's vertical coordinate.
- **Top Pinned Game HUD**:
  - Compact single row (height: 48px).
  - Contains: Exit button, Opponent timer chip, Turn badge with check pulse, User timer chip, Flip Board button, and Theory Book modal trigger.
- **Tabbed Bottom Action Sheet**:
  - Height: 54px pinned bottom navigation bar with 4 ergonomic thumb targets ($\ge 44\text{px}$ touch target):
    1. **Abilities** (`Zap` icon with notification badge if new techniques were unleashed).
    2. **Log & SAN** (`Send` / `FileText` icon showing move history and step announcements).
    3. **Inspector** (`Search` / `Eye` icon displaying Opponent's Last Move & User's Selected Piece with valid move guides).
    4. **Roster** (`Users` icon for quick piece monograph and moniker cards).
  - Tapping an active tab opens a smooth backdrop-blurred bottom sheet (height: 42% screen height) without moving the board underneath. Tapping again or pulling down dismisses it.
- **Desktop Layout Preservation**: On `lg:` screens ($\ge 1024\text{px}$), the responsive layout switches automatically to the spacious 3-column brutalist command center with left sidebar, center board, and right viewer panes.

### Cursed Energy Visual Flair & Motion
- **Check Aura**: When either Gojo (White King) or Sukuna (Black King) is checked, a pulsing crimson/obsidian cursed domain energy ring radiates beneath the King's square.
- **Special Ability Cast Aura**: When a special technique is unleashed (e.g. Limitless Teleport, Cleave Dash, Straight Rush, Mach 3), an electric blue or cursed purple radial burst illuminates the source and target squares.
- **Selected Piece Highlight**: High-contrast amber-gold energetic ring with subtle glow (`drop-shadow(0 0 6px #f59e0b)`).
- **Move Trail**: Last move start and destination squares retain an ethereal translucent amber tint that guides the eye without clutter.

### Tactile & Audio Synthesis (Web Audio API & Vibration)
- **Synthesized Sound Effects**: Built directly with browser `AudioContext` (no external audio assets required; zero latency, offline-ready):
  - `playSelectSound()`: Gentle 440Hz sine click (25ms).
  - `playMoveSound()`: Snappy 180Hz downward pitch sweep thud (40ms).
  - `playCaptureSound()`: Dual-tone resonant impact (60ms).
  - `playAbilitySound()`: Shimmering arpeggio chime (200ms) with cursed resonant filter.
  - `playCheckSound()`: Staccato dual-pulse warning tone.
  - `playGameOverSound()`: Triumphant or minor-chord resolution.
- **Haptic Vibration**:
  - `navigator.vibrate([12])` on square selection.
  - `navigator.vibrate([28])` on piece move/capture.
  - `navigator.vibrate([40, 30, 60])` on special ability activation.

---

## 3. Key Technical Decisions & Architecture

### Decision 1: Mobile Bottom-Sheet Navigation vs. Vertical Stacking
- **Chosen Approach**: Tabbed bottom bar (`fixed bottom-0 left-0 right-0 z-30`) with an overlay slide-up sheet (`fixed bottom-14 left-0 right-0 z-40 max-h-[45dvh]`).
- **Why**: Vertical stacking above/below the board caused continuous layout shifts whenever moves were logged or abilities triggered. An overlay drawer leaves the board strictly centered and immobile while keeping all information instantly accessible via 1-tap thumb navigation.
- **Alternatives Considered**: Floating modals (too disruptive during active turns); side slide-over panels (cuts off horizontal board width on portrait phones).

### Decision 2: Board Stabilization & Jitter Elimination
- **Chosen Approach**: 
  1. Enforce strict `100dvh` container with `overflow-hidden` on parent.
  2. Compute board dimensions using responsive math: `w-[min(calc(100dvh-150px),calc(100vw-16px),600px)] aspect-square`.
  3. Replace uncontrolled `layout` animation on all pieces in `CullingBoard.tsx` with smooth CSS coordinate transforms or targeted layout transitions to prevent parent reflow jitter.
  4. Apply `touch-action: manipulation` and prevent pull-to-refresh bounce.
- **Why**: Eliminates 100% of the up/down fluctuation reported by the user in mobile browsers.

### Decision 3: Zero-Asset Audio Engine
- **Chosen Approach**: Self-contained Web Audio API synthesizer module in `src/utils/cullingAudio.ts`.
- **Why**: Zero network latency, no external CDN dependencies that can fail or break, compliant with strict hermetic environments, and volume/mute toggleable.

---

## 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CullingMatchView.tsx                            │
│  - match state, timers, selection, bottom-sheet activeTab state        │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Pinned Header (Desktop + Mobile)                                    │
│    ├── Exit, Board Flip, Theory Book Modal, Resign                     │
│    └── Compact Player Status Chips (Turn, Clocks, Checks)              │
│                                                                        │
│ 2. Center Board Section (Fixed, Zero-Shift Anchor)                     │
│    └── CullingBoard.tsx                                                │
│        ├── 10x10 Cross-shaped board with aspect-ratio containment      │
│        ├── Piece selection & valid moves overlay                       │
│        └── Cursed aura glow highlights (Check, Ability, Trail)         │
│                                                                        │
│ 3. Responsive Information System                                       │
│    ├── Desktop (lg:flex): Left Sidebar + Right Sidebar                 │
│    └── Mobile (<lg): Tabbed Bottom Navigation + Slide-up Drawer        │
│        ├── Tab Bar: [Abilities] [Log & Moves] [Inspector] [Roster]     │
│        └── Drawer Content:                                             │
│            ├── Abilities: AbilityPopup stack with caster & tech details│
│            ├── Log: Step announcements + Algebraic SAN history         │
│            ├── Inspector: Opponent's Last Move + Selected Piece + Moves│
│            └── Roster: 16 Sorcerer character monographs & monikers     │
│                                                                        │
│ 4. Tactile & Sensory Utilities                                         │
│    ├── src/utils/cullingAudio.ts (Web Audio API sound generator)       │
│    └── navigator.vibrate haptic triggers                               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Implementation Sequence & Plan Execution

1. **Audio & Haptics Engine (`src/utils/cullingAudio.ts`)**:
   - Create lightweight Web Audio API sound generator with select, move, capture, ability, check, and game-over sound synthesis.
   - Wrap with mute check and safe `navigator.vibrate` calls.

2. **CullingBoard Stabilization (`src/components/CullingBoard.tsx`)**:
   - Remove disruptive layout animation that caused board jitter; optimize piece rendering.
   - Add cursed aura glow overlays for checks, ability targets, and move trails.
   - Ensure grid cell dimensions and touch targets are strictly locked with `touch-action: manipulation`.

3. **CullingMatchView Mobile Architecture (`src/components/CullingMatchView.tsx`)**:
   - Replace fluctuating trays with the compact pinned top HUD directly above the board.
   - Implement the mobile Tabbed Bottom Navigation (`Abilities`, `Logs`, `Inspector`, `Roster`) and backdrop slide-up sheet.
   - Keep desktop 3-column layout seamlessly enabled on `lg:` viewports.
   - Wire audio and haptic triggers into `handleMove`, piece selection, ability popups, check state, and match conclusion.

4. **Verification & Testing**:
   - Run `compile_applet` and verify zero TypeScript or build errors.
   - Verify layout responsiveness across mobile viewport (375px–430px) and desktop (1440px).
   - Verify zero vertical fluctuation on piece clicks and moves.
