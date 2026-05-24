import { Router } from "express";
import { pool, withTransaction } from "../db.js";

const router = Router();

router.get("/me", (req, res) => {
  res.json(req.user);
});

router.post("/pair", async (req, res) => {
  const { partnerEmail } = req.body;
  if (!partnerEmail) {
    return res.status(400).json({ error: "אנא הזן/י אימייל" });
  }
  if (partnerEmail === req.user.email) {
    return res.status(400).json({ error: "לא ניתן להתחבר לעצמך" });
  }
  const { rows } = await pool.query(
    "SELECT id, email FROM users WHERE email = $1",
    [partnerEmail]
  );
  const partner = rows[0];
  if (!partner) {
    return res.status(404).json({ error: "האימייל הזה עדיין לא רשום" });
  }

  // Bidirectional pairing
  await withTransaction(async (client) => {
    await client.query("UPDATE users SET partner_email = $1 WHERE id = $2", [
      partnerEmail,
      req.user.id,
    ]);
    await client.query("UPDATE users SET partner_email = $1 WHERE id = $2", [
      req.user.email,
      partner.id,
    ]);
  });

  res.json({ id: req.user.id, email: req.user.email, name: req.user.name, partner_email: partnerEmail });
});

export default router;
