import { Router } from "express";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import * as auth from "../controllers/auth.controller";
import { RegisterSchema, LoginSchema, UpdateProfileSchema, ChangePasswordSchema } from "../controllers/auth.controller";

const router = Router();

// Public
router.post("/register", validate(RegisterSchema), auth.register);
router.post("/login", validate(LoginSchema), auth.login);
router.post("/verify-google-token", auth.verifyGoogleToken);

// Protected
router.get("/me", authenticate, auth.me);
router.patch("/me", authenticate, validate(UpdateProfileSchema), auth.updateMe);
router.post("/change-password", authenticate, validate(ChangePasswordSchema), auth.changePassword);

export default router;
