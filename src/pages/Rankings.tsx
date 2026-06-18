import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Icon, type IconName } from "../components/Icon";
import { StatusPill } from "../components/Juice";
import "./rankings.css";

type Row = { rank: number; name: string; tier: string; rating: number; wins: number; wr: number; you?: boolean };

const GAMES = ["All Games", "Chess", "Mini Golf", "Connect 4", "Air Hockey", "8-Ball"];
const PERIODS = ["All Time", "Monthly", "Weekly", "Daily"];
const SCOPES = ["Global", "Friends", "Clan"];
const FILTERS: { label: string; icon: IconName }[] = [
  { label: "All Players", icon: "Users" },
  { label: "Hot Streak", icon: "Flame" },
  { label: "Big Earners", icon: "Coins" },
  { label: "Rising", icon: "ArrowUpRight" },
];

const TIER_COLOR: Record<string, string> = {
  Bronze: "#cd7f32",
  Silver: "#c0c8d4",
  Gold: "#f5b942",
  Platinum: "#3ad6c5",
  Diamond: "#5aa6ff",
  Champion: "#a865ff",
  GOAT: "#ff4d6d",
};

const ROWS: Row[] = [
  { rank: 1, name: "NovaStrike", tier: "GOAT", rating: 3142, wins: 1284, wr: 71 },
  { rank: 2, name: "ZenithQueen", tier: "Champion", rating: 2871, wins: 1102, wr: 68 },
  { rank: 3, name: "ByteKnight", tier: "Champion", rating: 2740, wins: 968, wr: 66 },
  { rank: 4, name: "EchoVortex", tier: "Diamond", rating: 2502, wins: 894, wr: 63 },
  { rank: 5, name: "PixelReign", tier: "Diamond", rating: 2433, wins: 812, wr: 62 },
  { rank: 6, name: "FrostByte", tier: "Diamond", rating: 2288, wins: 770, wr: 60 },
  { rank: 7, name: "AceProtocol", tier: "Platinum", rating: 2104, wins: 701, wr: 58 },
  { rank: 8, name: "LunarFlux", tier: "Platinum", rating: 1988, wins: 655, wr: 57 },
  { rank: 42, name: "You", tier: "Silver", rating: 1200, wins: 318, wr: 54, you: true },
  { rank: 56, name: "TidalWave", tier: "Silver", rating: 1108, wins: 280, wr: 52 },
  { rank: 73, name: "EmberLite", tier: "Bronze", rating: 902, wins: 214, wr: 49 },
];

