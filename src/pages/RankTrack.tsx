import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Icon, type IconName } from "../components/Icon";
import { ProgressGlow } from "../components/Juice";
import "./ranktrack.css";

type Tier = { name: string; color: string; mmr: number; icon: IconName };
type Reward = {
  tier: string;
  label: string;
  desc: string;
  category: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  icon: IconName;
  mmr: number;
};

const GAMES = ["Chess", "Mini Golf", "Connect 4", "Air Hockey", "8-Ball", "Bowling"];

const TIERS: Tier[] = [
  { name: "Bronze III", color: "#cd7f32", mmr: 0, icon: "Medal" },
  { name: "Bronze II", color: "#cd7f32", mmr: 333, icon: "Medal" },
  { name: "Bronze I", color: "#cd7f32", mmr: 666, icon: "Medal" },
  { name: "Silver III", color: "#c0c8d4", mmr: 1000, icon: "Medal" },
  { name: "Silver II", color: "#c0c8d4", mmr: 1133, icon: "Medal" },
  { name: "Silver I", color: "#c0c8d4", mmr: 1266, icon: "Medal" },
  { name: "Gold III", color: "#f5b942", mmr: 1400, icon: "Trophy" },
  { name: "Gold II", color: "#f5b942", mmr: 1533, icon: "Trophy" },
  { name: "Gold I", color: "#f5b942", mmr: 1666, icon: "Trophy" },
  { name: "Platinum III", color: "#3ad6c5", mmr: 1800, icon: "Gem" },
  { name: "Platinum II", color: "#3ad6c5", mmr: 1933, icon: "Gem" },
  { name: "Platinum I", color: "#3ad6c5", mmr: 2066, icon: "Gem" },
  { name: "Diamond III", color: "#5aa6ff", mmr: 2200, icon: "Gem" },
  { name: "Diamond II", color: "#5aa6ff", mmr: 2333, icon: "Gem" },
  { name: "Diamond I", color: "#5aa6ff", mmr: 2466, icon: "Gem" },
  { name: "Champion", color: "#a865ff", mmr: 2600, icon: "Crown" },
  { name: "GOAT", color: "#ff4d6d", mmr: 3000, icon: "Swords" },
];

const REWARDS: Reward[] = [
  { tier: "Bronze III", label: "Bronze III Crest", desc: "Beginner’s mark — proof you’ve stepped onto the table.", category: "Badge", rarity: "Common", icon: "Medal", mmr: 0 },
  { tier: "Bronze II", label: "Bronze II Frame", desc: "A weathered bronze ring around your avatar — earned through grind.", category: "Avatar Frame", rarity: "Uncommon", icon: "Star", mmr: 333 },
  { tier: "Bronze I", label: "Bronze I Victory", desc: "Polished bronze sparks crown every win.", category: "Victory Effect", rarity: "Rare", icon: "Sparkles", mmr: 666 },
  { tier: "Silver III", label: "Silver III Crest", desc: "Silver crest — you’ve climbed past the rookies.", category: "Badge", rarity: "Common", icon: "Medal", mmr: 1000 },
  { tier: "Silver II", label: "Silver II Frame", desc: "A cool silver avatar frame with subtle chrome reflections.", category: "Avatar Frame", rarity: "Uncommon", icon: "Star", mmr: 1133 },
  { tier: "Silver I", label: "Silver I Victory", desc: "Silver shockwave radiates from your victory pose.", category: "Victory Effect", rarity: "Rare", icon: "Sparkles", mmr: 1266 },
  { tier: "Gold III", label: "Gold III Crest", desc: "Gold crown badge — your name carries weight now.", category: "Badge", rarity: "Common", icon: "Crown", mmr: 1400 },
  { tier: "Gold II", label: "Gold II Frame", desc: "Gilded gold frame with a slow shimmering glow.", category: "Avatar Frame", rarity: "Uncommon", icon: "Star", mmr: 1533 },
  { tier: "Gold I", label: "Gold I Victory", desc: "Gold confetti burst when you take the win.", category: "Victory Effect", rarity: "Rare", icon: "Sparkles", mmr: 1666 },
  { tier: "Platinum III", label: "Platinum Banner", desc: "Animated platinum banner that flows across your profile.", category: "Banner", rarity: "Rare", icon: "Bolt", mmr: 1800 },
  { tier: "Platinum I", label: "Platinum Trail", desc: "A glowing trail follows your pieces across the board.", category: "Trail", rarity: "Epic", icon: "Flame", mmr: 2066 },
  { tier: "Diamond II", label: "Diamond Ball Skin", desc: "Exclusive faceted diamond ball skin that catches the light.", category: "Table Effect", rarity: "Epic", icon: "Gem", mmr: 2333 },
  { tier: "Champion", label: "Crown Emote", desc: "Slam a 3D crown emote on the table after victory.", category: "Emote", rarity: "Legendary", icon: "Crown", mmr: 2600 },
  { tier: "GOAT", label: "GOAT Title", desc: "The legendary GOAT title — reserved for the best of the best.", category: "Profile", rarity: "Legendary", icon: "Swords", mmr: 3000 },
];

const RARITY_COLOR: Record<Reward["rarity"], string> = {
  Common: "#9aa4b2",
  Uncommon: "#3ddc84",
  Rare: "#4d9bff",
  Epic: "#b15cff",
  Legendary: "#f5b942",
};

const CATEGORIES = ["All", "Badge", "Avatar Frame", "Banner", "Emote", "Trail", "Victory Effect", "Table Effect", "Profile"];

