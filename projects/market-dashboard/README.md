# US Stock Analyzer (MVP)

美股個人投資輔助工具 — Dashboard 監控持股與追蹤清單，個股頁深入研究單一標的，按需呼叫 AI 全能型分析師給出評級與目標價。

採用 Claude Design 配色（米色 + 珊瑚橘 + Serif 標題）。

> **這是 MVP 簡化版**。原 13 AI 代理人、同業比較、綜合評分、財報深度頁、伺服器端 DB 等模組已歸檔到 `docs/removed/`，附 `docs/REMOVED_FEATURES.md` 復原指南。

---

## 功能概覽

| 模組 | 說明 |
|------|------|
| Dashboard | 三大指數 / 我的持股 / 追蹤清單 / 大盤滾動條（TickerBar），60 秒自動刷新 |
| 我的持股 | localStorage 持倉追蹤（代號 / 股數 / 平均成本），每分鐘更新現價與未實現損益 |
| 追蹤清單 | localStorage 持久化，新增/移除股票，按產業分類，依漲幅排序 |
| 個股頁 | 公司資訊 / 即時報價 / TradingView K 線 / 全能型 AI 分析 |
| AI 分析 | 一次 Claude Sonnet 4.6 呼叫，輸出評級 / 目標價區間 / 多空對比 / catalysts / risks / 倉位建議 / 失效信號 |

---

## 系統架構

```
┌──────────────────────────────────────────────┐
│        前端 (Next.js 16 + React 19)           │
│                                              │
│  Dashboard      │  個股頁                    │
│  ─ 大盤指數      │  ─ TradingView K 線         │
│  ─ 持股 (LS)     │  ─ AI 分析（單支全能型）     │
│  ─ 追蹤 (LS)     │                            │
└────────┬──────────────┬──────────────────────┘
         │              │
┌────────▼──────────────▼──────────────────────┐
│             後端 API Routes                    │
│                                              │
│  /api/market         三大指數                  │
│  /api/stocks?symbols=  批次報價                │
│  /api/stocks/search    搜尋                    │
│  /api/profile/[symbol] 公司資訊                │
│  /api/analysis/[symbol] AI 分析                │
└────────┬──────────────┬──────────────────────┘
         │              │
   Finnhub (報價/Profile/  Anthropic Claude
   基本面/搜尋)            Sonnet 4.6
```

無伺服器端資料庫；持股 + 追蹤清單 + AI 報告全部走前端 localStorage / 一次性回傳。

---

## 技術選型

| 層級 | 技術 |
|------|------|
| 框架 | Next.js 16 (App Router, Turbopack) |
| UI | shadcn/ui + Tailwind CSS v4 |
| 字體 | Source Serif 4（英數）+ Noto Serif TC（中文）標題；Geist + Noto Sans TC 內文 |
| 圖表 | TradingView Widget |
| 資料快取 | TanStack Query v5 |
| 持久化 | 純前端 localStorage（`portfolio_v1` / `watchlist_v1`） |
| AI 分析 | Anthropic Claude Sonnet 4.6（`claude-sonnet-4-6`） |
| 行情 / Profile / 基本面 / 搜尋 | Finnhub（60 req/min 免費額度） |
| 部署 | Zeabur |

---

## Claude Design 設計系統

| Token | 值 | 用途 |
|-------|---|------|
| `--background` | `#F4EFE6` | 全站背景（米色） |
| `--foreground` | `#1A1A1A` | 主文字（深炭） |
| `--brand` / `--accent` / `--ring` | `#CC785C` | 品牌珊瑚橘 |
| `--secondary` | `#E8E2D5` | 次要區塊背景 |
| `--card` | `#FFFFFF` | 卡片白底 |
| `--muted` | `#EFE9DD` | 弱化背景 |
| `--border` | `#D9D2C2` | 邊框 |
| 標題字體 | Source Serif 4 + Noto Serif TC | `.font-serif` 自動套用 |

> 漲跌色維持美股慣例：上漲 emerald-600 / 下跌 red-600。

---

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env.local` 並填入 API Key：

```env
FINNHUB_API_KEY=
ANTHROPIC_API_KEY=
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

---

## API Key 申請

| 服務 | 免費額度 | 申請網址 |
|------|---------|---------|
| Finnhub | 60 req/分鐘 | [finnhub.io](https://finnhub.io/) |
| Anthropic Claude | 按用量付費（每次分析約 $0.02-0.04） | [console.anthropic.com](https://console.anthropic.com/) |

---

## 部署到 Zeabur

1. Fork 此 repo，於 [Zeabur](https://zeabur.com/) 連結 GitHub repo
2. 後台設定環境變數（`FINNHUB_API_KEY` / `ANTHROPIC_API_KEY`）
3. 推 `main` 即自動建置：

```json
{
  "build_command": "npm run build",
  "start_command": "npm start"
}
```

> 不再需要 Turso / drizzle migration。

---

## 專案結構

```
src/
├── app/
│   ├── page.tsx                  # Dashboard 首頁
│   ├── layout.tsx                # Root layout + 字體
│   ├── globals.css               # Claude Design palette
│   ├── stock/[symbol]/page.tsx   # 個股頁
│   └── api/
│       ├── market/               # 三大指數
│       ├── stocks/               # 批次報價 + 搜尋
│       ├── profile/[symbol]/     # 公司資訊
│       └── analysis/[symbol]/    # AI 分析 POST
├── components/
│   ├── dashboard/                # Navbar / WatchlistTable / HoldingsTable / SidePanel ...
│   ├── stock/                    # StockHeader / ChartCard / QuoteSheet / StockDetailView
│   ├── analysis/                 # AnalysisCard（AI 結果渲染）
│   ├── charts/                   # TradingView Widget
│   ├── design/                   # TickerBar / SectionHeader / Sparkline ...
│   └── ui/                       # shadcn
├── lib/
│   ├── api/finnhub.ts            # 唯一資料來源
│   ├── analysis.ts               # Claude prompt + parser + runner
│   ├── portfolio.ts              # 持股 localStorage helper
│   ├── watchlist.ts              # 追蹤清單 localStorage helper
│   ├── format.ts / utils.ts
│   └── validations.ts
└── types/
    └── index.ts                  # Quote / Profile / WatchlistItem / AnalysisReport
```

---

## 已歸檔模組

詳見 [`docs/REMOVED_FEATURES.md`](docs/REMOVED_FEATURES.md)：13 AI 代理人深度分析、同業比較、綜合評分、新聞、財報深度頁、Drizzle + Turso、FMP API、Rate limit proxy 等模組的設計理念、原始碼位置、復原步驟皆有保留，可隨時搬回。

原始碼存放於 `docs/removed/` 目錄，未刪除。

---

## 免責聲明

本系統所有分析內容（含 AI 生成）**僅供研究參考，不構成投資建議**。投資有風險，請自行評估。
