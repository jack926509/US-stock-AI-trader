/**
 * alpaca-trader.js
 * Alpaca Paper Trading 連線模組 v1.0
 * 功能：接收 SMC 訊號 → 計算倉位 → 自動下單 → 停損停利
 *
 * 環境變數（.env）：
 *   ALPACA_API_KEY    = your_paper_api_key
 *   ALPACA_SECRET_KEY = your_paper_secret_key
 *   ALPACA_BASE_URL   = https://paper-api.alpaca.markets
 */

import Alpaca from "@alpacahq/alpaca-trade-api";
import dotenv from "dotenv";
dotenv.config();

// ── 初始化 Alpaca 客戶端（Paper Trading）────────────────
const alpaca = new Alpaca({
  keyId: process.env.ALPACA_API_KEY,
  secretKey: process.env.ALPACA_SECRET_KEY,
  baseUrl: process.env.ALPACA_BASE_URL || "https://paper-api.alpaca.markets",
  feed: "iex", // Paper Trading 使用 IEX 免費資料源
});

// ── 風控參數 ─────────────────────────────────────────────
const RISK_CONFIG = {
  riskPerTradePct: 0.01,  // 每筆交易風險 1% 帳戶資金
  minRR: 2.0,             // 最低 R:R 比例
  maxPositions: 5,        // 最大同時持倉數
  maxDailyLossPct: 0.03,  // 每日最大虧損 3%（觸發後停止交易）
};

// ── 帳戶資訊 ─────────────────────────────────────────────
async function getAccount() {
  try {
    const account = await alpaca.getAccount();
    return {
      equity: parseFloat(account.equity),
      buyingPower: parseFloat(account.buying_power),
      cash: parseFloat(account.cash),
      portfolioValue: parseFloat(account.portfolio_value),
      dayTradeCount: parseInt(account.daytrade_count),
    };
  } catch (err) {
    console.error("[Alpaca] 取得帳戶失敗:", err.message);
    throw err;
  }
}

// ── 持倉查詢 ─────────────────────────────────────────────
async function getPositions() {
  try {
    const positions = await alpaca.getPositions();
    return positions.map((p) => ({
      symbol: p.symbol,
      qty: parseFloat(p.qty),
      side: p.side,
      avgEntryPrice: parseFloat(p.avg_entry_price),
      marketValue: parseFloat(p.market_value),
      unrealizedPL: parseFloat(p.unrealized_pl),
      unrealizedPLPct: parseFloat(p.unrealized_plpc),
    }));
  } catch (err) {
    console.error("[Alpaca] 取得持倉失敗:", err.message);
    return [];
  }
}

// ── 倉位計算（固定風險法）────────────────────────────────
// qty = (equity × riskPct) / stopLossAmount
async function calcPositionSize(entryPrice, stopLossPrice, riskPct = RISK_CONFIG.riskPerTradePct) {
  const { equity } = await getAccount();
  const riskAmount = equity * riskPct;
  const stopLossAmount = Math.abs(entryPrice - stopLossPrice);

  if (stopLossAmount === 0) {
    throw new Error("停損距離不能為 0");
  }

  const qty = Math.floor(riskAmount / stopLossAmount);
  return { qty, riskAmount, stopLossAmount };
}

// ── R:R 驗證 ─────────────────────────────────────────────
function validateRR(entryPrice, stopLossPrice, takeProfitPrice) {
  const risk   = Math.abs(entryPrice - stopLossPrice);
  const reward = Math.abs(takeProfitPrice - entryPrice);
  const rr     = reward / risk;

  if (rr < RISK_CONFIG.minRR) {
    throw new Error(`R:R ${rr.toFixed(2)} 未達最低要求 ${RISK_CONFIG.minRR}`);
  }
  return rr;
}

// ── 每日虧損檢查 ─────────────────────────────────────────
async function checkDailyLossLimit() {
  const account = await getAccount();
  // 取得今日損益（需透過 portfolio history）
  try {
    const history = await alpaca.getPortfolioHistory({
      period: "1D",
      timeframe: "1Min",
    });
    const profitLoss = history.profit_loss;
    const todayPL = profitLoss[profitLoss.length - 1];
    const plPct   = todayPL / account.equity;

    if (plPct <= -RISK_CONFIG.maxDailyLossPct) {
      throw new Error(`每日虧損上限觸發：${(plPct * 100).toFixed(2)}%，停止交易`);
    }
    return { todayPL, plPct };
  } catch (err) {
    if (err.message.includes("每日虧損")) throw err;
    console.warn("[Alpaca] 無法取得每日損益，跳過檢查");
    return null;
  }
}

// ── 最大持倉數量檢查 ─────────────────────────────────────
async function checkMaxPositions() {
  const positions = await getPositions();
  if (positions.length >= RISK_CONFIG.maxPositions) {
    throw new Error(`已達最大持倉數 ${RISK_CONFIG.maxPositions}，無法新增`);
  }
  return positions.length;
}

