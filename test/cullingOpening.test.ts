/**
 * Automated Test Suite for Culling Game Opening Dojo & Mid-Game Strategy — Tukuna's Classroom
 */

import { CULLING_OPENING_LESSONS } from '../src/training/cullingOpeningData.js';
import {
  createInitialCullingMatch,
  executeCullingMove,
  getLegalMovesForSquare,
} from '../src/game/cullingEngine.js';

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const lessonResults: Array<{ id: string; title: string; stepsTotal: number; stepsPassed: number; status: 'PASSED' | 'FAILED'; error?: string }> = [];

function assert(condition: boolean, msg: string) {
  totalAssertions++;
  if (!condition) {
    failedAssertions++;
    throw new Error(`TEST FAILED: ${msg}`);
  }
  passedAssertions++;
  console.log(`✓ ${msg}`);
}

console.log('=== RUNNING CULLING GAME OPENING & MID-GAME DOJO TESTS ===');

// Test 1: Curriculum lesson count and composition
try {
  assert(
    CULLING_OPENING_LESSONS.length === 16,
    `Curriculum contains exactly 16 lessons (found ${CULLING_OPENING_LESSONS.length})`
  );

  const openingLessons = CULLING_OPENING_LESSONS.filter(
    (l) => !l.curriculumType || l.curriculumType === 'opening'
  );
  const midgameLessons = CULLING_OPENING_LESSONS.filter((l) => l.curriculumType === 'midgame');

  assert(openingLessons.length === 8, 'Opening curriculum contains 8 lessons');
  assert(midgameLessons.length === 8, 'Mid-Game curriculum contains 8 lessons');

  // Assert every lesson has at least 8 sequential steps
  CULLING_OPENING_LESSONS.forEach((lesson) => {
    assert(
      lesson.steps.length >= 8,
      `Lesson "${lesson.title}" (${lesson.id}) has at least 8 sequential steps (actual: ${lesson.steps.length})`
    );
    assert(
      Boolean(lesson.namedStrategy),
      `Lesson "${lesson.title}" (${lesson.id}) has a named strategy ("${lesson.namedStrategy}")`
    );
  });
} catch (err: any) {
  console.error(`❌ Curriculum structure test failed: ${err.message}`);
}

// Test 2: Step-by-step authoritative move legality for ALL 16 lessons
CULLING_OPENING_LESSONS.forEach((lesson, index) => {
  console.log(
    `\nTesting Lesson ${index + 1} (${lesson.id}) [${lesson.curriculumType || 'opening'}]: "${lesson.title}" (${lesson.namedStrategy})...`
  );

  let match = createInitialCullingMatch(
    `test_${lesson.id}`,
    { userId: 'player', username: 'Pupil', displayName: 'Pupil' },
    { userId: 'tukuna_bot', username: 'Sensei Tukuna', displayName: 'Sensei Tukuna' }
  );

  if (lesson.initialBoard) {
    match.board = lesson.initialBoard;
  }

  let stepsPassed = 0;
  let lessonError: string | undefined = undefined;

  try {
    lesson.steps.forEach((step, stepIdx) => {
      // Verify source piece exists
      const movingPiece = match.board[step.from.y]?.[step.from.x];
      assert(
        movingPiece !== null && movingPiece !== undefined,
        `Step ${stepIdx + 1}: Found piece at (${step.from.x}, ${step.from.y}) [${movingPiece?.type}]`
      );
      assert(
        movingPiece?.color === lesson.playerColor,
        `Step ${stepIdx + 1}: Piece belongs to active player (${lesson.playerColor})`
      );

      // Verify move is strictly legal in cullingEngine
      const legalMoves = getLegalMovesForSquare(match, step.from);
      const isLegal = legalMoves.some((m) => m.to.x === step.to.x && m.to.y === step.to.y);
      assert(
        isLegal,
        `Step ${stepIdx + 1} (${step.notation}): Move (${step.from.x},${step.from.y}) -> (${step.to.x},${step.to.y}) is strictly legal in cullingEngine`
      );

      // Execute player move
      const res = executeCullingMove(match, step.from, step.to, step.actionType || 'move');
      assert(res.success, `Step ${stepIdx + 1}: Executed player move successfully`);
      match = res.state;

      // Execute automated opponent response if configured
      if (step.opponentResponse) {
        const opp = step.opponentResponse;
        const oppRes = executeCullingMove(match, opp.from, opp.to, 'move');
        assert(
          oppRes.success,
          `Step ${stepIdx + 1}: Executed legal opponent response (${opp.from.x},${opp.from.y}) -> (${opp.to.x},${opp.to.y})`
        );
        match = oppRes.state;
      }

      stepsPassed++;
    });
  } catch (err: any) {
    lessonError = err.message;
    console.error(`❌ FAILED LESSON ${index + 1} (${lesson.id}): ${err.message}`);
  }

  lessonResults.push({
    id: lesson.id,
    title: lesson.title,
    stepsTotal: lesson.steps.length,
    stepsPassed,
    status: lessonError ? 'FAILED' : 'PASSED',
    error: lessonError,
  });
});

console.log('\n=== CULLING OPENING DOJO TEST SUMMARY ===');
console.table(lessonResults);
console.log(`Assertions: Total=${totalAssertions}, Passed=${passedAssertions}, Failed=${failedAssertions}`);

if (failedAssertions > 0 || lessonResults.some((l) => l.status === 'FAILED')) {
  console.error('\n❌ CULLING OPENING DOJO TEST SUITE FAILED!');
  process.exit(1);
} else {
  console.log('\n✅ ALL CULLING OPENING DOJO LESSONS PASSED!');
}
