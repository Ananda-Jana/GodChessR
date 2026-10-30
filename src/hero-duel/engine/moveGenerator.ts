import { BOARD_COLS, BOARD_ROWS, BoardPosition } from '../config/boardConfig';
import { HeroAction, InGameHeroState, PlayerSide } from '../types/heroDuelTypes';
import { findBfsPaths, getChebyshevDistance, isSamePos, isWithinBoard } from './boardGeometry';
import { evaluateCaptureAttempt, isHeroImmuneToAbility, isSilencedByRoyalSilence } from './priorityEngine';
import { hasStatus } from './statusManager';
import { getBannerBuff, isInsideGasCloud, isNearShrine, isSquareBlockedByZone } from './zoneManager';

export interface MoveOption {
  to: BoardPosition;
  isCapture: boolean;
  capturedHeroInstanceId?: string;
  isSliderMove: boolean;
}

export interface AbilityOption {
  abilityId: string;
  targetPos: BoardPosition;
  targetHeroInstanceId?: string;
  path?: BoardPosition[]; // For BFS shortest path
  description: string;
}

/**
 * Returns all legal movement squares for a given hero
 */
export function getLegalMovesForHero(
  hero: InGameHeroState,
  allHeroes: InGameHeroState[],
  zones: any[]
): MoveOption[] {
  if (!hero.isAlive) return [];

  // Check Rooted status
  const isRooted = hasStatus(hero, 'rooted');
  if (isRooted) return [];

  const moves: MoveOption[] = [];
  const side = hero.owner;

  // Determine effective range modifier
  const hasBanner = getBannerBuff(zones, hero.position, side);
  const isSlowed = hasStatus(hero, 'slowed') || isNearShrine(zones, hero.position, side);
  const isDisarmed = hasStatus(hero, 'disarmed') || isInsideGasCloud(zones, hero.position, side);

  let rangeMod = 0;
  if (hasBanner) rangeMod += 1;
  if (isSlowed) rangeMod -= 1;

  const clampRange = (base: number) => Math.max(1, base + rangeMod);

  const heroAt = (pos: BoardPosition) => allHeroes.find((h) => h.isAlive && isSamePos(h.position, pos));
  const isBlocked = (pos: BoardPosition) => {
    if (!isWithinBoard(pos)) return true;
    if (isSquareBlockedByZone(zones, pos)) return true;
    const occ = heroAt(pos);
    return Boolean(occ);
  };

  // Check Yjkstra Zone of Control (Edge Weights) on enemy sliders
  const isAdjacentToEnemyYjkstra = (pos: BoardPosition) => {
    return allHeroes.some(
      (h) => h.isAlive && h.owner !== side && h.heroId === 'yjkstra-pathfinder' && getChebyshevDistance(h.position, pos) <= 1
    );
  };

  const addMoveIfValid = (targetPos: BoardPosition, isSlider = false) => {
    if (!isWithinBoard(targetPos)) return;
    if (isSquareBlockedByZone(zones, targetPos)) return;

    const occupant = heroAt(targetPos);
    if (!occupant) {
      // Empty square move
      moves.push({ to: targetPos, isCapture: false, isSliderMove: isSlider });
    } else if (occupant.owner !== side) {
      // Enemy occupant: check Disarmed status
      if (isDisarmed) return;

      // Evaluate Immunities & Prevention tiers
      const emptyBackRows = getEmptyBackRowSquares(allHeroes, zones, occupant.owner);
      const evalRes = evaluateCaptureAttempt(hero, occupant, hero.position, emptyBackRows, isSlider);
      if (evalRes.allowed) {
        moves.push({
          to: targetPos,
          isCapture: true,
          capturedHeroInstanceId: occupant.instanceId,
          isSliderMove: isSlider,
        });
      }
    }
  };

  const slideInDirections = (directions: { dx: number; dy: number }[], maxRange: number) => {
    const range = clampRange(maxRange);
    for (const dir of directions) {
      for (let step = 1; step <= range; step++) {
        const nextPos: BoardPosition = {
          x: hero.position.x + dir.dx * step,
          y: hero.position.y + dir.dy * step,
        };

        if (!isWithinBoard(nextPos)) break;
        if (isSquareBlockedByZone(zones, nextPos)) break;

        const occ = heroAt(nextPos);
        if (!occ) {
          moves.push({ to: nextPos, isCapture: false, isSliderMove: true });
          // If this empty square is adjacent to enemy Yjkstra, slider must stop here!
          if (isAdjacentToEnemyYjkstra(nextPos)) {
            break;
          }
        } else {
          // Blocked by friendly or enemy hero
          if (occ.owner !== side && !isDisarmed) {
            const emptyBack = getEmptyBackRowSquares(allHeroes, zones, occ.owner);
            const evalRes = evaluateCaptureAttempt(hero, occ, hero.position, emptyBack, true);
            if (evalRes.allowed) {
              moves.push({
                to: nextPos,
                isCapture: true,
                capturedHeroInstanceId: occ.instanceId,
                isSliderMove: true,
              });
            }
          }
          break; // Ray ends on piece
        }
      }
    }
  };

  switch (hero.heroId) {
    case 'mugen-king': {
      // 1 square any direction
      const stepDirs = [
        { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
        { dx: -1, dy: 0 },                    { dx: 1, dy: 0 },
        { dx: -1, dy: 1 },  { dx: 0, dy: 1 },  { dx: 1, dy: 1 },
      ];
      for (const d of stepDirs) {
        addMoveIfValid({ x: hero.position.x + d.dx, y: hero.position.y + d.dy });
      }

      // Or 2 squares in a straight orthogonal line if path is empty
      const ortho2 = [
        { dx: 0, dy: 2 }, { dx: 0, dy: -2 }, { dx: 2, dy: 0 }, { dx: -2, dy: 0 },
      ];
      for (const d of ortho2) {
        const intermediate: BoardPosition = { x: hero.position.x + d.dx / 2, y: hero.position.y + d.dy / 2 };
        const dest: BoardPosition = { x: hero.position.x + d.dx, y: hero.position.y + d.dy };
        if (!isBlocked(intermediate)) {
          addMoveIfValid(dest);
        }
      }
      break;
    }

    case 'malevolent-priest': {
      // Diagonal slider up to 3 squares
      const diagDirs = [
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 },
      ];
      slideInDirections(diagDirs, 3);
      break;
    }

    case 'dr-methanogenic': {
      // Orthogonal slider up to 2 squares
      const orthoDirs = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
      ];
      slideInDirections(orthoDirs, 2);
      break;
    }

    case 'captain-englland': {
      // Knight hops (2-by-1 L-shape)
      const knightOffsets = [
        { dx: 1, dy: 2 }, { dx: 2, dy: 1 },
        { dx: -1, dy: 2 }, { dx: -2, dy: 1 },
        { dx: 1, dy: -2 }, { dx: 2, dy: -1 },
        { dx: -1, dy: -2 }, { dx: -2, dy: -1 },
      ];
      for (const d of knightOffsets) {
        addMoveIfValid({ x: hero.position.x + d.dx, y: hero.position.y + d.dy }, false);
      }
      break;
    }

    case 'ajx-assassin': {
      // Diagonal slider up to 2 squares
      const diags = [
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 },
      ];
      slideInDirections(diags, 2);

      // Or 1 square orthogonally
      const orthos = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
      ];
      for (const d of orthos) {
        addMoveIfValid({ x: hero.position.x + d.dx, y: hero.position.y + d.dy }, false);
      }
      break;
    }

    case 'yjkstra-pathfinder': {
      // Orthogonal slider up to 3 squares
      const orthos = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
      ];
      slideInDirections(orthos, 3);
      break;
    }

    case 'ironclad-warden': {
      // Orthogonal slider up to 2 squares
      const orthos = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
      ];
      slideInDirections(orthos, 2);
      break;
    }

    case 'black-monkey': {
      // 1 square diagonal
      const diags = [
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 },
      ];
      for (const d of diags) {
        addMoveIfValid({ x: hero.position.x + d.dx, y: hero.position.y + d.dy }, false);
      }

      // Or 2-square straight orthogonal leap that can jump over any one piece
      const leaps = [
        { dx: 0, dy: 2 }, { dx: 0, dy: -2 }, { dx: 2, dy: 0 }, { dx: -2, dy: 0 },
      ];
      for (const d of leaps) {
        addMoveIfValid({ x: hero.position.x + d.dx, y: hero.position.y + d.dy }, false);
      }
      break;
    }

    case 'part-king-kong': {
      // 1 square any direction
      const stepDirs = [
        { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
        { dx: -1, dy: 0 },                    { dx: 1, dy: 0 },
        { dx: -1, dy: 1 },  { dx: 0, dy: 1 },  { dx: 1, dy: 1 },
      ];
      for (const d of stepDirs) {
        addMoveIfValid({ x: hero.position.x + d.dx, y: hero.position.y + d.dy }, false);
      }
      break;
    }
  }

  return moves;
}

