import { useState } from "react";
import { Users, Loader2, LogOut, Settings } from "lucide-react";
import { useAuth } from "../data/AuthContext";
import AdminPanel from "./AdminPanel";

const inputClass =
  "w-full bg-white border border-warm-gray/50 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-sage-dark/30 transition";

export default function PairingScreen() {
  const { user, pair, logout } = useAuth();
  const [partnerEmail, setPartnerEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!partnerEmail.trim()) return;

    setSubmitting(true);
    try {
      await pair(partnerEmail.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 bg-cream">
      <div className="w-full max-w-[360px] animate-[fadeIn_0.3s_ease-out]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage/40 mb-4">
            <Users size={28} className="text-sage-dark" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">שלום, {user.name}</h1>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            חיבוק יומי הוא אפליקציה לזוג.
            <br />
            הזיני את האימייל של בן/בת הזוג שלך כדי להתחבר.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_24px_rgba(0,0,0,0.04)] border border-warm-gray/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              placeholder="האימייל של בן/בת הזוג"
              className={inputClass}
              autoComplete="email"
              required
            />

            {error && (
              <p className="text-xs text-blush-dark font-medium text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !partnerEmail.trim()}
              className="w-full py-3 rounded-xl bg-sage text-text-primary font-semibold text-sm transition-all hover:bg-sage-dark/50 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              התחבר/י
            </button>
          </form>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {user?.is_admin ? (
            <button
              onClick={() => setAdminOpen(true)}
              className="flex items-center justify-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              <Settings size={12} />
              ניהול
            </button>
          ) : null}
          <button
            onClick={logout}
            className="flex items-center justify-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            <LogOut size={12} />
            התנתקות
          </button>
        </div>
      </div>

      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </div>
  );
}
