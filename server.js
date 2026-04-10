import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// Multer: accept a single image in memory, 2 MB max (images arrive pre-compressed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("רק קבצי תמונה מותרים"));
  },
});

// --- Database setup ---
const db = new Database("database.sqlite");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    partner_email TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS feed_posts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    emoji TEXT,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS happy_jar (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT,
    description TEXT,
    color TEXT,
    source_note_id TEXT
  );

  CREATE TABLE IF NOT EXISTS gratitude_archive (
    id TEXT PRIMARY KEY,
    items TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS general_notes (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    color TEXT,
    timestamp INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS sos_sentences (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    sentence TEXT NOT NULL
  );
`);

// --- Migration: add owner_email column to content tables ---
function addColumnIfMissing(table, column, type, defaultVal) {
  const cols = db.pragma(`table_info(${table})`);
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type} DEFAULT ${defaultVal}`);
  }
}

addColumnIfMissing("feed_posts", "owner_email", "TEXT", "''");
addColumnIfMissing("happy_jar", "owner_email", "TEXT", "''");
addColumnIfMissing("gratitude_archive", "owner_email", "TEXT", "''");
addColumnIfMissing("general_notes", "owner_email", "TEXT", "''");
addColumnIfMissing("users", "is_admin", "INTEGER", "0");
addColumnIfMissing("feed_posts", "image_blob", "BLOB", "NULL");
addColumnIfMissing("happy_jar", "image_blob", "BLOB", "NULL");
addColumnIfMissing("happy_jar", "source_feed_id", "TEXT", "NULL");

// Ensure yonigang1@gmail.com is always admin
db.prepare("UPDATE users SET is_admin = 1 WHERE email = ?").run("yonigang1@gmail.com");

// --- Seed sos_sentences if empty ---
{
  const count = db.prepare("SELECT COUNT(*) AS cnt FROM sos_sentences").get().cnt;
  if (count === 0) {
    const insert = db.prepare("INSERT INTO sos_sentences (id, subject, sentence) VALUES (?, ?, ?)");
    const tx = db.transaction(() => {
      // חרדה (anxious)
      insert.run("sos-1",  "anxious", "כל מה שאת רוצה נמצא בצד השני של הפחד");
      insert.run("sos-2",  "anxious", "בלילה הכי חשוך יש כוכבים שמאירים");
      insert.run("sos-3",  "anxious", "זכרי, זה רק זמני. ימים טובים יותר מחכים");
      insert.run("sos-4",  "anxious", "אל תשפטי כל יום לפי הקציר שקצרת, אלא לפי הזרעים שזרעת");
      insert.run("sos-5",  "anxious", "את בטוחה. ההרגשה הזו זמנית. בואי נאט ביחד");
      // חוסר ביטחון (insecure)
      insert.run("sos-6",  "insecure", "תאמיני שאת יכולה ואת כבר במחצית הדרך");
      insert.run("sos-7",  "insecure", "את אמיצה יותר ממה שאת מאמינה, חזקה יותר ממה שנראה");
      insert.run("sos-8",  "insecure", "תחשבי כמו מלכה. מלכה לא מפחדת להיכשל");
      insert.run("sos-9",  "insecure", "הסתכלי במראה, זו התחרות שלך");
      insert.run("sos-10", "insecure", "יש בך את הפוטנציאל להגשים חלומות");
      // עומס (overwhelmed)
      insert.run("sos-11", "overwhelmed", "שום דבר הוא קשה במיוחד אם את מחלקת אותו לחתיכות קטנות");
      insert.run("sos-12", "overwhelmed", "זה לא משנה כמה לאט את הולכת, העיקר שלא תעצרי");
      insert.run("sos-13", "overwhelmed", "מסע של אלף קילומטר מתחיל בצעד אחד");
      insert.run("sos-14", "overwhelmed", "כל יום הוא הזדמנות חדשה להתחיל מהתחלה");
      insert.run("sos-15", "overwhelmed", "תתחילי מאיפה שאת עומדת ותעבדי עם הכלים שעובדים כרגע");
      // עצב (sad)
      insert.run("sos-16", "sad", "זכרי שזה רק יום רע, לא חיים רעים");
      insert.run("sos-17", "sad", "אחרי כל גשם מגיעה קשת");
      insert.run("sos-18", "sad", "השמש תזרח שוב, אל תאבדי תקווה");
      insert.run("sos-19", "sad", "אל תבכי כי זה נגמר. תחייכי כי זה קרה");
      insert.run("sos-20", "sad", "המשיכי ללכת, כל מה שתצטרכי יגיע אלייך בזמן הנכון");
      insert.run("sos-21", "sad", "יש תמיד אור בקצה המנהרה");
    });
    tx();
  }
}

