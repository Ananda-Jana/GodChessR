# Shrine Siege Architectural Audit Report

## 1. Executive Summary

An in-depth code audit of `src/hero-duel/` was performed to diagnose why the Shrine Siege mode currently feels like a passive auto-battler rather than a rich, tactical, mobile-first strategy game.

Key findings:
1. **Passive Combat & Weak Orders**: Heroes follow a single primitive target coordinate. There are no command types (Attack, Defend, Capture, Regroup, Retreat), command groups (Single, Multi, Team), or behavioral formations (Wedge, Defensive Line, Split Push).
2. **Primitive Bot Strategy**: `siegeBot.ts` is a 26-line stub that blindly reassigns targets every 5 seconds without role awareness, health evaluation, or counter-tactics.
3. **Flat Battlefield & Placeholder Structures**: The battlefield is rendered as flat 1x1 CSS grid squares (`bg-amber-950`, `bg-emerald-950`) with text labels (`T1`, `3HP`) rather than fantasy structures (Thrones, Defensive Towers, Raised Shrines) with health bars, shields, projectiles, and destruction animations.
4. **Poor Mobile Controls & Viewport Ergonomics**: Interactivity requires tapping tiny 40px grid squares without a contextual mobile action bar, command chips, or targeted ability activation previews.
5. **Card Image Dependency**: Card rendering previously loaded external image assets from `CARD_BACKGROUND_IMAGES`.

---

## 2. Comprehensive Issue Matrix

| Problem | Root cause | Proposed fix |
|---|---|---|
| Heroes fight without meaningful strategy | Weak order priority & single `targetCoord` state | 4-Command System (ATTACK, DEFEND, CAPTURE, REGROUP/RETREAT) with visual active command badges and formation modifiers |
| Shrines feel unimportant | Flat 1x1 cells with generic progress counters | Dedicated 3D-styled SVG Shrines with ownership glow, progress rings, contested effects, and clear info panels |
| Mobile controls are awkward | Desktop-oriented cell tapping without contextual controls | Contextual mobile HUD: hero selection chips, action bar (ATTACK/DEFEND/CAPTURE/RETREAT/AUTO), ability targeting overlay |
| Structures look unfinished | Generic colored boxes with text numbers | Fantasy battlefield renderer with detailed SVG Thrones, Towers with auto-firing laser projectiles, health bars, and destruction states |
| Bot decision-making is brainless | Blind tick timer assigning closest shrine | Strategic Bot Commander with 8-point battlefield evaluation (shrine count, tower HP, hero health, lane pressure, ability opportunities) and 3 difficulty tiers |
| No pre-battle tactical planning | Instant start into battle | Pre-Battle Deployment Screen with hero roles, lane assignments, 3 presets (Balanced, Aggressive, Defensive), and enemy layout preview |
| Absence of formations | Heroes move independently without team synergy | 3 Tactical Formations (Wedge, Defensive Line, Split Push) influencing move paths, tank lead, and target selection |
| Unclear battle combat feedback | Plain text event list without animations or floating indicators | Visual combat feedback: attack beams/projectiles, floating damage numbers, tower attack arcs, shrine energy rings, and detailed end-game tactical debrief |
| External card background dependency | Loaded image files from `/assets/aistudio/` | Pure Canvas/TSX procedural background rendering with bold contrastive color palettes (Red, Blue, Violet, Yellow, White, Black, Beef) inside Hero Duel |

---

## 3. Scope Lock Verification

All modifications are strictly confined to `src/hero-duel/`.
- No root or application files (`/src/App.tsx`, `/src/components/*`) modified.
- No changes to card generation, grammar, rarity, or collection storage.
- External card image dependencies removed in favor of procedural canvas/TSX rendering inside `src/hero-duel/`.
