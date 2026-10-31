# Implementation Plan — Hero Abilities Redesign, Shrine Regeneration & Audio Haptics

Redesign all active hero ultimate abilities in **Hero Duel** mode, overhaul the bottom navigation dock controls with 20px rounded cards and external hero labels, implement 1 HP/s shrine auto-healing, sync pre-game Codex and in-game rulebooks, and add Web Audio synthesized haptics.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design decisions were confirmed via interactive user responses:

- **Confirmed Decision 1**: Active ability cards in the bottom dock render as vibrant solid color filled cards with radial/linear cooldown progress overlays and `border-radius: 20px` (`rounded-[20px]`).
- **Confirmed Decision 2**: Mid-game hero ability upgrades trigger via a card modal when a hero scores an elimination, offering 2 distinct ability stat upgrade options (e.g. +50% Radius/Power vs -1.5s Cooldown).
- **Confirmed Decision 3**: Audio feedback during battle uses synthesized Web Audio API sound effects (crisp tactile chess movement clicks, laser/meteor ability unleashes, and shrine capture chimes).
- **Confirmed Decision 4**: Each hero starts with **15 HP Max**, and their HP bar is displayed directly inside the bottom navigation dock above their ability card.
- **Confirmed Decision 5**: Occupying a shrine automatically heals the holding hero by **+1 HP/sec**. Acquiring a shrine uncontested for **10 seconds** wins the match (with tiebreaker based on total remaining team HP if time expires).

---

## 1. Overview & Core Concept

1. **Active Abilities Overhaul**:
   - **MugenKING**: *Meteor Strike* — Rains down a meteor on an enemy holding or near a shrine, dealing 2 HP damage with a 3s cooldown.
   - **Captain Englland**: *Rocket Jetpack Dash* — Rocket dashes horizontally across the board, dealing 2 HP damage to all enemies in its path and returning to origin.
   - **BlackMonkey / Party King Kong**: *Rolling Spike Ball* — Releases a spiked boulder that strikes all enemy heroes once for 1 HP damage each.
   - **Yjkstra / Shrine Priest**: *Sanctuary Shield Barrier* — Establishes a 2×2 sacred forcefield around the shrine that damages enemies trying to enter.
2. **Bottom Navigation Dock (Ability Bar)**:
   - 4 Hero Ability Cards styled as 20px rounded squares (`rounded-[20px]`).
   - Hero name and current HP bar (`HP / 15`) positioned **outside** the ability box.
   - Inside the box: Custom designed ability icon, ability title, active state fill, and numeric cooldown countdown overlay.
3. **Shrine Auto-Healing & 10s Victory Rule**:
   - Occupying a shrine automatically restores +1 HP/s to the occupying hero up to 15 HP.
   - Holding a shrine for 10 seconds uncontested wins the battle.
   - Mid-game level-up modal unlocks when an enemy hero is eliminated.
4. **Synchronized Rules Across Codex & Rulebook**:
   - Pre-game Deployment Codex and in-game Rulebook Modal updated to present identical, crystal-clear rule descriptions with mini grid demonstrations.

---

## 2. User Experience & Visual Design

- **Ability Cards Dock**:
  - Outer Container: Fixed bottom bar separated cleanly from the 8×8 board.
  - Hero Card Box: `w-20 h-20 sm:w-24 sm:h-24 rounded-[20px]` with vibrant accent fill when ready and darkened cooldown radial sweep ring when recharging.
  - Hero Title & HP Bar: Positioned above the card box in dark container with clear HP fraction (`12 / 15 HP`).
- **Mid-Game Upgrade Modal**:
  - Clean card modal overlay featuring 2 upgrade cards upon scoring a kill.
- **Web Audio Haptics**:
  - Chess move click: Short 80ms resonant wood/plastic click.
  - Ability unleash: Descending/ascending frequency sweep synth.
  - Shrine capture: Sparkling 3-note major chime.

---

## 3. Technical Strategy & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Shrine Siege Engine                             │
│ ┌───────────────────────┐ ┌───────────────────┐ ┌────────────────────┐ │
│ │  Hero HP (15 Max)     │ │ 1 HP/s Shrine Heal│ │ 10s Shrine Victory │ │
│ └──────────┬────────────┘ └─────────┬─────────┘ └─────────┬──────────┘ │
└────────────┼────────────────────────┼─────────────────────┼────────────┘
             │                        │                     │
┌────────────▼────────────────────────▼─────────────────────▼────────────┐
│                  Redesigned Bottom Ability Dock                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Hero Name (Outside Card) • HP Bar (15 Max)                          │ │
│ │ ┌────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 20px Rounded Card: Ability Icon + Title + Cooldown Fill Ring   │ │ │
│ │ └────────────────────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

1. **`siegeTypes.ts` & `siegeEngine.ts`**:
   - Update `HERO_MAX_HP = 15`.
   - Update `tickSiegeEngine` to add +1 HP/s shrine auto-healing for holding hero.
   - Update win condition check: `dominionTimer >= 10` with no enemy in shrine square.
   - Track ability cooldowns and mid-game level-up kill points.
2. **`AbilityBar.tsx`**:
   - Rebuilt with 20px rounded cards, external hero labels, HP bars, and cooldown overlays.
3. **`audioHaptics.ts`**:
   - Web Audio API synthesizer for moves, ability activations, hits, and shrine captures.
4. **`DeploymentScreen.tsx` & `SiegeRulebookModal.tsx`**:
   - Synchronized rule texts matching exact new mechanics.

---

## 4. Proposed Changes & Implementation Sequence

1. **Engine Updates (`siegeEngine.ts`, `siegeTypes.ts`)**:
   - Set 15 HP max per hero.
   - Add shrine auto-healing ticker (+1 HP/s).
   - Enforce 10s uncontested shrine victory logic and tiebreakers.
2. **Web Audio Haptics System (`audioHaptics.ts`)**:
   - Synthesize sound effects for moves, abilities, shrine captures, and eliminations.
3. **Bottom Ability Dock Redesign (`AbilityBar.tsx`)**:
   - Render 20px rounded cards (`rounded-[20px]`).
   - Place hero name and HP bar outside the box.
   - Add custom ability icons, titles, and cooldown timers.
4. **Mid-Game Upgrade Modal (`SiegeUpgradeModal.tsx`)**:
   - Create card selection modal on hero kill.
5. **Rulebook & Codex Sync (`DeploymentScreen.tsx`, `SiegeRulebookModal.tsx`)**:
   - Sync all rules across pre-game and in-game views.
