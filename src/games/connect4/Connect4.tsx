import { useState, useEffect, useCallback, useRef } from 'react';
import { Board, Cell, COLS, ROWS, createBoard, cloneBoard, drop, dropRow, isLegal, winningLine, isFull } from './engine';
import { chooseMove, Difficulty } from './bot';
import { MatchSetup, MatchResult, GameTopBar } from '../shared/GameShell';
import { useFeedback } from '../../components/Juice';
import './connect4.css';

type Phase = 'setup' | 'playing' | 'results';
const HUMAN: Cell = 1, BOT: Cell = 2, ACCENT = '#3b82f6';

export default function Connect4() {
  const { fire } = useFeedback();
  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [entry, setEntry] = useState(5);
  const [board, setBoard] = useState<Board>(() => createBoard());
  const [turn, setTurn] = useState<Cell>(HUMAN);
  const [winner, setWinner] = useState<Cell>(0);
  const [winCells, setWinCells] = useState<Array<[number, number]>>([]);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const lock = useRef(false);

  const start = () => {
    setBoard(createBoard()); setTurn(HUMAN); setWinner(0); setWinCells([]); setDone(false); lock.current = false;
    setPhase('playing'); fire('match_start', 'Your move', null);
  };
  const newSetup = () => setPhase('setup');

  const place = useCallback((col: number, player: Cell) => {
    setBoard((prev) => {
      if (!isLegal(prev, col)) return prev;
      const nb = cloneBoard(prev);
      const row = drop(nb, col, player);
      const line = winningLine(nb, col, row);
      if (line) { setWinner(player); setWinCells(line); setDone(true); }
      else if (isFull(nb)) { setWinner(0); setDone(true); }
      else setTurn(player === HUMAN ? BOT : HUMAN);
      return nb;
    });
    fire('tap', undefined, null);
  }, [fire]);

  const onColumn = useCallback((col: number) => {
    if (phase !== 'playing' || turn !== HUMAN || lock.current || done) return;
    if (!isLegal(board, col)) return;
    place(col, HUMAN);
  }, [phase, turn, board, place, done]);

  useEffect(() => {
    if (phase !== 'playing' || turn !== BOT || done) return;
    lock.current = true;
    const id = setTimeout(() => { const col = chooseMove(board, BOT, difficulty); lock.current = false; if (col >= 0) place(col, BOT); }, 550);
    return () => clearTimeout(id);
  }, [phase, turn, board, difficulty, place, done]);

  useEffect(() => {
    if (phase !== 'playing' || !done) return;
    const id = setTimeout(() => { fire(winner === 0 ? 'tap' : winner === HUMAN ? 'match_win' : 'match_loss', undefined, null); setPhase('results'); }, 1100);
    return () => clearTimeout(id);
  }, [done, phase, winner, fire]);

  if (phase === 'setup') {
    return (
      <MatchSetup game="Connect Four" icon="Dice" accent={ACCENT}
        blurb="Drop discs, line up four in a row before the bot does."
        difficulty={difficulty} onDifficulty={(d) => { setDifficulty(d as Difficulty); fire('tap'); }}
        entry={entry} onEntry={(n) => { setEntry(n); fire('tap'); }} onStart={start} />
    );
  }
  if (phase === 'results') {
    const draw = winner === 0;
    return (
      <MatchResult accent={ACCENT} outcome={draw ? 'draw' : winner === HUMAN ? 'win' : 'lose'}
        title={draw ? "It's a draw" : winner === HUMAN ? 'You win!' : 'Bot wins'}
        sub={draw ? 'Board filled, no four-in-a-row.' : winner === HUMAN ? 'Four in a row!' : 'The bot connected four.'}
        entry={draw ? 0 : entry} onRematch={start} onNewSetup={newSetup} />
    );
  }

  const isWin = (c: number, r: number) => winCells.some(([wc, wr]) => wc === c && wr === r);
  const ghostRow = hoverCol !== null && turn === HUMAN && !done ? dropRow(board, hoverCol) : -1;
  const sub = done ? (winner === 0 ? 'Draw' : winner === HUMAN ? 'You win!' : 'Bot wins') : turn === HUMAN ? 'Your turn' : 'Bot thinking…';

  return (
    <div className="c42-wrap" style={{ ['--acc' as any]: ACCENT }}>
      <GameTopBar title="Connect Four" sub={sub} accent={ACCENT} onBack={newSetup} />
      <div className="c42-board">
        {Array.from({ length: COLS }).map((_, c) => (
          <div key={c} className="c42-col" onMouseEnter={() => setHoverCol(c)} onMouseLeave={() => setHoverCol(null)} onClick={() => onColumn(c)}>
            {Array.from({ length: ROWS }).map((_, rTop) => {
              const r = ROWS - 1 - rTop;
              const v = board[c][r];
              const ghost = r === ghostRow && hoverCol === c && v === 0;
              let cls = 'c42-cell';
              if (v === HUMAN) cls += ' p1'; else if (v === BOT) cls += ' p2';
              if (isWin(c, r)) cls += ' win';
              if (ghost) cls += ' ghost';
              return <div key={r} className={cls}><span className="c42-disc" /></div>;
            })}
          </div>
        ))}
      </div>
      <p className="c42-hint">Tap a column to drop your disc. You are gold.</p>
    </div>
  );
}
