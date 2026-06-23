import { useEffect, useRef, useState, useCallback } from 'react';
import { FIELD, BALL_R, GOAL, KICK_ORIGIN, makeBall, kick, step, botKick, randomWind } from './engine';
import type { Ball, Difficulty, Wind } from './engine';
import { MatchSetup, MatchResult, GameTopBar } from '../shared/GameShell';
import { createSpin2D } from '../shared/rollingBall';
import { useFeedback } from '../../components/Juice';
import './football.css';

type Phase = 'setup' | 'playing' | 'results';
const ACCENT = '#39e06b';

export default function Football() {
  const { fire } = useFeedback();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballRef = useRef<Ball>(makeBall());
  const spinRef = useRef(createSpin2D(BALL_R));
  const windRef = useRef<Wind>(randomWind());
  const rafRef = useRef<number>(0);
  const aimRef = useRef<{ aimX: number; power: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const busyRef = useRef(false);

  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [rounds, setRounds] = useState(5);
  const [entry, setEntry] = useState(5);
  const [score, setScore] = useState({ you: 0, cpu: 0 });
  const [turn, setTurn] = useState<'you' | 'cpu'>('you');
  const [kicksLeft, setKicksLeft] = useState({ you: 5, cpu: 5 });
  const [message, setMessage] = useState('Drag back from the ball to aim');
  const [winner, setWinner] = useState<null | 'you' | 'cpu' | 'tie'>(null);
  const [windDisp, setWindDisp] = useState(windRef.current.x);
  const scoreRef = useRef(score), diffRef = useRef(difficulty), turnRef = useRef<'you' | 'cpu'>('you'), kicksRef = useRef(kicksLeft);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { diffRef.current = difficulty; }, [difficulty]);
  useEffect(() => { turnRef.current = turn; }, [turn]);
  useEffect(() => { kicksRef.current = kicksLeft; }, [kicksLeft]);

  const start = () => {
    ballRef.current = makeBall(); windRef.current = randomWind(); setWindDisp(windRef.current.x);
    setScore({ you: 0, cpu: 0 }); setKicksLeft({ you: rounds, cpu: rounds }); kicksRef.current = { you: rounds, cpu: rounds };
    setTurn('you'); setWinner(null); busyRef.current = false; setMessage('Drag back from the ball to aim'); setPhase('playing');
    fire('match_start', rounds + ' kicks each', null);
  };
  const newSetup = () => setPhase('setup');

  const toCanvas = useCallback((e: React.PointerEvent) => { const c = canvasRef.current; if (!c) return { x: 0, y: 0 }; const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * (FIELD.w / r.width), y: (e.clientY - r.top) * (FIELD.h / r.height) }; }, []);

  const resolveKick = useCallback((made: boolean) => {
    busyRef.current = false; const who = turnRef.current;
    if (made) { const ns = who === 'you' ? { ...scoreRef.current, you: scoreRef.current.you + 3 } : { ...scoreRef.current, cpu: scoreRef.current.cpu + 3 }; setScore(ns); fire(who === 'you' ? 'success' : 'tap', undefined, null); }
    const nk = who === 'you' ? { ...kicksRef.current, you: kicksRef.current.you - 1 } : { ...kicksRef.current, cpu: kicksRef.current.cpu - 1 };
    setKicksLeft(nk); kicksRef.current = nk;
    setTimeout(() => {
      if (nk.you <= 0 && nk.cpu <= 0) { const s = scoreRef.current; const w = s.you === s.cpu ? 'tie' : s.you > s.cpu ? 'you' : 'cpu'; setWinner(w); setTimeout(() => { fire(w === 'you' ? 'match_win' : w === 'cpu' ? 'match_loss' : 'tap', undefined, null); setPhase('results'); }, 800); return; }
      ballRef.current = makeBall(); windRef.current = randomWind(); setWindDisp(windRef.current.x);
      let next: 'you' | 'cpu' = who === 'you' ? 'cpu' : 'you';
      if (next === 'cpu' && nk.cpu <= 0) next = 'you'; if (next === 'you' && nk.you <= 0) next = 'cpu';
      setTurn(next); setMessage(next === 'you' ? (made ? 'Good! Your kick' : 'Your kick') : 'Bot kicking…');
    }, 850);
  }, [fire]);

  const launch = useCallback((aimX: number, power: number) => {
    if (busyRef.current) return; busyRef.current = true; aimRef.current = null; kick(ballRef.current, aimX, power); fire('tap', undefined, null);
    let made = false;
    const watch = () => { const out = step(ballRef.current, windRef.current); if (out.result === 'good') made = true; if (ballRef.current.flying && !ballRef.current.settled) requestAnimationFrame(watch); else setTimeout(() => resolveKick(made), 250); };
    requestAnimationFrame(watch);
  }, [resolveKick, fire]);

  const onDown = useCallback((e: React.PointerEvent) => { if (turnRef.current !== 'you' || busyRef.current) return; dragRef.current = toCanvas(e); (e.target as Element).setPointerCapture?.(e.pointerId); }, [toCanvas]);
  const onMove = useCallback((e: React.PointerEvent) => { if (!dragRef.current) return; const p = toCanvas(e); const dx = KICK_ORIGIN.x - p.x, dy = KICK_ORIGIN.y - p.y; aimRef.current = { aimX: Math.max(-1, Math.min(1, -dx / 80)), power: Math.max(0, Math.min(1, dy / 180)) }; }, [toCanvas]);
  const onUp = useCallback(() => { if (!dragRef.current || !aimRef.current) { dragRef.current = null; return; } const { aimX, power } = aimRef.current; dragRef.current = null; if (power > 0.15) launch(aimX, power); }, [launch]);

  useEffect(() => {
    if (phase !== 'playing' || turn !== 'cpu' || winner) return;
    const t = setTimeout(() => { const k = botKick(diffRef.current, windRef.current); launch(k.aimX, k.power); }, 950);
    return () => clearTimeout(t);
  }, [turn, winner, launch, phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const draw = () => {
      ctx.clearRect(0, 0, FIELD.w, FIELD.h);
      ctx.fillStyle = '#15431f'; ctx.fillRect(0, 0, FIELD.w, FIELD.h);
      ctx.fillStyle = '#1a4f25'; for (let y = 0; y < FIELD.h; y += 50) ctx.fillRect(0, y, FIELD.w, 25);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; for (let y = GOAL.y; y < FIELD.h; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(FIELD.w, y); ctx.stroke(); }
      ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 6; ctx.beginPath();
      ctx.moveTo(GOAL.cx - GOAL.half, GOAL.crossbar); ctx.lineTo(GOAL.cx - GOAL.half, GOAL.y - 10);
      ctx.moveTo(GOAL.cx + GOAL.half, GOAL.crossbar); ctx.lineTo(GOAL.cx + GOAL.half, GOAL.y - 10);
      ctx.moveTo(GOAL.cx - GOAL.half, GOAL.crossbar); ctx.lineTo(GOAL.cx + GOAL.half, GOAL.crossbar); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(GOAL.cx, GOAL.crossbar); ctx.lineTo(GOAL.cx, GOAL.crossbar + 24); ctx.stroke();
      if (aimRef.current) { const sim = { ...ballRef.current }; kick(sim, aimRef.current.aimX, aimRef.current.power); ctx.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 30; i++) { step(sim, windRef.current); if (i % 2 === 0) { ctx.beginPath(); ctx.arc(sim.x, sim.y, 2, 0, 6.28); ctx.fill(); } } }
      const b = ballRef.current; const drawY = b.y - b.z;
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(b.x, b.y, BALL_R * 0.8, BALL_R * 0.35, 0, 0, 6.28); ctx.fill();
      // end-over-end tumble as the kick travels
      const ang = spinRef.current.step(b.x, drawY, 1);
      ctx.save(); ctx.translate(b.x, drawY); ctx.rotate(ang);
      ctx.fillStyle = '#7a3b16'; ctx.beginPath(); ctx.ellipse(0, 0, BALL_R * 0.7, BALL_R, 0, 0, 6.28); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -BALL_R + 3); ctx.lineTo(0, BALL_R - 3); ctx.stroke();
      // lace ticks
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(-2, i * BALL_R * 0.28); ctx.lineTo(2, i * BALL_R * 0.28); ctx.stroke(); }
      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  if (phase === 'setup') {
    return (
      <MatchSetup game="Field Goal" icon="Trophy" accent={ACCENT}
        blurb="Beat the wind and split the uprights. Most points after equal kicks wins."
        difficulty={difficulty} onDifficulty={(d) => { setDifficulty(d as Difficulty); fire('tap'); }}
        extras={[{ key: 'r', label: 'Kicks each', cols: true, value: String(rounds), onChange: (v) => { setRounds(Number(v)); fire('tap'); }, options: [{ id: '3', label: '3' }, { id: '5', label: '5' }, { id: '7', label: '7' }] }]}
        entry={entry} onEntry={(n) => { setEntry(n); fire('tap'); }} onStart={start} />
    );
  }
  if (phase === 'results') {
    return <MatchResult accent={ACCENT} outcome={winner === 'you' ? 'win' : winner === 'cpu' ? 'lose' : 'draw'} title={winner === 'you' ? 'You win!' : winner === 'cpu' ? 'Bot wins' : 'Tie game'} sub={`Final ${score.you} – ${score.cpu}`} entry={winner === 'tie' ? 0 : entry} onRematch={start} onNewSetup={newSetup} />;
  }

  const windArrow = windDisp > 0.01 ? '→' : windDisp < -0.01 ? '←' : '•';
  return (
    <div className="fb2-wrap" style={{ ['--acc' as any]: ACCENT }}>
      <GameTopBar title="Field Goal" sub={`Wind ${windArrow}`} accent={ACCENT} onBack={newSetup}
        right={<span className="fb2-mini"><b className="you">{score.you}</b> – <b className="bot">{score.cpu}</b></span>} />
      <div className="fb2-status">{turn === 'you' ? `${message} · ${kicksLeft.you} left` : 'Bot kicking…'}</div>
      <div className="fb2-stage">
        <canvas ref={canvasRef} width={FIELD.w} height={FIELD.h} className="fb2-canvas" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
      </div>
      <p className="fb2-hint">Drag back from the ball to aim &amp; set power. Mind the wind.</p>
    </div>
  );
}
