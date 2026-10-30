# Hero Duel: Architecture & Implementation Plan (PLAN.md)

## 1. Directory Structure

```
/src/hero-duel/
  ├── RECON.md                         # Phase A Recon findings
  ├── PLAN.md                          # This architecture and engineering plan
  ├── BALANCE_REPORT.md                # Balance simulator results (AI vs AI)
  ├── heroDuelRegistry.ts              # Single shared registration entry for all dashboard drawers/views
  ├── index.ts                         # Public exports
  ├── config/
  │   ├── boardConfig.ts               # 7 columns (A-G), 8 rows (1-8), Cream & Crimson palette
  │   ├── balanceConfig.ts             # 12-point hero budgets, cooldowns, ranges, turn limits (60)
  │   ├── rarityConfig.ts              # Drop rates (Common 50%, Rare 28%, Epic 14%, Master 6%, Mythic 1.8%, Legendary 0.2%)
  │   └── economyConfig.ts             # Mugen Gems and Crypto equipment & sigil pricing
  ├── types/
  │   ├── heroDuelTypes.ts             # State machine, Hero, Ability, Equipment, Status, Zone, Match
  │   └── cardTypes.ts                 # Card model, grammar slots, rarity, visual layers
  ├── heroes/
  │   ├── heroRegistry.ts              # Collection and definitions of the 9 heroes
  │   ├── mugenKing.ts                 # MugenKING: Boundless Decree, Second Crown, Royal Silence
  │   ├── malevolentPriest.ts          # Malevolent Shrine Priest: Desecrated Ground, Ritual Toll, Ofuda Seal
  │   ├── drMethanogenic.ts            # Dr. Methanogenic: Methane Bloom, Anaerobic Adaptation, Spore Drift
  │   ├── captainEnglland.ts           # Captain Englland: Rally Standard, Vanguard Strike, Avenge
  │   ├── ajx.ts                       # AJX: Null Jump, Exploit, Low Profile
  │   ├── yjkstra.ts                   # Yjkstra: Shortest Path, Greedy Relaxation, Edge Weights
  │   ├── ironcladWarden.ts            # Ironclad Warden (Hero 7): Bulwark Plant, Unmoved, Reprisal
  │   ├── blackMonkey.ts               # BlackMonkey: Mirror Troupe, Treetop, Pilfer
  │   └── partKingKong.ts              # Part King Kong: Ground Slam, Thick Hide, Rampage
  ├── engine/
  │   ├── boardGeometry.ts             # 7x8 grid math, coordinates, raycasting, BFS pathfinding
  │   ├── moveGenerator.ts             # Move and attack calculation respecting statuses & passives
  │   ├── statusManager.ts             # Status effects (Silenced, Rooted, Slowed, Disarmed, Cursed)
  │   ├── zoneManager.ts               # Board objects (Gas, Shrine, Banner, Wall, Decoy)
  │   ├── turnManager.ts               # Turn phases, cooldown decrementing, round counting
  │   ├── priorityEngine.ts            # Simultaneous effect resolution (Immunities > Prevention > Movement Restrictions > Passives)
  │   └── heroDuelEngine.ts            # Master game state machine & action dispatcher
  ├── equipment/
  │   ├── equipmentData.ts             # 12 original equipment items with Power Points (1-3)
  │   ├── craftedSigils.ts             # 6 crafted active sigils replacing active slot (max 1 per team)
  │   └── budgetValidator.ts           # 5 Power Point limit enforcement and equipment pairing
  ├── ai/
  │   ├── easyBot.ts                   # Random legal move with 1-ply capture heuristic
  │   ├── normalBot.ts                 # 2-3 ply Minimax with Alpha-Beta pruning & positional eval
  │   ├── hardBot.ts                   # 4-ply depth with iterative deepening and ability sequencing
  │   ├── heroDuelAiWorker.ts          # Web Worker thread for zero UI jank
  │   └── balanceSimulator.ts          # Automated 1,000+ match self-play simulator
  ├── cards/
  │   ├── cardGrammar.ts               # Text generator with 25+ templates, 60+ entries per slot (100M+ combinations)
  │   ├── cardDictionary.ts            # 120+ Japanese words + Romaji readings + English definitions
  │   ├── proceduralBackgrounds.ts     # 30 Canvas procedural background scene renderers
  │   ├── cardRenderer.ts              # 750x1050 px Canvas 2D engine with 2x 1500x2100 PNG export
  │   └── cardStorage.ts               # IndexedDB collection storage with localStorage fallback & JSON import/export
  ├── art/
  │   ├── heroPieceSvgs.tsx            # Custom SVG vector art for all 9 heroes with team markers
  │   ├── heroEmblems.tsx              # Stylized emblems for board/card/draft
  │   └── statusIcons.tsx              # Status debuff badge indicators
  ├── ui/
  │   ├── HeroDuelHub.tsx              # Main entry view (Play vs AI, Pass & Play, Collection, How to Play)
  │   ├── HeroDraftScreen.tsx          # 4-hero selection, Captain assignment, Equipment armory, Random Balanced
  │   ├── HeroDuelBoard.tsx            # 7x8 interactive Cream & Crimson board with responsive aspect ratio
  │   ├── AbilityActionBar.tsx         # Bottom action bar for abilities, confirm dialogs, mobile sheet
  │   ├── HeroInfoModal.tsx            # Hero details, stats, movement diagram, weaknesses
  │   ├── MatchResultModal.tsx         # Victory/defeat summary, card reveal with 3D flip animation
  │   ├── HowToPlayModal.tsx           # Interactive movement & ability preview board
  │   └── CardGalleryModal.tsx         # Responsive grid, filters, 3D tilt viewer, PNG download, code search
  └── tests/
      ├── engine.test.ts               # Core movement, status, turn manager, priority engine tests
      ├── heroes.test.ts               # All 9 heroes active & passive behavior unit tests
      ├── equipment.test.ts            # Budget validation and item trade-off checks
      ├── cards.test.ts                # Deterministic card re-rendering, code collision checks (10k cards)
      └── balance.test.ts              # AI self-play validation test runner
```

