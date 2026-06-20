import { useState, useMemo, useRef } from "react";
import { Icon, type IconName } from "../components/Icon";
import {
  PageHero, GlowCard, AnimatedButton, StatusPill, ActionModal, useFeedback,
} from "../components/Juice";
import { useScalps } from "../lib/mockData";
import "./warena.css";

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

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "deposit", label: "Deposits" },
  { key: "winning", label: "Winnings" },
  { key: "wager", label: "Wagers" },
  { key: "withdrawal", label: "Withdrawals" },
];

const PRESETS = [5, 10, 25, 50, 100];

const METHODS: { id: string; name: string; icon: IconName; tag: string }[] = [
  { id: "card", name: "Credit / Debit Card", icon: "Card", tag: "Placeholder" },
  { id: "bank", name: "Bank Transfer", icon: "Bank", tag: "Placeholder" },
  { id: "balance", name: "Promo Balance", icon: "Coins", tag: "Mock" },
];

const KIND_ICON: Record<Txn["kind"], IconName> = {
  deposit: "ArrowDown", winning: "Trophy", wager: "Swords", withdrawal: "ArrowUpRight",
};

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Wallet() {
  const { fire } = useFeedback();
  const { balance, set: setShared } = useScalps();
  const [txns, setTxns] = useState<Txn[]>(SEED_TXNS);
  const [filter, setFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [wdOpen, setWdOpen] = useState(false);
  const [amount, setAmount] = useState(25);
  const [method, setMethod] = useState("card");
  const [bump, setBump] = useState(false);
  const nextId = useRef(6);

  const stats = useMemo(() => {
    const deposited = txns.filter((t) => t.kind === "deposit").reduce((s, t) => s + t.amount, 0);
    const won = txns.filter((t) => t.kind === "winning").reduce((s, t) => s + t.amount, 0);
    const wagered = txns.filter((t) => t.kind === "wager").reduce((s, t) => s + t.amount, 0);
    const withdrawn = txns.filter((t) => t.kind === "withdrawal").reduce((s, t) => s + t.amount, 0);
    const biggest = txns.filter((t) => t.kind === "winning").reduce((mx, t) => Math.max(mx, t.amount), 0);
    return { deposited, won, wagered, withdrawn, biggest, net: won - wagered };
  }, [txns]);

  const shown = useMemo(
    () => (filter === "all" ? txns : txns.filter((t) => t.kind === filter)),
    [txns, filter]
  );

  const pulseBalance = () => { setBump(true); window.setTimeout(() => setBump(false), 520); };

  const doAdd = () => {
    if (amount <= 0) { fire("error", "Enter an amount", null); return; }
    setShared(balance + amount);
    setTxns((arr) => [
      { id: nextId.current++, type: "Deposit", note: "Added via " + (METHODS.find((m) => m.id === method)?.name ?? "Card") + " (mock)", amount, time: "Just now", dir: "in", kind: "deposit" },
      ...arr,
    ]);
    fire("purchase", "Added Ⓢ " + amount + " (mock)", null);
    pulseBalance();
    setAddOpen(false);
  };

  const doWithdraw = () => {
    if (amount <= 0) { fire("error", "Enter an amount", null); return; }
    if (amount > balance) { fire("error", "Not enough Scalps", null); return; }
    setShared(balance - amount);
    setTxns((arr) => [
      { id: nextId.current++, type: "Withdrawal", note: "Cash-out request (mock, gated)", amount, time: "Just now", dir: "out", kind: "withdrawal" },
      ...arr,
    ]);
    fire("save", "Withdrawal requested (mock)", null);
    pulseBalance();
    setWdOpen(false);
  };

  const openAdd = () => { setAmount(25); setMethod("card"); fire("tap", "", null); setAddOpen(true); };
  const openWd = () => { setAmount(25); fire("tap", "", null); setWdOpen(true); };

  return (
    <div className="warena-page">
      <PageHero
        eyebrow="Your Wallet"
        title="Scalps"
        gradWord="Balance"
        sub="Track your Scalps, deposits and winnings. Money movement is mocked and gated — no real deposits or payouts in this preview."
      />

      <div className="warena-top">
        <GlowCard tone="primary" className="warena-bal">
          <div className="warena-bal-in">
            <div className="warena-bal-l">Total Balance</div>
            <div className={"warena-bal-num" + (bump ? " bump" : "")}>
              <span className="warena-bal-mark">Ⓢ</span>{fmt(balance)}<span className="warena-bal-unit">Scalps</span>
            </div>
            <div className="warena-bal-sub">Scalps are in-platform credits, not cash. No real money moves here.</div>
            <div style={{ marginBottom: 16 }}><StatusPill label="Funds available" kind="accent" /></div>
            <div className="warena-bal-actions">
              <AnimatedButton variant="grad" fbKind="reward" icon="ArrowDown" onClick={() => openAdd()}>Add Scalps</AnimatedButton>
              <AnimatedButton variant="ghost" fbKind="tap" icon="ArrowUpRight" onClick={() => openWd()}>Withdraw</AnimatedButton>
            </div>
          </div>
        </GlowCard>

        <div className="warena-stats">
          <GlowCard tone="primary" className="warena-stat">
            <div className="warena-stat-l"><span className="warena-stat-ico"><Icon name="ArrowDown" /></span>Deposited</div>
            <div className="warena-stat-v">Ⓢ {fmt(stats.deposited)}<span className="warena-stat-u">Scalps</span></div>
          </GlowCard>
          <GlowCard tone="success" className="warena-stat">
            <div className="warena-stat-l"><span className="warena-stat-ico"><Icon name="Trophy" /></span>Won</div>
            <div className="warena-stat-v pos">Ⓢ {fmt(stats.won)}<span className="warena-stat-u">Scalps</span></div>
          </GlowCard>
          <GlowCard tone="primary" className="warena-stat">
            <div className="warena-stat-l"><span className="warena-stat-ico"><Icon name="ArrowUpRight" /></span>Withdrawn</div>
            <div className="warena-stat-v">Ⓢ {fmt(stats.withdrawn)}<span className="warena-stat-u">Scalps</span></div>
          </GlowCard>
        </div>
      </div>

      <div className="warena-h">Performance</div>
      <div className="warena-perf">
        <GlowCard tone="primary" className="warena-perf-c">
          <div className="warena-stat-l">Net Profit / Loss</div>
          <div className={"warena-stat-v" + (stats.net >= 0 ? " pos" : "")}>{stats.net >= 0 ? "+" : ""}Ⓢ {fmt(stats.net)}</div>
        </GlowCard>
        <GlowCard tone="primary" className="warena-perf-c">
          <div className="warena-stat-l">Total Wagered</div>
          <div className="warena-stat-v">Ⓢ {fmt(stats.wagered)}</div>
        </GlowCard>
        <GlowCard tone="primary" className="warena-perf-c">
          <div className="warena-stat-l">Biggest Win</div>
          <div className="warena-stat-v">Ⓢ {fmt(stats.biggest)}</div>
        </GlowCard>
        <GlowCard tone="primary" className="warena-perf-c">
          <div className="warena-stat-l">Transactions</div>
          <div className="warena-stat-v">{txns.length}</div>
        </GlowCard>
      </div>

      <div className="warena-h">Transactions</div>
      <div className="warena-chips">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={"warena-chip" + (filter === f.key ? " on" : "")}
            onClick={(e) => { setFilter(f.key); fire("tap", "", e.currentTarget); }}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="warena-txns">
        {shown.length === 0 ? (
          <div className="warena-empty">No transactions in this category yet.</div>
        ) : (
          shown.map((t) => (
            <div className="warena-txn" key={t.id}>
              <span className={"warena-txn-ico " + t.dir}><Icon name={KIND_ICON[t.kind]} /></span>
              <div className="warena-txn-mid">
                <div className="warena-txn-type">{t.type}</div>
                <div className="warena-txn-note">{t.note}</div>
              </div>
              <div className="warena-txn-right">
                <div className={"warena-txn-amt " + t.dir}>{t.dir === "in" ? "+" : "-"} Ⓢ {fmt(t.amount)}</div>
                <div className="warena-txn-time">{t.time}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <ActionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Scalps"
        footer={
          <>
            <AnimatedButton variant="ghost" fbKind="tap" onClick={() => setAddOpen(false)}>Cancel</AnimatedButton>
            <AnimatedButton variant="grad" fbKind="reward" pulse icon="ArrowDown" onClick={() => doAdd()}>Add Ⓢ {amount}</AnimatedButton>
          </>
        }
      >
        <div className="warena-m-label">Amount</div>
        <div className="warena-m-amount">
          <span className="mk">Ⓢ</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            aria-label="Amount to add"
          />
        </div>
        <div className="warena-m-presets">
          {PRESETS.map((v) => (
            <button key={v} className={"warena-m-preset" + (amount === v ? " on" : "")} onClick={(e) => { setAmount(v); fire("tap", "", e.currentTarget); }}>Ⓢ {v}</button>
          ))}
        </div>
        <div className="warena-m-label">Payment Method</div>
        <div className="warena-m-methods">
          {METHODS.map((m) => (
            <div key={m.id} className={"warena-m-method" + (method === m.id ? " on" : "")} onClick={() => { setMethod(m.id); fire("tap", "", null); }}>
              <span className="warena-m-method-ico"><Icon name={m.icon} /></span>
              <span className="warena-m-method-name">{m.name}</span>
              <span className="warena-m-method-tag">{m.tag}</span>
            </div>
          ))}
        </div>
        <div className="warena-m-note">
          <span className="ico"><Icon name="Info" /></span>
          <span>Payment methods are placeholders. No card is charged and no real money moves — Scalps are mock in-platform credits in this preview.</span>
        </div>
      </ActionModal>

      <ActionModal
        open={wdOpen}
        onClose={() => setWdOpen(false)}
        title="Withdraw Scalps"
        footer={
          <>
            <AnimatedButton variant="ghost" fbKind="tap" onClick={() => setWdOpen(false)}>Cancel</AnimatedButton>
            <AnimatedButton variant="grad" fbKind="success" icon="ArrowUpRight" onClick={() => doWithdraw()}>Request Ⓢ {amount}</AnimatedButton>
          </>
        }
      >
        <div className="warena-m-label">Amount</div>
        <div className="warena-m-amount">
          <span className="mk">Ⓢ</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            aria-label="Amount to withdraw"
          />
        </div>
        <div className="warena-m-presets">
          {PRESETS.map((v) => (
            <button key={v} className={"warena-m-preset" + (amount === v ? " on" : "")} onClick={(e) => { setAmount(v); fire("tap", "", e.currentTarget); }}>Ⓢ {v}</button>
          ))}
        </div>
        <div className="warena-m-label">Destination</div>
        <div className="warena-m-methods">
          <div className="warena-m-method on">
            <span className="warena-m-method-ico"><Icon name="Bank" /></span>
            <span className="warena-m-method-name">Linked Bank Account</span>
            <span className="warena-m-method-tag">Placeholder</span>
          </div>
        </div>
        <div className="warena-m-note">
          <span className="ico"><Icon name="Info" /></span>
          <span>Withdrawals are gated in this preview. No real payout is sent — this only adjusts your mock Scalps balance.</span>
        </div>
      </ActionModal>
    </div>
  );
}
