import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Board,
  Cell,
  COLS,
  ROWS,
  createBoard,
  cloneBoard,
  drop,
  dropRow,
  isLegal,
  winningLine,
  isFull,
} from './engine';
import { chooseMove, Difficulty } from './bot';
import './connect4.css';

type Phase = 'playing' | 'over';

const HUMAN: Cell = 1;
const BOT: Cell = 2;

export default function Connect4() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [board, setBoard] = useState<Board>(() => createBoard());
  const [turn, setTurn] = useState<Cell>(HUMAN);
  const [phase, setPhase] = useState<Phase>('playing');
  const [winner, setWinner] = useState<Cell>(0);
  const [winCells, setWinCells] = useState<Array<[number, number]>>([]);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const lock = useRef(false);

  const reset = useCallback(() => {
    setBoard(createBoard());
    setTurn(HUMAN);
    setPhase('playing');
    setWinner(0);
    setWinCells([]);
    lock.current = false;
  }, []);

  const place = useCallback((col: number, player: Cell) => {
    setBoard((prev) => {
      if (!isLegal(prev, col)) return prev;
      const nb = cloneBoard(prev);
      const row = drop(nb, col, player);
      const line = winningLine(nb, col, row);
      if (line) {
        setWinner(player);
        setWinCells(line);
        setPhase('over');
      } else if (isFull(nb)) {
        setWinner(0);
        setPhase('over');
      } else {
        setTurn(player === HUMAN ? BOT : HUMAN);
      }
      return nb;
    });
  }, []);

  const onColumn = useCallback((col: number) => {
    if (phase !== 'playing' || turn !== HUMAN || lock.current) return;
    if (!isLegal(board, col)) return;
    place(col, HUMAN);
  }, [phase, turn, board, place]);

  // Bot turn
  useEffect(() => {
    if (phase !== 'playing' || turn !== BOT) return;
    lock.current = true;
    const id = setTimeout(() => {
      const col = chooseMove(board, BOT, difficulty);
      lock.current = false;
      if (col >= 0) place(col, BOT);
    }, 550);
    return () => clearTimeout(id);
  }, [phase, turn, board, difficulty, place]);

  const isWinCell = (c: number, r: number) =>
    winCells.some(([wc, wr]) => wc === c && wr === r);

  const ghostRow = hoverCol !== null && phase === 'playing' && turn === HUMAN
    ? dropRow(board, hoverCol)
    : -1;

  const status =
    phase === 'over'
      ? winner === 0
        ? "It's a draw"
        : winner === HUMAN
        ? 'You win!'
        : 'Bot wins'
      : turn === HUMAN
      ? 'Your turn'
      : 'Bot thinking...';

  return (
    <div className="c4-wrap">
      <div className="c4-head">
        <Link to="/games" className="c4-back">&larr; Games</Link>
        <h1 className="c4-title">Connect Four</h1>
        <div className="c4-diff">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              className={'c4-diff-btn ' + (difficulty === d ? 'active' : '')}
              onClick={() => { setDifficulty(d); reset(); }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className={'c4-status ' + (turn === HUMAN ? 'you' : 'bot')}>{status}</div>

      <div className="c4-board">
        {Array.from({ length: COLS }).map((_, c) => (
          <div
            key={c}
            className="c4-col"
            onMouseEnter={() => setHoverCol(c)}
            onMouseLeave={() => setHoverCol(null)}
            onClick={() => onColumn(c)}
          >
            {Array.from({ length: ROWS }).map((_, rTop) => {
              const r = ROWS - 1 - rTop;
              const v = board[c][r];
              const ghost = r === ghostRow && hoverCol === c && v === 0;
              let cls = 'c4-cell';
              if (v === HUMAN) cls += ' p1';
              else if (v === BOT) cls += ' p2';
              if (isWinCell(c, r)) cls += ' win';
              if (ghost) cls += ' ghost';
              return <div key={r} className={cls} />;
            })}
          </div>
        ))}
      </div>

      {phase === 'over' && (
        <div className="c4-overlay">
          <div className="c4-card">
            <div className="c4-result">{status}</div>
            <button className="c4-play" onClick={reset}>Play again</button>
            <Link to="/games" className="c4-leave">Back to games</Link>
          </div>
        </div>
      )}
    </div>
  );
}
