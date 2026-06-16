import "./pages.css";
import "./ranktrack.css";

type TierDef = { name: string; color: string; min: number; };

const TIERS: TierDef[] = [
  { name: "Bronze", color: "#cd7f32", min: 0 },
  { name: "Silver", color: "#c0c7d0", min: 800 },
  { name: "Gold", color: "#ffc14d", min: 1600 },
  { name: "Platinum", color: "#5fd0d6", min: 2200 },
  { name: "Diamond", color: "#6aa8ff", min: 2700 },
  { name: "Master", color: "#c084fc", min: 3000 },
  { name: "Grandmaster", color: "#ff5d73", min: 3200 },
];

const ME = { rating: 1840, tier: 2, division: "II", peak: 1980, wins: 128, losses: 96 };

export default function RankTrack() {
  const cur = TIERS[ME.tier];
  const next = TIERS[ME.tier + 1];
  const span = next ? next.min - cur.min : 1;
  const into = ME.rating - cur.min;
  const pct = next ? Math.min(100, Math.round(into / span * 100)) : 100;
  const winRate = Math.round(ME.wins / (ME.wins + ME.losses) * 100);

  return (
    <div className={"page rt-page"}>
      <header className={"page-head"}>
        <div>
          <h1 className={"page-title"}>Rank Progression</h1>
          <p className={"page-sub"}>Track your climb from Bronze to Grandmaster.</p>
        </div>
      </header>

      <div className={"rt-hero"}>
        <div className={"rt-emblem"} style={{ borderColor: cur.color, color: cur.color }}>
          <span className={"rt-emblem-tier"}>{cur.name}</span>
          <span className={"rt-emblem-div"}>{ME.division}</span>
        </div>
        <div className={"rt-hero-info"}>
          <div className={"rt-rating"}>{ME.rating}<span> MMR</span></div>
          <div className={"rt-promo"}>
            <div className={"rt-promo-top"}>
              <span>{cur.name} {ME.division}</span>
              {next && <span>{into} / {span} to {next.name}</span>}
            </div>
            <div className={"rt-promo-bar"}><div className={"rt-promo-fill"} style={{ width: pct + "%", background: cur.color }} /></div>
          </div>
          <div className={"rt-stats"}>
            <div><span className={"rt-k"}>Peak</span><span className={"rt-v"}>{ME.peak}</span></div>
            <div><span className={"rt-k"}>Wins</span><span className={"rt-v"}>{ME.wins}</span></div>
            <div><span className={"rt-k"}>Losses</span><span className={"rt-v"}>{ME.losses}</span></div>
            <div><span className={"rt-k"}>Win Rate</span><span className={"rt-v"}>{winRate}%</span></div>
          </div>
        </div>
      </div>

      <h2 className={"rt-section"}>Tier Ladder</h2>
      <div className={"rt-ladder"}>
        {TIERS.map((t, i) => (
          <div key={t.name} className={"rt-node " + (i === ME.tier ? "rt-node-cur" : i < ME.tier ? "rt-node-done" : "")}>
            <span className={"rt-node-dot"} style={{ background: i <= ME.tier ? t.color : "transparent", borderColor: t.color }} />
            <span className={"rt-node-name"} style={{ color: i === ME.tier ? t.color : undefined }}>{t.name}</span>
            <span className={"rt-node-min"}>{t.min}+</span>
          </div>
        ))}
      </div>
    </div>
  );
}
