import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  emptyGrid, dealPieces, canPlace, placePiece, clearLines,
  scoreFor, anyMovesLeft, colorFor,
} from './engine';
import type { Grid, Piece } from './engine';
import './blockblast.css';

export default function BlockBlast() {
  const [grid, setGrid] = useState<Grid>(() => emptyGrid());
  const [tray, setTray] = useState<(Piece | null)[]>(() => dealPieces(3));
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);

  const refillIfEmpty = useCallback((t: (Piece | null)[]): (Piece | null)[] => {
    if (t.every((p) => p === null)) return dealPieces(3);
    return t;
  }, []);

  const checkOver = useCallback((g: Grid, t: (Piece | null)[]) => {
    const ps = t.filter((p): p is Piece => p !== null);
    if (ps.length === 0) return false;
    return !anyMovesLeft(g, ps);
  }, []);

  const tryPlace = useCallback((r: number, c: number) => {
    if (selected === null || over) return;
    const piece = tray[selected];
    if (!piece || !canPlace(grid, piece, r, c)) return;
    let ng = placePiece(grid, piece, r, c);
    const cleared = clearLines(ng);
    ng = cleared.grid;
    const gained = scoreFor(piece.cells.length, cleared.cleared);
    const newScore = score + gained;
    setScore(newScore);
    setBest((b) => Math.max(b, newScore));
    const nt = tray.slice();
    nt[selected] = null;
    const refilled = refillIfEmpty(nt);
    setTray(refilled);
    setGrid(ng);
    setSelected(null);
    setHover(null);
    if (checkOver(ng, refilled)) setOver(true);
  }, [selected, over, tray, grid, score, refillIfEmpty, checkOver]);

  const restart = () => {
    setGrid(emptyGrid());
    setTray(dealPieces(3));
    setSelected(null); setScore(0); setOver(false); setHover(null);
  };

  const previewSet = useMemo(() => {
    const set = new Set<string>();
    if (selected === null || !hover) return set;
    const piece = tray[selected];
    if (!piece || !canPlace(grid, piece, hover.r, hover.c)) return set;
    piece.cells.forEach((cell) => set.add((hover.r + cell.r) + '-' + (hover.c + cell.c)));
    return set;
  }, [selected, hover, tray, grid]);

  return (
    <div className={'bb-wrap'}>
      <div className={'bb-head'}>
        <Link to={'/games'} className={'bb-back'}>{'\u2190 Back'}</Link>
        <h1 className={'bb-title'}>{'Block Blast'}</h1>
        <div className={'bb-scorebox'}>
          <span className={'bb-score'}>{score}</span>
          <span className={'bb-best'}>{'best ' + best}</span>
        </div>
      </div>

      <div className={'bb-board'}>
        {grid.map((rowArr, r) => (
          rowArr.map((cell, c) => {
            const key = r + '-' + c;
            const prev = previewSet.has(key);
            const cls = 'bb-cell' + (cell ? ' filled' : '') + (prev ? ' preview' : '');
            const piece = selected !== null ? tray[selected] : null;
            const previewColor = piece ? colorFor(piece.colorIdx) : undefined;
            return (
              <div key={key}
                className={cls}
                style={cell ? { background: colorFor(cell) } : prev ? { background: previewColor, opacity: 0.5 } : undefined}
                onPointerEnter={() => setHover({ r, c })}
                onClick={() => tryPlace(r, c)} />
            );
          })
        ))}
      </div>

      <div className={'bb-tray'}>
        {tray.map((piece, i) => (
          <button key={i}
            className={'bb-piece' + (selected === i ? ' active' : '') + (piece ? '' : ' empty')}
            disabled={!piece}
            onClick={() => setSelected(selected === i ? null : i)}>
            {piece && (
              <div className={'bb-piece-grid'}>
                {(() => {
                  const maxR = Math.max(...piece.cells.map((c) => c.r)) + 1;
                  const maxC = Math.max(...piece.cells.map((c) => c.c)) + 1;
                  const filled = new Set(piece.cells.map((c) => c.r + '-' + c.c));
                  const out = [];
                  for (let r = 0; r < maxR; r++) {
                    for (let c = 0; c < maxC; c++) {
                      const on = filled.has(r + '-' + c);
                      out.push(
                        <div key={r + '-' + c} className={'bb-mini' + (on ? ' on' : '')}
                          style={on ? { background: colorFor(piece.colorIdx) } : undefined} />
                      );
                    }
                  }
                  return <div className={'bb-mini-grid'} style={{ gridTemplateColumns: 'repeat(' + maxC + ', 1fr)' }}>{out}</div>;
                })()}
              </div>
            )}
          </button>
        ))}
      </div>

      <p className={'bb-hint'}>{'Tap a piece, then tap the board to place it. Fill rows or columns to clear them.'}</p>

      {over && (
        <div className={'bb-overlay'}>
          <div className={'bb-card'}>
            <div className={'bb-result'}>{'No Moves Left'}</div>
            <div className={'bb-final'}>{'Score: ' + score}</div>
            <button className={'bb-play'} onClick={restart}>{'Play again'}</button>
            <Link to={'/games'} className={'bb-leave'}>{'Back to games'}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
