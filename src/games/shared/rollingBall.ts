// Rolling-sphere helper — enforces Jango's global physics rule:
// anything that rolls must visibly rotate, rotationAngle = distance / radius,
// with surface features turning so the spin reads (no "sticker on glass").
//
// We track a 3x3 rotation matrix per ball (row-major number[9]). Each frame we
// pre-multiply an incremental rotation derived from the ball's velocity: the ball
// rolls about the in-plane axis perpendicular to its motion. Surface features are
// stored as unit-sphere local points, transformed by the matrix, then projected
// orthographically (top-down); features on the back hemisphere (z<0) are hidden.

export type Mat3 = number[]; // length 9, row-major

export function identity(): Mat3 {
  return [1, 0, 0, 0, 1, 0, 0, 0, 1];
}

function mul(a: Mat3, b: Mat3): Mat3 {
  const o = new Array(9);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      o[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
  return o;
}

/** Advance the roll matrix by a movement step (vx,vy over one frame) for radius R. */
export function advanceRoll(m: Mat3, vx: number, vy: number, R: number): Mat3 {
  const speed = Math.hypot(vx, vy);
  if (speed < 1e-4) return m;
  const theta = speed / R;                 // rolling without slipping
  const kx = -vy / speed, ky = vx / speed; // axis ⟂ to motion, in the ground plane
  const c = Math.cos(theta), s = Math.sin(theta), t = 1 - c;
  // Rodrigues rotation about unit axis (kx,ky,0)
  const inc: Mat3 = [
    t * kx * kx + c, t * kx * ky, s * ky,
    t * kx * ky, t * ky * ky + c, -s * kx,
    -s * ky, s * kx, c,
  ];
  return mul(inc, m); // apply in world frame
}

/** Transform a local unit-sphere point by the roll matrix → world [x,y,z]. */
export function apply(m: Mat3, p: [number, number, number]): [number, number, number] {
  return [
    m[0] * p[0] + m[1] * p[1] + m[2] * p[2],
    m[3] * p[0] + m[4] * p[1] + m[5] * p[2],
    m[6] * p[0] + m[7] * p[1] + m[8] * p[2],
  ];
}

/** Manage a roll matrix per object id; call frame() each render with live velocities. */
export function createRollTracker(R: number) {
  const mats = new Map<number, Mat3>();
  return {
    get(id: number): Mat3 { let m = mats.get(id); if (!m) { m = identity(); mats.set(id, m); } return m; },
    step(id: number, vx: number, vy: number) { mats.set(id, advanceRoll(this.get(id), vx, vy, R)); },
    reset() { mats.clear(); },
  };
}
