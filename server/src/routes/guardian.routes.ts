import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import * as guardian from "../controllers/guardian.controller";

const router = Router();

// All guardian routes require login + guardian role
router.use(authenticate, authorize("guardian", "admin"));

// Dashboard overview
router.get("/dashboard", guardian.getDashboard);

// Patient info
router.get("/patient", guardian.getMyPatient);

// Reports (approved only, scoped to linked patient)
router.get("/reports", guardian.listReports);
router.get("/reports/:id", guardian.getReport);

// Mood trend data
router.get("/mood-trend", guardian.getMoodTrend);

export default router;
