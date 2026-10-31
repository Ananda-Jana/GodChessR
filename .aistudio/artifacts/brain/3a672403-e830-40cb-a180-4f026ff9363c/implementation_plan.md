# Implementation Plan - Hero Duel Optimizations & Enhancements

## User Requirements
1. **Performance / Lag Fix**: Ensure clicking abilities, piece movement, and attacks do not lag or block each other, allowing smooth simultaneous actions in Hero Duel mode.
2. **Ability Activation Effect & Sound**: When a hero uses an ability, the hero piece displays a glowing bluish-purple aura/color for 1 to 1.5 seconds, accompanied by a distinct sound effect so the opponent is aware.
3. **Container Border Radius**: Ensure every single container in Hero Duel game mode has at least 5px border radius (we will standardize on 12px as requested).

---

## Proposed Changes

### 1. Codebase Audit & Files to Inspect
- Examine `src/hero-duel/` files (e.g., `HeroDuelGame.tsx`, `AbilityTiles.tsx`, game state management, board renderers, CSS stylesheets).
- Identify performance bottlenecks causing lag on ability click, movement, or attack (e.g. heavy re-renders, synchronous blocking calculations, missing React memoization or Web Audio latency).

### 2. Performance & Lag Fixes
- Optimize ability triggers and state updates in `HeroDuelGame.tsx` to prevent cascading re-renders of the game board and pieces during movement/attacks.
- Ensure Web Audio synthesizer or sound playback is asynchronous and lightweight (non-blocking).

### 3. Hero Ability Aura & Sound Effect
- Add state/timer for active hero ability visual aura (`bluish-purple glow` with CSS animation) lasting ~1.2 seconds.
- Trigger sound synthesis or audio effect on ability activation (e.g. magical pulse/surge sound via Web Audio API).

### 4. Container Border Radius (12px minimum across all containers)
- Review all containers, cards, panels, buttons, and HUD boxes in Hero Duel components and CSS files.
- Apply `border-radius: 12px` (or between 10px - 20px) to every container element in the Hero Duel UI.

---

## Verification Plan
- Compile the app using `compile_applet`.
- Verify smooth gameplay without lag during simultaneous movement, attacks, and ability clicks.
- Verify hero ability bluish-purple glow and sound effect.
- Verify container border radiuses across Hero Duel views.
