# Shrine Siege Recon (SIEGE_RECON.md)

## 1. Entry Component Flow (`HeroDuelEntry.tsx`)
- Screens: `'home' | 'draft' | 'placement' | 'match' | 'vault'`.
- For Shrine Siege, we add `'siege_deploy' | 'siege_match'`.
- `ModeHome` will offer **Shrine Siege** (primary mode: Easy / Normal / Hard vs Bot) and **Classic Duel (legacy)** (turn-based 7x8 chess).

## 2. Card Granting Function
- When an enemy hero is killed, we call `generateDefeatedHeroCard(heroId, existingCodes)` from `src/hero-duel/cards/cardGenerator.ts` and save it using `saveCollectibleCard(card)` from `src/hero-duel/cards/collectionStore.ts`.
- Bridge file: `src/hero-duel/cards/siegeCardBridge.ts`.

## 3. Reusable Components
- **Reused as-is**: `HeroDraft`, `HeroInfoModal`, `HowToPlayModal`, `CardGallery`, `AbilityBar` (adapted for real-time cooldowns), status icons, theme CSS (`heroDuel.css`).
- **Adapted**: `ResultsModal` (supports match review, Dominion/Throne win reasons, card rewards).
- **New Siege UI files**: `src/hero-duel/ui/siege/SiegeBoard.tsx`, `src/hero-duel/ui/siege/SiegeHud.tsx`, `src/hero-duel/ui/siege/DeploymentScreen.tsx`, `src/hero-duel/ui/siege/OrderBar.tsx`, `src/hero-duel/ui/siege/ShrineMeter.tsx`, `src/hero-duel/ui/siege/SiegeResultsModal.tsx`, `src/hero-duel/ui/siege/SiegeTutorialOverlay.tsx`.

## 4. Equipment & Abilities Shape
- Equipment: `EquipmentItem` in `src/hero-duel/equipment/equipmentData.ts` (mapped additively with `siege` properties).
- Abilities: `HeroActiveAbility` and `HeroPassive` in `src/hero-duel/types/heroDuelTypes.ts` (extended or mapped additively in hero files).

## 5. File Strategy
- **Untouched / Reused**: Legacy engine (`engine/`), legacy hook (`hooks/useHeroDuelMatch.ts`), legacy board (`ui/HeroBoard.tsx`), legacy placement (`ui/Placement.tsx`).
- **Additive**: Hero files (`heroes/*.ts`), equipment data (`equipment/equipmentData.ts`).
- **New Files**: `config/siegeConfig.ts`, `engine/siege/*`, `ai/siege/*`, `ui/siege/*`, `cards/siegeCardBridge.ts`.
