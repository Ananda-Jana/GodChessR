# Reward Chest Feature Updates (6 Sequential Steps)

Implementation plan for refining the Reward Chest feature in MugenChessX. This includes setting fixed 6-digit access codes as specified by the user, restricting reward pool draws to the four new secret players, aligning Secret Arena avatar assets, dark premium card styling, and introducing a discouraged "Resignation Chest" with a +6/+7 ELO penalty banner.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your confirmed choices and updated PIN request:
> - **Exact PIN Codes**:
>   - **Lucca**: `000000`
>   - **Magi**: `111112`
>   - **Toji**: `654321`
>   - **LenGoku**: `222220`
> - **ELO Handling for Resign Chest**: If an exported player rating update function exists in the codebase, apply the +6 or +7 ELO penalty score update once; otherwise, render the rating penalty as display-only text.
> - **Resign Chest Outcome Panel Styling**: Formatted as a 136x204px panel matching the dimensions of the reward card with rounded corners, showing the +6/+7 ELO penalty in red, quitting caption, and a single CONTINUE button.

---

## 1. Overview & Core Concept

- **Goal**: Apply 6 additive visual, data, and behavioral updates to the Reward Chest system strictly one step at a time.
- **Scope**: Restrict changes to `src/chest/*`, Secret Arena player configuration (`src/secret/secretPlayersData.ts`), and game mode resign hooks.
- **Invariants**: Preserve existing 3-tap opening animations, pending chest queueing, lazy loading, audio effects, and girl/boy bot configurations.

---

## 2. User Experience & Visual Design

### Step-by-Step Flow

1. **Fixed Access Codes**:
   - `Lucca` = `000000`
   - `Magi` = `111112`
   - `Toji` = `654321`
   - `LenGoku` = `222220`
   - Players can unlock through typing in the Secret Arena PIN keypad or tapping "PLAY" on the reward card.

2. **Reward Pool & Single Card**:
   - Drawing a chest randomly selects exactly 1 player from the 4 new secret players (`Lucca`, `Magi`, `Toji`, `LenGoku`).
   - Prioritizes unowned characters; if all 4 are unlocked, randomly draws one marked with the grey `OWNED` badge.

3. **Avatar Synchronization**:
   - References `/secret-players/lucca.png`, `/secret-players/magi.png`, `/secret-players/toji.png`, and `/secret-players/lengoku.png` identically with Secret Arena.

4. **Dark Premium Card Styling**:
   - Card dimensions: `136 x 204 px` (or `120 x 184 px` for screens under 360px).
   - Linear gradient background (`#1d1b4b` to `#0f0e2a`), 14px rounded corners, top accent color bar with "SECRET PLAYER" label.
   - Centered `92 x 92 px` avatar with 3px accent border.
   - Monospace `16px` letter-spaced 6-digit code pill (`#fde68a` on `#0b0b1f` background with dashed border).
   - Full-width `44px` high PLAY button with 10px corner radius and tactile press shadow.

5. **Resign Chest ("A Discouraging Chest")**:
   - Triggered when a match is ended via player resignation (after `MIN_MOVES` threshold).
   - Visuals: Dull stone body (`#57534e`), dark shade (`#44403c`), iron bands (`#78716c`), crack graphic on lid, dim red-grey aura, grey sparks.
   - Outcome Panel: 136x204px panel displaying big red `+6 ELO` or `+7 ELO` score (`#ef4444`, 28px bold), caption `"THAT'S WHAT QUITTING GETS YOU"`, and a CONTINUE button.

---

## 3. Key Product Decisions & Trade-Offs

- **Sequential Execution**: Perform steps strictly one after another, writing `"Step N done: <files edited>"` after each step.
- **Additive Resign Hook**: Extend `reportGameEnd` with optional `resigned?: boolean`. Call `reportGameEnd(match, 'loss', true)` upon player resignation without altering match engine rules.
- **Zero Modification to Unrelated Systems**: Boy Bot, Girl Bot, War Bot, and Training Mode remain completely untouched.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────┐
│                      Match View                         │
│   (MatchView / CullingMatchView / RoseParadiseView)     │
└───────────────────────────┬─────────────────────────────┘
                            │ reportGameEnd(match, result, resigned)
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   reportGameEnd.ts                      │
│        (Validates min moves, queue pending chest)       │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  ChestRewardHost                        │
│          Mounts ChestModal (win/loss/resigned)          │
└───────────────────────────┬─────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
  ┌──────────────────┐            ┌──────────────────┐
  │   Standard Chest │            │  Resigned Chest  │
  │ (Victory/Consol.)│            │ (Dull Stone/Crack│
  └─────────┬────────┘            └─────────┬────────┘
            │                               │
            ▼                               ▼
  ┌──────────────────┐            ┌──────────────────┐
  │ RewardCard (Card)│            │ ResignOutcome    │
  │ Single Secret    │            │ +6/+7 ELO        │
  │ Player (4 pool)  │            │ Penalty Panel    │
  └──────────────────┘            └──────────────────┘
```

### Component & State Changes

- **`chestConfig.ts`**: Update `SECRET_PLAYER_CODES` with permanent PIN values (`000000`, `111112`, `654321`, `222220`).
- **`chestStore.ts`**: Restrict `pickRandomReward` pool to `['lucca', 'magi', 'toji', 'lengoku']`.
- **`RewardCard.tsx` & `chest.css`**: Update dimensions, rounded borders (14px), monospace code pill, and dark gradient theme.
- **`ChestSvg.tsx`**: Add `isResigned` variant with stone texture, iron bands, and cracked lid vector paths.
- **`ChestModal.tsx`**: Support `isResigned` mode, dim red aura, resignation outcome card, and ELO penalty display.
- **`reportGameEnd.ts`**: Accept `resigned?: boolean` flag.
