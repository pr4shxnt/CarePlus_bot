import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db";
import { errorHandler, notFound } from "./middleware/error";

// Routes
import authRoutes from "./routes/auth.routes";
import botRoutes from "./routes/bot.routes";
import doctorRoutes from "./routes/doctor.routes";
import guardianRoutes from "./routes/guardian.routes";

const PORT = parseInt(process.env.PORT || "4000", 10);
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/jarvis";

// Guard — BOT_API_KEY must be set
if (!process.env.BOT_API_KEY) {
  console.error("❌ BOT_API_KEY env variable is not set. Exiting.");
  process.exit(1);
}

const app = express();

// ── Security ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGINS || "*").split(","),
    credentials: true,
  })
);

// Rate limit: 1000 requests per 15 minutes per IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Too many requests. Please try again later." },
  })
);

// ── Parsing ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Health ────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "jarvis-server",
    version: "2.0.0",
    time: new Date(),
    env: process.env.NODE_ENV,
  });
});

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/bot", botRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/guardian", guardianRoutes);

// ── Error handling ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Bootstrap ─────────────────────────────────────────────────────────────
async function main() {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`\n🚀 Jarvis Server v2.0 running on http://localhost:${PORT}`);
    console.log(`   Auth:     /api/auth`);
    console.log(`   Bot sync: /api/bot/sync  (X-Bot-Api-Key required)`);
    console.log(`   Doctor:   /api/doctor/   (JWT + role: doctor)`);
    console.log(`   Guardian: /api/guardian/ (JWT + role: guardian)\n`);
  });
}

main().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});

export default app;
