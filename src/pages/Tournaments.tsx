import { useState } from "react";
import "./pages.css";

type Tourney = {
  id: number;
  name: string;
  game: string;
  status: "live" | "upcoming" | "registering";
  buyIn: number;
  prize: number;
  players: number;
  cap: number;
  starts: string;
  format: string;
};

const FILTERS = ["All", "Live", "Registering", "Upcoming"];

const DATA: Tourney[] = [
  { id: 1, name: "Sunday Showdown", game: "8-Ball Pool", status: "live", buyIn: 10, prize: 850, players: 96, cap: 128, starts: "Live now", format: "Single Elim" },
  { id: 2, name: "Mini Golf Masters", game: "Mini Golf", status: "registering", buyIn: 5, prize: 420, players: 58, cap: 64, starts: "in 18m", format: "Best of 3" },
  { id: 3, name: "Grandmaster Gambit", game: "Chess", status: "registering", buyIn: 25, prize: 1600, players: 41, cap: 64, starts: "in 42m", format: "Swiss" },
  { id: 4, name: "Friday Night Faceoff", game: "Air Hockey", status: "upcoming", buyIn: 8, prize: 600, players: 12, cap: 96, starts: "Tomorrow 8PM", format: "Double Elim" },
  { id: 5, name: "Connect Four Clash", game: "Connect Four", status: "upcoming", buyIn: 3, prize: 240, players: 5, cap: 32, starts: "Sat 2PM", format: "Single Elim" },
  { id: 6, name: "High Roller Invitational", game: "8-Ball Pool", status: "upcoming", buyIn: 85, prize: 5200, players: 18, cap: 64, starts: "Sun 6PM", format: "Single Elim" },
];

export default function Tournaments() {
  const [filter, setFilter] = useState(0);

  const shown = DATA.filter((t) => {
    if (filter === 0) return true;
    if (filter === 1) return t.status === "live";
    if (filter === 2) return t.status === "registering";
    return t.status === "upcoming";
  });

  const totalPrize = DATA.reduce((s, t) => s + t.prize, 0);

  return (
    <div className={"page tn-page"}>
      <header className={"page-head"}>
        <div>
          <h1 className={"page-title"}>Tournaments</h1>
          <p className={"page-sub"}>Compete in bracketed events. Bigger fields, bigger prizes.</p>
        </div>
        <div className={"tn-prizepool"}>
          <span className={"tn-prize-num"}>S {totalPrize.toLocaleString()}</span>
          <span className={"tn-prize-label"}>Total Prize Pools</span>
        </div>
      </header>

      <div className={"chip-row"} style={{ marginBottom: 20 }}>
        {FILTERS.map((f, i) => (
          <button key={f} className={"chip " + (filter === i ? "chip-on" : "")} onClick={() => setFilter(i)}>{f}</button>
        ))}
      </div>

      <div className={"tn-grid"}>
        {shown.map((t) => (
          <div key={t.id} className={"tn-card"}>
            <div className={"tn-card-top"}>
              <span className={"tn-status tn-" + t.status}>{t.status === "live" ? "LIVE" : t.status === "registering" ? "REGISTERING" : "UPCOMING"}</span>
              <span className={"tn-game"}>{t.game}</span>
            </div>
            <h3 className={"tn-name"}>{t.name}</h3>
            <div className={"tn-prize"}>S {t.prize.toLocaleString()}<span> prize pool</span></div>
            <div className={"tn-meta"}>
              <div><span className={"tn-meta-k"}>Buy-in</span><span className={"tn-meta-v"}>S {t.buyIn}</span></div>
              <div><span className={"tn-meta-k"}>Format</span><span className={"tn-meta-v"}>{t.format}</span></div>
              <div><span className={"tn-meta-k"}>Starts</span><span className={"tn-meta-v"}>{t.starts}</span></div>
            </div>
            <div className={"tn-fill"}>
              <div className={"tn-fill-bar"}><div className={"tn-fill-in"} style={{ width: (t.players / t.cap * 100) + "%" }} /></div>
              <span className={"tn-fill-txt"}>{t.players}/{t.cap} players</span>
            </div>
            <button className={"btn-grad tn-join"}>{t.status === "live" ? "Watch" : "Register"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
