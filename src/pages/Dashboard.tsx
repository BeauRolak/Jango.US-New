import { Link } from "react-router-dom";
import "./pages.css";
import "./dashboard.css";

const ARENA = [
  { name: "Chess", diff: "Advanced", icon: "♞" },
  { name: "Mini Golf", diff: "Medium", icon: "⛳" },
  { name: "Connect 4", diff: "Beginner", icon: "" },
  { name: "Air Hockey", diff: "Medium", icon: "" },
  { name: "Rock Paper Scissors", diff: "Beginner", icon: "✊" },
  { name: "Dots & Boxes", diff: "Beginner", icon: "▦" },
  { name: "8-Ball Pool", diff: "Medium", icon: "" },
  { name: "Bowling", diff: "Medium", icon: "" },
  { name: "Cup King", diff: "Medium", icon: "弄" },
  { name: "Stack Tower", diff: "Easy", icon: "隣" },
];

const FEATURES = [
  { title: "Real-Time Gameplay", desc: "Live matches against real opponents with instant action." },
  { title: "Skill-Based Matches", desc: "No luck. Every win is earned through pure skill." },
  { title: "Global Leaderboards", desc: "Climb the ranks and prove you are the best." },
  { title: "Fair Play Guaranteed", desc: "Anti-cheat and verified results on every match." },
  { title: "ELO Rating System", desc: "A true rating that reflects your competitive level." },
  { title: "Daily Rewards", desc: "Log in, play, and earn Scalps every single day." },
];

const STATS = [
  { num: "1,247", label: "Players Online" },
  { num: "342", label: "Active Matches" },
  { num: "891", label: "Today's Winners" },
];

export default function Dashboard() {
  return (
    <div className={"landing"}>
      <section className={"hero"}>
        <span className={"live-pill"}>● Live — 1,247 players online now</span>
        <h1 className={"hero-title"}>Bet on Skill, <span className={"grad-text"}>Not Luck.</span></h1>
        <p className={"hero-sub"}>Real players. Real competition. Pure skill.</p>
        <div className={"hero-cta"}>
          <Link to={"/play"} className={"btn-grad lg"}>Start Playing →</Link>
          <Link to={"/games"} className={"btn-outline lg"}>View Games</Link>
        </div>
      </section>

      <section className={"stats-row"}>
        {STATS.map((s) => (
          <div key={s.label} className={"stat-card"}>
            <span className={"stat-num"}>{s.num}</span>
            <span className={"stat-label"}>{s.label}</span>
          </div>
        ))}
      </section>

      <section className={"arena-section"}>
        <span className={"eyebrow center"}>• ARENA •</span>
        <h2 className={"section-title"}>The Arena</h2>
        <p className={"section-sub"}>Ten battlefields, one goal — prove you are the best.</p>
        <div className={"arena-grid"}>
          {ARENA.map((g) => (
            <Link key={g.name} to={"/play"} className={"game-card"}>
              <div className={"game-icon"}>{g.icon}</div>
              <div className={"game-info"}>
                <span className={"game-name"}>{g.name}</span>
                <span className={"diff-badge diff-" + g.diff.toLowerCase()}>{g.diff}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className={"center"}><Link to={"/play"} className={"btn-grad"}>Join the Arena →</Link></div>
      </section>

      <section className={"features-section"}>
        <h2 className={"section-title"}>Built for Champions</h2>
        <div className={"features-grid"}>
          {FEATURES.map((f) => (
            <div key={f.title} className={"feature-card"}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={"origins-band"}>
        <h2>Born from the love of the game.</h2>
        <Link to={"/story"} className={"btn-outline"}>Read the Origin Story →</Link>
      </section>

      <section className={"final-cta"}>
        <h2>Ready to prove your skill?</h2>
        <Link to={"/play"} className={"btn-grad lg"}>Create Free Account →</Link>
      </section>

      <footer className={"landing-footer"}>
        <div className={"footer-brand"}>JANGO • Skill-based competitive gaming platform</div>
        <div className={"footer-links"}>
          <a>Terms of Service</a><a>Privacy Policy</a><a>Contact</a><a>Fair Play</a>
        </div>
        <p className={"footer-legal"}>© 2026 Jango.us. All rights reserved. • Players must be 18+. Play responsibly.</p>
      </footer>
    </div>
  );
}
