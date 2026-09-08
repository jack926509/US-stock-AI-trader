# 本機看板實作說明

## 執行邊界

根目錄的 `npm run dev` 與 `npm start` 透過 `scripts/run-dashboard.mjs` 啟動 `projects/market-dashboard`，固定監聽 `127.0.0.1`，並為該次程序產生 `LOCAL_WATCHLIST_SESSION` marker。自選股 API 同時檢查 marker、URL host、`Host` header，以及寫入請求的 `Origin`。這些檢查只適用於本機單使用者模式，不能取代公開部署所需的登入、權限與 CSRF 設計。

此版本沒有部署。根入口不會啟動保留在其他子專案的 Bot、排程、AI 或交易服務。`POST /api/analysis/[symbol]` 固定回應 HTTP 410 與 `FEATURE_DISABLED`，即使環境誤設模型金鑰也不會由此路由發出模型請求。沒有通知與券商下單流程。

## 四組本機功能

### 共用行情與持久自選股

`src/lib/data-service.ts` 是看板報價的共用入口。有 `FINNHUB_API_KEY` 時先要求 Finnhub 報價；未設定金鑰或沒有可用報價時，退回 `src/lib/market-data.ts` 的 Yahoo Finance Chart 已收盤日線。Yahoo 回傳的報價由最近兩根完整日 K 推導，metadata 包含 `source`、`asOf`、`freshness`、`status` 與訊息，不宣稱即時。

自選股由 `/api/watchlist` 讀寫伺服器端 JSON，預設路徑是 `projects/market-dashboard/.local-data/watchlist.json`。寫入採同目錄暫存檔後 rename，檔案權限為 `0600`；清單最多 200 檔，request／檔案上限 128 KiB。GET、整份 PUT，以及 add、remove、migrate POST 都回傳正規化後的完整清單。

舊版瀏覽器 `localStorage.watchlist_v1` 只會在伺服器 GET 成功且清單為空時送出 migrate。伺服器以單一序列化寫入佇列完成「空清單才匯入」，成功後前端才刪除舊值。設定頁另提供 JSON 備份匯出與匯入。

### 市場總覽

`GET /api/overview` 只使用 Yahoo 已收盤日線，內容包括 SPY、QQQ、DIA，11 檔產業 ETF，固定 20 檔跨產業大型股的上漲／下跌／平盤樣本，以及最新量相對前 20 日均量至少 1.5 倍的異常量清單。只有更新到預期最近完成交易日的資料才列入；回應同時揭露可用數、總樣本數、缺漏數、來源及資料日期。

這是固定樣本的市場摘要，不是完整美股市場廣度，也不是盤中即時排行榜。

### 個股研究

`/stock/[symbol]` 顯示共用行情、圖表及規則策略卡。公司簡介、估值／財務指標、同業、公司新聞及下次財報日期由 Finnhub API 提供。未設定 `FINNHUB_API_KEY`、供應商回應失敗或資料缺漏時，介面顯示無法取得，不生成替代基本面、新聞或財報資料。Yahoo fallback 只補已收盤 OHLCV 行情，不補這些 Finnhub 資料。

### 無 AI 策略掃描

`GET /api/strategies?symbols=...` 使用 Yahoo 已收盤日線，最多掃描 200 個合法且去重的代號。每個結果都有 `hit`、`miss` 或 `unavailable`、判斷理由、數值證據、來源與日期：

| 規則 | 判斷條件 |
|---|---|
| 50 日均線突破 | 前一日收盤在前一日 SMA50 以下，最新收盤穿越最新 SMA50 |
| 20 日價量突破 | 最新收盤高於前 20 日最高價，且最新量至少為前 20 日均量 1.5 倍 |
| 多頭回檔 | SMA20 高於 SMA50，盤中回測 SMA20 後收回，收盤距 SMA20 不超過 3% |
| 相對強勢 | 個股近 63 個共同交易日報酬領先 SPY 至少 5 個百分點 |

少於 65 根日線、日期重複或亂序、OHLC 無效、資料過期或未收盤時，相關結果為 `unavailable`。量價規則在成交量缺漏時停用；相對強勢另要求 SPY 與個股最新日期一致且至少有 64 個對齊觀測值。規則結果是研究篩選訊號，不是回測績效、投資建議或下單指令。

最近完成交易日的週末、假日與提早收盤判斷目前明列 2026 年規則。跨年度正式使用前需更新或改接持續維護的交易所行事曆。

## 資料與驗證限制

目前環境沒有可用的 Finnhub／FMP 金鑰，且尚未允許完成 Yahoo 或 Finnhub 的 live 外網驗證。Yahoo Chart 是未提供服務保證的公開端點，可能拒絕、延遲或變更；失敗時回傳 unavailable，不用隨機或 mock 資料冒充行情。

截至 2026-09-08 的凍結版本已完成 9 個測試檔、共 46 個 fixture 單元測試、TypeScript 檢查及 Next.js production build。這些結果驗證本地計算與建置，不代表外部資料供應商已通過 live 驗收。CI 執行 dashboard 的 `npm ci`、test、build，再執行來源及功能追蹤檢查；CI 不啟動 app 或直接呼叫任何 API。

## 來源追蹤

`config/source-manifest.json` 是四個來源、共 344 檔的 immutable baseline，原 Git blob SHA 保持不變。`config/source-changes.json` 另外列出本次每個 modification 的 baseline/current SHA，以及每個 addition 的 current SHA。未列出的內容修改、新增、刪除、過期項目與 symlink 都會讓驗證失敗；依賴、建置輸出、coverage、TypeScript build info 與本機自選股資料不納入來源新增。

實作凍結後，在根目錄執行：

```bash
node scripts/update-source-tracking.mjs          # 只預覽，不寫檔
node scripts/update-source-tracking.mjs --write  # 寫入明列的最終雜湊
node scripts/verify-sources.mjs
node scripts/features.mjs
```

若之後再修改 `projects/`，必須重新檢視 dry run，確認只有預期檔案後再使用 `--write`。更新器遇到 baseline 檔案遺失時會拒絕寫入，且不會改寫 `source-manifest.json`。
