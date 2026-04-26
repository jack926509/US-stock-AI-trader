import { Router } from "express";

export const apiRouter: Router = Router();

const INITIAL_EQUITY = Number(process.env.PAPER_INITIAL_EQUITY ?? 100000);

function isUsMarketOpen(now: Date = new Date()): boolean {
  const utcHour = now.getUTCHours();
  const utcMin = now.getUTCMinutes();
  const utcDay = now.getUTCDay();
  if (utcDay === 0 || utcDay === 6) return false;
  const minutesUtc = utcHour * 60 + utcMin;
  return minutesUtc >= 13 * 60 + 30 && minutesUtc < 20 * 60;
}

apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    marketOpen: isUsMarketOpen(),
    timestamp: new Date().toISOString(),
  });
});

apiRouter.get("/account", (_req, res) => {
  res.json({
    equity: INITIAL_EQUITY,
    buyingPower: INITIAL_EQUITY,
    cash: INITIAL_EQUITY,
    portfolioValue: INITIAL_EQUITY,
    daytradeCount: 0,
    status: "ACTIVE",
    dailyStopHit: false,
  });
});

apiRouter.get("/positions", (_req, res) => {
  res.json([]);
});

apiRouter.delete("/positions/:symbol", (_req, res) => {
  res.status(501).json({ error: "not_implemented", phase: "0" });
});

apiRouter.get("/signals", (_req, res) => {
  res.json([]);
});

apiRouter.get("/signals/:id", (_req, res) => {
  res.status(404).json({ error: "not_found", phase: "0" });
});

apiRouter.get("/pnl/daily", (_req, res) => {
  res.json({
    date: new Date().toISOString().slice(0, 10),
    starting_equity: INITIAL_EQUITY,
    realized_pnl: 0,
    unrealized_pnl: 0,
    trades_taken: 0,
    trades_won: 0,
    daily_stop_hit: 0,
    updated_at: new Date().toISOString(),
  });
});

apiRouter.get("/pnl/history", (_req, res) => {
  res.json([]);
});

apiRouter.get("/backtest", (_req, res) => {
  res.json({
    totalTrades: 0,
    winRate: 0,
    avgRR: 0,
    totalPnl: 0,
    maxDrawdown: 0,
    bestTrade: 0,
    worstTrade: 0,
    trades: [],
  });
});