// --- Helpers ---
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

function claimOrphanedData(email) {
  const tables = ["feed_posts", "happy_jar", "gratitude_archive", "general_notes"];
  const tx = db.transaction(() => {
    for (const t of tables) {
      db.prepare(`UPDATE ${t} SET owner_email = ? WHERE owner_email = ''`).run(email);
    }
  });
  tx();
}

// --- Auth middleware ---
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "אנא התחבר/י מחדש" });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    const user = db
      .prepare("SELECT id, email, name, partner_email, is_admin FROM users WHERE id = ?")
      .get(decoded.userId);
    if (!user) return res.status(401).json({ error: "משתמש/ת לא נמצא/ה" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "טוקן לא תקף" });
  }
}

// =====================  PUBLIC AUTH ROUTES  =====================

app.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "כל השדות נדרשים" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "הסיסמה חייבת להכיל לפחות 6 תווים" });
  }
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "האימייל הזה כבר רשום" });
  }

  const id = `u-${Date.now()}`;
  const password_hash = bcrypt.hashSync(password, 10);
  const created_at = Date.now();

  db.prepare(
    "INSERT INTO users (id, email, password_hash, name, partner_email, created_at) VALUES (?, ?, ?, ?, NULL, ?)"
  ).run(id, email, password_hash, name, created_at);

  // If this is the very first user, claim any orphaned data
  const userCount = db.prepare("SELECT COUNT(*) AS cnt FROM users").get().cnt;
  if (userCount === 1) {
    claimOrphanedData(email);
  }

  // Auto-grant admin to yonigang1@gmail.com
  const is_admin = email === "yonigang1@gmail.com" ? 1 : 0;
  if (is_admin) {
    db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?").run(id);
  }

  const token = generateToken(id);
  res.json({ token, user: { id, email, name, partner_email: null, is_admin } });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "אימייל וסיסמה נדרשים" });
  }
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "אימייל או סיסמה שגויים" });
  }

  const token = generateToken(user.id);
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, partner_email: user.partner_email, is_admin: user.is_admin || 0 },
  });
});

// =====================  PROTECTED ROUTES  =====================

app.use("/api", authMiddleware);

// --- Profile ---
app.get("/api/me", (req, res) => {
  res.json(req.user);
});

// --- Pairing ---
app.post("/api/pair", (req, res) => {
  const { partnerEmail } = req.body;
  if (!partnerEmail) {
    return res.status(400).json({ error: "אנא הזן/י אימייל" });
  }
  if (partnerEmail === req.user.email) {
    return res.status(400).json({ error: "לא ניתן להתחבר לעצמך" });
  }
  const partner = db.prepare("SELECT id, email FROM users WHERE email = ?").get(partnerEmail);
  if (!partner) {
    return res.status(404).json({ error: "האימייל הזה עדיין לא רשום" });
  }

  // Bidirectional pairing
  const tx = db.transaction(() => {
    db.prepare("UPDATE users SET partner_email = ? WHERE id = ?").run(partnerEmail, req.user.id);
    db.prepare("UPDATE users SET partner_email = ? WHERE id = ?").run(req.user.email, partner.id);
  });
  tx();

  res.json({ id: req.user.id, email: req.user.email, name: req.user.name, partner_email: partnerEmail });
});

