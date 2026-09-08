# 美股策略研究專案

以 `jack926509/US-stock-AI-trader` 作為唯一整合主專案，集中管理市場報告、個股研究、網頁看板及交易策略架構，供後續開發美股資訊與策略工具。

**目前階段：四個專案的原始碼整併。尚未完成共用資料層或服務串接。這次不啟用 AI 分析、Bot 通知、排程或下單。**

## 專案位置

| 子目錄 | 原始專案 | 保留內容 |
|---|---|---|
| [projects/trading-platform](projects/trading-platform) | US-stock-AI-trader | Node API、Python 引擎、交易看板、Pine Script、資料庫結構；部分功能仍是待實作框架 |
| [projects/market-report](projects/market-report) | stock-report-bot | 市場資料、產業與市場廣度、日報／快訊，以及既有 Bot 程式 |
| [projects/stock-research](projects/stock-research) | stock-analysis-telegram-bot | 個股資料擷取、量化訊號、財報研究、既有 Slack 程式 |
| [projects/market-dashboard](projects/market-dashboard) | us-stock-analyzer | Next.js 市場與自選股看板、個股頁與相關 API |

原始專案名稱可能與現行程式不同，例如 `stock-analysis-telegram-bot` 已包含 Slack 實作。子目錄中的舊 README、部署設定及計畫保留作為來源紀錄，**目前整合階段以本 README 為準**。

## 使用整合入口

需要 Node.js 20 以上；根目錄無外部依賴，不需要 API 金鑰，也不需要先執行套件安裝。

```bash
git clone https://github.com/jack926509/US-stock-AI-trader.git
cd US-stock-AI-trader
npm run status
npm run verify
```

- `npm start`、`npm run dev`、`npm run status`：只顯示專案目錄與目前狀態，接著結束，不啟動任何子服務。
- `npm run verify`、`npm test`：逐檔核對 Git blob SHA，檢查四個來源快照是否完整。
- GitHub Actions 只執行完整性檢查，不安裝 AI SDK、不呼叫外部行情／AI 服務、不發送通知。

## 這次整合的範圍

四個來源版本的 344 個檔案完整移入對應目錄，保留原始內容、依賴清單、鎖定檔、授權檔與歷史文件。來源 commit 和逐檔雜湊記錄在 [config/source-manifest.json](config/source-manifest.json)。主專案原有 Git 歷史保留；其他三個專案以固定版本快照匯入，沒有匯入其完整 Git 歷史。

各子專案保留獨立套件環境，避免不同 Next.js、Node.js 與 Python 依賴互相影響。根目錄不使用遞迴 workspace 啟動，不會自動啟動 Bot 或讀取其金鑰。

**AI 與通知程式仍保留在來源目錄，尚未移除，也未加上跨專案的停用開關。** 如果日後直接執行子目錄中的舊啟動指令，仍可能呼叫 AI、啟動排程或發送通知；這不是本階段的使用入口。來源清單中的布林值只描述整合階段，不是舊程式的功能開關。

本次沒有部署新服務、修改既有雲端服務設定、停用其他儲存庫的服務或刪除來源儲存庫。既有外部部署如果仍指向其他專案，會繼續依其原設定運作。

## 後續開發順序

1. 整理共用資料格式、自選股及資料來源，統一時間戳記、缺值與快取處理。
2. 連接市場看板與共用資料，整理市場概況及個股研究入口。
3. 加入可驗證的策略規則與回測，再評估 AI 分析需求。
4. 確認通知需求後，再接 Telegram、LINE 或其他平台。

目前不宣稱已有可用的整合策略引擎、即時資料網站、回測績效或自動交易功能。

## 功能完整性與原儲存庫處理

已依實際程式建立 [20 組功能對照](docs/FEATURE-COVERAGE.md)，涵蓋三個來源專案與原交易專案；AI、通知、歷史存檔及原本未實作的功能分別標示。`npm run features` 可查看功能保留狀態並驗證對應檔案存在；`npm run verify` 則驗證所有來源檔案內容。

2026-09-08 重新比對，三個來源 `main` 與已匯入快照一致，12 個非 main 分支皆落後於各自 main，沒有額外未合入提交。來源現行功能的程式碼沒有漏搬，但這不等於全部服務已連接並通過正式環境驗收。

**原儲存庫暫不刪除，建議先完成外部部署及資料備份確認，再封存。** 目前主專案沒有包含三個來源的完整 Git 歷史、平台設定與執行資料。詳見 [刪除／封存評估](docs/REPOSITORY-RETIREMENT.md)。

目錄搬移、既有部署影響與後續維護方式詳見 [docs/CONSOLIDATION.md](docs/CONSOLIDATION.md)。
