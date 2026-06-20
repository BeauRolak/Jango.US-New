import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./play.css";
import "./playlobby.css";
import { Icon, type IconName } from "../components/Icon";
import {
  GlowCard,
  AnimatedButton,
  StatusPill,
  ActionModal,
  useFeedback,
} from "../components/Juice";

type GameStatus = "live" | "rebuilding" | "soon";
type Category = "all" | "board" | "arcade" | "sports" | "classic";

type Game = {
  name: string;
  slug: string;
  route: string;
  icon: IconName;
  desc: string;
  diff: "Easy" | "Medium" | "Advanced";
  status: GameStatus;
  category: Category;
  hue: number;
  entry: number;
  players: number;
  matches: number;
  bot: boolean;
};

const GAMES: Game[] = [
  { name: "Mini Golf", slug: "minigolf", route: "/games/minigolf", icon: "Target", desc: "Lowest strokes takes the pot.", diff: "Easy", status: "live", category: "sports", hue: 150, entry: 5, players: 214, matches: 38, bot: true },
  { name: "8-Ball Pool", slug: "eightball", route: "/games/eightball", icon: "Trophy", desc: "Sink it clean, run the table.", diff: "Medium", status: "live", category: "classic", hue: 30, entry: 10, players: 176, matches: 29, bot: true },
  { name: "Air Hockey", slug: "airhockey", route: "/games/airhockey", icon: "Bolt", desc: "Fast reflexes, faster goals.", diff: "Medium", status: "live", category: "arcade", hue: 190, entry: 10, players: 142, matches: 24, bot: true },
  { name: "Chess", slug: "chess", route: "/games/chess", icon: "Crown", desc: "Outthink your rival, move by move.", diff: "Advanced", status: "live", category: "board", hue: 265, entry: 25, players: 318, matches: 47, bot: true },
  { name: "Connect Four", slug: "connect4", route: "/games/connect4", icon: "Dice", desc: "Four in a row to win.", diff: "Easy", status: "live", category: "board", hue: 210, entry: 5, players: 98, matches: 17, bot: true },
  { name: "Rock Paper Scissors", slug: "rps", route: "/games/rps", icon: "Swords", desc: "Read your foe, call the throw.", diff: "Easy", status: "live", category: "classic", hue: 340, entry: 5, players: 64, matches: 11, bot: true },
  { name: "Dots & Boxes", slug: "dotsboxes", route: "/games/dotsboxes", icon: "List", desc: "Close the most boxes.", diff: "Medium", status: "live", category: "board", hue: 170, entry: 5, players: 52, matches: 9, bot: true },
  { name: "Bowling", slug: "bowling", route: "/games/bowling", icon: "Bolt", desc: "Strike for the high score.", diff: "Easy", status: "live", category: "sports", hue: 40, entry: 5, players: 73, matches: 12, bot: true },
  { name: "Cup King", slug: "cupking", route: "/games/cupking", icon: "Crown", desc: "Stack and sink to reign.", diff: "Medium", status: "rebuilding", category: "arcade", hue: 290, entry: 10, players: 0, matches: 0, bot: false },
  { name: "Stack Tower", slug: "stacktower", route: "/games/stacktower", icon: "Building", desc: "Stack clean, build high.", diff: "Easy", status: "live", category: "arcade", hue: 110, entry: 5, players: 61, matches: 10, bot: true },
  { name: "Block Blast", slug: "blockblast", route: "/games/blockblast", icon: "Building", desc: "Clear the stack under pressure.", diff: "Easy", status: "live", category: "arcade", hue: 95, entry: 5, players: 44, matches: 7, bot: true },
  { name: "Tron", slug: "tron", route: "/games/tron", icon: "Bolt", desc: "Do not crash the grid.", diff: "Advanced", status: "rebuilding", category: "arcade", hue: 185, entry: 10, players: 0, matches: 0, bot: false },
  { name: "Basketball", slug: "basketball", route: "/games/basketball", icon: "Target", desc: "Drain shots before the buzzer.", diff: "Medium", status: "soon", category: "sports", hue: 25, entry: 10, players: 0, matches: 0, bot: false },
  { name: "Football", slug: "football", route: "/games/football", icon: "Medal", desc: "Move the chains, take the win.", diff: "Medium", status: "soon", category: "sports", hue: 135, entry: 10, players: 0, matches: 0, bot: false },
  { name: "Racing", slug: "racing", route: "/games/racing", icon: "Bolt", desc: "Fastest lap claims the pot.", diff: "Medium", status: "soon", category: "arcade", hue: 355, entry: 10, players: 0, matches: 0, bot: false },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All games" },
  { id: "board", label: "Board" },
  { id: "arcade", label: "Arcade" },
  { id: "sports", label: "Sports" },
  { id: "classic", label: "Classic" },
];