export default function RankTrack() {
  const [game, setGame] = useState(GAMES[0]);
  const [cat, setCat] = useState("All");

  // Mock current rating (per-game flavour via index)
  const rating = 1200;

  const curIdx = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < TIERS.length; i++) if (rating >= TIERS[i].mmr) idx = i;
    return idx;
  }, [rating]);

  const current = TIERS[curIdx];
  const next = TIERS[Math.min(curIdx + 1, TIERS.length - 1)];
  const isMax = curIdx === TIERS.length - 1;
  const floor = current.mmr;
  const ceil = isMax ? current.mmr + 200 : next.mmr;
  const toNext = Math.max(0, ceil - rating);
  const pct = Math.min(100, Math.round(((rating - floor) / (ceil - floor)) * 100));

  const filtered = cat === "All" ? REWARDS : REWARDS.filter((r) => r.category === cat);
  const catCount = (c: string) => (c === "All" ? REWARDS.length : REWARDS.filter((r) => r.category === c).length);

  const nextReward = REWARDS.find((r) => r.mmr > rating);

  return (
    <div className="rt-page">
      <div className="rt-bg" aria-hidden />

      <header className="rt-head">
        <div>
          <div className="rt-eyebrow">Rank Progression</div>
          <h1 className="rt-title grad-text">Climb the Ladder</h1>
          <p className="rt-sub">Every division earns you a permanent cosmetic. Every tier earns you a flex.</p>
        </div>
        <div className="rt-game-tabs">
          {GAMES.map((g) => (
            <button key={g} className={"rt-game-tab" + (g === game ? " active" : "")} onClick={() => setGame(g)}>
              {g}
            </button>
          ))}
        </div>
      </header>

      <section className="rt-current" style={{ ["--tier" as string]: current.color }}>
        <div className="rt-current-glow" aria-hidden />
        <div className="rt-current-badge">
          <Icon name={current.icon} />
        </div>
        <div className="rt-current-info">
          <div className="rt-current-label">Current Rank</div>
          <div className="rt-current-name">{current.name}</div>
          <div className="rt-current-meta">
            Rating <strong>{rating}</strong>
            {!isMax && <> &middot; <strong>{toNext}</strong> to next</>}
          </div>
          <div className="rt-progress-row">
            <span className="rt-pmin">{floor}</span>
            <ProgressGlow value={pct} max={100} tone="gold" animate />
            <span className="rt-pmax">{ceil}</span>
          </div>
          <div className="rt-progress-pct">{pct}% to {isMax ? "max" : next.name}</div>
        </div>
      </section>

      {nextReward && (
        <Link to="/shop" className="rt-next-reward" style={{ ["--rar" as string]: RARITY_COLOR[nextReward.rarity] }}>
          <div className="rt-next-icon">
            <Icon name={nextReward.icon} />
          </div>
          <div className="rt-next-info">
            <div className="rt-next-label">Progress to Next Reward</div>
            <div className="rt-next-name">{nextReward.label}</div>
            <div className="rt-next-meta">
              <strong>{Math.max(0, nextReward.mmr - rating)}</strong> rating to unlock — reach <strong>{nextReward.tier}</strong>
            </div>
          </div>
          <Icon name="ArrowRight" />
        </Link>
      )}

      <section className="rt-ladder">
        <div className="rt-section-head">
          <Icon name="Shield" /> <h2>Rank Ladder</h2>
        </div>
        <div className="rt-ladder-grid">
          {TIERS.map((t, i) => {
            const unlocked = rating >= t.mmr;
            const isYou = i === curIdx;
            return (
              <div
                key={t.name}
                className={"rt-tier" + (unlocked ? " unlocked" : "") + (isYou ? " you" : "")}
                style={{ ["--tier" as string]: t.color }}
              >
                {isYou && <span className="rt-you-tag">YOU</span>}
                <div className="rt-tier-top">
                  <Icon name={unlocked ? t.icon : "Lock"} />
                  <span className="rt-tier-name">{t.name}</span>
                </div>
                <div className="rt-tier-mmr">{t.mmr === 0 ? "0+" : t.mmr + "+"}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rt-rewards">
        <div className="rt-section-head">
          <Icon name="Trophy" /> <h2>Reward Track</h2>
          <span className="rt-season">Season 1: Genesis</span>
        </div>

        <div className="rt-cats">
          {CATEGORIES.map((c) => (
            <button key={c} className={"rt-cat" + (c === cat ? " active" : "")} onClick={() => setCat(c)}>
              {c}<span className="rt-cat-count">{catCount(c)}</span>
            </button>
          ))}
        </div>

        <div className="rt-reward-grid">
          {filtered.map((r) => {
            const unlocked = rating >= r.mmr;
            const tier = TIERS.find((t) => t.name === r.tier);
            return (
              <article
                key={r.label}
                className={"rt-reward-card" + (unlocked ? " unlocked" : " locked")}
                style={{
                  ["--tier" as string]: tier ? tier.color : "#888",
                  ["--rar" as string]: RARITY_COLOR[r.rarity],
                }}
              >
                <div className="rt-reward-banner">
                  <span className="rt-reward-tier">{r.tier}</span>
                  <span className="rt-reward-rarity">{r.rarity}</span>
                  <div className="rt-reward-art">
                    <Icon name={unlocked ? r.icon : "Lock"} />
                  </div>
                </div>
                <div className="rt-reward-body">
                  <h3 className="rt-reward-name">{r.label}</h3>
                  <p className="rt-reward-desc">{r.desc}</p>
                  <div className="rt-reward-foot">
                    <span className="rt-reward-cat">{r.category}</span>
                    {unlocked ? (
                      <span className="rt-reward-status unlocked"><Icon name="CheckCircle" /> Unlocked</span>
                    ) : (
                      <span className="rt-reward-status locked"><Icon name="Lock" /> {r.mmr}+</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
