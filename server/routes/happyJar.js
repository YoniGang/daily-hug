import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// Joins are scoped by owner_email so a stale or hostile source_feed_id /
// source_note_id can never resolve to another user's content. INSERT also
// validates ownership; this is defense in depth.
const RESOLVED_SELECT = `
  SELECT hj.*,
    fp.content    AS feed_content,
    fp.emoji      AS feed_emoji,
    fp.image_blob AS feed_image_blob,
    fp.type       AS feed_type,
    gn.text       AS note_text,
    gn.color      AS note_color
  FROM happy_jar hj
  LEFT JOIN feed_posts    fp ON hj.source_feed_id = fp.id
                             AND fp.owner_email   = hj.owner_email
  LEFT JOIN general_notes gn ON hj.source_note_id = gn.id
                             AND gn.owner_email   = hj.owner_email
`;

function resolveRow(r) {
  const title = r.source_feed_id
    ? (r.feed_emoji ? `${r.feed_emoji} ${r.title || ""}`.trim() : r.title)
    : r.source_note_id
    ? (r.note_text || r.title)
    : r.title;

  const description = r.source_feed_id
    ? (r.feed_content || r.description)
    : r.description;

  const color = r.source_note_id && r.note_color
    ? r.note_color
    : r.color;

  const imageBlob = r.source_feed_id ? r.feed_image_blob : r.image_blob;

  return {
    id: r.id,
    type: r.type,
    title,
    description,
    color,
    sourceNoteId: r.source_note_id || undefined,
    sourceFeedId: r.source_feed_id || undefined,
    image_b64: imageBlob ? imageBlob.toString("base64") : undefined,
  };
}

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    `${RESOLVED_SELECT} WHERE hj.owner_email = $1`,
    [req.user.email]
  );
  res.json(rows.map(resolveRow));
});

router.post("/", async (req, res) => {
  const { type, title, description, color, sourceNoteId, sourceFeedId } = req.body;

  // Ownership validation: source rows, if referenced, must belong to the
  // caller. Without this a user could create a jar entry pointing at another
  // user's feed/note id and read it back via the GET handler.
  if (sourceFeedId) {
    const { rows } = await pool.query(
      "SELECT 1 FROM feed_posts WHERE id = $1 AND owner_email = $2",
      [sourceFeedId, req.user.email]
    );
    if (!rows[0]) return res.status(404).json({ error: "מקור לא נמצא" });
  }
  if (sourceNoteId) {
    const { rows } = await pool.query(
      "SELECT 1 FROM general_notes WHERE id = $1 AND owner_email = $2",
      [sourceNoteId, req.user.email]
    );
    if (!rows[0]) return res.status(404).json({ error: "מקור לא נמצא" });
  }

  const id = `hj-${Date.now()}`;
  await pool.query(
    "INSERT INTO happy_jar (id, type, title, description, color, source_note_id, source_feed_id, owner_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    [id, type, title || null, description || null, color, sourceNoteId || null, sourceFeedId || null, req.user.email]
  );

  // Re-read with JOINs to return resolved data
  const { rows } = await pool.query(
    `${RESOLVED_SELECT} WHERE hj.id = $1`,
    [id]
  );
  res.json(resolveRow(rows[0]));
});

router.delete("/:id", async (req, res) => {
  await pool.query(
    "DELETE FROM happy_jar WHERE id = $1 AND owner_email = $2",
    [req.params.id, req.user.email]
  );
  res.json({ ok: true });
});

export default router;
