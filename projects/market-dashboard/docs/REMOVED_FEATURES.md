# 已移除功能存檔（Simplify MVP）

> **背景**：2026-05-21 將專案瘦身為 MVP（Dashboard + 個股頁 + 1 個 AI 分析）。
> 本文件記錄所有被砍掉的模組、設計理念、原始碼位置與復原步驟，方便日後再擴充。
>
> **完整源碼快照**：基準 commit `3c2976c`（main 分支），任何被砍檔案都可 `git show 3c2976c:<path>` 取回。
> **同時複製一份到 `docs/removed/`**：被砍的原始檔案會原封不動移到此資料夾，可直接 `mv` 回去復用。

---

## 目錄

1. [13 代理人深度分析（最大塊）](#1-13-代理人深度分析)
2. [同業比較 + Peer Discovery 四層 fallback](#2-同業比較--peer-discovery-四層-fallback)
3. [綜合評分 ScoreCard](#3-綜合評分-scorecard)
4. [公司新聞 NewsPanel](#4-公司新聞-newspanel)
5. [財報深度頁 Financials API](#5-財報深度頁-financials-api)
6. [伺服器端持久化 Drizzle + Turso + SQLite](#6-伺服器端持久化-drizzle--turso--sqlite)
7. [FMP API 整套（保留 Finnhub）](#7-fmp-api-整套保留-finnhub)
8. [Rate Limit + Basic Auth Proxy](#8-rate-limit--basic-auth-proxy)
9. [SSE Streaming 機制](#9-sse-streaming-機制)
10. [Dashboard 進階區塊（SectorBreakdown / NewsRail）](#10-dashboard-進階區塊sectorbreakdown--newsrail)
11. [深度分析全螢幕模式](#11-深度分析全螢幕模式)
12. [復原流程通用範本](#12-復原流程通用範本)

---

## 1. 13 代理人深度分析

### 1.1 設計理念

四階段管線，總耗時 2-3 分鐘：

```
Phase 1 ─ 6 位投資大師獨立分析（並行）
  巴菲特   護城河 / ROE-ROIC / 安全邊際
  林奇     PEG / 消費者熟悉度 / 十倍股分類
  伍德     顛覆式創新 / TAM / 5 年 CAGR
  貝瑞     逆向 / 資產負債表深掘 / 泡沫信號
  艾克曼   集中持股 / 活動家事件驅動
  塔雷伯   反脆弱 / 不對稱回報 / 黑天鵝抗性
            ↓
Phase 2 ─ 多空辯論
  Bull (並行) ━┓
              ┣━ Manager 研究主管裁決
  Bear (並行) ━┛
            ↓
Phase 3 ─ 風險辯論（並行）
  激進派 / 保守派 / 中立派各陳倉位邏輯
            ↓
Phase 4 ─ Portfolio Manager 整合
  輸出最終決策報告（評級 + 目標價區間 + 建議倉位 + 停損點 + Catalyst/Risk 表格）
```

每位代理人共享同一份 `AnalysisContext`（財報摘要 / 估值指標 / 同業比較 / 新聞 / 內部交易 / 分析師共識 / 總經）。

事件透過 SSE 即時推送：`phase_start` / `phase_complete` / `agent_start` / `agent_chunk` / `agent_complete` / `error` / `done`。

### 1.2 原始檔案結構（皆已移至 `docs/removed/src/lib/agents/`）

```
src/lib/agents/
├── types.ts              # AgentEvent / AgentId / AnalysisContext / AGENT_META
├── orchestrator.ts       # 4 階段 async generator 主流程（232 行）
├── runner.ts             # Claude streaming 共用 wrapper（40 行）
├── event-queue.ts        # 多 task 事件交織用 EventQueue（39 行）
├── sse-parser.ts         # 前端 SSE 解析器（35 行）
├── masters/
│   ├── shared.ts         # buildMasterUserPrompt + MASTER_OUTPUT_FORMAT
│   ├── buffett.ts        # 巴菲特 system prompt
│   ├── lynch.ts          # 林奇
│   ├── wood.ts           # 伍德
│   ├── burry.ts          # 貝瑞
│   ├── ackman.ts         # 艾克曼
│   └── taleb.ts          # 塔雷伯
├── debate/
│   ├── shared.ts         # buildContextRecap / buildMastersRecap / buildDebateRecap / buildRiskRecap
│   ├── bull.ts           # 多方研究員
│   ├── bear.ts           # 空方研究員
│   └── manager.ts        # 研究主管裁決
└── risk/
    ├── aggressive.ts     # 激進派
    ├── conservative.ts   # 保守派
    ├── neutral.ts        # 中立派
    └── portfolio.ts      # 投組經理（最終決策）
```

附屬：
- `src/components/deep-analysis/AgentCard.tsx`（214 行）— 雙行式代理人卡片
- `src/components/deep-analysis/PhaseProgress.tsx`（69 行）— 四階段進度條
- `src/app/api/deep-analysis/[symbol]/route.ts`（183 行）— SSE endpoint
- `src/app/stock/[symbol]/deep-analysis/page.tsx` + `DeepAnalysisClient.tsx` — 全螢幕模式

### 1.3 Portfolio Manager 輸出規格（最重要的解析錨點）

Portfolio Manager 是最終決策者，下游 `parseRating()` / `parseTargetPrice()` 會抓固定字串，**復原時這段規格必須保留**：

```markdown
# <標的> 深度分析最終決策

## 結論摘要
- 評級：<Strong Buy | Buy | Hold | Sell | Strong Sell>
- 目標價：$<low>-$<high>
- 建議倉位：<X>%（最多 10%）
- 持有期間：<短期 / 中期 / 長期>
- 信心度：<低 / 中 / 高>

## 核心論點 / 主要 Catalysts / 主要 Risks / 倉位執行建議 / 失效信號 / 大師意見摘要表
```

### 1.4 13 位代理人 mission 一句話速覽

| Agent | 核心方法論 | maxTokens |
|-------|-----------|-----------|
| 巴菲特 | 護城河 + ROE ≥ 15% + 安全邊際 + 能力圈 | 1500 |
| 林奇 | 六分類 + PEG < 1 + 鏡子裡的客戶 | 1500 |
| 伍德 | 顛覆式創新 + TAM + 5 年 CAGR | 1500 |
| 貝瑞 | 逆向 + 資產負債表深掘 + 泡沫信號 | 1500 |
| 艾克曼 | 集中持股 + 活動家事件驅動 | 1500 |
| 塔雷伯 | 反脆弱 + 不對稱回報 + 黑天鵝抗性 | 1500 |
| Bull | 多方論述（吃 6 大師輸出） | 1800 |
| Bear | 空方論述（吃 6 大師輸出） | 1800 |
| Manager | 看完多空後裁決 | 2000 |
| Aggressive | 高倉位邏輯（看 manager 結論） | 1500 |
| Conservative | 低倉位邏輯 | 1500 |
| Neutral | 折衷方案（看完激進+保守後寫） | 1500 |
| PM | 整合全部、輸出最終決策 | 4096 |

每位大師的完整 system prompt 在 `docs/removed/src/lib/agents/`，逐字保留。

### 1.5 復原步驟

```bash
# 1. 把 agents 整套搬回去
mv docs/removed/src/lib/agents src/lib/agents
mv docs/removed/src/components/deep-analysis src/components/deep-analysis
mv docs/removed/src/app/api/deep-analysis src/app/api/deep-analysis
mv docs/removed/src/app/stock/[symbol]/deep-analysis src/app/stock/[symbol]/

# 2. 在 StockDetailView 重新 import DeepAnalysisClient
# 3. 若要持久化報告：將 §6 的 deepAnalysisReports 表搬回
```

---

## 2. 同業比較 + Peer Discovery 四層 fallback

### 2.1 設計理念

四層自動搜尋機制（一層失敗自動退到下一層）：

1. **FMP v4/stock_peers** — 行業精準，付費方案
2. **Finnhub /stock/peers** — 免費，主要 fallback
3. **FMP stock-screener** — 按 sector 篩選，較廣
4. **Curated 對照表** — 35+ 個常見股票硬編碼（DAL→UAL/AAL/LUV/JBLU、NVDA→AMD/INTC 等）

UI 包含：
- 7 個指標對比表（P/E、P/B、P/S、EV/EBITDA、ROE、毛利率、營收成長）
- Recharts Radar Chart 視覺化
- 「綜合最划算」自動排名

### 2.2 原始檔案

```
src/app/api/peers/[symbol]/route.ts      281 行
src/components/stock/PeerComparison.tsx  348 行（含 Radar + 排名）
```

### 2.3 復原步驟

```bash
mv docs/removed/src/app/api/peers src/app/api/peers
mv docs/removed/src/components/stock/PeerComparison.tsx src/components/stock/
# 在 StockDetailView 重新 import 並掛入主欄
# package.json 確認 recharts 還在（MVP 不再需要 Radar 可移除）
```

---

## 3. 綜合評分 ScoreCard

### 3.1 設計理念

五維度量化評分：**獲利 / 成長 / 估值 / 財務健康 / 現金流**

每個維度依**行業基準**加權（避免拿銀行股的 P/E 跟科技股比）。輸出 0-100 分總分 + 五邊形雷達圖。

### 3.2 原始檔案

```
src/lib/scoring.ts                   174 行（行業基準字典 + 加權邏輯）
src/components/stock/ScoreCard.tsx   134 行
```

### 3.3 復原步驟

```bash
mv docs/removed/src/lib/scoring.ts src/lib/scoring.ts
mv docs/removed/src/components/stock/ScoreCard.tsx src/components/stock/
# 重新引用 keyMetrics + ratios + income（需要 §5 的 /api/financials）
```

---

## 4. 公司新聞 NewsPanel

### 4.1 設計理念

Finnhub 公司新聞 API，前 5 條，自動情緒分類（**正面 / 負面 / 中性**）。

### 4.2 原始檔案

```
src/app/api/news/[symbol]/route.ts        132 行
src/components/analysis/NewsPanel.tsx     168 行
src/components/stock/StockNewsList.tsx     83 行（個股頁版本）
src/components/dashboard/NewsRail.tsx      91 行（Dashboard 側欄版本）
```

### 4.3 復原步驟

```bash
mv docs/removed/src/app/api/news src/app/api/news
mv docs/removed/src/components/analysis/NewsPanel.tsx src/components/analysis/
mv docs/removed/src/components/stock/StockNewsList.tsx src/components/stock/
mv docs/removed/src/components/dashboard/NewsRail.tsx src/components/dashboard/
```

---

## 5. 財報深度頁 Financials API

### 5.1 設計理念

三大財報（Income / Balance / CashFlow）+ KeyMetrics + Ratios，五張表並行抓 FMP，配 24h SQLite cache + stale fallback。

### 5.2 原始檔案

```
src/app/api/financials/[symbol]/route.ts  127 行
src/lib/api/context-builders.ts           397 行（將原始 JSON 轉 LLM-friendly 摘要）
```

> 注意：MVP 版的 `/api/analysis` 也需要 financials 餵給 AI；改用 Finnhub `/stock/financials-reported` + `/stock/metric` 直接拼摘要，不再經 context-builders。

### 5.3 復原步驟

```bash
mv docs/removed/src/app/api/financials src/app/api/financials
mv docs/removed/src/lib/api/context-builders.ts src/lib/api/
# 若要恢復 SQLite cache，需先還原 §6 的 financialCache 表
```

---

## 6. 伺服器端持久化 Drizzle + Turso + SQLite

### 6.1 設計理念

開發用 `file:./dev.db`（SQLite），生產用 Turso（LibSQL），共用 Drizzle ORM。

### 6.2 五張表 Schema 摘要

```ts
watchlist            id / symbol / name / sector / addedAt / notes
financial_cache      id / symbol / reportType / period / fiscalYear / data(JSON) / fetchedAt
stock_prices         id / symbol / price / changePercent / marketCap / peRatio / week52High/Low
analysis_reports     id / symbol / content / rating / targetPriceLow/High / modelVersion / promptVersion
deep_analysis_reports id / symbol / finalContent / sections(JSON) / rating / targetPriceLow/High / modelVersion / promptVersion / durationMs
```

完整 schema 保留在 `docs/removed/src/lib/db/schema.ts`。

### 6.3 原始檔案

```
src/lib/db/index.ts        # @libsql/client 連線
src/lib/db/schema.ts       # 五張表定義
drizzle.config.ts          # drizzle-kit 設定
drizzle/                   # migration 檔
dev.db / sqlite.db         # 本機 SQLite 檔
```

### 6.4 MVP 後的替代

- Watchlist + Portfolio：純 localStorage（`portfolio_v1` + 新增 `watchlist_v1` key）
- AI 分析報告：不持久化（每次重跑）
- 財報快取：移除（每次重抓 Finnhub）
- 股票報價快取：移除

### 6.5 復原步驟

```bash
# 1. 還原依賴
npm install drizzle-orm@^0.45.1 drizzle-kit@^0.31.10 @libsql/client@^0.17.2

# 2. 還原檔案
mv docs/removed/src/lib/db src/lib/db
mv docs/removed/drizzle.config.ts ./
mv docs/removed/drizzle ./drizzle

# 3. package.json 加回 scripts
#    "db:generate": "drizzle-kit generate",
#    "db:push": "drizzle-kit push",
#    "db:studio": "drizzle-kit studio"

# 4. 初始化
npx drizzle-kit push

# 5. 把對應 API route 從 localStorage 改回讀 DB
```

---

## 7. FMP API 整套（保留 Finnhub）

### 7.1 為何砍掉

- FMP 免費方案每日 250 次限制，個人用很容易爆
- Finnhub 60/分（≒ 86400/天）足夠 MVP
- 兩套並存 = 兩套錯誤處理 + 兩套型別

### 7.2 原始檔案

```
src/lib/api/fmp.ts   225 行（getQuote / getCompanyProfile / getIncomeStatement / getBalanceSheet / getCashFlow / getKeyMetrics / getRatios / searchSymbol / getPeers / getStockScreener）
```

### 7.3 MVP 改用 Finnhub 的對應表

| 原 FMP 端點 | Finnhub 替代 |
|-------------|------------|
| `/v3/quote/{symbol}` | `/quote?symbol=` |
| `/v3/profile/{symbol}` | `/stock/profile2?symbol=` |
| `/v3/income-statement/{symbol}` | `/stock/financials-reported?symbol=` |
| `/v3/key-metrics-ttm/{symbol}` | `/stock/metric?symbol=&metric=all` |
| `/v3/ratios-ttm/{symbol}` | `/stock/metric?symbol=&metric=all`（同上端點） |
| `/v3/search` | `/search?q=` |
| `/v4/stock_peers` | `/stock/peers?symbol=` |

### 7.4 復原步驟

```bash
mv docs/removed/src/lib/api/fmp.ts src/lib/api/
# 在 .env 加回 FMP_API_KEY
# 在 /api/stocks /api/profile 等加回 FMP fallback 鏈
```

---

## 8. Rate Limit + Basic Auth Proxy

### 8.1 設計理念

Next 16 `proxy.ts`（取代舊 middleware.ts）做兩件事：
- **Rate limit**：一般 API 60/分鐘、深度分析 POST 2/分鐘（in-memory per-IP）
- **Basic Auth**：`SITE_PASSWORD` 環境變數開關

### 8.2 原始檔案

```
src/proxy.ts
```

### 8.3 MVP 拿掉的理由

個人單機用沒人會洗，浪費複雜度。Anthropic API key 已是按量計費 + Anthropic 自己有 rate limit。

### 8.4 復原步驟

```bash
mv docs/removed/src/proxy.ts src/proxy.ts
# 設定 .env 的 SITE_PASSWORD 即可開啟基本驗證
```

---

## 9. SSE Streaming 機制

### 9.1 設計理念

13 代理人並行跑 2-3 分鐘，必須 streaming 才能讓使用者看到進度。

- 後端：`ReadableStream` + `formatSse()` 把 `AgentEvent` 編成 `event: <type>\ndata: <json>\n\n`
- 前端：`src/lib/agents/sse-parser.ts` 解析
- Zeabur / nginx buffer 處理：`Cache-Control: no-cache, no-transform` + `X-Accel-Buffering: no`

### 9.2 MVP 拿掉的理由

單一代理人 1 次呼叫 30 秒內回完，不需要 streaming，loading spinner 就夠。

### 9.3 復原步驟

整套機制與 §1 綁定，連同 agents 一起復原即可。

---

## 10. Dashboard 進階區塊（SectorBreakdown / NewsRail）

### 10.1 SectorBreakdown

依持股 / 追蹤清單統計各 sector 佔比的環形圖。
- `src/components/dashboard/SectorBreakdown.tsx`（92 行）
- 依賴 recharts DonutChart + watchlist sector 欄位

### 10.2 NewsRail

側欄滾動式新聞流，依追蹤清單跑批次 Finnhub news API。
- `src/components/dashboard/NewsRail.tsx`（91 行）
- 依賴 §4 NewsPanel logic

### 10.3 復原步驟

```bash
mv docs/removed/src/components/dashboard/SectorBreakdown.tsx src/components/dashboard/
mv docs/removed/src/components/dashboard/NewsRail.tsx src/components/dashboard/
# 在 Dashboard.tsx aside 區加回 <SectorBreakdown /> <NewsRail />
```

---

## 11. 深度分析全螢幕模式

獨立路由 `/stock/[symbol]/deep-analysis`，讓深度分析跑全螢幕（沒有右側欄干擾）。

```
src/app/stock/[symbol]/deep-analysis/
├── page.tsx              # 路由
└── DeepAnalysisClient.tsx  # SSE 連線 + AgentCard 渲染主邏輯
```

復原連同 §1 一併處理。

---

## 12. 復原流程通用範本

任何模組要救回來都走這四步：

```bash
# 1. 把檔案搬回原位
mv docs/removed/<path> <original-path>

# 2. 還原依賴（如有）
npm install <package>@<version>

# 3. 重新接上 import
#    （搜尋 docs/REMOVED_FEATURES.md 對應模組的「復原步驟」段落）

# 4. 跑一次 build 驗證
npm run build
```

若要找原始 commit：

```bash
git show 3c2976c:src/lib/agents/orchestrator.ts > /tmp/orchestrator.ts
git log --all --oneline -- src/lib/agents/
```

---

## 13. 移除清單（總計）

| 類別 | 檔案數 | 行數 |
|------|--------|------|
| `src/lib/agents/` | 19 | ~1170 |
| `src/lib/db/` + drizzle 設定 | 3+ | ~150 |
| `src/lib/scoring.ts` | 1 | 174 |
| `src/lib/api/fmp.ts` + `context-builders.ts` | 2 | 622 |
| API routes（peers / news / financials / deep-analysis） | 4 | ~723 |
| 個股頁元件（PeerComparison / ScoreCard / StockNewsList / QuoteSheet*） | 4 | ~627 |
| 深度分析元件 | 2 | 283 |
| Dashboard 進階區塊 | 2 | 183 |
| Proxy | 1 | ? |
| **總計** | **38+** | **~4000 行** |

> `*` QuoteSheet 預留，視 MVP 是否需要側欄報價詳情決定

---

## 14. 復活優先順序建議

如果之後想分階段把功能加回來，建議順序：

1. **基本財報數字** — Finnhub `/stock/metric` 已內建，不需要 §5 全套
2. **公司新聞**（§4）— 最小成本恢復閱讀體驗
3. **同業比較**（§2）— 提升個股研究深度
4. **綜合評分**（§3）— 配合同業比較才有對比基準
5. **多代理人深度分析**（§1）— 大塊複雜度，要回來再評估
6. **Drizzle + Turso**（§6）— 只在需要跨裝置同步時才回來

每一步都可獨立完成、獨立驗收，不需要一次全砍/全救。
