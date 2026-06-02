import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import * as doctor from "../controllers/doctor.controller";

const router = Router();

// All doctor routes require login + doctor role
router.use(authenticate, authorize("doctor", "admin"));

// Dashboard
router.get("/dashboard", doctor.getDashboard);

// Patients
router.get("/patients", doctor.listPatients);
router.post("/patients", doctor.createPatient);
router.get("/patients/:id", doctor.getPatient);
router.patch("/patients/:id", doctor.updatePatient);

// Sessions
router.get("/sessions", doctor.listSessions);
router.get("/sessions/:id", doctor.getSession);

// Reports
router.get("/reports", doctor.listReports);
router.get("/reports/:id", doctor.getReport);
router.post("/reports/:id/approve", doctor.approveReport);
router.post("/reports/:id/reject", doctor.rejectReport);

// Guardian management
router.get("/guardians", doctor.listGuardians);
router.post("/assign-guardian", doctor.assignGuardian);

// Manual trigger for testing/cron
router.post("/generate-daily", doctor.triggerDailyReports);

export default router;
