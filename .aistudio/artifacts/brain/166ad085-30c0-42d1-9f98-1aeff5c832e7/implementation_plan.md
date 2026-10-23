# Hashira Training Dojo: Move Legality Audit, Expanded Multi-Step Curriculum, Contextual Rulebook & #BC1434 Board Theme

Eliminate all move legality fallacies across Hashira Training katas by aligning every expected step with the authoritative movement engine, add a small square context-aware rulebook button in the top navigation stripe, expand the curriculum with 4–5 verified multi-step lessons and trial matches per dojo/rank featuring a lightweight post-match tactical debrief card, and update darker board squares in non-Culling modes to `#BC1434`.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were clarified in Phase 1:
> - **Rulebook Button**: Positioned as a sleek, small square button (`w-7 h-7 sm:w-8 sm:h-8`) in the top navigation stripe adjacent to the Dojo selector. Tapping it opens the rulebook dynamically focused on the mode of the active lesson (`standard`, `crafted`, or `culling`).
> - **Post-Match Hashira Critique**: Presented as a dedicated brutalist debrief card directly beneath or over the stage upon match completion, displaying mistake diagnostics, tactical accuracy, and concrete tips from Sensei Gensei.
> - **Board Color Update**: Dark squares in all training modes *except* Culling Dojo will transition from the previous red shade to `#BC1434` (deep ruby crimson), while lighter squares remain `#F2EFE4`. Culling Dojo retains its authentic domain styling.

---

## 1. Overview & Core Concept

- **Core Problem**: Certain katas in `src/training/data.ts` (such as Kanoe Iron Stance Kata 1/3 and Tsuchinoe Communist tactics) had expected destination squares that violated the piece's actual movement geometry in `engine.ts` and `craftables.ts`. Because the engine authoritatively rejects illegal moves, players could never clear the kata and were trapped when the golden guide showed an invalid coordinate.
- **Solution**:
  1. Audit every step in `DOJO_LESSONS` against `getLegalMovesForSquare` and `executeCullingMove` to guarantee 100% legal, solvable, and mathematically sound katas.
  2. Implement a quick-reference rulebook button in the top bar.
  3. Expand each dojo and rank with 4–5 multi-step tactical katas (3–5 steps each) and full Hashira trial sparring matches with a lightweight tactical critique debrief card.
  4. Apply `#BC1434` for dark board squares in all non-Culling training modes.

---

## 2. User Experience & Visual Design

### 2.1 The Small Square Rulebook Button
- **Placement**: Top navigation bar, directly beside the Dojo selector button.
- **Appearance**: A compact square button (`w-7 h-7 sm:w-8 sm:h-8 border-2 border-amber-400 bg-neutral-900 hover:bg-neutral-800 text-amber-400 shadow-[1px_1px_0px_#000]`) with a clean `BookOpen` icon.
- **Action**: Opens `RulesModal` or `CullingRulesModal` pre-selected to the active lesson's format (Standard, Crafted, or Culling), allowing players to check piece vectors and rules without leaving their drill.

### 2.2 Dedicated Post-Match Hashira Debrief Card
- When completing a full Hashira Trial match (or sparring drill), a brutalist critique card appears:
  - **Banner**: Verdict (Victory / Defeat / Stalemate) with Sensei's expression badge.
  - **Tactical Metrics**: Turns survived, material balance, check efficiency, and critical turning point.
  - **Sensei's Critique & Tips**: Clear textual diagnostic highlighting errors made, missed tactical shots, and recommended defensive maneuvers.

### 2.3 Board Theme Refresh
- **Non-Culling Training Boards** (`InteractiveKataBoard` & `PracticeBoard`):
  - **Dark Squares**: `#BC1434` (bold cardinal crimson).
  - **Light Squares**: `#F2EFE4` (crisp antique cream).
  - Coordinate labels optically balanced: `text-rose-100/70` on dark squares, `text-neutral-800/70` on light squares.
- **Culling Dojo Board** (`CullingBoard`): Preserves its authentic cross-arena styling with `#e11d48` background and Gaussian blurred dark cells.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Engine-Verified Movement Audit**
  - *Chosen Approach*: Correct `kanoe_opening_1` so the Prince leaps to `e3` (`x=4, y=2`) or `c3` (`x=2, y=2`), which is a valid Knight-hop vector. Correct `tsuchinoe_tactics_1` so the Communist zigzags orthogonally to a valid landing square.
  - *Why*: Ensures the golden guide and lesson validation only ever target legal moves that the engine's move generator accepts.
