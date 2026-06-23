import { useEffect, useRef, useState, useCallback } from 'react';
import { STAGE, BLOCK_H, baseBlock, place, SPEED_BY_DIFF, colorFor } from './engine';
import type { Block, Difficulty } from './engine';
import { MatchSetup, MatchResult, GameTopBar } from '../shared/GameShell';
import { useFeedback } from '../../components/Juice';
import './stacktower.css';

type Phase = 'setup' | 'playing' | 'results';
const ACCENT = '#33e0c0';
const TARGET: Record<Difficulty, number> = { easy: 8, medium: 12, hard: 16 };

export default function StackTower() {
  const { fire } = useFeedback();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const stackRef = useRef<Block[]>([baseBlock()]);
  const moveXRef = useRef(0);
  const dirRef = useRef(1);
  const speedRef = useRef(SPEED_BY_DIFF.medium);
  const widthRef = useRef(stackRef.current[0].w);
  const playingRef = useRef(false);
  const camRef = useRef(0);

  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [entry, setEntry] = useState(5);
  const [height, setHeight] = useState(0);
  const [over, setOver] = useState(false);
  const [streak, setStreak] = useState(0);

  const target = TARGET[difficulty];

  const start = () => {
    stackRef.current = [baseBlock()]; widthRef.current = stackRef.current[0].w;
    speedRef.current = SPEED_BY_DIFF[difficulty]; moveXRef.current = 0; dirRef.current = 1;
    playingRef.current = true; camRef.current = 0;
    setHeight(0); setOver(false); setStreak(0); setPhase('playing');
    fire('match_start', 'Reach ' + target + ' to win', null);
  };
  const newSetup = () => { playingRef.current = false; setPhase('setup'); };

  const drop = useCallback(() => {
    if (!playingRef.current) return;
    const stack = stackRef.current; const prev = stack[stack.length - 1];
    const res = place(moveXRef.current, widthRef.current, prev, stack.length);
    if (res.gameOver || !res.placed) {
      playingRef.current = false; setOver(true);
      const h = stack.length - 1;
      setTimeout(() => { fire(h >= target ? 'match_win' : 'match_loss', undefined, null); setPhase('results'); }, 700);
      return;
    }
    stack.push(res.placed); widthRef.current = res.placed.w;
    setHeight(stack.length - 1);
    setStreak((s) => (res.perfect ? s + 1 : 0));
    fire(res.perfect ? 'success' : 'tap', undefined, null);
    dirRef.current = Math.random() < 0.5 ? 1 : -1;
    moveXRef.current = dirRef.current > 0 ? 0 : STAGE.w - widthRef.current;
  }, [fire, target]);

  // loop (runs during play)
  useEffect(() => {
    if (phase !== 'playing') return;
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const drawBlock = (x: number, y: number, w: number, color: string) => {
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 12; ctx.fillRect(x, y, w, BLOCK_H - 2); ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x, y, w, 5);
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x, y + BLOCK_H - 7, w, 5);
    };
    const loop = () => {
      if (playingRef.current) {
        moveXRef.current += dirRef.current * speedRef.current;
        if (moveXRef.current <= 0) { moveXRef.current = 0; dirRef.current = 1; }
        if (moveXRef.current + widthRef.current >= STAGE.w) { moveXRef.current = STAGE.w - widthRef.current; dirRef.current = -1; }
      }
      const stack = stackRef.current; const stackPix = stack.length * BLOCK_H;
      const targetCam = Math.max(0, stackPix - STAGE.h * 0.55);
      camRef.current += (targetCam - camRef.current) * 0.1;
      ctx.fillStyle = '#0a1430'; ctx.fillRect(0, 0, STAGE.w, STAGE.h);
      const grad = ctx.createLinearGradient(0, 0, 0, STAGE.h);
      grad.addColorStop(0, 'rgba(40,120,120,0.25)'); grad.addColorStop(1, 'rgba(5,8,18,0)');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, STAGE.w, STAGE.h);
      const baseY = STAGE.h - BLOCK_H;
      for (let i = 0; i < stack.length; i++) { const b = stack[i]; const y = baseY - i * BLOCK_H + camRef.current; if (y > STAGE.h || y < -BLOCK_H) continue; drawBlock(b.x, y, b.w, colorFor(b.colorIdx)); }
      if (playingRef.current) { const y = baseY - stack.length * BLOCK_H + camRef.current; drawBlock(moveXRef.current, y, widthRef.current, colorFor(stack.length)); }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  if (phase === 'setup') {
    return (
      <MatchSetup game="Stack Tower" icon="Building" accent={ACCENT}
        blurb={`Drop blocks dead-center to keep your width. Reach the target height to win.`}
        difficulty={difficulty} onDifficulty={(d) => { setDifficulty(d as Difficulty); fire('tap'); }}
        difficulties={[{ id: 'easy', label: 'Easy', sub: 'Reach 8' }, { id: 'medium', label: 'Medium', sub: 'Reach 12' }, { id: 'hard', label: 'Hard', sub: 'Reach 16' }]}
        entry={entry} onEntry={(n) => { setEntry(n); fire('tap'); }} onStart={start} startLabel="Start run" />
    );
  }
  if (phase === 'results') {
    const win = height >= target;
    return (
      <MatchResult accent={ACCENT} outcome={win ? 'win' : 'lose'}
        title={win ? 'Target reached!' : 'Tower toppled'} sub={`Height ${height} / ${target}`}
        entry={win ? entry : 0} onRematch={start} onNewSetup={newSetup} />
    );
  }

  return (
    <div className="st2-wrap" style={{ ['--acc' as any]: ACCENT }}>
      <GameTopBar title="Stack Tower" sub={`Height ${height} / ${target}`} accent={ACCENT} onBack={newSetup}
        right={streak > 1 ? <span className="st2-streak">Perfect ×{streak}</span> : null} />
      <div className="st2-stage" onPointerDown={() => !over && drop()}>
        <canvas ref={canvasRef} width={STAGE.w} height={STAGE.h} className="st2-canvas" />
      </div>
      <p className="st2-hint">Tap anywhere to drop the block. Line it up perfectly to keep your width.</p>
    </div>
  );
}
