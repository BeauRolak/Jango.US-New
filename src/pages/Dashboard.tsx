import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./pages.css";
import "./dashboard.css";
import { Icon, type IconName } from "../components/Icon";
import {
import { FeaturedGameHero } from '../components/GameArt';
import { GAMES } from '../games/registry';
  GlowCard,
  AnimatedButton,
  ProgressGlow,
  ScalpsBalance,
  RankBadge,
  StatusPill,
  ActionModal,
  useFeedback,
} from "../components/Juice";

type Game = { name: string; slug: string; diff: string; icon: IconName; tone: string };

const ARENA: Game[] = [
  { name: "Chess", slug: "chess", diff: "Advanced", icon: "Crown", tone: "primary" },
  { name: "Mini Golf", slug: "minigolf", diff: "Beginner", icon: "Target", tone: "success" },
  { name: "Connect 4", slug: "connect4", diff: "Easy", icon: "Dice", tone: "accent" },
  { name: "Air Hockey", slug: "airhockey", diff: "Medium", icon: "Bolt", tone: "secondary" },
  { name: "Rock Paper Scissors", slug: "rps", diff: "Easy", icon: "Swords", tone: "warning" },
  { name: "Dots & Boxes", slug: "dotsboxes", diff: "Medium", icon: "List", tone: "primary" },
  { name: "8-Ball Pool", slug: "eightball", diff: "Advanced", icon: "Trophy", tone: "gold" },
  { name: "Bowling", slug: "bowling", diff: "Medium", icon: "Bolt", tone: "secondary" },
  { name: "Cup King", slug: "cupking", diff: "Medium", icon: "Crown", tone: "accent" },
  { name: "Stack Tower", slug: "stacktower", diff: "Easy", icon: "Building", tone: "success" },
];

const STATS = [
  { num: "1,247", label: "Players online", icon: "Users" as IconName, tone: "primary" },
  { num: "342", label: "Active matches", icon: "Swords" as IconName, tone: "accent" },
  { num: "891", label: "Winners today", icon: "Trophy" as IconName, tone: "gold" },
  { num: "Ⓢ 4.2M", label: "Scalps in play", icon: "Coins" as IconName, tone: "success" },
];

const FEATURES = [
  { title: "Skill decides", desc: "Outplay opponents in real games of skill. No luck, no house edge against you.", icon: "Target" as IconName },
  { title: "Instant payouts", desc: "Win and your Scalps land instantly. 1 Scalp = $1, ready when you are.", icon: "Bolt" as IconName },
  { title: "Ranked progression", desc: "Climb from Bronze to Master. Every match moves your rank and your rewards.", icon: "Chart" as IconName },
  { title: "Fair by design", desc: "A flat 3% platform rake. Transparent pots, transparent payouts.", icon: "Shield" as IconName },
];

// Mock, gated economy — no real money movement happens here.
const MOCK_SCALPS = 1280;
const TOURNEY_ENTRY = 25;
const TOURNEY_FIELD = 64;
const RAKE = 0.03;

