# Implementation Plan: Culling Game Rulebook Synchronization & In-Game Scrolling Fix

## Problem & Objectives
1. **Rulebook Culling Scenarios Synchronization**:
   - The scenarios in `src/components/rulebook/cullingAbilityScenarios.ts` previously contained non-canonical story descriptions (Hollow Purple rays, cursed energy meters, Cleave/Dismantle 8-directional wipes) rather than the actual ground-truth engine mechanics implemented in `src/game/cullingEngine.ts` and `src/components/CullingTheoryView.tsx`.
   - The user has mandated strict synchronization against `cullingEngine.ts` and `CullingTheoryView.tsx` without modifying the original rule files (`cullingEngine.ts`, `CullingTheoryView.tsx`, or `cullingRulesModal.tsx`), and without touching other game modes (such as Rose Paradise or standard modes).
   - Explanations must be functional and technical (leap radii, file-rank coordinate offsets, capture prerequisites, suppression radiuses), not story-based.

2. **Curved Vector Arrows & Piece Occlusion**:
   - Arrows on scenario cards must be thin with small arrowheads, arcing gracefully away from pieces rather than passing directly through centers or obscuring piece tokens.

3. **In-Game Modal Scrolling Fix**:
   - When opened inside a running active game (`CullingMatchView.tsx` or other active views), the Rulebook container suffered from flexbox overflow clipping (`min-h-0` omission) and fixed viewport boundary constraints.
   - The layout will be updated to a full-screen overlay with a sticky header and independent vertical scroll (`overflow-y-auto min-h-0 overscroll-contain`) that works reliably on both desktop and mobile viewports.

---

## User Review & Decision Confirmations
From our clarifying question exchange:
- **Rulebook Window presentation in active game**: Fullscreen overlay with sticky header and independent vertical scroll.
- **Scenario Explanation Format**: Pure technical specifications with leap radius, file-rank offsets, and capture rules.

---

## Proposed Changes

### 1. `src/components/rulebook/cullingAbilityScenarios.ts`
- Completely synchronize the scenarios to strictly reflect the 7 special Culling Game pieces and engine mechanics from `cullingEngine.ts` and `CullingTheoryView.tsx`:
  1. **Satoru Gojo / Ryomen Sukuna (Sovereign)**:
     - *Mechanic*: 1-step omnidirectional moves; **Domain Step** (Once per game: leap distance 2 in 8 directions to unattacked empty square, jumping intervening pieces; unavailable while in check; 5-turn initial Sovereign immunity).
     - *Technical offsets*: `(±2, 0)`, `(0, ±2)`, `(±2, ±2)`.
  2. **Yuji Itadori / Kenjaku (Vanguard)**:
     - *Mechanic*: Slides 1 to 3 squares in all 8 directions (no leaping). **Black Flash** (Stationary capture at distance 2 along ranks, files, or diagonals: enemy piece is eliminated, Vanguard does not move). Captures at distance 1 or 3 move normally.
     - *Technical offsets*: `(±2, 0)`, `(0, ±2)`, `(±2, ±2)` for in-place Black Flash capture; `1..3` square slides.
  3. **Kokichi Muta (Mechamaru) / Uraume (Artillery)**:
     - *Mechanic*: 1-step omnidirectional move. **Ranged Strike** (Stationary capture at distance 2 along straight/diagonal vectors if intermediate cell is empty; Artillery does not vacate origin).
     - *Technical offsets*: `(±2, 0)`, `(0, ±2)`, `(±2, ±2)` with empty midpoint `(±1, 0)`, `(0, ±1)`, `(±1, ±1)`.
  4. **Panda / Yorozu (Bulwark)**:
     - *Mechanic*: Knight L-jump leaps (`(±1, ±2)`, `(±2, ±1)`). **Shell Hardening** (First capture attempt on Bulwark fails, attacker halted on origin, shell breaks, opponent turn ends).
  5. **Kento Nanami / Reggie Star (Warden)**:
     - *Mechanic*: Slides 1 to 3 squares orthogonally. No diagonal moves, no leaps. **Ratio Field** (Suppresses all adjacent enemy pieces to max 1-square movement/capture, disables Artillery ranged strikes; Skirmishers immune).
  6. **Maki Zenin / Naoya Zenin (Skirmisher)**:
     - *Mechanic*: 1-step omnidirectional move OR 2-square orthogonal leap (`(±2, 0)`, `(0, ±2)`). **Heavenly Restriction** (100% immune to Warden Ratio Field suppression).
  7. **Kinji Hakari / Kurourushi (Rusher)**:
     - *Mechanic*: Slides up to 2 squares diagonally; steps 1 square orthogonally. **Idle Death Gamble Jackpot** (On executing capture, earns 1 bonus move with the same piece: 1-square non-capturing step to unattacked safe square).
- Replace all lore/story text with functional and technical definitions.

### 2. `src/components/rulebook/CullingAbilityScenarioCard.tsx`
- Ensure arrow SVG vectors use minimal stroke widths (`strokeWidth="1.5"`), compact arrowheads (`markerWidth="4" markerHeight="4"`), and quadratic bezier arcs that cleanly flank pieces rather than crossing piece bodies.
- Display technical offset pills: Leap radius, Target Square, Intermediate Cell Requirement, and Capture Status.

### 3. `src/components/rulebook/RulebookWindow.tsx`
- Fix scrolling architecture:
  - Add `min-h-0` to the `<main>` scroll container so flex children properly calculate scroll heights without clipping.
  - Set `z-[100]` on the root fixed overlay to guarantee it sits above all active in-game HUDs, predictor bars, and overlays.
  - Implement smooth, momentum-scrolling touch styles (`-webkit-overflow-scrolling: touch`, `overscroll-contain`) ensuring scroll works on mobile and desktop inside active game states.

---

## Verification Plan

### Automated Build & Lint Verification
- Run `npm run lint` via `lint_applet` to verify TypeScript typing and imports.
- Run `npm run build` via `compile_applet` to confirm zero compilation errors.

### Manual Verification Scenarios
1. **Rulebook from Dashboard**:
   - Open Rulebook, select Culling Game -> Movement & Ability Book.
   - Confirm scenarios display Gojo Domain Step, Yuji Black Flash, Mechamaru Ranged Strike, Panda Shell, Nanami Ratio Field, Maki Heavenly Restriction, Hakari Jackpot.
   - Verify coordinate offsets and leap indicators match `CullingTheoryView.tsx` 1:1.
2. **Rulebook Inside Active Game**:
   - Start Culling Game match (Bot or Multiplayer).
   - Click Rulebook button inside the active match.
   - Confirm modal covers screen with sticky header, and scrolling smoothly navigates down all scenarios without clipping or freezing.
3. **No Side Effects**:
   - Confirm `cullingEngine.ts`, `CullingTheoryView.tsx`, and `cullingRulesModal.tsx` remain completely untouched.
   - Confirm Rose Paradise and other modes remain unaffected.
