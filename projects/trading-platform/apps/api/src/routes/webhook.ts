import { Router } from "express";
import { logger } from "../lib/logger.js";

export const webhookRouter: Router = Router();

// Phase 1 將實作：secret 驗證、SHA256 fingerprint 去重、寫入 signals
webhookRouter.post("/tv", (req, res) => {
  logger.info({ body: req.body }, "tradingview webhook received (placeholder)");
  res.json({ ok: true, phase: "0-placeholder" });
});
