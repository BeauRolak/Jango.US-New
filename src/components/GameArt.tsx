import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getGameArt, GameArt, GAME_ART, FEATURED_ROTATION } from '../lib/gameArt';
import { Icon } from './Icon';
import './gameart.css';

// ---- Reduced motion hook ----
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// ---- Per-game SVG motif art ----
export function GameArtSVG({ art, className = '' }: { art: GameArt; className?: string }) {
  const p = art.primary;
  const s = art.secondary;
  const a = art.accent;
  let body: React.ReactNode = null;
  switch (art.motif) {
    case 'turf':
      body = (
          <>
            <path d="M0 168 Q120 128 220 158 T400 148 L400 240 L0 240 Z" fill={p} opacity={0.18} />
            <path className="ga-aim" d="M70 198 L318 92" stroke={a} strokeWidth={2} strokeDasharray="6 8" opacity={0.7} />
            <circle className="ga-roll" cx={100} cy={188} r={13} fill="#fff" stroke={p} strokeWidth={2} />
            <g className="ga-cup"><ellipse cx={318} cy={92} rx={20} ry={7} fill={s} /><ellipse cx={318} cy={90} rx={12} ry={4} fill="#000" opacity={0.55} /><rect x={317} y={52} width={3} height={38} fill={a} /><path d="M320 52 L346 60 L320 68 Z" fill={p} /></g>
          </>
      );
      break;
    case 'grid':
      body = (
          <>
            <rect x={120} y={36} width={160} height={170} rx={10} fill={s} opacity={0.5} stroke={p} strokeWidth={2} />
            {Array.from({ length: 42 }).map((_, i) => {
              const r = Math.floor(i / 7), c = i % 7;
              const filled = [29, 30, 36, 22, 23, 15].includes(i);
              return <circle key={i} className={filled ? "ga-disc on" : "ga-disc"} cx={134 + c * 22} cy={50 + r * 26} r={9} fill={filled ? (i % 2 ? a : p) : "#0b0b0b"} opacity={filled ? 0.95 : 0.4} style={{ ["--bi" as any]: i }} />;
            })}
          </>
      );
      break;
    case 'felt':
      body = (
          <>
            <rect x={20} y={30} width={360} height={180} rx={18} fill={p} opacity={0.16} stroke={p} strokeWidth={2} />
            <circle cx={56} cy={62} r={9} fill="#000" opacity={0.5} /><circle cx={344} cy={62} r={9} fill="#000" opacity={0.5} /><circle cx={56} cy={178} r={9} fill="#000" opacity={0.5} /><circle cx={344} cy={178} r={9} fill="#000" opacity={0.5} />
            <line className="ga-aim" x1={120} y1={196} x2={268} y2={100} stroke={a} strokeWidth={2} strokeDasharray="5 7" opacity={0.7} />
            <circle className="ga-roll" cx={150} cy={150} r={14} fill={a} opacity={0.9} /><circle cx={185} cy={120} r={14} fill={p} opacity={0.8} />
            <g><circle cx={268} cy={100} r={15} fill="#0b0b0b" /><circle cx={268} cy={100} r={8} fill="#fff" /></g>
          </>
      );
      break;
    case 'rink':
      body = (
          <>
            <rect x={24} y={30} width={352} height={180} rx={14} fill={p} opacity={0.12} stroke={p} strokeWidth={2} />
            <line x1={200} y1={30} x2={200} y2={210} stroke={a} strokeWidth={2} opacity={0.45} />
            <circle cx={200} cy={120} r={34} fill="none" stroke={a} strokeWidth={2} opacity={0.45} />
            <path className="ga-trail" d="M90 92 Q150 60 220 130 T320 150" stroke={a} strokeWidth={3} fill="none" opacity={0.6} strokeDasharray="4 10" />
            <circle className="ga-puck" cx={320} cy={150} r={12} fill="#0b0b0b" stroke={a} strokeWidth={2} />
            <circle cx={90} cy={120} r={20} fill={p} opacity={0.85} /><circle cx={90} cy={120} r={9} fill={s} />
          </>
      );
      break;
    case 'board':
      body = (
          <>
            <g className="ga-board">{Array.from({ length: 64 }).map((_, i) => {
              const r = Math.floor(i / 8), c = i % 8;
              if ((r + c) % 2 === 0) return null;
              return <rect key={i} x={72 + c * 32} y={24 + r * 22} width={32} height={22} fill="#fff" opacity={0.06} />;
            })}</g>
            <rect x={72} y={24} width={256} height={176} fill="none" stroke={p} strokeWidth={2} opacity={0.4} />
            <g className="ga-king"><circle cx={200} cy={118} r={44} fill={p} opacity={0.16} /><path d="M180 150 L220 150 L214 108 L226 122 L218 94 L200 110 L182 94 L174 122 L186 108 Z" fill={a} opacity={0.95} /><rect x={190} y={82} width={20} height={8} fill={a} /><circle cx={200} cy={78} r={5} fill={p} /></g>
          </>
      );
      break;
    case 'versus':
      body = (
          <>
            <g className="ga-clash"><path d="M120 60 L170 120 L120 180" stroke={p} strokeWidth={4} fill="none" /><path d="M280 60 L230 120 L280 180" stroke={a} strokeWidth={4} fill="none" /></g>
            <circle cx={120} cy={120} r={26} fill={p} opacity={0.2} /><circle cx={280} cy={120} r={26} fill={a} opacity={0.2} />
            <text x={200} y={134} textAnchor="middle" fontSize={36} fontWeight={800} fill={a} className="ga-vs">VS</text>
          </>
      );
      break;
    case 'dots':
      body = (
          <>
            {Array.from({ length: 25 }).map((_, i) => {
              const r = Math.floor(i / 5), c = i % 5;
              return <circle key={i} cx={100 + c * 50} cy={50 + r * 38} r={4} fill={p} opacity={0.8} />;
            })}
            <rect x={100} y={50} width={50} height={38} fill={p} opacity={0.18} />
            <rect className="ga-capture" x={150} y={88} width={50} height={38} fill={a} opacity={0.22} />
            <path className="ga-draw" d="M100 50 L150 50 L150 88 L200 88" stroke={a} strokeWidth={3} fill="none" />
          </>
      );
      break;
    case 'lane':
      body = (
          <>
            <path d="M150 30 L250 30 L320 210 L80 210 Z" fill={p} opacity={0.14} stroke={p} strokeWidth={2} />
            <line x1={200} y1={40} x2={200} y2={200} stroke={a} strokeWidth={2} strokeDasharray="4 10" opacity={0.5} />
            <circle className="ga-roll" cx={200} cy={180} r={16} fill={p} /><circle cx={194} cy={174} r={3} fill={s} /><circle cx={206} cy={176} r={3} fill={s} />
            <g className="ga-pins">{[176, 188, 200, 212, 224].map((x, i) => (<rect key={i} x={x} y={56} width={6} height={18} rx={3} fill={a} />))}</g>
          </>
      );
      break;
    case 'court':
      body = (
          <>
            <rect x={40} y={40} width={320} height={160} rx={6} fill={p} opacity={0.1} stroke={p} strokeWidth={2} />
            <circle cx={200} cy={120} r={30} fill="none" stroke={a} strokeWidth={2} opacity={0.4} />
            <path className="ga-arc" d="M120 190 Q200 40 300 90" stroke={a} strokeWidth={3} fill="none" strokeDasharray="5 8" opacity={0.6} />
            <g className="ga-hoop"><rect x={292} y={86} width={4} height={24} fill={a} /><ellipse cx={300} cy={90} rx={12} ry={4} fill="none" stroke={a} strokeWidth={2} /></g>
            <circle className="ga-ball" cx={120} cy={188} r={13} fill={p} /><path d="M107 188 H133 M120 175 V201" stroke={s} strokeWidth={1.5} />
          </>
      );
      break;
    case 'field':
      body = (
          <>
            <rect x={20} y={40} width={360} height={160} fill={p} opacity={0.12} stroke={p} strokeWidth={2} />
            {[80, 140, 200, 260, 320].map((x, i) => (<line key={i} x1={x} y1={40} x2={x} y2={200} stroke="#fff" strokeWidth={1} opacity={0.18} />))}
            <path className="ga-arc" d="M70 150 Q180 80 300 120" stroke={a} strokeWidth={3} fill="none" strokeDasharray="6 9" opacity={0.6} />
            <ellipse className="ga-ball" cx={300} cy={120} rx={14} ry={9} fill={a} /><line x1={290} y1={120} x2={310} y2={120} stroke={s} strokeWidth={1.5} />
          </>
      );
      break;
    case 'tower':
      body = (
          <>
            {[0, 1, 2, 3, 4].map((i) => (<rect key={i} className="ga-block" x={150 - i * 4} y={180 - i * 30} width={100 + i * 8} height={26} rx={5} fill={i % 2 ? a : p} opacity={0.82} style={{ ["--bi" as any]: i }} />))}
            <line x1={60} y1={40} x2={60} y2={206} stroke={a} strokeWidth={1} strokeDasharray="3 6" opacity={0.4} />
            <line x1={340} y1={40} x2={340} y2={206} stroke={a} strokeWidth={1} strokeDasharray="3 6" opacity={0.4} />
          </>
      );
      break;
    case 'blocks':
      body = (
          <>
            {Array.from({ length: 16 }).map((_, i) => {
              const r = Math.floor(i / 4), c = i % 4;
              const on = [0, 1, 4, 5, 10, 11, 14, 15].includes(i);
              return <rect key={i} className={on ? "ga-blk on" : "ga-blk"} x={120 + c * 42} y={50 + r * 34} width={36} height={28} rx={6} fill={on ? (i % 2 ? a : p) : "#fff"} opacity={on ? 0.85 : 0.06} style={{ ["--bi" as any]: i }} />;
            })}
          </>
      );
      break;
    case 'cyber':
      body = (
          <>
            <g className="ga-grid" opacity={0.3}>{Array.from({ length: 9 }).map((_, i) => (<line key={"h" + i} x1={0} y1={40 + i * 22} x2={400} y2={40 + i * 22} stroke={p} strokeWidth={1} />))}{Array.from({ length: 13 }).map((_, i) => (<line key={"v" + i} x1={i * 34} y1={30} x2={i * 34} y2={210} stroke={p} strokeWidth={1} />))}</g>
            <path className="ga-trail" d="M40 60 L40 140 L180 140 L180 80 L300 80" stroke={a} strokeWidth={4} fill="none" />
            <path className="ga-trail2" d="M360 200 L360 120 L240 120 L240 170 L120 170" stroke={p} strokeWidth={4} fill="none" />
            <circle cx={300} cy={80} r={6} fill={a} /><circle cx={120} cy={170} r={6} fill={p} />
          </>
      );
      break;
    case 'cups':
      body = (
          <>
            {[[150, 170], [230, 170], [190, 128], [190, 86]].map(([x, y], i) => (<path key={i} className="ga-cup-s" d={`M${x - 18} ${y} L${x + 18} ${y} L${x + 13} ${y + 30} L${x - 13} ${y + 30} Z`} fill={i === 3 ? a : p} opacity={0.85} style={{ ["--bi" as any]: i }} />))}
            <g className="ga-king"><path d="M174 70 L206 70 L201 50 L211 60 L206 42 L190 54 L174 42 L169 60 L179 50 Z" fill={a} /></g>
          </>
      );
      break;
    case 'speed':
      body = (
          <>
            <path d="M40 200 Q120 60 360 60" stroke={p} strokeWidth={2} fill="none" opacity={0.4} />
            <path d="M40 220 Q140 100 360 100" stroke={p} strokeWidth={2} fill="none" opacity={0.3} />
            {[70, 110, 150, 190, 230].map((y, i) => (<line key={i} className="ga-streak" x1={60} y1={y} x2={160} y2={y} stroke={a} strokeWidth={3} opacity={0.55} style={{ ["--bi" as any]: i }} />))}
            <path className="ga-car" d="M250 150 L300 150 L312 168 L300 182 L250 182 L240 166 Z" fill={a} /><circle cx={262} cy={184} r={7} fill={s} /><circle cx={296} cy={184} r={7} fill={s} />
          </>
      );
      break;
    default:
      body = null;
  }
  return (
    <svg className={`ga-art-svg ${className}`} viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {body}
    </svg>
  );
}

