import {
  type Puck,
  type Paddle,
  type Side,
  type Difficulty,
  makePuck,
  makePaddle,
  serve,
  constrainPaddle,
  step,
  botMove,
  TABLE,
} from "./engine";

// Deterministic, tick-based Air Hockey match controller.
// The raw physics (puck/paddle integration, wall bounces, goal detection) lives
// in engine.step(); this layer owns the *match*: score, serving, the post-goal
// reset beat, the bot's paddle, and the first-to-N win condition. Everything is
// frame-counted and pure so the entire match can be driven headlessly by tests
// (the real component would call tick() from requestAnimationFrame instead).

export const TARGET_SCORE = 7; // first to 7 goals wins the match
export const SERVE_TICKS = 36; // ~600ms pause after a goal / at kickoff before play
export const RESULT_TICKS = 60; // ~1s beat on match point before rematch is offered
export const MAX_MATCH_TICKS = 60000; // hard safety cap (~16min) — must never be hit
export const STALL_TICKS = 90; // if the puck idles ~1.5s mid-rally, re-serve it (anti soft-lock)
export const PUCK_IDLE_SPEED = 0.6; // |v| below this counts as "idle"

// The human controls the BOTTOM paddle; the bot controls the TOP paddle.
// engine.step() reports goal:"top" when the puck enters the TOP goal (human scores)
// and goal:"bottom" when it enters the BOTTOM goal (bot scores).
export type Phase =
  | "serve" // brief pause, puck centered, about to be served
  | "playing" // live rally — input + physics each tick
  | "goal" // a goal just landed — short reset beat
  | "matchOver"; // someone reached TARGET_SCORE

export interface MatchState {
  difficulty: Difficulty;
  target: number; // first to this many goals wins
  puck: Puck;
  human: Paddle; // bottom
  bot: Paddle; // top
  phase: Phase;
  timer: number;
  totalTicks: number;
  stallTicks: number; // consecutive ticks the puck has been idle during play
  scoreHuman: number;
  scoreBot: number;
  serveToward: Side; // who the next serve heads toward
  banner: string;
  winner: "human" | "bot" | null;
}

export function createMatch(difficulty: Difficulty, target: number = TARGET_SCORE): MatchState {
  const puck = makePuck();
  return {
    difficulty,
    target,
    puck,
    human: makePaddle("bottom"),
    bot: makePaddle("top"),
    phase: "serve",
    timer: SERVE_TICKS,
    totalTicks: 0,
    stallTicks: 0,
    scoreHuman: 0,
    scoreBot: 0,
    serveToward: "top",
    banner: "Get ready…",
    winner: null,
  };
}

export function isLive(s: MatchState): boolean {
  return s.phase === "playing";
}

// Move the human paddle toward a target point (e.g. pointer position), then
// re-constrain it to its own half. Safe to call any time; ignored when not live.
export function moveHuman(s: MatchState, x: number, y: number): MatchState {
  if (s.phase !== "playing") return s;
  const human: Paddle = { ...s.human, px: s.human.x, py: s.human.y, x, y };
  constrainPaddle(human, "bottom");
  return { ...s, human };
}

function kickoff(s: MatchState): MatchState {
  const puck = makePuck();
  serve(puck, s.serveToward);
  return { ...s, puck, phase: "playing", timer: 0, stallTicks: 0, banner: "Go!" };
}

// Advance the match exactly one tick (one physics frame). Pure.
export function tick(s: MatchState): MatchState {
  if (s.totalTicks >= MAX_MATCH_TICKS) return s;
  let st: MatchState = { ...s, totalTicks: s.totalTicks + 1 };

  switch (st.phase) {
    case "serve":
      if (st.timer > 0) {
        st = { ...st, timer: st.timer - 1 };
        if (st.timer > 0) return st;
      }
      return kickoff(st);

    case "playing": {
      // Bot moves its (top) paddle, then physics integrates one frame.
      const bot: Paddle = { ...st.bot, px: st.bot.x, py: st.bot.y };
      botMove(bot, st.puck, st.difficulty);
      constrainPaddle(bot, "top");
      const puck: Puck = { ...st.puck };
      const human: Paddle = { ...st.human };
      const res = step(puck, bot, human);
      st = { ...st, puck, bot, human };
      if (res.goal === null) {
        // Anti soft-lock: if the puck idles mid-table too long, re-serve it.
        const sp = Math.hypot(st.puck.vx, st.puck.vy);
        if (sp < PUCK_IDLE_SPEED) {
          const stall = st.stallTicks + 1;
          if (stall >= STALL_TICKS) {
            const puck2: Puck = { ...st.puck };
            serve(puck2, st.serveToward);
            return { ...st, puck: puck2, stallTicks: 0 };
          }
          return { ...st, stallTicks: stall };
        }
        return { ...st, stallTicks: 0 };
      }
      // A goal landed. goal:"top" => human scored; goal:"bottom" => bot scored.
      const humanScored = res.goal === "top";
      const scoreHuman = st.scoreHuman + (humanScored ? 1 : 0);
      const scoreBot = st.scoreBot + (humanScored ? 0 : 1);
      // Loser serves next (toward the scorer keeps rallies lively).
      const serveToward: Side = humanScored ? "bottom" : "top";
      if (scoreHuman >= st.target || scoreBot >= st.target) {
        return {
          ...st,
          scoreHuman,
          scoreBot,
          phase: "matchOver",
          timer: RESULT_TICKS,
          winner: scoreHuman >= st.target ? "human" : "bot",
          banner: scoreHuman >= st.target ? "You win the match!" : "Bot takes the match",
        };
      }
      return {
        ...st,
        scoreHuman,
        scoreBot,
        serveToward,
        phase: "goal",
        timer: SERVE_TICKS,
        banner: humanScored ? "You scored!" : "Bot scores",
      };
    }

    case "goal":
      if (st.timer > 0) {
        st = { ...st, timer: st.timer - 1 };
        if (st.timer > 0) return st;
      }
      // Reset puck to center and go back to a serve beat.
      return {
        ...st,
        puck: makePuck(),
        phase: "serve",
        timer: SERVE_TICKS,
        banner: "Get ready…",
      };

    case "matchOver":
      if (st.timer > 0) st = { ...st, timer: st.timer - 1 };
      return st;

    default:
      return st;
  }
}

export function isMatchOver(s: MatchState): boolean {
  return s.phase === "matchOver";
}

export function rematch(s: MatchState, difficulty?: Difficulty, target?: number): MatchState {
  return createMatch(difficulty ?? s.difficulty, target ?? s.target);
}

// Exposed for tests / debug overlays: a coarse "is the puck on the table" check.
export function puckInBounds(s: MatchState): boolean {
  return (
    s.puck.x >= -TABLE.w &&
    s.puck.x <= TABLE.w * 2 &&
    s.puck.y >= -TABLE.h &&
    s.puck.y <= TABLE.h * 2
  );
}
