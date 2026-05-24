import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM sos_sentences ORDER BY subject, id"
  );
  res.json(rows);
});

export default router;
