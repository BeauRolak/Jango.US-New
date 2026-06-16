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