- **Decision 2: Lightweight Client-Side Tactical Critique Engine**
  - *Chosen Approach*: Evaluate player game performance heuristically on the client thread (tracking king safety, hanging pieces captured, moves to checkmate) and generate Sensei's diagnostic text.
  - *Why*: 100% offline-capable, instantaneous, and avoids external latency or quotas.
- **Decision 3: Multi-Step Kata Architecture**
  - *Chosen Approach*: Support 3–5 step branching or sequential reply steps using `correctSteps` and `opponentResponses` in `InteractiveKataBoard`.
  - *Why*: Teaches full tactical combinations (deflect, pin, deliver checkmate) rather than simple 1-ply answers.

---

## 4. Technical Architecture & File Updates

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HashiraTrainingView                             │
│  - Top Nav: Adds small square [BookOpen] rulebook button               │
│  - Active Lesson Mode -> routes to RulesModal (Standard/Crafted/Cull)  │
└──────────────────┬──────────────────────────────────┬──────────────────┘
                   │                                  │
                   ▼                                  ▼
┌─────────────────────────────────────┐ ┌────────────────────────────────┐
│      src/training/data.ts           │ │    InteractiveKataBoard &      │
│  - Fix Prince & Communist moves     │ │    PracticeBoard               │
│  - Add 4-5 multi-step katas/rank    │ │  - Dark Squares: #BC1434       │
│  - Add Hashira Trial matches        │ │  - Light Squares: #F2EFE4      │
│  - Engine-verified legal moves      │ │  - Hashira Debrief Card        │
└─────────────────────────────────────┘ └────────────────────────────────┘
```

### Detailed Component Implementation Plan

1. **`src/training/data.ts` Audit & Expansion**:
   - **Fix Existing Katas**:
     - `kanoe_opening_1`: Fix Prince move from `d1` (`x=3, y=0`) to `e3` (`x=4, y=2`) or `c3` (`x=2, y=2`), which is a 100% legal Knight leap for the Prince.
     - `tsuchinoe_tactics_1`: Fix Communist move from `b3` to `b7` (`x=1, y=6`, orthogonal 4-step zigzag) capturing the black Queen on `b7` through alternating diagonal seams.
     - Check all remaining katas (`mizunoto`, `kanoe`, `tsuchinoe`, `hinoe`, `kinoe`, `hashira`) against `getLegalMovesForSquare` and `executeCullingMove`.
   - **Add 4–5 New Multi-Step Katas per Dojo / Rank**:
     - *Opening Dojo*: Prince flank deployment, fianchetto bishop control, advanced center pawn chain locks, crafted priest center infiltration.
     - *Tactical Dojo*: 3-step Greek Gift sacrifice, 4-step smothered checkmate, Supreme Rook heavy diagonal breakout, Communist pin-and-skewer combo.
     - *Culling Dojo*: 3-step Nanami Ratio Field trap, 4-step Maki skirmisher perimeter leap, Gojo-Sukuna sovereign endgame standoff.
   - **Add Hashira Boss Trial Battles**: Full sparring match format against each rank's calibrated Minimax bot with automated post-match critique.

2. **`src/training/HashiraTrainingView.tsx`**:
   - Add small square `BookOpen` button in the top navigation stripe right next to the Dojo selector.
   - When clicked, open `RulesModal` with `initialTab` set to the active lesson's mode.
   - Manage state for rules modal visibility (`isRulebookOpen`).

3. **`src/training/InteractiveKataBoard.tsx`**:
   - Update dark square background styling to `bg-[#BC1434]`.
   - Update light square background styling to `bg-[#F2EFE4]`.
   - Update last move highlighting to `bg-[#850e24]` on dark and `bg-[#fde68a]` on light.
   - Coordinate text styling: `text-rose-100/70` on `#BC1434`, `text-neutral-800/70` on `#F2EFE4`.

4. **`src/training/PracticeBoard.tsx`**:
   - Update dark square background styling to `bg-[#BC1434]`.
   - Update light square background styling to `bg-[#F2EFE4]`.
   - Enhance post-match victory/defeat screen to display the dedicated **Hashira Tactical Debrief Card** with mistake diagnostics, turning points, and tips from Sensei Gensei.

5. **Automated Verification**:
   - Run compilation and TypeScript checks (`compile_applet`, `lint_applet`).
   - Validate that every move in the kata database is legally generated by `getLegalMovesForSquare` and `executeCullingMove`.
