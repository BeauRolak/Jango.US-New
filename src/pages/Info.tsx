import { Link } from "react-router-dom";
import type { ReactNode, ComponentProps } from "react";
import { Icon } from "../components/Icon";
import "./pages.css";
import "./info.css";

const UPDATED = "June 18, 2026";

function InfoShell({
  title,
  icon,
  tag,
  children,
}: {
  title: string;
  icon: ComponentProps<typeof Icon>["name"];
  tag: string;
  children: ReactNode;
}) {
  return (
    <div className="info-page">
      <div className="info-hero ds-card">
        <div className="info-hero-icon">
          <Icon name={icon} />
        </div>
        <div className="info-hero-text">
          <h1 className="ds-grad-text">{title}</h1>
          <p>{tag}</p>
        </div>
      </div>
      <div className="info-draft">
        <Icon name="AlertCircle" />
        <span>Draft &mdash; pending legal review. Not yet binding.</span>
      </div>
      <div className="info-body ds-card">{children}</div>
      <div className="info-meta">
        <span>Last updated: {UPDATED}</span>
        <Link to="/" className="info-back">Back to Dashboard</Link>
      </div>
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="info-section">
      <h2>{heading}</h2>
      {children}
    </section>
  );
}

export function Terms() {
  return (
    <InfoShell title="Terms of Service" icon="Scale" tag="The rules of competing on Jango.US.">
      <Section heading="1. Acceptance">
        <p>By creating an account or playing on Jango.US you agree to these Terms. If you do not agree, do not use the platform. You must be at least 18 years old (or the age of majority in your jurisdiction) to play for Scalps.</p>
      </Section>
      <Section heading="2. Skill-Based Competition">
        <p>Jango.US offers skill-based games where outcomes are determined predominantly by player skill, not chance. Matches may be played head-to-head or in tournaments. Practice and bot matches never involve real Scalps.</p>
      </Section>
      <Section heading="3. Scalps & The Platform Rake">
        <p>Scalps are in-platform credits (1 Scalp = $1 USD) used to enter wagered matches. When you win a wagered match, the pot is paid out minus a flat 3% platform rake. Example: two players each stake 10 Scalps for a 20-Scalp pot; the platform rake is 0.60 Scalps and the winner receives 19.40 Scalps.</p>
      </Section>
      <Section heading="4. Fair Play">
        <p>Cheating, collusion, automation, exploiting bugs, or using unauthorized third-party software is strictly prohibited and may result in forfeiture of Scalps and account termination. See our <Link to="/fair-play">Fair Play</Link> commitment.</p>
      </Section>
      <Section heading="5. Accounts">
        <p>You are responsible for keeping your credentials secure and for all activity under your account. One account per person. We may suspend accounts that violate these Terms.</p>
      </Section>
      <Section heading="6. Responsible Play">
        <p>Compete responsibly. Tools for setting limits and taking breaks are described in our <Link to="/responsible-gaming">Responsible Gaming</Link> policy.</p>
      </Section>
      <Section heading="7. Changes">
        <p>We may update these Terms. Material changes will be communicated in-app. Continued use after changes take effect constitutes acceptance.</p>
      </Section>
    </InfoShell>
  );
}

export function Privacy() {
  return (
    <InfoShell title="Privacy Policy" icon="Lock" tag="How we handle your data.">
      <Section heading="1. What We Collect">
        <p>Account details (email, username), gameplay data (matches, scores, rankings), and basic device/usage information needed to run the platform securely.</p>
      </Section>
      <Section heading="2. How We Use It">
        <p>To operate matchmaking, maintain leaderboards, prevent fraud and cheating, process in-platform Scalps transactions, and improve the experience. We do not sell your personal data.</p>
      </Section>
      <Section heading="3. Cookies & Local Storage">
        <p>We use local storage for preferences (such as sound, haptics, and appearance settings) and essential cookies to keep you signed in. You can clear these in your browser at any time.</p>
      </Section>
      <Section heading="4. Sharing">
        <p>We share data only with service providers required to run the platform (e.g., infrastructure and, where applicable, identity and payment processors) under appropriate safeguards, or where required by law.</p>
      </Section>
      <Section heading="5. Your Choices">
        <p>You may request access to or deletion of your data, and adjust privacy and social visibility in <Link to="/settings">Settings</Link>, subject to legal record-keeping obligations.</p>
      </Section>
      <Section heading="6. Security">
        <p>We use industry-standard measures to protect your data. No system is perfectly secure, so we encourage strong, unique passwords.</p>
      </Section>
      <Section heading="7. Contact">
        <p>Privacy questions? Reach us via the <Link to="/contact">Contact</Link> page.</p>
      </Section>
    </InfoShell>
  );
}

