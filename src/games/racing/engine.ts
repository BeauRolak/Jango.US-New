// Racing engine: top-down car with a checkpoint-based oval track + lap timing.
export const TRACK = { w: 480, h: 640 };
export const CAR_W = 16;
export const CAR_L = 28;
export const LAPS = 3;

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Car = {
  x: number; y: number;
  angle: number; // radians; 0 = facing +x
  speed: number;
  lap: number;
  nextCp: number;
};

// Oval track defined by an outer + inner radius around the center.
export const CENTER = { x: TRACK.w / 2, y: TRACK.h / 2 };
export const OUTER = { rx: 200, ry: 280 };
export const INNER = { rx: 100, ry: 170 };

// Checkpoints around the oval (angles in radians).
export const CHECKPOINTS = (() => {
  const pts: { x: number; y: number }[] = [];
  const n = 8;
  const mrx = (OUTER.rx + INNER.rx) / 2;
  const mry = (OUTER.ry + INNER.ry) / 2;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    pts.push({ x: CENTER.x + Math.cos(a) * mrx, y: CENTER.y + Math.sin(a) * mry });
  }
  return pts;
})();

export function startCar(offset: number): Car {
  // start at bottom of the oval, facing right (counter-clockwise)
  return {
    x: CENTER.x + offset,
    y: CENTER.y + (OUTER.ry + INNER.ry) / 2,
    angle: 0,
    speed: 0,
    lap: 0,
    nextCp: 1,
  };
}

// Is a point on the track surface (between inner and outer ellipse)?
export function onTrack(x: number, y: number): boolean {
  const dxO = (x - CENTER.x) / OUTER.rx;
  const dyO = (y - CENTER.y) / OUTER.ry;
  const dxI = (x - CENTER.x) / INNER.rx;
  const dyI = (y - CENTER.y) / INNER.ry;
  const inOuter = dxO * dxO + dyO * dyO <= 1;
  const inInner = dxI * dxI + dyI * dyI < 1;
  return inOuter && !inInner;
}

export type Controls = { throttle: boolean; brake: boolean; left: boolean; right: boolean };

const ACCEL = 0.18;
const MAX_SPEED = 4.4;
const TURN = 0.052;
const FRICTION = 0.97;
const OFFTRACK_DRAG = 0.88;

// Update a car for one frame; returns true if it completed the final lap.
export function updateCar(car: Car, ctrl: Controls): boolean {
  if (ctrl.throttle) car.speed += ACCEL;
  if (ctrl.brake) car.speed -= ACCEL * 1.4;
  car.speed *= FRICTION;
  if (car.speed > MAX_SPEED) car.speed = MAX_SPEED;
  if (car.speed < -MAX_SPEED * 0.5) car.speed = -MAX_SPEED * 0.5;

  const turnAmt = TURN * (car.speed >= 0 ? 1 : -1);
  if (ctrl.left) car.angle -= turnAmt * Math.min(1, Math.abs(car.speed) / 1.5);
  if (ctrl.right) car.angle += turnAmt * Math.min(1, Math.abs(car.speed) / 1.5);

  const nx = car.x + Math.cos(car.angle) * car.speed;
  const ny = car.y + Math.sin(car.angle) * car.speed;
  if (onTrack(nx, ny)) {
    car.x = nx; car.y = ny;
  } else {
    // grass: still move but heavy drag
    car.x = nx; car.y = ny;
    car.speed *= OFFTRACK_DRAG;
  }

  // checkpoint progression
  const cp = CHECKPOINTS[car.nextCp];
  if (Math.hypot(car.x - cp.x, car.y - cp.y) < 60) {
    car.nextCp = (car.nextCp + 1) % CHECKPOINTS.length;
    if (car.nextCp === 1) {
      car.lap += 1;
      if (car.lap >= LAPS) return true;
    }
  }
  return false;
}

const BOT_SPEED: Record<Difficulty, number> = { easy: 0.78, medium: 0.92, hard: 1.0 };

// Bot steers toward its next checkpoint with difficulty-scaled throttle.
export function botControls(car: Car, diff: Difficulty): Controls {
  const cp = CHECKPOINTS[car.nextCp];
  const desired = Math.atan2(cp.y - car.y, cp.x - car.x);
  let diffA = desired - car.angle;
  while (diffA > Math.PI) diffA -= Math.PI * 2;
  while (diffA < -Math.PI) diffA += Math.PI * 2;
  const speedCap = MAX_SPEED * BOT_SPEED[diff];
  return {
    throttle: car.speed < speedCap,
    brake: Math.abs(diffA) > 0.9 && car.speed > speedCap * 0.5,
    left: diffA < -0.05,
    right: diffA > 0.05,
  };
}
