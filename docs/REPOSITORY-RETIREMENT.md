# 三個來源儲存庫是否可以刪除

核對日期：2026-09-08。

## 結論

就目前 main 的原始碼而言，三個來源都已完整匯入主專案，可將日後開發集中在 US-stock-AI-trader，不需要繼續維護三份程式。然而，目前尚未確認外部部署與資料已遷移，也沒有保存三個來源完整 Git 歷史，因此不建議立即刪除。較適合先保留原庫，確認服務依賴後再封存。

本次沒有刪除、封存來源儲存庫或更改其部署設定。

## 已完成的核對

| 原始儲存庫 | 主專案位置 | main 檔案 | 非 main 分支 | 額外未合入提交 |
|---|---|---:|---:|---:|
| stock-report-bot | projects/market-report | 12 | 7 | 0 |
| stock-analysis-telegram-bot | projects/stock-research | 88 | 5 | 0 |
| us-stock-analyzer | projects/market-dashboard | 161 | 0 | 0 |

- 來源 main 自匯入後未變動，三個匯入目錄的 Git tree SHA 與各自來源一致。
- 12 個非 main 分支均是 main 的祖先，沒有額外未合入提交。這不代表較早版本曾有、後來被移除的功能都存在於最新 main。
- 三個儲存庫皆沒有開啟中的 Issue／PR，也沒有 Release。此核對不包含已關閉的歷史討論內容。
- 授權檔、套件清單、鎖定檔、部署設定範本與既有歷史存檔目錄均已保留在各子目錄。
- 原始碼搜尋未發現執行程式需要從這三個 GitHub 儲存庫下載自己的程式；但此項搜尋不能代替外部雲端平台設定檢查。

詳細分支與來源 commit 記錄在 [核對紀錄](audits/2026-09-08-repository-audit.json)。

## 尚未包含在主專案內的項目

1. 三個來源的完整 Git 歷史、標籤，以及沒有留在最新 main 的舊版內容。
2. 歷史 Issue／PR、Wiki 或其他儲存庫附屬資料。
3. GitHub Secrets、Webhook、外部部署平台連線及環境變數。
4. Postgres 資料、Bot 自選股、已產出報告與快取，以及瀏覽器 localStorage。

目前連接器未提供本次嘗試的 tags／deployments 查詢端點，因此這兩項標記為未確認，不能當成不存在。未讀取或搬移任何金鑰。

## 建議處理順序

先確認既有服務是否仍連接舊庫，並備份需要保留的資料與歷史；如果目的只是停止維護分散的程式，完成依賴確認後封存即可。GitHub 封存會將原始碼、提交、分支與討論等改成唯讀，也可以解除封存。[GitHub 封存說明](https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories)

若仍決定刪除，應先另做包含歷史的 mirror 備份；GitHub 官方的備份方式可包含完整 Git 修訂歷史，Wiki 與其他附屬資料則需依其方式另外處理。本次匯入的 main 快照不是 mirror 備份。[GitHub 備份說明](https://docs.github.com/en/repositories/archiving-a-github-repository/backing-up-a-repository)

使用者這次詢問是否可以刪除，並未要求執行刪除；此次工作只核對、補齊功能目錄與記錄，不操作原庫的刪除或封存。
