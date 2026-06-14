import { PageHeader, Card, Tag, Btn } from "../components/UI";

const FRIENDS = [
  { name: "NeonAce", status: "online" },
  { name: "PuttMaster", status: "in match" },
  { name: "GreenKing", status: "offline" },
];

export default function Social() {
  return (
    <div>
      <PageHeader title="Social" subtitle="Friends, messages, and community." />
      <div className="grid grid-2">
        <Card>
          <h3 style={{ marginTop: 0 }}>Friends</h3>
          <div className="history">
            {FRIENDS.map((f, i) => (
              <div key={i} className="history-row">
                <span className="history-game">{f.name}</span>
                <Tag color={f.status === "online" ? "green" : f.status === "in match" ? "gold" : "neon"}>{f.status}</Tag>
                <Btn variant="ghost" disabled>Invite</Btn>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 style={{ marginTop: 0 }}>Messages</h3>
          <p style={{ color: "var(--muted)" }}>Direct messages and chat threads will appear here. Messaging is disabled in this preview build.</p>
        </Card>
      </div>
    </div>
  );
}