export default function Dashboard() {
  const { fire } = useFeedback();
  const navigate = useNavigate();
  const gamePath = (id: string) => (GAMES.find((g) => g.id === id)?.path) || '/play';
  const [joinOpen, setJoinOpen] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const grossPot = TOURNEY_ENTRY * TOURNEY_FIELD;
  const rakeCut = Math.round(grossPot * RAKE);
  const prizePool = grossPot - rakeCut;
  const firstPlace = Math.round(prizePool * 0.5);
  const secondPlace = Math.round(prizePool * 0.3);
  const thirdPlace = prizePool - firstPlace - secondPlace;

  function claimReward(e?: React.MouseEvent<HTMLButtonElement>) {
    if (claimed) return;
    setClaimed(true);
    fire("reward_claim", "Daily reward claimed: Ⓢ 50", e?.currentTarget ?? null);
  }

  function confirmJoin(e?: React.MouseEvent<HTMLButtonElement>) {
    setJoinOpen(false);
    fire("tournament_join", "Seat reserved — Friday Night Arena", e?.currentTarget ?? null);
  }

  return (
    <div className="dash">

      {/* ===== HERO ===== */}
      <section className="dash-hero">
        <div className="dash-hero__glow" aria-hidden="true" />
        <div className="dash-hero__inner">
          <span className="dash-hero__eyebrow">
            <span className="dash-hero__dot" /> 1,247 players online now
          </span>
          <h1 className="dash-hero__title">
            Bet on <span className="grad">Skill</span>, not luck.
          </h1>
          <p className="dash-hero__sub">
            Real games. Real opponents. Real Scalps. Enter the Jango arena, climb the ranks, and cash your skill.
          </p>
          <div className="dash-hero__cta">
            <AnimatedButton variant="grad" icon="Play" fbKind="tap" onClick={() => {}}>
              <Link to="/play" className="dash-hero__ctaLink">Start Playing</Link>
            </AnimatedButton>
            <AnimatedButton variant="ghost" icon="Gamepad" fbKind="tap" onClick={() => {}}>
              <Link to="/games" className="dash-hero__ctaLink">Browse Games</Link>
            </AnimatedButton>
          </div>
          <div className="dash-hero__trust">
            <span><Icon name="Shield" /> 3% flat rake</span>
            <span><Icon name="Bolt" /> Instant payouts</span>
            <span><Icon name="Coins" /> 1 Scalp = $1</span>
          </div>
        </div>
      </section>

      {/* ===== FEATURED ARENA (dynamic game art) ===== */}
      <section className="dash-arena" style={{ margin: '4px 0 8px' }}>
        <FeaturedGameHero
          onPlay={(id) => { fire('tournament_join'); navigate(gamePath(id)); }}
          onBot={(id) => { fire('tap'); navigate(gamePath(id)); }}
          onTournament={() => { fire('tap'); navigate('/tournaments'); }}
        />
      </section>

      {/* ===== STAT STRIP ===== */}
      <section className="dash-stats">
        {STATS.map((s) => (
          <GlowCard key={s.label} tone={s.tone as any} className="dash-stat">
            <span className="dash-stat__icon"><Icon name={s.icon} /></span>
            <span className="dash-stat__num">{s.num}</span>
            <span className="dash-stat__label">{s.label}</span>
          </GlowCard>
        ))}
      </section>

      {/* ===== ARENA SNAPSHOT: Scalps + Rank ===== */}
      <section className="dash-grid dash-grid--2">

        {/* Scalps preview */}
        <GlowCard tone="success" className="dash-panel dash-wallet">
          <div className="dash-panel__head">
            <h2><Icon name="Coins" /> Your Scalps</h2>
            <Link to="/wallet" className="dash-panel__link">Wallet <Icon name="ArrowRight" /></Link>
          </div>
          <ScalpsBalance amount={MOCK_SCALPS} label="Available balance" size="md" />
          <p className="dash-wallet__note">
            Scalps power every entry and every payout. 1 Scalp = $1 USD.
          </p>
          <div className="dash-wallet__actions">
            <AnimatedButton variant="grad" icon="ArrowDown" fbKind="tap" onClick={() => {}}>
              <Link to="/deposit" className="dash-hero__ctaLink">Add Scalps</Link>
            </AnimatedButton>
            <AnimatedButton variant="ghost" icon="Send" fbKind="tap" onClick={() => {}}>
              <Link to="/wallet" className="dash-hero__ctaLink">Cash Out</Link>
            </AnimatedButton>
          </div>
          <span className="dash-mockflag"><Icon name="Lock" /> Demo balance — money movement is gated</span>
        </GlowCard>

        {/* Rank / progression preview */}
        <GlowCard tone="gold" className="dash-panel dash-rank">
          <div className="dash-panel__head">
            <h2><Icon name="Medal" /> Your Rank</h2>
            <Link to="/rank-progression" className="dash-panel__link">Progression <Icon name="ArrowRight" /></Link>
          </div>
          <div className="dash-rank__row">
            <RankBadge tier="gold" />
            <div className="dash-rank__meta">
              <span className="dash-rank__tier">Gold III</span>
              <span className="dash-rank__sub">680 / 1000 RP to Platinum</span>
            </div>
            <RankBadge tier="plat" className="dash-rank__next" />
          </div>
          <ProgressGlow value={680} max={1000} tone="gold" animate />
          <div className="dash-rank__reward">
            <Icon name="Gem" />
            <span>Next unlock: <b>Platinum Arena frame</b> + Ⓢ 150 bonus</span>
          </div>
        </GlowCard>

      </section>

      {/* ===== TOURNAMENT + QUICK PLAY ===== */}
      <section className="dash-grid dash-grid--2">

        {/* Tournament preview */}
        <GlowCard tone="primary" className="dash-panel dash-tourney">
          <div className="dash-panel__head">
            <h2><Icon name="Trophy" /> Live Tournament</h2>
            <StatusPill kind="live" label="Filling fast" />
          </div>
          <div className="dash-tourney__title">
            <span className="dash-tourney__name">Friday Night Arena</span>
            <span className="dash-tourney__game"><Icon name="Crown" /> Chess · 64 seats</span>
          </div>
          <div className="dash-tourney__pot">
            <div>
              <span className="dash-k">Entry</span>
              <span className="dash-v">Ⓢ {TOURNEY_ENTRY}</span>
            </div>
            <div>
              <span className="dash-k">Prize pool</span>
              <span className="dash-v dash-v--gold">Ⓢ {prizePool.toLocaleString()}</span>
            </div>
            <div>
              <span className="dash-k">Platform rake (3%)</span>
              <span className="dash-v dash-v--dim">Ⓢ {rakeCut.toLocaleString()}</span>
            </div>
          </div>
          <div className="dash-tourney__payouts">
            <span><b>1st</b> Ⓢ {firstPlace.toLocaleString()}</span>
            <span><b>2nd</b> Ⓢ {secondPlace.toLocaleString()}</span>
            <span><b>3rd</b> Ⓢ {thirdPlace.toLocaleString()}</span>
          </div>
          <ProgressGlow value={48} max={TOURNEY_FIELD} tone="primary" animate />
          <span className="dash-tourney__seats">48 / {TOURNEY_FIELD} seats filled</span>
          <div className="dash-tourney__cta">
            <AnimatedButton variant="grad" icon="Swords" fbKind="tap" onClick={() => setJoinOpen(true)}>
              Join for Ⓢ {TOURNEY_ENTRY}
            </AnimatedButton>
            <Link to="/tournaments" className="dash-tourney__all">All tournaments</Link>
          </div>
          <span className="dash-mockflag"><Icon name="Lock" /> Mock economy — no real entry is charged</span>
        </GlowCard>

        {/* Quick play */}
        <GlowCard tone="accent" className="dash-panel dash-quick">
          <div className="dash-panel__head">
            <h2><Icon name="Bolt" /> Quick Play</h2>
            <span className="dash-quick__featured">Featured</span>
          </div>
          <div className="dash-quick__game">
            <span className="dash-quick__art"><Icon name="Crown" /></span>
            <div className="dash-quick__info">
              <span className="dash-quick__name">Chess</span>
              <div className="dash-quick__chips">
                <span className="chip chip--beg">Beginner</span>
                <span className="chip chip--med">Medium</span>
                <span className="chip chip--adv">Advanced</span>
              </div>
            </div>
          </div>
          <div className="dash-quick__cta">
            <AnimatedButton variant="grad" icon="Play" fbKind="tap" onClick={() => {}}>
              <Link to="/games/chess" className="dash-hero__ctaLink">Play Ranked</Link>
            </AnimatedButton>
            <AnimatedButton variant="ghost" icon="Gamepad" fbKind="tap" onClick={() => {}}>
              <Link to="/training" className="dash-hero__ctaLink">Bot Match</Link>
            </AnimatedButton>
          </div>
        </GlowCard>

      </section>

      {/* ===== REWARD / PROGRESSION CALLOUTS ===== */}
      <section className="dash-rewards">
        <div className="dash-section__head">
          <h2>Rewards &amp; Challenges</h2>
          <Link to="/battle-pass" className="dash-panel__link">Battle Pass <Icon name="ArrowRight" /></Link>
        </div>
        <div className="dash-rewards__grid">

          <GlowCard tone="success" className="dash-reward">
            <span className="dash-reward__icon"><Icon name="Calendar" /></span>
            <span className="dash-reward__title">Daily reward</span>
            <span className="dash-reward__desc">Claim Ⓢ 50 just for showing up.</span>
            <AnimatedButton variant={claimed ? "ghost" : "grad"} icon={claimed ? "CheckCircle" : "Sparkles"} fbKind="reward" onClick={claimReward}>
              {claimed ? "Claimed" : "Claim Ⓢ 50"}
            </AnimatedButton>
          </GlowCard>

          <GlowCard tone="warning" className="dash-reward">
            <span className="dash-reward__icon"><Icon name="Flame" /></span>
            <span className="dash-reward__title">Weekly challenge</span>
            <span className="dash-reward__desc">Win 5 ranked matches</span>
            <ProgressGlow value={3} max={5} tone="gold" animate />
            <span className="dash-reward__meta">3 / 5 · Reward Ⓢ 120</span>
          </GlowCard>

          <GlowCard tone="accent" className="dash-reward">
            <span className="dash-reward__icon"><Icon name="Gem" /></span>
            <span className="dash-reward__title">Item unlock</span>
            <span className="dash-reward__desc">Neon Arena banner</span>
            <ProgressGlow value={2} max={3} tone="primary" animate />
            <span className="dash-reward__meta">Reach Platinum to unlock</span>
          </GlowCard>

          <GlowCard tone="gold" className="dash-reward">
            <span className="dash-reward__icon"><Icon name="Medal" /></span>
            <span className="dash-reward__title">Achievement</span>
            <span className="dash-reward__desc">First Blood — win your first match</span>
            <StatusPill kind="accent" label="Unlocked" />
          </GlowCard>

        </div>
      </section>

      {/* ===== THE ARENA: game grid ===== */}
      <section className="dash-arena">
        <div className="dash-section__head">
          <h2>The Arena</h2>
          <Link to="/games" className="dash-panel__link">All games <Icon name="ArrowRight" /></Link>
        </div>
        <div className="dash-arena__grid">
          {ARENA.map((g) => (
            <Link key={g.slug} to={`/games/${g.slug}`} className="arena-card-link">
              <GlowCard tone={g.tone as any} className={`arena-card arena-card--${g.tone}`}>
                <span className="arena-card__art"><Icon name={g.icon} /></span>
                <span className="arena-card__name">{g.name}</span>
                <span className={`chip chip--${g.diff.toLowerCase()}`}>{g.diff}</span>
                <span className="arena-card__play"><Icon name="Play" /> Play</span>
              </GlowCard>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="dash-features">
        <div className="dash-section__head dash-section__head--center">
          <h2>Built for champions</h2>
        </div>
        <div className="dash-features__grid">
          {FEATURES.map((f) => (
            <GlowCard key={f.title} tone="primary" className="dash-feature">
              <span className="dash-feature__icon"><Icon name={f.icon} /></span>
              <span className="dash-feature__title">{f.title}</span>
              <span className="dash-feature__desc">{f.desc}</span>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="dash-final">
        <div className="dash-final__glow" aria-hidden="true" />
        <h2>Your seat in the arena is waiting.</h2>
        <p>Join 1,247 players battling for Scalps right now.</p>
        <AnimatedButton variant="grad" icon="Swords" pulse fbKind="tap" onClick={() => {}}>
          <Link to="/play" className="dash-hero__ctaLink">Enter the Arena</Link>
        </AnimatedButton>
      </section>

      {/* ===== JOIN TOURNAMENT MODAL ===== */}
      <ActionModal open={joinOpen} onClose={() => setJoinOpen(false)} title="Join Friday Night Arena">
        <div className="dash-modal">
          <div className="dash-modal__row">
            <span>Entry fee</span>
            <b>Ⓢ {TOURNEY_ENTRY}</b>
          </div>
          <div className="dash-modal__row">
            <span>Platform rake (3%)</span>
            <b className="dash-v--dim">Ⓢ {rakeCut.toLocaleString()} of pot</b>
          </div>
          <div className="dash-modal__row">
            <span>Prize pool</span>
            <b className="dash-v--gold">Ⓢ {prizePool.toLocaleString()}</b>
          </div>
          <div className="dash-modal__row dash-modal__row--top">
            <span>Winner takes</span>
            <b className="dash-v--gold">Ⓢ {firstPlace.toLocaleString()}</b>
          </div>
          <p className="dash-modal__note">
            <Icon name="Lock" /> This is a demo. No Scalps are actually charged and no real money moves.
          </p>
          <div className="dash-modal__cta">
            <AnimatedButton variant="ghost" icon="Close" fbKind="tap" onClick={() => setJoinOpen(false)}>
              Cancel
            </AnimatedButton>
            <AnimatedButton variant="grad" icon="CheckCircle" fbKind="tap" onClick={confirmJoin}>
              Confirm seat
            </AnimatedButton>
          </div>
        </div>
      </ActionModal>

    </div>
  );
}
