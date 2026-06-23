import { Icon } from "../components/Icon";
import { GlowCard, ProgressGlow, PageHero } from "../components/Juice";
import { DailyRewardTrack } from "../components/DailyRewards";
import "./pages.css";
import "./rewards.css";

const WEEKLY = [
  { label: "Play 10 matches", value: 6, max: 10, reward: "Ⓢ 120", icon: "Swords" as const },
  { label: "Win 5 ranked games", value: 3, max: 5, reward: "Ⓢ 150", icon: "Trophy" as const },
  { label: "Invite a friend", value: 0, max: 1, reward: "Tourney ticket", icon: "Users" as const },
  { label: "Complete a training pack", value: 1, max: 1, reward: "150 XP", icon: "Target" as const },
];

export default function Rewards() {
  return (
    <div className="rw-page">
      <PageHero eyebrow="Rewards" title="Daily" gradWord="rewards" sub="Show up, build a streak, and climb the weekly track. The longer you play, the bigger the payoff." />

      <section className="rw-section">
        <GlowCard tone="gold" hoverable={false} className="rw-panel">
          <DailyRewardTrack />
        </GlowCard>
      </section>

      <section className="rw-section">
        <div className="rw-head"><h2><Icon name="Flame" /> Weekly challenges</h2><span className="rw-reset">Resets in 3d 14h</span></div>
        <div className="rw-weekly">
          {WEEKLY.map((w) => {
            const done = w.value >= w.max;
            return (
              <GlowCard key={w.label} tone={done ? "success" : "primary"} hoverable={false} className="rw-week">
                <div className="rw-week__top">
                  <span className="rw-week__icon"><Icon name={w.icon} /></span>
                  <span className="rw-week__reward"><Icon name="Gem" /> {w.reward}</span>
                </div>
                <span className="rw-week__label">{w.label}</span>
                <ProgressGlow value={w.value} max={w.max} tone={done ? "success" : "primary"} animate />
                <span className="rw-week__meta">{done ? "Complete — claimable" : `${w.value} / ${w.max}`}</span>
              </GlowCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
