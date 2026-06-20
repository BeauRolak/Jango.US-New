import { useState, useMemo } from "react";
import { Icon } from "../components/Icon";
import {
  PageHero, GlowCard, AnimatedButton, StatusPill,
  ProgressGlow, ActionModal, useFeedback,
} from "../components/Juice";
import "./tarena.css";

type TStatus = "live" | "registering" | "upcoming" | "completed";

type Tourney = {
  id: string;
  name: string;
  game: string;
  status: TStatus;
  pot: number;
  buyIn: number;
  format: string;
  starts: string;
  players: number;
  cap: number;
  hue: number;
  winner?: string;
};

const TOURNEYS: Tourney[] = [
  { id: "t1", name: "Sunday Showdown", game: "8-Ball Pool", status: "live", pot: 850, buyIn: 10, format: "Single Elim", starts: "Live now", players: 96, cap: 128, hue: 268 },
  { id: "t2", name: "Mini Golf Masters", game: "Mini Golf", status: "registering", pot: 420, buyIn: 5, format: "Best of 3", starts: "in 18m", players: 58, cap: 64, hue: 150 },
  { id: "t3", name: "Grandmaster Gambit", game: "Chess", status: "registering", pot: 1600, buyIn: 25, format: "Swiss", starts: "in 42m", players: 41, cap: 64, hue: 210 },
  { id: "t4", name: "Friday Night Faceoff", game: "Air Hockey", status: "upcoming", pot: 600, buyIn: 8, format: "Double Elim", starts: "Tomorrow 8PM", players: 12, cap: 96, hue: 22 },
  { id: "t5", name: "Connect Four Clash", game: "Connect Four", status: "upcoming", pot: 240, buyIn: 3, format: "Single Elim", starts: "Sat 2PM", players: 5, cap: 32, hue: 48 },
  { id: "t6", name: "High Roller Invitational", game: "8-Ball Pool", status: "upcoming", pot: 5200, buyIn: 85, format: "Single Elim", starts: "Sun 6PM", players: 18, cap: 64, hue: 320 },
  { id: "t7", name: "Rookie Rumble", game: "Mini Golf", status: "completed", pot: 300, buyIn: 5, format: "Single Elim", starts: "Last week", players: 64, cap: 64, hue: 150, winner: "ShadowAce" },
];

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "registering", label: "Registering" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

const STATUS_PILL: Record<TStatus, { label: string; kind: "live" | "soon" | "off" | "accent"; live?: boolean }> = {
  live: { label: "Live", kind: "live", live: true },
  registering: { label: "Registering", kind: "accent" },
  upcoming: { label: "Upcoming", kind: "soon" },
  completed: { label: "Completed", kind: "off" },
};

const fmt = (n: number) => n.toLocaleString("en-US");

const SAMPLE_BRACKET = [
  { round: "Quarterfinals", matches: [["NovaKing", "ZeroByte"], ["AceHigh", "PixelPro"], ["MintRush", "VoltEdge"], ["SkyForge", "RuneWolf"]] },
  { round: "Semifinals", matches: [["NovaKing", "AceHigh"], ["VoltEdge", "SkyForge"]] },
  { round: "Final", matches: [["NovaKing", "SkyForge"]] },
];

