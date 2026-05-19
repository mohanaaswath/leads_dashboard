import { Router } from "express";
import { resetQuotaWebhook } from "../controllers/webhooks.controller";

const router = Router();

router.post("/reset-quota", resetQuotaWebhook);

export default router;