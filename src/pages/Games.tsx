import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader, Tag } from "../components/UI";
import { GAMES } from "../games/registry";

const GAME_HUE: Record<string, string> = {
  minigolf: "#22C55E", connect4: "#F59E0B", "8ball": "#3B82F6", airhockey: "#06B6D4",
  chess: "#3B82F6", rps: "#F43F5E", dotsboxes: "#A855F7", bowling: "#EAB308",
  basketball: "#FB923C", football: "#10B981", stacktower: "#8B5CF6", blockblast: "#EC4899",
  tron: "#22D3EE", cupking: "#F97316", racing: "#EF4444",
};
const hueFor = (id: string) => GAME_HUE[id] || "#00E5FF";

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
          <Link key={g.id} to={g.playable ? g.path : "/games"} className="game-card" style={{ ["--gh" as any]: hueFor(g.id) }}>
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
