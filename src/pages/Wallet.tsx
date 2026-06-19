import { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { toast } from "../components/UI";
import { useScalps } from "../lib/mockData";
import "./wallet.css";

type Txn = {
  id: number;
  type: string;
  note: string;
  amount: number;
  time: string;
  dir: "in" | "out";
  kind: "deposit" | "winning" | "wager" | "withdrawal";
};

const SEED_TXNS: Txn[] = [
  { id: 1, type: "Deposit", note: "Fresh start bonus: 1 day streak", amount: 5, time: "Today, 9:14 AM", dir: "in", kind: "deposit" },
  { id: 2, type: "Reward", note: "Daily login reward: 2 day streak", amount: 2, time: "Today, 8:02 AM", dir: "in", kind: "winning" },
  { id: 3, type: "Match Win", note: "Mini Golf vs Bot (Medium)", amount: 9, time: "Yesterday, 7:41 PM", dir: "in", kind: "winning" },
  { id: 4, type: "Entry Fee", note: "Ranked match wager", amount: 1, time: "Yesterday, 7:38 PM", dir: "out", kind: "wager" },
  { id: 5, type: "Deposit", note: "Starter pack", amount: 100, time: "Mon, 2:15 PM", dir: "in", kind: "deposit" },
];

const FILTERS = ["All", "Deposits", "Winnings", "Wagers", "Withdrawals"] as const;
const PRESETS = [5, 10, 25, 50, 100];

export default function Wallet() {
  const { set: setSharedBalance } = useScalps();
  const [txns, setTxns] = useState<Txn[]>(SEED_TXNS);
  const [filter, setFilter] = useState<string>("All");
  const [modal, setModal] = useState<null | "add" | "withdraw" | "methods">(null);
  const [amount, setAmount] = useState<number>(25);
  const [busy, setBusy] = useState(false);

  const seedNet = SEED_TXNS.reduce((a, t) => a + (t.dir === "in" ? t.amount : -t.amount), 0);
  const balance = txns.reduce((s, t) => s + (t.dir === "in" ? t.amount : -t.amount), 117 - seedNet);

  // Keep the shared top-bar balance in sync with the wallet ledger (A6/A10).
  useEffect(() => {
    setSharedBalance(balance);
  }, [balance, setSharedBalance]);
  const deposited = txns.filter((t) => t.kind === "deposit").reduce((s, t) => s + t.amount, 0);
  const won = txns.filter((t) => t.kind === "winning").reduce((s, t) => s + t.amount, 0);
  const withdrawn = txns.filter((t) => t.kind === "withdrawal").reduce((s, t) => s + t.amount, 0);
  const wagered = txns.filter((t) => t.kind === "wager").reduce((s, t) => s + t.amount, 0);
  const netProfit = won - wagered;
  const matchesPlayed = txns.filter((t) => t.kind === "wager").length;
  const winningsCount = txns.filter((t) => t.kind === "winning").length;
  const biggestWin = Math.max(0, ...txns.filter((t) => t.kind === "winning").map((t) => t.amount));
  const winRate = matchesPlayed === 0 ? 100 : Math.round((winningsCount / (matchesPlayed + winningsCount)) * 100);

  const filtered = txns.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Deposits") return t.kind === "deposit";
    if (filter === "Winnings") return t.kind === "winning";
    if (filter === "Wagers") return t.kind === "wager";
    if (filter === "Withdrawals") return t.kind === "withdrawal";
    return true;
  });

  function pushTxn(t: Omit<Txn, "id" | "time">) {
    setTxns((prev) => [{ ...t, id: Date.now(), time: "Just now" }, ...prev]);
  }

  function doAdd() {
    if (amount <= 0) { toast("Enter an amount above 0 Scalps", "error"); return; }
    setBusy(true);
    toast("Processing deposit…", "info");
    setTimeout(() => {
      pushTxn({ type: "Deposit", note: "Mock top-up (no real money)", amount, dir: "in", kind: "deposit" });
      setBusy(false);
      setModal(null);
      toast(`Added ${amount} Scalps to your balance`, "success");
    }, 900);
  }

  function doWithdraw() {
    if (amount <= 0) { toast("Enter an amount above 0 Scalps", "error"); return; }
    if (amount > balance) { toast("Not enough Scalps to withdraw", "error"); return; }
    setBusy(true);
    toast("Submitting withdrawal…", "info");
    setTimeout(() => {
      pushTxn({ type: "Withdrawal", note: "Mock withdrawal (no real money)", amount, dir: "out", kind: "withdrawal" });
      setBusy(false);
      setModal(null);
      toast(`Withdrawal of ${amount} Scalps requested`, "success");
    }, 900);
  }

  return (
    <div className="wallet-page">
      <div className="wallet-grid-top">
        <div className="balance-card j-hover-lift">
          <div className="balance-label">TOTAL BALANCE</div>
          <div className="balance-main">
            <span className="balance-num">{balance.toFixed(2)}</span>
            <span className="balance-cur">Scalps</span>
          </div>
          <div className="balance-meta">≈ ${balance.toFixed(2)} value · Scalps are in-platform credits, not cash</div>
          <div className="funds-pill"><span className="dot" /> Funds available</div>
          <div className="balance-actions">
            <button className="btn btn-primary" onClick={() => { setAmount(25); setModal("add"); }}>+ Add Scalps</button>
            <button className="btn btn-ghost" onClick={() => { setAmount(10); setModal("withdraw"); }}>↗ Withdraw</button>
            <button className="btn btn-ghost" onClick={() => setModal("methods")}>Payment Methods</button>
          </div>
        </div>
        <div className="mini-stats">
          <div className="mini-stat j-hover-lift"><div className="mini-label">DEPOSITED</div><div className="mini-num">{deposited.toFixed(2)} <small>Scalps</small></div></div>
          <div className="mini-stat j-hover-lift"><div className="mini-label">WON</div><div className="mini-num pos">{won.toFixed(2)} <small>Scalps</small></div></div>
          <div className="mini-stat j-hover-lift"><div className="mini-label">WITHDRAWN</div><div className="mini-num">{withdrawn.toFixed(2)} <small>Scalps</small></div></div>
        </div>
      </div>

      <div className="wallet-section">
        <h2 className="wallet-h2">Performance</h2>
        <div className="perf-grid">
          <div className="perf-card j-hover-lift"><div className="mini-label">NET PROFIT / LOSS</div><div className={"perf-val " + (netProfit >= 0 ? "pos" : "neg")}>{netProfit >= 0 ? "+" : ""}{netProfit.toFixed(2)} Scalps</div><div className="perf-sub">{netProfit >= 0 ? "You’re in profit" : "Down this period"}</div></div>
          <div className="perf-card j-hover-lift"><div className="mini-label">TOTAL WAGERED</div><div className="perf-val">{wagered.toFixed(2)} Scalps</div><div className="perf-sub">{matchesPlayed} match{matchesPlayed === 1 ? "" : "es"} played</div></div>
          <div className="perf-card j-hover-lift"><div className="mini-label">BIGGEST WIN</div><div className="perf-val">{biggestWin.toFixed(2)} Scalps</div><div className="perf-sub">All time</div></div>
          <div className="perf-card j-hover-lift"><div className="mini-label">WIN RATE</div><div className="perf-val">{winRate}%</div><div className="perf-sub">Wins vs. wagers</div></div>
        </div>
      </div>

      <div className="wallet-section">
        <div className="txn-head">
          <h2 className="wallet-h2">Transactions</h2>
          <div className="txn-filters">
            {FILTERS.map((f) => (
              <button key={f} className={"tf" + (filter === f ? " on" : "")} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        <div className="txn-list">
          {filtered.length === 0 && <div className="txn-empty">No {filter.toLowerCase()} yet.</div>}
          {filtered.map((t) => (
            <div className="txn-row" key={t.id}>
              <div className={"txn-icon " + (t.dir === "in" ? "in" : "out")}>{t.dir === "in" ? "↓" : "↑"}</div>
              <div className="txn-info"><div className="txn-type">{t.type}</div><div className="txn-note">{t.note}</div></div>
              <div className="txn-right"><div className={"txn-amt " + (t.dir === "in" ? "" : "neg")}>{t.dir === "in" ? "+" : "-"}{t.amount.toFixed(2)} Scalps</div><div className="txn-time">{t.time}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="trust-strip">
        <div className="trust-item"><Icon name="Lock" /> Mock wallet — no real money moves here</div>
        <div className="trust-item"><Icon name="Shield" /> Real deposits are gated &amp; require verification</div>
        <div className="trust-item"><Icon name="Scale" /> Play responsibly · set spending limits in Settings</div>
      </div>
      <div className="wallet-legal">Scalps are in-platform credits used for entry fees and cosmetics. This is a demo wallet; deposits, withdrawals and payouts shown here are simulated and do not move real funds.</div>

      {modal && (
        <div className="wallet-modal-overlay" onClick={() => !busy && setModal(null)}>
          <div className="wallet-modal j-pop" onClick={(e) => e.stopPropagation()}>
            {modal === "methods" ? (
              <>
                <h3 className="wm-title">Payment Methods</h3>
                <p className="wm-sub">Add a method to enable real deposits. (Placeholders — not connected.)</p>
                <div className="wm-methods">
                  <button className="wm-method" onClick={() => toast("Card setup is not available in the demo", "info")}><span><Icon name="Card" /></span> Credit / Debit Card</button>
                  <button className="wm-method" onClick={() => toast("Bank transfer is not available in the demo", "info")}><span><Icon name="Bank" /></span> Bank Transfer</button>
                  <button className="wm-method" onClick={() => toast("Crypto is not available in the demo", "info")}><span>₿</span> Crypto Wallet</button>
                </div>
                <div className="wm-gate"><Icon name="Lock" /> Real-money methods are disabled in this demo build.</div>
                <div className="wm-actions"><button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button></div>
              </>
            ) : (
              <>
                <h3 className="wm-title">{modal === "add" ? "Add Scalps" : "Withdraw Scalps"}</h3>
                <p className="wm-sub">{modal === "add" ? "Top up your in-platform Scalps balance." : "Move Scalps out of your balance."} No real money is involved.</p>
                <div className="wm-amount"><span>{amount}</span> <small>Scalps</small></div>
                <div className="wm-presets">
                  {PRESETS.map((v) => (
                    <button key={v} className={"wm-preset" + (amount === v ? " on" : "")} onClick={() => setAmount(v)}>{v}</button>
                  ))}
                </div>
                <input className="wm-range" type="range" min={1} max={modal === "withdraw" ? Math.max(1, Math.floor(balance)) : 500} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                <div className="wm-gate"><Icon name="Lock" /> Demo only — {modal === "add" ? "no charge will be made" : "no payout will be sent"}.</div>
                <div className="wm-actions">
                  <button className="btn btn-ghost" disabled={busy} onClick={() => setModal(null)}>Cancel</button>
                  <button className="btn btn-primary" disabled={busy} onClick={modal === "add" ? doAdd : doWithdraw}>{busy ? "Processing…" : modal === "add" ? `Add ${amount} Scalps` : `Withdraw ${amount} Scalps`}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
