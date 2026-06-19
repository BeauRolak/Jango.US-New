import { useState } from "react";
import { toast } from "../components/UI";
import { getFeedbackSettings, setFeedbackSetting, useFeedback } from "../components/Juice";
import { Icon, type IconName } from "../components/Icon";
import "./pages.css";
import "./settings.css";

const NAV = [
  "Account", "Security", "Notifications", "Gameplay", "Wallet",
  "Privacy", "Social", "Appearance", "Game Modes", "Danger Zone",
];

const NAV_ICONS: Record<string, IconName> = {
  Account: "Users",
  Security: "Shield",
  Notifications: "Bell",
  Gameplay: "Gamepad",
  Wallet: "Coins",
  Privacy: "Lock",
  Social: "Message",
  Appearance: "Sparkles",
  "Game Modes": "Dice",
  "Danger Zone": "AlertCircle",
};

function Toggle({ label, sub, on, settingKey }: { label: string; sub?: string; on: boolean; settingKey?: "sound" | "haptics" }) {
  const { fire } = useFeedback();
  const init = settingKey ? !!getFeedbackSettings()[settingKey] : on;
  const [v, setVRaw] = useState(init);
  const setV = (next: boolean) => {
    setVRaw(next);
    if (settingKey) setFeedbackSetting(settingKey, next);
    fire(next ? "success" : "tap");
  };
  return (
    <div className={"set-toggle"}>
      <div className={"set-toggle-text"}>
        <span className={"set-toggle-label"}>{label}</span>
        {sub && <span className={"set-toggle-sub"}>{sub}</span>}
      </div>
      <button className={"switch " + (v ? "on" : "")} onClick={() => setV(!v)}><span /></button>
    </div>
  );
}

function Field({ label, value, ph }: { label: string; value?: string; ph?: string }) {
  return (
    <label className={"set-field"}>
      <span>{label}</span>
      <input defaultValue={value} placeholder={ph} />
    </label>
  );
}

