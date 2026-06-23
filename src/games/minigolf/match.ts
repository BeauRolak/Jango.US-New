// Mini Golf — pure, framework-free match state machine.
// No React, no requestAnimationFrame, no setTimeout, no DOM, no Math.random in
// transitions. Drive it with tick()/shoot() from either the React render loop OR
// a headless test. All turn/hole/score/win/rematch logic lives here so it can be
// verified deterministically without a foreground browser.
import {
  newBall, step, launch, speed,
  type BallState, type Hole,
} from './engine';
import { HOLES } from './holes';
import { botShot } from './bot';
import type { Difficulty } from '../../game/types';

export type Turn = 0 | 1;
// 0 = human (You), 1 = bot (Opp).

export type Phase =
  | 'aiming'      // waiting for the current player's shot
  | 'rolling'     // ball in motion, tick() advances physics
  | 'settling'    // ball stopped this turn; brief beat before the next turn
  | 'hole-done'   // both players holed out; brief beat before next hole
  | 'match-over'; // final hole resolved; result screen

// Frames to wait between sub-states. At 60fps these match the old ms timings
// (650ms settle, 900ms hole change) but are expressed in deterministic ticks so
// tests can advance them exactly.
export const SETTLE_TICKS = 39;   // ~650ms @60fps
export const HOLE_TICKS = 54;     // ~900ms @60fps
export const BOT_THINK_TICKS = 42; // ~700ms @60fps
// Hard safety cap so a stuck ball can never soft-lock the match.
export const MAX_ROLL_TICKS = 2000;
// Per-hole stroke cap: if a player somehow can't sink a hole, they concede it
// at this many strokes so the match always progresses to a result.
export const MAX_STROKES_PER_HOLE = 16;

export interface MatchState {
  difficulty: Difficulty;
  holeOrder: number[];              // indices into HOLES, in play order (locked)
  holeIdx: number;                  // position within holeOrder (0..N-1)
  turn: Turn;
  balls: [BallState, BallState];    // each player owns an independent ball
  strokes: [number, number];        // strokes on the CURRENT hole, per player
  holeScores: Array<[number, number]>; // recorded strokes per finished hole
  done: [boolean, boolean];         // has each player holed out THIS hole
  phase: Phase;
  timer: number;                    // ticks remaining in a timed phase
  rollTicks: number;                // safety counter while rolling
  banner: string;
  matchOver: boolean;
  winner: Turn | 'tie' | null;
}

// Deterministic PRNG (mulberry32) so a match seed always yields the same order.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick `count` unique hole indices from the library, shuffled by `seed`. */
export function makeHoleOrder(count: number, seed: number): number[] {
  const rng = mulberry32(seed);
  const pool = HOLES.map((_, i) => i);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.max(1, Math.min(count, pool.length)));
}

function curHole(s: MatchState): Hole {
  return HOLES[s.holeOrder[s.holeIdx]];
}

export function createMatch(difficulty: Difficulty, holeOrder?: number[]): MatchState {
  const order = holeOrder && holeOrder.length ? holeOrder : HOLES.map((_, i) => i);
  return {
    difficulty,
    holeOrder: order,
    holeIdx: 0,
    turn: 0,
    balls: [newBall(HOLES[order[0]].tee), newBall(HOLES[order[0]].tee)],
    strokes: [0, 0],
    holeScores: [],
    done: [false, false],
    phase: 'aiming',
    timer: 0,
    rollTicks: 0,
    banner: '',
    matchOver: false,
    winner: null,
  };
}

// True only when the human may aim/shoot.
export function canHumanShoot(s: MatchState): boolean {
  return s.phase === 'aiming' && s.turn === 0 && !s.done[0] && !s.matchOver;
}

// True when it is the bot's turn to think + shoot.
export function isBotTurn(s: MatchState): boolean {
  return s.phase === 'aiming' && s.turn === 1 && !s.done[1] && !s.matchOver;
}

// Apply a shot for the CURRENT player. Mutates + returns the same object.
export function shoot(s: MatchState, dragX: number, dragY: number): MatchState {
  if (s.phase !== 'aiming' || s.matchOver) return s;
  const who = s.turn;
  if (s.done[who]) return s;
  s.balls[who] = launch(s.balls[who], dragX, dragY);
  s.strokes[who] = s.strokes[who] + 1;
  s.phase = 'rolling';
  s.rollTicks = 0;
  return s;
}

