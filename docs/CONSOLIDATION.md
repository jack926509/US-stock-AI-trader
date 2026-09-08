# 原始碼整併紀錄

## 決策

依使用者要求，本階段只將四個專案集中到 `US-stock-AI-trader`，不使用 OpenAI 分析、不開發或啟動通知。不同服務仍保留獨立依賴與執行環境，避免把尚未完成的資料串接誤認為已上線功能。

## 目錄搬移

| 原來源根目錄 | 新目錄 |
|---|---|
| US-stock-AI-trader | projects/trading-platform |
| stock-report-bot | projects/market-report |
| stock-analysis-telegram-bot | projects/stock-research |
| us-stock-analyzer | projects/market-dashboard |

來源 commit、所有檔案的 Git blob SHA 與 Git mode 記錄於 `config/source-manifest.json`。每個來源檔案保持位元組相同，包括圖片、鎖定檔及既有授權文字。原始碼中的相對路徑仍以各子專案根目錄為基準。

## 停用自動啟動

原主專案根目錄的遞迴 pnpm 指令與 Zeabur 設定移到 `projects/trading-platform`，不再作為整合入口。新根目錄的 start/dev 僅輸出狀態。子專案 `.github/workflows` 移入子目錄後不會被此儲存庫的 GitHub Actions 自動執行。新根目錄 CI 只驗證來源完整性。

沒有設定任何金鑰，也沒有實際啟動或測試舊 Bot／AI／交易服務。這是避免在原始碼整併階段產生執行副作用；並不代表舊程式的功能已被重寫為停用狀態。

## 部署與原專案

本次是儲存庫整併，不是部署遷移。舊部署設定僅保留作為參考，沒有將新根目錄部署成網站或服務。

如果既有主專案的外部 CI／雲端服務固定讀取原本的 `apps/`、pnpm workspace 或根目錄部署設定，這些路徑已搬到 `projects/trading-platform/`。若外部平台自動跟隨 main，可能觸發建置並因路徑變更而失敗；新的根目錄也不再啟動原 API。重新啟用任何服務前需另行確認根目錄、工作目錄、建置／啟動指令及環境變數。本次未操作這些外部設定。

其他三個原始儲存庫及其部署保持原樣；未刪除、封存或寫入通知。確認後續功能遷移與備份完整後，再決定如何處理。

## 後續維護

目前完整性檢查要求來源快照完全一致。開始修改子專案前，應在下一個功能 PR 將該子專案從「來源快照」轉為「維護中模組」，調整驗證規則並補上有意義的功能測試。不要只更新雜湊來掩蓋意外漏檔或內容變更。

之後需要重新設計的是共用自選股、行情／新聞 schema、資料時間及缺值規則，以及 API 邊界；目前沒有新增空殼共用模組或讓不同 Bot 自動互相呼叫。
