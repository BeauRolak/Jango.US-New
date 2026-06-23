import {
  type Ball,
  rack,
  step,
  strike,
  anyMoving,
  pockets,
  TABLE,
  BALL_R,
} from "./engine";
import type { Difficulty } from "../../game/types";

// Deterministic, tick-based 8-Ball match controller.
// The physics (ball integration, cushions, pocket detection) lives in engine.step();
// this layer owns the *match*: turns, group assignment (solids/stripes), fouls
// (scratch), the 8-ball win/loss rule, and a simple aiming bot. Everything is
// frame-counted + pure so the whole match runs headlessly in tests.

export type Group = "solid" | "stripe";
export type Turn = 0 | 1; // 0 = human, 1 = bot

export const SETTLE_TICKS = 12; // brief beat after balls stop before resolving
export const BOT_THINK_TICKS = 30; // bot "lines up" beat before it strikes
export const MAX_ROLL_TICKS = 1500; // safety cap on a single shot's roll
export const MAX_MATCH_TICKS = 120000; // hard safety cap on the whole match
export const RESULT_TICKS = 60;

export type Phase =
  | "aiming" // waiting for the current player to take a shot
  | "botThink" // bot is lining up (timed beat)
  | "rolling" // balls in motion — physics each tick
  | "settling" // balls stopped — brief beat before resolving the shot
  | "gameOver";

export interface MatchState {
  balls: Ball[];
  difficulty: Difficulty;
  turn: Turn;
  phase: Phase;
  timer: number;
  rollTicks: number;
  totalTicks: number;
  groups: [Group | null, Group | null]; // assigned group per player (null until "open" table resolves)
  pottedThisShot: number[];
  banner: string;
  winner: Turn | null;
  foul: boolean;
}

function isSolidId(id: number): boolean {
  return id >= 1 && id <= 7;
}
function isStripeId(id: number): boolean {
  return id >= 9 && id <= 15;
}
function groupOfId(id: number): Group | null {
  if (isSolidId(id)) return "solid";
  if (isStripeId(id)) return "stripe";
  return null; // cue (0) or eight (8)
}

export function createMatch(difficulty: Difficulty = "medium"): MatchState {
  return {
    balls: rack(),
    difficulty,
    turn: 0,
    phase: "aiming",
    timer: 0,
    rollTicks: 0,
    totalTicks: 0,
    groups: [null, null],
    pottedThisShot: [],
    banner: "Your break — take a shot",
    winner: null,
    foul: false,
  };
}

export function canHumanShoot(s: MatchState): boolean {
  return s.phase === "aiming" && s.turn === 0 && s.winner === null;
}

function cueBall(balls: Ball[]): Ball | undefined {
  return balls.find((b) => b.id === 0);
}

// Take a shot for the current player at the given angle (radians) + power (0..1).
export function shoot(s: MatchState, angle: number, power: number, english?: { f: number; s: number }): MatchState {
  if (s.phase !== "aiming" && s.phase !== "botThink") return s;
  if (s.winner !== null) return s;
  const cue = cueBall(s.balls);
  if (!cue || cue.potted) return s;
  // mutate a cloned cue so state stays pure at the call boundary
  const balls = s.balls.map((b) => ({ ...b }));
  const c = cueBall(balls);
  if (!c) return s;
  const p = Math.max(0.15, Math.min(1, power));
  strike(c, angle, p);
  // attach english only when the human applied some — keeps bot sims deterministic
  if (english && (Math.abs(english.f) > 0.01 || Math.abs(english.s) > 0.01)) {
    c.eng = { f: english.f, s: english.s, dir: angle };
  }
  return {
    ...s,
    balls,
    phase: "rolling",
    rollTicks: 0,
    pottedThisShot: [],
    banner: s.turn === 0 ? "Rolling…" : "Bot shoots…",
  };
}

