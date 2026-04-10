import { useState, useRef } from "react";
import { Heart, X, Send, Plus, Sparkles, MessageCircleHeart, BookHeart, ImagePlus } from "lucide-react";
import * as api from "../api";
import { compressImage } from "../utils/imageCompression";

const EMOJI_OPTIONS = ["🌅", "💛", "🌸", "🫶", "🌿", "✨", "🪐", "💕", "🌟", "🤗", "🙏", "🌻", "💜", "🏡", "😂", "🎵", "👩‍🍳", "❤️"];
const COLOR_OPTIONS = ["peach", "lavender", "sage", "blush"];
const JAR_TYPE_OPTIONS = [
  { value: "memory", label: "זיכרון" },
  { value: "quote", label: "ציטוט" },
  { value: "photo", label: "תמונה / רגע" },
];
const FEED_TYPE_OPTIONS = [
  { value: "gratitude", label: "תודה" },
  { value: "success", label: "הצלחה" },
  { value: "love", label: "אהבה" },
  { value: "moment", label: "רגע" },
];

function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-bold text-text-primary mb-3">
      <Icon size={16} />
      {children}
    </h3>
  );
}

function EmojiPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {EMOJI_OPTIONS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onChange(e)}
          className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            value === e ? "bg-peach/60 scale-110 ring-2 ring-peach-dark/40" : "bg-warm-gray/40 hover:bg-warm-gray"
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="text-xs font-semibold text-text-secondary mb-1 block">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "w-full bg-white border border-warm-gray/60 rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-peach-dark/30 transition";
const btnClass = "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]";

