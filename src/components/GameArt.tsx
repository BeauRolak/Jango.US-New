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
export function GameArtSVG({ art, className = "" }: { art: GameArt; className?: string }) {
  const p = art.primary;
  const s = art.secondary;
  const a = art.accent;
  const uid = art.id;
  // unique gradient/filter ids per game so multiple cards do not collide
  const g1 = `g1-${uid}`;
  const g2 = `g2-${uid}`;
  const gFloor = `gf-${uid}`;
  const gGlow = `gg-${uid}`;
  const gSky = `gs-${uid}`;
  const fSoft = `fs-${uid}`;
  const fGlow = `fl-${uid}`;
  const fShadow = `fh-${uid}`;

  const defs = (
    <defs>
      {/* sky / arena backdrop gradient */}
      <linearGradient id={gSky} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={s} stopOpacity="0.42" />
        <stop offset="45%" stopColor="#0a0c14" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#05060a" stopOpacity="1" />
      </linearGradient>
      {/* primary->accent sheen */}
      <linearGradient id={g1} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={a} />
        <stop offset="55%" stopColor={p} />
        <stop offset="100%" stopColor={s} />
      </linearGradient>
      <linearGradient id={g2} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="40%" stopColor={a} stopOpacity="0.7" />
        <stop offset="100%" stopColor={p} stopOpacity="0.15" />
      </linearGradient>
      {/* floor / surface with depth */}
      <linearGradient id={gFloor} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={p} stopOpacity="0.55" />
        <stop offset="60%" stopColor={p} stopOpacity="0.16" />
        <stop offset="100%" stopColor="#04050a" stopOpacity="0.05" />
      </linearGradient>
      {/* radial overhead light */}
      <radialGradient id={gGlow} cx="50%" cy="35%" r="70%">
        <stop offset="0%" stopColor={a} stopOpacity="0.85" />
        <stop offset="35%" stopColor={p} stopOpacity="0.32" />
        <stop offset="100%" stopColor={p} stopOpacity="0" />
      </radialGradient>
      <filter id={fSoft} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.2" />
      </filter>
      <filter id={fGlow} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="6" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id={fShadow} x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.55" />
      </filter>
    </defs>
  );

  let body: React.ReactNode;
  switch (art.motif) {
    // ===== MINI GOLF — neon course with cup, rails, ball trail, 3D perspective =====
    case "turf":
      body = (<>
        <rect width="400" height="240" fill={`url(#${gSky})`} />
        <ellipse cx="200" cy="70" rx="240" ry="120" fill={`url(#${gGlow})`} opacity="0.6" />
        {/* turf with perspective */}
        <path d="M40 240 L150 120 L300 120 L400 240 Z" fill={`url(#${gFloor})`} />
        <path d="M150 120 L300 120 L400 240 L40 240 Z" fill={p} opacity="0.10" />
        {/* turf stripes (perspective lines) */}
        {[0,1,2,3,4].map((i) => (
          <line key={i} x1={150 + i*30} y1="120" x2={70 + i*65} y2="240" stroke={a} strokeOpacity="0.18" strokeWidth="1.5" />
        ))}
        <line x1="120" y1="160" x2="360" y2="160" stroke={a} strokeOpacity="0.14" strokeWidth="1.5" />
        <line x1="80" y1="205" x2="400" y2="205" stroke={a} strokeOpacity="0.12" strokeWidth="1.5" />
        {/* glowing rails */}
        <path d="M40 240 L150 120" stroke={a} strokeWidth="3" filter={`url(#${fGlow})`} opacity="0.9" />
        <path d="M400 240 L300 120" stroke={a} strokeWidth="3" filter={`url(#${fGlow})`} opacity="0.9" />
        {/* cup */}
        <ellipse cx="245" cy="150" rx="16" ry="6" fill="#04060a" stroke={a} strokeWidth="1.5" />
        <ellipse cx="245" cy="148" rx="16" ry="6" fill={a} opacity="0.2" filter={`url(#${fGlow})`} />
        <rect x="244" y="118" width="2" height="32" fill={s} />
        <path d="M246 118 L266 124 L246 132 Z" fill={a} filter={`url(#${fGlow})`} />
        {/* ball trail */}
        <path d="M120 222 Q180 188 230 158" stroke={a} strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" opacity="0.7" />
        <circle cx="120" cy="222" r="9" fill={`url(#${g2})`} filter={`url(#${fShadow})`} />
        <circle cx="117" cy="219" r="3" fill="#ffffff" opacity="0.9" />
      </>);
      break;

    // ===== CONNECT 4 — glossy grid wall, dropping disc, win line =====
    case "grid":
      body = (<>
        <rect width="400" height="240" fill={`url(#${gSky})`} />
        <ellipse cx="200" cy="60" rx="220" ry="100" fill={`url(#${gGlow})`} opacity="0.45" />
        <rect x="120" y="48" width="160" height="150" rx="12" fill={p} opacity="0.22" filter={`url(#${fShadow})`} />
        <rect x="120" y="48" width="160" height="150" rx="12" fill="none" stroke={a} strokeWidth="2" opacity="0.7" />
        {[0,1,2,3].map((c) => [0,1,2,3].map((r) => {
          const cx = 142 + c*39, cy = 70 + r*38;
          const filled = (c+r) % 3 === 0;
          const col = (c+r) % 2 === 0 ? a : s;
          return (<g key={`${c}-${r}`}>
            <circle cx={cx} cy={cy} r="14" fill="#06080e" />
            {filled && <circle cx={cx} cy={cy} r="12" fill={col} filter={`url(#${fGlow})`} />}
            {filled && <circle cx={cx-4} cy={cy-4} r="4" fill="#ffffff" opacity="0.6" />}
          </g>);
        }))}
        {/* dropping disc + trail */}
        <line x1="220" y1="20" x2="220" y2="56" stroke={a} strokeWidth="3" strokeDasharray="2 6" opacity="0.6" />
        <circle cx="220" cy="22" r="13" fill={a} filter={`url(#${fGlow})`} />
      </>);
      break;

    // ===== 8-BALL — felt table, rails, balls w/ highlights, cue, overhead light =====
    case "felt":
      body = (<>
        <rect width="400" height="240" fill="#05080a" />
        <ellipse cx="200" cy="40" rx="120" ry="60" fill={`url(#${gGlow})`} opacity="0.7" />
        {/* table felt with perspective */}
        <path d="M55 70 L345 70 L385 215 L15 215 Z" fill={p} opacity="0.5" />
        <path d="M55 70 L345 70 L385 215 L15 215 Z" fill={`url(#${gFloor})`} />
        {/* rails */}
        <path d="M55 70 L345 70 L385 215 L15 215 Z" fill="none" stroke="#5b3a1a" strokeWidth="9" strokeLinejoin="round" opacity="0.85" />
        <path d="M55 70 L345 70 L385 215 L15 215 Z" fill="none" stroke={a} strokeWidth="1.5" strokeLinejoin="round" opacity="0.4" />
        {/* corner pockets */}
        {[[55,70],[345,70],[385,215],[15,215]].map(([x,y],i) => (<circle key={i} cx={x} cy={y} r="9" fill="#02030a" stroke={a} strokeOpacity="0.3" />))}
        {/* balls */}
        <g filter={`url(#${fShadow})`}>
          <circle cx="150" cy="150" r="15" fill="#0a0a0a" />
          <circle cx="144" cy="144" r="5" fill="#ffffff" opacity="0.85" />
          <circle cx="150" cy="150" r="6" fill="#ffffff" /><text x="150" y="154" fontSize="8" fill="#000" textAnchor="middle" fontWeight="700">8</text>
        </g>
        <g filter={`url(#${fShadow})`}>
          <circle cx="232" cy="128" r="14" fill={a} />
          <circle cx="227" cy="123" r="4.5" fill="#ffffff" opacity="0.9" />
        </g>
        <g filter={`url(#${fShadow})`}>
          <circle cx="270" cy="170" r="14" fill="#f4f4f4" />
          <circle cx="265" cy="165" r="4.5" fill="#ffffff" />
        </g>
        {/* cue stick at angle */}
        <line x1="60" y1="100" x2="262" y2="160" stroke="#caa472" strokeWidth="4" strokeLinecap="round" filter={`url(#${fSoft})`} />
        <line x1="252" y1="157" x2="262" y2="160" stroke="#e8e8e8" strokeWidth="4" strokeLinecap="round" />
      </>);
      break;

    // ===== AIR HOCKEY — arcade table, glowing goals, puck trail, paddle =====
    case "rink":
      body = (<>
        <rect width="400" height="240" fill={`url(#${gSky})`} />
        <ellipse cx="200" cy="120" rx="180" ry="110" fill={`url(#${gGlow})`} opacity="0.4" />
        <rect x="60" y="34" width="280" height="172" rx="16" fill={p} opacity="0.16" />
        <rect x="60" y="34" width="280" height="172" rx="16" fill="none" stroke={a} strokeWidth="3" filter={`url(#${fGlow})`} />
        {/* center line + circle */}
        <line x1="200" y1="34" x2="200" y2="206" stroke={a} strokeWidth="2" opacity="0.55" />
        <circle cx="200" cy="120" r="34" fill="none" stroke={a} strokeWidth="2" opacity="0.5" />
        <circle cx="200" cy="120" r="3" fill={a} />
        {/* goal slots glowing */}
        <rect x="56" y="92" width="8" height="56" rx="3" fill={s} filter={`url(#${fGlow})`} />
        <rect x="336" y="92" width="8" height="56" rx="3" fill={s} filter={`url(#${fGlow})`} />
        {/* puck trail */}
        <path d="M120 150 Q180 120 250 96" stroke={a} strokeWidth="3" strokeDasharray="2 7" opacity="0.7" strokeLinecap="round" />
        <circle cx="252" cy="95" r="10" fill="#0c0e16" stroke={a} strokeWidth="2" filter={`url(#${fGlow})`} />
        {/* paddle + shadow */}
        <ellipse cx="118" cy="158" rx="20" ry="9" fill="#000" opacity="0.4" />
        <circle cx="116" cy="150" r="17" fill={`url(#${g1})`} filter={`url(#${fShadow})`} />
        <circle cx="116" cy="150" r="7" fill="#06080e" />
      </>);
      break;
    // ===== CHESS — 3D board in perspective, spotlight, king silhouette =====
    case "board":
      body = (<>
        <rect width="400" height="240" fill={`url(#${gSky})`} />
        <ellipse cx="210" cy="40" rx="150" ry="80" fill={`url(#${gGlow})`} opacity="0.7" />
        {/* perspective board */}
        <path d="M110 130 L290 130 L370 220 L30 220 Z" fill={`url(#${gFloor})`} />
        {[0,1,2,3,4,5,6,7].map((i) => {
          const t = i/8, t2=(i+1)/8;
          const xL = 110 + (30-110)*t,  xL2 = 110 + (30-110)*t2;
          const yT = 130 + (220-130)*t, yT2 = 130 + (220-130)*t2;
          const xR = 290 + (370-290)*t, xR2 = 290 + (370-290)*t2;
          return i%2===0 ? (<path key={i} d={`M${xL} ${yT} L${xR} ${yT} L${xR2} ${yT2} L${xL2} ${yT2} Z`} fill={a} opacity="0.10" />) : null;
        })}
        <path d="M110 130 L290 130 L370 220 L30 220 Z" fill="none" stroke={a} strokeWidth="1.5" opacity="0.5" />
        {/* glowing move squares */}
        <path d="M170 150 L215 150 L222 168 L170 168 Z" fill={a} opacity="0.5" filter={`url(#${fGlow})`} />
        {/* king silhouette */}
        <g filter={`url(#${fShadow})`}>
          <ellipse cx="200" cy="160" rx="20" ry="7" fill="#000" opacity="0.5" />
          <path d="M192 158 L208 158 L205 110 L195 110 Z" fill={`url(#${g2})`} />
          <circle cx="200" cy="104" r="9" fill={`url(#${g2})`} />
          <path d="M197 96 L203 96 L200 88 Z M200 96 L200 88" stroke="#fff" strokeWidth="2" fill="#fff" />
        </g>
      </>);
      break;

    // ===== RPS — dramatic clash, two stylized hands, impact flash =====
    case "versus":
      body = (<>
        <rect width="400" height="240" fill={`url(#${gSky})`} />
        <ellipse cx="200" cy="120" rx="120" ry="120" fill={`url(#${gGlow})`} opacity="0.7" />
        {/* impact burst */}
        {[0,1,2,3,4,5,6,7].map((i)=>{const ang=i*45*Math.PI/180;return (<line key={i} x1={200+24*Math.cos(ang)} y1={120+24*Math.sin(ang)} x2={200+60*Math.cos(ang)} y2={120+60*Math.sin(ang)} stroke={a} strokeWidth="3" strokeLinecap="round" opacity="0.65" filter={`url(#${fGlow})`} />);})}
        <circle cx="200" cy="120" r="16" fill="#fff" opacity="0.85" filter={`url(#${fGlow})`} />
        {/* left fist (rock) */}
        <g filter={`url(#${fShadow})`}>
          <path d="M70 96 q34 -12 64 4 q14 8 12 28 q-2 26 -34 30 q-40 4 -50 -22 q-8 -28 8 -40 Z" fill={`url(#${g1})`} />
          <path d="M118 104 q8 14 4 30" stroke="#000" strokeOpacity="0.25" strokeWidth="3" fill="none" />
        </g>
        {/* right hand (scissors) */}
        <g filter={`url(#${fShadow})`}>
          <path d="M330 96 q-30 -14 -58 0 l-30 18 q-12 8 -2 18 q10 8 22 0 l24 -14" fill={`url(#${g2})`} />
          <path d="M312 86 l30 -22 M312 100 l34 -8" stroke={s} strokeWidth="9" strokeLinecap="round" />
        </g>
      </>);
      break;

    // ===== DOTS & BOXES — neon grid, drawn lines, captured box =====
    case "dots":
      body = (<>
        <rect width="400" height="240" fill={`url(#${gSky})`} />
        <ellipse cx="200" cy="70" rx="200" ry="90" fill={`url(#${gGlow})`} opacity="0.4" />
        {[0,1,2,3,4].map((c)=>[0,1,2,3].map((r)=>(<circle key={`${c}-${r}`} cx={90+c*55} cy={56+r*44} r="4" fill={a} filter={`url(#${fGlow})`} />)))}
        {/* drawn edges */}
        <line x1="90" y1="56" x2="145" y2="56" stroke={a} strokeWidth="4" strokeLinecap="round" filter={`url(#${fGlow})`} />
        <line x1="145" y1="56" x2="200" y2="56" stroke={s} strokeWidth="4" strokeLinecap="round" filter={`url(#${fGlow})`} />
        <line x1="90" y1="56" x2="90" y2="100" stroke={s} strokeWidth="4" strokeLinecap="round" filter={`url(#${fGlow})`} />
        <line x1="145" y1="56" x2="145" y2="100" stroke={a} strokeWidth="4" strokeLinecap="round" filter={`url(#${fGlow})`} />
        <line x1="90" y1="100" x2="145" y2="100" stroke={a} strokeWidth="4" strokeLinecap="round" filter={`url(#${fGlow})`} />
        {/* captured box */}
        <rect x="92" y="58" width="51" height="40" rx="3" fill={a} opacity="0.22" />
        <text x="117" y="84" fontSize="20" fill={a} textAnchor="middle" fontWeight="800" opacity="0.8">J</text>
        {/* drawing line in progress */}
        <line x1="200" y1="100" x2="200" y2="144" stroke="#fff" strokeWidth="3" strokeDasharray="3 5" opacity="0.7" />
      </>);
      break;

    // ===== BOWLING — lane perspective, rolling ball + trail, pin burst =====
    case "lane":
      body = (<>
        <rect width="400" height="240" fill={`url(#${gSky})`} />
        <ellipse cx="200" cy="30" rx="120" ry="60" fill={`url(#${gGlow})`} opacity="0.6" />
        {/* lane */}
        <path d="M150 36 L250 36 L360 230 L40 230 Z" fill={`url(#${gFloor})`} />
        <path d="M150 36 L250 36 L360 230 L40 230 Z" fill="none" stroke={a} strokeWidth="1.5" opacity="0.4" />
        {/* gutters */}
        <path d="M150 36 L40 230" stroke={s} strokeWidth="3" opacity="0.6" filter={`url(#${fGlow})`} />
        <path d="M250 36 L360 230" stroke={s} strokeWidth="3" opacity="0.6" filter={`url(#${fGlow})`} />
        {/* boards */}
        {[0,1,2,3].map((i)=>(<line key={i} x1={170+i*20} y1="36" x2={120+i*45} y2="230" stroke={a} strokeOpacity="0.12" strokeWidth="1" />))}
        {/* pins */}
        {[[185,58],[200,58],[215,58],[192,46],[208,46],[200,36]].map(([x,y],i)=>(<g key={i}><ellipse cx={x} cy={y+8} rx="4" ry="2" fill="#000" opacity="0.4"/><path d={`M${x-3} ${y+8} Q${x} ${y-7} ${x+3} ${y+8} Z`} fill="#fff" /><rect x={x-2.5} y={y-3} width="5" height="2" fill={s} /></g>))}
        {/* ball + trail */}
        <path d="M120 215 Q170 150 200 86" stroke={a} strokeWidth="3" strokeDasharray="2 6" opacity="0.6" strokeLinecap="round" />
        <circle cx="120" cy="215" r="18" fill={`url(#${g1})`} filter={`url(#${fShadow})`} />
        <circle cx="113" cy="208" r="5" fill="#fff" opacity="0.7" />
        <circle cx="124" cy="214" r="2" fill="#06080e" /><circle cx="118" cy="218" r="2" fill="#06080e" />
      </>);
      break;
    // ===== BASKETBALL — court perspective, hoop, ball arc, stadium lights =====
    case "court":
      body = (<>
        <rect width="400" height="240" fill={`url(#${gSky})`} />
        {[80,200,320].map((x,i)=>(<ellipse key={i} cx={x} cy="20" rx="40" ry="22" fill={a} opacity="0.18" filter={`url(#${fGlow})`} />))}
        <path d="M70 120 L330 120 L390 230 L10 230 Z" fill={`url(#${gFloor})`} />
        <path d="M70 120 L330 120 L390 230 L10 230 Z" fill="none" stroke={a} strokeWidth="1.5" opacity="0.4" />
        {/* key + arc */}
        <path d="M160 120 L240 120 L270 200 L130 200 Z" fill="none" stroke={a} strokeWidth="1.5" opacity="0.4" />
        <path d="M150 160 Q200 130 250 160" fill="none" stroke={a} strokeWidth="1.5" opacity="0.4" />
        {/* backboard + hoop */}
        <rect x="178" y="40" width="44" height="30" rx="2" fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
        <ellipse cx="200" cy="74" rx="16" ry="5" fill="none" stroke={s} strokeWidth="3" filter={`url(#${fGlow})`} />
        {/* ball arc */}
        <path d="M90 200 Q150 70 200 78" stroke={a} strokeWidth="2.5" strokeDasharray="2 7" opacity="0.65" fill="none" />
        <g filter={`url(#${fShadow})`}>
          <circle cx="90" cy="200" r="15" fill={`url(#${g1})`} />
          <path d="M75 200 h30 M90 185 v30 M79 190 Q90 200 79 210 M101 190 Q90 200 101 210" stroke="#1a0e06" strokeWidth="1.4" fill="none" opacity="0.7" />
        </g>
      </>);
      break;

    // ===== FOOTBALL — field perspective, yard lines, ball, impact, lights =====
    case "field":
      body = (<>
        <rect width="400" height="240" fill={`url(#${gSky})`} />
        {[60,200,340].map((x,i)=>(<ellipse key={i} cx={x} cy="18" rx="36" ry="20" fill={a} opacity="0.16" filter={`url(#${fGlow})`} />))}
        <path d="M80 110 L320 110 L400 234 L0 234 Z" fill={`url(#${gFloor})`} />
        {[0,1,2,3,4].map((i)=>{const t=i/4;const xl=80+(0-80)*t,xr=320+(400-320)*t,y=110+(234-110)*t;return(<line key={i} x1={xl} y1={y} x2={xr} y2={y} stroke="#fff" strokeOpacity="0.22" strokeWidth="1.5" />);})}
        <line x1="200" y1="110" x2="200" y2="234" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.5" />
        {/* impact burst */}
        {[0,1,2,3,4].map((i)=>{const ang=(i*72-90)*Math.PI/180;return(<line key={i} x1={250+10*Math.cos(ang)} y1={150+10*Math.sin(ang)} x2={250+30*Math.cos(ang)} y2={150+30*Math.sin(ang)} stroke={s} strokeWidth="3" opacity="0.6" strokeLinecap="round" />);})}
        {/* ball */}
        <g filter={`url(#${fShadow})`}>
          <ellipse cx="150" cy="160" rx="24" ry="13" fill={`url(#${g1})`} transform="rotate(-22 150 160)" />
          <line x1="138" y1="156" x2="162" y2="164" stroke="#fff" strokeWidth="2" opacity="0.85" />
          {[0,1,2].map(i=>(<line key={i} x1={144+i*6} y1={154+i*3} x2={148+i*6} y2={160+i*3} stroke="#fff" strokeWidth="1.5" opacity="0.85" />))}
        </g>
      </>);
      break;

    // ===== STACK TOWER — stacked glass blocks, depth, height pulse =====
    case "tower":
      body = (<>
        <rect width="400" height="240" fill={`url(#${gSky})`} />
        <ellipse cx="200" cy="40" rx="160" ry="70" fill={`url(#${gGlow})`} opacity="0.45" />
        {[0,1,2,3,4,5].map((i)=>{const w=120-i*9;const x=200-w/2;const y=206-i*30;const off=i%2===0?-6:6;return(<g key={i} filter={`url(#${fShadow})`}><rect x={x+off} y={y} width={w} height="26" rx="4" fill={i===5?a:`url(#${g1})`} opacity={0.55+i*0.07} /><rect x={x+off} y={y} width={w} height="8" rx="4" fill="#fff" opacity="0.18" /></g>);})}
        {/* incoming block */}
        <rect x="150" y="22" width="70" height="22" rx="4" fill={a} opacity="0.7" filter={`url(#${fGlow})`} />
        <line x1="185" y1="44" x2="185" y2="60" stroke={a} strokeWidth="2" strokeDasharray="2 5" opacity="0.6" />
      </>);
      break;

    // ===== BLOCK BLAST — colorful grid, clearing flash =====
    case "blocks":
      body = (<>
        <rect width="400" height="240" fill={`url(#${gSky})`} />
        <ellipse cx="200" cy="60" rx="200" ry="90" fill={`url(#${gGlow})`} opacity="0.4" />
        {[0,1,2,3,4].map((c)=>[0,1,2,3].map((r)=>{const cols=[p,s,a,"#3aa0ff"];const col=cols[(c+r)%4];const on=(c*r)%3!==0;const x=128+c*32,y=56+r*32;return on?(<g key={`${c}-${r}`} filter={`url(#${fShadow})`}><rect x={x} y={y} width="28" height="28" rx="5" fill={col} /><rect x={x} y={y} width="28" height="9" rx="5" fill="#fff" opacity="0.22" /></g>):null;}))}
        {/* clear flash row */}
        <rect x="124" y="148" width="156" height="30" rx="6" fill="#fff" opacity="0.55" filter={`url(#${fGlow})`} />
      </>);
      break;

    // ===== TRON — cyber grid, light trails, depth, glow walls =====
    case "cyber":
      body = (<>
        <rect width="400" height="240" fill="#03040c" />
        <ellipse cx="200" cy="120" rx="220" ry="120" fill={`url(#${gGlow})`} opacity="0.35" />
        {[0,1,2,3,4,5,6].map((i)=>{const t=i/6;const y=120+(240-120)*t*t;return(<line key={`h${i}`} x1="0" y1={y} x2="400" y2={y} stroke={a} strokeOpacity={0.4-t*0.25} strokeWidth="1.2" />);})}
        {[0,1,2,3,4,5,6,7,8].map((i)=>{const x=i*50;return(<line key={`v${i}`} x1={x} y1="120" x2={200+(x-200)*2.4} y2="240" stroke={a} strokeOpacity="0.22" strokeWidth="1.2" />);})}
        {/* light cycle trails */}
        <path d="M120 230 L120 170 L210 170" stroke={a} strokeWidth="4" fill="none" filter={`url(#${fGlow})`} strokeLinecap="round" />
        <path d="M300 230 L300 150 L190 150" stroke={s} strokeWidth="4" fill="none" filter={`url(#${fGlow})`} strokeLinecap="round" />
        <rect x="206" y="166" width="10" height="8" rx="2" fill="#fff" filter={`url(#${fGlow})`} />
        <rect x="184" y="146" width="10" height="8" rx="2" fill="#fff" filter={`url(#${fGlow})`} />
      </>);
      break;

    // ===== CUP KING — stacked cups, crown, gold pulse, depth =====
    case "cups":
      body = (<>
        <rect width="400" height="240" fill={`url(#${gSky})`} />
        <ellipse cx="200" cy="50" rx="150" ry="80" fill={`url(#${gGlow})`} opacity="0.6" />
        {/* pyramid of cups */}
        {[[160,170],[210,170],[185,128]].map(([x,y],i)=>(<g key={i} filter={`url(#${fShadow})`}><path d={`M${x-18} ${y} L${x+18} ${y} L${x+13} ${y+40} L${x-13} ${y+40} Z`} fill={`url(#${g1})`} /><ellipse cx={x} cy={y} rx="18" ry="6" fill={a} opacity="0.6" /><rect x={x-18} y={y} width="36" height="6" fill="#fff" opacity="0.15" /></g>))}
        {/* crown */}
        <g filter={`url(#${fGlow})`}>
          <path d="M168 96 L178 110 L185 92 L192 110 L202 96 L198 116 L172 116 Z" fill={a} />
          <circle cx="185" cy="86" r="4" fill="#fff" />
        </g>
      </>);
      break;

    // ===== RACING — track perspective, car, speed streaks, tire trail =====
    case "speed":
      body = (<>
        <rect width="400" height="240" fill={`url(#${gSky})`} />
        <path d="M120 50 L280 50 L390 234 L10 234 Z" fill={`url(#${gFloor})`} />
        {/* center dashes */}
        {[0,1,2,3,4].map((i)=>{const t=i/5;const y=60+(220-60)*t;const w=3+t*10;return(<rect key={i} x={200-w/2} y={y} width={w} height={6+t*8} rx="2" fill="#fff" opacity="0.55" />);})}
        <path d="M120 50 L10 234" stroke={a} strokeWidth="2" opacity="0.5" filter={`url(#${fGlow})`} />
        <path d="M280 50 L390 234" stroke={a} strokeWidth="2" opacity="0.5" filter={`url(#${fGlow})`} />
        {/* speed streaks */}
        {[0,1,2,3].map((i)=>(<line key={i} x1={60+i*30} y1={90+i*30} x2={120+i*30} y2={90+i*30} stroke={s} strokeWidth="3" opacity="0.5" strokeLinecap="round" />))}
        {/* car */}
        <g filter={`url(#${fShadow})`}>
          <ellipse cx="200" cy="200" rx="40" ry="10" fill="#000" opacity="0.45" />
          <path d="M172 196 L228 196 L218 168 Q200 158 182 168 Z" fill={`url(#${g1})`} />
          <path d="M186 172 L214 172 L210 184 L190 184 Z" fill="#0a0e18" opacity="0.85" />
          <rect x="170" y="190" width="60" height="8" rx="3" fill={a} filter={`url(#${fGlow})`} />
        </g>
      </>);
      break;

    // ===== fallback =====
    default:
      body = (<>
        <rect width="400" height="240" fill={`url(#${gSky})`} />
        <ellipse cx="200" cy="120" rx="160" ry="100" fill={`url(#${gGlow})`} opacity="0.6" />
        <circle cx="200" cy="120" r="40" fill={`url(#${g1})`} filter={`url(#${fGlow})`} />
      </>);
  }

  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={`ga-art-svg ${className}`} role="img" aria-hidden="true">
      {defs}
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
          <Icon name={art.icon as any} width={15} height={15} />
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
        <div className="ga-preview-cat"><Icon name={art.icon as any} width={14} height={14} /><span>{art.category}</span></div>
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
                {act.icon && <Icon name={act.icon as any} width={16} height={16} />}
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
        <h2 className="ga-hero-title"><Icon name={art.icon as any} width={30} height={30} /> {art.name}</h2>
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

