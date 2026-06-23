import { useEffect, useRef, useState, useCallback } from 'react';
import { COLS, ROWS, newState, setDir, tick, botThink } from './engine';
import type { State, Dir, Difficulty } from './engine';
import { MatchSetup, MatchResult, GameTopBar } from '../shared/GameShell';
import { useFeedback } from '../../components/Juice';
import './tron.css';

type Phase = 'setup' | 'playing' | 'results';
const ACCENT = '#19e0ff';
const SPEED_MS: Record<Difficulty, number> = { easy: 95, medium: 70, hard: 52 };
const CELL = 9;

export default function Tron() {
  const { fire } = useFeedback();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<State>(newState());
  const diffRef = useRef<Difficulty>('medium');
  const runningRef = useRef(false);
  const lastStepRef = useRef(0);
  const rafRef = useRef<number>(0);

  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [target, setTarget] = useState(3);
  const [entry, setEntry] = useState(5);
  const [score, setScore] = useState({ you: 0, cpu: 0 });
  const [round, setRound] = useState<null | 'win' | 'lose' | 'draw'>(null);
  const scoreRef = useRef(score);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { diffRef.current = difficulty; }, [difficulty]);

  const beginRound = useCallback(() => {
    stateRef.current = newState(); setRound(null); runningRef.current = true; lastStepRef.current = performance.now();
  }, []);

  const start = () => { setScore({ you: 0, cpu: 0 }); setPhase('playing'); fire('match_start', 'First to ' + target, null); setTimeout(beginRound, 60); };
  const newSetup = () => { runningRef.current = false; setPhase('setup'); };

  const finish = useCallback((r: 'win' | 'lose' | 'draw') => {
    runningRef.current = false; setRound(r);
    const ns = { you: scoreRef.current.you + (r === 'win' ? 1 : 0), cpu: scoreRef.current.cpu + (r === 'lose' ? 1 : 0) };
    setScore(ns);
    fire(r === 'win' ? 'success' : r === 'lose' ? 'tap' : 'tap', undefined, null);
    if (ns.you >= target || ns.cpu >= target) {
      setTimeout(() => { fire(ns.you >= target ? 'match_win' : 'match_loss', undefined, null); setPhase('results'); }, 1000);
    } else {
      setTimeout(() => { if (runningRef.current === false) beginRound(); }, 1100);
    }
  }, [target, beginRound, fire]);

  const turn = useCallback((d: Dir) => { if (runningRef.current) setDir(stateRef.current.player, d); }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
      const dir = map[e.key]; if (dir) { e.preventDefault(); turn(dir); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn, phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const draw = () => {
      const s = stateRef.current;
      ctx.fillStyle = '#04060f'; ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
      ctx.strokeStyle = 'rgba(60,120,200,0.08)'; ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x += 4) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, ROWS * CELL); ctx.stroke(); }
      for (let y = 0; y <= ROWS; y += 4) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(COLS * CELL, y * CELL); ctx.stroke(); }
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        if (s.player.trail[y][x]) { ctx.fillStyle = 'rgba(90,200,255,0.85)'; ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1); }
        else if (s.bot.trail[y][x]) { ctx.fillStyle = 'rgba(255,120,90,0.85)'; ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1); }
      }
      ctx.fillStyle = '#aef0ff'; ctx.shadowColor = '#5ac8ff'; ctx.shadowBlur = 10; ctx.fillRect(s.player.x * CELL, s.player.y * CELL, CELL - 1, CELL - 1);
      ctx.fillStyle = '#ffd0c0'; ctx.shadowColor = '#ff785a'; ctx.fillRect(s.bot.x * CELL, s.bot.y * CELL, CELL - 1, CELL - 1); ctx.shadowBlur = 0;
    };
    const loop = (now: number) => {
      if (runningRef.current && now - lastStepRef.current >= SPEED_MS[diffRef.current]) {
        lastStepRef.current = now;
        botThink(stateRef.current, diffRef.current);
        const t = tick(stateRef.current);
        if (t.playerCrashed || t.botCrashed) {
          if (t.playerCrashed && t.botCrashed) finish('draw'); else if (t.playerCrashed) finish('lose'); else finish('win');
        }
      }
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [finish, phase]);

  if (phase === 'setup') {
    return (
      <MatchSetup game="Tron" icon="Bolt" accent={ACCENT}
        blurb="Leave a wall of light. Don't crash into walls or any trail. First to your target wins."
        difficulty={difficulty} onDifficulty={(d) => { setDifficulty(d as Difficulty); fire('tap'); }}
        difficulties={[{ id: 'easy', label: 'Easy', sub: 'Slow' }, { id: 'medium', label: 'Medium', sub: 'Quick' }, { id: 'hard', label: 'Hard', sub: 'Fast + smart' }]}
        extras={[{ key: 'len', label: 'Match length', cols: true, value: String(target), onChange: (v) => { setTarget(Number(v)); fire('tap'); }, options: [{ id: '1', label: 'Single' }, { id: '3', label: 'First to 3' }, { id: '5', label: 'First to 5' }] }]}
        entry={entry} onEntry={(n) => { setEntry(n); fire('tap'); }} onStart={start} />
    );
  }
  if (phase === 'results') {
    const youWin = score.you >= target;
    return (
      <MatchResult accent={ACCENT} outcome={youWin ? 'win' : 'lose'} title={youWin ? 'You win!' : 'Bot wins'} sub={`Rounds ${score.you} – ${score.cpu}`}
        entry={entry} onRematch={start} onNewSetup={newSetup} />
    );
  }

  return (
    <div className="tr2-wrap" style={{ ['--acc' as any]: ACCENT }}>
      <GameTopBar title="Tron" sub={`First to ${target}`} accent={ACCENT} onBack={newSetup}
        right={<span className="tr2-mini"><b className="you">{score.you}</b> – <b className="bot">{score.cpu}</b></span>} />
      <div className="tr2-stage">
        <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} className="tr2-canvas" />
        {round && <div className="tr2-round">{round === 'win' ? 'Round won' : round === 'lose' ? 'You crashed' : 'Draw'}</div>}
      </div>
      <div className="tr2-controls">
        <button className="tr2-pad" onClick={() => turn('up')}>▲</button>
        <div className="tr2-pad-row">
          <button className="tr2-pad" onClick={() => turn('left')}>◀</button>
          <button className="tr2-pad" onClick={() => turn('down')}>▼</button>
          <button className="tr2-pad" onClick={() => turn('right')}>▶</button>
        </div>
      </div>
      <p className="tr2-hint">Arrow keys / WASD or the pad. Don't hit walls or trails.</p>
    </div>
  );
}
