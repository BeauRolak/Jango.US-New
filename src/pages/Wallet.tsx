import { PageHeader, Card, Btn, Stat, Tag } from "../components/UI";

const TX = [
  { label: "Match win vs Bot (Hard)", amt: "+45", kind: "in" },
  { label: "Entry: Daily Challenge", amt: "-25", kind: "out" },
  { label: "Match win vs Bot (Medium)", amt: "+30", kind: "in" },
  { label: "Shop: Neon Ball Skin", amt: "-150", kind: "out" },
];

export default function Wallet() {
  return (
    <div>
      <PageHeader title="Wallet" subtitle="Your Scaps balance and transaction history." />
      <Card glow style={{ marginBottom: 22 }}>
        <div className="wallet-hero">
          <div>
            <div className="wallet-label">Scaps Balance</div>
            <div className="wallet-amount">1,250</div>
          </div>
          <div className="wallet-actions">
            <Btn variant="gold" disabled title="Coming soon">Add Scaps</Btn>
            <Btn variant="ghost" disabled title="Coming soon">Cash out</Btn>
          </div>
        </div>
        <div className="wallet-note">Real-money features are disabled in this preview build.</div>
      </Card>
      <div className="grid grid-3" style={{ marginBottom: 22 }}>
        <Stat label="Earned (30d)" value="+820" accent="var(--green)" />
        <Stat label="Spent (30d)" value="-410" accent="var(--accent)" />
        <Stat label="Pending" value="0" />
      </div>
      <h3 style={{ margin: "0 0 12px" }}>Recent transactions</h3>
      <Card>
        <div className="history">
          {TX.map((t, i) => (
            <div key={i} className="history-row">
              <span className="history-game">{t.label}</span>
              <Tag color={t.kind === "in" ? "green" : "accent"}>{t.kind === "in" ? "Credit" : "Debit"}</Tag>
              <span className="history-score">{t.amt}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
