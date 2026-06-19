import { useState } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Btn, toast } from "../components/UI";
import "./profile.css";

interface Match { id: string; game: string; result: "W" | "L"; score: string; opp: string; delta: number; time: string; }
interface Achievement { id: string; icon: string; name: string; desc: string; unlocked: boolean; }
interface Cosmetic { id: string; slot: string; name: string; rarity: string; }

const MATCHES: Match[] = [
  { id: "m1", game: "8-Ball Pool", result: "W", score: "8-5", opp: "Nova", delta: 18, time: "2m ago" },
  { id: "m2", game: "Mini Golf", result: "W", score: "-4", opp: "ShadowAce", delta: 15, time: "1h ago" },
  { id: "m3", game: "Chess", result: "L", score: "0-1", opp: "Ghost", delta: -12, time: "3h ago" },
  { id: "m4", game: "Air Hockey", result: "W", score: "7-3", opp: "Rook", delta: 14, time: "yesterday" },
  { id: "m5", game: "Connect Four", result: "L", score: "0-1", opp: "Blaze", delta: -9, time: "yesterday" },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", icon: "Flame", name: "Hot Streak", desc: "Win 5 matches in a row", unlocked: true },
  { id: "a2", icon: "Target", name: "Sharpshooter", desc: "Win a Pool match without a miss", unlocked: true },
  { id: "a3", icon: "Trophy", name: "Champion", desc: "Win a tournament bracket", unlocked: true },
  { id: "a4", icon: "Bolt", name: "Speed Demon", desc: "Win a match in under 60s", unlocked: false },
  { id: "a5", icon: "Crown", name: "King of the Table", desc: "Reach Diamond in any game", unlocked: false },
  { id: "a6", icon: "Medal", name: "Centurion", desc: "Play 100 ranked matches", unlocked: false },
];

const COSMETICS: Cosmetic[] = [
  { id: "c1", slot: "Avatar Frame", name: "Neon Pulse Frame", rarity: "Rare" },
  { id: "c2", slot: "Cue Trail", name: "Ember Trail", rarity: "Epic" },
  { id: "c3", slot: "Title", name: "Chess Tactician", rarity: "Uncommon" },
];

