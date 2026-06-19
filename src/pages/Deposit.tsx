import { useState } from "react";
import { Icon } from "../components/Icon";
import { Link } from "react-router-dom";
import "./deposit.css";

interface CryptoOpt { id: string; name: string; symbol: string; glyph: string; net: string; tone: string; }

const CRYPTO: CryptoOpt[] = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", glyph: "₿", net: "Bitcoin Network", tone: "#F7931A" },
  { id: "eth", name: "Ethereum", symbol: "ETH", glyph: "Ξ", net: "ERC-20", tone: "#627EEA" },
  { id: "sol", name: "Solana", symbol: "SOL", glyph: "◎", net: "Solana Network", tone: "#14F195" },
  { id: "usdc", name: "USD Coin", symbol: "USDC", glyph: "$", net: "ERC-20 / SPL", tone: "#2775CA" },
];

const QUICK = [10, 25, 50, 100, 250, 500];

function toneStyle(tone: string) {
  return { "--tone": tone } as React.CSSProperties;
}

export default function Deposit() {
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const active = CRYPTO.find((c) => c.id === selected) || null;

  return (
    <div className="deposit-page">
      <div className="dep-bg" aria-hidden="true" />

      <header className="dep-head">
        <div>
          <Link to="/wallet" className="dep-back"><Icon name="ArrowLeft" /> Wallet</Link>
          <h1 className="dep-title">Add Funds</h1>
          <p className="dep-sub">Top up your Scalps balance to enter matches and tournaments.</p>
        </div>
        <div className="dep-limits">
          <span className="dep-limit-pill">Min $1.00</span>
          <span className="dep-limit-pill">Max $10,000</span>
        </div>
      </header>

      <div className="trust-strip">
        <div className="trust-item">
          <span className="trust-ic"><Icon name="Lock" /></span>
          <div><strong>Secure</strong><span>256-bit encrypted</span></div>
        </div>
        <div className="trust-item">
          <span className="trust-ic"><Icon name="Bolt" /></span>
          <div><strong>Instant</strong><span>Auto-credited on confirm</span></div>
        </div>
        <div className="trust-item">
          <span className="trust-ic"><Icon name="Shield" /></span>
          <div><strong>Protected</strong><span>Funds held in escrow</span></div>
        </div>
      </div>

      <div className="dep-grid">
        <section className="ds-card dep-methods">
          <h2 className="dep-h">Crypto Deposits</h2>
          <p className="dep-h-sub">Fastest option — funds credited after network confirmation.</p>
          <div className="crypto-list">
            {CRYPTO.map((c) => (
              <button
                key={c.id}
                className={"crypto-opt" + (selected === c.id ? " on" : "")}
                onClick={() => setSelected(c.id)}
                style={toneStyle(c.tone)}
              >
                <span className="crypto-glyph">{c.glyph}</span>
                <span className="crypto-meta">
                  <strong>{c.name}</strong>
                  <span>{c.symbol} · {c.net}</span>
                </span>
                <span className="crypto-arrow">›</span>
              </button>
            ))}
          </div>

          <h2 className={"dep-h dep-h-spaced"}>Card & App Payments</h2>
          <div className="soon-list">
            <div className="soon-opt"><span className="soon-lbl"><Icon name="Card" /> Credit / Debit Card</span><span className="soon-tag">Coming Soon</span></div>
            <div className="soon-opt"><span className="soon-lbl"><Icon name="Card" /> Apple Pay</span><span className="soon-tag">Coming Soon</span></div>
            <div className="soon-opt"><span className="soon-lbl"><Icon name="Card" /> Cash App</span><span className="soon-tag">Coming Soon</span></div>
          </div>
        </section>

        <section className="ds-card dep-detail">
          {active ? (
            <div className="detail-inner">
              <div className="detail-coin" style={toneStyle(active.tone)}>
                <span className="detail-glyph">{active.glyph}</span>
                <div><strong>{active.name}</strong><span>{active.net}</span></div>
              </div>

              <label className="detail-label">Amount (USD)</label>
              <div className="amount-box">
                <span className="amount-cur">$</span>
                <input
                  className="amount-input"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
              <div className="quick-amts">
                {QUICK.map((q) => (
                  <button key={q} className="quick-amt" onClick={() => setAmount(String(q))}>${q}</button>
                ))}
              </div>

              <button className="gen-btn" disabled={!amount || Number(amount) < 1}>
                Generate Deposit Address
              </button>
              <p className="detail-note">
                A unique {active.symbol} address will be generated. Send only {active.symbol} on the {active.net} network — other assets may be lost.
              </p>
            </div>
          ) : (
            <div className="detail-empty">
              <span className="empty-ic"><Icon name="Coins" /></span>
              <p>Select a crypto on the left to begin your deposit.</p>
            </div>
          )}
        </section>
      </div>

      <footer className="dep-legal">
        <p>
          <strong>18+ only.</strong> Jango is a skill-based competitive platform. Deposits fund entry into skill matches and are not gambling wagers.
          Play responsibly — set <Link to="/settings">spending limits</Link>, enable cool-off timers, or self-exclude at any time.
        </p>
        <p className="dep-help">Need help? Visit the responsible-gaming center or contact support.</p>
      </footer>
    </div>
  );
}
