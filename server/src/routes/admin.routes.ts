import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import * as admin from "../controllers/admin.controller";

const router = Router();

// All routes require login and the 'admin' role
router.use(authenticate, authorize("admin"));

// User listing & verification (KYC/Doctor licenses)
router.get("/users", admin.listUsers);
router.post("/users/:id/verify", admin.verifyUser);

// Doctor CRUD
router.get("/doctors", admin.listDoctors);
router.post("/doctors", admin.createDoctor);
router.patch("/doctors/:id", admin.updateDoctor);
router.delete("/doctors/:id", admin.deleteDoctor);

// Patient CRUD
router.get("/patients", admin.listPatients);
router.post("/patients", admin.createPatient);
router.patch("/patients/:id", admin.updatePatient);
router.delete("/patients/:id", admin.deletePatient);

// Reports viewing (Read-only)
router.get("/reports", admin.listReports);
router.get("/reports/:id", admin.getReport);

export default router;
