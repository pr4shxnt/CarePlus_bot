import { Request, Response } from "express";
import mongoose from "mongoose";
import { Session } from "../models/Session";
import { Patient } from "../models/Patient";
import { User } from "../models/User";
import { ok } from "../types";

// ── Dashboard Stats ────────────────────────────────────────────────────────
export async function getDashboard(req: Request, res: Response): Promise<void> {
  const doctorId = new mongoose.Types.ObjectId(req.user!.userId);

  const [patients, pendingCount, approvedCount, recentSessions] = await Promise.all([
    Patient.countDocuments({ assignedDoctorId: doctorId }),
    Session.countDocuments({ reportStatus: "pending" }),
    Session.countDocuments({ reportStatus: "approved", reviewedBy: doctorId }),
    Session.find({ reportStatus: "pending" }, { turns: 0, analyses: 0 })
      .sort({ createdAt: -1 })
      .limit(5),
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
  const patient = new Patient({ ...req.body, assignedDoctorId: doctorId });
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
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
export async function listSessions(req: Request, res: Response): Promise<void> {
  const { status, botId, page = "1", limit = "20" } = req.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.reportStatus = status;
  if (botId) filter.botId = botId;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [sessions, total] = await Promise.all([
    Session.find(filter, { turns: 0, analyses: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("patientId", "name botId"),
    Session.countDocuments(filter),
  ]);

  res.json(ok({ sessions, total, page: pageNum, pages: Math.ceil(total / limitNum) }));
}

export async function getSession(req: Request, res: Response): Promise<void> {
  const session = await Session.findById(req.params.id)
    .populate("patientId", "name age conditions medicines")
    .populate("reviewedBy", "name email");
  if (!session) { res.status(404).json({ success: false, error: "Session not found." }); return; }
  res.json(ok(session));
}

export async function approveSession(req: Request, res: Response): Promise<void> {
  const doctorId = new mongoose.Types.ObjectId(req.user!.userId);
  const { notes } = req.body as { notes?: string };

  const session = await Session.findById(req.params.id);
  if (!session) { res.status(404).json({ success: false, error: "Session not found." }); return; }
  if (session.reportStatus !== "pending") {
    res.status(409).json({ success: false, error: `Session is already ${session.reportStatus}.` });
    return;
  }

  session.reportStatus = "approved";
  session.reviewedBy = doctorId;
  session.reviewedAt = new Date();
  if (notes) session.doctorNotes = notes;
  await session.save();

  console.log(`[Doctor] Approved session ${session.sessionId}`);
  res.json(ok(session, "Report approved and visible to guardian."));
}

export async function rejectSession(req: Request, res: Response): Promise<void> {
  const doctorId = new mongoose.Types.ObjectId(req.user!.userId);
  const { notes } = req.body as { notes?: string };

  const session = await Session.findByIdAndUpdate(
    req.params.id,
    { reportStatus: "rejected", reviewedBy: doctorId, reviewedAt: new Date(), doctorNotes: notes },
    { new: true }
  );
  if (!session) { res.status(404).json({ success: false, error: "Session not found." }); return; }
  res.json(ok(session, "Report rejected."));
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
  guardian.patientBotId = patient.botId;
  await Promise.all([patient.save(), guardian.save()]);

  res.json(ok({ patient, guardian }, "Guardian assigned to patient."));
}
