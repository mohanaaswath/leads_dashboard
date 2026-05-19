import { Response } from "express";
import { AuthRequest } from "../types";
import { resetProviderQuotas } from "../services/webhook.service";

export const resetQuotaWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.body as { eventId?: string };
    if (!eventId) {
      res.status(400).json({ message: "eventId is required" });
      return;
    }

    const result = await resetProviderQuotas(eventId);
    res.json({
      message: result.duplicate ? "Webhook already processed" : "Quota reset",
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    res.status(500).json({ message });
  }
};
