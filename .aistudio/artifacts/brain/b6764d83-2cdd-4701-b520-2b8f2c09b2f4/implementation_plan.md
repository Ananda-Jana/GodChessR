# Culling Game Opening Dojo — Logical Curriculum & High-Contrast Vector Overhaul

Rebuilds all 16 lessons inside the Culling Game Opening Dojo so every move teaches sound piece protection, pawn-supported development, and principled responses to realistic opponent threats, while replacing low-visibility red vectors and square boxes with thicker, semi-transparent emerald green vectors and deep navy blue target accents.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product and visual decisions were confirmed during clarification and govern this overhaul exclusively inside the **Culling Game Opening Dojo** (leaving the main Culling Game mode and other Hashira training modes untouched):

- **Confirmed Scope — All 16 Classroom Lessons**: Revise all 8 lessons in the *Opening Dojo* curriculum and all 8 lessons in the *Mid-Game Strategy* curriculum (128 total interactive steps).
- **Confirmed Visual Contrast — Emerald Vectors with Navy Accents**: Replace crimson arrows and red highlight boxes with thicker, moderately translucent emerald green move vectors paired with deep navy blue origin/target accents so guidance stands out clearly on both cream (`#F2EFE4`) and crimson (`#e11d48`) squares.
- **Confirmed Tactical Philosophy — Safe Development & Principled Counter-Play**: Enforce strict piece-safety rules where expensive units never step undefended into enemy pawn capture diagonals or ranged fire, and scripted opponent responses make realistic threats, captures, and positional counter-moves rather than passive filler pushes.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms Sensei Tukuna's Culling Game Opening Dojo into a tactically rigorous strategy classroom. Learners practice opening pawn structures, safe role mobilization, threat neutralization, ranged sniping, Ratio Field suppression, Jackpot combos, and checkmate patterns against an opponent that plays purposeful, dangerous moves.
- **Target Audience / Persona**: Competitive Culling Game players who want practical, tournament-viable opening and mid-game habits that translate directly into matches against the AI bot or human opponents.
- **Key Value**: Eliminates false training habits (such as placing Vanguards, Wardens, or Rushers onto squares controlled by 1-point pawns where a real opponent would immediately capture them) and makes on-board visual guidance effortless to read at a glance.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Curriculum & Tier Selection**: Learners choose between *Opening Dojo* (Lessons 1–8) and *Mid-Game Strategy* (Lessons 9–16), optionally filtering by Beginner, Intermediate, or Advanced tier.
  2. **Visual Move Guidance**: On each step, the board highlights the origin square in a calm navy blue frame, frames the target square with a crisp emerald-and-navy indicator, and draws a bold, semi-transparent emerald green vector arrow between them.
  3. **Action, Opponent Threat & Counter-Play**: When the learner executes the recommended move, the scripted opponent responds with a realistic developing move, flank threat, ranged alignment, or recapture—setting up a logical tactical problem for the learner's next turn.
  4. **Full Strategy Review & Free Sandbox**: Learners can step through the entire 8-move sequence with playback controls or toggle Free Sandbox mode to test alternative continuations on the live rules engine.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Sharp tactical classroom overlay layered cleanly atop the existing neobrutalist dark-and-crimson Culling Game arena.
  - *Color Palette & Mood*:
    - **Primary Move Vector**: Emerald Green (`#10b981` core shaft with a `#064e3b` / `#0f172a` contrast outline) at **~78% opacity** so square coordinates and piece art remain legible underneath.
    - **Origin & Secondary Threat Accents**: Deep Navy Blue (`#1e3a8a` fill tint with `#3b82f6` / `#1d4ed8` crisp border) for starting squares and secondary tactical threat lines.
    - **Target Square Highlight**: Translucent Emerald Green (`rgba(16, 185, 129, 0.24)`) with a defined 2px emerald/navy frame—completely removing the old pulsing red `patternHighlights` boxes that blended into the `#e11d48` dark squares.
  - *Typography & Hierarchy*: Preserves compact tabular step counters (`tabular-nums`), concise single-line move notation, and clear tactical breakdowns explaining *why* the opponent's last move created a threat or opening and *why* the chosen reply is safe.
  - *Vector Geometry & Weight*: Upgrades vector stroke width from ultra-thin hairline (`3` SVG units / ~1.2px) to a substantial tactical shaft (`13` SVG units / ~5.5px mobile, ~8px desktop) with a proportionally scaled arrowhead and a navy-backed sequence number badge offset cleanly along the shaft.

