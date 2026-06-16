// Chess bot: negamax with alpha-beta. Difficulty sets depth + randomness.
import { State, Move, Color, legalMoves, applyMove, colorOf, inCheck, status } from './engine';

export type Difficulty = 'easy' | 'medium' | 'hard';
const DEPTH: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };
const NOISE: Record<Difficulty, number> = { easy: 80, medium: 25, hard: 0 };

const VAL: Record<string, number> = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

// piece-square bonus (simple, from white's view; mirror for black)
const PAWN_PST = [
   0,0,0,0,0,0,0,0,
   50,50,50,50,50,50,50,50,
   10,10,20,30,30,20,10,10,
   5,5,10,25,25,10,5,5,
   0,0,0,20,20,0,0,0,
   5,-5,-10,0,0,-10,-5,5,
   5,10,10,-20,-20,10,10,5,
   0,0,0,0,0,0,0,0
];

function evaluate(s: State): number {
  // positive favors white
  let score = 0;
  for (let i = 0; i < 64; i++) {
    const p = s.board[i];
    if (!p) continue;
    const t = p.toUpperCase();
    const base = VAL[t] || 0;
    let pst = 0;
    if (t === 'P') pst = colorOf(p) === 'w' ? PAWN_PST[i] : PAWN_PST[63 - i];
    if (colorOf(p) === 'w') score += base + pst;
    else score -= base + pst;
  }
  return score;
}

function negamax(s: State, depth: number, alpha: number, beta: number, color: Color): number {
  const st = status(s);
  if (st === 'checkmate') return -100000 - depth; // side to move is mated
  if (st === 'stalemate') return 0;
  if (depth === 0) {
    const e = evaluate(s);
    return color === 'w' ? e : -e;
  }
  const moves = legalMoves(s, color);
  let best = -Infinity;
  for (const m of moves) {
    const ns = applyMove(s, m);
    const val = -negamax(ns, depth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w');
    if (val > best) best = val;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

export function chooseMove(s: State, difficulty: Difficulty): Move | null {
  const color = s.turn;
  const moves = legalMoves(s, color);
  if (moves.length === 0) return null;
  const depth = DEPTH[difficulty];
  let best: Move = moves[0];
  let bestVal = -Infinity;
  const scored: Array<{ m: Move; v: number }> = [];
  for (const m of moves) {
    const ns = applyMove(s, m);
    const val = -negamax(ns, depth - 1, -Infinity, Infinity, color === 'w' ? 'b' : 'w');
    scored.push({ m, v: val });
    if (val > bestVal) { bestVal = val; best = m; }
  }
  // easier levels: pick among near-best moves with some noise
  const noise = NOISE[difficulty];
  if (noise > 0) {
    const pool = scored.filter((x) => x.v >= bestVal - noise);
    return pool[Math.floor(Math.random() * pool.length)].m;
  }
  return best;
}
