import { BallState, Hole, MAX_POWER } from "./engine";
import { Difficulty } from "../../game/types";

// The bot returns ONE drag vector per turn (slingshot input, same as a human).
// Difficulty changes SKILL (aim + power error), not the rules.
// It always returns a single valid shot and never touches the human ball.

interface BotShot { dragX: number; dragY: number; }

const PROFILES: Record<Difficulty, { aimError: number; powerError: number; }> = {
  easy:   { aimError: 0.32, powerError: 0.30 },
  medium: { aimError: 0.16, powerError: 0.16 },
  hard:   { aimError: 0.06, powerError: 0.07 },
};

// Drag vector points OPPOSITE the desired travel (engine shoots opposite drag).
export function botShot(ball: BallState, hole: Hole, difficulty: Difficulty): BotShot {
  const p = PROFILES[difficulty];
  const dx = hole.cup.x - ball.pos.x;
  const dy = hole.cup.y - ball.pos.y;
  const dist = Math.hypot(dx, dy) || 1;
  let ang = Math.atan2(dy, dx);
  // aim error (radians)
  ang += (Math.random() * 2 - 1) * p.aimError;
  // desired power scales with distance, capped, plus error
  const ideal = Math.min(dist / 40, 1);
  let powerFrac = ideal * (1 + (Math.random() * 2 - 1) * p.powerError);
  powerFrac = Math.max(0.25, Math.min(1, powerFrac));
  const dragLen = powerFrac * 120; // 120 = full-power drag length in engine
  // travel direction is (cos ang, sin ang); drag is opposite
  const travelX = Math.cos(ang);
  const travelY = Math.sin(ang);
  return { dragX: -travelX * dragLen, dragY: -travelY * dragLen };
}

export const BOT_PROFILES = PROFILES;
export const MAX = MAX_POWER;
