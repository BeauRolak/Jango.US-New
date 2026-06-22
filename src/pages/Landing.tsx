import { Link } from "react-router-dom";
import PublicShell from "../components/PublicShell";
import { Icon, type IconName } from "../components/Icon";
import { GAMES } from "../games/registry";
import "./landing.css";

const GAME_ICON: Record<string, IconName> = {
  minigolf: "Target", connect4: "Dice", "8ball": "Trophy", airhockey: "Bolt",
  chess: "Crown", rps: "Swords", dotsboxes: "List", bowling: "Bolt",
  basketball: "Target", football: "Trophy", stacktower: "Building",
  blockblast: "Sparkles", tron: "Bolt", cupking: "Crown", racing: "Bolt",
};

const TICKER = [
  { a: "ShadowAce", b: "NovaStrike", game: "Chess", pot: "1,600" },
  { a: "Vortex", b: "PixelKing", game: "8-Ball", pot: "420" },
  { a: "GhostByte", b: "Riptide", game: "Air Hockey", pot: "240" },
  { a: "Mercury", b: "Daydream", game: "Mini Golf", pot: "150" },
  { a: "Cobalt", b: "Saint", game: "Connect Four", pot: "300" },
  { a: "Echo", b: "Wildcard", game: "Racing", pot: "500" },
];

const WHY: { title: string; desc: string; icon: IconName; tone: string }[] = [
  { title: "Skill is the only edge", desc: "Every match is decided by how you play. No slot machines, no random number generator, no house stacked against you — just two players and who's better.", icon: "Target", tone: "primary" },
  { title: "Instant payouts", desc: "Win and your Scalps land the second the match ends.", icon: "Bolt", tone: "accent" },
  { title: "Climb the ranks", desc: "Bronze to Master. Every game moves your rank.", icon: "Chart", tone: "success" },
  { title: "Fair, flat 3% rake", desc: "Transparent pots, transparent payouts. No surprises.", icon: "Shield", tone: "gold" },
];

const STEPS = [
  { n: "01", title: "Create your account", desc: "Free in seconds. Look around the arena before you ever deposit.", icon: "Users" as IconName },
  { n: "02", title: "Pick a game, set the stakes", desc: "Match into ranked, casual, or tournaments across 14 games of skill.", icon: "Gamepad" as IconName },
  { n: "03", title: "Outplay & cash out", desc: "Win the match, win the pot. 1 Scalp = $1, paid instantly.", icon: "Coins" as IconName },
];

