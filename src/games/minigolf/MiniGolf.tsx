import { useEffect, useRef, useState, useReducer, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FIELD, BALL_R, CUP_R, speed } from './engine';
import {
  createMatch, makeHoleOrder, tick, shoot, botPlay,
  canHumanShoot, isBotTurn, matchTotals, rematch,
  type MatchState,
} from './match';
import { HOLES } from './holes';
import type { Difficulty } from '../../game/types';
import { Icon } from '../../components/Icon';
import { useFeedback } from '../../components/Juice';
import './minigolf.css';

type Phase = 'setup' | 'playing' | 'results';
const HOLE_COUNTS = [3, 6, 9, 12] as const;
const ENTRIES = [0, 5, 10, 25, 50] as const;
const DIFFS: { id: Difficulty; label: string; sub: string }[] = [
  { id: 'easy', label: 'Easy', sub: 'Forgiving bot' },
  { id: 'medium', label: 'Medium', sub: 'Reads bank shots' },
  { id: 'hard', label: 'Hard', sub: 'Plans multi-bank' },
];
const RAKE = 0.03;
const BOT_THINK_FRAMES = 38;

export default function MiniGolf() {
  const navigate = useNavigate();
  const { fire } = useFeedback();

  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [holeCount, setHoleCount] = useState<number>(6);
  const [entry, setEntry] = useState<number>(10);

  const matchRef = useRef<MatchState | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const aimingRef = useRef(false);
  const botFramesRef = useRef(0);
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const [, force] = useReducer((n) => n + 1, 0);
  const sigRef = useRef('');
  const prevDoneRef = useRef('f,f');

  const pot = entry * 2;
  const rake = Math.round(pot * RAKE);
  const payout = pot - rake;

  // ---------- start a match ----------
  const startMatch = () => {
    const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    const order = makeHoleOrder(holeCount, seed);
    matchRef.current = createMatch(difficulty, order);
    trailRef.current = [];
    botFramesRef.current = 0;
    setPhase('playing');
    fire('match_start', 'Match started — good luck', null);
  };

  // ---------- main loop ----------
  useEffect(() => {
    if (phase !== 'playing') return;
    let raf = 0;
    let running = true;
    const loop = () => {
      if (!running) return;
      const s = matchRef.current;
      if (s) {
        // bot think timer -> one shot
        if (isBotTurn(s)) {
          botFramesRef.current += 1;
          if (botFramesRef.current >= BOT_THINK_FRAMES) {
            botFramesRef.current = 0;
            botPlay(s);
            fire('tap', undefined, null);
          }
        } else {
          botFramesRef.current = 0;
          tick(s);
        }
        // active-ball trail while rolling
        const who = s.turn;
        const b = s.balls[who];
        if (s.phase === 'rolling' && b.moving && !b.sunk) {
          const t = trailRef.current;
          t.push({ x: b.pos.x, y: b.pos.y });
          if (t.length > 18) t.shift();
        } else if (s.phase === 'aiming') {
          trailRef.current = [];
        }
        draw(s);
        // fire a sink chime when YOU newly hole out
        const doneSig = (s.done[0] ? 't' : 'f') + ',' + (s.done[1] ? 't' : 'f');
        if (doneSig !== prevDoneRef.current) {
          if (s.done[0] && prevDoneRef.current[0] === 'f') fire('success', undefined, null);
          prevDoneRef.current = doneSig;
        }
        const sig = s.phase + '|' + s.holeIdx + '|' + s.turn + '|' + s.strokes.join(',') + '|' + doneSig + '|' + s.matchOver;
        if (sig !== sigRef.current) { sigRef.current = sig; force(); }
        if (s.matchOver) {
          running = false;
          const [you, bot] = matchTotals(s);
          fire(you <= bot ? 'match_win' : 'match_loss', undefined, null);
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
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const sx = c.width / FIELD.w;
    const sy = c.height / FIELD.h;
    const hole = HOLES[s.holeOrder[s.holeIdx]];
    const accent = hole.accent;

    const theme = THEMES[hole.theme] || THEMES.classic;
    ctx.clearRect(0, 0, c.width, c.height);
    // themed base gradient
    const g = ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, theme.bg[0]);
    g.addColorStop(0.5, theme.bg[1]);
    g.addColorStop(1, theme.bg[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
    // starfield (space / sky)
    if (theme.stars) {
      for (let i = 0; i < 70; i++) {
        const px = ((i * 9301 + 49297) % 233280) / 233280 * c.width;
        const py = ((i * 49297 + 233) % 233280) / 233280 * c.height;
        const r = (i % 3 === 0) ? 1.4 : 0.8;
        ctx.beginPath(); ctx.arc(px, py, r, 0, 6.28);
        ctx.fillStyle = `rgba(255,255,255,${i % 4 === 0 ? 0.5 : 0.22})`; ctx.fill();
      }
    }
    // subtle turf grid
    ctx.strokeStyle = theme.grid; ctx.lineWidth = 1;
    for (let y = 0; y < FIELD.h; y += 28) {
      ctx.beginPath(); ctx.moveTo(0, y * sy); ctx.lineTo(c.width, y * sy); ctx.stroke();
    }
    // friction zones (ice/sand/water/lava patches)
    if (hole.zones) {
      for (const z of hole.zones) {
        ctx.save();
        ctx.fillStyle = theme.zone;
        roundRect(ctx, z.x * sx, z.y * sy, z.w * sx, z.h * sy, 12); ctx.fill();
        ctx.setLineDash([8, 8]); ctx.lineWidth = 1.5;
        ctx.strokeStyle = hexA(accent, 0.4);
        roundRect(ctx, z.x * sx, z.y * sy, z.w * sx, z.h * sy, 12); ctx.stroke();
        ctx.restore();
      }
    }
    // ambient accent glow at the cup
    const ag = ctx.createRadialGradient(hole.cup.x * sx, hole.cup.y * sy, 0, hole.cup.x * sx, hole.cup.y * sy, 220 * sx);
    ag.addColorStop(0, hexA(accent, 0.2));
    ag.addColorStop(1, hexA(accent, 0));
    ctx.fillStyle = ag;
    ctx.fillRect(0, 0, c.width, c.height);

    // neon rails / walls
    for (const w of hole.walls) {
      const x = w.x * sx, y = w.y * sy, ww = w.w * sx, wh = w.h * sy;
      ctx.save();
      ctx.shadowColor = accent;
      ctx.shadowBlur = 14;
      ctx.fillStyle = theme.rail;
      roundRect(ctx, x, y, ww, wh, 4); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = hexA(accent, 0.85);
      roundRect(ctx, x, y, ww, wh, 4); ctx.stroke();
      ctx.restore();
    }

    // cup glow + ring + flag
    const cx = hole.cup.x * sx, cy = hole.cup.y * sy;
    ctx.save();
    ctx.shadowColor = accent; ctx.shadowBlur = 22;
    ctx.beginPath(); ctx.arc(cx, cy, CUP_R * sx, 0, 2 * Math.PI);
    ctx.fillStyle = '#041410'; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2.5; ctx.strokeStyle = hexA(accent, 0.9);
    ctx.beginPath(); ctx.arc(cx, cy, CUP_R * sx, 0, 2 * Math.PI); ctx.stroke();
    ctx.restore();
    // flag
    ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 40 * sy); ctx.stroke();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 40 * sy);
    ctx.lineTo(cx + 22 * sx, cy - 34 * sy);
    ctx.lineTo(cx, cy - 28 * sy);
    ctx.closePath(); ctx.fill();

    // ball trail
    const who = s.turn;
    const ball = s.balls[who];
    const trail = trailRef.current;
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      const a = (i / trail.length) * 0.4;
      ctx.beginPath();
      ctx.arc(t.x * sx, t.y * sy, BALL_R * sx * (0.4 + (i / trail.length) * 0.5), 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    }

    // ghost of the other player's ball (faint) if it has moved off tee
    const other = (who === 0 ? 1 : 0) as 0 | 1;
    const ob = s.balls[other];
    if (!ob.sunk && (Math.abs(ob.pos.x - hole.tee.x) > 1 || Math.abs(ob.pos.y - hole.tee.y) > 1)) {
      ctx.beginPath();
      ctx.arc(ob.pos.x * sx, ob.pos.y * sy, BALL_R * sx, 0, 2 * Math.PI);
      ctx.fillStyle = other === 0 ? 'rgba(96,165,250,0.45)' : 'rgba(168,85,247,0.45)';
      ctx.fill();
    }

    // active ball
    if (!ball.sunk) {
      ctx.save();
      ctx.shadowColor = who === 0 ? 'rgba(120,180,255,0.9)' : 'rgba(190,130,255,0.9)';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(ball.pos.x * sx, ball.pos.y * sy, BALL_R * sx, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.restore();
    }

    // aim guide + power (human only, aiming)
    if (aimingRef.current && dragRef.current && canHumanShoot(s) && !ball.sunk) {
      const d = dragRef.current;
      const dx = d.x - ball.pos.x;
      const dy = d.y - ball.pos.y;
      const mag = Math.min(Math.hypot(dx, dy), 120);
      const pow = mag / 120;
      const ang = Math.atan2(dy, dx);
      // shot direction is opposite the drag
      const shotX = ball.pos.x - Math.cos(ang) * mag;
      const shotY = ball.pos.y - Math.sin(ang) * mag;
      ctx.strokeStyle = `rgba(255,${Math.round(255 - pow * 140)},${Math.round(120 - pow * 120)},0.9)`;
      ctx.lineWidth = 3; ctx.setLineDash([7, 7]);
      ctx.beginPath();
      ctx.moveTo(ball.pos.x * sx, ball.pos.y * sy);
      ctx.lineTo(shotX * sx, shotY * sy);
      ctx.stroke();
      ctx.setLineDash([]);
      // power bar
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      roundRect(ctx, 12, c.height - 26, c.width - 24, 12, 6); ctx.fill();
      ctx.fillStyle = `rgba(255,${Math.round(220 - pow * 160)},80,0.95)`;
      roundRect(ctx, 14, c.height - 24, (c.width - 28) * pow, 8, 4); ctx.fill();
    }
  }, []);

  // ---------- input ----------
  const toLogical = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * FIELD.w,
      y: ((e.clientY - r.top) / r.height) * FIELD.h,
    };
  };
  const onDown = (e: React.PointerEvent) => {
    const s = matchRef.current; if (!s || !canHumanShoot(s)) return;
    aimingRef.current = true;
    dragRef.current = toLogical(e);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!aimingRef.current) return;
    dragRef.current = toLogical(e);
  };
  const onUp = () => {
    const s = matchRef.current;
    if (!aimingRef.current || !dragRef.current || !s) { aimingRef.current = false; return; }
    aimingRef.current = false;
    const b = s.balls[0];
    const d = dragRef.current; dragRef.current = null;
    const dx = d.x - b.pos.x, dy = d.y - b.pos.y;
    if (Math.hypot(dx, dy) > 6 && canHumanShoot(s)) {
      shoot(s, dx, dy);
      trailRef.current = [];
      fire('tap', undefined, null);
      force();
    }
  };

  const doRematch = () => {
    const s = matchRef.current; if (!s) return;
    matchRef.current = rematch(s);
    trailRef.current = []; botFramesRef.current = 0; sigRef.current = '';
    setPhase('playing');
    fire('tap', 'Rematch — same course', null);
  };
  const backToSetup = () => { setPhase('setup'); matchRef.current = null; };

  // ====================================================== SETUP
  if (phase === 'setup') {
    const estMin = Math.max(1, Math.round(holeCount * 0.6));
    return (
      <div className="mg2-wrap">
        <div className="mg2-setup">
          <div className="mg2-setup__head">
            <span className="mg2-eyebrow"><Icon name="Target" /> Mini Golf</span>
            <h1>Match Setup</h1>
            <p>Lowest total strokes across your selected holes wins the pot.</p>
          </div>

          <div className="mg2-field">
            <label>Opponent</label>
            <div className="mg2-opts">
              <button className="mg2-opt is-active"><Icon name="Gamepad" /> Bot Match</button>
              <button className="mg2-opt is-disabled" disabled><Icon name="Users" /> Player <span className="mg2-soon">soon</span></button>
              <button className="mg2-opt is-disabled" disabled><Icon name="Trophy" /> Tournament <span className="mg2-soon">soon</span></button>
            </div>
          </div>

          <div className="mg2-field">
            <label>Bot difficulty</label>
            <div className="mg2-opts">
              {DIFFS.map((d) => (
                <button key={d.id} className={'mg2-opt mg2-opt--diff' + (difficulty === d.id ? ' is-active' : '')} onClick={() => { setDifficulty(d.id); fire('tap'); }}>
                  <b>{d.label}</b><span>{d.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mg2-field">
            <label>Match length</label>
            <div className="mg2-opts mg2-opts--holes">
              {HOLE_COUNTS.map((h) => (
                <button key={h} className={'mg2-opt mg2-opt--hole' + (holeCount === h ? ' is-active' : '')} onClick={() => { setHoleCount(h); fire('tap'); }}>
                  <b>{h}</b><span>holes</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mg2-field">
            <label>Entry (Scalps)</label>
            <div className="mg2-opts mg2-opts--entry">
              {ENTRIES.map((en) => (
                <button key={en} className={'mg2-opt mg2-opt--entry' + (entry === en ? ' is-active' : '')} onClick={() => { setEntry(en); fire('tap'); }}>
                  {en === 0 ? 'Free' : 'Ⓢ ' + en}
                </button>
              ))}
            </div>
          </div>

          <div className="mg2-econ">
            <div><span>Entry</span><b>{entry === 0 ? 'Free' : 'Ⓢ ' + entry}</b></div>
            <div><span>Total pot</span><b>Ⓢ {pot}</b></div>
            <div className="mg2-econ--dim"><span>Rake 3%</span><b>Ⓢ {rake}</b></div>
            <div className="mg2-econ--win"><span>Winner</span><b>Ⓢ {payout}</b></div>
            <div><span>Est. length</span><b>~{estMin} min</b></div>
          </div>

          <p className="mg2-note"><Icon name="Lock" /> Mock economy — no Scalps are charged and no real money moves. 1 Scalp = $1.</p>

          <div className="mg2-actions">
            <button className="mg2-btn mg2-btn--ghost" onClick={() => navigate('/play')}><Icon name="ArrowLeft" /> Back to lobby</button>
            <button className="mg2-btn mg2-btn--go" onClick={startMatch}><Icon name="Play" /> Start {holeCount}-hole match</button>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================== RESULTS
  if (phase === 'results' && matchRef.current) {
    const s = matchRef.current;
    const [you, bot] = matchTotals(s);
    const youWin = you < bot;
    const tie = you === bot;
    return (
      <div className="mg2-wrap">
        <div className={'mg2-results' + (youWin ? ' win' : '')}>
          <div className="mg2-results__burst" aria-hidden="true" />
          <span className="mg2-results__icon"><Icon name={youWin ? 'Trophy' : tie ? 'Medal' : 'Shield'} /></span>
          <h1>{tie ? "It's a tie" : youWin ? 'You win!' : 'Bot wins'}</h1>
          <p className="mg2-results__sub">You {you} · Bot {bot} strokes over {s.holeOrder.length} holes</p>

          <div className="mg2-card">
            <div className="mg2-scorehead"><span>Hole</span><span>You</span><span>Bot</span></div>
            <div className="mg2-scorelist">
              {s.holeScores.map((hs, i) => (
                <div key={i} className="mg2-scorerow">
                  <span>{i + 1}. {HOLES[s.holeOrder[i]].name}</span>
                  <span className={hs[0] <= hs[1] ? 'lead' : ''}>{hs[0]}</span>
                  <span className={hs[1] <= hs[0] ? 'lead' : ''}>{hs[1]}</span>
                </div>
              ))}
              <div className="mg2-scorerow mg2-scorerow--total">
                <span>Total</span><span>{you}</span><span>{bot}</span>
              </div>
            </div>
          </div>

          {entry > 0 && (
            <div className="mg2-payout">
              <div><span>Pot</span><b>Ⓢ {pot}</b></div>
              <div className="mg2-econ--dim"><span>Rake 3%</span><b>Ⓢ {rake}</b></div>
              <div className="mg2-econ--win"><span>{youWin ? 'You collect' : 'Winner collects'}</span><b>Ⓢ {payout}</b></div>
            </div>
          )}
          <p className="mg2-note"><Icon name="Lock" /> Mock economy — no real money moved.</p>

          <div className="mg2-actions">
            <button className="mg2-btn mg2-btn--ghost" onClick={backToSetup}><Icon name="Target" /> New setup</button>
            <button className="mg2-btn mg2-btn--go" onClick={doRematch}><Icon name="Swords" /> Rematch</button>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================== PLAYING
  const s = matchRef.current!;
  const hole = HOLES[s.holeOrder[s.holeIdx]];
  const [you, bot] = matchTotals(s);
  const liveYou = you + s.strokes[0];
  const liveBot = bot + s.strokes[1];

  return (
    <div className="mg2-wrap">
      <div className="mg2-hud">
        <button className="mg2-hud__back" onClick={backToSetup} aria-label="Quit to setup"><Icon name="ArrowLeft" /></button>
        <div className="mg2-hud__hole">
          <span className="mg2-hud__holeno">Hole {s.holeIdx + 1} <i>of {s.holeOrder.length}</i></span>
          <span className="mg2-hud__holename" style={{ color: hole.accent }}>{hole.name} · Par {hole.par}</span>
        </div>
        <span className={'mg2-hud__turn' + (s.turn === 0 ? ' you' : ' bot')}>
          {s.turn === 0 ? 'Your turn' : 'Bot putting…'}
        </span>
      </div>

      <div className="mg2-scoreboard">
        <div className={'mg2-pl' + (s.turn === 0 ? ' active' : '')}>
          <span className="mg2-pl__dot you" /> You <b>{liveYou}</b>
          {s.done[0] && <span className="mg2-pl__done"><Icon name="Check" /></span>}
        </div>
        <div className={'mg2-pl' + (s.turn === 1 ? ' active' : '')}>
          <span className="mg2-pl__dot bot" /> Bot <b>{liveBot}</b>
          {s.done[1] && <span className="mg2-pl__done"><Icon name="Check" /></span>}
        </div>
      </div>

      <div className="mg2-stage">
        <canvas
          ref={canvasRef}
          width={400}
          height={560}
          className="mg2-canvas"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        />
        {s.banner && <div className="mg2-banner">{s.banner}</div>}
        {s.turn === 0 && !s.done[0] && s.phase === 'aiming' && (
          <div className="mg2-hint"><Icon name="Target" /> Drag back from the ball to aim, release to shoot</div>
        )}
      </div>
    </div>
  );
}

// ---- canvas helpers ----
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
type ThemeViz = { bg: [string, string, string]; grid: string; zone: string; rail: string; stars?: boolean };
const THEMES: Record<string, ThemeViz> = {
  classic:    { bg: ['#0a1f15', '#0c2a1c', '#071610'], grid: 'rgba(255,255,255,.03)', zone: 'rgba(120,220,150,.10)', rail: '#10301f' },
  arcade:     { bg: ['#160a2a', '#1c0c38', '#0a0618'], grid: 'rgba(199,125,255,.06)', zone: 'rgba(199,125,255,.12)', rail: '#241338' },
  space:      { bg: ['#05060f', '#080a1a', '#03040a'], grid: 'rgba(124,155,255,.05)', zone: 'rgba(150,170,255,.07)', rail: '#10152e', stars: true },
  volcano:    { bg: ['#1a0805', '#280b06', '#0e0503'], grid: 'rgba(255,90,44,.05)',  zone: 'rgba(255,90,30,.16)',  rail: '#2a1108' },
  ice:        { bg: ['#08233a', '#0a2e4a', '#061824'], grid: 'rgba(150,220,255,.06)', zone: 'rgba(180,235,255,.14)', rail: '#163a55' },
  jungle:     { bg: ['#08230f', '#0b2e15', '#04140a'], grid: 'rgba(74,222,128,.05)',  zone: 'rgba(60,150,70,.18)',  rail: '#123a1f' },
  casino:     { bg: ['#1c0710', '#280a15', '#0e0408'], grid: 'rgba(255,206,92,.05)',  zone: 'rgba(255,206,92,.10)', rail: '#2a1015' },
  cyber:      { bg: ['#040a14', '#06121f', '#02060c'], grid: 'rgba(25,224,255,.08)',  zone: 'rgba(25,224,255,.10)', rail: '#0a2233' },
  desert:     { bg: ['#1c1408', '#28210c', '#0e0a04'], grid: 'rgba(230,162,60,.06)',  zone: 'rgba(230,180,90,.16)', rail: '#2a2010' },
  sky:        { bg: ['#0a1f3a', '#123058', '#081624'], grid: 'rgba(142,197,255,.06)', zone: 'rgba(142,197,255,.10)', rail: '#16315a' },
  underwater: { bg: ['#031f2e', '#06303f', '#02141c'], grid: 'rgba(45,212,191,.06)',  zone: 'rgba(45,160,190,.16)', rail: '#0a3040' },
  final:      { bg: ['#140617', '#1e0a24', '#0a040c'], grid: 'rgba(255,61,110,.06)',  zone: 'rgba(255,61,110,.12)', rail: '#241024' },
};
function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
export { speed };
