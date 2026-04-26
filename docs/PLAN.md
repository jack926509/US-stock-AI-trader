# 美股 AI 自動化交易系統 — 規劃文件

> 工作目錄：`/Users/xieh/Desktop/技術開發/US stock AI trader`
> 規劃完成日期：2026-04-26
> 階段：Paper Trading MVP

---

## Context

打造一套整合 **TradingView Pine Script + Python 技術指標 + Node.js 規則引擎 + Claude API 結構分析 + Alpaca Paper Trading** 的美股全自動交易系統，部署至 **Zeabur**。

策略核心為 **SMC（Smart Money Concept）**——BOS / CHoCH / OB / FVG / Liquidity Sweep——以雙訊號（TradingView + Python）交叉驗證，由 Claude 提供結構化評分，再由 Node.js 規則引擎依 R:R≥1:2 與 Quarter Kelly 公式決定下單大小，最後送至 Alpaca。

預期成果：
1. 一套可重現、可監控、可審計的 Paper Trading 系統
2. Dashboard（即時持倉 / 每日 P&L / 訊號歷史 / 回測績效）
3. 模組化結構，未來可平滑切換實盤

---

## 已確認架構決策（12 項）

| # | 主題 | 決策 |
|---|------|------|
| 1 | 資料持久層 | **PostgreSQL on Zeabur** |
| 2 | 股票池 | **小池 10–30 檔 + Alpaca Market Data 免費版（IEX）** |
| 3 | Claude 角色 | **結構分析師**：回傳 SMC 評分與信心值，最終 Buy/Sell 由 Node.js 決定 |
| 4 | Python ↔ Node | **Python 主動 POST** 至 `/internal/python-signal`（共用內部端點） |
| 5 | 風控（MVP 保守型） | 單筆風險 ≤ 1%、同時持倉 ≤ 3、日虧 ≥ 3% 自動停止；Kelly × 0.25 |
| 6 | Repo 結構 | **單一 Monorepo + Zeabur 多 service** |
| 7 | Webhook 安全 | Shared Secret 寫在 alert_message JSON + SHA256 訊號指紋 60 秒去重 |
| 8 | 回測引擎 | **重放 Live 訊號日誌**（無獨立引擎，靠 PG aggregation） |
| 9 | Telegram | **單向通知**（訊號 / 成交 / 止損 / 日虧告警） |
| 10 | Dashboard | **Next.js 15 App Router**（Server Component 拉 PG + SSE 推即時） |
| 11 | Python 排程 | **每 5 分鐘掃全池**（內建 APScheduler，常駐 service） |
| 12 | Kelly 初始參數 | 手動均一：勝率 50%、R:R 1.5、Paper 起始資金 $100,000 USD |

---

## 系統架構圖

```
┌──────────────────┐     ┌──────────────────┐
│  TradingView     │     │  Alpaca Market   │
│  Pine Script     │     │  Data (IEX)      │
│  (SMC Alert)     │     │                  │
└────────┬─────────┘     └────────┬─────────┘
         │ webhook                 │ REST / 5min
         │ (alert_message+secret)  │
         ▼                         ▼
┌─────────────────────┐   ┌──────────────────┐
│  apps/api (Node.js) │◄──│ apps/engine      │
│  Express            │   │ (Python)         │
│  ├ /webhook/tv      │   │ ├ APScheduler    │
│  ├ /internal/       │   │ ├ TA-Lib         │
│  │   python-signal  │   │ │   (MA/RSI/MACD)│
│  ├ Signal Merger    │   │ └ HTTP client    │
│  ├ Claude API call  │   └──────────────────┘
│  ├ Risk Engine      │
│  ├ Position Sizer   │   ┌──────────────────┐
│  └ Order Dispatcher │──►│ Alpaca Paper     │
│                     │   │ Trading API      │
└──┬──────────────┬───┘   └──────────────────┘
   │              │
   ▼              ▼
┌─────────┐  ┌────────────────┐
│  PG     │  │ Telegram Bot   │
│  on     │  │ (sendMessage)  │
│  Zeabur │  └────────────────┘
└────┬────┘
     │ Server Component / SSE
     ▼
┌─────────────────────────┐
│ apps/dashboard (Next.js)│
│ ├ /positions  即時持倉  │
│ ├ /pnl        每日 P&L  │
│ ├ /signals    訊號歷史  │
│ └ /backtest   回測績效  │
└─────────────────────────┘
```

