// 8-Ball physics engine. Table coordinate space; clean elastic ball collisions,
// rolling friction, cushion restitution, pocket capture. No old prototype code.

export const TABLE = { w: 800, h: 400, cushion: 24 };
export const BALL_R = 11;
export const FRICTION = 0.985;   // per-step velocity damping
export const STOP_SPEED = 0.05;  // below this, a ball halts
export const CUSHION_RESTITUTION = 0.82;
export const POCKET_R = 22;

export interface Ball {
  id: number;       // 0 = cue, 1..7 solids, 8 = eight, 9..15 stripes
  x: number;
  y: number;
  vx: number;
  vy: number;
  potted: boolean;
  group: 'cue' | 'solid' | 'stripe' | 'eight';
}

export function pockets() {
  const { w, h } = TABLE;
  return [
    { x: 0, y: 0 }, { x: w / 2, y: -4 }, { x: w, y: 0 },
    { x: 0, y: h }, { x: w / 2, y: h + 4 }, { x: w, y: h },
  ];
}

function groupFor(id: number): Ball['group'] {
  if (id === 0) return 'cue';
  if (id === 8) return 'eight';
  return id < 8 ? 'solid' : 'stripe';
}

// Standard rack: cue ball on the head spot, triangle racked at the foot.
export function rack(): Ball[] {
  const balls: Ball[] = [];
  balls.push({ id: 0, x: TABLE.w * 0.25, y: TABLE.h / 2, vx: 0, vy: 0, potted: false, group: 'cue' });
  const order = [1, 9, 2, 8, 10, 3, 11, 4, 12, 13, 5, 14, 6, 15, 7];
  const apexX = TABLE.w * 0.72;
  const spacing = BALL_R * 2 + 0.5;
  let k = 0;
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row <= col; row++) {
      const id = order[k++];
      const x = apexX + col * (spacing * 0.87);
      const y = TABLE.h / 2 + (row - col / 2) * spacing;
      balls.push({ id, x, y, vx: 0, vy: 0, potted: false, group: groupFor(id) });
    }
  }
  return balls;
}

export function anyMoving(balls: Ball[]): boolean {
  return balls.some((b) => !b.potted && (Math.abs(b.vx) > STOP_SPEED || Math.abs(b.vy) > STOP_SPEED));
}

// Advance the simulation one step. Returns ids potted this step.
export function step(balls: Ball[]): number[] {
  const potted: number[] = [];
  const { w, h, cushion } = TABLE;

  for (const b of balls) {
    if (b.potted) continue;
    b.x += b.vx;
    b.y += b.vy;
    b.vx *= FRICTION;
    b.vy *= FRICTION;
    if (Math.abs(b.vx) < STOP_SPEED) b.vx = 0;
    if (Math.abs(b.vy) < STOP_SPEED) b.vy = 0;
  }

  // cushions — WITH pocket-mouth gaps so balls can actually enter the pockets.
  // Near a pocket the rail is "open" (no reflection) so the ball rolls in.
  const mouth = POCKET_R + 8;
  for (const b of balls) {
    if (b.potted) continue;
    const nearCornerY = b.y < mouth || b.y > h - mouth;          // top/bottom corners
    const nearPocketX = b.x < mouth || b.x > w - mouth || Math.abs(b.x - w / 2) < mouth; // corners + side pockets
    if (b.x < cushion + BALL_R && !nearCornerY) { b.x = cushion + BALL_R; b.vx = Math.abs(b.vx) * CUSHION_RESTITUTION; }
    if (b.x > w - cushion - BALL_R && !nearCornerY) { b.x = w - cushion - BALL_R; b.vx = -Math.abs(b.vx) * CUSHION_RESTITUTION; }
    if (b.y < cushion + BALL_R && !nearPocketX) { b.y = cushion + BALL_R; b.vy = Math.abs(b.vy) * CUSHION_RESTITUTION; }
    if (b.y > h - cushion - BALL_R && !nearPocketX) { b.y = h - cushion - BALL_R; b.vy = -Math.abs(b.vy) * CUSHION_RESTITUTION; }
  }

  // ball-ball collisions (elastic, equal mass)
  for (let i = 0; i < balls.length; i++) {
    const a = balls[i];
    if (a.potted) continue;
    for (let j = i + 1; j < balls.length; j++) {
      const c = balls[j];
      if (c.potted) continue;
      const dx = c.x - a.x;
      const dy = c.y - a.y;
      const dist = Math.hypot(dx, dy);
      const min = BALL_R * 2;
      if (dist > 0 && dist < min) {
        const nx = dx / dist;
        const ny = dy / dist;
        // separate overlap
        const overlap = (min - dist) / 2;
        a.x -= nx * overlap; a.y -= ny * overlap;
        c.x += nx * overlap; c.y += ny * overlap;
        // relative velocity along normal
        const rvx = c.vx - a.vx;
        const rvy = c.vy - a.vy;
        const dot = rvx * nx + rvy * ny;
        if (dot < 0) {
          const imp = dot;
          a.vx += nx * imp; a.vy += ny * imp;
          c.vx -= nx * imp; c.vy -= ny * imp;
        }
      }
    }
  }

  // pockets (capture by proximity, plus a catch for any ball that rolled out
  // through a gap so it can never escape the table and vanish into the void)
  for (const b of balls) {
    if (b.potted) continue;
    let dropped = false;
    for (const p of pockets()) {
      if (Math.hypot(b.x - p.x, b.y - p.y) < POCKET_R) { dropped = true; break; }
    }
    if (!dropped && (b.x < -BALL_R || b.x > w + BALL_R || b.y < -BALL_R || b.y > h + BALL_R)) {
      dropped = true; // rolled off through a pocket mouth
    }
    if (dropped) {
      b.potted = true; b.vx = 0; b.vy = 0;
      potted.push(b.id);
    }
  }
  return potted;
}

// Strike the cue ball given aim angle (radians) and power 0..1.
export function strike(cue: Ball, angle: number, power: number) {
  const MAX = 18;
  const speed = power * MAX;
  cue.vx = Math.cos(angle) * speed;
  cue.vy = Math.sin(angle) * speed;
}
