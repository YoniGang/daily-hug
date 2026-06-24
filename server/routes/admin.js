import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool, withTransaction } from "../db.js";
import { adminMiddleware } from "../middleware.js";

const router = Router();

// All admin routes require admin
router.use(adminMiddleware);

// List all users
router.get("/users", async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT id, email, name, partner_email, is_admin, created_at FROM users ORDER BY created_at ASC"
  );
  res.json(rows);
});

// Create a new user (admin-only). Unlike /auth/register this does NOT issue a
// token, claim orphaned data, or change the admin's session — it just inserts.
router.post("/users", async (req, res) => {
  const { name, email, password, isAdmin } = req.body;
  if (!name || !email || !password) {
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
  const is_admin = isAdmin ? 1 : 0;

  await pool.query(
    "INSERT INTO users (id, email, password_hash, name, partner_email, created_at, is_admin) VALUES ($1, $2, $3, $4, NULL, $5, $6)",
    [id, email, password_hash, name, created_at, is_admin]
  );

  res.json({ id, email, name, partner_email: null, is_admin, created_at });
});

// Update user details (name, email, partner_email)
router.put("/users/:id", async (req, res) => {
  const { name, email, partnerEmail } = req.body;
  const { rows: targetRows } = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [req.params.id]
  );
  const target = targetRows[0];
  if (!target) return res.status(404).json({ error: "משתמש/ת לא נמצא/ה" });

  const newName = name !== undefined ? name : target.name;
  const newEmail = email !== undefined ? email : target.email;
  const newPartner = partnerEmail !== undefined ? partnerEmail : target.partner_email;

  // If email changed, check uniqueness
  if (newEmail !== target.email) {
    const { rows: dupRows } = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND id != $2",
      [newEmail, target.id]
    );
    if (dupRows[0]) return res.status(409).json({ error: "האימייל הזה כבר בשימוש" });
  }

  await withTransaction(async (client) => {
    await client.query(
      "UPDATE users SET name = $1, email = $2, partner_email = $3 WHERE id = $4",
      [newName, newEmail, newPartner, target.id]
    );

    // If email changed, update all content ownership + partner references
    if (newEmail !== target.email) {
      for (const t of ["feed_posts", "happy_jar", "gratitude_archive", "general_notes"]) {
        await client.query(
          `UPDATE ${t} SET owner_email = $1 WHERE owner_email = $2`,
          [newEmail, target.email]
        );
      }
      // Update anyone who had the old email as partner
      await client.query(
        "UPDATE users SET partner_email = $1 WHERE partner_email = $2",
        [newEmail, target.email]
      );
    }
  });

  res.json({ id: target.id, email: newEmail, name: newName, partner_email: newPartner, is_admin: target.is_admin });
});

// Reset user password
router.put("/users/:id/password", async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "הסיסמה חייבת להכיל לפחות 6 תווים" });
  }
  const { rows: targetRows } = await pool.query(
    "SELECT id FROM users WHERE id = $1",
    [req.params.id]
  );
  if (!targetRows[0]) return res.status(404).json({ error: "משתמש/ת לא נמצא/ה" });

  const password_hash = bcrypt.hashSync(newPassword, 10);
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
    password_hash,
    req.params.id,
  ]);
  res.json({ ok: true });
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  const { rows: targetRows } = await pool.query(
    "SELECT id, email FROM users WHERE id = $1",
    [req.params.id]
  );
  const target = targetRows[0];
  if (!target) return res.status(404).json({ error: "משתמש/ת לא נמצא/ה" });
  if (target.id === req.user.id) return res.status(400).json({ error: "לא ניתן למחוק את עצמך" });

  await withTransaction(async (client) => {
    // Unpair anyone who was paired with this user
    await client.query(
      "UPDATE users SET partner_email = NULL WHERE partner_email = $1",
      [target.email]
    );
    // Delete all their content
    for (const t of ["feed_posts", "happy_jar", "gratitude_archive", "general_notes"]) {
      await client.query(`DELETE FROM ${t} WHERE owner_email = $1`, [target.email]);
    }
    await client.query("DELETE FROM users WHERE id = $1", [target.id]);
  });

  res.json({ ok: true });
});

export default router;