---

## 目錄結構（Monorepo）

```
us-stock-ai-trader/
├── apps/
│   ├── api/                       # Node.js + Express
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── webhook.ts     # TradingView webhook
│   │   │   │   ├── internal.ts    # Python signal ingress
│   │   │   │   └── api.ts         # Dashboard API
│   │   │   ├── services/
│   │   │   │   ├── signalMerger.ts
│   │   │   │   ├── claudeAnalyzer.ts
│   │   │   │   ├── riskEngine.ts
│   │   │   │   ├── positionSizer.ts
│   │   │   │   ├── orderDispatcher.ts
│   │   │   │   └── telegramNotifier.ts
│   │   │   ├── db/                # Prisma schema + client
│   │   │   └── index.ts
│   │   ├── prisma/schema.prisma
│   │   └── package.json
│   ├── engine/                    # Python TA engine
│   │   ├── src/
│   │   │   ├── scheduler.py       # APScheduler 主循環
│   │   │   ├── alpaca_client.py
│   │   │   ├── indicators.py      # MA/RSI/MACD
│   │   │   ├── signal_builder.py
│   │   │   └── api_client.py      # POST 到 Node
│   │   ├── pyproject.toml
│   │   └── Dockerfile
│   └── dashboard/                 # Next.js 15
│       ├── app/
│       │   ├── positions/page.tsx
│       │   ├── pnl/page.tsx
│       │   ├── signals/page.tsx
│       │   └── backtest/page.tsx
│       ├── lib/db.ts
│       └── package.json
├── packages/
│   └── shared/                    # 共用型別與 schema
│       ├── types.ts               # SignalPayload / RiskParams
│       └── pinescript/
│           └── smc_signal.pine    # 從現有檔案搬進來
├── docs/
│   ├── PLAN.md                    # 本文件
│   ├── ARCHITECTURE.md
│   └── RISK_RULES.md
├── .env.example
├── .gitignore
├── pnpm-workspace.yaml
└── README.md
```

---

## 技術選型表

| 層級 | 技術 | 理由 |
|------|------|------|
| 後端框架 | **Node.js 20 + Express + TypeScript** | 既有 Pine/Alpaca 工具鏈友善、團隊熟悉 |
| ORM | **Prisma** | Type-safe、migration 流程成熟、與 PG 整合好 |
| Python | **Python 3.11 + APScheduler + httpx + TA-Lib** | TA-Lib 為技術指標業界標準；APScheduler 比 cron 易控 |
| 前端 | **Next.js 15 App Router + Tailwind + shadcn/ui** | Server Component 直連 PG、SSE 推即時、Zeabur 一鍵部署 |
| 即時推送 | **SSE（Server-Sent Events）** | 比 WebSocket 簡單、足以支撐單人 dashboard |
| 訊息通知 | **Telegram Bot API（sendMessage）** | 零基礎設施、單向即可 |
| LLM | **Claude API（claude-sonnet-4-6）** | 結構化輸出穩定、價格適中、含 prompt caching |
| 部署 | **Zeabur**（3 services + 1 PG） | 同網段低延遲、`zeabur.json` 宣告式 |
| Logging | **Pino（Node）+ structlog（Python）** | JSON 結構化日誌、便於後續接 Grafana Loki |
| 測試 | **Vitest（Node）+ pytest（Python）** | 快、與框架無痛整合 |

---

## Database Schema 草案

