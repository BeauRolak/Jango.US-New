import { Link } from "react-router-dom";
import "./pages.css";
import { Icon } from "../components/Icon";
import { StatusPill } from "../components/Juice";

const ARENA: { name: string; diff: string; icon: string }[] = [
  { name: "Chess", diff: "Advanced", icon: "Crown" },
  { name: "Mini Golf", diff: "Medium", icon: "Target" },
  { name: "Connect 4", diff: "Beginner", icon: "Dice" },
  { name: "Air Hockey", diff: "Medium", icon: "Bolt" },
  { name: "Rock Paper Scissors", diff: "Beginner", icon: "Swords" },
  { name: "Dots & Boxes", diff: "Beginner", icon: "List" },
  { name: "8-Ball Pool", diff: "Medium", icon: "Target" },
  { name: "Bowling", diff: "Medium", icon: "Bolt" },
  { name: "Cup King", diff: "Medium", icon: "Trophy" },
  { name: "Stack Tower", diff: "Easy", icon: "Building" },
];

const FEATURES = [
  { title: "Real-Time Gameplay", desc: "Live matches against real opponents with instant action.", icon: "Bolt" },
  { title: "Skill-Based Matches", desc: "No luck. Every win is earned through pure skill.", icon: "Target" },
  { title: "Global Leaderboards", desc: "Climb the ranks and prove you are the best.", icon: "Chart" },
  { title: "Fair Play Guaranteed", desc: "Anti-cheat and verified results on every match.", icon: "Shield" },
];

const STATS = [
  { num: "1,247", label: "Players Online" },
  { num: "342", label: "Active Matches" },
  { num: "891", label: "Today's Winners" },
];

export default function Dashboard() {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <StatusPill label="1,247 players online now" kind="live" live />
        <h1 className="hero-title">
          Bet on Skill,<br />
          <span className="grad-text">Not Luck.</span>
        </h1>
        <p className="hero-sub">Real players. Real competition. Pure skill.</p>
        <div className="hero-cta">
          <Link to="/play" className="btn-grad">
            <Icon name="Play" size={18} /> Start Playing
          </Link>
          <Link to="/play" className="btn-outline">
            <Icon name="Gamepad" size={18} /> View Games
          </Link>
        </div>
        <div className="stats-row">
          {STATS.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="arena-section">
        <div className="eyebrow">• ARENA •</div>
        <h2 className="section-title">The Arena</h2>
        <p className="section-sub">Ten battlefields, one goal — prove you are the best.</p>
        <div className="arena-grid">
          {ARENA.map((g) => (
            <Link to="/play" className="game-card" key={g.name}>
              <div className="game-card-glow" aria-hidden="true" />
              <div className="game-icon">
                <Icon name={g.icon as never} size={26} />
              </div>
              <div className="game-info">
                <div className="game-name">{g.name}</div>
                <span className="diff-badge">{g.diff}</span>
              </div>
              <Icon name="ArrowUpRight" size={16} className="game-go" />
            </Link>
          ))}
        </div>
        <div className="center">
          <Link to="/play" className="btn-outline">Join the Arena <Icon name="ArrowRight" size={16} /></Link>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Built for Champions</h2>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-ic"><Icon name={f.icon as never} size={22} /></div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="origins-band">
        <div className="origins-inner">
          <div className="eyebrow">• ARENA ORIGINS •</div>
          <h2 className="section-title">Born from the love of the game.</h2>
          <Link to="/story" className="btn-outline">Read the Origin Story <Icon name="ArrowRight" size={16} /></Link>
        </div>
      </section>

      <section className="final-cta">
        <h2 className="section-title">Ready to prove your skill?</h2>
        <Link to="/play" className="btn-grad">Create Free Account <Icon name="ArrowRight" size={16} /></Link>
      </section>

      <footer className="landing-footer">
        <div className="footer-brand">JANGO • Skill-based competitive gaming platform</div>
        <div className="footer-links">
          <a href="#" className="footer-legal">Terms of Service</a>
          <a href="#" className="footer-legal">Privacy Policy</a>
          <a href="#" className="footer-legal">Contact</a>
          <a href="#" className="footer-legal">Fair Play</a>
        </div>
      </footer>
    </div>
  );
}