const RARITY_COLOR: Record<string, string> = {
  Common: "#9aa3b2", Uncommon: "#34d399", Rare: "#38bdf8", Epic: "#a855f7", Legendary: "#f59e0b",
};

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("beaurolak");
  const [title, setTitle] = useState("Chess Tactician");
  const [draftName, setDraftName] = useState(username);
  const [draftTitle, setDraftTitle] = useState(title);

  const wins = MATCHES.filter((m) => m.result === "W").length;
  const losses = MATCHES.filter((m) => m.result === "L").length;
  const winRate = Math.round((wins / MATCHES.length) * 100);
  const level = 14;
  const xp = 320;
  const xpMax = 500;
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;

  function openEdit() {
    setDraftName(username);
    setDraftTitle(title);
    setEditing(true);
  }

  function saveEdit() {
    if (!draftName.trim()) {
      toast("Username cannot be empty", "error");
      return;
    }
    setUsername(draftName.trim());
    setTitle(draftTitle.trim() || "Rookie");
    setEditing(false);
    toast("Profile updated", "success");
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="pf-header">
        <div className="pf-avatar">{username[0].toUpperCase()}<span className="pf-presence" /></div>
        <div className="pf-head-main">
          <div className="pf-name-row">
            <h1 className="pf-name">{username}</h1>
            <span className="pf-you">You</span>
            <Btn variant="ghost" className="pf-edit-btn" onClick={openEdit}><Icon name="Edit" /> Edit Profile</Btn>
          </div>
          <p className="pf-title">{title}</p>
          <div className="pf-tags">
            <span className="pf-tag rank">Silver · 1200</span>
            <span className="pf-tag">Lv {level}</span>
            <span className="pf-tag streak"><Icon name="Flame" /> 6 day streak</span>
            <span className="pf-tag good">Excellent (80/100)</span>
          </div>
          <div className="pf-xp">
            <div className="pf-xp-top">
              <span>Level {level} · XP {xp} / {xpMax}</span>
              <span>{xpMax - xp} to next level</span>
            </div>
            <div className="pf-xp-bar"><div className="pf-xp-fill" style={{ width: `${(xp / xpMax) * 100}%` }} /></div>
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <section className="pf-stats">
        <div className="pf-stat"><span className="pf-stat-num">{MATCHES.length}</span><span className="pf-stat-label">Matches</span></div>
        <div className="pf-stat"><span className="pf-stat-num win">{wins}</span><span className="pf-stat-label">Wins</span></div>
        <div className="pf-stat"><span className="pf-stat-num loss">{losses}</span><span className="pf-stat-label">Losses</span></div>
        <div className="pf-stat"><span className="pf-stat-num">{winRate}%</span><span className="pf-stat-label">Win Rate</span></div>
      </section>

      <div className="pf-grid">
        {/* Match history */}
        <section className="pf-card pf-history">
          <div className="pf-card-head">
            <h2>Match History</h2>
            <span className="pf-record">{wins}W — {losses}L</span>
          </div>
          <div className="pf-match-list">
            {MATCHES.map((m) => (
              <div key={m.id} className="pf-match">
                <span className={"pf-result " + (m.result === "W" ? "w" : "l")}>{m.result}</span>
                <div className="pf-match-meta">
                  <span className="pf-match-game">{m.game}</span>
                  <span className="pf-match-sub">vs {m.opp} · {m.score} · {m.time}</span>
                </div>
                <span className={"pf-delta " + (m.delta >= 0 ? "up" : "down")}>{m.delta >= 0 ? "+" : ""}{m.delta}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="pf-card pf-achievements">
          <div className="pf-card-head">
            <h2>Achievements</h2>
            <span className="pf-ach-count">{unlockedCount}/{ACHIEVEMENTS.length}</span>
          </div>
          <div className="pf-ach-grid">
            {ACHIEVEMENTS.map((a) => (
              <button
                key={a.id}
                className={"pf-ach" + (a.unlocked ? "" : " locked")}
                onClick={() =>
                  a.unlocked
                    ? toast(a.name + ": " + a.desc, "reward")
                    : toast("Locked: " + a.desc, "error")
                }
              >
                <span className="pf-ach-icon">{a.unlocked ? <Icon name={a.icon as IconName} /> : <Icon name="Lock" />}</span>
                <span className="pf-ach-name">{a.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Equipped cosmetics */}
        <section className="pf-card pf-cosmetics">
          <div className="pf-card-head">
            <h2>Equipped Cosmetics</h2>
            <Btn variant="ghost" className="pf-shop-link" onClick={() => toast("Visit the Shop to unlock more", "info")}>Shop</Btn>
          </div>
          <div className="pf-cos-list">
            {COSMETICS.map((co) => (
              <div key={co.id} className="pf-cos" style={{ ["--rc" as any]: RARITY_COLOR[co.rarity] }}>
                <div className="pf-cos-slot">{co.slot}</div>
                <div className="pf-cos-name">{co.name}</div>
                <span className="pf-cos-rarity">{co.rarity}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Edit profile modal (mock) */}
      {editing && (
        <div className="pf-modal-overlay" onClick={() => setEditing(false)}>
          <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pf-modal-head">
              <h2>Edit Profile</h2>
              <button className="pf-modal-close" onClick={() => setEditing(false)} aria-label="Close"><Icon name="Close" /></button>
            </div>
            <label className="pf-field">
              <span>Username</span>
              <input value={draftName} onChange={(e) => setDraftName(e.target.value)} maxLength={20} />
            </label>
            <label className="pf-field">
              <span>Title</span>
              <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} maxLength={28} />
            </label>
            <p className="pf-modal-note">Changes are mock-only in this preview — nothing is saved to a server.</p>
            <div className="pf-modal-actions">
              <Btn variant="ghost" onClick={() => setEditing(false)}>Cancel</Btn>
              <Btn onClick={saveEdit}>Save Changes</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
