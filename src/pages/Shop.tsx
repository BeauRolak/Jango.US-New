import { useState } from "react";
import { toast } from "../components/UI";
import { Icon, type IconName } from "../components/Icon";
import "./shop.css";

type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
const PRICES: Record<Rarity, number> = { Common: 5, Uncommon: 10, Rare: 15, Epic: 20, Legendary: 25 };
const RARITY_COLOR: Record<Rarity, string> = {
  Common: "#9aa4b2", Uncommon: "#3ddc84", Rare: "#4d9bff", Epic: "#b15cff", Legendary: "#f5b942",
};

type Item = { id: string; name: string; icon: IconName; rarity: Rarity; category: string; desc: string };

const ITEMS: Item[] = [
  { id: "f1", name: "Inferno Avatar Frame", icon: "Flame", rarity: "Legendary", category: "Frames", desc: "Animated flame border that engulfs your avatar in living fire." },
  { id: "f2", name: "Galaxy Avatar", icon: "Sparkles", rarity: "Epic", category: "Frames", desc: "A swirling cosmos frames your face among the stars." },
  { id: "f3", name: "Neon Pulse Frame", icon: "Bolt", rarity: "Rare", category: "Frames", desc: "Electric neon pulses around your avatar." },
  { id: "f4", name: "Classic Ring", icon: "Star", rarity: "Common", category: "Frames", desc: "A clean ring border. Simple and sharp." },
  { id: "b1", name: "Champions Crown", icon: "Crown", rarity: "Legendary", category: "Badges", desc: "Worn only by those who have stood at the top." },
  { id: "b2", name: "G.O.A.T. Badge", icon: "Medal", rarity: "Epic", category: "Badges", desc: "Greatest of all time. Let them know." },
  { id: "b3", name: "Rising Star", icon: "Star", rarity: "Uncommon", category: "Badges", desc: "For the up-and-comers making noise." },
  { id: "b4", name: "Rookie Badge", icon: "Gamepad", rarity: "Common", category: "Badges", desc: "Everyone starts somewhere." },
  { id: "t1", name: "Diamond Trail", icon: "Gem", rarity: "Epic", category: "Trails", desc: "Your ball leaves a trail of shimmering diamonds." },
  { id: "t2", name: "Comet Trail", icon: "Sparkles", rarity: "Rare", category: "Trails", desc: "Streak across the table like a comet." },
  { id: "e1", name: "Gold Shower Emote", icon: "Coins", rarity: "Rare", category: "Emotes", desc: "Rain Scalps on your opponent after a win." },
  { id: "e2", name: "Mic Drop", icon: "Bell", rarity: "Uncommon", category: "Emotes", desc: "Say nothing. Drop the mic." },
  { id: "d1", name: "Golden Dice", icon: "Dice", rarity: "Legendary", category: "Dice", desc: "Solid gold dice for the high roller." },
  { id: "v1", name: "Victory Roar", icon: "Crown", rarity: "Epic", category: "Victory", desc: "A lion’s roar announces your triumph." },
  { id: "th1", name: "Midnight Theme", icon: "Star", rarity: "Uncommon", category: "Themes", desc: "Deep navy UI theme for night owls." },
  { id: "bn1", name: "Aurora Banner", icon: "Sparkles", rarity: "Rare", category: "Banners", desc: "A shifting aurora behind your profile." },
];

const CATEGORIES = ["All", "Frames", "Badges", "Trails", "Emotes", "Victory", "Themes", "Banners", "Dice", "My Items"];

