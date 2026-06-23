import { useEffect, useRef, useState, useReducer, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TABLE, PUCK_R, PADDLE_R, GOAL_W, type Paddle } from './engine';
import {
  createMatch, tick, moveHuman, isMatchOver, rematch, type MatchState,
} from './match';
import type { Difficulty } from './engine';
import { Icon } from '../../components/Icon';
import { useFeedback } from '../../components/Juice';
import './airhockey.css';

type Phase = 'setup' | 'playing' | 'results';
const ENTRIES = [0, 5, 10, 25, 50] as const;
const TARGETS = [3, 5, 7] as const;
const DIFFS: { id: Difficulty; label: string; sub: string }[] = [
  { id: 'easy', label: 'Easy', sub: 'Slow defender' },
  { id: 'medium', label: 'Medium', sub: 'Tracks & counters' },
  { id: 'hard', label: 'Hard', sub: 'Fast, aggressive' },
];
const RAKE = 0.03;

export default function AirHockey() {
  const navigate = useNavigate();
  const { fire } = useFeedback();
  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [target, setTarget] = useState<number>(7);
  const [entry, setEntry] = useState<number>(10);

  const matchRef = useRef<MatchState | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const draggingRef = useRef(false);
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const goalFlashRef = useRef<{ side: 'top' | 'bottom'; t: number } | null>(null);
  const prevScoreRef = useRef('0,0');
  const [, force] = useReducer((n) => n + 1, 0);
  const sigRef = useRef('');

  const pot = entry * 2, rake = Math.round(pot * RAKE), payout = pot - rake;

  const start = () => {
    matchRef.current = createMatch(difficulty, target);
    trailRef.current = []; goalFlashRef.current = null; prevScoreRef.current = '0,0'; sigRef.current = '';
    setPhase('playing');
    fire('match_start', 'First to ' + target + ' — go!', null);
  };

  // ---------- loop ----------
  useEffect(() => {
    if (phase !== 'playing') return;
    let raf = 0; let running = true;
    const loop = () => {
      if (!running) return;
      const s = matchRef.current;
      if (s) {
        const next = tick(s);
        matchRef.current = next;
        // puck trail
        if (next.phase === 'playing') {
          const t = trailRef.current; t.push({ x: next.puck.x, y: next.puck.y });
          if (t.length > 14) t.shift();
        } else { trailRef.current = []; }
        // goal flash + feedback
        const sc = next.scoreHuman + ',' + next.scoreBot;
        if (sc !== prevScoreRef.current) {
          const humanScored = next.scoreHuman > Number(prevScoreRef.current.split(',')[0]);
          goalFlashRef.current = { side: humanScored ? 'top' : 'bottom', t: 22 };
          fire(humanScored ? 'success' : 'tap', undefined, null);
          prevScoreRef.current = sc;
        }
        if (goalFlashRef.current) { goalFlashRef.current.t -= 1; if (goalFlashRef.current.t <= 0) goalFlashRef.current = null; }
        draw(next);
        const sig = next.phase + '|' + sc + '|' + next.banner + '|' + next.winner;
        if (sig !== sigRef.current) { sigRef.current = sig; force(); }
        if (isMatchOver(next) && next.timer <= 1) {
          running = false;
          fire(next.winner === 'human' ? 'match_win' : 'match_loss', undefined, null);
          setPhase('results');
          return;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---------- render ----------
  const draw = useCallback((s: MatchState) => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const { w, h, wall } = TABLE;
    const gMin = (w - GOAL_W) / 2, gMax = (w + GOAL_W) / 2;

    // surface
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0c1838'); g.addColorStop(0.5, '#0a1228'); g.addColorStop(1, '#0c1838');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // side ambient (bot red top / you green bottom)
    const top = ctx.createLinearGradient(0, 0, 0, h * 0.4);
    top.addColorStop(0, 'rgba(255,60,120,0.10)'); top.addColorStop(1, 'rgba(255,60,120,0)');
    ctx.fillStyle = top; ctx.fillRect(0, 0, w, h * 0.4);
    const bot = ctx.createLinearGradient(0, h * 0.6, 0, h);
    bot.addColorStop(0, 'rgba(60,255,180,0)'); bot.addColorStop(1, 'rgba(60,255,180,0.10)');
    ctx.fillStyle = bot; ctx.fillRect(0, h * 0.6, w, h * 0.4);

    // center line + circle
    ctx.strokeStyle = 'rgba(90,190,255,0.4)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(wall, h / 2); ctx.lineTo(w - wall, h / 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(w / 2, h / 2, 64, 0, 6.28); ctx.stroke();
    ctx.beginPath(); ctx.arc(w / 2, h / 2, 6, 0, 6.28); ctx.fillStyle = 'rgba(90,190,255,0.4)'; ctx.fill();

    // goals (flash on score)
    const flash = goalFlashRef.current;
    const topA = flash && flash.side === 'top' ? 0.9 : 0.5;
    const botA = flash && flash.side === 'bottom' ? 0.9 : 0.5;
    ctx.save(); ctx.shadowBlur = flash && flash.side === 'top' ? 30 : 10; ctx.shadowColor = '#ff3c78';
    ctx.fillStyle = `rgba(255,60,120,${topA})`; ctx.fillRect(gMin, 0, GOAL_W, wall + 3); ctx.restore();
    ctx.save(); ctx.shadowBlur = flash && flash.side === 'bottom' ? 30 : 10; ctx.shadowColor = '#3cffb4';
    ctx.fillStyle = `rgba(60,255,180,${botA})`; ctx.fillRect(gMin, h - wall - 3, GOAL_W, wall + 3); ctx.restore();

    // neon walls
    ctx.strokeStyle = 'rgba(120,210,255,0.55)'; ctx.lineWidth = wall;
    ctx.strokeRect(wall / 2, wall / 2, w - wall, h - wall);

    // puck trail
    const tr = trailRef.current;
    for (let i = 0; i < tr.length; i++) {
      const a = (i / tr.length) * 0.5;
      ctx.beginPath(); ctx.arc(tr[i].x, tr[i].y, PUCK_R * (0.4 + (i / tr.length) * 0.55), 0, 6.28);
      ctx.fillStyle = `rgba(255,211,77,${a})`; ctx.fill();
    }
    // puck
    const puck = s.puck;
    ctx.save(); ctx.shadowColor = '#ffd34d'; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(puck.x, puck.y, PUCK_R, 0, 6.28); ctx.fillStyle = '#ffe27a'; ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.arc(puck.x, puck.y, PUCK_R * 0.55, 0, 6.28); ctx.strokeStyle = 'rgba(120,80,0,0.4)'; ctx.lineWidth = 2; ctx.stroke();

    drawPaddle(ctx, s.bot, '#ff3c78');
    drawPaddle(ctx, s.human, '#3cffb4');
  }, []);

  // ---------- input ----------
  const toLocal = (e: React.PointerEvent) => {
    const c = canvasRef.current!; const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (TABLE.w / r.width), y: (e.clientY - r.top) * (TABLE.h / r.height) };
  };
  const apply = (e: React.PointerEvent) => {
    const s = matchRef.current; if (!s) return;
    const p = toLocal(e);
    matchRef.current = moveHuman(s, p.x, p.y);
  };
  const onDown = (e: React.PointerEvent) => { draggingRef.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); apply(e); };
  const onMove = (e: React.PointerEvent) => { if (draggingRef.current) apply(e); };
  const onUp = () => { draggingRef.current = false; };

  const doRematch = () => { matchRef.current = rematch(matchRef.current!, difficulty, target); trailRef.current = []; prevScoreRef.current = '0,0'; sigRef.current = ''; setPhase('playing'); fire('match_start', 'Rematch', null); };
  const backToSetup = () => { matchRef.current = null; setPhase('setup'); };

  // ============================== SETUP
  if (phase === 'setup') {
    return (
      <div className="ah2-wrap">
        <div className="ah2-setup">
          <div className="ah2-setup__head">
            <span className="ah2-eyebrow"><Icon name="Bolt" /> Air Hockey</span>
            <h1>Match Setup</h1>
            <p>Strike the puck past the bot. First to your target score wins.</p>
          </div>
          <div className="ah2-field"><label>Opponent</label>
            <div className="ah2-opts">
              <button className="ah2-opt is-active"><Icon name="Gamepad" /> Bot Match</button>
              <button className="ah2-opt is-disabled" disabled><Icon name="Users" /> Player <span className="ah2-soon">soon</span></button>
            </div>
          </div>
          <div className="ah2-field"><label>Bot difficulty</label>
            <div className="ah2-opts">
              {DIFFS.map((d) => (
                <button key={d.id} className={'ah2-opt ah2-opt--diff' + (difficulty === d.id ? ' is-active' : '')} onClick={() => { setDifficulty(d.id); fire('tap'); }}>
                  <b>{d.label}</b><span>{d.sub}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="ah2-field"><label>Match length</label>
            <div className="ah2-opts ah2-opts--t">
              {TARGETS.map((t) => (
                <button key={t} className={'ah2-opt ah2-opt--t' + (target === t ? ' is-active' : '')} onClick={() => { setTarget(t); fire('tap'); }}>
                  <b>First to {t}</b>
                </button>
              ))}
            </div>
          </div>
          <div className="ah2-field"><label>Entry (Scalps)</label>
            <div className="ah2-opts ah2-opts--entry">
              {ENTRIES.map((en) => (
                <button key={en} className={'ah2-opt ah2-opt--entry' + (entry === en ? ' is-active' : '')} onClick={() => { setEntry(en); fire('tap'); }}>
                  {en === 0 ? 'Free' : 'Ⓢ ' + en}
                </button>
              ))}
            </div>
          </div>
          <div className="ah2-econ">
            <div><span>Entry</span><b>{entry === 0 ? 'Free' : 'Ⓢ ' + entry}</b></div>
            <div><span>Pot</span><b>Ⓢ {pot}</b></div>
            <div className="ah2-econ--dim"><span>Rake 3%</span><b>Ⓢ {rake}</b></div>
            <div className="ah2-econ--win"><span>Winner</span><b>Ⓢ {payout}</b></div>
          </div>
          <p className="ah2-note"><Icon name="Lock" /> Mock economy — no Scalps charged, no real money moves. 1 Scalp = $1.</p>
          <div className="ah2-actions">
            <button className="ah2-btn ah2-btn--ghost" onClick={() => navigate('/play')}><Icon name="ArrowLeft" /> Back to lobby</button>
            <button className="ah2-btn ah2-btn--go" onClick={start}><Icon name="Play" /> Start match</button>
          </div>
        </div>
      </div>
    );
  }

  // ============================== RESULTS
  if (phase === 'results' && matchRef.current) {
    const s = matchRef.current;
    const youWin = s.winner === 'human';
    return (
      <div className="ah2-wrap">
        <div className={'ah2-results' + (youWin ? ' win' : '')}>
          <div className="ah2-results__burst" aria-hidden="true" />
          <span className="ah2-results__icon"><Icon name={youWin ? 'Trophy' : 'Shield'} /></span>
          <h1>{youWin ? 'You win!' : 'Bot wins'}</h1>
          <p className="ah2-results__sub">Final {s.scoreHuman} – {s.scoreBot}</p>
          {entry > 0 && (
            <div className="ah2-payout">
              <div><span>Pot</span><b>Ⓢ {pot}</b></div>
              <div className="ah2-econ--dim"><span>Rake 3%</span><b>Ⓢ {rake}</b></div>
              <div className="ah2-econ--win"><span>{youWin ? 'You collect' : 'Winner collects'}</span><b>Ⓢ {payout}</b></div>
            </div>
          )}
          <p className="ah2-note"><Icon name="Lock" /> Mock economy — no real money moved.</p>
          <div className="ah2-actions">
            <button className="ah2-btn ah2-btn--ghost" onClick={backToSetup}><Icon name="Bolt" /> New setup</button>
            <button className="ah2-btn ah2-btn--go" onClick={doRematch}><Icon name="Swords" /> Rematch</button>
          </div>
        </div>
      </div>
    );
  }

  // ============================== PLAYING
  const s = matchRef.current!;
  return (
    <div className="ah2-wrap">
      <div className="ah2-hud">
        <button className="ah2-hud__back" onClick={backToSetup} aria-label="Quit"><Icon name="ArrowLeft" /></button>
        <div className="ah2-scorebar">
          <div className="ah2-sc bot"><span className="ah2-sc__dot" /> Bot <b>{s.scoreBot}</b></div>
          <span className="ah2-sc__to">first to {s.target}</span>
          <div className="ah2-sc you"><b>{s.scoreHuman}</b> You <span className="ah2-sc__dot" /></div>
        </div>
      </div>
      <div className="ah2-stage">
        <canvas
          ref={canvasRef}
          width={TABLE.w}
          height={TABLE.h}
          className="ah2-canvas"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
        {s.banner && (s.phase === 'serve' || s.phase === 'goal') && <div className="ah2-banner">{s.banner}</div>}
      </div>
      <p className="ah2-hint"><Icon name="Target" /> Drag your paddle (bottom) to defend and strike the puck</p>
    </div>
  );
}

function drawPaddle(ctx: CanvasRenderingContext2D, p: Paddle, color: string) {
  ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 22;
  ctx.beginPath(); ctx.arc(p.x, p.y, PADDLE_R, 0, 6.28); ctx.fillStyle = color; ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.arc(p.x, p.y, PADDLE_R * 0.62, 0, 6.28); ctx.fillStyle = 'rgba(8,12,24,0.85)'; ctx.fill();
  ctx.beginPath(); ctx.arc(p.x, p.y, PADDLE_R * 0.34, 0, 6.28); ctx.fillStyle = color; ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1;
}
