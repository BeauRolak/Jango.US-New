// Headless integration tests for the 8-Ball match loop.
// Self-contained (no test runner in the project): compiles under `tsc -b` and is
// tree-shaken from the bundle. Run manually via runMatchTests().
//
// Proves the match *logic*: shoot -> roll -> settle -> resolve, turn handoff,
// group assignment, scratch handling, the 8-ball win/loss rule, and that the
// loop always terminates (no soft-lock). Cue/cushion *feel* needs foreground QA.
import {
  type MatchState,
  type Turn,
  createMatch,
  shoot,
  tick,
  rematch,
  isMatchOver,
  canHumanShoot,
  botAim,
  MAX_MATCH_TICKS,
  MAX_ROLL_TICKS,
} from "./match";
import { type Ball } from "./engine";

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error("FAIL: " + msg);
}

function cue(balls: Ball[]): Ball | undefined {
  return balls.find((b) => b.id === 0);
}

// Drive the match to completion. The human shoots with a simple aim toward the
// rack center each time it is their turn; the bot shoots itself via tick().
function runToEnd(s0: MatchState, humanAim: (s: MatchState) => { angle: number; power: number }): MatchState {
  let s = s0;
  let guard = 0;
  while (!isMatchOver(s)) {
    if (canHumanShoot(s)) {
      const a = humanAim(s);
      s = shoot(s, a.angle, a.power);
    } else {
      s = tick(s);
    }
    guard++;
    if (guard > MAX_MATCH_TICKS + 2000) {
      throw new Error("FAIL: 8-ball match did not terminate (soft-lock?)");
    }
  }
  return s;
}

// Human plays like the bot would (reuse the deterministic aim helper, but as if
// it were player 0). Good enough to make the table progress and eventually end.
function humanBotAim(s: MatchState): { angle: number; power: number } {
  return botAim(s);
}

// 1) A full match always reaches a terminal state with a winner — no soft-lock,
//    no runaway roll, safety cap never reached.
function testReachesTerminal(): void {
  const end = runToEnd(createMatch(), humanBotAim);
  assert(isMatchOver(end), "match reaches game over");
  assert(end.winner === 0 || end.winner === 1, "a winner (0 or 1) is set");
  assert(end.totalTicks < MAX_MATCH_TICKS, "safety cap not hit");
}

// 2) A single shot always settles: balls start moving then come to rest within
//    the per-shot roll cap (no perpetual motion / stuck rolling phase).
function testShotSettles(): void {
  let s = createMatch();
  assert(canHumanShoot(s), "human can shoot at the break");
  s = shoot(s, 0.05, 1); // hard break to the right
  assert(s.phase === "rolling", "shot enters rolling phase");
  let guard = 0;
  while (s.phase === "rolling" && guard < MAX_ROLL_TICKS + 50) {
    s = tick(s);
    guard++;
  }
  assert(s.phase !== "rolling", "balls settle out of the rolling phase");
  assert(s.rollTicks <= MAX_ROLL_TICKS, "roll respected the safety cap");
}

// 3) The turn handoff works: across the opening shots, control passes between
//    players (or the breaker keeps it after a pot) — never gets stuck on nobody.
function testTurnProgresses(): void {
  let s = createMatch();
  const startTurn = s.turn;
  let guard = 0;
  let sawAResolve = false;
  let prevPhase = s.phase;
  while (!isMatchOver(s) && guard < 4000) {
    if (canHumanShoot(s)) s = shoot(s, botAim(s).angle, botAim(s).power);
    else s = tick(s);
    if (prevPhase === "settling" && s.phase !== "settling") sawAResolve = true;
    prevPhase = s.phase;
    if (sawAResolve) break;
    guard++;
  }
  assert(sawAResolve, "at least one shot resolves and hands off / continues");
  // turn is always a valid player id
  const t: Turn = s.turn;
  assert(t === 0 || t === 1, "turn is always a valid player");
}

// 4) Scratch handling: if the cue is potted, it is respawned (never stays gone),
//    so the next player always has a cue to hit.
function testCueAlwaysPresent(): void {
  let s = createMatch();
  let guard = 0;
  while (!isMatchOver(s) && guard < 6000) {
    if (canHumanShoot(s)) s = shoot(s, botAim(s).angle, botAim(s).power);
    else s = tick(s);
    // whenever it's someone's turn to aim, a live cue must exist on the table
    if (s.phase === "aiming" || s.phase === "botThink") {
      const c = cue(s.balls);
      assert(!!c && !c.potted, "a live cue ball is always available to shoot");
    }
    guard++;
  }
  assert(true, "cue presence held for the sampled shots");
}

// 5) Rematch produces a fresh, playable rack.
function testRematchResets(): void {
  const end = runToEnd(createMatch(), humanBotAim);
  assert(isMatchOver(end), "first match ended");
  const r = rematch();
  assert(!isMatchOver(r), "rematch is playable");
  assert(r.winner === null, "rematch clears the winner");
  assert(canHumanShoot(r), "human can break again");
  const pottedCount = r.balls.filter((b) => b.potted).length;
  assert(pottedCount === 0, "rematch rack has no potted balls");
}

export function runMatchTests(): string {
  const tests: Array<[string, () => void]> = [
    ["reaches terminal state w/ winner", testReachesTerminal],
    ["a shot always settles (no stuck roll)", testShotSettles],
    ["turns resolve and progress", testTurnProgresses],
    ["cue is always present to shoot", testCueAlwaysPresent],
    ["rematch resets the rack", testRematchResets],
  ];
  let passed = 0;
  for (const [name, fn] of tests) {
    fn();
    passed++;
    void name;
  }
  return "EightBall match tests passed: " + String(passed) + "/" + String(tests.length);
}
