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
