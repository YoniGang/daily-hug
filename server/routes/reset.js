import { Router } from "express";
import { withTransaction } from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  const { feedPosts, happyJarItems, gratitudeArchive, generalNotes } = req.body;
  const email = req.user.email;

  await withTransaction(async (client) => {
    await client.query("DELETE FROM feed_posts        WHERE owner_email = $1", [email]);
    await client.query("DELETE FROM happy_jar         WHERE owner_email = $1", [email]);
    await client.query("DELETE FROM gratitude_archive WHERE owner_email = $1", [email]);
    await client.query("DELETE FROM general_notes     WHERE owner_email = $1", [email]);

    for (const p of feedPosts) {
      await client.query(
        "INSERT INTO feed_posts (id, type, content, emoji, timestamp, owner_email) VALUES ($1, $2, $3, $4, $5, $6)",
        [p.id, p.type, p.content, p.emoji || null, p.timestamp, email]
      );
    }

    for (const j of happyJarItems) {
      await client.query(
        "INSERT INTO happy_jar (id, type, title, description, color, source_note_id, source_feed_id, owner_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [j.id, j.type, j.title, j.description, j.color, j.sourceNoteId || null, j.sourceFeedId || null, email]
      );
    }

    for (const g of gratitudeArchive) {
      await client.query(
        "INSERT INTO gratitude_archive (id, items, timestamp, owner_email) VALUES ($1, $2, $3, $4)",
        [g.id, JSON.stringify(g.items), g.timestamp, email]
      );
    }

    for (let i = 0; i < generalNotes.length; i++) {
      const n = generalNotes[i];
      await client.query(
        "INSERT INTO general_notes (id, text, color, timestamp, sort_order, owner_email) VALUES ($1, $2, $3, $4, $5, $6)",
        [n.id, n.text, n.color, n.timestamp, i, email]
      );
    }
  });

  res.json({ ok: true });
});

export default router;
