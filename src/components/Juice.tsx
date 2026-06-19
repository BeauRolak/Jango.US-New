import { ReactNode, useEffect, useRef, useState, CSSProperties } from "react";
import { Icon, IconName } from "./Icon";

/* =====================================================================
   JANGO JUICE LAYER - reusable reactive/dopamine components.
   Pairs with juice.css. No emojis. Respects reduced-motion + settings.
   ===================================================================== */



/** Fire light haptics + (stubbed) sound for a meaningful action,
 *  honoring the user's haptics/sound settings. Safe on desktop. */
// ---------- Feedback engine: sound + haptics + effects ----------
const FB_KEYS = { sound: "jango_sound", haptics: "jango_haptics", intensity: "jango_intensity" };

export function getFeedbackSettings() {
  let sound = true, haptics = true, intensity = "normal";
  try {
    const s = localStorage.getItem(FB_KEYS.sound); if (s !== null) sound = s === "1";
    const h = localStorage.getItem(FB_KEYS.haptics); if (h !== null) haptics = h === "1";
    const i = localStorage.getItem(FB_KEYS.intensity); if (i) intensity = i;
  } catch {}
  return { sound, haptics, intensity };
}
export function setFeedbackSetting(key: "sound" | "haptics" | "intensity", value: boolean | string) {
  try {
    if (key === "intensity") localStorage.setItem(FB_KEYS.intensity, String(value));
    else localStorage.setItem(FB_KEYS[key], value ? "1" : "0");
    window.dispatchEvent(new CustomEvent("jango-feedback-settings"));
  } catch {}
}
function prefersReducedMotion() {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
}

// Web Audio synth: short, clean premium UI tones (stub — swap for files later via SOUND_FILES)
let _ctx: AudioContext | null = null;
function ctx() {
  if (typeof window === "undefined") return null;
  try {
    if (!_ctx) { const AC = (window as any).AudioContext || (window as any).webkitAudioContext; if (AC) _ctx = new AC(); }
    if (_ctx.state === "suspended") _ctx.resume();
    return _ctx;
  } catch { return null; }
}
type SoundTone = { f: number; t: number; type?: OscillatorType; g?: number; slide?: number };
const SOUND_MAP: Record<string, SoundTone[]> = {
  ui_click: [{ f: 420, t: 0.05, g: 0.05 }],
  ui_hover: [{ f: 660, t: 0.03, g: 0.02 }],
  success: [{ f: 600, t: 0.07, g: 0.05 }, { f: 880, t: 0.1, g: 0.05 }],
  error: [{ f: 220, t: 0.12, type: "sawtooth", g: 0.05, slide: -40 }],
  reward_claim: [{ f: 660, t: 0.08, g: 0.05 }, { f: 880, t: 0.08, g: 0.05 }, { f: 1175, t: 0.14, g: 0.06 }],
  purchase: [{ f: 520, t: 0.06, g: 0.05 }, { f: 780, t: 0.1, g: 0.05 }],
  equip: [{ f: 700, t: 0.05, g: 0.04 }, { f: 1040, t: 0.09, g: 0.05 }],
  tournament_join: [{ f: 440, t: 0.07, g: 0.05 }, { f: 660, t: 0.07, g: 0.05 }, { f: 990, t: 0.12, g: 0.06 }],
  rank_up: [{ f: 523, t: 0.09, g: 0.06 }, { f: 659, t: 0.09, g: 0.06 }, { f: 784, t: 0.09, g: 0.06 }, { f: 1047, t: 0.16, g: 0.07 }],
  notification: [{ f: 880, t: 0.06, g: 0.04 }, { f: 1175, t: 0.08, g: 0.04 }],
};
// SOUND_FILES: drop real assets here later, takes priority over synth
const SOUND_FILES: Record<string, string> = {};
const _buffers: Record<string, HTMLAudioElement> = {};

export function playSound(event: string) {
  const { sound, intensity } = getFeedbackSettings();
  if (!sound) return;
  const vol = intensity === "low" ? 0.5 : intensity === "high" ? 1.3 : 1;
  if (SOUND_FILES[event]) {
    try {
      let a = _buffers[event];
      if (!a) { a = new Audio(SOUND_FILES[event]); _buffers[event] = a; }
      a.currentTime = 0; a.volume = Math.min(1, 0.6 * vol); a.play().catch(() => {});
    } catch {}
    return;
  }
  const tones = SOUND_MAP[event] || SOUND_MAP.ui_click;
  const c = ctx(); if (!c) return;
  let when = c.currentTime;
  for (const tone of tones) {
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = tone.type || "sine";
      osc.frequency.setValueAtTime(tone.f, when);
      if (tone.slide) osc.frequency.linearRampToValueAtTime(tone.f + tone.slide, when + tone.t);
      const peak = (tone.g ?? 0.05) * vol;
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(peak, when + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + tone.t);
      osc.connect(gain); gain.connect(c.destination);
      osc.start(when); osc.stop(when + tone.t + 0.02);
      when += tone.t * 0.85;
    } catch {}
  }
}

const HAPTIC_MAP: Record<string, number | number[]> = {
  light: 10, medium: [18], confirm: [20, 30, 20],
  success: [20, 30, 20], error: [50, 40, 50], reward: [25, 40, 25, 40, 50], rank_up: [30, 40, 30, 40, 60],
};
export function triggerHaptic(type: string) {
  const { haptics, intensity } = getFeedbackSettings();
  if (!haptics || intensity === "low") return;
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  const pat = HAPTIC_MAP[type] ?? HAPTIC_MAP.light;
  try { navigator.vibrate(pat); } catch {}
}

export function triggerEffect(type: string, el?: HTMLElement | null) {
  if (prefersReducedMotion()) return;
  if (type === "reward" || type === "rank_up") { rewardPop(); return; }
  if (el) {
    const cls = type === "purchase" || type === "equip" ? "reward-pop" : type === "error" ? "j-pop" : "count-up";
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  }
}

// Unified event map: one call fires sound + haptic together
const EVENT_FEEDBACK: Record<string, { sound: string; haptic: string }> = {
  tap: { sound: "ui_click", haptic: "light" },
  click: { sound: "ui_click", haptic: "light" },
  hover: { sound: "ui_hover", haptic: "light" },
  success: { sound: "success", haptic: "success" },
  error: { sound: "error", haptic: "error" },
  reward: { sound: "reward_claim", haptic: "reward" },
  purchase: { sound: "purchase", haptic: "success" },
  equip: { sound: "equip", haptic: "success" },
  tournament_join: { sound: "tournament_join", haptic: "success" },
  save: { sound: "success", haptic: "success" },
  rank_up: { sound: "rank_up", haptic: "rank_up" },
  notification: { sound: "notification", haptic: "light" },
};

export function feedback(kind: string = "tap", el?: HTMLElement | null) {
  const map = EVENT_FEEDBACK[kind] || EVENT_FEEDBACK.tap;
  playSound(map.sound);
  triggerHaptic(map.haptic);
  if (kind === "reward" || kind === "rank_up") triggerEffect(kind, el);
  else if (el) triggerEffect(kind, el);
}

export function useFeedback() {
  return { fire: feedback, playSound, triggerHaptic, triggerEffect, getSettings: getFeedbackSettings };
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

/* ---------- ScalpsBalance (animated count) ---------- */
export function ScalpsBalance(
  { amount, label = "Scalps", size = "md" }:
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
    <span className={`j-scalps ${bump ? "bump" : ""}`} style={size === "sm" ? { padding: "6px 12px" } : undefined}>
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
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escalpe") onClose(); };
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
