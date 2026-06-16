// Cup King engine: toss a ball in an arc to land in cups (beer-pong style).
export const STAGE = { w: 400, h: 620 };
export const BALL_R = 10;
export const CUP_R = 24;
export const GRAVITY = 0.4;
export const THROW_ORIGIN = { x: STAGE.w / 2, y: STAGE.h - 60 };

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Cup = { x: number; y: number; made: boolean };
export type Ball = {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  flying: boolean; settled: boolean;
};

export function makeBall(): Ball {
  return { x: THROW_ORIGIN.x, y: THROW_ORIGIN.y, z: 0, vx: 0, vy: 0, vz: 0, flying: false, settled: false };
}

// Standard 10-cup pyramid near the top of the stage.
export function makeCups(): Cup[] {
  const cups: Cup[] = [];
  const rows = [4, 3, 2, 1];
  const topY = 90;
  rows.forEach((count, r) => {
    for (let i = 0; i < count; i++) {
      const x = STAGE.w / 2 + (i - (count - 1) / 2) * (CUP_R * 2 + 6);
      const y = topY + r * (CUP_R * 1.7);
      cups.push({ x, y, made: false });
    }
  });
  return cups;
}

// Throw: aimX -1..1 horizontal, power 0..1 controls distance up-table.
export function toss(b: Ball, aimX: number, power: number) {
  b.vx = aimX * 4.5;
  b.vy = -(5 + power * 7);
  b.vz = 6 + power * 7;
  b.flying = true;
  b.settled = false;
}

export type StepOut = { madeIdx: number; settled: boolean };

// Advance ball; when it descends (vz<0) near a cup mouth, it is made.
export function step(b: Ball, cups: Cup[]): StepOut {
  if (!b.flying) return { madeIdx: -1, settled: false };
  b.vy += GRAVITY * 0.35;
  b.vz -= GRAVITY;
  b.x += b.vx;
  b.y += b.vy;
  b.z += b.vz;

  let madeIdx = -1;
  if (b.vz < 0 && b.z < 28) {
    for (let i = 0; i < cups.length; i++) {
      const c = cups[i];
      if (c.made) continue;
      const d = Math.hypot(b.x - c.x, b.y - c.y);
      if (d < CUP_R - 4) { madeIdx = i; break; }
    }
  }

  let settled = false;
  if (madeIdx >= 0) { settled = true; b.flying = false; b.settled = true; }
  else if (b.z <= 0 || b.y < 30 || b.x < 0 || b.x > STAGE.w) {
    settled = true; b.flying = false; b.settled = true;
  }
  return { madeIdx, settled };
}

const BOT_ACC: Record<Difficulty, number> = { easy: 0.55, medium: 0.78, hard: 0.94 };

// Bot aims at the nearest un-made cup with difficulty-scaled error.
export function botToss(cups: Cup[], diff: Difficulty): { aimX: number; power: number } {
  const acc = BOT_ACC[diff];
  const targets = cups.filter((c) => !c.made);
  const target = targets[Math.floor(Math.random() * targets.length)] || cups[0];
  const dx = target.x - THROW_ORIGIN.x;
  const dy = THROW_ORIGIN.y - target.y;
  const idealAim = Math.max(-1, Math.min(1, dx / 120));
  const idealPower = Math.max(0.3, Math.min(1, dy / 480));
  const err = 1 - acc;
  return {
    aimX: idealAim + (Math.random() - 0.5) * err * 0.7,
    power: idealPower + (Math.random() - 0.5) * err * 0.35,
  };
}

export function allMade(cups: Cup[]): boolean {
  return cups.every((c) => c.made);
}
