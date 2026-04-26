# 美股 AI 自動化交易系統

整合 **TradingView Pine Script + Python 技術指標 + Node.js 規則引擎 + Claude API + Alpaca Paper Trading**，部署於 **Zeabur**。

策略核心：**SMC（Smart Money Concept）**——BOS / CHoCH / OB / FVG / Liquidity Sweep。

> 完整規劃文件：[`docs/PLAN.md`](docs/PLAN.md)
> 操作手冊：[`docs/RUNBOOK.md`](docs/RUNBOOK.md)

---

## 架構速覽

```
TradingView Pine ─┐                      ┌─► Alpaca Paper
                  ├─► Node.js (api) ─────┤
Python Engine ────┘   ├ Signal Merger    └─► Telegram
                      ├ Claude Analyzer
                      ├ Risk Engine          ┌─► Next.js Dashboard
                      └ Order Dispatcher  ◄──┴─ PostgreSQL
```

---

## Monorepo 結構

| 路徑 | 角色 | 技術 |
|------|------|------|
| `apps/api` | 後端整合服務 | Node.js 20 + Express + TypeScript + Prisma |
| `apps/engine` | 技術指標引擎 | Python 3.11 + APScheduler + TA-Lib |
| `apps/dashboard` | 監控介面 | Next.js 15 App Router + Tailwind |
| `packages/shared` | 共用型別 + Pine Script | TypeScript |

---

## 快速開始（Local）

```bash
# 1. 安裝依賴
pnpm install

# 2. 複製環境變數範本
cp .env.example .env
# → 編輯 .env 填入 Alpaca / Anthropic / Telegram 金鑰

# 3. 起本地 PostgreSQL（用 Docker 最快）
docker run -d --name trader-pg -p 5432:5432 \
  -e POSTGRES_USER=user -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=trader \
  postgres:16

# 4. 套用 schema
pnpm db:migrate

# 5. 同時起三個 service
pnpm dev
```

---

## 開發階段

| Phase | 內容 | 狀態 |
|-------|------|------|
| 0 | 環境與骨架（monorepo、Prisma、三 service hello world、Telegram 測試）| ⏳ 進行中 |
| 1 | Webhook + 訊號落 PG | ⏸️ 等 Phase 0 |
| 2 | Claude + 風控 + Alpaca 下單 | ⏸️ |
| 3 | Dashboard 四頁籤 | ⏸️ |
| 4 | 上線前演練（連續 14 天 Paper）| ⏸️ |

---

## 安全提醒

- `.env` **絕對不能** commit，請確認 `.gitignore` 有擋住
- Alpaca / Anthropic / Telegram 金鑰外洩時，立即去對應後台 Regenerate
- 此系統設計為 **Paper Trading 專用**，切換實盤前必須完整通過 Phase 4 演練
