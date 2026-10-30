# Hero Duel Diagnosis & Defeat Investigation

## 1. Current State of `src/hero-duel/`
The domain data and business logic layers are fully built:
- `config/`: `boardConfig.ts`, `balanceConfig.ts`, `rarityConfig.ts`, `economyConfig.ts`
- `types/`: `heroDuelTypes.ts`, `cardTypes.ts`
- `heroes/`: All 9 heroes (`mugenKing.ts`, `malevolentPriest.ts`, `drMethanogenic.ts`, `captainEnglland.ts`, `ajx.ts`, `yjkstra.ts`, `ironcladWarden.ts`, `blackMonkey.ts`, `partKingKong.ts`) and `heroRegistry.ts`
- `engine/`: `boardGeometry.ts`, `statusManager.ts`, `zoneManager.ts`, `priorityEngine.ts`, `moveGenerator.ts`, `turnManager.ts`, `heroDuelEngine.ts`
- `equipment/`: `equipmentData.ts`, `craftedSigils.ts`, `budgetValidator.ts`
- `ai/`: `easyBot.ts`, `normalBot.ts`, `hardBot.ts`, `balanceSimulator.ts`
- `cards/`: `cardDictionary.ts`, `cardGrammar.ts`, `proceduralBackgrounds.ts`

## 2. Investigation: Why Players Defeat Too Quickly
1. **Turn 1 Line-of-Sight Exposure**: In initial drafts, if heroes were placed directly aligned in the same files (e.g., File B to File B across a 7x8 board) without intermediate blocker pieces, long-range sliders (`malevolent-priest` diagonal, `dr-methanogenic` orthogonal) or leapers (`captain-englland`) could threaten Captains early.
2. **Instant AI Execution**: Without a thinking delay, the AI executed moves instantaneously, causing confusion for new players who couldn't track what piece moved where.
3. **Lack of Threat Warnings**: Players were caught off guard when their Captain was under direct attack because no "CHECK" style alert was displayed.

## 3. Corrective Fixes Applied
- **Safe Initial Slots**: Default placements in `Placement.tsx` and `heroDuelEngine.ts` assign staggered home rank positions (Files B, C, E, F) ensuring no direct line of sight on Turn 1.
- **Easy AI Calibrated**: Easy bot executes 1-ply random legal moves with 75% mild capture preference and 0 lookahead, allowing players to comfortably survive past turn 10 and test active abilities.
- **Pacing Guard**: AI actions now feature a 400-900ms thinking delay with an "Enemy is thinking..." indicator.
- **Captain Threat Warning**: Added a pulsing red "CAPTAIN IN DANGER" banner and log alert whenever a Captain can be captured on the opponent's next move.