// =====================  FEED  =====================

app.get("/api/feed", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM feed_posts WHERE owner_email = ? ORDER BY timestamp DESC")
    .all(req.user.email);
  res.json(
    rows.map(({ image_blob, ...rest }) => ({
      ...rest,
      image_b64: image_blob ? Buffer.from(image_blob).toString("base64") : undefined,
    }))
  );
});

app.post("/api/feed", (req, res) => {
  const { type, content, emoji } = req.body;
  const id = `p-${Date.now()}`;
  const timestamp = Date.now();
  db.prepare(
    "INSERT INTO feed_posts (id, type, content, emoji, timestamp, owner_email) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, type, content, emoji || null, timestamp, req.user.email);
  res.json({ id, type, content, emoji: emoji || null, timestamp, owner_email: req.user.email });
});

// =====================  HAPPY JAR  =====================

app.get("/api/happy-jar", (req, res) => {
  const rows = db.prepare(`
    SELECT hj.*,
      fp.content  AS feed_content,
      fp.emoji    AS feed_emoji,
      fp.image_blob AS feed_image_blob,
      fp.type     AS feed_type,
      gn.text     AS note_text,
      gn.color    AS note_color
    FROM happy_jar hj
    LEFT JOIN feed_posts   fp ON hj.source_feed_id = fp.id
    LEFT JOIN general_notes gn ON hj.source_note_id = gn.id
    WHERE hj.owner_email = ?
  `).all(req.user.email);

  res.json(
    rows.map((r) => {
      // Resolve from feed_posts if referenced
      const title = r.source_feed_id
        ? (r.feed_emoji ? `${r.feed_emoji} ${r.title || ""}`.trim() : r.title)
        : r.source_note_id
        ? (r.note_text || r.title)
        : r.title;

      const description = r.source_feed_id
        ? (r.feed_content || r.description)
        : r.description;

      const color = r.source_note_id && r.note_color
        ? r.note_color
        : r.color;

      // Image: prefer feed image if referenced, else jar's own image
      const imageBlob = r.source_feed_id ? r.feed_image_blob : r.image_blob;

      return {
        id: r.id,
        type: r.type,
        title,
        description,
        color,
        sourceNoteId: r.source_note_id || undefined,
        sourceFeedId: r.source_feed_id || undefined,
        image_b64: imageBlob ? Buffer.from(imageBlob).toString("base64") : undefined,
      };
    })
  );
});

app.post("/api/happy-jar", (req, res) => {
  const { type, title, description, color, sourceNoteId, sourceFeedId } = req.body;
  const id = `hj-${Date.now()}`;
  db.prepare(
    "INSERT INTO happy_jar (id, type, title, description, color, source_note_id, source_feed_id, owner_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(id, type, title || null, description || null, color, sourceNoteId || null, sourceFeedId || null, req.user.email);

  // Re-read with JOINs to return resolved data
  const r = db.prepare(`
    SELECT hj.*,
      fp.content  AS feed_content,
      fp.emoji    AS feed_emoji,
      fp.image_blob AS feed_image_blob,
      gn.text     AS note_text,
      gn.color    AS note_color
    FROM happy_jar hj
    LEFT JOIN feed_posts   fp ON hj.source_feed_id = fp.id
    LEFT JOIN general_notes gn ON hj.source_note_id = gn.id
    WHERE hj.id = ?
  `).get(id);

  const resolvedTitle = r.source_feed_id
    ? (r.feed_emoji ? `${r.feed_emoji} ${r.title || ""}`.trim() : r.title)
    : r.source_note_id
    ? (r.note_text || r.title)
    : r.title;

  const resolvedDesc = r.source_feed_id
    ? (r.feed_content || r.description)
    : r.description;

  const resolvedColor = r.source_note_id && r.note_color
    ? r.note_color
    : r.color;

  const imageBlob = r.source_feed_id ? r.feed_image_blob : r.image_blob;

  res.json({
    id: r.id,
    type: r.type,
    title: resolvedTitle,
    description: resolvedDesc,
    color: resolvedColor,
    sourceNoteId: r.source_note_id || undefined,
    sourceFeedId: r.source_feed_id || undefined,
    image_b64: imageBlob ? Buffer.from(imageBlob).toString("base64") : undefined,
  });
});

app.delete("/api/happy-jar/:id", (req, res) => {
  db.prepare("DELETE FROM happy_jar WHERE id = ? AND owner_email = ?").run(
    req.params.id,
    req.user.email
  );
  res.json({ ok: true });
});

// =====================  GRATITUDE  =====================

app.get("/api/gratitude", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM gratitude_archive WHERE owner_email = ? ORDER BY timestamp DESC")
    .all(req.user.email);
  res.json(rows.map((r) => ({ ...r, items: JSON.parse(r.items) })));
});

app.post("/api/gratitude", (req, res) => {
  const { items } = req.body;
  const id = `g-${Date.now()}`;
  const timestamp = Date.now();
  db.prepare(
    "INSERT INTO gratitude_archive (id, items, timestamp, owner_email) VALUES (?, ?, ?, ?)"
  ).run(id, JSON.stringify(items), timestamp, req.user.email);
  res.json({ id, items, timestamp });
});

app.put("/api/gratitude/:id", (req, res) => {
  const { items } = req.body;
  db.prepare("UPDATE gratitude_archive SET items = ? WHERE id = ? AND owner_email = ?").run(
    JSON.stringify(items),
    req.params.id,
    req.user.email
  );
  res.json({ id: req.params.id, items });
});

// =====================  NOTES  =====================

app.get("/api/notes", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM general_notes WHERE owner_email = ? ORDER BY sort_order ASC")
    .all(req.user.email);
  res.json(rows);
});

