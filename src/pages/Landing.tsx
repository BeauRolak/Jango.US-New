import { Link } from "react-router-dom";
import PublicShell from "../components/PublicShell";
import { Icon, type IconName } from "../components/Icon";
import { GAMES } from "../games/registry";
import "./landing.css";

const STEPS: { n: string; title: string; desc: string; icon: IconName }[] = [
  { n: "01", title: "Create your account", desc: "Sign up free in seconds. No deposit needed to look around the arena.", icon: "Users" },
  { n: "02", title: "Pick a game, set the stakes", desc: "Choose from real games of skill and match into ranked, casual, or tournaments.", icon: "Gamepad" },
  { n: "03", title: "Outplay & cash your skill", desc: "Win the match, win the pot. Scalps land instantly — 1 Scalp = $1.", icon: "Bolt" },
];

const WHY: { title: string; desc: string; icon: IconName; tone: string }[] = [
  { title: "Skill, not luck", desc: "Every match is decided by how you play — no house edge stacked against you.", icon: "Target", tone: "primary" },
  { title: "Instant payouts", desc: "Win and your Scalps are credited the moment the match ends.", icon: "Bolt", tone: "accent" },
  { title: "Ranked progression", desc: "Climb Bronze to Master. Every game moves your rank and your rewards.", icon: "Chart", tone: "success" },
  { title: "Fair by design", desc: "A flat, transparent 3% rake. Clear pots, clear payouts, every time.", icon: "Shield", tone: "gold" },
];

const STATS = [
  { num: "1,247", label: "Players online" },
  { num: "14", label: "Games of skill" },
  { num: "Ⓢ 4.2M", label: "Scalps in play" },
  { num: "3%", label: "Flat rake" },
];

export default function Landing() {
  return (
    <PublicShell>
      <div className="lp">

        {/* ===== HERO ===== */}
        <section className="lp-hero">
          <div className="lp-hero__glow" aria-hidden="true" />
          <div className="lp-hero__copy">
            <span className="lp-eyebrow">
              <span className="lp-eyebrow__dot" aria-hidden="true" />
              1,247 players in the arena right now
            </span>
            <h1 className="lp-hero__title">
              Bet on <span className="grad">Skill</span>,<br />not luck.
            </h1>
            <p className="lp-hero__sub">
              Jango is a skill-based competitive gaming arena. Go head-to-head with
              real opponents in real games, climb the ranks, and cash out your skill
              in Scalps. No slot machines. No house edge. Just you, your opponent,
              and who plays better.
            </p>
            <div className="lp-hero__cta">
              <Link to="/signup" className="lp-btn lp-btn--primary">
                <Icon name="Swords" /> Create account
              </Link>
              <Link to="/login" className="lp-btn lp-btn--ghost">
                <Icon name="ArrowRight" /> Log in
              </Link>
            </div>
            <ul className="lp-hero__trust">
              <li><Icon name="Shield" /> 3% flat rake</li>
              <li><Icon name="Bolt" /> Instant payouts</li>
              <li><Icon name="Coins" /> 1 Scalp = $1</li>
              <li><Icon name="Lock" /> 18+ · Play responsibly</li>
            </ul>
          </div>

          {/* arena visual */}
          <div className="lp-hero__art" aria-hidden="true">
            <div className="lp-orb">
              <div className="lp-orb__ring" />
              <div className="lp-orb__core"><span className="grad">VS</span></div>
              <div className="lp-arena-floor" />
            </div>
          </div>
        </section>

        {/* ===== STAT STRIP ===== */}
        <section className="lp-stats" aria-label="Arena at a glance">
          {STATS.map((s) => (
            <div key={s.label} className="lp-stat">
              <span className="lp-stat__num">{s.num}</span>
              <span className="lp-stat__label">{s.label}</span>
            </div>
          ))}
        </section>

        {/* ===== WHAT WE'RE ABOUT ===== */}
        <section className="lp-section">
          <div className="lp-section__head">
            <span className="lp-kicker">Why Jango</span>
            <h2>Competition that pays out on merit.</h2>
            <p className="lp-section__sub">
              We built Jango for players who are tired of luck deciding the outcome.
              Here, the better player wins — and gets paid for it.
            </p>
          </div>
          <div className="lp-why">
            {WHY.map((w) => (
              <article key={w.title} className={`lp-why__card lp-tone-${w.tone}`}>
                <span className="lp-why__icon"><Icon name={w.icon} /></span>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ===== GAMES SHOWCASE ===== */}
        <section className="lp-section">
          <div className="lp-section__head">
            <span className="lp-kicker">The Arena</span>
            <h2>{GAMES.length} games of pure skill.</h2>
            <p className="lp-section__sub">
              Board classics, sports, and arcade duels — all 1v1 or solo runs where
              skill is the only edge that matters.
            </p>
          </div>
          <div className="lp-games">
            {GAMES.map((g) => (
              <div key={g.id} className="lp-game" style={{ ["--art" as any]: g.art }}>
                <div className="lp-game__art" style={{ background: g.art }} />
                <div className="lp-game__body">
                  <span className="lp-game__name">{g.name}</span>
                  <span className="lp-game__meta">{g.category} · {g.mode}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="lp-section">
          <div className="lp-section__head">
            <span className="lp-kicker">How it works</span>
            <h2>From sign-up to payout in three steps.</h2>
          </div>
          <div className="lp-steps">
            {STEPS.map((s) => (
              <article key={s.n} className="lp-step">
                <span className="lp-step__n">{s.n}</span>
                <span className="lp-step__icon"><Icon name={s.icon} /></span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="lp-final">
          <div className="lp-final__glow" aria-hidden="true" />
          <h2>Your seat in the arena is waiting.</h2>
          <p>Create a free account and play your first match in under a minute.</p>
          <div className="lp-final__cta">
            <Link to="/signup" className="lp-btn lp-btn--primary lp-btn--lg">
              <Icon name="Swords" /> Create your account
            </Link>
            <Link to="/login" className="lp-btn lp-btn--ghost lp-btn--lg">
              I already have one
            </Link>
          </div>
          <span className="lp-final__fine">
            <Icon name="Lock" /> Must be 18+. Jango is a skill-based platform — play responsibly.
          </span>
        </section>

      </div>
    </PublicShell>
  );
}
