import { useState, useRef, useCallback } from "react";
import { Flower2, Lightbulb, Save, Plus, X, Pencil, Check, GripVertical, Sparkles } from "lucide-react";
import { useData } from "../data/DataContext";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const NOTE_COLORS = ["peach", "lavender", "sage", "blush"];

const noteColorMap = {
  peach: "bg-peach/50 border-peach-dark/20",
  lavender: "bg-lavender/50 border-lavender-dark/20",
  sage: "bg-sage/50 border-sage-dark/20",
  blush: "bg-blush/50 border-blush-dark/20",
};

const pickerBgMap = {
  peach: "bg-peach",
  lavender: "bg-lavender",
  sage: "bg-sage",
  blush: "bg-blush",
};

function formatDateLabel(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "היום";
  if (date.toDateString() === yesterday.toDateString()) return "אתמול";

  return date.toLocaleDateString("he-IL", { day: "numeric", month: "long" });
}

function GratitudeSection() {
  const { gratitudeArchive, addGratitudeEntry, updateGratitudeEntry } = useData();
  const [fields, setFields] = useState(["", "", ""]);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  const todayEntry = gratitudeArchive.find(
    (e) => new Date(e.timestamp).toDateString() === new Date().toDateString()
  );

  const showForm = !todayEntry || editing;

  function handleSave() {
    const filled = fields.filter((f) => f.trim());
    if (filled.length === 0) return;
    if (editing && todayEntry) {
      updateGratitudeEntry(todayEntry.id, filled);
    } else {
      addGratitudeEntry(filled);
    }
    setFields(["", "", ""]);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function startEditing() {
    if (!todayEntry) return;
    const padded = [...todayEntry.items];
    while (padded.length < 3) padded.push("");
    setFields(padded);
    setEditing(true);
  }

  function cancelEditing() {
    setFields(["", "", ""]);
    setEditing(false);
  }

  function updateField(idx, value) {
    setFields((prev) => prev.map((f, i) => (i === idx ? value : f)));
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-sage/40">
          <Flower2 size={18} className="text-sage-dark" />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-primary">הטוב של היום</h3>
          <p className="text-[11px] text-text-muted">על מה את אסירת תודה היום?</p>
        </div>
      </div>

      {!showForm && todayEntry ? (
        <div className="bg-sage/20 rounded-2xl p-5 border border-sage-dark/10 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-sage-dark uppercase tracking-wider">שמרת היום</p>
            <button
              onClick={startEditing}
              className="flex items-center gap-1 text-[10px] font-medium text-text-muted hover:text-text-secondary transition-colors"
            >
              <Pencil size={11} />
              עריכה
            </button>
          </div>
          <div className="space-y-2">
            {todayEntry.items.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-sage-dark mt-0.5 text-sm">✦</span>
                <p className="text-sm text-text-primary/80">{item}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 mb-4">
          {fields.map((val, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sage-dark/60 text-xs font-bold w-5 text-center">{i + 1}</span>
              <input
                type="text"
                value={val}
                onChange={(e) => updateField(i, e.target.value)}
                placeholder={
                  i === 0 ? "משהו קטן שהיה טוב..." : i === 1 ? "עוד משהו..." : "ואחרון..."
                }
                className="flex-1 bg-white border border-warm-gray/50 rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-sage/40 transition"
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={fields.every((f) => !f.trim())}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sage/40 text-text-primary font-semibold text-sm transition-all hover:bg-sage/60 active:scale-[0.98] disabled:opacity-30"
            >
              {saved ? "נשמר ✓" : <><Save size={15} /> {editing ? "עדכני" : "שמרי"}</>}
            </button>
            {editing && (
              <button
                onClick={cancelEditing}
                className="px-4 py-2.5 rounded-xl text-text-muted text-sm font-medium hover:bg-warm-gray/40 transition-colors"
              >
                ביטול
              </button>
            )}
          </div>
        </div>
      )}

      {gratitudeArchive.length > 0 && (
        <div className="mt-2">
          <p className="text-[10px] font-semibold text-text-muted mb-3 uppercase tracking-wider">ארכיון תודות</p>
          <div className="space-y-3">
            {gratitudeArchive
              .filter((e) => !todayEntry || e.id !== todayEntry.id)
              .slice(0, 5)
              .map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl p-4 border border-warm-gray/30 shadow-[0_1px_6px_rgba(0,0,0,0.02)]">
                  <p className="text-[10px] text-text-muted mb-2">{formatDateLabel(entry.timestamp)}</p>
                  <div className="space-y-1">
                    {entry.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-sage-dark/50 text-[10px] mt-0.5">✦</span>
                        <p className="text-xs text-text-primary/70 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}

function DeleteConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-6" onClick={onCancel}>
      <div className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[320px] bg-cream rounded-2xl p-5 shadow-lg border border-warm-gray/40 animate-[fadeIn_0.15s_ease-out] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-bold text-text-primary mb-1">למחוק את המחשבה?</p>
        <p className="text-xs text-text-muted mb-5">הפעולה הזו לא ניתנת לביטול</p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-blush/60 text-text-primary font-semibold text-sm transition-all hover:bg-blush/80 active:scale-[0.98]"
          >
            כן, מחקי
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-text-muted text-sm font-medium hover:bg-warm-gray/40 transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableNoteCard({ note, onEdit, onRequestDelete, onSendToJar, inJar, justSent, reordering }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const sparkleActive = inJar || justSent;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-2xl p-4 border shadow-[0_1px_6px_rgba(0,0,0,0.02)] transition-shadow ${noteColorMap[note.color] || noteColorMap.lavender} ${isDragging ? "shadow-lg" : ""}`}
    >
      {reordering ? (
        <div
          className="absolute top-1.5 left-1.5 p-1 rounded-lg text-text-muted/50 cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </div>
      ) : (
        <div className="absolute top-1.5 left-1.5 flex gap-0.5">
          <button
            onClick={() => onEdit(note)}
            className="p-0.5 rounded-full text-text-muted/40 hover:text-text-muted transition-colors"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={() => onRequestDelete(note.id)}
            className="p-0.5 rounded-full text-text-muted/40 hover:text-text-muted transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}
      <p className="text-xs leading-relaxed text-text-primary/80 pr-1 mt-1">{note.text}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[9px] text-text-muted/50">
          {formatDateLabel(note.timestamp)}
        </p>
        {!reordering && (
          <button
            onClick={() => !inJar && onSendToJar(note)}
            aria-label={inJar ? "בצנצנת השמחה" : "העבר לצנצנת"}
            title={inJar ? "בצנצנת השמחה" : "העבר לצנצנת"}
            className={`p-1 rounded-lg transition-all duration-300 ${
              sparkleActive
                ? `text-lavender-dark ${justSent ? "scale-125" : ""}`
                : "text-text-muted/30 hover:text-lavender-dark hover:scale-110"
            } ${inJar ? "cursor-default" : ""}`}
          >
            <Sparkles size={13} fill={sparkleActive ? "currentColor" : "none"} />
          </button>
        )}
      </div>
    </div>
  );
}

function NoteEditModal({ note, onSave, onCancel }) {
  const [editText, setEditText] = useState(note.text);
  const [editColor, setEditColor] = useState(note.color);
  const textRef = useRef(null);

  function handleSave() {
    if (!editText.trim()) return;
    onSave(note.id, editText.trim(), editColor);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-6" onClick={onCancel}>
      <div className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[400px] bg-cream rounded-2xl p-5 shadow-lg border border-warm-gray/40 animate-[fadeIn_0.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="text-sm font-bold text-text-primary mb-3">עריכת מחשבה</h4>

        <textarea
          ref={textRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows={3}
          autoFocus
          className="w-full bg-white border border-warm-gray/50 rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-lavender/40 transition resize-none"
        />

        <div className="flex gap-1.5 mt-3 mb-4">
          {NOTE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setEditColor(c)}
              className={`w-6 h-6 rounded-full ${pickerBgMap[c]} transition-all ${
                editColor === c ? "ring-2 ring-text-secondary ring-offset-1 scale-110" : "opacity-50 hover:opacity-80"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!editText.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-lavender/50 text-text-primary font-semibold text-sm transition-all hover:bg-lavender/70 active:scale-[0.98] disabled:opacity-30"
          >
            <Check size={15} /> שמרי
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-text-muted text-sm font-medium hover:bg-warm-gray/40 transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

function NotesSection() {
  const { generalNotes, addGeneralNote, updateGeneralNote, deleteGeneralNote, reorderGeneralNotes, addHappyJarItem, happyJarItems } = useData();
  const [text, setText] = useState("");
  const [color, setColor] = useState("lavender");
  const [editingNote, setEditingNote] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [justSentIds, setJustSentIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  const inJarNoteIds = new Set(
    happyJarItems.filter((i) => i.sourceNoteId).map((i) => i.sourceNoteId)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  function handleAdd() {
    if (!text.trim()) return;
    addGeneralNote(text.trim(), color);
    setText("");
    setColor(NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]);
  }

  function handleEditSave(id, newText, newColor) {
    updateGeneralNote(id, newText, newColor);
    setEditingNote(null);
  }

  function handleConfirmDelete() {
    if (deletingId) {
      deleteGeneralNote(deletingId);
      setDeletingId(null);
    }
  }

  const handleSendToJar = useCallback((note) => {
    if (inJarNoteIds.has(note.id)) return;
    addHappyJarItem({
      type: "self-thought",
      title: "",
      description: "",
      color: note.color || "lavender",
      sourceNoteId: note.id,
    });
    setJustSentIds((prev) => new Set(prev).add(note.id));
    setToast("✨ נוסף לצנצנת השמחה");
    setTimeout(() => setToast(null), 2000);
    setTimeout(() => {
      setJustSentIds((prev) => {
        const next = new Set(prev);
        next.delete(note.id);
        return next;
      });
    }, 1500);
  }, [addHappyJarItem, inJarNoteIds]);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = generalNotes.map((n) => n.id);
    const oldIdx = ids.indexOf(active.id);
    const newIdx = ids.indexOf(over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = [...ids];
    reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, active.id);
    reorderGeneralNotes(reordered);
  }

  const noteIds = generalNotes.map((n) => n.id);

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-lavender/40">
          <Lightbulb size={18} className="text-lavender-dark" />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-primary">מגירת מחשבות</h3>
          <p className="text-[11px] text-text-muted">ציטוטים, רעיונות, דברים לזכור</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="כתבי מחשבה..."
          className="flex-1 bg-white border border-warm-gray/50 rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-lavender/40 transition"
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim()}
          className="p-2.5 rounded-xl bg-lavender/50 text-lavender-dark transition-all hover:bg-lavender/70 active:scale-95 disabled:opacity-30"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex gap-1.5 mb-4">
        {NOTE_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full ${pickerBgMap[c]} transition-all ${
              color === c ? "ring-2 ring-text-secondary ring-offset-1 scale-110" : "opacity-50 hover:opacity-80"
            }`}
          />
        ))}
      </div>

      {generalNotes.length > 1 && (
        <button
          onClick={() => setReordering((r) => !r)}
          className={`flex items-center gap-1.5 text-[11px] font-medium mb-3 px-2.5 py-1.5 rounded-lg transition-all ${
            reordering
              ? "bg-lavender/40 text-text-primary"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          <GripVertical size={12} />
          {reordering ? "סיום סידור" : "סדר מחדש"}
        </button>
      )}

      {generalNotes.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={noteIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-2.5">
              {generalNotes.map((note) => (
                <SortableNoteCard
                  key={note.id}
                  note={note}
                  onEdit={setEditingNote}
                  onRequestDelete={setDeletingId}
                  onSendToJar={handleSendToJar}
                  inJar={inJarNoteIds.has(note.id)}
                  justSent={justSentIds.has(note.id)}
                  reordering={reordering}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {editingNote && (
        <NoteEditModal
          note={editingNote}
          onSave={handleEditSave}
          onCancel={() => setEditingNote(null)}
        />
      )}

      {deletingId && (
        <DeleteConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-text-primary text-cream px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-lg animate-[fadeIn_0.2s_ease-out] z-[200]">
          {toast}
        </div>
      )}
    </section>
  );
}

export default function MyCornerTab() {
  const [activeSection, setActiveSection] = useState("gratitude");

  return (
    <div className="min-h-full pb-24 pt-10 px-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-text-primary">הפינה שלי</h2>
        <p className="text-sm text-text-secondary mt-1">המקום הפרטי שלך, בלי לחץ</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSection("gratitude")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeSection === "gratitude"
              ? "bg-sage/40 text-text-primary"
              : "text-text-muted hover:bg-warm-gray/40"
          }`}
        >
          <Flower2 size={14} />
          הטוב של היום
        </button>
        <button
          onClick={() => setActiveSection("notes")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeSection === "notes"
              ? "bg-lavender/40 text-text-primary"
              : "text-text-muted hover:bg-warm-gray/40"
          }`}
        >
          <Lightbulb size={14} />
          מגירת מחשבות
        </button>
      </div>

      {activeSection === "gratitude" ? <GratitudeSection /> : <NotesSection />}
    </div>
  );
}
