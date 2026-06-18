import { ReactNode, useEffect, useRef, useState, CSSProperties } from "react";
import { Icon, IconName } from "./Icon";

/* =====================================================================
   JANGO JUICE LAYER - reusable reactive/dopamine components.
   Pairs with juice.css. No emojis. Respects reduced-motion + settings.
   ===================================================================== */

/* ---------- settings-aware feedback (haptics + sound) ---------- */
type FeedbackKind = "tap" | "success" | "reward" | "error";

function settingOn(key: string, fallback = true): boolean {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return v === "true" || v === "1" || v === "on";
  } catch { return fallback; }
}

/** Fire light haptics + (stubbed) sound for a meaningful action,
 *  honoring the user's haptics/sound settings. Safe on desktop. */
export function feedback(kind: FeedbackKind = "tap") {
  if (settingOn("jango.haptics", true) && typeof navigator !== "undefined" && "vibrate" in navigator) {
    const pattern = kind === "reward" ? [8, 30, 14] : kind === "success" ? [10, 20] : kind === "error" ? [24] : 8;
    try { navigator.vibrate(pattern); } catch {}
  }
  if (settingOn("jango.sound", false)) {
    // Sound is prepared/stubbed - no asset shipped yet, so this is a no-op hook.
    window.dispatchEvent(new CustomEvent("jango-sound", { detail: { kind } }));
  }
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Tone = "primary" | "secondary" | "accent" | "success" | "warning" | "gold";

/* ---------- PageHero ---------- */
export function PageHero(
  { eyebrow, title, gradWord, sub, action }:
  { eyebrow?: string; title: ReactNode; gradWord?: string; sub?: string; action?: ReactNode }
) {
  return (
    <div className="j-hero j-page">
      {eyebrow && <div className="j-hero-eyebrow">{eyebrow}</div>}
      <h1 className="j-hero-title">{title}{gradWord && <> <span className="grad">{gradWord}</span></>}</h1>
      {sub && <p className="j-hero-sub">{sub}</p>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

/* ---------- GlowCard / MotionCard ---------- */
export function GlowCard(
  { children, tone = "primary", hoverable = true, className = "", style, onClick }:
  { children: ReactNode; tone?: Tone; hoverable?: boolean; className?: string; style?: CSSProperties; onClick?: () => void }
) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
  };
  const cls = `j-card j-glow-${tone} ${hoverable ? "j-hoverable" : ""} ${className}`;
  return (
    <div ref={ref} className={cls} style={style} onMouseMove={onMove}
      onClick={onClick ? () => { feedback("tap"); onClick(); } : undefined}>
      {children}
    </div>
  );
}
export const MotionCard = GlowCard;

/* ---------- AnimatedButton ---------- */
export function AnimatedButton(
  { children, icon, variant = "grad", pulse = false, fbKind = "tap", className = "", onClick, ...rest }:
  { children: ReactNode; icon?: IconName; variant?: "grad" | "ghost"; pulse?: boolean; fbKind?: "tap"|"success"|"reward"|"error"; className?: string; onClick?: () => void } & React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const cls = `j-btn j-btn-${variant} ${pulse ? "j-pulse" : ""} ${className}`;
  return (
    <button className={cls} onClick={() => { feedback(fbKind); onClick && onClick(); }} {...rest}>
      {icon && <Icon name={icon} />}{children}
    </button>
  );
}

/* ---------- StatusPill ---------- */
export function StatusPill(
  { label, kind = "live", live = false }:
  { label: string; kind?: "live" | "soon" | "off" | "accent"; live?: boolean }
) {
  return (
    <span className={`j-pill j-pill-${kind}`}>
      <span className={`dot ${live ? "live" : ""}`} />{label}
    </span>
  );
}

/* ---------- ProgressGlow ---------- */
export function ProgressGlow(
  { value, max = 100, tone = "primary", animate = true }:
  { value: number; max?: number; tone?: "primary" | "gold" | "success"; animate?: boolean }
) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const [w, setW] = useState(animate ? 0 : pct);
  useEffect(() => {
    if (!animate || prefersReducedMotion()) { setW(pct); return; }
    const id = window.setTimeout(() => setW(pct), 120);
    return () => window.clearTimeout(id);
  }, [pct, animate]);
  const cls = `j-prog ${tone === "primary" ? "" : tone}`;
  return (<div className={cls}><div className="j-prog-fill" style={{ width: w + "%" }} /></div>);
}

/* ---------- ScapsBalance (animated count) ---------- */
export function ScapsBalance(
  { amount, label = "Scaps", size = "md" }:
  { amount: number; label?: string; size?: "sm" | "md" }
) {
  const [display, setDisplay] = useState(amount);
  const [bump, setBump] = useState(false);
  const prev = useRef(amount);
  useEffect(() => {
    const from = prev.current; const to = amount; prev.current = to;
    if (from === to) return;
    setBump(true); window.setTimeout(() => setBump(false), 520);
    if (prefersReducedMotion()) { setDisplay(to); return; }
    const steps = 20; let i = 0;
    const id = window.setInterval(() => {
      i++; const t = i / steps;
      setDisplay(Math.round((from + (to - from) * t) * 100) / 100);
      if (i >= steps) { setDisplay(to); window.clearInterval(id); }
    }, 22);
    return () => window.clearInterval(id);
  }, [amount]);
  return (
    <span className={`j-scaps ${bump ? "bump" : ""}`} style={size === "sm" ? { padding: "6px 12px" } : undefined}>
      <span className="coin">S</span>
      <span className="amt j-num">{display.toLocaleString(undefined, { minimumFractionDigits: display % 1 ? 2 : 0 })}</span>
      <span className="lbl">{label}</span>
    </span>
  );
}

/* ---------- RankBadge ---------- */
type RankTier = "bronze" | "silver" | "gold" | "plat" | "diamond" | "master" | "locked";
const RANK_ICON: Record<RankTier, IconName> = {
  bronze: "Shield", silver: "Shield", gold: "Crown", plat: "Gem", diamond: "Gem", master: "Crown", locked: "Lock",
};
export function RankBadge({ tier, className = "" }: { tier: RankTier; className?: string }) {
  return (<span className={`j-rank ${tier} ${className}`} aria-hidden="true"><Icon name={RANK_ICON[tier]} /></span>);
}

/* ---------- ActionModal ---------- */
export function ActionModal(
  { open, onClose, title, children, footer }:
  { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode }
) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="j-modal-back" onClick={onClose}>
      <div className="j-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="action-icon j-modal-close" aria-label="Close" onClick={onClose}><Icon name="Close" /></button>
        {title && <h2 style={{ margin: "0 0 14px", font: "800 21px/1.2 var(--font-head)" }}>{title}</h2>}
        <div>{children}</div>
        {footer && <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Reward popup + confetti ---------- */
/** Fire a celebratory reward popup (with confetti) from anywhere. */
export function rewardPop(title: string, sub?: string) {
  feedback("reward");
  window.dispatchEvent(new CustomEvent("jango-reward", { detail: { title, sub } }));
}

interface RewardItem { id: number; title: string; sub?: string; }

export function RewardLayer() {
  const [items, setItems] = useState<RewardItem[]>([]);
  const [burst, setBurst] = useState(0);
  useEffect(() => {
    let n = 0;
    const onReward = (e: Event) => {
      const d = (e as CustomEvent).detail as { title: string; sub?: string };
      const id = ++n;
      setItems((cur) => [...cur, { id, title: d.title, sub: d.sub }]);
      if (!prefersReducedMotion()) setBurst((b) => b + 1);
      window.setTimeout(() => setItems((cur) => cur.filter((x) => x.id !== id)), 3300);
    };
    window.addEventListener("jango-reward", onReward);
    return () => window.removeEventListener("jango-reward", onReward);
  }, []);
  const colors = ["#FF2D78", "#FF6A2C", "#FFC93C", "#36E66B", "#5B8CFF", "#C77DFF"];
  return (
    <>
      {burst > 0 && (
        <div className="j-confetti" key={burst}>
          {Array.from({ length: 70 }).map((_, i) => (
            <i key={i} style={{
              left: Math.random() * 100 + "%",
              background: colors[i % colors.length],
              animationDuration: 1.6 + Math.random() * 1.4 + "s",
              animationDelay: Math.random() * 0.3 + "s",
              transform: "scale(" + (0.7 + Math.random()) + ")",
            }} />
          ))}
        </div>
      )}
      <div className="j-reward-pop">
        {items.map((it) => (
          <div key={it.id} className="j-reward-toast">
            <span className="ic"><Icon name="Sparkles" /></span>
            <span><div className="t1">{it.title}</div>{it.sub && <div className="t2">{it.sub}</div>}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Skeleton ---------- */
export function Skeleton({ h = 16, w = "100%", r = 10 }: { h?: number; w?: number | string; r?: number }) {
  return <div className="j-skel" style={{ height: h, width: w, borderRadius: r }} />;
}