---

## 2. State Machine of a Match

```
[MAIN MENU / HUB]
       │
       ▼
[DRAFT PHASE] (Player 1 & 2 pick 4 heroes, assign 1 Captain, allocate max 5 Power Points)
       │
       ▼
[PRE-MATCH PLACEMENT] (Arrange 4 heroes on ranks 1-2 / ranks 7-8; AI auto-arranges)
       │
       ▼
[MATCH LOOP: Turn N]
  ├── Status & Zone Upkeep (Apply start-of-turn zone triggers: gas, shrine, banner)
  ├── Action Selection (Choose ONE: Move Hero OR Cast Active Ability)
  │     ├── Target validation (Highlights valid paths/targets)
  │     └── Confirmation (Mobile 2-step confirm / Desktop instant click)
  ├── Action Resolution (Move/kill piece OR deploy zone/teleport/push)
  ├── Post-Action Passives (Second Crown, Thick Hide, Vanguard Strike, Avenge, Rampage)
  ├── Cooldown Tick (Cooldowns decrement at end of active player's turn)
  ├── Zone Expiry Check (Decoys, Walls, Gas, Banners countdown)
  └── Win Check (Captain dead? All heroes dead? Turn 60 limit reached?)
       ├── NO  ─► Switch Active Player ─► [NEXT TURN]
       └── YES ─► [MATCH RESULTS] ─► Card Reveal ─► Collection
```

---

## 3. Balance Simulator & Targets
- **Target Win Rate**: 45%–55% for every hero when present on a team.
- **Seat Advantage**: First-seat win rate constrained between 48% and 52% (compensated by Player 2 starting with CD 0 and Player 1 starting with CD 1).
- **Automated Runner**: `/src/hero-duel/ai/balanceSimulator.ts` runs 1,000 matches with randomized team compositions and logs results into `BALANCE_REPORT.md`.

---

## 4. Outside Registration Hooks Checklist
1. `src/components/AllGameModesModal.tsx`:
   - Add Hero Duel card in All Modes grid.
2. `src/components/Dashboard.tsx`:
   - Mobile drop-up drawer: Add 3-column square tile with `DropupThumb`.
   - Desktop navigation bar: Add `Hero Duel` nav item with Swords icon.
   - Main content area: Add Hero Duel card.
3. `src/App.tsx`:
   - State `isHeroDuelOpen` to conditionally render `<HeroDuelHub onBack={() => setIsHeroDuelOpen(false)} />`.
