import { useState, useEffect, useCallback, useRef } from 'react';
import { State, Move, initialState, applyMove, legalMovesFrom, status, inCheck, colorOf } from './engine';
import { chooseMove, Difficulty } from './bot';
import { MatchSetup, MatchResult, GameTopBar } from '../shared/GameShell';
import { useFeedback } from '../../components/Juice';
import './chess.css';

type Phase = 'setup' | 'playing' | 'results';
const ACCENT = '#9b7bff';
const GLYPH: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

export default function Chess() {
  const { fire } = useFeedback();
  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [entry, setEntry] = useState(10);

  const [state, setState] = useState<State>(() => initialState());
  const [selected, setSelected] = useState<number | null>(null);
  const [targets, setTargets] = useState<Move[]>([]);
  const [last, setLast] = useState<{ from: number; to: number } | null>(null);
  const lock = useRef(false);

  const result = status(state);
  const over = result !== 'playing';

  const start = () => {
    setState(initialState()); setSelected(null); setTargets([]); setLast(null); lock.current = false;
    setPhase('playing'); fire('match_start', 'White to move', null);
  };
  const newSetup = () => setPhase('setup');

  const doMove = useCallback((m: Move) => {
    const captured = !!state.board[m.to];
    setState((prev) => applyMove(prev, m));
    setLast({ from: m.from, to: m.to });
    setSelected(null); setTargets([]);
    fire(captured ? 'success' : 'tap', undefined, null);
  }, [state, fire]);

  const onSquare = useCallback((sq: number) => {
    if (over || state.turn !== 'w' || lock.current || phase !== 'playing') return;
    const piece = state.board[sq];
    const t = targets.find((m) => m.to === sq);
    if (t) { doMove(t); return; }
    if (piece && colorOf(piece) === 'w') { setSelected(sq); setTargets(legalMovesFrom(state, sq)); }
    else { setSelected(null); setTargets([]); }
  }, [over, state, targets, doMove, phase]);

  // bot move
  useEffect(() => {
    if (phase !== 'playing' || over || state.turn !== 'b') return;
    lock.current = true;
    const id = setTimeout(() => {
      const m = chooseMove(state, difficulty);
      lock.current = false;
      if (m) { const cap = !!state.board[m.to]; setState((prev) => applyMove(prev, m)); setLast({ from: m.from, to: m.to }); fire(cap ? 'success' : 'tap', undefined, null); }
    }, 480);
    return () => clearTimeout(id);
  }, [state, over, difficulty, phase, fire]);

  // transition to results
  useEffect(() => {
    if (phase !== 'playing' || !over) return;
    const youWin = result === 'checkmate' && state.turn === 'b';
    const id = setTimeout(() => { fire(result === 'stalemate' ? 'tap' : youWin ? 'match_win' : 'match_loss', undefined, null); setPhase('results'); }, 1100);
    return () => clearTimeout(id);
  }, [over, phase, result, state.turn, fire]);

  if (phase === 'setup') {
    return (
      <MatchSetup game="Chess" icon="Crown" accent={ACCENT}
        blurb="Outthink the bot. Checkmate the king to win the pot."
        difficulty={difficulty} onDifficulty={(d) => { setDifficulty(d as Difficulty); fire('tap'); }}
        difficulties={[{ id: 'easy', label: 'Easy', sub: 'Loose play' }, { id: 'medium', label: 'Medium', sub: '2-ply search' }, { id: 'hard', label: 'Hard', sub: '3-ply + tactics' }]}
        entry={entry} onEntry={(n) => { setEntry(n); fire('tap'); }} onStart={start} />
    );
  }
  if (phase === 'results') {
    const youWin = result === 'checkmate' && state.turn === 'b';
    const draw = result === 'stalemate';
    return (
      <MatchResult accent={ACCENT} outcome={draw ? 'draw' : youWin ? 'win' : 'lose'}
        title={draw ? 'Stalemate — draw' : youWin ? 'Checkmate — you win!' : 'Checkmate — bot wins'}
        sub={draw ? 'No legal moves, no check.' : youWin ? 'You cornered the king.' : 'Your king was trapped.'}
        entry={draw ? 0 : entry} onRematch={start} onNewSetup={newSetup} />
    );
  }

  const checkW = inCheck(state, 'w');
  const checkB = inCheck(state, 'b');
  const sub = over ? (result === 'checkmate' ? 'Checkmate' : 'Stalemate')
    : state.turn === 'w' ? (checkW ? 'Your turn — check!' : 'Your turn') : (checkB ? 'Bot in check…' : 'Bot thinking…');
  const targetSet = new Set(targets.map((m) => m.to));
  // king squares for check pulse
  const wK = state.board.findIndex((p) => p === 'K');
  const bK = state.board.findIndex((p) => p === 'k');

  return (
    <div className="ch2-wrap" style={{ ['--acc' as any]: ACCENT }}>
      <GameTopBar title="Chess" sub={sub} accent={ACCENT} onBack={newSetup} />
      <div className="ch2-board">
        {state.board.map((p, sq) => {
          const row = Math.floor(sq / 8), col = sq % 8;
          const dark = (row + col) % 2 === 1;
          let cls = 'ch2-sq ' + (dark ? 'dark' : 'light');
          if (selected === sq) cls += ' sel';
          if (targetSet.has(sq)) cls += (p ? ' capture' : ' move');
          if (last && (last.from === sq || last.to === sq)) cls += ' last';
          if ((checkW && sq === wK) || (checkB && sq === bK)) cls += ' check';
          return (
            <div key={sq} className={cls} onClick={() => onSquare(sq)}>
              {p && <span className={'ch2-piece ' + (colorOf(p) === 'w' ? 'white' : 'black')}>{GLYPH[p]}</span>}
              {targetSet.has(sq) && !p && <span className="ch2-dot" />}
            </div>
          );
        })}
      </div>
      <p className="ch2-hint">Tap a piece, then a highlighted square. You play White.</p>
    </div>
  );
}
