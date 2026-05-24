// One-off migration: copy data from local database.sqlite into the Postgres
// instance pointed to by DATABASE_URL. Idempotent — re-running skips rows
// that already exist (ON CONFLICT DO NOTHING).
//
// Usage:
//   1. Install better-sqlite3 without persisting it as a dependency:
//        npm install --no-save better-sqlite3
//   2. Make sure DATABASE_URL points at the target Postgres database.
//   3. Run:
//        node server/scripts/migrate-from-sqlite.js [path/to/database.sqlite]
//      The path argument is optional; defaults to ./database.sqlite.

import { createRequire } from "module";
import path from "path";
import { pool, withTransaction, initDatabase } from "../db.js";

const require = createRequire(import.meta.url);

let Database;
try {
  Database = require("better-sqlite3");
} catch {
  console.error(
    "better-sqlite3 is not installed. Run:\n  npm install --no-save better-sqlite3\nthen try again."
  );
  process.exit(1);
}

const sqlitePath = process.argv[2] || path.resolve("database.sqlite");
console.log(`Source SQLite : ${sqlitePath}`);
console.log(`Target Postgres: ${process.env.DATABASE_URL ?? "(DATABASE_URL not set)"}`);

const sqlite = new Database(sqlitePath, { readonly: true, fileMustExist: true });

// Ensure target schema exists
await initDatabase();

async function copyTable(name, columns, transform = (r) => r) {
  const rows = sqlite.prepare(`SELECT * FROM ${name}`).all();
  if (rows.length === 0) {
    console.log(`  ${name}: 0 rows`);
    return;
  }
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const sql = `INSERT INTO ${name} (${columns.join(", ")}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`;
  let inserted = 0;
  await withTransaction(async (client) => {
    for (const raw of rows) {
      const r = transform(raw);
      const result = await client.query(
        sql,
        columns.map((c) => (r[c] === undefined ? null : r[c]))
      );
      inserted += result.rowCount;
    }
  });
  console.log(`  ${name}: ${inserted} inserted (${rows.length - inserted} skipped)`);
}

try {
  console.log("Copying tables...");
  await copyTable("users", [
    "id", "email", "password_hash", "name", "partner_email", "created_at", "is_admin",
  ]);
  await copyTable("feed_posts", [
    "id", "type", "content", "emoji", "timestamp", "owner_email", "image_blob",
  ]);
  await copyTable("happy_jar", [
    "id", "type", "title", "description", "color",
    "source_note_id", "source_feed_id", "owner_email", "image_blob",
  ]);
  await copyTable("gratitude_archive", [
    "id", "items", "timestamp", "owner_email",
  ]);
  await copyTable("general_notes", [
    "id", "text", "color", "timestamp", "sort_order", "owner_email",
  ]);
  await copyTable("sos_sentences", ["id", "subject", "sentence"]);
  console.log("Done.");
} finally {
  sqlite.close();
  await pool.end();
}
