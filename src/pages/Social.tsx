import { useState } from "react";
import "./pages.css";
import "./social.css";

type Tab = "feed" | "messages" | "friends";

const FEED = [
  { user: "JangoPlatform", auto: true, tag: "Win", time: "2m", text: "Beau won a Block Blast match (400-0) and earned 12 Scalps!", likes: 24, comments: 3 },
  { user: "JangoPlatform", auto: true, tag: "Achievement", time: "11m", text: "Nova reached Gold III in 8-Ball Pool. The ladder climb continues.", likes: 41, comments: 7 },
  { user: "JangoPlatform", auto: true, tag: "Challenge", time: "26m", text: "Ghost is on a 9-game Chess hot streak. Who is brave enough to break it?", likes: 58, comments: 14 },
  { user: "JangoPlatform", auto: true, tag: "Clan", time: "1h", text: "Clan Apex just overtook Void Syndicate for the #1 weekly leaderboard spot.", likes: 33, comments: 5 },
];

const CHANNELS = [
  { group: "GLOBAL", items: ["General", "Lobby", "Strategy", "Bets", "Wins", "Off Topic"] },
  { group: "GAME ROOMS", items: ["Chess", "8-Ball Pool", "Air Hockey", "Mini Golf"] },
];

const CHAT = [
  { user: "Nova", time: "10:02", text: "anyone up for ranked chess? need to grind to gold" },
  { user: "Ghost", time: "10:03", text: "ill take you. 1 scalp locked, lets go" },
  { user: "Apex", time: "10:05", text: "gl hf. winner posts the replay in #wins" },
];

const TAGS = ["General", "Win", "Challenge", "Achievement", "Clan"];

export default function Social() {
  const [tab, setTab] = useState<Tab>("feed");
  const [channel, setChannel] = useState("General");
  const [tag, setTag] = useState("General");

  return (
    <div className={"social-page"}>
      <header className={"social-head"}>
        <h1>Community Hub</h1>
        <p>Feed, Messages & Friends · connect with the Jango community.</p>
      </header>

      <div className={"social-tabs"}>
        {(["feed", "messages", "friends"] as Tab[]).map((t) => (
          <button key={t} className={"social-tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "feed" && (
        <div className={"feed-wrap"}>
          <div className={"feed-trending"}>
            <span className={"eyebrow"}>TRENDING</span>
            <span className={"trend-text"}>Ghost is on a 9-game win streak · Clan Apex took #1 this week</span>
          </div>
          <div className={"composer"}>
            <div className={"composer-row"}>
              <div className={"avatar-sm"}>B</div>
              <input className={"composer-input"} placeholder={"What is on your mind, player?"} />
            </div>
            <div className={"composer-foot"}>
              <div className={"tag-row"}>
                {TAGS.map((t) => (
                  <button key={t} className={"tag-chip " + (tag === t ? "active" : "")} onClick={() => setTag(t)}>{t}</button>
                ))}
              </div>
              <button className={"btn-grad"}>Post</button>
            </div>
          </div>
          <div className={"feed-list"}>
            {FEED.map((p, i) => (
              <div key={i} className={"post"}>
                <div className={"post-head"}>
                  <div className={"avatar-sm auto"}>J</div>
                  <div className={"post-meta"}>
                    <span className={"post-user"}>{p.user}{p.auto && <span className={"auto-pill"}>AUTO</span>}</span>
                    <span className={"post-sub"}>{p.tag} · {p.time}</span>
                  </div>
                </div>
                <p className={"post-text"}>{p.text}</p>
                <div className={"post-actions"}>
                  <button>Like {p.likes}</button>
                  <button>Comment {p.comments}</button>
                  <button>Challenge</button>
                  <button>Share</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "messages" && (
        <div className={"msg-wrap"}>
          <aside className={"msg-channels"}>
            {CHANNELS.map((g) => (
              <div key={g.group} className={"chan-group"}>
                <span className={"eyebrow"}>{g.group}</span>
                {g.items.map((c) => (
                  <button key={c} className={"chan " + (channel === c ? "active" : "")} onClick={() => setChannel(c)}># {c}</button>
                ))}
              </div>
            ))}
            <div className={"chan-group"}>
              <span className={"eyebrow"}>DIRECT MESSAGES</span>
              <div className={"empty-mini"}>No conversations yet</div>
            </div>
          </aside>
          <section className={"msg-main"}>
            <div className={"msg-header"}># {channel}</div>
            <div className={"msg-thread"}>
              {CHAT.map((m, i) => (
                <div key={i} className={"msg-line"}>
                  <span className={"msg-user"}>{m.user}</span>
                  <span className={"msg-time"}>{m.time}</span>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
            <div className={"msg-composer"}>
              <input placeholder={"Message #" + channel} />
              <button className={"btn-grad"}>Send</button>
            </div>
          </section>
          <aside className={"msg-friends"}>
            <span className={"eyebrow"}>FRIENDS</span>
            <div className={"empty-mini"}>No friends yet</div>
          </aside>
        </div>
      )}

      {tab === "friends" && (
        <div className={"friends-empty"}>
          <div className={"friends-icon"}>👥</div>
          <h2>Build your squad</h2>
          <p>Add friends, challenge players, and track rivals. Search by username to get started.</p>
          <button className={"btn-grad"}>Find Players</button>
        </div>
      )}
    </div>
  );
}
