import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  COURT, BALL_R, HOOP, SHOOT_ORIGIN, GRAVITY,
  makeBall, shoot, step, botShot,
} from './engine';
import type { Ball, Difficulty } from './engine';
import './basketball.css';

const WIN_SCORE = 11;

export default function Basketball() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballRef = useRef<Ball>(makeBall());
  const rafRef = useRef<number>(0);
  const aimRef = useRef<{ angle: number; power: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const diffRef = useRef<Difficulty>('medium');
  const [score, setScore] = useState({ you: 0, cpu: 0 });
  const scoreRef = useRef(score);
  const [turn, setTurn] = useState<'you' | 'cpu'>('you');
  const turnRef = useRef<'you' | 'cpu'>('you');
  const [message, setMessage] = useState('Drag from the ball to aim, release to shoot');
  const [winner, setWinner] = useState<null | 'you' | 'cpu'>(null);
  const busyRef = useRef(false);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { diffRef.current = difficulty; }, [difficulty]);
  useEffect(() => { turnRef.current = turn; }, [turn]);

  const toCanvas = useCallback((e: React.PointerEvent) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (COURT.w / r.width), y: (e.clientY - r.top) * (COURT.h / r.height) };
  }, []);

  const resolveAfterShot = useCallback((scored: boolean) => {
    busyRef.current = false;
    const who = turnRef.current;
    if (scored) {
      const ns = who === 'you'
        ? { ...scoreRef.current, you: scoreRef.current.you + 1 }
        : { ...scoreRef.current, cpu: scoreRef.current.cpu + 1 };
      setScore(ns);
      if (ns.you >= WIN_SCORE) { setWinner('you'); return; }
      if (ns.cpu >= WIN_SCORE) { setWinner('cpu'); return; }
    }
    // switch turn
    ballRef.current = makeBall();
    const next = who === 'you' ? 'cpu' : 'you';
    setTurn(next);
    setMessage(next === 'you' ? (scored ? 'Swish! Your ball' : 'Missed - your ball') : 'CPU shooting...');
  }, []);

  const launch = useCallback((angle: number, power: number) => {
    if (busyRef.current) return;
    busyRef.current = true;
    aimRef.current = null;
    shoot(ballRef.current, angle, power);
    let scoredThisShot = false;
    const watch = () => {
      const out = step(ballRef.current);
      if (out.justScored) scoredThisShot = true;
      if (ballRef.current.flying && !ballRef.current.settled) {
        requestAnimationFrame(watch);
      } else {
        setTimeout(() => resolveAfterShot(scoredThisShot), 300);
      }
    };
    requestAnimationFrame(watch);
  }, [resolveAfterShot]);

  const onDown = useCallback((e: React.PointerEvent) => {
    if (turnRef.current !== 'you' || busyRef.current) return;
    dragRef.current = toCanvas(e);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [toCanvas]);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const p = toCanvas(e);
    const dx = SHOOT_ORIGIN.x - p.x;
    const dy = SHOOT_ORIGIN.y - p.y;
    const angle = Math.atan2(dy, dx);
    const power = Math.min(20, Math.hypot(dx, dy) / 12);
    aimRef.current = { angle, power };
  }, [toCanvas]);

  const onUp = useCallback(() => {
    if (!dragRef.current || !aimRef.current) { dragRef.current = null; return; }
    const { angle, power } = aimRef.current;
    dragRef.current = null;
    if (power > 4) launch(angle, power);
  }, [launch]);

  // bot turn
  useEffect(() => {
    if (turn !== 'cpu' || winner) return;
    const t = setTimeout(() => {
      const s = botShot(diffRef.current);
      launch(s.angle, s.power);
    }, 900);
    return () => clearTimeout(t);
  }, [turn, winner, launch]);

  // render loop
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const drawHoop = () => {
      // backboard
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(HOOP.cx + HOOP.rimHalf + 14, HOOP.y - 70, 8, 80);
      ctx.strokeStyle = '#ff5c2a'; ctx.lineWidth = 4;
      ctx.strokeRect(HOOP.cx + HOOP.rimHalf - 6, HOOP.y - 44, 22, 30);
      // rim
      ctx.strokeStyle = '#ff5c2a'; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(HOOP.cx - HOOP.rimHalf, HOOP.y);
      ctx.lineTo(HOOP.cx + HOOP.rimHalf, HOOP.y);
      ctx.stroke();
      // net
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        const topX = HOOP.cx - HOOP.rimHalf + t * HOOP.rimHalf * 2;
        const botX = HOOP.cx - HOOP.rimHalf * 0.5 + t * HOOP.rimHalf;
        ctx.beginPath(); ctx.moveTo(topX, HOOP.y); ctx.lineTo(botX, HOOP.y + 34); ctx.stroke();
      }
    };

    const drawAimPreview = () => {
      if (!aimRef.current) return;
      const { angle, power } = aimRef.current;
      let x = SHOOT_ORIGIN.x, y = SHOOT_ORIGIN.y;
      let vx = Math.cos(angle) * power, vy = -Math.sin(angle) * power;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i < 28; i++) {
        vy += GRAVITY; x += vx; y += vy;
        if (i % 2 === 0) { ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill(); }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, COURT.w, COURT.h);
      const g = ctx.createLinearGradient(0, 0, 0, COURT.h);
      g.addColorStop(0, '#2a1505'); g.addColorStop(1, '#160c02');
      ctx.fillStyle = g; ctx.fillRect(0, 0, COURT.w, COURT.h);
      // floor line
      ctx.strokeStyle = 'rgba(255,170,80,0.3)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, COURT.h - 40); ctx.lineTo(COURT.w, COURT.h - 40); ctx.stroke();
      drawHoop();
      drawAimPreview();
      // ball
      const b = ballRef.current;
      const grd = ctx.createRadialGradient(b.x - 5, b.y - 5, 3, b.x, b.y, BALL_R);
      grd.addColorStop(0, '#ffb066'); grd.addColorStop(1, '#d4631a');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(b.x - BALL_R, b.y); ctx.lineTo(b.x + BALL_R, b.y); ctx.stroke();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const restart = () => {
    ballRef.current = makeBall();
    setScore({ you: 0, cpu: 0 });
    setTurn('you'); setWinner(null); busyRef.current = false;
    setMessage('Drag from the ball to aim, release to shoot');
  };

  return (
    <div className={'bk-wrap'}>
      <div className={'bk-head'}>
        <Link to={'/games'} className={'bk-back'}>{'\u2190 Back'}</Link>
        <h1 className={'bk-title'}>{'Basketball'}</h1>
        <div className={'bk-diff'}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button key={d} className={'bk-diff-btn' + (difficulty === d ? ' active' : '')}
              onClick={() => setDifficulty(d)}>{d}</button>
          ))}
        </div>
      </div>
      <div className={'bk-score'}>
        <span className={'bk-you'}>{'YOU ' + score.you}</span>
        <span className={'bk-vs'}>{'first to ' + WIN_SCORE}</span>
        <span className={'bk-cpu'}>{score.cpu + ' CPU'}</span>
      </div>
      <div className={'bk-status'}>{message}</div>
      <div className={'bk-court-wrap'}>
        <canvas ref={canvasRef} width={COURT.w} height={COURT.h} className={'bk-canvas'}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
        {winner && (
          <div className={'bk-overlay'}>
            <div className={'bk-card'}>
              <div className={'bk-result'}>{winner === 'you' ? 'You Win!' : 'CPU Wins'}</div>
              <div className={'bk-final'}>{'YOU ' + score.you + '  \u2013  ' + score.cpu + ' CPU'}</div>
              <button className={'bk-play'} onClick={restart}>{'Play again'}</button>
              <Link to={'/games'} className={'bk-leave'}>{'Back to games'}</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
