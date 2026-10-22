# MugenChessX: Jujutsu Kaisen Culling Game Mode
## Comprehensive Rulebook, Engine Mechanics Specification, Opening Playbook, and Competitive Balance Critique

---

### Document Overview & Scope
This document serves as the authoritative, definitive reference for the **Culling Game Mode** implemented in **MugenChessX** (`src/types/cullingGame.ts`, `src/game/cullingEngine.ts`, and `src/components/CullingTheoryView.tsx`). It details the structural geometry of the 88-square cross battlefield, the lifecycle of matches, universal combat and immunity laws, and complete technical breakdowns for all 16 playable and summonable pieces. 

Furthermore, this document contains an exhaustive **Competitive Game Design Critique** for every single piece. It identifies why current implementations or unrestricted special abilities risk eroding pure chess-like strategy, and articulates precise mathematical and mechanical balance optimizations to preserve deep tactical mastery.

---

## 1. The Battlefield & 88-Square Cross Geometry

### 1.1 Coordinate Bounding Box & The 88 Playable Cells
The Culling Game board is constructed within an overarching $10 \times 10$ Cartesian grid spanning coordinates $(x, y)$ where both $x$ and $y$ range from $0$ to $9$ inclusive. Unlike a traditional 64-square chessboard ($8 \times 8$), the Culling Game takes place on a cruciform (cross-shaped) battlefield composed of **exactly 88 playable squares** and **12 void cells**.

```
      File Indices (x):
         0   1   2   3   4   5   6   7   8   9
         L   A   B   C   D   E   F   G   H   R
      +---+---+---+---+---+---+---+---+---+---+
    9 | ■ | ■ |B9 |C9 |D9 |E9 |F9 |G9 | ■ | ■ | 9 (Top Arm)
      +---+---+---+---+---+---+---+---+---+---+
    8 | ■ |A8 |B8 |C8 |D8 |E8 |F8 |G8 |H8 | ■ | 8
      +---+---+---+---+---+---+---+---+---+---+
    7 |L7 |A7 |B7 |C7 |D7 |E7 |F7 |G7 |H7 |R7 | 7
      +---+---+---+---+---+---+---+---+---+---+
    6 |L6 |A6 |B6 |C6 |D6 |E6 |F6 |G6 |H6 |R6 | 6
      +---+---+---+---+---+---+---+---+---+---+
    5 |L5 |A5 |B5 |C5 |D5 |E5 |F5 |G5 |H5 |R5 | 5 (Center Core: A1..H8)
      +---+---+---+---+---+---+---+---+---+---+
    4 |L4 |A4 |B4 |C4 |D4 |E4 |F4 |G4 |H4 |R4 | 4
      +---+---+---+---+---+---+---+---+---+---+
    3 |L3 |A3 |B3 |C3 |D3 |E3 |F3 |G3 |H3 |R3 | 3
      +---+---+---+---+---+---+---+---+---+---+
    2 |L2 |A2 |B2 |C2 |D2 |E2 |F2 |G2 |H2 |R2 | 2
      +---+---+---+---+---+---+---+---+---+---+
    1 | ■ |A1 |B1 |C1 |D1 |E1 |F1 |G1 |H1 | ■ | 1
      +---+---+---+---+---+---+---+---+---+---+
    0 | ■ | ■ |B0 |C0 |D0 |E0 |F0 |G0 | ■ | ■ | 0 (Bottom Arm)
      +---+---+---+---+---+---+---+---+---+---+
         L   A   B   C   D   E   F   G   H   R
      (Left)                               (Right)
```

The 88 playable squares are partitioned into five functional zones:
1. **The Central 8x8 Arena (64 squares):** Columns $A$ through $H$ ($x = 1..8$) across Ranks $1$ through $8$ ($y = 1..8$).
2. **The Top Extended Arm (6 squares):** Squares `B9, C9, D9, E9, F9, G9` ($x = 2..7, y = 9$).
3. **The Bottom Extended Arm (6 squares):** Squares `B0, C0, D0, E0, F0, G0` ($x = 2..7, y = 0$).
4. **The Left Extended Wing (6 squares):** Squares `L2, L3, L4, L5, L6, L7` ($x = 0, y = 2..7$).
5. **The Right Extended Wing (6 squares):** Squares `R2, R3, R4, R5, R6, R7` ($x = 9, y = 2..7$).

$$\text{Total Playable Squares} = 64 + 6 + 6 + 6 + 6 = 88$$

### 1.2 The 12 Void Corner Cells
The 12 non-playable void squares are the four $2 \times 2$ corner notches of the $10 \times 10$ bounding box:
- **South-West Void:** $(0,0), (0,1), (1,0)$
- **North-West Void:** $(0,8), (0,9), (1,9)$
- **South-East Void:** $(8,0), (9,0), (9,1)$
- **North-East Void:** $(8,9), (9,8), (9,9)$

*Engine Invariant:* Any piece movement ray that encounters an outer corner void cell terminates immediately. Pieces cannot jump over, step into, or land on void squares. The authoritative boundary function `isValidCullingPos(x, y)` verifies this via a precomputed `Set<string>` in $\mathcal{O}(1)$ time.

### 1.3 Strategic Significance of Board Anatomy
- **The Central Arena ($A1..H8$):** Functions like an expanded classical board where pieces develop, contest key center files ($D, E, F$), and establish pawn structures.
- **The Lateral Wings ($L$ and $R$ files):** Flanking highways that bypass central pawn gridlocks. Highly mobile pieces like Naoya Zenin, Maki Zenin, and Yuji Itadori can slide into these wings to strike deep into opponent back-ranks.
- **The Pocket Arms ($B0..G0$ and $B9..G9$):** Natural defensive redoubts for Kings (Gojo and Sukuna) seeking refuge from central check attacks, as well as secluded staging grounds for pawn promotion attempts.