export default function Rankings() {
  const [game, setGame] = useState(GAMES[0]);
  const [period, setPeriod] = useState(PERIODS[0]);
  const [scope, setScope] = useState(SCOPES[0]);
  const [filter, setFilter] = useState(FILTERS[0].label);

  const you = useMemo(() => ROWS.find((r) => r.you), []);
  const total = 18420;

  const medal = (rank: number) => (rank === 1 ? "#f5b942" : rank === 2 ? "#c0c8d4" : rank === 3 ? "#cd7f32" : null);

  return (
    <div className="lb-page">
      <div className="lb-bg" aria-hidden />

      <header className="lb-head">
        <div className="lb-eyebrow">Compete</div>
        <h1 className="lb-title grad-text">Leaderboard</h1>
        <p className="lb-sub">Rankings across every game on the platform.</p>
      </header>

      <Link to="/rank-progression" className="lb-rankbanner">
        <div className="lb-rankbanner-icon"><Icon name="Trophy" /></div>
        <div className="lb-rankbanner-text">
          <div className="lb-rankbanner-title">Your Rank Progression &amp; Rewards</div>
          <div className="lb-rankbanner-sub">View the tier ladder, unlock cosmetics, and track your climb.</div>
        </div>
        <span className="lb-rankbanner-open">Open <Icon name="ArrowRight" /></span>
      </Link>

      <section className="lb-season">
        <div className="lb-season-icon"><Icon name="Flame" /></div>
        <div className="lb-season-text">
          <div className="lb-season-title">Season 1 &mdash; Active</div>
          <div className="lb-season-sub">Earn your rank &middot; resets every 90 days</div>
        </div>
        <div className="lb-season-meta">
          <StatusPill label="LIVE" kind="live" live />
          <span className="lb-season-days"><Icon name="Calendar" /> 90-day season</span>
        </div>
      </section>

      <div className="lb-layout">
        <div className="lb-main">
          <div className="lb-game-tabs">
            {GAMES.map((g) => (
              <button key={g} className={"lb-game-tab" + (g === game ? " active" : "")} onClick={() => setGame(g)}>{g}</button>
            ))}
          </div>

          <div className="lb-toggles">
            <div className="lb-seg">
              {PERIODS.map((p) => (
                <button key={p} className={"lb-seg-btn" + (p === period ? " active" : "")} onClick={() => setPeriod(p)}>{p}</button>
              ))}
            </div>
            <div className="lb-seg">
              {SCOPES.map((s) => (
                <button key={s} className={"lb-seg-btn" + (s === scope ? " active" : "")} onClick={() => setScope(s)}>
                  <Icon name={s === "Global" ? "Home" : s === "Friends" ? "Users" : "Shield"} /> {s}
                </button>
              ))}
            </div>
          </div>

          <div className="lb-filters">
            {FILTERS.map((f) => (
              <button key={f.label} className={"lb-filter" + (f.label === filter ? " active" : "")} onClick={() => setFilter(f.label)}>
                <Icon name={f.icon} /> {f.label}
              </button>
            ))}
          </div>

          <section className="lb-board">
            <div className="lb-board-head">
              <div className="lb-board-title"><Icon name="Trophy" /> <h2>{game} Rankings</h2></div>
              <span className="lb-board-count">{total.toLocaleString()} players</span>
            </div>

            <div className="lb-table">
              <div className="lb-row lb-row-head">
                <span className="lb-c-rank">Rank</span>
                <span className="lb-c-player">Player</span>
                <span className="lb-c-rating">Rating</span>
                <span className="lb-c-wl">W / L</span>
                <span className="lb-c-wr">Win %</span>
              </div>
              {ROWS.map((r) => {
                const m = medal(r.rank);
                return (
                  <div
                    key={r.rank}
                    className={"lb-row" + (r.you ? " you" : "")}
                    style={{ ["--tier" as string]: TIER_COLOR[r.tier] || "#888" }}
                  >
                    <span className="lb-c-rank">
                      {m ? (
                        <span className="lb-medal" style={{ ["--medal" as string]: m }}><Icon name="Medal" /></span>
                      ) : (
                        <span className="lb-rank-num">{r.rank}</span>
                      )}
                    </span>
                    <span className="lb-c-player">
                      <span className="lb-avatar" style={{ ["--tier" as string]: TIER_COLOR[r.tier] || "#888" }}>{r.name.charAt(0)}</span>
                      <span className="lb-pname">
                        {r.name}{r.you && <span className="lb-you-tag">YOU</span>}
                        <span className="lb-ptier" style={{ color: TIER_COLOR[r.tier] }}>{r.tier}</span>
                      </span>
                    </span>
                    <span className="lb-c-rating" style={{ color: TIER_COLOR[r.tier] }}>{r.rating.toLocaleString()}</span>
                    <span className="lb-c-wl">{r.wins}<span className="lb-wl-sep"> W</span></span>
                    <span className="lb-c-wr"><span className="lb-wr-bar"><span style={{ width: r.wr + "%" }} /></span>{r.wr}%</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="lb-side">
          <div className="lb-quickstats">
            <div className="lb-qs-title">Quick Stats</div>
            <div className="lb-qs-row"><span>Total Players</span><strong>{total.toLocaleString()}</strong></div>
            <div className="lb-qs-row"><span>Season</span><strong className="lb-accent">Season 1</strong></div>
            <div className="lb-qs-row"><span>Resets In</span><strong>90 days</strong></div>
            <Link to="/play" className="lb-qs-play"><Icon name="Play" /> Play Now</Link>
          </div>

          {you && (
            <div className="lb-yourank" style={{ ["--tier" as string]: TIER_COLOR[you.tier] }}>
              <div className="lb-yourank-label">Your Standing</div>
              <div className="lb-yourank-rank">#{you.rank}</div>
              <div className="lb-yourank-tier">
                <span className="lb-avatar" style={{ ["--tier" as string]: TIER_COLOR[you.tier] }}><Icon name="Medal" /></span>
                <div>
                  <div className="lb-yourank-tname">{you.tier}</div>
                  <div className="lb-yourank-rating">{you.rating.toLocaleString()} rating</div>
                </div>
              </div>
              <div className="lb-yourank-wr"><Icon name="Chart" /> {you.wr}% win rate &middot; {you.wins} wins</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
