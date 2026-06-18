import { useState } from "react";
import { Icon } from "../components/Icon";
import { toast } from "../components/UI";
import "./tournaments.css";

type Status = "live" | "registering" | "upcoming" | "completed";
type Tourney = {
  id: string; name: string; game: string; status: Status;
  pot: number; buyIn: number; format: string; starts: string;
  players: number; cap: number; winner?: string;
};

const TOURNEYS: Tourney[] = [
  { id: "t1", name: "Sunday Showdown", game: "8-Ball Pool", status: "live", pot: 850, buyIn: 10, format: "Single Elim", starts: "Live now", players: 96, cap: 128 },
  { id: "t2", name: "Mini Golf Masters", game: "Mini Golf", status: "registering", pot: 420, buyIn: 5, format: "Best of 3", starts: "in 18m", players: 58, cap: 64 },
  { id: "t3", name: "Grandmaster Gambit", game: "Chess", status: "registering", pot: 1600, buyIn: 25, format: "Swiss", starts: "in 42m", players: 41, cap: 64 },
  { id: "t4", name: "Friday Night Faceoff", game: "Air Hockey", status: "upcoming", pot: 600, buyIn: 8, format: "Double Elim", starts: "Tomorrow 8PM", players: 12, cap: 96 },
  { id: "t5", name: "Connect Four Clash", game: "Connect Four", status: "upcoming", pot: 240, buyIn: 3, format: "Single Elim", starts: "Sat 2PM", players: 5, cap: 32 },
  { id: "t6", name: "High Roller Invitational", game: "8-Ball Pool", status: "upcoming", pot: 5200, buyIn: 85, format: "Single Elim", starts: "Sun 6PM", players: 18, cap: 64 },
  { id: "t7", name: "Rookie Rumble", game: "Mini Golf", status: "completed", pot: 300, buyIn: 5, format: "Single Elim", starts: "Last week", players: 64, cap: 64, winner: "ShadowAce" },
];

const FILTERS = ["All", "Live", "Registering", "Upcoming", "Completed"];
const STATUS_LABEL: Record<Status, string> = { live: "LIVE", registering: "REGISTERING", upcoming: "UPCOMING", completed: "COMPLETED" };
const SAMPLE_PLAYERS = ["ShadowAce", "NovaStrike", "ByteKnight", "VortexQ", "PixelPit", "IronClaw", "Zephyr", "MaceWind"];

