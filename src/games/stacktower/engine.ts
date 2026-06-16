// Stack Tower engine: drop sliding blocks; overhang is sliced off.
export const STAGE = { w: 360, h: 600 };
export const BLOCK_H = 28;
export const BASE_W = 200;
export const PERFECT_TOL = 6; // px tolerance for a 'perfect' placement

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Block = { x: number; w: number; colorIdx: number };

export const SPEED_BY_DIFF: Record<Difficulty, number> = {
  easy: 2.4,
  medium: 3.6,
  hard: 5.0,
};

export function baseBlock(): Block {
  return { x: (STAGE.w - BASE_W) / 2, w: BASE_W, colorIdx: 0 };
}

export type PlaceResult = {
  placed: Block | null;
  perfect: boolean;
  gameOver: boolean;
  overhang: number;
};

// Place the moving block (at moveX) on top of prevBlock.
export function place(moveX: number, w: number, prev: Block, colorIdx: number): PlaceResult {
  const delta = moveX - prev.x;
  const overhang = Math.abs(delta);
  if (overhang >= w) {
    return { placed: null, perfect: false, gameOver: true, overhang };
  }
  if (overhang <= PERFECT_TOL) {
    // snap to perfect, keep full width
    return { placed: { x: prev.x, w, colorIdx }, perfect: true, gameOver: false, overhang: 0 };
  }
  const newW = w - overhang;
  const newX = delta > 0 ? moveX : prev.x;
  return { placed: { x: newX, w: newW, colorIdx }, perfect: false, gameOver: false, overhang };
}

// Bot accuracy: how close it lands to perfect, by difficulty.
const BOT_ERR: Record<Difficulty, number> = { easy: 36, medium: 18, hard: 6 };

// Returns the x the bot will choose to drop at, aiming for prev.x with error.
export function botDropX(prev: Block, w: number, diff: Difficulty): number {
  const err = (Math.random() - 0.5) * 2 * BOT_ERR[diff];
  return prev.x + err;
}

export const COLORS = [
  '#5ac8ff', '#3cffb4', '#ffd34d', '#ff7ad9', '#b07fff',
  '#ff7a2a', '#5fffa0', '#ff5c8a', '#7fd0ff', '#d0b03f',
];

export function colorFor(i: number): string {
  return COLORS[i % COLORS.length];
}
