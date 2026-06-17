import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./play.css";

type Game = { name: string; icon: string; sub: string; theme: string };

const GAMES: Game[] = [
  { name: "Chess", icon: "♞", sub: "Outthink your rival", theme: "linear-gradient(135deg,#1e293b,#0f172a)" },
  { name: "8-Ball Pool", icon: "", sub: "Sink it clean", theme: "linear-gradient(135deg,#064e3b,#022c22)" },
  { name: "Air Hockey", icon: "", sub: "Fast reflexes win", theme: "linear-gradient(135deg,#0c4a6e,#082f49)" },
  { name: "Mini Golf", icon: "⛳", sub: "Lowest strokes", theme: "linear-gradient(135deg,#14532d,#052e16)" },
  { name: "Tron", icon: "", sub: "Don't crash the grid", theme: "linear-gradient(135deg,#1e1b4b,#0c0a2e)" },
  { name: "Block Blast", icon: "隣", sub: "Clear the stack", theme: "linear-gradient(135deg,#7c2d12,#431407)" },
];

const MODES = [
  { id: "casual", label: "Casual", cls: "casual" },
  { id: "ranked", label: "Ranked", cls: "ranked" },
  { id: "bot", label: "vs Bot", cls: "bot" },
  { id: "tournament", label: "Tournament", cls: "tournament" },
  { id: "private", label: "Private", cls: "private" },
];

export default function Play() {
  const nav = useNavigate();
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState("ranked");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % GAMES.length), 3200);
    return () => clearInterval(t);
  }, [paused]);

  const game = GAMES[idx];

  return (
    <div className={"play-page"}>
      <div className={"ds-arena-floor"} />
      <div className={"play-glow play-glow-a"} />
      <div className={"play-glow play-glow-b"} />
      <div className={"ds-vignette"} />

      <div className={"play-topbar"}>
        <div className={"player-card"}>
          <div className={"player-av"}>B</div>
          <div><span className={"player-name"}>Player</span><span className={"player-lv"}>Lv 1</span></div>
        </div>
        <div className={"balance-pill"}><span className={"coin"}>S</span> 117.00 <span className={"plus"}>+</span></div>
      </div>

      <div className={"play-stage"}>
        <span className={"ds-eyebrow"}>SKILL-BASED COMPETITION</span>
        <h1 className={"play-headline"}>Play Skill Games. <span className={"ds-grad-text"}>Win Real Money.</span></h1>
        <p className={"play-subhead"}>Instant payouts · Real competition · 3% rake</p>

        <div className={"carousel"} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className={"carousel-card"} style={{ background: game.theme }}>
            <div className={"ds-glow-ring carousel-ring"}>
              <span className={"carousel-icon"} key={game.name}>{game.icon}</span>
            </div>
            <h2 className={"carousel-title ds-grad-text"}>{game.name}</h2>
            <p className={"carousel-sub"}>{game.sub}</p>
          </div>
          <div className={"carousel-dots"}>
            {GAMES.map((g, i) => (
              <button key={g.name} className={"dot " + (i === idx ? "active" : "")} onClick={() => setIdx(i)} aria-label={g.name} />
            ))}
          </div>
        </div>

        <button className={"ds-btn-gradient play-btn"} onClick={() => nav("/games")}>
          <span className={"play-icon"}>▶</span> PLAY
        </button>

        <div className={"mode-chips"}>
          {MODES.map((m) => (
            <button key={m.id} className={"ds-chip " + m.cls + (mode === m.id ? " selected" : "")} onClick={() => setMode(m.id)}>{m.label}</button>
          ))}
        </div>
      </div>

      <div className={"status-strip"}>
        <span className={"st-item online"}>● online now</span>
        <span className={"st-item"}>⚡ live matches</span>
        <span className={"st-item"}>3% rake</span>
        <span className={"st-item"}>instant payouts</span>
        <span className={"st-spacer"} />
        <button className={"st-link"} onClick={() => nav("/leaderboard")}>Rankings</button>
        <button className={"st-link"}>Join Code</button>
      </div>
    </div>
  );
}
