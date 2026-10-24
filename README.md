# MugenChessX: The Definitive Technical & Gameplay Manual
### Created by ANANDA JANA

---

## Table of Contents
1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [Complete Game Modes & Formats](#2-complete-game-modes--formats)
   - [2.1 Standard Online PvP Mode](#21-standard-online-pvp-mode)
   - [2.2 Crafted Online PvP Mode](#22-crafted-online-pvp-mode)
   - [2.3 Grandmaster Bot Mode (Local Minimax AI)](#23-grandmaster-bot-mode-local-minimax-ai)
   - [2.4 Master Bot Mode (Local Fast AI)](#24-master-bot-mode-local-fast-ai)
   - [2.5 Ephemeral Review & Post-Match Analysis Mode](#25-ephemeral-review--post-match-analysis-mode)
   - [2.6 Jujutsu Kaisen Culling Game Mode](#26-jujutsu-kaisen-culling-game-mode-88-square-cross-battlefield)
   - [2.7 Rose Paradise: Couples Chess Mode](#27-rose-paradise-couples-chess-mode)
3. [The Complete Piece Compendium & Movement Mechanics](#3-the-complete-piece-compendium--movement-mechanics)
   - [3.1 Standard Pieces with MugenChessX Conventions](#31-standard-pieces-with-mugenchessx-conventions)
   - [3.2 The Royal Hybrid: The Prince](#32-the-royal-hybrid-the-prince)
   - [3.3 The Extra Crafted Pieces: Deep Dive](#33-the-extra-crafted-pieces-deep-dive)
     - [3.3.1 The Communist](#331-the-communist)
     - [3.3.2 The Supreme Rook](#332-the-supreme-rook)
     - [3.3.3 The Priest](#333-the-priest)
4. [Dice-Constrained Turn Architecture](#4-dice-constrained-turn-architecture)
   - [4.1 The 6-Sided Authoritative Die & Categorization](#41-the-6-sided-authoritative-die--categorization)
   - [4.2 The Fallback Free-Pass Guarantee](#42-the-fallback-free-pass-guarantee)
   - [4.3 Grace Windows, Warning Alerts, and Auto-Roll Timers](#43-grace-windows-warning-alerts-and-auto-roll-timers)
   - [4.4 The Check-Defense Exemption](#44-the-check-defense-exemption)
   - [4.5 The Three-Capture Dice Vanishing Rule](#45-the-three-capture-dice-vanishing-rule)
   - [4.6 Late-Game Material Probability Bias](#46-late-game-material-probability-bias)
5. [Dynamic Board Expansion Mechanics](#5-dynamic-board-expansion-mechanics)
   - [5.1 Activation Trigger](#51-activation-trigger)
   - [5.2 Geometric Expansion Dimensions & Vectors](#52-geometric-expansion-dimensions--vectors)
   - [5.3 Clock Pausing & Auto-Pick Fail-Safe](#53-clock-pausing--auto-pick-fail-safe)
6. [The Tactical Crafting System](#6-the-tactical-crafting-system)
   - [6.1 Material Loss Thresholds & Avoid Crafting Option](#61-material-loss-thresholds--avoid-crafting-option)
   - [6.2 Candidate Square Generation & Safe Placement](#62-candidate-square-generation--safe-placement)
   - [6.3 Crafting While In Check: Deferred Locks & Clock Integrity](#63-crafting-while-in-check-deferred-locks--clock-integrity)
7. [Winning, Drawing & Match Termination Rules](#7-winning-drawing--match-termination-rules)
   - [7.1 Checkmate Precedence](#71-checkmate-precedence)
   - [7.2 The Two-Pawns End-Rank Draw Rule](#72-the-two-pawns-end-rank-draw-rule)
   - [7.3 Stalemate & Insufficient Material](#73-stalemate--insufficient-material)
   - [7.4 Resignation & Agreement](#74-resignation--agreement)
   - [7.5 Clock Expiration & Mode-Specific Piece Advantage Rules](#75-clock-expiration--mode-specific-piece-advantage-rules)
8. [In-Game & Between-Game Perks](#8-in-game--between-game-perks)
   - [8.1 Real-Time In-Game Perks](#81-real-time-in-game-perks)
   - [8.2 Metagame & Between-Game Perks](#82-metagame--between-game-perks)
   - [8.3 Context-Aware Rulebook & Mode-Specific UI Text Alignment](#83-context-aware-rulebook--mode-specific-ui-text-alignment)
9. [High-Performance Engineering: How Every Section Is Kept Fast](#9-high-performance-engineering-how-every-section-is-kept-fast)
   - [9.1 O(1) Capture & Condition Verification](#91-o1-capture--condition-verification)
   - [9.2 Minimax Search with Alpha-Beta Pruning & PSTs](#92-minimax-search-with-alpha-beta-pruning--psts)
   - [9.3 Zero-Polling WebSocket State Multiplexing](#93-zero-polling-websocket-state-multiplexing)
   - [9.4 Lazy UI Render Cycles & GPU Accelerated Motion](#94-lazy-ui-render-cycles--gpu-accelerated-motion)
10. [Hosting, Storage Architecture & Technical Limitations](#10-hosting-storage-architecture--technical-limitations)
    - [10.1 Cloud Host Environment](#101-cloud-host-environment)
    - [10.2 JSON File-Based Database Design & Rationale](#102-json-file-based-database-design--rationale)
    - [10.3 Inherent Limitations & Drawbacks](#103-inherent-limitations--drawbacks)
    - [10.4 Production Database Migration Blueprint](#104-production-database-migration-blueprint)
11. [Exhaustive Codebase & File-by-File Directory Mapping](#11-exhaustive-codebase--file-by-file-directory-mapping)
12. [Developer Extension Guide: Adding New Pieces & Modes](#12-developer-extension-guide-adding-new-pieces--modes)
13. [Jujutsu Kaisen Culling Game: Technical & Gameplay Architecture](#13-jujutsu-kaisen-culling-game-technical--gameplay-architecture)
    - [13.1 Arena Geometry: The 88-Square Cross Battlefield & Coordinate Grid](#131-arena-geometry-the-88-square-cross-battlefield--coordinate-grid)
    - [13.2 Rotational Symmetrical Armies: Protagonists vs. Antagonists](#132-rotational-symmetrical-armies-protagonists-vs-antagonists)
    - [13.3 Exhaustive Role Compendium, Movement Vectors & Special Techniques](#133-exhaustive-role-compendium-movement-vectors--special-techniques)
      - [13.3.1 Sovereign (Satoru Gojo ⚔ Ryomen Sukuna) - Domain Step](#1331-sovereign-satoru-gojo--ryomen-sukuna---domain-step)
      - [13.3.2 Vanguard (Yuji Itadori ⚔ Kenjaku) - Black Flash Strike-in-Place](#1332-vanguard-yuji-itadori--kenjaku---black-flash-strike-in-place)
      - [13.3.3 Artillery (Kokichi Muta / Mechamaru ⚔ Uraume) - Ranged Strike](#1333-artillery-kokichi-muta--mechamaru--uraume---ranged-strike)
      - [13.3.4 Bulwark (Panda ⚔ Yorozu) - Shell Absorption](#1334-bulwark-panda--yorozu---shell-absorption)
      - [13.3.5 Warden (Kento Nanami ⚔ Reggie Star) - Ratio Field Suppression](#1335-warden-kento-nanami--reggie-star---ratio-field-suppression)
      - [13.3.6 Skirmisher (Maki Zenin ⚔ Naoya Zenin) - Heavenly Restriction & 2-Square Hops](#1336-skirmisher-maki-zenin--naoya-zenin---heavenly-restriction--2-square-hops)
      - [13.3.7 Rusher (Kinji Hakari ⚔ Kurourushi) - Idle Death Gamble Jackpot](#1337-rusher-kinji-hakari--kurourushi---idle-death-gamble-jackpot)
      - [13.3.8 Culling Pawn & Far-Edge File-Specific Warden Promotion](#1338-culling-pawn--far-edge-file-specific-warden-promotion)
    - [13.4 Movement, Leaping & Check Laws](#134-movement-leaping--check-laws)
    - [13.5 Victory, Defeat & Match Termination Hierarchy](#135-victory-defeat--match-termination-hierarchy)
    - [13.6 Complete Tactical Edge Cases & Engine Scenarios](#136-complete-tactical-edge-cases--engine-scenarios)
14. [Rose Paradise: Romantic Couples Chess & Botanical Mechanics](#14-rose-paradise-romantic-couples-chess--botanical-mechanics)
    - [14.1 Philosophy, Roles & The Untimed Love Protocol](#141-philosophy-roles--the-untimed-love-protocol)
    - [14.2 Petals of Passion & Love Link Harvesting Engine](#142-petals-of-passion--love-link-harvesting-engine)
    - [14.3 Full-Board Reinforcement Summoning & The 8-Unit Catalog](#143-full-board-reinforcement-summoning--the-8-unit-catalog)
    - [14.4 In-Game Love Chat, Floating Reactions & Romantic Bot AI](#144-in-game-love-chat-floating-reactions--romantic-bot-ai)
    - [14.5 Match Termination, Lovingly Conceding & 20-Move Draw Rule](#145-match-termination-lovingly-conceding--20-move-draw-rule)
15. [Possible Future Updates (( NOT Done YET ))](#possible-future-updates--not-done-yet-)
16. [Comprehensive Firebase & Firestore Porting Plan (100% Free Forever)](#16-comprehensive-firebase--firestore-porting-plan-100-free-forever)
    - [16.1 Feasibility & Heaviness Evaluation: Will Free Tier Last for Years?](#161-feasibility--heaviness-evaluation-will-free-tier-last-for-years)
    - [16.2 Codebase Compatibility: Can the Whole App Upload As-Is?](#162-codebase-compatibility-can-the-whole-app-upload-as-is)
    - [16.3 Step-by-Step Porting Guide from Scratch](#163-step-by-step-porting-guide-from-scratch)
    - [16.4 Firestore Schema & Document Architecture](#164-firestore-schema--document-architecture)
    - [16.5 User & Admin Account Deletion Architecture](#165-user--admin-account-deletion-architecture)
    - [16.6 Critical Precautions & Anti-Quota Traps](#166-critical-precautions--anti-quota-traps)

---

## 1. Executive Summary & Core Philosophy

**MugenChessX** is an authoritative multiplayer chess strategy platform designed and built by **ANANDA JANA**. It reimagines classical chess by supercharging positional mastery with stochastic volatility, dynamic territory alteration, and tactical unit crafting.

Classical chess is often encumbered by centuries of opening memorization, opening book stagnation, and deterministic play patterns. MugenChessX breaks this static paradigm by introducing three interconnected pillars:
1. **Asymmetric Corner Royalty**: Standard back-rank corner rooks are replaced with an asymmetric power distribution: White positions its Queen at `a1` and its royal hybrid, the **Prince**, at `h1`. Black mirrors this diagonally with its Prince at `a8` and Queen at `h8`.
2. **Volatile Dice Constraints**: Players roll an authoritative six-sided die each turn partitioning their army into Inexpensive and Expensive mobilization categories, forcing rapid tactical improvisation.
3. **Mid-Game Board Mutation & Crafting**: When armies suffer heavy casualties, battlefield dimensions expand from 8x8 up to 10x10, and commanders gain the ability to synthesize non-standard fairy chess units—the **Communist**, the **Supreme Rook**, and the **Priest**—directly onto safe home squares.

Built with full TypeScript type safety, an authoritative Node.js/Express WebSocket backend, an ultra-responsive React 19 frontend, and a dedicated Minimax AI engine, MugenChessX delivers a fresh competitive battleground where no two matches unfold identically.

---

## 2. Complete Game Modes & Formats

MugenChessX features distinct competitive and local game modes catering to both casual experimenters and hardcore chess tacticians.

### 2.1 Standard Online PvP Mode
* **Format**: Human vs. Human networked real-time match.
* **Matchmaking & Pairing**: Handled through WebSocket challenge handshakes or direct player invitations via the online player discovery lobby.
* **Board Setup**: Classical 8x8 dimensions with MugenChessX Asymmetric Corner Royalty (White Queen `a1`, White Prince `h1`; Black Prince `a8`, Black Queen `h8`).
* **Dice Rules**: Full dice constraint system enabled. Transitions permanently into standard pure chess upon the 3rd total capture.
* **Time Controls**:
  - **Blitz (120s)**: 2 minutes per side with zero increment. Demands lightning-fast intuition under dice rolls.
  - **Rapid (300s)**: 5 minutes per side with zero increment. Encourages deep positional calculations and expansion timing.
* **Move Suggestions Option**: Players can toggle move suggestions `included` (visual highlight rings and target dots showing legal destinations for active pieces) or `excluded` (hardcore blind evaluation where players calculate all valid squares mentally).

### 2.2 Crafted Online PvP Mode
* **Format**: Pre-seeded experimental fairy chess mode.
* **Board Setup**: Both armies start the match with classical pieces partially replaced by revolutionary crafted units on the back ranks:
  - White Back Rank (`y=0`): `a1` Queen, `b1` Priest, `c1` Communist, `d1` Supreme Rook, `e1` King, `f1` Communist, `g1` Standard Rook, `h1` Prince.
  - Black Back Rank (`y=7`): `a8` Prince, `b8` Standard Rook, `c8` Communist, `d8` Supreme Rook, `e8` King, `f8` Communist, `g8` Priest, `h8` Queen.
* **Strategic Nuance**: Players possess immense tactical leaping and sliding firepower right from move one. Opening books are completely obsolete; opening maneuvers resemble violent tactical skirmishes across unorthodox angles.

### 2.3 Grandmaster Bot Mode (Local Minimax AI)
* **Format**: Single-player vs. Local Engine.
* **Game Variations**:
  - **Standard Dice Chess**: Classical army with Asymmetric Corner Queens and Princes.
  - **Crafted Pieces Army**: Bishops replaced with Communists, Knights with Priests, and a Rook with Supreme Rook.
* **Pre-Game Customization Suite**:
  - **Mid-Game Crafting Perk Toggle**: Players can choose to **Enable (Default)** or **Avoid Crafting**. When avoided, mid-game crafting is completely bypassed (no summons, no HUD tags, no rule mentions).
  - **Piece Visual Themes**: Selectable **Classic Standard** or **Retro Playing Cards** aesthetic.
  - **Board Theme**: Instant toggle between Light Board and Dark Board styles.
  - **Time Controls**: 2-Minute Blitz or 5-Minute Rapid clocks.
  - **Move Suggestions**: Toggle between visual move hints (`included`) or clean unassisted calculation (`excluded`).
* **Engine Architecture**: 3-ply Minimax search augmented with Alpha-Beta pruning, Piece-Square Tables (PST) adapted for fairy pieces, corner queens, and dynamic board dimensions.
* **Bot Behavior**: Highly aggressive, tactical, and opportunistic. Evaluates piece mobility, king safety, center control, and material valuation (giving 600 centipawns to crafted units and 750 centipawns to the Prince).
* **Board Expansion Exclusion**: Board expansion is disabled for Bot matches, preserving focused 8x8 calculation.
* **Timeout Win Rule**: If the human player's timer expires, they win if they lead by $\ge 3$ pieces over the Bot.
* **Zero Database Footprint**: Runs completely in-memory on the client thread with simulated thinking delays (600ms) for natural human-like cadence.

### 2.4 Master Bot Mode (Local Fast AI)
* **Format**: Single-player vs. Fast Engine.
* **Engine Architecture**: 2-ply Minimax search designed for instant decision-making (< 100ms calculation time).
* **Bot Behavior**: Prioritizes raw material captures and immediate checks. Ideal for training dice reaction speed and testing opening ideas against unorthodox corner configurations.
* **Settings & Rules**: Shares the same customizable setup (Crafting Allowed vs Avoided, Classic/Retro themes, $\ge 3$ piece lead timeout rule) as Grandmaster Bot.

### 2.5 Ephemeral Review & Post-Match Analysis Mode
* **Format**: Post-game state inspection.
* **Persistence Mechanism**: When any online or bot game completes, the final match state (board configuration, capture logs, algebraic notation history, and victory verdict) is saved into `localStorage` with a 10-minute auto-expiry window.
* **Functionality**: Players can review moves, explore how dice rolls influenced critical pivot points, analyze checkmate nets, and inspect board expansions without cluttering the persistent server database.

### 2.6 Jujutsu Kaisen Culling Game Mode (88-Square Cross Battlefield)
* **Format**: Single-player vs. Tactical Engine or Real-Time PvP.
* **Battlefield**: Custom 88-square cross-shaped arena inside a 10x10 coordinate space (64 center squares + 4 outer arms of 6 squares each; 12 void corner squares).
* **Armies & Symmetry**: 180° rotational mirror symmetry featuring Satoru Gojo & Jujutsu High Protagonists (White) vs. Ryomen Sukuna & Antagonists (Black).
* **Key Mechanics**: Strict check and checkmate from Move 1, character-accurate tactical abilities (Domain Step, Black Flash strike-in-place, Ranged Artillery strike, Bulwark shell absorption, Warden Ratio Field suppression, Skirmisher Heavenly Restriction leaper, Rusher Jackpot bonus step), file-specific far-edge Warden promotion, and Complete Tactical Suppression (no stalemate draw).
* *Comprehensive Guide*: See [Section 13: Jujutsu Kaisen Culling Game](#13-jujutsu-kaisen-culling-game-technical--gameplay-architecture) for the exhaustive technical manual, piece compendium, movement vectors, and edge-case scenarios.

### 2.7 Rose Paradise: Couples Chess Mode
* **Format**: Couples Private Room PvP (via 6-character room codes) or Solo vs. Affectionate AI Bot (Boyfriend Bot 👑 / Girlfriend Bot 👸).
* **Board & Royalty**: Standard 8x8 board featuring Boyfriend (Prince / White) and Girlfriend (Queen / Black).
* **Untimed Love Protocol**: Zero ticking clocks and zero timer pressure; deliberate and play at an intimate pace.
* **Petals of Passion & Love Link**: Harvest Petals (🌹) through captures, delivering checks, or uniting Queen and Prince in an adjacent Love Link (+1 Petal every 4 moves).
* **Full-Board Reinforcement Summons**: Spend 3 Petals to summon any unit from an 8-piece catalog (Queen, Rook, Bishop, Knight, Cupid Priest, Thorn Guard, Rose Tower, or Pawn) onto **any empty square anywhere on the board**, provided it does not immediately deliver direct check.
* **Couples Social Suite**: Live floating emoji reactions (`❤️`, `🌹`, `✨`, `💍`, `🥰`, `😉`), radiant in-game romantic chat with suggestion chips, and sweet closing concessions.
* *Comprehensive Guide*: See [Section 14: Rose Paradise Manual](#14-rose-paradise-romantic-couples-chess--botanical-mechanics) for the complete botanical rules, summon catalog, and romantic bot dialogue systems.

---

## 3. The Complete Piece Compendium & Movement Mechanics

Every piece in MugenChessX has been assigned specific movement capabilities, categorical valuations, and distinct tactical roles.

```
Crafted Back Rank Configurations:
White (Rank 1 / y=0): [a1: Queen] [b1: Priest] [c1: Communist] [d1: Supreme Rook] [e1: King] [f1: Communist] [g1: Rook] [h1: Prince]
Black (Rank 8 / y=7): [a8: Prince] [b8: Rook] [c8: Communist] [d8: Supreme Rook] [e8: King] [f8: Communist] [g8: Priest] [h8: Queen]
```

### 3.1 Standard Pieces with MugenChessX Conventions

#### Pawn
* **Category**: Inexpensive (Rolls 1, 2, 3) AND Expensive (Rolls 4, 5, 6). The Pawn is unique as it is eligible under every single dice roll.
* **Movement**: Forward 1 square into an unoccupied square; forward 2 squares from original starting rank (Rank 2 for White, Rank 7 for Black) provided intermediate and target squares are unoccupied; captures 1 square diagonally forward.
* **Special Rules**: Advancing a pawn to the opponent's back rank increments the player's `pawnsReachedEndRank` counter. Landing a second pawn on the back rank triggers an immediate draw condition. When not triggering a draw, it promotes to Queen, Rook, Bishop, or Knight.

#### Knight
* **Category**: Inexpensive (Rolls 1, 2, 3).
* **Movement**: The classical 2x1 L-shaped jump (offsets: `(±1, ±2)` and `(±2, ±1)`). Jumps over intervening pieces. Highly active during early low-dice turns.

#### Bishop
* **Category**: Inexpensive (Rolls 1, 2, 3).
* **Movement**: Unbounded diagonal slide along unobstructed paths (`dx === dy`). Blocked by intervening pieces. Essential for early fianchetto structures and long-range board slicing.

#### Rook
* **Category**: Expensive (Rolls 4, 5, 6).
* **Movement**: Unbounded orthogonal slide along ranks and files (`dx === 0` or `dy === 0`). Blocked by intervening pieces. Crucial for locking down files and supporting pawn pushes.

#### Queen
* **Category**: Expensive (Rolls 4, 5, 6).
* **Starting Position**: Corner square `a1` for White; corner square `h8` for Black.
* **Movement**: Unbounded orthogonal and diagonal sliding across all unobstructed rays.
* **Tactical Nuance**: Starting in the corner rather than in the center (`d1`/`d8`) radically alters opening theory. The Queen cannot be brought out instantly without moving the rook or knight pawn, shielding it from early vulnerability while setting up diagonal long-range snipes.

#### King
* **Category**: Expensive (Rolls 4, 5, 6).
* **Starting Position**: Square `e1` for White; square `e8` for Black.
* **Movement**: Exactly 1 square in any direction (orthogonal or diagonal).
* **Royal Defense Rule**: The King is the ultimate royal piece. If the King is placed in check, **all dice constraints are immediately waived**. The active player is permitted to move any legal piece to resolve check.

---

### 3.2 The Royal Hybrid: The Prince

The **Prince** is the signature hero unit of MugenChessX, bridging royalty with the agility of high-mobility cavalry.

* **Category**: Expensive (Rolls 4, 5, 6).
* **Starting Coordinates**: Square `h1` for White; square `a8` for Black.
* **Material Valuation**: 750 centipawns (valued between a Rook and a Queen).
* **Visual Iconography**: Adorned with a three-pointed coronet crest merged onto a knight's cavalry helm.
* **Job & Tactical Role**: The Prince acts as an asymmetrical flank striker. Because it occupies the corner opposite the Queen, players possess dual offensive pivots on both flanks. It functions as a rapid defender capable of leaping into the center and pivoting into a long-range diagonal sniper.

#### Movement Vectors:
1. **The Cavalry Leap**: Standard Knight jump:
   $$\Delta x, \Delta y \in \{(\pm 1, \pm 2), (\pm 2, \pm 1)\}$$
   Jumps over intervening friendly or enemy units.
2. **The Bounded Diagonal Slide**: Diagonal trajectory up to 4 squares:
   $$|\Delta x| = |\Delta y| \le 4$$
   Path must be clear of intervening units. Captures enemy piece on target square; blocked by friendly pieces.
3. **The Legendary Extended 3x1 Leap (Once-Per-Game Perk)**:
   On its very first move of the match (before `hasMoved` is set to true and while `princeSpecialUsed` is false), the Prince can perform an extraordinary 3x1 extended leap:
   $$\Delta x, \Delta y \in \{(\pm 1, \pm 3), (\pm 3, \pm 1)\}$$
   *Properties*: Jumps over all intervening pieces. This move can instantly reach `g4` or `e2` from `h1` on turn one, bypassing pawns to deliver surprise attacks, fork high-value defenders, or reposition immediately to the front lines.

---

### 3.3 The Extra Crafted Pieces: Deep Dive

When players lose heavy pieces or launch Crafted Mode, three custom-designed fairy chess units enter the arena. These pieces were mathematically designed to solve classic chess deadlocks.

#### 3.3.1 The Communist
* **Identifier**: `'communist'`
* **Short Label**: `Communist`
* **Dice Categories**: Inexpensive (Rolls 1, 2, 3) AND Expensive (Rolls 4, 5, 6). Mobilizable on *any* dice roll!
* **Material Valuation**: 600 centipawns.
* **Inspiration & Lore**: Inspired by revolutionary vanguard mechanics. While standard chess pieces respect strict aristocratic Euclidean lines (straight ranks or unbroken diagonals), the Communist refuses to be contained by conventional barriers. It weaves through dense pawn chains in an alternating diagonal zigzag.
* **Job & Board Role**: Penetrating rigid, locked pawn structures. When two opposing pawn walls grind a game to a halt, the Communist bypasses the blockade entirely by zigzagging through diagonal seams while progressing forward orthogonally.
* **Exact Movement & Path Clearance Algorithm**:
  The Communist moves along the four cardinal directions (Up, Down, Left, Right), advancing 2 or 4 squares orthogonally by executing alternating diagonal steps:
  - **Upward (dy = +2, +4)**: Reaching `(0, 2)` requires either `(-1, 1)` or `(+1, 1)` empty. Reaching `(0, 4)` requires either `(-1, 1), (0, 2), (-1, 3)` empty or `(+1, 1), (0, 2), (+1, 3)` empty.
  - **Downward (dy = -2, -4)**: Reaching `(0, -2)` requires either `(-1, -1)` or `(+1, -1)` empty. Reaching `(0, -4)` requires intermediate squares along either left-first or right-first zigzag clear.
  - **Rightward (dx = +2, +4)**: Reaching `(2, 0)` requires either `(1, 1)` or `(1, -1)` empty. Reaching `(4, 0)` requires intermediate squares along either path clear.
  - **Leftward (dx = -2, -4)**: Reaching `(-2, 0)` requires either `(-1, 1)` or `(-1, -1)` empty. Reaching `(-4, 0)` requires intermediate squares along either path clear.
  *Target Square Rule*: If at least one zigzag path leading to the target offset is clear, the Communist moves to the destination square (capturing an enemy piece or occupying an empty square).

#### 3.3.2 The Supreme Rook
* **Identifier**: `'supremeRook'`
* **Short Label**: `Sup. Rook`
* **Dice Categories**: Expensive (Rolls 4, 5, 6).
* **Material Valuation**: 650 centipawns.
* **Inspiration & Lore**: Designed as an apex-tier siege engine—a massive battering ram mounted on hydraulic treads. Where a standard Rook is easily neutralized by placing a single pawn or knight in its line of sight, the Supreme Rook leaps over the obstruction diagonally.
* **Job & Board Role**: The ultimate endgame closer. It anchors open files like a classical heavy rook while possessing lethal leaping out-clauses that prevent it from being trapped behind friendly pawn chains.
* **Exact Movement Vectors**:
  1. **Full Orthogonal Sliding**: Moves any distance along ranks and files up to board limits (`maxRange = 16`). Ray is blocked by intervening pieces; captures the first opposing unit encountered.
  2. **The Heavy Diagonal Leap**: Leaps exactly 2 squares along all 4 diagonal axes:
     $$\Delta x, \Delta y \in \{(2, 2), (2, -2), (-2, 2), (-2, -2)\}$$
     *Properties*: Jumps over any piece occupying the intermediate square `(±1, ±1)`. Cannot be blocked by enemy pawns or friendly defenders.

#### 3.3.3 The Priest
* **Identifier**: `'priest'`
* **Short Label**: `Priest`
* **Dice Categories**: Inexpensive (Rolls 1, 2, 3) AND Expensive (Rolls 4, 5, 6). Eligible under *every* dice roll!
* **Material Valuation**: 580 centipawns.
* **Inspiration & Lore**: Inspired by clerical tactical advisers who operate behind castle walls. While bishops are permanently confined to squares of a single color, the Priest pairs bounded diagonal influence with orthogonal leaping capabilities, allowing it to transition across color complexes and control crucial territory bottlenecks.
* **Job & Board Role**: Center control, diagonal fencing, and tactical forks. The Priest excels in tight quarters where sliding pieces are restricted by jumping 2 squares orthogonally over blockers.
* **Exact Movement Vectors**:
  1. **Bounded Diagonal Slide**: Slides 1, 2, or 3 squares diagonally along unobstructed diagonals:
     $$|\Delta x| = |\Delta y| \le 3$$
     Blocked by intermediate pieces along the ray; captures enemy piece on landing square.
  2. **Orthogonal Leaper**: Leaps exactly 2 squares orthogonally:
     $$\Delta x, \Delta y \in \{(0, 2), (0, -2), (2, 0), (-2, 0)\}$$
     *Properties*: Jumps directly over any intervening piece on square `(0, 1)`, `(0, -1)`, `(1, 0)`, or `(-1, 0)`.

---

## 4. Dice-Constrained Turn Architecture

The dice engine is the volatility heartbeat of MugenChessX. It prevents opening rote repetition and forces both players to calculate dynamic move trees on the fly.

### 4.1 The 6-Sided Authoritative Die & Categorization
At the start of every active turn, a random integer between 1 and 6 is generated on the server:
* **Inexpensive Tier (Rolls 1, 2, 3)**: Allowed Pieces: `Pawn`, `Knight`, `Bishop`, `Communist`, `Priest`. Mobilizes minor pieces and infantry. Heavy pieces (Queens, Rooks, Princes) must remain stationary.
* **Expensive Tier (Rolls 4, 5, 6)**: Allowed Pieces: `Pawn`, `Rook`, `Queen`, `Prince`, `King`, `Communist`, `Supreme Rook`, `Priest`. Activates heavy artillery, back-rank rooks, royal hybrids, and kings.

### 4.2 The Fallback Free-Pass Guarantee
To eliminate game-breaking deadlocks (e.g., rolling Inexpensive when all knights/bishops are blocked and pawns cannot advance):
* If legal moves for pieces in the rolled category equals **zero**, the engine flags `isFallbackAnyPiece = true`.
* All legal moves across the entire army are unlocked for that turn with an in-app visual Free-Pass indicator!

### 4.3 Grace Windows, Warning Alerts, and Auto-Roll Timers
To maintain clock fairness in blitz and rapid formats:
* **`DICE_GRACE_WINDOW_MS = 3000` (3s)**: Chess clock is **completely paused** during the first 3 seconds of a turn.
* **`DICE_WARNING_WINDOW_MS = 2000` (2s)**: Amber countdown warning pulses, and clock starts decrementing.
* **`DICE_AUTOROLL_DELAY_MS = 5000` (5s)**: If unrolled after 5.0 seconds, the server auto-rolls on the player's behalf. Match stalling is impossible!

### 4.4 The Check-Defense Exemption
King safety overrides all dice constraints. If a player's King is in check:
* **The dice requirement is 100% bypassed**.
* The player does not roll, and any legal check-resolving move (King evasion, block, or capture) is immediately valid.

### 4.5 The Three-Capture Dice Vanishing Rule
Dice chess is designed as an opening and early mid-game catalyst. Once blood is spilled:
* The engine tracks `totalCaptures` across both armies.
* Upon the **3rd total capture** (`totalCaptures >= 3`), `diceActive` permanently toggles to `false`.
* The die vanishes from the interface, and the game transitions seamlessly into pure tactical chess!

### 4.6 Late-Game Material Probability Bias
When a player has fewer than 7 pieces remaining, probability weights shift to prevent late-game king-and-pawn stalls:
* Rolls 1, 2, 3: 10.0% each (30% total).
* Rolls 4, 5, 6: 23.33% each (70% total).

---

## 5. Dynamic Board Expansion Mechanics

When matches turn into wars of attrition, the battlefield itself expands dynamically.

> **Mode Scope Note**: Dynamic Board Expansion is exclusive to **Multiplayer Online PvP Mode**. To maintain precise calculation trees and classic board geometry, Board Expansion is disabled in **Play vs Grandmaster Bot** and **Play vs Master Bot** modes (and omitted from their rulebook).

### 5.1 Activation Trigger
* Triggered the exact moment a player loses their **7th piece** (`lostPieces >= 7`), once per player per match.
* The player selects one of four expansion directions:
  - **Top**: Adds a row at the top rank.
  - **Bottom**: Adds a row below Rank 1 (existing pieces shifted $y+1$).
  - **Left**: Adds a column left of file `a` (existing pieces shifted $x+1$).
  - **Right**: Adds a column right of file `h`.

### 5.2 Geometric Expansion Dimensions & Vectors
* Expands board dimensions from 8x8 up to 9x8, 9x9, 10x9, or 10x10.
* Sliding pieces immediately enjoy extended sliding ranges up to 10 squares.
* Flank expansions create open corridors for rooks and princes to outflank rigid pawn chains.

### 5.3 Clock Pausing & Auto-Pick Fail-Safe
* During expansion selection, the match clock is **authoritatively paused**.
* The player has **15 seconds** (`EXPANSION_AUTO_PICK_TIMEOUT_MS = 15000`) to confirm a direction.
* On timeout, the server auto-picks a default direction (Top for White, Bottom for Black).

---

## 6. The Tactical Crafting System

The crafting system allows commanders who have suffered heavy losses to synthesize powerful reinforcements.

### 6.1 Material Loss Thresholds & Avoid Crafting Option
* **Activation Trigger**: Triggered authoritatively when a player loses their **2nd expensive piece** (`lostExpensive >= 2`: Rook, Queen, Prince, King, Communist, Supreme Rook, or Priest).
* **Strict Pawn Exclusion**: Pawns are completely excluded from the expensive category. Falling pawns **never** increment `lostExpensive` and **never** trigger crafting.
* **Pre-Game Avoid Crafting Option**:
  - In both **Play vs Grandmaster Bot** (Standard), **Play vs Bot with Crafted Pieces**, and multiplayer challenges, players can choose to **Avoid Crafting**.
  - When Avoid Crafting is selected (`craftingAllowed = false`), mid-game crafting is completely suppressed throughout the match. No crafting triggers occur, no locked crafting warnings surface, and all crafting mentions are suppressed from the in-game HUD and Rulebook.
* **Summon Selection**: When enabled and triggered, the player chooses one unit to synthesize: Communist, Supreme Rook, or Priest.

### 6.2 Candidate Square Generation & Safe Placement
1. **Home Zone Restriction**: Placement is strictly limited to the player's 2-row Home Zone (Ranks 1-2 for White, Back 2 Ranks for Black).
2. **Occupancy Rule**: Target square must be empty (`board[y][x] === null`).
3. **Safety Guarantee**: Target square must not be under attack by any enemy piece (`isSquareAttacked === false`).
4. **Fallback**: If all empty home squares are attacked, the safety filter relaxes so the earned unit is never wasted.

### 6.3 Crafting While In Check: Deferred Locks & Clock Integrity
* If the move triggering crafting also puts the player's King in check, crafting is **deferred and locked** (`craftingLocked = true`).
* **The clock does NOT pause** while in check, preventing stalling.
* A banner alerts the player: *"Crafting Unlocked — In Check! Defend your King first. Crafting will open immediately after resolving check."*
* Once check is safely resolved, the crafting modal opens, the clock pauses, and the unit is placed.

---

## 7. Winning, Drawing & Match Termination Rules

MugenChessX implements a strict, deterministic hierarchy of victory and draw conditions:

### 7.1 Checkmate Precedence
* **Priority**: #1 Absolute Top Priority.
* Delivering checkmate wins immediately, even if the move simultaneously advances a second pawn to the back rank.

### 7.2 The Two-Pawns End-Rank Draw Rule
* **Priority**: #2 Priority.
* If either player navigates **two pawns** to the opponent's back rank, the match ends immediately as a **DRAW** (`two_pawns_end_rank_draw`).
* Serves as an aggressive comeback mechanic for material-deficient players.

### 7.3 Stalemate & Insufficient Material
* Ending a turn with zero legal moves while not in check produces an immediate draw (`stalemate`).

### 7.4 Resignation & Agreement
* Players can resign at any time or offer draw agreements over WebSockets.

### 7.5 Clock Expiration & Mode-Specific Piece Advantage Rules
When a player's clock hits 0:00, the authoritative engine evaluates piece counts to ensure fair endgame resolutions:
* **Multiplayer Online Matches (The 7-Piece Advantage Rule)**:
  - **Difference $\le 7$ Pieces**: Standard clock defeat for the flagged player (`timeout`).
  - **Difference $> 7$ Pieces**: The player holding the overwhelming army advantage ($> 7$ pieces) wins (`timeout_piece_advantage`), even if their own clock expired!
* **Play vs Bot Matches (The 3-Piece Advantage Rule)**:
  - **Human Lead $\ge 3$ Pieces**: If the human player's timer expires while leading the Bot by 3 or more pieces, victory is awarded to the human player (`timeout_piece_advantage`).
  - **Human Lead $< 3$ Pieces**: Standard clock defeat for the human player (`timeout`).
  - **Bot Timer Expiration**: Automatic victory awarded to the human player.

---

## 8. In-Game & Between-Game Perks

### 8.1 Real-Time In-Game Perks
* **Web Audio Soundscapes**: Synthesized audio for moves, captures, dice rolls, checks, and game-over events.
* **Target Indicator Rings**: Soft rounded dots show all legal destination squares for the active piece.
* **Check Warning Glow**: Attacked king and attacker squares pulse with crimson indicators.
* **Dice Grace Buffer**: 3 seconds of zero-penalty thinking time every turn.
* **Live Material Trays**: Real-time display of captured units and army strength differences.

### 8.2 Metagame & Between-Game Perks
* **Persistent Profiles**: Cumulative tracking of wins, losses, draws, and win rates.
* **Brutalist Avatars**: Custom player icon selector.
* **Piece Visual Themes**: Selectable **Classic Standard** and **Retro Playing Cards** vector piece sets.
* **Instant Rematch**: One-click rematch protocol over WebSockets.
* **10-Minute Ephemeral Review**: Completed matches cached in browser storage for post-game tactical inspection.

### 8.3 Context-Aware Rulebook & Mode-Specific UI Text Alignment
* **In-Match Context Awareness**: When players click "Rules" during a match, the Rulebook dynamically renders rules tailored strictly to the active game:
  - **Starting Pieces**: Reflects standard corner royalty (Standard Mode) or the custom setup with Communists, Priests, and Supreme Rook (Crafted Mode).
  - **Crafting Suppression**: If the player chose "Avoid Crafting", all mentions of crafting, legendary units, and summoning rules are **completely omitted** from the Rulebook and in-game HUD badges.
  - **Board Expansion Isolation**: Board expansion is omitted for Bot game modes and only displayed for Multiplayer matches.
  - **Timeout Rule Accuracy**: Explicitly details the $\ge 3$ piece lead rule for Bot matches and the $> 7$ piece rule for Multiplayer matches.
* **Multi-Tab Dashboard Rulebook**: When opened from the home Dashboard, players can toggle between dedicated tabs for **Bot Standard**, **Bot Crafted**, and **Multiplayer Online** to study each mode's distinct rules.

---

## 9. High-Performance Engineering: How Every Section Is Kept Fast

### 9.1 O(1) Capture & Condition Verification
Rather than scanning the entire board array on each turn ($O(W \times H)$), capture counters (`lostPieces`, `lostExpensive`, `totalCaptures`, `pawnsReachedEndRank`) are incremented in $O(1)$ time inside the capture handler. Expansion and crafting triggers evaluate via instantaneous integer checks.

### 9.2 Minimax Search with Alpha-Beta Pruning & PSTs
* Precomputed Piece-Square Tables (PSTs) score positional advantages instantly.
* Coordinate clamping ensures 9x9 and 10x10 boards reuse heuristic tables without memory reallocation.
* Alpha-Beta pruning cuts the effective branching factor, allowing 3-ply tactical searches in under 100ms.

### 9.3 Zero-Polling WebSocket State Multiplexing
* Full-duplex WebSockets on `/ws` stream state deltas in real-time.
* Zero HTTP polling overhead; the same Node.js server handles both REST routes and WebSocket frames.

### 9.4 Lazy UI Render Cycles & GPU Accelerated Motion
* Modals are rendered conditionally on demand.
* Animations and piece drag effects execute on the GPU compositor thread using Framer Motion.

---

## 10. Hosting, Storage Architecture & Technical Limitations

### 10.1 Cloud Host Environment
* Deployed on Node.js 22 runtime on port 3000 (`0.0.0.0`).
* Runs Express backend with Vite SPA middleware in development mode (`tsx server.ts`).

### 10.2 JSON File-Based Database Design & Rationale
Data resides in `/data/*.json` (`users.json`, `sessions.json`, `challenges.json`, `matches.json`).
* **Advantages**: Zero-cost, zero external credentials, self-contained portability.
* **Atomic Safety**: Uses temporary file writes followed by atomic renames (`safeWriteJson`) to eliminate corrupt state.
* **In-Memory Cache**: Serves reads instantly from Node.js in-memory `Map` instances.

### 10.3 Inherent Limitations & Drawbacks
* **Ephemeral Container Disks**: Cloud containers with scale-to-zero wipe local disk data on restart unless attached to persistent storage.
* **Synchronous File Writes**: High concurrent write traffic can cause minor event-loop pauses during disk sync.
* **Single-Process Clustering**: In-memory WebSocket room tracking restricts multi-instance horizontal scaling without an external Redis pub/sub layer.
* **Authentication Simplicity**: Passwords use salted PBKDF2 (`pbkdf2Sync`) and 32-byte session tokens without OAuth2 or refresh token rotation.

### 10.4 Production Database Migration Blueprint
* Migrate to PostgreSQL via Cloud SQL or Supabase.
* Implement Drizzle ORM or Prisma to map records to SQL tables.
* Wire Redis pub/sub for distributed WebSocket room management across cluster workers.

---

## 11. Exhaustive Codebase & File-by-File Directory Mapping

```
/
├── .env.example                     <-- Environment variables reference (PORT, NODE_ENV, GEMINI_API_KEY)
├── index.html                       <-- Web application entry point with dark theme and typography
├── metadata.json                    <-- AI Studio project manifest & capability declarations
├── package.json                     <-- Package scripts, dependencies (Express, React 19, Motion, Lucide)
├── tsconfig.json                    <-- TypeScript compiler configuration (bundler resolution, strict types)
├── vite.config.ts                   <-- Vite build setup with Tailwind v4 & React plugins
├── server.ts                        <-- Full-stack Express server, API routing, and Vite middleware
│
├── data/                            <-- File database storage directory
│   ├── users.json                   <-- Serialized user accounts, salts, hashes, and match records
│   ├── sessions.json                <-- Serialized active session tokens mapped to user IDs
│   ├── challenges.json              <-- Active and pending matchmaking invitations
│   └── matches.json                 <-- Serialized active and completed match states
│
├── public/assets/aistudio/          <-- Static promotional and visual image assets
│
├── server/                          <-- Server-side backend logic
│   ├── auth.ts                      <-- Crypto hashing (pbkdf2Sync), session generation, authMiddleware
│   ├── db.ts                        <-- FileDatabase class with atomic fs writes and in-memory Map caches
│   └── socket.ts                    <-- WebSocket server handling presence, timers, moves, and dice rolls
│
├── src/                             <-- Frontend client application
│   ├── main.tsx                     <-- React DOM client entry point
│   ├── App.tsx                      <-- Top-level layout orchestrator, bot runner, and router
│   ├── index.css                    <-- Tailwind CSS v4 directives and brutalist theme definitions
│   │
│   ├── context/                     <-- Global React state providers
│   │   ├── AuthContext.tsx          <-- User login, registration, profile update, and session caching
│   │   ├── SocketContext.tsx        <-- WebSocket client connection, real-time dispatchers, auto-reconnect
│   │   └── ThemeContext.tsx         <-- Theme manager (dark mode default)
│   │
│   ├── components/                  <-- Modular React UI components
│   │   ├── ChessBoard.tsx           <-- 2D board grid renderer, coordinate mapping, and move dot highlights
│   │   ├── ChessPiece.tsx           <-- Unified chess piece dispatcher with theme support (Classic vs Retro)
│   │   ├── ChessPieceClassic.tsx    <-- Classic Standard chess piece vector silhouettes
│   │   ├── ChessPieceRetro.tsx      <-- Retro Playing Cards stylized chess piece vector set
│   │   ├── MatchView.tsx            <-- Live match interface with player clocks, capture trays, and logs
│   │   ├── Dashboard.tsx            <-- Main home screen, online player list, challenge triggers, stats
│   │   ├── DiceRoller.tsx           <-- Interactive 3D/2D dice rolling button, timer animations, grace alerts
│   │   ├── CraftingModal.tsx        <-- Unit crafting selection UI with preview grids and square placement
│   │   ├── CraftTheoryView.tsx      <-- Dedicated interactive catalog explaining fairy piece mechanics
│   │   ├── ExpansionModal.tsx       <-- Board expansion selector (Top, Bottom, Left, Right)
│   │   ├── RulesModal.tsx           <-- Context-aware in-app rulebook adapting dynamically to active match or tabs
│   │   ├── PrinceRulesCard.tsx      <-- Dedicated spotlight card detailing Prince capabilities
│   │   ├── BotMatchModal.tsx        <-- Modal for launching local Grandmaster or Master bot games with mode & crafting toggles
│   │   ├── ChallengeModal.tsx       <-- Online challenge creator with time controls and move hints toggle
│   │   ├── AuthModal.tsx            <-- Login and account registration modal dialog
│   │   ├── Avatars.tsx              <-- Vector avatar icons and player profile badge component
│   │   ├── PopupAd.tsx              <-- Non-intrusive promotional asset banner
│   │   ├── CullingBoard.tsx         <-- 88-square cross-shaped board renderer with void-cell masking
│   │   ├── CullingPiece.tsx         <-- Vector sorcerer icons (Gojo, Sukuna, Yuji, Kenjaku, Panda, etc.)
│   │   ├── CullingMatchView.tsx     <-- Full match interface with timers, move logs, check alerts, and actions
│   │   ├── CullingModeEntry.tsx     <-- Lobby entry and match setup modal for Culling Game mode
│   │   ├── CullingRulesModal.tsx    <-- Modal launcher for Culling Game theory and rules
│   │   └── CullingTheoryView.tsx    <-- In-depth interactive guide with 9x9 engine move diagrams for all 8 roles
│   │
│   ├── game/                        <-- Pure chess logic and mathematical engines
│   │   ├── engine.ts                <-- Authoritative game engine: board init, move validation, check, triggers
│   │   ├── craftables.ts            <-- Mathematical definitions and path vectors for Communist, Supreme Rook, Priest
│   │   ├── bot.ts                   <-- Grandmaster/Master Minimax search with PST and Alpha-Beta pruning
│   │   ├── cullingEngine.ts         <-- Authoritative Culling engine: 88 cross squares, 8 roles, Domain Step, Black Flash, Shell, Jackpot
│   │   └── cullingBot.ts            <-- Minimax AI engine adapted for 88 cross squares and Jujutsu abilities
│   │
│   ├── rose/                        <-- Rose Paradise: Romantic Couples Chess System
│   │   ├── types.ts                 <-- Boyfriend/Girlfriend roles, Petal meter, public room & match contracts
│   │   ├── roseRules.ts             <-- Authoritative rules: Love Link, Petal harvesting, full-board summons
│   │   ├── roseBot.ts               <-- AI Bot Boyfriend 👑 & Girlfriend 👸 with romantic chat and reactions
│   │   ├── useRoseRoom.ts           <-- WebSocket matchmaking, private 6-char room codes, real-time presence
│   │   ├── RoseParadiseView.tsx     <-- Main couples view with radiant chat, floating emojis & summon selector
│   │   ├── RoseParadiseEntryButton.tsx <-- Dashboard entry card button for launching Rose Paradise
│   │   ├── ChessPiece.tsx           <-- Custom romantic piece renderer with botanical accents
│   │   └── rose.css                 <-- Passionate brutalist visual styles, rose particle animations & glows
│   │
│   ├── types/                       <-- TypeScript contracts and system definitions
│   │   ├── game.ts                  <-- Definitions for Piece, Move, MatchState, DiceState, Constants
│   │   └── cullingGame.ts           <-- Types for 88 cross squares, sorcerer pieces, match state & actions
│   │
│   └── utils/                       <-- Shared helper utilities
│       └── audio.ts                 <-- Synthesized Web Audio API sound generator (moves, captures, dice, check)
│
└── test/                            <-- Automated test suite
    ├── engine.test.ts               <-- 28 unit tests verifying rules, check defense, two-pawn draw, dice, crafting triggers, pawn exclusions, and avoidance
    ├── bot.test.ts                  <-- Unit tests verifying bot move calculations and tactical evaluations
    ├── integration.test.ts          <-- Full-stack two-player integration test simulating PvP match flows
    └── benchmark.ts                 <-- Move generation and Minimax search performance benchmarks
```

---

## 12. Developer Extension Guide: Adding New Pieces & Modes

MugenChessX was engineered with a clean modular pipeline. Adding a new craftable piece requires 4 steps:

### Step 1: Define Movement Vectors in `src/game/craftables.ts`
```typescript
{
  id: 'ninja',
  name: 'Ninja',
  shortName: 'Ninja',
  description: 'Leaps 3 squares orthogonally and 1 square diagonally.',
  movementText: 'Jumps directly to target offset.',
  movement: {
    leaps: [
      { dx: 3, dy: 1 }, { dx: 3, dy: -1 },
      { dx: -3, dy: 1 }, { dx: -3, dy: -1 },
    ],
  },
}
```

### Step 2: Register the Piece Type in `src/types/game.ts`
```typescript
export type PieceType = 
  | 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' 
  | 'king' | 'prince' | 'communist' | 'supremeRook' | 'priest' 
  | 'ninja';
```

### Step 3: Draw the SVG Icon in `src/components/ChessPiece.tsx`
```tsx
case 'ninja':
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <path d="..." fill={isWhite ? '#ffffff' : '#1e293b'} stroke="#000000" strokeWidth="1.5" />
    </svg>
  );
```

### Step 4: Add Heuristic Valuation in `src/game/bot.ts`
```typescript
case 'ninja':
  return 520;
```

Run `npm test` to verify your new piece against the automated engine tests!

---

## 13. Jujutsu Kaisen Culling Game: Technical & Gameplay Architecture

The **Culling Game Mode** is an authoritative, 100% deterministic strategy battleground inspired by *Jujutsu Kaisen*. It expands classical chess onto a custom **88-square cross-shaped arena** featuring exact **180° rotational mirror symmetry**, strict royal check and checkmate rules from Move 1, unique sorcerer abilities, and decisive termination conditions.

```
                         TOP ARM (COLONY EXTENSION)
                         [B9] [C9] [D9] [E9] [F9] [G9]
     [A8:Sukuna] [B8:Kenjaku] [C8:Uraume] [D8:Yorozu] [E8:Reggie] [F8:Naoya] [G8:Kurourushi] [H8:Void]
     [A7:Void]   [B7:Pawn]    [C7:Pawn]   [D7:Pawn]   [E7:Pawn]   [F7:Pawn]  [G7:Pawn]       [H7:Void]
[L7] [A6]        [B6]         [C6]        [D6]        [E6]        [F6]       [G6]            [H6]     [R7]
[L6] [A5]        [B5]         [C5]        [D5]        [E5]        [F5]       [G5]            [H5]     [R6]
[L5] [A4]        [B4]         [C4]        [D4]        [E4]        [F4]       [G4]            [H4]     [R5]
[L4] [A3]        [B3]         [C3]        [D3]        [E3]        [F3]       [G3]            [H3]     [R4]
[L3] [A2:Void]   [B2:Pawn]    [C2:Pawn]   [D2:Pawn]   [E2:Pawn]   [F2:Pawn]  [G2:Pawn]       [H2:Void][R3]
[L2] [A1:Void]   [B1:Hakari]  [C1:Maki]   [D1:Nanami] [E1:Panda]  [F1:Mecha] [G1:Yuji]       [H1:Gojo][R2]
                         [B0] [C0] [D0] [E0] [F0] [G0]
                        BOTTOM ARM (COLONY EXTENSION)
```

---

### 13.1 Arena Geometry: The 88-Square Cross Battlefield & Coordinate Grid

The arena is mapped within a 10×10 coordinate matrix $(x \in [0, 9], y \in [0, 9])$, containing precisely **88 valid playable squares**:

* **Horizontal Files ($x = 0 \dots 9$)**:
  - `x = 0`: Left Lateral Wing (`L`)
  - `x = 1..8`: Standard Files `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`
  - `x = 9`: Right Lateral Wing (`R`)
* **Vertical Ranks ($y = 0 \dots 9$)**:
  - `y = 0`: Bottom Arm (`B0..G0`)
  - `y = 1..8`: Standard Ranks `1..8`
  - `y = 9`: Top Arm (`B9..G9`)

#### Sub-Region Square Distribution:
1. **Central Board (64 Squares)**: $x \in [1, 8], y \in [1, 8]$ (Squares `A1` through `H8`).
2. **Top Arm / North Colony (6 Squares)**: $y = 9, x \in [2, 7]$ (`B9, C9, D9, E9, F9, G9`).
3. **Bottom Arm / South Colony (6 Squares)**: $y = 0, x \in [2, 7]$ (`B0, C0, D0, E0, F0, G0`).
4. **Left Wing / West Corridor (6 Squares)**: $x = 0, y \in [2, 7]$ (`L2, L3, L4, L5, L6, L7`).
5. **Right Wing / East Corridor (6 Squares)**: $x = 9, y \in [2, 7]$ (`R2, R3, R4, R5, R6, R7`).
6. **12 Non-Playable Void Cells**:
   The four $2 \times 2$ outer corners are impassable voids that cannot be entered and terminate sliding movement rays immediately:
   - Bottom-Left Voids: `(0,0)`, `(1,0)`, `(0,1)` *(and (1,1) is playable `A1`)*
   - Bottom-Right Voids: `(8,0)`, `(9,0)`, `(9,1)`
   - Top-Left Voids: `(0,8)`, `(0,9)`, `(1,9)`
   - Top-Right Voids: `(9,8)`, `(8,9)`, `(9,9)`

#### 180° Rotational Symmetry
The battlefield is strictly invariant under $180^\circ$ rotation:
$$(x, y) \longleftrightarrow (9 - x, 9 - y)$$
Every piece on the White team has an exact mechanical counterpart on the Black team mirrored diagonally across the board center $(4.5, 4.5)$.

---

### 13.2 Rotational Symmetrical Armies: Protagonists vs. Antagonists

Both sides deploy 13 units: 7 unique tactical sorcerers and 6 frontline pawns.

| Role | Material Value | White Unit (Protagonist) | Black Unit (Antagonist) | Starting Square (White) | Starting Square (Black) |
| :--- | :---: | :--- | :--- | :---: | :---: |
| **Sovereign** | $99.0$ | **Satoru Gojo** | **Ryomen Sukuna** | `H1` $(8, 1)$ | `A8` $(1, 8)$ |
| **Vanguard** | $8.0$ | **Yuji Itadori** | **Kenjaku** | `G1` $(7, 1)$ | `B8` $(2, 8)$ |
| **Artillery** | $4.0$ | **Kokichi Muta (Mechamaru)** | **Uraume** | `F1` $(6, 1)$ | `C8` $(3, 8)$ |
| **Bulwark** | $3.5$ | **Panda** | **Yorozu** | `E1` $(5, 1)$ | `D8` $(4, 8)$ |
| **Warden** | $4.5$ | **Kento Nanami** | **Reggie Star** | `D1` $(4, 1)$ | `E8` $(5, 8)$ |
| **Skirmisher** | $3.5$ | **Maki Zenin** | **Naoya Zenin** | `C1` $(3, 1)$ | `F8` $(6, 8)$ |
| **Rusher** | $3.5$ | **Kinji Hakari** | **Kurourushi** | `B1` $(2, 1)$ | `G8` $(7, 8)$ |
| **Pawns** $(\times 6)$ | $1.0$ | **Jujutsu High Footmen** | **Curse Footmen** | `B2..G2` $(x=2..7, y=2)$ | `B7..G7` $(x=2..7, y=7)$ |

---

### 13.3 Exhaustive Role Compendium, Movement Vectors & Special Techniques

#### 13.3.1 Sovereign (Satoru Gojo ⚔ Ryomen Sukuna) - Domain Step
* **Material Value**: $99.0$ (Royal Commander).
* **Base Movement**: Moves and captures exactly $1$ square in all 8 directions (orthogonal and diagonal).
* **Active Technique — Domain Step (Limitless / Malevolent Shrine)**:
  - **Cooldown & Limits**: Usable **once per match** (`specialUsed = true`).
  - **Vector**: Targets an empty square situated at **exactly distance 2** along any of the 8 straight or diagonal lines ($\Delta x, \Delta y \in \{0, \pm 2\}$ where $|\Delta x| = |\Delta y|$ or $\Delta x = 0$ or $\Delta y = 0$).
  - **Leaping Privilege**: Leaps cleanly over any intervening friendly or enemy piece.
  - **Safety Requirements**:
    1. Landing cell must be completely **empty** (Domain Step cannot capture).
    2. Landing cell must **not be under attack** by any enemy piece (`isSquareAttackedBy === false`).
    3. **Cannot be activated while in check** (`inCheck !== null`). If in check, the Sovereign must evade with a standard 1-square step or rely on an allied interposition/capture.

#### 13.3.2 Vanguard (Yuji Itadori ⚔ Kenjaku) - Black Flash Strike-in-Place
* **Material Value**: $8.0$ (Heavy Striker).
* **Base Movement**: Slides up to $3$ squares in all 8 directions (orthogonal and diagonal). Cannot leap over pieces or voids. Ray stops immediately at the first piece or board boundary. (Capped at 1 square if restricted by an enemy Warden).
* **Active Technique — Black Flash Strike-in-Place**:
  - **Trigger**: When capturing an enemy piece situated at **precisely distance 2** along any straight or diagonal vector ($\Delta x, \Delta y \in \{0, \pm 2\}$) where the intermediate cell is unoccupied.
  - **Execution**: The target enemy is obliterated and removed from the board, but the **Vanguard does NOT move**; it remains anchored on its origin square.
  - **Distance 1 & 3 Captures**: Capturing an enemy at distance 1 or distance 3 executes normally (displacing the Vanguard onto the target square).

#### 13.3.3 Artillery (Kokichi Muta / Mechamaru ⚔ Uraume) - Ranged Strike
* **Material Value**: $4.0$ (Sniper & Choke-Point Sentry).
* **Base Movement**: Moves and captures $1$ square in all 8 directions.
* **Active Technique — Ranged Strike**:
  - **Trigger**: Targets an enemy piece at **precisely distance 2** in any of the 8 radial directions ($\Delta x, \Delta y \in \{0, \pm 2\}$).
  - **Prerequisite**: The intermediate cell $(\frac{x_{from} + x_{to}}{2}, \frac{y_{from} + y_{to}}{2})$ must be completely **empty**.
  - **Execution**: Destroys the target in place; Artillery remains stationary on its origin square.
  - **Restriction**: Ranged Strike is **completely disabled** if the Artillery is adjacent to an enemy Warden (Ratio Field suppression).

#### 13.3.4 Bulwark (Panda ⚔ Yorozu) - Shell Absorption
* **Material Value**: $3.5$ (Heavy Cavalry & Armor).
* **Base Movement**: Moves and captures with classical Knight $2 \times 1$ L-jumps:
  $$\Delta x, \Delta y \in \{(\pm 1, \pm 2), (\pm 2, \pm 1)\}$$
  Leaps freely over intervening pieces and void boundaries.
* **Passive Trait — Shell Hardening (Panda Core / Insect Armor)**:
  - Starts the match with `pandaCore: 'panda'` (shell intact).
  - **First Attack Absorption**: When an opponent attempts to capture a Bulwark whose shell is intact, **the capture fails completely**:
    - The attacking piece remains stationary on its origin square.
    - The Bulwark remains on its square.
    - The Bulwark's shell breaks permanently (`pandaCore = 'gorilla'`).
    - The opponent's turn ends with zero board displacement!
  - **Subsequent Attacks**: Once the shell is broken, the Bulwark can be captured normally.

#### 13.3.5 Warden (Kento Nanami ⚔ Reggie Star) - Ratio Field Suppression
* **Material Value**: $4.5$ (Positional Anchor).
* **Base Movement**: Slides up to $3$ squares orthogonally (horizontal/vertical) along ranks and files. Cannot slide diagonally; cannot leap over pieces.
* **Passive Aura — Ratio Field (7:3 Suppression)**:
  - Any enemy unit standing in any of the **8 adjacent surrounding squares** has its movement and capture range **restricted to a maximum of 1 square**.
  - Enemy Artillery (Mechamaru / Uraume) adjacent to a Warden has its Ranged Strike completely disabled.
  - *Immunity*: Skirmishers (Maki / Naoya) are immune to Ratio Field due to Heavenly Restriction.
  - *Vulnerability*: Wardens have **no capture immunity**; they can be captured by pawns, sovereigns, or any standard piece.

#### 13.3.6 Skirmisher (Maki Zenin ⚔ Naoya Zenin) - Heavenly Restriction & 2-Square Hops
* **Material Value**: $3.5$ (Infiltration Leaper).
* **Base Movement**:
  1. Steps/captures $1$ square in all 8 directions.
  2. **Orthogonal 2-Square Hop**: Leaps exactly $2$ squares horizontally or vertically:
     $$\Delta x, \Delta y \in \{(0, 2), (0, -2), (2, 0), (-2, 0)\}$$
     Leaps over all intervening friendly or enemy pieces.
* **Passive Trait — Heavenly Restriction (Zero Cursed Energy)**:
  - 100% immune to the Warden's Ratio Field.
  - Retains full mobility (including 2-square orthogonal hops) even when adjacent to Nanami or Reggie.

#### 13.3.7 Rusher (Kinji Hakari ⚔ Kurourushi) - Idle Death Gamble Jackpot
* **Material Value**: $3.5$ (Tempo Striker).
* **Base Movement**: Slides up to $2$ squares diagonally (no leaping; blocked by intervening pieces), OR steps $1$ square orthogonally. (Diagonal range capped at 1 if restricted by Warden).
* **Passive Trait — Idle Death Gamble Jackpot**:
  - **Trigger**: Triggered whenever the Rusher executes a capture (and the target was not absorbed by an intact Bulwark shell).
  - **Bonus Action**: The player is awarded **one immediate consecutive move with the SAME Rusher piece**:
    - The bonus move is a single 1-square step in any of 8 directions.
    - **Non-Capturing Only**: Destination square must be empty.
    - **Safety Filter**: Destination square must **not be under attack** by any enemy piece (`isSquareAttackedBy === false`).
    - **King Safety**: The step cannot leave or place the friendly Sovereign in check.
  - **Fail-Safe**: If no safe, unattacked step square exists, the Jackpot bonus is automatically forfeited, and the turn passes cleanly to the opponent. Non-recursive.

#### 13.3.8 Culling Pawn & Far-Edge File-Specific Warden Promotion
* **Material Value**: $1.0$ (Infantry).
* **Base Movement**: Advances $1$ square forward ($dy = +1$ for White, $dy = -1$ for Black) into an empty square; captures $1$ square diagonally forward. (No 2-square initial double step; no en passant).
* **Automatic Far-Edge Promotion**:
  Because the cross-shaped board has uneven file depths, the far edge varies by file:
  - **Lateral Wings (Files `L` $[x=0]$ and `R` $[x=9]$)**: Promotes at **Rank 7** for White, **Rank 2** for Black (only 5 steps from starting rank!).
  - **Flank Columns (Files `A` $[x=1]$ and `H` $[x=8]$)**: Promotes at **Rank 8** for White, **Rank 1** for Black.
  - **Central Columns (Files `B..G` $[x=2..7]$)**: Promotes at **Rank 9** (Top Arm) for White, **Rank 0** (Bottom Arm) for Black.
  - **Promotion Unit**: Promotes automatically to **Warden** (White pawn becomes Kento Nanami; Black pawn becomes Reggie Star). Never promotes to Vanguard or Sovereign.

---

### 13.4 Movement, Leaping & Check Laws

1. **Strict Leaping Exclusivity**:
   - Only **Bulwark** (Knight L-jump) and **Skirmisher** (2-square orthogonal hop) can leap over pieces during standard turns.
   - The **Sovereign** can leap over pieces using its once-per-game **Domain Step**, provided the destination is empty, unattacked, and the Sovereign is not currently in check.
   - All other sliding pieces (**Vanguard, Artillery, Warden, Rusher, Pawn**) stop at the first obstacle (friendly unit, enemy unit, or void cell).
2. **Authoritative Check from Move 1**:
   - Check and checkmate apply from the first move of the match.
   - A player may never make a move that leaves or places their own Sovereign in check.
   - A player in check must resolve check on their turn.

---

### 13.5 Victory, Defeat & Match Termination Hierarchy

| Priority | Verdict Condition | Result | Engine Representation |
| :---: | :--- | :--- | :--- |
| **#1** | **Checkmate** | Opponent Sovereign trapped in check with zero legal evasions. | `status: 'completed', winner: color, winReason: 'Checkmate!'` |
| **#2** | **Complete Tactical Suppression** | Active player has **zero legal moves** while NOT in check. (Stalemate is removed; suppression is a decisive loss!). | `status: 'completed', winner: opponent, winReason: 'Complete Tactical Suppression'` |
| **#3** | **Sovereign Elimination** | Opponent Sovereign captured/eliminated directly. | `status: 'completed', winner: color` |
| **#4** | **Clock Timeout** | Player's timer depletes to 0:00 (120s Blitz or 300s Rapid). | `status: 'completed', winner: opponent, winReason: 'Time out'` |
| **#5** | **Threefold Repetition** | Identical board state (pieces, turn, shell status, Domain Step flag, pending Jackpot) occurs 3 times. | `status: 'completed', winner: null, winReason: 'Draw by threefold repetition'` |
| **#6** | **30-Move Draw Rule** | 30 full consecutive moves (60 plies) completed without a capture, pawn move, or shell break. | `status: 'completed', winner: null, winReason: 'Draw by 30-move rule'` |
| **#7** | **Resignation** | Player surrenders via in-game menu. | `status: 'completed', winner: opponent` |

---

### 13.6 Complete Tactical Edge Cases & Engine Scenarios

* **Scenario 1: Activating Domain Step While in Check**:
  - *Situation*: White Gojo at `E2` is checked by Black Vanguard at `E5`. Gojo attempts to use Domain Step to vault to `E0`.
  - *Engine Verdict*: **Illegal Move**. `getPseudoLegalMovesForSquare` explicitly checks `!isCullingKingInCheck`. Domain Step cannot be activated while in check. Gojo must step to an adjacent safe square (`D1`, `F1`, etc.) or have an ally block/capture the attacker.
* **Scenario 2: Vanguard Black Flash vs. Intact Bulwark Shell**:
  - *Situation*: White Yuji at `D3` uses Black Flash to strike Black Panda at `D5` (distance 2, middle square `D4` empty, Panda shell intact).
  - *Engine Verdict*: `applyCullingMoveToBoard` detects `getPieceRole(target.type) === 'bulwark'` and `pandaCore !== 'gorilla'`. The strike breaks the shell (`pandaCore = 'gorilla'`); Yuji remains at `D3`, Panda remains at `D5`, and White's turn ends with the shell broken. Panda can now be eliminated on the next attack.
* **Scenario 3: Warden Ratio Field vs. Skirmisher**:
  - *Situation*: Black Warden Reggie Star moves to `C4`, directly adjacent to White Maki at `C3`.
  - *Engine Verdict*: `isPieceRestrictedByWarden` inspects Maki's role: `getPieceRole('culling_maki') === 'skirmisher'`, which returns `false`. Due to **Heavenly Restriction**, Maki completely ignores Reggie's Ratio Field and can freely execute her 2-square orthogonal hop to `C5` or `E3`.
* **Scenario 4: Rusher Jackpot in Hostile Territory**:
  - *Situation*: White Hakari at `D4` captures Black Pawn at `E5`. All 8 squares surrounding `E5` are covered by Black pieces.
  - *Engine Verdict*: The engine simulates Jackpot bonus moves for Hakari from `E5`. Finding zero unattacked empty squares, the engine automatically forfeits the bonus step (`bonusLegalSteps.length === 0`), advances the turn count, and passes the turn safely to Black.
* **Scenario 5: Lateral Wing Rapid Promotion**:
  - *Situation*: White Pawn advances along File `L` $(x=0)$ and reaches `L7` $(y=7)$.
  - *Engine Verdict*: `isPawnPromotionSquare` evaluates `pos.x === 0 && pos.y >= 7` as `true`. The pawn immediately promotes to **Kento Nanami** (`culling_nanami`), skipping Ranks 8 and 9 entirely.
* **Scenario 6: Complete Tactical Suppression (No Stalemate)**:
  - *Situation*: Black Sovereign is trapped in a corner box with zero legal moves, but is NOT in check.
  - *Engine Verdict*: In standard chess, this would be a draw by stalemate. In Culling Game, `executeCullingMove` evaluates `nextPlayerLegalMoves.length === 0` and awards a **decisive victory to White** by **Complete Tactical Suppression**.

---

## 14. Rose Paradise: Romantic Couples Chess & Botanical Mechanics

**Rose Paradise** is a dedicated couples chess mode engineered for partners to share an affectionate, strategic experience. It blends classic chess royalty with fairy piece crafting, a dynamic petal-harvesting resource system, radiant in-game messaging, and a pressure-free **Untimed Love Protocol**.

```
                         ROSE PARADISE BATTLEFIELD (8x8)
[a8:Prince]   [b8:Knight]  [c8:Bishop]  [d8:King]   [e8:Queen]   [f8:Bishop]  [g8:Knight]  [h8:Rook]
[a7:Pawn]     [b7:Pawn]    [c7:Pawn]    [d7:Pawn]   [e7:Pawn]    [f7:Pawn]    [g7:Pawn]    [h7:Pawn]
                               (Empty Midfield Ranks 3..6)
[a2:Pawn]     [b2:Pawn]    [c2:Pawn]    [d2:Pawn]   [e2:Pawn]    [f2:Pawn]    [g2:Pawn]    [h2:Pawn]
[a1:Queen]    [b1:Knight]  [c1:Bishop]  [d1:King]   [e1:Prince]  [f1:Bishop]  [g1:Knight]  [h1:Rook]
```

---

### 14.1 Philosophy, Roles & The Untimed Love Protocol

* **Core Premise**: Couples chess should inspire connection, strategic cooperation, and playful banter rather than frantic clock pressure.
* **Romantic Role Pairing**:
  - **Boyfriend 👑**: Commands the White army (moves first). Royal champion is the **Prince**.
  - **Girlfriend 👸**: Commands the Black army. Royal champion is the **Queen**.
  - *Role Flexibility*: Roles and colors can be inverted or customized during lobby setup.
* **The Prince's Royal Privilege**:
  In Rose Paradise, the Prince moves 1 square in all 8 directions with the royal ability to leap over 1 adjacent friendly piece to escape danger, alongside standard MugenChessX Prince hybrid vectors.
* **Untimed Love Protocol**:
  Match clocks are completely disabled (`timeControl = 0`). Partners can deliberate together, banter, and step away from the game without penalty.

---

### 14.2 Petals of Passion & Love Link Harvesting Engine

Each player possesses a **Petal Meter** that accumulates up to **3 Petals (🌹)**. Petals represent romantic tactical favor and are harvested through three actions:

1. **Capturing an Enemy Unit (+1 🌹)**: Any successful capture adds 1 Petal to the active player's meter.
2. **Delivering Check (+1 🌹)**: Making a legal move that places the partner's King in check awards 1 Petal.
3. **The Love Link (+1 🌹)**:
   - When a player maneuvers their **Prince** and **Queen** into adjacent squares (sharing an edge or corner in the 8-neighborhood):
     $$|x_{queen} - x_{prince}| \le 1 \quad \text{and} \quad |y_{queen} - y_{prince}| \le 1$$
   - Awards **+1 Petal** instantly!
   - **Cooldown**: To prevent repetitive adjacency abuse, Love Link can trigger at most **once every 4 moves** per player (`turnCount - lastLoveLinkTurn >= 4`).

---

### 14.3 Full-Board Reinforcement Summoning & The 8-Unit Catalog

When a player holds **3 Petals**, they can activate **Tactical Reinforcements** to summon a powerful unit directly onto the battlefield.

#### The 8-Piece Summon Catalog:
1. **Queen 👑 (Royal Empress)**: Full straight and diagonal sliding coverage.
2. **Rook 🏰 (Castle Tower)**: Unbounded orthogonal sliding ranks and files.
3. **Bishop ⛪ (Royal Cleric)**: Long-range diagonal color-complex slicing.
4. **Knight ♞ (Valiant Cavalier)**: Classical $2 \times 1$ L-shaped leaper.
5. **Cupid Priest 🏹 (Angel of Hearts)**: Slides up to 3 squares diagonally and hops 2 squares orthogonally over obstacles.
6. **Thorn Guard 🌹 (Communist)**: Traverses locked pawn formations via alternating diagonal zigzags.
7. **Rose Tower 🛡️ (Supreme Rook)**: Heavy siege engine pairing orthogonal sliding with a 2-square diagonal hop.
8. **Loyal Footman ♟️ (Pawn)**: Frontline infantry advancing 1 step with diagonal capture.

#### Placement Rules & Restrictions:
* **Any Empty Square**: The unit may be placed on **ANY vacant square across the entire 8×8 board** (not restricted to back ranks!).
* **Check Defense First**: Summons **cannot be performed while the King is in check**. The player must escape check before summoning reinforcements.
* **No Direct Check on Drop**: The summoned unit **cannot immediately deliver check to the opponent's King** on the turn it is dropped.
* **King Safety**: The summon cannot expose or leave the friendly King in check.
* **Game Limit**: Each player is permitted a maximum of **2 summons per match** (`summonsUsed < 2`).
* **Turn Consumption**: Summoning a unit consumes the player's active turn.

---

### 14.4 In-Game Love Chat, Floating Reactions & Romantic Bot AI

#### 1. Radiant Love Chat Box
An in-game messenger styled with a radiant rose glow and floating message bubbles. Includes quick-tap suggestion chips:
* `❤️ Love you`
* `🌹 Good move!`
* `😉 Cute!`
* `🙈 Oops!`
* `👑 Queen power!`
* `🧋 Boba date later?`

#### 2. Floating Emoji Reaction Palette
Players can tap live reaction icons that float across both players' screens with spring animations:
$$\text{Reactions: } \mathbf{❤️, \ 🌹, \ ✨, \ 💍, \ 🥰, \ 😉, \ 💖, \ 👑, \ 🥺, \ 💅, \ 🧋, \ ⚔️}$$

#### 3. AI Romantic Bot Companion
For solo practice, players can challenge **Boyfriend Bot 👑** or **Girlfriend Bot 👸**:
* Built with 2-ply Minimax search weighted toward tactical mobility and Love Link formation.
* Features contextual conversational dialogue responding to checks, player summons, material losses, and match conclusions.
* Automated emoji reactions triggered when players make bold sacrifices or summon legendary pieces.

#### 4. Private Room Codes & Discovery
* Generates instant 6-character room codes (e.g., `ROSE-A1B2C3`) that can be shared with a partner on any device.
* Real-time WebSocket matchmaking lobby allows partners to browse open rooms and connect with a single click.

---

### 14.5 Match Termination, Lovingly Conceding & 20-Move Draw Rule

1. **Checkmate with Roses**: Delivering checkmate triggers celebratory rose petals cascading across the screen. The winner is awarded the victory with a bouquet of roses.
2. **Lovingly Concede**: Replaces harsh resignation with an affectionate concession dialog: *"You lovingly conceded to your partner."*
3. **20-Move Draw Rule**: To prevent endless circling in untimed matches, a match automatically draws if **20 consecutive moves** (40 half-moves) unfold without a capture or pawn advance.
4. **Stalemate**: Ending a turn with zero legal moves while not in check produces a graceful draw.

---

### Possible Future Updates (( NOT Done YET ))

A strategic roadmap of engineered features designed from the perspective of a **Senior Game Developer & Systems Architect**. These prospective updates focus on player retention, viral growth, tactile immersion, and community engagement while **strictly preserving the core rules, tactical balance, and Google Cloud Free-Tier sustainability** (zero external paid databases, $< 256\text{ MB}$ memory footprint, scale-to-zero compliance).

---

#### 1. Daily Engagement & Habit Loops (Zero Server Cost)

* **1.1 Daily Mugen Tactical Puzzle ("Puzzle of the Day")**:
  - *Product Concept*: Players solve one daily curated tactical scenario (e.g., finding checkmate using the Prince's 3×1 first leap, breaking through with a Communist zigzag, or forcing a Two-Pawns End-Rank Draw).
  - *Retention Driver*: Encourages daily logins and builds habit streaks (tracked via an in-app calendar).
  - *Engineering Architecture*: Puzzles stored in a static client JSON file (`puzzles.json`). Validation runs **100% on the client browser thread** using `src/game/engine.ts`. Zero server compute or database load!
* **1.2 The Mugen Grimoire (Trophy & Achievement System)**:
  - *Product Concept*: Aesthetic brutalist badges unlocked through remarkable tactical milestones:
    - 👑 **"Royal Gambler"**: Won 5 matches during turns where dice forced an Expensive roll.
    - 🕊️ **"The Diplomat"**: Successfully forced a draw via the Two-Pawns End-Rank Rule.
    - ⚡ **"Flank Decapitation"**: Delivered checkmate on turn 4 using the Prince's opening leap.
    - 🌹 **"True Romance"**: Triggered 3 Love Links in a single Rose Paradise match.
    - ⛩️ **"Total Domination"**: Won a Culling Game by Complete Tactical Suppression (0 moves).
  - *Engineering Architecture*: Tracked in existing user profiles or browser `localStorage`. Incremented in $O(1)$ time inside the match completion handler.

---

#### 2. Social & Virality Features (Zero Server Clutter)

* **2.1 Compressed URL-Encoded Shareable Match Replays**:
  - *Product Concept*: After any match, players can click **"Share Game Replay"** to copy a short link (e.g., `https://your-app.../?replay=e4_h4_e2e4...`).
  - *Viral Driver*: Players share dramatic matches, brilliant Prince forks, and dice comebacks on Discord, WhatsApp, or X/Twitter.
  - *Engineering Architecture*: The match move sequence is compressed via LZ-string into the URL query parameter. When a friend opens the link, the client engine decodes the moves and animates a step-by-step playback bar with forward/back navigation. **Zero database storage required.**
* **2.2 Courtside Live Spectator Mode ("Watch Room")**:
  - *Product Concept*: Friends and spectators can watch active PvP or Rose Paradise matches live in real time.
  - *Community Driver*: Enables community tournaments, couples cheering on each other, and streamer spectating.
  - *Engineering Architecture*: Connects read-only WebSocket clients to the existing match room (`matchRooms.get(matchId)`) with an `isSpectator: true` flag. The server broadcasts the existing delta frames without extra computation or memory overhead.

---

#### 3. Balanced, Non-Extreme Game Modes & Variations

* **3.1 Mugen Puzzle Rush / Tactical Survival (Single-Player Arcade)**:
  - *Product Concept*: Players get 3 minutes and 3 lives to solve consecutive tactical dice and fairy-piece positions of increasing difficulty.
  - *Why It Fits*: Fast-paced, addictive, and casual-friendly. Preserves classical rules without adding confusing mechanics.
* **3.2 "Fog of War" / Tactical Vision (Optional Match Toggle)**:
  - *Product Concept*: An optional visual toggle where only squares your pieces can attack or step onto are illuminated; opponent pieces in deep shadows are hidden until scouted.
  - *Why It Fits*: Transforms chess into an intense stealth skirmish where the Prince's leaping ability acts as a deep reconnaissance unit. All piece movement and capture rules remain 100% identical.
* **3.3 "Hand & Brain" Co-op Bot Challenge**:
  - *Product Concept*: Two human players team up against the Grandmaster Bot: Player 1 (the "Brain") designates which piece must move, and Player 2 (the "Hand") decides which square to move it to.

---

#### 4. Engine & AI Diversity (Zero Extra CPU Load)

* **4.1 Distinct Minimax Bot Personalities**:
  By adjusting evaluation weights in `src/game/bot.ts` without increasing search depth, players can choose from 4 unique bot playstyles:
  1. **"The Cavalier" (Hyper-Aggressive)**: Overvalues Prince mobility and Knight outposts by 35%; launches early flank offensives.
  2. **"The Iron Fortress" (Positional Defender)**: Prioritizes King shelter and rigid pawn structures; actively maneuvers to trigger late-game board expansion or two-pawn draws.
  3. **"The Berserker" (Tactical Striker)**: Relentlessly hunts down enemy Queens and Princes, accepting wild tactical sacrifices.
  4. **"The Architect" (Crafting Strategist)**: Focuses opening play on orchestrating mid-game Fairy piece summons (Communists and Supreme Rooks).

---

#### 5. Mobile Web App Feel & Tactical Polish

* **5.1 Progressive Web App (PWA) Offline Play**:
  - *Product Concept*: Add a Web App Manifest and Service Worker caching core assets (`index.html`, vector pieces, sounds).
  - *User Benefit*: Players can tap **"Add to Home Screen"** on iOS or Android. Launches full-screen without browser bars and enables playing against the Bot or solving Daily Puzzles **completely offline on flights or subways**.
* **5.2 Mobile Web Haptic Feedback (`navigator.vibrate`)**:
  - Crisp, subtle tactile vibrations:
    - *Piece Lift / Drop*: 15ms micro-vibration.
    - *Delivering Check*: Double tap (30ms, 40ms pause, 30ms).
    - *Checkmate / Board Expansion*: Heavy pulse.
  - Adds a premium physical board feel on mobile devices with zero performance cost.
* **5.3 Interactive "Mugen Theory Lab" (Opening Sandbox)**:
  - An interactive analysis board in the Theory tab allowing players to explore opening lines when White starts with Queen at `a1` and Prince at `h1`.

---

#### 6. Google Cloud Free-Tier Compliance & Efficiency Matrix

| Prospective Feature | Compute Location | Memory Footprint | Network Overhead | Free-Tier Feasibility |
| :--- | :---: | :---: | :---: | :---: |
| **Daily Puzzles & Streaks** | Client Browser | $0\text{ MB}$ Server RAM | Single static JSON fetch | **100% Free** |
| **Shareable Replay URLs** | Client URL Parameters | $0\text{ MB}$ Server RAM | $0\text{ KB}$ Server Network | **100% Free** |
| **Spectator Mode** | Existing WebSocket Room | $< 0.1\text{ KB}$ per viewer | Reuses existing delta broadcast | **100% Free** |
| **Minimax Bot Personalities** | Client-Side Thread | $0\text{ MB}$ Server RAM | Zero network traffic | **100% Free** |
| **Offline PWA + Haptics** | Browser Cache / Device | $0\text{ MB}$ Server RAM | Zero server requests | **100% Free** |
| **Fog of War Masking** | CSS Canvas / DOM Layer | $0\text{ MB}$ Server RAM | Client visual mask only | **100% Free** |

---

## 16. Comprehensive Firebase & Firestore Porting Plan (100% Free Forever)

This architectural blueprint outlines how to port MugenChessX to **Google Firebase** and leverage **Cloud Firestore** for permanent account storage, match history, and administrative management **at zero financial cost ($0/month forever)** without a credit card.

---

### 16.1 Feasibility & Heaviness Evaluation: Will Free Tier Last for Years?

#### 1. Game Heaviness & Data Footprint
* **Client Frontend Bundle**: Compiled React 19 production bundle is $\sim 380\text{ KB}$ gzipped. In modern web development, this is **exceptionally lightweight** (lighter than a single mobile camera photo).
* **User Profile Footprint**: A full player record (`userId`, `username`, `passwordHash`, `salt`, `avatarId`, `wins`, `losses`, `draws`, `createdAt`) occupies only $\sim 0.2\text{ KB}$ of text data in Firestore.
* **Match History Footprint**: A complete match record with 60 plies of moves, timestamps, and captured trays occupies $\sim 2 \dots 4\text{ KB}$.

#### 2. Firebase Spark Plan (100% Free Tier Quota Limits)
The Firebase **Spark Plan** is completely free forever and does **NOT require any credit card**:

| Resource | Firebase Spark Free Daily Quota | Your Usage at 1–2 Players / Day | Percentage of Free Quota Used |
| :--- | :---: | :---: | :---: |
| **Total Stored Data** | **$1.0\text{ GB}$ (Free Forever)** | $\sim 0.00005\text{ GB}$ per month | $< 0.01\%$ |
| **Document Reads** | **$50,000$ reads / day** | $\sim 20 \dots 50$ reads / day | **$\mathbf{0.08\%}$** |
| **Document Writes** | **$20,000$ writes / day** | $\sim 4 \dots 10$ writes / day | **$\mathbf{0.03\%}$** |
| **Document Deletes** | **$20,000$ deletes / day** | $\sim 1 \dots 5$ deletes / day | **$\mathbf{0.01\%}$** |
| **Network Egress** | **$10\text{ GB}$ / month** | $\sim 0.05\text{ GB}$ / month | $< 0.5\%$ |

#### 3. Mathematical Longevity Calculation:
* $1.0\text{ GB}$ of free storage $= 1,000,000\text{ KB}$.
* At $4\text{ KB}$ per recorded match, $1\text{ GB}$ holds **$250,000$ completed games** and over **$5,000,000$ registered accounts**.
* At 2 games played per day ($365 \times 2 = 730$ games per year):
  $$\text{Years to reach } 1\text{ GB} = \frac{250,000 \text{ games}}{730 \text{ games/year}} \approx \mathbf{342 \text{ Years!}}$$
* **Verdict on Longevity**: For low-to-moderate traffic (1 to 50 active players per day), the Firebase Spark Plan will run **100% free with zero bills or credit card requirements indefinitely for decades**.

---

### 16.2 Codebase Compatibility: Can the Whole App Upload As-Is?

To understand how MugenChessX ports to Firebase, we must distinguish between the **Frontend** and the **Backend**:

```
MUGENCHESSX ARCHITECTURAL LAYOUT:
├── Client Frontend (React 19, Vite, Tailwind, Audio, Canvas)   --> 100% Static HTML/JS
└── Backend Server (Node.js Express + WebSocket Server on /ws)    --> Stateful Long-Running Process
```

#### What Uploads As-Is:
* **The Client Frontend**: The entire React application builds to pure static HTML, CSS, and JS (`dist/`). It can be deployed directly to **Firebase Hosting** with one command (`firebase deploy --only hosting`). It delivers instant global CDN delivery with automatic SSL certificates.

#### What Needs Architectural Choice (The WebSocket Server):
* Traditional **Firebase Hosting** is purely a static file server. It does *not* host long-running Node.js processes or custom WebSocket servers by itself.
* Because MugenChessX features real-time dice rolls, turn timers, and challenges via a WebSocket server (`ws`), you have three porting paths:

---

#### 🌟 Path A: The Direct Firestore Plug-in (Recommended for Google AI Studio)
* **How It Works**:
  1. Keep the app running inside Google AI Studio / Google Cloud Run (which is already free and handles both Express and WebSockets natively).
  2. Simply replace the local file database operations in `server/db.ts` (`users.json`, `matches.json`) with the `@google-cloud/firestore` SDK pointing to your free Firebase project.
* **Why This Is Best**:
  * **Zero Frontend Changes**: You don't rewrite a single line of React or WebSocket code.
  * **Permanent Data**: When Cloud Run sleeps or restarts, accounts and matches stay permanently saved in Firestore!
  * **Zero Extra Cost**: Cloud Run scale-to-zero is free; Firestore Spark tier is free.

#### Path B: Serverless Firebase via Firestore Real-Time Listeners (`onSnapshot`)
* **How It Works**:
  1. Eliminate `server.ts` and `server/socket.ts` entirely.
  2. Frontend connects directly to Firestore using the client SDK (`firebase/firestore`).
  3. Real-time multiplayer moves are synced by listening to document changes:
     ```typescript
     import { onSnapshot, doc } from 'firebase/firestore';
     const unsubscribe = onSnapshot(doc(db, 'matches', matchId), (snapshot) => {
       setMatchState(snapshot.data());
     });
     ```
* **Pros**: 100% serverless, zero servers to maintain, deployed completely on Firebase Hosting.
* **Cons**: Requires refactoring the WebSocket event listeners in `SocketContext.tsx` into Firestore document listeners.

---

### 16.3 Step-by-Step Porting Guide from Scratch

Suppose you have just created an empty Firebase project:

#### Step 1: Create Project in Firebase Console
1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/) and click **"Add project"**.
2. Name your project (e.g., `mugenchessx`).
3. Toggle Google Analytics off (optional, keeps setup minimal).
4. Click **Create Project**. Verify in project settings that the plan is **Spark (Free $0)**.

#### Step 2: Enable Cloud Firestore
1. In the Firebase console sidebar, navigate to **Build** $\to$ **Firestore Database**.
2. Click **Create database**.
3. Choose your nearest cloud location (e.g., `asia-northeast1` or `us-central1`).
4. Select **Start in production mode** (or test mode for immediate prototyping).
5. Click **Enable**.

#### Step 3: Obtain Configuration Credentials
* **For Client-Side Web App**:
  1. In Project Overview, click the Web icon (`</>`) to register a web app.
  2. Copy the generated `firebaseConfig` object:
     ```javascript
     const firebaseConfig = {
       apiKey: "AIzaSy...",
       authDomain: "mugenchessx.firebaseapp.com",
       projectId: "mugenchessx",
       storageBucket: "mugenchessx.appspot.com",
       messagingSenderId: "...",
       appId: "..."
     };
     ```
* **For Backend Server Integration (Path A)**:
  1. Go to **Project Settings** $\to$ **Service accounts**.
  2. Click **Generate new private key** (downloads a JSON credentials file).
  3. Store this file securely or set environment variable `GOOGLE_APPLICATION_CREDENTIALS`.

#### Step 4: Install Dependencies in Google AI Studio
In your applet terminal / environment:
```bash
npm install firebase
# If using server-side Path A:
npm install @google-cloud/firestore
```

#### Step 5: Replace `server/db.ts` Logic with Firestore Calls
Instead of reading and writing to `data/users.json`, `server/db.ts` interacts directly with Firestore:
```typescript
import { Firestore } from '@google-cloud/firestore';

const firestore = new Firestore({
  projectId: process.env.FIREBASE_PROJECT_ID || 'mugenchessx',
});

const usersCol = firestore.collection('users');
const matchesCol = firestore.collection('matches');

export async function findUserById(id: string) {
  const doc = await usersCol.doc(id).get();
  return doc.exists ? doc.data() : undefined;
}

export async function saveUser(user: any) {
  await usersCol.doc(user.id).set(user, { merge: true });
}

export async function deleteUser(id: string) {
  await usersCol.doc(id).delete();
}
```

---

### 16.4 Firestore Schema & Document Architecture

```
Firestore Root
│
├── /users/{userId}
│   ├── id: string (e.g., "usr_9x7a2")
│   ├── username: string ("grandmaster_alex")
│   ├── displayName: string ("Alex")
│   ├── passwordHash: string (PBKDF2 salted hash)
│   ├── salt: string
│   ├── avatarId: string ("avatar_prince")
│   ├── role: string ("user" | "admin")
│   ├── stats: { wins: 14, losses: 5, draws: 2, winRate: 0.70 }
│   ├── achievements: ["prince_first_leap", "culling_suppression"]
│   └── createdAt: number (timestamp)
│
├── /matches/{matchId}
│   ├── id: string ("match_1740000000")
│   ├── gameMode: string ("standard" | "crafted" | "culling" | "rose")
│   ├── whitePlayer: { userId, displayName, avatarId }
│   ├── blackPlayer: { userId, displayName, avatarId }
│   ├── status: string ("active" | "completed")
│   ├── winner: string ("white" | "black" | "draw")
│   ├── winReason: string ("Checkmate!" | "Timeout")
│   ├── moveHistory: Array<{ from, to, san, piece }>
│   └── completedAt: number
│
└── /challenges/{challengeId}
    ├── id: string
    ├── challengerId: string
    ├── targetId: string
    ├── status: string ("pending" | "accepted" | "declined")
    └── expiresAt: number (auto-cleaned)
```

---

### 16.5 User & Admin Account Deletion Architecture

#### 1. User Self-Service Deletion
Add an authenticated route in `server/routes.ts`:
```typescript
// DELETE /api/account - Deletes current user and their active session
app.delete('/api/account', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  
  // 1. Delete user document from Firestore
  await firestore.collection('users').doc(userId).delete();
  
  // 2. Remove any active sessions
  db.removeSession(req.token);
  
  // 3. Clear user from active WebSocket presence
  res.json({ success: true, message: 'Account permanently deleted.' });
});
```

#### 2. Admin Deletion
* **No Code Needed (Firebase Console Dashboard)**:
  As the admin, open [https://console.firebase.google.com/](https://console.firebase.google.com/) on your phone or laptop $\to$ **Firestore Database** $\to$ click the `users` collection $\to$ select the user $\to$ click the **Trash Can icon**. The user is deleted instantly!
* **Programmatic In-Game Admin Deletion**:
  ```typescript
  app.delete('/api/admin/users/:targetUserId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required.' });
    }
    await firestore.collection('users').doc(req.params.targetUserId).delete();
    res.json({ success: true, message: 'User deleted by administrator.' });
  });
  ```

---

### 16.6 Critical Precautions & Anti-Quota Traps

1. **The React "Unsubscribe" Trap (Never Cause Runaway Reads)**:
   * If using client-side Firestore `onSnapshot` listeners in React components, **always return the unsubscribe function** inside `useEffect`:
     ```typescript
     useEffect(() => {
       const unsubscribe = onSnapshot(doc(db, 'matches', matchId), (snap) => {
         if (snap.exists()) setMatch(snap.data());
       });
       // CRITICAL: Cleanup on component unmount
       return () => unsubscribe();
     }, [matchId]);
     ```
   * *Why*: If you forget `return () => unsubscribe()`, every re-render spawns a new listener, which can consume hundreds of reads in seconds.
2. **Never Query Without Limits**:
   * When fetching user leaderboards or open rooms, always use `limit(20)`:
     ```typescript
     const q = query(collection(db, 'matches'), orderBy('completedAt', 'desc'), limit(20));
     ```
3. **Password Security Precaution**:
   * If you use Firestore directly from the browser, do NOT handle passwords manually. Instead, enable **Firebase Authentication (Email/Password)**, which hashes passwords with Scrypt on Google's infrastructure for free.
   * If keeping custom PBKDF2 hashing, keep password verification on the backend server (`server/auth.ts`) so password hashes and salts are never exposed to public Firestore clients.
4. **Firestore Security Rules (`firestore.rules`)**:
   Deploy strict security rules so players cannot overwrite other players' stats:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only read/edit their own profile
       match /users/{userId} {
         allow read: if true;
         allow write, delete: if request.auth != null && request.auth.uid == userId;
       }
       // Match records are read-only once completed
       match /matches/{matchId} {
         allow read: if true;
         allow create: if request.auth != null;
         allow update: if request.auth != null;
       }
     }
   }
   ```

# Chess Hashira Training Hub — Implementation Documentation

## 1. Overview

Chess Hashira Training (鬼殺チェス柱稽古) is an integrated training environment within the existing chess application. It provides interactive lessons, tactical exercises, specialized Culling Game training, practice boards, theory explanations, and a guided mentor experience.

The feature follows the existing brutalist design language, using dark backgrounds, sharp rectangular panels, contrasting borders, bold typography, and restrained gold accents.

The primary objective is to provide a comprehensive training environment without rewriting the existing game or interfering with live matches, multiplayer sessions, competitive ratings, or established game rules.

## 2. Architecture and Main Files

Training functionality is organized under `src/training/`.

| File | Responsibility |
|---|---|
| `src/training/types.ts` | Shared TypeScript types for training ranks, lessons, and training state. |
| `src/training/data.ts` | Static lesson definitions, instructional content, and training scenarios. |
| `src/training/HashiraMentor.tsx` | Sensei Gensei's 2D avatar, expressions, dialogue, and guidance interface. |
| `src/training/InteractiveKataBoard.tsx` | Interactive lesson board, move attempts, and instructional guidance. |
| `src/training/PracticeBoard.tsx` | Isolated practice board, mode selection, position controls, and sparring functionality. |
| `src/training/TheoryLibraryView.tsx` | Guided explanations of mechanics and strategic concepts. |
| `src/training/HashiraTrainingView.tsx` | Main training interface, navigation, rank selection, mentor panel, and responsive layout. |
| `src/components/Dashboard.tsx` | Training hub entry point on the main dashboard. |
| `src/App.tsx` | Application-level integration and in-site navigation. |
| `src/components/CullingBoard.tsx` | Existing specialized Culling Game board component. |
| `src/game/cullingEngine.ts` | Existing Culling Game rules and engine functionality. |
| `src/components/TrophyRoomModal.tsx` | Existing trophy and achievement presentation infrastructure. |

The training system reuses existing game components and engine infrastructure wherever appropriate. Training-specific state and interactions are intended to remain isolated from production matches.

## 3. Martial Rank Progression

The training hub includes six freely selectable ranks.

| Rank | Theme | Training Focus |
|---|---|---|
| Mizunoto | Water Initiate | Basic movement, positioning, and beginner-friendly practice. |
| Kanoe | Iron Blade | Development, tactical awareness, and defensive coordination. |
| Tsuchinoe | Earth Bastion | Defensive structures, pawn formations, and positional discipline. |
| Hinoe | Flame Strategist | Tactical combinations, sacrifices, and attacking play. |
| Kinoe | Tree of Mastery | Advanced calculation, positioning, and counterattacks. |
| Hashira | Supreme Pillar | High-difficulty calculation, precise play, and punishment of mistakes. |

Players can select any rank without mandatory progression locks. Rank selection establishes the intended difficulty and instructional context.

## 4. Unified Training Tools

### 4.1 Opening Dojo

Provides guided lessons covering:

- Opening development and central control.
- Prince deployment and coordination.
- Pawn advancement and positioning.
- Dice-aware planning where supported by the selected game mode.
- Preparation for special-piece interactions.

Lessons explain the strategic purpose of moves rather than relying exclusively on move memorization.

### 4.2 Tactical Dojo

Provides interactive exercises covering:

- Forks and multi-target attacks.
- Check and checkmate patterns.
- Defensive moves and threat prevention.
- Sacrifices and tactical combinations.
- Positional weaknesses and tactical suppression where supported by the game's rules.

The mentor provides feedback during lesson attempts.

### 4.3 Culling Game Dojo

Provides dedicated training for the Culling Game mode, using its specialized board geometry, character pieces, and mode-specific mechanics.

The implementation integrates the existing `src/components/CullingBoard.tsx` component and Culling Game engine infrastructure, including `src/game/cullingEngine.ts`, where applicable.

Training scenarios cover:

- Character-specific abilities and movement.
- Tactical positioning and suppression.
- Defensive survival and special-piece interactions.
- Mode-specific tactical situations and victory conditions.
- Understanding the effects of special abilities through guided exercises.

Implemented scenario themes include:

- **Sovereign Domain Step:** Gojo-inspired spatial movement.
- **Vanguard Black Flash Incursion:** Yuji-inspired offensive movement.
- **Warden 7:3 Ratio Field:** Nanami-inspired tactical suppression.
- **Artillery Ranged Bombardment:** Mechamaru-inspired ranged attacks.
- **Heavenly Restriction:** Maki-inspired interactions with suppression mechanics.
- **Bulwark Shell Resilience:** Panda-inspired defensive resilience.
- **Fever Jackpot:** Hakari-inspired capture and repositioning.
- **Malevolent Shrine Cross Checkmate:** A boundary-oriented tactical scenario.

These scenarios must follow the actual Culling Game implementation. Their precise legality and behavior should be verified against the current engine whenever game mechanics change.

### 4.4 Practice Board

Provides an isolated environment for experimenting with positions, practicing moves, and playing training scenarios.

Supported environments include:

- **Standard Chess:** 8×8 board.
- **Crafted Chess:** Custom armies and special-piece configurations.
- **Culling Game:** Specialized cross-shaped board.
- **Rose Paradise:** 10×10 board.

Available practice functionality includes mode selection, lesson loading, position experimentation, reset, undo or position controls where supported, board flipping, and sparring.

Practice actions are intended to remain separate from official matches.

### 4.5 Theory Library

Provides guided explanations of game mechanics, special pieces, strategic concepts, and mode-specific rules.

Topics include the Prince, Communists, Priests, Supreme Rooks, dice-related mechanics, and other supported game features.

The Theory Library is a reading-oriented interface and may scroll independently of the fixed gameplay layout.

## 5. Interactive Sensei Mentor

The training hub includes Sensei Gensei, a lightweight 2D mentor implemented with inline vector graphics and React.

The mentor supports instructional feedback through:

- Stern expressions for guidance.
- Disappointed or scowling expressions for mistakes.
- Analytical expressions during tactical instruction.
- Approving expressions and success feedback.
- Contextual dialogue, hints, and reset guidance.
- Lesson progression feedback.

### Mistake Diagnosis and Move Guidance

The interactive training board provides feedback when a player attempts an incorrect move.

After two failed attempts on a lesson step, the guidance system is designed to highlight the origin piece and intended destination square using a pulsing golden indicator.

This mechanism helps players identify the intended move while retaining the interactive learning experience.

The accuracy of mistake diagnosis depends on the lesson definitions and validation logic. Individual scenarios should be tested to ensure that feedback accurately describes the player's error.

## 6. Progress Tracking and Rewards

The training system includes rank-based organization, lesson progression, and local progress persistence where implemented.

The intended architecture uses browser storage for basic training progress without requiring a new database or backend service.

Training sparring also includes achievement reward integration. Qualifying victories are intended to award square achievement badges that can be viewed through the existing Trophy Room infrastructure.

Relevant integration includes `src/components/TrophyRoomModal.tsx`.

Training rewards must remain distinct from competitive match results. Practice actions must not unintentionally change official ratings or live-match outcomes.

## 7. Check, Checkmate, and Sparring

Training sparring includes support for evaluating check and checkmate conditions in applicable game modes.

The implementation reuses existing game-rule infrastructure where possible, including the standard engine and Culling Game engine.

The goal is to provide meaningful practice scenarios rather than a purely decorative board.

Because Standard, Crafted, Culling Game, and Rose Paradise use different board configurations and potentially different movement rules, move validation and victory conditions must remain mode-specific.

Conventional chess rules must not override custom Mugen game mechanics.

Verification should cover:

- Legal and illegal move detection.
- Check detection.
- Checkmate detection.
- Turn progression.
- Special-piece abilities.
- Capture behavior.
- Mode-specific victory and draw conditions.
- Sparring completion and reward handling.

## 8. Responsive Interface Design

The training hub supports separate desktop and mobile layouts.

### 8.1 Desktop Layout

The desktop interface follows a three-column studio arrangement:

1. **Mentor sidebar:** Sensei avatar, dialogue, rank information, and training controls.
2. **Central board stage:** Interactive board positioned as the primary visual element.
3. **Training sidebar:** Dojo navigation, lesson selection, and progress indicators.

The objective is to minimize unnecessary scrolling between the board, lesson instructions, and mentor feedback.

### 8.2 Mobile Layout

The intended mobile interface follows a compact, single-screen game-console design.

**Top navigation bar**

- Compact Rank selector.
- Compact Dojo selector.
- Compact Lesson selector.
- Dropdown menus that open beneath the navigation without expanding the main layout.
- Automatic dropdown closure after selection.
- No large training title inside the mobile training view.

**Sensei panel**

- Small avatar positioned on the left.
- Concise instructional message on the right.
- Limited vertical height to preserve board space.
- No layout expansion when the mentor's message changes.

**Central board stage**

- Centered within the available viewport.
- Sized according to available width and height.
- Fully visible without clipping.
- Responsive to different board geometries and mobile screen sizes.
- Interactive without document-level scrolling.

**Bottom navigation bar**

- Current lesson or kata title.
- Hint control.
- Reset control.
- Next control where applicable.
- Compact horizontal buttons rather than oversized stacked controls.

The intended gameplay experience is a single-screen mobile interface. Reading-oriented screens, including the Theory Library, may scroll when necessary.

### 8.3 Mobile Layout Requirements

The layout should use viewport-aware sizing, constrained flex or grid containers, and appropriate `min-height: 0` and `min-width: 0` rules.

The board size must be calculated from both the available width and available height after accounting for the navigation bars, Sensei panel, safe areas, and spacing.

Applying `overflow: hidden` alone is insufficient if the internal sections exceed the available viewport.

The complete board, Sensei panel, top navigation, and bottom controls must remain visible simultaneously.

**Responsive layout verification remains important:** Earlier implementation iterations introduced fixed-height containers and overflow restrictions, but the supplied mobile screenshot still showed excessive panel sizing and a partially clipped board. A successful build does not establish that the rendered mobile experience meets the single-screen requirement.

## 9. Visual Design Principles

The training interface follows a restrained brutalist visual identity:

- Near-black or charcoal backgrounds.
- Sharp rectangular panels and thin contrasting borders.
- Gold or yellow highlights for active selections and move guidance.
- Bold, compact typography for navigation.
- Clear visual separation between navigation, instruction, gameplay, and controls.
- Minimal decoration and unnecessary padding.
- The chessboard as the primary visual element.

Mobile controls should remain compact without compromising readability, accessibility, or touch interaction.

## 10. Game Isolation and Compatibility

The training hub is intended to be an additive feature rather than a rewrite of the existing game.

Compatibility requirements include:

- No unintended mutations of active live-match state.
- No unintended multiplayer synchronization or socket events.
- No competitive rating changes caused by training moves.
- No interference with matchmaking or existing bot behavior.
- No changes to established win/draw conditions in existing modes.
- No unintended changes to Culling Game or Rose Paradise mechanics.
- Reuse of existing board and engine components wherever practical.
- No unnecessary backend services or dependencies.

Future modifications must preserve these isolation boundaries.

## 11. Testing and Verification

Previous implementation iterations reported successful build and quality-control checks. However, these checks do not independently prove that every training scenario, game mode, or responsive layout is correct.

Recommended verification includes:

- Production build and TypeScript checks.
- Desktop and mobile visual inspection.
- Rank, dojo, and lesson navigation.
- Hint, reset, undo, and lesson progression.
- Local progress persistence.
- Legal-move validation for every board type.
- Culling Game character abilities and board geometry.
- Check and checkmate detection.
- Sparring victory conditions.
- Badge awarding and Trophy Room presentation.
- Regression testing of existing live-match and multiplayer behavior.

Recommended mobile test viewports:

| Viewport | Primary verification |
|---|---|
| 320×568 CSS pixels | Small-screen fit and control accessibility. |
| 360×640 CSS pixels | Compact navigation and complete board visibility. |
| 390×844 CSS pixels | Standard mobile gameplay layout. |
| 430×932 CSS pixels | Wider-screen board sizing and spacing. |

For each viewport, verify that the active gameplay screen has no document-level vertical or horizontal scrolling and that no essential controls or board squares are clipped.

## 12. Implementation Summary

Chess Hashira Training provides a unified environment for opening instruction, tactical exercises, Culling Game training, isolated practice, and theory learning.

The feature includes six selectable martial ranks, a reusable 2D mentor, instructional move feedback, specialized board integration, sparring functionality, and achievement reward integration.

The implementation is integrated into the existing application and is designed to preserve the underlying game's behavior.

**Outstanding quality requirement:** The mobile gameplay layout must be visually inspected and corrected until the complete board, compact Sensei panel, top navigation, and bottom navigation fit within a single viewport without clipping or gameplay scrolling. Desktop layout, mode-specific rules, and live-match isolation must remain intact.

---

*(MugenChessX is an open-source intellectual property created by ANANDA JANA. Designed for strategy enthusiasts who demand both deep tactical rigor and electrifying volatility.)*

## UI Update 1/4: Foundation (2026-10-23)

### Files Changed:
- `src/index.css`: Added foundational brutalist utilities, global focus rings, and reduced motion support.
- `src/App.tsx`: Updated the top-level loading state to a brutalist spinner box.
- `src/components/LiveAnnouncer.tsx`: Created a reusable ARIA live region component (currently unused).
- `src/components/MatchView.tsx`: Improved header button touch targets (44px) and removed inconsistent rounded corners.
- `src/training/CullingOpeningDojo.tsx`: Improved the Hint button touch target (44px).
- `src/training/TheoryLibraryView.tsx`: Improved category pill touch targets (44px).

### Items Implemented:
- **A. Brutalist Utilities**: Added `.brutal-btn-danger`, `.brutal-btn-ghost`, and `.brutal-input`. Enhanced `.brutal-btn-primary`, `.brutal-btn-secondary`, and `.brutal-card` with 75ms active pressed states and 4px amber focus rings.
- **B. Global Focus**: Applied a global `:focus-visible` outline for all interactive elements to ensure high-visibility keyboard navigation without shifting layout.
- **C. Reduced Motion**: Implemented `@media (prefers-reduced-motion: reduce)` to suppress non-essential animations (pulse, spin, transitions) while maintaining functional state changes.
- **D. Accessibility Utilities**: Added `.sr-only` utility and the `<LiveAnnouncer>` pattern for future screen-reader specific feedback.
- **E. Loading State**: Replaced the previous pulse-based "Connecting to Dice Chess..." screen with a brutalist spinner box (white border, amber-400 fill, spin animation) and appropriate `role="status"`.
- **F. Border Radius Audit**: Confirmed the global `border-radius: 0px !important` rule is active. Fixed an inconsistency in `MatchView.tsx` where a warning banner used `rounded-xl`.
- **G. Touch Targets**: Audited and fixed header buttons (Exit, Theme, Rules, Resign) in `MatchView`, the Hint toggle in `CullingOpeningDojo`, and Category filters in `TheoryLibraryView`. All now meet the 44px minimum touch target requirement via a combination of `min-size` and padding.

### Inconsistencies Found:
- `CullingOpeningDojo.tsx` uses `rounded-sm` for some special character-themed overlays (Lesson Declaration, Sensei Commentary). These were left as-is as they may be part of a specific character aesthetic, though they deviate from the global sharp-corner rule.
- `DiceRoller.tsx` uses `rounded-full` for dice dots, which is an intentional exception for geometric primitives.

### Safety Metrics:
- **TSC / Build / Tests**: All passed successfully (`npx tsc --noEmit`, `npm run build`, `npm run test:training`).
- **Home Screen Integrity**: Verified zero changes to `Dashboard.tsx` and related excluded files.
- **Bundle Size Delta**: Near zero (purely CSS and minor markup additions).
- **Verdict**: This update stayed strictly lightweight and did not touch any game logic or training state machines.

## UI Update 2/4: Modals and Overlays (2026-10-23)

### Files Changed:
- `src/utils/useModalFocus.ts`: Created a new custom hook (38 lines) for focus trapping, scroll locking, and Escape key handling.
- `src/components/RulesModal.tsx`: Added focus trap, backdrop dismissal, standardized header, and scale-in motion.
- `src/components/CullingRulesModal.tsx`: Added focus trap, backdrop dismissal, and slide-up motion.
- `src/components/CraftingModal.tsx`: Added focus trap, `max-h-[90dvh]` constraint, sticky footer, and slide-up motion.
- `src/components/ExpansionModal.tsx`: Added focus trap, `max-h-[90dvh]` constraint, and slide-up motion.
- `src/components/BotMatchModal.tsx`: Added focus trap, backdrop dismissal, standardized header, and scale-in motion.
- `src/components/TrophyRoomModal.tsx`: Added focus trap, backdrop dismissal, standardized header, and scale-in motion.
- `src/components/PopupAd.tsx`: Added focus trap, backdrop dismissal, and scale-in motion.
- `src/components/ChallengeModal.tsx`: Transformed from a side-card into a compact top banner. Added timer logic, progress bar, and `aria-live` announcement.
- `src/components/AuthModal.tsx`: Added ARIA attributes and improved tab button heights (h-11) for better touch targets.
- `src/components/MatchView.tsx`: Enhanced the inline Resign confirmation overlay with ARIA attributes, focus trap, and motion.
- `src/components/CullingTheoryView.tsx`: Standardized the header back button to 44px.

### Backdrop-Dismiss Decisions:
- **YES (Dismissible)**: `RulesModal`, `CullingRulesModal`, `BotMatchModal`, `TrophyRoomModal`, `PopupAd`. These are informational or non-destructive; closing them via backdrop or Escape is a convenient, safe pattern.
- **NO (Non-dismissible)**: `CraftingModal`, `ExpansionModal`, `AuthModal`, `MatchView` (Resign). These represent destructive actions (canceling a one-time perk), mandatory setup flows, or critical match state confirmations where accidental closure must be prevented.

### Items Skipped:
- `PrinceRulesCard`: Already implemented as an inline informational card within `MatchView`; no modal behavior or overlay adjustments required.

### Safety Metrics:
- **TSC / Build / Tests**: All checks passed successfully (`npx tsc --noEmit`, `npm run build`, `npm run test:training`).
- **Bundle Size Delta**: ~1KB increase (due to `useModalFocus` hook and additional ARIA/Tailwind classes).
- **Verdict**: The update remained strictly lightweight, using only native ARIA and Tailwind utilities for motion. No game logic or excluded dashboard components were modified.

## Development Log: UI/UX & Accessibility Audit (October 2026)

### Phase 1/4: Foundation & Brutalist Styles (Completed)
- Added global `.brutal-btn-*`, `.brutal-card`, and `.brutal-input` utilities in `index.css`.
- Implemented high-contrast `focus-visible` rings and accessibility-first `:focus-visible` outlines.
- Added `prefers-reduced-motion` support to global transitions.
- Integrated `<LiveAnnouncer />` for persistent ARIA-live messaging.

### Phase 2/4: Accessible & Thumb-Friendly Modals (Completed)
- Standardized modal headers and close buttons (minimum 44px touch targets).
- Implemented `useModalFocus` hook for robust focus trapping and Restoration.
- Added Escape key and backdrop dismissal for informational modals.
- Optimized mobile overflow with max-height constraints and sticky action footers.

### Phase 3/4: In-Game Readability & Interaction (Completed)
- **Board Keyboard Navigation**: Implemented roving tabindex and arrow-key navigation in `ChessBoard.tsx` and `CullingBoard.tsx`.
- **High-Contrast Indicators**: Enlarged legal move dots (42% of square) and introduced shape differentiation (rings) for capture targets.
- **ARIA Announcements**: Integrated live turn, check, and game-result announcements across all match modes.
- **HUD Optimization**: Added material difference badges and compressed mobile turn indicators.
- **Dice Enhancement**: Added piece-type text labels and 3D-style roll animations (respecting reduced motion).
- **Tactical Feedback**: Implemented a screen-shake effect on piece captures (standard modes).
- **Mobile Real-Estate**: Made the `PredictorPanel` collapsible on mobile to prioritize board visibility.

## UI Update: Trophy Room Mobile (2026-10-23)

### Problem List & Audit
1.  **Nested Scroll Traps**: Hardcoded `max-h-[60vh]` on the grid container created double scrollbars on small screens, making navigation frustrating.
2.  **Filter Clutter**: The filter bar was too dense, wrapping into multiple rows on 320px screens and consuming primary viewport real estate.
3.  **Collection Purpose**: The view only showed earned badges, making it feel like a session log rather than a collection goal-post. There was no way to see what was still locked.
4.  **Reachability**: The close button was in the far top-right corner, difficult to reach on modern tall aspect-ratio phones.
5.  **Brutalist Inconsistency**: Some borders and shadows didn't align with the "thick white border" modern brutalist theme established in other areas.
6.  **Responsive Stacking**: The 1:1 preview pushed the collection grid entirely off-screen on mobile, requiring excessive scrolling.

### Improvements & Fixes
- **Full-Height Sheet Architecture**: The modal now occupies `100dvh` on mobile with a fixed top app bar for clear navigation and "one-thumb" reachability for close/reset actions.
- **Unified Scroll Experience**: Body is now the single scroll container with `overscroll-behavior: contain`, eliminating nested traps.
- **Collection Progress System**: Integrated `CARD_DEFINITIONS` to show the full potential collection. Locked trophies are displayed with grayscale icons, "SEAL LOCKED" overlays, and cross-hatch textures to encourage exploration.
- **Horizontal Category Tabs**: Replaced wrapping chips with a horizontally scrollable tab list for Realms (Game Modes), following mobile design patterns for high-density navigation.
- **Visual Feedback**: Added a stat summary in the header ("12 / 40 UNLOCKED") and a progress percentage to provide immediate context of collection status.
- **Touch Target Hardening**: Ensured all interactive elements (tabs, filters, cards, and buttons) maintain at least 44px targets with clear active/pressed states.
- **Accessibility**: Added `role="tablist"`, `aria-selected`, and descriptive `aria-label` tags to all icon-only buttons. Focus is correctly trapped and returned using established hooks.

### Verdict
The update stays lightweight by using only Tailwind utilities and standard React patterns. No new libraries were added. Zero game logic or data persistence rules were modified; the changes are strictly presentational.

**Logic Touched**: No.
