import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../../components/Icon';
import './gameshell.css';

export const ENTRIES = [0, 5, 10, 25, 50] as const;
export const RAKE = 0.03;
export function economy(entry: number) {
  const pot = entry * 2;
  const rake = Math.round(pot * RAKE);
  return { pot, rake, payout: pot - rake };
}

export interface Choice { id: string; label: string; sub?: string }
export interface ExtraGroup { key: string; label: string; options: Choice[]; value: string; onChange: (id: string) => void; cols?: boolean }

/** Shared premium match-setup card used by every Jango game.
 *  accent drives the theme color via the --ga-acc CSS variable. */
export function MatchSetup(props: {
  game: string; icon: IconName; accent: string; blurb: string;
  difficulty?: string; onDifficulty?: (id: string) => void;
  difficulties?: Choice[];
  extras?: ExtraGroup[];
  entry: number; onEntry: (n: number) => void;
  onStart: () => void; startLabel?: string;
}) {
  const navigate = useNavigate();
  const { pot, rake, payout } = economy(props.entry);
  const diffs = props.difficulties ?? [
    { id: 'easy', label: 'Easy' }, { id: 'medium', label: 'Medium' }, { id: 'hard', label: 'Hard' },
  ];
  return (
    <div className="gs-wrap" style={{ ['--ga-acc' as any]: props.accent }}>
      <div className="gs-setup">
        <div className="gs-setup__head">
          <span className="gs-eyebrow"><Icon name={props.icon} /> {props.game}</span>
          <h1>Match Setup</h1>
          <p>{props.blurb}</p>
        </div>

        <div className="gs-field">
          <label>Opponent</label>
          <div className="gs-opts">
            <button className="gs-opt is-active"><Icon name="Gamepad" /> Bot Match</button>
            <button className="gs-opt is-disabled" disabled><Icon name="Users" /> Player <span className="gs-soon">soon</span></button>
          </div>
        </div>

        {props.onDifficulty && (
          <div className="gs-field">
            <label>Bot difficulty</label>
            <div className="gs-opts">
              {diffs.map((d) => (
                <button key={d.id} className={'gs-opt gs-opt--diff' + (props.difficulty === d.id ? ' is-active' : '')} onClick={() => props.onDifficulty!(d.id)}>
                  <b>{d.label}</b>{d.sub && <span>{d.sub}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {props.extras?.map((g) => (
          <div className="gs-field" key={g.key}>
            <label>{g.label}</label>
            <div className={'gs-opts' + (g.cols ? ' gs-opts--cols' : '')}>
              {g.options.map((o) => (
                <button key={o.id} className={'gs-opt' + (g.cols ? ' gs-opt--col' : '') + (g.value === o.id ? ' is-active' : '')} onClick={() => g.onChange(o.id)}>
                  <b>{o.label}</b>{o.sub && <span>{o.sub}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="gs-field">
          <label>Entry (Scalps)</label>
          <div className="gs-opts gs-opts--entry">
            {ENTRIES.map((en) => (
              <button key={en} className={'gs-opt gs-opt--entry' + (props.entry === en ? ' is-active' : '')} onClick={() => props.onEntry(en)}>
                {en === 0 ? 'Free' : 'Ⓢ ' + en}
              </button>
            ))}
          </div>
        </div>

        <div className="gs-econ">
          <div><span>Entry</span><b>{props.entry === 0 ? 'Free' : 'Ⓢ ' + props.entry}</b></div>
          <div><span>Pot</span><b>Ⓢ {pot}</b></div>
          <div className="gs-econ--dim"><span>Rake 3%</span><b>Ⓢ {rake}</b></div>
          <div className="gs-econ--win"><span>Winner</span><b>Ⓢ {payout}</b></div>
        </div>
        <p className="gs-note"><Icon name="Lock" /> Mock economy — no Scalps charged, no real money moves. 1 Scalp = $1.</p>

        <div className="gs-actions">
          <button className="gs-btn gs-btn--ghost" onClick={() => navigate('/play')}><Icon name="ArrowLeft" /> Back to lobby</button>
          <button className="gs-btn gs-btn--go" onClick={props.onStart}><Icon name="Play" /> {props.startLabel ?? 'Start match'}</button>
        </div>
      </div>
    </div>
  );
}

/** Shared premium result screen. outcome controls the icon + glow. */
export function MatchResult(props: {
  accent: string; outcome: 'win' | 'lose' | 'draw'; title: string; sub?: string;
  entry: number; children?: ReactNode;
  onRematch: () => void; onNewSetup: () => void;
}) {
  const { pot, rake, payout } = economy(props.entry);
  const icon: IconName = props.outcome === 'win' ? 'Trophy' : props.outcome === 'draw' ? 'Medal' : 'Shield';
  return (
    <div className="gs-wrap" style={{ ['--ga-acc' as any]: props.accent }}>
      <div className={'gs-results' + (props.outcome === 'win' ? ' win' : '')}>
        <div className="gs-results__burst" aria-hidden="true" />
        <span className="gs-results__icon"><Icon name={icon} /></span>
        <h1>{props.title}</h1>
        {props.sub && <p className="gs-results__sub">{props.sub}</p>}
        {props.children}
        {props.entry > 0 && (
          <div className="gs-payout">
            <div><span>Pot</span><b>Ⓢ {pot}</b></div>
            <div className="gs-econ--dim"><span>Rake 3%</span><b>Ⓢ {rake}</b></div>
            <div className="gs-econ--win"><span>{props.outcome === 'win' ? 'You collect' : 'Winner collects'}</span><b>Ⓢ {payout}</b></div>
          </div>
        )}
        <p className="gs-note"><Icon name="Lock" /> Mock economy — no real money moved.</p>
        <div className="gs-actions">
          <button className="gs-btn gs-btn--ghost" onClick={props.onNewSetup}><Icon name="Gamepad" /> New setup</button>
          <button className="gs-btn gs-btn--go" onClick={props.onRematch}><Icon name="Swords" /> Rematch</button>
        </div>
      </div>
    </div>
  );
}

/** Shared in-game top bar: back button + centered title/subtitle + optional right slot. */
export function GameTopBar(props: { title: string; sub?: string; accent: string; onBack: () => void; right?: ReactNode }) {
  return (
    <div className="gs-topbar" style={{ ['--ga-acc' as any]: props.accent }}>
      <button className="gs-topbar__back" onClick={props.onBack} aria-label="Quit"><Icon name="ArrowLeft" /></button>
      <div className="gs-topbar__mid">
        <span className="gs-topbar__title">{props.title}</span>
        {props.sub && <span className="gs-topbar__sub">{props.sub}</span>}
      </div>
      <div className="gs-topbar__right">{props.right}</div>
    </div>
  );
}