---

## 2. Universal Turn Laws, Match Lifecycle & Win Conditions

### 2.1 Match States & Time Controls
Matches operate under an authoritative state machine managed by `cullingEngine.ts` and synchronized through WebSocket servers:
- **State: `waiting`:** Room created, awaiting the second combatant.
- **State: `active`:** Match initialized, clocks ticking, moves processed strictly on alternating turns (`white` then `black`).
- **State: `completed`:** Terminal condition reached (Decapitation, Checkmate, Resignation, or Timeout).
- **Time Controls:** Supported modes are **Blitz** (120 seconds per side) and **Rapid** (300 seconds per side) with strict clock decrementing during a player's active turn.

### 2.2 The Turn 1–5 Immunity Shield (Infinity / King of Curses)
In standard chess, aggressive queen or bishop sacrifices can lead to early tactical collapses (e.g., Scholar's Mate). In the Culling Game, both sovereign pieces—**Satoru Gojo** (White King) and **Ryomen Sukuna** (Black King)—possess an absolute barrier for the first 5 turns of the match:
- **Infinity Barrier (Gojo) & King of Curses Shield (Sukuna):** While `match.turnCount <= 5`, neither Gojo nor Sukuna can be captured, checked, or targeted by lethal attack moves.
- **King Safety Computation during Turns 1–5:** `isCullingKingInCheck()` automatically evaluates to `false` if `turnCount <= 5`. This frees both players to deploy their Kings forward aggressively, occupy center squares, and anchor early development without being constrained by check-evasion rules.
- **Turn 6 Inflection Point (Decapitation Phase):** At the precise moment Turn 6 commences, the immunity barriers shatter permanently. From Turn 6 onward, Kings can be checked, fork-attacked, and eliminated.

### 2.3 Win & Loss Conditions
1. **King Decapitation (Primary Win Condition):** Capturing the enemy sovereign piece (`culling_gojo` or `culling_sukuna`) off the board immediately ends the match with a win for the captor.
2. **Tactical Suppression / Checkmate:** If a player's King is placed in check and that player has zero legal moves to escape or block the check, checkmate is declared. Furthermore, if a player has **zero legal moves remaining on their turn** (even if not in direct check), they lose immediately by Complete Tactical Suppression. There are **no stalemate draws** in the Culling Game.
3. **Clock Timeout:** If a player's remaining time reaches zero, the server awards the win to the opponent.
4. **Resignation:** A player may forfeit at any time.

### 2.4 Status Effects & Cooldown Systems
The engine tracks multiple transient states across pieces:
- **`isRestricted` & `restrictedUntilTurn`:** Restricts a piece's maximum movement distance to exactly 1 square (or immobilizes it completely in the case of Uraume's `frost_freeze`). Applied by Nanami's 7:3 Ratio proximity, Uraume's Frost Calm, or Sukuna's Malevolent Shrine domain.
- **`cooldown`:** Turn-based recovery timer. Used by Naoya Zenin after high-speed sprints and Uraume after casting Frost Calm.
- **`specialUsed`:** Boolean toggle ensuring once-per-game supernatural abilities (teleports, heavy artillery rushes, domain activations, and receipt contracts) cannot be spammed.

---

## 3. Comprehensive Piece Compendium (All 16 Units)

Below is the definitive technical breakdown for every piece in the Culling Game, detailing its initial coordinates, material value, movement geometry, leaping rules, capture conditions, immunities, and tactical applications.

---

### 3.1 Satoru Gojo (White Sovereign / King-Equivalent)
- **Faction:** White (Protagonists)
- **Initial Square:** `H1` ($x=8, y=1$)
- **Material Value:** 99.0 (Sovereign Unit)
- **Base Mobility:** Radial step up to **2 squares** in all 8 directions (orthogonal and diagonal).
- **Leaping Capability:** Standard 2-square movement **cannot leap** over intervening pieces along a ray. If a piece stands 1 square away, Gojo cannot slide past it in that direction.
- **Obstacle Avoidance vs. Capture:**
  - Can capture enemy pieces on empty or occupied squares within 2 steps along unblocked rays.
  - Cannot land on friendly pieces.
- **Special Passives & Abilities:**
  - **Infinity (Passive):** Absolute immunity to capture and check during Turns 1–5.
  - **Limitless Teleport (Active, Once Per Game):** Instantly translocates to **any unoccupied square** within a Chebyshev distance of 3 squares (a $7 \times 7$ bounding area centered on Gojo). Bypasses all intervening pieces, barriers, and enemy zones of control. Cannot capture upon landing.
- **Immunity Laws:** Cannot be captured on Turns 1–5. Vulnerable to Nanami's 7:3 Ratio (reduced to 1-square movement if an enemy Nanami is adjacent).

---

### 3.2 Ryomen Sukuna (Black Sovereign / King-Equivalent)
- **Faction:** Black (Antagonists)
- **Initial Square:** `A8` ($x=1, y=8$)
- **Material Value:** 99.0 (Sovereign Unit)
- **Base Mobility:** Radial step up to **2 squares** in all 8 directions (orthogonal and diagonal).
- **Leaping Capability:** Standard movement **cannot leap** over intervening units along rays.
- **Obstacle Avoidance vs. Capture:**
  - Can capture any legal enemy piece on an unblocked ray within 2 squares.
  - Blocked by friendly pieces.
