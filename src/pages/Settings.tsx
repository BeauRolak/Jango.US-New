import { useState } from "react";
import { PageHeader, Card, Btn } from "../components/UI";

function Toggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="setting-row">
      <span>{label}</span>
      <button className={"toggle " + (on ? "toggle-on" : "")} onClick={onToggle} aria-pressed={on}>
        <span className="knob" />
      </button>
    </div>
  );
}

export default function Settings() {
  const [sound, setSound] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [notifs, setNotifs] = useState(true);
  return (
    <div>
      <PageHeader title="Settings" subtitle="Preferences for your account and gameplay." />
      <Card style={{ maxWidth: 560 }}>
        <Toggle label="Sound effects" on={sound} onToggle={() => setSound((v) => !v)} />
        <Toggle label="Reduced motion" on={reduced} onToggle={() => setReduced((v) => !v)} />
        <Toggle label="Match notifications" on={notifs} onToggle={() => setNotifs((v) => !v)} />
        <div className="setting-row">
          <span>Account</span>
          <Btn variant="ghost" disabled>Manage</Btn>
        </div>
      </Card>
      <p style={{ color: "var(--muted)", marginTop: 16 }}>Settings are local-only in this preview build.</p>
    </div>
  );
}
