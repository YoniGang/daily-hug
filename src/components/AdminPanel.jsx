import { useState, useEffect } from "react";
import { X, Trash2, Save, KeyRound, Users, Loader2 } from "lucide-react";
import * as api from "../api";

const inputClass =
  "w-full bg-white border border-warm-gray/60 rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-peach-dark/30 transition";

function UserCard({ user, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [partnerEmail, setPartnerEmail] = useState(user.partner_email || "");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await api.adminUpdateUser(user.id, {
        name,
        email,
        partnerEmail: partnerEmail || null,
      });
      onUpdate(updated);
      setEditing(false);
      showToast("נשמר!");
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!newPassword || newPassword.length < 6) {
      return showToast("סיסמה חייבת להכיל לפחות 6 תווים");
    }
    setSaving(true);
    try {
      await api.adminResetPassword(user.id, newPassword);
      setNewPassword("");
      showToast("הסיסמה שונתה!");
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await api.adminDeleteUser(user.id);
      onDelete(user.id);
    } catch (err) {
      showToast(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-warm-gray/40 p-4 space-y-3 relative">
      {toast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-text-primary text-cream px-4 py-1.5 rounded-xl text-xs font-semibold shadow-lg animate-[fadeIn_0.2s_ease-out] z-10">
          {toast}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-text-primary">{user.name}</p>
          <p className="text-xs text-text-muted">{user.email}</p>
        </div>
        <div className="flex items-center gap-1">
          {user.is_admin ? (
            <span className="text-[10px] font-bold bg-lavender/50 text-lavender-dark px-2 py-0.5 rounded-lg">מנהל</span>
          ) : null}
          <button
            onClick={() => setEditing(!editing)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              editing ? "bg-warm-gray/50 text-text-primary" : "bg-peach/40 text-text-primary hover:bg-peach/60"
            }`}
          >
            {editing ? "ביטול" : "עריכה"}
          </button>
        </div>
      </div>

      {/* Partner info (read-only) */}
      {!editing && (
        <p className="text-xs text-text-secondary">
          בן/בת זוג: {user.partner_email || <span className="text-text-muted">לא מחובר/ת</span>}
        </p>
      )}

      {/* Edit form */}
      {editing && (
        <div className="space-y-3 pt-1">
          <label className="block">
            <span className="text-xs font-semibold text-text-secondary mb-1 block">שם</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-text-secondary mb-1 block">אימייל</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-text-secondary mb-1 block">אימייל בן/בת זוג</span>
            <input type="email" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} placeholder="ריק = לא מחובר" className={inputClass} />
          </label>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-sage/50 text-text-primary font-semibold text-xs transition-all hover:bg-sage-dark/40 active:scale-[0.98] disabled:opacity-40"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            שמור שינויים
          </button>

          {/* Password reset */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="סיסמה חדשה"
              className={inputClass + " flex-1"}
              autoComplete="off"
            />
            <button
              onClick={handleResetPassword}
              disabled={saving || !newPassword}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-lavender/50 text-text-primary text-xs font-semibold transition-all hover:bg-lavender-dark/40 disabled:opacity-40 shrink-0"
            >
              <KeyRound size={13} />
              שנה
            </button>
          </div>

          {/* Delete */}
          {!user.is_admin && (
            confirmDelete ? (
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-blush/60 text-text-primary text-xs font-semibold transition-all hover:bg-blush-dark/50"
                >
                  בטוח, מחק
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2.5 rounded-xl bg-warm-gray/50 text-text-secondary text-xs font-semibold transition-all"
                >
                  ביטול
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-blush-dark text-xs font-semibold transition-all hover:bg-blush/20"
              >
                <Trash2 size={13} />
                מחק משתמש/ת
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPanel({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminGetUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  function handleUpdate(updated) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  function handleDelete(id) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="fixed inset-0 z-[100] bg-cream flex flex-col mx-auto max-w-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-warm-gray/50">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-text-secondary" />
          <h2 className="text-base font-bold text-text-primary">ניהול משתמשים</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-warm-gray/60 transition-colors"
        >
          <X size={20} className="text-text-secondary" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-peach-dark animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-sm text-text-muted py-12">אין משתמשים</p>
        ) : (
          users.map((u) => (
            <UserCard key={u.id} user={u} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}
