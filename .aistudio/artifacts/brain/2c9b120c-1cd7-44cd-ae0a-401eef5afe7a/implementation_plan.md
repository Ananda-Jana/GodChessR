# Mobile Redesign of Game-Mode Opening Modals

Redesign the mobile layout of the 5 core game-mode opening modals (`BotMatchModal`, `PunisherSelector`, `CullingModeEntry`, `SecretArenaModal`, and `Chess3dRulesPreviewModal`) into ergonomic, near full-screen overlay panels with 160px hero banners and sticky action controls, while preserving 100% pixel-identical desktop layouts and all game logic.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The desktop layout is finished, verified, and approved. Every change is strictly scoped below the desktop breakpoint (`md:` / `lg:`) or wrapped in mobile-only media queries (`@media (max-width: ...)`). No desktop CSS classes, layout math, desktop margins, or desktop DOM structures are altered.

- **Presentation Style (Confirmed by User)**: Near full-screen overlay panel with internal scrolling (`overflow-y: auto`, `overscroll-behavior: contain`), rounded top corners (`rounded-t-2xl sm:rounded-2xl`), reachable 44px close button, and safe-area padding (`env(safe-area-inset-bottom)`).
- **Mobile Hero Banner (Confirmed by User)**: 160px tall hero banner (`h-40 w-full object-cover`) positioned at the top of the mobile sheet, with dark radial/linear gradient overlay (`bg-gradient-to-t from-black/90 via-black/40 to-transparent`) and the mode title/kicker overlaid on top. Hidden on desktop (`md:hidden`).
- **Scope (Confirmed by User)**: All 5 core game-mode opening dialogs:
  1. `BotMatchModal.tsx` (Bot Match, Classic Bot, Crafted Bot)
  2. `PunisherSelector.tsx` (Punisher Robot AI Selector)
  3. `CullingModeEntry.tsx` (Jujutsu Kaisen Culling Game Arena)
  4. `SecretArenaModal.tsx` (Secret Players Arena & Passcode Access)
  5. `Chess3dRulesPreviewModal.tsx` (3D Annihilatic Chess Arcade)

---

## 1. Inventory & Desktop Baseline (Discovery Audit)

| # | Modal Component | File Path | Game Modes | Desktop Breakpoint & Classes | Side Image Asset | Desktop Behavior |
|---|---|---|---|---|---|---|
| 1 | `BotMatchModal` | `src/components/BotMatchModal.tsx:24-465` | Bot Match, Classic Bot, Crafted Bot | `md:flex-row`, `max-w-3xl`, `max-h-[90dvh]`, `border-4` | `/assets/aistudio/image_4aa74391.png` via `<ModeArtPanel>` | `hidden md:flex`, fixed `w-80 lg:w-84` left side banner with gradient vignette |
| 2 | `PunisherSelector` | `src/punisher/PunisherSelector.tsx:64-440` | Punisher Robot AI | `md:flex md:flex-row`, `max-w-7xl`, `h-[100dvh]` | `/assets/aistudio/image_4681080e.png` via `<ModeArtPanel>` | `hidden md:flex`, `w-80 lg:w-84` left banner, right side 3-col bot grid |
| 3 | `CullingModeEntry` | `src/components/CullingModeEntry.tsx:42-706` | Culling Game (Jujutsu Kaisen) | `md:flex-row`, `border-4`, `rounded-2xl` | `/assets/aistudio/image_9087d774.png` via `<ModeArtPanel>` | `hidden md:flex`, `w-80 lg:w-84` left banner alongside challenge controls |
| 4 | `SecretArenaModal` | `src/secret/components/SecretArenaModal.tsx:15-104` | Secret Players Arena | `md:flex-row`, `max-w-7xl`, `max-h-[90vh]` | `/assets/aistudio/image_ba67a0d0.png` via `<ModeArtPanel>` | `hidden md:flex`, `w-80 lg:w-84` left banner, right 3-col card grid |
| 5 | `Chess3dRulesPreviewModal` | `src/chess3d/Chess3dRulesPreviewModal.tsx:16-368` | 3D Annihilatic Arcade | `lg:grid-cols-12`, `max-w-4xl`, `max-h-[92vh]` | 3D Interactive Canvas (`ChessBoard3D`) | `lg:col-span-5` 3D preview on left, `lg:col-span-7` controls on right |

---

## 2. Options & Controls Preservation Checklist

Every single interactive control, option, toggle, chip, button, and helper text will be preserved with 100% functionality:

