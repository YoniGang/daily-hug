import { useState, useEffect } from "react";
import { Sun, Heart, LogOut, Settings } from "lucide-react";
import { useData } from "../data/DataContext";
import { useAuth } from "../data/AuthContext";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "בוקר טוב";
  if (hour < 17) return "צהריים טובים";
  return "ערב טוב";
}

export default function HomeTab({ onOpenAdmin }) {
  const { latestDailyMessage } = useData();
  const { user, logout } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fallback = { content: "אני אוהב/ת אותך.", emoji: "❤️" };
  const message = latestDailyMessage || fallback;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-full px-8 pb-24 pt-12">
      {/* Top bar */}
      <div className="absolute top-5 left-5 flex items-center gap-1">
        {user?.is_admin ? (
          <button
            onClick={onOpenAdmin}
            className="p-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-warm-gray/40 transition-all"
            title="ניהול"
          >
            <Settings size={18} />
          </button>
        ) : null}
        <button
          onClick={logout}
          className="p-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-warm-gray/40 transition-all"
          title="התנתקות"
        >
          <LogOut size={18} />
        </button>
      </div>

      <div
        className={`transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex items-center gap-2 mb-2 justify-center">
          <Sun size={18} className="text-peach-dark" />
          <p className="text-sm font-medium text-text-secondary tracking-wide">
            {getGreeting()}, {user?.name || "אהובה"}
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
  );
}
