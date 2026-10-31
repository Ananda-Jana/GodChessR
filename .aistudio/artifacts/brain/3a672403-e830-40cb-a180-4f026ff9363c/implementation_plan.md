# Hero Duel Shrine Siege: Automatic Orthogonal Combat & 25-Second Shrine Rules

Implement real-time automatic orthogonal contact attacks, a 25-second countdown timer on the top-left square of each shrine (with red warning state and tick audio under 5 seconds), comprehensive shrine HP comparison victory logic, repeatable ability activation every 7 seconds, and a non-scrolling mobile view.

> [!IMPORTANT] Confirmed User Specifications
> - **Automatic Contact Attacks**: Units automatically attack every 1.0 second when in direct orthogonal contact (horizontally or vertically adjacent, 1-square distance). No diagonal attacks, and no attacking across gaps.
> - **25-Second Shrine Countdown**: Displayed in a small font on the top-left square of each shrine without obscuring the shrine model. When 5 seconds or fewer remain, the timer turns bold red and plays audio warning ticks.
> - **25-Second Shrine Resolution Logic**:
>   - If Player reaches 25s and opponent has no piece on a shrine -> Player wins immediately.
>   - If both teams occupy shrines, victory is decided by comparing shrine piece HP (if multiple pieces on a shrine, using team average HP).
> - **Repeatable Abilities**: Abilities can be cast repeatedly whenever their 7-second cooldown finishes.
> - **Zero-Scroll Mobile View**: The entire game view is locked to 100dvh with zero page scrolling; the board and bottom dock are scaled to fit comfortably on all mobile screens.

---

## 1. Overview & Core Concept

This update transforms combat in Hero Duel Shrine Siege from manual targeting clicks into fluid, position-based warfare:
1. **Movement & Auto-Engagement**: Players move their heroes to position them on the board. The moment a hero is placed orthogonally adjacent (North, South, East, West) to an enemy piece, automatic combat starts immediately and continues attacking every second until an enemy moves away or is eliminated.
2. **Shrine Dominion Countdown**: Shrines track active holding time with a sleek countdown on the top-left cell. Once a team maintains control down to 0s, the battle evaluates shrine presence and average HP for an authentic tactical victory.
3. **Repeatable Cooldown Flow**: 7-second equipment abilities can be cast continuously throughout the match without restrictions once cooled down.
4. **Mobile Viewport Lock**: Responsive CSS clamp rules and `h-[100dvh] overflow-hidden` ensure the board, HUD, and hero dock fit seamlessly on any phone display without scrolling.

---

## 2. User Experience & Visual Design

### Automatic Orthogonal Combat Flow
- When moving a piece adjacent (Manhattan distance = 1, horizontally or vertically) to an enemy, an attack animation and damage flash trigger instantly.
- While contact is maintained, an interval ticker (1000ms) executes continuous auto-attacks, creating damage floaters and HP reductions automatically without requiring redundant clicks on the enemy.
- Diagonal cells are strictly non-combat zones (units cannot attack diagonally).

### Shrine 25-Second Countdown Display
- **Location**: Top-left square of each 2x2 shrine (Col 1, Row 3 for left shrine; Col 5, Row 3 for right shrine).
- **Appearance**: Compact pill-styled digital countdown (`25s` down to `0s`) with semi-transparent dark backing so the shrine visual remains clear.
- **Urgent State ($\le 5\text{s}$)**:
  - Font turns bright red (`#ef4444`) with an energetic pulse glow.
  - Synthesized Web Audio API "tick-tick" chimes trigger each second during the countdown.

### 25-Second Shrine Resolution Hierarchy
```
┌────────────────────────────────────────────────────────┐
│              25-Second Shrine Countdown Reached         │
└──────────────────────────┬─────────────────────────────┘
                           ▼
          Does opponent have ANY piece on a shrine?
           ├── NO  ──► Immediate Victory for Occupier!
           └── YES ──► Compare Shrine Piece HP:
                       - Single piece: Direct HP comparison
                       - Multiple pieces: Average HP comparison
                       - Higher HP / Average HP wins match
```

### In-Game Rules Modal & Codex Synchronization
Update both `SiegeRulebookModal.tsx` and `siegeRulesCodex.ts` to document:
1. Orthogonal automatic attacks (1-second interval, horizontally/vertically adjacent only, no diagonal attacks).
2. Shrine 25-second continuous countdown and the 5-second red warning.
3. Exact end-game HP and average HP comparison rules when both sides contest or occupy shrines.
4. Repeatable 7-second cooldown for equipment abilities.

### Single-Screen Mobile Layout
- Container uses `h-dvh max-h-dvh overflow-hidden flex flex-col justify-between`.
- Board size uses CSS dynamic clamp: `min(90vw, calc(100dvh - 220px), 480px)`.
- HUD and bottom dock heights are strictly budgeted to prevent vertical clipping or scrolling.

---

## 3. Key Technical Decisions & Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SiegeMatchView Component                        │
│  - 1000ms Auto-Attack Interval for adjacent units                      │
│  - Shrine Countdown Ticker (25s -> 0s) + Audio Warning (< 5s)          │
│  - Ability Ticker: restores state to 'ready' after 7s cooldown        │
└──────────────────┬──────────────────────────────────┬──────────────────┘
                   │                                  │
                   ▼                                  ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│          SiegeChessBoard             │  │       siegeSim / Codex       │
│ - Top-left shrine countdown overlay  │  │ - Orthogonal attack engine   │
│ - Zero-scroll mobile sizing clamp    │  │ - 25s shrine HP comparison   │
│ - Auto-attack slash/pulse effects    │  │ - 7s cooldown state reset    │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

| Component | Responsibility |
| :--- | :--- |
| `src/hero-duel/engine/siege/siegeSim.ts` | Orthogonal adjacency check (`Math.abs(dx) + Math.abs(dy) === 1`), auto-combat tick handler, and average-HP shrine comparison. |
| `src/hero-duel/config/siegeRulesCodex.ts` | Updated rulebook text covering auto-attacks, 25s countdown, and tiebreak math. |
| `src/hero-duel/ui/siege/SiegeChessBoard.tsx` | Top-left shrine countdown badge with $\le 5$s red pulse; mobile sizing clamp. |
| `src/hero-duel/ui/siege/SiegeMatchView.tsx` | 1s interval loop for auto-combat, audio ticks, and repeatable 7s ability trigger loop. |
| `src/hero-duel/ui/siege/SiegeRulebookModal.tsx` | Visual codex explaining orthogonal combat and shrine resolution. |
| `src/hero-duel/utils/heroDuelAudio.ts` | Synthesized countdown tick sound effect for $\le 5$s warning. |

---

## 4. Verification & Acceptance Criteria
1. Moving any hero horizontally or vertically adjacent to an enemy immediately initiates attack animations and continues striking every second without clicking the enemy.
2. Diagonal positions do not trigger attacks.
3. Shrines display the remaining time (`25s` down to `0s`) in their top-left square.
4. At $\le 5$ seconds, the shrine timer turns bright red and emits a tick sound.
5. If both shrines or a single shrine are occupied at 25s, average team HP on shrines determines the winner.
6. Abilities can be triggered again immediately after the 7-second cooldown finishes.
7. Mobile screen fits all UI elements (HUD, 8x8 Board, Bottom Dock) in a single screen with zero scrolling.
8. `compile_applet` and `lint_applet` pass with 0 errors.
