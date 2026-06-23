import { useEffect, useRef, useState, useReducer, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TABLE, BALL_R, pockets, type Ball } from './engine';
import {
  createMatch, shoot, tick, canHumanShoot, isMatchOver, rematch,
  type MatchState, type Group,
} from './match';
import type { Difficulty } from '../../game/types';
import { Icon } from '../../components/Icon';
import { useFeedback } from '../../components/Juice';
import './eightball.css';

type Phase = 'setup' | 'playing' | 'results';
const ENTRIES = [0, 5, 10, 25, 50] as const;
const DIFFS: { id: Difficulty; label: string; sub: string }[] = [
  { id: 'easy', label: 'Easy', sub: 'Loose aim' },
  { id: 'medium', label: 'Medium', sub: 'Plans pockets' },
  { id: 'hard', label: 'Hard', sub: 'Precise + safe' },
];
const RAKE = 0.03;

const BALL_COLORS: Record<number, string> = {
  0: '#f4f7ff', 1: '#f4c430', 2: '#2453d8', 3: '#d83a3a', 4: '#6a2da8', 5: '#e7822e',
  6: '#1f8a4c', 7: '#7a2330', 8: '#161616', 9: '#f4c430', 10: '#2453d8', 11: '#d83a3a',
  12: '#6a2da8', 13: '#e7822e', 14: '#1f8a4c', 15: '#7a2330',
};