// ---- CSS variable bundle for a game's theme ----
export function gameVars(art: GameArt): React.CSSProperties {
  return {
    ['--ga-p' as any]: art.primary,
    ['--ga-s' as any]: art.secondary,
    ['--ga-a' as any]: art.accent,
    ['--ga-grad' as any]: art.gradient,
    ['--ga-glow' as any]: art.glow,
  } as React.CSSProperties;
}

// ---- Full-bleed reactive backdrop that shifts with the active game ----
export function DynamicGameBackdrop({ gameId, intensity = 1 }: { gameId: string; intensity?: number }) {
  const art = getGameArt(gameId);
  const reduced = usePrefersReducedMotion();
  return (
    <div
      className={`ga-backdrop ${reduced ? "ga-still" : ""}`}
      style={{ ...gameVars(art), opacity: intensity }}
      aria-hidden="true"
      data-game={gameId}
    >
      <div className="ga-backdrop-grad" />
      <div className="ga-backdrop-art"><GameArtSVG art={art} className="ga-bleed" /></div>
      <div className="ga-backdrop-grain" />
    </div>
  );
}

// ---- Theme layer wrapper: applies the game's CSS vars to children ----
export function GameThemeLayer({ gameId, className = '', children }: { gameId: string; className?: string; children: React.ReactNode }) {
  const art = getGameArt(gameId);
  return (
    <div className={`ga-theme ${className}`} style={gameVars(art)} data-game={gameId}>
      {children}
    </div>
  );
}

