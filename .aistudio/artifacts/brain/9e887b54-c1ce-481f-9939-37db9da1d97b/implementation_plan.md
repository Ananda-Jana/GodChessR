# Mobile Responsive Refactor: Culling Opening Dojo — Mobile Console Architecture

Redesign and re-architect the **Culling Opening Dojo** (`src/training/CullingOpeningDojo.tsx`) mobile interface into a responsive, touch-first mobile console. The fixed 88-square Culling board sits centered in the viewport without overflow or clipping, flanked by a 44px collapsible top navigation strip, a dedicated small box view for Sensei Tukuna's instruction, and a fixed 48px bottom step action bar.

---

## Confirmed User Decisions

> [!IMPORTANT]
> The following design decisions govern this refactor:

- **Confirmed Top & Bottom Navigation**: Compact 44px top header with dropdown menus + 48px fixed bottom action bar for step controls.
- **Confirmed Sensei Tukuna Instruction Box**: **Always visible small box view** (shallow 56px–64px box directly above the bottom controls bar) showing Tukuna's tactical instruction and hint without hiding or collapsing behind drawers.
- **Confirmed Board Fitting Strategy**: Dynamic viewport fitting calculated via `ResizeObserver` so the 10x10 cross Culling board fits cleanly without clipping or unwanted page scrolling on mobile viewports ($375\text{px}$–$430\text{px}$).

---

## 1. Overview & Core Concept

**Culling Opening Dojo** is an interactive 88-square training environment where users practice 16 tactical opening and mid-game lessons guided by Sensei Tukuna. On mobile devices, the existing desktop multi-column layout led to vertical scrolling, clipped board edges, and scattered button controls.

The refactored mobile UI turns the Dojo into a **Brutalist Touch Console**:
1. **Fixed Viewport Stage (`100dvh` Non-Scrollable Base)**: The board remains permanently fixed in the screen center.
2. **Compact Collapsible Top Header (44px)**: Houses curriculum selection, trainer toggles, and rules/theory modals inside dropdown overlays instead of cluttered button rows.
3. **Responsive Board Stage**: Uses a container size observer (`ResizeObserver`) to calculate exact square dimensions ($18\text{px}$–$34\text{px}$) so the entire cross-board fits within the calculated available height.
4. **Always-Visible Small Box View for Sensei Tukuna (56px–64px)**: Positioned directly above the bottom bar, displaying Tukuna's avatar, active instruction, tactical note, and hint in a crisp, compact brutalist container that never covers the board or collapses.
5. **Fixed Bottom Action Bar (48px)**: Anchors step navigation (`Prev Step`, `Next Step`, `Reset`, `Auto-Play`) in the natural thumb reach zone.

---

## 2. User Experience & Visual Design

### Visual Identity & Brutalist Theme
- **Background**: Deep obsidian canvas (`#000000`, `var(--bg-card)`).
- **Board Styling**: Dark red/crimson squares (`#BC1434`), slate light squares (`#475569`), brutalist 3px outer border (`var(--border)`).
- **Touch Target Ergonomics**: All interactive buttons meet or exceed $44 \times 44\text{px}$ touch target hitboxes.
- **Typography**: `Plus Jakarta Sans` for headers, `JetBrains Mono` for tabular step indicators (`STEP 03 / 08`), `DM Sans` for Sensei commentary.

### Mobile Viewport Structure (`< 768px`)

```
+-------------------------------------------------------------+  ^ 44px Top Header
| [Dojo Menu ▾]       LESSON 03 / 16          [Rules ▾] [Reset]|  | (Dropdown overlays)
+-------------------------------------------------------------+  v
|                                                             |  ^
|                     +---------------+                       |  |
|                     | CULLING BOARD |                       |  | Fixed Board Stage
|                     | (Fitting via  |                       |  | (Calculated via
|                     | ResizeObserver|                       |  |  ResizeObserver)
|                     +---------------+                       |  |
|                                                             |  v
+-------------------------------------------------------------+  ^ 56px Small Box View
| 💬 Tukuna: Push F2 pawn to F3 to secure flank.              |  | (Always Visible)
+-------------------------------------------------------------+  v
|  [◀ Prev]   [ STEP 3 OF 8 ]   [▶ Next]   [ Auto-Play ▶ ]    |  ^ 48px Bottom Bar
+-------------------------------------------------------------+  v
```

---

## 3. Key Product Decisions & Implementation Details

### Decision 1: Available Height Calculation via `ResizeObserver`
- **Chosen Approach**: A dedicated wrapper `div` (`boardStageRef`) with `ResizeObserver` measures available height (`clientHeight`) and available width (`clientWidth`) minus top header (44px), Tukuna small box (56px), and bottom bar (48px).
- **Math**: $\text{squareSize} = \lfloor \frac{\min(\text{availableWidth}, \text{availableHeight})}{10} \rfloor - 1$.
- **Why**: Ensures 100% fitting without clipping or horizontal overflow on all screen sizes from $360\text{px}$ to $430\text{px}$ iPhones and Android devices.

### Decision 2: Dropdown Menu System for Mobile Top Bar
- **Chosen Approach**: Replace raw horizontal button rows with 3 compact dropdown menus:
  - **Curriculum & Lesson Picker Menu**: Select between Opening Dojo (1-8) and Mid-Game Strategy (9-16).
  - **Dojo Tools Menu**: Toggle Theory Library, Vector Overlay toggles, and Trainer selection.
  - **Rules & Info Menu**: Open Culling Rulebook modal or Reset current step.
- **Why**: Keeps top bar height strictly at 44px ($\le 15\%$ mobile sticky cap rule), freeing up maximum vertical screen real estate for the board.

### Decision 3: Always-Visible Sensei Tukuna Small Box Panel
- **Chosen Approach**: A shallow, non-collapsible small box container (56px–64px height) placed between the board stage and the bottom action bar:
  - Features Tukuna's avatar icon, lesson step notation badge, and clear instruction text in a single readable block.
  - Includes a subtle "Hint" toggle button that overlays a brief hint inside the small box if requested.
  - Always visible on mobile viewports so pupils get immediate tactical guidance without extra taps.

---

## 4. Technical Architecture & File Modifications

### Modified Components
- **`src/training/CullingOpeningDojo.tsx`**:
  - Add mobile viewport detection (`isMobile`, `activeDropdown`, `showHint`).
  - Implement `ResizeObserver` stage geometry calculation hook taking into account header (44px), Tukuna small box (56px), and bottom bar (48px).
  - Render compact 44px top header on mobile with dropdown popovers (`motion.div` transitions).
  - Render fixed board container with calculated `squareSize`.
  - Render always-visible 56px Sensei Tukuna small box panel.
  - Render 48px bottom action bar with `Prev`, `Step X/Y`, `Next`, and `Auto-Play` controls.
  - Preserve 3-column desktop layout (`hidden md:grid`) intact.

---

## Verification Plan

1. **Build & Lint**:
   - Run `npm run lint` (`tsc --noEmit`) to verify zero TypeScript errors.
   - Run `compile_applet` to confirm successful build.
2. **Automated Test Suite**:
   - Run `npm test` to verify all 16 Dojo lessons and Culling engine tests pass 100%.
3. **Mobile Viewport Testing**:
   - Verify non-scrollable viewport fitting at $375\text{px}$ (iPhone SE / mini), $390\text{px}$ (iPhone 12/13/14), and $412\text{px}$ (Pixel / Samsung Galaxy).
   - Verify Sensei Tukuna's suggestion box is continuously visible in a small box view above the bottom controls.
