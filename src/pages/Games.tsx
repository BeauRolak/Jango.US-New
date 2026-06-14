import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader, Tag } from "../components/UI";
import { GAMES } from "../games/registry";

const CATS = ["All", "Sports", "Board", "Arcade", "Casual"] as const;

export default function Games() {
  const [cat, setCat] = useState<string>("All");
  const list = cat === "All" ? GAMES : GAMES.filter((g) => g.category === cat);
  return (
    <div>
      <PageHeader title="Game Lobby" subtitle="Pick a game and start a 1v1 skill match." />
      <div className="chip-row">
        {CATS.map((c) => (
          <button key={c} className={"chip " + (cat === c ? "chip-on" : "")} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-auto">
        {list.map((g) => (
          <Link key={g.id} to={g.playable ? g.path : "/games"} className="game-card">
            <div className="game-art" style={{ background: g.art }}>
              <span className="game-emoji">{g.emoji}</span>
              {g.playable && <span className="game-live">PLAYABLE</span>}
            </div>
            <div className="game-card-body">
              <div className="game-card-title">{g.name}</div>
              <div className="game-card-meta">
                <Tag color={g.playable ? "green" : "neon"}>{g.playable ? "Ready" : "Soon"}</Tag>
                <span className="game-card-mode">{g.mode}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