app.post("/api/notes", (req, res) => {
  const { text, color } = req.body;
  const id = `n-${Date.now()}`;
  const timestamp = Date.now();
  // Scope sort_order bump to this user's notes only
  db.prepare("UPDATE general_notes SET sort_order = sort_order + 1 WHERE owner_email = ?").run(
    req.user.email
  );
  db.prepare(
    "INSERT INTO general_notes (id, text, color, timestamp, sort_order, owner_email) VALUES (?, ?, ?, ?, 0, ?)"
  ).run(id, text, color, timestamp, req.user.email);
  res.json({ id, text, color, timestamp, sort_order: 0 });
});

app.put("/api/notes/:id", (req, res) => {
  const { text, color } = req.body;
  db.prepare("UPDATE general_notes SET text = ?, color = ? WHERE id = ? AND owner_email = ?").run(
    text,
    color,
    req.params.id,
    req.user.email
  );
  res.json({ ok: true });
});

app.delete("/api/notes/:id", (req, res) => {
  db.prepare("DELETE FROM general_notes WHERE id = ? AND owner_email = ?").run(
    req.params.id,
    req.user.email
  );
  res.json({ ok: true });
});

app.put("/api/notes/reorder", (req, res) => {
  const { orderedIds } = req.body;
  const update = db.prepare(
    "UPDATE general_notes SET sort_order = ? WHERE id = ? AND owner_email = ?"
  );
  const tx = db.transaction(() => {
    orderedIds.forEach((id, i) => update.run(i, id, req.user.email));
  });
  tx();
  res.json({ ok: true });
});

// =====================  SOS SENTENCES  =====================

app.get("/api/sos-sentences", (req, res) => {
  const rows = db.prepare("SELECT * FROM sos_sentences ORDER BY subject, id").all();
  res.json(rows);
});

// =====================  RESET  =====================

