import { Link, useLocation } from "react-router-dom";
import { useState, type ReactNode } from "react";
import "../pages/landing.css";

// Lightweight chrome for logged-out pages (landing, auth, public legal pages).
// Deliberately minimal — no app nav, balance pill or notifications — so guests
// see a clear "marketing" front door, not the signed-in product.
export default function PublicShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const onAuth = loc.pathname === "/login" || loc.pathname === "/signup";
  const [year] = useState(() => new Date().getFullYear());
  return (
    <div className="pub-shell">
      <div className="j-arena" aria-hidden="true" />
      <div className="j-arena-vignette" aria-hidden="true" />

      <header className="pub-nav">
        <div className="pub-nav__inner">
          <Link to="/" className="jango-logo" aria-label="Jango home">JANGO</Link>
          {!onAuth && (
            <nav className="pub-nav__actions">
              <Link to="/login" className="pub-link">Log in</Link>
              <Link to="/signup" className="pub-cta">Create account</Link>
            </nav>
          )}
        </div>
      </header>

      <main className="pub-main">{children}</main>

      <footer className="pub-footer">
        <div className="pub-footer__inner">
          <div className="pub-footer__brand">
            <span className="jango-logo sm">JANGO</span>
            <span className="pub-footer__tag">Skill-based competitive gaming.</span>
          </div>
          <nav className="pub-footer__links">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/fair-play">Fair Play</Link>
            <Link to="/responsible-gaming">Responsible Gaming</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <div className="pub-footer__legal">
            {"©"} {year} Jango.US — Players must be 18+. Play responsibly.
          </div>
        </div>
      </footer>
    </div>
  );
}
