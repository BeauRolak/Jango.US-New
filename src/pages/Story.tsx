import { useNavigate } from "react-router-dom";
import { Btn, toast } from "../components/UI";
import "./story.css";

interface Chapter { num: string; title: string; era: string; body: string; }
interface Pillar { icon: string; title: string; body: string; }

const CHAPTERS: Chapter[] = [
  {
    num: "I",
    title: "Born in the Back Rooms",
    era: "Marula City — The Lowtown Years",
    body: "Under the neon haze of Marula City, the smoky back rooms never slept. Jango learned the table before he learned to walk away from one. Pool cues, putters, paddles — whatever the night put in front of him, he read the angles like other kids read comics.",
  },
  {
    num: "II",
    title: "The Hustle Becomes a Craft",
    era: "The Rise",
    body: "Talent alone gets you robbed. Jango turned instinct into discipline — thousands of reps, cold reads, ice in the veins when the Scalps were on the line. Word spread across the districts: there was a kid who didn't miss when it mattered.",
  },
  {
    num: "III",
    title: "Crowned at the Table",
    era: "The Reign",
    body: "One neon-soaked tournament night, Jango ran the gauntlet — pool, golf, hockey, chess — and dropped every challenger. They stopped calling him a hustler. They started calling him the King of the Table.",
  },
  {
    num: "IV",
    title: "The Arena Opens",
    era: "Today — Jango.US",
    body: "Jango built the arena he always wanted: pure skill, no luck boxes, no pay-to-win. A place where anyone from any lobby can climb, earn their Scalps, and chase a crown of their own. Welcome to his table.",
  },
];

const PILLARS: Pillar[] = [
  { icon: "🎯", title: "Skill", body: "Every outcome is earned. Read the angle, make the shot, own the result." },
  { icon: "🎲", title: "Risk", body: "Stake your Scalps, call your shot, and live with the line you chose." },
  { icon: "🔥", title: "Swagger", body: "Win with style. The table remembers the players who play without fear." },
  { icon: "👑", title: "Dominance", body: "Master every table game and stake your claim at the top of the ladder." },
];

export default function Story() {
  const navigate = useNavigate();

  return (
    <div className="story-page">
      {/* Hero */}
      <section className="st-hero">
        <div className="st-hero-bg" aria-hidden="true">
          <div className="st-skyline" />
          <div className="st-glow st-glow-a" />
          <div className="st-glow st-glow-b" />
        </div>
        <div className="st-hero-inner">
          <span className="st-kicker">🌆 Marula City Legends</span>
          <h1 className="st-title">
            <span className="st-title-sub">JANGO</span>
            <span className="st-title-main">The King of the Table</span>
          </h1>
          <p className="st-tagline">
            Skill. Risk. Swagger. The story of how one player turned the neon back rooms of Marula City into a kingdom — and built an arena for everyone chasing the crown.
          </p>
          <div className="st-hero-cta">
            <Btn className="st-cta" onClick={() => navigate("/games")}>Enter the Arena</Btn>
            <Btn variant="ghost" onClick={() => toast("Jango tips his cue to you — good luck at the table", "reward")}>👑 Pay Respects</Btn>
          </div>
        </div>
        <div className="st-hero-portrait" aria-hidden="true">
          <div className="st-portrait-frame">
            <span className="st-portrait-emoji">🎱</span>
            <span className="st-portrait-crown">👑</span>
          </div>
          <span className="st-portrait-caption">Jango — Arena Mascot</span>
        </div>
      </section>

      {/* Pillars */}
      <section className="st-pillars">
        {PILLARS.map((p) => (
          <div key={p.title} className="st-pillar">
            <span className="st-pillar-icon">{p.icon}</span>
            <h3 className="st-pillar-title">{p.title}</h3>
            <p className="st-pillar-body">{p.body}</p>
          </div>
        ))}
      </section>

      {/* Chapters timeline */}
      <section className="st-chapters">
        <h2 className="st-section-title">The Legend, Chapter by Chapter</h2>
        <div className="st-timeline">
          {CHAPTERS.map((ch) => (
            <article key={ch.num} className="st-chapter">
              <div className="st-chapter-rail">
                <span className="st-chapter-num">{ch.num}</span>
              </div>
              <div className="st-chapter-card">
                <span className="st-chapter-era">{ch.era}</span>
                <h3 className="st-chapter-title">{ch.title}</h3>
                <p className="st-chapter-body">{ch.body}</p>
                <div className="st-chapter-art" aria-hidden="true">
                  <span>Concept art — coming soon</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Marula City lore band */}
      <section className="st-city">
        <div className="st-city-art" aria-hidden="true">
          <div className="st-city-skyline" />
        </div>
        <div className="st-city-text">
          <span className="st-kicker">🌆 The Setting</span>
          <h2 className="st-section-title">Marula City</h2>
          <p>
            A rain-slick metropolis lit by purple and electric-blue neon, where every district has a table and every table has a story. Champions are made in its arenas; legends are made in its back rooms. This is where Jango.US was born.
          </p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="st-finale">
        <span className="st-finale-icon">🏆</span>
        <h2 className="st-finale-title">Your story starts now.</h2>
        <p className="st-finale-text">Climb the ranks, earn your Scalps, and write your own chapter at Jango's table.</p>
        <Btn className="st-cta" onClick={() => navigate("/games")}>Start Competing</Btn>
      </section>
    </div>
  );
}
