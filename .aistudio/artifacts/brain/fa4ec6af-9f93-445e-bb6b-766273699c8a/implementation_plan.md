# Implementation Plan: Context-Aware Rules & Mode-Specific UI Text Alignment

Align all in-game visible texts, HUD badges, and the official Rulebook with the exact settings and game mode chosen by the player, ensuring zero generalized inconsistencies and strictly suppressing crafting mentions whenever crafting is avoided.

---

## 1. Identified Text & Rule Inconsistencies

1. **Generalized Rulebook (`RulesModal.tsx`)**:
   - Currently presents a single static set of rules for all games.
   - Mentions **Board Expansion (7th Piece Lost)** universally, even though Bot matches do not utilize board expansion.
   - Mentions **Piece Crafting** unconditionally, even when the player selected **Avoid Crafting**.
   - Only describes the standard corner pieces (Queen/Prince), completely omitting the starting setup for the **Crafted Pieces Bot Mode** (Communists, Priests, Supreme Rook).
   - Only mentions the multiplayer timeout rule (>7 pieces lead), omitting the bot match timeout rule (≥3 pieces lead).

2. **Match View In-Game HUD (`MatchView.tsx`)**:
   - Displays a `🚫 Crafting Avoided` badge in the Match Rules info panel. The user explicitly answered that when crafting is avoided, crafting mentions and badges should be **completely hidden** rather than showing a disabled tag.
   - Crafting locked banners and placement states need strict guards so no crafting UI ever surfaces when `craftingAllowed === false`.

3. **Pre-Game & Dashboard Context**:
   - When the Rulebook is opened from inside an active match, it must dynamically reflect the active game's exact settings (mode, crafting enabled vs avoided, bot vs multiplayer).
   - When opened from the Dashboard, it should provide dedicated mode tabs (**Play vs Bot Standard**, **Play vs Bot Crafted**, and **Multiplayer Online**) so the player can inspect each distinct rule set before playing.

---

## 2. Proposed Changes

### A. Context-Aware Rulebook (`src/components/RulesModal.tsx`)
- Update `RulesModalProps` to accept optional active match context:
  ```typescript
  interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeMatch?: MatchState | null;
    isBotMatch?: boolean;
  }
  ```
- **When opened during an active game**:
  - Automatically detect `activeMatch.gameMode` ('standard' vs 'crafted'), `activeMatch.craftingAllowed` (true vs false), and `isBotMatch`.
  - Display an "Active Match Rules" badge indicating the current game configuration.
  - **Board & Setup Section**:
    - If `crafted`: Describe the crafted army (c1/f1/c8/f8 Communists, b1/g8 Priests, d1/d8 Supreme Rook, corner Queen/Prince).
    - If `standard`: Describe standard corner Queens/Princes and standard ranks.
  - **Dice & Movement Section**:
    - Explain rolls 1–3 and 4–6, fallback unlock, and dice removal after 3 captures.
  - **Prince Piece Section**:
    - L-shape jump, bounded 1–4 diagonal slide, and extended 3×1 first leap.
  - **Board Expansion Section**:
    - **Omitted entirely** for Bot matches as requested.
    - Included for Multiplayer matches (7th piece lost perk).
  - **Piece Crafting Section**:
    - **Completely hidden/omitted** if `activeMatch.craftingAllowed === false`.
    - If enabled: Clearly detail that crafting triggers only after losing **2 expensive pieces** (Queen, Rook, Prince, etc.), and that **pawns never trigger crafting**.
  - **Clock & Timeout Section**:
    - If bot match: Explain that if your timer runs out, you lose unless you have a **≥3 piece advantage**.
    - If multiplayer: Explain standard timeout / >7 piece advantage rule.

- **When opened from Dashboard**:
  - Provide a clean 3-tab mode selector at the top:
    1. **Play vs Bot (Standard)**: Standard setup, dice rules, Prince piece, timeout rule (≥3 piece lead), and note that mid-game crafting triggers only if enabled during game setup.
    2. **Play vs Bot (Crafted Pieces)**: Detailed breakdown of Communist, Priest, and Supreme Rook starting pieces, Prince piece, timeout rule, and mid-game crafting rules.
    3. **Multiplayer Online**: Full multiplayer rules including board expansion (7th piece lost) and host-configurable crafting.

### B. In-Game HUD Crafting Text Suppression (`src/components/MatchView.tsx`)
- In the Match Rules info badge:
  - If `activeMatch.craftingAllowed !== false`, show `🔨 Crafting Enabled`.
  - If `activeMatch.craftingAllowed === false`, **completely omit** the crafting badge from the list (only showing time control and hints status).
- Pass `activeMatch` and `isBotMatch` from `MatchView` and `App.tsx` into `RulesModal`.

### C. Dashboard & Modal Visible Text Consistency
- In `BotMatchModal.tsx`:
  - Verify all explanatory notes under Mid-Game Crafting Perk clearly state that pawns never trigger crafting and that 2 expensive pieces are required.
- In `Dashboard.tsx`:
  - Quick Rules Summary card: update to reference that each game mode has its own distinct rule set accessible via the Rulebook.

---

## 3. Verification Plan

1. **Automated Verification**:
   - Run `npx tsx test/engine.test.ts` and `npx tsx test/bot.test.ts` to ensure engine logic remains intact and untouched.
   - Run `lint_applet` (`tsc --noEmit`) to verify zero TypeScript errors.
   - Run `compile_applet` to verify production Vite bundle build.

2. **UI & Scenario Verification**:
   - **Scenario 1 (Standard Bot, Crafting Avoided)**: Start match with "Avoid Crafting". Open Rules modal in-game. Verify: No mention of crafting anywhere in the modal or in the match HUD. Verify board expansion is NOT listed in rules.
   - **Scenario 2 (Standard Bot, Crafting Enabled)**: Start match with "Enabled". Open Rules modal in-game. Verify: Crafting rule is displayed with 2 expensive pieces requirement (excluding pawns). Match HUD shows crafting badge.
   - **Scenario 3 (Crafted Bot, Crafting Avoided)**: Start match with Crafted pieces + "Avoid Crafting". Open Rules modal in-game. Verify: Crafted army starting layout is described, but mid-game crafting is completely omitted.
   - **Scenario 4 (Dashboard Rulebook)**: Open Rulebook from Dashboard. Verify 3 distinct tabs (Bot Standard, Bot Crafted, Multiplayer) render accurate separate rule sets.
