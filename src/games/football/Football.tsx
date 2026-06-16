import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FIELD, BALL_R, GOAL, KICK_ORIGIN,
  makeBall, kick, step, botKick, randomWind,
} from './engine';
import type { Ball, Difficulty, Wind } from './engine';
import './football.css';

const ROUNDS = 5; // each player gets 5 kicks

export default function Football() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballRef = useRef<Ball>(makeBall());
  const windRef = useRef<Wind>(randomWind());
  const rafRef = useRef<number>(0);
  const aimRef = useRef<{ aimX: number; power: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const busyRef = useRef(false);

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const diffRef = useRef<Difficulty>('medium');
  const [score, setScore] = useState({ you: 0, cpu: 0 });
  const scoreRef = useRef(score);
  const [turn, setTurn] = useState<'you' | 'cpu'>('you');
  const turnRef = useRef<'you' | 'cpu'>('you');
  const [kicksLeft, setKicksLeft] = useState({ you: ROUNDS, cpu: ROUNDS });
  const kicksRef = useRef(kicksLeft);
  const [message, setMessage] = useState('Drag back from the ball to aim and set power');
  const [winner, setWinner] = useState<null | string>(null);
  const [windDisp, setWindDisp] = useState(windRef.current.x);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { diffRef.current = difficulty; }, [difficulty]);
  useEffect(() => { turnRef.current = turn; }, [turn]);
  useEffect(() => { kicksRef.current = kicksLeft; }, [kicksLeft]);

  const toCanvas = useCallback((e: React.PointerEvent) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (FIELD.w / r.width), y: (e.clientY - r.top) * (FIELD.h / r.height) };
  }, []);

  const endTurnCheck = useCallback(() => {
    const k = kicksRef.current;
    if (k.you <= 0 && k.cpu <= 0) {
      const s = scoreRef.current;
      setWinner(s.you === s.cpu ? 'Tie Game' : s.you > s.cpu ? 'You Win!' : 'CPU Wins');
      return true;
    }
    return false;
  }, []);

  const resolveKick = useCallback((made: boolean) => {
    busyRef.current = false;
    const who = turnRef.current;
    if (made) {
      const ns = who === 'you'
        ? { ...scoreRef.current, you: scoreRef.current.you + 3 }
        : { ...scoreRef.current, cpu: scoreRef.current.cpu + 3 };
      setScore(ns);
    }
    // decrement this player's kicks
    const nk = who === 'you'
      ? { ...kicksRef.current, you: kicksRef.current.you - 1 }
      : { ...kicksRef.current, cpu: kicksRef.current.cpu - 1 };
    setKicksLeft(nk);
    kicksRef.current = nk;

    setTimeout(() => {
      if (endTurnCheck()) return;
      ballRef.current = makeBall();
      windRef.current = randomWind();
      setWindDisp(windRef.current.x);
      // alternate to the player who still has kicks
      let next: 'you' | 'cpu' = who === 'you' ? 'cpu' : 'you';
      if (next === 'cpu' && nk.cpu <= 0) next = 'you';
      if (next === 'you' && nk.you <= 0) next = 'cpu';
      setTurn(next);
      setMessage(next === 'you' ? (made ? 'Good! Your kick' : 'No good - your kick') : 'CPU kicking...');
    }, 900);
  }, [endTurnCheck]);

  const launch = useCallback((aimX: number, power: number) => {
    if (busyRef.current) return;
    busyRef.current = true;
    aimRef.current = null;
    kick(ballRef.current, aimX, power);
    let made = false;
    const watch = () => {
      const out = step(ballRef.current, windRef.current);
      if (out.result === 'good') made = true;
      if (ballRef.current.flying && !ballRef.current.settled) requestAnimationFrame(watch);
      else setTimeout(() => resolveKick(made), 250);
    };
    requestAnimationFrame(watch);
  }, [resolveKick]);

  const onDown = useCallback((e: React.PointerEvent) => {
    if (turnRef.current !== 'you' || busyRef.current) return;
    dragRef.current = toCanvas(e);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [toCanvas]);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const p = toCanvas(e);
    const dx = KICK_ORIGIN.x - p.x;
    const dy = KICK_ORIGIN.y - p.y;
    const aimX = Math.max(-1, Math.min(1, -dx / 80));
    const power = Math.max(0, Math.min(1, dy / 180));
    aimRef.current = { aimX, power };
  }, [toCanvas]);

  const onUp = useCallback(() => {
    if (!dragRef.current || !aimRef.current) { dragRef.current = null; return; }
    const { aimX, power } = aimRef.current;
    dragRef.current = null;
    if (power > 0.15) launch(aimX, power);
  }, [launch]);

  useEffect(() => {
    if (turn !== 'cpu' || winner) return;
    const t = setTimeout(() => {
      const k = botKick(diffRef.current, windRef.current);
      launch(k.aimX, k.power);
    }, 1000);
    return () => clearTimeout(t);
  }, [turn, winner, launch]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      ctx.clearRect(0, 0, FIELD.w, FIELD.h);
      // grass with yard lines
      ctx.fillStyle = '#15431f'; ctx.fillRect(0, 0, FIELD.w, FIELD.h);
      ctx.fillStyle = '#1a4f25';
      for (let y = 0; y < FIELD.h; y += 50) ctx.fillRect(0, y, FIELD.w, 25);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
      for (let y = GOAL.y; y < FIELD.h; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(FIELD.w, y); ctx.stroke(); }
      // goalpost
      ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(GOAL.cx - GOAL.half, GOAL.crossbar); ctx.lineTo(GOAL.cx - GOAL.half, GOAL.y - 10);
      ctx.moveTo(GOAL.cx + GOAL.half, GOAL.crossbar); ctx.lineTo(GOAL.cx + GOAL.half, GOAL.y - 10);
      ctx.moveTo(GOAL.cx - GOAL.half, GOAL.crossbar); ctx.lineTo(GOAL.cx + GOAL.half, GOAL.crossbar);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(GOAL.cx, GOAL.crossbar); ctx.lineTo(GOAL.cx, GOAL.crossbar + 24); ctx.stroke();
      // aim preview
      if (aimRef.current) {
        const sim = { ...ballRef.current };
        kick(sim, aimRef.current.aimX, aimRef.current.power);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (let i = 0; i < 30; i++) {
          step(sim, windRef.current);
          if (i % 2 === 0) { ctx.beginPath(); ctx.arc(sim.x, sim.y, 2, 0, Math.PI * 2); ctx.fill(); }
        }
      }
      // ball (z lifts it visually)
      const b = ballRef.current;
      const drawY = b.y - b.z;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(b.x, b.y, BALL_R * 0.8, BALL_R * 0.35, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7a3b16';
      ctx.beginPath(); ctx.ellipse(b.x, drawY, BALL_R * 0.7, BALL_R, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(b.x, drawY - BALL_R + 3); ctx.lineTo(b.x, drawY + BALL_R - 3); ctx.stroke();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const restart = () => {
    ballRef.current = makeBall();
    windRef.current = randomWind();
    setWindDisp(windRef.current.x);
    setScore({ you: 0, cpu: 0 });
    setKicksLeft({ you: ROUNDS, cpu: ROUNDS });
    kicksRef.current = { you: ROUNDS, cpu: ROUNDS };
    setTurn('you'); setWinner(null); busyRef.current = false;
    setMessage('Drag back from the ball to aim and set power');
  };

  const windArrow = windDisp > 0.01 ? '\u2192' : windDisp < -0.01 ? '\u2190' : '\u2022';

  return (
    <div className={'fb-wrap'}>
      <div className={'fb-head'}>
        <Link to={'/games'} className={'fb-back'}>{'\u2190 Back'}</Link>
        <h1 className={'fb-title'}>{'Field Goal'}</h1>
        <div className={'fb-diff'}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button key={d} className={'fb-diff-btn' + (difficulty === d ? ' active' : '')}
              onClick={() => setDifficulty(d)}>{d}</button>
          ))}
        </div>
      </div>
      <div className={'fb-score'}>
        <span className={'fb-you'}>{'YOU ' + score.you}</span>
        <span className={'fb-wind'}>{'WIND ' + windArrow}</span>
        <span className={'fb-cpu'}>{score.cpu + ' CPU'}</span>
      </div>
      <div className={'fb-status'}>{message + '  (' + kicksLeft.you + ' kicks left)'}</div>
      <div className={'fb-field-wrap'}>
        <canvas ref={canvasRef} width={FIELD.w} height={FIELD.h} className={'fb-canvas'}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
        {winner && (
          <div className={'fb-overlay'}>
            <div className={'fb-card'}>
              <div className={'fb-result'}>{winner}</div>
              <div className={'fb-final'}>{'YOU ' + score.you + '  \u2013  ' + score.cpu + ' CPU'}</div>
              <button className={'fb-play'} onClick={restart}>{'Play again'}</button>
              <Link to={'/games'} className={'fb-leave'}>{'Back to games'}</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
