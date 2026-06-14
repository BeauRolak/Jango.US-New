import { Link } from "react-router-dom";
import { PageHeader, Card, Btn } from "../components/UI";

export default function Training() {
  return (
    <div>
      <PageHeader title="Training" subtitle="Practice against bots with no Scaps at stake." />
      <div className="grid grid-3">
        <Card glow>
          <h3 style={{ marginTop: 0 }}>Mini Golf Practice</h3>
          <p style={{ color: "var(--muted)" }}>Free-play Mini Golf vs an Easy bot. Great for learning aim and power.</p>
          <Link to="/games/minigolf"><Btn style={{ width: "100%" }}>Start practice</Btn></Link>
        </Card>
        <Card>
          <h3 style={{ marginTop: 0 }}>Aiming Drills</h3>
          <p style={{ color: "var(--muted)" }}>Targeted drills for power control and bank shots. Coming soon.</p>
          <Btn variant="ghost" disabled style={{ width: "100%" }}>Locked</Btn>
        </Card>
        <Card>
          <h3 style={{ marginTop: 0 }}>Tutorial</h3>
          <p style={{ color: "var(--muted)" }}>Step-by-step walkthrough of controls and scoring. Coming soon.</p>
          <Btn variant="ghost" disabled style={{ width: "100%" }}>Locked</Btn>
        </Card>
      </div>
    </div>
  );
}
