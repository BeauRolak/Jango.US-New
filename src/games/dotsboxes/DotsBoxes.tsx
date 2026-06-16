import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './dotsboxes.css';

// 5x5 dots => 4x4 boxes. Edges keyed as 'h-r-c' (horizontal) or 'v-r-c' (vertical).
const SIZE = 4; // boxes per side
type Player = 1 | 2;
type Difficulty = 'easy' | 'medium' | 'hard';

function hKey(r: number, c: number) { return 'h-' + r + '-' + c; }
function vKey(r: number, c: number) { return 'v-' + r + '-' + c; }

function allEdges(): string[] {
  const e: string[] = [];
  for (let r = 0; r <= SIZE; r++) for (let c = 0; c < SIZE; c++) e.push(hKey(r, c));
  for (let r = 0; r < SIZE; r++) for (let c = 0; c <= SIZE; c++) e.push(vKey(r, c));
  return e;
}

function boxEdges(r: number, c: number): string[] {
  return [hKey(r, c), hKey(r + 1, c), vKey(r, c), vKey(r, c + 1)];
}

// returns number of boxes completed by playing edge (given current set), and which boxes
function boxesClosedBy(edges: Set<string>, edge: string): Array<[number, number]> {
  const closed: Array<[number, number]> = [];
  const test = new Set(edges);
  test.add(edge);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const be = boxEdges(r, c);
      if (be.includes(edge) && be.every((x) => test.has(x))) closed.push([r, c]);
    }
  }
  return closed;
}

// count edges already drawn around a box
function sidesOf(edges: Set<string>, r: number, c: number): number {
  return boxEdges(r, c).filter((x) => edges.has(x)).length;
}

function chooseBotEdge(edges: Set<string>, difficulty: Difficulty): string {
  const free = allEdges().filter((e) => !edges.has(e));
  if (free.length === 0) return '';
  // moves that immediately complete a box
  const completing = free.filter((e) => boxesClosedBy(edges, e).length > 0);
  if (completing.length > 0 && difficulty !== 'easy') return completing[0];
  if (completing.length > 0 && Math.random() < 0.5) return completing[0];
  // safe moves: do not create a 3-sided box for the opponent
  const safe = free.filter((e) => {
    const test = new Set(edges); test.add(e);
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      if (sidesOf(test, r, c) === 3) return false;
    }
    return true;
  });
  const pool = difficulty === 'easy' ? free : (safe.length > 0 ? safe : free);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function DotsBoxes() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [edges, setEdges] = useState<Set<string>>(new Set());
  const [owner, setOwner] = useState<Record<string, Player>>({});
  const [turn, setTurn] = useState<Player>(1);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const lock = useRef(false);

  const totalBoxes = SIZE * SIZE;
  const claimed = Object.keys(owner).length;
  const over = claimed >= totalBoxes;

  const reset = useCallback(() => {
    setEdges(new Set());
    setOwner({});
    setTurn(1);
    setScores([0, 0]);
    lock.current = false;
  }, []);

  const applyEdge = useCallback((edge: string, player: Player) => {
    setEdges((prev) => {
      if (prev.has(edge)) return prev;
      const closed = boxesClosedBy(prev, edge);
      const next = new Set(prev); next.add(edge);
      if (closed.length > 0) {
        setOwner((o) => {
          const no = { ...o };
          for (const [r, c] of closed) no[r + '-' + c] = player;
          return no;
        });
        setScores((s) => player === 1 ? [s[0] + closed.length, s[1]] : [s[0], s[1] + closed.length]);
        // same player goes again
      } else {
        setTurn(player === 1 ? 2 : 1);
      }
      return next;
    });
  }, []);

  const onEdge = useCallback((edge: string) => {
    if (over || turn !== 1 || lock.current || edges.has(edge)) return;
    applyEdge(edge, 1);
  }, [over, turn, edges, applyEdge]);

  useEffect(() => {
    if (over || turn !== 2) return;
    lock.current = true;
    const id = setTimeout(() => {
      const e = chooseBotEdge(edges, difficulty);
      lock.current = false;
      if (e) applyEdge(e, 2);
    }, 500);
    return () => clearTimeout(id);
  }, [turn, over, edges, difficulty, applyEdge]);

  const status = over
    ? scores[0] === scores[1] ? "It's a draw" : scores[0] > scores[1] ? 'You win!' : 'Bot wins'
    : turn === 1 ? 'Your turn' : 'Bot thinking...';

  const dots = [];
  for (let r = 0; r <= SIZE; r++) for (let c = 0; c <= SIZE; c++) dots.push([r, c]);

  return (
    <div className="db-wrap">
      <div className="db-head">
        <Link to="/games" className="db-back">&larr; Games</Link>
        <h1 className="db-title">Dots &amp; Boxes</h1>
        <div className="db-diff">
          {(['easy','medium','hard'] as Difficulty[]).map((d) => (
            <button key={d} className={'db-diff-btn ' + (difficulty===d?'active':'')} onClick={() => { setDifficulty(d); reset(); }}>{d}</button>
          ))}
        </div>
      </div>
      <div className="db-scorebar">
        <span className="db-s1">You {scores[0]}</span>
        <span className={'db-turn ' + (turn===1?'you':'bot')}>{status}</span>
        <span className="db-s2">Bot {scores[1]}</span>
      </div>
      <div className="db-board">
        {Array.from({ length: SIZE + 1 }).map((_, r) => (
          <div key={'row'+r}>
            <div className="db-dot-row">
              {Array.from({ length: SIZE + 1 }).map((_, c) => (
                <span key={'d'+r+'-'+c} className="db-dot-wrap">
                  <span className="db-dot" />
                  {c < SIZE && (
                    <span
                      className={'db-h ' + (edges.has(hKey(r,c)) ? 'on' : '')}
                      onClick={() => onEdge(hKey(r,c))}
                    />
                  )}
                </span>
              ))}
            </div>
            {r < SIZE && (
              <div className="db-mid-row">
                {Array.from({ length: SIZE + 1 }).map((_, c) => (
                  <span key={'m'+r+'-'+c} className="db-mid-cell">
                    <span
                      className={'db-v ' + (edges.has(vKey(r,c)) ? 'on' : '')}
                      onClick={() => onEdge(vKey(r,c))}
                    />
                    {c < SIZE && (
                      <span className={'db-box ' + (owner[r+'-'+c] === 1 ? 'p1' : owner[r+'-'+c] === 2 ? 'p2' : '')}>
                        {owner[r+'-'+c] === 1 ? 'Y' : owner[r+'-'+c] === 2 ? 'B' : ''}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {over && (
        <div className="db-controls"><button className="db-play" onClick={reset}>Play again</button></div>
      )}
    </div>
  );
}
