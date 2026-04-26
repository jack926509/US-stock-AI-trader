# frontend-from-github（參考用，勿直接 import）

來源：`github.com/jack926509/US-stock-AI-trader` → branch `claude/plan-trading-system-alMbS`
擷取日期：2026-04-26
擷取人：本地 Claude Code session（為 Phase 3 dashboard 預備素材）

## 為什麼留這份

那邊的 repo 是另外一個 Claude Code session 跑出的版本，整體架構（SQLite + JS + spawn Python）跟我們本地的 12 項決策不相容，**整個後端不能用**。但 `components/`、`hooks/usePolling.ts`、`lib/apiClient.ts`、`app/` 那幾頁的 UI 排版已經寫得比我們的 placeholder 完整，Phase 3 寫 Dashboard 時可以照抄改 TypeScript + 改成對接我們的 Prisma schema。

## 改寫時要注意的差異

| 項目 | 那版的做法 | 我們本地要改成 |
|------|-----------|--------------|
| 即時更新 | `usePolling` 輪詢 | **SSE**（Server-Sent Events，已決策） |
| API 呼叫 | `lib/apiClient.ts` 走 `fetch('http://localhost:3001/...')` | Server Component 直接從 Prisma 讀 PG，不走 HTTP |
| 訊號型別 | `types/index.ts` 是 SQLite schema 對應 | 用我們的 `packages/shared/src/types.ts` + Prisma 自動產的型別 |
| Port | 後端 3001 | 我們是 8080 |
| 欄位 | `ticker / action / entry_price / stop_loss / take_profit / rr_ratio` | 我們是 `symbol / direction / entry_price / stop_loss / take_profit / rr_ratio`，部分欄位散在 `signals` / `trade_decisions` / `positions` 三張表 |

## 用法

寫 Phase 3 時：
1. 先讀這資料夾對應檔案，理解版面與互動邏輯
2. 在 `apps/dashboard/components/` 重寫成 TypeScript + 對接 Prisma
3. 寫完後**不要刪這資料夾**，留著當 diff 對照

## 不要做的事

- ❌ 直接 `import` 這資料夾內的檔案到 `apps/dashboard/`
- ❌ 把 `lib/apiClient.ts` 的 fetch 邏輯搬過去（我們用 Server Component 直連 PG）
- ❌ 把 `usePolling.ts` 搬過去（我們改用 SSE）
