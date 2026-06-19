// Headless integration tests for the Mini Golf match loop.
// No test-runner dependency is installed, so this is a self-contained harness:
// run it with `npx tsx src/games/minigolf/match.test.ts`, or import
// runMatchTests() from a future test runner. It drives the PURE match state
// machine (no React, no requestAnimationFrame) to prove the full Track-P loop:
// every hole advances, the bot always takes its turn (no soft-lock), scores
// accumulate, the final hole produces a scorecard, a win AND a loss are
// reachable, the result resolves, and rematch fully resets with no carry-over.
import {
  createMatch, tick, shoot, botPlay, canHumanShoot, isBotTurn,
  matchTotals, rematch,
  type MatchState,
} from './match';
import { HOLES } from './holes';
import { botShot } from './bot';
import { step, launch, newBall } from './engine';
import type { Difficulty } from '../../game/types';

// ---- tiny assert helpers (no external deps) ----
let passed = 0;
let failed = 0;
const fails: string[] = [];
function ok(cond: boolean, msg: string): void {
  if (cond) { passed += 1; } else { failed += 1; fails.push(msg); }
}
function eq<T>(a: T, b: T, msg: string): void {
  ok(a === b, msg + ' [got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ']');
}

// Deterministic RNG so runs are repeatable. Overrides Math.random for the test.
function withSeed<T>(seed: number, fn: () => T): T {
  let s = seed >>> 0;
  const orig = Math.random;
  Math.random = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  try {
    return fn();
  } finally {
    Math.random = orig;
  }
}

// A human policy that aims like a competent bot of the given difficulty.
function humanShot(s: MatchState, diff: Difficulty): void {
  const sh = botShot(s.ball, HOLES[s.holeIdx], diff);
  shoot(s, sh.dragX, sh.dragY);
}

interface MatchResult {
  s: MatchState;
  frames: number;
  holesSeen: number[];
  humanShots: number;
  botShots: number;
  softlock: boolean;
}

// Play a full match to completion and return the final state + stats.
function playMatch(seed: number, humanDiff: Difficulty, botDiff: Difficulty): MatchResult {
  return withSeed(seed, () => {
    const s = createMatch(botDiff);
    const holesSeen = new Set<number>();
    let frames = 0;
    let humanShots = 0;
    let botShots = 0;
    const MAX_FRAMES = 500000;
    while (!s.matchOver && frames < MAX_FRAMES) {
      holesSeen.add(s.holeIdx);
      if (canHumanShoot(s)) {
        humanShot(s, humanDiff);
        humanShots += 1;
      } else if (isBotTurn(s)) {
        botPlay(s);
        botShots += 1;
      } else {
        tick(s);
      }
      frames += 1;
    }
    return {
      s,
      frames,
      holesSeen: [...holesSeen].sort((a, b) => a - b),
      humanShots,
      botShots,
      softlock: frames >= MAX_FRAMES,
    };
  });
}

export function runMatchTests(): { passed: number; failed: number; fails: string[] } {
  const diffs: Difficulty[] = ['easy', 'medium', 'hard'];

  // 1) Core anti-soft-lock proof: every difficulty pairing + many seeds always
  //    completes, visits every hole, and produces a full scorecard.
  for (const hd of diffs) {
    for (const bd of diffs) {
      for (let seed = 1; seed <= 5; seed += 1) {
        const r = playMatch(seed * 1009 + 7, hd, bd);
        const tag = hd + '-vs-' + bd + '#' + seed;
        ok(!r.softlock, 'no soft-lock ' + tag);
        ok(r.s.matchOver, 'match resolved ' + tag);
        eq(r.holesSeen.length, HOLES.length, 'all holes visited ' + tag);
        eq(r.s.holeScores.length, HOLES.length, 'scorecard has every hole ' + tag);
        ok(r.botShots > 0, 'bot took a shot ' + tag);
        ok(r.humanShots > 0, 'human took a shot ' + tag);
        const decided = r.s.winner === 0 || r.s.winner === 1 || r.s.winner === 'tie';
        ok(decided, 'winner decided ' + tag);
        const totals = matchTotals(r.s);
        let sy = 0;
        let sb = 0;
        for (const h of r.s.holeScores) {
          sy += h[0];
          sb += h[1];
        }
        eq(totals[0], sy, 'your total = scorecard sum ' + tag);
        eq(totals[1], sb, 'bot total = scorecard sum ' + tag);
      }
    }
  }

  // 2) A human WIN is reachable (strong human vs weak bot).
  let humanWon = false;
  for (let seed = 1; seed <= 60 && !humanWon; seed += 1) {
    if (playMatch(seed * 7919 + 1, 'hard', 'easy').s.winner === 0) humanWon = true;
  }
  ok(humanWon, 'a human win is reachable (hard vs easy)');

  // 3) A human LOSS is reachable (weak human vs strong bot).
  let humanLost = false;
  for (let seed = 1; seed <= 60 && !humanLost; seed += 1) {
    if (playMatch(seed * 7919 + 1, 'easy', 'hard').s.winner === 1) humanLost = true;
  }
  ok(humanLost, 'a human loss is reachable (easy vs hard)');

  // 4) Rematch fully resets state -- no carry-over from the finished match.
  const finished = playMatch(424242, 'medium', 'medium').s;
  ok(finished.matchOver, 'pre-rematch match was over');
  const fresh = rematch(finished);
  eq(fresh.holeIdx, 0, 'rematch resets to hole 0');
  eq(fresh.matchOver, false, 'rematch clears matchOver');
  eq(fresh.winner, null, 'rematch clears winner');
  eq(fresh.holeScores.length, 0, 'rematch clears scorecard');
  eq(fresh.strokes[0], 0, 'rematch clears your strokes');
  eq(fresh.strokes[1], 0, 'rematch clears bot strokes');
  eq(fresh.done[0], false, 'rematch clears your done flag');
  eq(fresh.done[1], false, 'rematch clears bot done flag');
  eq(fresh.turn, 0, 'rematch gives first turn to the human');
  eq(fresh.phase, 'aiming', 'rematch starts in aiming phase');

  // 5) Obstacle-navigation regression: hole index 1 (which previously soft-
  //    locked vs an accurate straight-aim bot) is now sinkable by every
  //    difficulty within a sane stroke count.
  for (const d of diffs) {
    withSeed(13 + diffs.indexOf(d), () => {
      const hole = HOLES[1];
      let b = newBall(hole.tee);
      let strokes = 0;
      while (!b.sunk && strokes < 40) {
        const sh = botShot(b, hole, d);
        b = launch({ ...b, vel: { x: 0, y: 0 }, moving: false, sunk: false }, sh.dragX, sh.dragY);
        strokes += 1;
        let st = 0;
        while (b.moving && !b.sunk && st < 5000) {
          b = step(b, hole);
          st += 1;
        }
      }
      ok(b.sunk, 'hole 2 sinkable by ' + d + ' bot in <40 strokes [took ' + strokes + ']');
    });
  }

  return { passed, failed, fails };
}

// Auto-run when executed directly via tsx/node. Tree-shaken away in the browser
// bundle (the guard is false there).
declare const process:
  | { argv?: string[]; exit?: (code: number) => void }
  | undefined;
if (typeof process !== 'undefined' && Array.isArray(process?.argv)) {
  const res = runMatchTests();
  // eslint-disable-next-line no-console
  console.log('MiniGolf match tests: ' + res.passed + ' passed, ' + res.failed + ' failed');
  if (res.failed > 0) {
    // eslint-disable-next-line no-console
    console.log(res.fails.join('\n'));
    process.exit?.(1);
  }
}
