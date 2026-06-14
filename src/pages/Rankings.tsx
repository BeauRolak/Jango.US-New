import { PageHeader, Card, Tag } from "../components/UI";

const ROWS = [
  { rank: 1, name: "NeonAce", rating: 2410, wr: "71%" },
  { rank: 2, name: "PuttMaster", rating: 2388, wr: "69%" },
  { rank: 3, name: "GreenKing", rating: 2351, wr: "66%" },
  { rank: 4, name: "RailRunner", rating: 2299, wr: "64%" },
  { rank: 5, name: "CupShark", rating: 2270, wr: "63%" },
  { rank: 842, name: "Player_One", rating: 1180, wr: "57%", you: true },
];

export default function Rankings() {
  return (
    <div>
      <PageHeader title="Rankings" subtitle="Global leaderboard across all ranked matches." />
      <Card>
        <div className="lb">
          <div className="lb-head">
            <span>Rank</span><span>Player</span><span>Rating</span><span>Win %</span>
          </div>
          {ROWS.map((r) => (
            <div key={r.rank} className={"lb-row " + (r.you ? "lb-you" : "")}>
              <span className="lb-rank">#{r.rank}</span>
              <span className="lb-name">{r.name}{r.you && <Tag color="neon">You</Tag>}</span>
              <span>{r.rating}</span>
              <span>{r.wr}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
