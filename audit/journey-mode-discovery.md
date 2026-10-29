# Phase A1 — Journey Career Mode Discovery Report

**Audit Date**: 2026-10-29  
**Status**: Read-Only Discovery Complete  
**Scope**: Career Mode Progression Path, Journey Tab, 3000 ELO Boss Bot, Local Persistence Architecture

---

## A1.1: Career Page Structure & Tabs

- **Entry Component**: `/src/components/TrophyRoomModal.tsx` (Lines 1–65).
  - Instantiates `useTrophyRoomData` hook (Line 28).
  - Conditionally renders `TrophyRoomDesktop` (`innerWidth >= 1024px`) or `TrophyRoomMobile` (`< 1024px`) (Lines 46–50).
- **Tab State Management**: `/src/components/trophy/useTrophyRoomData.ts`.
  - Type definition (Line 26):
    ```typescript
    export type TrophyMainView = 'trophies' | 'league' | 'inventory' | 'mugenpass';
    ```
  - State (Line 38):
    ```typescript
    const [mainView, setMainView] = useState<TrophyMainView>(initialMainView);
    ```
  - Currently 4 tabs:
    1. `'trophies'`: Trophy Sanctuary / Cards
    2. `'league'`: Mugen League Ladder & Rival bots
    3. `'inventory'`: Chest Vault & Loot inventory
    4. `'mugenpass'`: Mugen Event Pass ticket store
- **Tab Presentation**:
  - **Desktop** (`/src/components/trophy/TrophyRoomDesktop.tsx`, Lines 183–239):
    Rendered inside a fixed vertical sidebar `<aside className="w-20 bg-black/90 border-r-2 border-white/20 ...">`.
    Each tab is a `<button>` calling `setMainView(...)`.
    The `'league'` tab is at Lines 196–207 immediately following `'trophies'`.
  - **Mobile** (`/src/components/trophy/TrophyRoomMobile.tsx`, Lines 628–668):
    Rendered inside a fixed bottom navigation bar `<nav className="fixed bottom-0 inset-x-0 h-16 bg-black/95 border-t-2 border-white/20 ...">`.
    The `'league'` tab is at Lines 640–647 immediately following `'trophies'`.
- **Target Integration**:
  Add `'journey'` to `TrophyMainView`:
  ```typescript
  export type TrophyMainView = 'trophies' | 'league' | 'journey' | 'inventory' | 'mugenpass';
  ```
  Position the new Journey tab directly adjacent to `'league'` in both Desktop sidebar rail and Mobile bottom nav.

---

## A1.2: Punisher Robot Selector Mode & Bot Patterns

- **Files**:
  - `/src/punisher/punisherBot.ts`: Engine definitions for 7 calibrated bots.
  - `/src/punisher/PunisherSelector.tsx`: Grid modal interface for bot selection.
  - `/src/punisher/ChessBotFaces_with_Gestures.tsx`: TSX vector avatars with facial expressions and gestures (`JoystickWraith`, `StaticJester`, `OctavianHollow`, `IronRegent`, `CyclopsRevenant`, `ChromeReaper`).
  - `/src/punisher/BanglaBotFaces.tsx`: Vector face for `BanglaBot`.
- **Bot Config Interface** (`/src/punisher/punisherBot.ts`, Lines 37–48):
  ```typescript
  export interface PunisherBotConfig {
    id: PunisherBotId;
    name: string;
    rating: string;
    depth: number;
    blunderChance: number; // 0 to 1
    aggression: number;    // 1.0 is neutral, higher is more aggressive
    mobilityWeight: number;
    centerControlWeight: number;
    kingSafetyWeight: number;
    openings: string[];
  }
  ```
- **Lowest Bots (Candidates for Early Journey Nodes 1–3)**:
  - `joystick-wraith`: Rating 400–600, search depth 2, blunderChance 0.35, aggression 1.0.
  - `static-jester`: Rating 800–1000, search depth 3, blunderChance 0.15, aggression 1.5.
  - `octavian-hollow`: Rating 1300–1500, search depth 4, blunderChance 0.04, aggression 0.7.
- **TSX Avatar Rendering**:
  Avatars are pure React TSX functional components taking `{ gesture?: ...; className?: string }` returning scalable SVG graphics.

---

## A1.3: Bot Engine Mechanics & 3000 ELO Boss Layering

- **Engine Structure** (`/src/game/bot.ts`):
  - `evaluateBoard` (Lines 103–207): Centipawn board evaluation using `PIECE_VALUES` (Pawn 100, Knight 320, Bishop 330, Rook 500, Prince 750, Queen 900, King 20000), piece-square tables (`PAWN_TABLE_WHITE`, `KNIGHT_TABLE`, `BISHOP_TABLE`, `PRINCE_TABLE`, `QUEEN_TABLE`), crafted piece values, and 2-pawn end-rank draw incentives.
  - `minimax` (Lines 212–304): Classical minimax with alpha-beta pruning, recursive depth decrement, draw detection, and move ordering.
  - `orderMoves` (Lines 170–210): Sorts moves prioritizing captures (MVV-LVA) and pawn promotions to maximize alpha-beta cutoffs.
  - `getBestBotMove` (Lines 309–388): Top-level move selection coordinating dice rolls or direct move searches.
