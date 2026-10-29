# Phase A2 Plan — Journey Career Mode

## 1. Directory Structure & File Architecture
All new Journey mode code lives strictly in `/src/journey/`:
- `/src/journey/journeyTypes.ts`: Type definitions for nodes, checkpoints, boss configs, user progress, and star ratings.
- `/src/journey/journeyNodes.ts`: Definitions for 21 nodes (Nodes 1–21), including early beginner bots (Nodes 1–3), regular bots, and boss nodes every 3rd–4th node (Nodes 4, 8, 12, 16, 20), plus final bonus champion node (Node 21).
- `/src/journey/journeyBossBot.ts`: 3000 ELO Boss Engine evaluator layering over existing engine methods (`applyMoveToBoard`, `getAllLegalMoves`, `isKingInCheck`) with depth search, quiescence search, zero blunders, and king safety weights.
- `/src/journey/journeyStore.ts`: Storage manager for `journey_progress_v1_{userId}` with in-memory fallback dictionary, star calculations, node unlocks, and avatar storage.
- `/src/journey/JourneyAvatar.tsx`: Reusable avatar slot supporting custom image file uploads (`FileReader` to data-URL) with TSX SVG vector fallbacks.
- `/src/journey/JourneyNodeCard.tsx`: Checkpoint node card component displaying status (locked, active, cleared), stars, bot badge, rewards, and boss styling.
- `/src/journey/JourneyPreMatchModal.tsx`: Battle briefing modal showing bot stats, dialogue intro, rules, rewards, and "Engage Battle" action.
- `/src/journey/JourneyPathView.tsx`: Responsive scrollable journey progression roadmap (desktop & mobile) with connected path nodes, milestone chests, and header statistics.

## 2. Integration with Career Tabs
- `/src/components/trophy/useTrophyRoomData.ts`:
  - Extend `TrophyMainView` type: `'trophies' | 'league' | 'journey' | 'inventory' | 'mugenpass'`.
- `/src/components/trophy/TrophyRoomDesktop.tsx`:
  - Add "Journey" button in the left sidebar rail directly between `'league'` and `'inventory'`.
  - Icon: `Swords` or `Compass` with amber/crimson active badge.
  - Render `<JourneyPathView />` when `mainView === 'journey'`.
- `/src/components/trophy/TrophyRoomMobile.tsx`:
  - Add "Journey" tab button in the bottom navigation bar directly between `'league'` and `'inventory'`.
  - Render `<JourneyPathView />` when `mainView === 'journey'`.

## 3. Match Lifecycle Wiring in App.tsx
- Add `journeyMatch` state and event listener `open_journey_bot_match`.
- On starting a Journey node battle:
  - Closes career modal, launches standard `MatchView` using the Journey bot engine.
  - On win, invokes `journeyStore.recordNodeWin(userId, nodeId, movesCount, remainingTime)`.
  - On exit, automatically re-opens the Career modal to the `'journey'` tab.

## 4. Strict Constraints Enforced
- `src/game/engine.ts` is 100% untouched.
- `src/punisher/*` files are 100% untouched.
- `mugen_*` storage keys are 100% untouched.
