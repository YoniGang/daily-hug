import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool, withTransaction } from "../db.js";
import { generateToken } from "../middleware.js";

const router = Router();

async function claimOrphanedData(email) {
  const tables = ["feed_posts", "happy_jar", "gratitude_archive", "general_notes"];
  await withTransaction(async (client) => {
    for (const t of tables) {
      await client.query(
        `UPDATE ${t} SET owner_email = $1 WHERE owner_email = ''`,
        [email]
      );
    }
  });
}

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "כל השדות נדרשים" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "הסיסמה חייבת להכיל לפחות 6 תווים" });
  }
  const { rows: existing } = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );
  if (existing[0]) {
    return res.status(409).json({ error: "האימייל הזה כבר רשום" });
  }

  const id = `u-${Date.now()}`;
  const password_hash = bcrypt.hashSync(password, 10);
  const created_at = Date.now();

  await pool.query(
    "INSERT INTO users (id, email, password_hash, name, partner_email, created_at) VALUES ($1, $2, $3, $4, NULL, $5)",
    [id, email, password_hash, name, created_at]
  );

  // If this is the very first user, claim any orphaned data
  const { rows: countRows } = await pool.query(
    "SELECT COUNT(*) AS cnt FROM users"
  );
  if (countRows[0].cnt === 1) {
    await claimOrphanedData(email);
  }

  // Auto-grant admin to yonigang1@gmail.com
  const is_admin = email === "yonigang1@gmail.com" ? 1 : 0;
  if (is_admin) {
    await pool.query("UPDATE users SET is_admin = 1 WHERE id = $1", [id]);
  }

  const token = generateToken(id);
  res.json({ token, user: { id, email, name, partner_email: null, is_admin } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "אימייל וסיסמה נדרשים" });
  }
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = rows[0];
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "אימייל או סיסמה שגויים" });
  }

  const token = generateToken(user.id);
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, partner_email: user.partner_email, is_admin: user.is_admin || 0 },
  });
});

export default router;
