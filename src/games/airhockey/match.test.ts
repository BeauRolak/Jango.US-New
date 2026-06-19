// Headless integration tests for the Air Hockey match loop.
// Self-contained (project has no test runner): compiles under `tsc -b` and is
// tree-shaken from the app bundle. Run manually via runMatchTests().
//
// Proves the match *logic* end-to-end: serve -> rally -> goal -> reset -> win,
// with no soft-locks and a real win condition. Look/feel (canvas, pointer feel,
// 60fps smoothness) still needs foreground QA — see GAME_QA.md.
import {
  type MatchState,
  createMatch,
  tick,
  rematch,
  isMatchOver,
  moveHuman,
  puckInBounds,
  TARGET_SCORE,
  MAX_MATCH_TICKS,
  SERVE_TICKS,
} from "./match";
import { type Difficulty, TABLE } from "./engine";

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error("FAIL: " + msg);
}

const DIFFS: Difficulty[] = ["easy", "medium", "hard"];

// Drive the match to completion. The "human" here is a simple tracking AI that
// chases the puck's x toward its own goal line, so rallies actually resolve and
// the match is guaranteed to progress rather than stall in an empty rally.
function runToEnd(s0: MatchState): MatchState {
  let s = s0;
  let guard = 0;
  while (!isMatchOver(s)) {
    if (s.phase === "playing") {
      // mirror the puck x on the bottom half to keep the rally alive
      const ty = TABLE.h - TABLE.h * 0.18;
      s = moveHuman(s, s.puck.x, ty);
    }
    s = tick(s);
    guard++;
    if (guard > MAX_MATCH_TICKS + 1000) {
      throw new Error("FAIL: Air Hockey match did not terminate (soft-lock?)");
    }
  }
  return s;
}

// 1) Every difficulty reaches a terminal state with a winner, without hitting the cap.
function testReachesTerminal(): void {
  for (const d of DIFFS) {
    const end = runToEnd(createMatch(d));
    assert(isMatchOver(end), "match over for difficulty " + String(d));
    assert(end.winner !== null, "a winner is set (" + String(d) + ")");
    assert(
      end.scoreHuman >= TARGET_SCORE || end.scoreBot >= TARGET_SCORE,
      "a player reached the target score (" + String(d) + ")",
    );
    assert(end.totalTicks < MAX_MATCH_TICKS, "safety cap not hit (" + String(d) + ")");
  }
}

// 2) At least one goal is actually scored during a match (rally -> goal works,
//    not just a timeout). Also: the puck never leaves a sane bounding box.
function testGoalsAndBounds(): void {
  let s = createMatch(DIFFS[1]);
  let sawGoalPhase = false;
  let guard = 0;
  while (!isMatchOver(s) && guard < MAX_MATCH_TICKS) {
    if (s.phase === "playing") s = moveHuman(s, s.puck.x, TABLE.h - TABLE.h * 0.18);
    s = tick(s);
    if (s.phase === "goal") sawGoalPhase = true;
    assert(puckInBounds(s), "puck stays within sane bounds");
    guard++;
  }
  assert(sawGoalPhase || isMatchOver(s), "at least one goal/reset beat occurred");
  assert(s.scoreHuman + s.scoreBot >= 1, "at least one goal was scored");
}

// 3) The serve beat always hands off to live play (no stuck serve / blank rally).
function testServeBecomesLive(): void {
  let s = createMatch(DIFFS[0]);
  assert(s.phase === "serve", "starts in a serve beat");
  // tick through the serve countdown; it must become "playing".
  let guard = 0;
  while (s.phase === "serve" && guard < SERVE_TICKS + 5) {
    s = tick(s);
    guard++;
  }
  assert(s.phase === "playing", "serve becomes live play");
}

// 4) moveHuman only affects the paddle during live play and never escapes the half.
function testHumanPaddleConstrained(): void {
  let s = createMatch(DIFFS[0]);
  // outside of play, moveHuman is a no-op
  const before = s.human;
  s = moveHuman(s, 9999, -9999);
  assert(s.human === before, "moveHuman is ignored when not live");
  // get to live play, then try to shove the paddle into the opponent half
  let guard = 0;
  while (s.phase !== "playing" && guard < SERVE_TICKS + 5) {
    s = tick(s);
    guard++;
  }
  s = moveHuman(s, TABLE.w / 2, -1000); // way into the top half
  assert(s.human.y > TABLE.h * 0.4, "human paddle stays on the bottom half");
}


// 5) Rematch fully resets the score and is immediately playable again.
function testRematchResets(): void {
  let s = runToEnd(createMatch(DIFFS[0]));
  assert(isMatchOver(s), "first match ended");
  const r = rematch(s);
  assert(r.scoreHuman === 0 && r.scoreBot === 0, "rematch zeroes the score");
  assert(!isMatchOver(r), "rematch is playable again");
  assert(r.winner === null, "rematch clears the winner");
}

// 6) Even a totally passive human (never moves the paddle) cannot soft-lock the
//    match: the anti-stall re-serve keeps play progressing to a terminal state.
function testNoStallPassiveHuman(): void {
  let s = createMatch(DIFFS[2]);
  let guard = 0;
  while (!isMatchOver(s) && guard < MAX_MATCH_TICKS + 1000) {
    // deliberately never call moveHuman — human paddle sits still
    s = tick(s);
    guard++;
  }
  assert(isMatchOver(s), "passive-human match still terminates (no soft-lock)");
  assert(s.winner !== null, "passive-human match has a winner");
}

export function runMatchTests(): string {
  const tests: Array<[string, () => void]> = [
    ["reaches terminal state w/ winner (all difficulties)", testReachesTerminal],
    ["goals score & puck stays in bounds", testGoalsAndBounds],
    ["serve beat becomes live play", testServeBecomesLive],
    ["human paddle stays constrained", testHumanPaddleConstrained],
    ["rematch resets score", testRematchResets],
    ["passive human cannot soft-lock", testNoStallPassiveHuman],
  ];
  let passed = 0;
  for (const [name, fn] of tests) {
    fn();
    passed++;
    void name;
  }
  return "AirHockey match tests passed: " + String(passed) + "/" + String(tests.length);
}
