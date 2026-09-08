# 開發計畫與優化清單

> 工作目錄：`/Users/xieh/Desktop/技術開發/US stock AI trader`
> 文件用途：交接與下一輪開發的 single source of truth；Claude Code 重新進入 session 時讀此檔即可接手
> 最後更新：2026-04-26
> 對應總體規劃：`docs/PLAN.md`（架構決策、DB schema、訊號流程）

---

## 0. 當前進度快照

### 已完成
- [x] **Phase 0** monorepo 骨架（pnpm workspace + apps/api + apps/engine + apps/dashboard + packages/shared）
- [x] **Phase 0** Prisma schema + migration `20260426134140_init`（7 張表）
- [x] **Phase 0** `.env.example`、`.gitignore`、`zeabur.json`、`tsconfig.base.json`
- [x] **Phase 3** Dashboard 提前完成（從 `archive/frontend-reference` 搬入 + 改寫為 polling-based）
  - `apps/dashboard/app/{positions,pnl,signals,backtest}/page.tsx`
  - `apps/dashboard/lib/apiClient.ts`、`hooks/usePolling.ts`、`types/index.ts`
  - `components/{layout,positions,pnl,signals}/...`
- [x] GitHub 單一 main branch、推送至 `jack926509/US-stock-AI-trader`
- [x] Zeabur 4 services 設定檔（postgres / api / engine / dashboard）

### 未完成（重點）
- [ ] **Phase 1** Webhook secret 驗證、SHA256 fingerprint 去重、訊號落 PG（目前 routes 為 placeholder）
- [ ] **Phase 1** Python Engine 實際 OHLCV 拉取與指標計算（目前 6 個 .py 都是 1 行空檔）
- [ ] **Phase 2** Claude API 整合、Risk Engine、Position Sizer、Alpaca 下單（6 個 service.ts 都是 0–7 行 placeholder）
- [ ] **Phase 4** 14 天 Paper Trading 連續運行
- [ ] Telegram smoke test（待使用者填 token）
- [ ] Alpaca paper key 重新申請（舊 key 已外洩：`PKXVGJSOQ75FXVD3LC3Y6FZZPU`）
- [ ] Zeabur 實際部署（4 services 起服務 + 環境變數設定）

### 檔案狀態（placeholder 清單）
| 檔案 | 行數 | 狀態 |
|------|------|------|
| `apps/api/src/routes/webhook.ts` | 11 | placeholder（log + return ok） |
| `apps/api/src/routes/internal.ts` | 11 | placeholder |
| `apps/api/src/services/signalMerger.ts` | 2 | 空 |
| `apps/api/src/services/claudeAnalyzer.ts` | 3 | 空 |
| `apps/api/src/services/riskEngine.ts` | 7 | 骨架 |
| `apps/api/src/services/positionSizer.ts` | 3 | 空 |
| `apps/api/src/services/orderDispatcher.ts` | 3 | 空 |
| `apps/api/src/services/telegramNotifier.ts` | 3 | 空 |
| `apps/engine/src/alpaca_client.py` | 1 | 空 |
| `apps/engine/src/indicators.py` | 1 | 空 |
| `apps/engine/src/signal_builder.py` | 1 | 空 |
| `apps/engine/src/api_client.py` | 1 | 空 |
| `apps/engine/src/scheduler.py` | 33 | APScheduler 骨架 |

---

## 1. Phase 1 — Webhook + 訊號落 PG（下一輪開發起點）

### 1.1 TradingView Webhook（`apps/api/src/routes/webhook.ts`）
**目標**：接收 TradingView alert，驗 secret、計指紋、寫 PG。

**實作步驟**：
1. 從 `req.body` 解出 `secret, symbol, tf, direction, signal_type, ...`
2. 比對 `process.env.TRADINGVIEW_WEBHOOK_SECRET`，不符 → `401 invalid_secret`
3. 計算 `fingerprint = sha256(`${source}|${symbol}|${tf}|${direction}|${signal_type}|${minute_bucket}`)`
4. `prisma.signalFingerprint.create({ fingerprint, expires_at: now + 60s })` — 用 unique 衝突當去重判斷（catch P2002 → 回 `200 deduplicated`）
5. `prisma.signal.create({ source: 'tradingview', symbol, ..., raw_payload: req.body })`
6. `res.json({ ok: true, signal_id })`
7. 失敗時 logger.error 並回 5xx

