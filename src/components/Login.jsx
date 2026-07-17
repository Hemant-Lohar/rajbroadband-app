import { useState, useRef, useEffect } from "react";
import { STAFF_EMAIL, BRAND } from "../config";
import { signIn } from "../lib/auth";
import { Lock as LockIcon, Spinner, WifiOff, Eye, EyeOff } from "./icons";

export default function Login({ online }) {
  const [email, setEmail] = useState(STAFF_EMAIL);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [reveal, setReveal] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  async function submit() {
    if (busy || !password) return;
    setBusy(true);
    setError("");
    try {
      await signIn(email.trim(), password);
      // useSession picks up the change and swaps the screen.
    } catch (err) {
      const msg = String(err?.message || "");
      if (/invalid login credentials/i.test(msg)) {
        setError("Wrong password. Try again.");
      } else if (/email not confirmed/i.test(msg)) {
        setError("This account isn’t confirmed yet. Ask your admin.");
      } else if (/failed to fetch|network/i.test(msg)) {
        setError("Can’t reach the server. Check your connection.");
      } else {
        setError(msg || "Could not sign in.");
      }
      setPassword("");
      setBusy(false);
      ref.current?.focus();
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center overflow-y-auto px-6 py-10">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="mb-9 flex flex-col items-center text-center">
          <img
            src="/brand/logo-full.png"
            alt={BRAND.name}
            className="mb-5 w-52 max-w-full"
            draggable="false"
          />
          <p className="text-sm text-muted">{BRAND.tagline} · staff sign in</p>
        </div>

        {!online && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-[13px] text-muted">
            <WifiOff size={16} />
            You’re offline — sign in needs a connection.
          </div>
        )}

        <div className="space-y-3">
          {showEmail && (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="username"
              placeholder="Email"
              className="w-full rounded-2xl border border-hairline bg-white px-4 py-3.5 text-base shadow-card outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:text-[15px]"
            />
          )}

          <div
            className={`flex items-center gap-2 rounded-2xl border bg-white px-4 shadow-card transition-colors ${
              error
                ? "border-red-400 ring-2 ring-red-100"
                : "border-hairline focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100"
            }`}
          >
            <LockIcon size={18} className="shrink-0 text-muted" />
            <input
              ref={ref}
              type={reveal ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              placeholder="Staff password"
              className="w-full bg-transparent py-3.5 text-base outline-none placeholder:text-muted/70 sm:text-[15px]"
            />
            {password && (
              <button
                type="button"
                onClick={() => setReveal((r) => !r)}
                className="-mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition hover:text-ink active:scale-90"
                aria-label={reveal ? "Hide password" : "Show password"}
                aria-pressed={reveal}
              >
                {reveal ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>

          {error && (
            <p className="px-1 text-sm text-red-600 animate-fade-in">{error}</p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={busy || !online || !password}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
          >
            {busy ? (
              <>
                <Spinner size={18} /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </div>

        <button
          onClick={() => setShowEmail((s) => !s)}
          className="mx-auto mt-6 block text-xs text-muted underline-offset-2 hover:underline"
        >
          {showEmail
            ? "Use the default account"
            : "Sign in with a different email"}
        </button>
      </div>
    </div>
  );
}
