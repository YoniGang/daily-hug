import { useState, useEffect } from "react";
import { ShieldCheck, ArrowRight, Wind, Sparkle, Mountain, CloudSun } from "lucide-react";
import { sosResponses } from "../data/mockData";

const feelings = [
  { key: "anxious", label: "חרדה", icon: Wind, color: "bg-sage/50 hover:bg-sage/70 border-sage-dark/30" },
  { key: "insecure", label: "חוסר ביטחון", icon: Sparkle, color: "bg-lavender/50 hover:bg-lavender/70 border-lavender-dark/30" },
  { key: "overwhelmed", label: "עומס", icon: Mountain, color: "bg-peach/50 hover:bg-peach/70 border-peach-dark/30" },
  { key: "sad", label: "עצב", icon: CloudSun, color: "bg-blush/50 hover:bg-blush/70 border-blush-dark/30" },
];

const responseColors = {
  sage: "bg-sage/30 border-sage-dark/20",
  lavender: "bg-lavender/30 border-lavender-dark/20",
  peach: "bg-peach/30 border-peach-dark/20",
  blush: "bg-blush/30 border-blush-dark/20",
};

function BreathingCircle() {
  return (
    <div className="flex flex-col items-center gap-4 my-4">
      <div className="w-24 h-24 rounded-full bg-sage/40 animate-[breathe_8s_ease-in-out_infinite] flex items-center justify-center">
        <span className="text-xs font-medium text-text-secondary">נשמי</span>
      </div>
    </div>
  );
}

export default function SOSTab() {
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (selected) {
      setVisible(false);
      const timer = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [selected]);

  const response = selected ? sosResponses[selected] : null;

  return (
    <div className="flex flex-col items-center min-h-full px-8 pb-24 pt-12">
      {!selected ? (
        <div className="flex flex-col items-center justify-center flex-1 w-full">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blush/40">
              <ShieldCheck size={32} className="text-blush-dark" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2 text-center">
            איך את מרגישה עכשיו?
          </h2>
          <p className="text-sm text-text-secondary mb-10 text-center max-w-[260px]">
            זה בסדר. ספרי לי ואני אהיה פה איתך.
          </p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-[320px]">
            {feelings.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`flex flex-col items-center gap-2 py-5 px-4 rounded-2xl border transition-all duration-300 active:scale-95 ${color}`}
              >
                <Icon size={24} className="text-text-primary/70" />
                <span className="text-sm font-semibold text-text-primary">{label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center flex-1 w-full transition-all duration-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <div className={`w-full rounded-3xl p-7 border ${responseColors[response.color]} shadow-[0_2px_24px_rgba(0,0,0,0.03)]`}>
            <h3 className="text-lg font-bold text-text-primary mb-3">
              {response.title}
            </h3>
            <p className="text-sm leading-relaxed text-text-primary/80 mb-4">
              {response.message}
            </p>
            {response.action === "breathing" && <BreathingCircle />}
          </div>

          <button
            onClick={() => setSelected(null)}
            className="mt-6 flex items-center gap-2 text-text-secondary font-medium text-sm hover:text-text-primary transition-colors"
          >
            <ArrowRight size={16} />
            <span>חזרה</span>
          </button>
        </div>
      )}
    </div>
  );
}
