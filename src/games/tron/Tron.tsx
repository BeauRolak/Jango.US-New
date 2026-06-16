import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { COLS, ROWS, newState, setDir, tick, botThink } from './engine';
import type { State, Dir, Difficulty } from './engine';
import './tron.css';

const SPEED_MS: Record<Difficulty, number> = { easy: 95, medium: 70, hard: 52 };

export default function Tron() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<State>(newState());
  const diffRef = useRef<Difficulty>('medium');
  const runningRef = useRef(false);
  const lastStepRef = useRef(0);
  const rafRef = useRef<number>(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [result, setResult] = useState<null | 'win' | 'lose' | 'draw'>(null);
  const [score, setScore] = useState({ you: 0, cpu: 0 });
  const [started, setStarted] = useState(false);

  useEffect(() => { diffRef.current = difficulty; }, [difficulty]);

  const CELL = 9;

  const begin = useCallback(() => {
    stateRef.current = newState();
    setResult(null);
    runningRef.current = true;
    setStarted(true);
    lastStepRef.current = performance.now();
  }, []);

  const finish = useCallback((r: 'win' | 'lose' | 'draw') => {
    runningRef.current = false;
    setResult(r);
    setScore((s) => ({
      you: s.you + (r === 'win' ? 1 : 0),
      cpu: s.cpu + (r === 'lose' ? 1 : 0),
    }));
  }, []);

  const turn = useCallback((d: Dir) => {
    if (!runningRef.current) return;
    setDir(stateRef.current.player, d);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
      };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); turn(dir); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const s = stateRef.current;
      ctx.fillStyle = '#04060f';
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
      // grid glow lines
      ctx.strokeStyle = 'rgba(60,120,200,0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x += 4) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, ROWS * CELL); ctx.stroke(); }
      for (let y = 0; y <= ROWS; y += 4) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(COLS * CELL, y * CELL); ctx.stroke(); }
      // trails
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (s.player.trail[y][x]) { ctx.fillStyle = 'rgba(90,200,255,0.85)'; ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1); }
          else if (s.bot.trail[y][x]) { ctx.fillStyle = 'rgba(255,120,90,0.85)'; ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1); }
        }
      }
      // heads
      ctx.fillStyle = '#aef0ff'; ctx.shadowColor = '#5ac8ff'; ctx.shadowBlur = 10;
      ctx.fillRect(s.player.x * CELL, s.player.y * CELL, CELL - 1, CELL - 1);
      ctx.fillStyle = '#ffd0c0'; ctx.shadowColor = '#ff785a';
      ctx.fillRect(s.bot.x * CELL, s.bot.y * CELL, CELL - 1, CELL - 1);
      ctx.shadowBlur = 0;
    };

    const loop = (now: number) => {
      if (runningRef.current && now - lastStepRef.current >= SPEED_MS[diffRef.current]) {
        lastStepRef.current = now;
        botThink(stateRef.current, diffRef.current);
        const t = tick(stateRef.current);
        if (t.playerCrashed || t.botCrashed) {
          if (t.playerCrashed && t.botCrashed) finish('draw');
          else if (t.playerCrashed) finish('lose');
          else finish('win');
        }
      }
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [finish]);

  return (
    <div className={'tr-wrap'}>
      <div className={'tr-head'}>
        <Link to={'/games'} className={'tr-back'}>{'\u2190 Back'}</Link>
        <h1 className={'tr-title'}>{'Tron'}</h1>
        <div className={'tr-diff'}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button key={d} className={'tr-diff-btn' + (difficulty === d ? ' active' : '')}
              onClick={() => setDifficulty(d)}>{d}</button>
          ))}
        </div>
      </div>
      <div className={'tr-score'}>
        <span className={'tr-you'}>{'YOU ' + score.you}</span>
        <span className={'tr-cpu'}>{score.cpu + ' CPU'}</span>
      </div>
      <div className={'tr-stage-wrap'}>
        <canvas ref={canvasRef} width={COLS * 9} height={ROWS * 9} className={'tr-canvas'} />
        {(!started || result) && (
          <div className={'tr-overlay'}>
            <div className={'tr-card'}>
              {result && (
                <div className={'tr-result'}>
                  {result === 'win' ? 'You Win!' : result === 'lose' ? 'You Crashed' : 'Draw'}
                </div>
              )}
              {!started && <div className={'tr-result'}>{'Light Cycles'}</div>}
              <button className={'tr-play'} onClick={begin}>{result || started ? 'Play again' : 'Start'}</button>
              <Link to={'/games'} className={'tr-leave'}>{'Back to games'}</Link>
            </div>
          </div>
        )}
      </div>
      <div className={'tr-controls'}>
        <button className={'tr-pad'} onClick={() => turn('up')}>{'\u25b2'}</button>
        <div className={'tr-pad-row'}>
          <button className={'tr-pad'} onClick={() => turn('left')}>{'\u25c0'}</button>
          <button className={'tr-pad'} onClick={() => turn('down')}>{'\u25bc'}</button>
          <button className={'tr-pad'} onClick={() => turn('right')}>{'\u25b6'}</button>
        </div>
      </div>
      <p className={'tr-hint'}>{'Use arrow keys / WASD or the on-screen pad. Don\u2019t hit the walls or any trail.'}</p>
    </div>
  );
}
