import { useState, useRef, useCallback } from 'react';
import { MatchSetup, MatchResult, GameTopBar } from '../shared/GameShell';
import { useFeedback } from '../../components/Juice';
import './rps.css';

type Move = 'rock' | 'paper' | 'scissors';
type Difficulty = 'easy' | 'medium' | 'hard';
type Outcome = 'win' | 'lose' | 'tie';
type Phase = 'setup' | 'playing' | 'results';

const MOVES: Move[] = ['rock', 'paper', 'scissors'];
const BEATS: Record<Move, Move> = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
const COUNTER: Record<Move, Move> = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
const ACCENT = '#ff8a2b';

function judge(me: Move, opp: Move): Outcome { if (me === opp) return 'tie'; return BEATS[me] === opp ? 'win' : 'lose'; }

function Glyph({ m }: { m: Move | null }) {
  if (!m) return <svg viewBox="0 0 48 48" className="rps2-svg"><circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="4 5" /></svg>;
  if (m === 'rock') return <svg viewBox="0 0 48 48" className="rps2-svg"><path d="M11 27q-2-9 8-11 4-6 12-3 8-1 8 8 4 2 2 9-1 8-12 9-12 1-18-3-2-3 0-9z" fill="currentColor" /></svg>;
  if (m === 'paper') return <svg viewBox="0 0 48 48" className="rps2-svg"><path d="M15 7h13l8 8v26H15z" fill="currentColor" /><path d="M28 7v8h8" fill="rgba(0,0,0,.25)" /><g stroke="rgba(0,0,0,.3)" strokeWidth="2"><line x1="19" y1="22" x2="32" y2="22" /><line x1="19" y1="28" x2="32" y2="28" /><line x1="19" y1="34" x2="28" y2="34" /></g></svg>;
  return <svg viewBox="0 0 48 48" className="rps2-svg" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><circle cx="14" cy="34" r="6" /><circle cx="27" cy="35" r="6" /><line x1="18" y1="30" x2="41" y2="9" /><line x1="23" y1="31" x2="41" y2="19" /></svg>;
}

export default function RPS() {
  const { fire } = useFeedback();
  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [target, setTarget] = useState(3);
  const [entry, setEntry] = useState(5);
  const [me, setMe] = useState(0);
  const [opp, setOpp] = useState(0);
  const [myMove, setMyMove] = useState<Move | null>(null);
  const [oppMove, setOppMove] = useState<Move | null>(null);
  const [result, setResult] = useState<Outcome | null>(null);
  const [revealing, setRevealing] = useState(false);
  const history = useRef<Move[]>([]);
  const lock = useRef(false);

  const matchOver = me >= target || opp >= target;

  const start = () => { setMe(0); setOpp(0); setMyMove(null); setOppMove(null); setResult(null); history.current = []; lock.current = false; setPhase('playing'); fire('match_start', 'First to ' + target, null); };
  const newSetup = () => setPhase('setup');

  const botPick = useCallback((): Move => {
    const rate = difficulty === 'hard' ? 0.85 : difficulty === 'medium' ? 0.5 : 0;
    if (history.current.length >= 2 && Math.random() < rate) {
      const counts: Record<Move, number> = { rock: 0, paper: 0, scissors: 0 };
      for (const m of history.current) counts[m]++;
      let likely: Move = 'rock'; for (const m of MOVES) if (counts[m] > counts[likely]) likely = m;
      return COUNTER[likely];
    }
    return MOVES[Math.floor(Math.random() * 3)];
  }, [difficulty]);

  const play = useCallback((move: Move) => {
    if (lock.current || matchOver) return;
    lock.current = true; setRevealing(true); setMyMove(move); setOppMove(null); setResult(null);
    const o = botPick(); history.current.push(move); fire('tap', undefined, null);
    setTimeout(() => {
      setOppMove(o); const r = judge(move, o); setResult(r);
      let nm = me, no = opp;
      if (r === 'win') { nm = me + 1; setMe(nm); fire('success', undefined, null); }
      else if (r === 'lose') { no = opp + 1; setOpp(no); }
      setRevealing(false); lock.current = false;
      if (nm >= target || no >= target) setTimeout(() => { fire(nm > no ? 'match_win' : 'match_loss', undefined, null); setPhase('results'); }, 900);
    }, 650);
  }, [botPick, matchOver, me, opp, target, fire]);

  if (phase === 'setup') {
    return (
      <MatchSetup game="Rock Paper Scissors" icon="Swords" accent={ACCENT}
        blurb="Read the bot and out-throw it. First to your target wins."
        difficulty={difficulty} onDifficulty={(d) => { setDifficulty(d as Difficulty); fire('tap'); }}
        difficulties={[{ id: 'easy', label: 'Easy', sub: 'Random' }, { id: 'medium', label: 'Medium', sub: 'Reads patterns' }, { id: 'hard', label: 'Hard', sub: 'Predicts you' }]}
        extras={[{ key: 'len', label: 'Match length', cols: true, value: String(target), onChange: (v) => { setTarget(Number(v)); fire('tap'); }, options: [{ id: '3', label: 'First to 3' }, { id: '5', label: 'First to 5' }, { id: '7', label: 'First to 7' }] }]}
        entry={entry} onEntry={(n) => { setEntry(n); fire('tap'); }} onStart={start} />
    );
  }
  if (phase === 'results') {
    const youWin = me > opp;
    return (
      <MatchResult accent={ACCENT} outcome={youWin ? 'win' : 'lose'}
        title={youWin ? 'You win the match!' : 'Bot wins the match'} sub={`Final ${me} – ${opp}`}
        entry={entry} onRematch={start} onNewSetup={newSetup} />
    );
  }

  const banner = result === 'win' ? 'You won the round' : result === 'lose' ? 'Bot won the round' : result === 'tie' ? 'Tie — go again' : 'Pick your move';
  return (
    <div className="rps2-wrap" style={{ ['--acc' as any]: ACCENT }}>
      <GameTopBar title="Rock Paper Scissors" sub={`First to ${target}`} accent={ACCENT} onBack={newSetup}
        right={<span className="rps2-mini">{me} – {opp}</span>} />
      <div className="rps2-arena">
        <div className={'rps2-hand you' + (revealing ? ' shake' : '') + (result === 'win' ? ' won' : '')}><Glyph m={myMove} /></div>
        <div className="rps2-mid">{banner}</div>
        <div className={'rps2-hand bot' + (revealing ? ' shake' : '') + (result === 'lose' ? ' won' : '')}><Glyph m={oppMove} /></div>
      </div>
      <div className="rps2-controls">
        {MOVES.map((m) => (
          <button key={m} className={'rps2-choice' + (myMove === m ? ' active' : '')} disabled={revealing} onClick={() => play(m)}>
            <span className="rps2-choice__ic"><Glyph m={m} /></span>
            <span className="rps2-choice__lb">{m}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
