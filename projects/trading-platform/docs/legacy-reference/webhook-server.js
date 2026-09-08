/**
 * webhook-server.js
 * TradingView Webhook 接收端 v1.0
 * 串接：Pine Script 訊號 → 驗證 → Alpaca 下單
 *
 * 啟動：node webhook-server.js
 * 端點：POST /webhook/signal
 */

import express from "express";
import { placeOrder, healthCheck } from "./alpaca-trader.js";
import dotenv from "dotenv";
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── 健康檢查端點 ─────────────────────────────────────────
app.get("/health", async (req, res) => {
  const status = await healthCheck();
  res.json(status);
});

// ── Webhook 主端點 ────────────────────────────────────────
// TradingView Alert Webhook URL：https://your-domain.com/webhook/signal
app.post("/webhook/signal", async (req, res) => {
  const body = req.body;
  console.log("\n[Webhook] 收到訊號：", JSON.stringify(body, null, 2));

  // ── 基本欄位驗證 ──────────────────────────────────────
  const required = ["symbol", "signal", "price", "stopLoss", "takeProfit"];
  const missing  = required.filter((k) => body[k] === undefined);

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      error: `缺少必要欄位：${missing.join(", ")}`,
    });
  }

  // ── 訊號類型白名單 ────────────────────────────────────
  const validSignals = ["LONG_SMC", "SHORT_SMC", "LONG_LIQ", "SHORT_LIQ"];
  if (!validSignals.includes(body.signal)) {
    return res.status(400).json({
      success: false,
      error: `未知訊號類型：${body.signal}`,
    });
  }

  // ── 執行下單 ──────────────────────────────────────────
  try {
    const result = await placeOrder({
      symbol:     body.symbol,
      signal:     body.signal,
      price:      parseFloat(body.price),
      stopLoss:   parseFloat(body.stopLoss),
      takeProfit: parseFloat(body.takeProfit),
      risk_pct:   body.risk_pct ? parseFloat(body.risk_pct) / 100 : undefined,
    });

    console.log("[Webhook] 下單成功：", result);
    res.json({ success: true, order: result });

  } catch (err) {
    console.error("[Webhook] 下單失敗：", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Server] Webhook 伺服器啟動 → http://localhost:${PORT}`);
  console.log(`[Server] 健康檢查 → http://localhost:${PORT}/health`);
  console.log(`[Server] 訊號端點 → POST http://localhost:${PORT}/webhook/signal`);
});
