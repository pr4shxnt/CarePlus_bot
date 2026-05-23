import { Request, Response } from "express";
import { Session } from "../models/Session";
import { Patient } from "../models/Patient";
import { User } from "../models/User";
import { ok } from "../types";

// ── Dashboard ──────────────────────────────────────────────────────────────
export async function getDashboard(req: Request, res: Response): Promise<void> {
  const guardian = await User.findById(req.user!.userId);
  if (!guardian?.patientBotId) {
    res.json(ok({ patient: null, reports: [], stats: { total: 0 } }));
    return;
  }

  const botId = guardian.patientBotId;

  const [patient, reports, totalReports] = await Promise.all([
    Patient.findOne({ botId }),
    Session.find({ botId, reportStatus: "approved" }, { turns: 0, analyses: 0 })
      .populate("reviewedBy", "name specialization")
      .sort({ reviewedAt: -1 })
      .limit(5),
    Session.countDocuments({ botId, reportStatus: "approved" }),
  ]);

  res.json(ok({ patient, reports, stats: { total: totalReports } }));
}

// ── Patient info ───────────────────────────────────────────────────────────
export async function getMyPatient(req: Request, res: Response): Promise<void> {
  const guardian = await User.findById(req.user!.userId);
  if (!guardian?.patientBotId) {
    res.status(404).json({ success: false, error: "No patient linked to this account." });
    return;
  }

  const patient = await Patient.findOne({ botId: guardian.patientBotId })
    .populate("assignedDoctorId", "name email specialization")
    .populate("guardianId", "name email");

  if (!patient) {
    res.status(404).json({ success: false, error: "Patient not found." });
    return;
  }

  res.json(ok(patient));
}

// ── Reports (approved only) ────────────────────────────────────────────────
export async function listReports(req: Request, res: Response): Promise<void> {
  const guardian = await User.findById(req.user!.userId);
  if (!guardian?.patientBotId) {
    res.json(ok({ reports: [], total: 0 }));
    return;
  }

  const { page = "1", limit = "10" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = { botId: guardian.patientBotId, reportStatus: "approved" };

  const [reports, total] = await Promise.all([
    Session.find(filter, { turns: 0, analyses: 0 })
      .populate("reviewedBy", "name specialization")
      .sort({ reviewedAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Session.countDocuments(filter),
  ]);

  res.json(ok({ reports, total, page: pageNum, pages: Math.ceil(total / limitNum) }));
}

export async function getReport(req: Request, res: Response): Promise<void> {
  const guardian = await User.findById(req.user!.userId);
  if (!guardian?.patientBotId) {
    res.status(403).json({ success: false, error: "No patient linked." });
    return;
  }

  const session = await Session.findOne({
    _id: req.params.id,
    botId: guardian.patientBotId,   // guardian can ONLY read their patient's sessions
    reportStatus: "approved",        // and ONLY approved ones
  }).populate("reviewedBy", "name specialization");

  if (!session) {
    res.status(404).json({ success: false, error: "Report not found or not yet approved." });
    return;
  }

  res.json(ok(session));
}

// ── Mood Trend ─────────────────────────────────────────────────────────────
export async function getMoodTrend(req: Request, res: Response): Promise<void> {
  const guardian = await User.findById(req.user!.userId);
  if (!guardian?.patientBotId) { res.json(ok([])); return; }

  const days = parseInt((req.query.days as string) || "14", 10);
  const since = new Date(Date.now() - days * 86_400_000);

  const sessions = await Session.find(
    { botId: guardian.patientBotId, reportStatus: "approved", startedAt: { $gte: since } },
    { analyses: 1, startedAt: 1 }
  ).sort({ startedAt: 1 });

  const trend = sessions.map((s) => {
    const avg =
      s.analyses.reduce((sum, a) => sum + (a.mood_intensity || 5), 0) /
      (s.analyses.length || 1);
    return {
      date: s.startedAt.toISOString().slice(0, 10),
      avgMoodIntensity: parseFloat(avg.toFixed(1)),
      moods: [...new Set(s.analyses.map((a) => a.mood).filter(Boolean))],
    };
  });

  res.json(ok(trend));
}
