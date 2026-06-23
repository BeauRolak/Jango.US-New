import { Icon, type IconName } from "./Icon";
import { useFeedback, rewardPop, ProgressGlow } from "./Juice";
import { useDailyRewards, DAILY_TRACK, type DailyReward } from "../lib/platform";
import { useScalps } from "../lib/mockData";
import "./dailyrewards.css";

const KIND_ICON: Record<DailyReward["kind"], IconName> = {
  scalps: "Coins", xp: "Chart", cosmetic: "Sparkles", badge: "Medal", ticket: "Trophy",
};

function grantReward(r: DailyReward, addScalps: (n: number) => void) {
  // Only Scalps move the (mock) balance; everything else is a cosmetic/demo grant.
  if (r.kind === "scalps" && r.amount) addScalps(r.amount);
  if (r.kind === "ticket" && r.amount) addScalps(r.amount);
}

/** Compact daily-claim card for the dashboard. */
export function DailyClaimCard() {
  const { fire } = useFeedback();
  const { add } = useScalps();
  const { streak, canClaim, todayReward, claim } = useDailyRewards();

  const onClaim = () => {
    const r = claim();
    if (!r) return;
    grantReward(r, add);
    fire("reward");
    rewardPop("Daily reward claimed", r.label);
  };

  return (
    <div className="dr-claim">
      <div className="dr-claim__head">
        <span className="dr-claim__icon"><Icon name="Calendar" /></span>
        <div>
          <span className="dr-claim__title">Daily reward</span>
          <span className="dr-claim__streak"><Icon name="Flame" /> {streak}-day streak</span>
        </div>
      </div>
      <div className="dr-claim__reward">
        <Icon name={KIND_ICON[todayReward.kind]} /> Today: <b>{todayReward.label}</b>
      </div>
      <button className={"dr-claim__btn" + (canClaim ? "" : " is-done")} onClick={onClaim} disabled={!canClaim}>
        {canClaim ? <><Icon name="Sparkles" /> Claim now</> : <><Icon name="CheckCircle" /> Claimed today</>}
      </button>
    </div>
  );
}

/** Full 7-day reward track + streak header for the Rewards page. */
export function DailyRewardTrack() {
  const { fire } = useFeedback();
  const { add } = useScalps();
  const { streak, best, todayDay, canClaim, states, claim } = useDailyRewards();
  const nextMilestone = streak < 7 ? 7 : Math.ceil((streak + 1) / 7) * 7;

  const onClaim = () => {
    const r = claim();
    if (!r) return;
    grantReward(r, add);
    fire("reward");
    rewardPop("Daily reward claimed", r.label);
  };

  return (
    <div className="dr-track">
      <div className="dr-head">
        <div className="dr-streak">
          <span className="dr-streak__flame"><Icon name="Flame" /></span>
          <div>
            <span className="dr-streak__num">{streak}</span>
            <span className="dr-streak__lbl">day streak</span>
          </div>
        </div>
        <div className="dr-head__meta">
          <div><span className="dr-k">Best streak</span><span className="dr-v">{best} days</span></div>
          <div><span className="dr-k">Next milestone</span><span className="dr-v">Day {nextMilestone}</span></div>
        </div>
      </div>
      <ProgressGlow value={((streak - 1) % 7) + (canClaim ? 0 : 1)} max={7} tone="gold" animate />

      <div className="dr-cards">
        {DAILY_TRACK.map((r, idx) => {
          const st = states[idx];
          return (
            <div key={r.day} className={"dr-card dr-card--" + st + (r.day === todayDay ? " is-today" : "") + (r.day === 7 ? " is-big" : "")}>
              <span className="dr-card__day">Day {r.day}</span>
              <span className="dr-card__art"><Icon name={KIND_ICON[r.kind]} /></span>
              <span className="dr-card__label">{r.label}</span>
              {st === "claimed" && <span className="dr-card__state"><Icon name="CheckCircle" /></span>}
              {st === "locked" && <span className="dr-card__state dim"><Icon name="Lock" /></span>}
            </div>
          );
        })}
      </div>

      <button className={"dr-claimbtn" + (canClaim ? "" : " is-done")} onClick={onClaim} disabled={!canClaim}>
        {canClaim ? <><Icon name="Sparkles" /> Claim today's reward</> : <><Icon name="CheckCircle" /> Come back tomorrow</>}
      </button>
      <p className="dr-note"><Icon name="Lock" /> Mock economy — Scalps shown are demo credits. Streak resets at local midnight.</p>
    </div>
  );
}
