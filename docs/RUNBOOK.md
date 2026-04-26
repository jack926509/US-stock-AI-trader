# RUNBOOK — Phase 0 Smoke Test

本文件指引你在 local 端把 Phase 0 骨架跑起來，並驗證三個 service 與 Telegram 通道正常。

> Phase 1 之後的 RUNBOOK 章節會逐步補充。

---

## 0. 前置需求

| 工具 | 版本 | 安裝建議 |
|------|------|----------|
| Node.js | 20+ | `nvm install 20 && nvm use 20`（repo 根目錄已有 `.nvmrc`） |
| pnpm | 9+ | `corepack enable && corepack prepare pnpm@9.12.0 --activate` |
| Python | 3.11 | `pyenv install 3.11 && pyenv local 3.11`（repo 已有 `.python-version`） |
| Docker | 任意 | 用來起 local PostgreSQL |

---

## 1. 安裝依賴

```bash
cd "/Users/xieh/Desktop/技術開發/US stock AI trader"

# Node 端三個 app 一次裝
pnpm install

# Python 端
cd apps/engine
pip install -e .
cd ../..
```

---

## 2. 設定環境變數

```bash
cp .env.example .env
```

打開 `.env`，至少填這三組：

| 變數 | 從哪取得 |
|------|----------|
| `ALPACA_KEY_ID` / `ALPACA_SECRET` | https://app.alpaca.markets → Paper Trading → API Keys → 點 Generate |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com → API Keys |
| `TELEGRAM_BOT_TOKEN` | Telegram 找 `@BotFather` → `/newbot` → 取得 token |
| `TELEGRAM_CHAT_ID` | 跟你的 bot 對話一句 → `https://api.telegram.org/bot<TOKEN>/getUpdates` → 找 `chat.id` |
| `DATABASE_URL` | 下一節會起本地 PG，先填 `postgres://user:pass@localhost:5432/trader` |
| `TRADINGVIEW_WEBHOOK_SECRET` / `INTERNAL_API_TOKEN` | 自己亂打一串長字串 |

---

## 3. 起 local PostgreSQL

```bash
docker run -d --name trader-pg -p 5432:5432 \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=pass \
  -e POSTGRES_DB=trader \
  postgres:16

# 套用 schema（會幫你建 7 張表）
pnpm --filter @app/api db:generate
pnpm --filter @app/api db:migrate
```

驗證：

```bash
# 應顯示 7 張表：signals, signal_fingerprints, claude_evaluations,
#                trade_decisions, orders, positions, daily_pnl
docker exec -it trader-pg psql -U user -d trader -c "\dt"
```

---

## 4. 三個 service 同時起

```bash
pnpm dev
```

這會並行跑：
- `apps/api`：Express on `http://localhost:8080`
- `apps/engine`：Python APScheduler，每 5 分鐘印一條 `scan_pool tick` log（會立即先跑一次）
- `apps/dashboard`：Next.js on `http://localhost:3030`

---

## 5. Smoke Test 清單

### ✅ 5.1 API 健康檢查
```bash
curl http://localhost:8080/health
# 預期：{"status":"ok","ts":"..."}
```

### ✅ 5.2 Webhook placeholder
```bash
curl -X POST http://localhost:8080/webhook/tv \
  -H "Content-Type: application/json" \
  -d '{"hello":"world"}'
# 預期：{"ok":true,"phase":"0-placeholder"}
```

### ✅ 5.3 Python signal placeholder
```bash
curl -X POST http://localhost:8080/internal/python-signal \
  -H "Content-Type: application/json" \
  -d '{"hello":"world"}'
# 預期：{"ok":true,"phase":"0-placeholder"}
```

### ✅ 5.4 Engine 排程
看 `pnpm dev` 的輸出，應見到：
```
{"event":"engine starting","interval_min":5}
{"event":"scan_pool tick","interval_min":5,"target":"http://localhost:8080/internal/python-signal"}
```

### ✅ 5.5 Dashboard 開啟
瀏覽器打開 <http://localhost:3030>，應看到首頁 + 四個頁籤連結。

### ✅ 5.6 Telegram 推送
```bash
pnpm --filter @app/api test:telegram
# 預期：你的 Telegram 收到一條測試訊息
```

---

## 6. 全部通過 = Phase 0 完工 ✅

接著進入 Phase 1：Webhook secret 驗證 + 訊號落 PG + Python 真實拉 OHLCV。

---

## 常見問題

### Q：`pnpm dev` 報 `prisma client not generated`
```bash
pnpm --filter @app/api db:generate
```

### Q：Python `import alpaca` 失敗
```bash
cd apps/engine && pip install -e .
```

### Q：Telegram 沒收到訊息
- 檢查 `.env` 的 `TELEGRAM_BOT_TOKEN` 與 `TELEGRAM_CHAT_ID` 是否正確
- 你必須先「主動跟 bot 對話一句」，才能查到 chat_id
- bot 必須沒被你封鎖

### Q：要重置本地 PG
```bash
docker rm -f trader-pg
# 重新跑第 3 節
```
