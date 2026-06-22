import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PublicShell from "../components/PublicShell";
import { Icon } from "../components/Icon";
import { useAuth, isValidEmail } from "../lib/auth";
import "./auth.css";

type Mode = "login" | "signup";
type Errors = Partial<Record<"email" | "username" | "password" | "confirm" | "form", string>>;

export default function Auth({ mode }: { mode: Mode }) {
  const isSignup = mode === "signup";
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from || "/";

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!isValidEmail(email)) e.email = "Enter a valid email address.";
    if (isSignup && !username.trim()) e.username = "Choose a username.";
    if (password.length < 8) e.password = "At least 8 characters.";
    if (isSignup && confirm !== password) e.confirm = "Passwords don't match.";
    return e;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    const result = isSignup
      ? await signup({ email, username, password })
      : await login({ email, password });
    setBusy(false);

    if (result.ok) {
      navigate(from, { replace: true });
    } else {
      setErrors({ form: result.error });
    }
  }

  return (
    <PublicShell>
      <div className="auth">
        <div className="auth__card">
          <div className="auth__head">
            <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
            <p>
              {isSignup
                ? "Join the arena — free to start, no deposit to look around."
                : "Log in to enter the arena and pick up where you left off."}
            </p>
          </div>

          {errors.form && (
            <div className="auth__formerr" role="alert">
              <Icon name="AlertCircle" /> {errors.form}
            </div>
          )}

          <form className="auth__form" onSubmit={onSubmit} noValidate>
            <Field
              id="email" label="Email" type="email" value={email}
              autoComplete="email" placeholder="you@example.com"
              error={errors.email}
              onChange={(v) => { setEmail(v); if (errors.email) setErrors({ ...errors, email: undefined }); }}
            />

            {isSignup && (
              <Field
                id="username" label="Username" type="text" value={username}
                autoComplete="username" placeholder="ArenaChampion"
                error={errors.username}
                onChange={(v) => { setUsername(v); if (errors.username) setErrors({ ...errors, username: undefined }); }}
              />
            )}

            <div className="auth__field">
              <label htmlFor="password">Password</label>
              <div className={`auth__inputwrap${errors.password ? " has-error" : ""}`}>
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  placeholder={isSignup ? "At least 8 characters" : "Your password"}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-err" : undefined}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: undefined }); }}
                />
                <button
                  type="button" className="auth__pwtoggle"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <Icon name={showPw ? "AlertCircle" : "Info"} />
                  <span>{showPw ? "Hide" : "Show"}</span>
                </button>
              </div>
              {errors.password && <span id="password-err" className="auth__err">{errors.password}</span>}
            </div>

            {isSignup && (
              <Field
                id="confirm" label="Confirm password" type={showPw ? "text" : "password"}
                value={confirm} autoComplete="new-password" placeholder="Re-enter your password"
                error={errors.confirm}
                onChange={(v) => { setConfirm(v); if (errors.confirm) setErrors({ ...errors, confirm: undefined }); }}
              />
            )}

            <button type="submit" className={`auth__submit${busy ? " is-busy" : ""}`} disabled={busy}>
              {busy ? (
                <><span className="auth__spinner" aria-hidden="true" /> {isSignup ? "Creating account…" : "Logging in…"}</>
              ) : (
                <><Icon name={isSignup ? "Swords" : "ArrowRight"} /> {isSignup ? "Create account" : "Log in"}</>
              )}
            </button>
          </form>

          <div className="auth__switch">
            {isSignup ? (
              <>Already have an account? <Link to="/login">Log in</Link></>
            ) : (
              <>New to Jango? <Link to="/signup">Create an account</Link></>
            )}
          </div>

          <p className="auth__fine">
            <Icon name="Lock" /> Must be 18+. By continuing you agree to our{" "}
            <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </PublicShell>
  );
}

function Field({
  id, label, type, value, error, onChange, autoComplete, placeholder,
}: {
  id: string; label: string; type: string; value: string; error?: string;
  onChange: (v: string) => void; autoComplete?: string; placeholder?: string;
}) {
  return (
    <div className="auth__field">
      <label htmlFor={id}>{label}</label>
      <div className={`auth__inputwrap${error ? " has-error" : ""}`}>
        <input
          id={id} type={type} value={value} autoComplete={autoComplete} placeholder={placeholder}
          aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {error && <span id={`${id}-err`} className="auth__err">{error}</span>}
    </div>
  );
}