app.post("/api/reset", (req, res) => {
  const { feedPosts, happyJarItems, gratitudeArchive, generalNotes } = req.body;
  const email = req.user.email;

  const tx = db.transaction(() => {
    db.prepare("DELETE FROM feed_posts WHERE owner_email = ?").run(email);
    db.prepare("DELETE FROM happy_jar WHERE owner_email = ?").run(email);
    db.prepare("DELETE FROM gratitude_archive WHERE owner_email = ?").run(email);
    db.prepare("DELETE FROM general_notes WHERE owner_email = ?").run(email);

    const insertFeed = db.prepare(
      "INSERT INTO feed_posts (id, type, content, emoji, timestamp, owner_email) VALUES (?, ?, ?, ?, ?, ?)"
    );
    for (const p of feedPosts) {
      insertFeed.run(p.id, p.type, p.content, p.emoji || null, p.timestamp, email);
    }

    const insertJar = db.prepare(
      "INSERT INTO happy_jar (id, type, title, description, color, source_note_id, source_feed_id, owner_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const j of happyJarItems) {
      insertJar.run(j.id, j.type, j.title, j.description, j.color, j.sourceNoteId || null, j.sourceFeedId || null, email);
    }

    const insertGrat = db.prepare(
      "INSERT INTO gratitude_archive (id, items, timestamp, owner_email) VALUES (?, ?, ?, ?)"
    );
    for (const g of gratitudeArchive) {
      insertGrat.run(g.id, JSON.stringify(g.items), g.timestamp, email);
    }

    const insertNote = db.prepare(
      "INSERT INTO general_notes (id, text, color, timestamp, sort_order, owner_email) VALUES (?, ?, ?, ?, ?, ?)"
    );
    generalNotes.forEach((n, i) => {
      insertNote.run(n.id, n.text, n.color, n.timestamp, i, email);
    });
  });

  tx();
  res.json({ ok: true });
});

// =====================  PARTNER (SEND LOVE)  =====================

app.post("/api/partner/daily", upload.single("image"), (req, res) => {
  if (!req.user.partner_email) {
    return res.status(400).json({ error: "לא מחובר/ת לבן/בת זוג" });
  }
  const { content, emoji } = req.body;
  if (!content) return res.status(400).json({ error: "תוכן נדרש" });
  const id = `p-${Date.now()}`;
  const timestamp = Date.now();
  const imageBlob = req.file ? req.file.buffer : null;
  db.prepare(
    "INSERT INTO feed_posts (id, type, content, emoji, timestamp, owner_email, image_blob) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(id, "daily-message", content, emoji || null, timestamp, req.user.partner_email, imageBlob);
  const result = { id, type: "daily-message", content, emoji: emoji || null, timestamp };
  if (imageBlob) result.image_b64 = imageBlob.toString("base64");
  res.json(result);
});

app.post("/api/partner/jar", upload.single("image"), (req, res) => {
  if (!req.user.partner_email) {
    return res.status(400).json({ error: "לא מחובר/ת לבן/בת זוג" });
  }
  const { type, title, description, color } = req.body;
  if (!title || !description) return res.status(400).json({ error: "כותרת ותיאור נדרשים" });
  const id = `hj-${Date.now()}`;
  const imageBlob = req.file ? req.file.buffer : null;
  db.prepare(
    "INSERT INTO happy_jar (id, type, title, description, color, source_note_id, owner_email, image_blob) VALUES (?, ?, ?, ?, ?, NULL, ?, ?)"
  ).run(id, type || "memory", title, description, color || "peach", req.user.partner_email, imageBlob);
  const result = { id, type: type || "memory", title, description, color: color || "peach" };
  if (imageBlob) result.image_b64 = imageBlob.toString("base64");
  res.json(result);
});

app.post("/api/partner/feed", upload.single("image"), (req, res) => {
  if (!req.user.partner_email) {
    return res.status(400).json({ error: "לא מחובר/ת לבן/בת זוג" });
  }
  const { type, content, emoji } = req.body;
  if (!content) return res.status(400).json({ error: "תוכן נדרש" });
  const id = `p-${Date.now()}`;
  const timestamp = Date.now();
  const imageBlob = req.file ? req.file.buffer : null;
  db.prepare(
    "INSERT INTO feed_posts (id, type, content, emoji, timestamp, owner_email, image_blob) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(id, type || "love", content, emoji || null, timestamp, req.user.partner_email, imageBlob);
  const result = { id, type: type || "love", content, emoji: emoji || null, timestamp };
  if (imageBlob) result.image_b64 = imageBlob.toString("base64");
  res.json(result);
});

// =====================  ADMIN  =====================

function adminMiddleware(req, res, next) {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: "אין הרשאת מנהל" });
  }
  next();
}

