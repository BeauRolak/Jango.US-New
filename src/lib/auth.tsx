// ---------------------------------------------------------------------------
// Jango.US — client-side mock auth.
// There is no backend yet, so accounts live in localStorage. This is a stand-in
// for a real auth service: same shape (signup / login / logout / session), so
// swapping in a real API later only means replacing the bodies below.
// NOTE: passwords are stored in plaintext in localStorage — acceptable ONLY for
// this gated demo; never ship this against real money.
// ---------------------------------------------------------------------------
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type User = { email: string; username: string };
type Account = User & { password: string };

const ACCOUNTS_KEY = "jango_accounts";
const SESSION_KEY = "jango_session";

function readAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Account[]) : [];
  } catch {
    return [];
  }
}
function writeAccounts(list: Account[]) {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list)); } catch {}
}
function readSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

type AuthResult = { ok: true; user: User } | { ok: false; error: string };

type AuthContextValue = {
  user: User | null;
  signup: (input: { email: string; username: string; password: string }) => Promise<AuthResult>;
  login: (input: { email: string; password: string }) => Promise<AuthResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Tiny delay so the UI can show a real loading state (mimics a network round-trip).
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readSession());

  // Keep tabs in sync if the user logs in/out elsewhere.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) setUser(readSession());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persistSession = useCallback((u: User | null) => {
    try {
      if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      else localStorage.removeItem(SESSION_KEY);
    } catch {}
    setUser(u);
  }, []);

  const signup = useCallback<AuthContextValue["signup"]>(async ({ email, username, password }) => {
    await wait(550);
    const e = email.trim().toLowerCase();
    const u = username.trim();
    if (!u) return { ok: false, error: "Choose a username." };
    if (!isValidEmail(e)) return { ok: false, error: "Enter a valid email address." };
    if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
    const accounts = readAccounts();
    if (accounts.some((a) => a.email === e)) {
      return { ok: false, error: "An account with that email already exists." };
    }
    const account: Account = { email: e, username: u, password };
    writeAccounts([...accounts, account]);
    const session: User = { email: e, username: u };
    persistSession(session);
    return { ok: true, user: session };
  }, [persistSession]);

  const login = useCallback<AuthContextValue["login"]>(async ({ email, password }) => {
    await wait(450);
    const e = email.trim().toLowerCase();
    if (!isValidEmail(e)) return { ok: false, error: "Enter a valid email address." };
    const account = readAccounts().find((a) => a.email === e);
    if (!account || account.password !== password) {
      return { ok: false, error: "Email or password is incorrect." };
    }
    const session: User = { email: account.email, username: account.username };
    persistSession(session);
    return { ok: true, user: session };
  }, [persistSession]);

  const logout = useCallback(() => persistSession(null), [persistSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, signup, login, logout }),
    [user, signup, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
