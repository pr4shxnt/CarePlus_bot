import { Request, Response } from "express";
import { Session } from "../models/Session";
import { Patient } from "../models/Patient";
import { User } from "../models/User";
import { Report } from "../models/Report";
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
    Report.find({ botId, reportStatus: "approved" })
      .populate("reviewedBy", "name specialization")
      .sort({ createdAt: -1 })
      .limit(5),
    Report.countDocuments({ botId, reportStatus: "approved" }),
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

// ── Sessions (Raw Chats, immediately viewable without approval) ────────────
export async function listSessions(req: Request, res: Response): Promise<void> {
  const guardian = await User.findById(req.user!.userId);
  if (!guardian?.patientBotId) {
    res.json(ok({ sessions: [], total: 0 }));
    return;
  }

  const { page = "1", limit = "10" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = { botId: guardian.patientBotId };

  const [sessions, total] = await Promise.all([
    Session.find(filter)
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Session.countDocuments(filter),
  ]);

  res.json(ok({ sessions, total, page: pageNum, pages: Math.ceil(total / limitNum) }));
}

export async function getSession(req: Request, res: Response): Promise<void> {
  const guardian = await User.findById(req.user!.userId);
  if (!guardian?.patientBotId) {
    res.status(403).json({ success: false, error: "No patient linked." });
    return;
  }

  const session = await Session.findOne({
    _id: req.params.id,
    botId: guardian.patientBotId,
  });

  if (!session) {
    res.status(404).json({ success: false, error: "Session not found." });
    return;
  }

  res.json(ok(session));
}

// ── Reports (Approved daily summaries only) ────────────────────────────────
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
    Report.find(filter)
      .populate("reviewedBy", "name specialization")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Report.countDocuments(filter),
  ]);

  res.json(ok({ reports, total, page: pageNum, pages: Math.ceil(total / limitNum) }));
}

export async function getReport(req: Request, res: Response): Promise<void> {
  const guardian = await User.findById(req.user!.userId);
  if (!guardian?.patientBotId) {
    res.status(403).json({ success: false, error: "No patient linked." });
    return;
  }

  const report = await Report.findOne({
    _id: req.params.id,
    botId: guardian.patientBotId,
    reportStatus: "approved",
  }).populate("reviewedBy", "name specialization");

  if (!report) {
    res.status(404).json({ success: false, error: "Report not found or not yet approved." });
    return;
  }

  res.json(ok(report));
}

// ── Mood Trend ─────────────────────────────────────────────────────────────
export async function getMoodTrend(req: Request, res: Response): Promise<void> {
  const guardian = await User.findById(req.user!.userId);
  if (!guardian?.patientBotId) { res.json(ok([])); return; }

  const days = parseInt((req.query.days as string) || "14", 10);
  const since = new Date(Date.now() - days * 86_400_000);

  const reports = await Report.find(
    { botId: guardian.patientBotId, reportStatus: "approved", createdAt: { $gte: since } },
    { analyses: 1, date: 1, createdAt: 1 }
  ).sort({ createdAt: 1 });

  const trend = reports.map((r) => {
    const avg =
      r.analyses.reduce((sum, a) => sum + (a.mood_intensity || 5), 0) /
      (r.analyses.length || 1);
    return {
      date: r.date || r.createdAt.toISOString().slice(0, 10),
      avgMoodIntensity: parseFloat(avg.toFixed(1)),
      moods: [...new Set(r.analyses.map((a) => a.mood).filter(Boolean))],
    };
  });

  res.json(ok(trend));
}