const STATUS_FILTERS: { id: "all" | GameStatus; label: string }[] = [
  { id: "all", label: "Any status" },
  { id: "live", label: "Playable" },
  { id: "rebuilding", label: "Rebuilding" },
  { id: "soon", label: "Coming soon" },
];

const DIFFS: { id: "all" | Game["diff"]; label: string }[] = [
  { id: "all", label: "Any level" },
  { id: "Easy", label: "Easy" },
  { id: "Medium", label: "Medium" },
  { id: "Advanced", label: "Advanced" },
];

const RAKE = 0.03;
const STATUS_META: Record<GameStatus, { kind: "live" | "soon" | "off"; label: string }> = {
  live: { kind: "live", label: "Playable" },
  rebuilding: { kind: "soon", label: "Rebuilding" },
  soon: { kind: "off", label: "Coming soon" },
};

export default function Play() {
  const navigate = useNavigate();
  const { fire } = useFeedback();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | GameStatus>("all");
  const [diffFilter, setDiffFilter] = useState<"all" | Game["diff"]>("all");
  const [selected, setSelected] = useState<Game | null>(null);

  const liveCount = GAMES.filter((g) => g.status === "live").length;
  const totalPlayers = GAMES.reduce((n, g) => n + g.players, 0);
  const totalMatches = GAMES.reduce((n, g) => n + g.matches, 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter((g) => {
      if (category !== "all" && g.category !== category) return false;
      if (statusFilter !== "all" && g.status !== statusFilter) return false;
      if (diffFilter !== "all" && g.diff !== diffFilter) return false;
      if (q && !(g.name.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [query, category, statusFilter, diffFilter]);

  function openGame(g: Game, e?: React.MouseEvent<HTMLElement>) {
    if (g.status !== "live") {
      const msg = g.status === "rebuilding" ? g.name + " is being rebuilt" : g.name + " is coming soon";
      fire("error", msg, e?.currentTarget ?? null);
      return;
    }
    fire("tap", undefined, e?.currentTarget ?? null);
    setSelected(g);
  }

  function confirmEntry(e?: React.MouseEvent<HTMLButtonElement>) {
    const g = selected;
    if (!g) return;
    setSelected(null);
    fire("tournament_join", "Entering " + g.name + " — good luck", e?.currentTarget ?? null);
    navigate(g.route);
  }

  function botMatch(g: Game, e?: React.MouseEvent<HTMLButtonElement>) {
    if (!g.bot) return;
    fire("tap", "Loading bot match — " + g.name, e?.currentTarget ?? null);
    navigate(g.route + "?mode=bot");
  }

  const pot = selected ? selected.entry * 2 : 0;
  const rake = Math.round(pot * RAKE);
  const payout = pot - rake;

  return (
    <div className="plobby">

      {/* ===== HERO ===== */}
      <section className="plobby-hero">
        <div className="plobby-hero__glow" aria-hidden="true" />
        <div className="plobby-hero__inner">
          <span className="plobby-hero__eyebrow"><Icon name="Gamepad" /> The arena floor</span>
          <h1 className="plobby-hero__title">Choose Your <span className="grad">Arena</span></h1>
          <p className="plobby-hero__sub">
            Pick a skill game, enter with Scalps, and compete head-to-head. Skill-based matches, a flat 3% platform rake, and your winner payout shown before every entry.
          </p>
          <div className="plobby-hero__pills">
            <span className="plobby-pill"><Icon name="Users" /> <b>{totalPlayers.toLocaleString()}</b> players online</span>
            <span className="plobby-pill"><Icon name="Swords" /> <b>{totalMatches}</b> active matches</span>
            <span className="plobby-pill"><Icon name="Trophy" /> <b>{liveCount}</b> live games</span>
          </div>
          <div className="plobby-hero__cta">
            <AnimatedButton variant="grad" icon="Bolt" fbKind="tap" onClick={() => openGame(GAMES[3])}>
              Quick Match
            </AnimatedButton>
            <AnimatedButton variant="ghost" icon="Trophy" fbKind="tap" onClick={() => navigate("/tournaments")}>
              Tournaments
            </AnimatedButton>
          </div>
        </div>
      </section>

      {/* ===== SEARCH + FILTERS ===== */}
      <section className="plobby-controls">
        <div className="plobby-search">
          <Icon name="Search" />
          <input
            type="text"
            placeholder="Search games"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search games"
          />
          {query && (
            <button className="plobby-search__clear" onClick={() => setQuery("")} aria-label="Clear search">
              <Icon name="Close" />
            </button>
          )}
        </div>
        <div className="plobby-chips">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={"plobby-chip" + (category === c.id ? " is-active" : "")}
              onClick={() => { setCategory(c.id); fire("tap"); }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section className="plobby-subfilters">
        <div className="plobby-selectwrap">
          <label>Status</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as "all" | GameStatus); fire("tap"); }}>
            {STATUS_FILTERS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="plobby-selectwrap">
          <label>Difficulty</label>
          <select value={diffFilter} onChange={(e) => { setDiffFilter(e.target.value as "all" | Game["diff"]); fire("tap"); }}>
            {DIFFS.map((dd) => <option key={dd.id} value={dd.id}>{dd.label}</option>)}
          </select>
        </div>
        <span className="plobby-count">{filtered.length} game{filtered.length === 1 ? "" : "s"}</span>
      </section>

      {/* ===== GAME GRID ===== */}
      <section className="plobby-grid">
        {filtered.map((g) => {
          const meta = STATUS_META[g.status];
          const locked = g.status !== "live";
          return (
            <GlowCard
              key={g.slug}
              tone="primary"
              hoverable={!locked}
              className={"game-card" + (locked ? " is-locked" : "")}
              style={{ "--hue": String(g.hue) } as React.CSSProperties}
            >
              <div className="game-card__art" aria-hidden="true">
                <span className="game-card__shine" />
                <Icon name={g.icon} />
              </div>

              <div className="game-card__head">
                <span className="game-card__name">{g.name}</span>
                <StatusPill kind={meta.kind} label={meta.label} />
              </div>

              <p className="game-card__desc">{g.desc}</p>

              <div className="game-card__meta">
                <span className={"chip chip--" + g.diff.toLowerCase()}>{g.diff}</span>
                {!locked ? (
                  <>
                    <span className="game-card__stat"><Icon name="Users" /> {g.players}</span>
                    <span className="game-card__stat"><Icon name="Swords" /> {g.matches}</span>
                  </>
                ) : (
                  <span className="game-card__stat game-card__stat--muted"><Icon name="Lock" /> {g.status === "rebuilding" ? "Rebuilding" : "Soon"}</span>
                )}
              </div>

              <div className="game-card__entry">
                <Icon name="Coins" /> Entry <b>Ⓢ {g.entry}</b>
              </div>

              {locked ? (
                <div className="game-card__cta">
                  <button className="game-card__btn game-card__btn--locked" onClick={() => openGame(g)}>
                    <Icon name="Lock" /> {g.status === "rebuilding" ? "Rebuilding" : "Coming soon"}
                  </button>
                </div>
              ) : (
                <div className="game-card__cta">
                  <AnimatedButton variant="grad" icon="Play" fbKind="tap" className="game-card__play" onClick={() => openGame(g)}>
                    Play
                  </AnimatedButton>
                  {g.bot && (
                    <AnimatedButton variant="ghost" icon="Target" fbKind="tap" className="game-card__bot" onClick={() => botMatch(g)}>
                      Bot
                    </AnimatedButton>
                  )}
                </div>
              )}
            </GlowCard>
          );
        })}

        {filtered.length === 0 && (
          <div className="plobby-empty">
            <Icon name="Search" />
            <span>No games match your filters.</span>
            <button onClick={() => { setQuery(""); setCategory("all"); setStatusFilter("all"); setDiffFilter("all"); fire("tap"); }}>
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* ===== MATCH ENTRY MODAL ===== */}
      <ActionModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? "Enter " + selected.name : "Enter match"}
      >
        {selected && (
          <div className="plobby-modal">
            <div className="plobby-modal__game" style={{ "--hue": String(selected.hue) } as React.CSSProperties}>
              <span className="plobby-modal__art"><Icon name={selected.icon} /></span>
              <div>
                <span className="plobby-modal__name">{selected.name}</span>
                <span className={"chip chip--" + selected.diff.toLowerCase()}>{selected.diff}</span>
              </div>
            </div>

            <div className="plobby-modal__rows">
              <div className="plobby-modal__row">
                <span>Entry fee</span>
                <b>Ⓢ {selected.entry}</b>
              </div>
              <div className="plobby-modal__row">
                <span>Total pot (2 players)</span>
                <b>Ⓢ {pot}</b>
              </div>
              <div className="plobby-modal__row">
                <span>Platform rake (3%)</span>
                <b className="dash-v--dim">Ⓢ {rake}</b>
              </div>
              <div className="plobby-modal__row plobby-modal__row--top">
                <span>Winner payout</span>
                <b className="dash-v--gold">Ⓢ {payout}</b>
              </div>
            </div>

            <p className="plobby-modal__note">
              <Icon name="Lock" /> Mock entry — no Scalps are charged and no real money moves yet.
            </p>

            <div className="plobby-modal__cta">
              <AnimatedButton variant="ghost" icon="Close" fbKind="tap" onClick={() => setSelected(null)}>
                Cancel
              </AnimatedButton>
              <AnimatedButton variant="grad" icon="Play" fbKind="success" onClick={confirmEntry}>
                Play for Ⓢ {selected.entry}
              </AnimatedButton>
            </div>
          </div>
        )}
      </ActionModal>

    </div>
  );
}