**需要新增**：
- `apps/api/src/lib/fingerprint.ts` — SHA256 helper
- `apps/api/src/lib/prisma.ts` — Prisma client singleton（避免 dev hot-reload 多次 new）

**測試**：`vitest` + supertest，至少三例：合法、secret 錯、60 秒內重複。

### 1.2 Python Internal Endpoint（`apps/api/src/routes/internal.ts`）
**目標**：與 1.1 共用 90% 邏輯，僅來源改為 `python` + 改用 `INTERNAL_API_TOKEN`。

**實作策略**：抽出 `apps/api/src/services/signalIngest.ts`，兩個 router 都呼叫同一個 `ingestSignal({ source, payload, authToken })`。

### 1.3 Python Engine 主迴圈
**檔案順序**：
1. `apps/engine/src/alpaca_client.py` — 包 `alpaca-py` 拉 OHLCV（IEX 免費版）
2. `apps/engine/src/indicators.py` — TA-Lib `MA50/RSI/MACD`，回傳 dict
3. `apps/engine/src/signal_builder.py` — 比對最近 2 根 K 線判斷 cross/divergence，產出 `{symbol, tf, direction, signal_type}`
4. `apps/engine/src/api_client.py` — `httpx.post(NODE_INTERNAL_URL, json=payload, headers={Authorization: Bearer INTERNAL_API_TOKEN})`
5. `apps/engine/src/scheduler.py` — APScheduler 已有骨架，補上「掃 STOCK_POOL → for symbol in pool → 三個 timeframe → 拉資料 → 算指標 → 有訊號則 POST」

**注意事項**：
- IEX 免費版有 rate limit（200 req/min），30 檔 × 5 timeframe 一次掃描要分批
- 用 `tenacity` 加 retry，失敗一檔不影響整批
- structlog 結構化日誌，每筆訊號 log `{symbol, tf, signal_type, latency_ms}`

### 1.4 Signal Merger（`apps/api/src/services/signalMerger.ts`）
**目標**：60 秒內收到 TV + Python 同 symbol/方向訊號 → 合併送下一階段；單訊號逾時 → 仍送下一階段（信心值降權）。

**最簡實作**：
- in-memory `Map<string, { signals: Signal[], timer: NodeJS.Timeout }>`，key = `${symbol}|${direction}`
- 第一筆來時開 60s setTimeout，timer 到時觸發 `onMergedReady(signals[])`
- 第二筆同 key 來 → push 進 array，仍等 timer 到才 fire（避免衝出窗口的 race）
- 程序重啟會丟訊號，但 PG 已落地可重放，MVP 可接受

**未來優化**：改用 Redis stream 或 PG `LISTEN/NOTIFY` 跨 instance 合流。

### 1.5 Phase 1 驗收
- [ ] `curl -X POST /webhook/tv` 帶合法 secret → PG `signals` 表新增一筆
- [ ] `curl` 帶錯 secret → 401
- [ ] 連續打兩次相同 payload → 第二次回 `deduplicated`
- [ ] Python engine 啟動 30 分鐘 → PG 至少出現 5 筆 source='python' 訊號
- [ ] Dashboard `/signals` 頁能看到上述訊號

---

## 2. Phase 2 — Claude + 風控 + 下單

### 2.1 Claude Analyzer（`apps/api/src/services/claudeAnalyzer.ts`）
**目標**：吃 merged signal + 最近 50 根 K 線 OHLCV → 回 `{smc_structure, confidence, rationale}`。

**實作要點**：
- 用 `@anthropic-ai/sdk` 的 messages API，model = `process.env.CLAUDE_MODEL`（預設 `claude-sonnet-4-6`）
- **prompt caching**：把 SMC 知識 system prompt（BOS/CHoCH/OB/FVG 定義 + 範例）放 cache control 的 `ephemeral` block
- **structured output**：用 `tool_use` 強制回 JSON，不解析自由文字
  ```ts
  tools: [{ name: 'submit_smc_evaluation', input_schema: { ... } }]
  tool_choice: { type: 'tool', name: 'submit_smc_evaluation' }
  ```
