import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './rps.css';

type Move = 'rock' | 'paper' | 'scissors';
type Difficulty = 'easy' | 'medium' | 'hard';
type Outcome = 'win' | 'lose' | 'tie';

const MOVES: Move[] = ['rock', 'paper', 'scissors'];
const EMOJI: Record<Move, string> = { rock: '✊', paper: '✋', scissors: '✌️' };
const BEATS: Record<Move, Move> = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
const COUNTER: Record<Move, Move> = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
const TARGET = 3; // best to 3 wins

function judge(me: Move, opp: Move): Outcome {
  if (me === opp) return 'tie';
  return BEATS[me] === opp ? 'win' : 'lose';
}

export default function RPS() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [meScore, setMeScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [myMove, setMyMove] = useState<Move | null>(null);
  const [oppMove, setOppMove] = useState<Move | null>(null);
  const [result, setResult] = useState<Outcome | null>(null);
  const [revealing, setRevealing] = useState(false);
  const history = useRef<Move[]>([]);
  const lock = useRef(false);

  const matchOver = meScore >= TARGET || oppScore >= TARGET;

  const botPick = useCallback((): Move => {
    // Hard: predict the player's most frequent move and counter it.
    // Medium: do that 50% of the time. Easy: pure random.
    const predictRate = difficulty === 'hard' ? 0.85 : difficulty === 'medium' ? 0.5 : 0;
    if (history.current.length >= 2 && Math.random() < predictRate) {
      const counts: Record<Move, number> = { rock: 0, paper: 0, scissors: 0 };
      for (const m of history.current) counts[m]++;
      let likely: Move = 'rock';
      for (const m of MOVES) if (counts[m] > counts[likely]) likely = m;
      return COUNTER[likely];
    }
    return MOVES[Math.floor(Math.random() * 3)];
  }, [difficulty]);

  const play = useCallback((move: Move) => {
    if (lock.current || matchOver) return;
    lock.current = true;
    setRevealing(true);
    setMyMove(move);
    setOppMove(null);
    setResult(null);
    const opp = botPick();
    history.current.push(move);
    setTimeout(() => {
      setOppMove(opp);
      const r = judge(move, opp);
      setResult(r);
      if (r === 'win') setMeScore((s) => s + 1);
      else if (r === 'lose') setOppScore((s) => s + 1);
      setRevealing(false);
      lock.current = false;
    }, 700);
  }, [botPick, matchOver]);

  const reset = useCallback(() => {
    setMeScore(0);
    setOppScore(0);
    setMyMove(null);
    setOppMove(null);
    setResult(null);
    history.current = [];
    lock.current = false;
  }, []);

  const banner = matchOver
    ? meScore > oppScore ? 'You win the match!' : 'Bot wins the match'
    : result === 'win' ? 'You won the round'
    : result === 'lose' ? 'Bot won the round'
    : result === 'tie' ? 'Tie — go again'
    : 'Pick your move';

  return (
    <div className="rps-wrap">
      <div className="rps-head">
        <Link to="/games" className="rps-back">&larr; Games</Link>
        <h1 className="rps-title">Rock Paper Scissors</h1>
        <div className="rps-diff">
          {(['easy','medium','hard'] as Difficulty[]).map((d) => (
            <button key={d} className={'rps-diff-btn ' + (difficulty===d?'active':'')} onClick={() => { setDifficulty(d); reset(); }}>{d}</button>
          ))}
        </div>
      </div>

      <div className="rps-score">
        <div className="rps-score-box you"><span>You</span><strong>{meScore}</strong></div>
        <div className="rps-vs">first to {TARGET}</div>
        <div className="rps-score-box bot"><span>Bot</span><strong>{oppScore}</strong></div>
      </div>

      <div className="rps-arena">
        <div className={'rps-hand ' + (revealing ? 'shake' : '')}>{myMove ? EMOJI[myMove] : '❓'}</div>
        <div className="rps-mid">{banner}</div>
        <div className={'rps-hand flip ' + (revealing ? 'shake' : '')}>{oppMove ? EMOJI[oppMove] : '❓'}</div>
      </div>

      {!matchOver && (
        <div className="rps-controls">
          {MOVES.map((m) => (
            <button key={m} className="rps-choice" disabled={revealing} onClick={() => play(m)}>
              <span className="rps-choice-emoji">{EMOJI[m]}</span>
              <span className="rps-choice-label">{m}</span>
            </button>
          ))}
        </div>
      )}

      {matchOver && (
        <div className="rps-controls">
          <button className="rps-play" onClick={reset}>Play again</button>
        </div>
      )}
    </div>
  );
}
