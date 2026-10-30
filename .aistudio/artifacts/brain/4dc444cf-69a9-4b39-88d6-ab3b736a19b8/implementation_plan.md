# Implementation Plan - "Hero Duel" (7x8 Standalone Tactical Chess & Card Collection)

## Overview
"Hero Duel" is an independent, tournament-grade tactical game mode built on a 7x8 board featuring 9 unique heroes, no pawns, active abilities, passive traits, equipment customization, and a comprehensive card collection system granting collectible cards for every vanquished hero.

---

## 1. Core Architecture
- **Directory**: `/src/hero-duel/` containing all rules, engine, AI, equipment, UI, cards, art, and test suites.
- **Strict Isolation**: Zero modifications to existing game modes (Standard, Culling, Rose, 3D Chess, Hashira Training).
- **Minimal Outside Registration**: Additive hooks only in `AllGameModesModal.tsx`, `Dashboard.tsx` (mobile dropup + desktop nav), and `App.tsx` via a single shared registry (`heroDuelRegistry.ts`).

---

## 2. Key Components to Build

### A. Board & Engine (`/src/hero-duel/engine/`)
- **Board**: 7 columns (A–G) x 8 rows (1–8) using the Cream & Crimson board theme (`#F2EFE4` and `#BC1434`).
- **Turn Flow**: Single action per turn (Move or Cast Active Ability). Captures occur through movement only.
- **Priority Engine**: Deterministic resolution order: Immunities > Prevention > Movement restrictions > Triggered passives.
- **Status Effects**: Silenced, Rooted, Slowed, Disarmed, Cursed.
- **Board Objects / Zones**: Gas, Shrine, Banner, Wall, Decoy with turn countdowns.

### B. 9 Balanced Heroes (`/src/hero-duel/heroes/`)
1. **MugenKING ("The Sovereign")**: Boundless Decree (CD 4), Second Crown (revive once), Royal Silence (adjacent silence).
2. **Malevolent Shrine Priest ("Curse Controller")**: Desecrated Ground (CD 5), Ritual Toll (CD refund on ally kills), Ofuda Seal (immune to ranged slider captures).
3. **Dr. Methanogenic ("Alchemist of Gas")**: Methane Bloom (CD 4, disarms 3x3), Anaerobic Adaptation (hazard immunity), Spore Drift (slow trail).
4. **Captain Englland ("Field Commander")**: Rally Standard (CD 5, banner +1 range), Vanguard Strike (free step on capture), Avenge (retaliation step).
5. **AJX ("The Phase Assassin")**: Null Jump (CD 4, teleport), Exploit (CD refund vs on-CD targets), Low Profile (immune to non-adjacent actives).
6. **Yjkstra ("The Pathfinder")**: Shortest Path (CD 4, BFS ally movement up to 4 squares), Greedy Relaxation (free step), Edge Weights (adjacent slider stop).
7. **Ironclad Warden ("Wall Tank")**: Bulwark Plant (CD 5, impassable wall), Unmoved (immune to displacement), Reprisal (roots capturer of adjacent ally).
8. **BlackMonkey ("The Trickster")**: Mirror Troupe (CD 5, leaves decoy), Treetop (edge invulnerability to sliders), Pilfer (increases enemy CDs on capture).
9. **Part King Kong ("The Brute")**: Ground Slam (CD 5, 3x3 knockback/root), Thick Hide (absorbs first capture attempt), Rampage (chain capture adjacent foe).

### C. Equipment & Crafted Sigils (`/src/hero-duel/equipment/`)
- 12 original items with Power Points (1–3), strictly capped at 5 Power Points per team.
- 6 crafted sigils replacing active ability slot (max 1 per team).
- Integrated with existing `mugenStore.ts` for Mugen Gems and Crypto.

### D. AI Engine & Balance Simulator (`/src/hero-duel/ai/`)
- **Easy**: 1-ply capture heuristic.
- **Normal**: 2–3 ply Minimax with alpha-beta pruning.
- **Hard**: 4-ply depth with iterative deepening in Web Worker.
- **Balance Simulator**: Automated self-play simulator generating `BALANCE_REPORT.md` verifying 45%–55% win-rate band across all heroes.

### E. Card Collection System (`/src/hero-duel/cards/`)
- 750x1050 px Canvas 2D card renderer with 2x (1500x2100) PNG download export.
- 30 procedural canvas background scenes, 12 frames, 24 palettes, 16 textures, 10 holo foils.
- 120+ Japanese kanji words + Romaji readings.
- Grammatical text generator with 25+ sentence templates (100M+ combinations).
- Deterministic 3–5 character alphanumeric seed code.
- Responsive Card Gallery with 3D tilt effects, search, rarity filters, and IndexedDB storage with local fallback.

### F. User Interface (`/src/hero-duel/ui/`)
- `HeroDuelHub.tsx`: Mode launcher with Play vs AI, Local 2-Player Pass & Play, Collection Gallery, and How to Play.
- `HeroDraftScreen.tsx`: 4-hero drafting, Captain assignment, equipment loadout, Random Balanced button.
- `HeroDuelBoard.tsx`: Responsive 7x8 interactive board, touch-friendly, keyboard shortcuts (1–4, Q, Esc).
- `HowToPlayModal.tsx`: Interactive preview board allowing players to test movement and abilities.

---

## 3. Verification & QA Plan
- **TypeScript**: `tsc --noEmit` pass with zero type errors.
- **Unit Tests**: Full test suite in `/src/hero-duel/tests/` verifying all hero moves, passives, status effects, and card generation determinism.
- **Balance Verification**: Automated balance simulator run verifying hero win rates within 45%–55% and first-seat win rate within 48%–52%.
- **Responsive Inspection**: Tested for viewport scaling across mobile (320px–420px), tablet (768px), and desktop (1024px+).
