import express from "express";
import cors from "cors";

import { PORT } from "./config.js";
import { initDatabase } from "./db.js";
import { authMiddleware } from "./middleware.js";

import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import feedRouter from "./routes/feed.js";
import happyJarRouter from "./routes/happyJar.js";
import gratitudeRouter from "./routes/gratitude.js";
import notesRouter from "./routes/notes.js";
import sosRouter from "./routes/sos.js";
import resetRouter from "./routes/reset.js";
import partnerRouter from "./routes/partner.js";
import adminRouter from "./routes/admin.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health check (public — no auth required)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Public auth routes
app.use("/api/auth", authRouter);

// Everything else under /api is protected
app.use("/api", authMiddleware);

app.use("/api", userRouter);                // /me, /pair
app.use("/api/feed", feedRouter);
app.use("/api/happy-jar", happyJarRouter);
app.use("/api/gratitude", gratitudeRouter);
app.use("/api/notes", notesRouter);
app.use("/api/sos-sentences", sosRouter);
app.use("/api/reset", resetRouter);
app.use("/api/partner", partnerRouter);
app.use("/api/admin", adminRouter);

await initDatabase();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
