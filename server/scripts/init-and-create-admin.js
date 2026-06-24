// One-off: initialize the Postgres schema pointed to by DATABASE_URL and
// create (or reset) a single admin user. No data is copied. Idempotent —
// re-running just resets the user's password / admin flag.
//
// Usage:
//   Make sure DATABASE_URL in .env points at the target database, then:
//     node server/scripts/init-and-create-admin.js
//
// Override the defaults via env vars if needed:
//   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME

import bcrypt from "bcryptjs";
import { pool, initDatabase } from "../db.js";

const EMAIL = process.env.ADMIN_EMAIL || "yonigang1@gmail.com";
const PASSWORD = process.env.ADMIN_PASSWORD || "11223322";
const NAME = process.env.ADMIN_NAME || "יוני";
const ID = `u-${Date.now()}`;

console.log(`Target Postgres: ${process.env.DATABASE_URL ?? "(DATABASE_URL not set)"}`);

try {
  console.log("Initializing schema...");
  await initDatabase();

  console.log(`Creating admin user ${EMAIL} ...`);
  const password_hash = bcrypt.hashSync(PASSWORD, 10);
  await pool.query(
    `INSERT INTO users (id, email, password_hash, name, partner_email, created_at, is_admin)
     VALUES ($1, $2, $3, $4, NULL, $5, 1)
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       name          = EXCLUDED.name,
       is_admin      = 1`,
    [ID, EMAIL, password_hash, NAME, Date.now()]
  );

  // Verify
  const { rows } = await pool.query(
    "SELECT id, email, name, is_admin, password_hash FROM users WHERE email = $1",
    [EMAIL]
  );
  const u = rows[0];
  console.log("Created/updated:", {
    id: u.id,
    email: u.email,
    name: u.name,
    is_admin: u.is_admin,
    password_ok: bcrypt.compareSync(PASSWORD, u.password_hash),
  });
  console.log("Done.");
} finally {
  await pool.end();
}
