# 功能保留與整合狀態

核對日期：2026-09-08。依據來源目前 main 的實際程式，沒有僅依舊 README 判定功能。

## 核對結論

三個來源專案共 261 個檔案（12 + 88 + 161），以及原交易專案 83 個檔案，共 344 個來源檔案全部保留。GitHub 遠端已匯入的三個目錄與來源 Git tree SHA 完全一致；來源 main 自匯入後未變動。

這項驗證確保沒有因本次搬移遺漏既有程式、鎖定檔、圖片或授權檔；不是行情供應商連線、部署、資料庫遷移或 UI 操作驗收。根目錄目前不啟動任何子服務。

## 功能對照

| 功能 | 模組 | 目前狀態 | 實作位置 |
|---|---|---|---|
| 市場行情與產業股票池 | market-report | 實作已保留，尚未從整合入口啟動 | [market-report/index.js](../projects/market-report/index.js) |
| 市場廣度、產業排行、SMA／RSI／布林通道 | market-report | 實作已保留，尚未從整合入口啟動 | [market-report/index.js](../projects/market-report/index.js) |
| 市場日報、新聞快訊與交易日快照 | market-report | 程式已保留，AI／通知相關流程暫不啟用 | [market-report/index.js](../projects/market-report/index.js)、[agents/perplexity.js](../projects/market-report/agents/perplexity.js) |
| 基本面、Buffett、Graham 規則 | market-report | 實作已保留，尚未從整合入口啟動 | [agents/fundamentals.js](../projects/market-report/agents/fundamentals.js)、[agents/buffett.js](../projects/market-report/agents/buffett.js)、[agents/graham.js](../projects/market-report/agents/graham.js)、[agents/fmp.js](../projects/market-report/agents/fmp.js) |
| 報價、基本面、歷史價格與技術資料擷取 | stock-research | 實作已保留，尚未從整合入口啟動 | [fetchers/finnhub_fetcher.py](../projects/stock-research/fetchers/finnhub_fetcher.py)、[fetchers/fmp_fetcher.py](../projects/stock-research/fetchers/fmp_fetcher.py)、[fetchers/stooq_fetcher.py](../projects/stock-research/fetchers/stooq_fetcher.py)、[fetchers/tradingview_fetcher.py](../projects/stock-research/fetchers/tradingview_fetcher.py) |
| 同業、分析師、內部人、EPS、總經與新聞 | stock-research | 實作已保留，尚未從整合入口啟動 | [fetchers/peer_fetcher.py](../projects/stock-research/fetchers/peer_fetcher.py)、[fetchers/analyst_fetcher.py](../projects/stock-research/fetchers/analyst_fetcher.py)、[fetchers/insider_fetcher.py](../projects/stock-research/fetchers/insider_fetcher.py)、[fetchers/earnings_surprise_fetcher.py](../projects/stock-research/fetchers/earnings_surprise_fetcher.py)、[fetchers/macro_fetcher.py](../projects/stock-research/fetchers/macro_fetcher.py)、[fetchers/tavily_fetcher.py](../projects/stock-research/fetchers/tavily_fetcher.py) |
| 12 維量化訊號與歷史／相對強弱 | stock-research | 實作已保留，尚未從整合入口啟動 | [utils/signals.py](../projects/stock-research/utils/signals.py)、[fetchers/history_fetcher.py](../projects/stock-research/fetchers/history_fetcher.py) |
| SEC 10-K／10-Q 擷取與財報分析管線 | stock-research | 程式已保留，AI／通知相關流程暫不啟用 | [tenk/data_fetcher.py](../projects/stock-research/tenk/data_fetcher.py)、[tenk/pipeline.py](../projects/stock-research/tenk/pipeline.py)、[tenk/orchestrator.py](../projects/stock-research/tenk/orchestrator.py)、[tenk/report_writer.py](../projects/stock-research/tenk/report_writer.py)、[tenk/LICENSE](../projects/stock-research/tenk/LICENSE) |
| 個股 AI 報告與日報寫作 | stock-research | 程式已保留，AI／通知相關流程暫不啟用 | [analyzer/llm_analyzer.py](../projects/stock-research/analyzer/llm_analyzer.py)、[app/pipeline.py](../projects/stock-research/app/pipeline.py)、[ai/writer.py](../projects/stock-research/app/ai/writer.py) |
| 自選股、查詢紀錄、財報快取與配額 | stock-research | 實作已保留，尚未從整合入口啟動 | [utils/database.py](../projects/stock-research/utils/database.py)、[utils/cache.py](../projects/stock-research/utils/cache.py)、[utils/rate_limiter.py](../projects/stock-research/utils/rate_limiter.py) |
| K 線圖與報告格式 | stock-research | 實作已保留，尚未從整合入口啟動 | [utils/chart.py](../projects/stock-research/utils/chart.py)、[utils/formatter.py](../projects/stock-research/utils/formatter.py) |
| 市場與自選股看板、個股頁 | market-dashboard | 實作已保留，尚未從整合入口啟動 | [app/page.tsx](../projects/market-dashboard/src/app/page.tsx)、[[symbol]/page.tsx](../projects/market-dashboard/src/app/stock/[symbol]/page.tsx)、[dashboard/Dashboard.tsx](../projects/market-dashboard/src/components/dashboard/Dashboard.tsx)、[stock/StockDetailView.tsx](../projects/market-dashboard/src/components/stock/StockDetailView.tsx) |
| 行情搜尋、財務、同業與新聞 API | market-dashboard | 實作已保留，尚未從整合入口啟動 | [api/finnhub.ts](../projects/market-dashboard/src/lib/api/finnhub.ts)、[stocks/route.ts](../projects/market-dashboard/src/app/api/stocks/route.ts)、[search/route.ts](../projects/market-dashboard/src/app/api/stocks/search/route.ts)、[[symbol]/route.ts](../projects/market-dashboard/src/app/api/financials/[symbol]/route.ts)、[[symbol]/route.ts](../projects/market-dashboard/src/app/api/peers/[symbol]/route.ts)、[[symbol]/route.ts](../projects/market-dashboard/src/app/api/news/[symbol]/route.ts) |
| 每日簡報、異動榜與圖表 | market-dashboard | 實作已保留，尚未從整合入口啟動 | [briefing/BriefingView.tsx](../projects/market-dashboard/src/components/briefing/BriefingView.tsx)、[movers/MoversView.tsx](../projects/market-dashboard/src/components/movers/MoversView.tsx)、[charts/TradingViewWidget.tsx](../projects/market-dashboard/src/components/charts/TradingViewWidget.tsx) |
| 瀏覽器自選股、分析紀錄及備份匯入／匯出 | market-dashboard | 實作已保留，尚未從整合入口啟動 | [lib/watchlist.ts](../projects/market-dashboard/src/lib/watchlist.ts)、[lib/analysisHistory.ts](../projects/market-dashboard/src/lib/analysisHistory.ts)、[settings/SettingsView.tsx](../projects/market-dashboard/src/components/settings/SettingsView.tsx) |
| 個股 AI 分析及串流 | market-dashboard | 程式已保留，AI／通知相關流程暫不啟用 | [lib/analysis.ts](../projects/market-dashboard/src/lib/analysis.ts)、[[symbol]/route.ts](../projects/market-dashboard/src/app/api/analysis/[symbol]/route.ts) |
| 既有 Slack／Telegram 通知程式 | multiple | 程式已保留，AI／通知相關流程暫不啟用 | [market-report/index.js](../projects/market-report/index.js)、[bot/slack_bot.py](../projects/stock-research/bot/slack_bot.py)、[lib/telegram.ts](../projects/trading-platform/apps/api/src/lib/telegram.ts) |
| 舊版多觀點分析、資料庫及頁面存檔 | market-dashboard | 原來源已移除的歷史存檔，非現行功能 | [docs/REMOVED_FEATURES.md](../projects/market-dashboard/docs/REMOVED_FEATURES.md)、[agents/orchestrator.ts](../projects/market-dashboard/docs/removed/src/lib/agents/orchestrator.ts) |
| Pine Script 訊號與交易資料結構 | trading-platform | 實作已保留，尚未從整合入口啟動 | [pinescript/smc_signal.pine](../projects/trading-platform/packages/shared/pinescript/smc_signal.pine)、[src/types.ts](../projects/trading-platform/packages/shared/src/types.ts)、[prisma/schema.prisma](../projects/trading-platform/apps/api/prisma/schema.prisma) |
| 策略合流、風控、下單、Python 引擎與回測 API | trading-platform | 原來源待實作框架，不能算已完成 | [services/signalMerger.ts](../projects/trading-platform/apps/api/src/services/signalMerger.ts)、[services/riskEngine.ts](../projects/trading-platform/apps/api/src/services/riskEngine.ts)、[services/orderDispatcher.ts](../projects/trading-platform/apps/api/src/services/orderDispatcher.ts)、[src/scheduler.py](../projects/trading-platform/apps/engine/src/scheduler.py)、[routes/api.ts](../projects/trading-platform/apps/api/src/routes/api.ts) |