```sql
-- 訊號池（TradingView + Python 雙來源都進這張表）
CREATE TABLE signals (
  id              BIGSERIAL PRIMARY KEY,
  source          TEXT NOT NULL,           -- 'tradingview' | 'python'
  symbol          TEXT NOT NULL,
  timeframe       TEXT NOT NULL,           -- '5m','15m','1h','4h','1D'
  direction       TEXT NOT NULL,           -- 'long' | 'short'
  signal_type     TEXT NOT NULL,           -- 'BOS','CHoCH','OB','FVG','MA_CROSS'...
  raw_payload     JSONB NOT NULL,
  fingerprint     TEXT NOT NULL,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_signals_symbol_time ON signals(symbol, received_at DESC);

-- 訊號去重（60 秒視窗內同 fingerprint 拒收）
CREATE TABLE signal_fingerprints (
  fingerprint     TEXT PRIMARY KEY,
  expires_at      TIMESTAMPTZ NOT NULL
);

-- Claude 評分結果
CREATE TABLE claude_evaluations (
  id              BIGSERIAL PRIMARY KEY,
  signal_id       BIGINT REFERENCES signals(id),
  model           TEXT NOT NULL,           -- 'claude-sonnet-4-6'
  smc_structure   JSONB NOT NULL,          -- {BOS:..., OB:..., FVG:..., sweep:...}
  confidence      INT NOT NULL,            -- 0–100
  rationale       TEXT,
  api_cost_usd    NUMERIC(10,6),
  evaluated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 風控判斷與下單決策
CREATE TABLE trade_decisions (
  id              BIGSERIAL PRIMARY KEY,
  signal_id       BIGINT REFERENCES signals(id),
  evaluation_id   BIGINT REFERENCES claude_evaluations(id),
  decision        TEXT NOT NULL,           -- 'PLACED' | 'REJECTED'
  reject_reason   TEXT,                    -- 'risk_cap_exceeded' | 'too_many_positions'...
  position_qty    INT,
  entry_price     NUMERIC(12,4),
  stop_loss       NUMERIC(12,4),
  take_profit     NUMERIC(12,4),
  rr_ratio        NUMERIC(6,2),
  kelly_fraction  NUMERIC(6,4),
  decided_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alpaca 訂單與成交
CREATE TABLE orders (
  id              BIGSERIAL PRIMARY KEY,
  decision_id     BIGINT REFERENCES trade_decisions(id),
  alpaca_order_id TEXT UNIQUE NOT NULL,
  symbol          TEXT NOT NULL,
  side            TEXT NOT NULL,           -- 'buy' | 'sell'
  qty             INT NOT NULL,
  order_type      TEXT NOT NULL,           -- 'market' | 'limit' | 'stop'
  status          TEXT NOT NULL,           -- 'pending'|'filled'|'cancelled'|'rejected'
  filled_avg_price NUMERIC(12,4),
  submitted_at    TIMESTAMPTZ NOT NULL,
  filled_at       TIMESTAMPTZ
);

-- 持倉狀態（Alpaca 為唯一真實來源，這張表是 cache + P&L 計算）
CREATE TABLE positions (
  id              BIGSERIAL PRIMARY KEY,
  symbol          TEXT NOT NULL,
  entry_order_id  BIGINT REFERENCES orders(id),
  exit_order_id   BIGINT REFERENCES orders(id),
  qty             INT NOT NULL,
  entry_price     NUMERIC(12,4) NOT NULL,
  exit_price      NUMERIC(12,4),
  status          TEXT NOT NULL,           -- 'open' | 'closed'
  pnl_usd         NUMERIC(12,4),
  opened_at       TIMESTAMPTZ NOT NULL,
  closed_at       TIMESTAMPTZ
);

-- 每日 P&L 快照（每日收盤後 cron 寫入）
CREATE TABLE daily_pnl (
  trade_date      DATE PRIMARY KEY,
  realized_pnl    NUMERIC(12,4) NOT NULL,
  unrealized_pnl  NUMERIC(12,4) NOT NULL,
  trades_count    INT NOT NULL,
  win_count       INT NOT NULL,
  loss_count      INT NOT NULL,
  account_equity  NUMERIC(12,4) NOT NULL
);
```

---

## 訊號流程（端到端時序）

