// Platform-experience mock state (onboarding + daily rewards/streaks).
// All persisted in localStorage for the demo — no backend, no real money.
// Structures are intentionally simple so a real API can replace them later.
import { useCallback, useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/* Onboarding                                                          */
/* ------------------------------------------------------------------ */
const ONBOARD_KEY = "jango_onboarded";
const ONBOARD_EVENT = "jango:onboarding";

export function isOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  try { return localStorage.getItem(ONBOARD_KEY) === "1"; } catch { return true; }
}
export function setOnboarded(done: boolean) {
  try {
    if (done) localStorage.setItem(ONBOARD_KEY, "1");
    else localStorage.removeItem(ONBOARD_KEY);
    window.dispatchEvent(new CustomEvent(ONBOARD_EVENT));
  } catch {}
}

/** Live onboarding-completion flag, shared across the app. */
export function useOnboarding() {
  const [done, setDone] = useState<boolean>(isOnboarded);
  useEffect(() => {
    const sync = () => setDone(isOnboarded());
    window.addEventListener(ONBOARD_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(ONBOARD_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  const complete = useCallback(() => setOnboarded(true), []);
  const reset = useCallback(() => setOnboarded(false), []);
  return { done, complete, reset };
}

/* ------------------------------------------------------------------ */
/* Daily rewards + streaks                                             */
/* ------------------------------------------------------------------ */
const DAILY_KEY = "jango_daily";
const DAILY_EVENT = "jango:daily";

export type RewardKind = "scalps" | "xp" | "cosmetic" | "badge" | "ticket";
export interface DailyReward { day: number; kind: RewardKind; amount?: number; label: string }

/** The 7-day reward cycle. Day 7 is the big payoff. */
export const DAILY_TRACK: DailyReward[] = [
  { day: 1, kind: "scalps", amount: 25, label: "Ⓢ 25" },
  { day: 2, kind: "scalps", amount: 40, label: "Ⓢ 40" },
  { day: 3, kind: "xp", amount: 150, label: "150 XP" },
  { day: 4, kind: "cosmetic", label: "Arena frame" },
  { day: 5, kind: "scalps", amount: 80, label: "Ⓢ 80" },
  { day: 6, kind: "badge", label: "Streak badge" },
  { day: 7, kind: "ticket", label: "Tourney ticket + Ⓢ 150", amount: 150 },
];

interface DailyState { lastClaim: string | null; streak: number; best: number }

function todayStr(): string {
  // Local date as YYYY-MM-DD so the demo "resets" at local midnight.
  return new Date().toLocaleDateString("en-CA");
}
function yesterdayStr(): string {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toLocaleDateString("en-CA");
}
function readDaily(): DailyState {
  if (typeof window === "undefined") return { lastClaim: null, streak: 0, best: 0 };
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return { lastClaim: null, streak: 0, best: 0 };
    const p = JSON.parse(raw);
    return { lastClaim: p.lastClaim ?? null, streak: p.streak ?? 0, best: p.best ?? 0 };
  } catch { return { lastClaim: null, streak: 0, best: 0 }; }
}
function writeDaily(s: DailyState) {
  try { localStorage.setItem(DAILY_KEY, JSON.stringify(s)); window.dispatchEvent(new CustomEvent(DAILY_EVENT)); } catch {}
}

export interface DailyView {
  streak: number;
  best: number;
  /** Day index (1-7) that is claimable today, or already shown as today's. */
  todayDay: number;
  canClaim: boolean;
  /** Reward that today's claim grants. */
  todayReward: DailyReward;
  /** Per-day state for the 7-card track. */
  states: ("claimed" | "claimable" | "locked")[];
  claim: () => DailyReward | null;
}

/** Live daily-reward view + claim action. Pure mock state. */
export function useDailyRewards(): DailyView {
  const [state, setState] = useState<DailyState>(readDaily);
  useEffect(() => {
    const sync = () => setState(readDaily());
    window.addEventListener(DAILY_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(DAILY_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);

  const today = todayStr();
  const claimedToday = state.lastClaim === today;
  // Effective streak (already-claimed-today counts; otherwise the streak the next claim will reach)
  const nextStreak = claimedToday
    ? state.streak
    : state.lastClaim === yesterdayStr() ? state.streak + 1 : 1;
  const cyclePos = ((nextStreak - 1) % 7) + 1; // 1..7
  const todayDay = cyclePos;
  const canClaim = !claimedToday;
  const todayReward = DAILY_TRACK[todayDay - 1];

  const states: ("claimed" | "claimable" | "locked")[] = DAILY_TRACK.map((r) => {
    if (r.day < todayDay) return "claimed";
    if (r.day === todayDay) return claimedToday ? "claimed" : "claimable";
    return "locked";
  });

  const claim = useCallback((): DailyReward | null => {
    const cur = readDaily();
    if (cur.lastClaim === todayStr()) return null;
    const streak = cur.lastClaim === yesterdayStr() ? cur.streak + 1 : 1;
    const best = Math.max(cur.best, streak);
    writeDaily({ lastClaim: todayStr(), streak, best });
    const pos = ((streak - 1) % 7) + 1;
    return DAILY_TRACK[pos - 1];
  }, []);

  return { streak: claimedToday ? state.streak : nextStreak - 1, best: state.best, todayDay, canClaim, todayReward, states, claim };
}