/**
 * Returns all legal ability targeting options for a hero
 */
export function getLegalAbilitiesForHero(
  hero: InGameHeroState,
  allHeroes: InGameHeroState[],
  zones: any[]
): AbilityOption[] {
  if (!hero.isAlive) return [];
  if (hero.currentCooldown > 0) return [];

  // Check Silenced status and Royal Silence
  if (hasStatus(hero, 'silenced') || isSilencedByRoyalSilence(hero, allHeroes)) {
    return [];
  }

  const options: AbilityOption[] = [];
  const side = hero.owner;
  const isOccupied = (pos: BoardPosition) => {
    return allHeroes.some((h) => h.isAlive && isSamePos(h.position, pos)) || isSquareBlockedByZone(zones, pos);
  };

  switch (hero.heroId) {
    case 'mugen-king': {
      // Boundless Decree: Swap with any friendly hero within 3 squares
      const allies = allHeroes.filter(
        (h) => h.isAlive && h.owner === side && h.instanceId !== hero.instanceId
      );
      for (const ally of allies) {
        if (getChebyshevDistance(hero.position, ally.position) <= 3) {
          const immunity = isHeroImmuneToAbility(hero, ally, 'displacement');
          if (!immunity.immune) {
            options.push({
              abilityId: 'boundless_decree',
              targetPos: ally.position,
              targetHeroInstanceId: ally.instanceId,
              description: `Swap places with ${ally.heroId}`,
            });
          }
        }
      }
      break;
    }

    case 'malevolent-priest': {
      // Desecrated Ground: Place shrine on empty square within 4
      for (let x = 0; x < BOARD_COLS; x++) {
        for (let y = 0; y < BOARD_ROWS; y++) {
          const pos = { x, y };
          if (getChebyshevDistance(hero.position, pos) <= 4 && !isOccupied(pos)) {
            options.push({
              abilityId: 'desecrated_ground',
              targetPos: pos,
              description: 'Place Desecrated Shrine',
            });
          }
        }
      }
      break;
    }

    case 'dr-methanogenic': {
      // Methane Bloom: 3x3 gas cloud centered on square within 3
      for (let x = 0; x < BOARD_COLS; x++) {
        for (let y = 0; y < BOARD_ROWS; y++) {
          const pos = { x, y };
          if (getChebyshevDistance(hero.position, pos) <= 3) {
            options.push({
              abilityId: 'methane_bloom',
              targetPos: pos,
              description: 'Release 3x3 Methane Gas Cloud',
            });
          }
        }
      }
      break;
    }

    case 'captain-englland': {
      // Rally Standard: Plant banner on own square
      options.push({
        abilityId: 'rally_standard',
        targetPos: hero.position,
        description: 'Plant Rally Standard Banner on this square',
      });
      break;
    }

    case 'ajx-assassin': {
      // Null Jump: Teleport to empty square within 3
      for (let x = 0; x < BOARD_COLS; x++) {
        for (let y = 0; y < BOARD_ROWS; y++) {
          const pos = { x, y };
          if (getChebyshevDistance(hero.position, pos) <= 3 && !isOccupied(pos)) {
            options.push({
              abilityId: 'null_jump',
              targetPos: pos,
              description: 'Null Jump Phase Teleport',
            });
          }
        }
      }
      break;
    }

    case 'yjkstra-pathfinder': {
      // Shortest Path: Choose friendly hero and move up to 4 steps through empty squares
      const allies = allHeroes.filter((h) => h.isAlive && h.owner === side);
      for (const ally of allies) {
        const bfsResults = findBfsPaths(ally.position, 4, isOccupied);
        for (const res of bfsResults) {
          options.push({
            abilityId: 'shortest_path',
            targetPos: res.dest,
            targetHeroInstanceId: ally.instanceId,
            path: res.path,
            description: `Reposition ${ally.heroId} via Shortest Path`,
          });
        }
      }
      break;
    }

    case 'ironclad-warden': {
      // Bulwark Plant: Impassable wall on empty square within 2
      for (let x = 0; x < BOARD_COLS; x++) {
        for (let y = 0; y < BOARD_ROWS; y++) {
          const pos = { x, y };
          if (getChebyshevDistance(hero.position, pos) <= 2 && !isOccupied(pos)) {
            options.push({
              abilityId: 'bulwark_plant',
              targetPos: pos,
              description: 'Construct Impassable Bulwark Wall',
            });
          }
        }
      }
      break;
    }

    case 'black-monkey': {
      // Mirror Troupe: Self action leaves decoy
      options.push({
        abilityId: 'mirror_troupe',
        targetPos: hero.position,
        description: 'Deploy Mirror Troupe Decoy',
      });
      break;
    }

    case 'part-king-kong': {
      // Ground Slam: 3x3 knockback/root
      options.push({
        abilityId: 'ground_slam',
        targetPos: hero.position,
        description: 'Slam ground! Push 3x3 adjacent enemies 1 square away (or Root if blocked)',
      });
      break;
    }
  }

  return options;
}

export function getEmptyBackRowSquares(
  allHeroes: InGameHeroState[],
  zones: any[],
  side: PlayerSide
): BoardPosition[] {
  const backRanks = side === 'player1' ? [0, 1] : [6, 7];
  const empties: BoardPosition[] = [];

  for (let x = 0; x < BOARD_COLS; x++) {
    for (const y of backRanks) {
      const pos = { x, y };
      const isHero = allHeroes.some((h) => h.isAlive && isSamePos(h.position, pos));
      const isZone = isSquareBlockedByZone(zones, pos);
      if (!isHero && !isZone) {
        empties.push(pos);
      }
    }
  }

  return empties;
}
