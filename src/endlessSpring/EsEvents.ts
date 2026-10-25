import {
  esChebyshevDistance,
  esGetPieceAt,
  esIsPlayableSquare,
  esIsSamePos,
  esManhattanDistance,
} from './EsRules';
import {
  esGetInitialBoard,
  esGetInitialPieces,
  esGetInitialSpecialTiles,
  ES_FIRE_SCHEDULE,
  ES_PIECE_VALUES,
  ES_ROUND_LIMITS,
} from './EsGameData';
import {
  EsGameState,
  EsPiece,
  EsPosition,
} from './EsTypes';

// Seeded PRNG: mulberry32
export function esMulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function esShuffle<T>(array: T[], random: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Creates initial state for a given game and stage/act
 */
export function esCreateInitialGameState(
  gameId: 1 | 2 | 3 | 4 | 5,
  stageOrAct = 1,
  seed = Date.now(),
  carriedAllies: ('footman' | 'shade' | 'wind' | 'beam')[] = []
): EsGameState {
  const board = esGetInitialBoard(gameId, stageOrAct);
  const pieces = esGetInitialPieces(gameId, stageOrAct, carriedAllies);
  const specialTiles = esGetInitialSpecialTiles(gameId, stageOrAct);

  let kinAllies: string[] = [];
  let kinEnemies: string[] = [];

  if (gameId === 5 && stageOrAct === 1) {
    const kinPieces = pieces.filter((p) => p.type === 'kin');
    const rng = esMulberry32(seed);
    const shuffled = esShuffle(kinPieces.map((p) => p.id), rng);
    kinAllies = shuffled.slice(0, 3);
    kinEnemies = shuffled.slice(3, 6);
  }

  const crowdTokens = gameId === 4 && stageOrAct === 1 ? [
    { x: 1, y: 5 }, { x: 3, y: 5 }, { x: 5, y: 5 }, { x: 7, y: 5 },
    { x: 0, y: 4 }, { x: 2, y: 4 }, { x: 6, y: 4 }, { x: 8, y: 4 },
    { x: 1, y: 3 }, { x: 4, y: 3 }, { x: 7, y: 3 }, { x: 3, y: 2 },
  ] : [];

  return {
    version: 1,
    gameId,
    stageOrAct,
    round: 1,
    turn: 'A',
    board,
    pieces,
    specialTiles,
    outcome: 'ongoing',
    shadowLineS: 4,
    hasRyoshinBlessing: null,
    fireSquares: [],
    smokeSquares: [],
    isStorm: false,
    itemsCollected: { notebook: false, slip: false },
    questionsCount: 0,
    imagineCooldown: 0,
    angelInterceptUsed: false,
    pendingIntercept: null,
    loopsCount: 0,
    liftCooldown: 0,
    floodedRows: [],
    crowdTokens,
    casualtyCount: 0,
    seed,
    kinAllies,
    kinEnemies,
    carriedAllies,
    papersCollected: 0,
    updatedAt: Date.now(),
  };
}

/**
 * Checks win and loss conditions in the strict mandatory order:
 * (1) A's win condition
 * (2) A's loss condition
 * (3) round limit
 * If A's win and loss happen at the same moment, A loses.
 */
export function esCheckObjectives(state: EsGameState): {
  outcome: 'ongoing' | 'win' | 'loss' | 'draw';
  reason?: string;
  variant?: string;
} {
  const { gameId, stageOrAct, pieces, round } = state;
  const limitSetting = ES_ROUND_LIMITS[gameId];
  const roundLimit = Array.isArray(limitSetting) ? limitSetting[stageOrAct - 1] : limitSetting;

  let win = false;
  let loss = false;
  let winReason = '';
  let lossReason = '';
  let variant: string | undefined;

  switch (gameId) {
    case 1: {
      const aScarecrow = pieces.find((p) => p.side === 'A' && p.type === 'scarecrow');
      const bScarecrow = pieces.find((p) => p.side === 'B' && p.type === 'scarecrow');

      if (!bScarecrow) {
        win = true;
        winReason = 'The enemy scarecrow was captured or consumed by fire.';
      }
      if (!aScarecrow) {
        loss = true;
        lossReason = 'Your scarecrow was captured or burned.';
      }
      break;
    }

    case 2: {
      const aj = pieces.find((p) => p.side === 'A' && p.type === 'dreamer');
      if (!aj) {
        loss = true;
        lossReason = 'AJ was captured.';
      }
      if (state.questionsCount >= 3) {
        loss = true;
        lossReason = 'The investigator questioned AJ three times.';
      }
      if (aj && state.itemsCollected.notebook && state.itemsCollected.slip) {
        const onExit = state.specialTiles.some((t) => t.type === 'exit' && esIsSamePos(t.pos, aj.pos));
        if (onExit) {
          win = true;
          winReason = 'AJ escaped with the notebook and slip!';
        }
      }
      break;
    }

    case 3: {
      const boat = pieces.find((p) => p.type === 'boat');
      if (!boat) {
        loss = true;
        lossReason = 'The paper boat was captured or sunk.';
      } else {
        const onPassage = state.specialTiles.some((t) => t.type === 'passage' && esIsSamePos(t.pos, boat.pos));
        if (stageOrAct === 1) {
          if (onPassage && state.loopsCount >= 2) {
            win = true;
            winReason = 'The boat sailed through the passage!';
          }
        } else if (stageOrAct === 2) {
          if (onPassage) {
            win = true;
            winReason = 'The boat reached the passage out of the ruins!';
          }
        } else {
          if (onPassage) {
            win = true;
            winReason = 'The boat reached the gate of the fair!';
          }
        }
      }
      break;
    }

    case 4: {
      const aj = pieces.find((p) => p.side === 'A' && p.type === 'dreamer');
      const ajx = pieces.find((p) => p.side === 'A' && p.type === 'guide');

      if (!aj) {
        loss = true;
        lossReason = 'AJ was lost to the fair.';
      } else {
        if (stageOrAct === 1) {
          if (aj.pos.y === 0) {
            win = true;
            winReason = 'AJ escaped row 0 through the crowd!';
            const aliveTokens = state.crowdTokens.length;
            if (aliveTokens >= 8) variant = 'mercy';
            else if (aliveTokens >= 4) variant = 'cost';
            else variant = 'silence';
          }
        } else if (stageOrAct === 2) {
          const scarecrow = pieces.find((p) => p.type === 'scarecrow');
          if (scarecrow) {
            if (esIsSamePos(aj.pos, scarecrow.pos) || (ajx && esIsSamePos(ajx.pos, scarecrow.pos))) {
              win = true;
              winReason = 'The scarecrow was found!';
            }
          }
        } else {
          // Act 3
          const onRedDoor = state.specialTiles.some((t) => t.type === 'red_door' && esIsSamePos(t.pos, aj.pos));
          if (onRedDoor) {
            win = true;
            winReason = 'AJ reached the Red Door.';
          }
        }
      }
      break;
    }

    case 5: {
      const aj = pieces.find((p) => p.side === 'A' && p.type === 'dreamer');
      if (!aj) {
        loss = true;
        lossReason = 'AJ was captured.';
      } else {
        if (stageOrAct === 1) {
          const allKinRevealed = !pieces.some((p) => p.type === 'kin');
          if (allKinRevealed) {
            win = true;
            winReason = 'All kin have been revealed. Moving to the Archive Library.';
          }
        } else if (stageOrAct === 2) {
          if (state.papersCollected >= 5) {
            const onStair = state.specialTiles.some((t) => t.type === 'stair' && esIsSamePos(t.pos, aj.pos));
            if (onStair) {
              win = true;
              winReason = 'All papers collected and AJ reached the Stair!';
            }
          }
        } else {
          // Phase 3: Win if Yjkstra captured OR if round 8 completes
          const yjkstra = pieces.find((p) => p.type === 'yjkstra');
          if (!yjkstra) {
            win = true;
            winReason = 'Defiance: Yjkstra was defeated.';
          }
        }
      }
      break;
    }
  }

  // Simultaneous win & loss -> loss
  if (win && loss) {
    return { outcome: 'loss', reason: lossReason };
  }
  if (loss) {
    return { outcome: 'loss', reason: lossReason };
  }
  if (win) {
    return { outcome: 'win', reason: winReason, variant };
  }

  // Check round limit at end of round
  if (round > roundLimit) {
    if (gameId === 1) {
      // Compare piece values
      let aVal = 0;
      let bVal = 0;
      for (const p of pieces) {
        if (p.side === 'A') aVal += ES_PIECE_VALUES[p.type] || 0;
        if (p.side === 'B') bVal += ES_PIECE_VALUES[p.type] || 0;
      }
      if (aVal > bVal) {
        return { outcome: 'win', reason: `Dusk: Shadow Kingdom holds higher material (${aVal} vs ${bVal}).` };
      } else if (bVal > aVal) {
        return { outcome: 'loss', reason: `Dusk: Light Kingdom holds higher material (${bVal} vs ${aVal}).` };
      } else {
        return { outcome: 'draw', reason: `Dusk Draw: Material is tied (${aVal} - ${bVal}).` };
      }
    } else if (gameId === 5 && stageOrAct === 1) {
      // Phase 1 round limit reached: progress to Phase 2 with surviving kin
      return { outcome: 'win', reason: 'Round limit reached; surviving kin vanish.' };
    } else if (gameId === 5 && stageOrAct === 3) {
      // Phase 3 round limit reached and AJ survived -> Win!
      const aj = pieces.find((p) => p.side === 'A' && p.type === 'dreamer');
      if (aj) {
        return { outcome: 'win', reason: 'AJ held breath through round 8. END OF PART ONE.' };
      } else {
        return { outcome: 'loss', reason: 'AJ was lost.' };
      }
    } else {
      return { outcome: 'loss', reason: `Round limit of ${roundLimit} reached.` };
    }
  }

  return { outcome: 'ongoing' };
}

/**
 * BFS shortest path in O4 to target
 */
export function esBfsShortestPathO4(
  board: { width: number; height: number; voidSquares: EsPosition[] },
  start: EsPosition,
  goal: EsPosition,
  obstacles: EsPosition[],
  tieBreaker: (a: EsPosition, b: EsPosition) => number
): EsPosition | null {
  const queue: { pos: EsPosition; path: EsPosition[] }[] = [{ pos: start, path: [] }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  let foundPath: EsPosition[] | null = null;

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (esIsSamePos(current.pos, goal)) {
      foundPath = current.path;
      break;
    }

    const neighbors: EsPosition[] = [
      { x: current.pos.x, y: current.pos.y + 1 },
      { x: current.pos.x, y: current.pos.y - 1 },
      { x: current.pos.x + 1, y: current.pos.y },
      { x: current.pos.x - 1, y: current.pos.y },
    ]
      .filter((p) => esIsPlayableSquare(board, p))
      .filter((p) => !obstacles.some((obs) => esIsSamePos(obs, p) && !esIsSamePos(p, goal)));

    // Sort neighbors by tie-breaker (lowest y, then lowest x)
    neighbors.sort(tieBreaker);

    for (const nb of neighbors) {
      const key = `${nb.x},${nb.y}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ pos: nb, path: [...current.path, nb] });
      }
    }
  }

  return foundPath && foundPath.length > 0 ? foundPath[0] : null;
}

/**
 * Applies all end-of-round scripted events in the exact specified order
 */
export function esApplyEndOfRoundEvents(state: EsGameState): EsGameState {
  let next = { ...state };
  const r = next.round;

  // Decrease cooldowns
  if (next.imagineCooldown > 0) next.imagineCooldown--;
  if (next.liftCooldown > 0) next.liftCooldown--;

  // Unfreeze any stillness
  next.pieces = next.pieces.map((p) => (p.frozenRounds ? { ...p, frozenRounds: p.frozenRounds - 1 } : p));

  switch (next.gameId) {
    case 1: {
      // Shadow Line S
      if (r === 4) next.shadowLineS = 3;
      if (r === 8) next.shadowLineS = 2;

      // Round 5 end: Shrine of Ryoshin
      if (r === 5 && !next.specialTiles.some((t) => t.type === 'shrine')) {
        const candidateShrine: EsPosition[] = [
          { x: 3, y: 3 },
          { x: 4, y: 4 },
          { x: 3, y: 4 },
          { x: 4, y: 3 },
        ];
        const emptyShrinePos = candidateShrine.find((pos) => !esGetPieceAt(next.pieces, pos));
        if (emptyShrinePos) {
          next.specialTiles = [...next.specialTiles, { pos: emptyShrinePos, type: 'shrine' }];
        }
      }

      // Phase 2: Storm rounds 11-20
      next.isStorm = r >= 11 && r <= 20;

      // Phase 3: The Fire rounds 21-30
      if (r >= 20 && r <= 29) {
        const k = r - 20;
        if (k < ES_FIRE_SCHEDULE.length) {
          const newSmoke = ES_FIRE_SCHEDULE[k];
          next.smokeSquares = [...(next.smokeSquares || []), newSmoke];
        }
      }
      if (r >= 21) {
        // Any square in smoke becomes fire
        const fireTargets = next.smokeSquares.filter((sm) => !next.fireSquares.some((f) => esIsSamePos(f, sm)));
        if (fireTargets.length > 0) {
          next.fireSquares = [...next.fireSquares, ...fireTargets];
          // Destroy pieces standing on newly turned fire
          next.pieces = next.pieces.filter((p) => !fireTargets.some((f) => esIsSamePos(f, p.pos)));
        }
      }
      break;
    }

    case 2: {
      // Questioning at end of B turn handled in turn cycle
      // Echoes become real footmen at end of phase (10, 20) or in phase 3 immediately
      if (r === 10 || r === 20 || r >= 21) {
        next.pieces = next.pieces.map((p) => {
          if (p.type === 'echo' && !p.isRealFootman) {
            return { ...p, isRealFootman: true };
          }
          return p;
        });
      }

      // Angel appears at start of round 11
      if (r === 10 && !next.pieces.some((p) => p.type === 'angel')) {
        const angelCandidates: EsPosition[] = [
          { x: 4, y: 2 },
          { x: 3, y: 2 },
          { x: 5, y: 2 },
          { x: 2, y: 2 },
          { x: 6, y: 2 },
        ];
        const emptyPos = angelCandidates.find((pos) => !esGetPieceAt(next.pieces, pos) && esIsPlayableSquare(next.board, pos));
        if (emptyPos) {
          next.pieces = [
            ...next.pieces,
            { id: 'es_angel_1', type: 'angel', side: 'A', pos: emptyPos },
          ];
        }
      }
      break;
    }

    case 3: {
      if (next.stageOrAct === 2) {
        // Water rises: at end of round r (r = 3..9) row y = r-3 floods
        if (r >= 3 && r <= 9) {
          const floodY = r - 3;
          if (!next.floodedRows.includes(floodY)) {
            next.floodedRows = [...next.floodedRows, floodY];
          }
          // If boat is on flooded row after water rises, it sinks
          const boat = next.pieces.find((p) => p.type === 'boat');
          if (boat && next.floodedRows.includes(boat.pos.y)) {
            next.pieces = next.pieces.filter((p) => p.id !== boat.id);
          }
        }
      } else if (next.stageOrAct === 3) {
        // End of round 1: empty row y=0 becomes void
        if (r === 1) {
          const newVoids: EsPosition[] = [];
          for (let x = 0; x < next.board.width; x++) {
            const pos = { x, y: 0 };
            if (!esGetPieceAt(next.pieces, pos)) {
              newVoids.push(pos);
            }
          }
          next.board = {
            ...next.board,
            voidSquares: [...next.board.voidSquares, ...newVoids],
          };
        }
        // End of rounds 3 and 6: new guest appears
        if (r === 3 || r === 6) {
          const targetX = r === 3 ? 0 : 7;
          let spawnPos: EsPosition | null = { x: targetX, y: 5 };
          if (esGetPieceAt(next.pieces, spawnPos) || !esIsPlayableSquare(next.board, spawnPos)) {
            // Find nearest empty square by ascending y then x
            spawnPos = null;
            for (let y = 0; y < next.board.height && !spawnPos; y++) {
              for (let x = 0; x < next.board.width && !spawnPos; x++) {
                const cand = { x, y };
                if (esIsPlayableSquare(next.board, cand) && !esGetPieceAt(next.pieces, cand)) {
                  spawnPos = cand;
                }
              }
            }
          }
          if (spawnPos) {
            next.pieces = [
              ...next.pieces,
              { id: `es_guest_reinforce_${r}`, type: 'guest', side: 'B', pos: spawnPos },
            ];
          }
        }
      }
      break;
    }

    case 4: {
      if (next.stageOrAct === 1) {
        // Crowd token flow
        // Even y flow EAST, odd y flow WEST. Process east from highest x to lowest; west from lowest x to highest
        const tokens = [...next.crowdTokens];
        const sortedTokens = tokens.sort((a, b) => {
          const aEven = a.y % 2 === 0;
          const bEven = b.y % 2 === 0;
          if (aEven && bEven) return b.x - a.x; // highest x to lowest
          if (!aEven && !bEven) return a.x - b.x; // lowest x to highest
          return aEven ? -1 : 1;
        });

        const movedTokens: EsPosition[] = [];
        for (const tok of sortedTokens) {
          const isEven = tok.y % 2 === 0;
          let targetX = isEven ? tok.x + 1 : tok.x - 1;
          // Wrap if off board
          if (targetX < 0) targetX = next.board.width - 1;
          if (targetX >= next.board.width) targetX = 0;
          const targetPos = { x: targetX, y: tok.y };

          const isVoid = next.board.voidSquares.some((v) => esIsSamePos(v, targetPos));
          const hasPiece = esGetPieceAt(next.pieces, targetPos);
          const hasMovedToken = movedTokens.some((t) => esIsSamePos(t, targetPos));

          if (isVoid || hasPiece || hasMovedToken) {
            movedTokens.push(tok); // stays
          } else {
            movedTokens.push(targetPos);
          }
        }
        next.crowdTokens = movedTokens;

        // Reinforcements at end of rounds 4, 8, 12: two banded on (0,8) and (8,8)
        if (r === 4 || r === 8 || r === 12) {
          const spawnPairs: EsPosition[] = [
            { x: 0, y: 8 },
            { x: 8, y: 8 },
          ];
          for (let spIdx = 0; spIdx < spawnPairs.length; spIdx++) {
            let sp = spawnPairs[spIdx];
            if (esGetPieceAt(next.pieces, sp) || !esIsPlayableSquare(next.board, sp)) {
              // Find nearest empty square
              sp = { x: spIdx === 0 ? 1 : 7, y: 8 };
            }
            next.pieces = [
              ...next.pieces,
              { id: `es_banded_reinforce_${r}_${spIdx}`, type: 'banded', side: 'B', pos: sp },
            ];
          }
        }
      } else if (next.stageOrAct === 2) {
        // Scarecrow moves 1 step in O4 to an empty playable neighbour that MAXIMISES Chebyshev dist to AJ
        const aj = next.pieces.find((p) => p.side === 'A' && p.type === 'dreamer');
        const scarecrow = next.pieces.find((p) => p.type === 'scarecrow');
        if (aj && scarecrow) {
          const candidates: EsPosition[] = [
            { x: scarecrow.pos.x, y: scarecrow.pos.y + 1 },
            { x: scarecrow.pos.x, y: scarecrow.pos.y - 1 },
            { x: scarecrow.pos.x + 1, y: scarecrow.pos.y },
            { x: scarecrow.pos.x - 1, y: scarecrow.pos.y },
          ].filter(
            (pos) =>
              esIsPlayableSquare(next.board, pos) &&
              !esGetPieceAt(next.pieces, pos)
          );

          if (candidates.length > 0) {
            // Sort to maximize Chebyshev, tie-break maximize Manhattan, tie-break lowest y, lowest x
            candidates.sort((c1, c2) => {
              const d1 = esChebyshevDistance(c1, aj.pos);
              const d2 = esChebyshevDistance(c2, aj.pos);
              if (d2 !== d1) return d2 - d1;
              const m1 = esManhattanDistance(c1, aj.pos);
              const m2 = esManhattanDistance(c2, aj.pos);
              if (m2 !== m1) return m2 - m1;
              if (c1.y !== c2.y) return c1.y - c2.y;
              return c1.x - c2.x;
            });
            scarecrow.pos = candidates[0];
          }
        }
      } else {
        // Act 3: Torchbearer moves 1 step in O4 along shortest path toward AJ
        const aj = next.pieces.find((p) => p.side === 'A' && p.type === 'dreamer');
        const torchbearer = next.pieces.find((p) => p.type === 'torchbearer');
        if (aj && torchbearer) {
          const obstacles = next.pieces.filter((p) => p.id !== torchbearer.id).map((p) => p.pos);
          const nextStep = esBfsShortestPathO4(
            next.board,
            torchbearer.pos,
            aj.pos,
            obstacles,
            (c1, c2) => (c1.y !== c2.y ? c1.y - c2.y : c1.x - c2.x)
          );
          if (nextStep && !esGetPieceAt(next.pieces, nextStep)) {
            torchbearer.pos = nextStep;
          }

          // Stillness: if torchbearer is adjacent in O4 to an A piece, freeze that piece
          for (const p of next.pieces) {
            if (p.side === 'A' && esManhattanDistance(p.pos, torchbearer.pos) === 1) {
              p.frozenRounds = 1;
            }
          }
        }
      }
      break;
    }

    case 5: {
      if (next.stageOrAct === 2) {
        // Watcher moves 1 step in O4 every SECOND round along shortest path to AJ
        if (r % 2 === 0) {
          const aj = next.pieces.find((p) => p.side === 'A' && p.type === 'dreamer');
          const watcher = next.pieces.find((p) => p.type === 'watcher');
          if (aj && watcher) {
            // Watcher may not enter occupied squares EXCEPT capturing A pieces
            const obstacles = next.pieces
              .filter((p) => p.id !== watcher.id && p.side !== 'A')
              .map((p) => p.pos);

            const nextStep = esBfsShortestPathO4(
              next.board,
              watcher.pos,
              aj.pos,
              obstacles,
              (c1, c2) => (c1.y !== c2.y ? c1.y - c2.y : c1.x - c2.x)
            );

            if (nextStep) {
              // Capture A piece if present
              const captured = esGetPieceAt(next.pieces, nextStep);
              if (captured && captured.side === 'A') {
                next.pieces = next.pieces.filter((p) => p.id !== captured.id);
              }
              watcher.pos = nextStep;
            }
          }
        }
      }
      break;
    }
  }

  // Increment round
  next.round = r + 1;
  next.turn = 'A';

  // Check objective
  const objCheck = esCheckObjectives(next);
  next.outcome = objCheck.outcome;
  next.outcomeReason = objCheck.reason;
  next.outcomeTextVariant = objCheck.variant;

  return next;
}