export default function Landing() {
  const featured = GAMES.filter((g) => ["chess", "8ball", "airhockey"].includes(g.id));
  return (
    <PublicShell>
      {/* ===================== HERO ===================== */}
      <section className="lp-hero">
        <div className="lp-hero__bg" aria-hidden="true">
          <div className="lp-hero__beam" />
          <div className="lp-hero__floor" />
        </div>
        <div className="lp-hero__wrap">
          <div className="lp-hero__copy">
            <span className="lp-eyebrow">
              <span className="lp-eyebrow__dot" aria-hidden="true" />
              1,247 players in the arena right now
            </span>
            <h1 className="lp-hero__title">
              Bet on <span className="grad">Skill.</span>
              <br />Not luck.
            </h1>
            <p className="lp-hero__sub">
              Jango is the skill-based gaming arena. Go head-to-head with real
              opponents in real games, climb the ranks, and cash out your skill in
              Scalps — where the better player always wins.
            </p>
            <div className="lp-hero__cta">
              <Link to="/signup" className="lp-btn lp-btn--primary lp-btn--lg">
                <Icon name="Swords" /> Create free account
              </Link>
              <Link to="/login" className="lp-btn lp-btn--ghost lp-btn--lg">
                Log in <Icon name="ArrowRight" />
              </Link>
            </div>
            <ul className="lp-hero__trust">
              <li><Icon name="Shield" /> 3% flat rake</li>
              <li><Icon name="Bolt" /> Instant payouts</li>
              <li><Icon name="Coins" /> 1 Scalp = $1</li>
            </ul>
          </div>

          {/* Featured live duel */}
          <div className="lp-hero__stage">
            <div className="lp-duel">
              <div className="lp-duel__top">
                <span className="lp-duel__live"><span className="lp-duel__livedot" /> LIVE MATCH</span>
                <span className="lp-duel__game"><Icon name="Crown" /> Chess · Ranked</span>
              </div>
              <div className="lp-duel__body">
                <div className="lp-duel__player">
                  <span className="lp-duel__ava lp-duel__ava--a">SA</span>
                  <span className="lp-duel__name">ShadowAce</span>
                  <span className="lp-duel__elo">Master · 2410</span>
                </div>
                <div className="lp-duel__vs"><span className="grad">VS</span></div>
                <div className="lp-duel__player">
                  <span className="lp-duel__ava lp-duel__ava--b">NS</span>
                  <span className="lp-duel__name">NovaStrike</span>
                  <span className="lp-duel__elo">Master · 2388</span>
                </div>
              </div>
              <div className="lp-duel__pot">
                <div><span className="lp-k">Entry</span><span className="lp-v">Ⓢ 25</span></div>
                <div className="lp-duel__potmain"><span className="lp-k">Pot</span><span className="lp-v lp-v--gold">Ⓢ 1,600</span></div>
                <div><span className="lp-k">Winner takes</span><span className="lp-v">Ⓢ 1,552</span></div>
              </div>
            </div>
            <div className="lp-chips" aria-hidden="true">
              {featured.map((g) => (
                <span key={g.id} className="lp-chip" style={{ background: g.art }}>
                  <Icon name={GAME_ICON[g.id] || "Gamepad"} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== LIVE TICKER ===================== */}
      <div className="lp-ticker" aria-label="Live matches">
        <div className="lp-ticker__track">
          {[...TICKER, ...TICKER].map((m, i) => (
            <span className="lp-ticker__item" key={i}>
              <span className="lp-ticker__dot" />
              <b>{m.a}</b> vs <b>{m.b}</b>
              <span className="lp-ticker__game">{m.game}</span>
              <span className="lp-ticker__pot">Ⓢ {m.pot}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="lp">
        {/* ===================== WHY (bento) ===================== */}
        <section className="lp-section">
          <div className="lp-section__head">
            <span className="lp-kicker">Why Jango</span>
            <h2>Competition that pays out on merit.</h2>
          </div>
          <div className="lp-bento">
            <article className={`lp-feat lp-feat--lead lp-tone-${WHY[0].tone}`}>
              <span className="lp-feat__icon"><Icon name={WHY[0].icon} /></span>
              <h3>{WHY[0].title}</h3>
              <p>{WHY[0].desc}</p>
            </article>
            {WHY.slice(1).map((w) => (
              <article key={w.title} className={`lp-feat lp-tone-${w.tone}`}>
                <span className="lp-feat__icon"><Icon name={w.icon} /></span>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ===================== GAMES ===================== */}
        <section className="lp-section">
          <div className="lp-section__head lp-section__head--row">
            <div>
              <span className="lp-kicker">The Arena</span>
              <h2>{GAMES.length} games. One rule: skill wins.</h2>
            </div>
            <Link to="/signup" className="lp-seeall">Play them all <Icon name="ArrowRight" /></Link>
          </div>
          <div className="lp-games">
            {GAMES.map((g) => (
              <div key={g.id} className="lp-game">
                <div className="lp-game__art" style={{ background: g.art }}>
                  <span className="lp-game__glyph"><Icon name={GAME_ICON[g.id] || "Gamepad"} /></span>
                  <span className="lp-game__mode">{g.mode}</span>
                </div>
                <div className="lp-game__body">
                  <span className="lp-game__name">{g.name}</span>
                  <span className="lp-game__cat">{g.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== HOW IT WORKS ===================== */}
        <section className="lp-section">
          <div className="lp-section__head">
            <span className="lp-kicker">How it works</span>
            <h2>Sign-up to payout in three steps.</h2>
          </div>
          <div className="lp-steps">
            <div className="lp-steps__line" aria-hidden="true" />
            {STEPS.map((s) => (
              <article key={s.n} className="lp-step">
                <span className="lp-step__icon"><Icon name={s.icon} /></span>
                <span className="lp-step__n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* ===================== FINAL CTA ===================== */}
      <section className="lp-final">
        <div className="lp-final__floor" aria-hidden="true" />
        <div className="lp-final__inner">
          <span className="lp-kicker">Ready?</span>
          <h2>Your seat in the arena is waiting.</h2>
          <p>Create a free account and play your first match in under a minute.</p>
          <div className="lp-final__cta">
            <Link to="/signup" className="lp-btn lp-btn--primary lp-btn--lg">
              <Icon name="Swords" /> Create your account
            </Link>
            <Link to="/login" className="lp-btn lp-btn--ghost lp-btn--lg">I already have one</Link>
          </div>
          <span className="lp-final__fine"><Icon name="Lock" /> Must be 18+. Play responsibly.</span>
        </div>
      </section>
    </PublicShell>
  );
}
