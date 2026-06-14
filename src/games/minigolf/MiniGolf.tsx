import { useEffect, useRef, useState, useCallback } from 'react';
import { FIELD, BALL_R, CUP_R, newBall, step, launch, speed, BallState } from './engine';
import { HOLES } from './holes';
import { botShot } from './bot';
import { Difficulty } from '../../game/types';
import './minigolf.css';

type Turn = 0 | 1; // 0 = human, 1 = bot
const PLAYERS = ['You', 'Bot'];

export default function MiniGolf() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [started, setStarted] = useState(false);
  const [holeIdx, setHoleIdx] = useState(0);
  const [turn, setTurn] = useState<Turn>(0);
  const [strokes, setStrokes] = useState<[number, number]>([0, 0]);
  const [holeScores, setHoleScores] = useState<[number[], number[]]>([[], []]);
  const [done, setDone] = useState<[boolean, boolean]>([false, false]);
  const [matchOver, setMatchOver] = useState(false);
  const [banner, setBanner] = useState('');

  const hole = HOLES[holeIdx];
  const ballRef = useRef<BallState>(newBall(hole.tee));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const aimingRef = useRef(false);
  const turnRef = useRef<Turn>(0);
  const animRef = useRef<number>(0);

  turnRef.current = turn;

  // Reset ball to tee only on new hole / restart (never random).
  const resetBall = useCallback(() => {
    ballRef.current = newBall(HOLES[holeIdx].tee);
  }, [holeIdx]);

  useEffect(() => { resetBall(); }, [holeIdx, resetBall]);

  const draw = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const sx = c.width / FIELD.w; const sy = c.height / FIELD.h;
    ctx.clearRect(0, 0, c.width, c.height);
    // green
    const g = ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, '#1f8a4c'); g.addColorStop(1, '#136b39');
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    // walls
    ctx.fillStyle = '#caa45a';
    for (const w of hole.walls) ctx.fillRect(w.x*sx, w.y*sy, w.w*sx, w.h*sy);
    // cup
    ctx.beginPath(); ctx.arc(hole.cup.x*sx, hole.cup.y*sy, CUP_R*sx, 0, Math.PI*2);
    ctx.fillStyle = '#0a0a0a'; ctx.fill();
    // flag
    ctx.strokeStyle = '#eee'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(hole.cup.x*sx, hole.cup.y*sy); ctx.lineTo(hole.cup.x*sx, (hole.cup.y-34)*sy); ctx.stroke();
    ctx.fillStyle = '#ff3d4d'; ctx.beginPath();
    ctx.moveTo(hole.cup.x*sx, (hole.cup.y-34)*sy); ctx.lineTo((hole.cup.x+18)*sx, (hole.cup.y-28)*sy); ctx.lineTo(hole.cup.x*sx, (hole.cup.y-22)*sy); ctx.fill();
    // tee marker
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(hole.tee.x*sx, hole.tee.y*sy, BALL_R*sx, 0, Math.PI*2); ctx.stroke();
    // ball
    const b = ballRef.current;
    if (!b.sunk) {
      ctx.beginPath(); ctx.arc(b.pos.x*sx, b.pos.y*sy, BALL_R*sx, 0, Math.PI*2);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.stroke();
    }
    // aim line
    if (aimingRef.current && dragRef.current && turnRef.current === 0) {
      const d = dragRef.current;
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(b.pos.x*sx, b.pos.y*sy);
      ctx.lineTo((b.pos.x - d.x)*sx, (b.pos.y - d.y)*sy); ctx.stroke();
    }
  }, [hole]);

  // Physics loop
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      const b = ballRef.current;
      if (b.moving && !b.sunk) {
        let nb = b;
        for (let i = 0; i < 2; i++) nb = step(nb, hole);
        ballRef.current = nb;
        if (!nb.moving) onBallStopped(nb);
      }
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hole, draw]);

  // When a ball stops, lock score if sunk, then pass turn.
  const onBallStopped = (b: BallState) => {
    const who = turnRef.current;
    if (b.sunk) {
      setDone((d) => { const n: [boolean, boolean] = [...d]; n[who] = true; return n; });
      setBanner(PLAYERS[who] + ' sunk it!');
    }
    setTimeout(() => nextTurn(), 600);
  };

  const nextTurn = () => {
    setDone((d) => {
      if (d[0] && d[1]) { finishHole(); return d; }
      // pass to the other player if they are not done; else same player continues
      setTurn((t) => {
        const other = (t === 0 ? 1 : 0) as Turn;
        const next = d[other] ? t : other;
        if (next === 1) scheduleBot();
        return next;
      });
      return d;
    });
  };

  const finishHole = () => {
    setHoleScores((hs) => {
      const n: [number[], number[]] = [[...hs[0]], [...hs[1]]];
      n[0].push(strokes[0]); n[1].push(strokes[1]);
      return n;
    });
    setTimeout(() => {
      if (holeIdx + 1 >= HOLES.length) { setMatchOver(true); }
      else {
        setHoleIdx((h) => h + 1);
        setStrokes([0, 0]); setDone([false, false]); setTurn(0); setBanner('');
      }
    }, 900);
  };

  const doShot = (dragX: number, dragY: number, who: Turn) => {
    ballRef.current = launch(ballRef.current, dragX, dragY);
    setStrokes((s) => { const n: [number, number] = [...s]; n[who] += 1; return n; });
  };

  const scheduleBot = () => {
    setTimeout(() => {
      const shot = botShot(ballRef.current, HOLES[holeIdx], difficulty);
      doShot(shot.dragX, shot.dragY, 1);
    }, 700);
  };

  // Pointer input (human only, on their turn, ball stopped)
  const canShoot = () => turn === 0 && !ballRef.current.moving && !ballRef.current.sunk && !matchOver;
  const toLogical = (e: React.PointerEvent) => {
    const c = canvasRef.current!; const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * FIELD.w, y: (e.clientY - r.top) / r.height * FIELD.h };
  };
  const onDown = (e: React.PointerEvent) => {
    if (!canShoot()) return; aimingRef.current = true;
    const p = toLogical(e); const b = ballRef.current;
    dragRef.current = { x: p.x - b.pos.x, y: p.y - b.pos.y };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!aimingRef.current) return; const p = toLogical(e); const b = ballRef.current;
    dragRef.current = { x: p.x - b.pos.x, y: p.y - b.pos.y };
  };
  const onUp = () => {
    if (!aimingRef.current || !dragRef.current) return;
    aimingRef.current = false;
    const d = dragRef.current; dragRef.current = null;
    if (Math.hypot(d.x, d.y) > 6) doShot(d.x, d.y, 0);
  };

  const restart = () => {
    setHoleIdx(0); setStrokes([0,0]); setHoleScores([[],[]]); setDone([false,false]);
    setTurn(0); setMatchOver(false); setBanner(''); ballRef.current = newBall(HOLES[0].tee);
  };

  const total = (i: Turn) => holeScores[i].reduce((a,b)=>a+b,0) + strokes[i];

  if (!started) {
    return (
      <div className='mg-wrap'>
        <div className='mg-start'>
          <h1>Mini Golf</h1>
          <p>Best total across {HOLES.length} holes wins. Drag back from the ball to aim, release to shoot.</p>
          <div className='mg-diff'>
            {(['easy','medium','hard'] as Difficulty[]).map((d) => (
              <button key={d} className={'mg-diff-btn ' + (difficulty===d?'on':'')} onClick={() => setDifficulty(d)}>{d}</button>
            ))}
          </div>
          <button className='mg-play' onClick={() => setStarted(true)}>Start Match</button>
        </div>
      </div>
    );
  }

  if (matchOver) {
    const a = holeScores[0].reduce((x,y)=>x+y,0);
    const b = holeScores[1].reduce((x,y)=>x+y,0);
    const youWin = a <= b;
    return (
      <div className='mg-wrap'>
        <div className='mg-end'>
          <div className='mg-trophy'>{youWin ? '🏆' : '🤖'}</div>
          <h1>{youWin ? 'You win!' : 'Bot wins'}</h1>
          <p>Final — You: {a} strokes · Bot: {b} strokes</p>
          <button className='mg-play' onClick={restart}>Play again</button>
        </div>
      </div>
    );
  }

  return (
    <div className='mg-wrap'>
      <div className='mg-hud'>
        <div className='mg-hole'>Hole {holeIdx+1}/{HOLES.length} · Par {hole.par}</div>
        <div className='mg-turn'>{turn===0 ? 'Your turn' : 'Bot is putting...'}</div>
      </div>
      <div className='mg-scores'>
        <div className={'mg-pscore ' + (turn===0?'active':'')}>You<span>{total(0)}</span></div>
        <div className={'mg-pscore ' + (turn===1?'active':'')}>Bot<span>{total(1)}</span></div>
      </div>
      <canvas ref={canvasRef} width={400} height={560} className='mg-canvas'
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} />
      {banner && <div className='mg-banner'>{banner}</div>}
      <div className='mg-help'>Drag back from the ball and release to shoot. Works with touch too.</div>
    </div>
  );
}
