import {
  step, launch,
  type BallState, type Hole,
} from './engine';
import type { Difficulty } from '../../game/types';

// The bot returns ONE drag vector per turn (slingshot input, same as a human).
// It is a LOOK-AHEAD bot: it simulates a coarse grid of candidate shots against
// the real physics, then picks one that sinks the ball or gets it closest to the
// cup. This lets it navigate obstacle holes -- a blind straight-at-cup aim soft-
// locks on walled holes, especially at higher accuracy. Difficulty controls
// search resolution + aim/power jitter, so easy < medium < hard in skill. It
// never touches the human's ball and always returns a single valid shot. No real
// Scalps are involved.

export interface BotShot {
  dragX: number;
  dragY: number;
}

interface Profile {
  angles: number;    // candidate aim directions to scan
  powers: number;    // candidate power levels to scan
  pickTop: number;   // pick randomly among the N best (lower = more optimal)
  jitterAng: number; // radians of aim error applied to the chosen shot
  jitterPow: number; // fractional power error applied to the chosen shot
}

const PROFILES: Record<Difficulty, Profile> = {
  easy: { angles: 18, powers: 5, pickTop: 6, jitterAng: 0.18, jitterPow: 0.18 },
  medium: { angles: 36, powers: 8, pickTop: 3, jitterAng: 0.07, jitterPow: 0.08 },
  hard: { angles: 72, powers: 12, pickTop: 1, jitterAng: 0.02, jitterPow: 0.025 },
};

// Simulate a single shot to rest (or sink) and report how close it got.
function simulate(
  ball: BallState,
  hole: Hole,
  dragX: number,
  dragY: number,
): { sunk: boolean; restCupDist: number } {
  let b = launch(
    { ...ball, vel: { x: 0, y: 0 }, moving: false, sunk: false },
    dragX,
    dragY,
  );
  let steps = 0;
  const MAX_STEPS = 5000;
  while (b.moving && !b.sunk && steps < MAX_STEPS) {
    b = step(b, hole);
    steps += 1;
  }
  const restCupDist = Math.hypot(hole.cup.x - b.pos.x, hole.cup.y - b.pos.y);
  return { sunk: b.sunk, restCupDist };
}

interface Candidate {
  dragX: number;
  dragY: number;
  score: number; // lower is better; a sink scores far below any distance
}

export function botShot(
  ball: BallState,
  hole: Hole,
  difficulty: Difficulty,
): BotShot {
  const p = PROFILES[difficulty];
  const candidates: Candidate[] = [];
  for (let i = 0; i < p.angles; i += 1) {
    const ang = (i / p.angles) * Math.PI * 2;
    for (let j = 0; j < p.powers; j += 1) {
      const frac = 0.3 + (j / (p.powers - 1)) * 0.7;
      const len = frac * 120; // 120 = full-power drag length in the engine
      // Drag points OPPOSITE the desired travel; the engine shoots opposite.
      const dragX = -Math.cos(ang) * len;
      const dragY = -Math.sin(ang) * len;
      const r = simulate(ball, hole, dragX, dragY);
      const score = r.sunk ? -1000 : r.restCupDist;
      candidates.push({ dragX, dragY, score });
    }
  }
  candidates.sort((a, b) => a.score - b.score);
  const top = Math.max(1, Math.min(p.pickTop, candidates.length));
  const chosen = candidates[Math.floor(Math.random() * top)];
  // Apply difficulty jitter so lower tiers miss believably.
  const baseAng = Math.atan2(chosen.dragY, chosen.dragX);
  const baseLen = Math.hypot(chosen.dragX, chosen.dragY);
  const ang = baseAng + (Math.random() * 2 - 1) * p.jitterAng;
  const len = baseLen * (1 + (Math.random() * 2 - 1) * p.jitterPow);
  return { dragX: Math.cos(ang) * len, dragY: Math.sin(ang) * len };
}
