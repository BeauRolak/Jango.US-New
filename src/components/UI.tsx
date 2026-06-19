import { ReactNode, ButtonHTMLAttributes, useEffect, useState } from "react";
import { Icon, IconName } from "./Icon";
import "./UI.css";

/* ---------- Page header ---------- */
export function PageHeader(
  { title, sub, subtitle, action }:
  { title: string; sub?: string; subtitle?: string; action?: ReactNode }
) {
  const s = subtitle ?? sub;
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {s && <p className="page-sub">{s}</p>}
      </div>
      {action && <div className="page-action">{action}</div>}
    </div>
  );
}

/* ---------- Card ---------- */
export function Card(
  { children, className = "", ...rest }:
  { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>
) {
  return <div className={`motion-card shine-sweep card ${className}`} {...rest}>{children}</div>;
}

/* ---------- Button ---------- */
export function Btn(
  { children, variant = "primary", className = "", ...rest }:
  { children: ReactNode; variant?: "primary" | "ghost" | "secondary" | "danger" | "accent" | "gold" } & ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button className={`motion-button btn btn-${variant} ${className}`} {...rest}>{children}</button>
  );
}

/* ---------- Stat ---------- */
export function Stat(
  { value, label }: { value: ReactNode; label: string }
) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/* ---------- Tag ---------- */
export function Tag(
  { children, className = "", color }:
  { children: ReactNode; className?: string; color?: string }
) {
  const colorClass = color ? `tag-${color}` : "";
  return <span className={`tag ${colorClass} ${className}`}>{children}</span>;
}

/* ---------- Placeholder ---------- */
export function Placeholder(
  { title, sub, badge }: { title: string; sub?: string; badge?: string }
) {
  return (
    <div className="placeholder">
      {badge && <span className="placeholder-badge">{badge}</span>}
      <h3>{title}</h3>
      {sub && <p>{sub}</p>}
    </div>
  );
}

/* ---------- Toast system ---------- */
export type ToastType = "success" | "error" | "info" | "reward";

const TOAST_ICON: Record<ToastType, IconName> = {
  success: "CheckCircle",
  error: "AlertCircle",
  info: "Info",
  reward: "Sparkles",
};

export function toast(message: string, type: ToastType = "info") {
  window.dispatchEvent(new CustomEvent("jango-toast", { detail: { message, type } }));
}

interface ToastItem { id: number; message: string; type: ToastType; }

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    let n = 0;
    const onToast = (e: Event) => {
      const d = (e as CustomEvent).detail as { message: string; type: ToastType };
      const id = ++n;
      setItems((cur) => [...cur, { id, message: d.message, type: d.type }]);
      window.setTimeout(() => setItems((cur) => cur.filter((t) => t.id !== id)), 3200);
    };
    window.addEventListener("jango-toast", onToast);
    return () => window.removeEventListener("jango-toast", onToast);
  }, []);
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast-enter toast toast-${t.type}`}>
          <span className="toast-ic" aria-hidden="true"><Icon name={TOAST_ICON[t.type]} /></span>
          <span className="toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
