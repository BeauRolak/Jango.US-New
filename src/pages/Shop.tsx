import { useState, useMemo } from "react";
import { Icon, type IconName } from "../components/Icon";
import {
  PageHero, GlowCard, AnimatedButton, ScalpsBalance,
  StatusPill, ActionModal, useFeedback,
} from "../components/Juice";
import "./sarena.css";

type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

type Item = {
  id: string;
  name: string;
  icon: IconName;
  rarity: Rarity;
  category: string;
  desc: string;
};

const PRICES: Record<Rarity, number> = {
  Common: 5, Uncommon: 10, Rare: 15, Epic: 20, Legendary: 25,
};

const RARITY_COLOR: Record<Rarity, string> = {
  Common: "#9aa4b2", Uncommon: "#3ddc84", Rare: "#4d9bff", Epic: "#b15cff", Legendary: "#f5b942",
};

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
  { id: "v1", name: "Victory Roar", icon: "Crown", rarity: "Epic", category: "Victory", desc: "A lion's roar announces your triumph." },
  { id: "th1", name: "Midnight Theme", icon: "Star", rarity: "Uncommon", category: "Themes", desc: "Deep navy UI theme for night owls." },
  { id: "bn1", name: "Aurora Banner", icon: "Sparkles", rarity: "Rare", category: "Banners", desc: "A shifting aurora behind your profile." },
];

const CATEGORIES = ["All", "Frames", "Badges", "Trails", "Emotes", "Victory", "Themes", "Banners", "Dice", "My Items"];

const fmt = (n: number) => n.toLocaleString("en-US");

export default function Shop() {
  const { fire } = useFeedback();
  const [balance, setBalance] = useState(117);
  const [cat, setCat] = useState("All");
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [equipped, setEquipped] = useState<string | null>(null);
  const [active, setActive] = useState<Item | null>(null);
  const [err, setErr] = useState(false);

  const shown = useMemo(() => {
    if (cat === "All") return ITEMS;
    if (cat === "My Items") return ITEMS.filter((i) => owned[i.id]);
    return ITEMS.filter((i) => i.category === cat);
  }, [cat, owned]);

  const priceOf = (it: Item) => PRICES[it.rarity];

  const openItem = (it: Item) => { setErr(false); fire("tap", "", null); setActive(it); };

  const buy = () => {
    if (!active) return;
    const price = priceOf(active);
    if (balance < price) { setErr(true); fire("error", "Not enough Scalps", null); return; }
    setBalance((b) => b - price);
    setOwned((o) => ({ ...o, [active.id]: true }));
    fire("purchase", active.name + " unlocked!", null);
    setActive(null);
  };

  const equip = (it: Item) => {
    setEquipped(it.id);
    fire("equip", it.name + " equipped", null);
    setActive(null);
  };

  return (
    <div className="sarena-page">
      <PageHero
        eyebrow="Cosmetic Store"
        title="The Jango"
        gradWord="Shop"
        sub="Spend Scalps on cosmetics — frames, badges, trails and more. Cosmetics only, never pay-to-win."
      />

      <div className="sarena-balance-row">
        <ScalpsBalance amount={balance} size="md" />
      </div>

      <div className="sarena-note">
        <span className="sarena-note-ico"><Icon name="Info" /></span>
        <span>Cosmetics only — nothing here affects gameplay or odds. Scalps are in-platform credits and no real money moves in this preview.</span>
      </div>

      <div className="sarena-chips">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={"sarena-chip" + (cat === c ? " on" : "")}
            onClick={(e) => { setCat(c); fire("tap", "", e.currentTarget); }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="sarena-grid">
        {shown.map((it) => {
          const isOwned = owned[it.id];
          const isEquipped = equipped === it.id;
          const color = RARITY_COLOR[it.rarity];
          return (
            <GlowCard key={it.id} tone="primary" className="sarena-card" style={{ ["--sr" as any]: color }}>
              <div className="sarena-card-in">
                <div className="sarena-rarity">{it.rarity}</div>
                <div className="sarena-art">
                  {isOwned && <span className="sarena-owned-tag"><Icon name="Check" /> {isEquipped ? "Equipped" : "Owned"}</span>}
                  <span className="sarena-art-ico"><Icon name={it.icon} /></span>
                </div>
                <div className="sarena-name">{it.name}</div>
                <div className="sarena-desc">{it.desc}</div>
                <div className="sarena-foot">
                  {isOwned ? (
                    <AnimatedButton
                      variant={isEquipped ? "ghost" : "grad"}
                      fbKind="success"
                      className="sarena-equipbtn"
                      icon={isEquipped ? "CheckCircle" : "Star"}
                      onClick={() => equip(it)}
                    >
                      {isEquipped ? "Equipped" : "Equip"}
                    </AnimatedButton>
                  ) : (
                    <>
                      <span className="sarena-price">Ⓢ {priceOf(it)}</span>
                      <AnimatedButton variant="grad" fbKind="tap" className="sarena-buy" icon="Cart" onClick={() => openItem(it)}>
                        View
                      </AnimatedButton>
                    </>
                  )}
                </div>
              </div>
            </GlowCard>
          );
        })}
      </div>

      <ActionModal
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? active.name : ""}
        footer={
          active ? (
            owned[active.id] ? (
              <>
                <AnimatedButton variant="ghost" fbKind="tap" onClick={() => setActive(null)}>Close</AnimatedButton>
                <AnimatedButton variant="grad" fbKind="success" icon="Star" onClick={() => equip(active)}>Equip</AnimatedButton>
              </>
            ) : (
              <>
                <AnimatedButton variant="ghost" fbKind="tap" onClick={() => setActive(null)}>Cancel</AnimatedButton>
                <AnimatedButton variant="grad" fbKind="reward" pulse icon="Cart" onClick={() => buy()}>
                  Buy &middot; Ⓢ {priceOf(active)}
                </AnimatedButton>
              </>
            )
          ) : null
        }
      >
        {active && (
          <div style={{ ["--sr" as any]: RARITY_COLOR[active.rarity] }}>
            <div className="sarena-m-art">
              <span className="sarena-m-art-ico"><Icon name={active.icon} /></span>
            </div>
            <div className="sarena-m-rarity">{active.rarity} &middot; {active.category}</div>
            <div className="sarena-m-desc">{active.desc}</div>
            {!owned[active.id] && (
              <div className="sarena-m-rows">
                <div className="sarena-m-row"><span>Price</span><span className="v">Ⓢ {priceOf(active)}</span></div>
                <div className="sarena-m-row"><span>Your balance</span><span className="v">Ⓢ {fmt(balance)}</span></div>
                <div className={"sarena-m-row after" + (balance < priceOf(active) ? " short" : "")}>
                  <span>Balance after</span><span className="v">Ⓢ {fmt(balance - priceOf(active))}</span>
                </div>
              </div>
            )}
            {err && balance < priceOf(active) && (
              <div className="sarena-err">
                <span className="sarena-err-ico"><Icon name="AlertCircle" /></span>
                <span>Not enough Scalps. Earn more by winning matches or visit your Wallet.</span>
              </div>
            )}
            {owned[active.id] && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <StatusPill label="Owned" kind="accent" />
              </div>
            )}
          </div>
        )}
      </ActionModal>
    </div>
  );
}