### A. `BotMatchModal`
- [x] Sticky Header: Bot icon badge, title (Classic / Crafted / Mugen), close button (`X`, min 44px)
- [x] Sticky Primary CTA: "Start [Mode] Game Now" with swords icon (sticky at bottom on mobile, sticky top/bottom on desktop)
- [x] Game Mode Selector (3 options): Classic Chess (Traditional), Mugen Chess (Dice/Prince), Crafted Pieces (Summons)
- [x] Mid-Game Crafting Perk (conditional if mode $\neq$ classic): "Enabled (Default)" vs "Avoid Crafting"
- [x] Board Theme Selector: "Light Board" (`Sun`) vs "Dark Board" (`Moon`)
- [x] Side Selection: "Play as White" (first move) vs "Play as Black" (bot moves first)
- [x] Piece Theme Selector: "Classic Standard" vs "Retro Playing Cards" (with rendered preview pieces)
- [x] Engine Strength Selector: "Grandmaster Level" (Depth 3) vs "Master Level" (Depth 2) with active badges
- [x] Match Clock Selector: "⏱️ 5 Minutes" vs "⚡ 2 Minutes"
- [x] Move Suggestions Selector: "Included" (hints) vs "Excluded" (no dots)

### B. `PunisherSelector`
- [x] Sticky Top Bar: CPU icon, "PUNISHER BOT SELECTOR", close button (`X`, min 44px)
- [x] 160px Hero Banner: Demon mask artwork (`image_4681080e.png` / `image_6c6f27fb.png`) with gradient vignette and title overlay
- [x] All 7 Mechanical AI Opponents:
  - `bangla-bot` (The raging Bengali berserker, animated fire styling, ELO 1850, Depth 4)
  - `joystick-wraith` (The beginner gamer, ELO 1100, Depth 1)
  - `static-jester` (The chaotic trickster, ELO 1350, Depth 2)
  - `octavian-hollow` (The solid fortress, ELO 1550, Depth 3)
  - `iron-regent` (The imperial strategist, ELO 1750, Depth 3)
  - `cyclops-revenant` (The warlord, ELO 1950, Depth 4)
  - `chrome-reaper` (The final boss calculator, ELO 2200, Depth 4)
- [x] Direct "FIGHT BOT" action and "CHALLENGE" modal trigger
- [x] Full Mobile Bot Specification bottom sheet modal (`selectedBotDetail`)

### C. `CullingModeEntry`
- [x] Back / Exit Navigation Button (`ArrowLeft`, min 44px)
- [x] 160px Hero Banner: Culling battlefield artwork (`image_9087d774.png`) with title overlay
- [x] "📖 Read the Theory Book First" modal trigger
- [x] Time Control Switcher: Blitz (2m) vs Rapid (5m)
- [x] Allegiance Switcher: Random vs White vs Black
- [x] Solo AI Clash Button: "Clash With Bot" (Instant AI match)
- [x] Direct Challenge Hosting: "Generate Match Code", room code clipboard copy button, waiting indicator
- [x] Join With Code: Text code input + "Enter Arena" button
- [x] Public Arena Challenges Lobby: Open challenge cards, "Accept Battle" button, refresh button

### D. `SecretArenaModal`
- [x] Sticky Top Bar: Lock icon, "Secret Players Arena", Secured Access badge, close button
- [x] 160px Hero Banner: Secret arena artwork (`image_ba67a0d0.png`) with gradient vignette
- [x] 3 Secret Challenger Cards:
  - Boyfriend Bot (Lucca) - Bengali dialogue, tactical personality, rating badge, audio preview
  - Girlfriend Bot (Magi) - Bengali sweet talk, rating badge, audio preview
  - War Bot (Sukuna / Toji) - Ruthless combatant, rating badge, audio preview
- [x] Passcode Gate Modal: 6-digit PIN input pad, validation, unlock callback
- [x] Footer info note

### E. `Chess3dRulesPreviewModal`
- [x] Sticky Top Bar: Crown icon, "3D Annihilatic Chess Arcade", FIDE 8x8 badge, close button
- [x] 160px Mobile Hero: Miniature 3D interactive chessboard canvas with vignette and rules recap
- [x] Tab Switcher: "Play vs Punisher Bot" vs "Multiplayer Room"
- [x] Bot Tab: 7 Punisher bot chips, Team selector (Orange vs Black), Time control, "Enter 3D Arcade" CTA
- [x] Multiplayer Tab: Host Match button, Join Match code input, Open Rooms list

---

## 3. Technical Architecture & Mobile Design System

