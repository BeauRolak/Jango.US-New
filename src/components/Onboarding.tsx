import { useEffect, useState } from "react";
import { Icon, type IconName } from "./Icon";
import { useFeedback, rewardPop } from "./Juice";
import { useOnboarding } from "../lib/platform";
import "./onboarding.css";

/* =====================================================================
   OnboardingFlow — premium first-run walkthrough of the Jango arena.
   Full-screen, mobile-friendly, skip/back/next/finish, reward on finish.
   Controlled via props so it can be opened from first-visit OR Settings.
   ===================================================================== */

interface Step { eyebrow: string; title: string; body: string; icon: IconName; art: JSX.Element }

const ACC = "#6f8cff";

const STEPS: Step[] = [
  {
    eyebrow: "Welcome", title: "This is the arena", icon: "Swords",
    body: "Jango.US is a competitive skill-gaming arena. Real games, real opponents, real stakes — no luck, no house edge against you.",
    art: <ArenaArt />,
  },
  {
    eyebrow: "Currency", title: "Scalps power everything", icon: "Coins",
    body: "Scalps are your in-platform credits for match entries, the shop, tournaments and rewards. 1 Scalp = $1. Balances are demo only in this build — no real money moves yet.",
    art: <ScalpsArt />,
  },
  {
    eyebrow: "Compete", title: "Skill matches, 1v1", icon: "Target",
    body: "Pick a game, set your entry in Scalps, and battle. The pot is both entries, a flat 3% platform rake is taken, and the winner collects the rest — shown before you ever enter.",
    art: <MatchArt />,
  },
  {
    eyebrow: "Events", title: "Tournaments & brackets", icon: "Trophy",
    body: "Jump into live events with bigger prize pools. Buy in, climb the bracket, and chase the top payouts against a full field.",
    art: <BracketArt />,
  },
  {
    eyebrow: "Progress", title: "Rank up, earn rewards", icon: "Medal",
    body: "Every match moves your XP and rank from Bronze to Master. Daily rewards, streaks, weekly challenges and unlocks keep the climb worth it.",
    art: <RankArt />,
  },
  {
    eyebrow: "Identity", title: "Profile & social", icon: "Users",
    body: "Build a competitive identity — frames, badges and titles — add friends, send invites, and see who's online and ready to play.",
    art: <SocialArt />,
  },
  {
    eyebrow: "Go", title: "You're ready", icon: "Play",
    body: "Claim your daily reward, customize your profile, run a training match, then enter a real one. Your seat in the arena is waiting.",
    art: <ReadyArt />,
  },
];

