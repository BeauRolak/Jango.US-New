import "./pages.css";
import "./battlepass.css";

type Tier = {
  level: number;
  free: string;
  premium: string;
  rarity: string;
};

const SEASON = { name: "Season 4: Neon Ascent", level: 37, max: 100, xp: 6400, xpNext: 9000, daysLeft: 23 };

const RARITY: Record<string, string> = {
  common: "#9aa4b2", uncommon: "#36d399", rare: "#6aa8ff", epic: "#c084fc", legendary: "#ffc14d",
};

const TIERS: Tier[] = [
  { level: 35, free: "50 Scalps", premium: "Neon Trail FX", rarity: "rare" },
  { level: 36, free: "XP Boost", premium: "Cyan Cue Skin", rarity: "uncommon" },
  { level: 37, free: "Emote: GG", premium: "Ascent Banner", rarity: "epic" },
  { level: 38, free: "25 Scalps", premium: "Holo Avatar", rarity: "rare" },
  { level: 39, free: "Title: Riser", premium: "Glow Dice Set", rarity: "uncommon" },
  { level: 40, free: "100 Scalps", premium: "Ascendant Frame", rarity: "legendary" },
];

export default function BattlePass() {
  const pct = Math.round(SEASON.xp / SEASON.xpNext * 100);
  return (
    <div className={"page bp-page"}>
      <header className={"page-head"}>
        <div>
          <h1 className={"page-title"}>Battle Pass</h1>
          <p className={"page-sub"}>{SEASON.name} {String.fromCharCode(183)} {SEASON.daysLeft} days left</p>
        </div>
        <button className={"btn-grad"}>Unlock Premium {String.fromCharCode(183)} S 950</button>
      </header>

      <div className={"bp-progress"}>
        <div className={"bp-level-badge"}>{SEASON.level}</div>
        <div className={"bp-progress-main"}>
          <div className={"bp-progress-top"}>
            <span>Level {SEASON.level} / {SEASON.max}</span>
            <span className={"bp-xp"}>{SEASON.xp.toLocaleString()} / {SEASON.xpNext.toLocaleString()} XP</span>
          </div>
          <div className={"bp-bar"}><div className={"bp-bar-fill"} style={{ width: pct + "%" }} /></div>
        </div>
      </div>

      <div className={"bp-track-labels"}>
        <span className={"bp-tl-free"}>Free Track</span>
        <span className={"bp-tl-prem"}>Premium Track</span>
      </div>

      <div className={"bp-track"}>
        {TIERS.map((t) => {
          const unlocked = t.level <= SEASON.level;
          return (
            <div key={t.level} className={"bp-tier " + (unlocked ? "bp-unlocked" : "")}>
              <div className={"bp-tier-num"}>{t.level}</div>
              <div className={"bp-reward bp-free"}>{t.free}</div>
              <div className={"bp-reward bp-prem"} style={{ borderColor: RARITY[t.rarity] }}>
                <span className={"bp-rarity-dot"} style={{ background: RARITY[t.rarity] }} />{t.premium}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
