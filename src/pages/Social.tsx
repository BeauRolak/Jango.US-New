import { useState } from "react";
import { Btn, toast } from "../components/UI";
import "./social.css";

type Tab = "feed" | "messages" | "friends";
type Presence = "online" | "in-game" | "offline";

interface Friend {
  id: string;
  name: string;
  rank: string;
  presence: Presence;
  last: string;
}

interface ChatMsg { from: "me" | "them"; text: string; time: string; }

interface Thread {
  id: string;
  name: string;
  presence: Presence;
  preview: string;
  time: string;
  unread: number;
  messages: ChatMsg[];
}

interface Post {
  id: string;
  author: string;
  kind: string;
  time: string;
  body: string;
  likes: number;
  comments: number;
}

const FEED: Post[] = [
  { id: "p1", author: "JangoPlatform", kind: "Win", time: "2m", body: "Beau won a Block Blast match (400-0) and earned 12 Scaps!", likes: 24, comments: 3 },
  { id: "p2", author: "JangoPlatform", kind: "Achievement", time: "11m", body: "Nova reached Gold III in 8-Ball Pool. The ladder climb continues.", likes: 41, comments: 7 },
  { id: "p3", author: "JangoPlatform", kind: "Challenge", time: "26m", body: "ShadowAce called out the lobby for a Mini Golf showdown. Who answers?", likes: 18, comments: 12 },
];

const FRIENDS: Friend[] = [
  { id: "f1", name: "Nova", rank: "Gold III", presence: "online", last: "Active now" },
  { id: "f2", name: "ShadowAce", rank: "Platinum I", presence: "in-game", last: "In a Mini Golf match" },
  { id: "f3", name: "Ghost", rank: "Diamond II", presence: "online", last: "Active now" },
  { id: "f4", name: "Rook", rank: "Silver II", presence: "offline", last: "Last seen 3h ago" },
  { id: "f5", name: "Blaze", rank: "Gold I", presence: "offline", last: "Last seen yesterday" },
];

const INITIAL_THREADS: Thread[] = [
  {
    id: "t1", name: "Nova", presence: "online", preview: "gg, rematch tomorrow?", time: "1m", unread: 2,
    messages: [
      { from: "them", text: "That last putt was unreal", time: "9:31" },
      { from: "me", text: "haha got lucky on the bank", time: "9:32" },
      { from: "them", text: "gg, rematch tomorrow?", time: "9:33" },
    ],
  },
  {
    id: "t2", name: "ShadowAce", presence: "in-game", preview: "You: I'll be online at 8", time: "1h", unread: 0,
    messages: [
      { from: "them", text: "Tournament bracket drops tonight", time: "8:02" },
      { from: "me", text: "I'll be online at 8", time: "8:05" },
    ],
  },
  {
    id: "t3", name: "Ghost", presence: "offline", preview: "nice clutch", time: "yesterday", unread: 0,
    messages: [
      { from: "me", text: "did you see that comeback", time: "21:10" },
      { from: "them", text: "nice clutch", time: "21:14" },
    ],
  },
];

const PRESENCE_LABEL: Record<Presence, string> = {
  online: "Online",
  "in-game": "In a match",
  offline: "Offline",
};

