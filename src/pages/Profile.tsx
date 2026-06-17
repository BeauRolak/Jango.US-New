import "./profile.css";

const STATS = [
  { n: "0", l: "Matches Played" },
  { n: "0", l: "Wins" },
  { n: "0", l: "Losses" },
  { n: "N/A", l: "Win Rate" },
];

const RATINGS = [
  { g: "Chess", r: 1200, tier: "Silver" },
  { g: "Mini Golf", r: 1200, tier: "Silver" },
  { g: "Connect 4", r: 1200, tier: "Silver" },
  { g: "Air Hockey", r: 1200, tier: "Silver" },
  { g: "Rock Paper Scissors", r: 1200, tier: "Silver" },
  { g: "Dots & Boxes", r: 1200, tier: "Silver" },
  { g: "8-Ball Pool", r: 1200, tier: "Silver" },
  { g: "Bowling", r: 1200, tier: "Silver" },
  { g: "Cup King", r: 1200, tier: "Silver" },
  { g: "Stack Tower", r: 1000, tier: "Bronze" },
];

const LADDER = [
  { name: "Bronze", at: "0+" },
  { name: "Silver", at: "1000+", you: true },
  { name: "Gold", at: "1400+" },
  { name: "Platinum", at: "1800+" },
  { name: "Diamond", at: "2200+" },
  { name: "Champion", at: "2600+" },
];

export default function Profile() {
  return (
    <div className={"profile-page"}>
      <div className={"ds-card profile-header"}>
        <div className={"profile-av"}>B<span className={"rank-dot"} /></div>
        <div className={"profile-id"}>
          <div className={"profile-name-row"}><h1>beaurolak</h1><span className={"you-pill"}>You</span></div>
          <p className={"profile-title"}>Chess Tactician</p>
          <div className={"profile-chips"}>
            <span className={"pchip silver"}>Silver · 1200</span>
            <span className={"pchip"}>Lv 1</span>
            <span className={"pchip"}> 1 day streak</span>
            <span className={"pchip ok"}>Excellent (80/100)</span>
          </div>
          <div className={"xp-wrap"}>
            <div className={"xp-label"}>Level 1 XP · 0 / 500</div>
            <div className={"xp-bar"}><div className={"xp-fill"} style={{ width: "8%" }} /></div>
          </div>
        </div>
      </div>

      <div className={"stat-tiles"}>
        {STATS.map((s) => (
          <div key={s.l} className={"ds-card stat-tile"}><span className={"stat-n"}>{s.n}</span><span className={"stat-l"}>{s.l}</span></div>
        ))}
      </div>

      <div className={"profile-cols"}>
        <div className={"ds-card ratings-card"}>
          <h2>Ratings by Game</h2>
          {RATINGS.map((r) => (
            <div key={r.g} className={"rating-row"}>
              <span className={"rating-game"}>{r.g}</span>
              <div className={"rating-bar"}><div className={"rating-fill"} style={{ width: ((r.r - 800) / 1200 * 100) + "%" }} /></div>
              <span className={"rating-val"}>{r.r}</span>
              <span className={"rating-tier " + r.tier.toLowerCase()}>{r.tier}</span>
            </div>
          ))}
        </div>
        <div className={"profile-side"}>
          <div className={"ds-card recent-card"}>
            <h2>Recent Matches</h2>
            <p className={"empty-note"}>No matches yet. Jump into the Arena to start your record.</p>
          </div>
          <div className={"ds-card ladder-card"}>
            <h2>Rank Ladder</h2>
            <div className={"ladder"}>
              {LADDER.map((l) => (
                <div key={l.name} className={"ladder-step " + (l.you ? "you" : "")}><span>{l.name}</span><span className={"ladder-at"}>{l.at}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
