import { useState } from "react";
import "./pages.css";

type Row = {
  rank: number;
  name: string;
  tier: string;
  rating: number;
  wins: number;
  wr: number;
  you?: boolean;
};

const SCOPES = ["Global", "Friends", "Clan"];
const PERIODS = ["All-Time", "Season", "This Week", "Today"];
const GAMES = ["All Games", "Mini Golf", "8-Ball Pool", "Chess", "Air Hockey", "Connect Four"];

const TIER_COLOR: Record<string, string> = {
  Bronze: "#cd7f32", Silver: "#c0c7d0", Gold: "#ffc14d",
  Platinum: "#5fd0d6", Diamond: "#6aa8ff", Master: "#c084fc", Grandmaster: "#ff5d73",
};

const ROWS: Row[] = [
  { rank: 1, name: "NovaStrike", tier: "Grandmaster", rating: 3284, wins: 1842, wr: 71 },
  { rank: 2, name: "ApexRonin", tier: "Grandmaster", rating: 3190, wins: 1701, wr: 69 },
  { rank: 3, name: "VoidQueen", tier: "Master", rating: 3055, wins: 1588, wr: 67 },
  { rank: 4, name: "Drift_King", tier: "Master", rating: 2980, wins: 1490, wr: 65 },
  { rank: 5, name: "Lumen", tier: "Diamond", rating: 2870, wins: 1402, wr: 64 },
  { rank: 6, name: "ZeroCool", tier: "Diamond", rating: 2799, wins: 1330, wr: 62 },
  { rank: 7, name: "Sable", tier: "Diamond", rating: 2742, wins: 1288, wr: 61 },
  { rank: 8, name: "Kestrel", tier: "Platinum", rating: 2660, wins: 1190, wr: 59 },
  { rank: 9, name: "Echo7", tier: "Platinum", rating: 2601, wins: 1122, wr: 58 },
  { rank: 10, name: "Mirage", tier: "Platinum", rating: 2555, wins: 1080, wr: 57 },
  { rank: 842, name: "You", tier: "Gold", rating: 1840, wins: 128, wr: 57, you: true },
];

export default function Rankings() {
  const [scope, setScope] = useState(0);
  const [period, setPeriod] = useState(1);
  const [game, setGame] = useState(0);

  const top3 = ROWS.slice(0, 3);
  const rest = ROWS.slice(3);

  return (
    <div className={"page lb-page"}>
      <header className={"page-head"}>
        <div>
          <h1 className={"page-title"}>Leaderboard</h1>
          <p className={"page-sub"}>Climb the ranks. Earn your tier. Win real Scalps.</p>
        </div>
        <div className={"lb-myrank"}>
          <span className={"lb-myrank-num"}>#842</span>
          <span className={"lb-myrank-label"}>Your Global Rank</span>
        </div>
      </header>

      <div className={"lb-filters"}>
        <div className={"chip-row"}>
          {SCOPES.map((s, i) => (
            <button key={s} className={"chip " + (scope === i ? "chip-on" : "")} onClick={() => setScope(i)}>{s}</button>
          ))}
        </div>
        <div className={"chip-row"}>
          {PERIODS.map((s, i) => (
            <button key={s} className={"chip " + (period === i ? "chip-on" : "")} onClick={() => setPeriod(i)}>{s}</button>
          ))}
        </div>
        <select className={"lb-select"} value={game} onChange={(e) => setGame(Number(e.target.value))}>
          {GAMES.map((g, i) => (<option key={g} value={i}>{g}</option>))}
        </select>
      </div>

      <div className={"lb-podium"}>
        {top3.map((r) => (
          <div key={r.rank} className={"podium-card podium-" + r.rank}>
            <div className={"podium-medal"}>{r.rank === 1 ? "1st" : r.rank === 2 ? "2nd" : "3rd"}</div>
            <div className={"podium-avatar"}>{r.name.slice(0, 1)}</div>
            <div className={"podium-name"}>{r.name}</div>
            <div className={"podium-tier"} style={{ color: TIER_COLOR[r.tier] }}>{r.tier}</div>
            <div className={"podium-rating"}>{r.rating}</div>
          </div>
        ))}
      </div>

      <div className={"lb-table"}>
        <div className={"lb-row lb-head-row"}>
          <span>Rank</span><span>Player</span><span>Tier</span><span>Rating</span><span>Wins</span><span>Win %</span>
        </div>
        {rest.map((r) => (
          <div key={r.rank} className={"lb-row " + (r.you ? "lb-you" : "")}>
            <span className={"lb-rank"}>#{r.rank}</span>
            <span className={"lb-player"}><span className={"lb-av"}>{r.name.slice(0, 1)}</span>{r.name}{r.you && <span className={"you-tag"}>YOU</span>}</span>
            <span style={{ color: TIER_COLOR[r.tier] }}>{r.tier}</span>
            <span className={"lb-rating"}>{r.rating}</span>
            <span>{r.wins}</span>
            <span>{r.wr}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