export function FairPlay() {
  return (
    <InfoShell title="Fair Play" icon="Shield" tag="A level arena for every competitor.">
      <Section heading="Our Commitment">
        <p>Jango.US is built on skill. Every match is designed so the better player wins &mdash; not the luckier one and never a cheater. Fair play is the product.</p>
      </Section>
      <Section heading="Bots Use No Real Scalps">
        <p>Practice and bot matches are for learning and warm-up. Bots never stake or win real Scalps, so you can train risk-free across three difficulty levels.</p>
      </Section>
      <Section heading="Transparent Economics">
        <p>Wagered matches show the full breakdown before you commit: each stake, the total pot, the flat 3% platform rake, and the exact winner payout. No hidden fees.</p>
      </Section>
      <Section heading="Anti-Cheat">
        <p>We actively monitor for automation, collusion, and exploits. Confirmed violations can result in match reversal, Scalp forfeiture, and account termination.</p>
      </Section>
      <Section heading="Balanced Matchmaking">
        <p>Ranked matchmaking pairs players of similar skill so games stay competitive and fair, and rankings reflect genuine performance.</p>
      </Section>
      <Section heading="Report a Concern">
        <p>Spotted something unfair? Tell us through the <Link to="/contact">Contact</Link> page and our team will review it.</p>
      </Section>
    </InfoShell>
  );
}

export function ResponsibleGaming() {
  return (
    <InfoShell title="Responsible Gaming" icon="AlertCircle" tag="Keep competing fun and in control.">
      <Section heading="Play For The Right Reasons">
        <p>Jango.US is entertainment and competition. It should never feel like a way to make money or recover losses. If it stops being fun, take a break.</p>
      </Section>
      <Section heading="Set Your Limits">
        <p>You can set deposit, spending, and session-time limits in <Link to="/settings">Settings</Link>. Limits take effect immediately and cannot be loosened until the cool-off window passes.</p>
      </Section>
      <Section heading="Reality Checks">
        <p>Optional in-session reminders show how long you have been playing so you can make a clear decision about continuing.</p>
      </Section>
      <Section heading="Self-Exclusion & Cool-Off">
        <p>Need space? You can take a cool-off period or self-exclude for a fixed term. During exclusion you cannot enter wagered matches.</p>
      </Section>
      <Section heading="18+ Only">
        <p>Wagered play is restricted to adults (18+, or the age of majority where you live). We take age verification seriously.</p>
      </Section>
      <Section heading="Get Support">
        <p>If gaming is affecting your life, confidential help is available. Many regions offer free, 24/7 support lines. Reach out to us via <Link to="/contact">Contact</Link> and we will point you to local resources.</p>
      </Section>
    </InfoShell>
  );
}

export function Contact() {
  return (
    <InfoShell title="Contact" icon="Message" tag="We are here to help.">
      <Section heading="Support">
        <p>Questions about your account, Scalps, or a match? Our support team aims to respond within one business day.</p>
        <div className="info-contact-grid">
          <div className="info-contact-card ds-card">
            <div className="info-contact-icon"><Icon name="Message" /></div>
            <h3>General Support</h3>
            <p>support@jango.us</p>
          </div>
          <div className="info-contact-card ds-card">
            <div className="info-contact-icon"><Icon name="Shield" /></div>
            <h3>Trust &amp; Safety</h3>
            <p>safety@jango.us</p>
          </div>
          <div className="info-contact-card ds-card">
            <div className="info-contact-icon"><Icon name="Scale" /></div>
            <h3>Legal &amp; Privacy</h3>
            <p>legal@jango.us</p>
          </div>
        </div>
      </Section>
      <Section heading="Before You Reach Out">
        <p>Many answers live in our <Link to="/terms">Terms</Link>, <Link to="/privacy">Privacy Policy</Link>, and <Link to="/fair-play">Fair Play</Link> pages. For play-time controls, see <Link to="/responsible-gaming">Responsible Gaming</Link>.</p>
      </Section>
      <Section heading="Response Times">
        <p>Support is monitored daily. Trust &amp; Safety reports are prioritized. Please include your username and any relevant match IDs.</p>
      </Section>
    </InfoShell>
  );
}