export default function Tournaments() {
  const { fire } = useFeedback();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [joinT, setJoinT] = useState<Tourney | null>(null);
  const [bracketT, setBracketT] = useState<Tourney | null>(null);
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  const totalPool = useMemo(() => TOURNEYS.reduce((s, t) => s + t.pot, 0), []);
  const liveCount = useMemo(() => TOURNEYS.filter((t) => t.status === "live").length, []);
  const openCount = useMemo(() => TOURNEYS.filter((t) => t.status === "registering").length, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOURNEYS.filter((t) => {
      const okF = filter === "all" || t.status === filter;
      const okQ = !q || t.name.toLowerCase().includes(q) || t.game.toLowerCase().includes(q);
      return okF && okQ;
    });
  }, [filter, query]);

  const rakeOf = (pot: number) => Math.round(pot * 0.03);
  const payoutOf = (pot: number) => pot - rakeOf(pot);

  const openJoin = (t: Tourney) => { fire("tap", "", null); setJoinT(t); };
  const openBracket = (t: Tourney) => { fire("tap", "", null); setBracketT(t); };
  const confirmJoin = () => {
    if (!joinT) return;
    setJoined((j) => ({ ...j, [joinT.id]: true }));
    fire("tournament_join", "Entry confirmed — good luck!", null);
    setJoinT(null);
  };

  return (
    <div className="tarena-page">
      <PageHero
        eyebrow="Competitive Events"
        title="Enter the"
        gradWord="Arena"
        sub="Bracketed skill events with real stakes in Scalps. 3% platform rake — winner payout shown before you enter."
      />

      <div className="tarena-stats">
        <div className="tarena-stat">
          <div className="tarena-stat-v"><span className="tarena-stat-ico"><Icon name="Coins" width={20} height={20} /></span>Ⓢ {fmt(totalPool)}</div>
          <div className="tarena-stat-l">Total Prize Pools</div>
        </div>
        <div className="tarena-stat">
          <div className="tarena-stat-v"><span className="tarena-stat-ico"><Icon name="Flame" width={20} height={20} /></span>{liveCount}</div>
          <div className="tarena-stat-l">Live Now</div>
        </div>
        <div className="tarena-stat">
          <div className="tarena-stat-v"><span className="tarena-stat-ico"><Icon name="Users" width={20} height={20} /></span>{openCount}</div>
          <div className="tarena-stat-l">Open To Register</div>
        </div>
      </div>

      <div className="tarena-controls">
        <div className="tarena-search">
          <span className="tarena-search-ico"><Icon name="Search" width={17} height={17} /></span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tournaments or games..."
            aria-label="Search tournaments"
          />
        </div>
        <div className="tarena-chips">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={"tarena-chip" + (filter === f.key ? " on" : "")}
              onClick={(e) => { setFilter(f.key); fire("tap", "", e.currentTarget); }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tarena-grid">
        {shown.map((t) => {
          const pill = STATUS_PILL[t.status];
          const isJoined = joined[t.id];
          const pct = Math.min(100, Math.round((t.players / t.cap) * 100));
          return (
            <GlowCard key={t.id} tone="primary" className="tarena-card" style={{ ["--ta-h" as any]: `hsl(${t.hue} 80% 62%)` }}>
              <div className="tarena-accent" style={{ background: `linear-gradient(90deg, hsl(${t.hue} 80% 62%), transparent)` }} />
              <div className="tarena-card-in">
                <div className="tarena-top">
                  <StatusPill label={pill.label} kind={pill.kind} live={pill.live} />
                  <span className="tarena-game"><Icon name="Gamepad" width={14} height={14} /> {t.game}</span>
                </div>
                <div className="tarena-name">{t.name}</div>
                <div className="tarena-pool">
                  <span className="tarena-pool-num">Ⓢ {fmt(t.pot)}</span>
                  <span className="tarena-pool-l">prize pool</span>
                </div>
                <div className="tarena-meta">
                  <div><div className="tarena-meta-l">Entry</div><div className="tarena-meta-v">Ⓢ {t.buyIn}</div></div>
                  <div><div className="tarena-meta-l">Format</div><div className="tarena-meta-v">{t.format}</div></div>
                  <div><div className="tarena-meta-l">Starts</div><div className="tarena-meta-v">{t.starts}</div></div>
                </div>
                {t.status === "completed" && t.winner ? (
                  <div className="tarena-champ">
                    <span className="tarena-champ-ico"><Icon name="Trophy" width={22} height={22} /></span>
                    <div>
                      <div className="tarena-champ-l">Champion</div>
                      <div className="tarena-champ-n">{t.winner}</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="tarena-fill"><ProgressGlow value={pct} tone="primary" /></div>
                    <div className="tarena-players">{t.players}/{t.cap} players</div>
                  </>
                )}
                <div className="tarena-actions">
                  <AnimatedButton variant="ghost" fbKind="tap" className="tarena-bracket" icon="Chart" onClick={() => openBracket(t)}>
                    Bracket
                  </AnimatedButton>
                  {t.status === "completed" ? (
                    <button className="tarena-cta tarena-fin" disabled>Finished</button>
                  ) : isJoined ? (
                    <AnimatedButton variant="grad" fbKind="success" className="tarena-cta" icon="Check" onClick={() => openBracket(t)}>
                      Entered
                    </AnimatedButton>
                  ) : t.status === "live" ? (
                    <AnimatedButton variant="grad" fbKind="tap" className="tarena-cta" icon="Play" onClick={() => openJoin(t)}>
                      Watch &amp; Join
                    </AnimatedButton>
                  ) : (
                    <AnimatedButton variant="grad" fbKind="reward" className="tarena-cta" icon="Swords" onClick={() => openJoin(t)}>
                      Register
                    </AnimatedButton>
                  )}
                </div>
              </div>
            </GlowCard>
          );
        })}
      </div>

      <ActionModal
        open={!!joinT}
        onClose={() => setJoinT(null)}
        title={joinT ? joinT.name : ""}
        footer={
          joinT ? (
            <>
              <AnimatedButton variant="ghost" fbKind="tap" onClick={() => setJoinT(null)}>Cancel</AnimatedButton>
              <AnimatedButton variant="grad" fbKind="reward" pulse onClick={() => confirmJoin()}>
                Confirm Entry &middot; Ⓢ {joinT.buyIn}
              </AnimatedButton>
            </>
          ) : null
        }
      >
        {joinT && (
          <div>
            <div className="tarena-m-head">
              <div className="tarena-m-game">{joinT.game} &middot; {joinT.format}</div>
            </div>
            <div className="tarena-m-stats">
              <div className="tarena-m-stat"><div className="tarena-m-stat-l">Entry Fee</div><div className="tarena-m-stat-v">Ⓢ {joinT.buyIn}</div></div>
              <div className="tarena-m-stat"><div className="tarena-m-stat-l">Prize Pool</div><div className="tarena-m-stat-v">Ⓢ {fmt(joinT.pot)}</div></div>
              <div className="tarena-m-stat"><div className="tarena-m-stat-l">Field</div><div className="tarena-m-stat-v">{joinT.players}/{joinT.cap}</div></div>
            </div>
            <div className="tarena-break">
              <div className="tarena-break-h">Prize Breakdown</div>
              <div className="tarena-break-row"><span>Total prize pool</span><span className="v">Ⓢ {fmt(joinT.pot)}</span></div>
              <div className="tarena-break-row rake"><span>Jango rake (3%)</span><span className="v">- Ⓢ {fmt(rakeOf(joinT.pot))}</span></div>
              <div className="tarena-break-row win"><span>Winner takes</span><span className="v">Ⓢ {fmt(payoutOf(joinT.pot))}</span></div>
            </div>
            <div className="tarena-note">
              <span className="tarena-note-ico"><Icon name="Info" width={16} height={16} /></span>
              <span>Entry is mock Scalps — no real money moves and no Scalps are charged. Payouts are simulated for this preview build.</span>
            </div>
          </div>
        )}
      </ActionModal>

      <ActionModal
        open={!!bracketT}
        onClose={() => setBracketT(null)}
        title={bracketT ? bracketT.name + " — Bracket" : ""}
        footer={<AnimatedButton variant="grad" fbKind="tap" onClick={() => setBracketT(null)}>Close</AnimatedButton>}
      >
        {bracketT && (
          <div className="tarena-bk">
            {SAMPLE_BRACKET.map((r, ri) => (
              <div className="tarena-bk-round" key={ri}>
                <div className="tarena-bk-rl">{r.round}</div>
                {r.matches.map((m, mi) => (
                  <div className="tarena-bk-match" key={mi}>
                    <div className={"tarena-bk-seed" + (mi === 0 ? " w" : "")}><span>{m[0]}</span><span className="s">{ri + 1}</span></div>
                    <div className="tarena-bk-seed"><span>{m[1]}</span><span className="s">{ri + 5}</span></div>
                  </div>
                ))}
              </div>
            ))}
            <div className="tarena-bk-champ">
              <Icon name="Trophy" width={30} height={30} />
              <div className="tarena-bk-rl">Champion</div>
              <div className="tarena-champ-n">NovaKing</div>
            </div>
          </div>
        )}
      </ActionModal>
    </div>
  );
}
