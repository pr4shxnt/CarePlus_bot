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

// Trust first proxy hop so express-rate-limit can read X-Forwarded-For correctly
app.set("trust proxy", 1);

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

import { Session } from "./models/Session";
import { Patient } from "./models/Patient";

// Migrate existing sessions lacking botId
async function migrateMissingBotIds() {
  try {
    const sessionsWithoutBotId = await Session.find({
      $or: [{ botId: { $exists: false } }, { botId: "" }, { botId: null }],
    });
    if (sessionsWithoutBotId.length > 0) {
      console.log(`[Migration] Found ${sessionsWithoutBotId.length} sessions missing botId. Migrating...`);
      for (const session of sessionsWithoutBotId) {
        let targetBotId = "bot_1";
        if (session.patientId) {
          const patient = await Patient.findById(session.patientId);
          if (patient && patient.botId) {
            targetBotId = patient.botId;
          }
        }
        await Session.updateOne({ _id: session._id }, { $set: { botId: targetBotId } });
        console.log(`[Migration] Updated session ${session.sessionId} with botId ${targetBotId}`);
      }
      console.log("[Migration] BotId migration complete.");
    }
  } catch (err) {
    console.error("[Migration] Error running migration:", err);
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────
import { generateDailyReportsForToday } from "./services/report.service";

function startScheduler() {
  let lastRunDate = "";
  setInterval(async () => {
    const now = new Date();
    // Check for 10:00 PM (hour 22, minute 0)
    if (now.getHours() === 22 && now.getMinutes() === 0) {
      const todayStr = now.toDateString();
      if (lastRunDate !== todayStr) {
        lastRunDate = todayStr;
        try {
          console.log("[Scheduler] Triggering daily report generation at 10:00 PM...");
          await generateDailyReportsForToday();
        } catch (err) {
          console.error("[Scheduler] Error in automated daily report generation:", err);
        }
      }
    }
  }, 60000);
}

async function main() {
  await connectDB(MONGO_URI);
  await migrateMissingBotIds();
  startScheduler();
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
