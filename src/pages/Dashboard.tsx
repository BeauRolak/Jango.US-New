import { Link } from "react-router-dom";
import { PageHeader, Card, Btn, Stat, Tag } from "../components/UI";
import { GAMES } from "../games/registry";

export default function Dashboard() {
  const featured = GAMES.slice(0, 6);
  return (
    <div>
      <PageHeader
        title="Welcome back, Player"
        subtitle="Jump into a skill match, climb the ranks, and earn Scaps."
        action={<Link to="/games"><Btn>Browse all games</Btn></Link>}
      />

      <div className="grid grid-4" style={{ marginBottom: 26 }}>
        <Stat label="Scaps Balance" value="1,250" accent="var(--gold)" />
        <Stat label="Global Rank" value="#842" />
        <Stat label="Win Rate" value="57%" accent="var(--green)" />
        <Stat label="Matches" value="128" />
      </div>

      <h2 style={{ margin: "0 0 14px", fontSize: 20 }}>Featured games</h2>
      <div className="grid grid-auto">
        {featured.map((g) => (
          <Link key={g.id} to={g.playable ? g.path : "/games"} className="game-card">
            <div className="game-art" style={{ background: g.art }}>
              <span className="game-emoji">{g.emoji}</span>
              {g.playable && <span className="game-live">PLAYABLE</span>}
            </div>
            <div className="game-card-body">
              <div className="game-card-title">{g.name}</div>
              <div className="game-card-meta">
                <Tag color={g.playable ? "green" : "neon"}>{g.playable ? "Ready" : "Soon"}</Tag>
                <span className="game-card-mode">{g.mode}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Card glow style={{ marginTop: 26 }}>
        <div className="promo">
          <div>
            <h3 style={{ margin: "0 0 6px" }}>Daily Challenge</h3>
            <p style={{ margin: 0, color: "var(--muted)" }}>Win 3 Mini Golf matches to earn 200 bonus Scaps.</p>
          </div>
          <Link to="/games/minigolf"><Btn variant="gold">Play Mini Golf</Btn></Link>
        </div>
      </Card>
    </div>
  );
}
