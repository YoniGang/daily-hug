import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";
import { pool } from "./db.js";

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "אנא התחבר/י מחדש" });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    const { rows } = await pool.query(
      "SELECT id, email, name, partner_email, is_admin FROM users WHERE id = $1",
      [decoded.userId]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "משתמש/ת לא נמצא/ה" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "טוקן לא תקף" });
  }
}

export function adminMiddleware(req, res, next) {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: "אין הרשאת מנהל" });
  }
  next();
}