export function OnboardingFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { fire } = useFeedback();
  const { complete } = useOnboarding();
  const [i, setI] = useState(0);

  useEffect(() => { if (open) setI(0); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, i]);

  if (!open) return null;
  const last = i === STEPS.length - 1;
  const step = STEPS[i];

  const next = () => { if (last) return finish(); fire("tap"); setI((n) => Math.min(STEPS.length - 1, n + 1)); };
  const back = () => { if (i === 0) return; fire("tap"); setI((n) => Math.max(0, n - 1)); };
  const skip = () => { fire("tap"); complete(); onClose(); };
  const finish = () => {
    complete(); onClose();
    rewardPop("Welcome to the arena", "Starter reward unlocked");
  };

  return (
    <div className="ob-back" role="dialog" aria-modal="true" aria-label="Welcome to Jango">
      <div className="ob-shell">
        <div className="ob-arenabg" aria-hidden="true" />
        <button className="ob-skip" onClick={skip}>Skip</button>

        <div className="ob-art" key={i}>{step.art}</div>

        <div className="ob-body">
          <span className="ob-eyebrow"><Icon name={step.icon} /> {step.eyebrow}</span>
          <h2 className="ob-title">{step.title}</h2>
          <p className="ob-text">{step.body}</p>
        </div>

        <div className="ob-dots" aria-hidden="true">
          {STEPS.map((_, k) => (
            <button key={k} className={"ob-dot" + (k === i ? " is-on" : k < i ? " is-done" : "")} onClick={() => { fire("tap"); setI(k); }} />
          ))}
        </div>

        <div className="ob-nav">
          <button className="ob-btn ob-btn--ghost" onClick={back} disabled={i === 0}>
            <Icon name="ArrowLeft" /> Back
          </button>
          <span className="ob-count">{i + 1} / {STEPS.length}</span>
          <button className="ob-btn ob-btn--go" onClick={next}>
            {last ? "Start playing" : "Next"} <Icon name={last ? "Play" : "ArrowRight"} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- inline neon art (no emojis, all SVG) ---------------- */
function frame(children: JSX.Element) {
  return <svg viewBox="0 0 320 180" className="ob-svg" style={{ ['--acc' as any]: ACC }}>{children}</svg>;
}
function ArenaArt() {
  return frame(<>
    <defs><radialGradient id="oa1" cx="50%" cy="30%" r="75%"><stop offset="0" stopColor="#3a2a7a" /><stop offset="1" stopColor="#0a0a1e" /></radialGradient></defs>
    <rect width="320" height="180" fill="url(#oa1)" rx="14" />
    <polygon points="60,150 260,150 210,70 110,70" fill="#171636" stroke={ACC} strokeWidth="2" />
    <line x1="160" y1="70" x2="160" y2="150" stroke="rgba(255,255,255,.25)" strokeDasharray="5 6" />
    <circle cx="120" cy="120" r="11" fill="#ff5c8a" /><circle cx="200" cy="120" r="11" fill="#5ad1ff" />
    <circle cx="160" cy="40" r="20" fill="none" stroke={ACC} strokeWidth="2" opacity=".6" />
  </>);
}
function ScalpsArt() {
  return frame(<>
    <rect width="320" height="180" fill="#0c0c20" rx="14" />
    {[0, 1, 2].map((k) => <g key={k} transform={`translate(${110 + k * 35}, ${120 - k * 14})`}>
      <ellipse cx="0" cy="0" rx="34" ry="13" fill="#ffd24a" /><ellipse cx="0" cy="-5" rx="34" ry="13" fill="#ffe48a" stroke="#caa018" strokeWidth="2" />
      <text x="0" y="0" textAnchor="middle" fontSize="14" fontWeight="800" fill="#7a5a00">S</text>
    </g>)}
  </>);
}
function MatchArt() {
  return frame(<>
    <rect width="320" height="180" fill="#0c0c20" rx="14" />
    <rect x="30" y="60" width="110" height="60" rx="10" fill="#171636" stroke="#ff5c8a" strokeWidth="2" />
    <rect x="180" y="60" width="110" height="60" rx="10" fill="#171636" stroke="#5ad1ff" strokeWidth="2" />
    <text x="160" y="96" textAnchor="middle" fontSize="20" fontWeight="900" fill={ACC}>VS</text>
    <text x="85" y="96" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">You</text>
    <text x="235" y="96" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">Rival</text>
    <text x="160" y="150" textAnchor="middle" fontSize="11" fill="#9aa3cf">Pot − 3% rake → winner</text>
  </>);
}
function BracketArt() {
  return frame(<>
    <rect width="320" height="180" fill="#0c0c20" rx="14" />
    {[40, 80, 120].map((y) => <rect key={y} x="30" y={y} width="60" height="22" rx="6" fill="#171636" stroke={ACC} strokeWidth="1.5" />)}
    {[55, 105].map((y) => <rect key={y} x="130" y={y} width="60" height="22" rx="6" fill="#171636" stroke="#5ad1ff" strokeWidth="1.5" />)}
    <rect x="230" y="78" width="60" height="24" rx="6" fill="#2a2150" stroke="#ffd24a" strokeWidth="2" />
    <path d="M90 51 H120 M90 131 H120 M160 77 H190 M190 90 H230" stroke="rgba(255,255,255,.3)" fill="none" />
    <g transform="translate(260,66)"><path d="M0 0 l4 8 l-8 0 z" fill="#ffd24a" /></g>
  </>);
}
function RankArt() {
  return frame(<>
    <rect width="320" height="180" fill="#0c0c20" rx="14" />
    <rect x="40" y="120" width="240" height="12" rx="6" fill="#1a1a3a" />
    <rect x="40" y="120" width="150" height="12" rx="6" fill={ACC} />
    {["#cd7f32", "#c0c0c0", "#ffd24a", "#7df9ff"].map((c, k) => <g key={k} transform={`translate(${70 + k * 60}, 70)`}>
      <circle r="18" fill="#171636" stroke={c} strokeWidth="2.5" /><circle r="6" fill={c} />
    </g>)}
  </>);
}
function SocialArt() {
  return frame(<>
    <rect width="320" height="180" fill="#0c0c20" rx="14" />
    {[{ x: 80, c: "#5ad1ff", on: true }, { x: 160, c: "#ff5c8a", on: true }, { x: 240, c: "#9a8cff", on: false }].map((p, k) => <g key={k} transform={`translate(${p.x},80)`}>
      <circle r="24" fill="#171636" stroke={p.c} strokeWidth="2" /><circle cy="-4" r="8" fill={p.c} /><path d="M-12 14 a12 10 0 0 1 24 0" fill={p.c} />
      <circle cx="18" cy="-18" r="5" fill={p.on ? "#36e66b" : "#555"} stroke="#0c0c20" strokeWidth="2" />
    </g>)}
  </>);
}
function ReadyArt() {
  return frame(<>
    <defs><radialGradient id="or1" cx="50%" cy="50%" r="60%"><stop offset="0" stopColor="#2a2a6a" /><stop offset="1" stopColor="#0a0a1e" /></radialGradient></defs>
    <rect width="320" height="180" fill="url(#or1)" rx="14" />
    <circle cx="160" cy="90" r="44" fill="none" stroke={ACC} strokeWidth="3" opacity=".5" />
    <polygon points="148,68 148,112 188,90" fill="#fff" />
  </>);
}
