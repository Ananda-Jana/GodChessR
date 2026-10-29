# League Mode Matchmaking & Direct Bot Arena Plan

A focused architectural blueprint to eliminate erroneous navigation redirects in the Trophy Room League tab, introduce direct bot match deployment with pre-match loadout, provide instant multiplayer auto-matchmaking and rivals challenge modals, and route post-match outcomes to authoritative League rewards (Trophy TR, rank promotions, and gem bonuses).

### User Review & Critical Decisions

> [!IMPORTANT]
> The three core flow decisions have been confirmed in Phase 1 clarification:
> 1. **Bot Match Start**: Users will see a high-octane pre-match loadout preview (opponent rating, TR stakes, and rules) before deploying directly into the match, completely bypassing the Punisher Robot Selector.
> 2. **Auto Match**: Clicking Auto Match will instantly search and pair with an active online player or matchmaking queue, displaying real-time feedback with zero redirection to the general modes tab.
> 3. **Challenge Button**: Clicking Challenge opens a dedicated League Rivals modal listing online players with 1-click challenge actions, eliminating the redirect to the modes tab.
> 4. **Authoritative Rewards**: Matches played from this flow are explicitly tagged with `mode: 'league'`, guaranteeing that wins and losses process through `/api/league/process-match` to grant official TR, tier promotions, and league gems.

---

### 1. Overview & Core Concept

- **What It Does**: Refactors the matchmaking actions in the Trophy Room's League tab so that players can seamlessly launch ranked bot matches, auto-match against online humans, or challenge specific rivals without being dumped into unrelated screens (such as the Punisher Robot Selector or All Game Modes modal).
- **Target Audience**: Competitive players advancing through the 11 League tiers who want friction-free access to ranked matches against calibrated bot engines (from Joystick Wraith up to Chrome Reaper) or online peers.
- **Key Value**: Preserves immersion and intent. Matches initiated from League mode operate strictly under League rules and stakes, awarding authoritative League Trophies (TR) and rank advancement.

---

### 2. User Experience & Visual Design

#### A. Key User Flows

1. **Direct League Bot Flow**:
   - Player navigates to Trophy Room $\to$ League Tab.
   - Player selects an unlocked bot (e.g. Joystick Wraith, Bangla-Bot, Chrome Reaper) and clicks **"Play Match vs [Bot]"**.
   - A sleek **League Pre-Match Loadout Modal** appears:
     - Left: Player profile crest, current rank tier, current TR.
     - Center: Dynamic "VS" emblem with anticipated TR stakes (`+10 to +25 TR` on win, `0 TR` on bot loss).
     - Right: Bot avatar, rating bracket, and tactical doctrine quote.
     - Single-action primary CTA: **"Deploy into League Match"**.
   - Upon deployment, Trophy Room closes and the match starts immediately against that bot.
   - The match header displays an unmistakable **"Official League Match • Ranked Tier [N]"** badge.
   - When the game concludes, the player receives official League TR updates, rank progress animation, and promotion gem rewards if tier thresholds are crossed.

2. **Instant Multiplayer Auto-Match Flow**:
   - Player clicks **"Auto Match"** in the League tab.
   - An instant radar status activates: the client queries connected active sockets via `SocketContext`.
   - If an eligible online opponent is found, a match challenge or instant pair request is dispatched.
   - If no human opponents are currently online, an elegant toast alert appears: *"No online players in queue right now. Challenge a League Bot to earn TR and climb ranks!"* — keeping the player inside the Trophy Room or offering 1-click bot deployment.
   - **Zero redirect** to `#modes`.

3. **League Rivals Challenge Flow**:
   - Player clicks **"Challenge"** in the League tab.
   - A dedicated **League Rivals Modal** opens immediately on top of the Trophy Room.
   - Lists active online players (highlighted with live green indicator) and recent league opponents.
   - Clicking "Challenge" on any rival immediately opens the `MultiplayerChallengeModal` pre-populated with that player's credentials and custom time controls.
   - **Zero redirect** to `#modes`.

#### B. Visual Identity & Styling
- **Theme**: High-contrast cyberpunk / dark brass esports aesthetic matching the existing Trophy Sanctuary (`#080b11` deep slate canvas, `#f59e0b` amber accents, `#ffffff` neobrutalist borders with `3px 3px 0px` hard drop shadows).
- **Typography**: Display headlines in bold uppercase sans, accompanied by `font-mono tabular-nums` for TR calculations, ELO ratings, and timer readouts.
- **Micro-Interactions**: Hover lifts (`active:scale-95`), glowing rank crests based on tier animation IDs (`rusted`, `shiny`, `metal1`, `mugen1`, `iron`, `conqueror`, `deity`), and immediate visual feedback on button clicks.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Match Initiation vs Selector Routing**
  - *Chosen Approach*: Pass a dedicated `onStartLeagueBotMatch(botId)` handler from `App.tsx` down through `Dashboard.tsx` to `TrophyRoomModal`.
  - *Why*: The user explicitly stated that clicking a bot in League mode should never open the Punisher Robot Selector. The bot engine should be reused, but the game must be treated as a League match.
  - *Alternative Considered*: Opening PunisherSelector with pre-selected tab was rejected because it introduces extra clicks and displays casual punisher branding rather than League rank stakes.

