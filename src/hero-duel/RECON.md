# Hero Duel: Technical Reconnaissance (RECON.md)

## 1. Project Architecture & Framework
- **Runtime & Framework**: React 19 SPA with TypeScript (`tsx`, `vite` v8.3.0), Tailwind CSS v4 (`@tailwindcss/vite`).
- **Server/Backend**: Express + WebSockets (`server.ts`, `server/socket.ts`). Static hosting mode fallback enabled for Firebase/offline play.
- **State Management**: React Context (`AuthContext`, `SocketContext`, `ThemeContext`, `MusicContext`, `PredictorContext`), component hooks, and localStorage/IndexedDB stores.
- **Conventions**: Game modes are organized into dedicated subdirectories under `/src` (e.g. `/src/rose`, `/src/craftgame`, `/src/chess3d`, `/src/training`, `/src/journey`).

## 2. Board Rendering & Theme Tokens
- **Theme Source**: `/src/game/boardThemes.ts`
- **User Preference**: Cream & Crimson board theme (`BOARD_THEMES.crimson`):
  - Light square: Parchment Ivory (`#F2EFE4`, Tailwind `bg-[#F2EFE4]`)
  - Dark square: Hashira Crimson (`#BC1434`, Tailwind `bg-[#BC1434]`)
  - Coordinates text: `text-[#BC1434]/80` on light squares, `text-[#F2EFE4]/85` on dark squares
  - Outer border & Brutalist accents: `border-3` or `border-4` solid white/black, `shadow-[4px_4px_0px_#000000]` / `shadow-[6px_6px_0px_#ffffff]`
  - Highlights: Gold border/glow (`#fbbf24`, `rgba(251, 191, 36, 0.45)`), valid move dots (semi-transparent emerald or gold rings), ability effect zones (crimson translucent wash for enemy hazard, amber wash for aura).

## 3. Piece Art & Visual Language
- **Style**: Heavy-contrast graphic vector silhouettes with clean contours, internal accent highlights, solid grounding pedestal, and unique hero emblem markings.
- **References**:
  - `/src/components/ChessPiece.tsx` & `/src/rose/ChessPiece.tsx`
  - `/src/craftgame/CraftGamePieces.tsx`
  - `/src/components/CullingPiece.tsx`
- **Hero Piece Set (9 Heroes)**:
  1. **MugenKING ("The Sovereign")**: Imperial high crown with cross-slash crest & majestic aura.
  2. **Malevolent Shrine Priest ("Curse Controller")**: Torii gate / shrine finial silhouette with prayer talisman ribbons.
  3. **Dr. Methanogenic ("Alchemist of Gas")**: Chemical round flask / bubbling retort with toxic vapor tendrils.
  4. **Captain Englland ("Field Commander")**: Crested knight helm with battle pennant standard.
  5. **AJX ("The Phase Assassin")**: Dual geometric phase daggers with cyber glitch rift lines.
  6. **Yjkstra ("The Pathfinder")**: Connected graph node lattice with directional pathway arrow.
  7. **Ironclad Warden ("Wall Tank")**: Heavy crenellated fortress bastion with interlocking iron shieldplates.
  8. **BlackMonkey ("The Trickster")**: Mythic sun-wukong mask silhouette with trickster monkey tail flourish.
  9. **Part King Kong ("The Brute")**: Massive spiked ape fist / seismic gauntlet crushing inward.
- **Team Distinctions**:
  - Color-blind friendly geometric shape accents: Player 1 has sharp upward chevron crown bases; Player 2 has rounded shield fortress bases.
  - White/Gold vs Obsidian/Crimson core styling.

## 4. Audio & Sound FX
- **Audio Engine**: `/src/utils/audio.ts` (`SoundEffects` class using native Web Audio API synthesis):
  - `sounds.playSelect()`: 520Hz -> 380Hz chirp
  - `sounds.playMove()`: 440Hz -> 260Hz thud
  - `sounds.playCapture()`: 650Hz -> 140Hz crunchy snap
  - `sounds.playAbility()`: Jujutsu arpeggio [196Hz, 293.66Hz, 440Hz, 587.33Hz, 880Hz]
  - `sounds.playCheck()`: Sawtooth warning dual tone
  - `sounds.playGameOver()`: Multi-stage harmonic resolution
- **Music**: Controlled via `/src/context/MusicContext.tsx` and `/src/components/MusicButton.tsx`.

## 5. Wallet & Economy Integration
- **Source**: `/src/economy/mugenStore.ts`
  - `getGems(userId: string): number`
  - `spendGems(userId: string, amount: number): boolean`
  - `addGems(userId: string, amount: number): number`
  - `getMugenCrypto(userId: string): number`
  - `spendMugenCrypto(userId: string, amount: number): boolean`
- **Guest / Offline Compatibility**:
  - Safe local fallback if `userId` is empty/guest (`usr_guest_*`), stored in localStorage (`mugen_gems_${userId}`).
  - Pure cosmetic variety and card collection unlock options. No pay-to-win.

## 6. Game Mode Entry Points (All Registration Hooks)
To satisfy Absolute Rule #2 ("Find EVERY place modes are listed and add the new mode there through a single shared registry entry"):
1. **Shared Registry Definition**:
   - Create `/src/hero-duel/heroDuelRegistry.ts` exporting mode metadata: id `'hero-duel'`, name `'Hero Duel'`, subtitle `'7x8 Tactical Arena'`, icon component, description, and launch hook.
2. **`AllGameModesModal.tsx`**:
   - Add Hero Duel card in grid with action trigger `onOpenHeroDuel`.
3. **`Dashboard.tsx`**:
   - **Mobile Bottom Drop-up Quick Access Drawer**: Add 3-column square tile for `Hero Duel`.
   - **Desktop Top Navigation Bar**: Add `Hero Duel` nav pill item.
   - **Main Content Mode Cards**: Add dedicated Hero Duel entrance card in the primary dashboard grid.
4. **`App.tsx`**:
   - State `isHeroDuelOpen` to mount the full-screen `<HeroDuelHub onBack={() => setIsHeroDuelOpen(false)} />`.
