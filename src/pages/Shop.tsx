import { useState } from "react";
import "./pages.css";

type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

interface Item {
  id: string;
  name: string;
  type: string;
  rarity: Rarity;
  price: number;
  icon: string;
  desc: string;
  featured?: boolean;
}

const TABS = [
  "Featured", "Daily Deals", "Frames", "Badges", "Boards", "Emotes",
  "Themes", "Victory", "Banners", "Trails", "Dice", "Cards", "My Items",
];

const RARITY_PRICE: Record<Rarity, string> = {
  common: "Free – 3",
  uncommon: "6",
  rare: "15",
  epic: "35",
  legendary: "85",
};

const ITEMS: Item[] = [
  { id: "inferno", name: "Inferno Avatar Frame", type: "Avatar Frame", rarity: "legendary", price: 25, icon: "🔥", desc: "Animated flame border that engulfs your avatar in living fire.", featured: true },
  { id: "galaxy", name: "Galaxy Avatar", type: "Avatar Frame", rarity: "legendary", price: 85, icon: "🌌", desc: "A swirling cosmos of stars orbits your portrait." },
  { id: "crown", name: "Champions Crown", type: "Badge", rarity: "legendary", price: 85, icon: "👑", desc: "Worn only by those who reached the top of the ladder." },
  { id: "goldshower", name: "Gold Shower", type: "Victory Effect", rarity: "epic", price: 35, icon: "💰", desc: "Rain golden coins across the board when you win." },
  { id: "diamondtrail", name: "Diamond Trail", type: "Trail", rarity: "epic", price: 35, icon: "💎", desc: "A sparkling diamond trail follows your pieces." },
  { id: "goat", name: "G.O.A.T. Badge", type: "Badge", rarity: "legendary", price: 85, icon: "🐐", desc: "The greatest of all time. Few will ever own it." },
  { id: "neon", name: "Neon Pulse Frame", type: "Avatar Frame", rarity: "rare", price: 15, icon: "⚡", desc: "A pulsing neon ring that beats with the music of the arena." },
  { id: "rookie", name: "Rookie Badge", type: "Badge", rarity: "uncommon", price: 6, icon: "🌟", desc: "Mark your arrival in the arena." },
  { id: "starter", name: "Starter Border", type: "Avatar Frame", rarity: "common", price: 3, icon: "🔷", desc: "A clean, simple border to get you started." },
];

const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common", uncommon: "Uncommon", rare: "Rare", epic: "Epic", legendary: "Legendary",
};

