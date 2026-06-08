import { Request, Response } from "express";
import mongoose from "mongoose";
import { Session } from "../models/Session";
import { Patient } from "../models/Patient";
import { User } from "../models/User";
import { Report } from "../models/Report";
import { ok } from "../types";
import { generateDailyReportsForToday } from "../services/report.service";

// ── Dashboard Stats ────────────────────────────────────────────────────────
export async function getDashboard(req: Request, res: Response): Promise<void> {
  const doctorId = new mongoose.Types.ObjectId(req.user!.userId);

  const [patients, pendingCount, approvedCount, recentSessions] = await Promise.all([
    Patient.countDocuments({ assignedDoctorId: doctorId }),
    Report.countDocuments({ reportStatus: "pending" }),
    Report.countDocuments({ reportStatus: "approved", reviewedBy: doctorId }),
    Report.find({ reportStatus: "pending" })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("patientId", "name botId"),
  ]);

  res.json(ok({ patients, pendingCount, approvedCount, recentSessions }));
}

// ── Patients ───────────────────────────────────────────────────────────────
export async function listPatients(req: Request, res: Response): Promise<void> {
  const doctorId = new mongoose.Types.ObjectId(req.user!.userId);
  const patients = await Patient.find({ assignedDoctorId: doctorId })
    .populate("guardianId", "name email relationship")
    .sort({ name: 1 });
  res.json(ok(patients));
}

export async function createPatient(req: Request, res: Response): Promise<void> {
  const doctorId = new mongoose.Types.ObjectId(req.user!.userId);
  let guardianName: string | undefined = undefined;
  if (req.body.guardianId) {
    const guardianUser = await User.findById(req.body.guardianId);
    if (guardianUser) {
      guardianName = guardianUser.name;
    }
  }
  const patient = new Patient({ ...req.body, assignedDoctorId: doctorId, guardianName });
  await patient.save();
  res.status(201).json(ok(patient, "Patient created."));
}

export async function getPatient(req: Request, res: Response): Promise<void> {
  const patient = await Patient.findById(req.params.id)
    .populate("guardianId", "name email relationship")
    .populate("assignedDoctorId", "name email specialization");
  if (!patient) { res.status(404).json({ success: false, error: "Patient not found." }); return; }
  res.json(ok(patient));
}

import { notifyBotOfUpdate } from "../services/bot.service";

export async function updatePatient(req: Request, res: Response): Promise<void> {
  const updateData = { ...req.body };
  if (req.body.guardianId !== undefined) {
    if (req.body.guardianId) {
      const guardianUser = await User.findById(req.body.guardianId);
      updateData.guardianName = guardianUser ? guardianUser.name : undefined;
    } else {
      updateData.guardianName = undefined;
    }
  }
  const patient = await Patient.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!patient) {
    res.status(404).json({ success: false, error: "Not found." });
    return;
  }

  // If medicines or critical info changed, notify the bot
  if (req.body.medicines || req.body.conditions) {
    await notifyBotOfUpdate(patient.botId, {
      type: "PATIENT_UPDATE",
      patientId: patient._id,
      medicines: patient.medicines,
    }).catch(err => console.error(`Failed to notify bot ${patient.botId}:`, err));
  }

  res.json(ok(patient, "Patient updated."));
}

// ── Sessions ───────────────────────────────────────────────────────────────
// ── Sessions (Raw Chats) ───────────────────────────────────────────────────
export async function listSessions(req: Request, res: Response): Promise<void> {
  const { botId, patientId, page = "1", limit = "20" } = req.query;
  const filter: Record<string, unknown> = {};
  if (botId) filter.botId = botId;
  if (patientId) filter.patientId = new mongoose.Types.ObjectId(patientId as string);

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [sessions, total] = await Promise.all([
    Session.find(filter)
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("patientId", "name botId"),
    Session.countDocuments(filter),
  ]);

  res.json(ok({ sessions, total, page: pageNum, pages: Math.ceil(total / limitNum) }));
}

export async function getSession(req: Request, res: Response): Promise<void> {
  const session = await Session.findById(req.params.id)
    .populate("patientId", "name age conditions medicines");
  if (!session) { res.status(404).json({ success: false, error: "Session not found." }); return; }
  res.json(ok(session));
}

// ── Reports (Daily Aggregates) ─────────────────────────────────────────────
export async function listReports(req: Request, res: Response): Promise<void> {
  const { status, botId, patientId, page = "1", limit = "20" } = req.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.reportStatus = status;
  if (botId) filter.botId = botId;
  if (patientId) filter.patientId = new mongoose.Types.ObjectId(patientId as string);

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("patientId", "name botId"),
    Report.countDocuments(filter),
  ]);

  res.json(ok({ reports, total, page: pageNum, pages: Math.ceil(total / limitNum) }));
}

export async function getReport(req: Request, res: Response): Promise<void> {
  const report = await Report.findById(req.params.id)
    .populate("patientId", "name age conditions medicines")
    .populate("reviewedBy", "name email");
  if (!report) { res.status(404).json({ success: false, error: "Report not found." }); return; }
  res.json(ok(report));
}