```
1. [TradingView Pine] BOS 形成 → alert_message JSON {symbol,tf,direction,secret,...}
                                        │
1.alt [Python Engine] APScheduler 5min  │
       拉 30 檔 OHLCV → MA50/RSI/MACD   │
       → 偵測 cross/divergence          │
                                        ▼
2. POST 到 Node /webhook/tv 或 /internal/python-signal
3. Node: 驗 secret → 計 fingerprint → PG INSERT signal_fingerprints (UNIQUE 衝突即去重)
4. Node: signals 表寫入 raw_payload
5. Node: Signal Merger 等待對端訊號 60 秒 → 達雙訊號或單訊號逾時
6. Node: 呼叫 Claude API（claude-sonnet-4-6, prompt caching ON）
   → 回傳 {smc_structure, confidence: 0–100, rationale}
7. Node: claude_evaluations 寫入
8. Node: Risk Engine 檢查
   ├ confidence ≥ 60?
   ├ R:R ≥ 1:2?
   ├ 同時持倉 < 3?
   ├ 今日虧損 < 3%?
   └ 該 symbol 無未平倉?
   → 任一不通過：trade_decisions 寫 REJECTED + 原因
9. Node: Position Sizer 算 qty = floor(equity × 1% / |entry−stop|) × Quarter Kelly
10. Node: Alpaca submitOrder（market entry + bracket: stop_loss + take_profit）
11. Node: orders 表寫入 alpaca_order_id（pending）
12. Node: Telegram 推「訊號觸發＋下單」訊息
13. Alpaca fill webhook → orders.status = filled, positions 表 INSERT
14. Telegram 推「成交回報」
15. 出場（止損/止盈/收盤）→ positions.status = closed, pnl_usd 計算
16. Telegram 推「平倉＋P&L」
```

---

## 風控規則引擎邏輯（虛擬碼）

```
function shouldPlaceOrder(signal, evaluation, account):
  if evaluation.confidence < 60: return reject("low_confidence")
  if account.dailyPnL_pct <= -3: return reject("daily_loss_halt")
  if account.openPositions >= 3: return reject("too_many_positions")
  if account.hasOpenPosition(signal.symbol): return reject("symbol_already_open")

  rr = abs(takeProfit - entry) / abs(entry - stopLoss)
  if rr < 2: return reject("rr_below_2")

  riskPerShare = abs(entry - stopLoss)
  riskBudget = account.equity * 0.01           // 1% 硬上限
  baseQty = floor(riskBudget / riskPerShare)

  // Quarter Kelly
  winRate = WIN_RATE_DEFAULT                    // 0.50
  rrAvg = AVG_RR_DEFAULT                        // 1.5
  kelly = (winRate * rrAvg - (1 - winRate)) / rrAvg
  finalQty = floor(baseQty * kelly * 0.25)

  if finalQty < 1: return reject("qty_below_1")
  return place(finalQty)
```

---

## Zeabur 部署拓撲

| Service | 類型 | 連線埠 | 備註 |
|---------|------|--------|------|
| `api` | Node.js | 8080（外部）/ 內部互通 | 對外接 TradingView webhook、Dashboard API |
| `engine` | Python | 內部唯一（無對外埠） | 常駐、APScheduler 5 分鐘觸發 |
| `dashboard` | Next.js | 443（自訂網域 SSL） | Server Component 直連 PG（同網段） |
| `postgres` | Zeabur PG template | 5432 內部 | 自動備份（Zeabur 內建） |

環境變數共用群組（Zeabur 的 Shared Variables）：
- `DATABASE_URL`、`ALPACA_KEY_ID`、`ALPACA_SECRET`、`ALPACA_BASE_URL`
- `ANTHROPIC_API_KEY`、`CLAUDE_MODEL=claude-sonnet-4-6`
- `TRADINGVIEW_WEBHOOK_SECRET`、`INTERNAL_API_TOKEN`
- `TELEGRAM_BOT_TOKEN`、`TELEGRAM_CHAT_ID`
- `STOCK_POOL=AAPL,MSFT,NVDA,...`（CSV）

---

## 開發階段分期

### Phase 0：環境與骨架（預計 1 週）
- 初始化 monorepo（pnpm workspace）
- 三個 app 各自跑得起來（hello world）
- Prisma schema + migration 建立
- Zeabur 部署管線打通（CI 推送即重部署）
- Telegram bot 能推一條測試訊息

### Phase 1：Webhook + 訊號落 PG（預計 1 週）
- TradingView Pine Script 整理（從現有 `smc_signal.pine` 搬入）
- Webhook 端點：secret 驗證 + 指紋去重
- Python Engine：APScheduler + Alpaca OHLCV 拉取 + 指標計算 + POST
- 雙訊號 60 秒視窗 Merger

### Phase 2：Claude + 風控 + 下單（預計 1 週）
- Claude API integration（含 prompt caching、structured output、cost log）
- Risk Engine 全規則
- Position Sizer + Quarter Kelly
- Alpaca Paper 下單 + bracket order
- 成交回填、Telegram 通知

