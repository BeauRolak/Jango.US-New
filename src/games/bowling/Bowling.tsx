import { useState, useRef, useEffect, useCallback } from 'react';
import { newPlayer, rollResult, botRoll, frameComplete, totalScore, score, isStrike, isSpare, PIN_LAYOUT } from './engine';
import type { Player, Difficulty, Frame } from './engine';
import { MatchSetup, MatchResult, GameTopBar } from '../shared/GameShell';
import { useFeedback } from '../../components/Juice';
import './bowling.css';

type Phase = 'aim' | 'rolling' | 'between' | 'over';
type Screen = 'setup' | 'playing' | 'results';
const ACCENT = '#ff7a3c';
const W = 360, H = 560;

// perspective projection: t 0(near)->1(far), lat -1..1
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

export default function Bowling() {
  const { fire } = useFeedback();
  const [screen, setScreen] = useState<Screen>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [entry, setEntry] = useState(5);
  const [players, setPlayers] = useState<Player[]>(() => [newPlayer('You', false), newPlayer('CPU', true)]);
  const [turn, setTurn] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('aim');
  const [aimX, setAimX] = useState(0.08);
  const [standing, setStanding] = useState<boolean[]>(() => new Array(10).fill(true));
  const [message, setMessage] = useState('Drag to aim · tap Bowl on the power');
  const [powerLive, setPowerLive] = useState(0.5);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);
  const powerDir = useRef(1); const swinging = useRef(false);
  const standingRef = useRef(standing); useEffect(() => { standingRef.current = standing; }, [standing]);
  const aimRef = useRef(aimX); useEffect(() => { aimRef.current = aimX; }, [aimX]);
  const pinFall = useRef<number[]>(new Array(10).fill(0)); // 0=upright, >0 toppling
  const ball = useRef({ t: 0.05, lat: 0, rolling: false, curve: 0, target: 0.82 });
  const trail = useRef<{ x: number; y: number; s: number }[]>([]);
  const shake = useRef(0);
  const flash = useRef<{ text: string; life: number } | null>(null);
  const draggingAim = useRef(false);

  // oscillating power while aiming (skill)
  useEffect(() => {
    if (screen !== 'playing' || phase !== 'aim' || turn !== 0) return;
    swinging.current = true;
    const tick = () => { if (!swinging.current) return; setPowerLive((p) => { let np = p + powerDir.current * 0.022; if (np >= 1) { np = 1; powerDir.current = -1; } if (np <= 0.15) { np = 0.15; powerDir.current = 1; } return np; }); rafRef2.current = requestAnimationFrame(tick); };
    const rafRef2 = { current: 0 };
    rafRef2.current = requestAnimationFrame(tick);
    return () => { swinging.current = false; cancelAnimationFrame(rafRef2.current); };
  }, [phase, turn, screen]);

  const start = () => {
    setPlayers([newPlayer('You', false), newPlayer('CPU', true)]); setTurn(0); setFrameIdx(0); setPhase('aim');
    setStanding(new Array(10).fill(true)); pinFall.current = new Array(10).fill(0); ball.current = { t: 0.05, lat: 0, rolling: false, curve: 0, target: 0.82 }; trail.current = [];
    setAimX(0.08); setMessage('Drag to aim · tap Bowl on the power'); setScreen('playing'); fire('match_start', '10 frames', null);
  };
  const newSetup = () => setScreen('setup');

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
          setStanding(new Array(10).fill(true)); pinFall.current = new Array(10).fill(0);
          if (turn === 0) { setTurn(1); setPhase('between'); setMessage('Bot is bowling…'); }
          else { if (frameIdx >= 9) setPhase('over'); else { setTurn(0); setFrameIdx((fi) => fi + 1); setPhase('aim'); setMessage('Your roll — frame ' + (frameIdx + 2)); } }
        } else { setPhase(turn === 0 ? 'aim' : 'between'); if (turn === 0) setMessage('Roll again — clear the rest'); }
      }, 850);
      return prevPlayers;
    });
  }, [turn, frameIdx]);

  // resolve a ball once it reaches the pins
  const resolveBall = useCallback((who: 0 | 1, aim: number, power: number) => {
    const before = standingRef.current.filter(Boolean).length;
    const pins = who === 0 ? rollResult(aim, power, before) : botRoll(difficulty, before);
    const knocked = chooseKnocked(pins);
    applyRoll(pins, knocked);
    const strike = pins === before && before === 10;
    const spare = pins === before && before < 10;
    if (strike) { flash.current = { text: 'STRIKE!', life: 1 }; shake.current = 14; fire('success', undefined, null); }
    else if (spare) { flash.current = { text: 'SPARE!', life: 1 }; shake.current = 8; fire('success', undefined, null); }
    else { shake.current = Math.min(8, pins); if (who === 0) fire('tap', undefined, null); }
    setMessage(strike ? 'STRIKE!' : spare ? 'Spare!' : (who === 0 ? pins + ' pins' : 'Bot knocked ' + pins));
    advanceAfterRoll();
  }, [difficulty, chooseKnocked, applyRoll, advanceAfterRoll, fire]);

  const startRoll = useCallback((aim: number, power: number, who: 0 | 1) => {
    swinging.current = false;
    setPhase('rolling'); setMessage('…');
    ball.current = { t: 0.05, lat: aim * 0.35, rolling: true, curve: aim, target: 0.82 };
    trail.current = [];
    const driver = () => {
      const b = ball.current;
      if (!b.rolling) return;
      b.t += 0.02 + power * 0.012;
      const prog = Math.min(1, (b.t - 0.05) / (b.target - 0.05));
      b.lat = aim * 0.35 * (1 - prog) + (aim * 0.5) * prog + b.curve * 0.18 * Math.sin(prog * Math.PI);
      if (b.t >= b.target) { b.rolling = false; setTimeout(() => resolveBall(who, aim, power), 120); return; }
      requestAnimationFrame(driver);
    };
    requestAnimationFrame(driver);
  }, [resolveBall]);

  const bowl = () => { if (phase !== 'aim' || turn !== 0) return; fire('tap', undefined, null); startRoll(aimRef.current, powerLive, 0); };

  // bot driver
  useEffect(() => {
    if (screen !== 'playing' || turn !== 1 || phase !== 'between') return;
    const t = setTimeout(() => { startRoll(0.08 + (Math.random() - 0.5) * 0.3, 0.7, 1); }, 700);
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

    const drawPin = (i: number) => {
      const p = PIN_LAYOUT[i]; const pr = proj(PIN_T(p.y), PIN_LAT(p.x)); const s = pr.s;
      const fall = pinFall.current[i];
      if (!standingRef.current[i] && fall <= 0) return;
      ctx.save(); ctx.translate(pr.x, pr.y);
      if (fall > 0) { ctx.translate(fall * 26 * (i % 2 ? 1 : -1), -fall * 18); ctx.rotate(fall * 1.5 * (i % 2 ? 1 : -1)); ctx.globalAlpha = Math.max(0, 1 - fall); }
      const hh = 30 * s, ww = 11 * s;
      ctx.shadowColor = '#9fe0ff'; ctx.shadowBlur = 6;
      ctx.fillStyle = '#f4f8ff';
      ctx.beginPath(); ctx.moveTo(-ww * 0.4, hh * 0.5); ctx.quadraticCurveTo(-ww * 0.7, -hh * 0.1, -ww * 0.28, -hh * 0.35); ctx.quadraticCurveTo(-ww * 0.5, -hh * 0.55, 0, -hh * 0.6); ctx.quadraticCurveTo(ww * 0.5, -hh * 0.55, ww * 0.28, -hh * 0.35); ctx.quadraticCurveTo(ww * 0.7, -hh * 0.1, ww * 0.4, hh * 0.5); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#ff4d5e';
      ctx.fillRect(-ww * 0.45, -hh * 0.22, ww * 0.9, hh * 0.08);
      ctx.restore();
    };

    const draw = () => {
      ctx.save();
      if (shake.current > 0.2) { ctx.translate((Math.random() - 0.5) * shake.current, (Math.random() - 0.5) * shake.current); shake.current *= 0.85; }
      // backdrop
      const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#160a2e'); bg.addColorStop(0.5, '#0a0a1e'); bg.addColorStop(1, '#06060f');
      ctx.fillStyle = bg; ctx.fillRect(-20, -20, W + 40, H + 40);
      // bokeh
      for (const k of bokeh) { ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, 6.28); ctx.fillStyle = `rgba(120,160,255,0.10)`; ctx.fill(); }
      // back wall glow behind pins
      const bw = proj(0.95, 0); ctx.fillStyle = 'rgba(80,180,255,0.12)'; ctx.beginPath(); ctx.ellipse(W / 2, bw.y, W * 0.18, 30, 0, 0, 6.28); ctx.fill();
      // lane trapezoid
      const nl = proj(0, -1), nr = proj(0, 1), fl = proj(1, -1), fr = proj(1, 1);
      const lane = ctx.createLinearGradient(0, nl.y, 0, fl.y); lane.addColorStop(0, '#6b4a24'); lane.addColorStop(0.5, '#7a5a2e'); lane.addColorStop(1, '#3a2a16');
      ctx.beginPath(); ctx.moveTo(nl.x, nl.y); ctx.lineTo(nr.x, nr.y); ctx.lineTo(fr.x, fr.y); ctx.lineTo(fl.x, fl.y); ctx.closePath(); ctx.fillStyle = lane; ctx.fill();
      // board lines
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1;
      for (let i = -0.8; i <= 0.8; i += 0.2) { const a = proj(0, i), b = proj(1, i); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      // neon rails
      ctx.lineWidth = 4; ctx.shadowBlur = 12;
      ctx.strokeStyle = '#21e6ff'; ctx.shadowColor = '#21e6ff'; ctx.beginPath(); ctx.moveTo(nl.x, nl.y); ctx.lineTo(fl.x, fl.y); ctx.stroke();
      ctx.strokeStyle = '#ff3df0'; ctx.shadowColor = '#ff3df0'; ctx.beginPath(); ctx.moveTo(nr.x, nr.y); ctx.lineTo(fr.x, fr.y); ctx.stroke();
      ctx.shadowBlur = 0;
      // lane arrows
      for (let k = -2; k <= 2; k++) { const a = proj(0.42, k * 0.18); ctx.fillStyle = 'rgba(255,200,120,0.5)'; ctx.beginPath(); ctx.moveTo(a.x, a.y - 7 * a.s); ctx.lineTo(a.x - 5 * a.s, a.y + 4 * a.s); ctx.lineTo(a.x + 5 * a.s, a.y + 4 * a.s); ctx.closePath(); ctx.fill(); }
      // foul line
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(nl.x, nl.y - 8); ctx.lineTo(nr.x, nr.y - 8); ctx.stroke();

      // pins (far first)
      for (let i = 0; i < 10; i++) if (pinFall.current[i] > 0) pinFall.current[i] = Math.min(1, pinFall.current[i] + 0.06);
      const order = [...Array(10).keys()].sort((a, b) => PIN_T(PIN_LAYOUT[b].y) - PIN_T(PIN_LAYOUT[a].y));
      for (const i of order) drawPin(i);

      // aim preview (human aiming)
      if (phase === 'aim' && turn === 0) {
        ctx.setLineDash([5, 7]); ctx.strokeStyle = 'rgba(120,220,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath();
        for (let tt = 0.06; tt <= 0.78; tt += 0.04) { const prog = (tt - 0.06) / 0.72; const lat = aimRef.current * 0.35 * (1 - prog) + aimRef.current * 0.5 * prog + aimRef.current * 0.18 * Math.sin(prog * Math.PI); const pp = proj(tt, lat); if (tt === 0.06) ctx.moveTo(pp.x, pp.y); else ctx.lineTo(pp.x, pp.y); }
        ctx.stroke(); ctx.setLineDash([]);
      }

      // ball + trail
      const b = ball.current; const bp = proj(b.t, b.lat); const br = 18 * bp.s;
      if (b.rolling) { trail.current.push({ x: bp.x, y: bp.y, s: bp.s }); if (trail.current.length > 12) trail.current.shift(); }
      for (let i = 0; i < trail.current.length; i++) { const tr = trail.current[i]; ctx.globalAlpha = (i / trail.current.length) * 0.4; ctx.beginPath(); ctx.arc(tr.x, tr.y, 18 * tr.s * 0.8, 0, 6.28); ctx.fillStyle = '#3aa0ff'; ctx.fill(); }
      ctx.globalAlpha = 1;
      const grd = ctx.createRadialGradient(bp.x - br * 0.3, bp.y - br * 0.3, br * 0.2, bp.x, bp.y, br); grd.addColorStop(0, '#9fd0ff'); grd.addColorStop(1, '#1f5fd0');
      ctx.save(); ctx.shadowColor = '#3aa0ff'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(bp.x, bp.y, br, 0, 6.28); ctx.fillStyle = grd; ctx.fill(); ctx.restore();
      // finger holes
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; [[-.25,-.15],[.05,-.2],[-.1,.1]].forEach(([dx,dy]) => { ctx.beginPath(); ctx.arc(bp.x + dx * br, bp.y + dy * br, br * 0.13, 0, 6.28); ctx.fill(); });

      // flash text
      if (flash.current) { const f = flash.current; f.life -= 0.012; if (f.life <= 0) flash.current = null; else { ctx.save(); ctx.globalAlpha = Math.min(1, f.life * 2); const sc = 1 + (1 - f.life) * 0.4; ctx.translate(W / 2, H * 0.4); ctx.scale(sc, sc); ctx.font = '900 40px Space Grotesk, sans-serif'; ctx.textAlign = 'center'; ctx.shadowColor = ACCENT; ctx.shadowBlur = 24; ctx.fillStyle = '#fff'; ctx.fillText(f.text, 0, 0); ctx.restore(); } }

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [screen, phase, turn]);

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
      <div className="bw-frames">
        {Array.from({ length: 10 }).map((_, i) => {
          const f: Frame = p.frames[i] || [];
          const r1 = f[0] === undefined ? '' : isStrike(f) && i < 9 ? 'X' : String(f[0]);
          const r2 = f[1] === undefined ? '' : isSpare(f) ? '/' : f[1] === 10 ? 'X' : String(f[1]);
          const r3 = f[2] === undefined ? '' : f[2] === 10 ? 'X' : String(f[2]);
          return (<div key={i} className="bw-frame"><div className="bw-rolls"><span>{r1}</span><span>{r2}</span>{i === 9 && <span>{r3}</span>}</div><div className="bw-cum">{cum[i] !== undefined ? cum[i] : ''}</div></div>);
        })}
      </div>
    );
  };

  if (screen === 'setup') {
    return (
      <MatchSetup game="Bowling" icon="Target" accent={ACCENT}
        blurb="Drag to aim down the neon lane, lock the power, chase strikes. Highest pinfall after 10 frames wins."
        difficulty={difficulty} onDifficulty={(d) => { setDifficulty(d as Difficulty); fire('tap'); }}
        entry={entry} onEntry={(n) => { setEntry(n); fire('tap'); }} onStart={start} />
    );
  }
  if (screen === 'results') {
    const w = youScore === cpuScore ? 'draw' : youScore > cpuScore ? 'win' : 'lose';
    return <MatchResult accent={ACCENT} outcome={w} title={w === 'win' ? 'You win!' : w === 'lose' ? 'Bot wins' : 'Tie game'} sub={`Pinfall ${youScore} – ${cpuScore}`} entry={w === 'draw' ? 0 : entry} onRematch={start} onNewSetup={newSetup} />;
  }

  return (
    <div className="bw2-wrap" style={{ ['--acc' as any]: ACCENT }}>
      <GameTopBar title="Bowling" sub={`Frame ${Math.min(frameIdx + 1, 10)} / 10`} accent={ACCENT} onBack={newSetup}
        right={<span className="bw2-mini"><b className="you">{youScore}</b> – <b className="bot">{cpuScore}</b></span>} />
      <div className="bw2-status">{turn === 0 ? message : 'Bot is bowling…'}</div>
      <div className="bw2-stage">
        <canvas ref={canvasRef} width={W} height={H} className="bw2-canvas"
          onPointerDown={(e) => onPointer(e, true)} onPointerMove={(e) => onPointer(e, false)}
          onPointerUp={() => { draggingAim.current = false; }} onPointerLeave={() => { draggingAim.current = false; }} />
        {turn === 0 && phase === 'aim' && (
          <div className="bw2-power">
            <div className="bw2-power__bar"><div className="bw2-power__fill" style={{ height: (powerLive * 100) + '%' }} /></div>
            <button className="bw2-bowl" onClick={bowl}>Bowl</button>
          </div>
        )}
      </div>
      <div className="bw-scores">
        <div className={'bw-pcard' + (turn === 0 ? ' active' : '')}><div className="bw-pname">You<span>{youScore}</span></div>{renderFrames(players[0])}</div>
        <div className={'bw-pcard' + (turn === 1 ? ' active' : '')}><div className="bw-pname">Bot<span>{cpuScore}</span></div>{renderFrames(players[1])}</div>
      </div>
    </div>
  );
}