export default function Tournaments() {
  const [filter, setFilter] = useState("All");
  const [joined, setJoined] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<Tourney | null>(null);
  const [bracket, setBracket] = useState<Tourney | null>(null);

  const totalPot = TOURNEYS.filter((t) => t.status !== "completed").reduce((s, t) => s + t.pot, 0);
  const visible = TOURNEYS.filter((t) => filter === "All" ? true : t.status === filter.toLowerCase());

  function join(t: Tourney) {
    if (joined.includes(t.id)) { toast("You are already registered", "info"); return; }
    setJoined((j) => [...j, t.id]);
    setConfirm(null);
    toast(`Registered for ${t.name} — ${t.buyIn} Scalps entry`, "reward");
  }

  return (
    <div className="trn-page">
      <div className="trn-head">
        <div>
          <h1 className="trn-title">Tournaments</h1>
          <p className="trn-sub">Compete in bracketed events. Bigger fields, bigger prizes.</p>
        </div>
        <div className="trn-pot"><div className="trn-pot-num">Ⓢ {totalPot.toLocaleString()}</div><div className="trn-pot-l">TOTAL PRIZE POOLS</div></div>
      </div>

      <div className="trn-filters">
        {FILTERS.map((f) => (<button key={f} className={"trn-filter" + (filter === f ? " on" : "")} onClick={() => setFilter(f)}>{f}</button>))}
      </div>

      <div className="trn-grid">
        {visible.map((t) => {
          const pct = Math.round((t.players / t.cap) * 100);
          const isJoined = joined.includes(t.id);
          return (
            <div key={t.id} className={"trn-card status-" + t.status}>
              <div className="trn-card-top">
                <span className={"trn-badge " + t.status}>{STATUS_LABEL[t.status]}</span>
                <span className="trn-game">{t.game}</span>
              </div>
              <h3 className="trn-name">{t.name}</h3>
              <div className="trn-prize"><span className="trn-prize-num">Ⓢ {t.pot.toLocaleString()}</span> <small>prize pool</small></div>
              <div className="trn-meta">
                <div><div className="trn-meta-l">ENTRY</div><div className="trn-meta-v">Ⓢ {t.buyIn}</div></div>
                <div><div className="trn-meta-l">FORMAT</div><div className="trn-meta-v">{t.format}</div></div>
                <div><div className="trn-meta-l">STARTS</div><div className="trn-meta-v">{t.starts}</div></div>
              </div>
              {t.status === "completed" ? (
                <div className="trn-winner"><Icon name="Trophy" /> Winner: <strong>{t.winner}</strong></div>
              ) : (
                <>
                  <div className="trn-fill"><div className="trn-fill-bar" style={{ width: pct + "%" }} /></div>
                  <div className="trn-players">{t.players}/{t.cap} players</div>
                </>
              )}
              <div className="trn-actions">
                <button className="trn-bracket-btn" onClick={() => setBracket(t)}>Bracket</button>
                {t.status === "live" ? (
                  <button className="trn-join watch" onClick={() => toast(`Spectating ${t.name}`, "info")}>▶ Watch</button>
                ) : t.status === "completed" ? (
                  <button className="trn-join done" disabled>Finished</button>
                ) : isJoined ? (
                  <button className="trn-join joined" disabled><Icon name="Check" /> Registered</button>
                ) : (
                  <button className="trn-join" onClick={() => setConfirm(t)}>Register</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {confirm && (
        <div className="trn-modal-overlay" onClick={() => setConfirm(null)}>
          <div className="trn-modal j-pop" onClick={(e) => e.stopPropagation()}>
            <span className={"trn-badge " + confirm.status}>{STATUS_LABEL[confirm.status]}</span>
            <h3 className="trn-modal-name">{confirm.name}</h3>
            <p className="trn-modal-sub">{confirm.game} · {confirm.format}</p>
            <div className="trn-modal-stats">
              <div><div className="trn-meta-l">ENTRY FEE</div><div className="trn-meta-v big">Ⓢ {confirm.buyIn}</div></div>
              <div><div className="trn-meta-l">PRIZE POOL</div><div className="trn-meta-v big">Ⓢ {confirm.pot.toLocaleString()}</div></div>
              <div><div className="trn-meta-l">FIELD</div><div className="trn-meta-v big">{confirm.players}/{confirm.cap}</div></div>
            </div>
            <div className="trn-modal-note">Entry fee is mock Scalps — no real money moves. Prizes are simulated.</div>
            <div className="trn-modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => join(confirm)}>Confirm · Ⓢ {confirm.buyIn}</button>
            </div>
          </div>
        </div>
      )}

      {bracket && (
        <div className="trn-modal-overlay" onClick={() => setBracket(null)}>
          <div className="trn-modal wide j-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="trn-modal-name">{bracket.name} — Bracket</h3>
            <p className="trn-modal-sub">{bracket.format} · {bracket.game}</p>
            <div className="trn-bracket">
              <div className="trn-round">
                <div className="trn-round-l">Quarterfinals</div>
                {[0, 1, 2, 3].map((i) => (
                  <div className="trn-match" key={i}>
                    <span className={i % 2 === 0 ? "trn-seed win" : "trn-seed"}>{SAMPLE_PLAYERS[i * 2 % SAMPLE_PLAYERS.length]}</span>
                    <span className="trn-seed">{SAMPLE_PLAYERS[(i * 2 + 1) % SAMPLE_PLAYERS.length]}</span>
                  </div>
                ))}
              </div>
              <div className="trn-round">
                <div className="trn-round-l">Semifinals</div>
                {[0, 1].map((i) => (
                  <div className="trn-match tall" key={i}>
                    <span className={i === 0 ? "trn-seed win" : "trn-seed"}>{SAMPLE_PLAYERS[i * 4 % SAMPLE_PLAYERS.length]}</span>
                    <span className="trn-seed">{SAMPLE_PLAYERS[(i * 4 + 2) % SAMPLE_PLAYERS.length]}</span>
                  </div>
                ))}
              </div>
              <div className="trn-round">
                <div className="trn-round-l">Final</div>
                <div className="trn-match xtall">
                  <span className="trn-seed win">{bracket.winner || SAMPLE_PLAYERS[0]}</span>
                  <span className="trn-seed">{SAMPLE_PLAYERS[4]}</span>
                </div>
              </div>
              <div className="trn-round champ">
                <div className="trn-round-l">Champion</div>
                <div className="trn-champ"><Icon name="Trophy" /> {bracket.winner || SAMPLE_PLAYERS[0]}</div>
              </div>
            </div>
            <div className="trn-modal-actions">
              <button className="btn btn-ghost" onClick={() => setBracket(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