- **Special Passives & Abilities:**
  - **King of Curses (Passive):** Absolute capture and check immunity during Turns 1–5.
  - **Dismantle Rush (Active, Once Per Game):** In engine implementation (`cullingEngine.ts`), Sukuna possesses a symmetrical high-speed translocation up to 3 squares to any vacant square, bypassing all intermediate obstacles.
  - **Malevolent Shrine (Domain Action):** In alternate tactical modes, Sukuna can unleash his domain to restrict all enemy pieces within a Chebyshev radius of 2 squares for 2 turns.
- **Immunity Laws:** Cannot be captured on Turns 1–5. Subject to standard capture and check rules starting Turn 6.

---

### 3.3 Yuji Itadori (White Queen-Equivalent)
- **Faction:** White (Protagonists)
- **Initial Square:** `G1` ($x=7, y=1$)
- **Material Value:** 9.5 (Major Piece)
- **Base Mobility:** Slides along all 8 orthogonal and diagonal rays (Rook + Bishop geometry) up to the edge of the board.
- **Leaping Capability (Divergent Fist Leap):**
  - **Unique Leaping Rule:** Yuji can **leap over at most one blocking piece** along any ray of movement!
  - If a ray has 1 piece (ally or enemy) on it, Yuji can jump cleanly over it and continue sliding or land/capture on any subsequent square along that ray until encountering a second blocking piece.
  - If two pieces block the ray, Yuji cannot jump the second piece.
- **Obstacle Avoidance vs. Capture:**
  - Yuji can avoid an enemy or ally by hopping over them into free territory behind them.
  - Yuji can land directly on an enemy piece behind an obstacle to capture it.
  - If the first piece on the ray is an enemy, Yuji can either capture that first enemy directly OR jump over it to capture a deeper piece/land on an open square.
- **Special Restrictions:** If standing adjacent to an enemy Nanami, Yuji's maximum step distance drops from infinite sliding to a mere 1 square.

---

### 3.4 Kenjaku (Black Queen-Equivalent)
- **Faction:** Black (Antagonists)
- **Initial Square:** `B8` ($x=2, y=8$)
- **Material Value:** 9.5 (Major Piece)
- **Base Mobility:** Slides along all 8 orthogonal and diagonal directions across any distance.
- **Leaping Capability (Cursed Spirit Leap):**
  - Symmetrical to Yuji: can **leap over exactly one blocking piece** along any ray.
  - Retains full ray extension after the single leap until blocked by a second entity.
- **Obstacle Avoidance vs. Capture:**
  - Can hop over friendly frontline pawns on Rank 7 to deliver immediate long-range strikes against White's advancing pieces.
  - Can choose between taking the blocking target or vaulting past it.
- **Special Active Ability (Curse Manipulation Swap):**
  - Once per match, Kenjaku can swap board positions with any friendly unit (except King Sukuna) within a 3-square radius, completely breaking enemy pin lines.

---

### 3.5 Kokichi Muta / Mechamaru (White Armored Rusher)
- **Faction:** White (Protagonists)
- **Initial Square:** `F1` ($x=6, y=1$)
- **Material Value:** 5.5 (Heavy Support Piece)
- **Base Mobility:** Slides up to **4 squares** along all 8 orthogonal and diagonal rays. All moves and captures are strictly physical.
- **Leaping Capability:**
  - Standard 4-square slide **cannot leap** over pieces.
  - **Ultra Cannon Overdrive Rush (Active, Once Per Game):** Can leap over **exactly one obstacle** along any straight vector up to 3 squares to land or capture physically.
- **Obstacle Avoidance vs. Capture:**
  - Can avoid a contested front line by utilizing Overdrive Rush to bypass an enemy pawn and smash a piece sheltered behind it.
  - In normal movement, friendly or enemy pieces terminate the ray.
- **Immunity Laws:** Subject to standard capture rules. Cannot capture Nanami if promoted to pawn, but as a heavy piece, Mechamaru can capture Nanami without restriction.

---

### 3.6 Yorozu (Black Heavy Support)
- **Faction:** Black (Antagonists)
- **Initial Square:** `D8` ($x=4, y=8$)
- **Material Value:** 5.5 (Heavy Support Piece)
- **Base Mobility:** Slides up to **4 squares** along all 8 orthogonal and diagonal rays (symmetrical counterpart to Mechamaru).
- **Leaping Capability:**
  - Normal movement is blocked by the first piece encountered.
  - **True Sphere Rush (Active, Once Per Game):** Can leap over **exactly one obstacle** along any straight line up to 3 squares to deliver a physical capture or reposition.
- **Tactical Utility:** Anchors Black's central defense, covers the D-file and E-file against White pawn advances, and can break open congested clusters using True Sphere Rush.

---

### 3.7 Kento Nanami (White Heavy Orthogonal Anchor)
- **Faction:** White (Protagonists)
- **Initial Square:** `D1` ($x=4, y=1$)
- **Material Value:** 6.0 (Major Tactical Piece)
- **Base Mobility:** Infinite orthogonal sliding along ranks and files (Rook-equivalent).
- **Leaping Capability:** **Zero leap capability.** Ray ends upon reaching any piece.
- **Absolute Passive Immunities (7:3 Ratio Technique):**
  - **Pawn & Swarm Capture Immunity:** Nanami **CANNOT be captured by Culling Pawns or Cursed Roach Swarms!** If an enemy pawn or swarm attacks Nanami, the engine rejects the move.
  - **Proximity Paralyzing Field:** Any enemy unit standing in the 8 adjacent squares surrounding Nanami ($3 \times 3$ box) has its maximum movement capped at **exactly 1 square**! Even Queens (Kenjaku) and speedsters (Naoya) are crippled into slow crawlers when standing next to Nanami.
