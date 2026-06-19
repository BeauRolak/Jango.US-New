// Shared mock-data layer for Jango.US (A10).
// Single source of truth for the demo user's profile + Scalps balance.
// No real money moves anywhere; all values are in-platform demo credits.
import { useEffect, useState, useCallback } from "react";

export const SCALPS_KEY = "jango_scalps";
export const DEFAULT_BALANCE = 117.0;
const SCALPS_EVENT = "jango:scalps";

/** Canonical demo user profile, reused across pages so stats never disagree. */
export const USER = {
  name: "Player",
  handle: "@player",
  rank: "Gold III",
  globalRank: 842,
  winRate: 57,
  matches: 128,
  wins: 73,
  losses: 55,
  streak: 4,
  level: 24,
} as const;

/** Read the current balance from storage (clamped, never negative). */
export function readScalps(): number {
  if (typeof window === "undefined") return DEFAULT_BALANCE;
  const raw = window.localStorage.getItem(SCALPS_KEY);
  const n = raw == null ? DEFAULT_BALANCE : Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_BALANCE;
}

/** Write the balance and notify every listener in this tab. */
export function writeScalps(next: number): number {
  const v = Math.max(0, Math.round(next * 100) / 100);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SCALPS_KEY, String(v));
    window.dispatchEvent(new CustomEvent(SCALPS_EVENT, { detail: v }));
  }
  return v;
}

/** Format Scalps the way the UI shows them: 1,234.00 */
export function formatScalps(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * useScalps — live, shared Scalps balance.
 * Every component that calls this stays in sync (top bar, wallet, deposit, games)
 * via a custom event + the cross-tab storage event.
 */
export function useScalps() {
  const [balance, setBalance] = useState<number>(readScalps);

  useEffect(() => {
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      setBalance(typeof detail === "number" ? detail : readScalps());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === SCALPS_KEY) setBalance(readScalps());
    };
    window.addEventListener(SCALPS_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(SCALPS_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const set = useCallback((n: number) => setBalance(writeScalps(n)), []);
  const add = useCallback((n: number) => setBalance(writeScalps(readScalps() + n)), []);
  const spend = useCallback((n: number) => setBalance(writeScalps(readScalps() - n)), []);

  return { balance, formatted: formatScalps(balance), set, add, spend };
}

export type Notification = {
  id: string;
  icon: "Trophy" | "Swords" | "Coins" | "Users" | "Bell" | "Flame";
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

/** Demo notifications shown in the top-bar bell panel (A7). */
export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    icon: "Swords",
    title: "Match found",
    body: "Your ranked Mini Golf match vs ShadowAce is ready.",
    time: "2m ago",
    unread: true,
  },
  {
    id: "n2",
    icon: "Trophy",
    title: "Tournament starting soon",
    body: "Friday Night Showdown begins in 15 minutes.",
    time: "12m ago",
    unread: true,
  },
  {
    id: "n3",
    icon: "Coins",
    title: "Payout received",
    body: "You won 19.40 Scalps (pot 20.00, 3% rake).",
    time: "1h ago",
    unread: true,
  },
  {
    id: "n4",
    icon: "Users",
    title: "Friend request",
    body: "NovaStrike wants to add you as a friend.",
    time: "3h ago",
    unread: false,
  },
  {
    id: "n5",
    icon: "Flame",
    title: "Daily streak",
    body: "You are on a 4-day win streak. Keep it going!",
    time: "Yesterday",
    unread: false,
  },
];
