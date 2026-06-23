import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { ReactNode, useState, useEffect } from 'react';
import './Layout.css';
import { Icon, type IconName } from "./Icon";
import { useScalps, NOTIFICATIONS } from "../lib/mockData";
import { useAuth } from "../lib/auth";
import { OnboardingFlow } from "./Onboarding";
import { useOnboarding } from "../lib/platform";

const MOBILE_NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Home', icon: 'Home' },
  { to: '/play', label: 'Play', icon: 'Gamepad' },
  { to: '/rewards', label: 'Rewards', icon: 'Calendar' },
  { to: '/social', label: 'Social', icon: 'Users' },
  { to: '/profile', label: 'Profile', icon: 'Trophy' },
];

const COMPETE = [
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/clans', label: 'Clans' },
  { to: '/battle-pass', label: 'Battle Pass' },
  { to: '/rewards', label: 'Daily Rewards' },
  { to: '/story', label: 'Arena Origins' },
  { to: '/rank-progression', label: 'Rank Track' },
  { to: '/tutorial', label: 'Training' },
];

const AVATAR_MENU = [
  { to: '/social', label: 'Friends' }, { to: '/play', label: 'Private Match' },
  { to: '/', label: 'Dashboard' }, { to: '/leaderboard', label: 'Global Stats' },
  { to: '/clans', label: 'Clans' }, { to: '/wallet', label: 'Wallet' },
  { to: '/wallet', label: 'Transaction History' }, { to: '/battle-pass', label: 'Battle Pass' },
  { to: '/profile', label: 'Profile' }, { to: '/rewards', label: 'Daily Rewards' },
  { to: '/rank-progression', label: 'Rank Track' },
  { to: '/tutorial', label: 'Training Arena' }, { to: '/settings', label: 'Settings' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();
  const { formatted } = useScalps();
  const { user, logout } = useAuth();
  const { done: onboarded } = useOnboarding();
  const [obOpen, setObOpen] = useState(false);
  // Auto-open onboarding on first authenticated visit; allow re-opening via event.
  useEffect(() => { if (user && !onboarded) setObOpen(true); }, [user, onboarded]);
  useEffect(() => {
    const open = () => setObOpen(true);
    window.addEventListener("jango:open-onboarding", open);
    return () => window.removeEventListener("jango:open-onboarding", open);
  }, []);
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;
  const close = () => { setMenu(null); setMobileOpen(false); };
  const toggle = (k: string) => setMenu(menu === k ? null : k);
  const displayName = user?.username || "Player";
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const signOut = () => { close(); logout(); navigate("/", { replace: true }); };
  return (
    <div className="app-shell">
      <div className="j-arena" aria-hidden="true" />
      <div className="j-arena-vignette" aria-hidden="true" />
      <header className="topnav">
        <div className="topnav-inner">
          <Link to="/" className="jango-logo" onClick={close}>JANGO</Link>
          <nav className="topnav-links">
            <NavLink to="/play" className={({isActive})=> isActive ? 'tnl active' : 'tnl'}>Play</NavLink>
            <div className="tnl-drop">
              <button className={'tnl' + (menu==='compete' ? ' active' : '')} onClick={()=>toggle('compete')}>Compete <span className="caret">{'\u25BE'}</span></button>
              {menu==='compete' && (
                <div className="dropdown">
                  {COMPETE.map(c => <Link key={c.label} to={c.to} className="dd-item" onClick={close}>{c.label}</Link>)}
                </div>
              )}
            </div>
            <NavLink to="/social" className={({isActive})=> isActive ? 'tnl active' : 'tnl'}>Social</NavLink>
            <NavLink to="/shop" className={({isActive})=> isActive ? 'tnl active' : 'tnl'}>Shop</NavLink>
          </nav>
          <div className="topnav-right">
            <div className="tnl-drop">
              <button
                className="icon-btn bell"
                aria-label="Notifications"
                onClick={() => toggle("notif")}
              >
                <Icon name="Bell" />
                {unread > 0 && <span className="badge">{unread}</span>}
              </button>
              {menu === "notif" && (
                <div className="dropdown dropdown-right notif-dd">
                  <div className="dd-head notif-head">
                    <div className="dd-name">Notifications</div>
                    <div className="notif-count">{unread} new</div>
                  </div>
                  <div className="notif-list">
                    {NOTIFICATIONS.map((n) => (
                      <div
                        key={n.id}
                        className={"notif-item" + (n.unread ? " unread" : "")}
                      >
                        <span className="notif-icon">
                          <Icon name={n.icon} />
                        </span>
                        <span className="notif-text">
                          <span className="notif-title">{n.title}</span>
                          <span className="notif-body">{n.body}</span>
                          <span className="notif-time">{n.time}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link to="/social" className="notif-all" onClick={close}>
                    View all activity
                  </Link>
                </div>
              )}
            </div>
            <Link to="/wallet" className="balance-pill"><span className="coin">S</span><span className="balance-num">{formatted}</span><span className="bal-plus">+</span></Link>
            <div className="tnl-drop">
              <button className="avatar-btn" onClick={()=>toggle('avatar')} aria-label="Account menu">{avatarInitial}<span className="rank-dot" /></button>
              {menu==='avatar' && (
                <div className="dropdown dropdown-right">
                  <div className="dd-head"><div className="dd-name">{displayName}</div><div className="dd-email">{user?.email || "player@jango.us"}</div></div>
                  {AVATAR_MENU.map((c,i) => <Link key={i} to={c.to} className="dd-item" onClick={close}>{c.label}</Link>)}
                  <button className="dd-item dd-signout" onClick={signOut}>Sign Out</button>
                </div>
              )}
            </div>
            <button className="hamburger" onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Menu">{'\u2630'}</button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="mobile-menu">
            <Link to="/play" className="mm-item" onClick={close}>Play</Link>
            <Link to="/leaderboard" className="mm-item" onClick={close}>Leaderboard</Link>
            <Link to="/tournaments" className="mm-item" onClick={close}>Tournaments</Link>
            <Link to="/social" className="mm-item" onClick={close}>Social</Link>
            <Link to="/rewards" className="mm-item" onClick={close}>Daily Rewards</Link>
            <Link to="/shop" className="mm-item" onClick={close}>Shop</Link>
            <Link to="/wallet" className="mm-item" onClick={close}>Wallet</Link>
            <Link to="/profile" className="mm-item" onClick={close}>Profile</Link>
            <Link to="/settings" className="mm-item" onClick={close}>Settings</Link>
          </nav>
        )}
      </header>
      {menu && <div className="menu-scrim" onClick={close} />}
      <main className="content" key={loc.pathname}>{children}</main>
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand"><span className="jango-logo sm">JANGO</span><span className="footer-tag">Skill-based competitive gaming platform</span></div>
          <div className="footer-links">
            <Link to="/terms">Terms of Service</Link><Link to="/privacy">Privacy Policy</Link>
            <Link to="/contact">Contact</Link><Link to="/fair-play">Fair Play</Link>
            <Link to="/responsible-gaming">Responsible Gaming</Link>
          </div>
          <div className="footer-legal">{'\u00A9'} 2026 Jango.us. All rights reserved. <span className="footer-18">Players must be 18+. Play responsibly.</span></div>
        </div>
      </footer>
      <nav className="mobile-bottomnav" aria-label="Primary">
        {MOBILE_NAV.map((m) => (
          <NavLink key={m.to} to={m.to} end={m.to === '/'} className={({ isActive }) => 'mbn-item' + (isActive ? ' active' : '')}>
            <Icon name={m.icon} /><span>{m.label}</span>
          </NavLink>
        ))}
      </nav>
      <OnboardingFlow open={obOpen} onClose={() => setObOpen(false)} />
    </div>
  );
}
