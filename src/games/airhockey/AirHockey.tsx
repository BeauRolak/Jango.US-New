import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TABLE, PUCK_R, PADDLE_R, GOAL_W,
  makePuck, makePaddle, serve, step, botMove, constrainPaddle,
} from './engine';
import type { Puck, Paddle, Difficulty } from './engine';
import './airhockey.css';

const WIN_SCORE = 7;

export default function AirHockey() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const puckRef = useRef<Puck>(makePuck());
  const topRef = useRef<Paddle>(makePaddle('top'));
  const botRef = useRef<Paddle>(makePaddle('bottom'));
  const draggingRef = useRef(false);
  const rafRef = useRef<number>(0);
  const diffRef = useRef<Difficulty>('medium');

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [score, setScore] = useState({ you: 0, cpu: 0 });
  const scoreRef = useRef(score);
  const [winner, setWinner] = useState<null | 'you' | 'cpu'>(null);
  const [running, setRunning] = useState(true);
  const runningRef = useRef(true);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { diffRef.current = difficulty; }, [difficulty]);
  useEffect(() => { runningRef.current = running; }, [running]);

  const reset = useCallback((full: boolean) => {
    puckRef.current = makePuck();
    topRef.current = makePaddle('top');
    botRef.current = makePaddle('bottom');
    if (full) {
      setScore({ you: 0, cpu: 0 });
      setWinner(null);
      setRunning(true);
      runningRef.current = true;
    }
    serve(puckRef.current, Math.random() < 0.5 ? 'top' : 'bottom');
  }, []);

  // pointer handling: drag the bottom (player) paddle
  const pointerPos = useCallback((e: PointerEvent | React.PointerEvent) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    const sx = TABLE.w / r.width;
    const sy = TABLE.h / r.height;
    return { x: ((e as PointerEvent).clientX - r.left) * sx, y: ((e as PointerEvent).clientY - r.top) * sy };
  }, []);

  const onDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    const p = pointerPos(e);
    botRef.current.x = p.x; botRef.current.y = p.y;
    constrainPaddle(botRef.current, 'bottom');
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [pointerPos]);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const p = pointerPos(e);
    botRef.current.x = p.x; botRef.current.y = p.y;
    constrainPaddle(botRef.current, 'bottom');
  }, [pointerPos]);

  const onUp = useCallback(() => { draggingRef.current = false; }, []);

  // main loop
  useEffect(() => {
    serve(puckRef.current, Math.random() < 0.5 ? 'top' : 'bottom');
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const puck = puckRef.current;
      const top = topRef.current;
      const bot = botRef.current;
      if (runningRef.current) {
        botMove(top, puck, diffRef.current);
        const res = step(puck, top, bot);
        if (res.goal === 'top') {
          // puck went into top goal -> player scores
          const next = { ...scoreRef.current, you: scoreRef.current.you + 1 };
          setScore(next);
          if (next.you >= WIN_SCORE) { setWinner('you'); setRunning(false); }
          else { puckRef.current = makePuck(); serve(puckRef.current, 'top'); }
        } else if (res.goal === 'bottom') {
          const next = { ...scoreRef.current, cpu: scoreRef.current.cpu + 1 };
          setScore(next);
          if (next.cpu >= WIN_SCORE) { setWinner('cpu'); setRunning(false); }
          else { puckRef.current = makePuck(); serve(puckRef.current, 'bottom'); }
        }
      }
      draw(ctx);
      rafRef.current = requestAnimationFrame(loop);
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
      const { w, h, wall } = TABLE;
      ctx.clearRect(0, 0, w, h);
      // table surface
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0a1530');
      g.addColorStop(0.5, '#0e1d44');
      g.addColorStop(1, '#0a1530');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // center line + circle
      ctx.strokeStyle = 'rgba(80,200,255,0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(wall, h / 2); ctx.lineTo(w - wall, h / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w / 2, h / 2, 70, 0, Math.PI * 2); ctx.stroke();
      // goals
      const gMin = (w - GOAL_W) / 2;
      ctx.fillStyle = 'rgba(255,60,120,0.5)';
      ctx.fillRect(gMin, 0, GOAL_W, wall);
      ctx.fillStyle = 'rgba(60,255,180,0.5)';
      ctx.fillRect(gMin, h - wall, GOAL_W, wall);
      // walls
      ctx.strokeStyle = 'rgba(120,220,255,0.6)';
      ctx.lineWidth = wall;
      ctx.strokeRect(wall / 2, wall / 2, w - wall, h - wall);
      // puck
      const puck = puckRef.current;
      ctx.beginPath();
      ctx.arc(puck.x, puck.y, PUCK_R, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd34d';
      ctx.shadowColor = '#ffd34d'; ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;
      // paddles
      drawPaddle(ctx, topRef.current, '#ff3c78');
      drawPaddle(ctx, botRef.current, '#3cffb4');
    };

    const drawPaddle = (ctx: CanvasRenderingContext2D, p: Paddle, color: string) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, PADDLE_R, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, PADDLE_R * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fill();
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className={'ah-wrap'}>
      <div className={'ah-head'}>
        <Link to={'/games'} className={'ah-back'}>{'\u2190 Back'}</Link>
        <h1 className={'ah-title'}>{'Air Hockey'}</h1>
        <div className={'ah-diff'}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              className={'ah-diff-btn' + (difficulty === d ? ' active' : '')}
              onClick={() => { setDifficulty(d); }}
            >{d}</button>
          ))}
        </div>
      </div>

      <div className={'ah-score'}>
        <span className={'ah-cpu'}>{'CPU ' + score.cpu}</span>
        <span className={'ah-vs'}>{'\u2013'}</span>
        <span className={'ah-you'}>{'YOU ' + score.you}</span>
      </div>

      <div className={'ah-table-wrap'}>
        <canvas
          ref={canvasRef}
          width={TABLE.w}
          height={TABLE.h}
          className={'ah-canvas'}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
        {winner && (
          <div className={'ah-overlay'}>
            <div className={'ah-card'}>
              <div className={'ah-result'}>{winner === 'you' ? 'You Win!' : 'CPU Wins'}</div>
              <div className={'ah-final'}>{'YOU ' + score.you + '  \u2013  ' + score.cpu + ' CPU'}</div>
              <button className={'ah-play'} onClick={() => reset(true)}>{'Play again'}</button>
              <Link to={'/games'} className={'ah-leave'}>{'Back to games'}</Link>
            </div>
          </div>
        )}
      </div>

      <p className={'ah-hint'}>{'Drag your paddle (bottom) to defend your goal and strike the puck. First to ' + WIN_SCORE + ' wins.'}</p>
    </div>
  );
}