- **Interactive Feedback & Motion**:
  - Smooth 150–200ms opacity transitions when advancing steps.
  - Clear off-book coaching banner whenever a learner attempts an inaccurate move—specifically warning if an attempted square walks a high-value unit into enemy pawn, Ranged Strike, or Black Flash fire.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Enforcing a Strict "Zero Hung Pieces" Tactical Invariant Across All 128 Steps**
  - *Chosen Approach*: Audit and rewrite every lesson step using an automated tactical sanity check on top of legal-move validation. No non-pawn unit (Sovereign, Vanguard, Warden, Artillery, Bulwark, Skirmisher, or Rusher) may end a turn on an enemy-attacked square where the opponent could win material (especially enemy pawn diagonals, distance-2 Artillery Ranged Strikes, or distance-2 Vanguard Black Flashes), unless the step itself wins higher material or triggers an immediate same-turn Rusher Jackpot escape.
  - *Why*: Training only builds real skill when every recommended position survives the opponent's strongest reply. Protecting 3.5–8 point roles behind 1-point pawn chains mirrors how the actual Culling Game engine and AI evaluator score positions.
  - *Alternatives Considered*: Keeping the old forward-rush lines and having the opponent capture the blundered piece was rejected because a dojo lesson should teach the *correct* protective setup for the learner, not force the learner to blunder material.

- **Decision 2: Designing Opponent Responses Around Realistic Threats ("Action -> Threat -> Counter")**
  - *Chosen Approach*: Script Black's moves so each turn develops Kenjaku, Uraume, Yorozu, Reggie, Naoya, or Kurourushi safely, contests central columns, sets up Ranged Strike / Black Flash alignments, or attacks a White target—forcing White's next step to defend, block, evade, or punish an overextension.
  - *Why*: Turns every 8-step lesson into a logical cause-and-effect dialogue rather than two sides ignoring each other on opposite halves of the board.
  - *Alternatives Considered*: Running live randomized bot moves during lessons was passed over so lessons remain deterministic, repeatable, and aligned with Sensei Tukuna's step-by-step tactical commentary; Free Sandbox mode remains available at any step for open-ended sparring.

- **Decision 3: Cased Semi-Transparent Emerald & Navy Vector Rendering**
  - *Chosen Approach*: Render emerald green arrows (`opacity ~0.78`) with a thin dark navy outer casing stroke and replace static multi-square red boxes with active-step navy/emerald origin-and-destination frames.
  - *Why*: Pure green alone can lose crispness on light cream (`#F2EFE4`) squares while pure navy alone can darken over black pieces; pairing an emerald fill shaft with a dark navy casing guarantees high contrast across light squares, crimson dark squares, white pieces, and black pieces simultaneously.
  - *Alternatives Considered*: Gold or orange vectors were passed over per user preference and because warm hues visually compete with existing last-move amber tints.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   Culling Game Opening Dojo Classroom                   │
