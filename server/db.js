import pg from "pg";
import { DATABASE_URL, IS_PRODUCTION } from "./config.js";

const { Pool, types } = pg;

// Return BIGINT (int8, oid 20) as JS number so timestamps stay numeric
// across the wire. Safe here: Date.now() values are well under 2^53.
types.setTypeParser(20, (val) => (val === null ? null : parseInt(val, 10)));

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: IS_PRODUCTION ? { rejectUnauthorized: false } : false,
});

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

const SOS_SEED = [
  // חרדה (anxious)
  ["sos-1",  "anxious",     "כל מה שאת רוצה נמצא בצד השני של הפחד"],
  ["sos-2",  "anxious",     "בלילה הכי חשוך יש כוכבים שמאירים"],
  ["sos-3",  "anxious",     "זכרי, זה רק זמני. ימים טובים יותר מחכים"],
  ["sos-4",  "anxious",     "אל תשפטי כל יום לפי הקציר שקצרת, אלא לפי הזרעים שזרעת"],
  ["sos-5",  "anxious",     "את בטוחה. ההרגשה הזו זמנית. בואי נאט ביחד"],
  // חוסר ביטחון (insecure)
  ["sos-6",  "insecure",    "תאמיני שאת יכולה ואת כבר במחצית הדרך"],
  ["sos-7",  "insecure",    "את אמיצה יותר ממה שאת מאמינה, חזקה יותר ממה שנראה"],
  ["sos-8",  "insecure",    "תחשבי כמו מלכה. מלכה לא מפחדת להיכשל"],
  ["sos-9",  "insecure",    "הסתכלי במראה, זו התחרות שלך"],
  ["sos-10", "insecure",    "יש בך את הפוטנציאל להגשים חלומות"],
  // עומס (overwhelmed)
  ["sos-11", "overwhelmed", "שום דבר הוא קשה במיוחד אם את מחלקת אותו לחתיכות קטנות"],
  ["sos-12", "overwhelmed", "זה לא משנה כמה לאט את הולכת, העיקר שלא תעצרי"],
  ["sos-13", "overwhelmed", "מסע של אלף קילומטר מתחיל בצעד אחד"],
  ["sos-14", "overwhelmed", "כל יום הוא הזדמנות חדשה להתחיל מהתחלה"],
  ["sos-15", "overwhelmed", "תתחילי מאיפה שאת עומדת ותעבדי עם הכלים שעובדים כרגע"],
  // עצב (sad)
  ["sos-16", "sad",         "זכרי שזה רק יום רע, לא חיים רעים"],
  ["sos-17", "sad",         "אחרי כל גשם מגיעה קשת"],
  ["sos-18", "sad",         "השמש תזרח שוב, אל תאבדי תקווה"],
  ["sos-19", "sad",         "אל תבכי כי זה נגמר. תחייכי כי זה קרה"],
  ["sos-20", "sad",         "המשיכי ללכת, כל מה שתצטרכי יגיע אלייך בזמן הנכון"],
  ["sos-21", "sad",         "יש תמיד אור בקצה המנהרה"],
];

export async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      partner_email TEXT,
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feed_posts (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      emoji TEXT,
      timestamp BIGINT NOT NULL
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
      timestamp BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS general_notes (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      color TEXT,
      timestamp BIGINT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sos_sentences (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      sentence TEXT NOT NULL
    );
  `);

  // --- Migration: add columns added over time ---
  const migrations = [
    `ALTER TABLE feed_posts        ADD COLUMN IF NOT EXISTS owner_email    TEXT DEFAULT ''`,
    `ALTER TABLE happy_jar         ADD COLUMN IF NOT EXISTS owner_email    TEXT DEFAULT ''`,
    `ALTER TABLE gratitude_archive ADD COLUMN IF NOT EXISTS owner_email    TEXT DEFAULT ''`,
    `ALTER TABLE general_notes     ADD COLUMN IF NOT EXISTS owner_email    TEXT DEFAULT ''`,
    `ALTER TABLE users             ADD COLUMN IF NOT EXISTS is_admin       INTEGER DEFAULT 0`,
    `ALTER TABLE feed_posts        ADD COLUMN IF NOT EXISTS image_blob     BYTEA`,
    `ALTER TABLE happy_jar         ADD COLUMN IF NOT EXISTS image_blob     BYTEA`,
    `ALTER TABLE happy_jar         ADD COLUMN IF NOT EXISTS source_feed_id TEXT`,
  ];
  for (const sql of migrations) await pool.query(sql);

  // Ensure yonigang1@gmail.com is always admin
  await pool.query("UPDATE users SET is_admin = 1 WHERE email = $1", [
    "yonigang1@gmail.com",
  ]);

  // --- Seed sos_sentences if empty ---
  const { rows: countRows } = await pool.query(
    "SELECT COUNT(*) AS cnt FROM sos_sentences"
  );
  if (countRows[0].cnt === 0) {
    await withTransaction(async (client) => {
      for (const [id, subject, sentence] of SOS_SEED) {
        await client.query(
          "INSERT INTO sos_sentences (id, subject, sentence) VALUES ($1, $2, $3)",
          [id, subject, sentence]
        );
      }
    });
  }
}
