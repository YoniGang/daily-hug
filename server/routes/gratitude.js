import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM gratitude_archive WHERE owner_email = $1 ORDER BY timestamp DESC",
    [req.user.email]
  );
  res.json(rows.map((r) => ({ ...r, items: JSON.parse(r.items) })));
});

router.post("/", async (req, res) => {
  const { items } = req.body;
  const id = `g-${Date.now()}`;
  const timestamp = Date.now();
  await pool.query(
    "INSERT INTO gratitude_archive (id, items, timestamp, owner_email) VALUES ($1, $2, $3, $4)",
    [id, JSON.stringify(items), timestamp, req.user.email]
  );
  res.json({ id, items, timestamp });
});

router.put("/:id", async (req, res) => {
  const { items } = req.body;
  await pool.query(
    "UPDATE gratitude_archive SET items = $1 WHERE id = $2 AND owner_email = $3",
    [JSON.stringify(items), req.params.id, req.user.email]
  );
  res.json({ id: req.params.id, items });
});

export default router;
