import { Router } from "express";
import { authenticateBot } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { syncSession, BotSyncSchema, getBotConfig } from "../controllers/bot.controller";

const router = Router();

// All bot routes require the X-Bot-Api-Key header
router.use(authenticateBot);

router.post("/sync", validate(BotSyncSchema), syncSession);
router.get("/config", getBotConfig);

export default router;