export default function SendLoveModal() {
  const [open, setOpen] = useState(false);
  const [activeForm, setActiveForm] = useState("daily");
  const [toast, setToast] = useState(null);

  // Daily message state
  const [dmContent, setDmContent] = useState("");
  const [dmEmoji, setDmEmoji] = useState("🌅");

  // Feed post state
  const [fpContent, setFpContent] = useState("");
  const [fpEmoji, setFpEmoji] = useState("🤗");
  const [fpType, setFpType] = useState("gratitude");

  // Happy jar state
  const [hjTitle, setHjTitle] = useState("");
  const [hjDesc, setHjDesc] = useState("");
  const [hjType, setHjType] = useState("memory");
  const [hjColor, setHjColor] = useState("peach");

  // Image state (shared pattern for daily + feed + jar)
  const [dmImage, setDmImage] = useState(null);
  const [dmPreview, setDmPreview] = useState(null);
  const [fpImage, setFpImage] = useState(null);
  const [fpPreview, setFpPreview] = useState(null);
  const [hjImage, setHjImage] = useState(null);
  const [hjPreview, setHjPreview] = useState(null);
  const dmFileRef = useRef(null);
  const fpFileRef = useRef(null);
  const hjFileRef = useRef(null);

  function handleImageSelect(file, setImage, setPreview) {
    if (!file) return;
    setImage(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function clearImage(setImage, setPreview, fileRef) {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleAddDaily(e) {
    e.preventDefault();
    if (!dmContent.trim()) return;
    try {
      let compressed = null;
      if (dmImage) compressed = await compressImage(dmImage);
      await api.sendPartnerDaily(dmContent.trim(), dmEmoji, compressed);
      setDmContent("");
      setDmEmoji("🌅");
      clearImage(setDmImage, setDmPreview, dmFileRef);
      showToast("נשלח באהבה 💕");
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleAddFeed(e) {
    e.preventDefault();
    if (!fpContent.trim()) return;
    try {
      let compressed = null;
      if (fpImage) compressed = await compressImage(fpImage);
      await api.sendPartnerFeed({ type: fpType, content: fpContent.trim(), emoji: fpEmoji }, compressed);
      setFpContent("");
      setFpEmoji("🤗");
      clearImage(setFpImage, setFpPreview, fpFileRef);
      showToast("נשלח באהבה 💕");
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleAddJar(e) {
    e.preventDefault();
    if (!hjTitle.trim() || !hjDesc.trim()) return;
    try {
      let compressed = null;
      if (hjImage) compressed = await compressImage(hjImage);
      await api.sendPartnerJar({ type: hjType, title: hjTitle.trim(), description: hjDesc.trim(), color: hjColor }, compressed);
      setHjTitle("");
      setHjDesc("");
      clearImage(setHjImage, setHjPreview, hjFileRef);
      showToast("נשלח באהבה 💕");
    } catch (err) {
      showToast(err.message);
    }
  }

  const tabs = [
    { id: "daily", label: "שלחי הודעה", icon: MessageCircleHeart },
    { id: "feed", label: "שלחי לפיד", icon: BookHeart },
    { id: "jar", label: "שלחי לצנצנת", icon: Sparkles },
  ];

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-peach to-blush shadow-lg shadow-blush/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        <Heart size={22} className="text-white" fill="white" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-cream flex flex-col mx-auto max-w-[480px]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-warm-gray/50">
            <h2 className="text-base font-bold text-text-primary">שלחי אהבה</h2>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-xl hover:bg-warm-gray/60 transition-colors"
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* Form Tabs */}
          <div className="flex gap-1 px-4 pt-3">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveForm(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeForm === id
                    ? "bg-peach/50 text-text-primary"
                    : "text-text-muted hover:bg-warm-gray/40"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6">
            {activeForm === "daily" && (
              <form onSubmit={handleAddDaily}>
                <SectionTitle icon={MessageCircleHeart}>הודעה יומית חדשה</SectionTitle>
                <p className="text-xs text-text-muted mb-4">
                  ההודעה תופיע במסך הבית של בן/בת הזוג שלך.
                </p>
                <FormField label="אימוג׳י">
                  <EmojiPicker value={dmEmoji} onChange={setDmEmoji} />
                </FormField>
                <FormField label="תוכן ההודעה">
                  <textarea
                    value={dmContent}
                    onChange={(e) => setDmContent(e.target.value)}
                    placeholder="כתוב משהו יפה..."
                    rows={3}
                    className={inputClass + " resize-none"}
                  />
                </FormField>
                <FormField label="תמונה / זיכרון (אופציונלי)">
                  <input
                    ref={dmFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e.target.files[0], setDmImage, setDmPreview)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => dmFileRef.current?.click()}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed border-warm-gray/80 text-xs text-text-muted hover:bg-warm-gray/30 transition"
                  >
                    <ImagePlus size={16} />
                    בחרי תמונה
                  </button>
                  {dmPreview && (
                    <div className="relative mt-2 inline-block">
                      <img src={dmPreview} alt="תצוגה מקדימה" className="w-28 h-28 object-cover rounded-2xl shadow-sm border border-warm-gray/40" />
                      <button
                        type="button"
                        onClick={() => clearImage(setDmImage, setDmPreview, dmFileRef)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-text-primary/70 text-white flex items-center justify-center text-xs"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </FormField>
                <button type="submit" disabled={!dmContent.trim()} className={`${btnClass} bg-peach text-text-primary hover:bg-peach-dark/50 disabled:opacity-40`}>
                  <Send size={16} />
                  שלח הודעה
                </button>
              </form>
            )}

            {activeForm === "feed" && (
              <form onSubmit={handleAddFeed}>
                <SectionTitle icon={BookHeart}>פוסט חדש לפיד</SectionTitle>
                <p className="text-xs text-text-muted mb-4">
                  הפוסט יופיע בפיד של בן/בת הזוג שלך.
                </p>
                <FormField label="סוג הפוסט">
                  <div className="flex gap-2 flex-wrap">
                    {FEED_TYPE_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFpType(value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          fpType === value ? "bg-sage/60 text-text-primary" : "bg-warm-gray/40 text-text-muted hover:bg-warm-gray"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="אימוג׳י">
                  <EmojiPicker value={fpEmoji} onChange={setFpEmoji} />
                </FormField>
                <FormField label="תוכן הפוסט">
                  <textarea
                    value={fpContent}
                    onChange={(e) => setFpContent(e.target.value)}
                    placeholder="כתוב משהו יפה..."
                    rows={3}
                    className={inputClass + " resize-none"}
                  />
                </FormField>
                <FormField label="תמונה / זיכרון (אופציונלי)">
                  <input
                    ref={fpFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e.target.files[0], setFpImage, setFpPreview)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fpFileRef.current?.click()}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed border-warm-gray/80 text-xs text-text-muted hover:bg-warm-gray/30 transition"
                  >
                    <ImagePlus size={16} />
                    בחרי תמונה
                  </button>
                  {fpPreview && (
                    <div className="relative mt-2 inline-block">
                      <img src={fpPreview} alt="תצוגה מקדימה" className="w-28 h-28 object-cover rounded-2xl shadow-sm border border-warm-gray/40" />
                      <button
                        type="button"
                        onClick={() => clearImage(setFpImage, setFpPreview, fpFileRef)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-text-primary/70 text-white flex items-center justify-center text-xs"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </FormField>
                <button type="submit" disabled={!fpContent.trim()} className={`${btnClass} bg-sage text-text-primary hover:bg-sage-dark/50 disabled:opacity-40`}>
                  <Plus size={16} />
                  שלח לפיד
                </button>
              </form>
            )}

            {activeForm === "jar" && (
              <form onSubmit={handleAddJar}>
                <SectionTitle icon={Sparkles}>פריט חדש לצנצנת שמחה</SectionTitle>
                <p className="text-xs text-text-muted mb-4">
                  הפריט יופיע בצנצנת של בן/בת הזוג שלך.
                </p>
                <FormField label="סוג">
                  <div className="flex gap-2">
                    {JAR_TYPE_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setHjType(value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          hjType === value ? "bg-lavender/60 text-text-primary" : "bg-warm-gray/40 text-text-muted hover:bg-warm-gray"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="צבע">
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setHjColor(c)}
                        className={`w-8 h-8 rounded-full transition-all ring-offset-2 bg-${c} ${
                          hjColor === c ? "ring-2 ring-text-secondary scale-110" : "opacity-60 hover:opacity-100"
                        }`}
                      />
                    ))}
                  </div>
                </FormField>
                <FormField label="כותרת">
                  <input
                    type="text"
                    value={hjTitle}
                    onChange={(e) => setHjTitle(e.target.value)}
                    placeholder="למשל: הטיול ההוא שלנו..."
                    className={inputClass}
                  />
                </FormField>
                <FormField label="תיאור">
                  <textarea
                    value={hjDesc}
                    onChange={(e) => setHjDesc(e.target.value)}
                    placeholder="ספר את הזיכרון..."
                    rows={3}
                    className={inputClass + " resize-none"}
                  />
                </FormField>
                <FormField label="תמונה / זיכרון (אופציונלי)">
                  <input
                    ref={hjFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e.target.files[0], setHjImage, setHjPreview)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => hjFileRef.current?.click()}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed border-warm-gray/80 text-xs text-text-muted hover:bg-warm-gray/30 transition"
                  >
                    <ImagePlus size={16} />
                    בחרי תמונה
                  </button>
                  {hjPreview && (
                    <div className="relative mt-2 inline-block">
                      <img src={hjPreview} alt="תצוגה מקדימה" className="w-28 h-28 object-cover rounded-2xl shadow-sm border border-warm-gray/40" />
                      <button
                        type="button"
                        onClick={() => clearImage(setHjImage, setHjPreview, hjFileRef)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-text-primary/70 text-white flex items-center justify-center text-xs"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </FormField>
                <button type="submit" disabled={!hjTitle.trim() || !hjDesc.trim()} className={`${btnClass} bg-lavender text-text-primary hover:bg-lavender-dark/50 disabled:opacity-40`}>
                  <Plus size={16} />
                  שלח לצנצנת
                </button>
              </form>
            )}
          </div>

          {/* Toast */}
          {toast && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-text-primary text-cream px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-lg animate-[fadeIn_0.2s_ease-out] z-[200]">
              {toast}
            </div>
          )}
        </div>
      )}
    </>
  );
}
