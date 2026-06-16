import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Ball, TABLE, BALL_R, rack, step, anyMoving, strike, pockets } from './engine';
import './eightball.css';

type Difficulty = 'easy' | 'medium' | 'hard';
type Turn = 'you' | 'bot';

const COLORS: Record<number, string> = {
  0: '#ffffff', 1: '#f4c430', 2: '#2453d8', 3: '#d83a3a', 4: '#6a2da8', 5: '#e7822e',
  6: '#1f8a4c', 7: '#7a2330', 8: '#111111', 9: '#f4c430', 10: '#2453d8', 11: '#d83a3a',
  12: '#6a2da8', 13: '#e7822e', 14: '#1f8a4c', 15: '#7a2330',
};

export default function EightBall() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballsRef = useRef<Ball[]>(rack());
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [turn, setTurn] = useState<Turn>('you');
  const [aiming, setAiming] = useState(false);
  const aimRef = useRef<{ angle: number; power: number }>({ angle: 0, power: 0 });
  const [, force] = useState(0);
  const [message, setMessage] = useState('Drag from the cue ball to aim, release to shoot');
  const [winner, setWinner] = useState<Turn | null>(null);
  const simRef = useRef(false);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const reset = useCallback(() => {
    ballsRef.current = rack();
    setTurn('you');
    setWinner(null);
    setMessage('Drag from the cue ball to aim, release to shoot');
    simRef.current = false;
    force((n) => n + 1);
  }, []);

  const draw = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, TABLE.w, TABLE.h);
    // felt
    ctx.fillStyle = '#0b6b3a'; ctx.fillRect(0, 0, TABLE.w, TABLE.h);
    ctx.fillStyle = '#073f23';
    ctx.fillRect(0, 0, TABLE.w, TABLE.cushion);
    ctx.fillRect(0, TABLE.h - TABLE.cushion, TABLE.w, TABLE.cushion);
    ctx.fillRect(0, 0, TABLE.cushion, TABLE.h);
    ctx.fillRect(TABLE.w - TABLE.cushion, 0, TABLE.cushion, TABLE.h);
    // pockets
    ctx.fillStyle = '#000';
    for (const p of pockets()) { ctx.beginPath(); ctx.arc(p.x, p.y, 18, 0, Math.PI * 2); ctx.fill(); }
    // balls
    for (const b of ballsRef.current) {
      if (b.potted) continue;
      ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[b.id]; ctx.fill();
      if (b.group === 'stripe') {
        ctx.save(); ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = '#fff'; ctx.fillRect(b.x - BALL_R, b.y - 4, BALL_R * 2, 8); ctx.restore();
      }
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.stroke();
      if (b.id !== 0 && b.id !== 8) {
        ctx.fillStyle = '#000'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(b.id), b.x, b.y);
      }
    }
    // aim line
    const cue = ballsRef.current[0];
    if (aiming && !cue.potted) {
      const a = aimRef.current;
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(cue.x, cue.y);
      ctx.lineTo(cue.x + Math.cos(a.angle) * 120 * a.power, cue.y + Math.sin(a.angle) * 120 * a.power);
      ctx.stroke(); ctx.setLineDash([]);
    }
  }, [aiming]);

  // render loop while simulating
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (simRef.current) {
        for (let i = 0; i < 2; i++) step(ballsRef.current);
        if (!anyMoving(ballsRef.current)) {
          simRef.current = false;
          resolveTurn();
        }
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw]);

  const resolveTurn = useCallback(() => {
    const balls = ballsRef.current;
    const cue = balls[0];
    const eight = balls.find((b) => b.id === 8)!;
    if (eight.potted) {
      const solidsLeft = balls.filter((b) => b.group === 'solid' && !b.potted).length;
      const stripesLeft = balls.filter((b) => b.group === 'stripe' && !b.potted).length;
      setWinner(turn === 'you' ? (solidsLeft === 0 || stripesLeft === 0 ? 'you' : 'bot') : 'bot');
      return;
    }
    if (cue.potted) {
      cue.potted = false; cue.x = TABLE.w * 0.25; cue.y = TABLE.h / 2; cue.vx = 0; cue.vy = 0;
      setMessage('Scratch! Turn passes.');
    }
    const next: Turn = turn === 'you' ? 'bot' : 'you';
    setTurn(next);
    force((n) => n + 1);
  }, [turn]);

  const shoot = useCallback((angle: number, power: number) => {
    if (simRef.current || winner) return;
    strike(ballsRef.current[0], angle, Math.max(0.15, power));
    simRef.current = true;
    setAiming(false);
  }, [winner]);

  // Bot turn
  useEffect(() => {
    if (turn !== 'bot' || winner || simRef.current) return;
    const id = setTimeout(() => {
      const balls = ballsRef.current;
      const cue = balls[0];
      const targets = balls.filter((b) => !b.potted && b.id !== 0);
      if (targets.length === 0) return;
      const t = targets[Math.floor(Math.random() * targets.length)];
      let angle = Math.atan2(t.y - cue.y, t.x - cue.x);
      const err = difficulty === 'easy' ? 0.3 : difficulty === 'medium' ? 0.12 : 0.04;
      angle += (Math.random() - 0.5) * err;
      shoot(angle, 0.6 + Math.random() * 0.3);
    }, 700);
    return () => clearTimeout(id);
  }, [turn, winner, difficulty, shoot]);

  // pointer handlers (mouse + touch via pointer events)
  const toLocal = (e: React.PointerEvent) => {
    const cv = canvasRef.current!; const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (TABLE.w / r.width), y: (e.clientY - r.top) * (TABLE.h / r.height) };
  };
  const onDown = (e: React.PointerEvent) => {
    if (turn !== 'you' || simRef.current || winner) return;
    dragRef.current = toLocal(e);
    setAiming(true);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!aiming || !dragRef.current) return;
    const cue = ballsRef.current[0];
    const p = toLocal(e);
    const dx = cue.x - p.x; const dy = cue.y - p.y;
    aimRef.current = { angle: Math.atan2(dy, dx), power: Math.min(1, Math.hypot(dx, dy) / 160) };
  };
  const onUp = () => {
    if (!aiming) return;
    shoot(aimRef.current.angle, aimRef.current.power);
    dragRef.current = null;
  };

  return (
    <div className="eb-wrap">
      <div className="eb-head">
        <Link to="/games" className="eb-back">&larr; Games</Link>
        <h1 className="eb-title">8-Ball Pool</h1>
        <div className="eb-diff">
          {(['easy','medium','hard'] as Difficulty[]).map((d) => (
            <button key={d} className={'eb-diff-btn ' + (difficulty===d?'active':'')} onClick={() => { setDifficulty(d); reset(); }}>{d}</button>
          ))}
        </div>
      </div>
      <div className={'eb-status ' + (turn==='you'?'you':'bot')}>{turn === 'you' ? 'Your shot' : 'Bot shooting...'} — {message}</div>
      <div className="eb-table-wrap">
        <canvas
          ref={canvasRef}
          width={TABLE.w}
          height={TABLE.h}
          className="eb-canvas"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        />
      </div>
      {winner && (
        <div className="eb-overlay">
          <div className="eb-card">
            <div className="eb-result">{winner === 'you' ? 'You win!' : 'Bot wins'}</div>
            <button className="eb-play" onClick={reset}>Play again</button>
            <Link to="/games" className="eb-leave">Back to games</Link>
          </div>
        </div>
      )}
    </div>
  );
}
