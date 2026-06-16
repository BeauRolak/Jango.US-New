// Chess engine. Board is 64-length array, index 0 = a8 ... 63 = h1.
// Pieces: uppercase = white (P N B R Q K), lowercase = black, '' = empty.

export type Color = 'w' | 'b';
export type Square = number; // 0..63
export interface Move {
  from: Square;
  to: Square;
  promo?: string;
  flag?: 'normal' | 'enpassant' | 'castle' | 'double';
}
export interface State {
  board: string[];
  turn: Color;
  castling: { K: boolean; Q: boolean; k: boolean; q: boolean };
  ep: Square | null; // en-passant target square
}

export function initialState(): State {
  const board = [
    'r','n','b','q','k','b','n','r',
    'p','p','p','p','p','p','p','p',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    'P','P','P','P','P','P','P','P',
    'R','N','B','Q','K','B','N','R',
  ];
  return { board, turn: 'w', castling: { K: true, Q: true, k: true, q: true }, ep: null };
}

export function clone(s: State): State {
  return { board: s.board.slice(), turn: s.turn, castling: { ...s.castling }, ep: s.ep };
}

export function colorOf(p: string): Color | null {
  if (!p) return null;
  return p === p.toUpperCase() ? 'w' : 'b';
}
const rc = (sq: number) => [Math.floor(sq / 8), sq % 8];
const idx = (r: number, c: number) => r * 8 + c;
const inB = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

const KNIGHT = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const KING = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const BISHOP = [[-1,-1],[-1,1],[1,-1],[1,1]];
const ROOK = [[-1,0],[1,0],[0,-1],[0,1]];

// All squares attacked by `color` (used for check detection).
function isAttacked(board: string[], sq: number, by: Color): boolean {
  const [tr, tc] = rc(sq);
  // pawns
  const dir = by === 'w' ? 1 : -1; // white pawns attack upward (toward row 0) => from row tr+1
  for (const dc of [-1, 1]) {
    const r = tr + dir; const c = tc + dc;
    if (inB(r, c)) {
      const p = board[idx(r, c)];
      if (p && colorOf(p) === by && p.toUpperCase() === 'P') return true;
    }
  }
  // knights
  for (const [dr, dc] of KNIGHT) {
    const r = tr + dr; const c = tc + dc;
    if (inB(r, c)) {
      const p = board[idx(r, c)];
      if (p && colorOf(p) === by && p.toUpperCase() === 'N') return true;
    }
  }
  // king
  for (const [dr, dc] of KING) {
    const r = tr + dr; const c = tc + dc;
    if (inB(r, c)) {
      const p = board[idx(r, c)];
      if (p && colorOf(p) === by && p.toUpperCase() === 'K') return true;
    }
  }
  // sliding: bishop/queen diagonals
  for (const [dr, dc] of BISHOP) {
    let r = tr + dr; let c = tc + dc;
    while (inB(r, c)) {
      const p = board[idx(r, c)];
      if (p) {
        if (colorOf(p) === by && (p.toUpperCase() === 'B' || p.toUpperCase() === 'Q')) return true;
        break;
      }
      r += dr; c += dc;
    }
  }
  // sliding: rook/queen straight
  for (const [dr, dc] of ROOK) {
    let r = tr + dr; let c = tc + dc;
    while (inB(r, c)) {
      const p = board[idx(r, c)];
      if (p) {
        if (colorOf(p) === by && (p.toUpperCase() === 'R' || p.toUpperCase() === 'Q')) return true;
        break;
      }
      r += dr; c += dc;
    }
  }
  return false;
}

export function kingSquare(board: string[], color: Color): number {
  const k = color === 'w' ? 'K' : 'k';
  return board.indexOf(k);
}

export function inCheck(s: State, color: Color): boolean {
  const ks = kingSquare(s.board, color);
  if (ks < 0) return false;
  return isAttacked(s.board, ks, color === 'w' ? 'b' : 'w');
}