- 每次呼叫記 `usage.input_tokens / output_tokens / cache_read_tokens` → 估 cost → 寫 `claude_evaluations.api_cost_usd`
- 失敗 / 逾時 → 訊號標 `confidence=0` 仍進 risk engine（會被低信心擋下，留軌跡）

**SMC system prompt 內容（要寫進程式裡，不要外連檔案）**：
- BOS：價格突破前一個 swing high/low
- CHoCH：trend reversal 的第一根 BOS
- OB：BOS 前最後一根反向 K 線
- FVG：三根 K 線中間的價格缺口
- Liquidity Sweep：刺破前高/低後立即回收

### 2.2 Risk Engine（`apps/api/src/services/riskEngine.ts`）
**目標**：實作 `docs/PLAN.md` 中的 `shouldPlaceOrder()` 虛擬碼。

**檢查順序**（任一不過 → reject）：
1. `confidence >= 60`
2. `account.dailyPnL_pct > -3`（從 `daily_pnl` 表當日 row 算）
3. `account.openPositions < 3`（從 Alpaca `/v2/positions` 即時拉）
4. `!account.hasOpenPosition(symbol)`
5. `rr = |tp - entry| / |entry - sl| >= 2`

**注意**：`account.openPositions` 與 `dailyPnL` 應該每次都重新拉而非 cache，避免 race。

### 2.3 Position Sizer（`apps/api/src/services/positionSizer.ts`）
公式（已在 PLAN.md 確認）：
```ts
const riskBudget = equity * Number(process.env.RISK_PCT_PER_TRADE);  // 0.01
const baseQty = Math.floor(riskBudget / Math.abs(entry - stopLoss));
const winRate = Number(process.env.WIN_RATE_DEFAULT);                 // 0.5
const rrAvg = Number(process.env.AVG_RR_DEFAULT);                     // 1.5
const kelly = (winRate * rrAvg - (1 - winRate)) / rrAvg;              // = 0.1667
const finalQty = Math.floor(baseQty * kelly * Number(process.env.KELLY_MULTIPLIER));  // × 0.25
```

### 2.4 Order Dispatcher（`apps/api/src/services/orderDispatcher.ts`）
**參考**：根目錄已有的 `alpaca-trader.js`（legacy 範例），可照抄。

**實作**：
- `placeBracketOrder({ symbol, qty, side, entry, stopLoss, takeProfit })`
- 用 Alpaca REST API：`POST /v2/orders` with `order_class: 'bracket'`
- 寫入 `orders` 表（`alpaca_order_id`、`status='pending'`）
- 不在這裡輪詢成交；另開 webhook 或 cron 同步狀態

### 2.5 Alpaca Order Status Sync
**選項 A（推薦）**：訂閱 Alpaca trade updates SSE → 收到 fill 事件 → update orders & positions 表。
**選項 B**：APScheduler 每 30 秒拉 `/v2/orders?status=all` 對齊。

MVP 用 B 簡單，後續換 A。

### 2.6 Telegram Notifier（`apps/api/src/services/telegramNotifier.ts`）
四種訊息模板：
- 訊號觸發＋下單：`📈 BOS LONG AAPL @172.5 / SL 170.8 / TP 176.0 / qty 12`
- 成交：`✅ AAPL filled 12 @172.48`
- 平倉＋P&L：`💰 AAPL closed @175.6 / +$37.44 / +1.81%`
- 日虧告警：`🛑 daily loss -3.1%, halting`

直接用 `https://api.telegram.org/bot${TOKEN}/sendMessage`，不用 SDK。

### 2.7 Phase 2 驗收
- [ ] 手動 `curl` 假訊號 → 5 秒內 Claude 評分寫入 PG
- [ ] 構造低信心訊號 → reject 並 Telegram 推送
- [ ] 構造合法訊號 → Alpaca paper 下出 bracket order
- [ ] Alpaca dashboard 看到單存在
- [ ] 模擬達 3 個持倉 → 第 4 個訊號被 reject

