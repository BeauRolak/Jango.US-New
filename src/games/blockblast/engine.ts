// Block Blast engine: 8x8 grid, place pieces, clear full rows/cols.
export const SIZE = 8;

export type Cell = number; // 0 empty, >0 color index
export type Grid = Cell[][];

export type Piece = {
  cells: { r: number; c: number }[]; // relative offsets
  colorIdx: number;
};

export function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
}

// Base shapes (relative coordinates).
const SHAPES: { r: number; c: number }[][] = [
  [{ r: 0, c: 0 }],
  [{ r: 0, c: 0 }, { r: 0, c: 1 }],
  [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }],
  [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }],
  [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }],
  [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }],
  [{ r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }],
  [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }],
  [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }],
  [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }],
  [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }],
  [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 1 }],
];

export function randomPiece(): Piece {
  const cells = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const colorIdx = 1 + Math.floor(Math.random() * 6);
  return { cells: cells.map((c) => ({ ...c })), colorIdx };
}

export function dealPieces(n: number): Piece[] {
  return Array.from({ length: n }, () => randomPiece());
}

// Can the piece be placed with its origin at (row,col)?
export function canPlace(grid: Grid, piece: Piece, row: number, col: number): boolean {
  for (const cell of piece.cells) {
    const r = row + cell.r;
    const c = col + cell.c;
    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return false;
    if (grid[r][c] !== 0) return false;
  }
  return true;
}

// Place piece (mutates a copy) and return new grid.
export function placePiece(grid: Grid, piece: Piece, row: number, col: number): Grid {
  const ng = grid.map((rr) => rr.slice());
  for (const cell of piece.cells) {
    ng[row + cell.r][col + cell.c] = piece.colorIdx;
  }
  return ng;
}

export type ClearResult = { grid: Grid; cleared: number };

// Clear any full rows and columns; returns new grid + count of lines cleared.
export function clearLines(grid: Grid): ClearResult {
  const fullRows: number[] = [];
  const fullCols: number[] = [];
  for (let r = 0; r < SIZE; r++) {
    if (grid[r].every((v) => v !== 0)) fullRows.push(r);
  }
  for (let c = 0; c < SIZE; c++) {
    let full = true;
    for (let r = 0; r < SIZE; r++) if (grid[r][c] === 0) { full = false; break; }
    if (full) fullCols.push(c);
  }
  if (fullRows.length === 0 && fullCols.length === 0) return { grid, cleared: 0 };
  const ng = grid.map((rr) => rr.slice());
  fullRows.forEach((r) => { for (let c = 0; c < SIZE; c++) ng[r][c] = 0; });
  fullCols.forEach((c) => { for (let r = 0; r < SIZE; r++) ng[r][c] = 0; });
  return { grid: ng, cleared: fullRows.length + fullCols.length };
}

// Score: cells placed + line-clear bonus (combo-scaled).
export function scoreFor(cellsPlaced: number, linesCleared: number): number {
  let s = cellsPlaced;
  if (linesCleared > 0) s += linesCleared * 10 * linesCleared;
  return s;
}

// Is there any legal placement for any of the remaining pieces?
export function anyMovesLeft(grid: Grid, pieces: Piece[]): boolean {
  for (const p of pieces) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (canPlace(grid, p, r, c)) return true;
      }
    }
  }
  return false;
}

export const COLORS = ['', '#5ac8ff', '#3cffb4', '#ffd34d', '#ff7ad9', '#b07fff', '#ff7a2a'];
export function colorFor(i: number): string { return COLORS[i] || '#5ac8ff'; }
