// Football field-goal engine: kick projectile with wind + goalpost detection.
export const FIELD = { w: 420, h: 620 };
export const BALL_R = 12;
export const GRAVITY = 0.32;
// Goalpost: uprights near the top of the field.
export const GOAL = {
  y: 110,
  cx: FIELD.w / 2,
  half: 70, // half distance between uprights
  crossbar: 110, // y of crossbar (must clear, i.e. ball.y < crossbar at goal line)
};
export const KICK_ORIGIN = { x: FIELD.w / 2, y: FIELD.h - 80 };

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Ball = {
  x: number; y: number; z: number; // z = simulated height for arc visual
  vx: number; vy: number; vz: number;
  flying: boolean; settled: boolean; result: 'none' | 'good' | 'miss';
};

export function makeBall(): Ball {
  return { x: KICK_ORIGIN.x, y: KICK_ORIGIN.y, z: 0, vx: 0, vy: 0, vz: 0, flying: false, settled: false, result: 'none' };
}

export type Wind = { x: number };

export function randomWind(): Wind {
  return { x: (Math.random() - 0.5) * 0.18 };
}

// Kick: aim is horizontal offset (-1..1), power 0..1.
export function kick(b: Ball, aimX: number, power: number) {
  b.vx = aimX * 6;
  b.vy = -(6 + power * 9); // travels up-field (negative y)
  b.vz = 5 + power * 8;
  b.flying = true;
  b.settled = false;
  b.result = 'none';
}

export type StepOut = { result: 'none' | 'good' | 'miss'; settled: boolean };

export function step(b: Ball, wind: Wind): StepOut {
  if (!b.flying) return { result: 'none', settled: false };
  const prevY = b.y;
  b.vx += wind.x;
  b.vy += GRAVITY * 0.4; // slows up-field travel
  b.vz -= GRAVITY;
  b.x += b.vx;
  b.y += b.vy;
  b.z += b.vz;
  if (b.z < 0) b.z = 0;

  // crossing the goal line (moving up-field through GOAL.y)
  if (b.result === 'none' && b.vy < 0 && prevY >= GOAL.y && b.y <= GOAL.y) {
    const withinPosts = Math.abs(b.x - GOAL.cx) < GOAL.half;
    const overBar = b.z > 14; // cleared the crossbar height
    if (withinPosts && overBar) { b.result = 'good'; }
    else { b.result = 'miss'; }
  }

  // settle: came back to ground past the goal or off field
  let settled = false;
  if (b.y < GOAL.y - 60 || b.x < -20 || b.x > FIELD.w + 20 || (b.z <= 0 && b.vz <= 0 && b.y < KICK_ORIGIN.y - 40)) {
    settled = true; b.flying = false; b.settled = true;
    if (b.result === 'none') b.result = 'miss';
  }
  return { result: b.result, settled };
}

const BOT_ACC: Record<Difficulty, number> = { easy: 0.5, medium: 0.76, hard: 0.93 };

// Bot computes an aim + power to attempt a field goal, factoring wind, with error.
export function botKick(diff: Difficulty, wind: Wind): { aimX: number; power: number } {
  const acc = BOT_ACC[diff];
  // compensate for wind by aiming into it
  const windComp = -wind.x * 3.2 * acc;
  const aimX = windComp + (Math.random() - 0.5) * (1 - acc) * 0.8;
  const power = 0.7 + (Math.random() - 0.5) * (1 - acc) * 0.5;
  return { aimX: Math.max(-1, Math.min(1, aimX)), power: Math.max(0.4, Math.min(1, power)) };
}