---

## 3. Phase 4 — 上線前演練

- [ ] 每日 P&L 快照 cron（PG 收盤後寫 `daily_pnl`）
  - 用 APScheduler 或 Zeabur cron service
  - 觸發時間 16:05 ET（21:05 UTC）= 平日週一至週五
- [ ] e2e 測試腳本（`scripts/e2e-fire-signal.sh`）— 手動打整鏈路
- [ ] RUNBOOK 補完（`docs/RUNBOOK.md` 已有骨架）：
  - 服務 down 怎麼重啟
  - DB 備份恢復步驟
  - Alpaca key 輪換
- [ ] 14 天 Paper 連續運行檢查表（每日記錄）

---

## 4. 優化項目（可在 MVP 後做）

### 4.1 程式碼品質
- [ ] 加 Husky + lint-staged，commit 前自動 `pnpm lint`
- [ ] api 服務每個 service 都補 vitest，目標單檔覆蓋率 ≥ 80%
- [ ] Python 加 `ruff` + `mypy --strict`
- [ ] CI（GitHub Actions）：lint + test + tsc + prisma validate

### 4.2 觀測性
- [ ] 結構化日誌統一格式（`{trace_id, signal_id, symbol}` 欄位）
- [ ] 接 Grafana Loki 或 Zeabur logs 集中查詢
- [ ] Prometheus metrics endpoint（訊號 throughput、Claude 延遲、Alpaca 錯誤率）
- [ ] 每筆訊號的端到端 latency 記錄（webhook 進來 → 下單完成）

### 4.3 風控強化
- [ ] 動態勝率：每 30 筆交易重算 `WIN_RATE` 取代寫死 0.5
- [ ] 動態 R:R：取近 30 筆 winner 的 mean RR
- [ ] 連續虧損熔斷：3 連虧暫停 1 小時
- [ ] 部位相關性檢查（不要同時持 3 檔同產業）

### 4.4 訊號品質
- [ ] Claude evaluation cache（同 symbol + tf + 15 分鐘窗口內復用評分）
- [ ] 多時間框架共振權重（4H BOS + 15m BOS 同向 → confidence 加成）
- [ ] 黑名單 ticker（earnings 前 1 天自動排除）

### 4.5 Dashboard
- [ ] SSE 取代 polling（`/api/stream/positions`）
- [ ] 圖表：每日累積 P&L 折線、勝率曲線
- [ ] 訊號詳情頁：能看到 Claude rationale 全文
- [ ] 手動 close position 按鈕（要二次確認）

### 4.6 部署 / 維運
- [ ] 部署紅綠燈：Zeabur deploy 後自動發 Telegram
- [ ] 環境分離：production / staging（staging 連 Alpaca paper 但小資金）
- [ ] DB migration zero-downtime 流程文件化
- [ ] Secret rotation 計畫（90 天輪換）

### 4.7 已知技術債
- 無 Redis：fingerprint TTL、merger 60s window 都靠 in-memory + PG，多 instance 部署會出問題
- 無 idempotency key：webhook 重發可能造成重複下單（目前靠 fingerprint 60s 窗口擋）
- Prisma client 在 hot reload 下會多次 instantiate（dev 環境會 warning，prod 沒問題）
- `apps/dashboard` 的 polling 沒做指數退避，API 掛掉會打爆

---

## 5. 操作待辦（使用者親自處理）

### 5.1 Telegram smoke test
1. 找 BotFather 申請 bot，得 `TELEGRAM_BOT_TOKEN`
2. 把 bot 加進個人對話、傳一則訊息
3. `curl https://api.telegram.org/bot<TOKEN>/getUpdates` → 抓 `chat.id`
4. 填入 `.env` 的 `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`
5. `pnpm --filter @app/api test:telegram`
6. 應收到 "Hello from US Stock AI Trader" 訊息