│                                                                         │
│  ┌──────────────────────────┐       ┌────────────────────────────────┐  │
│  │  Rebuilt 16-Lesson Store │──────▶│   Lesson Progression Engine    │  │
│  │  • 8 Opening Lessons     │       │  • Step state & board builder  │  │
│  │  • 8 Mid-Game Lessons    │       │  • Off-book blunder diagnostics│  │
│  │  • Principled bot replies│       │  • Full Strategy & Sandbox mode│  │
│  └────────────┬─────────────┘       └───────────────┬────────────────┘  │
│               │                                     │                   │
│               ▼                                     ▼                   │
│  ┌──────────────────────────┐       ┌────────────────────────────────┐  │
│  │ Tactical Sanity Validator│       │   Board & Visual Guide Stage   │  │
│  │  • Legal move check      │       │  • 88-square Culling Board     │  │
│  │  • Zero-hung-piece audit │       │  • Active Navy/Emerald frames  │  │
│  │  • Pawn/Snipe threat map │       │  • Thick Emerald/Navy Vectors  │  │
│  │  • Opponent punisher test│       │    (cased stroke, ~0.78 alpha) │  │
│  └──────────────────────────┘       └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Curriculum Redesign Blueprint (All 16 Lessons)**:
  - **Opening Dojo (Lessons 1–8)**:
    1. *Pawn Shield & Safe Vanguard Development*: Clear G/F lanes with pawns first, develop Yuji behind supported squares (`G2`/`F2`), and answer Kenjaku's central pressure without stepping into pawn diagonals.
    2. *Sovereign Perimeter & Ratio Defense*: Fortify Gojo on the back rank with Panda (`F3` safely behind `E3`/`G3` pawns) and Nanami (`D2`), parrying Naoya's early flank probe.
    3. *Skirmisher Flank Control & Safe Outposts*: Leap Maki to supported flank squares, answer Black's `B6`/`C6` pawn challenge by retreating/pivoting onto unattacked colony squares rather than hanging on `B5`.
    4. *Warden Ratio Field Neutralization*: Advance `D`/`E` pawns together to escort Nanami safely into the center, suppressing an enemy incursion without stepping onto `B6`/`D6` pawn-controlled squares.
    5. *Supported Rusher Development & Jackpot Strike*: Open diagonal lanes for Hakari, bait an overextended Black unit onto a targetable square, capture cleanly to trigger Jackpot, and pivot to an unattacked square.
    6. *Colony Arm Expansion & Flank Defense*: Contest the left (`L`/`A`) and right (`H`/`R`) colony extensions while defending against Kurourushi's counter-infiltration.
    7. *Artillery Snipe Corridor & Counter-Battery*: Protect Mechamaru behind friendly pawns while firing distance-2 Ranged Strikes (`shoot`) on exposed targets and sidestepping Uraume's counter-snipe lane.
    8. *Tactical Domain Step Evasion & Counter-Pin*: Demonstrate Gojo's once-per-game Domain Step realistically—developing pieces first, then using Domain Step to break an enemy check/alignment safely into a fortified pocket rather than marching the Sovereign solo into the center.
  - **Mid-Game Strategy (Lessons 9–16)**:
    9. *Vanguard Black Flash Distance-2 Strike*: Use Yuji's exact distance-2 Black Flash (`black_flash` / strike-in-place) from a safe pawn-guarded post to eliminate an enemy attacker without stepping onto a recapturable square.
    10. *Artillery + Pawn Screen Synergy*: Advance a protected pawn screen with Mechamaru trailing safely 2 squares behind to snipe enemy blockers at zero material risk.
    11. *Ratio Field Trap Against Enemy Rusher*: Lure an aggressive Kurourushi diagonal raid into a defended sector, clamp with Nanami from a protected square to strip its 2-square mobility, and win the trapped piece cleanly.
    12. *Bulwark Shell Tempo Gain & Recapture*: Position Panda on a defended central outpost so when Black spends a turn breaking Panda's Shell, White immediately punishes the exposed attacker for a clean material gain.
    13. *Jackpot Hit-and-Run Combination*: Execute a tactical Rusher capture on a weak enemy target and use the immediate same-turn Jackpot step to retreat out of enemy recapture range—demonstrating true hit-and-run value.
    14. *Heavenly Restriction Bypassing Enemy Ratio Field*: Navigate Maki past Reggie Star's Ratio Field (leveraging Skirmisher immunity) along safe squares to win an undefended flank target.
    15. *Multi-Role Pin & Overloaded Defender Strike*: Coordinate Nanami, Yuji, and Maki from safe squares to overload Black's defense on the B/C sector and win decisive material.
    16. *Coordinated Sovereign Mating Net*: Construct a realistic custom mid-game tactical position where White's Vanguard, Warden, and Skirmisher coordinate without hanging any unit to weave a verified checkmate against Sukuna.

- **Data Model & State**:
  - Extend vector color tokens to support `'emerald'` (primary player move) and `'navy'` (secondary threat / defensive line) while mapping any legacy values cleanly.
  - Replace static whole-lesson red `patternHighlights` overlays during normal interactive play with active-step `from` (navy frame) and `to` (emerald frame) square indicators; display strategic zone highlights in subtle navy tint only during *Full Strategy Review*.

- **Interactive Component & State Mapping**:
  - **Board Square Guide Layer**: Reads `currentStep.from` and `currentStep.to` when `showArrows` is active and `!isFreePractice`, rendering non-intrusive navy/emerald square frames below piece sprites so piece clicks pass straight through to the board.
  - **Vector SVG Overlay**: Renders thicker (`strokeWidth="16"` navy casing + `strokeWidth="11"` emerald fill at `opacity="0.78"`), shortened slightly at start/end endpoints so arrowheads land cleanly at the target edge without obscuring the target square or piece face.
  - **Authoritative Validator Enhancement**: Adds a tactical safety check to the Culling Opening Dojo validator verifying that every step is 100% engine-legal, vector coordinates match move coordinates, check/checkmate annotations are truthful, and no player step leaves a valuable friendly piece hanging to a lower-value attacker or free capture.
