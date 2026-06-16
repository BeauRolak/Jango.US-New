// Tron light-cycle engine on a grid. Two riders leave trails; crashing loses.
export const COLS = 41;
export const ROWS = 41;

export type Dir = 'up' | 'down' | 'left' | 'right';
export type Pt = { x: number; y: number };
export type Difficulty = 'easy' | 'medium' | 'hard';

export type Rider = {
  x: number; y: number;
  dir: Dir;
  alive: boolean;
  trail: boolean[][]; // occupied cells (per rider)
};

export type State = {
  player: Rider;
  bot: Rider;
  occupied: boolean[][]; // any trail or head
};

function emptyGrid(): boolean[][] {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => false));
}

export function newState(): State {
  const occupied = emptyGrid();
  const player: Rider = { x: 8, y: ROWS >> 1, dir: 'right', alive: true, trail: emptyGrid() };
  const bot: Rider = { x: COLS - 9, y: ROWS >> 1, dir: 'left', alive: true, trail: emptyGrid() };
  occupied[player.y][player.x] = true;
  occupied[bot.y][bot.x] = true;
  player.trail[player.y][player.x] = true;
  bot.trail[bot.y][bot.x] = true;
  return { player, bot, occupied };
}

const DELTAS: Record<Dir, Pt> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

// Set direction unless it is a 180-degree reversal.
export function setDir(r: Rider, d: Dir) {
  if (OPPOSITE[r.dir] === d) return;
  r.dir = d;
}

function cellBlocked(s: State, x: number, y: number): boolean {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
  return s.occupied[y][x];
}

// Advance both riders one cell. Returns the loser(s).
export type Tick = { playerCrashed: boolean; botCrashed: boolean };

export function tick(s: State): Tick {
  const pd = DELTAS[s.player.dir];
  const bd = DELTAS[s.bot.dir];
  const pnx = s.player.x + pd.x;
  const pny = s.player.y + pd.y;
  const bnx = s.bot.x + bd.x;
  const bny = s.bot.y + bd.y;

  const pCrash = s.player.alive && cellBlocked(s, pnx, pny);
  const bCrash = s.bot.alive && cellBlocked(s, bnx, bny);
  // head-on collision into same cell
  const sameCell = pnx === bnx && pny === bny;

  if (!pCrash && s.player.alive) {
    s.player.x = pnx; s.player.y = pny;
  }
  if (!bCrash && s.bot.alive) {
    s.bot.x = bnx; s.bot.y = bny;
  }
  // mark trails (after moving)
  if (!pCrash && s.player.alive) { s.occupied[pny][pnx] = true; s.player.trail[pny][pnx] = true; }
  if (!bCrash && s.bot.alive) { s.occupied[bny][bnx] = true; s.bot.trail[bny][bnx] = true; }

  return {
    playerCrashed: pCrash || (sameCell && !pCrash && !bCrash),
    botCrashed: bCrash || (sameCell && !pCrash && !bCrash),
  };
}

const LOOKAHEAD: Record<Difficulty, number> = { easy: 2, medium: 5, hard: 10 };

// Count free cells reachable in a straight line in direction d (flood depth).
function freeRun(s: State, x: number, y: number, d: Dir, depth: number): number {
  let count = 0;
  let cx = x, cy = y;
  const dd = DELTAS[d];
  for (let i = 0; i < depth; i++) {
    cx += dd.x; cy += dd.y;
    if (cellBlocked(s, cx, cy)) break;
    count++;
  }
  return count;
}

// Bot AI: choose a non-suicidal direction with the most open space ahead.
export function botThink(s: State, diff: Difficulty) {
  if (!s.bot.alive) return;
  const depth = LOOKAHEAD[diff];
  const options: Dir[] = ['up', 'down', 'left', 'right'];
  let bestDir = s.bot.dir;
  let bestScore = -1;
  for (const d of options) {
    if (OPPOSITE[s.bot.dir] === d) continue;
    const dd = DELTAS[d];
    const nx = s.bot.x + dd.x;
    const ny = s.bot.y + dd.y;
    if (cellBlocked(s, nx, ny)) continue;
    let score = 1 + freeRun(s, s.bot.x, s.bot.y, d, depth);
    // a little randomness on lower difficulty
    if (diff === 'easy') score += Math.random() * 3;
    if (score > bestScore) { bestScore = score; bestDir = d; }
  }
  s.bot.dir = bestDir;
}