- **Capture Vulnerability:** Nanami is fully vulnerable to captures by major pieces: Kings, Queens, Maki, Panda, Mechamaru, Yorozu, Reggie, and Uraume.

---

### 3.8 Panda (White Resilient Support & Core Shifter)
- **Faction:** White (Protagonists)
- **Initial Square:** `E1` ($x=5, y=1$)
- **Material Value:** 4.5
- **Base Mobility (Panda Core):** Standard **Knight L-shape leap** (offsets: $(\pm 1, \pm 2)$ and $(\pm 2, \pm 1)$). Leaps over all intervening units without restriction.
- **Awakened Mobility (Gorilla Core):**
  - Retains all Knight L-shape leaps.
  - Gains the ability to **step 1 square in all 8 directions** (orthogonal and diagonal).
- **Special Passive (Core Switch - Two Lives):**
  - When an enemy piece attempts to capture Panda in his base form, **the capture is completely REJECTED!**
  - The attacking enemy piece does not advance; Panda sheds his outer body and transforms into **Gorilla Core** (`pandaCore = 'gorilla'`).
  - Only a **second, subsequent capture attempt** can remove Gorilla Panda from the board.
- **Strategic Impact:** Acts as an unkillable decoy that absorbs enemy tempo and punishes aggressive Queen incursions.

---

### 3.9 Reggie Star (Black Tactical Support & Shield Bestower)
- **Faction:** Black (Antagonists)
- **Initial Square:** `E8` ($x=5, y=8$)
- **Material Value:** 4.0
- **Base Mobility:** Radial step up to **2 squares** in all 8 directions (orthogonal and diagonal). Blocked by obstacles (cannot leap).
- **Special Active Ability (Receipt Contract, Once Per Game):**
  - Burns a contract to bestow an **indestructible 1-hit shield** (`contractShield = true`) upon himself OR any friendly adjacent piece.
  - **Shield Absorption Mechanic:** When an enemy attacks a shielded piece, **the attack fails to remove the piece.** The shield shatters, absorbing the blow, and the piece survives intact.
- **Tactical Pairing:** Bestowing the Receipt Shield upon Ryomen Sukuna or Kenjaku immediately on Turn 6 grants them an extra layer of invulnerability, allowing them to trade pieces with zero risk.

---

### 3.10 Maki Zenin (White Agile Leaping Infiltrator)
- **Faction:** White (Protagonists)
- **Initial Square:** `C1` ($x=3, y=1$)
- **Material Value:** 4.0
- **Base Mobility:**
  - Diagonal slides up to **2 squares** (Bishop-like agility). Blocked by pieces on diagonal lines.
  - **Orthogonal 2-Square Leaps:** Moves exactly 2 squares horizontally or vertically, **vaulting cleanly over any intervening piece!**
- **Obstacle Avoidance vs. Capture:**
  - Can jump over friendly pawns on Rank 2 to land directly on Rank 3 or 4.
  - Can leap over enemy blockers to capture an enemy unit stationed exactly 2 squares away along a rank or file.
  - Cannot land on friendly pieces.
- **Special Active Ability (Heavenly Restriction Rush):** In extended variants, allows rapid tactical repositioning or immediate secondary strikes.

---

### 3.11 Kinji Hakari (White Jackpot Momentum Specialist)
- **Faction:** White (Protagonists)
- **Initial Square:** `B1` ($x=2, y=1$)
- **Material Value:** 4.5
- **Base Mobility:** Orthogonal slide up to **3 squares** along ranks and files. Blocked by obstacles (cannot leap).
- **Special Passive (Idle Death Gamble / Jackpot):**
  - Upon **any successful piece capture**, Hakari hits the **Jackpot!**
  - The match engine immediately awards the White player an **extra bonus turn** (`bonusTurn = 'hakari'`). The active turn does not pass to Black; White can immediately make a second consecutive move.
  - *Non-recursive safeguard:* Jackpot cannot trigger multiple times in a single turn chain.
- **Tactical Combo:** Hakari captures an enemy forward pawn, triggers Jackpot, and then White uses Yuji or Gojo to strike deeply into the exposed enemy line before Black can react.

---

### 3.12 Uraume (Black Control & Freeze Specialist)
- **Faction:** Black (Antagonists)
- **Initial Square:** `C8` ($x=3, y=8$)
- **Material Value:** 5.0
- **Base Mobility:**
  - Full diagonal sliding (Bishop geometry) across any unblocked distance.
  - Plus **1-square orthogonal step** in all 4 cardinal directions.
- **Special Active Ability (Frost Calm Freeze):**
  - Targets any square within line of sight up to range 2.
  - Unleashes an icy burst that **completely immobilizes all enemy units** in a $3 \times 3$ sector centered on the target square for **1 full turn** (`restrictedUntilTurn = turnCount + 2`).
  - Immobilized units cannot move, capture, or evade.
  - **Cooldown:** 3 turns before Frost Calm can be reactivated.

---

### 3.13 Naoya Zenin (Black High-Speed Sprint Rusher)
- **Faction:** Black (Antagonists)
- **Initial Square:** `F8` ($x=6, y=8$)
- **Material Value:** 4.5
- **Base Mobility (Projection Sorcery):** High-speed straight sprint up to **4 squares** in all 8 directions (orthogonal and diagonal).
- **Obstacle Limitations:** **Cannot leap.** Any piece (ally or enemy) stops the sprint ray immediately.
- **Status Penalty (Subsonic Cooldown):**
  - If Naoya performs a sprint of **3 or 4 squares**, the engine applies a **1-turn cooldown** (`cooldown = 1`).
  - On Black's following turn, Naoya's movement is capped at **exactly 1 square**.
  - Moves of 1 or 2 squares do **not** trigger the cooldown penalty!