export async function approveReport(req: Request, res: Response): Promise<void> {
  const doctorId = new mongoose.Types.ObjectId(req.user!.userId);
  const { notes } = req.body as { notes?: string };

  const report = await Report.findById(req.params.id);
  if (!report) { res.status(404).json({ success: false, error: "Report not found." }); return; }
  if (report.reportStatus !== "pending") {
    res.status(409).json({ success: false, error: `Report is already ${report.reportStatus}.` });
    return;
  }

  const updateData: Record<string, any> = {
    reportStatus: "approved",
    reviewedBy: doctorId,
    reviewedAt: new Date(),
  };
  if (notes) updateData.doctorNotes = notes;

  const updatedReport = await Report.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );

  console.log(`[Doctor] Approved report ${updatedReport?.id}`);
  res.json(ok(updatedReport, "Report approved and visible to guardian."));
}

export async function rejectReport(req: Request, res: Response): Promise<void> {
  const doctorId = new mongoose.Types.ObjectId(req.user!.userId);
  const { notes } = req.body as { notes?: string };

  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { reportStatus: "rejected", reviewedBy: doctorId, reviewedAt: new Date(), doctorNotes: notes },
    { new: true }
  );
  if (!report) { res.status(404).json({ success: false, error: "Report not found." }); return; }
  res.json(ok(report, "Report rejected."));
}

// ── Guardian Management ────────────────────────────────────────────────────
export async function listGuardians(req: Request, res: Response): Promise<void> {
  const guardians = await User.find({ role: "guardian" }).select("-passwordHash");
  res.json(ok(guardians));
}

export async function assignGuardian(req: Request, res: Response): Promise<void> {
  const { patientId, guardianId } = req.body as { patientId: string; guardianId: string };

  const [patient, guardian] = await Promise.all([
    Patient.findById(patientId),
    User.findById(guardianId),
  ]);

  if (!patient) { res.status(404).json({ success: false, error: "Patient not found." }); return; }
  if (!guardian || guardian.role !== "guardian") {
    res.status(404).json({ success: false, error: "Guardian not found." });
    return;
  }

  patient.guardianId = new mongoose.Types.ObjectId(guardianId);
  patient.guardianName = guardian.name;
  guardian.patientBotId = patient.botId;
  await Promise.all([patient.save(), guardian.save()]);

  res.json(ok({ patient, guardian }, "Guardian assigned to patient."));
}

export async function getAlerts(req: Request, res: Response): Promise<void> {
  const doctorId = new mongoose.Types.ObjectId(req.user!.userId);

  const patients = await Patient.find({ assignedDoctorId: doctorId });
  const alerts = [];

  for (const patient of patients) {
    const latestReport = await Report.findOne({ patientId: patient._id }).sort({ date: -1 });

    let isCritical = false;
    let alertReason = "Stable";
    let score = 0;
    let moodVal = "Normal";

    if (latestReport) {
      const analyses = latestReport.analyses || [];
      const totalAnalyses = analyses.length;

      const negativeMoods = analyses.filter((a: any) =>
        a.mood && ["sad", "painful", "lonely", "unwell", "depressed"].includes(a.mood.toLowerCase())
      );

      if (negativeMoods.length > 0 && totalAnalyses > 0) {
        isCritical = true;
        score = Math.round((negativeMoods.length / totalAnalyses) * 100);
        alertReason = negativeMoods[0].mood;
        moodVal = negativeMoods[0].mood;
      }

      // Check for missed meds
      const missedMeds = new Set<string>();
      const takenMeds = new Set<string>();
      analyses.forEach((a: any) => {
        if (a.medicine_log) {
          a.medicine_log.forEach((log: any) => {
            if (log.status === "taken") {
              takenMeds.add(log.name);
            } else if (log.status === "missed" || log.status === "skipped") {
              missedMeds.add(log.name);
            }
          });
        }
      });
      takenMeds.forEach((m) => missedMeds.delete(m));

      if (missedMeds.size > 0) {
        isCritical = true;
        if (alertReason === "Stable" || alertReason === "Normal") {
          alertReason = "Missed Meds";
        } else {
          alertReason += " & Missed Meds";
        }
      }
    }

    if (isCritical) {
      alerts.push({
        patient,
        alertReason,
        score,
        mood: moodVal,
      });
    }
  }

  // Fallback simulated alert if no actual alerts are found for demo
  if (alerts.length === 0 && patients.length > 0) {
    alerts.push({
      patient: patients[0],
      alertReason: "High Isolation",
      score: 45,
      mood: "Lonely",
    });
  }

  res.json(ok(alerts));
}

export async function triggerDailyReports(req: Request, res: Response): Promise<void> {
  try {
    await generateDailyReportsForToday();
    res.json(ok(null, "Daily reports generated successfully."));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to generate daily reports." });
  }
}