- **Decision 2: Authoritative League Processing via Existing API**
  - *Chosen Approach*: Tag the initiated match with `source: 'league'` and pass `mode: 'league'` to `reportGameEnd()`.
  - *Why*: `server/league.ts` and `/api/league/process-match` already contain the authoritative TR formula (`LEAGUE_MATH_CONSTANTS.BOT_WIN_MULTIPLIER = 0.5`, 0 loss penalty vs bots, tier jump multipliers). Tagging the match ensures the server and client treat it as a ranked league game rather than an unranked bot test.
  - *Alternative Considered*: Client-only TR calculation was rejected to prevent state divergence and maintain authoritative persistence.

- **Decision 3: In-Modal Rivals List vs Dashboard Scrolling**
  - *Chosen Approach*: Dedicated `LeagueRivalsModal` rendered inside/adjacent to the Trophy Room.
  - *Why*: Scrolling down to the dashboard requires closing the Trophy Room and forcing the user to re-orient themselves on the home dashboard. A contained modal keeps the user's mental model intact.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TrophyRoomModal (Desktop / Mobile)               │
│                                                                        │
│  ┌─────────────────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ Play vs [Bot] Button    │  │ Auto Match    │  │ Challenge Button │  │
│  └───────────┬─────────────┘  └───────┬───────┘  └─────────┬────────┘  │
└──────────────┼────────────────────────┼────────────────────┼───────────┘
               ▼                        ▼                    ▼
     ┌──────────────────┐     ┌───────────────────┐ ┌────────────────────┐
     │ LeaguePreMatch   │     │ Socket Auto-Pair  │ │ LeagueRivalsModal  │
     │ Loadout Modal    │     │ Online Check      │ │ (Online Players)   │
     └─────────┬────────┘     └─────────┬─────────┘ └────────┬───────────┘
               │                        │                    │
               ▼                        ▼                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              App.tsx                                   │
│  • handleStartLeagueBotMatch(botId)                                    │
│  • Sets activePunisherBotId & tags match as isLeagueMatch: true        │
│  • Launches MatchView directly (no PunisherSelector)                   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   MatchView & Game End Processing                      │
│  • Game finishes (Checkmate / Resignation / Time)                      │
│  • Calls reportGameEnd({ mode: 'league', matchId, result, ... })       │
│  • POST /api/league/process-match updates db.users[userId].trophies   │
│  • Dispatches 'league:updated' event                                   │
│  • Displays League Post-Match Rank Summary Modal                       │
└────────────────────────────────────────────────────────────────────────┘
```

#### A. Event & State Interfaces

1. **League Bot Match Parameter**:
   ```typescript
   export interface LeagueMatchLaunchParams {
     botId: PunisherBotId;
     playerColor: 'white';
     timeControl: 300;
     isLeagueMatch: true;
   }
   ```

2. **MatchView Header & Mode Awareness**:
   - `MatchView` receives `isLeagueMatch?: boolean` and `leagueBotId?: string`.
   - When `isLeagueMatch` is true:
     - Header shows League Rank Badge and TR Stakes indicator.
     - Upon completion, `reportGameEnd` sets `mode: 'league'` and calls the authoritative endpoint.

3. **Multiplayer Auto-Match Integration**:
   - Queries `onlineUserIds` from `SocketContext`.
   - Filters out `user.id`.
   - If available: dispatches `sendChallenge(candidateId, 300, 'included', true, 'classic', 'classic')`.
   - If none: triggers non-blocking notification with alternative 1-click bot suggestion.

4. **League Rivals Drawer / Modal**:
   - Fetches active players via existing `/api/players` and cross-references with `onlineUserIds`.
   - Shows player status (Online / Offline), current TR, and direct "Challenge" button that opens `MultiplayerChallengeModal`.

---

### Verification & Validation Plan

- **Compilation**: Run `npm run lint` and `npm run build` (`compile_applet`) to verify 0 syntax or type errors.
- **Direct Bot Match Execution**: Click "Play vs Joystick Wraith" in League tab $\to$ Verify pre-match loadout appears $\to$ Click "Deploy" $\to$ Verify match starts directly without opening `PunisherSelector`.
- **Match Completion & League Rewards**: Verify match end calls `/api/league/process-match`, updates `user.trophies`, and triggers League rank progression.
- **Auto Match Verification**: Click "Auto Match" $\to$ Verify no redirection to `#modes`; either matches with online socket user or shows clear status alert.
- **Challenge Verification**: Click "Challenge" $\to$ Verify `LeagueRivalsModal` appears with online/available players; no redirection to `#modes`.
