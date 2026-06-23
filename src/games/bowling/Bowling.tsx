import { useState, useRef, useEffect, useCallback } from 'react';
import { newPlayer, rollResult, botRoll, frameComplete, totalScore, score, isStrike, isSpare, PIN_LAYOUT } from './engine';
import type { Player, Difficulty, Frame } from './engine';
import { LANE_THEMES, type LaneTheme } from './themes';
import { MatchSetup, MatchResult, GameTopBar } from '../shared/GameShell';
import { useFeedback } from '../../components/Juice';
import './bowling.css';

type Phase = 'aim' | 'rolling' | 'between' | 'over';
type Screen = 'setup' | 'playing' | 'results';
const W = 360, H = 560;

// perspective projection: t 0(near)->1(far), lat -1..1 (lane edges)
function proj(t: number, lat: number) {
  const nearY = H * 0.90, farY = H * 0.16;
  const y = nearY + (farY - nearY) * t;
  const hwNear = W * 0.40, hwFar = W * 0.085;
  const hw = hwNear + (hwFar - hwNear) * t;
  const s = 1 + (0.28 - 1) * t;
  return { x: W / 2 + lat * hw, y, hw, s };
}
const PIN_T = (py: number) => 0.70 + ((py - 0.12) / 0.27) * 0.20;
const PIN_LAT = (px: number) => (px - 0.5) * 2.4;

type Burst = { x: number; y: number; vx: number; vy: number; life: number; c: string };