// ── 主要下單函式 ─────────────────────────────────────────
/**
 * placeOrder - 接收 SMC 訊號後執行下單
 *
 * @param {Object} signal - 來自 Webhook 的訊號
 * @param {string} signal.symbol      - 股票代碼（如 "AAPL"）
 * @param {string} signal.signal      - 訊號類型（LONG_SMC / SHORT_SMC / LONG_LIQ / SHORT_LIQ）
 * @param {number} signal.price       - 當前價格
 * @param {number} signal.stopLoss    - 停損價（由 Python Engine 或後端計算）
 * @param {number} signal.takeProfit  - 停利價
 * @param {number} [signal.risk_pct]  - 風險百分比（選填，預設 1%）
 */
async function placeOrder(signal) {
  const { symbol, signal: signalType, price, stopLoss, takeProfit, risk_pct } = signal;
  const side = signalType.startsWith("LONG") ? "buy" : "sell";

  console.log(`\n[Alpaca] 收到訊號 → ${symbol} ${signalType} @ ${price}`);

  // ── 前置檢查 ──────────────────────────────────────────
  await checkDailyLossLimit();
  await checkMaxPositions();

  // ── R:R 驗證 ──────────────────────────────────────────
  const rr = validateRR(price, stopLoss, takeProfit);
  console.log(`[Alpaca] R:R 驗證通過：${rr.toFixed(2)}`);

  // ── 計算下單數量 ──────────────────────────────────────
  const riskPct = risk_pct || RISK_CONFIG.riskPerTradePct;
  const { qty, riskAmount } = await calcPositionSize(price, stopLoss, riskPct);

  if (qty < 1) {
    throw new Error(`計算倉位數量 < 1 股，風險金額 $${riskAmount.toFixed(2)} 不足`);
  }

  console.log(`[Alpaca] 下單數量：${qty} 股，風險金額：$${riskAmount.toFixed(2)}`);

  // ── 主單（市價單）─────────────────────────────────────
  const order = await alpaca.createOrder({
    symbol,
    qty,
    side,
    type: "market",
    time_in_force: "day",
  });

  console.log(`[Alpaca] 主單成功：${order.id}`);

  // ── OCA 括號單（停損 + 停利）────────────────────────
  // Alpaca bracket order：主單成交後自動掛停損/停利
  const bracketOrder = await alpaca.createOrder({
    symbol,
    qty,
    side,
    type: "market",
    time_in_force: "gtc",
    order_class: "bracket",
    stop_loss: {
      stop_price: stopLoss,
    },
    take_profit: {
      limit_price: takeProfit,
    },
  });

  console.log(`[Alpaca] Bracket 單成功：${bracketOrder.id}`);
  console.log(`  停損：$${stopLoss} | 停利：$${takeProfit}`);

  return {
    orderId: bracketOrder.id,
    symbol,
    side,
    qty,
    entryPrice: price,
    stopLoss,
    takeProfit,
    rr: parseFloat(rr.toFixed(2)),
    riskAmount: parseFloat(riskAmount.toFixed(2)),
    timestamp: new Date().toISOString(),
  };
}

// ── 取消所有未成交委託 ───────────────────────────────────
async function cancelAllOrders() {
  try {
    await alpaca.cancelAllOrders();
    console.log("[Alpaca] 已取消所有未成交委託");
  } catch (err) {
    console.error("[Alpaca] 取消委託失敗:", err.message);
  }
}

// ── 平倉指定股票 ─────────────────────────────────────────
async function closePosition(symbol) {
  try {
    await alpaca.closePosition(symbol);
    console.log(`[Alpaca] 已平倉：${symbol}`);
  } catch (err) {
    console.error(`[Alpaca] 平倉 ${symbol} 失敗:`, err.message);
    throw err;
  }
}

// ── 查詢委託狀態 ─────────────────────────────────────────
async function getOrderStatus(orderId) {
  try {
    const order = await alpaca.getOrder(orderId);
    return {
      id: order.id,
      symbol: order.symbol,
      status: order.status,         // pending_new / accepted / filled / canceled
      filledQty: parseFloat(order.filled_qty || 0),
      filledAvgPrice: parseFloat(order.filled_avg_price || 0),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };
  } catch (err) {
    console.error(`[Alpaca] 查詢委託 ${orderId} 失敗:`, err.message);
    throw err;
  }
}

// ── 健康檢查 ─────────────────────────────────────────────
async function healthCheck() {
  try {
    const account = await getAccount();
    const positions = await getPositions();
    const clock = await alpaca.getClock();

    return {
      status: "ok",
      marketOpen: clock.is_open,
      nextOpen: clock.next_open,
      nextClose: clock.next_close,
      equity: account.equity,
      buyingPower: account.buyingPower,
      openPositions: positions.length,
    };
  } catch (err) {
    return { status: "error", message: err.message };
  }
}

// ── 匯出 ─────────────────────────────────────────────────
export {
  alpaca,
  getAccount,
  getPositions,
  calcPositionSize,
  validateRR,
  checkDailyLossLimit,
  checkMaxPositions,
  placeOrder,
  cancelAllOrders,
  closePosition,
  getOrderStatus,
  healthCheck,
  RISK_CONFIG,
};
