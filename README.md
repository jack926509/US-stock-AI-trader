# 美股策略研究專案

以 `jack926509/US-stock-AI-trader` 作為唯一整合主專案，集中管理市場報告、個股研究、網頁看板及交易策略架構，供後續開發美股資訊與策略工具。

**目前階段：已在 market-dashboard 完成第一版共用資料層、市場總覽、個股研究與確定性策略掃描。AI、Bot 通知、排程與下單均未啟用。**

## 專案位置

| 子目錄 | 原始專案 | 保留內容 |
|---|---|---|
| [projects/trading-platform](projects/trading-platform) | US-stock-AI-trader | Node API、Python 引擎、交易看板、Pine Script、資料庫結構；部分功能仍是待實作框架 |
| [projects/market-report](projects/market-report) | stock-report-bot | 市場資料、產業與市場廣度、日報／快訊，以及既有 Bot 程式 |
| [projects/stock-research](projects/stock-research) | stock-analysis-telegram-bot | 個股資料擷取、量化訊號、財報研究、既有 Slack 程式 |
| [projects/market-dashboard](projects/market-dashboard) | us-stock-analyzer | Next.js 市場與自選股看板、個股頁與相關 API |

原始專案名稱可能與現行程式不同，例如 `stock-analysis-telegram-bot` 已包含 Slack 實作。子目錄中的舊 README、部署設定及計畫保留作為來源紀錄，**目前整合階段以本 README 為準**。

## 使用整合入口

需要 Node.js 20 以上。先安裝主介面的依賴，再由根目錄啟動；根啟動器只綁定 `127.0.0.1`，並用每次啟動產生的本機 marker 開啟自選股 API。這個 marker 是本機執行護欄，不是公開網站的登入或授權機制。

```bash
git clone https://github.com/jack926509/US-stock-AI-trader.git
cd US-stock-AI-trader
npm --prefix projects/market-dashboard ci
npm run dev
```

- `npm run dev`：在 `127.0.0.1:3000` 啟動 Next.js 開發服務。
- `npm run build && npm start`：建置後以同樣的本機限定模式啟動。
- 自選股預設寫入 `projects/market-dashboard/.local-data/watchlist.json`；可在設定頁匯入／匯出，舊版瀏覽器 `watchlist_v1` 只會在伺服器清單為空且讀取成功時遷移一次。
- `npm run verify`：保留原 344 檔來源 baseline SHA，並另外核對 `config/source-changes.json` 明列的修改與新增；沒有覆寫來源 SHA。
- `npm test`：執行看板測試後再核對來源與修改追蹤。
- GitHub Actions 在看板子目錄執行 `npm ci`、fixture 測試與建置，再檢查來源追蹤及功能證據；不啟動應用程式，也不直接呼叫行情或 AI API。

## 這次整合的範圍

四個來源版本的 344 個檔案完整移入對應目錄，保留原始內容、依賴清單、鎖定檔、授權檔與歷史文件。來源 commit 和逐檔雜湊記錄在 [config/source-manifest.json](config/source-manifest.json)。主專案原有 Git 歷史保留；其他三個專案以固定版本快照匯入，沒有匯入其完整 Git 歷史。

各子專案保留獨立套件環境，避免不同 Next.js、Node.js 與 Python 依賴互相影響。根目錄不使用遞迴 workspace 啟動，不會自動啟動 Bot 或讀取其金鑰。

**AI 與通知程式仍保留在來源目錄。** 整合看板的 `/api/analysis/[symbol]` 不讀模型金鑰且固定回應 HTTP 410；根入口不會啟動通知、排程或下單。若日後直接執行其他子目錄中的舊入口，仍可能呼叫 AI、啟動排程或發送通知；那些入口不屬於本機看板。

本次沒有部署新服務、修改既有雲端服務設定、停用其他儲存庫的服務或刪除來源儲存庫。既有外部部署如果仍指向其他專案，會繼續依其原設定運作。

## 可用功能與資料條件

| 功能 | 無 API 金鑰 | 設定 `FINNHUB_API_KEY` |
|---|---|---|
| 自選股 | 本機私有 JSON、原子寫入、舊 localStorage 首次遷移 | 相同 |
| 大盤、產業、廣度、異常量 | Yahoo Finance Chart 已收盤日線，明標來源與日期 | 相同；不宣稱即時 |
| 個股圖表與 OHLCV 策略 | 公開日線；過期、缺量或未收盤時停用相關策略 | 相同 |
| 即時報價、公司資料、估值、同業、新聞、財報與下次財報日期 | 顯示資料無法取得，不產生假值 | Finnhub 回傳成功時顯示 |
| AI、通知、券商下單 | 停用；AI API 固定回 410 | 仍停用 |

公開 Yahoo Chart 端點沒有服務保證，可能失敗或延遲；它只作為已收盤日線 fallback，不能描述為即時行情。目前沒有可用的 Finnhub 金鑰，執行環境也未允許完成外網 live 驗證。現有自動測試使用固定 fixture。連線失敗時 UI 顯示缺資料，不以 mock 或隨機走勢替代。此版本只供單使用者本機執行，沒有公開部署所需的帳號驗證，也尚未部署。

## 後續開發順序

1. 在允許外網的環境驗收 Yahoo fallback 與 Finnhub 各端點，記錄限流、錯誤與延遲行為。
2. 將交易日／提早收盤規則改接持續維護的行事曆，再補策略歷史回測。
3. 若要公開部署，先加入帳號驗證、多使用者資料隔離、CSRF 防護與持久 volume 備份。
4. 另外確認通知與交易授權後，才評估 Telegram、LINE 或券商整合。

目前提供四組可重現規則的掃描結果，不宣稱已有即時資料網站、回測績效或自動交易功能。規則、缺值阻擋與 API 契約詳見 [本機看板實作說明](docs/LOCAL-DASHBOARD-IMPLEMENTATION.md)。

## 功能完整性與原儲存庫處理

已依實際程式建立機器可讀的 [功能對照](config/features.json)，涵蓋本機看板實作、三個來源專案與原交易專案；AI、通知、歷史存檔及原本未實作的功能分別標示。`npm run features` 可查看功能狀態並驗證證據檔案已納入 baseline 或變更追蹤；`npm run verify` 則驗證所有來源檔案內容。

2026-09-08 重新比對，三個來源 `main` 與已匯入快照一致，12 個非 main 分支皆落後於各自 main，沒有額外未合入提交。來源現行功能的程式碼沒有漏搬，但這不等於全部服務已連接並通過正式環境驗收。

**原儲存庫暫不刪除，建議先完成外部部署及資料備份確認，再封存。** 目前主專案沒有包含三個來源的完整 Git 歷史、平台設定與執行資料。詳見 [刪除／封存評估](docs/REPOSITORY-RETIREMENT.md)。

目錄搬移、既有部署影響與後續維護方式詳見 [docs/CONSOLIDATION.md](docs/CONSOLIDATION.md)。
