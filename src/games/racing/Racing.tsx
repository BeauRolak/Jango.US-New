import { useEffect, useRef, useState, useCallback } from 'react';
import { TRACK, CAR_W, CAR_L, LAPS, CENTER, OUTER, INNER, startCar, updateCar, botControls } from './engine';
import type { Car, Difficulty, Controls } from './engine';
import { MatchSetup, MatchResult, GameTopBar } from '../shared/GameShell';
import { useFeedback } from '../../components/Juice';
import './racing.css';

type Phase = 'setup' | 'playing' | 'results';
const ACCENT = '#ff4d5e';

export default function Racing() {
  const { fire } = useFeedback();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const playerRef = useRef<Car>(startCar(-22));
  const botRef = useRef<Car>(startCar(22));
  const keysRef = useRef<Controls>({ throttle: false, brake: false, left: false, right: false });
  const runningRef = useRef(false);
  const diffRef = useRef<Difficulty>('medium');

  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [entry, setEntry] = useState(5);
  const [lap, setLap] = useState(0);
  const [result, setResult] = useState<null | 'you' | 'cpu'>(null);
  useEffect(() => { diffRef.current = difficulty; }, [difficulty]);

  const start = () => { playerRef.current = startCar(-22); botRef.current = startCar(22); setLap(0); setResult(null); runningRef.current = true; setPhase('playing'); fire('match_start', LAPS + ' laps — go!', null); };
  const newSetup = () => { runningRef.current = false; setPhase('setup'); };
  const setKey = useCallback((k: keyof Controls, v: boolean) => { keysRef.current = { ...keysRef.current, [k]: v }; }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const map: Record<string, keyof Controls> = { ArrowUp: 'throttle', w: 'throttle', ArrowDown: 'brake', s: 'brake', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
    const down = (e: KeyboardEvent) => { const k = map[e.key]; if (k) { e.preventDefault(); setKey(k, true); } };
    const up = (e: KeyboardEvent) => { const k = map[e.key]; if (k) { e.preventDefault(); setKey(k, false); } };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [setKey, phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const drawTrack = () => {
      ctx.fillStyle = '#0c3b1a'; ctx.fillRect(0, 0, TRACK.w, TRACK.h);
      ctx.beginPath(); ctx.ellipse(CENTER.x, CENTER.y, OUTER.rx, OUTER.ry, 0, 0, 6.28); ctx.fillStyle = '#2b2f36'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(CENTER.x, CENTER.y, INNER.rx, INNER.ry, 0, 0, 6.28); ctx.fillStyle = '#0c3b1a'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath(); ctx.ellipse(CENTER.x, CENTER.y, OUTER.rx - 2, OUTER.ry - 2, 0, 0, 6.28); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(CENTER.x, CENTER.y, INNER.rx + 2, INNER.ry + 2, 0, 0, 6.28); ctx.stroke();
      const my = CENTER.y + (OUTER.ry + INNER.ry) / 2; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(CENTER.x - 46, my); ctx.lineTo(CENTER.x + 46, my); ctx.stroke(); ctx.setLineDash([]);
    };
    const drawCar = (car: Car, color: string) => { ctx.save(); ctx.translate(car.x, car.y); ctx.rotate(car.angle); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.fillRect(-CAR_L / 2, -CAR_W / 2, CAR_L, CAR_W); ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(CAR_L / 2 - 8, -CAR_W / 2 + 3, 6, CAR_W - 6); ctx.restore(); };
    const loop = () => {
      if (runningRef.current) {
        const pDone = updateCar(playerRef.current, keysRef.current);
        const bDone = updateCar(botRef.current, botControls(botRef.current, diffRef.current));
        setLap(playerRef.current.lap);
        if (pDone || bDone) { runningRef.current = false; const w = pDone ? 'you' : 'cpu'; setResult(w); setTimeout(() => { fire(w === 'you' ? 'match_win' : 'match_loss', undefined, null); setPhase('results'); }, 900); }
      }
      drawTrack(); drawCar(botRef.current, '#ff5c5c'); drawCar(playerRef.current, '#5ac8ff');
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, fire]);

  if (phase === 'setup') {
    return (
      <MatchSetup game="Racing" icon="Bolt" accent={ACCENT}
        blurb={`Stay on the asphalt — grass slows you down. First to ${LAPS} laps wins.`}
        difficulty={difficulty} onDifficulty={(d) => { setDifficulty(d as Difficulty); fire('tap'); }}
        difficulties={[{ id: 'easy', label: 'Easy', sub: 'Slow rival' }, { id: 'medium', label: 'Medium', sub: 'Keeps pace' }, { id: 'hard', label: 'Hard', sub: 'Fast line' }]}
        entry={entry} onEntry={(n) => { setEntry(n); fire('tap'); }} onStart={start} startLabel="Start race" />
    );
  }
  if (phase === 'results') {
    const youWin = result === 'you';
    return <MatchResult accent={ACCENT} outcome={youWin ? 'win' : 'lose'} title={youWin ? 'You win!' : 'Bot wins'} sub={youWin ? 'Checkered flag!' : 'Pipped at the line.'} entry={entry} onRematch={start} onNewSetup={newSetup} />;
  }

  return (
    <div className="rc2-wrap" style={{ ['--acc' as any]: ACCENT }}>
      <GameTopBar title="Racing" sub={`Lap ${Math.min(lap + 1, LAPS)} / ${LAPS}`} accent={ACCENT} onBack={newSetup} />
      <div className="rc2-stage">
        <canvas ref={canvasRef} width={TRACK.w} height={TRACK.h} className="rc2-canvas" />
      </div>
      <div className="rc2-controls">
        <button className="rc2-pad" onPointerDown={() => setKey('throttle', true)} onPointerUp={() => setKey('throttle', false)} onPointerLeave={() => setKey('throttle', false)}>▲</button>
        <div className="rc2-pad-row">
          <button className="rc2-pad" onPointerDown={() => setKey('left', true)} onPointerUp={() => setKey('left', false)} onPointerLeave={() => setKey('left', false)}>◀</button>
          <button className="rc2-pad" onPointerDown={() => setKey('brake', true)} onPointerUp={() => setKey('brake', false)} onPointerLeave={() => setKey('brake', false)}>▼</button>
          <button className="rc2-pad" onPointerDown={() => setKey('right', true)} onPointerUp={() => setKey('right', false)} onPointerLeave={() => setKey('right', false)}>▶</button>
        </div>
      </div>
      <p className="rc2-hint">Arrow keys / WASD or the pad. Hold throttle, steer through the corners.</p>
    </div>
  );
}