### 5.2 Alpaca Paper Key 重新申請
**為什麼**：先前 conversation 中舊 key（`PKXVGJSOQ75FXVD3LC3Y6FZZPU`）已外洩，必須作廢。
1. 登入 https://app.alpaca.markets → Paper Trading → API Keys
2. 點 Regenerate
3. 把新的 `KEY_ID` / `SECRET` 填入 `.env`
4. 同時更新 Zeabur 的環境變數

### 5.3 Zeabur 部署步驟（GUI）
1. 進 dash.zeabur.com → Create Project
2. Add Service → Marketplace → PostgreSQL → 命名 `postgres`
3. Add Service → Git → 選 `jack926509/US-stock-AI-trader` → 應自動偵測 `zeabur.json` 建立 api / engine / dashboard 三個 service
4. 每個 service 設定環境變數（見 5.4 表格）
5. 把 dashboard 綁自訂網域（或用 Zeabur 提供的）
6. 取得 dashboard URL 後，回頭把 api 的 `DASHBOARD_ORIGIN` 設成此 URL → redeploy api

### 5.4 環境變數對照表（Zeabur）

**api**：
| Key | Value |
|-----|-------|
| `DATABASE_URL` | `${POSTGRES_CONNECTION_STRING}` |
| `ALPACA_KEY_ID` | (手填新 key) |
| `ALPACA_SECRET` | (手填新 secret) |
| `ALPACA_BASE_URL` | `https://paper-api.alpaca.markets` |
| `ANTHROPIC_API_KEY` | (手填) |
| `CLAUDE_MODEL` | `claude-sonnet-4-6` |
| `TRADINGVIEW_WEBHOOK_SECRET` | (長隨機字串) |
| `INTERNAL_API_TOKEN` | (長隨機字串) |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | (手填) |
| `STOCK_POOL` 等業務參數 | 照 `.env.example` |
| `DASHBOARD_ORIGIN` | 部署後 dashboard 公開網址 |

**engine**：
| Key | Value |
|-----|-------|
| `ALPACA_KEY_ID` / `ALPACA_SECRET` / `ALPACA_BASE_URL` | 同 api |
| `INTERNAL_API_TOKEN` | 同 api |
| `NODE_INTERNAL_URL` | `http://${API_INTERNAL_DOMAIN}/internal/python-signal` |
| `STOCK_POOL` / `PYTHON_SCAN_INTERVAL_MIN` | 照 `.env.example` |

**dashboard**（注意：`NEXT_PUBLIC_*` 是 build-time 注入）：
| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | api 的對外網址（如 `https://api-xxx.zeabur.app`） |

---

## 6. 下一輪開發 — 第一件事該做什麼

**建議起手式（依序）**：
1. **先把 5.1 / 5.2 操作待辦做完**（Telegram + Alpaca key），讓 `.env` 完整
2. **本機跑通 Phase 1**：
   - `pnpm --filter @app/api dev` 起 api
   - `curl -X POST localhost:8080/webhook/tv -d '{"secret":"...","symbol":"AAPL",...}'` 看 PG 有沒有寫進去
   - 沒寫進去 → 先實作 `routes/webhook.ts` + `lib/prisma.ts` + `services/signalIngest.ts`
3. **Python engine 起一個 symbol 跑通**：
   - 改 `STOCK_POOL=AAPL` 單檔測試
   - 確認指標計算正確、能 POST 到 api
4. **Phase 1 全部驗收條件過 → 進 Phase 2**

**避免**：
- 不要一次寫完所有 service 才測，會難 debug
- 不要為了 Phase 4 的 cron 提前重構 APScheduler（Phase 1 結束再說）
- 不要動 Dashboard（已 done，動了反而要重測）

---

## 7. 參考檔案

| 用途 | 檔案 |
|------|------|
| 架構決策 / DB schema / 訊號流程 | `docs/PLAN.md` |
| 部署與維運手冊 | `docs/RUNBOOK.md` |
| Legacy 程式碼參考 | `docs/legacy-reference/` |
| Pine Script 原始檔 | `packages/shared/pinescript/smc_signal.pine`（待搬入） |
| 環境變數範本 | `.env.example` |
| Zeabur 服務設定 | `zeabur.json` |
