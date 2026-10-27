# Post-Game Reward Chest Modal & Trophy Room Chest Inventory

Decouple the chest opening prompt from the post-game red game-over box into a dedicated, instant post-match modal with animated chest presentation and Open/Save options, and add a dedicated Chest Inventory tab inside the Trophy Room featuring unopened chest management and historical chest reward output logs.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following design decisions were confirmed via Phase 1 clarification:
> - **Post-Game Modal Presentation**: Dedicated prompt popup with animated chest artwork, featuring "Open Now" and "Save to Inventory" action buttons immediately after game completion.
> - **Trophy Room Integration**: A clean top navigation tab alongside the main Trophies view ("Trophy Showcase" and "Chest Inventory").
> - **Chest Inventory Organization**: Two focused sub-tabs: "Chests to Open" (unopened stored chests with one-click opening) and "Claimed Rewards History" (all cards and rewards unlocked from chests).
> - **Game-Over Box Clean-up**: Remove the small "OPEN CHEST" button from the red game-over badges box in `MatchView` and `CullingMatchView` so it no longer mimics badge items.

---

## 1. Overview & Core Concept

Currently, after completing a game, a small "OPEN CHEST" button is placed inside the red game-over notification box alongside small achievement badge cards, creating visual confusion and forcing players to hunt for their earned chest.

This update introduces:
1. **Instant Post-Match Chest Award Modal**: Immediately upon match conclusion, an attractive modal presents the earned chest with a breathing/shaking chest animation and two clear choices: **"Open Chest Now"** or **"Save to Inventory"**.
2. **Persistent Chest Inventory in Trophy Room**: Players who choose to save their chest can access it anytime from the Trophy Room via a dedicated top tab. The inventory contains:
   - **Chests to Open**: Visual cards of stored chests ready to be unlocked.
   - **Claimed Rewards History**: A gallery of unlocked secret characters, Elo boosts, and special cards obtained from previous chest openings.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[ Match Concludes ]
        │
        ▼
[ Instant Post-Game Chest Award Modal ]
   ┌─────────────────────────────────────────────────────────┐
   │                  CHEST REWARD EARNED!                   │
   │                                                         │
   │                [ Animated Chest Visual ]                │
   │                  "Victory / Match Loot"                 │
   │                                                         │
   │   [ OPEN CHEST NOW (Primary) ]   [ SAVE FOR LATER ]     │
   └─────────────────────────────────────────────────────────┘
        │                                   │
        ▼ (Open Now)                        ▼ (Save for Later)
[ 3-Tap Chest Reveal Modal ]        [ Saved to Chest Inventory ]
        │                                   │
        ▼                                   ▼
[ Reward Added to History ]         [ View in Trophy Room Tab ]
```

### UI & Styling Guidelines
- **Brutalist Theme Alignment**: High-contrast black (`#000000`), deep panel surfaces (`#0a0a0c`), crisp borders (`border-3 border-white/black`), and warm amber accents (`#fbbf24`).
- **Post-Game Modal**: Clean modal with pulsing chest SVG, glowing particle aura, and large tactile buttons (min-height 48px, bold uppercase text).
- **Trophy Room Tabs**: Segmented tab control in the modal header (`Trophies (X)` vs `Chest Inventory (Y)`), adhering to zero-pill discipline with clean functional buttons.

---

## 3. Key Technical Decisions & Data Strategy

### Technical Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       Client Store Layer                        │
│                                                                 │
│  src/chest/chestStore.ts                                        │
│  ├── pendingEvents: PendingChestEvent[]                         │
│  ├── claimedRewards: ClaimedChestReward[]                       │
│  └── Storage persistence with memory fallback                   │
└────────────────┬───────────────────────────────┬────────────────┘
                 │                               │
                 ▼                               ▼
┌────────────────────────────────┐ ┌──────────────────────────────┐
│       Game-End Triggers        │ │      Trophy Room Modal       │
│                                │ │                              │
│ src/chest/reportGameEnd.ts     │ │ src/components/              │
│ ├── Instantly emits event      │ │ TrophyRoomModal.tsx          │
│ └── Triggers PostGameChestAward│ │ ├── Top Tab: Trophies        │
│                                │ │ └── Top Tab: Chest Inventory │
│ src/chest/ChestRewardHost.tsx  │ │     ├── Unopened Chests      │
│ ├── PostGameChestAwardModal    │ │     └── Claimed History Cards│
│ └── Interactive ChestModal     │ └──────────────────────────────┘
└────────────────────────────────┘
```

### Component & State Mapping

1. **`src/chest/chestStore.ts`**:
   - Extend `ChestStoreData` with `claimedRewards: ClaimedChestReward[]`.
   - Add `recordClaimedReward(reward, isOwned, matchId)` to log opened rewards into persistent storage.
   - Retain existing `addPendingChestEvent` and `popPendingChestEvent` for seamless backward compatibility.

2. **`src/chest/PostGameChestAwardModal.tsx` (New Component)**:
   - Dedicated prompt modal triggered immediately upon match completion.
   - Shows animated chest SVG with ambient particle glow and match summary context.
   - Actions:
     - `onOpenNow()`: Launches the interactive 3-tap chest unlocking modal.
     - `onSaveForLater()`: Closes modal and confirms the chest is safely saved to the Trophy Room Chest Inventory.

3. **`src/chest/ChestRewardHost.tsx`**:
   - Hosts both the `PostGameChestAwardModal` (first phase prompt) and the interactive `ChestModal` (second phase tap-to-open sequence).
   - Records rewarded items into `claimedRewards` upon successful chest unlocking.

4. **`src/components/TrophyRoomModal.tsx`**:
   - Add top segmented navigation: `[ Trophy Showcase (X/Y) ]` and `[ Chest Inventory (Z) ]`.
   - When "Chest Inventory" is active, display:
     - Sub-tab 1: **Chests to Open** (grid of stored unopened chests with an "Open Now" button).
     - Sub-tab 2: **Claimed Rewards History** (grid of all unlocked character cards, with rarity, unlock date, and stats).

5. **`src/components/MatchView.tsx` & `src/components/CullingMatchView.tsx`**:
   - Remove the small "OPEN CHEST" button embedded in the red game-over box.
   - Ensure `reportGameEnd` smoothly triggers the standalone modal immediately upon match completion without breaking board inspection or game analysis.

---

## 4. Verification & Testing Plan

1. **Immediate Trigger Verification**: Complete or resign a match in Standard Chess, Culling Game, Rose Paradise, and Bot mode; verify the new standalone chest award modal pops up immediately.
2. **"Open Now" Path**: Click "Open Chest Now" and verify the 3-tap unlocking animation sequence executes properly, awards cards/Elo, and saves the output to history.
3. **"Save for Later" Path**: Click "Save to Inventory" and verify the chest is stored in `chestStore`.
4. **Trophy Room Inventory**: Open Trophy Room, switch to "Chest Inventory", verify unopened chests are displayed with functioning "Open" buttons, and verify all previously claimed cards appear in "Claimed Rewards History".
5. **Clean Build**: Run `compile_applet` and `lint_applet` to ensure 0 TypeScript and bundle errors.
