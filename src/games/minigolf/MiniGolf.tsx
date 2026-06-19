import { useEffect, useRef, useState, useCallback } from 'react';
import { FIELD, BALL_R, CUP_R, newBall, step, launch } from './engine';
import type { BallState } from './engine';
import { HOLES } from './holes';
import { botShot } from './bot';
import type { Difficulty } from '../../game/types';
import './minigolf.css';

type Turn = 0 | 1;
const PLAYERS = ['You', 'Bot'];

export default function MiniGolf() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [started, setStarted] = useState(false);
  const [holeIdx, setHoleIdx] = useState(0);
  const [turn, setTurn] = useState<Turn>(0);
  const [strokes, setStrokes] = useState<[number, number]>([0, 0]);
  const [holeScores, setHoleScores] = useState<[number, number][]>([]);
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
  const botTimerRef = useRef<number | null>(null);
  const transitionRef = useRef(false);
  const onBallStoppedRef = useRef<(b: BallState) => void>(() => {});

  turnRef.current = turn;

  // Reset ball to the current hole's tee. Called on new hole + restart only.
  const resetBall = useCallback(() => {
    ballRef.current = newBall(HOLES[holeIdx].tee);
  }, [holeIdx]);

  useEffect(() => { resetBall(); }, [resetBall]);

  const clearBotTimer = () => {
    if (botTimerRef.current !== null) {
      clearTimeout(botTimerRef.current);
      botTimerRef.current = null;
    }
  };

  // ---- rendering ----
  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const sx = c.width / FIELD.w;
    const sy = c.height / FIELD.h;
    ctx.clearRect(0, 0, c.width, c.height);
    // green felt
    const g = ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, '#1f8a4c');
    g.addColorStop(1, '#0b6339');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
    // walls
    ctx.fillStyle = '#caa45a';
    for (const w of hole.walls) {
      ctx.fillRect(w.x * sx, w.y * sy, w.w * sx, w.h * sy);
    }
    // cup
    ctx.beginPath();
    ctx.arc(hole.cup.x * sx, hole.cup.y * sy, CUP_R * sx, 0, 2 * Math.PI);
    ctx.fillStyle = '#05241a';
    ctx.fill();
    // flag
    ctx.strokeStyle = '#e8eefc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hole.cup.x * sx, hole.cup.y * sy);
    ctx.lineTo(hole.cup.x * sx, (hole.cup.y - 34) * sy);
    ctx.stroke();
    ctx.fillStyle = '#ff4d5e';
    ctx.beginPath();
    ctx.moveTo(hole.cup.x * sx, (hole.cup.y - 34) * sy);
    ctx.lineTo((hole.cup.x + 20) * sx, (hole.cup.y - 28) * sy);
    ctx.lineTo(hole.cup.x * sx, (hole.cup.y - 22) * sy);
    ctx.closePath();
    ctx.fill();
    // ball
    const b = ballRef.current;
    if (!b.sunk) {
      ctx.beginPath();
      ctx.arc(b.pos.x * sx, b.pos.y * sy, BALL_R * sx, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(120,160,255,0.8)';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    // aim line (human only, while dragging)
    if (aimingRef.current && dragRef.current && !b.sunk) {
      const d = dragRef.current;
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(b.pos.x * sx, b.pos.y * sy);
      ctx.lineTo(d.x * sx, d.y * sy);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [hole]);

  // ---- physics loop ----
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      const b = ballRef.current;
      if (b.moving && !b.sunk) {
        let nb = b;
        for (let i = 0; i < 2; i++) nb = step(nb, hole);
        ballRef.current = nb;
        if (!nb.moving) onBallStoppedRef.current(nb);
      }
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hole, draw]);

  // ---- turn / hole flow (no side-effects inside state updaters) ----
  const onBallStopped = (b: BallState) => {
    if (transitionRef.current) return;
    const who = turnRef.current;
    if (b.sunk) {
      setBanner(PLAYERS[who] + ' sunk it!');
      setDone((d) => {
        const n: [boolean, boolean] = [d[0], d[1]];
        n[who] = true;
        return n;
      });
    }
    transitionRef.current = true;
    window.setTimeout(advanceTurn, 650);
  };
  onBallStoppedRef.current = onBallStopped;

  // Decide what happens after a shot settles. Pure read of refs/latest state.
  const advanceTurn = () => {
    transitionRef.current = false;
    setDone((d) => {
      const bothDone = d[0] && d[1];
      if (bothDone) {
        // schedule hole completion outside the updater
        window.setTimeout(finishHole, 0);
        return d;
      }
      const cur = turnRef.current;
      const other: Turn = cur === 0 ? 1 : 0;
      // If the other player already finished this hole, keep shooting; else pass.
      const next: Turn = d[other] ? cur : other;
      window.setTimeout(() => setTurn(next), 0);
      return d;
    });
  };

  const finishHole = () => {
    setHoleScores((prev) => {
      const next = prev.slice() as [number, number][];
      next[holeIdx] = [strokesRef.current[0], strokesRef.current[1]];
      return next;
    });
    setBanner('');
    window.setTimeout(() => {
      if (holeIdx + 1 >= HOLES.length) {
        setMatchOver(true);
      } else {
        setHoleIdx((h) => h + 1);
        setStrokes([0, 0]);
        setDone([false, false]);
        setTurn(0);
        setBanner('');
      }
    }, 900);
  };

  // keep a live ref of strokes for finishHole's score snapshot
  const strokesRef = useRef<[number, number]>([0, 0]);
  strokesRef.current = strokes;

  // ---- shooting ----
  const doShot = (dragX: number, dragY: number, who: Turn) => {
    ballRef.current = launch(ballRef.current, dragX, dragY);
    setStrokes((s) => {
      const n: [number, number] = [s[0], s[1]];
      n[who] += 1;
      return n;
    });
  };

  // Bot plays automatically when it is its turn and not done.
  useEffect(() => {
    if (!started || matchOver) return;
    if (turn !== 1) return;
    if (done[1]) return;
    if (ballRef.current.sunk || ballRef.current.moving) return;
    clearBotTimer();
    botTimerRef.current = window.setTimeout(() => {
      botTimerRef.current = null;
      if (turnRef.current !== 1) return;
      const b = ballRef.current;
      if (b.sunk || b.moving) return;
      const shot = botShot(b, HOLES[holeIdx], difficulty);
      doShot(shot.dragX, shot.dragY, 1);
    }, 700);
    return () => clearBotTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, done, holeIdx, started, matchOver, difficulty]);

  // ---- pointer input (human only, on their turn, ball stopped) ----
  const canShoot = () =>
    turn === 0 && !ballRef.current.moving && !ballRef.current.sunk && !matchOver && !done[0];

  const toLogical = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * FIELD.w,
      y: ((e.clientY - r.top) / r.height) * FIELD.h,
    };
  };

  const onDown = (e: React.PointerEvent) => {
    if (!canShoot()) return;
    aimingRef.current = true;
    const p2 = toLogical(e);
    dragRef.current = { x: p2.x, y: p2.y };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!aimingRef.current) return;
    const p2 = toLogical(e);
    dragRef.current = { x: p2.x, y: p2.y };
  };
  const onUp = () => {
    if (!aimingRef.current || !dragRef.current) return;
    aimingRef.current = false;
    const b = ballRef.current;
    const d = dragRef.current;
    dragRef.current = null;
    const dragX = d.x - b.pos.x;
    const dragY = d.y - b.pos.y;
    if (Math.hypot(dragX, dragY) > 6) doShot(dragX, dragY, 0);
  };

  const restart = () => {
    clearBotTimer();
    transitionRef.current = false;
    setHoleIdx(0);
    setStrokes([0, 0]);
    setHoleScores([]);
    setDone([false, false]);
    setTurn(0);
    setMatchOver(false);
    setBanner('');
    ballRef.current = newBall(HOLES[0].tee);
  };

  const total = (i: Turn) =>
    holeScores.reduce((a, b) => a + (b ? b[i] : 0), 0) + strokes[i];

  // ---- start screen ----
  if (!started) {
    return (
      <div className="mg-wrap">
        <div className="mg-start">
          <h1>Mini Golf</h1>
          <p>Best total across {HOLES.length} holes wins. Drag back from the ball to aim, release to shoot.</p>
          <div className="mg-diff">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                className={'mg-diff-btn' + (difficulty === d ? ' active' : '')}
                onClick={() => setDifficulty(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <button className="mg-play" onClick={() => setStarted(true)}>
            Start Match
          </button>
        </div>
      </div>
    );
  }

  // ---- end screen ----
  if (matchOver) {
    const a = total(0);
    const b = total(1);
    const youWin = a <= b;
    return (
      <div className="mg-wrap">
        <div className="mg-end">
          <div className={'mg-trophy' + (youWin ? '' : ' lose')} />
          <h1>{youWin ? 'You win!' : 'Bot wins'}</h1>
          <p>Final — You {a} strokes · Bot {b} strokes</p>
          <button className="mg-play" onClick={restart}>
            Play again
          </button>
        </div>
      </div>
    );
  }

  // ---- play screen ----
  return (
    <div className="mg-wrap">
      <div className="mg-hud">
        <div className="mg-hole">Hole {holeIdx + 1}/{HOLES.length} · Par {hole.par}</div>
        <div className="mg-turn">{turn === 0 ? 'Your turn' : 'Bot is putting...'}</div>
      </div>
      <div className="mg-scores">
        <div className={'mg-pscore' + (turn === 0 ? ' active' : '')}>
          You <span>{total(0)}</span>
        </div>
        <div className={'mg-pscore' + (turn === 1 ? ' active' : '')}>
          Bot <span>{total(1)}</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={560}
        className="mg-canvas"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      />
      {banner && <div className="mg-banner">{banner}</div>}
    </div>
  );
}
