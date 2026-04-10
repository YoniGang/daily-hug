import { useState } from "react";
import { Heart, ImageOff, Sparkles } from "lucide-react";
import { useData } from "../data/DataContext";

const typeToJar = {
  "daily-message": { type: "quote", color: "lavender" },
  gratitude: { type: "quote", color: "sage" },
  success: { type: "memory", color: "peach" },
  love: { type: "quote", color: "blush" },
  moment: { type: "memory", color: "peach" },
};

const typeColors = {
  "daily-message": "border-r-peach-dark/50",
  gratitude: "border-r-sage-dark/50",
  success: "border-r-peach-dark/50",
  love: "border-r-blush-dark/50",
  moment: "border-r-lavender-dark/50",
};

const typeLabels = {
  "daily-message": "הודעה יומית",
  gratitude: "תודה",
  success: "ההצלחה שלך",
  love: "אני אוהב את זה בך",
  moment: "רגע",
};

function formatRelativeDate(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דק׳`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `לפני ${hours} שע׳`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "אתמול";
  if (days < 7) return `לפני ${days} ימים`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "לפני שבוע";
  if (weeks < 5) return `לפני ${weeks} שבועות`;
  return `לפני ${Math.floor(days / 30)} חודשים`;
}

function FeedImage({ b64 }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="mt-3 flex items-center justify-center h-24 rounded-2xl bg-warm-gray/30 text-text-muted/50">
        <ImageOff size={20} />
      </div>
    );
  }
  return (
    <img
      src={`data:image/jpeg;base64,${b64}`}
      alt=""
      onError={() => setFailed(true)}
      className="mt-3 w-full max-h-64 object-cover rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-warm-gray/30"
    />
  );
}

export default function FeedTab() {
  const { feedPosts, addHappyJarItem, happyJarItems } = useData();
  const [justSavedIds, setJustSavedIds] = useState(new Set());

  const inJarFeedIds = new Set(
    happyJarItems.filter((i) => i.sourceFeedId).map((i) => i.sourceFeedId)
  );


  return (
    <div className="min-h-full pb-24 pt-10 px-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-text-primary">הפיד שלך</h2>
        <p className="text-sm text-text-secondary mt-1">
          דברים שאני רוצה שלעולם לא תשכחי
        </p>
      </div>

      <div className="space-y-4">
        {feedPosts.map((post) => (
          <div
            key={post.id}
            className={`bg-white rounded-2xl p-5 shadow-[0_1px_12px_rgba(0,0,0,0.03)] border border-warm-gray/40 border-r-[3px] ${typeColors[post.type] || "border-r-warm-gray"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-text-muted tracking-wider">
                {typeLabels[post.type] || post.type}
              </span>
              <span className="text-[10px] text-text-muted">
                {formatRelativeDate(post.timestamp)}
              </span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-xl mt-0.5">{post.emoji}</span>
              <p className="text-sm leading-relaxed text-text-primary/85 flex-1">
                {post.content}
              </p>
            </div>
            {post.image_b64 && (
              <FeedImage b64={post.image_b64} />
            )}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-text-muted/60">
                <Heart size={10} fill="currentColor" />
              </div>
              {(() => {
                const alreadyInJar = inJarFeedIds.has(post.id) || justSavedIds.has(post.id);
                return (
                  <button
                    onClick={() => {
                      if (alreadyInJar) return;
                      const mapping = typeToJar[post.type] || { type: "quote", color: "lavender" };
                      addHappyJarItem({
                        type: mapping.type,
                        title: typeLabels[post.type] || "",
                        color: mapping.color,
                        sourceFeedId: post.id,
                      });
                      setJustSavedIds((prev) => new Set(prev).add(post.id));
                    }}
                    className={`flex items-center gap-1 text-[11px] transition-all duration-300 active:scale-95 ${
                      alreadyInJar
                        ? "text-lavender-dark"
                        : "text-text-muted/50 hover:text-lavender-dark"
                    }`}
                  >
                    <Sparkles size={13} fill={alreadyInJar ? "currentColor" : "none"} />
                    <span>{alreadyInJar ? "נשמר בצנצנת" : "לצנצנת"}</span>
                  </button>
                );
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