// List all users
app.get("/api/admin/users", adminMiddleware, (req, res) => {
  const rows = db
    .prepare("SELECT id, email, name, partner_email, is_admin, created_at FROM users ORDER BY created_at ASC")
    .all();
  res.json(rows);
});

// Update user details (name, email, partner_email)
app.put("/api/admin/users/:id", adminMiddleware, (req, res) => {
  const { name, email, partnerEmail } = req.body;
  const target = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!target) return res.status(404).json({ error: "משתמש/ת לא נמצא/ה" });

  const newName = name !== undefined ? name : target.name;
  const newEmail = email !== undefined ? email : target.email;
  const newPartner = partnerEmail !== undefined ? partnerEmail : target.partner_email;

  // If email changed, check uniqueness
  if (newEmail !== target.email) {
    const dup = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(newEmail, target.id);
    if (dup) return res.status(409).json({ error: "האימייל הזה כבר בשימוש" });
  }

  const tx = db.transaction(() => {
    db.prepare("UPDATE users SET name = ?, email = ?, partner_email = ? WHERE id = ?").run(
      newName, newEmail, newPartner, target.id
    );

    // If email changed, update all content ownership + partner references
    if (newEmail !== target.email) {
      for (const t of ["feed_posts", "happy_jar", "gratitude_archive", "general_notes"]) {
        db.prepare(`UPDATE ${t} SET owner_email = ? WHERE owner_email = ?`).run(newEmail, target.email);
      }
      // Update anyone who had the old email as partner
      db.prepare("UPDATE users SET partner_email = ? WHERE partner_email = ?").run(newEmail, target.email);
    }
  });
  tx();

  res.json({ id: target.id, email: newEmail, name: newName, partner_email: newPartner, is_admin: target.is_admin });
});

// Reset user password
app.put("/api/admin/users/:id/password", adminMiddleware, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "הסיסמה חייבת להכיל לפחות 6 תווים" });
  }
  const target = db.prepare("SELECT id FROM users WHERE id = ?").get(req.params.id);
  if (!target) return res.status(404).json({ error: "משתמש/ת לא נמצא/ה" });

  const password_hash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(password_hash, target.id);
  res.json({ ok: true });
});

// Delete user
app.delete("/api/admin/users/:id", adminMiddleware, (req, res) => {
  const target = db.prepare("SELECT id, email FROM users WHERE id = ?").get(req.params.id);
  if (!target) return res.status(404).json({ error: "משתמש/ת לא נמצא/ה" });
  if (target.id === req.user.id) return res.status(400).json({ error: "לא ניתן למחוק את עצמך" });

  const tx = db.transaction(() => {
    // Unpair anyone who was paired with this user
    db.prepare("UPDATE users SET partner_email = NULL WHERE partner_email = ?").run(target.email);
    // Delete all their content
    for (const t of ["feed_posts", "happy_jar", "gratitude_archive", "general_notes"]) {
      db.prepare(`DELETE FROM ${t} WHERE owner_email = ?`).run(target.email);
    }
    db.prepare("DELETE FROM users WHERE id = ?").run(target.id);
  });
  tx();

  res.json({ ok: true });
});

// =====================  START  =====================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
