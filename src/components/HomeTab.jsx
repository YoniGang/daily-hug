import { useState, useEffect, useRef, useCallback } from "react";
import { Sun, Heart } from "lucide-react";
import { useData } from "../data/DataContext";

const ADMIN_PIN = "1234";
const TAP_COUNT = 5;
const TAP_WINDOW_MS = 2000;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "בוקר טוב";
  if (hour < 17) return "צהריים טובים";
  return "ערב טוב";
}

function PinModal({ onSuccess, onClose }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onSuccess();
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 1200);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`bg-white rounded-3xl p-8 mx-6 w-full max-w-[300px] shadow-xl transition-transform ${error ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-text-primary text-center mb-1">כניסת מנהל</h3>
        <p className="text-xs text-text-muted text-center mb-5">הזן קוד PIN בן 4 ספרות</p>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-full text-center text-2xl tracking-[0.5em] font-bold bg-warm-gray/40 border border-warm-gray/60 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-peach-dark/30 text-text-primary"
            placeholder="····"
          />
          {error && <p className="text-xs text-blush-dark text-center mt-2 font-medium">קוד שגוי, נסה שוב</p>}
          <button
            type="submit"
            disabled={pin.length < 4}
            className="mt-4 w-full py-3 rounded-2xl bg-peach text-text-primary font-semibold text-sm transition-all hover:bg-peach-dark/50 active:scale-[0.98] disabled:opacity-40"
          >
            כניסה
          </button>
        </form>
      </div>
    </div>
  );
}

export default function HomeTab({ onOpenAdmin }) {
  const { latestDailyMessage } = useData();
  const [visible, setVisible] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const tapsRef = useRef([]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSecretTap = useCallback(() => {
    const now = Date.now();
    tapsRef.current = [...tapsRef.current.filter((t) => now - t < TAP_WINDOW_MS), now];
    if (tapsRef.current.length >= TAP_COUNT) {
      tapsRef.current = [];
      setShowPin(true);
    }
  }, []);

  const fallback = { content: "אני אוהב אותך.", emoji: "❤️" };
  const message = latestDailyMessage || fallback;

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-full px-8 pb-24 pt-12">
        <div
          className={`transition-all duration-700 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div
            className="flex items-center gap-2 mb-2 justify-center cursor-default select-none"
            onClick={handleSecretTap}
          >
            <Sun size={18} className="text-peach-dark" />
            <p className="text-sm font-medium text-text-secondary tracking-wide">
              {getGreeting()}, אהובה
            </p>
          </div>

          <div className="mt-6 bg-white rounded-3xl p-8 shadow-[0_2px_24px_rgba(0,0,0,0.04)] border border-warm-gray/40">
            <div className="text-center mb-6">
              <span className="text-4xl">{message.emoji}</span>
            </div>

            <p className="text-center text-lg leading-relaxed font-medium text-text-primary">
              {message.content}
            </p>

            <div className="mt-8 flex items-center justify-center gap-1.5 text-text-muted">
              <Heart size={14} fill="currentColor" />
              <span className="text-xs font-medium">החיבוק היומי שלך</span>
            </div>
          </div>

          <p className="text-center text-xs text-text-muted mt-6">
            הודעה חדשה מחכה לך כל יום
          </p>
        </div>
      </div>

      {showPin && (
        <PinModal
          onClose={() => setShowPin(false)}
          onSuccess={() => {
            setShowPin(false);
            onOpenAdmin();
          }}
        />
      )}
    </>
  );
}
