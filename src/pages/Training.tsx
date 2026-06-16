import { useState } from "react";
import "./pages.css";
import "./training.css";

type Drill = {
  id: number;
  name: string;
  game: string;
  skill: string;
  difficulty: number;
  best: string;
  desc: string;
};

const BOTS = ["Easy", "Medium", "Hard", "Expert", "Champion"];

const DRILLS: Drill[] = [
  { id: 1, name: "Bank Shot Lab", game: "8-Ball Pool", skill: "Aim", difficulty: 3, best: "18/20", desc: "Master cushion angles with guided rails." },
  { id: 2, name: "Putt Precision", game: "Mini Golf", skill: "Control", difficulty: 2, best: "Par -4", desc: "Dial in power and spin on tricky greens." },
  { id: 3, name: "Opening Theory", game: "Chess", skill: "Strategy", difficulty: 4, best: "82%", desc: "Drill the top 10 openings against the engine." },
  { id: 4, name: "Reaction Rush", game: "Air Hockey", skill: "Reflex", difficulty: 5, best: "210ms", desc: "Train split-second blocks and counters." },
  { id: 5, name: "Threat Scanner", game: "Connect Four", skill: "Vision", difficulty: 3, best: "91%", desc: "Spot double-threats before they form." },
  { id: 6, name: "Endgame Trainer", game: "Chess", skill: "Strategy", difficulty: 5, best: "76%", desc: "Convert winning positions every time." },
];

export default function Training() {
  const [bot, setBot] = useState(1);

  return (
    <div className={"page tr-page"}>
      <header className={"page-head"}>
        <div>
          <h1 className={"page-title"}>Training Arena</h1>
          <p className={"page-sub"}>Sharpen your skills risk-free. No Scalps wagered, pure practice.</p>
        </div>
      </header>

      <div className={"tr-bot"}>
        <div className={"tr-bot-info"}>
          <h3>Practice Bot Difficulty</h3>
          <p>Set how tough the AI sparring partner plays across all drills.</p>
        </div>
        <div className={"tr-bot-levels"}>
          {BOTS.map((b, i) => (
            <button key={b} className={"tr-lvl " + (bot === i ? "tr-lvl-on" : "")} onClick={() => setBot(i)}>{b}</button>
          ))}
        </div>
      </div>

      <h2 className={"tr-section"}>Skill Drills</h2>
      <div className={"tr-grid"}>
        {DRILLS.map((d) => (
          <div key={d.id} className={"tr-card"}>
            <div className={"tr-card-top"}>
              <span className={"tr-skill"}>{d.skill}</span>
              <span className={"tr-game"}>{d.game}</span>
            </div>
            <h3 className={"tr-name"}>{d.name}</h3>
            <p className={"tr-desc"}>{d.desc}</p>
            <div className={"tr-stars"}>
              {[1,2,3,4,5].map((n) => (
                <span key={n} className={"tr-star " + (n <= d.difficulty ? "tr-star-on" : "")}>*</span>
              ))}
              <span className={"tr-best"}>Best: {d.best}</span>
            </div>
            <button className={"btn-grad"}>Start Drill</button>
          </div>
        ))}
      </div>
    </div>
  );
}
