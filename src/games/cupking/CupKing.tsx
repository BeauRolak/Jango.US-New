import { useEffect, useRef, useState, useCallback } from 'react';
import { STAGE, BALL_R, CUP_R, THROW_ORIGIN, makeBall, makeCups, toss, step, botToss, allMade } from './engine';
import type { Ball, Cup, Difficulty } from './engine';
import { MatchSetup, MatchResult, GameTopBar } from '../shared/GameShell';
import { createSpin2D } from '../shared/rollingBall';
import { useFeedback } from '../../components/Juice';
import './cupking.css';

type Phase = 'setup' | 'playing' | 'results';
const ACCENT = '#f5d76e';

export default function CupKing() {
  const { fire } = useFeedback();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballRef = useRef<Ball>(makeBall());
  const spinRef = useRef(createSpin2D(BALL_R));
  const cupsRef = useRef<Cup[]>(makeCups());
  const botCupsRef = useRef<Cup[]>(makeCups());
  const rafRef = useRef<number>(0);
  const aimRef = useRef<{ aimX: number; power: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const busyRef = useRef(false);
  const diffRef = useRef<Difficulty>('medium');
  const turnRef = useRef<'you' | 'cpu'>('you');

  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [entry, setEntry] = useState(5);
  const [turn, setTurn] = useState<'you' | 'cpu'>('you');
  const [made, setMade] = useState({ you: 0, cpu: 0 });
  const madeRef = useRef(made);
  const [message, setMessage] = useState('Drag back from the ball to aim');
  const [winner, setWinner] = useState<null | 'you' | 'cpu'>(null);
  useEffect(() => { diffRef.current = difficulty; }, [difficulty]);
  useEffect(() => { turnRef.current = turn; }, [turn]);
  useEffect(() => { madeRef.current = made; }, [made]);

  const start = () => { ballRef.current = makeBall(); cupsRef.current = makeCups(); botCupsRef.current = makeCups(); setMade({ you: 0, cpu: 0 }); madeRef.current = { you: 0, cpu: 0 }; setTurn('you'); setWinner(null); busyRef.current = false; setMessage('Drag back from the ball to aim'); setPhase('playing'); fire('match_start', 'Sink all your cups', null); };
  const newSetup = () => setPhase('setup');

  const toCanvas = useCallback((e: React.PointerEvent) => { const c = canvasRef.current; if (!c) return { x: 0, y: 0 }; const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * (STAGE.w / r.width), y: (e.clientY - r.top) * (STAGE.h / r.height) }; }, []);

  const resolveThrow = useCallback((scored: boolean) => {
    busyRef.current = false; const who = turnRef.current;
    if (scored) { const nm = who === 'you' ? { ...madeRef.current, you: madeRef.current.you + 1 } : { ...madeRef.current, cpu: madeRef.current.cpu + 1 }; setMade(nm); madeRef.current = nm; fire(who === 'you' ? 'success' : 'tap', undefined, null); }
    if (allMade(cupsRef.current)) { setWinner('you'); setTimeout(() => { fire('match_win', undefined, null); setPhase('results'); }, 800); return; }
    if (allMade(botCupsRef.current)) { setWinner('cpu'); setTimeout(() => { fire('match_loss', undefined, null); setPhase('results'); }, 800); return; }
    setTimeout(() => { ballRef.current = makeBall(); const next = who === 'you' ? 'cpu' : 'you'; setTurn(next); setMessage(next === 'you' ? (scored ? 'Sank it! Go again' : 'Your turn') : 'Bot throwing…'); }, 650);
  }, [fire]);

  const launch = useCallback((aimX: number, power: number) => {
    if (busyRef.current) return; busyRef.current = true; aimRef.current = null; const who = turnRef.current;
    const cups = who === 'you' ? cupsRef.current : botCupsRef.current; toss(ballRef.current, aimX, power); fire('tap', undefined, null);
    let scored = false;
    const watch = () => { const out = step(ballRef.current, cups); if (out.madeIdx >= 0) { cups[out.madeIdx].made = true; scored = true; } if (ballRef.current.flying && !ballRef.current.settled) requestAnimationFrame(watch); else setTimeout(() => resolveThrow(scored), 250); };
    requestAnimationFrame(watch);
  }, [resolveThrow, fire]);

  const onDown = useCallback((e: React.PointerEvent) => { if (turnRef.current !== 'you' || busyRef.current) return; dragRef.current = toCanvas(e); (e.target as Element).setPointerCapture?.(e.pointerId); }, [toCanvas]);
  const onMove = useCallback((e: React.PointerEvent) => { if (!dragRef.current) return; const p = toCanvas(e); const dx = THROW_ORIGIN.x - p.x, dy = THROW_ORIGIN.y - p.y; aimRef.current = { aimX: Math.max(-1, Math.min(1, -dx / 80)), power: Math.max(0, Math.min(1, dy / 200)) }; }, [toCanvas]);
  const onUp = useCallback(() => { if (!dragRef.current || !aimRef.current) { dragRef.current = null; return; } const a = aimRef.current; dragRef.current = null; if (a.power > 0.15) launch(a.aimX, a.power); }, [launch]);

  useEffect(() => { if (phase !== 'playing' || turn !== 'cpu' || winner) return; const t = setTimeout(() => { const k = botToss(botCupsRef.current, diffRef.current); launch(k.aimX, k.power); }, 950); return () => clearTimeout(t); }, [turn, winner, launch, phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const draw = () => {
      ctx.clearRect(0, 0, STAGE.w, STAGE.h);
      const g = ctx.createLinearGradient(0, 0, 0, STAGE.h); g.addColorStop(0, '#241006'); g.addColorStop(1, '#0e0703'); ctx.fillStyle = g; ctx.fillRect(0, 0, STAGE.w, STAGE.h);
      ctx.fillStyle = 'rgba(120,70,30,0.35)'; ctx.fillRect(0, 60, STAGE.w, STAGE.h - 60);
      const cups = turnRef.current === 'you' ? cupsRef.current : botCupsRef.current;
      for (const cup of cups) { if (cup.made) continue; ctx.beginPath(); ctx.ellipse(cup.x, cup.y, CUP_R, CUP_R * 0.55, 0, 0, 6.28); ctx.fillStyle = '#e23b3b'; ctx.fill(); ctx.beginPath(); ctx.ellipse(cup.x, cup.y - 2, CUP_R - 4, (CUP_R - 4) * 0.5, 0, 0, 6.28); ctx.fillStyle = '#ffce8a'; ctx.fill(); }
      if (aimRef.current) { const sim = { ...ballRef.current }; const simCups = cups.map((c) => ({ ...c })); toss(sim, aimRef.current.aimX, aimRef.current.power); ctx.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 30; i++) { step(sim, simCups); if (i % 2 === 0) { ctx.beginPath(); ctx.arc(sim.x, sim.y - sim.z, 2, 0, 6.28); ctx.fill(); } } }
      const b = ballRef.current; ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(b.x, b.y, BALL_R, BALL_R * 0.4, 0, 0, 6.28); ctx.fill();
      const byy = b.y - b.z; const grd = ctx.createRadialGradient(b.x - 3, byy - 3, 1, b.x, byy, BALL_R); grd.addColorStop(0, '#ffffff'); grd.addColorStop(1, '#d7dae2');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(b.x, byy, BALL_R, 0, 6.28); ctx.fill();
      // spin: seam rotates as the ball travels
      const ang = spinRef.current.step(b.x, byy, 1);
      ctx.save(); ctx.translate(b.x, byy); ctx.rotate(ang); ctx.strokeStyle = 'rgba(120,130,150,0.6)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(0, 0, BALL_R * 0.55, BALL_R, 0, 0, 6.28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-BALL_R, 0); ctx.lineTo(BALL_R, 0); ctx.stroke(); ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  if (phase === 'setup') {
    return (
      <MatchSetup game="Cup King" icon="Crown" accent={ACCENT}
        blurb="Toss to sink all your cups before the bot clears theirs."
        difficulty={difficulty} onDifficulty={(d) => { setDifficulty(d as Difficulty); fire('tap'); }}
        entry={entry} onEntry={(n) => { setEntry(n); fire('tap'); }} onStart={start} />
    );
  }
  if (phase === 'results') {
    const youWin = winner === 'you';
    return <MatchResult accent={ACCENT} outcome={youWin ? 'win' : 'lose'} title={youWin ? 'You win!' : 'Bot wins'} sub={`Cups ${made.you} – ${made.cpu}`} entry={entry} onRematch={start} onNewSetup={newSetup} />;
  }

  return (
    <div className="ck2-wrap" style={{ ['--acc' as any]: ACCENT }}>
      <GameTopBar title="Cup King" sub={turn === 'you' ? 'Your cups' : 'Bot cups'} accent={ACCENT} onBack={newSetup}
        right={<span className="ck2-mini"><b className="you">{made.you}</b> – <b className="bot">{made.cpu}</b></span>} />
      <div className="ck2-status">{turn === 'you' ? message : 'Bot throwing…'}</div>
      <div className="ck2-stage">
        <canvas ref={canvasRef} width={STAGE.w} height={STAGE.h} className="ck2-canvas" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
      </div>
      <p className="ck2-hint">Drag back from the ball to aim &amp; set power, release to throw.</p>
    </div>
  );
}