export default function EightBall() {
  const navigate = useNavigate();
  const { fire } = useFeedback();

  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [entry, setEntry] = useState<number>(10);

  const matchRef = useRef<MatchState | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const aimingRef = useRef(false);
  const aimRef = useRef<{ angle: number; power: number }>({ angle: 0, power: 0 });
  const [, force] = useReducer((n) => n + 1, 0);
  const sigRef = useRef('');
  const pottedCountRef = useRef(0);

  const pot = entry * 2;
  const rake = Math.round(pot * RAKE);
  const payout = pot - rake;

  const start = () => {
    matchRef.current = createMatch(difficulty);
    sigRef.current = ''; pottedCountRef.current = 0;
    setPhase('playing');
    fire('match_start', 'Break to begin', null);
  };

  // ---------- main loop ----------
  useEffect(() => {
    if (phase !== 'playing') return;
    let raf = 0; let running = true;
    const loop = () => {
      if (!running) return;
      const s = matchRef.current;
      if (s) {
        const next = tick(s);
        matchRef.current = next;
        // pocket chime when a ball drops
        const pc = next.pottedThisShot.length;
        if (pc > pottedCountRef.current) { fire('success', undefined, null); }
        pottedCountRef.current = next.phase === 'rolling' ? pc : 0;
        draw(next);
        const sig = next.phase + '|' + next.turn + '|' + next.banner + '|' + next.balls.filter((b) => b.potted).length + '|' + next.winner;
        if (sig !== sigRef.current) { sigRef.current = sig; force(); }
        if (isMatchOver(next) && next.timer <= 1) {
          running = false;
          fire(next.winner === 0 ? 'match_win' : 'match_loss', undefined, null);
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

  // ---------- rendering ----------
  const draw = useCallback((s: MatchState) => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const { w, h, cushion } = TABLE;
    // room backdrop
    ctx.fillStyle = '#0a0d12'; ctx.fillRect(0, 0, w, h);
    // rail / frame
    ctx.fillStyle = '#3a2414';
    roundRect(ctx, 2, 2, w - 4, h - 4, 18); ctx.fill();
    ctx.fillStyle = '#23150b';
    roundRect(ctx, cushion - 8, cushion - 8, w - (cushion - 8) * 2, h - (cushion - 8) * 2, 12); ctx.fill();
    // felt
    const felt = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
    felt.addColorStop(0, '#117a48');
    felt.addColorStop(1, '#0a5733');
    ctx.fillStyle = felt;
    roundRect(ctx, cushion, cushion, w - cushion * 2, h - cushion * 2, 6); ctx.fill();
    // overhead light sheen
    const sheen = ctx.createLinearGradient(0, cushion, 0, h - cushion);
    sheen.addColorStop(0, 'rgba(255,255,255,0.07)');
    sheen.addColorStop(0.4, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen; ctx.fillRect(cushion, cushion, w - cushion * 2, h - cushion * 2);
    // head string + spot
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w * 0.25, cushion); ctx.lineTo(w * 0.25, h - cushion); ctx.stroke();

    // pockets
    for (const p of pockets()) {
      ctx.beginPath(); ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#05070a'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.stroke();
    }

    // balls
    for (const b of s.balls) {
      if (b.potted) continue;
      drawBall(ctx, b);
    }

    // aim guide (human, aiming)
    const cue = s.balls.find((bb) => bb.id === 0);
    if (aimingRef.current && cue && !cue.potted && canHumanShoot(s)) {
      const a = aimRef.current;
      const len = 60 + a.power * 220;
      const ex = cue.x + Math.cos(a.angle) * len;
      const ey = cue.y + Math.sin(a.angle) * len;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(cue.x, cue.y); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.setLineDash([]);
      // ghost target
      ctx.beginPath(); ctx.arc(ex, ey, BALL_R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
      // power meter
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; roundRect(ctx, cushion, h - cushion + 4, w - cushion * 2, 10, 5); ctx.fill();
      ctx.fillStyle = `rgba(255,${Math.round(220 - a.power * 170)},70,0.95)`;
      roundRect(ctx, cushion + 1, h - cushion + 5, (w - cushion * 2 - 2) * a.power, 8, 4); ctx.fill();
    }
  }, []);

  // ---------- input ----------
  const toLocal = (e: React.PointerEvent) => {
    const cv = canvasRef.current!; const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (TABLE.w / r.width), y: (e.clientY - r.top) * (TABLE.h / r.height) };
  };
  const onDown = (e: React.PointerEvent) => {
    const s = matchRef.current; if (!s || !canHumanShoot(s)) return;
    aimingRef.current = true;
    updateAim(e);
  };
  const updateAim = (e: React.PointerEvent) => {
    const s = matchRef.current; if (!s) return;
    const cue = s.balls.find((b) => b.id === 0); if (!cue) return;
    const p = toLocal(e);
    const dx = cue.x - p.x, dy = cue.y - p.y; // pull back -> shoot opposite
    aimRef.current = { angle: Math.atan2(dy, dx), power: Math.min(1, Math.hypot(dx, dy) / 220) };
  };
  const onMove = (e: React.PointerEvent) => { if (aimingRef.current) updateAim(e); };
  const onUp = () => {
    const s = matchRef.current;
    if (!aimingRef.current || !s) { aimingRef.current = false; return; }
    aimingRef.current = false;
    const a = aimRef.current;
    if (a.power > 0.06 && canHumanShoot(s)) {
      matchRef.current = shoot(s, a.angle, a.power);
      pottedCountRef.current = 0;
      fire('tap', undefined, null);
      force();
    }
  };

  const doRematch = () => { matchRef.current = rematch(difficulty); sigRef.current = ''; pottedCountRef.current = 0; setPhase('playing'); fire('match_start', 'Rematch', null); };
  const backToSetup = () => { matchRef.current = null; setPhase('setup'); };

  // ============================================ SETUP
  if (phase === 'setup') {
    return (
      <div className="eb2-wrap">
        <div className="eb2-setup">
          <div className="eb2-setup__head">
            <span className="eb2-eyebrow"><Icon name="Trophy" /> 8-Ball Pool</span>
            <h1>Match Setup</h1>
            <p>Pot your group, then sink the 8 to win the rack.</p>
          </div>
          <div className="eb2-field">
            <label>Opponent</label>
            <div className="eb2-opts">
              <button className="eb2-opt is-active"><Icon name="Gamepad" /> Bot Match</button>
              <button className="eb2-opt is-disabled" disabled><Icon name="Users" /> Player <span className="eb2-soon">soon</span></button>
            </div>
          </div>
          <div className="eb2-field">
            <label>Bot difficulty</label>
            <div className="eb2-opts">
              {DIFFS.map((d) => (
                <button key={d.id} className={'eb2-opt eb2-opt--diff' + (difficulty === d.id ? ' is-active' : '')} onClick={() => { setDifficulty(d.id); fire('tap'); }}>
                  <b>{d.label}</b><span>{d.sub}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="eb2-field">
            <label>Entry (Scalps)</label>
            <div className="eb2-opts eb2-opts--entry">
              {ENTRIES.map((en) => (
                <button key={en} className={'eb2-opt eb2-opt--entry' + (entry === en ? ' is-active' : '')} onClick={() => { setEntry(en); fire('tap'); }}>
                  {en === 0 ? 'Free' : 'Ⓢ ' + en}
                </button>
              ))}
            </div>
          </div>
          <div className="eb2-econ">
            <div><span>Entry</span><b>{entry === 0 ? 'Free' : 'Ⓢ ' + entry}</b></div>
            <div><span>Pot</span><b>Ⓢ {pot}</b></div>
            <div className="eb2-econ--dim"><span>Rake 3%</span><b>Ⓢ {rake}</b></div>
            <div className="eb2-econ--win"><span>Winner</span><b>Ⓢ {payout}</b></div>
          </div>
          <p className="eb2-note"><Icon name="Lock" /> Mock economy — no Scalps charged, no real money moves. 1 Scalp = $1.</p>
          <div className="eb2-actions">
            <button className="eb2-btn eb2-btn--ghost" onClick={() => navigate('/play')}><Icon name="ArrowLeft" /> Back to lobby</button>
            <button className="eb2-btn eb2-btn--go" onClick={start}><Icon name="Play" /> Start match</button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================ RESULTS
  if (phase === 'results' && matchRef.current) {
    const s = matchRef.current;
    const youWin = s.winner === 0;
    return (
      <div className="eb2-wrap">
        <div className={'eb2-results' + (youWin ? ' win' : '')}>
          <div className="eb2-results__burst" aria-hidden="true" />
          <span className="eb2-results__icon"><Icon name={youWin ? 'Trophy' : 'Shield'} /></span>
          <h1>{youWin ? 'You win!' : 'Bot wins'}</h1>
          <p className="eb2-results__sub">{s.banner}</p>
          {entry > 0 && (
            <div className="eb2-payout">
              <div><span>Pot</span><b>Ⓢ {pot}</b></div>
              <div className="eb2-econ--dim"><span>Rake 3%</span><b>Ⓢ {rake}</b></div>
              <div className="eb2-econ--win"><span>{youWin ? 'You collect' : 'Winner collects'}</span><b>Ⓢ {payout}</b></div>
            </div>
          )}
          <p className="eb2-note"><Icon name="Lock" /> Mock economy — no real money moved.</p>
          <div className="eb2-actions">
            <button className="eb2-btn eb2-btn--ghost" onClick={backToSetup}><Icon name="Trophy" /> New setup</button>
            <button className="eb2-btn eb2-btn--go" onClick={doRematch}><Icon name="Swords" /> Rematch</button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================ PLAYING
  const s = matchRef.current!;
  const yourGroup = s.groups[0];
  const botGroup = s.groups[1];
  const left = (g: Group | null) => g === null ? null : s.balls.filter((b) => !b.potted && groupOf(b.id) === g).length;

  return (
    <div className="eb2-wrap">
      <div className="eb2-hud">
        <button className="eb2-hud__back" onClick={backToSetup} aria-label="Quit"><Icon name="ArrowLeft" /></button>
        <div className="eb2-hud__title">8-Ball Pool</div>
        <span className={'eb2-hud__turn' + (s.turn === 0 ? ' you' : ' bot')}>{s.turn === 0 ? 'Your shot' : 'Bot shooting…'}</span>
      </div>
      <div className="eb2-scoreboard">
        <div className={'eb2-pl' + (s.turn === 0 ? ' active' : '')}>
          <span className="eb2-pl__dot you" /> You
          <b>{yourGroup ? `${yourGroup}s · ${left(yourGroup)} left` : 'open'}</b>
        </div>
        <div className={'eb2-pl' + (s.turn === 1 ? ' active' : '')}>
          <span className="eb2-pl__dot bot" /> Bot
          <b>{botGroup ? `${botGroup}s · ${left(botGroup)} left` : 'open'}</b>
        </div>
      </div>
      <div className="eb2-stage">
        <canvas
          ref={canvasRef}
          width={TABLE.w}
          height={TABLE.h}
          className="eb2-canvas"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        />
        {s.banner && <div className="eb2-banner">{s.banner}</div>}
      </div>
      <p className="eb2-hint"><Icon name="Target" /> Drag back from the cue ball to aim &amp; set power, release to shoot</p>
    </div>
  );
}

function groupOf(id: number): Group | null {
  if (id >= 1 && id <= 7) return 'solid';
  if (id >= 9 && id <= 15) return 'stripe';
  return null;
}

function drawBall(ctx: CanvasRenderingContext2D, b: Ball) {
  const color = BALL_COLORS[b.id] || '#fff';
  // shadow
  ctx.beginPath(); ctx.ellipse(b.x, b.y + BALL_R * 0.6, BALL_R * 0.9, BALL_R * 0.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
  // body
  ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
  // stripe band
  if (b.group === 'stripe') {
    ctx.save(); ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#f6f8ff'; ctx.fillRect(b.x - BALL_R, b.y - BALL_R, BALL_R * 2, BALL_R * 0.7);
    ctx.fillRect(b.x - BALL_R, b.y + BALL_R * 0.3, BALL_R * 2, BALL_R * 0.7); ctx.restore();
  }
  // number pip
  if (b.id !== 0) {
    ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R * 0.46, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.fillStyle = '#101010'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(b.id), b.x, b.y + 0.5);
  }
  // highlight
  ctx.beginPath(); ctx.arc(b.x - BALL_R * 0.32, b.y - BALL_R * 0.32, BALL_R * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