## 核對時發現的既有限制

- **交易平台仍有待實作框架。** `signalMerger`、`riskEngine`、`orderDispatcher` 等服務只有註解；Python 排程仍是 placeholder；回測 API 回傳零值。不能將它們描述為可用的策略合流、風控、下單或實際回測功能。這些狀態在整併前就存在。
- **市場日報的入口與 AI／Slack 綁定。** `market-report/index.js` 有市場廣度及技術指標等確定性計算，但直接執行舊入口會要求 OpenAI／Slack 環境變數並啟動服務。若日後需要不含 AI／通知的行情服務，必須先抽離資料及計算模組。本次未執行舊入口。
- **通知現況以實際程式為準。** `market-report` 與 `stock-research` 目前入口均為 Slack；較早 README 的 Telegram／Discord 說明不能當作現行可用功能。交易平台另有 Telegram 傳送函式。LINE 尚未實作，本次也不新增通知。
- **AI 與財報分析按需求暫不啟用。** 保留 SEC 擷取及 10-K／10-Q 管線、個股 AI 報告、日報寫作程式；目前未驗證模型金鑰、供應商介面或整條報告流程。
- **看板的歷史移除功能有另外存檔。** `docs/removed` 中的多觀點分析、舊資料庫及舊 UI 都已保留，但不能算成現行路由已啟用。沒有在本次恢復或改寫它們。
- **自選股資料尚未統一。** 看板使用瀏覽器 localStorage，研究 Bot 使用 Postgres，日報另有執行狀態檔。程式碼匯入不會自動搬移這些實際資料。

## 後續開發的驗收邊界

目前可確認的是「來源功能程式完整收錄」。日後若要確認「功能可從同一個產品使用」，還需要共用自選股及資料格式、抽離無 AI 的資料服務、整理單一看板入口，並針對實際行情、錯誤處理及資料遷移進行驗收。依本階段需求，沒有提前開發分析或啟用通知。

`npm run features` 顯示本表的機器可讀清單並確認對應來源存在；完整檔案內容由 `npm run verify` 核對。清單位於 [config/features.json](../config/features.json)。

