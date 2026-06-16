import "./pages.css";

interface GameRating { game: string; rating: number; tier: string; pct: number; }

const RATINGS: GameRating[] = [
  { game: "Chess", rating: 1200, tier: "Silver", pct: 60 },
  { game: "Mini Golf", rating: 1200, tier: "Silver", pct: 60 },
  { game: "Connect 4", rating: 1200, tier: "Silver", pct: 60 },
  { game: "Air Hockey", rating: 1200, tier: "Silver", pct: 60 },
  { game: "Rock Paper Scissors", rating: 1200, tier: "Silver", pct: 60 },
  { game: "Dots & Boxes", rating: 1200, tier: "Silver", pct: 60 },
  { game: "8-Ball Pool", rating: 1200, tier: "Silver", pct: 60 },
  { game: "Bowling", rating: 1200, tier: "Silver", pct: 60 },
  { game: "Cup King", rating: 1200, tier: "Silver", pct: 60 },
  { game: "Stack Tower", rating: 1000, tier: "Bronze", pct: 30 },
];

const LADDER = [
  { name: "Bronze", min: 0 }, { name: "Silver", min: 1000 }, { name: "Gold", min: 1400 },
  { name: "Platinum", min: 1800 }, { name: "Diamond", min: 2200 }, { name: "Champion", min: 2600 },
];

const STATS = [
  { label: "Matches Played", value: "0" },
  { label: "Wins", value: "0" },
  { label: "Losses", value: "0" },
  { label: "Win Rate", value: "N/A" },
];

const FIRE = "🔥";
const MID = "·";

export default function Profile() {
  return (
    <div className={"page profile-page"}>
      <div className={"profile-hero"}>
        <div className={"profile-avatar"}>
          <span>B</span>
          <span className={"rank-dot silver"} />
        </div>
        <div className={"profile-meta"}>
          <h1>beaurolak <span className={"you-tag"}>You</span></h1>
          <p className={"profile-role"}>Chess Tactician</p>
          <div className={"profile-chips"}>
            <span className={"chip silver"}>Silver {MID} 1200</span>
            <span className={"chip"}>Lv 1</span>
            <span className={"chip"}>{FIRE} 1 day streak</span>
            <span className={"chip green"}>Excellent (80/100)</span>
          </div>
          <div className={"xp-bar"}>
            <div className={"xp-fill"} style={{ width: "0%" }} />
          </div>
          <span className={"xp-label"}>Level 1 XP {MID} 0 / 500</span>
        </div>
      </div>

      <div className={"stat-tiles"}>
        {STATS.map((s) => (
          <div key={s.label} className={"stat-tile"}>
            <div className={"stat-value"}>{s.value}</div>
            <div className={"stat-label"}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={"card"}>
        <h3 className={"section-title"}>Ratings by Game</h3>
        <div className={"rating-list"}>
          {RATINGS.map((r) => (
            <div key={r.game} className={"rating-row"}>
              <span className={"rating-game"}>{r.game}</span>
              <div className={"rating-bar"}>
                <div className={"rating-fill"} style={{ width: r.pct + "%" }} />
              </div>
              <span className={"rating-val"}>{r.rating} <em>{r.tier}</em></span>
            </div>
          ))}
        </div>
      </div>

      <div className={"card"}>
        <h3 className={"section-title"}>Recent Matches</h3>
        <div className={"empty-state"}>No matches yet</div>
      </div>

      <div className={"card"}>
        <h3 className={"section-title"}>Rank Ladder</h3>
        <div className={"ladder-strip"}>
          {LADDER.map((l) => (
            <div key={l.name} className={"ladder-node" + (l.name === "Silver" ? " active" : "")}>
              <span className={"ladder-name"}>{l.name}</span>
              <span className={"ladder-min"}>{l.min}+</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
