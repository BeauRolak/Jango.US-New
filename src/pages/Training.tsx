import { useState } from "react";
import { Btn, toast } from "../components/UI";
import "./training.css";

type Diff = "Easy" | "Medium" | "Hard" | "Expert" | "Champion";
type DrillStatus = "locked" | "ready" | "in-progress" | "complete";

interface Drill {
  id: string;
  tag: string;
  game: string;
  title: string;
  desc: string;
  difficulty: number;
  best: string;
  reward: number;
  xp: number;
}

interface Pack {
  id: string;
  game: string;
  emoji: string;
  accent: string;
  blurb: string;
  drills: Drill[];
  requiredLevel: number;
}

const PACKS: Pack[] = [
  {
    id: "pool",
    game: "8-Ball Pool",
    emoji: "🎱",
    accent: "#7c5cff",
    blurb: "Master cushion angles, spin and safety play.",
    requiredLevel: 0,
    drills: [
      { id: "pool-bank", tag: "AIM", game: "8-Ball Pool", title: "Bank Shot Lab", desc: "Master cushion angles with guided rails.", difficulty: 3, best: "18/20", reward: 5, xp: 40 },
      { id: "pool-break", tag: "POWER", game: "8-Ball Pool", title: "Break Builder", desc: "Dial in a controlled, spread-heavy break.", difficulty: 4, best: "—", reward: 10, xp: 60 },
    ],
  },
  {
    id: "golf",
    game: "Mini Golf",
    emoji: "⛳",
    accent: "#34d399",
    blurb: "Sharpen power control and green reading.",
    requiredLevel: 0,
    drills: [
      { id: "golf-putt", tag: "CONTROL", game: "Mini Golf", title: "Putt Precision", desc: "Dial in power and spin on tricky greens.", difficulty: 2, best: "Par -4", reward: 5, xp: 40 },
      { id: "golf-bank", tag: "VISION", game: "Mini Golf", title: "Rail Reader", desc: "Plan multi-wall bank routes to the cup.", difficulty: 3, best: "—", reward: 10, xp: 55 },
    ],
  },
  {
    id: "chess",
    game: "Chess",
    emoji: "♟️",
    accent: "#f59e0b",
    blurb: "Openings, tactics and clean endgame technique.",
    requiredLevel: 3,
    drills: [
      { id: "chess-open", tag: "STRATEGY", game: "Chess", title: "Opening Theory", desc: "Drill the top 10 openings against the engine.", difficulty: 4, best: "82%", reward: 15, xp: 80 },
      { id: "chess-end", tag: "STRATEGY", game: "Chess", title: "Endgame Trainer", desc: "Convert winning positions every time.", difficulty: 5, best: "76%", reward: 20, xp: 100 },
    ],
  },
  {
    id: "reflex",
    game: "Air Hockey & Reflex",
    emoji: "🏒",
    accent: "#38bdf8",
    blurb: "Split-second blocks, counters and threat-spotting.",
    requiredLevel: 5,
    drills: [
      { id: "reflex-rush", tag: "REFLEX", game: "Air Hockey", title: "Reaction Rush", desc: "Train split-second blocks and counters.", difficulty: 5, best: "210ms", reward: 15, xp: 80 },
      { id: "reflex-scan", tag: "VISION", game: "Connect Four", title: "Threat Scanner", desc: "Spot double-threats before they form.", difficulty: 3, best: "91%", reward: 10, xp: 60 },
    ],
  },
];

const DIFFS: Diff[] = ["Easy", "Medium", "Hard", "Expert", "Champion"];
const PLAYER_LEVEL = 6;

