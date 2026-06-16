import "./pages.css";
import "./clans.css";

type Member = { name: string; role: string; rating: number; contrib: number; };
type ClanRow = { rank: number; tag: string; name: string; members: number; points: number; you?: boolean; };

const MY_CLAN = {
  tag: "VOID",
  name: "Void Syndicate",
  rank: 7,
  members: 24,
  cap: 30,
  points: 48200,
  weekly: 3140,
};

const MEMBERS: Member[] = [
  { name: "NovaStrike", role: "Leader", rating: 3284, contrib: 8200 },
  { name: "Sable", role: "Officer", rating: 2742, contrib: 6100 },
  { name: "Echo7", role: "Officer", rating: 2601, contrib: 5400 },
  { name: "You", role: "Member", rating: 1840, contrib: 4200 },
  { name: "Mirage", role: "Member", rating: 2555, contrib: 3900 },
  { name: "Kestrel", role: "Member", rating: 2660, contrib: 3100 },
];

const TOP_CLANS: ClanRow[] = [
  { rank: 1, tag: "APEX", name: "Apex Predators", members: 30, points: 92400 },
  { rank: 2, tag: "RONIN", name: "Ronin Order", members: 29, points: 88100 },
  { rank: 3, tag: "LUME", name: "Lumen Collective", members: 30, points: 81700 },
  { rank: 7, tag: "VOID", name: "Void Syndicate", members: 24, points: 48200, you: true },
];

export default function Clans() {
  return (
    <div className={"page cl-page"}>
      <header className={"page-head"}>
        <div>
          <h1 className={"page-title"}>Clans</h1>
          <p className={"page-sub"}>Team up, climb the clan ladder, and split the spoils.</p>
        </div>
        <button className={"btn-grad"}>Create Clan</button>
      </header>

      <div className={"cl-banner"}>
        <div className={"cl-crest"}>{MY_CLAN.tag}</div>
        <div className={"cl-banner-info"}>
          <h2>{MY_CLAN.name} <span className={"cl-tag"}>[{MY_CLAN.tag}]</span></h2>
          <div className={"cl-banner-stats"}>
            <div><span className={"cl-k"}>Rank</span><span className={"cl-v"}>#{MY_CLAN.rank}</span></div>
            <div><span className={"cl-k"}>Members</span><span className={"cl-v"}>{MY_CLAN.members}/{MY_CLAN.cap}</span></div>
            <div><span className={"cl-k"}>Total Points</span><span className={"cl-v"}>{MY_CLAN.points.toLocaleString()}</span></div>
            <div><span className={"cl-k"}>This Week</span><span className={"cl-v cl-up"}>+{MY_CLAN.weekly.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      <div className={"cl-cols"}>
        <section className={"cl-card"}>
          <h3 className={"cl-h3"}>Roster</h3>
          <div className={"cl-roster"}>
            {MEMBERS.map((m) => (
              <div key={m.name} className={"cl-member " + (m.name === "You" ? "cl-you" : "")}>
                <span className={"cl-av"}>{m.name.slice(0,1)}</span>
                <span className={"cl-mname"}>{m.name}</span>
                <span className={"cl-role cl-role-" + m.role.toLowerCase()}>{m.role}</span>
                <span className={"cl-contrib"}>{m.contrib.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </section>

        <section className={"cl-card"}>
          <h3 className={"cl-h3"}>Clan Ladder</h3>
          <div className={"cl-ladder"}>
            {TOP_CLANS.map((c) => (
              <div key={c.tag} className={"cl-lrow " + (c.you ? "cl-you" : "")}>
                <span className={"cl-lrank"}>#{c.rank}</span>
                <span className={"cl-lcrest"}>{c.tag}</span>
                <span className={"cl-lname"}>{c.name}</span>
                <span className={"cl-lmem"}>{c.members} mbrs</span>
                <span className={"cl-lpts"}>{c.points.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