// Ask the bot for its shot and apply it. Bot uses NO real Scalps; pure input.
export function botPlay(s: MatchState): MatchState {
  if (!isBotTurn(s)) return s;
  const shot = botShot(s.balls[s.turn], curHole(s), s.difficulty);
  return shoot(s, shot.dragX, shot.dragY);
}

function otherTurn(t: Turn): Turn {
  return (t === 0 ? 1 : 0) as Turn;
}

// After a shot settles, decide whose turn is next (or finish the hole).
function afterSettle(s: MatchState): void {
  const cur = s.turn;
  if (s.done[0] && s.done[1]) {
    finishHole(s);
    return;
  }
  const other = otherTurn(cur);
  // If the other player already holed out, the current player keeps shooting;
  // otherwise pass the turn. This guarantees the bot ALWAYS gets its turn and
  // no one waits forever (no soft-lock).
  s.turn = s.done[other] ? cur : other;
  s.phase = 'aiming';
}

function finishHole(s: MatchState): void {
  s.holeScores = s.holeScores.concat([[s.strokes[0], s.strokes[1]]]);
  s.phase = 'hole-done';
  s.timer = HOLE_TICKS;
  s.banner = 'Hole complete';
}

function advanceHole(s: MatchState): void {
  if (s.holeIdx >= s.holeOrder.length - 1) {
    resolveMatch(s);
    return;
  }
  s.holeIdx = s.holeIdx + 1;
  s.balls = [newBall(curHole(s).tee), newBall(curHole(s).tee)];
  s.strokes = [0, 0];
  s.done = [false, false];
  s.turn = 0;
  s.banner = '';
  s.phase = 'aiming';
}

function totals(s: MatchState): [number, number] {
  return s.holeScores.reduce<[number, number]>(
    (acc, h) => [acc[0] + h[0], acc[1] + h[1]],
    [0, 0],
  );
}

export function matchTotals(s: MatchState): [number, number] {
  return totals(s);
}

function resolveMatch(s: MatchState): void {
  const [you, bot] = totals(s);
  // Lower total strokes wins.
  s.winner = you < bot ? 0 : you > bot ? 1 : 'tie';
  s.matchOver = true;
  s.phase = 'match-over';
  s.banner =
    s.winner === 0 ? 'You win!' : s.winner === 1 ? 'Bot wins' : "It's a tie";
}

// Advance the match by exactly one logical frame. Drives physics while rolling
// and counts down the timed beats. Deterministic: same inputs -> same output.
export function tick(s: MatchState): MatchState {
  switch (s.phase) {
    case 'rolling': {
      const h = curHole(s);
      const who = s.turn;
      let nb = s.balls[who];
      // Two physics sub-steps per frame, matching the render loop.
      nb = step(nb, h);
      nb = step(nb, h);
      s.balls[who] = nb;
      s.rollTicks = s.rollTicks + 1;
      const stopped = !nb.moving || nb.sunk;
      if (stopped || s.rollTicks > MAX_ROLL_TICKS) {
        if (nb.sunk) {
          s.done[who] = true;
          s.banner = (who === 0 ? 'You' : 'Bot') + ' sunk it';
        } else {
          if (s.rollTicks > MAX_ROLL_TICKS) {
            // Safety net: force the ball to rest so the loop can never hang.
            s.balls[who] = { ...nb, vel: { x: 0, y: 0 }, moving: false };
          }
          // Stall-proofing: concede the hole at the stroke cap so the match
          // always progresses, even on a hole a player can't sink.
          if (s.strokes[who] >= MAX_STROKES_PER_HOLE) {
            s.done[who] = true;
            s.banner = (who === 0 ? 'You' : 'Bot') + ' conceded the hole';
          }
        }
        s.phase = 'settling';
        s.timer = SETTLE_TICKS;
      }
      return s;
    }
    case 'settling': {
      s.timer = s.timer - 1;
      if (s.timer <= 0) afterSettle(s);
      return s;
    }
    case 'hole-done': {
      s.timer = s.timer - 1;
      if (s.timer <= 0) advanceHole(s);
      return s;
    }
    default:
      return s;
  }
}

// Reset to a fresh match at hole 1 (Rematch). Keeps difficulty + hole order
// unless overridden (a rematch replays the same locked course).
export function rematch(s: MatchState, difficulty?: Difficulty, holeOrder?: number[]): MatchState {
  return createMatch(difficulty ?? s.difficulty, holeOrder ?? s.holeOrder);
}

export { speed };
