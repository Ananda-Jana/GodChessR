# Mugen Store & Trophy Room Mobile Redesign & Exclusive Chest Loot Plan

Redesign the Mugen Store and Trophy Room modals with streamlined mobile-first top navigation bars, compact category pill buttons, and update chest opening logic so chests randomly drop **either** a Secret Player card OR a Mugen Gem payout (never both together).

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the following design and loot mechanics choices during the Phase 1 clarification:

- **Confirmed Decision 1**: Store sub-navigation uses compact segmented pill buttons embedded cleanly in the top bar.
- **Confirmed Decision 2**: Chest opening rewards are mutually exclusive (50% probability split): either a Secret Player card OR a random Mugen Gem payout (500-700 for wins, 50-200 for losses/resigns).
- **Confirmed Decision 3**: Trophy Room uses compact segmented tabs for Chest Vault and Trophy Sanctuary, optimized for mobile screens.

---

## 1. Overview & Core Concept

- **What It Does**: Overhauls the Mugen Store (`MugenGemStore.tsx`) and Trophy Room (`TrophyRoomModal.tsx`) with high-density, mobile-optimized top navigation bars and collapsible category pills. Updates `ChestModal.tsx` so that opening a chest yields a single exclusive reward type (either character card or gem bundle) rather than stacking both.
- **Target Audience / Persona**: Mobile players navigating shop categories and opening loot chests on smaller screens.
- **Key Value**: Cleaner mobile layouts with zero horizontal clipping, faster category switching, and more balanced, randomized loot drops.

---

## 2. User Experience & Visual Design

- **Store Redesign (`MugenGemStore.tsx`)**:
  - Sticky Top Bar with wordmark, live Mugen Gem counter, and close button.
  - Compact horizontal scroll / wrap segmented pill row for categories: **Exchange**, **Chest Shop**, and **Secret Unlocks**.
- **Trophy Room Redesign (`TrophyRoomModal.tsx`)**:
  - Streamlined header with live gem balance and quick access tabs for **Chest Vault** and **Trophy Sanctuary**.
- **Exclusive Randomized Chest Loot (`ChestModal.tsx`)**:
  - 50/50 RNG roll: If roll < 0.5, awards Secret Player card; else, awards random Mugen Gems (with dedicated loot card reveal).

---

## 3. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    ChestModal.tsx                       │
│  - Random 50/50 roll: Secret Card OR Gem Payout         │
│  - Never awards both simultaneously                     │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  MugenGemStore.tsx                      │
│  - Mobile top nav bar with compact category pill buttons│
│  - Responsive grid cards for chests and secret unlocks  │
└─────────────────────────────────────────────────────────┘
```