export default function Social() {
  const [tab, setTab] = useState<Tab>("feed");
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [postText, setPostText] = useState("");
  const [search, setSearch] = useState("");
  const [invited, setInvited] = useState<Record<string, boolean>>({});

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);
  const onlineCount = FRIENDS.filter((f) => f.presence !== "offline").length;
  const current = threads.find((t) => t.id === activeThread) || null;

  function openThread(id: string) {
    setActiveThread(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  }

  function sendMessage() {
    if (!draft.trim() || !current) return;
    const text = draft.trim();
    setThreads((prev) =>
      prev.map((t) =>
        t.id === current.id
          ? { ...t, preview: "You: " + text, time: "now", messages: [...t.messages, { from: "me", text, time: "now" }] }
          : t
      )
    );
    setDraft("");
    toast("Message sent to " + current.name, "success");
  }

  function invite(name: string, id: string) {
    setInvited((prev) => ({ ...prev, [id]: true }));
    toast(`Match invite sent to ${name}`, "reward");
  }

  function submitPost() {
    if (!postText.trim()) {
      toast("Write something first", "error");
      return;
    }
    toast("Posted to the community feed", "success");
    setPostText("");
  }

  const filteredFriends = FRIENDS.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="social-page">
      <header className="so-hero">
        <h1 className="so-title">Community Hub</h1>
        <p className="so-sub">Feed, Messages & Friends · connect with the Jango community.</p>
      </header>

      <nav className="so-tabs" role="tablist">
        <button className={"so-tab" + (tab === "feed" ? " active" : "")} onClick={() => setTab("feed")}>
          Feed
        </button>
        <button className={"so-tab" + (tab === "messages" ? " active" : "")} onClick={() => setTab("messages")}>
          Messages
          {totalUnread > 0 && <span className="so-badge">{totalUnread}</span>}
        </button>
        <button className={"so-tab" + (tab === "friends" ? " active" : "")} onClick={() => setTab("friends")}>
          Friends
          <span className="so-tab-count">{onlineCount}</span>
        </button>
      </nav>

      {tab === "feed" && (
        <section className="so-feed">
          <div className="so-trending">
            <span className="so-trending-tag">TRENDING</span>
            <span>Ghost is on a 9-game win streak · Clan Apex took #1 this week</span>
          </div>

          <div className="so-composer">
            <div className="so-avatar so-av-me">B</div>
            <input
              className="so-composer-input"
              placeholder="What is on your mind, player?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            <Btn className="so-post-btn" onClick={submitPost}>Post</Btn>
          </div>

          {FEED.map((p) => (
            <article key={p.id} className="so-post">
              <div className="so-post-head">
                <div className="so-avatar so-av-platform">J</div>
                <div className="so-post-meta">
                  <span className="so-post-author">{p.author}<span className="so-auto">AUTO</span></span>
                  <span className="so-post-sub">{p.kind} · {p.time}</span>
                </div>
              </div>
              <p className="so-post-body">{p.body}</p>
              <div className="so-post-actions">
                <button onClick={() => toast("Liked", "info")}>Like {p.likes}</button>
                <button onClick={() => toast("Comments coming soon", "info")}>Comment {p.comments}</button>
                <button onClick={() => toast("Challenge sent", "reward")}>⚔️ Challenge</button>
                <button onClick={() => toast("Shared to your profile", "success")}>Share</button>
              </div>
            </article>
          ))}
        </section>
      )}

      {tab === "messages" && (
        <section className={"so-messages" + (current ? " has-active" : "")}>
          <div className="so-thread-list">
            <div className="so-thread-list-head">
              <span>Conversations</span>
              {totalUnread > 0 && <span className="so-badge">{totalUnread} new</span>}
            </div>
            {threads.map((t) => (
              <button
                key={t.id}
                className={"so-thread" + (t.id === activeThread ? " active" : "")}
                onClick={() => openThread(t.id)}
              >
                <div className={"so-avatar so-presence-" + t.presence}>{t.name[0]}</div>
                <div className="so-thread-meta">
                  <div className="so-thread-top">
                    <span className="so-thread-name">{t.name}</span>
                    <span className="so-thread-time">{t.time}</span>
                  </div>
                  <div className="so-thread-bottom">
                    <span className="so-thread-preview">{t.preview}</span>
                    {t.unread > 0 && <span className="so-badge sm">{t.unread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="so-chat">
            {!current ? (
              <div className="so-chat-empty">
                <span className="so-chat-empty-icon">💬</span>
                <p>Select a conversation to start messaging.</p>
              </div>
            ) : (
              <>
                <div className="so-chat-head">
                  <button className="so-chat-back" onClick={() => setActiveThread(null)} aria-label="Back to conversations">
                    ←
                  </button>
                  <div className={"so-avatar so-presence-" + current.presence}>{current.name[0]}</div>
                  <div className="so-chat-head-meta">
                    <span className="so-chat-head-name">{current.name}</span>
                    <span className={"so-chat-head-status pr-" + current.presence}>{PRESENCE_LABEL[current.presence]}</span>
                  </div>
                  <Btn
                    variant="ghost"
                    className="so-chat-invite"
                    onClick={() => toast("Match invite sent to " + current.name, "reward")}
                  >
                    ⚔️ Invite
                  </Btn>
                </div>

                <div className="so-chat-body">
                  {current.messages.map((m, i) => (
                    <div key={i} className={"so-bubble " + (m.from === "me" ? "me" : "them")}>
                      <span className="so-bubble-text">{m.text}</span>
                      <span className="so-bubble-time">{m.time}</span>
                    </div>
                  ))}
                </div>

                <div className="so-chat-input">
                  <input
                    className="so-chat-field"
                    placeholder={"Message " + current.name + "..."}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                  />
                  <button className="so-chat-send" onClick={sendMessage} aria-label="Send message">➤</button>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {tab === "friends" && (
        <section className="so-friends">
          <div className="so-search">
            <span className="so-search-icon">🔍</span>
            <input
              className="so-search-input"
              placeholder="Search players by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="so-friends-summary">
            <span className="so-online-dot" /> {onlineCount} of {FRIENDS.length} friends online
          </div>

          {filteredFriends.length === 0 ? (
            <div className="so-empty">
              <span className="so-empty-icon">👥</span>
              <p>No players match "{search}".</p>
              <Btn variant="ghost" onClick={() => setSearch("")}>Clear search</Btn>
            </div>
          ) : (
            <div className="so-friend-list">
              {filteredFriends.map((f) => (
                <div key={f.id} className="so-friend">
                  <div className={"so-avatar so-presence-" + f.presence}>{f.name[0]}</div>
                  <div className="so-friend-meta">
                    <span className="so-friend-name">{f.name}</span>
                    <span className="so-friend-sub">{f.rank} · {f.last}</span>
                  </div>
                  <div className="so-friend-actions">
                    <Btn
                      variant="ghost"
                      className="so-friend-msg"
                      onClick={() => { setTab("messages"); const th = threads.find((t) => t.name === f.name); if (th) openThread(th.id); else toast("Start a new chat with " + f.name, "info"); }}
                    >
                      Message
                    </Btn>
                    {invited[f.id] ? (
                      <span className="so-invited">✓ Invited</span>
                    ) : (
                      <Btn
                        className="so-friend-invite"
                        disabled={f.presence === "offline"}
                        onClick={() => invite(f.name, f.id)}
                      >
                        ⚔️ Invite
                      </Btn>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