export default function Bowling() {
  const { fire } = useFeedback();
  const [screen, setScreen] = useState<Screen>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [entry, setEntry] = useState(5);
  const [themeId, setThemeId] = useState('neon');
  const [frameCount, setFrameCount] = useState(10);
  const [players, setPlayers] = useState<Player[]>(() => [newPlayer('You', false), newPlayer('CPU', true)]);
  const [turn, setTurn] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('aim');
  const [aimX, setAimX] = useState(0.08);
  const [spin, setSpin] = useState(0);
  const [standing, setStanding] = useState<boolean[]>(() => new Array(10).fill(true));
  const [message, setMessage] = useState('Drag to aim · tap Bowl on the power');
  const [powerLive, setPowerLive] = useState(0.5);
  const [pulse, setPulse] = useState(0); // bumps to pulse the scoreboard

  const TH: LaneTheme = LANE_THEMES[themeId] ?? LANE_THEMES.neon;
  const ACCENT = TH.accent;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);
  const powerDir = useRef(1); const swinging = useRef(false);
  const standingRef = useRef(standing); useEffect(() => { standingRef.current = standing; }, [standing]);
  const aimRef = useRef(aimX); useEffect(() => { aimRef.current = aimX; }, [aimX]);
  const spinRef = useRef(spin); useEffect(() => { spinRef.current = spin; }, [spin]);
  const pinFall = useRef<number[]>(new Array(10).fill(0)); // 0=upright, >0 toppling
  const ball = useRef({ t: 0.05, lat: 0, rolling: false, curve: 0, target: 0.82, rot: 0 });
  const trail = useRef<{ x: number; y: number; s: number }[]>([]);
  const bursts = useRef<Burst[]>([]);
  const shimmer = useRef(0);
  const shake = useRef(0);
  const flash = useRef<{ text: string; life: number; c: string } | null>(null);
  const draggingAim = useRef(false);

  // oscillating power while aiming (skill)
  useEffect(() => {
    if (screen !== 'playing' || phase !== 'aim' || turn !== 0) return;
    swinging.current = true;
    const rafRef2 = { current: 0 };
    const tick = () => { if (!swinging.current) return; setPowerLive((p) => { let np = p + powerDir.current * 0.022; if (np >= 1) { np = 1; powerDir.current = -1; } if (np <= 0.15) { np = 0.15; powerDir.current = 1; } return np; }); rafRef2.current = requestAnimationFrame(tick); };
    rafRef2.current = requestAnimationFrame(tick);
    return () => { swinging.current = false; cancelAnimationFrame(rafRef2.current); };
  }, [phase, turn, screen]);

  const start = () => {
    setPlayers([newPlayer('You', false), newPlayer('CPU', true)]); setTurn(0); setFrameIdx(0); setPhase('aim');
    setStanding(new Array(10).fill(true)); pinFall.current = new Array(10).fill(0); ball.current = { t: 0.05, lat: 0, rolling: false, curve: 0, target: 0.82, rot: 0 }; trail.current = []; bursts.current = [];
    setAimX(0.08); setSpin(0); setMessage('Drag to aim · tap Bowl on the power'); setScreen('playing'); fire('match_start', frameCount + ' frames', null);
  };
  const newSetup = () => setScreen('setup');
  const lastFrame = frameCount - 1;

  const standCount = standing.filter(Boolean).length;
  const chooseKnocked = useCallback((n: number): number[] => { const up = standingRef.current.map((s, i) => (s ? i : -1)).filter((i) => i >= 0); return [...up].sort(() => Math.random() - 0.5).slice(0, n); }, []);

  const applyRoll = useCallback((pins: number, knocked: number[]) => {
    knocked.forEach((i) => { pinFall.current[i] = 0.001; });
    setStanding((prev) => { const next = [...prev]; knocked.forEach((i) => { next[i] = false; }); return next; });
    setPlayers((prev) => { const np = prev.map((p) => ({ ...p, frames: p.frames.map((f) => [...f]) })); const pl = np[turn]; let f = pl.frames[frameIdx]; if (!f) { f = []; pl.frames[frameIdx] = f; } f.push(pins); return np; });
  }, [turn, frameIdx]);

  const advanceAfterRoll = useCallback(() => {
    setPlayers((prevPlayers) => {
      const pl = prevPlayers[turn]; const f = pl.frames[frameIdx] || []; const done = frameComplete(frameIdx, f);
      setTimeout(() => {
        if (done) {
          setPulse((n) => n + 1);
          setStanding(new Array(10).fill(true)); pinFall.current = new Array(10).fill(0);
          if (turn === 0) { setTurn(1); setPhase('between'); setMessage('Bot is lining up the shot'); }
          else { if (frameIdx >= lastFrame) setPhase('over'); else { setTurn(0); setFrameIdx((fi) => fi + 1); setPhase('aim'); setMessage('Your roll — frame ' + (frameIdx + 2)); } }
        } else { setPhase(turn === 0 ? 'aim' : 'between'); if (turn === 0) setMessage('Roll again — clear the rest'); }
      }, 850);
      return prevPlayers;
    });
  }, [turn, frameIdx, lastFrame]);

  const spawnBurst = useCallback((cx: number, cy: number, n: number, colors: string[]) => {
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const sp = 1.5 + Math.random() * 3.5;
      bursts.current.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.2, life: 1, c: colors[i % colors.length] });
    }
  }, []);

  // resolve a ball once it reaches the pins
  const resolveBall = useCallback((who: 0 | 1, aim: number, power: number) => {
    const before = standingRef.current.filter(Boolean).length;
    const pins = who === 0 ? rollResult(aim, power, before) : botRoll(difficulty, before);
    const knocked = chooseKnocked(pins);
    applyRoll(pins, knocked);
    const strike = pins === before && before === 10;
    const spare = pins === before && before < 10 && before > 0;
    const rackCenter = proj(0.8, 0);
    if (strike) {
      flash.current = { text: 'STRIKE!', life: 1, c: TH.railL }; shake.current = 14;
      spawnBurst(rackCenter.x, rackCenter.y, 26, [TH.railL, TH.railR, '#ffffff', TH.arrow]);
      fire('reward', undefined, null);
    } else if (spare) {
      flash.current = { text: 'SPARE!', life: 1, c: TH.railR }; shake.current = 8;
      spawnBurst(rackCenter.x, rackCenter.y, 14, [TH.railR, '#ffffff']);
      fire('success', undefined, null);
    } else if (pins === 0) {
      flash.current = { text: 'GUTTER', life: 0.8, c: '#ff5c6c' };
      if (who === 0) fire('error', undefined, null);
    } else {
      shake.current = Math.min(8, pins); if (who === 0) fire('tap', undefined, null);
      if (pins >= 5) spawnBurst(rackCenter.x, rackCenter.y, pins, ['#ffffff', TH.railL]);
    }
    setMessage(strike ? 'STRIKE!' : spare ? 'Spare!' : pins === 0 ? (who === 0 ? 'Gutter ball — shake it off' : 'Bot gutters it') : (who === 0 ? pins + ' pins down' : 'Bot knocked ' + pins));
    advanceAfterRoll();
  }, [difficulty, chooseKnocked, applyRoll, advanceAfterRoll, fire, spawnBurst, TH]);

  const startRoll = useCallback((aim: number, power: number, who: 0 | 1, spinV: number) => {
    swinging.current = false;
    setPhase('rolling'); setMessage('…');
    ball.current = { t: 0.05, lat: aim * 0.35, rolling: true, curve: aim + spinV * 0.6, target: 0.82, rot: 0 };
    trail.current = [];
    const driver = () => {
      const b = ball.current;
      if (!b.rolling) return;
      b.t += 0.02 + power * 0.012;
      b.rot += 0.35 + power * 0.2;
      const prog = Math.min(1, (b.t - 0.05) / (b.target - 0.05));
      b.lat = aim * 0.35 * (1 - prog) + (aim * 0.5) * prog + b.curve * 0.18 * Math.sin(prog * Math.PI);
      if (b.t >= b.target) { b.rolling = false; setTimeout(() => resolveBall(who, aim + spinV * 0.25, power), 120); return; }
      requestAnimationFrame(driver);
    };
    requestAnimationFrame(driver);
  }, [resolveBall]);

  const bowl = () => { if (phase !== 'aim' || turn !== 0) return; fire('tap', undefined, null); startRoll(aimRef.current, powerLive, 0, spinRef.current); };

  // bot driver
  useEffect(() => {
    if (screen !== 'playing' || turn !== 1 || phase !== 'between') return;
    const t = setTimeout(() => { startRoll(0.08 + (Math.random() - 0.5) * 0.3, 0.7, 1, (Math.random() - 0.5) * 0.5); }, 1100);
    return () => clearTimeout(t);
  }, [turn, phase, screen, startRoll]);

  const youScore = totalScore(players[0].frames);
  const cpuScore = totalScore(players[1].frames);

  useEffect(() => {
    if (screen !== 'playing' || phase !== 'over') return;
    const id = setTimeout(() => { const w = youScore === cpuScore ? 'tie' : youScore > cpuScore ? 'you' : 'cpu'; fire(w === 'you' ? 'match_win' : w === 'cpu' ? 'match_loss' : 'tap', undefined, null); setScreen('results'); }, 800);
    return () => clearTimeout(id);
  }, [phase, screen, youScore, cpuScore, fire]);

  // render loop
  useEffect(() => {
    if (screen !== 'playing') return;
    const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const bokeh = Array.from({ length: 22 }, (_, i) => ({ x: ((i * 97) % 100) / 100 * W, y: ((i * 53) % 40) / 100 * H, r: 2 + (i % 4) }));
    // static wood-grain streak seeds (lane lat positions + waviness)
    const grain = Array.from({ length: 9 }, (_, i) => ({ lat: -0.85 + i * 0.21, w: 0.6 + (i % 3) * 0.4 }));

    const drawPin = (i: number) => {
      const p = PIN_LAYOUT[i]; const pr = proj(PIN_T(p.y), PIN_LAT(p.x)); const s = pr.s;
      const fall = pinFall.current[i];
      if (!standingRef.current[i] && fall <= 0) return;
      // cast shadow on the lane
      if (fall <= 0) { ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(pr.x, pr.y + 16 * s, 9 * s, 3.5 * s, 0, 0, 6.28); ctx.fill(); ctx.restore(); }
      ctx.save(); ctx.translate(pr.x, pr.y);
      if (fall > 0) { ctx.translate(fall * 26 * (i % 2 ? 1 : -1), -fall * 18); ctx.rotate(fall * 1.5 * (i % 2 ? 1 : -1)); ctx.globalAlpha = Math.max(0, 1 - fall); }
      const hh = 30 * s, ww = 11 * s;
      ctx.shadowColor = TH.railL; ctx.shadowBlur = 6;
      const pg = ctx.createLinearGradient(-ww, 0, ww, 0); pg.addColorStop(0, '#d6dcec'); pg.addColorStop(0.4, TH.pin); pg.addColorStop(1, '#aeb6cc');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.moveTo(-ww * 0.4, hh * 0.5); ctx.quadraticCurveTo(-ww * 0.7, -hh * 0.1, -ww * 0.28, -hh * 0.35); ctx.quadraticCurveTo(-ww * 0.5, -hh * 0.55, 0, -hh * 0.6); ctx.quadraticCurveTo(ww * 0.5, -hh * 0.55, ww * 0.28, -hh * 0.35); ctx.quadraticCurveTo(ww * 0.7, -hh * 0.1, ww * 0.4, hh * 0.5); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      // neck band
      ctx.fillStyle = TH.band; ctx.fillRect(-ww * 0.45, -hh * 0.22, ww * 0.9, hh * 0.08);
      // highlight
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(-ww * 0.18, -hh * 0.3, ww * 0.12, hh * 0.18, 0, 0, 6.28); ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      shimmer.current += 0.02; if (shimmer.current > 1.4) shimmer.current = -0.2;
      ctx.save();
      if (shake.current > 0.2) { ctx.translate((Math.random() - 0.5) * shake.current, (Math.random() - 0.5) * shake.current); shake.current *= 0.85; }
      // backdrop
      const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, TH.bg[0]); bg.addColorStop(0.5, TH.bg[1]); bg.addColorStop(1, TH.bg[2]);
      ctx.fillStyle = bg; ctx.fillRect(-20, -20, W + 40, H + 40);
      // ambient bokeh / starfield
      for (const k of bokeh) { ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, 6.28); ctx.fillStyle = TH.bokeh; ctx.fill(); }
      // back wall scoreboard glow behind pins
      const bw = proj(0.97, 0);
      ctx.fillStyle = TH.wallGlow; ctx.beginPath(); ctx.ellipse(W / 2, bw.y, W * 0.22, 34, 0, 0, 6.28); ctx.fill();
      ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = TH.railL; ctx.lineWidth = 2; ctx.strokeRect(W / 2 - 46, bw.y - 18, 92, 26); ctx.restore();

      // gutters (dark troughs just outside the lane rails)
      const drawGutter = (sign: number) => {
        const inN = proj(0, sign), inF = proj(1, sign), outN = proj(0, sign * 1.4), outF = proj(1, sign * 1.4);
        const gg = ctx.createLinearGradient(0, inN.y, 0, inF.y); gg.addColorStop(0, TH.gutter[0]); gg.addColorStop(1, TH.gutter[1]);
        ctx.beginPath(); ctx.moveTo(inN.x, inN.y); ctx.lineTo(outN.x, outN.y); ctx.lineTo(outF.x, outF.y); ctx.lineTo(inF.x, inF.y); ctx.closePath(); ctx.fillStyle = gg; ctx.fill();
        // inner glow lip
        ctx.strokeStyle = sign < 0 ? TH.railL : TH.railR; ctx.globalAlpha = 0.5; ctx.lineWidth = 2; ctx.shadowColor = sign < 0 ? TH.railL : TH.railR; ctx.shadowBlur = 8; ctx.beginPath(); ctx.moveTo(inN.x, inN.y); ctx.lineTo(inF.x, inF.y); ctx.stroke(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      };
      drawGutter(-1); drawGutter(1);

      // lane trapezoid
      const nl = proj(0, -1), nr = proj(0, 1), fl = proj(1, -1), fr = proj(1, 1);
      const lane = ctx.createLinearGradient(0, nl.y, 0, fl.y); lane.addColorStop(0, TH.lane[0]); lane.addColorStop(0.5, TH.lane[1]); lane.addColorStop(1, TH.lane[2]);
      ctx.beginPath(); ctx.moveTo(nl.x, nl.y); ctx.lineTo(nr.x, nr.y); ctx.lineTo(fr.x, fr.y); ctx.lineTo(fl.x, fl.y); ctx.closePath(); ctx.save(); ctx.fillStyle = lane; ctx.fill();
      // clip to lane for surface detail
      ctx.clip();
      // wood-grain / board streaks
      ctx.lineWidth = 1;
      for (const g of grain) { const a = proj(0, g.lat), b = proj(1, g.lat + 0.02); ctx.strokeStyle = TH.grain; ctx.globalAlpha = g.w * 0.5; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      ctx.globalAlpha = 1;
      // board lines
      ctx.strokeStyle = TH.boards; ctx.lineWidth = 1;
      for (let i = -0.8; i <= 0.8; i += 0.2) { const a = proj(0, i), b = proj(1, i); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      // center gloss
      const cl = proj(0, 0), cf = proj(1, 0); const gl = ctx.createLinearGradient(cl.x, cl.y, cf.x, cf.y); gl.addColorStop(0, 'rgba(255,255,255,0.12)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gl; ctx.fillRect(W / 2 - 40, fl.y, 80, nl.y - fl.y);
      // moving reflection shimmer band travelling down-lane
      const st = Math.max(0, Math.min(1, shimmer.current)); const sBand = proj(st, 0); const sw = proj(st, -1).hw;
      ctx.save(); ctx.globalAlpha = 0.12 * (1 - Math.abs(st - 0.5) * 1.4); ctx.fillStyle = '#ffffff'; ctx.fillRect(W / 2 - sw, sBand.y - 8 * sBand.s, sw * 2, 16 * sBand.s); ctx.restore();
      ctx.restore(); // end lane clip

      // neon rails
      ctx.lineWidth = 4; ctx.shadowBlur = 12;
      ctx.strokeStyle = TH.railL; ctx.shadowColor = TH.railL; ctx.beginPath(); ctx.moveTo(nl.x, nl.y); ctx.lineTo(fl.x, fl.y); ctx.stroke();
      ctx.strokeStyle = TH.railR; ctx.shadowColor = TH.railR; ctx.beginPath(); ctx.moveTo(nr.x, nr.y); ctx.lineTo(fr.x, fr.y); ctx.stroke();
      ctx.shadowBlur = 0;
      // lane arrows
      for (let k = -2; k <= 2; k++) { const a = proj(0.42, k * 0.18); ctx.fillStyle = TH.arrow; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(a.x, a.y - 7 * a.s); ctx.lineTo(a.x - 5 * a.s, a.y + 4 * a.s); ctx.lineTo(a.x + 5 * a.s, a.y + 4 * a.s); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
      // foul line
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(nl.x, nl.y - 8); ctx.lineTo(nr.x, nr.y - 8); ctx.stroke();

      // pins (far first)
      for (let i = 0; i < 10; i++) if (pinFall.current[i] > 0) pinFall.current[i] = Math.min(1, pinFall.current[i] + 0.06);
      const order = [...Array(10).keys()].sort((a, b) => PIN_T(PIN_LAYOUT[b].y) - PIN_T(PIN_LAYOUT[a].y));
      for (const i of order) drawPin(i);

      // aim preview (human aiming)
      if (phase === 'aim' && turn === 0) {
        const curveP = aimRef.current + spinRef.current * 0.6;
        ctx.setLineDash([5, 7]); ctx.strokeStyle = TH.aimLine; ctx.lineWidth = 2; ctx.shadowColor = TH.aimLine; ctx.shadowBlur = 8; ctx.beginPath();
        for (let tt = 0.06; tt <= 0.78; tt += 0.04) { const prog = (tt - 0.06) / 0.72; const lat = aimRef.current * 0.35 * (1 - prog) + aimRef.current * 0.5 * prog + curveP * 0.18 * Math.sin(prog * Math.PI); const pp = proj(tt, lat); if (tt === 0.06) ctx.moveTo(pp.x, pp.y); else ctx.lineTo(pp.x, pp.y); }
        ctx.stroke(); ctx.setLineDash([]); ctx.shadowBlur = 0;
      }

      // ball + trail + contact shadow
      const b = ball.current; const bp = proj(b.t, b.lat); const br = 18 * bp.s;
      if (b.rolling) { trail.current.push({ x: bp.x, y: bp.y, s: bp.s }); if (trail.current.length > 12) trail.current.shift(); }
      for (let i = 0; i < trail.current.length; i++) { const tr = trail.current[i]; ctx.globalAlpha = (i / trail.current.length) * 0.4; ctx.beginPath(); ctx.arc(tr.x, tr.y, 18 * tr.s * 0.8, 0, 6.28); ctx.fillStyle = TH.ball[1]; ctx.fill(); }
      ctx.globalAlpha = 1;
      // contact shadow
      ctx.save(); ctx.globalAlpha = 0.4; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(bp.x, bp.y + br * 0.7, br * 0.95, br * 0.32, 0, 0, 6.28); ctx.fill(); ctx.restore();
      const grd = ctx.createRadialGradient(bp.x - br * 0.3, bp.y - br * 0.3, br * 0.2, bp.x, bp.y, br); grd.addColorStop(0, TH.ball[0]); grd.addColorStop(1, TH.ball[1]);
      ctx.save(); ctx.shadowColor = TH.ball[1]; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(bp.x, bp.y, br, 0, 6.28); ctx.fillStyle = grd; ctx.fill(); ctx.restore();
      // spin lines
      ctx.save(); ctx.translate(bp.x, bp.y); ctx.rotate(b.rot); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.3; for (let a = 0; a < 2; a++) { ctx.beginPath(); ctx.arc(0, 0, br * (0.5 + a * 0.25), 0.4, 2.2); ctx.stroke(); } ctx.restore();
      // finger holes
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; [[-.25, -.15], [.05, -.2], [-.1, .1]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(bp.x + dx * br, bp.y + dy * br, br * 0.13, 0, 6.28); ctx.fill(); });
      // glossy highlight
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(bp.x - br * 0.32, bp.y - br * 0.34, br * 0.22, br * 0.14, -0.6, 0, 6.28); ctx.fill();

      // burst particles
      if (bursts.current.length) {
        const next: Burst[] = [];
        for (const p of bursts.current) {
          p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.025;
          if (p.life > 0) { ctx.globalAlpha = p.life; ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, 6.28); ctx.fill(); next.push(p); }
        }
        ctx.globalAlpha = 1; ctx.shadowBlur = 0; bursts.current = next;
      }

      // flash text
      if (flash.current) { const f = flash.current; f.life -= 0.012; if (f.life <= 0) flash.current = null; else { ctx.save(); ctx.globalAlpha = Math.min(1, f.life * 2); const sc = 1 + (1 - f.life) * 0.4; ctx.translate(W / 2, H * 0.4); ctx.scale(sc, sc); ctx.font = '900 40px Space Grotesk, sans-serif'; ctx.textAlign = 'center'; ctx.shadowColor = f.c; ctx.shadowBlur = 24; ctx.fillStyle = '#fff'; ctx.fillText(f.text, 0, 0); ctx.restore(); } }

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [screen, phase, turn, TH]);

  // aim drag on canvas
  const onPointer = (e: React.PointerEvent, down: boolean) => {
    if (phase !== 'aim' || turn !== 0) return;
    if (down) draggingAim.current = true;
    if (!draggingAim.current) return;
    const c = canvasRef.current!; const r = c.getBoundingClientRect();
    const lx = (e.clientX - r.left) / r.width; // 0..1
    setAimX(Math.max(-1, Math.min(1, (lx - 0.5) * 2)));
  };

  const renderFrames = (p: Player) => {
    const cum = score(p.frames);
    return (
      <div className="bw-frames" style={{ gridTemplateColumns: `repeat(${frameCount}, 1fr)` }}>
        {Array.from({ length: frameCount }).map((_, i) => {
          const f: Frame = p.frames[i] || [];
          const r1 = f[0] === undefined ? '' : isStrike(f) && i < lastFrame ? 'X' : String(f[0]);
          const r2 = f[1] === undefined ? '' : isSpare(f) ? '/' : f[1] === 10 ? 'X' : String(f[1]);
          const r3 = f[2] === undefined ? '' : f[2] === 10 ? 'X' : String(f[2]);
          return (<div key={i} className="bw-frame"><div className="bw-rolls"><span>{r1}</span><span>{r2}</span>{i === lastFrame && <span>{r3}</span>}</div><div className="bw-cum">{cum[i] !== undefined ? cum[i] : ''}</div></div>);
        })}
      </div>
    );
  };

  if (screen === 'setup') {
    return (
      <MatchSetup game="Bowling" icon="Target" accent={ACCENT}
        blurb="Drag to aim down the neon lane, add spin, lock the power, chase strikes. Highest pinfall wins."
        difficulty={difficulty} onDifficulty={(d) => { setDifficulty(d as Difficulty); fire('tap'); }}
        extras={[
          { key: 'len', label: 'Match length', value: String(frameCount), onChange: (id) => { setFrameCount(Number(id)); fire('tap'); }, cols: true, options: [
            { id: '3', label: '3 frames', sub: 'Quick' }, { id: '5', label: '5 frames', sub: 'Standard' }, { id: '10', label: '10 frames', sub: 'Full game' } ] },
          { key: 'theme', label: 'Lane theme', value: themeId, onChange: (id) => { setThemeId(id); fire('tap'); }, cols: true, options: Object.values(LANE_THEMES).map((t) => ({ id: t.id, label: t.name, sub: t.tag })) },
        ]}
        entry={entry} onEntry={(n) => { setEntry(n); fire('tap'); }} onStart={start} />
    );
  }
  if (screen === 'results') {
    const w = youScore === cpuScore ? 'draw' : youScore > cpuScore ? 'win' : 'lose';
    return <MatchResult accent={ACCENT} outcome={w} title={w === 'win' ? 'You win!' : w === 'lose' ? 'Bot wins' : 'Tie game'} sub={`Pinfall ${youScore} – ${cpuScore}`} entry={w === 'draw' ? 0 : entry} onRematch={start} onNewSetup={newSetup} />;
  }

  const botThinking = turn === 1 && phase === 'between';
  return (
    <div className="bw2-wrap" style={{ ['--acc' as any]: ACCENT }}>
      <GameTopBar title="Bowling" sub={`Frame ${Math.min(frameIdx + 1, frameCount)} / ${frameCount}`} accent={ACCENT} onBack={newSetup}
        right={<span className="bw2-mini"><b className="you">{youScore}</b> – <b className="bot">{cpuScore}</b></span>} />
      <div className={'bw2-status' + (turn === 1 ? ' is-bot' : '')}>
        {turn === 0 ? message : <>Bot is lining up the shot{botThinking && <span className="bw2-dots"><i /><i /><i /></span>}</>}
      </div>
      <div className="bw2-stage">
        <canvas ref={canvasRef} width={W} height={H} className="bw2-canvas"
          onPointerDown={(e) => onPointer(e, true)} onPointerMove={(e) => onPointer(e, false)}
          onPointerUp={() => { draggingAim.current = false; }} onPointerLeave={() => { draggingAim.current = false; }} />
        {turn === 0 && phase === 'aim' && (
          <div className="bw2-power">
            <div className={'bw2-power__bar' + (powerLive > 0.8 ? ' is-hot' : '')}><div className="bw2-power__fill" style={{ height: (powerLive * 100) + '%' }} /></div>
            <button className="bw2-bowl" onClick={bowl}>Bowl</button>
          </div>
        )}
      </div>
      {turn === 0 && phase === 'aim' && (
        <div className="bw2-spin">
          <label>Spin</label>
          <input type="range" min={-1} max={1} step={0.05} value={spin}
            onChange={(e) => { setSpin(Number(e.target.value)); }} onPointerUp={() => fire('tap')} />
          <span className="bw2-spin__val">{spin === 0 ? 'Straight' : spin < 0 ? 'Hook ◀' : 'Hook ▶'}</span>
        </div>
      )}
      <div className={'bw-scores' + (pulse % 2 === 0 ? ' p0' : ' p1')}>
        <div className={'bw-pcard' + (turn === 0 ? ' active' : '')}><div className="bw-pname">You<span>{youScore}</span></div>{renderFrames(players[0])}</div>
        <div className={'bw-pcard' + (turn === 1 ? ' active' : '')}><div className="bw-pname">Bot<span>{cpuScore}</span></div>{renderFrames(players[1])}</div>
      </div>
    </div>
  );
}