- **Tactical Strategy:** Stagger maneuvers: advance 2 squares into a staging square without cooldown, then execute a 4-square sprint to execute a lethal strike.

---

### 3.14 Kurourushi (Black Special Support & Parthenogenesis)
- **Faction:** Black (Antagonists)
- **Initial Square:** `G8` ($x=7, y=8$)
- **Material Value:** 4.0
- **Base Mobility:**
  - **Omnidirectional 2-Square Leaps:** Leaps exactly 2 squares in any orthogonal or diagonal direction (offsets: $(\pm 2, 0), (0, \pm 2), (\pm 2, \pm 2)$). Leaps over all intervening units.
  - Plus **1-square diagonal step** in all 4 diagonal directions.
- **Special Passive (Parthenogenesis Swarm Spawn):**
  - Upon **any successful capture** made by Kurourushi, a **Cursed Roach Swarm** (`culling_swarm`) is automatically spawned on an adjacent empty square!
  - Maximum 1 active swarm on the board at any time.

---

### 3.15 Culling Pawn (White & Black Frontline Infantry)
- **Faction:** White (placed on `B2..G2`) and Black (placed on `B7..G7`).
- **Initial Layout:** 6 pawns per side covering the central files $B, C, D, E, F, G$.
- **Material Value:** 1.0
- **Base Mobility:**
  - Steps **1 square forward** (White moves $+y$, Black moves $-y$) into an unoccupied square.
  - Captures **1 square diagonally forward**.
  - No initial 2-square pawn double-step; no en passant.
