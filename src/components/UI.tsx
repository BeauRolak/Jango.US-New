import { useEffect, useState } from "react";
import React from 'react';
import './UI.css';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {action && <div className="page-action">{action}</div>}
    </div>
  );
}

export function Card({ children, className = '', glow = false, ...rest }: React.HTMLAttributes<HTMLDivElement> & { glow?: boolean }) {
  return (
    <div className={'card ' + (glow ? 'card-glow ' : '') + className} {...rest}>
      {children}
    </div>
  );
}

export function Btn({ children, variant = 'primary', className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'accent' | 'gold' }) {
  return (
    <button className={'btn btn-' + variant + ' ' + className} {...rest}>
      {children}
    </button>
  );
}

export function Stat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="stat">
      <div className="stat-value" style={accent ? { color: accent } : undefined}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function Tag({ children, color = 'neon' }: { children: React.ReactNode; color?: 'neon' | 'green' | 'gold' | 'accent' }) {
  return <span className={'tag tag-' + color}>{children}</span>;
}

export function Placeholder({ title, note }: { title: string; note?: string }) {
  return (
    <Card className="placeholder">
      <div className="placeholder-badge">Coming soon</div>
      <h2>{title}</h2>
      <p>{note || 'This section is part of the rebuild and will be wired up next.'}</p>
    </Card>
  );
}


// ===== Toast system (event-based, no provider needed) =====
export type ToastType = "success" | "error" | "info" | "reward";
export function toast(message: string, type: ToastType = "info") {
  window.dispatchEvent(new CustomEvent("jango-toast", { detail: { message, type, id: Date.now() + Math.random() } }));
}
interface ToastItem { id: number; message: string; type: ToastType; }
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    const onToast = (e: Event) => {
      const d = (e as CustomEvent).detail as ToastItem;
      setItems((prev) => [...prev, d]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== d.id)), 3200);
    };
    window.addEventListener("jango-toast", onToast);
    return () => window.removeEventListener("jango-toast", onToast);
  }, []);
  const icon: Record<ToastType, string> = { success: "✓", error: "✕", info: "i", reward: "★" };
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={"toast toast-" + t.type}>
          <span className="toast-ic">{icon[t.type]}</span>
          <span className="toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
