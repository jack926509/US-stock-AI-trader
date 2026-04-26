import { Router } from "express";

export const apiRouter = Router();

// Phase 3 將實作：給 Dashboard 用的查詢端點（持倉 / P&L / 訊號歷史 / 回測）
apiRouter.get("/ping", (_req, res) => {
  res.json({ ok: true });
});
