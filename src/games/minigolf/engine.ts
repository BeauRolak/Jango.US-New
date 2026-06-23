// Mini Golf V2 physics engine (pure, deterministic, no random tee reset).
// Coordinates are in a fixed logical space (0..W, 0..H); the renderer scales to canvas.

export const FIELD = { w: 400, h: 560 };
export const BALL_R = 9;
export const CUP_R = 15;

// Tuning (numerically validated direction):
export const FRICTION = 0.985;     // per-step velocity retention
export const STOP_SPEED = 0.18;    // below this, ball is considered stopped
export const MAX_POWER = 13;       // max launch speed from a full drag
export const WALL_RESTITUTION = 0.82; // energy kept on a wall bounce
export const SINK_SPEED = 7.5;     // ball must be slower than this to drop in
export const CUP_GRAVITY = 0.55;   // pull toward cup center when near + slow

export interface Wall { x: number; y: number; w: number; h: number; }
export interface Vec { x: number; y: number; }

// A rectangular turf zone that overrides friction inside it.
// >FRICTION (e.g. 0.993) = slick/ice (slides far); <FRICTION (e.g. 0.965) =
// sand/water/mud (drags to a stop). Deterministic, so bots + tests stay valid.
export interface Zone { x: number; y: number; w: number; h: number; friction: number; }

export interface Hole {
  tee: Vec;
  cup: Vec;
  walls: Wall[];
  zones?: Zone[];
  par: number;
}

export interface BallState {
  pos: Vec;
  vel: Vec;
  moving: boolean;
  sunk: boolean;
}

export function newBall(tee: Vec): BallState {
  return { pos: { x: tee.x, y: tee.y }, vel: { x: 0, y: 0 }, moving: false, sunk: false };
}

export function speed(v: Vec): number {
  return Math.hypot(v.x, v.y);
}

// Launch: dragVec is from ball toward the drag point; we shoot OPPOSITE (slingshot).
export function launch(b: BallState, dragX: number, dragY: number): BallState {
  const mag = Math.min(Math.hypot(dragX, dragY), 120);
  const power = (mag / 120) * MAX_POWER;
  const ang = Math.atan2(dragY, dragX);
  // Shoot opposite to the drag direction.
  const vx = -Math.cos(ang) * power;
  const vy = -Math.sin(ang) * power;
  return { ...b, vel: { x: vx, y: vy }, moving: true };
}

function reflectWalls(b: BallState, walls: Wall[]): BallState {
  let { x, y } = b.pos;
  let vx = b.vel.x;
  let vy = b.vel.y;
  // Field bounds
  if (x - BALL_R < 0) { x = BALL_R; vx = Math.abs(vx) * WALL_RESTITUTION; }
  if (x + BALL_R > FIELD.w) { x = FIELD.w - BALL_R; vx = -Math.abs(vx) * WALL_RESTITUTION; }
  if (y - BALL_R < 0) { y = BALL_R; vy = Math.abs(vy) * WALL_RESTITUTION; }
  if (y + BALL_R > FIELD.h) { y = FIELD.h - BALL_R; vy = -Math.abs(vy) * WALL_RESTITUTION; }
  // Rectangular walls (axis-aligned) -- resolve by smallest penetration.
  for (const w of walls) {
    const nx = Math.max(w.x, Math.min(x, w.x + w.w));
    const ny = Math.max(w.y, Math.min(y, w.y + w.h));
    const dx = x - nx;
    const dy = y - ny;
    const d2 = dx * dx + dy * dy;
    if (d2 < BALL_R * BALL_R) {
      const d = Math.sqrt(d2) || 0.0001;
      const ux = dx / d;
      const uy = dy / d;
      // push out
      x = nx + ux * BALL_R;
      y = ny + uy * BALL_R;
      // reflect velocity about the contact normal
      const dot = vx * ux + vy * uy;
      vx = (vx - 2 * dot * ux) * WALL_RESTITUTION;
      vy = (vy - 2 * dot * uy) * WALL_RESTITUTION;
    }
  }
  return { ...b, pos: { x, y }, vel: { x: vx, y: vy } };
}

// Advance one physics step. Returns the new ball state. Sets sunk=true on a
// fair sink (near cup AND slow enough). Fast balls lip out and keep rolling.
export function step(b: BallState, hole: Hole): BallState {
  if (!b.moving || b.sunk) return b;
  let nb = { ...b, pos: { x: b.pos.x + b.vel.x, y: b.pos.y + b.vel.y }, vel: { ...b.vel } };
  nb = reflectWalls(nb, hole.walls);
  // Friction (zone-aware: slick/ice slides, sand/water drags)
  let fr = FRICTION;
  if (hole.zones) {
    for (const z of hole.zones) {
      if (nb.pos.x >= z.x && nb.pos.x <= z.x + z.w && nb.pos.y >= z.y && nb.pos.y <= z.y + z.h) {
        fr = z.friction; break;
      }
    }
  }
  nb.vel.x *= fr;
  nb.vel.y *= fr;
  // Cup interaction
  const toCup = { x: hole.cup.x - nb.pos.x, y: hole.cup.y - nb.pos.y };
  const dCup = Math.hypot(toCup.x, toCup.y);
  const sp = speed(nb.vel);
  if (dCup < CUP_R + BALL_R) {
    if (sp < SINK_SPEED) {
      // fair sink
      return { pos: { x: hole.cup.x, y: hole.cup.y }, vel: { x: 0, y: 0 }, moving: false, sunk: true };
    } else if (dCup < CUP_R) {
      // too fast and over the hole: gentle gravity nudge, lip out
      nb.vel.x += (toCup.x / dCup) * CUP_GRAVITY;
      nb.vel.y += (toCup.y / dCup) * CUP_GRAVITY;
    }
  } else if (dCup < CUP_R * 2.4 && sp < SINK_SPEED * 0.7) {
    // subtle gravity assist when slow and near
    nb.vel.x += (toCup.x / dCup) * CUP_GRAVITY * 0.5;
    nb.vel.y += (toCup.y / dCup) * CUP_GRAVITY * 0.5;
  }
  // Stop condition
  if (speed(nb.vel) < STOP_SPEED) {
    nb.vel.x = 0; nb.vel.y = 0; nb.moving = false;
  }
  return nb;
}
