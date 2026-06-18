import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./play.css";
import { Icon, type IconName } from "../components/Icon";
import { feedback } from "../components/Juice";

type Game = {
  name: string;
  icon: IconName;
  sub: string;
  diff: "Easy" | "Medium" | "Advanced";
  status: "Live" | "Ready" | "New";
  hue: string;
  route: string;
};

const GAMES: Game[] = [
  { name: "Chess", icon: "Crown", sub: "Outthink your rival", diff: "Advanced", status: "Live", hue: "#6366F1", route: "/games/chess" },
  { name: "8-Ball Pool", icon: "Target", sub: "Sink it clean", diff: "Medium", status: "Live", hue: "#10B981", route: "/games/eightball" },
  { name: "Air Hockey", icon: "Bolt", sub: "Fast reflexes win", diff: "Medium", status: "Ready", hue: "#0EA5E9", route: "/games/airhockey" },
  { name: "Mini Golf", icon: "Target", sub: "Lowest strokes", diff: "Medium", status: "Live", hue: "#22C55E", route: "/games/minigolf" },
  { name: "Tron", icon: "Bolt", sub: "Do not crash the grid", diff: "Advanced", status: "New", hue: "#8B5CF6", route: "/games/tron" },
  { name: "Block Blast", icon: "Building", sub: "Clear the stack", diff: "Easy", status: "Ready", hue: "#F97316", route: "/games/blockblast" },
  { name: "Connect 4", icon: "Dice", sub: "Four in a row", diff: "Easy", status: "Ready", hue: "#EF4444", route: "/games/connect4" },
  { name: "Rock Paper Scissors", icon: "Swords", sub: "Read your foe", diff: "Easy", status: "Ready", hue: "#EC4899", route: "/games/rps" },
  { name: "Dots & Boxes", icon: "List", sub: "Box them in", diff: "Medium", status: "Ready", hue: "#14B8A6", route: "/games/dotsboxes" },
  { name: "Bowling", icon: "Bolt", sub: "Strike it big", diff: "Easy", status: "Ready", hue: "#F59E0B", route: "/games/bowling" },
];

const MODES = [
  { id: "casual", label: "Casual", icon: "Gamepad" as IconName },
  { id: "ranked", label: "Ranked", icon: "Medal" as IconName },
  { id: "bot", label: "vs Bot", icon: "Target" as IconName },
  { id: "tournament", label: "Tournament", icon: "Trophy" as IconName },
  { id: "private", label: "Private", icon: "Lock" as IconName },
];

export default function Play() {
  const nav = useNavigate();
  const [mode, setMode] = useState("casual");
  const [spotlight, setSpotlight] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSpotlight((s) => (s + 1) % GAMES.length), 4200);
    return () => clearInterval(t);
  }, []);

  const launch = (g: Game) => {
    feedback("tap");
    nav(g.route);
  };

  return (
    <div className="play-page">
      <div className="play-bg" aria-hidden="true" />

      <header className="play-topbar">
        <div className="player-card">
          <div className="player-av">P</div>
          <div>
            <div className="player-name">Player</div>
            <div className="player-lv">Lv 1 · Bronze</div>
          </div>
        </div>
        <button className="balance-pill" onClick={() => nav("/wallet")}>
          <Icon name="Coins" className="coin" />
          <span>117.00</span>
          <span className="plus">+</span>
        </button>
      </header>

      <section className="play-hero">
        <div className="play-eyebrow">SKILL-BASED COMPETITION</div>
        <h1 className="play-headline">
          Play Skill Games.<br />
          <span className="grad-text">Win Real Money.</span>
        </h1>
        <p className="play-subhead">Instant payouts · Real competition · 3% rake</p>
        <div className="mode-chips">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={"mode-chip" + (mode === m.id ? " active" : "")}
              onClick={() => { setMode(m.id); feedback("tap"); }}
            >
              <Icon name={m.icon} /> {m.label}
            </button>
          ))}
        </div>
      </section>

      <section className="lobby">
        <div className="lobby-head">
          <h2 className="lobby-title">Choose your arena</h2>
          <span className="lobby-count">{GAMES.length} games live</span>
        </div>
        <div className="game-grid">
          {GAMES.map((g, i) => (
            <article
              key={g.name}
              className={"glaunch" + (i === spotlight ? " spotlight" : "")}
              style={{ ["--hue" as string]: g.hue }}
              onClick={() => launch(g)}
            >
              <div className="glaunch-glow" aria-hidden="true" />
              <div className="glaunch-top">
                <div className="glaunch-icon"><Icon name={g.icon} /></div>
                <span className={"status-pill s-" + g.status.toLowerCase()}>
                  {g.status === "Live" && <span className="live-dot" />}
                  {g.status}
                </span>
              </div>
              <div className="glaunch-name">{g.name}</div>
              <div className="glaunch-sub">{g.sub}</div>
              <div className="glaunch-foot">
                <span className={"diff-chip d-" + g.diff.toLowerCase()}>{g.diff}</span>
                <span className="glaunch-play">
                  <Icon name="Play" /> Play
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="play-status-strip">
        <span className="ss-item online"><span className="live-dot" /> online now</span>
        <span className="ss-item"><Icon name="Bolt" /> live matches</span>
        <span className="ss-item">3% rake</span>
        <span className="ss-item">instant payouts</span>
        <span className="ss-spacer" />
        <button className="ss-link" onClick={() => nav("/rankings")}>
          <Icon name="Chart" /> Rankings
        </button>
        <button className="ss-link" onClick={() => nav("/play")}>
          <Icon name="Users" /> Join Code
        </button>
      </footer>
    </div>
  );
}
