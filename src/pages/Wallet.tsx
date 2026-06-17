import { useState } from "react";
import "./wallet.css";

type Txn = { kind: "in" | "out"; type: string; note: string; amt: string; time: string };

const TXNS: Txn[] = [
  { kind: "in", type: "Deposit", note: "Fresh start bonus: 1 day streak", amt: "+5.00 S", time: "Today, 9:14 AM" },
  { kind: "in", type: "Reward", note: "Daily login reward: 2 day streak", amt: "+2.00 S", time: "Today, 8:02 AM" },
  { kind: "in", type: "Deposit", note: "Crypto deposit (BTC)", amt: "+100.00 S", time: "Yesterday" },
  { kind: "out", type: "Wager", note: "Chess ranked match", amt: "-1.00 S", time: "Yesterday" },
  { kind: "in", type: "Winnings", note: "Chess ranked match win", amt: "+1.94 S", time: "Yesterday" },
];

const FILTERS = ["All", "Deposits", "Winnings", "Wagers", "Withdrawals"];

const PERF = [
  { label: "Net Profit / Loss", val: "+10.00 S", sub: "You're in profit", tone: "pos" },
  { label: "Total Wagered", val: "1.00 S", sub: "1 match played", tone: "" },
  { label: "Biggest Win", val: "9.00 S", sub: "All time", tone: "" },
  { label: "Win Rate", val: "100%", sub: "Wins vs. bets placed", tone: "" },
];

export default function Wallet() {
  const [filter, setFilter] = useState("All");

  return (
    <div className={"wallet-page"}>
      <div className={"wallet-grid-top"}>
        <div className={"ds-card balance-card"}>
          <span className={"ds-eyebrow"}>TOTAL BALANCE</span>
          <div className={"balance-main"}><span className={"balance-num"}>117.00</span><span className={"balance-cur"}>Scalps</span></div>
          <p className={"balance-meta"}>= $117.00 USD · All funds immediately available</p>
          <span className={"funds-pill"}>● Funds available</span>
          <div className={"balance-actions"}>
            <button className={"ds-btn"}>+ Add Funds</button>
            <button className={"ds-btn-outline"}>↗ Withdraw</button>
            <button className={"ds-btn-outline"}>Methods</button>
          </div>
        </div>
        <div className={"mini-stats"}>
          <div className={"ds-card mini-stat"}><span className={"ds-eyebrow"}>DEPOSITED</span><span className={"mini-num"}>105.00 S</span></div>
          <div className={"ds-card mini-stat"}><span className={"ds-eyebrow"}>WON</span><span className={"mini-num pos"}>9.00 S</span></div>
          <div className={"ds-card mini-stat"}><span className={"ds-eyebrow"}>WITHDRAWN</span><span className={"mini-num"}>0.00 S</span></div>
        </div>
      </div>

      <section className={"wallet-section"}>
        <h2 className={"wallet-h2"}>Performance</h2>
        <div className={"perf-grid"}>
          {PERF.map((p) => (
            <div key={p.label} className={"ds-card perf-card"}>
              <span className={"ds-eyebrow"}>{p.label}</span>
              <span className={"perf-val " + p.tone}>{p.val}</span>
              <span className={"perf-sub"}>{p.sub}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={"wallet-section"}>
        <div className={"txn-head"}>
          <h2 className={"wallet-h2"}>Transactions</h2>
          <div className={"txn-filters"}>
            {FILTERS.map((f) => (
              <button key={f} className={"tf " + (filter === f ? "on" : "")} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        <div className={"ds-card txn-list"}>
          {TXNS.map((t, i) => (
            <div key={i} className={"txn-row"}>
              <div className={"txn-icon " + t.kind}>{t.kind === "in" ? "↓" : "↑"}</div>
              <div className={"txn-info"}><span className={"txn-type"}>{t.type}</span><span className={"txn-note"}>{t.note}</span></div>
              <div className={"txn-right"}><span className={"txn-amt " + (t.kind === "in" ? "pos" : "neg")}>{t.amt}</span><span className={"txn-time"}>{t.time}</span></div>
            </div>
          ))}
        </div>
      </section>

      <div className={"trust-strip"}>
        <div className={"trust-item"}><strong>Secure Funds</strong><span>256-bit encrypted</span></div>
        <div className={"trust-item"}><strong>Instant Deposits</strong><span>Via Stripe</span></div>
        <div className={"trust-item"}><strong>Fast Withdrawals</strong><span>1-3 business days</span></div>
      </div>

      <p className={"wallet-legal"}>Players must be 18+. Play responsibly. Set spending limits and self-exclusion in Settings.</p>
    </div>
  );
}
