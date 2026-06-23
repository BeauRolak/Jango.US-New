// Air Hockey physics engine - 2D puck + paddle simulation
export const TABLE = { w: 480, h: 760, wall: 14 };
export const PUCK_R = 18;
export const PADDLE_R = 30;
export const GOAL_W = 180;
export const MAX_PUCK_SPEED = 22;

export type Vec = { x: number; y: number };

export type Puck = { x: number; y: number; vx: number; vy: number };
export type Paddle = { x: number; y: number; px: number; py: number };

export type Side = 'top' | 'bottom';

export function makePuck(): Puck {
  return { x: TABLE.w / 2, y: TABLE.h / 2, vx: 0, vy: 0 };
}

export function makePaddle(side: Side): Paddle {
  const y = side === 'top' ? TABLE.h * 0.18 : TABLE.h * 0.82;
  return { x: TABLE.w / 2, y, px: TABLE.w / 2, py: y };
}

// Reset puck to center, optionally giving it to a side
export function serve(puck: Puck, toward: Side) {
  puck.x = TABLE.w / 2;
  puck.y = TABLE.h / 2;
  const dir = toward === 'top' ? -1 : 1;
  const ang = (Math.random() - 0.5) * 0.8;
  const speed = 5;
  puck.vx = Math.sin(ang) * speed;
  puck.vy = dir * Math.cos(ang) * speed;
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

// Constrain a paddle to its own half and inside the table
export function constrainPaddle(p: Paddle, side: Side) {
  const minX = TABLE.wall + PADDLE_R;
  const maxX = TABLE.w - TABLE.wall - PADDLE_R;
  p.x = clamp(p.x, minX, maxX);
  const mid = TABLE.h / 2;
  if (side === 'top') {
    p.y = clamp(p.y, TABLE.wall + PADDLE_R, mid - PADDLE_R);
  } else {
    p.y = clamp(p.y, mid + PADDLE_R, TABLE.h - TABLE.wall - PADDLE_R);
  }
}

// Collide puck with a paddle; paddle velocity transfers momentum
function collidePaddle(puck: Puck, p: Paddle) {
  const dx = puck.x - p.x;
  const dy = puck.y - p.y;
  const dist = Math.hypot(dx, dy);
  const minDist = PUCK_R + PADDLE_R;
  if (dist < minDist && dist > 0.0001) {
    const nx = dx / dist;
    const ny = dy / dist;
    // push puck out of overlap
    const overlap = minDist - dist;
    puck.x += nx * overlap;
    puck.y += ny * overlap;
    // paddle velocity this frame
    const pvx = p.x - p.px;
    const pvy = p.y - p.py;
    // reflect puck velocity along normal
    const dot = puck.vx * nx + puck.vy * ny;
    puck.vx -= 2 * dot * nx;
    puck.vy -= 2 * dot * ny;
    // add paddle momentum + a kick along normal
    puck.vx += pvx * 0.9 + nx * 3.5;
    puck.vy += pvy * 0.9 + ny * 3.5;
  }
}

export type StepResult = { goal: Side | null };

// Advance the simulation one frame. Returns which goal (if any) was scored INTO.
export function step(puck: Puck, top: Paddle, bottom: Paddle): StepResult {
  // integrate
  puck.x += puck.vx;
  puck.y += puck.vy;

  // friction
  puck.vx *= 0.995;
  puck.vy *= 0.995;

  // cap speed
  const sp = Math.hypot(puck.vx, puck.vy);
  if (sp > MAX_PUCK_SPEED) {
    puck.vx = (puck.vx / sp) * MAX_PUCK_SPEED;
    puck.vy = (puck.vy / sp) * MAX_PUCK_SPEED;
  }

  const goalMinX = (TABLE.w - GOAL_W) / 2;
  const goalMaxX = (TABLE.w + GOAL_W) / 2;

  // side walls
  if (puck.x - PUCK_R < TABLE.wall) {
    puck.x = TABLE.wall + PUCK_R;
    puck.vx = Math.abs(puck.vx);
  } else if (puck.x + PUCK_R > TABLE.w - TABLE.wall) {
    puck.x = TABLE.w - TABLE.wall - PUCK_R;
    puck.vx = -Math.abs(puck.vx);
  }

  // top wall / goal
  if (puck.y - PUCK_R < TABLE.wall) {
    if (puck.x > goalMinX && puck.x < goalMaxX) {
      return { goal: 'top' };
    }
    puck.y = TABLE.wall + PUCK_R;
    puck.vy = Math.abs(puck.vy);
  }
  // bottom wall / goal
  if (puck.y + PUCK_R > TABLE.h - TABLE.wall) {
    if (puck.x > goalMinX && puck.x < goalMaxX) {
      return { goal: 'bottom' };
    }
    puck.y = TABLE.h - TABLE.wall - PUCK_R;
    puck.vy = -Math.abs(puck.vy);
  }

  collidePaddle(puck, top);
  collidePaddle(puck, bottom);

  // store paddle positions for next-frame velocity
  top.px = top.x; top.py = top.y;
  bottom.px = bottom.x; bottom.py = bottom.y;

  return { goal: null };
}

// Bot AI: move the top paddle toward a target based on difficulty.
export type Difficulty = 'easy' | 'medium' | 'hard';

const BOT_CFG: Record<Difficulty, { speed: number; react: number; defend: number }> = {
  easy: { speed: 4, react: 0.10, defend: 0.55 },
  medium: { speed: 7, react: 0.18, defend: 0.7 },
  hard: { speed: 11, react: 0.30, defend: 0.85 },
};

export function botMove(top: Paddle, puck: Puck, diff: Difficulty) {
  const cfg = BOT_CFG[diff];
  const mid = TABLE.h / 2;
  let targetX: number;
  let targetY: number;
  const puckOnBotSide = puck.y < mid;
  const sp = Math.hypot(puck.vx, puck.vy);
  const puckApproaching = puck.vy < 0;
  // Attack whenever the puck is reachable on the bot's half (approaching OR idle):
  // position the paddle on the far side of the puck from the HUMAN goal so a push
  // drives the puck downfield and the bot can actually score.
  if (puckOnBotSide && (puckApproaching || sp < 2.2)) {
    const goalX = TABLE.w / 2, goalY = TABLE.h; // human goal (bottom)
    const gx = goalX - puck.x, gy = goalY - puck.y;
    const gm = Math.hypot(gx, gy) || 1;
    const off = (PUCK_R + PADDLE_R) * 0.55;
    targetX = puck.x - (gx / gm) * off + puck.vx * 1.4;
    targetY = puck.y - (gy / gm) * off;
  } else {
    // defend: track puck x near goal line, blend to center
    targetX = puck.x * cfg.defend + (TABLE.w / 2) * (1 - cfg.defend);
    targetY = TABLE.h * 0.18;
  }
  const dx = targetX - top.x;
  const dy = targetY - top.y;
  const d = Math.hypot(dx, dy) || 1;
  const stepLen = Math.min(cfg.speed, d);
  top.x += (dx / d) * stepLen * (0.5 + cfg.react);
  top.y += (dy / d) * stepLen * (0.5 + cfg.react);
  constrainPaddle(top, 'top');
}
