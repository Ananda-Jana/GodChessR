# Home Profile Box Session Stats, Mobile View & Performance-Weighted 500 ELO Rating Engine

Fixes session statistics (Wins, Losses, Draws) tracking and real-time updates in the home page Profile Box across desktop and mobile viewports. Sets the default initial Predicted ELO rating baseline to **500** for new accounts and overhauls the ELO rating engine to apply performance-weighted deltas in high-impact ranges (+50 to +200 / -50 to -200) based on move quality, margin of victory, and tactical achievements.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> All user requirements and clarified preferences from Turn 1 are incorporated into this implementation blueprint.

- **Confirmed Decision 1 (Profile Box Mobile Positioning)**: The Profile Box will remain in its exact existing position on the home screen layout, ensuring full visibility and responsiveness on mobile viewports without vertical shifts or scroll bug regressions.
- **Confirmed Decision 2 (Dynamic ELO Adjustment Engine)**: ELO adjustments will use a performance-weighted scale ranging from **+50 to +200** for victories and **-50 to -200** for losses, driven by move tactical quality, captures, turns survived, opponent difficulty, and special abilities.
- **Confirmed Decision 3 (Initial Rating Baseline)**: New accounts / zero-game sessions start at an initial baseline of **500 ELO** (with minimum rating floor reduced to 100 ELO).

---

## 1. Overview & Core Concept

### What It Does
1. **Live Profile Box Stats**: Binds the home page profile card directly to the `PredictorContext` state so Wins, Losses, and Draws actively increment and render in real time whenever a match concludes across any game mode (Grandmaster Bot, PvP, Crafted Bot, Culling Game, Rose Paradise).
2. **Prominent ELO Rating Display**: Adds a dedicated Brutalist Amber rating badge in the Profile Box highlighting the user's current Predicted Skill Rating (e.g., `500 ELO`).
3. **500 Baseline & Dynamic ELO Scaling**: Sets initial account rating to 500 ELO. Replaces subtle ±5-18 rating changes with dynamic, high-impact range deltas (+50 to +200 / -50 to -200) based on performance evidence.
4. **Mobile & Desktop Layout Stability**: Guarantees non-overlapping, fixed-container geometry on mobile and desktop viewports so no unwanted page shifts or scrolling occurs.

---

## 2. User Experience & Visual Design

### Profile Box Styling & Layout
```
┌────────────────────────────────────────────────────────┐
│  [AVATAR]  ANANDA JANA                                  │
│            @anandajana                     [EDIT PROFILE]│
├────────────────────────────────────────────────────────┤
│ 🏆 PREDICTED RATING: 500 ELO          [SESSION ACTIVE] │
├────────────────────────────────────────────────────────┤
│ ┌──────────────┐   ┌──────────────┐   ┌──────────────┐ │
│ │   0 WINS     │   │   0 LOSSES   │   │   0 DRAWS    │ │
│ │  (EMERALD)   │   │  (NEUTRAL)   │   │   (AMBER)    │ │
│ └──────────────┘   └──────────────┘   └──────────────┘ │
└────────────────────────────────────────────────────────┘
```
- **Color Palette & Accents**: High-contrast Brutalist theme with `#F59E0B` (Amber) rating highlight badge, `#10B981` (Emerald) wins text, bold borders (`border-2` / `border-3`), and hard drop-shadows (`shadow-[5px_5px_0px_#000]`).
- **Mobile Responsiveness**: Preserved layout in `Dashboard.tsx` left column (`lg:col-span-4`), rendered seamlessly on both mobile screens and desktop monitors without extra vertical padding shifts.

---

## 3. Key Product Decisions & Trade-Offs

### 1. Combined Real-Time Session & Auth Stats
- **Approach**: Combine the server `user.stats` baseline with `predictorState.wins`, `predictorState.losses`, and `predictorState.draws`.
- **Rationale**: Guarantees immediate UI updates after every game conclusion without requiring server round-trips or full page refreshes.

### 2. High-Impact Performance-Weighted ELO Formula
- **Approach**:
  - `Win Delta`: $+50$ (close win) to $+200$ (flawless high-quality win / Grandmaster defeat).
  - `Loss Delta`: $-50$ (valiant high-tactical loss) to $-200$ (swift defeat).
  - `Draw Delta`: $+20$ to $+50$ (tactical draw).
- **Rationale**: Gives players immediate, gratifying rating feedback for strong tactical play and decisive victories.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PREDICTOR CONTEXT                              │
│   • initialRating: 500 ELO                                              │
│   • wins, losses, draws tracking                                        │
│   • finalizeMatch() -> updates W/L/D and calculates high-impact ELO      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           RATING ENGINE                                 │
│   • calculateMoveRatingUpdate()                                         │
│   • applyMatchResultAdjustment(): Range [+50..+200] / [-50..-200]       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DASHBOARD PROFILE BOX                            │
│   • Total Wins  = user.stats.wins   + predictorState.wins               │
│   • Total Loss  = user.stats.losses + predictorState.losses             │
│   • Total Draw  = user.stats.draws  + predictorState.draws              │
│   • ELO Rating  = predictorState.currentRating                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Affected Files
1. `src/predictor/ratingEngine.ts`:
   - Set `INITIAL_BASELINE_RATING = 500` and `MIN_RATING = 100`.
   - Update `applyMatchResultAdjustment` to compute match deltas in the $+50$ to $+200$ / $-50$ to $-200$ range based on move quality score, captures, checkmates, turns survived, and opponent difficulty.
2. `src/predictor/PredictorContext.tsx`:
   - Initialize `defaultState.currentRating` to `INITIAL_BASELINE_RATING` (500 ELO).
   - Verify `finalizeMatch` updates session games played, wins, losses, draws, and current rating correctly.
3. `src/components/Dashboard.tsx`:
   - Update Profile Box to render `predictorState.currentRating` in an Amber ELO badge.
   - Bind Win/Loss/Draw counters to include `predictorState` session counters so they update instantly in real time on both desktop and mobile viewports.

---

## Verification Plan

### Automated Build Verification
1. Run `compile_applet` to confirm zero TypeScript compilation errors.
2. Run `lint_applet` to verify syntax and import cleanliness.

### Manual Behavior Checks
1. Load home page on new session -> verify initial rating displays as **500 ELO**.
2. Play a match (Bot, PvP, Culling Game, or Rose Paradise) to completion.
3. Verify that Wins/Losses/Draws in the Profile Box increment immediately by 1.
4. Verify that Predicted ELO updates with a dynamic delta in the range $+50$ to $+200$ or $-50$ to $-200$.
