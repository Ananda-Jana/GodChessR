# Mugen Pass System & Event Ticket Store

Implementation plan for integrating the **Mugen Pass** tab inside the Trophy Room / League interface, featuring 3 tiered Event Passes (**Nu Pass 1.2X**, **Mecha Mugen Pass 1.5X**, **VIP Pass 2.0X**) purchased with Mugen Gems, custom ticket icons styled with dollar symbols, active match counters, and full integration with League match trophy rewards.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design decisions have been confirmed and incorporated based on your choices:

- **Pass Duration & Activation**: Every purchased Mugen Pass remains active for **10 League matches**.
- **Pass Upgrades**: Purchasing a higher tier pass (e.g. upgrading from Nu Pass to VIP Pass) **instantly applies the higher multiplier** and resets/extends active match charges to 10 matches.
- **Pass Tier Breakdown**:
  - **Nu Pass**: **1.2X Trophy Multiplier** · Cost: **1,200 Mugen Gems** · 10 Match Charges.
  - **Mecha Mugen Pass**: **1.5X Trophy Multiplier** · Cost: **2,000 Mugen Gems** · 10 Match Charges.
  - **VIP Pass**: **2.0X Trophy Multiplier** · Cost: **3,000 Mugen Gems** · 10 Match Charges.
- **Economy Sync**: Integrated directly with `getGems()` and `deductGems()` in `mugenStore.ts` so Gem balances update across all views (Store, Dashboard, Header, Pass Store).

---

## 1. Overview & Core Concept

The **Mugen Pass** system introduces premium Event Passes into the League Mode ecosystem. Players can exchange earned Mugen Gems for an active multiplier pass that multiplies all League match trophy payouts (both victories and participation trophies) for 10 consecutive matches.

---

## 2. User Experience & Visual Design

### Mugen Pass Tab & Ticket Icon
- **Navigation Item**: A new **MUGEN PASS** tab in the Trophy Room header alongside `Trophies`, `League`, and `Inventory`.
- **Custom Tab Icon**: A ticket icon with $ symbol in the middle, styled after the ticket geometry (`/public/assets/aistudio/image_a17115c5.png`).
- **Mobile & Desktop Responsive Layouts**:
  - **Desktop Layout (`TrophyRoomDesktop.tsx`)**: 3-column ticket card showcase featuring pass badges, multiplier tags, active charges meter, and 1-click Gem purchase buttons.
  - **Mobile Layout (`TrophyRoomMobile.tsx`)**: Non-flickering touch-optimized card layout with horizontal pass cards, prominent Gem balance badge, and purchase confirmation modal.

### Ticket Card Aesthetic
Inspired by the 3D ticket pass design (`image_a17115c5.png`):
- Cutout side notch detailing (`border-dashed`, circular edge notches).
- **Nu Pass**: Sleek Cyan/Teal ticket card with 1.2X badge and silver stars.
- **Mecha Mugen Pass**: Cyber Purple/Pink ticket card with 1.5X badge and golden stars.
- **VIP Pass**: Deluxe Gold/Amber ticket card with 2.0X badge, glowing border, and triple star insignia.

---

## 3. Key Product Decisions & Trade-Offs

- **Match Charges vs Time Duration**: Match charges (10 matches) ensure players get full value regardless of play frequency without losing pass duration while offline.
- **League Match Integration**:
  - When playing a League match with an active pass, the base trophies (e.g. 100 TR on win, 25 TR on loss) are multiplied by the active pass multiplier (e.g. $100 \times 2.0 = 200\text{ TR}$).
  - The `PostGameTrophyCardModal` displays a callout: `"VIP PASS ACTIVE — 2.0X MULTIPLIER APPLIED!"`.
  - Upon match completion, 1 charge is deducted from the active pass.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Trophy Room Modal                               │
│  [ Trophies ]     [ League ]     [ MUGEN PASS ($) ]     [ Inventory ]  │
└───────────────────────────────────────────────────┬────────────────────┘
                                                    │
                      ┌─────────────────────────────┴─────────────────────────────┐
                      ▼                                                           ▼
         ┌──────────────────────────┐                               ┌──────────────────────────┐
         │ PassStore (Desktop View) │                               │  PassStore (Mobile View) │
         │ 3-Column Ticket Cards    │                               │  Touch Carousel / List   │
         └────────────┬─────────────┘                               └────────────┬─────────────┘
                      │                                                          │
                      └─────────────────────────────┬────────────────────────────┘
                                                    │
                                                    ▼
                                     ┌─────────────────────────────┐
                                     │  Mugen Pass Store / State   │
                                     │  - Active Pass & Multiplier │
                                     │  - Remaining Match Charges  │
                                     │  - Gem Deductions           │
                                     └──────────────┬──────────────┘
                                                    │
                                                    ▼
                                     ┌─────────────────────────────┐
                                     │    League Match Processor   │
                                     │  Base TR x Pass Multiplier  │
                                     │  Deduct 1 Charge / Match    │
                                     └─────────────────────────────┘
```

### State & Storage Architecture (`mugenPassStore.ts`)
- Stores active pass state in `localStorage` keyed by `userId`:
  ```typescript
  interface ActiveMugenPass {
    passId: 'nu_pass' | 'mecha_pass' | 'vip_pass';
    multiplier: number; // 1.2, 1.5, 2.0
    chargesRemaining: number; // Max 10
    purchasedAt: number;
  }
  ```
- Functions: `getActivePass(userId)`, `purchasePass(userId, passId)`, `consumePassCharge(userId)`.

---

## Execution Steps

1. **Create `mugenPassStore.ts`**: Store pass definitions, Gem prices, multipliers, and charge consumption logic.
2. **Create Ticket Icon SVG Component (`MugenPassIcon.tsx`)**: Reusable ticket icon with $ symbol and notch details.
3. **Build `MugenPassView.tsx`**: Separate desktop and mobile optimized layout components for the Mugen Pass store.
4. **Update `TrophyRoomDesktop.tsx` & `TrophyRoomMobile.tsx`**: Add `mugenpass` tab with ticket icon and render `MugenPassView`.
5. **Integrate with `MatchView.tsx` & `server/league.ts`**: Apply active pass multiplier to League match trophy rewards and deduct 1 charge per completed game.
6. **Compile & Verify**: Test Gem deductions, multiplier math, and responsive presentation across desktop and mobile.
