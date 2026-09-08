# Bloomberg × Claude — 投資平台設計檔

## 📦 檔案結構

### 入口
- `index.html` — Design Canvas 主入口，所有畫面 side-by-side 並排展示

### 共用模組
- `data.jsx` — 13 位 AI 代理人資料、KPI、持倉等 mock data
- `primitives.jsx` — 共用元件（NavBar、ChartPlaceholder、SectionHeader 等）
- `design-canvas.jsx` — Canvas 容器（DCSection / DCArtboard）
- `ios-frame.jsx` — iOS 裝置外框

### 📱 手機版（7 個畫面）
- `mobile-screens.jsx` — 全部手機畫面
  - Dashboard / Stock List / Stock Detail / Agents / Watchlist / Profile / Settings

### 🖥️ 網頁版 v1（基礎版）
- `web-dashboard-v1.jsx` — Dashboard v1（保留對照用）
- `web-stock-detail-v1.jsx` — 個股詳情 v1
- `web-dashboard.jsx` — Dashboard 主版（基礎終端機風）
- `web-stock-detail.jsx` — 個股詳情主版

### 🖥️ 網頁版 v2（Bloomberg Terminal × Claude 米色 — 最新）
- `web-dashboard-v2.jsx` — Dashboard v2
  - 黑色 Ticker Bar（13 檔即時跑馬）
  - Bloomberg 指令列（CMD + DES/CHART/PEERS/AGENTS）
  - NAV+30D 走勢卡 / 6 列 KPI / 終端機式持倉 / AI Brief 黑卡 / 產業條形 / 即時新聞

- `web-stock-detail-v2.jsx` — 個股詳情 v2
  - NVDA 大標題 + 盤前/盤後卡
  - 互動式蠟燭圖 + OHLC strip
  - 同業比較表（5 檔 + 技術指標卡）
  - 5 維評分黑卡 + 報價單（DES 16 列）+ 新聞
  - **13 代理人深度分析**（淺色版 — 純白卡 + 分類色標 + 4 階段 stepper + 共識卡）

### 其他
- `tweaks-panel.jsx` — Tweaks 面板（暫未啟用）

---

## 🎨 設計系統

### 主要配色
| Token        | 值           | 用途                      |
|--------------|--------------|---------------------------|
| BG (米色)    | `#F4EFE6`    | 主背景                    |
| CARD         | `#FBF8F1`    | 卡片底                    |
| INK          | `#1A1A1A`    | 主文字 / 黑色終端機面板   |
| BRAND        | `#CC785C`    | Claude 珊瑚橘 — 重點/品牌 |
| MUTED        | `#9A8E7C`    | 次要文字                  |
| HAIR         | `rgba(0,0,0,0.08)` | 細邊線              |
| UP           | `#006e3f`    | 漲（深綠）                |
| DOWN         | `#c62828`    | 跌（深紅）                |
| UP_NEON      | `#00d47e`    | Ticker Bar 跑馬漲色       |

### 13 代理人分類色標（淺色版）
| 群組      | Accent       | 說明           |
|-----------|--------------|----------------|
| MASTER    | `#3B6F4D` 森林綠 | 6 位投資大師 |
| DEBATE    | `#7A5BD9` 紫     | 3 方辯論     |
| RISK      | `#C25B3F` 磚紅   | 3 風險官     |
| PM        | `#CC785C` 品牌橘 | 投組整合     |

### 字型
- `sd2Sans` — Inter / system-ui（內文）
- `sd2Serif` — Georgia / Times（標題）
- `sd2Mono` — JetBrains Mono（數字、代號、終端機）

---

## 🚀 本地預覽

任何靜態檔伺服器都可：

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

開啟 `http://localhost:8000/index.html`，會看到 Design Canvas，
所有畫面以 artboard 並排展示，可拖曳、縮放、focus 單張。

---

## 🔗 元件相依關係

```
index.html
 ├── React 18.3.1 + Babel standalone (CDN)
 ├── ios-frame.jsx        ─┐
 ├── design-canvas.jsx     │
 ├── data.jsx              ├─ window globals
 ├── primitives.jsx        │
 ├── web-dashboard*.jsx    │
 ├── web-stock-detail*.jsx │
 └── mobile-screens.jsx   ─┘ (透過 Object.assign(window, {...}) 共享)
```

每個元件檔末尾用 `Object.assign(window, { ComponentName });` 暴露到全域，
因為 Babel 各 script 不共享 scope。