export default function Shop() {
  const [balance, setBalance] = useState(117);
  const [cat, setCat] = useState("All");
  const [owned, setOwned] = useState<string[]>(["f4", "b4"]);
  const [equipped, setEquipped] = useState<string[]>(["f4"]);
  const [preview, setPreview] = useState<Item | null>(null);
  const [confirm, setConfirm] = useState<Item | null>(null);

  const visible = ITEMS.filter((i) => cat === "All" ? true : cat === "My Items" ? owned.includes(i.id) : i.category === cat);

  function buy(item: Item) {
    const price = PRICES[item.rarity];
    if (owned.includes(item.id)) { toast("You already own this item", "info"); return; }
    if (balance < price) { toast(`Not enough Scalps — need ${price - balance} more`, "error"); setConfirm(null); return; }
    setBalance((b) => b - price);
    setOwned((o) => [...o, item.id]);
    setConfirm(null);
    setPreview(null);
    toast(`Purchased ${item.name} for ${price} Scalps`, "reward");
  }

  function equip(item: Item) {
    if (equipped.includes(item.id)) {
      setEquipped((e) => e.filter((x) => x !== item.id));
      toast(`Unequipped ${item.name}`, "info");
    } else {
      setEquipped((e) => [...e.filter((x) => ITEMS.find((it) => it.id === x)?.category !== item.category), item.id]);
      toast(`Equipped ${item.name}`, "success");
    }
  }

  return (
    <div className="shop-page">
      <div className="shop-head">
        <div>
          <h1 className="shop-title">◈ Item Shop</h1>
          <p className="shop-sub">Spend Scalps on cosmetics — no pay-to-win, ever.</p>
        </div>
        <div className="shop-bal"><span className="shop-bal-pill">Ⓢ {balance.toFixed(0)} Scalps</span></div>
      </div>

      <div className="shop-notice">Cosmetics only — nothing here affects gameplay or odds. Scalps are in-platform credits.</div>

      <div className="shop-cats">
        {CATEGORIES.map((c) => (
          <button key={c} className={"shop-cat" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {visible.length === 0 && <div className="shop-empty">Nothing here yet. {cat === "My Items" ? "Buy some cosmetics to fill your collection!" : "Check back soon."}</div>}

      <div className="shop-grid">
        {visible.map((item) => {
          const price = PRICES[item.rarity];
          const isOwned = owned.includes(item.id);
          const isEquipped = equipped.includes(item.id);
          const color = RARITY_COLOR[item.rarity];
          return (
            <div key={item.id} className={"shop-card rarity-" + item.rarity.toLowerCase()} style={{ ["--rar" as any]: color }}>
              <div className="shop-rar-tag" style={{ color }}>{item.rarity}</div>
              <div className="shop-card-icon"><Icon name={item.icon} /></div>
              <div className="shop-card-name">{item.name}</div>
              <div className="shop-card-foot">
                <button className="shop-preview" onClick={() => setPreview(item)}><Icon name="Search" /> Preview</button>
                {isOwned ? (
                  <button className={"shop-buy owned" + (isEquipped ? " equipped" : "")} onClick={() => equip(item)}>{isEquipped ? <><Icon name="Check" /> Equipped</> : "Equip"}</button>
                ) : (
                  <button className="shop-buy" onClick={() => setConfirm(item)}>Ⓢ {price}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {preview && (
        <div className="shop-modal-overlay" onClick={() => setPreview(null)}>
          <div className="shop-modal j-pop" onClick={(e) => e.stopPropagation()} style={{ ["--rar" as any]: RARITY_COLOR[preview.rarity] }}>
            <div className="shop-preview-stage"><div className="shop-preview-icon"><Icon name={preview.icon} /></div></div>
            <div className="shop-rar-tag big" style={{ color: RARITY_COLOR[preview.rarity] }}>{preview.rarity}</div>
            <h3 className="shop-modal-name">{preview.name}</h3>
            <p className="shop-modal-desc">{preview.desc}</p>
            <div className="shop-modal-actions">
              <button className="btn btn-ghost" onClick={() => setPreview(null)}>Close</button>
              {owned.includes(preview.id) ? (
                <button className="btn btn-primary" onClick={() => equip(preview)}>{equipped.includes(preview.id) ? "Unequip" : "Equip"}</button>
              ) : (
                <button className="btn btn-primary" onClick={() => { setConfirm(preview); }}>Ⓢ Buy for {PRICES[preview.rarity]}</button>
              )}
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="shop-modal-overlay" onClick={() => setConfirm(null)}>
          <div className="shop-modal small j-pop" onClick={(e) => e.stopPropagation()} style={{ ["--rar" as any]: RARITY_COLOR[confirm.rarity] }}>
            <div className="shop-confirm-icon"><Icon name={confirm.icon} /></div>
            <h3 className="shop-modal-name">Buy {confirm.name}?</h3>
            <p className="shop-modal-desc">{confirm.rarity} cosmetic · {PRICES[confirm.rarity]} Scalps. Balance after: {balance - PRICES[confirm.rarity]} Scalps.</p>
            <div className="shop-modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => buy(confirm)}>Confirm Ⓢ {PRICES[confirm.rarity]}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
