import { useEffect, useRef, useState, useCallback } from 'react';
import { COURT, BALL_R, HOOP, SHOOT_ORIGIN, GRAVITY, makeBall, shoot, step, botShot } from './engine';
import type { Ball, Difficulty } from './engine';
import { MatchSetup, MatchResult, GameTopBar } from '../shared/GameShell';
import { createSpin2D } from '../shared/rollingBall';
import { useFeedback } from '../../components/Juice';
import './basketball.css';

type Phase = 'setup' | 'playing' | 'results';
const ACCENT = '#ff8a2b';

export default function Basketball() {
  const { fire } = useFeedback();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballRef = useRef<Ball>(makeBall());
  const spinRef = useRef(createSpin2D(BALL_R));
  const rafRef = useRef<number>(0);
  const aimRef = useRef<{ angle: number; power: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [target, setTarget] = useState(7);
  const [entry, setEntry] = useState(10);
  const [score, setScore] = useState({ you: 0, cpu: 0 });
  const [turn, setTurn] = useState<'you' | 'cpu'>('you');
  const [message, setMessage] = useState('Drag from the ball to aim');
  const [winner, setWinner] = useState<null | 'you' | 'cpu'>(null);
  const scoreRef = useRef(score), diffRef = useRef(difficulty), turnRef = useRef<'you' | 'cpu'>('you'), busyRef = useRef(false), targetRef = useRef(target);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { diffRef.current = difficulty; }, [difficulty]);
  useEffect(() => { turnRef.current = turn; }, [turn]);
  useEffect(() => { targetRef.current = target; }, [target]);

  const start = () => { ballRef.current = makeBall(); setScore({ you: 0, cpu: 0 }); setTurn('you'); setWinner(null); busyRef.current = false; setMessage('Drag from the ball to aim'); setPhase('playing'); fire('match_start', 'First to ' + target, null); };
  const newSetup = () => setPhase('setup');

  const toCanvas = useCallback((e: React.PointerEvent) => { const c = canvasRef.current; if (!c) return { x: 0, y: 0 }; const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * (COURT.w / r.width), y: (e.clientY - r.top) * (COURT.h / r.height) }; }, []);

  const resolveAfterShot = useCallback((scored: boolean) => {
    busyRef.current = false; const who = turnRef.current;
    if (scored) {
      const ns = who === 'you' ? { ...scoreRef.current, you: scoreRef.current.you + 1 } : { ...scoreRef.current, cpu: scoreRef.current.cpu + 1 };
      setScore(ns); fire(who === 'you' ? 'success' : 'tap', undefined, null);
      if (ns.you >= targetRef.current || ns.cpu >= targetRef.current) { const w = ns.you >= targetRef.current ? 'you' : 'cpu'; setWinner(w); setTimeout(() => { fire(w === 'you' ? 'match_win' : 'match_loss', undefined, null); setPhase('results'); }, 900); return; }
    }
    ballRef.current = makeBall();
    const next = who === 'you' ? 'cpu' : 'you'; setTurn(next);
    setMessage(next === 'you' ? (scored ? 'Swish! Your ball' : 'Your ball') : 'Bot shooting…');
  }, [fire]);

  const launch = useCallback((angle: number, power: number) => {
    if (busyRef.current) return; busyRef.current = true; aimRef.current = null; shoot(ballRef.current, angle, power);
    fire('tap', undefined, null);
    let scored = false;
    const watch = () => { const out = step(ballRef.current); if (out.justScored) scored = true; if (ballRef.current.flying && !ballRef.current.settled) requestAnimationFrame(watch); else setTimeout(() => resolveAfterShot(scored), 300); };
    requestAnimationFrame(watch);
  }, [resolveAfterShot, fire]);

  const onDown = useCallback((e: React.PointerEvent) => { if (turnRef.current !== 'you' || busyRef.current) return; dragRef.current = toCanvas(e); (e.target as Element).setPointerCapture?.(e.pointerId); }, [toCanvas]);
  const onMove = useCallback((e: React.PointerEvent) => { if (!dragRef.current) return; const p = toCanvas(e); const dx = SHOOT_ORIGIN.x - p.x, dy = SHOOT_ORIGIN.y - p.y; aimRef.current = { angle: Math.atan2(dy, dx), power: Math.min(20, Math.hypot(dx, dy) / 12) }; }, [toCanvas]);
  const onUp = useCallback(() => { if (!dragRef.current || !aimRef.current) { dragRef.current = null; return; } const { angle, power } = aimRef.current; dragRef.current = null; if (power > 4) launch(angle, power); }, [launch]);

  useEffect(() => {
    if (phase !== 'playing' || turn !== 'cpu' || winner) return;
    const t = setTimeout(() => { const s = botShot(diffRef.current); launch(s.angle, s.power); }, 850);
    return () => clearTimeout(t);
  }, [turn, winner, launch, phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const drawHoop = () => {
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(HOOP.cx + HOOP.rimHalf + 14, HOOP.y - 70, 8, 80);
      ctx.strokeStyle = '#ff5c2a'; ctx.lineWidth = 4; ctx.strokeRect(HOOP.cx + HOOP.rimHalf - 6, HOOP.y - 44, 22, 30);
      ctx.strokeStyle = '#ff5c2a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(HOOP.cx - HOOP.rimHalf, HOOP.y); ctx.lineTo(HOOP.cx + HOOP.rimHalf, HOOP.y); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
      for (let i = 0; i <= 6; i++) { const t = i / 6; const topX = HOOP.cx - HOOP.rimHalf + t * HOOP.rimHalf * 2; const botX = HOOP.cx - HOOP.rimHalf * 0.5 + t * HOOP.rimHalf; ctx.beginPath(); ctx.moveTo(topX, HOOP.y); ctx.lineTo(botX, HOOP.y + 34); ctx.stroke(); }
    };
    const drawAim = () => { if (!aimRef.current) return; const { angle, power } = aimRef.current; let x = SHOOT_ORIGIN.x, y = SHOOT_ORIGIN.y, vx = Math.cos(angle) * power, vy = -Math.sin(angle) * power; ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 28; i++) { vy += GRAVITY; x += vx; y += vy; if (i % 2 === 0) { ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 6.28); ctx.fill(); } } };
    const draw = () => {
      ctx.clearRect(0, 0, COURT.w, COURT.h);
      const g = ctx.createLinearGradient(0, 0, 0, COURT.h); g.addColorStop(0, '#2a1505'); g.addColorStop(1, '#160c02'); ctx.fillStyle = g; ctx.fillRect(0, 0, COURT.w, COURT.h);
      ctx.strokeStyle = 'rgba(255,170,80,0.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, COURT.h - 40); ctx.lineTo(COURT.w, COURT.h - 40); ctx.stroke();
      drawHoop(); drawAim();
      const b = ballRef.current; const grd = ctx.createRadialGradient(b.x - 5, b.y - 5, 3, b.x, b.y, BALL_R); grd.addColorStop(0, '#ffb066'); grd.addColorStop(1, '#d4631a'); ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, 6.28); ctx.fill();
      // backspin: seams rotate about the view axis as the ball travels
      const ang = spinRef.current.step(b.x, b.y, -1);
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang);
      ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, BALL_R, 0, 6.28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-BALL_R, 0); ctx.lineTo(BALL_R, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -BALL_R); ctx.lineTo(0, BALL_R); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, BALL_R * 0.5, BALL_R, 0, 0, 6.28); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, BALL_R, BALL_R * 0.5, 0, 0, 6.28); ctx.stroke();
      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  if (phase === 'setup') {
    return (
      <MatchSetup game="Basketball" icon="Target" accent={ACCENT}
        blurb="Drag to arc your shot. First to the target score wins."
        difficulty={difficulty} onDifficulty={(d) => { setDifficulty(d as Difficulty); fire('tap'); }}
        extras={[{ key: 'len', label: 'Match length', cols: true, value: String(target), onChange: (v) => { setTarget(Number(v)); fire('tap'); }, options: [{ id: '5', label: 'First to 5' }, { id: '7', label: 'First to 7' }, { id: '11', label: 'First to 11' }] }]}
        entry={entry} onEntry={(n) => { setEntry(n); fire('tap'); }} onStart={start} />
    );
  }
  if (phase === 'results') {
    const youWin = winner === 'you';
    return <MatchResult accent={ACCENT} outcome={youWin ? 'win' : 'lose'} title={youWin ? 'You win!' : 'Bot wins'} sub={`Final ${score.you} – ${score.cpu}`} entry={entry} onRematch={start} onNewSetup={newSetup} />;
  }

  return (
    <div className="bk2-wrap" style={{ ['--acc' as any]: ACCENT }}>
      <GameTopBar title="Basketball" sub={`First to ${target}`} accent={ACCENT} onBack={newSetup}
        right={<span className="bk2-mini"><b className="you">{score.you}</b> – <b className="bot">{score.cpu}</b></span>} />
      <div className="bk2-status">{turn === 'you' ? message : 'Bot shooting…'}</div>
      <div className="bk2-stage">
        <canvas ref={canvasRef} width={COURT.w} height={COURT.h} className="bk2-canvas" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
      </div>
      <p className="bk2-hint">Drag back from the ball to aim &amp; set power, release to shoot.</p>
    </div>
  );
}
