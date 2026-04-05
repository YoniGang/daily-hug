import { useState } from "react";
import { Heart, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../data/AuthContext";

const inputClass =
  "w-full bg-white border border-warm-gray/50 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-peach-dark/30 transition";

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!name.trim()) return setError("אנא הזן/י שם");
      if (password.length < 6) return setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      if (password !== confirmPassword) return setError("הסיסמאות לא תואמות");
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, name.trim());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const subtitle = {
    login: "שמחים לראות אותך שוב",
    register: "בואו נתחיל את המסע יחד",
    forgot: "שכחת סיסמה?",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 bg-cream">
      <div className="w-full max-w-[360px] animate-[fadeIn_0.3s_ease-out]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-peach/50 mb-4">
            <Heart size={28} className="text-peach-dark" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">חיבוק יומי</h1>
          <p className="text-sm text-text-secondary mt-1">{subtitle[mode]}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_24px_rgba(0,0,0,0.04)] border border-warm-gray/40">
          {mode === "forgot" ? (
            <>
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors mb-4"
              >
                <ArrowRight size={14} />
                חזרה להתחברות
              </button>
              <div className="text-center space-y-3 py-2">
                <p className="text-sm text-text-primary leading-relaxed">
                  לאיפוס סיסמה, פנה/י למנהל/ת המערכת.
                </p>
                <p className="text-xs text-text-muted">
                  המנהל/ת יוכל/תוכל לאפס את הסיסמה שלך דרך לוח הניהול.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-1 mb-6 bg-warm-gray/30 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === "login" ? "bg-white text-text-primary shadow-sm" : "text-text-muted"
                  }`}
                >
                  התחברות
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(""); }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === "register" ? "bg-white text-text-primary shadow-sm" : "text-text-muted"
                  }`}
                >
                  הרשמה
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "register" && (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="השם שלך"
                    className={inputClass}
                    autoComplete="name"
                  />
                )}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="אימייל"
                  className={inputClass}
                  autoComplete="email"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="סיסמה"
                  className={inputClass}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
                {mode === "register" && (
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="אימות סיסמה"
                    className={inputClass}
                    autoComplete="new-password"
                  />
                )}

                {error && (
                  <p className="text-xs text-blush-dark font-medium text-center py-1">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !email || !password}
                  className="w-full py-3 rounded-xl bg-peach text-text-primary font-semibold text-sm transition-all hover:bg-peach-dark/50 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {mode === "login" ? "התחברות" : "הרשמה"}
                </button>

                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="w-full text-center text-xs text-text-muted hover:text-text-secondary transition-colors pt-1"
                  >
                    שכחתי סיסמה
                  </button>
                )}
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        {mode !== "forgot" && (
          <p className="text-center text-xs text-text-muted mt-6">
            {mode === "login" ? "עדיין אין חשבון? " : "כבר יש חשבון? "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="text-peach-dark font-semibold">
              {mode === "login" ? "הרשמה" : "התחברות"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
