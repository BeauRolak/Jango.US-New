import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  STAGE, BALL_R, CUP_R, THROW_ORIGIN,
  makeBall, makeCups, toss, step, botToss, allMade,
} from './engine';
import type { Ball, Cup, Difficulty } from './engine';
import './cupking.css';

export default function CupKing() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballRef = useRef<Ball>(makeBall());
  const cupsRef = useRef<Cup[]>(makeCups());
  const botCupsRef = useRef<Cup[]>(makeCups());
  const rafRef = useRef<number>(0);
  const aimRef = useRef<{ aimX: number; power: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const busyRef = useRef(false);
  const diffRef = useRef<Difficulty>('medium');
  const turnRef = useRef<'you' | 'cpu'>('you');

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [turn, setTurn] = useState<'you' | 'cpu'>('you');
  const [made, setMade] = useState({ you: 0, cpu: 0 });
  const madeRef = useRef(made);
  const [message, setMessage] = useState('Drag back from the ball to aim, release to throw');
  const [winner, setWinner] = useState<null | string>(null);

  useEffect(() => { diffRef.current = difficulty; }, [difficulty]);
  useEffect(() => { turnRef.current = turn; }, [turn]);
  useEffect(() => { madeRef.current = made; }, [made]);

  const toCanvas = useCallback((e: React.PointerEvent) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (STAGE.w / r.width), y: (e.clientY - r.top) * (STAGE.h / r.height) };
  }, []);

  const resolveThrow = useCallback((scored: boolean) => {
    busyRef.current = false;
    const who = turnRef.current;
    if (scored) {
      const nm = who === 'you'
        ? { ...madeRef.current, you: madeRef.current.you + 1 }
        : { ...madeRef.current, cpu: madeRef.current.cpu + 1 };
      setMade(nm);
      madeRef.current = nm;
    }
    const youCups = cupsRef.current;
    const cpuCups = botCupsRef.current;
    if (allMade(youCups)) { setWinner('You Win!'); return; }
    if (allMade(cpuCups)) { setWinner('CPU Wins'); return; }
    setTimeout(() => {
      ballRef.current = makeBall();
      const next = who === 'you' ? 'cpu' : 'you';
      setTurn(next);
      setMessage(next === 'you' ? (scored ? 'Sank it! Go again' : 'Missed - CPU went, your turn') : 'CPU throwing...');
    }, 700);
  }, []);

  const launch = useCallback((aimX: number, power: number) => {
    if (busyRef.current) return;
    busyRef.current = true;
    aimRef.current = null;
    const who = turnRef.current;
    const cups = who === 'you' ? cupsRef.current : botCupsRef.current;
    toss(ballRef.current, aimX, power);
    let scored = false;
    const watch = () => {
      const out = step(ballRef.current, cups);
      if (out.madeIdx >= 0) { cups[out.madeIdx].made = true; scored = true; }
      if (ballRef.current.flying && !ballRef.current.settled) requestAnimationFrame(watch);
      else setTimeout(() => resolveThrow(scored), 250);
    };
    requestAnimationFrame(watch);
  }, [resolveThrow]);

  const onDown = useCallback((e: React.PointerEvent) => {
    if (turnRef.current !== 'you' || busyRef.current) return;
    dragRef.current = toCanvas(e);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [toCanvas]);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const p = toCanvas(e);
    const dx = THROW_ORIGIN.x - p.x;
    const dy = THROW_ORIGIN.y - p.y;
    aimRef.current = {
      aimX: Math.max(-1, Math.min(1, -dx / 80)),
      power: Math.max(0, Math.min(1, dy / 200)),
    };
  }, [toCanvas]);

  const onUp = useCallback(() => {
    if (!dragRef.current || !aimRef.current) { dragRef.current = null; return; }
    const a = aimRef.current;
    dragRef.current = null;
    if (a.power > 0.15) launch(a.aimX, a.power);
  }, [launch]);

  useEffect(() => {
    if (turn !== 'cpu' || winner) return;
    const t = setTimeout(() => {
      const k = botToss(botCupsRef.current, diffRef.current);
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
      ctx.clearRect(0, 0, STAGE.w, STAGE.h);
      const g = ctx.createLinearGradient(0, 0, 0, STAGE.h);
      g.addColorStop(0, '#241006'); g.addColorStop(1, '#0e0703');
      ctx.fillStyle = g; ctx.fillRect(0, 0, STAGE.w, STAGE.h);
      // table
      ctx.fillStyle = 'rgba(120,70,30,0.35)';
      ctx.fillRect(0, 60, STAGE.w, STAGE.h - 60);
      const cups = turnRef.current === 'you' ? cupsRef.current : botCupsRef.current;
      for (const cup of cups) {
        if (cup.made) continue;
        ctx.beginPath();
        ctx.ellipse(cup.x, cup.y, CUP_R, CUP_R * 0.55, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#e23b3b'; ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cup.x, cup.y - 2, CUP_R - 4, (CUP_R - 4) * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ffce8a'; ctx.fill();
      }
      // aim preview
      if (aimRef.current) {
        const sim = { ...ballRef.current };
        const simCups = cups.map((c) => ({ ...c }));
        toss(sim, aimRef.current.aimX, aimRef.current.power);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (let i = 0; i < 30; i++) {
          step(sim, simCups);
          if (i % 2 === 0) { ctx.beginPath(); ctx.arc(sim.x, sim.y - sim.z, 2, 0, Math.PI * 2); ctx.fill(); }
        }
      }
      // ball
      const b = ballRef.current;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(b.x, b.y, BALL_R, BALL_R * 0.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f5f5f5';
      ctx.beginPath(); ctx.arc(b.x, b.y - b.z, BALL_R, 0, Math.PI * 2); ctx.fill();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const restart = () => {
    ballRef.current = makeBall();
    cupsRef.current = makeCups();
    botCupsRef.current = makeCups();
    setMade({ you: 0, cpu: 0 }); madeRef.current = { you: 0, cpu: 0 };
    setTurn('you'); setWinner(null); busyRef.current = false;
    setMessage('Drag back from the ball to aim, release to throw');
  };

  return (
    <div className={'ck-wrap'}>
      <div className={'ck-head'}>
        <Link to={'/games'} className={'ck-back'}>{'\u2190 Back'}</Link>
        <h1 className={'ck-title'}>{'Cup King'}</h1>
        <div className={'ck-diff'}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button key={d} className={'ck-diff-btn' + (difficulty === d ? ' active' : '')}
              onClick={() => setDifficulty(d)}>{d}</button>
          ))}
        </div>
      </div>
      <div className={'ck-score'}>
        <span className={'ck-you'}>{'YOU ' + made.you}</span>
        <span className={'ck-turn'}>{turn === 'you' ? 'your cups' : 'cpu cups'}</span>
        <span className={'ck-cpu'}>{made.cpu + ' CPU'}</span>
      </div>
      <div className={'ck-status'}>{message}</div>
      <div className={'ck-stage-wrap'}>
        <canvas ref={canvasRef} width={STAGE.w} height={STAGE.h} className={'ck-canvas'}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
        {winner && (
          <div className={'ck-overlay'}>
            <div className={'ck-card'}>
              <div className={'ck-result'}>{winner}</div>
              <div className={'ck-final'}>{'You sank ' + made.you + ' \u2013 CPU sank ' + made.cpu}</div>
              <button className={'ck-play'} onClick={restart}>{'Play again'}</button>
              <Link to={'/games'} className={'ck-leave'}>{'Back to games'}</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
