# Crafting Rules Consistency & Mid-Game Crafting Toggle

Ensure that piece crafting is consistently presented and triggered upon losing exactly **2 expensive pieces** (correcting legacy "4 expensive pieces" banner text), and introduce an explicit **Crafting Toggle (Enabled vs. Avoid Crafting)** for both standard vs-Bot matches and multiplayer challenges.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed during Phase 1 clarification:
> - **Multiplayer Match Rule**: The challenger sets the match-level Crafting rule (`Enabled` or `Avoid Crafting / Disabled`) when issuing a challenge. When accepted, this setting applies authoritatively to both players so neither has an asymmetric advantage.
> - **Vs Bot Games**: In standard mode vs Grandmaster/Master Bot, players can choose whether mid-game crafting is active or disabled ("Avoid Crafting"). If disabled, the match proceeds strictly with standard/Prince pieces without mid-game summoning.
> - **Board Expansion Independence**: The 7th-piece board expansion perk remains completely independent and is not affected by disabling piece crafting.
> - **Threshold Consistency**: Verified and synchronized to exactly **2 expensive pieces lost** across all UI modals, banners, and rules texts.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. Fixes outdated UI copy in `CraftingModal.tsx` from *"You lost 4 expensive pieces: craft a new piece"* to *"You lost 2 expensive pieces: craft a new piece"*, ensuring 100% alignment with `CRAFTING_LOST_EXPENSIVE_THRESHOLD = 2` in the rules engine.
  2. Adds a **Crafting Rule Toggle** (`Enabled` vs. `Avoid Crafting`) in:
     - **Multiplayer Challenge Controls** (Dashboard and Challenge Acceptance Modal): Challenger chooses whether piece crafting is permitted in the match. The receiver clearly sees the crafting rule badge before accepting.
     - **Vs-Bot Match Modal**: Players launching Standard Dice Chess can toggle whether mid-game crafting is enabled or avoided.
  3. Authoritatively enforces the crafting toggle in `src/game/engine.ts` and `server/socket.ts`: if a match has `craftingAllowed: false`, mid-game piece crafting triggers are completely bypassed for both players.

- **Target Audience**: Players who want full tactical control—either embracing the dynamic legendary summons or opting for a purer chess experience without sudden piece introductions.

---

## 2. User Experience & Visual Design

### 2.1 Multiplayer Challenge Setup & Acceptance
- **Dashboard Challenge Options**: Alongside existing **Timer (5m / 2m)** and **Hints (On / Off)** button groups in the Online Players card, add a **Crafting** group:
  - `[Crafting: Enabled]` (amber active badge)
  - `[Crafting: Off]` (neutral active badge / Avoid Crafting)
- **Challenge Modal**: The incoming challenge pop-up will display a distinct pill badge:
  - `🔨 Crafting: Allowed` or `🚫 Crafting: Off (Normal)`
- **Match View**: The header status bar shows the active rules configuration:
  - `⏱️ 5m · 💡 Hints On · 🔨 Crafting Allowed` or `🚫 Crafting Off`

### 2.2 Bot Match Setup Modal
- In `BotMatchModal.tsx`, under Game Mode options when `Standard Dice Chess` is selected:
  - Add a sub-option toggle: `Mid-game Crafting: [Allowed] / [Avoid Crafting]`.
  - Explanatory note: *"Avoid Crafting plays standard dice chess through the endgame with no mid-match summons."*

### 2.3 Banner & Text Consistency
- In `CraftingModal.tsx`, update banner headline:
  - **Old**: `You lost 4 expensive pieces: craft a new piece`
  - **New**: `You lost 2 expensive pieces: craft a new piece`
- In `RulesModal.tsx` and all tooltips, verify all wording consistently explains the 2 expensive pieces rule.

---

## 3. Key Product Decisions & Trade-Offs

- **Match-Authoritative vs. Per-Player Avoidance**:
  - *Decision*: The match configuration governs both players. If Crafting is disabled for the match, neither player can craft.
  - *Rationale*: Allowing one player to opt-in while the other avoids crafting creates severe competitive asymmetry (e.g. one player summoning a Supreme Rook while the other plays standard).
- **Separation of Expansion & Crafting**:
  - *Decision*: Board expansion (losing 7 pieces) remains active even when piece crafting is avoided.
  - *Rationale*: Confirmed by user in Phase 1; keeps board spatial dynamics intact while disabling only new piece summoning.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                      Match Initiation                        │
│                                                              │
│  Multiplayer: Dashboard (Challenger sets craftingAllowed)    │
│  Bot Match:   BotMatchModal (Player sets craftingAllowed)    │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    Authoritative State                       │
│                                                              │
│  MatchState {                                                │
│    ...                                                       │
│    craftingAllowed: boolean; // default true                 │
│  }                                                           │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  Move Execution (engine.ts)                  │
│                                                              │
│  if (lostExpensive >= 2 && currentState.craftingAllowed) {   │
│      // Trigger Crafting Pause & Modal                       │
│  } else {                                                    │
│      // Bypass crafting completely                           │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
```

### Affected Files & Schema Updates:
1. `src/types/game.ts`: Add `craftingAllowed?: boolean` to `MatchState` and `Challenge`.
2. `src/components/CraftingModal.tsx`: Correct banner text to `You lost 2 expensive pieces: craft a new piece`.
3. `src/components/Dashboard.tsx`: Add `challengeCrafting` state (`'allowed' | 'off'`) and UI toggle buttons to player challenge bar.
4. `src/components/ChallengeModal.tsx`: Render the Crafting rule badge on incoming challenge cards.
5. `src/components/BotMatchModal.tsx`: Add `midGameCrafting` toggle for standard bot matches.
6. `server/socket.ts`: Store and propagate `craftingAllowed` in challenges and matches.
7. `src/game/engine.ts`: In `executeMove`, check `currentState.craftingAllowed !== false` before setting `craftingPending`.
8. `test/`: Ensure existing tests pass and add unit test verifying that `craftingAllowed: false` bypasses crafting prompts.
