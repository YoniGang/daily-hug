import { Router } from "express";
import { pool, withTransaction } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM general_notes WHERE owner_email = $1 ORDER BY sort_order ASC",
    [req.user.email]
  );
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { text, color } = req.body;
  const id = `n-${Date.now()}`;
  const timestamp = Date.now();
  await withTransaction(async (client) => {
    // Scope sort_order bump to this user's notes only
    await client.query(
      "UPDATE general_notes SET sort_order = sort_order + 1 WHERE owner_email = $1",
      [req.user.email]
    );
    await client.query(
      "INSERT INTO general_notes (id, text, color, timestamp, sort_order, owner_email) VALUES ($1, $2, $3, $4, 0, $5)",
      [id, text, color, timestamp, req.user.email]
    );
  });
  res.json({ id, text, color, timestamp, sort_order: 0 });
});

// Must be declared before /:id so Express doesn't match "reorder" as an id
router.put("/reorder", async (req, res) => {
  const { orderedIds } = req.body;
  await withTransaction(async (client) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await client.query(
        "UPDATE general_notes SET sort_order = $1 WHERE id = $2 AND owner_email = $3",
        [i, orderedIds[i], req.user.email]
      );
    }
  });
  res.json({ ok: true });
});

router.put("/:id", async (req, res) => {
  const { text, color } = req.body;
  await pool.query(
    "UPDATE general_notes SET text = $1, color = $2 WHERE id = $3 AND owner_email = $4",
    [text, color, req.params.id, req.user.email]
  );
  res.json({ ok: true });
});

router.delete("/:id", async (req, res) => {
  await pool.query(
    "DELETE FROM general_notes WHERE id = $1 AND owner_email = $2",
    [req.params.id, req.user.email]
  );
  res.json({ ok: true });
});

export default router;
