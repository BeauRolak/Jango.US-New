import { PageHeader, Card, Stat, Tag, Btn } from "../components/UI";

const HISTORY = [
  { game: "Mini Golf", result: "Win", score: "+45", opp: "Bot (Hard)" },
  { game: "Mini Golf", result: "Loss", score: "-20", opp: "Bot (Medium)" },
  { game: "Mini Golf", result: "Win", score: "+30", opp: "Bot (Easy)" },
];

export default function Profile() {
  return (
    <div>
      <PageHeader title="Player Profile" subtitle="Your stats, rank, and recent matches." />
      <div className="profile-head">
        <div className="avatar-lg">P</div>
        <div>
          <h2 style={{ margin: "0 0 4px" }}>Player_One</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Tag color="gold">Gold III</Tag>
            <Tag color="neon">Rank #842</Tag>
            <Tag color="green">57% WR</Tag>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}><Btn variant="ghost">Edit profile</Btn></div>
      </div>
      <div className="grid grid-4" style={{ margin: "22px 0" }}>
        <Stat label="Matches" value="128" />
        <Stat label="Wins" value="73" accent="var(--green)" />
        <Stat label="Best Streak" value="9" />
        <Stat label="Scaps Earned" value="4,820" accent="var(--gold)" />
      </div>
      <h3 style={{ margin: "0 0 12px" }}>Recent matches</h3>
      <Card>
        <div className="history">
          {HISTORY.map((h, i) => (
            <div key={i} className="history-row">
              <span className="history-game">{h.game}</span>
              <span className="history-opp">vs {h.opp}</span>
              <Tag color={h.result === "Win" ? "green" : "accent"}>{h.result}</Tag>
              <span className="history-score">{h.score}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
