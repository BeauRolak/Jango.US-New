// Basketball arcade engine: projectile shot physics + rim/backboard collision.
export const COURT = { w: 420, h: 600 };
export const BALL_R = 16;
export const GRAVITY = 0.42;
// Hoop geometry (rim is a horizontal segment; two rim posts as circles).
export const HOOP = {
  y: 150,
  cx: COURT.w / 2,
  rimHalf: 34, // half-width of rim opening
  postR: 5,
};

export const SHOOT_ORIGIN = { x: COURT.w / 2, y: COURT.h - 70 };

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Ball = {
  x: number; y: number; vx: number; vy: number;
  flying: boolean; scored: boolean; settled: boolean;
  passedRim: boolean;
};

export function makeBall(): Ball {
  return {
    x: SHOOT_ORIGIN.x, y: SHOOT_ORIGIN.y,
    vx: 0, vy: 0, flying: false, scored: false, settled: false, passedRim: false,
  };
}

// Launch the ball given an angle (radians, measured from +x axis, up is negative y)
// and power. power ~ 8..20.
export function shoot(b: Ball, angle: number, power: number) {
  b.vx = Math.cos(angle) * power;
  b.vy = -Math.sin(angle) * power;
  b.flying = true;
  b.scored = false;
  b.settled = false;
  b.passedRim = false;
}

const leftPost = () => ({ x: HOOP.cx - HOOP.rimHalf, y: HOOP.y });
const rightPost = () => ({ x: HOOP.cx + HOOP.rimHalf, y: HOOP.y });

function bounceOffPost(b: Ball, post: { x: number; y: number }) {
  const dx = b.x - post.x;
  const dy = b.y - post.y;
  const dist = Math.hypot(dx, dy);
  const min = BALL_R + HOOP.postR;
  if (dist < min && dist > 0.001) {
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = min - dist;
    b.x += nx * overlap;
    b.y += ny * overlap;
    const dot = b.vx * nx + b.vy * ny;
    b.vx = (b.vx - 2 * dot * nx) * 0.6;
    b.vy = (b.vy - 2 * dot * ny) * 0.6;
  }
}

export type StepOut = { justScored: boolean; settled: boolean };

// Advance one frame. Detects a clean swish/score when the ball descends
// through the rim opening.
export function step(b: Ball): StepOut {
  if (!b.flying) return { justScored: false, settled: false };
  const prevY = b.y;
  b.vy += GRAVITY;
  b.x += b.vx;
  b.y += b.vy;

  // walls
  if (b.x < BALL_R) { b.x = BALL_R; b.vx = Math.abs(b.vx) * 0.6; }
  if (b.x > COURT.w - BALL_R) { b.x = COURT.w - BALL_R; b.vx = -Math.abs(b.vx) * 0.6; }

  // backboard: vertical wall behind rim, above the hoop line
  const boardX = HOOP.cx + HOOP.rimHalf + 18;
  if (b.y < HOOP.y - 30 && b.x + BALL_R > boardX && b.vx > 0) {
    b.x = boardX - BALL_R; b.vx = -Math.abs(b.vx) * 0.55;
  }

  // rim posts
  bounceOffPost(b, leftPost());
  bounceOffPost(b, rightPost());

  let justScored = false;
  // score: ball center crosses the rim plane downward, within the opening
  if (!b.scored && b.vy > 0 && prevY <= HOOP.y && b.y >= HOOP.y) {
    const within = Math.abs(b.x - HOOP.cx) < HOOP.rimHalf - 4;
    if (within) { b.scored = true; justScored = true; b.passedRim = true; }
  }

  // settle when it falls below the court or slows on floor
  let settled = false;
  if (b.y > COURT.h + BALL_R * 2) { settled = true; b.flying = false; b.settled = true; }

  return { justScored, settled };
}

const BOT_ACC: Record<Difficulty, number> = { easy: 0.55, medium: 0.78, hard: 0.94 };

// Bot computes an angle+power that would roughly reach the hoop, with
// difficulty-scaled error. Returns the params to feed shoot().
export function botShot(diff: Difficulty): { angle: number; power: number } {
  const acc = BOT_ACC[diff];
  // ideal-ish arc toward the hoop
  const dx = HOOP.cx - SHOOT_ORIGIN.x;
  const dy = SHOOT_ORIGIN.y - HOOP.y;
  const baseAngle = Math.atan2(dy + 120, Math.max(40, Math.abs(dx) + 60));
  const basePower = 15.2;
  const err = (1 - acc);
  const angle = baseAngle + (Math.random() - 0.5) * err * 0.5;
  const power = basePower + (Math.random() - 0.5) * err * 6;
  return { angle, power };
}
