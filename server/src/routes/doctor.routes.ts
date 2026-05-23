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
router.post("/sessions/:id/approve", doctor.approveSession);
router.post("/sessions/:id/reject", doctor.rejectSession);

// Guardian management
router.get("/guardians", doctor.listGuardians);
router.post("/assign-guardian", doctor.assignGuardian);

export default router;
