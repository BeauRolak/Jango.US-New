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

export interface MatchState {
  difficulty: Difficulty;
  holeIdx: number;
  turn: Turn;
  ball: BallState;
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

function hole(idx: number): Hole {
  return HOLES[idx];
}

export function createMatch(difficulty: Difficulty): MatchState {
  return {
    difficulty,
    holeIdx: 0,
    turn: 0,
    ball: newBall(HOLES[0].tee),
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
  s.ball = launch(s.ball, dragX, dragY);
  s.strokes[who] = s.strokes[who] + 1;
  s.phase = 'rolling';
  s.rollTicks = 0;
  return s;
}

// Ask the bot for its shot and apply it. Bot uses NO real Scalps; pure input.
export function botPlay(s: MatchState): MatchState {
  if (!isBotTurn(s)) return s;
  const shot = botShot(s.ball, hole(s.holeIdx), s.difficulty);
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
  if (s.holeIdx >= HOLES.length - 1) {
    resolveMatch(s);
    return;
  }
  s.holeIdx = s.holeIdx + 1;
  s.ball = newBall(HOLES[s.holeIdx].tee);
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
      let nb = s.ball;
      // Two physics sub-steps per frame, matching the render loop.
      nb = step(nb, hole(s.holeIdx));
      nb = step(nb, hole(s.holeIdx));
      s.ball = nb;
      s.rollTicks = s.rollTicks + 1;
      const stopped = !nb.moving || nb.sunk;
      if (stopped || s.rollTicks > MAX_ROLL_TICKS) {
        const who = s.turn;
        if (nb.sunk) {
          s.done[who] = true;
          s.banner = (who === 0 ? 'You' : 'Bot') + ' sunk it';
        } else if (s.rollTicks > MAX_ROLL_TICKS) {
          // Safety net: force the ball to rest so the loop can never hang.
          s.ball = { ...nb, vel: { x: 0, y: 0 }, moving: false };
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

// Reset to a fresh match at hole 1 (Rematch). Keeps difficulty unless changed.
export function rematch(s: MatchState, difficulty?: Difficulty): MatchState {
  return createMatch(difficulty ?? s.difficulty);
}

export { speed };
