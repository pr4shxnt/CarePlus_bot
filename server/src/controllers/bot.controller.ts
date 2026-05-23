import { Request, Response } from "express";
import { z } from "zod";
import { Session } from "../models/Session";
import { Patient } from "../models/Patient";
import { buildReport } from "../services/report.service";
import { ok } from "../types";

export const BotSyncSchema = z.object({
  patientId: z.string(),
  sessionId: z.string().uuid(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  durationSeconds: z.number().nonnegative(),
  turns: z.array(
    z.object({ role: z.enum(["user", "assistant"]), content: z.string() })
  ),
  analyses: z.array(
    z.object({
      mood: z.string().default("unknown"),
      mood_intensity: z.number().min(1).max(10).default(5),
      medicine_log: z
        .array(z.object({ name: z.string(), status: z.enum(["taken", "missed", "skipped"]) }))
        .default([]),
      forgotten_items: z.array(z.string()).default([]),
    })
  ).default([]),
});

export async function syncSession(req: Request, res: Response): Promise<void> {
  const data = req.body as z.infer<typeof BotSyncSchema>;

  // Find linked patient by MongoDB ID
  const patient = await Patient.findById(data.patientId);

  if (!patient) {
    res.status(404).json({ success: false, error: "Patient not found for the provided ID." });
    return;
  }

  // Build or use provided report
  const report = buildReport(data.turns, data.analyses, patient.name);

  const session = await Session.findOneAndUpdate(
    { sessionId: data.sessionId },
    {
      patientId: patient._id,
      sessionId: data.sessionId,
      startedAt: new Date(data.startedAt),
      endedAt: new Date(data.endedAt),
      durationSeconds: data.durationSeconds,
      turns: data.turns,
      analyses: data.analyses,
      report,
      reportStatus: "pending",
    },
    { upsert: true, new: true }
  );

  console.log(`[Bot] Synced session ${data.sessionId} from patient ${data.patientId}`);
  res.status(201).json(ok({ sessionId: session.sessionId }, "Session synced."));
}

export async function getBotConfig(req: Request, res: Response): Promise<void> {
  const patientId = req.headers["x-patient-id"] as string;

  if (!patientId) {
    res.status(400).json({ success: false, error: "X-Patient-Id header is required." });
    return;
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    res.status(404).json({ success: false, error: "Patient record not found." });
    return;
  }

  res.json(ok({
    patientId: patient._id,
    name: patient.name,
    medicines: patient.medicines,
    conditions: patient.conditions,
  }));
}
