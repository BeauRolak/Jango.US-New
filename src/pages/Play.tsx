import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './play.css';

const FEATURED = [
  { id: 'chess', name: 'Chess', tag: 'Strategy', cls: 'bg-chess' },
  { id: 'eightball', name: '8-Ball Pool', tag: 'Arcade', cls: 'bg-felt' },
  { id: 'airhockey', name: 'Air Hockey', tag: 'Arcade', cls: 'bg-rink' },
  { id: 'tron', name: 'Tron', tag: 'Arcade', cls: 'bg-grid' },
  { id: 'blockblast', name: 'Block Blast', tag: 'Puzzle', cls: 'bg-blocks' },
];

const MODES = [
  { id: 'casual', label: 'Casual', sub: 'Quick play, no rating at stake', cls: 'm-green', icon: '◉' },
  { id: 'ranked', label: 'Ranked', sub: 'ELO ladder, win to climb the tiers', cls: 'm-orange', icon: '▲' },
  { id: 'bot', label: 'vs Bot', sub: 'Practice solo against an AI opponent', cls: 'm-blue', icon: '⚙' },
  { id: 'tournament', label: 'Tournament', sub: 'Bracket competition with prize pools', cls: 'm-gold', icon: '♛' },
  { id: 'private', label: 'Private', sub: 'Play with friends using an invite code', cls: 'm-purple', icon: '⚿' },
];

const GAMES = [
  ['chess','Chess','Hard'],['minigolf','Mini Golf','Medium'],['connect4','Connect 4','Easy'],
  ['airhockey','Air Hockey','Medium'],['rps','RPS','Easy'],['dotsboxes','Dots & Boxes','Medium'],
  ['eightball','8-Ball Pool','Hard'],['bowling','Bowling','Medium'],['cupking','Cup King','Easy'],
  ['stacktower','Stack Tower','Easy'],['blockblast','Block Blast','Medium'],['tron','Tron','Hard'],
  ['basketball','Basketball','Medium'],['football','Football','Hard'],['racing','Racing','Medium'],
];

const WAGERS = [2,5,10,25,50,100];

export default function Play() {
  const nav = useNavigate();
  const [slide, setSlide] = useState(0);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('casual');
  const [game, setGame] = useState<string[] | null>(null);
  const [wager, setWager] = useState(5);
  const [q, setQ] = useState('');

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % FEATURED.length), 4000);
    return () => clearInterval(t);
  }, []);

  const f = FEATURED[slide];
  const lockedWager = mode === 'ranked';
  const filtered = GAMES.filter(g => g[1].toLowerCase().includes(q.toLowerCase()));

  function start() {
    if (!game) return;
    setOpen(false); setStep(1);
    nav('/games/' + game[0]);
  }

  return (
    <div className='play-page'>
      <div className='play-toprow'>
        <div className='mini-player'>
          <div className='mp-av'>P</div>
          <div><div className='mp-name'>Player 1</div><div className='mp-lv'>Lv 1</div></div>
        </div>
        <div className='mini-bal'><span className='coin'>S</span><span className='balance-num'>117.00</span></div>
      </div>

      <div className='play-hero'>
        <div className='eyebrow'>Skill-Based Competition</div>
        <h1 className='play-h1'>Play Skill Games. <span className='grad-text'>Win Real Money.</span></h1>
        <p className='play-sub'>Instant payouts · Real competition · 3% rake</p>
      </div>

      <div className={'carousel ' + f.cls}>
        <div className='carousel-body'>
          <span className='carousel-tag'>{f.tag}</span>
          <h2 className='carousel-name'>{f.name}</h2>
        </div>
        <div className='carousel-dots'>
          {FEATURED.map((_, i) => (
            <button key={i} className={i === slide ? 'cd active' : 'cd'} onClick={() => setSlide(i)} aria-label={'slide ' + (i+1)} />
          ))}
        </div>
      </div>

      <button className='play-btn' onClick={() => { setOpen(true); setStep(1); }}>PLAY</button>

      <div className='mode-chips'>
        {MODES.map(m => (
          <button key={m.id} className={'chip-mode ' + m.cls + (mode === m.id ? ' on' : '')} onClick={() => setMode(m.id)}>
            <span className='cm-icon'>{m.icon}</span>{m.label}
          </button>
        ))}
      </div>

      <div className='status-strip'>
        <span><span className='live-dot' /> online now</span>
        <span>⚡ live matches</span>
        <span>3% rake</span>
        <span>instant payouts</span>
        <span className='ss-right'><button className='ss-link' onClick={() => nav('/leaderboard')}>Rankings</button><button className='ss-link'>Join Code</button></span>
      </div>

      {open && (
        <div className='modal-scrim' onClick={() => setOpen(false)}>
          <div className='play-modal pop-in' onClick={e => e.stopPropagation()}>
            <button className='modal-x' onClick={() => setOpen(false)}>×</button>
            <div className='stepper'>
              <span className={step >= 1 ? 'st on' : 'st'}>1 Mode</span>
              <span className={step >= 2 ? 'st on' : 'st'}>2 Game</span>
              <span className={step >= 3 ? 'st on' : 'st'}>3 Options</span>
            </div>

            {step === 1 && (
              <div className='step'>
                <h3 className='step-title'>How do you want to play?</h3>
                <div className='mode-grid'>
                  {MODES.map(m => (
                    <button key={m.id} className={'mode-card ' + m.cls + (mode === m.id ? ' on' : '')} onClick={() => setMode(m.id)}>
                      <span className='mc-icon'>{m.icon}</span>
                      <span className='mc-label'>{m.label}</span>
                      <span className='mc-sub'>{m.sub}</span>
                    </button>
                  ))}
                </div>
                <div className='step-actions'>
                  <button className='btn-ghost'>Create Private Room</button>
                  <button className='btn-ghost'>Join with Code</button>
                  <button className='btn-primary' onClick={() => setStep(2)}>Next</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className='step'>
                <h3 className='step-title'>Pick your game</h3>
                <input className='game-search' placeholder='Search games...' value={q} onChange={e => setQ(e.target.value)} />
                <div className='picker-grid'>
                  {filtered.map(g => (
                    <button key={g[0]} className={'pick-card' + (game && game[0] === g[0] ? ' on' : '')} onClick={() => setGame(g)}>
                      <span className='pc-name'>{g[1]}</span>
                      <span className={'diff d-' + g[2].toLowerCase()}>{g[2]}</span>
                    </button>
                  ))}
                </div>
                <div className='step-actions'>
                  <button className='btn-ghost' onClick={() => setStep(1)}>Back</button>
                  <button className='btn-primary' disabled={!game} onClick={() => setStep(3)}>Next</button>
                </div>
              </div>
            )}

            {step === 3 && game && (
              <div className='step'>
                <h3 className='step-title'>{game[1]} <button className='change-btn' onClick={() => setStep(2)}>Change</button></h3>
                <div className='wager-label'>Wager Amount</div>
                {lockedWager ? (
                  <div className='ranked-lock'>Ranked is locked at exactly <b>1 Scalp</b> · everyone risks the same stake.</div>
                ) : (
                  <div className='wager-chips'>
                    {WAGERS.map(w => (
                      <button key={w} className={wager === w ? 'wc on' : 'wc'} onClick={() => setWager(w)}>{w} S</button>
                    ))}
                  </div>
                )}
                <div className='balance-note'>Balance: <span className='balance-num'>117.00</span> S</div>
                <button className='start-btn' onClick={start}>Start Match · {lockedWager ? 1 : wager} Scalps</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
