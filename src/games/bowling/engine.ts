// Ten-pin bowling engine: standard scoring + roll outcome model

export type Difficulty = 'easy' | 'medium' | 'hard';

// A frame holds up to 3 rolls (10th frame). Values are pins downed per roll.
export type Frame = number[];

export type Player = {
  name: string;
  frames: Frame[];
  isBot: boolean;
};

export function newPlayer(name: string, isBot: boolean): Player {
  return { name, frames: [[]], isBot };
}

export function isStrike(f: Frame): boolean {
  return f.length >= 1 && f[0] === 10;
}

export function isSpare(f: Frame): boolean {
  return !isStrike(f) && f.length >= 2 && f[0] + f[1] === 10;
}

// Total pins in a frame (used for the 10th frame fill balls)
function frameSum(f: Frame): number {
  return f.reduce((a, b) => a + b, 0);
}

// Standard cumulative bowling score with strike/spare bonuses.
export function score(frames: Frame[]): number[] {
  const cum: number[] = [];
  let total = 0;
  // flatten all rolls for bonus lookups
  const rolls: number[] = [];
  const rollStart: number[] = [];
  frames.forEach((f) => { rollStart.push(rolls.length); f.forEach((r) => rolls.push(r)); });

  for (let i = 0; i < 10 && i < frames.length; i++) {
    const f = frames[i];
    if (f.length === 0) { break; }
    const start = rollStart[i];
    let frameScore = 0;
    if (i < 9 && isStrike(f)) {
      frameScore = 10 + (rolls[start + 1] || 0) + (rolls[start + 2] || 0);
    } else if (i < 9 && isSpare(f)) {
      frameScore = 10 + (rolls[start + 2] || 0);
    } else {
      frameScore = frameSum(f);
    }
    total += frameScore;
    cum.push(total);
  }
  return cum;
}

export function totalScore(frames: Frame[]): number {
  const c = score(frames);
  return c.length ? c[c.length - 1] : 0;
}

// How many pins remain standing for the current ball in a frame.
export function pinsRemaining(frameIndex: number, f: Frame): number {
  if (frameIndex < 9) {
    if (f.length === 0) return 10;
    return 10 - f[0];
  }
  // 10th frame logic
  if (f.length === 0) return 10;
  if (f.length === 1) {
    return f[0] === 10 ? 10 : 10 - f[0];
  }
  if (f.length === 2) {
    // a 3rd ball is awarded on strike or spare
    if (f[0] === 10) {
      return f[1] === 10 ? 10 : 10 - f[1];
    }
    if (f[0] + f[1] === 10) return 10;
  }
  return 0;
}

// Is the player's frame complete (no more balls this frame)?
export function frameComplete(frameIndex: number, f: Frame): boolean {
  if (frameIndex < 9) {
    return isStrike(f) || f.length === 2;
  }
  // 10th frame
  if (f.length < 2) return false;
  if (f.length === 2) {
    return !(f[0] === 10 || f[0] + f[1] === 10);
  }
  return f.length === 3;
}

// Aim is -1..1 (lane offset at release). Power 0..1. Returns pins knocked
// for this ball given how many are standing, with accuracy noise.
export function rollResult(aim: number, power: number, standing: number): number {
  // ideal aim near 0 with strong power maximizes pins.
  const aimErr = Math.abs(aim);
  // pocket accuracy: best when aim is slightly off-center (0.08) like a real pocket
  const pocket = Math.abs(aim - 0.08 * Math.sign(aim || 1));
  const accuracy = Math.max(0, 1 - pocket * 1.6) * (0.55 + power * 0.45);
  const noise = (Math.random() - 0.5) * 0.22;
  const frac = Math.min(1, Math.max(0, accuracy + noise));
  let pins = Math.round(standing * frac);
  // small chance the pocket gives a clean sweep
  if (frac > 0.86 && Math.random() < 0.5) pins = standing;
  return Math.min(standing, Math.max(0, pins));
}

const BOT_SKILL: Record<Difficulty, number> = {
  easy: 0.45,
  medium: 0.72,
  hard: 0.93,
};

// Bot picks an aim + power for a ball based on difficulty.
export function botRoll(diff: Difficulty, standing: number): number {
  const skill = BOT_SKILL[diff];
  const aim = 0.08 + (Math.random() - 0.5) * (1 - skill) * 0.9;
  const power = 0.6 + skill * 0.4 - Math.random() * 0.1;
  return rollResult(aim, power, standing);
}

export const PIN_LAYOUT: { x: number; y: number }[] = (() => {
  // 4 rows triangle: 1,2,3,4 pins. Coordinates normalized 0..1 across lane.
  const rows = [1, 2, 3, 4];
  const out: { x: number; y: number }[] = [];
  rows.forEach((count, r) => {
    for (let i = 0; i < count; i++) {
      const x = 0.5 + (i - (count - 1) / 2) * 0.12;
      const y = 0.12 + r * 0.09;
      out.push({ x, y });
    }
  });
  return out; // 10 pins
})();
