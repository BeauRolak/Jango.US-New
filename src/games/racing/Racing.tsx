import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TRACK, CAR_W, CAR_L, LAPS, CENTER, OUTER, INNER,
  startCar, updateCar, botControls,
} from './engine';
import type { Car, Difficulty, Controls } from './engine';
import './racing.css';

export default function Racing() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const playerRef = useRef<Car>(startCar(-22));
  const botRef = useRef<Car>(startCar(22));
  const keysRef = useRef<Controls>({ throttle: false, brake: false, left: false, right: false });
  const runningRef = useRef(false);
  const diffRef = useRef<Difficulty>('medium');

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [lap, setLap] = useState(0);
  const [result, setResult] = useState<null | string>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => { diffRef.current = difficulty; }, [difficulty]);

  const begin = useCallback(() => {
    playerRef.current = startCar(-22);
    botRef.current = startCar(22);
    setLap(0); setResult(null); setStarted(true);
    runningRef.current = true;
  }, []);

  const setKey = useCallback((k: keyof Controls, v: boolean) => {
    keysRef.current = { ...keysRef.current, [k]: v };
  }, []);

  useEffect(() => {
    const map: Record<string, keyof Controls> = {
      ArrowUp: 'throttle', w: 'throttle',
      ArrowDown: 'brake', s: 'brake',
      ArrowLeft: 'left', a: 'left',
      ArrowRight: 'right', d: 'right',
    };
    const down = (e: KeyboardEvent) => { const k = map[e.key]; if (k) { e.preventDefault(); setKey(k, true); } };
    const up = (e: KeyboardEvent) => { const k = map[e.key]; if (k) { e.preventDefault(); setKey(k, false); } };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [setKey]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const drawTrack = () => {
      ctx.fillStyle = '#0c3b1a';
      ctx.fillRect(0, 0, TRACK.w, TRACK.h);
      // outer asphalt
      ctx.beginPath();
      ctx.ellipse(CENTER.x, CENTER.y, OUTER.rx, OUTER.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#2b2f36'; ctx.fill();
      // inner grass hole
      ctx.beginPath();
      ctx.ellipse(CENTER.x, CENTER.y, INNER.rx, INNER.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#0c3b1a'; ctx.fill();
      // edge lines
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath(); ctx.ellipse(CENTER.x, CENTER.y, OUTER.rx - 2, OUTER.ry - 2, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(CENTER.x, CENTER.y, INNER.rx + 2, INNER.ry + 2, 0, 0, Math.PI * 2); ctx.stroke();
      // start/finish line at bottom
      const my = CENTER.y + (OUTER.ry + INNER.ry) / 2;
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(CENTER.x - 46, my); ctx.lineTo(CENTER.x + 46, my); ctx.stroke();
      ctx.setLineDash([]);
    };

    const drawCar = (car: Car, color: string) => {
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);
      ctx.fillStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 10;
      ctx.fillRect(-CAR_L / 2, -CAR_W / 2, CAR_L, CAR_W);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(CAR_L / 2 - 8, -CAR_W / 2 + 3, 6, CAR_W - 6);
      ctx.restore();
    };

    const loop = () => {
      if (runningRef.current) {
        const pDone = updateCar(playerRef.current, keysRef.current);
        const bDone = updateCar(botRef.current, botControls(botRef.current, diffRef.current));
        setLap(playerRef.current.lap);
        if (pDone || bDone) {
          runningRef.current = false;
          setResult(pDone ? 'You Win!' : 'CPU Wins');
        }
      }
      drawTrack();
      drawCar(botRef.current, '#ff5c5c');
      drawCar(playerRef.current, '#5ac8ff');
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className={'rc-wrap'}>
      <div className={'rc-head'}>
        <Link to={'/games'} className={'rc-back'}>{'\u2190 Back'}</Link>
        <h1 className={'rc-title'}>{'Racing'}</h1>
        <div className={'rc-diff'}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button key={d} className={'rc-diff-btn' + (difficulty === d ? ' active' : '')}
              onClick={() => setDifficulty(d)}>{d}</button>
          ))}
        </div>
      </div>
      <div className={'rc-hud'}>{'Lap ' + Math.min(lap + 1, LAPS) + ' / ' + LAPS}</div>
      <div className={'rc-stage-wrap'}>
        <canvas ref={canvasRef} width={TRACK.w} height={TRACK.h} className={'rc-canvas'} />
        {(!started || result) && (
          <div className={'rc-overlay'}>
            <div className={'rc-card'}>
              <div className={'rc-result'}>{result ? result : 'Ready to Race'}</div>
              <button className={'rc-play'} onClick={begin}>{result || started ? 'Race again' : 'Start'}</button>
              <Link to={'/games'} className={'rc-leave'}>{'Back to games'}</Link>
            </div>
          </div>
        )}
      </div>
      <div className={'rc-controls'}>
        <button className={'rc-pad'} onPointerDown={() => setKey('throttle', true)} onPointerUp={() => setKey('throttle', false)} onPointerLeave={() => setKey('throttle', false)}>{'\u25b2'}</button>
        <div className={'rc-pad-row'}>
          <button className={'rc-pad'} onPointerDown={() => setKey('left', true)} onPointerUp={() => setKey('left', false)} onPointerLeave={() => setKey('left', false)}>{'\u25c0'}</button>
          <button className={'rc-pad'} onPointerDown={() => setKey('brake', true)} onPointerUp={() => setKey('brake', false)} onPointerLeave={() => setKey('brake', false)}>{'\u25bc'}</button>
          <button className={'rc-pad'} onPointerDown={() => setKey('right', true)} onPointerUp={() => setKey('right', false)} onPointerLeave={() => setKey('right', false)}>{'\u25b6'}</button>
        </div>
      </div>
      <p className={'rc-hint'}>{'Arrow keys / WASD or the pad. Stay on the asphalt - grass slows you down. First to ' + LAPS + ' laps wins.'}</p>
    </div>
  );
}
