import { useState, useEffect } from "react";
import { toast } from "../components/UI";
import "./ranktrack.css";

type Tier = { name: string; color: string; mmr: number; emoji: string };

const TIERS: Tier[] = [
  { name: "Bronze", color: "#cd7f32", mmr: 0, emoji: "🥉" },
  { name: "Silver", color: "#c0c8d4", mmr: 800, emoji: "🥈" },
  { name: "Gold", color: "#f5b942", mmr: 1600, emoji: "🥇" },
  { name: "Platinum", color: "#3ad6c5", mmr: 2200, emoji: "💎" },
  { name: "Diamond", color: "#5aa6ff", mmr: 2700, emoji: "🔷" },
  { name: "Master", color: "#a865ff", mmr: 3000, emoji: "👑" },
  { name: "Grandmaster", color: "#ff4d6d", mmr: 3200, emoji: "⚔️" },
];

type Reward = { tier: string; label: string; icon: string; mmr: number };
const REWARDS: Reward[] = [
  { tier: "Bronze", label: "Starter avatar frame", icon: "🖼️", mmr: 0 },
  { tier: "Silver", label: "+250 Scaps bonus", icon: "💰", mmr: 800 },
  { tier: "Gold", label: "Gold name glow", icon: "✨", mmr: 1600 },
  { tier: "Platinum", label: "Animated banner", icon: "🌊", mmr: 2200 },
  { tier: "Diamond", label: "Exclusive ball skin", icon: "🔷", mmr: 2700 },
  { tier: "Master", label: "Crown emote", icon: "👑", mmr: 3000 },
  { tier: "Grandmaster", label: "Legendary title", icon: "⚔️", mmr: 3200 },
];

export default function RankTrack() {
  const mmr = 1840;
  const tierIndex = 2; // Gold
  const current = TIERS[tierIndex];
  const next = TIERS[tierIndex + 1];
  const into = mmr - current.mmr;
  const span = next.mmr - current.mmr;
  const pct = Math.min(100, Math.round((into / span) * 100));

  const [barW, setBarW] = useState(0);
  const [claimed, setClaimed] = useState<string[]>(["Bronze", "Silver"]);
  useEffect(() => { const t = setTimeout(() => setBarW(pct), 250); return () => clearTimeout(t); }, [pct]);

  function claim(r: Reward, unlocked: boolean) {
    if (!unlocked) { toast(`Reach ${r.tier} (${r.mmr} MMR) to unlock`, "info"); return; }
    if (claimed.includes(r.tier)) { toast("Already claimed", "info"); return; }
    setClaimed((c) => [...c, r.tier]);
    toast(`Claimed: ${r.label}`, "reward");
  }

  return (
    <div className="rt-page">
      <div className="rt-head">
        <h1 className="rt-title">Rank Progression</h1>
        <p className="rt-sub">Track your climb from Bronze to Grandmaster.</p>
      </div>

      <div className="rt-current j-hover-lift" style={{ ["--tier" as any]: current.color }}>
        <div className="rt-badge" style={{ borderColor: current.color, color: current.color }}>
          <span className="rt-badge-emoji">{current.emoji}</span>
          <span className="rt-badge-name">{current.name} II</span>
        </div>
        <div className="rt-current-main">
          <div className="rt-mmr"><span className="rt-mmr-num">{mmr}</span> <small>MMR</small></div>
          <div className="rt-prog-row"><span>{current.name} II</span><span>{into} / {span} to {next.name}</span></div>
          <div className="rt-bar"><div className="rt-bar-fill" style={{ width: barW + "%", background: `linear-gradient(90deg, ${current.color}, ${next.color})` }} /></div>
          <div className="rt-stats">
            <div><div className="rt-stat-l">PEAK</div><div className="rt-stat-v">1980</div></div>
            <div><div className="rt-stat-l">WINS</div><div className="rt-stat-v">128</div></div>
            <div><div className="rt-stat-l">LOSSES</div><div className="rt-stat-v">96</div></div>
            <div><div className="rt-stat-l">WIN RATE</div><div className="rt-stat-v pos">57%</div></div>
          </div>
        </div>
        <div className="rt-next">
          <div className="rt-next-l">NEXT RANK</div>
          <div className="rt-next-badge" style={{ borderColor: next.color, color: next.color }}>{next.emoji} {next.name}</div>
          <div className="rt-next-need">{span - into} MMR to go</div>
        </div>
      </div>

      <h2 className="rt-h2">Rank Rewards</h2>
      <div className="rt-rewards">
        {REWARDS.map((r) => {
          const unlocked = mmr >= r.mmr;
          const isClaimed = claimed.includes(r.tier);
          const tcolor = (TIERS.find((t) => t.name === r.tier) || current).color;
          return (
            <button key={r.tier} className={"rt-reward" + (unlocked ? " unlocked" : " locked") + (isClaimed ? " claimed" : "")} style={{ ["--tier" as any]: tcolor }} onClick={() => claim(r, unlocked)}>
              <div className="rt-reward-icon">{unlocked ? r.icon : "🔒"}</div>
              <div className="rt-reward-tier" style={{ color: tcolor }}>{r.tier}</div>
              <div className="rt-reward-label">{r.label}</div>
              <div className="rt-reward-state">{isClaimed ? "✓ Claimed" : unlocked ? "Claim" : r.mmr + " MMR"}</div>
            </button>
          );
        })}
      </div>

      <h2 className="rt-h2">Tier Ladder</h2>
      <div className="rt-ladder">
        {TIERS.map((t, i) => (
          <div key={t.name} className={"rt-rung" + (i === tierIndex ? " on" : "") + (i < tierIndex ? " done" : "")}>
            <div className="rt-rung-dot" style={{ borderColor: t.color, background: i <= tierIndex ? t.color : "transparent", boxShadow: i === tierIndex ? `0 0 16px ${t.color}` : "none" }} />
            <div className="rt-rung-name">{t.name}</div>
            <div className="rt-rung-mmr">{t.mmr}+</div>
          </div>
        ))}
      </div>
    </div>
  );
}