export default function Training() {
  const [difficulty, setDifficulty] = useState<Diff>("Medium");
  const [progress, setProgress] = useState<Record<string, number>>({
    "pool-bank": 90,
    "golf-putt": 100,
    "chess-open": 45,
  });
  const [active, setActive] = useState<Drill | null>(null);

  const allDrills = PACKS.flatMap((p) => p.drills);
  const completed = allDrills.filter((d) => (progress[d.id] || 0) >= 100).length;
  const totalXp = allDrills.reduce((s, d) => s + ((progress[d.id] || 0) >= 100 ? d.xp : 0), 0);
  const overall = Math.round(
    allDrills.reduce((s, d) => s + Math.min(100, progress[d.id] || 0), 0) / allDrills.length
  );

  function statusOf(pack: Pack, d: Drill): DrillStatus {
    if (PLAYER_LEVEL < pack.requiredLevel) return "locked";
    const p = progress[d.id] || 0;
    if (p >= 100) return "complete";
    if (p > 0) return "in-progress";
    return "ready";
  }

  function startDrill(pack: Pack, d: Drill) {
    if (PLAYER_LEVEL < pack.requiredLevel) {
      toast(`Reach level ${pack.requiredLevel} to unlock ${pack.game} training`, "error");
      return;
    }
    setActive(d);
    toast(`Starting ${d.title} on ${difficulty} difficulty`, "info");
  }

  function completeDrill(d: Drill) {
    setProgress((prev) => ({ ...prev, [d.id]: 100 }));
    setActive(null);
    toast(`${d.title} complete — +${d.xp} XP`, "success");
    setTimeout(() => {
      toast(`⭐ Reward unlocked: +${d.reward} Scalps training credit`, "reward");
    }, 650);
  }

  function practiceStep(d: Drill) {
    setProgress((prev) => {
      const next = Math.min(100, (prev[d.id] || 0) + 25);
      return { ...prev, [d.id]: next };
    });
  }

  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div className="training-page">
      <header className="tr-hero">
        <div className="tr-hero-text">
          <h1 className="tr-title">Training Arena</h1>
          <p className="tr-sub">
            Sharpen your skills risk-free. No Scalps wagered, pure practice.
          </p>
        </div>
        <div className="tr-hero-stats">
          <div className="tr-stat">
            <span className="tr-stat-num">{completed}/{allDrills.length}</span>
            <span className="tr-stat-label">Drills mastered</span>
          </div>
          <div className="tr-stat">
            <span className="tr-stat-num">{totalXp}</span>
            <span className="tr-stat-label">Training XP</span>
          </div>
          <div className="tr-stat">
            <span className="tr-stat-num">Lv {PLAYER_LEVEL}</span>
            <span className="tr-stat-label">Player level</span>
          </div>
        </div>
      </header>

      <section className="tr-overall">
        <div className="tr-overall-top">
          <span className="tr-overall-label">Overall mastery</span>
          <span className="tr-overall-pct">{overall}%</span>
        </div>
        <div className="tr-bar">
          <div className="tr-bar-fill" style={{ width: `${overall}%` }} />
        </div>
      </section>

      <section className="tr-diff-card">
        <div className="tr-diff-text">
          <h3>Practice Bot Difficulty</h3>
          <p>Set how tough the AI sparring partner plays across all drills.</p>
        </div>
        <div className="tr-diff-options">
          {DIFFS.map((d) => (
            <button
              key={d}
              className={"tr-diff-btn" + (difficulty === d ? " active" : "")}
              onClick={() => {
                setDifficulty(d);
                toast(`Practice difficulty set to ${d}`, "info");
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      {PACKS.map((pack) => {
        const packLocked = PLAYER_LEVEL < pack.requiredLevel;
        const packDone = pack.drills.filter((d) => (progress[d.id] || 0) >= 100).length;
        return (
          <section
            key={pack.id}
            className={"tr-pack" + (packLocked ? " locked" : "")}
            style={{ ["--accent" as any]: pack.accent }}
          >
            <div className="tr-pack-head">
              <div className="tr-pack-id">
                <span className="tr-pack-emoji">{pack.emoji}</span>
                <div>
                  <h2 className="tr-pack-title">{pack.game} Pack</h2>
                  <p className="tr-pack-blurb">{pack.blurb}</p>
                </div>
              </div>
              {packLocked ? (
                <span className="tr-pack-lock">🔒 Unlocks at Lv {pack.requiredLevel}</span>
              ) : (
                <span className="tr-pack-count">{packDone}/{pack.drills.length} done</span>
              )}
            </div>

            <div className="tr-drill-grid">
              {pack.drills.map((d) => {
                const st = statusOf(pack, d);
                const pct = Math.min(100, progress[d.id] || 0);
                return (
                  <article key={d.id} className={"tr-drill st-" + st}>
                    <div className="tr-drill-top">
                      <span className="tr-drill-tag">{d.tag}</span>
                      <span className="tr-drill-game">{d.game}</span>
                    </div>
                    <h3 className="tr-drill-title">{d.title}</h3>
                    <p className="tr-drill-desc">{d.desc}</p>
                    <div className="tr-drill-meta">
                      <span className="tr-drill-stars">{stars(d.difficulty)}</span>
                      <span className="tr-drill-best">Best: {d.best}</span>
                    </div>

                    {st !== "locked" && (
                      <div className="tr-drill-bar">
                        <div className="tr-drill-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    )}

                    {st === "complete" ? (
                      <div className="tr-drill-done">
                        <span>✓ Mastered</span>
                        <span className="tr-drill-reward">+{d.reward} Ⓢ</span>
                      </div>
                    ) : st === "locked" ? (
                      <Btn variant="ghost" className="tr-drill-btn" disabled>
                        🔒 Locked
                      </Btn>
                    ) : (
                      <Btn className="tr-drill-btn" onClick={() => startDrill(pack, d)}>
                        {st === "in-progress" ? "Continue Drill" : "Start Training"}
                      </Btn>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      {active && (
        <div className="tr-modal-overlay" onClick={() => setActive(null)}>
          <div className="tr-modal" onClick={(e) => e.stopPropagation()}>
            <span className="tr-modal-tag">{active.tag} · {difficulty}</span>
            <h2 className="tr-modal-title">{active.title}</h2>
            <p className="tr-modal-desc">{active.desc}</p>

            <div className="tr-modal-bar">
              <div
                className="tr-modal-bar-fill"
                style={{ width: `${Math.min(100, progress[active.id] || 0)}%` }}
              />
            </div>
            <p className="tr-modal-pct">
              {Math.min(100, progress[active.id] || 0)}% — reward on completion: +{active.reward} Ⓢ
            </p>

            <p className="tr-modal-note">
              Practice only — no Scalps are wagered or won. Rewards are cosmetic training credit.
            </p>

            <div className="tr-modal-actions">
              <Btn variant="ghost" onClick={() => setActive(null)}>
                Exit
              </Btn>
              {(progress[active.id] || 0) >= 100 ? (
                <Btn onClick={() => completeDrill(active)}>Claim Reward</Btn>
              ) : (
                <Btn onClick={() => practiceStep(active)}>Run Rep</Btn>
              )}
            </div>
            {(progress[active.id] || 0) >= 100 && (
              <p className="tr-modal-ready">Drill complete — claim your reward!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