- **Layering a ~3000 ELO Boss Without Modifying Engine**:
  - The shared chess engine (`/src/game/engine.ts`) exports:
    `applyMoveToBoard`, `getAllLegalMoves`, `isKingInCheck`, `posToNotation`, `notationToPos`.
  - In `/src/journey/journeyBossBot.ts`, we implement an advanced Grandmaster/Stockfish-like evaluation layer:
    - Search Depth: 5–7 plies with quiescent tactical capture search.
    - Blunder Chance: Exactly `0.0`.
    - Transposition Table / Zobrist board state caching for rapid evaluation without UI lag.
    - Enhanced Positional Heuristics: Center dominance, king safety shield, passed pawn bonuses, open file rooks, bishop pairs, and piece mobility.
    - Zero changes to `/src/game/engine.ts` required.

---

## A1.4: Bot Match Lifecycle in App.tsx & Dashboard.tsx

- **Match Dispatch**:
  - `Dashboard.tsx` dispatches `open_league_bot_match` with `{ botId }` (Line 274, Line 314).
  - In `App.tsx` (Line 261): `handleStartLeagueBotMatch(botId)` calls `handleStartPunisherMatch(botId, true)`.
  - `handleStartPunisherMatch` constructs an initial `MatchState` object, setting timers to 300s, setting `turn: 'white'`, setting `whitePlayer` as the logged-in/guest user, and `blackPlayer` as the bot.
- **Match View & Lifecycle**:
  - `App.tsx` (Lines 818–852) conditionally renders `<MatchView />` whenever `activeGame` (`socketMatch || botMatch || punisherMatch`) is non-null.
  - Passes handlers: `customOnMove`, `customOnRoll`, `customOnResign`, `isBotMatch`, `isBotThinking`.
  - On match end: `setLastCompletedMatch`, plays sound effects (`sounds.playGameOver`), records game.
  - On exit: cleans up active matches, cleans up thinking timers, and dispatches return events (`open_league_tab`).
- **Application for Journey Mode**:
  - Journey matches will dispatch `open_journey_bot_match` with `{ nodeId, botConfig, botPlayer }`.
  - `App.tsx` starts a dedicated Journey match lifecycle:
    - Sets `journeyMatch` state.
    - Runs Journey bot moves on bot turn.
    - On match completion, records victory/stars/points in `journeyStore` and unlocks the subsequent node.
    - On exit, returns player seamlessly to the `'journey'` tab in the Career view.

---

## A1.5: Local Persistence & Storage Architecture

- **Patterns in `/src/economy/mugenStore.ts`**:
  - Key prefixes: e.g. `mugen_gems_v1_` (Lines 7–11).
  - Memory fallback dictionaries: `const gemsMemoryFallback: Record<string, number> = {}` (Lines 14–18).
  - User-keyed isolation: `getGemsKey(userId): string => ${PREFIX}${userId || 'guest'}` (Lines 20–38).
  - Safe access with try/catch wrapping `localStorage.getItem` / `localStorage.setItem` (Lines 61–74, 84–98).
  - Custom event broadcasts: `window.dispatchEvent(new CustomEvent('mugen_economy_update', ...))` (Lines 40–52).
- **Journey Mode Persistence Design**:
  - Primary Storage Key: `journey_progress_v1_{userId}` (with fallback to `journey_progress_v1_guest`).
  - In-memory fallback map: `const journeyMemoryFallback: Record<string, JourneyProgress> = {}`.
  - Structure:
    ```typescript
    export interface JourneyNodeProgress {
      nodeId: string;
      unlocked: boolean;
      completed: boolean;
      stars: number; // 0 to 3
      highScore: number;
      bestMovesCount?: number;
      firstClearedAt?: number;
    }

    export interface JourneyProgress {
      userId: string;
      currentCheckpointId: string;
      totalStars: number;
      totalJourneyPoints: number;
      nodes: Record<string, JourneyNodeProgress>;
      customAvatarUrl?: string;
      selectedAvatarId?: string;
      updatedAt: number;
    }
    ```
  - Event notification: `'journey_progress_updated'`.
  - **Strict Guarantee**: Completely isolated from `mugen_*` storage keys, zero collisions or schema conflicts.

---

## A1.6: Responsive UI Tokens & Career Page Styling

- **Breakpoints**: Desktop `>= 1024px`, Mobile `< 1024px`.
- **Color Palette & Theme Tokens**:
  - Base background: `#080b11` (ultra-dark void), `bg-black/90` surface overlays.
  - Accent / Primary: Amber/Gold `#fbbf24` (`text-amber-400`, `bg-amber-400`).
  - Cleared / Success: Emerald `#10b981` (`text-emerald-400`, `bg-emerald-500`).
  - Locked / Neutral: Slate `#1e293b` (`bg-slate-900`, `border-slate-800`, `text-slate-500`).
  - Boss / Danger: Crimson / Red `#ef4444` (`text-rose-400`, `bg-rose-950/40`, `border-rose-500`).
- **Typography & Borders**:
  - Font: `font-mono`, `font-black uppercase tracking-wider`.
  - Neo-brutalist / Cyberpunk borders: `border-2 border-black`, `shadow-[3px_3px_0px_#fff]`, `shadow-[4px_4px_0px_#000]`.
  - Mobile touch targets: minimum 44px (`min-h-[44px]`).

---

## A1.7: Reusable Chest Visuals

- `/src/chest/ChestSvg.tsx`: Fully animated scalable vector chest with gold bands, studs, keyhole, and open/close states.
- Reusable for Journey milestone reward crates, checkpoint bonus chests, and completion awards along the path.

---

## A1.8: Candidate Directory

- Target path: `/src/journey/`.
- Verified: Does not exist in the codebase. Clean slate with zero naming collisions.