- **Attack Restriction:** Pawns **cannot capture Kento Nanami** due to his 7:3 Ratio passive.
- **Promotion Rule:** When a White pawn reaches Ranks 8 or 9 (the opponent's back rank and top arm), it automatically promotes into a **Kento Nanami** (`culling_nanami`). When a Black pawn reaches Ranks 1 or 0, it automatically promotes into a **Naoya Zenin** (`culling_naoya`).

---

### 3.16 Cursed Roach Swarm (Spawned Black Unit)
- **Faction:** Black (spawned via Kurourushi's Parthenogenesis).
- **Material Value:** 0.75
- **Base Mobility:** Steps **1 square in all 8 directions** (orthogonal and diagonal).
- **Attack Restrictions:** Cannot capture Kento Nanami.
- **Tactical Purpose:** A low-cost screening unit designed to block enemy sliding rays, contest wing entrances, and harass high-value targets.

---

## 4. Strategic Playbook & Opening Theory

### 4.1 Phase 1: The Opening (Turns 1–5) — Sovereigns Unchained
Because Gojo and Sukuna are immune to capture and check during the first 5 turns, standard chess opening conservatism is inverted:

```
               [Turn 1-5 Opening Dynamics]
      White (Protagonists)           Black (Antagonists)
  1. e2-e3 / d2-d3 (Pawn Push)   1. e7-e6 / d7-d6 (Pawn Push)
  2. Gojo: H1 -> F3 (Centralize) 2. Sukuna: A8 -> C6 (Centralize)
  3. Maki: C1 -> C3 (Vault)      3. Naoya: F8 -> F6 (Sprint 2)
  4. Mechamaru -> D3 (Battery)   4. Yorozu -> E6 (Battery)
  5. Nanami -> D2 (Anchor)       5. Reggie -> D7 (Prep Shield)
```

1. **Central King Forward March:** Both players should use Turn 1–5 immunity to march Gojo and Sukuna into the central D/E files. An advanced King exerts a 2-square radial zone of control that prevents enemy minor pieces from comfortably establishing forward outposts.
2. **Pawn Clearance:** Advance the $D$ and $E$ pawns immediately. This clears diagonal sightlines for Mechamaru and Maki on White's side, and Yorozu and Uraume on Black's side.
3. **Flank Preparation:** Station Hakari on the B-file and Kurourushi on the G-file to contest the lateral entrances to the $L$ and $R$ wings.

### 4.2 Phase 2: The Midgame (Turns 6–15) — Mortality & Supernatural Combos
At Turn 6, the game transitions from territorial maneuvering to lethal execution:

```
[The Turn 6 Inflection Point]
- Sovereigns become mortal.
- White plays: Yuji Divergent Fist Leap over pawn wall to check Sukuna.
- Black counters: Reggie Star burns Receipt Contract on Sukuna (absorbs 1 lethal hit).
- White responds: Nanami steps to D6, adjacent to Kenjaku (cripples Kenjaku to 1-square movement).
```

1. **The Contract Shield Fortress:** Black's highest percentage Turn 6 play is having Reggie Star bestow the Receipt Shield on Sukuna. This prevents sudden checkmate ambushes from Mechamaru or Yuji.
2. **The Nanami Paralyzer:** White should advance Nanami directly into adjacent contact with Black's Queen (Kenjaku). Because Nanami cannot be taken by pawns, Black must commit a major piece to remove him, while Kenjaku is rendered immobile.
3. **Hakari Double-Turn Ambush:** White seeks opportunities where Hakari can capture an undefended Black pawn on $B5$ or $C5$, immediately triggering Jackpot to execute a devastating secondary strike against Sukuna or Yorozu.

### 4.3 Phase 3: The Endgame — Arm Infiltration & Sovereign Duels
When major pieces are traded down:
1. **The Deep Arm Promotion Corridor:** The peripheral arms ($B0..G0$ and $B9..G9$) often remain completely unguarded. Advancing a pawn through these side pockets guarantees promotion into Nanami (White) or Naoya (Black), completely reversing endgame material deficits.
2. **Emergency Escape Reserves:** Gojo's **Limitless Teleport** and Sukuna's **Dismantle Rush** must be preserved until the endgame. Having an emergency 3-square phase shift that ignores all enemy pieces renders conventional mating nets ineffective unless the teleport has already been exhausted.

---

## 5. Game Design Critique & Balance Optimization Analysis

While the Culling Game provides exhilarating asymmetric flavor, several abilities introduce degenerate mechanics that disrupt pure strategic chess depth. Below is a rigorous design critique and mathematical balance proposal for **all 16 pieces**.

---

### 5.1 Satoru Gojo (White Sovereign)
- **Current Balance Problem:** 
  The combination of **5 turns of total immunity** followed by an **unconditional 3-square teleport** creates an escape button with near-zero strategic counterplay. If White plays recklessly during turns 1–5, they are shielded; if caught in a complex mating net on turn 10, they can simply teleport to safety without requiring tactical calculation.
- **Degenerate Meta Risk:** White players push Gojo deep into enemy territory without developing defenders, knowing they have a get-out-of-jail-free card.
- **Proposed Optimization:**
  1. *Reduce Teleport Range from 3 to 2 squares.*
  2. *Require Line of Sight or Staging:* Gojo cannot teleport if his current square is under double-attack (representing Cursed Energy disruption).
  3. *Post-Teleport Exhaustion:* Upon teleporting, Gojo's movement is capped at 1 square on his subsequent turn.

---

### 5.2 Ryomen Sukuna (Black Sovereign)
- **Current Balance Problem:** 
  Identical sovereign escape potential to Gojo, but exacerbated when paired with Reggie Star's **Receipt Contract Shield**. A shielded, teleport-capable King creates an almost insurmountable defensive bastion that frustrates tactical attacking play.
- **Degenerate Meta Risk:** Black turtling on square $B9$ behind a shielded King while launching unanswerable ranged strikes with Yorozu.
- **Proposed Optimization:**
  1. *Mutual Exclusion:* Sukuna cannot receive Reggie's Contract Shield if his Dismantle Rush is still available; using one exhausts the other.
  2. *Shrine Warmup:* Malevolent Shrine should require a 1-turn channel (telegraphed area of effect) rather than an instant trigger, giving White a turn to evacuate the radius.

---

### 5.3 Yuji Itadori (White Queen)
- **Current Balance Problem:** 
  The **Divergent Fist Leap** allows a Queen—already the most powerful piece on the board—to leap over an intervening obstacle. In traditional chess, pawns create defensive blockades. When a Queen can leap over friendly or enemy pawns, traditional king shelter structures are rendered obsolete, leading to unavoidable forks.
- **Degenerate Meta Risk:** Yuji hopping over his own pawns on move 6 to pin or capture Black's heavy pieces before Black can untangle their back rank.
- **Proposed Optimization:**
  1. *Directional Leap Restriction:* Yuji can only leap over obstacles along **orthogonal rays** (Rook lines) or **diagonal rays** (Bishop lines), but not both. Restricting leaps to orthogonal paths preserves the integrity of diagonal pawn chains.
  2. *Leap Velocity Cost:* If Yuji leaps over a piece, his maximum movement on that turn is capped at 3 squares beyond the jumped unit.

---

### 5.4 Kenjaku (Black Queen)
- **Current Balance Problem:** 
  The **Curse Manipulation Swap** allows Kenjaku to instantly swap with any friendly piece within range 3. This enables consequence-free Queen raids: Kenjaku dives deep, captures a piece, and swaps with a distant pawn on the next turn, escaping all reprisal.
- **Degenerate Meta Risk:** Hit-and-run tactics that violate the fundamental chess principle of piece commitment.
- **Proposed Optimization:**
  1. *Swap Parity:* Swapping with an ally must cost Black's entire turn, and the piece swapped with Kenjaku must be of equal or greater material value (e.g., Yorozu or Uraume, not a 1-point pawn).
  2. *Telegraph Delay:* The swap must be declared at the end of the previous turn, giving White an opportunity to punish Kenjaku's position.

---

### 5.5 Kokichi Muta / Mechamaru (White Armored Rusher)
- **Current Balance Problem:** 
  The **Ultra Cannon Overdrive Rush** provides a physical leap capture up to 3 squares away in 8 directions. When combined with White's initiative, Mechamaru can threaten sovereign pieces through pawn walls without prior piece setup.
- **Degenerate Meta Risk:** Sudden tactical decapitations on Turn 6 where Black's King is targeted through an intact pawn barrier.
- **Proposed Optimization:**
  1. *Line-of-Sight Prerequisite:* Overdrive Rush should require an empty square behind the jumped piece (vaulting over, rather than landing blindly).
  2. *Cannot Target Kings:* Explicitly ban Overdrive Rush from targeting Sovereign pieces directly; it should function as an anti-support weapon.

---

### 5.6 Yorozu (Black Heavy Support)
- **Current Balance Problem:** 
  Mirror counterpart to Mechamaru. True Sphere Rush introduces symmetrical burst threats that bypass Black's need to dismantle White's pawn structures.
- **Degenerate Meta Risk:** Redundant burst capture meta where games are decided by whoever clicks their 3-square leap rush first.
- **Proposed Optimization:**
  1. *Construction Cost:* True Sphere Rush requires Yorozu to remain stationary for 1 turn beforehand to "construct" the liquid metal weapon.

---

### 5.7 Kento Nanami (White Heavy Orthogonal Anchor)
- **Current Balance Problem:** 
  **Total Pawn and Swarm Immunity** fundamentally breaks core endgame principles. In chess, pawn majorities and pawn endgames are the bedrock of strategic victory. When Nanami cannot be captured by pawns, he can sit in the center of enemy pawn chains indefinitely, blocking advances and eating pawns with impunity.
- **Degenerate Meta Risk:** Nanami marching down file $D$, ignoring Black's pawn defense entirely, and forcing Black to surrender a minor or major piece to remove him.
- **Proposed Optimization:**
  1. *Replace Total Immunity with Damage Resistance:* A single pawn cannot capture Nanami, but **two connected pawns attacking Nanami simultaneously** can capture him! This preserves the value of pawn structures.
  2. *Proximity Field Duration:* His 7:3 Ratio restriction on adjacent enemies should last only 1 turn per piece, requiring Nanami to continually reposition.

---

### 5.8 Panda (White Resilient Support)
- **Current Balance Problem:** 
  **Core Switch (Two Lives)** forces the opponent to waste two distinct turns attacking the exact same square. In tempo-sensitive chess, forcing an opponent to waste a full turn on a failed capture is a massive swing (+2 tempo) that cannot be countered.
- **Degenerate Meta Risk:** Placing Panda as an immovable shield in front of Gojo, completely shutting down Black's central attack vectors.
- **Proposed Optimization:**
  1. *Knockback on Shell Break:* When Panda's outer shell is destroyed, he is knocked back 1 square away from the attacker. If the square behind him is occupied or void, he suffers instant elimination.
  2. *Revenge Window:* After triggering Gorilla Core, Panda cannot capture major pieces on his immediate next move.

---

### 5.9 Reggie Star (Black Tactical Support)
- **Current Balance Problem:** 
  **Receipt Contract Shield** bestows an absolute 1-hit invulnerability shield on any adjacent ally, most notably Sukuna or Kenjaku. An invulnerable Queen can deliver check with total immunity because the defending King cannot capture her.
- **Degenerate Meta Risk:** Shielding Kenjaku, placing him on square $E2$ checking Gojo, where Gojo cannot capture him due to the shield.
- **Proposed Optimization:**
  1. *Prohibit Shielding Sovereign Pieces:* The contract can only shield minor support units (Pawn, Naoya, Uraume), never Sukuna or Kenjaku.
  2. *Shield Expiration:* The shield must expire automatically after 2 turns if not struck, preventing pre-emptive permanent buffs.

---

### 5.10 Maki Zenin (White Agile Leaping Infiltrator)
- **Current Balance Problem:** 
  Maki's 2-square orthogonal leap allows her to bypass congested pawn chains and fork pieces on ranks 3 and 4 early in the match.
- **Degenerate Meta Risk:** Overwhelming early pressure on Black's pawn structure while Black's heavier pieces are still undeveloped.
- **Proposed Optimization:**
  1. *Orthogonal Leap requires unblocked landing:* Ensure Maki cannot capture on an orthogonal leap if she jumped over an enemy piece—leaps over enemies should be evasive only; leaps over allies can capture.

---

### 5.11 Kinji Hakari (White Jackpot Momentum Specialist)
- **Current Balance Problem:** 
  **Idle Death Gamble (Immediate Bonus Turn upon Capture)** violates the most sacred rule of chess: alternating turns. In high-level play, a consecutive turn enables an unstoppable two-step combo (Capture Pawn $\rightarrow$ Capture King), creating unpreventable tactical losses.
- **Degenerate Meta Risk:** Hakari sacrificing himself or trading down to get a free King capture in the bonus turn.
- **Proposed Optimization:**
  1. *Bonus Turn Restrictions:* During the Jackpot bonus turn, White **CANNOT capture any enemy piece** and **CANNOT check the enemy King**. The bonus turn must be purely positional (retreat or defensive consolidation).
  2. *Capture Threshold:* Jackpot only triggers when capturing pieces of material value $\ge 4.0$, preventing cheap pawn-farming combos.

---

### 5.12 Uraume (Black Control & Freeze Specialist)
- **Current Balance Problem:** 
  **Frost Calm (3x3 Area Freeze)** completely immobilizes up to 9 squares for 1 full turn. Freezing an opponent's King and its defending pawns simultaneously removes all tactical counterplay, allowing Black to position pieces for an unblockable follow-up checkmate.
- **Degenerate Meta Risk:** Freezing Gojo on Turn 6 and marching Sukuna or Naoya in for an unanswerable decapitation.
- **Proposed Optimization:**
  1. *Target Cap:* Frost Calm can freeze at most **ONE single piece**, chosen by the player, rather than an entire $3 \times 3$ area.
  2. *Sovereign Immunity:* King pieces (Gojo and Sukuna) cannot be frozen by Frost Calm.
  3. *Increased Cooldown:* Increase cooldown from 3 turns to 5 turns.

---

### 5.13 Naoya Zenin (Black High-Speed Sprint Rusher)
- **Current Balance Problem:** 
  A 4-square omnidirectional sprint allows Naoya to cover almost half the playable board in a single move. While the subsonic cooldown limits him on the following turn, an initial 4-square capture often decides the game before the cooldown matters.
- **Degenerate Meta Risk:** Long-range sniping of White's minor support pieces from across the board on open files.
- **Proposed Optimization:**
  1. *Sprint Range Scaling:* Cap base sprint at 3 squares. A 4-square sprint should require spending a turn "accelerating" in a straight vector.
  2. *Vulnerability on Cooldown:* While cooling down (`cooldown > 0`), any piece (including pawns) capturing Naoya awards +1 bonus tempo.

---

### 5.14 Kurourushi (Black Special Support & Swarm Spawner)
- **Current Balance Problem:** 
  Free piece generation (**Parthenogenesis**) shifts material parity in an engine without board piece limits. Even a 0.75-value swarm provides a free body to block check rays and absorb attacks.
- **Degenerate Meta Risk:** Spamming swarm blockers in front of Black's King to construct an impenetrable physical barricade.
- **Proposed Optimization:**
  1. *Spawn Cost:* Spawning a swarm requires sacrificing 1 point of match clock time (-15 seconds).
  2. *Swarm Decay:* Spawned roach swarms dissolve automatically after 3 turns if they do not make a move or capture.

---

### 5.15 Culling Pawn (White & Black)
- **Current Balance Problem:** 
  Promoting into a **Kento Nanami** (for White) or **Naoya Zenin** (for Black) creates an asymmetric power spike. Nanami's pawn immunity makes a promoted White pawn vastly superior to a promoted Black pawn in pawn-heavy endgames.
- **Degenerate Meta Risk:** White prioritizing pawn promotion above all else because a promoted Nanami can never be challenged by Black's remaining pawns.
- **Proposed Optimization:**
  1. *Symmetrical Promotion Roster:* Both players should be allowed to choose their promotion piece from any captured friendly unit (standard chess promotion rules).

---

### 5.16 Cursed Roach Swarm (Spawned Unit)
- **Current Balance Problem:** 
  An 8-directional 1-step unit that clutters narrow wing choke points ($L2..L7$ and $R2..R7$), slowing down gameplay and forcing unnecessary calculations on blitz time controls.
- **Proposed Optimization:**
  1. *Fragile Entity:* Any attack on a Roach Swarm captures it and allows the attacker to step forward an additional square, turning swarms into stepping stones rather than permanent roadblocks.

---

## 6. Technical Constants & Engine Reference Table

For engine developers and tactical theorists, the table below consolidates all authoritative parameters from `cullingEngine.ts` and `cullingGame.ts`:

| Piece Type | Name | Faction | Initial Sq | Range / Movement | Leap Capability | Special Active / Passive |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| `culling_gojo` | Satoru Gojo | White | `H1` | 2 Radial (All 8 dirs) | None (Standard) | Infinity (Turn 1–5 Immunity); Teleport (3 sq radius) |
| `culling_sukuna` | Ryomen Sukuna | Black | `A8` | 2 Radial (All 8 dirs) | None (Standard) | King of Curses (Turn 1–5 Immunity); Dismantle Rush |
| `culling_yuji` | Yuji Itadori | White | `G1` | Infinite Rays (Queen) | Leaps over $\le 1$ piece | Divergent Fist Leap (Retains slide after jump) |
| `culling_kenjaku` | Kenjaku | Black | `B8` | Infinite Rays (Queen) | Leaps over $\le 1$ piece | Cursed Spirit Leap; Swap ally within range 3 |
| `culling_mechamaru`| Mechamaru | White | `F1` | 4 Steps (All 8 dirs) | Overdrive: 1 leap | Armored Chassis; Ultra Cannon Overdrive (Range 3) |
| `culling_yorozu` | Yorozu | Black | `D8` | 4 Steps (All 8 dirs) | True Sphere: 1 leap | True Sphere Rush (Physical jump strike range 3) |
| `culling_nanami` | Kento Nanami | White | `D1` | Infinite Orthogonal | None | 7:3 Ratio: Pawn/Swarm Immune; Cripples adjacent units |
| `culling_panda` | Panda | White | `E1` | Knight L-Shape | Full Knight Leap | Core Switch: Rejects 1st capture $\rightarrow$ Gorilla Core |
| `culling_reggie` | Reggie Star | Black | `E8` | 2 Radial (All 8 dirs) | None | Receipt Contract: Bestows 1-hit indestructible shield |
| `culling_maki` | Maki Zenin | White | `C1` | 2 Diag + 2 Ortho Leap| Orthogonal Leap (2 sq)| Heavenly Restriction: Vaults obstacles orthogonally |
| `culling_hakari` | Kinji Hakari | White | `B1` | 3 Orthogonal Steps | None | Idle Death Gamble: Extra consecutive turn on capture |
| `culling_uraume` | Uraume | Black | `C8` | Diag Slide + 1 Ortho | None | Frost Calm: Freezes $3 \times 3$ area for 1 turn (3t CD) |
| `culling_naoya` | Naoya Zenin | Black | `F8` | 4 Straight Steps | None | Projection Sorcery: 4-sq sprint (1t CD if $\ge 3$ sq) |
| `culling_kurourushi`| Kurourushi | Black | `G8` | 2-sq Radial Leap | Full Radial Leap | Parthenogenesis: Spawns Cursed Swarm upon capture |
| `culling_pawn` | Culling Pawn | Both | Ranks 2/7| 1 Forward (Diag Cap) | None | Promotes to Nanami (White) or Naoya (Black) |
| `culling_swarm` | Roach Swarm | Black | Dynamic | 1 Step (All 8 dirs) | None | Screening blocker; immune to Nanami captures |

---

## 7. Summary & Implementation Ethics

The Culling Game mode in MugenChessX redefines classical chess by infusing the brutal, high-stakes tactical philosophy of Gege Akutami's Jujutsu Kaisen into a rigorous, server-authoritative rules engine. Every line, jump, freeze, and strike is mathematically verified against the 88-square cruciform coordinate field. 

By understanding the exact movement geometry, respecting the Turn 1–5 Sovereign Immunity shield, exploiting lateral wing flanking routes, and preparing for the lethal Turn 6 Decapitation Phase, players can transcend basic pawn-pushing and master the deepest, most thrilling strategic battlefield in modern chess variants.
