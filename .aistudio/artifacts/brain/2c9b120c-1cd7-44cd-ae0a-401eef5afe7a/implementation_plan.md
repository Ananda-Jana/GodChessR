# Implementation Plan - Game Mode Modals & Mobile Navbar Collapse

Standardize game mode opening modal headers with a top-left Back button and top-right crimson red square Close button, and implement mobile bottom navigation bar collapsing into a floating bottom-left trigger.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Game Mode Opening Modals Only**: Back and red close buttons apply exclusively to modal dialogs for opening game modes (Bot Match, Hashira Dojo, Secret Arena, 3D Arcade Rules, Punisher Selector).
> - **Top-Right Close Style**: Crimson red square (`bg-red-600`), solid black border, shadow (`shadow-[2px_2px_0px_#000]`), small white cross (`X`).
> - **Mobile Navbar Collapse**: When a game mode modal or setup screen is open on mobile, the bottom navbar collapses into a small floating icon in the bottom-left corner. Tapping it temporarily expands the navbar. When a real game match starts, the navbar is entirely absent.

---

## 1. Overview & Core Concept

- **Modals Affected**:
  1. `BotMatchModal.tsx`
  2. `HashiraDojoModal.tsx`
  3. `SecretArenaModal.tsx`
  4. `Chess3dRulesPreviewModal.tsx`
  5. `PunisherSelector.tsx`
- **Header Layout**:
  - Top-left: Back button (returns to previous step / dashboard).
  - Top-right: Crimson red square close button with small white `X`.
- **Mobile Navbar Collapse**:
  - Floating trigger at `bottom-4 left-4` on mobile during modal configuration.
  - Expands on tap; disappears during active gameplay (`activeGame`).

---

## 2. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│ App / Dashboard State                                  │
│ (Tracks activeModal, activeGame, isNavExpanded)        │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
                ▼                        ▼
┌───────────────────────────────┐ ┌──────────────────────────────────────┐
│ Game Mode Opening Modals      │ │ Mobile Bottom Navbar & Floating Icon │
│ (BotMatch, Hashira, Punisher) │ │ (Collapses on mobile when modal open)│
│ - Top-Left Back Button        │ │ - Floating button (bottom-left)      │
│ - Top-Right Red Close Box     │ │ - Temporary expand on tap            │
└───────────────────────────────┘ └──────────────────────────────────────┘
```

- **State Management**:
  - Track modal active state in `Dashboard.tsx` or `App.tsx`.
  - Pass `onClose` and `onBack` props consistently to each modal.
  - Track `isNavExpanded` state for mobile collapsed navbar.

---

## 3. Step-by-Step Implementation Plan

### Step 1: Update Game Mode Opening Modal Headers
- **Files**:
  - `src/components/BotMatchModal.tsx`
  - `src/components/HashiraDojoModal.tsx`
  - `src/secret/components/SecretArenaModal.tsx`
  - `src/chess3d/Chess3dRulesPreviewModal.tsx`
  - `src/punisher/PunisherSelector.tsx`
- **Changes**:
  - Ensure every modal header includes:
    - Left side: `<button onClick={onBack || onClose} className="..."><ArrowLeft className="w-4 h-4" /><span>Back</span></button>`
    - Right side: `<button onClick={onClose} className="min-w-[40px] min-h-[40px] p-2 bg-red-600 hover:bg-red-700 active:translate-x-0.5 active:translate-y-0.5 border-2 border-black text-white flex items-center justify-center shadow-[2px_2px_0px_#000] rounded-lg"><X className="w-4 h-4 text-white stroke-[2.5]" /></button>`

### Step 2: Implement Mobile Bottom Navbar Collapse
- **Files**:
  - `src/components/Dashboard.tsx`
  - `src/App.tsx`
- **Changes**:
  - When a game mode opening modal is active (`isBotModalOpen || isHashiraModalOpen || isPunisherSelectorOpen || isSecretArenaOpen || isChessRulesOpen`), hide the full mobile bottom navbar and render the floating bottom-left button (`fixed bottom-4 left-4 z-40 w-11 h-11 bg-black border-2 border-white rounded-lg shadow-[3px_3px_0px_#fff] flex items-center justify-center`).
  - Clicking the floating icon toggles `isNavExpanded`. If expanded, show the full navbar for 5 seconds or until tapped again.
  - When `activeGame` is non-null (real game running), neither navbar nor floating icon renders.

### Step 3: Build & Verification
- Run `npm run build` (`compile_applet`) and `tsc --noEmit` (`lint_applet`) to verify zero compilation or typing errors.
