// Connect Four — clean engine. 7 columns x 6 rows.
// Cells: 0 empty, 1 player one, 2 player two.

export const COLS = 7;
export const ROWS = 6;

export type Cell = 0 | 1 | 2;
export type Board = Cell[][]; // board[col][row], row 0 = bottom

export function createBoard(): Board {
  return Array.from({ length: COLS }, () => Array.from({ length: ROWS }, () => 0 as Cell));
}

export function cloneBoard(b: Board): Board {
  return b.map((col) => col.slice());
}

// Lowest empty row in a column, or -1 if full.
export function dropRow(b: Board, col: number): number {
  for (let r = 0; r < ROWS; r++) {
    if (b[col][r] === 0) return r;
  }
  return -1;
}

export function isLegal(b: Board, col: number): boolean {
  return col >= 0 && col < COLS && dropRow(b, col) !== -1;
}

export function legalMoves(b: Board): number[] {
  const out: number[] = [];
  for (let c = 0; c < COLS; c++) if (isLegal(b, c)) out.push(c);
  return out;
}

// Apply a drop, returning the row it landed in (-1 if illegal).
export function drop(b: Board, col: number, player: Cell): number {
  const r = dropRow(b, col);
  if (r === -1) return -1;
  b[col][r] = player;
  return r;
}

const DIRS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
];

// Returns the 4 winning cells [col,row][] if last move at (col,row) wins, else null.
export function winningLine(b: Board, col: number, row: number): Array<[number, number]> | null {
  const p = b[col][row];
  if (p === 0) return null;
  for (const [dc, dr] of DIRS) {
    const line: Array<[number, number]> = [[col, row]];
    for (const sign of [1, -1]) {
      let c = col + dc * sign;
      let r = row + dr * sign;
      while (c >= 0 && c < COLS && r >= 0 && r < ROWS && b[c][r] === p) {
        line.push([c, r]);
        c += dc * sign;
        r += dr * sign;
      }
    }
    if (line.length >= 4) return line.slice(0, 4);
  }
  return null;
}

// Scan whole board for any winner (1 or 2) or 0 if none.
export function checkWinner(b: Board): Cell {
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (b[c][r] !== 0 && winningLine(b, c, r)) return b[c][r];
    }
  }
  return 0;
}

export function isFull(b: Board): boolean {
  return legalMoves(b).length === 0;
}
