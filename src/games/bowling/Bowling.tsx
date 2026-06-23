import { useState, useRef, useEffect, useCallback } from 'react';
import { newPlayer, rollResult, botRoll, frameComplete, totalScore, score, isStrike, isSpare, PIN_LAYOUT } from './engine';
import type { Player, Difficulty, Frame } from './engine';
import { MatchSetup, MatchResult, GameTopBar } from '../shared/GameShell';
import { useFeedback } from '../../components/Juice';
import './bowling.css';

type Phase = 'aim' | 'rolling' | 'between' | 'over';
type Screen = 'setup' | 'playing' | 'results';
const ACCENT = '#ff7a3c';

export default function Bowling() {
  const { fire } = useFeedback();
  const [screen, setScreen] = useState<Screen>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [entry, setEntry] = useState(5);
  const [players, setPlayers] = useState<Player[]>(() => [newPlayer('You', false), newPlayer('CPU', true)]);
  const [turn, setTurn] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('aim');
  const [aim, setAim] = useState(0.08);
  const [, setPower] = useState(0.7);
  const [standing, setStanding] = useState<boolean[]>(() => new Array(10).fill(true));
  const [message, setMessage] = useState('Set your aim and power');
  const powerDir = useRef(1); const powerAnim = useRef<number>(0); const [powerLive, setPowerLive] = useState(0.5); const swinging = useRef(false);

  useEffect(() => {
    if (screen !== 'playing' || phase !== 'aim' || turn !== 0) return;
    swinging.current = true;
    const tick = () => { if (!swinging.current) return; setPowerLive((p) => { let np = p + powerDir.current * 0.022; if (np >= 1) { np = 1; powerDir.current = -1; } if (np <= 0.15) { np = 0.15; powerDir.current = 1; } return np; }); powerAnim.current = requestAnimationFrame(tick); };
    powerAnim.current = requestAnimationFrame(tick);
    return () => { swinging.current = false; cancelAnimationFrame(powerAnim.current); };
  }, [phase, turn, screen]);

  const start = () => { setPlayers([newPlayer('You', false), newPlayer('CPU', true)]); setTurn(0); setFrameIdx(0); setPhase('aim'); setStanding(new Array(10).fill(true)); setAim(0.08); setMessage('Set your aim and power'); setScreen('playing'); fire('match_start', '10 frames', null); };
  const newSetup = () => setScreen('setup');

  const applyRoll = useCallback((pins: number, knockedIdx: number[]) => {
    setStanding((prev) => { const next = [...prev]; knockedIdx.forEach((i) => { next[i] = false; }); return next; });
    setPlayers((prev) => { const np = prev.map((p) => ({ ...p, frames: p.frames.map((f) => [...f]) })); const pl = np[turn]; let f = pl.frames[frameIdx]; if (!f) { f = []; pl.frames[frameIdx] = f; } f.push(pins); return np; });
  }, [turn, frameIdx]);

  const standCount = standing.filter(Boolean).length;
  const chooseKnocked = useCallback((n: number): number[] => { const up = standing.map((s, i) => (s ? i : -1)).filter((i) => i >= 0); const shuffled = [...up].sort(() => Math.random() - 0.5); return shuffled.slice(0, n); }, [standing]);

  const advanceAfterRoll = useCallback(() => {
    setPlayers((prevPlayers) => {
      const pl = prevPlayers[turn]; const f = pl.frames[frameIdx] || []; const done = frameComplete(frameIdx, f);
      setTimeout(() => {
        if (done) {
          setStanding(new Array(10).fill(true));
          if (turn === 0) { setTurn(1); setPhase('between'); setMessage('Bot is bowling…'); }
          else { if (frameIdx >= 9) { setPhase('over'); } else { setTurn(0); setFrameIdx((fi) => fi + 1); setPhase('aim'); setMessage('Your roll — frame ' + (frameIdx + 2)); } }
        } else { setPhase(turn === 0 ? 'aim' : 'between'); if (turn === 0) setMessage('Roll again — knock down the rest'); }
      }, 700);
      return prevPlayers;
    });
  }, [turn, frameIdx]);

  const doPlayerRoll = useCallback(() => {
    if (phase !== 'aim' || turn !== 0) return;
    swinging.current = false; setPhase('rolling'); setMessage('…'); const usedPower = powerLive; setPower(usedPower); fire('tap', undefined, null);
    const pins = rollResult(aim, usedPower, standCount); const knocked = chooseKnocked(pins);
    setTimeout(() => { applyRoll(pins, knocked); const strike = pins === standCount && standCount === 10; setMessage(strike ? 'STRIKE!' : pins === standCount ? 'Spare / clear!' : pins + ' pins'); fire(pins === standCount ? 'success' : 'tap', undefined, null); advanceAfterRoll(); }, 850);
  }, [phase, turn, aim, powerLive, standCount, chooseKnocked, applyRoll, advanceAfterRoll, fire]);

  useEffect(() => {
    if (screen !== 'playing' || turn !== 1 || phase !== 'between') return;
    const t = setTimeout(() => { setPhase('rolling'); const pins = botRoll(difficulty, standCount); const knocked = chooseKnocked(pins); setTimeout(() => { applyRoll(pins, knocked); setMessage('Bot knocked ' + pins); advanceAfterRoll(); }, 700); }, 600);
    return () => clearTimeout(t);
  }, [turn, phase, difficulty, standCount, chooseKnocked, applyRoll, advanceAfterRoll, screen]);

  const youScore = totalScore(players[0].frames);
  const cpuScore = totalScore(players[1].frames);

  useEffect(() => {
    if (screen !== 'playing' || phase !== 'over') return;
    const id = setTimeout(() => { const w = youScore === cpuScore ? 'tie' : youScore > cpuScore ? 'you' : 'cpu'; fire(w === 'you' ? 'match_win' : w === 'cpu' ? 'match_loss' : 'tap', undefined, null); setScreen('results'); }, 700);
    return () => clearTimeout(id);
  }, [phase, screen, youScore, cpuScore, fire]);

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
        blurb="Set your line and power, chase strikes. Highest pinfall after 10 frames wins."
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
      <div className="bw-status">{turn === 0 ? message : 'Bot is bowling…'}</div>
      <div className="bw-lane">
        <div className="bw-pins">{PIN_LAYOUT.map((p, i) => (<div key={i} className={'bw-pin' + (standing[i] ? '' : ' down')} style={{ left: (p.x * 100) + '%', top: (p.y * 100) + '%' }} />))}</div>
        <div className={'bw-ball' + (phase === 'rolling' ? ' roll' : '')} style={{ left: (50 + aim * 40) + '%' }} />
        <div className="bw-aimline" style={{ left: (50 + aim * 40) + '%' }} />
      </div>
      {turn === 0 && phase === 'aim' && (
        <div className="bw-controls">
          <label className="bw-ctl"><span>Aim</span><input type="range" min={-1} max={1} step={0.02} value={aim} onChange={(e) => setAim(parseFloat(e.target.value))} /></label>
          <div className="bw-power"><span>Power</span><div className="bw-power-bar"><div className="bw-power-fill" style={{ width: (powerLive * 100) + '%' }} /></div></div>
          <button className="bw-roll" onClick={doPlayerRoll}>Bowl!</button>
        </div>
      )}
      <div className="bw-scores">
        <div className={'bw-pcard' + (turn === 0 ? ' active' : '')}><div className="bw-pname">You<span>{youScore}</span></div>{renderFrames(players[0])}</div>
        <div className={'bw-pcard' + (turn === 1 ? ' active' : '')}><div className="bw-pname">Bot<span>{cpuScore}</span></div>{renderFrames(players[1])}</div>
      </div>
    </div>
  );
}
