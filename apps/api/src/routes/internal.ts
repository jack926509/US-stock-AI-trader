import { Router } from "express";
import { logger } from "../lib/logger.js";

export const internalRouter = Router();

// Phase 1 將實作：INTERNAL_API_TOKEN 驗證、寫入 signals
internalRouter.post("/python-signal", (req, res) => {
  logger.info({ body: req.body }, "python signal received (placeholder)");
  res.json({ ok: true, phase: "0-placeholder" });
});
