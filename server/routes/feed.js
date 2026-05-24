import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM feed_posts WHERE owner_email = $1 ORDER BY timestamp DESC",
    [req.user.email]
  );
  res.json(
    rows.map(({ image_blob, ...rest }) => ({
      ...rest,
      image_b64: image_blob ? image_blob.toString("base64") : undefined,
    }))
  );
});

router.post("/", async (req, res) => {
  const { type, content, emoji } = req.body;
  const id = `p-${Date.now()}`;
  const timestamp = Date.now();
  await pool.query(
    "INSERT INTO feed_posts (id, type, content, emoji, timestamp, owner_email) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, type, content, emoji || null, timestamp, req.user.email]
  );
  res.json({ id, type, content, emoji: emoji || null, timestamp, owner_email: req.user.email });
});

export default router;