// Pseudo-legal moves (does not filter self-check).
function pseudoMoves(s: State, color: Color): Move[] {
  const moves: Move[] = [];
  const b = s.board;
  for (let sq = 0; sq < 64; sq++) {
    const p = b[sq];
    if (!p || colorOf(p) !== color) continue;
    const [r, c] = rc(sq);
    const type = p.toUpperCase();
    if (type === 'P') {
      const dir = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      const promoRow = color === 'w' ? 0 : 7;
      const one = idx(r + dir, c);
      if (inB(r + dir, c) && !b[one]) {
        if (r + dir === promoRow) moves.push({ from: sq, to: one, promo: color === 'w' ? 'Q' : 'q' });
        else moves.push({ from: sq, to: one, flag: 'normal' });
        if (r === startRow && !b[idx(r + 2 * dir, c)]) moves.push({ from: sq, to: idx(r + 2 * dir, c), flag: 'double' });
      }
      for (const dc of [-1, 1]) {
        const nr = r + dir; const nc = c + dc;
        if (!inB(nr, nc)) continue;
        const t = idx(nr, nc);
        if (b[t] && colorOf(b[t]) !== color) {
          if (nr === promoRow) moves.push({ from: sq, to: t, promo: color === 'w' ? 'Q' : 'q' });
          else moves.push({ from: sq, to: t, flag: 'normal' });
        } else if (s.ep === t) {
          moves.push({ from: sq, to: t, flag: 'enpassant' });
        }
      }
    } else if (type === 'N') {
      for (const [dr, dc] of KNIGHT) {
        const nr = r + dr; const nc = c + dc;
        if (!inB(nr, nc)) continue;
        const t = idx(nr, nc);
        if (!b[t] || colorOf(b[t]) !== color) moves.push({ from: sq, to: t, flag: 'normal' });
      }
    } else if (type === 'K') {
      for (const [dr, dc] of KING) {
        const nr = r + dr; const nc = c + dc;
        if (!inB(nr, nc)) continue;
        const t = idx(nr, nc);
        if (!b[t] || colorOf(b[t]) !== color) moves.push({ from: sq, to: t, flag: 'normal' });
      }
      // castling
      const homeRow = color === 'w' ? 7 : 0;
      if (r === homeRow && c === 4 && !isAttacked(b, sq, color === 'w' ? 'b' : 'w')) {
        const kSide = color === 'w' ? s.castling.K : s.castling.k;
        const qSide = color === 'w' ? s.castling.Q : s.castling.q;
        if (kSide && !b[idx(homeRow,5)] && !b[idx(homeRow,6)] && b[idx(homeRow,7)] && b[idx(homeRow,7)].toUpperCase()==='R'
          && !isAttacked(b, idx(homeRow,5), color==='w'?'b':'w') && !isAttacked(b, idx(homeRow,6), color==='w'?'b':'w')) {
          moves.push({ from: sq, to: idx(homeRow,6), flag: 'castle' });
        }
        if (qSide && !b[idx(homeRow,3)] && !b[idx(homeRow,2)] && !b[idx(homeRow,1)] && b[idx(homeRow,0)] && b[idx(homeRow,0)].toUpperCase()==='R'
          && !isAttacked(b, idx(homeRow,3), color==='w'?'b':'w') && !isAttacked(b, idx(homeRow,2), color==='w'?'b':'w')) {
          moves.push({ from: sq, to: idx(homeRow,2), flag: 'castle' });
        }
      }
    } else {
      const dirs = type === 'B' ? BISHOP : type === 'R' ? ROOK : KING;
      for (const [dr, dc] of dirs) {
        let nr = r + dr; let nc = c + dc;
        while (inB(nr, nc)) {
          const t = idx(nr, nc);
          if (!b[t]) moves.push({ from: sq, to: t, flag: 'normal' });
          else { if (colorOf(b[t]) !== color) moves.push({ from: sq, to: t, flag: 'normal' }); break; }
          nr += dr; nc += dc;
        }
      }
    }
  }
  return moves;
}

// Apply a move to a fresh state (assumes legality handled by caller).
export function applyMove(s: State, m: Move): State {
  const ns = clone(s);
  const b = ns.board;
  const piece = b[m.from];
  const color = colorOf(piece) as Color;
  ns.ep = null;
  b[m.to] = piece;
  b[m.from] = '';
  if (m.flag === 'double') {
    const [fr] = rc(m.from);
    ns.ep = idx(color === 'w' ? fr - 1 : fr + 1, m.to % 8);
  }
  if (m.flag === 'enpassant') {
    const [tr, tc] = rc(m.to);
    b[idx(color === 'w' ? tr + 1 : tr - 1, tc)] = '';
  }
  if (m.promo) b[m.to] = m.promo;
  if (m.flag === 'castle') {
    const [hr, hc] = rc(m.to);
    if (hc === 6) { b[idx(hr,5)] = b[idx(hr,7)]; b[idx(hr,7)] = ''; }
    else { b[idx(hr,3)] = b[idx(hr,0)]; b[idx(hr,0)] = ''; }
  }
  // update castling rights
  if (piece === 'K') { ns.castling.K = false; ns.castling.Q = false; }
  if (piece === 'k') { ns.castling.k = false; ns.castling.q = false; }
  if (m.from === 63 || m.to === 63) ns.castling.K = false;
  if (m.from === 56 || m.to === 56) ns.castling.Q = false;
  if (m.from === 7 || m.to === 7) ns.castling.k = false;
  if (m.from === 0 || m.to === 0) ns.castling.q = false;
  ns.turn = color === 'w' ? 'b' : 'w';
  return ns;
}

// Legal moves: pseudo-legal filtered so own king is not in check after.
export function legalMoves(s: State, color?: Color): Move[] {
  const c = color || s.turn;
  return pseudoMoves(s, c).filter((m) => {
    const ns = applyMove(s, m);
    return !inCheck(ns, c);
  });
}

export function legalMovesFrom(s: State, from: Square): Move[] {
  return legalMoves(s, s.turn).filter((m) => m.from === from);
}

export type Result = 'playing' | 'checkmate' | 'stalemate';
export function status(s: State): Result {
  const moves = legalMoves(s, s.turn);
  if (moves.length > 0) return 'playing';
  return inCheck(s, s.turn) ? 'checkmate' : 'stalemate';
}
