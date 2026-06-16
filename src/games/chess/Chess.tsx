import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  State,
  Move,
  initialState,
  applyMove,
  legalMovesFrom,
  status,
  inCheck,
  colorOf,
} from './engine';
import { chooseMove, Difficulty } from './bot';
import './chess.css';

const GLYPH: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

// Human plays white (bottom). Bot plays black.
export default function Chess() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [state, setState] = useState<State>(() => initialState());
  const [selected, setSelected] = useState<number | null>(null);
  const [targets, setTargets] = useState<Move[]>([]);
  const lock = useRef(false);

  const result = status(state);
  const over = result !== 'playing';

  const reset = useCallback(() => {
    setState(initialState());
    setSelected(null);
    setTargets([]);
    lock.current = false;
  }, []);

  const doMove = useCallback((m: Move) => {
    setState((prev) => applyMove(prev, m));
    setSelected(null);
    setTargets([]);
  }, []);

  const onSquare = useCallback((sq: number) => {
    if (over || state.turn !== 'w' || lock.current) return;
    const piece = state.board[sq];
    // if a target is clicked, move there
    const t = targets.find((m) => m.to === sq);
    if (t) { doMove(t); return; }
    if (piece && colorOf(piece) === 'w') {
      setSelected(sq);
      setTargets(legalMovesFrom(state, sq));
    } else {
      setSelected(null);
      setTargets([]);
    }
  }, [over, state, targets, doMove]);

  // Bot (black) move
  useEffect(() => {
    if (over || state.turn !== 'b') return;
    lock.current = true;
    const id = setTimeout(() => {
      const m = chooseMove(state, difficulty);
      lock.current = false;
      if (m) setState((prev) => applyMove(prev, m));
    }, 400);
    return () => clearTimeout(id);
  }, [state, over, difficulty]);

  const checkW = inCheck(state, 'w');
  const checkB = inCheck(state, 'b');
  const banner = over
    ? result === 'checkmate'
      ? (state.turn === 'w' ? 'Checkmate — Bot wins' : 'Checkmate — You win!')
      : 'Stalemate — draw'
    : state.turn === 'w'
      ? (checkW ? 'Your turn (check!)' : 'Your turn')
      : (checkB ? 'Bot in check...' : 'Bot thinking...');

  const targetSet = new Set(targets.map((m) => m.to));

  return (
    <div className="ch-wrap">
      <div className="ch-head">
        <Link to="/games" className="ch-back">&larr; Games</Link>
        <h1 className="ch-title">Chess</h1>
        <div className="ch-diff">
          {(['easy','medium','hard'] as Difficulty[]).map((d) => (
            <button key={d} className={'ch-diff-btn ' + (difficulty===d?'active':'')} onClick={() => { setDifficulty(d); reset(); }}>{d}</button>
          ))}
        </div>
      </div>
      <div className={'ch-status ' + (state.turn==='w'?'you':'bot')}>{banner}</div>
      <div className="ch-board">
        {state.board.map((p, sq) => {
          const row = Math.floor(sq / 8);
          const col = sq % 8;
          const dark = (row + col) % 2 === 1;
          let cls = 'ch-sq ' + (dark ? 'dark' : 'light');
          if (selected === sq) cls += ' sel';
          if (targetSet.has(sq)) cls += (p ? ' capture' : ' move');
          return (
            <div key={sq} className={cls} onClick={() => onSquare(sq)}>
              {p && <span className={'ch-piece ' + (colorOf(p)==='w'?'white':'black')}>{GLYPH[p]}</span>}
              {targetSet.has(sq) && !p && <span className="ch-dot" />}
            </div>
          );
        })}
      </div>
      {over && (
        <div className="ch-overlay">
          <div className="ch-card">
            <div className="ch-result">{banner}</div>
            <button className="ch-play" onClick={reset}>Play again</button>
            <Link to="/games" className="ch-leave">Back to games</Link>
          </div>
        </div>
      )}
    </div>
  );
}
