import { Router } from "express";
import { pool } from "../db.js";
import { upload } from "../upload.js";

const router = Router();

router.post("/daily", upload.single("image"), async (req, res) => {
  if (!req.user.partner_email) {
    return res.status(400).json({ error: "לא מחובר/ת לבן/בת זוג" });
  }
  const { content, emoji } = req.body;
  if (!content) return res.status(400).json({ error: "תוכן נדרש" });
  const id = `p-${Date.now()}`;
  const timestamp = Date.now();
  const imageBlob = req.file ? req.file.buffer : null;
  await pool.query(
    "INSERT INTO feed_posts (id, type, content, emoji, timestamp, owner_email, image_blob) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [id, "daily-message", content, emoji || null, timestamp, req.user.partner_email, imageBlob]
  );
  const result = { id, type: "daily-message", content, emoji: emoji || null, timestamp };
  if (imageBlob) result.image_b64 = imageBlob.toString("base64");
  res.json(result);
});

router.post("/jar", upload.single("image"), async (req, res) => {
  if (!req.user.partner_email) {
    return res.status(400).json({ error: "לא מחובר/ת לבן/בת זוג" });
  }
  const { type, title, description, color } = req.body;
  if (!title || !description) return res.status(400).json({ error: "כותרת ותיאור נדרשים" });
  const id = `hj-${Date.now()}`;
  const imageBlob = req.file ? req.file.buffer : null;
  await pool.query(
    "INSERT INTO happy_jar (id, type, title, description, color, source_note_id, owner_email, image_blob) VALUES ($1, $2, $3, $4, $5, NULL, $6, $7)",
    [id, type || "memory", title, description, color || "peach", req.user.partner_email, imageBlob]
  );
  const result = { id, type: type || "memory", title, description, color: color || "peach" };
  if (imageBlob) result.image_b64 = imageBlob.toString("base64");
  res.json(result);
});

router.post("/feed", upload.single("image"), async (req, res) => {
  if (!req.user.partner_email) {
    return res.status(400).json({ error: "לא מחובר/ת לבן/בת זוג" });
  }
  const { type, content, emoji } = req.body;
  if (!content) return res.status(400).json({ error: "תוכן נדרש" });
  const id = `p-${Date.now()}`;
  const timestamp = Date.now();
  const imageBlob = req.file ? req.file.buffer : null;
  await pool.query(
    "INSERT INTO feed_posts (id, type, content, emoji, timestamp, owner_email, image_blob) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [id, type || "love", content, emoji || null, timestamp, req.user.partner_email, imageBlob]
  );
  const result = { id, type: type || "love", content, emoji: emoji || null, timestamp };
  if (imageBlob) result.image_b64 = imageBlob.toString("base64");
  res.json(result);
});

export default router;
