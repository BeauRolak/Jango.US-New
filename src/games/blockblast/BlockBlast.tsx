import { useState, useCallback, useMemo } from 'react';
import { emptyGrid, dealPieces, canPlace, placePiece, clearLines, scoreFor, anyMovesLeft, colorFor } from './engine';
import type { Grid, Piece } from './engine';
import { MatchSetup, MatchResult, GameTopBar } from '../shared/GameShell';
import { useFeedback } from '../../components/Juice';
import './blockblast.css';

type Phase = 'setup' | 'playing' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard';
const ACCENT = '#33b5ff';
const TARGET: Record<Difficulty, number> = { easy: 300, medium: 600, hard: 1000 };

export default function BlockBlast() {
  const { fire } = useFeedback();
  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [entry, setEntry] = useState(5);
  const [grid, setGrid] = useState<Grid>(() => emptyGrid());
  const [tray, setTray] = useState<(Piece | null)[]>(() => dealPieces(3));
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);

  const target = TARGET[difficulty];

  const start = () => { setGrid(emptyGrid()); setTray(dealPieces(3)); setSelected(null); setScore(0); setOver(false); setHover(null); setPhase('playing'); fire('match_start', 'Reach ' + target + ' to win', null); };
  const newSetup = () => setPhase('setup');

  const refillIfEmpty = useCallback((t: (Piece | null)[]) => (t.every((p) => p === null) ? dealPieces(3) : t), []);
  const checkOver = useCallback((g: Grid, t: (Piece | null)[]) => { const ps = t.filter((p): p is Piece => p !== null); return ps.length ? !anyMovesLeft(g, ps) : false; }, []);

  const tryPlace = useCallback((r: number, c: number) => {
    if (selected === null || over) return;
    const piece = tray[selected];
    if (!piece || !canPlace(grid, piece, r, c)) return;
    let ng = placePiece(grid, piece, r, c);
    const cleared = clearLines(ng); ng = cleared.grid;
    const gained = scoreFor(piece.cells.length, cleared.cleared);
    const ns = score + gained; setScore(ns);
    fire(cleared.cleared > 0 ? 'success' : 'tap', undefined, null);
    const nt = tray.slice(); nt[selected] = null;
    const refilled = refillIfEmpty(nt);
    setTray(refilled); setGrid(ng); setSelected(null); setHover(null);
    if (checkOver(ng, refilled)) { setOver(true); setTimeout(() => { fire(ns >= target ? 'match_win' : 'match_loss', undefined, null); setPhase('results'); }, 700); }
  }, [selected, over, tray, grid, score, refillIfEmpty, checkOver, fire, target]);

  const previewSet = useMemo(() => {
    const set = new Set<string>();
    if (selected === null || !hover) return set;
    const piece = tray[selected];
    if (!piece || !canPlace(grid, piece, hover.r, hover.c)) return set;
    piece.cells.forEach((cell) => set.add((hover.r + cell.r) + '-' + (hover.c + cell.c)));
    return set;
  }, [selected, hover, tray, grid]);

  if (phase === 'setup') {
    return (
      <MatchSetup game="Block Blast" icon="Sparkles" accent={ACCENT}
        blurb="Fit pieces, clear rows and columns. Hit the target score to win."
        difficulty={difficulty} onDifficulty={(d) => { setDifficulty(d as Difficulty); fire('tap'); }}
        difficulties={[{ id: 'easy', label: 'Easy', sub: 'Score 300' }, { id: 'medium', label: 'Medium', sub: 'Score 600' }, { id: 'hard', label: 'Hard', sub: 'Score 1000' }]}
        entry={entry} onEntry={(n) => { setEntry(n); fire('tap'); }} onStart={start} startLabel="Start run" />
    );
  }
  if (phase === 'results') {
    const win = score >= target;
    return (
      <MatchResult accent={ACCENT} outcome={win ? 'win' : 'lose'}
        title={win ? 'Target smashed!' : 'No moves left'} sub={`Score ${score} / ${target}`}
        entry={win ? entry : 0} onRematch={start} onNewSetup={newSetup} />
    );
  }

  return (
    <div className="bb2-wrap" style={{ ['--acc' as any]: ACCENT }}>
      <GameTopBar title="Block Blast" sub={`${score} / ${target}`} accent={ACCENT} onBack={newSetup} />
      <div className="bb-board">
        {grid.map((rowArr, r) => rowArr.map((cell, c) => {
          const key = r + '-' + c; const prev = previewSet.has(key);
          const cls = 'bb-cell' + (cell ? ' filled' : '') + (prev ? ' preview' : '');
          const piece = selected !== null ? tray[selected] : null;
          const previewColor = piece ? colorFor(piece.colorIdx) : undefined;
          return <div key={key} className={cls} style={cell ? { background: colorFor(cell) } : prev ? { background: previewColor, opacity: 0.5 } : undefined} onPointerEnter={() => setHover({ r, c })} onClick={() => tryPlace(r, c)} />;
        }))}
      </div>
      <div className="bb-tray">
        {tray.map((piece, i) => (
          <button key={i} className={'bb-piece' + (selected === i ? ' active' : '') + (piece ? '' : ' empty')} disabled={!piece} onClick={() => setSelected(selected === i ? null : i)}>
            {piece && (() => {
              const maxR = Math.max(...piece.cells.map((c) => c.r)) + 1;
              const maxC = Math.max(...piece.cells.map((c) => c.c)) + 1;
              const filled = new Set(piece.cells.map((c) => c.r + '-' + c.c));
              const out = [];
              for (let r = 0; r < maxR; r++) for (let c = 0; c < maxC; c++) { const on = filled.has(r + '-' + c); out.push(<div key={r + '-' + c} className={'bb-mini' + (on ? ' on' : '')} style={on ? { background: colorFor(piece.colorIdx) } : undefined} />); }
              return <div className="bb-mini-grid" style={{ gridTemplateColumns: 'repeat(' + maxC + ', 1fr)' }}>{out}</div>;
            })()}
          </button>
        ))}
      </div>
      <p className="bb-hint">Tap a piece, then tap the board. Fill rows or columns to clear them.</p>
    </div>
  );
}
