import { NavLink, useLocation } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import './Layout.css';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '◉' },
  { to: '/games', label: 'Games', icon: '▶' },
  { to: '/tournaments', label: 'Tournaments', icon: '♦' },
  { to: '/rankings', label: 'Rankings', icon: '↑' },
  { to: '/shop', label: 'Shop', icon: '◆' },
  { to: '/training', label: 'Training', icon: '✱' },
  { to: '/social', label: 'Social', icon: '☺' },
  { to: '/story', label: 'Story', icon: '♛' },
  { to: '/profile', label: 'Profile', icon: '●' },
  { to: '/wallet', label: 'Wallet', icon: '¤' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  return (
    <div className="app-shell">
      <aside className={open ? 'side open' : 'side'}>
        <div className="brand">
          <span className="brand-mark">♛</span>
          <span className="brand-text neon-text">JANGO.US</span>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setOpen(false)}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <div className="mini-bal">
            <span className="text-dim">Scaps</span>
            <span className="bal-amt">1,250</span>
          </div>
        </div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="main-col">
        <header className="topbar">
          <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
          <div className="top-spacer" />
          <div className="top-actions">
            <div className="chip"><span className="chip-gold">¤</span> 1,250</div>
            <div className="chip">Gold III</div>
            <div className="avatar-sm">P</div>
          </div>
        </header>
        <main className="content" key={loc.pathname}>{children}</main>
      </div>
    </div>
  );
}