function Card({ title, children }: { title: string; children: any }) {
  return (
    <div className={"set-card"}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Save({ label }: { label?: string }) {
  return <button className={"set-save"} onClick={() => toast("Settings saved successfully", "success")}>{label || "Save Changes"}</button>;
}

export default function Settings() {
  const [tab, setTab] = useState("Account");
  const [accent, setAccent] = useState("blue");
  const [theme, setTheme] = useState("Dark");
  const [density, setDensity] = useState("Comfortable");
  const accents = ["blue", "pink", "orange", "green", "purple"];
  const accentHex: Record<string,string> = { blue: "#3B82F6", pink: "#FF2D78", orange: "#FF6A2C", green: "#22C55E", purple: "#8B5CF6" };

  return (
    <div className={"settings-page"}>
      <header className={"settings-head"}><h1>Settings</h1></header>
      <div className={"settings-grid"}>
        <aside className={"settings-nav"}>
          {NAV.map((n) => (
            <button key={n} className={"set-nav-btn " + (tab === n ? "active" : "") + (n === "Danger Zone" ? " danger" : "")} onClick={() => setTab(n)}><Icon name={NAV_ICONS[n]} /><span>{n}</span></button>
          ))}
          <button className={"set-nav-btn signout"}>Sign Out</button>
        </aside>

        <section className={"settings-panel"}>
          {tab === "Account" && (<>
            <Card title={"Profile Picture"}>
              <div className={"pfp-row"}><div className={"pfp"}>B</div><div><button className={"set-btn"}>Choose Image</button><p className={"muted"}>Max 2MB · JPG/PNG/GIF · changes every 7 days</p></div></div>
            </Card>
            <Card title={"Identity"}>
              <Field label={"Username"} value={"beaurolak"} /><Field label={"Display Name"} value={"Beau"} /><Field label={"Bio"} ph={"Tell players about yourself"} /><Field label={"Favorite Game"} value={"Chess"} />
            </Card>
            <Card title={"Account Information"}>
              <Field label={"Email"} value={"beau@jango.us"} /><Field label={"Full Name"} value={"Beau Rolak"} /><Field label={"Member Since"} value={"Jan 2026"} />
            </Card>
            <Save />
          </>)}

          {tab === "Security" && (<>
            <Card title={"Change Password"}><Field label={"Current Password"} ph={"Current"} /><Field label={"New Password"} ph={"New"} /><Field label={"Confirm Password"} ph={"Confirm"} /><Save label={"Update Password"} /></Card>
            <Card title={"Two-Factor Authentication"}><p className={"muted"}>Disabled · 2FA via authenticator app adds an extra layer of protection.</p><button className={"set-btn"}>Enable 2FA</button></Card>
            <Card title={"Active Sessions"}><div className={"session-row"}><span>Current session · Chrome on Mac</span></div><div className={"session-row"}><span>Previous session · Safari on iPhone</span><button className={"set-btn sm"}>Revoke</button></div><button className={"set-btn"}>Log Out of All Other Devices</button></Card>
            <Card title={"Email Verification"}><p className={"muted"}>Verified</p></Card>
          </>)}

          {tab === "Notifications" && (<>
            <Card title={"Push Notifications"}><Toggle label={"Enable Push Notifications"} on /></Card>
            <Card title={"In-App Notifications"}>
              <Toggle label={"Match Invites"} on /><Toggle label={"Friend Requests"} on /><Toggle label={"Challenge Completions"} on /><Toggle label={"Tournament Announcements"} on /><Toggle label={"Wallet Activity"} on /><Toggle label={"Rewards & Achievements"} on /><Toggle label={"Platform Announcements"} />
            </Card>
            <Card title={"Email Notifications"}><Toggle label={"Match Invites via Email"} /><Toggle label={"Friend Activity via Email"} /><Toggle label={"Wallet Updates via Email"} on /><Toggle label={"Platform News via Email"} /></Card>
            <Save label={"Save Notification Preferences"} />
          </>)}

          {tab === "Gameplay" && (<>
            <Card title={"Audio & Feedback"}><Toggle settingKey="sound" label={"Sound Effects"} sub={"Background hum, clicks, win/loss chimes"} on /><div className={"slider-row"}><span>Master Volume</span><input type={"range"} defaultValue={70} /></div><Toggle settingKey="haptics" label={"Haptic Feedback"} sub={"Vibrations for moves and interactions (mobile)"} on /></Card>
            <Card title={"Visual Preferences"}><Toggle label={"Animations"} sub={"Piece movement, card flips, and transition effects"} on /><Toggle label={"Turn Timer Display"} sub={"Show a countdown clock for timed moves"} on /></Card>
            <Card title={"Matchmaking & Rematch"}><Toggle label={"Quick Rematch"} sub={"Offer an instant rematch button at end of game"} on /><Toggle label={"Auto-Join Matchmaking"} sub={"Automatically enter matchmaking queue when ready"} /><div className={"seg-row"}><span>Preferred Mode</span><div className={"seg"}><button className={"active"}>Ranked</button><button>Casual</button></div></div></Card>
            <Card title={"Phone View"}><Toggle label={"Phone Mode"} sub={"Wraps the app in a phone-shaped container"} /></Card>
            <Card title={"Mobile Controls"}><div className={"seg-row"}><span>Hand Position</span><div className={"seg"}><button className={"active"}>Right</button><button>Left</button></div></div><div className={"slider-row"}><span>Control Size (56px)</span><input type={"range"} defaultValue={56} /></div><div className={"slider-row"}><span>Opacity (90%)</span><input type={"range"} defaultValue={90} /></div><Toggle settingKey="haptics" label={"Haptic on Press"} sub={"Vibrate when tapping on-screen controls"} on /><div className={"dpad-preview"}><div className={"dpad"}><span/><span/><span/><span/></div></div></Card>
            <Save label={"Save Preferences"} />
          </>)}

          {tab === "Wallet" && (<>
            <Card title={"Current Balance"}><div className={"bal-line"}><span className={"bal-num"}>117.00 S</span><div><button className={"set-btn"}>Deposit</button><button className={"set-btn sm"}>Dashboard</button></div></div></Card>
            <Card title={"Payment Methods"}><button className={"set-btn"}>Manage Cards</button></Card>
            <Card title={"Wallet Preferences"}><Toggle label={"Withdrawal Security Confirmation"} on /><Toggle label={"Wallet Activity Notifications"} on /><div className={"seg-row"}><span>Currency Display</span><div className={"seg"}><button className={"active"}>USD $</button></div></div></Card>
            <Card title={"Spending Limits"}><Field label={"Daily"} ph={"No limit"} /><Field label={"Weekly"} ph={"No limit"} /><Field label={"Monthly"} ph={"No limit"} /><Field label={"Max Wager Per Match"} ph={"No limit"} /><Save label={"Save Limits"} /></Card>
            <Card title={"Responsible Gaming"}><button className={"set-btn"}>Set Self-Exclusion</button><button className={"set-btn sm"}>Set Cool-Off Timer</button></Card>
          </>)}

          {tab === "Privacy" && (<>
            <Card title={"Stats Visibility"}><div className={"seg-row"}><span>Who can see your stats</span><div className={"seg"}><button className={"active"}>Public</button><button>Friends</button><button>Private</button></div></div></Card>
            <Card title={"Profile Visibility"}><Toggle label={"Show Online Status"} on /><Toggle label={"Show Match History"} on /><Toggle label={"Show Wallet Winnings"} /></Card>
            <Card title={"Social Permissions"}><Toggle label={"Allow Friend Requests"} on /><Toggle label={"Allow Private Match Invites"} on /><Toggle label={"Allow Spectators"} on /></Card>
            <Card title={"Referral Code"}><button className={"set-btn"}>Generate Referral Code</button></Card>
            <Save label={"Save Privacy Settings"} />
          </>)}

          {tab === "Social" && (<>
            <Card title={"Friend Settings"}><Toggle label={"Allow Friend Requests"} on /><Toggle label={"Chat Filter"} on /><Toggle label={"Emote Visibility"} on /></Card>
            <Card title={"Blocked Users"}><p className={"muted"}>No blocked users</p></Card>
            <Card title={"Muted Users"}><p className={"muted"}>No muted users</p></Card>
            <Save label={"Save Social Settings"} />
          </>)}

          {tab === "Appearance" && (<>
            <Card title={"Color Theme"}><div className={"seg"}>{["Light", "Dark"].map((t) => (<button key={t} className={theme === t ? "active" : ""} onClick={() => setTheme(t)}>{t}</button>))}</div></Card>
            <Card title={"Accent Color"}><div className={"accent-row"}>{accents.map((a) => (<button key={a} className={"accent-dot " + (accent === a ? "active" : "")} style={{ background: accentHex[a] }} onClick={() => setAccent(a)} />))}</div></Card>
            <Card title={"UI Density"}><div className={"seg"}>{["Comfortable", "Compact"].map((d) => (<button key={d} className={density === d ? "active" : ""} onClick={() => setDensity(d)}>{d}</button>))}</div></Card>
            <Card title={"Advanced"}><Toggle label={"Interface Animations"} on /><Toggle label={"Beta Features"} /><Toggle label={"Phone View Mode"} /></Card>
            <Save label={"Save Appearance"} />
          </>)}

          {tab === "Game Modes" && (<>
            <div className={"mode-card casual"}><h3>Casual</h3><p>Play freely with custom wagers. Choose your own wager, challenge friends, no ELO requirement. Good for side bets.</p></div>
            <div className={"mode-card ranked"}><h3>Ranked <span className={"lock-pill"}>1 Scalp · Locked</span></h3><p>Every ranked match is locked at exactly 1 Scalp so everyone risks the same stake. Matched by ELO, wins/losses affect rank, winner receives 1.94 Scalps (97% of pot).</p></div>
            <div className={"mode-card tourney"}><h3>Tournaments</h3><p>Fixed buy-in events with larger prize pools. Entry fee set by the event, bracket or round-robin format, top finishers earn the biggest payouts.</p></div>
            <Card title={"Common Questions"}><div className={"faq"}><strong>Why is ranked locked at 1 Scalp?</strong><p className={"muted"}>To keep ranked fair, everyone risks the same stake.</p></div><div className={"faq"}><strong>Can I play casual for free?</strong><p className={"muted"}>Casual lets you set any wager, including challenging friends.</p></div><div className={"faq"}><strong>How are tournament fees set?</strong><p className={"muted"}>Each event defines its own entry fee and prize split.</p></div></Card>
          </>)}

          {tab === "Danger Zone" && (<>
            <div className={"danger-banner"}>These actions are permanent or affect your whole account. Proceed carefully.</div>
            <Card title={"Account Actions"}><button className={"set-btn"}>Log Out of All Devices</button><button className={"set-btn"}>Temporarily Disable Account</button><button className={"set-btn"}>Clear Payment Methods</button><button className={"set-btn danger"}>Request Account Deletion</button></Card>
            <Card title={"Legal"}><a className={"set-link"}>Terms of Service</a><a className={"set-link"}>Privacy Policy</a></Card>
          </>)}
        </section>
      </div>
    </div>
  );
}
