import { PageHeader, Card, Btn, Tag } from "../components/UI";

const EVENTS = [
  { name: "Mini Golf Cup", entry: "25 Scaps", prize: "2,000 Scaps", slots: "14/16", live: true },
  { name: "Weekend Clash", entry: "50 Scaps", prize: "5,000 Scaps", slots: "31/64", live: false },
  { name: "Rookie Open", entry: "Free", prize: "500 Scaps", slots: "8/8", live: false },
];

export default function Tournaments() {
  return (
    <div>
      <PageHeader title="Tournaments" subtitle="Compete in brackets for Scaps prize pools." />
      <div className="grid grid-auto">
        {EVENTS.map((e, i) => (
          <Card key={i} glow={e.live}>
            <div className="tourney-top">
              <h3 style={{ margin: 0 }}>{e.name}</h3>
              {e.live ? <Tag color="green">Live</Tag> : <Tag color="neon">Soon</Tag>}
            </div>
            <div className="tourney-meta">
              <span>Entry: <b>{e.entry}</b></span>
              <span>Prize: <b style={{ color: "var(--gold)" }}>{e.prize}</b></span>
              <span>Slots: <b>{e.slots}</b></span>
            </div>
            <Btn variant={e.live ? "primary" : "ghost"} disabled={!e.live} style={{ marginTop: 14, width: "100%" }}>
              {e.live ? "Join bracket" : "Not open yet"}
            </Btn>
          </Card>
        ))}
      </div>
      <Card style={{ marginTop: 22 }}>
        <p style={{ margin: 0, color: "var(--muted)" }}>Bracket play, seeding, and live results render here. Prize payouts are stubbed in this preview build.</p>
      </Card>
    </div>
  );
}
