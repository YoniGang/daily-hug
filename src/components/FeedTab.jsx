import { Heart } from "lucide-react";
import { useData } from "../data/DataContext";

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

export default function FeedTab() {
  const { feedPosts } = useData();

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
            <div className="mt-3 flex items-center gap-1 text-text-muted/60">
              <Heart size={10} fill="currentColor" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
