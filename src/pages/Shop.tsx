import { PageHeader, Card, Btn, Tag } from "../components/UI";

const ITEMS = [
  { name: "Neon Ball Skin", price: 150, emoji: "🔵", owned: true },
  { name: "Gold Putter Trail", price: 300, emoji: "✨", owned: false },
  { name: "Victory Confetti", price: 200, emoji: "🎉", owned: false },
  { name: "Galaxy Green Theme", price: 450, emoji: "🌌", owned: false },
  { name: "Champion Banner", price: 600, emoji: "🏆", owned: false },
  { name: "Retro Ball Skin", price: 120, emoji: "🔴", owned: false },
];

export default function Shop() {
  return (
    <div>
      <PageHeader title="Item Shop" subtitle="Spend Scaps on cosmetics. Purchases are stubbed in this preview." />
      <div className="grid grid-auto">
        {ITEMS.map((it, i) => (
          <Card key={i} className="shop-item">
            <div className="shop-art"><span>{it.emoji}</span></div>
            <div className="shop-name">{it.name}</div>
            <div className="shop-foot">
              <span className="shop-price">{it.price} Scaps</span>
              {it.owned ? (
                <Tag color="green">Owned</Tag>
              ) : (
                <Btn variant="gold" disabled>Buy</Btn>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
