import { useState, useCallback, useEffect, useRef } from 'react';
import { MatchSetup, MatchResult, GameTopBar } from '../shared/GameShell';
import { useFeedback } from '../../components/Juice';
import './dotsboxes.css';

type Player = 1 | 2;
type Difficulty = 'easy' | 'medium' | 'hard';
type Phase = 'setup' | 'playing' | 'results';
const ACCENT = '#33e0e0';

const hKey = (r: number, c: number) => 'h-' + r + '-' + c;
const vKey = (r: number, c: number) => 'v-' + r + '-' + c;
function allEdges(n: number): string[] {
  const e: string[] = [];
  for (let r = 0; r <= n; r++) for (let c = 0; c < n; c++) e.push(hKey(r, c));
  for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) e.push(vKey(r, c));
  return e;
}
const boxEdges = (r: number, c: number) => [hKey(r, c), hKey(r + 1, c), vKey(r, c), vKey(r, c + 1)];
function boxesClosedBy(edges: Set<string>, edge: string, n: number): Array<[number, number]> {
  const closed: Array<[number, number]> = []; const test = new Set(edges); test.add(edge);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { const be = boxEdges(r, c); if (be.includes(edge) && be.every((x) => test.has(x))) closed.push([r, c]); }
  return closed;
}
const sidesOf = (edges: Set<string>, r: number, c: number) => boxEdges(r, c).filter((x) => edges.has(x)).length;
function chooseBotEdge(edges: Set<string>, difficulty: Difficulty, n: number): string {
  const free = allEdges(n).filter((e) => !edges.has(e));
  if (!free.length) return '';
  const completing = free.filter((e) => boxesClosedBy(edges, e, n).length > 0);
  if (completing.length && difficulty !== 'easy') return completing[0];
  if (completing.length && Math.random() < 0.5) return completing[0];
  const safe = free.filter((e) => { const t = new Set(edges); t.add(e); for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (sidesOf(t, r, c) === 3) return false; return true; });
  const pool = difficulty === 'easy' ? free : (safe.length ? safe : free);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function DotsBoxes() {
  const { fire } = useFeedback();
  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [size, setSize] = useState(4);
  const [entry, setEntry] = useState(5);
  const [edges, setEdges] = useState<Set<string>>(new Set());
  const [owner, setOwner] = useState<Record<string, Player>>({});
  const [turn, setTurn] = useState<Player>(1);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const lock = useRef(false);

  const totalBoxes = size * size;
  const over = Object.keys(owner).length >= totalBoxes;

  const start = () => { setEdges(new Set()); setOwner({}); setTurn(1); setScores([0, 0]); lock.current = false; setPhase('playing'); fire('match_start', 'Your move', null); };
  const newSetup = () => setPhase('setup');

  const applyEdge = useCallback((edge: string, player: Player) => {
    setEdges((prev) => {
      if (prev.has(edge)) return prev;
      const closed = boxesClosedBy(prev, edge, size);
      const next = new Set(prev); next.add(edge);
      if (closed.length) {
        setOwner((o) => { const no = { ...o }; for (const [r, c] of closed) no[r + '-' + c] = player; return no; });
        setScores((s) => player === 1 ? [s[0] + closed.length, s[1]] : [s[0], s[1] + closed.length]);
        fire('success', undefined, null);
      } else { setTurn(player === 1 ? 2 : 1); fire('tap', undefined, null); }
      return next;
    });
  }, [size, fire]);

  const onEdge = useCallback((edge: string) => { if (over || turn !== 1 || lock.current || edges.has(edge) || phase !== 'playing') return; applyEdge(edge, 1); }, [over, turn, edges, applyEdge, phase]);

  useEffect(() => {
    if (phase !== 'playing' || over || turn !== 2) return;
    lock.current = true;
    const id = setTimeout(() => { const e = chooseBotEdge(edges, difficulty, size); lock.current = false; if (e) applyEdge(e, 2); }, 480);
    return () => clearTimeout(id);
  }, [turn, over, edges, difficulty, applyEdge, size, phase]);

  useEffect(() => {
    if (phase !== 'playing' || !over) return;
    const id = setTimeout(() => { const youWin = scores[0] > scores[1]; const draw = scores[0] === scores[1]; fire(draw ? 'tap' : youWin ? 'match_win' : 'match_loss', undefined, null); setPhase('results'); }, 900);
    return () => clearTimeout(id);
  }, [over, phase, scores, fire]);

  if (phase === 'setup') {
    return (
      <MatchSetup game="Dots & Boxes" icon="List" accent={ACCENT}
        blurb="Draw lines, close boxes. Most boxes when the grid fills wins."
        difficulty={difficulty} onDifficulty={(d) => { setDifficulty(d as Difficulty); fire('tap'); }}
        extras={[{ key: 'size', label: 'Board size', cols: true, value: String(size), onChange: (v) => { setSize(Number(v)); fire('tap'); }, options: [{ id: '3', label: 'Small', sub: '3×3' }, { id: '4', label: 'Classic', sub: '4×4' }, { id: '5', label: 'Big', sub: '5×5' }] }]}
        entry={entry} onEntry={(n) => { setEntry(n); fire('tap'); }} onStart={start} />
    );
  }
  if (phase === 'results') {
    const draw = scores[0] === scores[1]; const youWin = scores[0] > scores[1];
    return (
      <MatchResult accent={ACCENT} outcome={draw ? 'draw' : youWin ? 'win' : 'lose'}
        title={draw ? "It's a draw" : youWin ? 'You win!' : 'Bot wins'} sub={`Boxes ${scores[0]} – ${scores[1]}`}
        entry={draw ? 0 : entry} onRematch={start} onNewSetup={newSetup} />
    );
  }

  const sub = turn === 1 ? 'Your turn' : 'Bot thinking…';
  return (
    <div className="db2-wrap" style={{ ['--acc' as any]: ACCENT }}>
      <GameTopBar title="Dots & Boxes" sub={sub} accent={ACCENT} onBack={newSetup}
        right={<span className="db2-mini"><b className="you">{scores[0]}</b> – <b className="bot">{scores[1]}</b></span>} />
      <div className="db2-board" style={{ ['--n' as any]: size }}>
        {Array.from({ length: size + 1 }).map((_, r) => (
          <div key={'row' + r}>
            <div className="db2-dot-row">
              {Array.from({ length: size + 1 }).map((_, c) => (
                <span key={'d' + r + '-' + c} className="db2-dot-wrap">
                  <span className="db2-dot" />
                  {c < size && <span className={'db2-h ' + (edges.has(hKey(r, c)) ? 'on' : '')} onClick={() => onEdge(hKey(r, c))} />}
                </span>
              ))}
            </div>
            {r < size && (
              <div className="db2-mid-row">
                {Array.from({ length: size + 1 }).map((_, c) => (
                  <span key={'m' + r + '-' + c} className="db2-mid-cell">
                    <span className={'db2-v ' + (edges.has(vKey(r, c)) ? 'on' : '')} onClick={() => onEdge(vKey(r, c))} />
                    {c < size && <span className={'db2-box ' + (owner[r + '-' + c] === 1 ? 'p1' : owner[r + '-' + c] === 2 ? 'p2' : '')} />}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="db2-hint">Tap a line between two dots. Close a box to go again.</p>
    </div>
  );
}
