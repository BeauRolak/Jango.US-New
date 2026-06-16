import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  STAGE, BLOCK_H, baseBlock, place, SPEED_BY_DIFF, colorFor,
} from './engine';
import type { Block, Difficulty } from './engine';
import './stacktower.css';

export default function StackTower() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const stackRef = useRef<Block[]>([baseBlock()]);
  const moveXRef = useRef<number>(0);
  const dirRef = useRef<number>(1);
  const speedRef = useRef<number>(SPEED_BY_DIFF.medium);
  const widthRef = useRef<number>(stackRef.current[0].w);
  const playingRef = useRef<boolean>(true);
  const camRef = useRef<number>(0); // camera vertical offset

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [height, setHeight] = useState(0);
  const [over, setOver] = useState(false);
  const [perfectStreak, setPerfectStreak] = useState(0);

  const reset = useCallback((diff: Difficulty) => {
    stackRef.current = [baseBlock()];
    widthRef.current = stackRef.current[0].w;
    speedRef.current = SPEED_BY_DIFF[diff];
    moveXRef.current = 0;
    dirRef.current = 1;
    playingRef.current = true;
    camRef.current = 0;
    setHeight(0); setOver(false); setPerfectStreak(0);
  }, []);

  const drop = useCallback(() => {
    if (!playingRef.current) return;
    const stack = stackRef.current;
    const prev = stack[stack.length - 1];
    const res = place(moveXRef.current, widthRef.current, prev, stack.length);
    if (res.gameOver || !res.placed) {
      playingRef.current = false;
      setOver(true);
      return;
    }
    stack.push(res.placed);
    widthRef.current = res.placed.w;
    setHeight(stack.length - 1);
    setPerfectStreak((s) => (res.perfect ? s + 1 : 0));
    dirRef.current = Math.random() < 0.5 ? 1 : -1;
    moveXRef.current = dirRef.current > 0 ? 0 : STAGE.w - widthRef.current;
  }, []);

  useEffect(() => { speedRef.current = SPEED_BY_DIFF[difficulty]; }, [difficulty]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const drawBlock = (g2d: CanvasRenderingContext2D, x: number, y: number, w: number, color: string) => {
      g2d.fillStyle = color;
      g2d.shadowColor = color; g2d.shadowBlur = 12;
      g2d.fillRect(x, y, w, BLOCK_H - 2);
      g2d.shadowBlur = 0;
      g2d.fillStyle = 'rgba(255,255,255,0.18)';
      g2d.fillRect(x, y, w, 5);
      g2d.fillStyle = 'rgba(0,0,0,0.22)';
      g2d.fillRect(x, y + BLOCK_H - 7, w, 5);
    };

    const loop = () => {
      if (playingRef.current) {
        moveXRef.current += dirRef.current * speedRef.current;
        if (moveXRef.current <= 0) { moveXRef.current = 0; dirRef.current = 1; }
        if (moveXRef.current + widthRef.current >= STAGE.w) {
          moveXRef.current = STAGE.w - widthRef.current; dirRef.current = -1;
        }
      }
      const stack = stackRef.current;
      const stackPix = stack.length * BLOCK_H;
      const targetCam = Math.max(0, stackPix - STAGE.h * 0.55);
      camRef.current += (targetCam - camRef.current) * 0.1;

      ctx.fillStyle = '#0a1430';
      ctx.fillRect(0, 0, STAGE.w, STAGE.h);
      const grad = ctx.createLinearGradient(0, 0, 0, STAGE.h);
      grad.addColorStop(0, 'rgba(40,80,160,0.25)');
      grad.addColorStop(1, 'rgba(5,8,18,0)');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, STAGE.w, STAGE.h);

      const baseY = STAGE.h - BLOCK_H;
      for (let i = 0; i < stack.length; i++) {
        const b = stack[i];
        const y = baseY - i * BLOCK_H + camRef.current;
        if (y > STAGE.h || y < -BLOCK_H) continue;
        drawBlock(ctx, b.x, y, b.w, colorFor(b.colorIdx));
      }
      if (playingRef.current) {
        const y = baseY - stack.length * BLOCK_H + camRef.current;
        drawBlock(ctx, moveXRef.current, y, widthRef.current, colorFor(stack.length));
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    moveXRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const onTap = useCallback(() => {
    if (over) return;
    drop();
  }, [over, drop]);

  const startNew = () => reset(difficulty);

  return (
    <div className={'st-wrap'}>
      <div className={'st-head'}>
        <Link to={'/games'} className={'st-back'}>{'\u2190 Back'}</Link>
        <h1 className={'st-title'}>{'Stack Tower'}</h1>
        <div className={'st-diff'}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button key={d} className={'st-diff-btn' + (difficulty === d ? ' active' : '')}
              onClick={() => { setDifficulty(d); reset(d); }}>{d}</button>
          ))}
        </div>
      </div>
      <div className={'st-hud'}>
        <span className={'st-h'}>{'Height ' + height}</span>
        {perfectStreak > 1 && <span className={'st-streak'}>{'Perfect x' + perfectStreak}</span>}
      </div>
      <div className={'st-stage-wrap'} onPointerDown={onTap}>
        <canvas ref={canvasRef} width={STAGE.w} height={STAGE.h} className={'st-canvas'} />
        {over && (
          <div className={'st-overlay'}>
            <div className={'st-card'}>
              <div className={'st-result'}>{'Tower Toppled'}</div>
              <div className={'st-final'}>{'Height reached: ' + height}</div>
              <button className={'st-play'} onClick={startNew}>{'Play again'}</button>
              <Link to={'/games'} className={'st-leave'}>{'Back to games'}</Link>
            </div>
          </div>
        )}
      </div>
      <p className={'st-hint'}>{'Tap anywhere to drop the block. Line it up perfectly to keep your width.'}</p>
    </div>
  );
}