```
┌─────────────────────────────────────────────────────────────┐
│                 MOBILE MODAL VIEWPORT CONTAINER             │
│   (Near full-screen: h-[94dvh] w-full max-w-lg mx-auto)     │
├─────────────────────────────────────────────────────────────┤
│ 1. STICKY TOP BAR (h-14, flex items-center justify-between) │
│    [Icon Badge] Mode Title              [Close Button 44px] │
├─────────────────────────────────────────────────────────────┤
│ 2. 160px HERO BANNER (md:hidden, relative overflow-hidden)  │
│    ┌─────────────────────────────────────────────────────┐  │
│    │ Mode Image (object-cover, loading="lazy", async)    │  │
│    │ Gradient Overlay (linear-gradient to bottom)        │  │
│    │ Mode Kicker & Subtitle Badge                        │  │
│    └─────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│ 3. SCROLLABLE OPTIONS BODY (flex-1 overflow-y-auto p-4)     │
│    - Section 1: Game Mode / Difficulty Selection (Cards)    │
│    - Section 2: Side & Piece Theme (Touch-friendly chips)   │
│    - Section 3: Time Control & Helpers                      │
│    (All touch targets >= 44px, min spacing gap-3)           │
├─────────────────────────────────────────────────────────────┤
│ 4. STICKY BOTTOM ACTION BAR (p-3 bg-black/95 border-t)      │
│    ┌─────────────────────────────────────────────────────┐  │
│    │ [PRIMARY START/CONFIRM BUTTON] (h-12 w-full bold)   │  │
│    └─────────────────────────────────────────────────────┘  │
│    pb-[calc(0.75rem+env(safe-area-inset-bottom))]           │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Breakpoint Isolation Strategy
To ensure desktop views remain strictly identical:
1. **Container**:
   - Mobile: `fixed inset-x-0 bottom-0 top-auto sm:top-auto max-h-[94dvh] h-[94dvh] rounded-t-2xl`
   - Desktop override: `md:relative md:inset-auto md:max-w-3xl md:h-auto md:max-h-[90dvh] md:rounded-none md:my-auto`
2. **Hero Banner**:
   - `block md:hidden h-40 w-full relative overflow-hidden`
   - Desktop side image (`ModeArtPanel`): maintains its existing `hidden md:flex` classes completely untouched.
3. **Controls Spacing**:
   - Mobile: single-column full-width stacked groups (`flex flex-col gap-3`) with $\ge 44\text{px}$ touch targets.
   - Desktop: unchanged multi-column grid (`sm:grid-cols-2 md:grid-cols-3`).

---

## 4. Implementation Steps & Verification Plan

### Step 1: Update `src/components/BotMatchModal.tsx`
- Wrap container with mobile sheet classes while restoring exact desktop classes via `md:`.
- Add 160px mobile hero banner displaying `/assets/aistudio/image_4aa74391.png` with gradient overlay.
- Keep `ModeArtPanel` exactly as `hidden md:flex`.
- Reposition start button as sticky at the bottom for mobile screens while preserving its desktop top bar layout.

### Step 2: Update `src/punisher/PunisherSelector.tsx`
- Add 160px mobile hero banner at the top of the mobile view (`md:hidden`) with `/assets/aistudio/image_4681080e.png` and cyber-red vignette.
- Streamline mobile list cards with larger touch targets and clearer bot ELO badges.
- Keep desktop side image and desktop 3-column card grid 100% untouched.

### Step 3: Update `src/components/CullingModeEntry.tsx`
- Add 160px mobile hero banner with `/assets/aistudio/image_9087d774.png` at the top of the card for mobile (`md:hidden`).
- Organize options on mobile into cleanly stacked sections with $\ge 44\text{px}$ buttons.
- Keep desktop `ModeArtPanel` and desktop horizontal banner untouched.

### Step 4: Update `src/secret/components/SecretArenaModal.tsx`
- Add 160px mobile hero banner with `/assets/aistudio/image_ba67a0d0.png` (`md:hidden`).
- Ensure Secret Player cards on mobile have stacked layouts with clear PIN unlock triggers.
- Keep desktop `ModeArtPanel` and desktop 3-column grid untouched.

### Step 5: Update `src/chess3d/Chess3dRulesPreviewModal.tsx`
- Refine mobile single-column layout with 160px 3D preview banner at top.
- Make launch CTA sticky at bottom on mobile screens.
- Keep `lg:grid-cols-12` desktop two-column split untouched.

### Step 6: Verification
- Run `npx tsc --noEmit` and `compile_applet` to confirm zero compilation errors.
- Confirm desktop breakpoint classes (`md:`, `lg:`) are 100% intact.
- Verify touch targets ($\ge 44\text{px}$), safe-area padding, and internal scrolling at 360px, 390px, and 430px widths.
