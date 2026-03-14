import { Home, Sparkles, HeartPulse, BookHeart, PenLine } from "lucide-react";

const tabs = [
  { id: "home", label: "בית", icon: Home },
  { id: "jar", label: "צנצנת", icon: Sparkles },
  { id: "sos", label: "עזרה", icon: HeartPulse },
  { id: "corner", label: "הפינה שלי", icon: PenLine },
  { id: "feed", label: "הפיד", icon: BookHeart },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-warm-gray/60">
      <div className="mx-auto max-w-[480px] flex items-center justify-around h-16 px-1">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-2xl transition-all duration-300 ${
                active
                  ? "text-text-primary scale-105"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-300 ${
                  active ? "bg-peach/50" : ""
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.2 : 1.8}
                />
              </div>
              <span className={`text-[9px] font-semibold tracking-wide ${active ? "opacity-100" : "opacity-60"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
