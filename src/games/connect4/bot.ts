// Connect Four bot. Difficulty changes search depth + mistake rate,
// not the rules. Uses negamax with alpha-beta and a positional heuristic.

import {
  Board,
  Cell,
  cloneBoard,
  drop,
  legalMoves,
  winningLine,
  isFull,
  COLS,
  ROWS,
} from './engine';

export type Difficulty = 'easy' | 'medium' | 'hard';

const DEPTH: Record<Difficulty, number> = { easy: 1, medium: 4, hard: 6 };
const MISTAKE: Record<Difficulty, number> = { easy: 0.45, medium: 0.15, hard: 0.0 };

const WIN = 100000;

function other(p: Cell): Cell {
  return p === 1 ? 2 : 1;
}

// Did placing at col create a win for player? (col already dropped)
function lastMoveWins(b: Board, col: number): boolean {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (b[col][r] !== 0) return winningLine(b, col, r) !== null;
  }
  return false;
}

// Heuristic: score all 4-windows for the given player.
function evaluate(b: Board, me: Cell): number {
  const opp = other(me);
  let score = 0;
  // center preference
  const center = Math.floor(COLS / 2);
  for (let r = 0; r < ROWS; r++) if (b[center][r] === me) score += 3;
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      for (const [dc, dr] of dirs) {
        const ec = c + dc * 3;
        const er = r + dr * 3;
        if (ec < 0 || ec >= COLS || er < 0 || er >= ROWS) continue;
        let mine = 0;
        let theirs = 0;
        for (let k = 0; k < 4; k++) {
          const v = b[c + dc * k][r + dr * k];
          if (v === me) mine++;
          else if (v === opp) theirs++;
        }
        if (mine > 0 && theirs > 0) continue;
        if (mine === 3) score += 50;
        else if (mine === 2) score += 10;
        else if (mine === 1) score += 1;
        if (theirs === 3) score -= 60;
        else if (theirs === 2) score -= 10;
      }
    }
  }
  return score;
}

function negamax(b: Board, depth: number, alpha: number, beta: number, me: Cell): number {
  const moves = legalMoves(b);
  if (isFull(b)) return 0;
  if (depth === 0) return evaluate(b, me);
  let best = -Infinity;
  for (const col of moves) {
    const nb = cloneBoard(b);
    drop(nb, col, me);
    let val: number;
    if (lastMoveWins(nb, col)) val = WIN - (10 - depth);
    else val = -negamax(nb, depth - 1, -beta, -alpha, other(me));
    if (val > best) best = val;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

export function chooseMove(b: Board, me: Cell, difficulty: Difficulty): number {
  const moves = legalMoves(b);
  if (moves.length === 0) return -1;

  // Immediate win
  for (const col of moves) {
    const nb = cloneBoard(b);
    drop(nb, col, me);
    if (lastMoveWins(nb, col)) return col;
  }
  // Immediate block
  const opp = other(me);
  for (const col of moves) {
    const nb = cloneBoard(b);
    drop(nb, col, opp);
    if (lastMoveWins(nb, col)) return col;
  }

  // Random mistake on easier levels
  if (Math.random() < MISTAKE[difficulty]) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestCol = moves[0];
  let bestVal = -Infinity;
  for (const col of moves) {
    const nb = cloneBoard(b);
    drop(nb, col, me);
    const val = lastMoveWins(nb, col)
      ? WIN
      : -negamax(nb, DEPTH[difficulty] - 1, -Infinity, Infinity, opp);
    if (val > bestVal) {
      bestVal = val;
      bestCol = col;
    }
  }
  return bestCol;
}