// ---- Compact art panel (used inside cards / previews) ----
export function GameArtPanel({ gameId, label, className = '' }: { gameId: string; label?: boolean; className?: string }) {
  const art = getGameArt(gameId);
  return (
    <div className={`ga-panel ${className}`} style={gameVars(art)} data-game={gameId}>
      <div className="ga-panel-grad" />
      <GameArtSVG art={art} />
      <div className="ga-panel-shine" />
      {label && (
        <div className="ga-panel-tag">
          <Icon name={art.icon} width={15} height={15} />
          <span>{art.name}</span>
        </div>
      )}
    </div>
  );
}

// ---- Animated preview panel: art + tagline + entry/rake + CTAs ----
export interface PreviewAction {
  label: string;
  icon?: string;
  variant?: 'grad' | 'ghost';
  onClick?: () => void;
}

export function AnimatedGamePreview({
  gameId,
  actions = [],
  showEconomy = true,
  className = '',
}: {
  gameId: string;
  actions?: PreviewAction[];
  showEconomy?: boolean;
  className?: string;
}) {
  const art = getGameArt(gameId);
  const pot = art.entry * 2;
  const rake = Math.round(pot * 0.03);
  const payout = pot - rake;
  return (
    <div className={`ga-preview ${className}`} style={gameVars(art)} data-game={gameId}>
      <div className="ga-preview-art">
        <GameArtSVG art={art} />
        <div className="ga-preview-shine" />
        <div className="ga-preview-cat"><Icon name={art.icon} width={14} height={14} /><span>{art.category}</span></div>
      </div>
      <div className="ga-preview-body">
        <h3 className="ga-preview-title">{art.name}</h3>
        <p className="ga-preview-tag">{art.tagline}</p>
        <p className="ga-preview-sub">{art.sub}</p>
        {showEconomy && (
          <div className="ga-preview-econ">
            <div className="ga-econ-cell"><span className="ga-econ-k">Entry</span><span className="ga-econ-v">{"\u24C8"}{art.entry}</span></div>
            <div className="ga-econ-cell"><span className="ga-econ-k">Rake 3%</span><span className="ga-econ-v">-{"\u24C8"}{rake}</span></div>
            <div className="ga-econ-cell ga-econ-win"><span className="ga-econ-k">Winner</span><span className="ga-econ-v">{"\u24C8"}{payout}</span></div>
          </div>
        )}
        {actions.length > 0 && (
          <div className="ga-preview-actions">
            {actions.map((act, i) => (
              <button
                key={i}
                className={`ga-btn ${act.variant === "ghost" ? "ga-btn-ghost" : "ga-btn-grad"}`}
                onClick={() => act.onClick && act.onClick()}
                type="button"
              >
                {act.icon && <Icon name={act.icon} width={16} height={16} />}
                <span>{act.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Rotating Featured Arena hero (auto-cycle + manual controls) ----
export function FeaturedGameHero({
  rotation = FEATURED_ROTATION,
  interval = 5200,
  onPlay,
  onTournament,
  onBot,
}: {
  rotation?: string[];
  interval?: number;
  onPlay?: (id: string) => void;
  onTournament?: (id: string) => void;
  onBot?: (id: string) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const timer = useRef<number | null>(null);
  const list = rotation.filter((id) => GAME_ART[id]);
  const safeIdx = idx % list.length;
  const gameId = list[safeIdx];
  const art = getGameArt(gameId);

  const advance = useCallback(() => setIdx((i) => (i + 1) % list.length), [list.length]);

  useEffect(() => {
    if (reduced || paused || list.length < 2) return;
    timer.current = window.setTimeout(advance, interval);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [reduced, paused, advance, interval, idx, list.length]);

  const select = (i: number) => setIdx(i);
  const pot = art.entry * 2;
  const payout = pot - Math.round(pot * 0.03);

  return (
    <section
      className={`ga-hero ${reduced ? "ga-still" : ""}`}
      style={gameVars(art)}
      data-game={gameId}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="ga-hero-bg">
        <div className="ga-hero-grad" />
        <div className="ga-hero-art" key={gameId}><GameArtSVG art={art} className="ga-bleed" /></div>
        <div className="ga-hero-grain" />
      </div>
      <div className="ga-hero-inner" key={gameId + "-c"}>
        <div className="ga-hero-eyebrow"><span className="ga-live-dot" />Featured Arena · {art.category}</div>
        <h2 className="ga-hero-title"><Icon name={art.icon} width={30} height={30} /> {art.name}</h2>
        <p className="ga-hero-tag">{art.tagline}</p>
        <p className="ga-hero-sub">{art.sub}</p>
        <div className="ga-hero-econ">
          <span className="ga-chip">Entry {"\u24C8"}{art.entry}</span>
          <span className="ga-chip">Winner {"\u24C8"}{payout}</span>
          <span className="ga-chip ga-chip-diff">{art.difficulty}</span>
        </div>
        <div className="ga-hero-actions">
          <button className="ga-btn ga-btn-grad" type="button" onClick={() => onPlay && onPlay(gameId)}><Icon name="Play" width={17} height={17} /><span>Play Now</span></button>
          <button className="ga-btn ga-btn-ghost" type="button" onClick={() => onBot && onBot(gameId)}><Icon name="Gamepad" width={16} height={16} /><span>Bot Match</span></button>
          <button className="ga-btn ga-btn-ghost" type="button" onClick={() => onTournament && onTournament(gameId)}><Icon name="Trophy" width={16} height={16} /><span>Tournament</span></button>
        </div>
      </div>
      <div className="ga-hero-dots" role="tablist" aria-label="Featured games">
        {list.map((id, i) => (
          <button
            key={id}
            className={`ga-dot ${i === safeIdx ? "on" : ""}`}
            style={{ ['--dot' as any]: getGameArt(id).primary }}
            onClick={() => select(i)}
            aria-label={getGameArt(id).name}
            aria-selected={i === safeIdx}
            role="tab"
            type="button"
          />
        ))}
      </div>
    </section>
  );
}