function angDiff(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

// Run a candidate shot against the real physics, headlessly, and report what it
// pocketed and whether it scratched. This is what makes the bot actually sink
// balls (a blind ghost-ball aim misses far too often to ever finish a game).
function simulateShot(balls: Ball[], angle: number, power: number): { potted: number[]; scratch: boolean } {
  const sim = balls.map((b) => ({ ...b }));
  const c = sim.find((b) => b.id === 0);
  if (!c) return { potted: [], scratch: true };
  strike(c, angle, Math.max(0.15, Math.min(1, power)));
  const potted: number[] = [];
  let t = 0;
  while (anyMoving(sim) && t < MAX_ROLL_TICKS) {
    const pn = step(sim);
    for (const id of pn) potted.push(id);
    t += 1;
  }
  const cc = sim.find((b) => b.id === 0);
  return { potted, scratch: !cc || cc.potted };
}

// Simulation-based aiming bot. Enumerates legal target x pocket candidates,
// simulates each against the physics, scores by what it legally pockets (and
// penalizes scratches / illegal 8s), then applies difficulty (search window +
// aim/power error). Always returns a valid shot so a turn can never stall.
export function botAim(s: MatchState): { angle: number; power: number } {
  const balls = s.balls;
  const cue = cueBall(balls);
  if (!cue) return { angle: 0, power: 0.6 };
  const shooter = s.turn;
  const myGroup = s.groups[shooter];
  const cleared = myGroup !== null && groupClearedExcluding8(balls, myGroup);
  const targets = balls.filter((b) => {
    if (b.potted || b.id === 0) return false;
    if (myGroup === null) return b.id !== 8; // open table: anything but the 8
    if (b.id === 8) return cleared;          // the 8 only once the group is cleared
    return groupOfId(b.id) === myGroup;
  });
  const aimTargets = targets.length ? targets : balls.filter((b) => !b.potted && b.id !== 0);
  const pks = pockets();

  type Cand = { angle: number; power: number; score: number };
  const cands: Cand[] = [];
  for (const tb of aimTargets) {
    const near = pks
      .slice()
      .sort((p, q) => Math.hypot(p.x - tb.x, p.y - tb.y) - Math.hypot(q.x - tb.x, q.y - tb.y))
      .slice(0, 3);
    for (const pk of near) {
      const ax = tb.x - pk.x, ay = tb.y - pk.y;
      const am = Math.hypot(ax, ay) || 1;
      const ghostX = tb.x + (ax / am) * (BALL_R * 2);
      const ghostY = tb.y + (ay / am) * (BALL_R * 2);
      const angle = Math.atan2(ghostY - cue.y, ghostX - cue.x);
      const dist = Math.hypot(ghostX - cue.x, ghostY - cue.y) + Math.hypot(pk.x - tb.x, pk.y - tb.y);
      const power = Math.max(0.42, Math.min(1, 0.45 + dist / (TABLE.w * 1.7)));
      const res = simulateShot(balls, angle, power);
      let score = 0;
      if (res.scratch) score -= 1000;
      for (const id of res.potted) {
        if (id === 8) {
          score += (myGroup !== null && cleared && !res.scratch) ? 6000 : -6000;
        } else if (myGroup === null) {
          score += groupOfId(id) !== null ? 90 : 0;
        } else if (groupOfId(id) === myGroup) {
          score += 130;
        } else {
          score -= 60; // pocketed an opponent ball
        }
      }
      // prefer straighter cuts (easier, more repeatable shots)
      const cut = Math.abs(angDiff(Math.atan2(tb.y - cue.y, tb.x - cue.x), Math.atan2(pk.y - tb.y, pk.x - tb.x)));
      score -= cut * 8;
      cands.push({ angle, power, score });
    }
  }
  if (!cands.length) return { angle: 0, power: 0.5 };
  cands.sort((a, b) => b.score - a.score);

  const diff = s.difficulty;
  const pickN = diff === "hard" ? 1 : diff === "medium" ? 3 : 7;
  const errAng = diff === "hard" ? 0.012 : diff === "medium" ? 0.05 : 0.14;
  const errPow = diff === "hard" ? 0.02 : diff === "medium" ? 0.08 : 0.18;
  const top = Math.min(pickN, cands.length);
  const chosen = cands[Math.floor(Math.random() * top)];
  return {
    angle: chosen.angle + (Math.random() * 2 - 1) * errAng,
    power: Math.max(0.2, Math.min(1, chosen.power * (1 + (Math.random() * 2 - 1) * errPow))),
  };
}

// Resolve the outcome of a shot once all balls have stopped.
function resolveShot(s: MatchState): MatchState {
  const potted = s.pottedThisShot;
  const cue = cueBall(s.balls);
  const scratched = !cue || cue.potted;
  const eightPotted = potted.includes(8);
  const me = s.turn;

  // 8-ball resolution
  if (eightPotted) {
    const myGroup = s.groups[me];
    const legal = myGroup !== null && groupClearedExcluding8(s.balls, myGroup) && !scratched;
    const winner: Turn = legal ? me : ((me === 0 ? 1 : 0) as Turn);
    return {
      ...s,
      phase: "gameOver",
      timer: RESULT_TICKS,
      winner,
      banner: legal
        ? me === 0
          ? "You sink the 8 — you win!"
          : "Bot sinks the 8 — bot wins"
        : "8-ball foul — game lost",
    };
  }

  // assign groups on the first legal pot when the table is open
  let groups = s.groups;
  if (groups[me] === null && !scratched) {
    const firstGroupPot = potted.map(groupOfId).find((g) => g !== null) ?? null;
    if (firstGroupPot) {
      const other: Group = firstGroupPot === "solid" ? "stripe" : "solid";
      groups =
        me === 0 ? [firstGroupPot, other] : [other, firstGroupPot];
    }
  }

  const pottedOwn =
    !scratched &&
    groups[me] !== null &&
    potted.some((id) => groupOfId(id) === groups[me]);
  const pottedAnyWhenOpen =
    !scratched && groups[me] === null && potted.some((id) => groupOfId(id) !== null);

  // The shooter keeps the table if they legally potted one of their own (or any
  // when the table is still open) and did not scratch.
  const keepTurn = (pottedOwn || pottedAnyWhenOpen) && !scratched;

  let balls = s.balls;
  if (scratched && cue) {
    // ball-in-hand simplification: respawn the cue at the head spot.
    balls = s.balls.map((b) =>
      b.id === 0 ? { ...b, potted: false, x: TABLE.w * 0.25, y: TABLE.h / 2, vx: 0, vy: 0 } : b,
    );
  }

  const nextTurn: Turn = keepTurn ? me : ((me === 0 ? 1 : 0) as Turn);
  const nextPhase: Phase = nextTurn === 1 ? "botThink" : "aiming";
  return {
    ...s,
    balls,
    groups,
    turn: nextTurn,
    phase: nextPhase,
    timer: nextPhase === "botThink" ? BOT_THINK_TICKS : 0,
    foul: scratched,
    pottedThisShot: [],
    banner: scratched
      ? nextTurn === 0
        ? "Scratch! Your shot (ball in hand)"
        : "Scratch — bot's shot"
      : keepTurn
        ? me === 0
          ? "Nice! Go again"
          : "Bot pots and continues"
        : nextTurn === 0
          ? "Your shot"
          : "Bot's shot",
  };
}

function groupClearedExcluding8(balls: Ball[], g: Group): boolean {
  return !balls.some((b) => !b.potted && groupOfId(b.id) === g);
}

// Advance the match exactly one tick. Pure.
export function tick(s: MatchState): MatchState {
  if (s.totalTicks >= MAX_MATCH_TICKS) {
    if (s.phase === "gameOver") return s;
    // Pathological stalemate guard: never freeze. Resolve by fewest balls left.
    const left = (t: Turn): number => {
      const g = s.groups[t];
      if (g === null) return 99;
      return s.balls.filter((b) => !b.potted && groupOfId(b.id) === g).length;
    };
    const winner: Turn = left(0) <= left(1) ? 0 : 1;
    return { ...s, phase: "gameOver", timer: RESULT_TICKS, winner, banner: "Time — fewest balls left wins" };
  }
  let st: MatchState = { ...s, totalTicks: s.totalTicks + 1 };

  switch (st.phase) {
    case "aiming":
      return st;

    case "botThink":
      if (st.timer > 0) {
        st = { ...st, timer: st.timer - 1 };
        if (st.timer > 0) return st;
      }
      {
        const aim = botAim(st);
        return shoot(st, aim.angle, aim.power);
      }

    case "rolling": {
      const balls = st.balls.map((b) => ({ ...b }));
      const pottedNow = step(balls);
      const pottedThisShot = pottedNow.length
        ? st.pottedThisShot.concat(pottedNow)
        : st.pottedThisShot;
      const rollTicks = st.rollTicks + 1;
      st = { ...st, balls, pottedThisShot, rollTicks };
      if (!anyMoving(balls) || rollTicks >= MAX_ROLL_TICKS) {
        return { ...st, phase: "settling", timer: SETTLE_TICKS };
      }
      return st;
    }

    case "settling":
      if (st.timer > 0) {
        st = { ...st, timer: st.timer - 1 };
        if (st.timer > 0) return st;
      }
      return resolveShot(st);

    case "gameOver":
      if (st.timer > 0) st = { ...st, timer: st.timer - 1 };
      return st;

    default:
      return st;
  }
}

export function isMatchOver(s: MatchState): boolean {
  return s.phase === "gameOver";
}

export function rematch(difficulty?: Difficulty): MatchState {
  return createMatch(difficulty);
}