export default function Shop() {
  const [tab, setTab] = useState("Featured");
  const [selected, setSelected] = useState<Item | null>(null);
  const balance = 117;
  const featured = ITEMS.find((i) => i.featured)!;

  return (
    <div className={"page shop-page"}>
      <div className={"shop-head"}>
        <div>
          <h1 className={"page-title"}>◈ Item Shop</h1>
          <p className={"page-sub"}>Spend Scalps on cosmetics — no pay-to-win, ever.</p>
        </div>
        <div className={"shop-balance"}>
          <span className={"bal-pill"}>S {balance.toFixed(2)}</span>
          <button className={"btn-primary"}>+ Add Scalps</button>
        </div>
      </div>

      <div className={"shop-banner"}>
        1 Scalp = 1 USD. Deposit real money → it becomes Scalps automatically. Use Scalps to wager on games or buy cosmetics.
      </div>

      <div className={"shop-tabs"}>
        {TABS.map((t) => (
          <button key={t} className={"shop-tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className={"shop-featured"}>
        <div className={"feat-preview" + " rar-" + featured.rarity}>
          <span className={"feat-icon"}>{featured.icon}</span>
        </div>
        <div className={"feat-info"}>
          <span className={"overline"}>Featured · {RARITY_LABEL[featured.rarity]}</span>
          <h2>{featured.name}</h2>
          <p>{featured.desc}</p>
          <div className={"feat-buy"}>
            <span className={"price"}>{featured.price} Scalps</span>
            <button className={"btn-primary"} onClick={() => setSelected(featured)}>Preview</button>
          </div>
        </div>
      </div>

      <div className={"shop-section-row"}>
        <h3 className={"section-title"}>Legendary Collection</h3>
        <span className={"shop-refresh"}>Shop refreshes in 00:00:59</span>
      </div>

      <div className={"shop-grid"}>
        {ITEMS.map((item) => (
          <div key={item.id} className={"rarity-card rar-" + item.rarity}>
            <div className={"rc-preview"}><span>{item.icon}</span></div>
            <div className={"rc-body"}>
              <div className={"rc-title"}>{item.name}</div>
              <div className={"rc-rarity rar-text-" + item.rarity}>{RARITY_LABEL[item.rarity]}</div>
            </div>
            <div className={"rc-actions"}>
              <button className={"btn-ghost"} onClick={() => setSelected(item)}>👁 Preview</button>
              <button className={"btn-buy"}>🛒 {item.price}</button>
            </div>
          </div>
        ))}
      </div>

      <div className={"pricing-guide"}>
        <h3 className={"section-title"}>Scalps Pricing Guide</h3>
        <div className={"guide-row"}>
          {(Object.keys(RARITY_PRICE) as Rarity[]).map((r) => (
            <div key={r} className={"guide-pill rar-text-" + r}>
              <strong>{RARITY_LABEL[r]}</strong> {RARITY_PRICE[r]}
            </div>
          ))}
        </div>
        <p className={"guide-note"}>All items are purely cosmetic · 1 Scalp = 1 USD · Scalps never expire.</p>
      </div>

      {selected && (
        <div className={"modal-backdrop"} onClick={() => setSelected(null)}>
          <div className={"item-modal rar-" + selected.rarity} onClick={(e) => e.stopPropagation()}>
            <button className={"modal-close"} onClick={() => setSelected(null)}>×</button>
            <span className={"overline"}>{RARITY_LABEL[selected.rarity]} · {selected.type}</span>
            <div className={"modal-preview"}><span>{selected.icon}</span></div>
            <div className={"modal-hint"}>Drag to rotate · Scroll to zoom</div>
            <h2>{selected.name}</h2>
            <p className={"modal-desc"}>{selected.desc}</p>
            <button className={"btn-primary lg"}>Buy for {selected.price} Scalps</button>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import "./pages.css";

type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

interface Item {
  id: string;
  name: string;
  type: string;
  rarity: Rarity;
  price: number;
  desc: string;
  icon: string;
  featured?: boolean;
}

const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

const TABS = ["Featured", "Daily Deals", "Frames", "Badges", "Boards", "Emotes", "Themes", "Victory", "Banners", "Trails", "Dice", "Cards", "My Items"];

const ITEMS: Item[] = [
  { id: "inferno", name: "Inferno Avatar Frame", type: "Avatar Frame", rarity: "legendary", price: 25, desc: "Animated flame border that engulfs your avatar in living fire.", icon: "🔥", featured: true },
  { id: "galaxy", name: "Galaxy Avatar", type: "Avatar Frame", rarity: "legendary", price: 85, desc: "A swirling cosmos of stars wrapped around your profile.", icon: "🌌" },
  { id: "crown", name: "Champions Crown", type: "Badge", rarity: "legendary", price: 85, desc: "Only true champions wear the crown. Pure flex.", icon: "👑" },
  { id: "goldshower", name: "Gold Shower", type: "Victory Effect", rarity: "epic", price: 35, desc: "Rain gold coins across the board when you win.", icon: "🪙" },
  { id: "diamondtrail", name: "Diamond Trail", type: "Trail", rarity: "epic", price: 35, desc: "Leave a shimmering trail of diamonds behind your pieces.", icon: "💎" },
  { id: "goat", name: "G.O.A.T. Badge", type: "Badge", rarity: "legendary", price: 85, desc: "The greatest of all time. Reserved for legends.", icon: "🐐" },
  { id: "neonpulse", name: "Neon Pulse Frame", type: "Avatar Frame", rarity: "rare", price: 15, desc: "A pulsing neon glow that breathes around your avatar.", icon: "💠" },
  { id: "voidboard", name: "Void Board", type: "Board", rarity: "epic", price: 35, desc: "A board carved from the empty dark of space.", icon: "🌑" },
  { id: "rookiebadge", name: "Rookie Badge", type: "Badge", rarity: "common", price: 3, desc: "Everyone starts somewhere. Wear it with pride.", icon: "🎖️" },
  { id: "emberemote", name: "Ember Emote", type: "Emote", rarity: "uncommon", price: 6, desc: "Taunt your opponent with a flicker of flame.", icon: "😏" },
  { id: "pixeltrail", name: "Pixel Trail", type: "Trail", rarity: "rare", price: 15, desc: "Retro pixel particles follow your every move.", icon: "👾" },
  { id: "goldenbanner", name: "Golden Banner", type: "Banner", rarity: "epic", price: 35, desc: "A radiant golden banner for your profile header.", icon: "🏳️" },
];

const PRICING = [
  { tier: "Common", range: "Free – 3", cls: "common" },
  { tier: "Uncommon", range: "6", cls: "uncommon" },
  { tier: "Rare", range: "15", cls: "rare" },
  { tier: "Epic", range: "35", cls: "epic" },
  { tier: "Legendary", range: "85", cls: "legendary" },
];

export default function Shop() {
  const [tab, setTab] = useState("Featured");
  const [selected, setSelected] = useState<Item | null>(null);
  const [owned, setOwned] = useState<string[]>([]);
  const featured = ITEMS.find((i) => i.featured) ?? ITEMS[0];

  function buy(item: Item) {
    if (!owned.includes(item.id)) setOwned([...owned, item.id]);
    setSelected(null);
  }

  return (
    <div className="page shop-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{"◈ Item Shop"}</h1>
          <p className="page-sub">Spend Scalps on cosmetics — no pay-to-win, ever.</p>
        </div>
        <div className="shop-balance">
          <span className="coin">S</span>
          <span className="bal-amt">117.00</span>
          <button className="btn-primary sm">+ Add Scalps</button>
        </div>
      </div>

      <div className="shop-banner">
        1 Scalp = 1 USD. Deposit real money → it becomes Scalps automatically. Use Scalps to wager on games or buy cosmetics.
      </div>

      <div className="chip-row scroll-x">
        {TABS.map((t) => (
          <button key={t} className={"chip" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <section className="shop-featured" onClick={() => setSelected(featured)}>
        <div className={"feat-preview rar-" + featured.rarity}>
          <span className="feat-icon">{featured.icon}</span>
        </div>
        <div className="feat-info">
          <span className="overline">Featured · {RARITY_LABEL[featured.rarity]}</span>
          <h2>{featured.name}</h2>
          <p>{featured.desc}</p>
          <div className="feat-price"><span className="coin">S</span> {featured.price.toFixed(2)} Scalps</div>
        </div>
      </section>

      <div className="section-title-row">
        <h3 className="section-title">Legendary Collection</h3>
        <span className="shop-timer">Shop refreshes in 00:00:59</span>
      </div>

      <div className="rarity-grid">
        {ITEMS.map((item) => (
          <div key={item.id} className={"rarity-card rar-" + item.rarity}>
            <div className="rar-preview"><span className="rar-icon">{item.icon}</span></div>
            <div className="rar-body">
              <span className={"rar-tag rar-" + item.rarity}>{RARITY_LABEL[item.rarity]}</span>
              <h4>{item.name}</h4>
              <div className="rar-actions">
                <button className="icon-btn" onClick={() => setSelected(item)} title="Preview">{"👁"}</button>
                {owned.includes(item.id) ? (
                  <span className="owned-tag">Owned</span>
                ) : (
                  <button className="btn-buy" onClick={() => buy(item)}><span className="coin sm">S</span> {item.price}</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="pricing-guide">
        <h3 className="section-title">Scalps Pricing Guide</h3>
        <div className="pricing-row">
          {PRICING.map((p) => (
            <div key={p.tier} className={"price-pill rar-" + p.cls}>
              <span className="pp-tier">{p.tier}</span>
              <span className="pp-range">{p.range}</span>
            </div>
          ))}
        </div>
        <p className="pricing-note">All items are purely cosmetic · 1 Scalp = 1 USD · Scalps never expire.</p>
      </section>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal item-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-x" onClick={() => setSelected(null)}>{"×"}</button>
            <span className="overline">{RARITY_LABEL[selected.rarity]} · {selected.type}</span>
            <div className={"item-preview-3d rar-" + selected.rarity}>
              <span className="big-icon">{selected.icon}</span>
              <span className="rotate-hint">Drag to rotate · Scroll to zoom</span>
            </div>
            <h2>{selected.name}</h2>
            <div className="modal-tags">
              <span className={"rar-tag rar-" + selected.rarity}>{RARITY_LABEL[selected.rarity]}</span>
              {selected.featured && <span className="rar-tag feat">Featured</span>}
            </div>
            <p className="item-desc">{selected.desc}</p>
            {owned.includes(selected.id) ? (
              <button className="btn-primary full" disabled>Owned</button>
            ) : (
              <button className="btn-gradient full" onClick={() => buy(selected)}>Buy for {selected.price} Scalps</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