### Phase 3：Dashboard（預計 1 週）
- 四個頁籤（持倉 / P&L / 訊號 / 回測）
- SSE 即時推送持倉變化
- 簡易圖表（Recharts 或 Tremor）
- 回測頁面：以 SQL 從 trade_decisions + positions 重放

### Phase 4：上線前演練（預計 3 天）
- 兩週 Paper 連續運行不出錯
- 每日 P&L 自動快照 cron
- 全鏈路 e2e 測試（手動 fire 假訊號）
- 文件補完（README + RUNBOOK）

---

## 驗收條件（MVP Done）

- [ ] TradingView 觸發 alert → 5 秒內出現在 PG `signals` 表
- [ ] Python 5 分鐘掃描成功率 ≥ 99%（API 配額未爆）
- [ ] 雙訊號合流後 → Claude 評分 → 規則判斷 → 下單，全鏈路 < 15 秒
- [ ] 風控硬條件全部生效（手動構造違規訊號可被拒並進 Telegram）
- [ ] Dashboard 四個頁籤可正常開啟、資料正確
- [ ] Zeabur 三個 service 正常運行、Logs 可查
- [ ] 連續 14 天 Paper Trading 無系統故障

---

## 環境變數清單

```bash
# Database
DATABASE_URL=postgres://user:pass@zeabur-pg:5432/trader

# Alpaca Paper
ALPACA_KEY_ID=...
ALPACA_SECRET=...
ALPACA_BASE_URL=https://paper-api.alpaca.markets

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-6

# Webhook & 內部 API
TRADINGVIEW_WEBHOOK_SECRET=長隨機字串
INTERNAL_API_TOKEN=長隨機字串

# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# 業務參數（可在 .env 調整不需動程式）
STOCK_POOL=AAPL,MSFT,NVDA,GOOGL,META,TSLA,AMD,AVGO,JPM,XOM
RISK_PCT_PER_TRADE=0.01
MAX_OPEN_POSITIONS=3
DAILY_LOSS_HALT_PCT=0.03
KELLY_MULTIPLIER=0.25
WIN_RATE_DEFAULT=0.50
AVG_RR_DEFAULT=1.5
PAPER_INITIAL_EQUITY=100000

# Python Engine
PYTHON_SCAN_INTERVAL_MIN=5
NODE_INTERNAL_URL=http://api:8080/internal/python-signal
```

---

## 後續可擴充（Out of MVP Scope）

- 多策略並行（除 SMC 外加趨勢追蹤、均值回歸）
- Telegram 雙向控制（/pause、/close）
- 獨立 Python 回測引擎（vectorbt + 多年歷史 OHLCV）
- 由 Paper 切換實盤的 dry-run 模式
- Grafana 儀表板＋告警
- 多帳戶／多策略隔離

---

## 現有資產盤點（已存在於工作目錄）

| 檔案 | 用途 | 處置 |
|------|------|------|
| `alpaca-trader.js` | Alpaca SDK 下單範例 | 拆解為 `apps/api/src/services/orderDispatcher.ts` 的參考 |
| `webhook-server.js` | Express webhook 雛形 | 重構為 `apps/api/src/routes/webhook.ts` |
| `smc_signal.pine` | TradingView SMC Pine Script | 搬至 `packages/shared/pinescript/`、補 `secret` 與 `alert_message` 模板 |
| `package.json` | Node 依賴 | 重新組成 monorepo root + `apps/api/package.json` |
| `env`、`gitignore` | 命名缺前綴點 | Phase 0 改為 `.env.example`、`.gitignore` |

---

## 驗證方式（Phase 0 結束後可跑的 smoke test）

```bash
# 1. 三個 service local 起來
pnpm -r dev

# 2. 測試 webhook 端點
curl -X POST http://localhost:8080/webhook/tv \
  -H "Content-Type: application/json" \
  -d '{"secret":"...", "symbol":"AAPL", "tf":"5m", "direction":"long", "signal_type":"BOS"}'

# 3. PG 應出現一筆 signals 紀錄
psql $DATABASE_URL -c "SELECT * FROM signals ORDER BY id DESC LIMIT 1;"

# 4. Telegram 應收到測試訊息
```
