import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getGameArt, GameArt, GAME_ART, FEATURED_ROTATION, getPosterUrl } from '../lib/gameArt';
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
  const gid = (n: string) => `${uid}-${n}`;
  const [imgFailed, setImgFailed] = React.useState(false);
  const posterSrc = art.poster ?? getPosterUrl(art.id);
  const hasPoster = !!posterSrc && !imgFailed;

  const scene = renderGameScene(art, gid);

  return (
    <div className={`ga-poster ${className}`} data-game={uid} style={{ ["--ga-p" as any]: p, ["--ga-s" as any]: s, ["--ga-a" as any]: a }}>
      <svg className="ga-poster__svg" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" role="img" aria-label={art.name}>
        {scene}
      </svg>
      {posterSrc ? (
        <img
          className="ga-poster__img"
          src={posterSrc}
          alt={art.name}
          loading="lazy"
          draggable={false}
          data-loaded={hasPoster ? "1" : "0"}
          onError={() => setImgFailed(true)}
          style={{ opacity: hasPoster ? 1 : 0 }}
        />
      ) : null}
      <span className="ga-poster__grain" aria-hidden="true" />
      <span className="ga-poster__vignette" aria-hidden="true" />
    </div>
  );
}

// ---- Cinematic per-game poster scenes ----
function renderGameScene(art: GameArt, gid: (n: string) => string): React.ReactNode {
  const p = art.primary;
  const s = art.secondary;
  const a = art.accent;

  const defs = (
    <defs>
      <linearGradient id={gid("sky")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={s} stopOpacity="0.55" />
        <stop offset="45%" stopColor="#0b0e18" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#05060c" />
      </linearGradient>
      <radialGradient id={gid("glow")} cx="50%" cy="30%" r="75%">
        <stop offset="0%" stopColor={a} stopOpacity="0.7" />
        <stop offset="40%" stopColor={p} stopOpacity="0.25" />
        <stop offset="100%" stopColor={p} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={gid("floor")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={p} stopOpacity="0.45" />
        <stop offset="100%" stopColor="#04060c" stopOpacity="0.95" />
      </linearGradient>
      <filter id={gid("blur")} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <filter id={gid("soft")} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.2" />
      </filter>
        {/* cinematic depth + lighting defs */}
        <radialGradient id={gid("toplight")} cx="50%" cy="0%" r="90%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.30" />
          <stop offset="38%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={gid("haze")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p} stopOpacity="0" />
          <stop offset="62%" stopColor={p} stopOpacity="0.05" />
          <stop offset="100%" stopColor={s} stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={gid("reflect")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={gid("cshadow")} x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.55" />
        </filter>
        <filter id={gid("spec")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="sb" />
          <feSpecularLighting in="sb" surfaceScale="3" specularConstant="0.9" specularExponent="18" lightingColor="#ffffff" result="sl">
            <fePointLight x="120" y="-40" z="180" />
          </feSpecularLighting>
          <feComposite in="sl" in2="SourceAlpha" operator="in" result="slc" />
          <feComposite in="SourceGraphic" in2="slc" operator="arithmetic" k1="0" k2="1" k3="0.85" k4="0" />
        </filter>
        <filter id={gid("filmgrain")}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0" result="ng" />
          <feComponentTransfer in="ng" result="ngc"><feFuncA type="linear" slope="0.5" /></feComponentTransfer>
        </filter>
        <filter id={gid("mblur")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.2 0.2" />
        </filter>
    </defs>
  );

  const atmosphere = (
    <g>
      <rect x="0" y="0" width="400" height="240" fill={`url(#${gid("sky")})`} />
      <rect x="0" y="0" width="400" height="240" fill={`url(#${gid("glow")})`} />
    </g>
  );

  let body: React.ReactNode;
  switch (art.motif) {
    case "turf":
      body = (
        <g>
          <polygon points="60,240 340,240 300,120 100,120" fill={`url(#${gid("floor")})`} />
          <polygon points="60,240 340,240 300,120 100,120" fill={p} opacity="0.28" />
          {[0,1,2,3,4].map((i) => (
            <polygon key={i} points={`${100 + i * 8},120 ${108 + i * 8},120 ${68 + i * 16},240 ${52 + i * 16},240`} fill="#0c1d12" opacity={0.25 + i * 0.05} />
          ))}
          <line x1="100" y1="120" x2="60" y2="240" stroke={a} strokeWidth="3" opacity="0.9" filter={`url(#${gid("soft")})`} />
          <line x1="300" y1="120" x2="340" y2="240" stroke={a} strokeWidth="3" opacity="0.9" filter={`url(#${gid("soft")})`} />
          <rect x="180" y="150" width="44" height="14" rx="3" fill="#03130b" opacity="0.85" />
          <ellipse cx="202" cy="166" rx="30" ry="6" fill="#000" opacity="0.4" filter={`url(#${gid("soft")})`} />
          <ellipse cx="200" cy="150" rx="14" ry="6" fill="#02100a" />
          <ellipse cx="200" cy="149" rx="9" ry="4" fill="#000" />
          <line x1="200" y1="150" x2="200" y2="104" stroke={s} strokeWidth="2" />
          <polygon points="200,104 224,110 200,118" fill={a} />
          <g>
            <ellipse cx="250" cy="206" rx="22" ry="4" fill={p} opacity="0.2" />
            <line x1="300" y1="218" x2="252" y2="206" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.18" filter={`url(#${gid("blur")})`} />
            <circle cx="250" cy="204" r="9" fill="#f4f7ff" />
            <circle cx="247" cy="201" r="3" fill="#fff" />
            <ellipse cx="250" cy="214" rx="9" ry="2.5" fill="#000" opacity="0.4" />
          </g>
          <ellipse cx="200" cy="90" rx="150" ry="50" fill={a} opacity="0.12" filter={`url(#${gid("blur")})`} />
        </g>
      );
      break;
    case "felt":
      body = (
        <g>
          <ellipse cx="200" cy="40" rx="120" ry="40" fill={a} opacity="0.22" filter={`url(#${gid("blur")})`} />
          <polygon points="40,90 360,90 392,222 8,222" fill={`url(#${gid("floor")})`} />
          <polygon points="40,90 360,90 392,222 8,222" fill={p} opacity="0.45" />
          <polygon points="32,84 368,84 360,90 40,90" fill="#3a2412" />
          <polygon points="8,222 40,90 32,84 -2,224" fill="#2a1a0d" />
          <polygon points="392,222 360,90 368,84 402,224" fill="#2a1a0d" />
          <circle cx="40" cy="92" r="9" fill="#060606" />
          <circle cx="360" cy="92" r="9" fill="#060606" />
          <circle cx="10" cy="218" r="11" fill="#060606" />
          <circle cx="390" cy="218" r="11" fill="#060606" />
          <ellipse cx="200" cy="150" rx="120" ry="36" fill="#fff" opacity="0.05" />
          {[[170,170,p],[200,168,a],[230,170,s],[185,150,s],[215,150,a],[200,134,"#f4f7ff"]].map((b,i)=>(
            <g key={i}>
              <ellipse cx={b[0] as number} cy={(b[1] as number)+9} rx="10" ry="3" fill="#000" opacity="0.45" />
              <circle cx={b[0] as number} cy={b[1] as number} r="9" fill={b[2] as string} />
              <circle cx={(b[0] as number)-3} cy={(b[1] as number)-3} r="3" fill="#fff" opacity="0.8" />
            </g>
          ))}
          <ellipse cx="120" cy="190" rx="10" ry="3" fill="#000" opacity="0.45" />
          <circle cx="120" cy="184" r="9" fill="#f8fbff" />
          <circle cx="117" cy="181" r="3" fill="#fff" />
          <line x1="60" y1="232" x2="116" y2="186" stroke="#caa46a" strokeWidth="4" strokeLinecap="round" />
          <circle cx="116" cy="186" r="2.5" fill="#1a4ed8" />
        </g>
      );
      break;
    case "rink":
      body = (
        <g>
          <polygon points="70,70 330,70 392,224 8,224" fill={`url(#${gid("floor")})`} />
          <polygon points="70,70 330,70 392,224 8,224" fill={p} opacity="0.3" />
          <line x1="70" y1="70" x2="8" y2="224" stroke={a} strokeWidth="4" filter={`url(#${gid("soft")})`} />
          <line x1="330" y1="70" x2="392" y2="224" stroke={a} strokeWidth="4" filter={`url(#${gid("soft")})`} />
          <line x1="70" y1="70" x2="330" y2="70" stroke={s} strokeWidth="3" opacity="0.8" />
          <line x1="49" y1="147" x2="351" y2="147" stroke="#9fd8ff" strokeWidth="2" opacity="0.5" />
          <ellipse cx="200" cy="147" rx="34" ry="14" fill="none" stroke="#9fd8ff" strokeWidth="2" opacity="0.5" />
          <rect x="160" y="64" width="80" height="8" rx="4" fill={a} opacity="0.9" filter={`url(#${gid("soft")})`} />
          <rect x="150" y="220" width="100" height="10" rx="5" fill={a} opacity="0.9" filter={`url(#${gid("soft")})`} />
          <line x1="120" y1="110" x2="232" y2="180" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity="0.2" filter={`url(#${gid("blur")})`} />
          <ellipse cx="232" cy="190" rx="14" ry="4" fill="#000" opacity="0.4" />
          <ellipse cx="232" cy="180" rx="13" ry="6" fill="#10131c" />
          <ellipse cx="232" cy="178" rx="13" ry="5" fill="#2a3550" />
          <ellipse cx="150" cy="118" rx="20" ry="8" fill="#000" opacity="0.35" />
          <ellipse cx="150" cy="110" rx="20" ry="9" fill={s} />
          <ellipse cx="150" cy="107" rx="11" ry="5" fill={a} />
          <ellipse cx="255" cy="206" rx="24" ry="9" fill="#000" opacity="0.35" />
          <ellipse cx="255" cy="198" rx="24" ry="10" fill={p} />
          <ellipse cx="255" cy="195" rx="13" ry="5" fill="#fff" opacity="0.5" />
        </g>
      );
      break;
    case "board":
      body = (
        <g>
          <ellipse cx="200" cy="20" rx="150" ry="70" fill={a} opacity="0.18" filter={`url(#${gid("blur")})`} />
          <polygon points="90,110 310,110 392,228 8,228" fill="#0a0c14" />
          {[0,1,2,3,4,5,6,7].map((r)=>(
            <g key={r}>
              {[0,1,2,3,4,5,6,7].map((cc)=>{
                const spread = 110 + r * 39;
                const spreadN = 110 + (r+1) * 39;
                const top = 110 + r * 14.75;
                const bot = 110 + (r+1) * 14.75;
                const x0 = 200 - spread / 2 + cc * (spread / 8);
                const x0n = 200 - spread / 2 + (cc+1) * (spread / 8);
                const x1 = 200 - spreadN / 2 + cc * (spreadN / 8);
                const x1n = 200 - spreadN / 2 + (cc+1) * (spreadN / 8);
                return (cc + r) % 2 === 0 ? (
                  <polygon key={cc} points={`${x0},${top} ${x0n},${top} ${x1n},${bot} ${x1},${bot}`} fill={p} opacity={0.18 + r * 0.04} />
                ) : null;
              })}
            </g>
          ))}
          <polygon points="178,154 222,154 230,176 170,176" fill={a} opacity="0.35" filter={`url(#${gid("soft")})`} />
          <ellipse cx="205" cy="176" rx="26" ry="7" fill="#000" opacity="0.5" />
          <g fill={s}>
            <rect x="194" y="120" width="22" height="50" rx="6" />
            <ellipse cx="205" cy="120" rx="14" ry="6" />
            <rect x="201" y="96" width="8" height="22" rx="2" />
            <rect x="195" y="100" width="20" height="6" rx="3" />
          </g>
          <rect x="197" y="124" width="5" height="42" fill="#fff" opacity="0.25" />
          <g fill={p} opacity="0.85">
            <rect x="150" y="138" width="16" height="34" rx="5" />
            <polygon points="150,138 158,120 166,138" fill={p} />
            <circle cx="158" cy="118" r="4" fill={a} />
          </g>
          <ellipse cx="158" cy="174" rx="18" ry="5" fill="#000" opacity="0.45" />
        </g>
      );
      break;
    case "cyber":
      body = (
        <g>
          {[0,1,2,3,4,5,6,7].map((i)=>{
            const y = 130 + i * i * 1.7;
            return <line key={`h${i}`} x1="0" y1={y} x2="400" y2={y} stroke={a} strokeWidth={0.6 + i * 0.25} opacity={0.25 + i * 0.07} />;
          })}
          {[-6,-4,-2,0,2,4,6].map((i)=>(
            <line key={`v${i}`} x1={200 + i * 8} y1="130" x2={200 + i * 60} y2="240" stroke={a} strokeWidth="1" opacity="0.4" />
          ))}
          <polygon points="0,130 0,40 60,70 60,130" fill={p} opacity="0.2" />
          <polygon points="400,130 400,40 340,70 340,130" fill={s} opacity="0.2" />
          <line x1="0" y1="130" x2="0" y2="40" stroke={a} strokeWidth="3" filter={`url(#${gid("soft")})`} />
          <line x1="400" y1="130" x2="400" y2="40" stroke={a} strokeWidth="3" filter={`url(#${gid("soft")})`} />
          <path d="M40,232 L40,170 L210,170" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" filter={`url(#${gid("soft")})`} />
          <path d="M40,232 L40,170 L210,170" fill="none" stroke="#fff" strokeWidth="1.5" />
          <path d="M360,232 L360,190 L150,190" fill="none" stroke={s} strokeWidth="5" strokeLinecap="round" filter={`url(#${gid("soft")})`} />
          <path d="M360,232 L360,190 L150,190" fill="none" stroke="#fff" strokeWidth="1.5" />
          <g>
            <rect x="200" y="162" width="22" height="9" rx="3" fill="#fff" />
            <polygon points="222,162 232,166 222,171" fill={a} />
            <ellipse cx="244" cy="170" rx="22" ry="4" fill={a} opacity="0.25" filter={`url(#${gid("blur")})`} />
          </g>
          <g>
            <rect x="128" y="182" width="22" height="9" rx="3" fill="#fff" />
            <polygon points="128,182 118,186 128,191" fill={s} />
          </g>
          <ellipse cx="200" cy="130" rx="200" ry="20" fill={a} opacity="0.2" filter={`url(#${gid("blur")})`} />
        </g>
      );
      break;
    case "court":
      body = (
        <g>
          {[60,140,260,340].map((x,i)=>(
            <g key={i}>
              <ellipse cx={x} cy="26" rx="26" ry="9" fill={a} opacity="0.25" filter={`url(#${gid("blur")})`} />
              <rect x={x-9} y="18" width="18" height="7" rx="2" fill="#dfe7ff" opacity="0.8" />
            </g>
          ))}
          <polygon points="80,96 320,96 392,228 8,228" fill={`url(#${gid("floor")})`} />
          <polygon points="80,96 320,96 392,228 8,228" fill="#7a3d12" opacity="0.4" />
          <polygon points="168,96 232,96 250,150 150,150" fill="none" stroke="#ffd9a8" strokeWidth="2" opacity="0.6" />
          <path d="M120,180 Q200,210 280,180" fill="none" stroke="#ffd9a8" strokeWidth="2" opacity="0.6" />
          <line x1="40" y1="228" x2="360" y2="228" stroke="#ffd9a8" strokeWidth="2" opacity="0.4" />
          <rect x="178" y="58" width="44" height="28" rx="2" fill="#0b0e18" stroke="#cfd8ff" strokeWidth="1.5" opacity="0.9" />
          <ellipse cx="200" cy="92" rx="16" ry="5" fill="none" stroke={a} strokeWidth="3" filter={`url(#${gid("soft")})`} />
          <path d="M186,93 L190,108 M200,93 L200,110 M214,93 L210,108" stroke="#fff" strokeWidth="1" opacity="0.5" />
          <path d="M120,180 Q170,120 198,98" fill="none" stroke={a} strokeWidth="3" opacity="0.3" strokeDasharray="2 6" />
          <line x1="150" y1="150" x2="120" y2="182" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.18" filter={`url(#${gid("blur")})`} />
          <circle cx="120" cy="182" r="13" fill={p} />
          <path d="M107,182 H133 M120,169 V195 M111,173 Q120,182 111,191 M129,173 Q120,182 129,191" stroke="#3a1c08" strokeWidth="1.4" fill="none" />
          <circle cx="116" cy="178" r="3.5" fill="#fff" opacity="0.5" />
          <g fill="#04060c" opacity="0.85">
            <circle cx="270" cy="150" r="11" />
            <path d="M270,160 Q256,178 250,210 L262,210 Q270,184 278,210 L290,210 Q284,178 270,160 Z" />
            <path d="M262,168 L240,150 M278,168 L300,144" stroke="#04060c" strokeWidth="7" strokeLinecap="round" />
          </g>
        </g>
      );
      break;
    case "field":
      body = (
        <g>
          {[50,150,250,350].map((x,i)=>(
            <g key={i}>
              <ellipse cx={x} cy="22" rx="30" ry="10" fill={a} opacity="0.22" filter={`url(#${gid("blur")})`} />
              <rect x={x-10} y="14" width="20" height="7" rx="2" fill="#eaf0ff" opacity="0.75" />
            </g>
          ))}
          <polygon points="40,88 360,88 400,232 0,232" fill={`url(#${gid("floor")})`} />
          <polygon points="40,88 360,88 400,232 0,232" fill={p} opacity="0.45" />
          {[0,1,2,3,4].map((i)=>{
            const t = i / 4;
            const y = 88 + 144 * t;
            const half = 160 + 40 * t;
            return <line key={i} x1={200 - half} y1={y} x2={200 + half} y2={y} stroke="#dff5e4" strokeWidth={1 + i * 0.6} opacity={0.3 + i * 0.08} />;
          })}
          <g stroke={a} strokeWidth="3" fill="none" filter={`url(#${gid("soft")})`}>
            <line x1="200" y1="88" x2="200" y2="66" />
            <line x1="184" y1="66" x2="216" y2="66" />
            <line x1="184" y1="66" x2="184" y2="50" />
            <line x1="216" y1="66" x2="216" y2="50" />
          </g>
          <line x1="150" y1="150" x2="118" y2="172" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.18" filter={`url(#${gid("blur")})`} />
          <ellipse cx="118" cy="172" rx="14" ry="9" fill="#7a3a16" transform="rotate(-25 118 172)" />
          <line x1="112" y1="170" x2="124" y2="174" stroke="#fff" strokeWidth="1.4" />
          {[[250,160,0.9],[290,150,0.7],[180,176,0.6]].map((q,i)=>(
            <g key={i} fill="#04060c" opacity={q[2] as number}>
              <circle cx={q[0] as number} cy={q[1] as number} r="9" />
              <path d={`M${q[0]},${(q[1] as number)+8} Q${(q[0] as number)-12},${(q[1] as number)+22} ${(q[0] as number)-8},${(q[1] as number)+44} L${(q[0] as number)+8},${(q[1] as number)+44} Q${(q[0] as number)+12},${(q[1] as number)+22} ${q[0]},${(q[1] as number)+8} Z`} />
            </g>
          ))}
        </g>
      );
      break;
    case "speed":
      body = (
        <g>
          <ellipse cx="200" cy="70" rx="170" ry="40" fill={s} opacity="0.25" filter={`url(#${gid("blur")})`} />
          <polygon points="150,90 250,90 392,232 8,232" fill="#0a0c14" />
          <polygon points="160,96 240,96 360,232 40,232" fill={`url(#${gid("floor")})`} />
          {[0,1,2,3,4,5].map((i)=>{
            const t = i / 5;
            const y = 100 + 132 * t;
            const w = 2 + t * 10;
            return <rect key={i} x={200 - w / 2} y={y} width={w} height={6 + t * 14} rx="2" fill="#ffd54a" opacity={0.5 + t * 0.4} />;
          })}
          <line x1="160" y1="96" x2="40" y2="232" stroke={a} strokeWidth="3" filter={`url(#${gid("soft")})`} />
          <line x1="240" y1="96" x2="360" y2="232" stroke={a} strokeWidth="3" filter={`url(#${gid("soft")})`} />
          {[0,1,2,3].map((i)=>(
            <line key={i} x1={70 + i * 90} y1={60 + i * 6} x2={120 + i * 90} y2={60 + i * 6} stroke="#fff" strokeWidth="2" opacity="0.15" />
          ))}
          <ellipse cx="200" cy="206" rx="42" ry="9" fill="#000" opacity="0.5" />
          <rect x="150" y="208" width="100" height="22" rx="6" fill="#fff" opacity="0.12" filter={`url(#${gid("blur")})`} />
          <g>
            <polygon points="170,196 230,196 244,214 156,214" fill={p} />
            <polygon points="180,180 220,180 230,196 170,196" fill={s} />
            <rect x="186" y="182" width="28" height="12" rx="3" fill="#0a0c14" />
            <rect x="188" y="184" width="24" height="6" rx="2" fill={a} opacity="0.7" />
            <rect x="152" y="210" width="14" height="10" rx="3" fill="#111" />
            <rect x="234" y="210" width="14" height="10" rx="3" fill="#111" />
            <ellipse cx="200" cy="214" rx="44" ry="6" fill={a} opacity="0.18" filter={`url(#${gid("blur")})`} />
            <polygon points="170,212 156,232 176,232" fill={a} opacity="0.25" />
            <polygon points="230,212 244,232 224,232" fill={a} opacity="0.25" />
          </g>
        </g>
      );
      break;
    case "grid":
      body = (
        <g>
          <ellipse cx="200" cy="40" rx="130" ry="40" fill={a} opacity="0.18" filter={`url(#${gid("blur")})`} />
          <rect x="118" y="70" width="164" height="150" rx="14" fill={p} opacity="0.5" />
          <rect x="118" y="70" width="164" height="150" rx="14" fill="none" stroke={a} strokeWidth="2" opacity="0.6" />
          <rect x="124" y="74" width="60" height="142" rx="10" fill="#fff" opacity="0.06" />
          {[0,1,2,3].map((r)=>[0,1,2,3,4].map((cc)=>{
            const cx = 138 + cc * 31, cy = 92 + r * 33;
            const filled = (r >= 2 && cc < 3) || (r === 1 && cc === 1);
            const col = filled ? ((r + cc) % 2 === 0 ? a : s) : "#070a12";
            return (
              <g key={`${r}-${cc}`}>
                <circle cx={cx} cy={cy} r="12" fill={col} />
                {filled ? <circle cx={cx - 3} cy={cy - 3} r="3.5" fill="#fff" opacity="0.5" /> : <circle cx={cx} cy={cy} r="12" fill="#000" opacity="0.4" />}
              </g>
            );
          }))}
          <line x1="231" y1="40" x2="231" y2="78" stroke={a} strokeWidth="20" strokeLinecap="round" opacity="0.12" filter={`url(#${gid("blur")})`} />
          <circle cx="231" cy="56" r="12" fill={a} />
          <circle cx="228" cy="53" r="3.5" fill="#fff" opacity="0.7" />
        </g>
      );
      break;
    case "versus":
      body = (
        <g>
          <ellipse cx="200" cy="120" rx="140" ry="80" fill={a} opacity="0.16" filter={`url(#${gid("blur")})`} />
          <polygon points="200,40 214,108 200,200 186,108" fill={a} opacity="0.3" filter={`url(#${gid("soft")})`} />
          <polygon points="60,120 132,106 340,120 132,134" fill={a} opacity="0.2" />
          <ellipse cx="120" cy="170" rx="42" ry="10" fill="#000" opacity="0.4" />
          <g fill={p}>
            <rect x="78" y="118" width="74" height="48" rx="20" />
            <circle cx="92" cy="120" r="11" />
            <circle cx="112" cy="116" r="12" />
            <circle cx="132" cy="120" r="11" />
          </g>
          <rect x="84" y="124" width="20" height="28" rx="8" fill="#fff" opacity="0.18" />
          <ellipse cx="288" cy="170" rx="40" ry="10" fill="#000" opacity="0.4" />
          <g fill={s}>
            <rect x="250" y="128" width="60" height="40" rx="16" />
            <rect x="246" y="96" width="16" height="44" rx="8" transform="rotate(-18 254 118)" />
            <rect x="270" y="96" width="16" height="44" rx="8" transform="rotate(8 278 118)" />
          </g>
          <rect x="294" y="132" width="14" height="24" rx="6" fill="#fff" opacity="0.18" />
        </g>
      );
      break;
    case "dots":
      body = (
        <g>
          <ellipse cx="200" cy="50" rx="120" ry="36" fill={a} opacity="0.16" filter={`url(#${gid("blur")})`} />
          <rect x="150" y="120" width="60" height="60" rx="6" fill={a} opacity="0.25" filter={`url(#${gid("soft")})`} />
          {[0,1,2,3].map((r)=>[0,1,2,3].map((cc)=>{
            const x = 100 + cc * 60, y = 60 + r * 60;
            const drawn = (r < 2 && cc < 2) || (r === 2 && cc === 1);
            return (
              <g key={`${r}-${cc}`}>
                {cc < 3 ? <line x1={x} y1={y} x2={x + 60} y2={y} stroke={drawn ? a : "#1a2235"} strokeWidth={drawn ? 3 : 2} opacity={drawn ? 0.95 : 0.6} filter={drawn ? `url(#${gid("soft")})` : undefined} /> : null}
                {r < 3 ? <line x1={x} y1={y} x2={x} y2={y + 60} stroke={drawn ? s : "#1a2235"} strokeWidth={drawn ? 3 : 2} opacity={drawn ? 0.95 : 0.6} /> : null}
              </g>
            );
          }))}
          {[0,1,2,3].map((r)=>[0,1,2,3].map((cc)=>(
            <g key={`d${r}-${cc}`}>
              <circle cx={100 + cc * 60} cy={60 + r * 60} r="6" fill={p} />
              <circle cx={100 + cc * 60} cy={60 + r * 60} r="2.5" fill="#fff" opacity="0.8" />
            </g>
          )))}
        </g>
      );
      break;
    case "lane":
      body = (
        <g>
          <ellipse cx="200" cy="36" rx="120" ry="34" fill={a} opacity="0.18" filter={`url(#${gid("blur")})`} />
          <polygon points="150,60 250,60 360,232 40,232" fill={`url(#${gid("floor")})`} />
          <polygon points="150,60 250,60 360,232 40,232" fill="#caa46a" opacity="0.35" />
          {[-3,-2,-1,0,1,2,3].map((i)=>(
            <line key={i} x1={200 + i * 14} y1="60" x2={200 + i * 44} y2="232" stroke="#3a2a12" strokeWidth="1" opacity="0.5" />
          ))}
          <line x1="150" y1="60" x2="40" y2="232" stroke={a} strokeWidth="3" filter={`url(#${gid("soft")})`} />
          <line x1="250" y1="60" x2="360" y2="232" stroke={a} strokeWidth="3" filter={`url(#${gid("soft")})`} />
          {[[200,70],[190,80],[210,80],[180,90],[200,90],[220,90]].map((q,i)=>(
            <g key={i}>
              <ellipse cx={q[0]} cy={q[1]+6} rx="5" ry="1.6" fill="#000" opacity="0.4" />
              <path d={`M${q[0]-3},${q[1]+4} Q${q[0]-4},${q[1]-6} ${q[0]},${q[1]-10} Q${q[0]+4},${q[1]-6} ${q[0]+3},${q[1]+4} Z`} fill="#f4f7ff" />
              <rect x={q[0]-3} y={q[1]-4} width="6" height="2" fill={s} opacity="0.8" />
            </g>
          ))}
          <line x1="200" y1="226" x2="200" y2="150" stroke={p} strokeWidth="22" strokeLinecap="round" opacity="0.12" filter={`url(#${gid("blur")})`} />
          <ellipse cx="200" cy="214" rx="20" ry="6" fill="#000" opacity="0.4" />
          <circle cx="200" cy="200" r="20" fill={p} />
          <circle cx="192" cy="194" r="4" fill="#0a0c14" />
          <circle cx="202" cy="192" r="4" fill="#0a0c14" />
          <circle cx="197" cy="200" r="4" fill="#0a0c14" />
          <circle cx="192" cy="192" r="5" fill="#fff" opacity="0.3" />
        </g>
      );
      break;
    case "tower":
      body = (
        <g>
          <ellipse cx="200" cy="50" rx="120" ry="40" fill={a} opacity="0.16" filter={`url(#${gid("blur")})`} />
          {[0,1,2,3,4,5].map((i)=>{
            const w = 120 - i * 6;
            const x = 200 - w / 2 + Math.sin(i) * 10;
            const y = 210 - i * 26;
            const col = i % 2 === 0 ? p : s;
            return (
              <g key={i}>
                <rect x={x} y={y} width={w} height="22" rx="3" fill={col} />
                <polygon points={`${x},${y} ${x+10},${y-8} ${x+w+10},${y-8} ${x+w},${y}`} fill={col} opacity="0.7" />
                <polygon points={`${x+w},${y} ${x+w+10},${y-8} ${x+w+10},${y+14} ${x+w},${y+22}`} fill="#000" opacity="0.35" />
                <rect x={x+4} y={y+4} width={w-8} height="4" rx="2" fill="#fff" opacity="0.18" />
              </g>
            );
          })}
          <line x1="140" y1="44" x2="260" y2="44" stroke={a} strokeWidth="22" strokeLinecap="round" opacity="0.1" filter={`url(#${gid("blur")})`} />
          <rect x="234" y="34" width="90" height="22" rx="3" fill={a} />
          <rect x="238" y="38" width="82" height="4" rx="2" fill="#fff" opacity="0.3" />
        </g>
      );
      break;
    case "blocks":
      body = (
        <g>
          <ellipse cx="200" cy="50" rx="130" ry="40" fill={a} opacity="0.16" filter={`url(#${gid("blur")})`} />
          <rect x="120" y="60" width="160" height="160" rx="10" fill={p} opacity="0.18" stroke={a} strokeWidth="1.5" />
          {[[0,0,a],[1,0,s],[2,0,a],[0,1,p],[2,1,s],[0,2,s],[1,2,a],[3,2,p],[1,3,s],[2,3,a]].map((b,i)=>{
            const x = 130 + (b[0] as number) * 38, y = 70 + (b[1] as number) * 38;
            return (
              <g key={i}>
                <rect x={x} y={y} width="32" height="32" rx="6" fill={b[2] as string} />
                <polygon points={`${x},${y} ${x+32},${y} ${x+26},${y+6} ${x+6},${y+6}`} fill="#fff" opacity="0.3" />
                <polygon points={`${x},${y} ${x},${y+32} ${x+6},${y+26} ${x+6},${y+6}`} fill="#fff" opacity="0.15" />
                <rect x={x+22} y={y+22} width="6" height="6" rx="1" fill="#000" opacity="0.25" />
              </g>
            );
          })}
          <g opacity="0.9">
            {[0,45,90,135,180,225,270,315].map((ang,i)=>{
              const rad = (ang * Math.PI) / 180;
              const cx = 244, cy = 184;
              return <line key={i} x1={cx + Math.cos(rad) * 12} y1={cy + Math.sin(rad) * 12} x2={cx + Math.cos(rad) * 30} y2={cy + Math.sin(rad) * 30} stroke={a} strokeWidth="3" strokeLinecap="round" filter={`url(#${gid("soft")})`} />;
            })}
            <circle cx="244" cy="184" r="9" fill="#fff" />
          </g>
        </g>
      );
      break;
    case "cups":
      body = (
        <g>
          <ellipse cx="200" cy="44" rx="120" ry="36" fill={a} opacity="0.18" filter={`url(#${gid("blur")})`} />
          <polygon points="40,150 360,150 392,232 8,232" fill={`url(#${gid("floor")})`} />
          <line x1="40" y1="150" x2="360" y2="150" stroke={a} strokeWidth="2" opacity="0.5" />
          {[[200,150],[180,150],[220,150],[160,150],[240,150],[190,128],[210,128],[170,128],[230,128],[200,106]].map((q,i)=>(
            <g key={i}>
              <ellipse cx={q[0]} cy={q[1]+14} rx="13" ry="3.5" fill="#000" opacity="0.35" />
              <path d={`M${q[0]-13},${q[1]} L${q[0]-10},${q[1]+16} L${q[0]+10},${q[1]+16} L${q[0]+13},${q[1]} Z`} fill={i % 2 === 0 ? p : s} />
              <ellipse cx={q[0]} cy={q[1]} rx="13" ry="4" fill={i % 2 === 0 ? a : "#fff"} opacity="0.5" />
              <rect x={q[0]-11} y={q[1]+2} width="4" height="12" fill="#fff" opacity="0.2" />
            </g>
          ))}
          <path d="M70,200 Q150,90 200,100" fill="none" stroke={a} strokeWidth="2" strokeDasharray="2 6" opacity="0.5" />
          <circle cx="200" cy="100" r="9" fill="#f4f7ff" />
          <circle cx="197" cy="97" r="3" fill="#fff" />
          <g fill={a}>
            <polygon points="186,84 192,72 200,82 208,72 214,84" />
            <rect x="186" y="84" width="28" height="5" rx="2" />
          </g>
        </g>
      );
      break;
    default:
      body = (
        <g>
          <ellipse cx="200" cy="110" rx="150" ry="80" fill={a} opacity="0.18" filter={`url(#${gid("blur")})`} />
          <polygon points="100,100 300,100 380,228 20,228" fill={`url(#${gid("floor")})`} />
          {[0,1,2,3].map((i)=>(
            <line key={i} x1={200 - 70 - i * 40} y1={120 + i * 30} x2={200 + 70 + i * 40} y2={120 + i * 30} stroke={a} strokeWidth="1.5" opacity={0.4 - i * 0.07} />
          ))}
          <circle cx="200" cy="150" r="34" fill={p} />
          <circle cx="200" cy="150" r="34" fill="none" stroke={a} strokeWidth="3" filter={`url(#${gid("soft")})`} />
          <circle cx="190" cy="140" r="9" fill="#fff" opacity="0.4" />
        </g>
      );
      break;
  }

  return (
    <g>
      {defs}
      {atmosphere}
      <g>{body}</g>
        {/* cinematic depth + atmosphere overlays (apply to every scene) */}
        <rect x="0" y="118" width="400" height="122" fill={`url(#${gid("haze")})`} opacity="0.9" />
        <rect x="0" y="0" width="400" height="240" fill={`url(#${gid("toplight")})`} opacity="0.85" style={{ mixBlendMode: "screen" }} />
        <rect x="0" y="150" width="400" height="90" fill={`url(#${gid("reflect")})`} opacity="0.35" style={{ mixBlendMode: "screen" }} />
        <rect x="0" y="0" width="400" height="240" fill={`url(#${gid("filmgrain")})`} opacity="0.05" style={{ mixBlendMode: "overlay" }} />
      <rect x="0" y="0" width="400" height="240" fill={`url(#${gid("glow")})`} opacity="0.35" />
      <rect x="0" y="170" width="400" height="70" fill="#04060c" opacity="0.45" />
    </g>
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
// Cross-fades between game "worlds" so the whole page takes on the selected
// game's atmosphere (pool hall, cyber grid, neon course...). Set fixed to pin
// it to the viewport for an immersive scroll.
export function DynamicGameBackdrop({ gameId, intensity = 1, fixed = false }: { gameId: string; intensity?: number; fixed?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [stack, setStack] = useState<{ id: string; k: number }[]>([{ id: gameId, k: 0 }]);
  const kRef = useRef(0);
  useEffect(() => {
    setStack((prev) => {
      if (prev[prev.length - 1].id === gameId) return prev;
      kRef.current += 1;
      return [...prev, { id: gameId, k: kRef.current }].slice(-2);
    });
  }, [gameId]);
  // drop the older layer once the cross-fade finishes
  useEffect(() => {
    if (stack.length < 2) return;
    const t = window.setTimeout(() => setStack((prev) => prev.slice(-1)), 950);
    return () => window.clearTimeout(t);
  }, [stack]);
  return (
    <div
      className={`ga-backdrop ${fixed ? "ga-fixed" : ""} ${reduced ? "ga-still" : ""}`}
      style={{ opacity: intensity }}
      aria-hidden="true"
      data-game={gameId}
    >
      {stack.map((l, i) => {
        const art = getGameArt(l.id);
        return (
          <div key={l.k} className={`ga-bd-layer ${i === stack.length - 1 ? "ga-bd-in" : "ga-bd-out"}`} style={gameVars(art)}>
            <div className="ga-backdrop-grad" />
            <div className="ga-backdrop-art"><GameArtSVG art={art} className="ga-bleed" /></div>
          </div>
        );
      })}
      <div className="ga-backdrop-sweep" aria-hidden="true" />
      <div className="ga-backdrop-grain" />
      <div className="ga-backdrop-vig" aria-hidden="true" />
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

