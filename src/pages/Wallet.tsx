import { useState } from 'react';
import './pages.css';

const TXNS = [
  { type: 'Deposit', note: 'Fresh start bonus: 1 day streak', amt: 5, kind: 'in' },
  { type: 'Reward', note: 'Daily login reward: 2 day streak', amt: 2, kind: 'in' },
  { type: 'Deposit', note: 'Crypto deposit (BTC)', amt: 100, kind: 'in' },
  { type: 'Wager', note: 'Chess ranked match', amt: -1, kind: 'out' },
  { type: 'Winnings', note: 'Air Hockey win vs Bot', amt: 9, kind: 'in' },
];

const FILTERS = ['All','Deposits','Winnings','Wagers','Withdrawals'];
const CRYPTO = [['Bitcoin','BTC'],['Ethereum','ETH'],['Solana','SOL']];
const QUICK = [10,25,50,100];

export default function Wallet() {
  const [filter, setFilter] = useState('All');
  const [showDeposit, setShowDeposit] = useState(false);
  const [coin, setCoin] = useState<string[] | null>(null);
  const [amount, setAmount] = useState(25);
  return (
    <div className='page wallet-page'>
      <div className='balance-card'>
        <div className='bc-left'>
          <div className='eyebrow'>Total Balance</div>
          <div className='bc-amount'><span className='balance-num'>117.00</span> <span className='bc-unit'>Scalps</span></div>
          <div className='bc-sub'>= $117.00 USD · All funds immediately available</div>
          <div className='bc-status'><span className='live-dot' /> Funds available</div>
        </div>
        <div className='bc-actions'>
          <button className='btn-primary' onClick={() => setShowDeposit(true)}>+ Add Funds</button>
          <button className='btn-ghost'>↗ Withdraw</button>
          <button className='btn-ghost'>Methods</button>
        </div>
      </div>

      <div className='mini-stats'>
        <div className='mini-stat'><span className='ms-label'>Deposited</span><span className='ms-val'>105.00 S</span></div>
        <div className='mini-stat'><span className='ms-label'>Won</span><span className='ms-val'>9.00 S</span></div>
        <div className='mini-stat'><span className='ms-label'>Withdrawn</span><span className='ms-val'>0.00 S</span></div>
      </div>

      <h2 className='section-title'>Performance</h2>
      <div className='perf-grid'>
        <div className='perf-card'><div className='pc-label'>Net Profit / Loss</div><div className='pc-val green'>+10.00 S</div><div className='pc-note'>You're in profit</div></div>
        <div className='perf-card'><div className='pc-label'>Total Wagered</div><div className='pc-val'>1.00 S</div><div className='pc-note'>1 match played</div></div>
        <div className='perf-card'><div className='pc-label'>Biggest Win</div><div className='pc-val'>9.00 S</div><div className='pc-note'>All time</div></div>
        <div className='perf-card'><div className='pc-label'>Win Rate</div><div className='pc-val'>100%</div><div className='pc-note'>Wins vs. bets placed</div></div>
      </div>

      <div className='txn-head'>
        <h2 className='section-title'>Transactions</h2>
        <div className='txn-filters'>
          {FILTERS.map(ff => <button key={ff} className={filter===ff?'tf on':'tf'} onClick={()=>setFilter(ff)}>{ff}</button>)}
        </div>
      </div>
      <div className='txn-list'>
        {TXNS.map((t,i)=>(
          <div key={i} className='txn-row'>
            <div className='txn-meta'><span className='txn-type'>{t.type}</span><span className='txn-note'>{t.note}</span></div>
            <span className={'txn-amt ' + (t.kind==='in'?'green':'red')}>{t.amt>0?'+':''}{t.amt.toFixed(2)} S</span>
          </div>
        ))}
      </div>

      <div className='trust-strip'>
        <div className='trust-item'><b>Secure Funds</b><span>256-bit encrypted</span></div>
        <div className='trust-item'><b>Instant Deposits</b><span>Via Stripe</span></div>
        <div className='trust-item'><b>Fast Withdrawals</b><span>1–3 business days</span></div>
      </div>

      {showDeposit && (
        <div className='modal-scrim' onClick={()=>{setShowDeposit(false);setCoin(null);}}>
          <div className='deposit-modal pop-in' onClick={e=>e.stopPropagation()}>
            <button className='modal-x' onClick={()=>{setShowDeposit(false);setCoin(null);}}>×</button>
            {!coin ? (
              <>
                <h3 className='step-title'>Add Funds</h3>
                <div className='dep-eyebrow'>Crypto Deposits</div>
                <div className='crypto-grid'>
                  {CRYPTO.map(c=>(
                    <button key={c[1]} className='crypto-card' onClick={()=>setCoin(c)}>
                      <span className='cc-name'>{c[0]}</span><span className='cc-sym'>{c[1]}</span>
                    </button>
                  ))}
                </div>
                <div className='dep-eyebrow'>Card &amp; App Payments</div>
                <div className='soon-row'>
                  <span className='soon'>Apple Pay <em>Soon</em></span>
                  <span className='soon'>Venmo <em>Soon</em></span>
                  <span className='soon'>Visa <em>Soon</em></span>
                </div>
                <p className='dep-note'>Visa, Mastercard, Apple Pay and Venmo are coming. Use crypto to deposit now. Min $1.00 · Max $10,000.</p>
              </>
            ) : (
              <>
                <button className='back-link' onClick={()=>setCoin(null)}>← Back</button>
                <h3 className='step-title'>{coin[0]} Deposit</h3>
                <div className='dep-eyebrow'>{coin[0]} Network ({coin[1]})</div>
                <label className='dep-label'>Deposit Amount (USD)</label>
                <input className='dep-input' type='number' value={amount} onChange={e=>setAmount(Number(e.target.value))} />
                <div className='quick-amts'>
                  {QUICK.map(q=> <button key={q} className={amount===q?'qa on':'qa'} onClick={()=>setAmount(q)}>${q}</button>)}
                </div>
                <div className='dep-rate'>1 USD = 1 Scalp</div>
                <button className='start-btn'>Generate Deposit Address</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
