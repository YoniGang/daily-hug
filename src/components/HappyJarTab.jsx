import { useState } from "react";
import { Sparkles, RotateCcw, Heart, Trash2 } from "lucide-react";
import { useData } from "../data/DataContext";

const colorMap = {
  peach: "bg-peach/40 border-peach-dark/30",
  lavender: "bg-lavender/40 border-lavender-dark/30",
  sage: "bg-sage/40 border-sage-dark/30",
  blush: "bg-blush/40 border-blush-dark/30",
};

const typeLabels = {
  memory: "זיכרון בשבילך",
  quote: "מילים מהלב",
  photo: "רגע בזמן",
  "self-thought": "מחשבה שלך",
};

export default function HappyJarTab() {
  const { happyJarItems, deleteHappyJarItem } = useData();
  const [currentItem, setCurrentItem] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  function revealRandom() {
    setAnimating(true);
    setTimeout(() => {
      const available = happyJarItems.filter((i) => i.id !== currentItem?.id);
      const next = available[Math.floor(Math.random() * available.length)];
      setCurrentItem(next);
      setAnimating(false);
    }, 400);
  }

  function handleRemove() {
    if (!currentItem) return;
    deleteHappyJarItem(currentItem.id);
    setConfirmRemove(false);
    setCurrentItem(null);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-8 pb-24 pt-12">
      {!currentItem ? (
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-lavender/40">
              <Sparkles size={32} className="text-lavender-dark" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            צנצנת השמחה שלך
          </h2>
          <p className="text-sm text-text-secondary mb-10 leading-relaxed max-w-[260px]">
            מלאה בזיכרונות, רגעים ומילים שעושים אותנו — אותנו.
          </p>
          <button
            onClick={revealRandom}
            className="bg-lavender hover:bg-lavender-dark/40 text-text-primary font-semibold px-8 py-4 rounded-2xl transition-all duration-300 active:scale-95 shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
          >
            תזכירי לי משהו טוב
          </button>
        </div>
      ) : (
        <div
          className={`w-full transition-all duration-400 ${
            animating
              ? "opacity-0 scale-95"
              : "opacity-100 scale-100"
          }`}
        >
          <div
            className={`rounded-3xl p-7 border ${colorMap[currentItem.color] || colorMap.peach} shadow-[0_2px_24px_rgba(0,0,0,0.03)]`}
          >
            <p className="text-xs font-semibold text-text-secondary mb-1 tracking-wider">
              {typeLabels[currentItem.type] || currentItem.type}
            </p>
            <h3 className="text-lg font-bold text-text-primary mb-3">
              {currentItem.title}
            </h3>
            {currentItem.description && (
              <p className="text-sm leading-relaxed text-text-primary/80">
                {currentItem.description}
              </p>
            )}
            <div className="mt-5 flex items-center gap-1 text-text-muted">
              <Heart size={12} fill="currentColor" />
              <span className="text-[10px] font-medium">מצנצנת השמחה שלך</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              onClick={revealRandom}
              className="flex items-center gap-2 bg-white hover:bg-warm-gray text-text-secondary font-semibold px-6 py-3 rounded-2xl transition-all duration-300 active:scale-95 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-warm-gray/60"
            >
              <RotateCcw size={16} />
              <span>תראי לי עוד</span>
            </button>

            {currentItem?.type === "self-thought" && (
              <button
                onClick={() => setConfirmRemove(true)}
                className="flex items-center gap-1.5 text-[11px] text-text-muted/60 hover:text-text-muted transition-colors"
              >
                <Trash2 size={12} />
                הסר מהצנצנת
              </button>
            )}
          </div>
        </div>
      )}

      {confirmRemove && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-6" onClick={() => setConfirmRemove(false)}>
          <div className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-[320px] bg-cream rounded-2xl p-5 shadow-lg border border-warm-gray/40 animate-[fadeIn_0.15s_ease-out] text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-bold text-text-primary mb-1">להסיר מהצנצנת?</p>
            <p className="text-xs text-text-muted mb-5">המחשבה תישאר במגירת המחשבות שלך</p>
            <div className="flex gap-2">
              <button
                onClick={handleRemove}
                className="flex-1 py-2.5 rounded-xl bg-blush/60 text-text-primary font-semibold text-sm transition-all hover:bg-blush/80 active:scale-[0.98]"
              >
                כן, הסירי
              </button>
              <button
                onClick={() => setConfirmRemove(false)}
                className="flex-1 py-2.5 rounded-xl text-text-muted text-sm font-medium hover:bg-warm-gray/40 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
