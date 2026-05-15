import MedicineLog from "../models/medicine.log.model";
import Mood from "../models/mood.model";
import ChatHistory from "../models/chat.history.model";
import ObjectRecord from "../models/objects.model";

// ─── Date-range helpers ──────────────────────────────────────────

function getDateRange(period: string): { start: Date; end: Date; label: string } {
  const now = new Date();
  const end = new Date(now);

  let start: Date;
  let label: string;

  switch (period) {
    case "weekly": {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      label = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      break;
    }
    case "monthly": {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      label = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      break;
    }
    default: {
      // daily
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      label = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      break;
    }
  }

  return { start, end, label };
}

// ─── Aggregation functions ───────────────────────────────────────

async function aggregateMedicine(userId: string, start: Date, end: Date) {
  const logs = await MedicineLog.find({
    userId,
    timestamp: { $gte: start, $lte: end },
  }).sort({ timestamp: -1 });

  const total = logs.length;
  const taken = logs.filter((l) => l.status === "taken").length;
  const missed = logs.filter((l) => l.status === "missed").length;
  const skipped = logs.filter((l) => l.status === "skipped").length;
  const complianceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

  // Group by medicine name for breakdown
  const byMedicine: Record<string, { taken: number; missed: number; skipped: number; dosage: string }> = {};
  for (const log of logs) {
    if (!byMedicine[log.medicineName]) {
      byMedicine[log.medicineName] = { taken: 0, missed: 0, skipped: 0, dosage: log.dosage };
    }
    byMedicine[log.medicineName][log.status]++;
  }

  const medicines = Object.entries(byMedicine).map(([name, stats]) => ({
    name,
    ...stats,
    total: stats.taken + stats.missed + stats.skipped,
  }));

  // Recent logs (last 10)
  const recentLogs = logs.slice(0, 10).map((l) => ({
    medicineName: l.medicineName,
    dosage: l.dosage,
    status: l.status,
    scheduledTime: l.scheduledTime,
    takenAt: l.takenAt,
    timestamp: l.timestamp,
  }));

  return { total, taken, missed, skipped, complianceRate, medicines, recentLogs };
}

async function aggregateMood(userId: string, start: Date, end: Date) {
  const moods = await Mood.find({
    userId,
    timestamp: { $gte: start, $lte: end },
  }).sort({ timestamp: 1 });

  if (moods.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      entries: 0,
      trend: "stable" as const,
      data: [],
    };
  }

  const scores = moods.map((m) => m.score);
  const average = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  const min = Math.min(...scores);
  const max = Math.max(...scores);

  // Trend: compare first half avg vs second half avg
  const mid = Math.floor(scores.length / 2);
  const firstHalf = scores.slice(0, mid || 1);
  const secondHalf = scores.slice(mid || 1);
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const diff = secondAvg - firstAvg;
  const trend: "improving" | "declining" | "stable" =
    diff > 0.5 ? "improving" : diff < -0.5 ? "declining" : "stable";

  const data = moods.map((m) => ({
    score: m.score,
    note: m.note || "",
    timestamp: m.timestamp,
  }));

  return { average, min, max, entries: moods.length, trend, data };
}

async function aggregateChat(userId: string, start: Date, end: Date) {
  const chats = await ChatHistory.find({
    userId,
    timestamp: { $gte: start, $lte: end },
  }).sort({ timestamp: -1 });

  const totalMessages = chats.length;
  const userMessages = chats.filter((c) => c.role === "user").length;
  const assistantMessages = chats.filter((c) => c.role === "assistant").length;

  // Unique sessions
  const sessionIds = new Set(chats.map((c) => c.sessionId).filter(Boolean));
  const totalSessions = sessionIds.size;

  // Active hours distribution
  const hourCounts: number[] = new Array(24).fill(0);
  for (const chat of chats) {
    const hour = new Date(chat.timestamp).getHours();
    hourCounts[hour]++;
  }
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

  // Recent messages (last 5)
  const recentMessages = chats.slice(0, 5).map((c) => ({
    role: c.role,
    content: c.content.length > 120 ? c.content.substring(0, 120) + "…" : c.content,
    timestamp: c.timestamp,
  }));

  return {
    totalMessages,
    userMessages,
    assistantMessages,
    totalSessions,
    peakHour,
    hourDistribution: hourCounts,
    recentMessages,
  };
}

async function aggregateObjects(userId: string, start: Date, end: Date) {
  const objects = await ObjectRecord.find({
    userId,
    timestamp: { $gte: start, $lte: end },
  }).sort({ timestamp: -1 });

  const totalTracked = objects.length;
  const uniqueItems = new Set(objects.map((o) => o.name.toLowerCase())).size;

  const recentItems = objects.slice(0, 8).map((o) => ({
    name: o.name,
    location: o.location,
    timestamp: o.timestamp,
  }));

  return { totalTracked, uniqueItems, recentItems };
}

// ─── Main controller ─────────────────────────────────────────────

export async function getReport(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const period = url.searchParams.get("period") || "daily";

    if (!userId) {
      return Response.json({ error: "userId query parameter is required" }, { status: 400 });
    }

    if (!["daily", "weekly", "monthly"].includes(period)) {
      return Response.json({ error: "period must be daily, weekly, or monthly" }, { status: 400 });
    }

    const { start, end, label } = getDateRange(period);

    // Run all aggregations in parallel
    const [medicine, mood, chat, objects] = await Promise.all([
      aggregateMedicine(userId, start, end),
      aggregateMood(userId, start, end),
      aggregateChat(userId, start, end),
      aggregateObjects(userId, start, end),
    ]);

    const report = {
      userId,
      period,
      label,
      generatedAt: new Date().toISOString(),
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      medicine,
      mood,
      chat,
      objects,
    };

    return Response.json(report, {
      headers: {
        "x-powered-by": "bun",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Report generation error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// ─── Medicine log endpoint ───────────────────────────────────────

export async function logMedicine(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      userId: string;
      logs: Array<{
        medicineName: string;
        dosage?: string;
        scheduledTime?: string;
        takenAt?: string;
        status?: string;
      }>;
    };

    if (!body.userId || !Array.isArray(body.logs) || body.logs.length === 0) {
      return Response.json({ error: "userId and logs array are required" }, { status: 400 });
    }

    const formatted = body.logs.map((log) => ({
      userId: body.userId,
      medicineName: log.medicineName,
      dosage: log.dosage || "",
      scheduledTime: log.scheduledTime || "",
      takenAt: log.takenAt ? new Date(log.takenAt) : null,
      status: log.status || "taken",
    }));

    await MedicineLog.insertMany(formatted);

    return Response.json({ success: true, count: formatted.length });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
