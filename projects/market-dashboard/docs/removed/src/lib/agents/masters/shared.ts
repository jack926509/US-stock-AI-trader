// 大師代理人共用 user prompt builder —
// 把整段脈絡塞進一份結構化資料表，讓每位大師看到完全相同的事實，
// 但各自用自己的鏡頭判斷。這樣後段辯論時意見差異才會來自「視角」而非「資料不同」。

import type { AnalysisContext } from "../types"

export function buildMasterUserPrompt(ctx: AnalysisContext): string {
  return `# 分析標的: ${ctx.symbol} ${ctx.companyName}

## 即時行情
- 股價: $${ctx.price.toFixed(2)}
- 市值: ${ctx.marketCap}
- P/E: ${ctx.pe ?? "N/A"}
- 52 週區間: ${ctx.range52w}
- 52 週相對位置: ${ctx.week52Position}

## 財務摘要（近 3 年）
${ctx.financialSummary}

## 估值與獲利核心指標
${ctx.keyMetricsSummary}

## 同業比較
${ctx.peerSummary}

## EPS Beat/Miss 紀錄
${ctx.earningsSurprises}

## 分析師共識
${ctx.analystConsensus}

## 內部人交易
${ctx.insiderTrading}

## 近 30 日新聞摘要
${ctx.newsSummary}

## 宏觀脈絡
${ctx.macroContext}

---
請以你的投資哲學分析此標的。嚴格遵守你 system prompt 中的輸出格式。`
}

// 共通輸出格式要求 — 每位大師的 system prompt 結尾追加這段，
// 確保解析器能擷取評分與結論。
export const MASTER_OUTPUT_FORMAT = `

## 輸出格式（嚴格遵守）

第一行: 【評分】X/10 — <一句話總評>
第二行: 【方向】<看多 | 看空 | 中立>

接著三段（每段 2-3 個重點，論述型句子，避免 bullet 堆數字）：

### 看多論點
（從你的鏡頭找出買進理由；若你判斷無看多價值，寫「（從本派角度看不到值得買進的理由：xxx）」）

### 看空論點
（從你的鏡頭找出風險或不買的理由；若你判斷無重大風險，寫「（從本派角度看不到顯著賣出理由：xxx）」）

### 結論與建議倉位
（一段話，明確說出：是否進場、若進場的合理倉位比重 0-10%、停損或退出條件）

繁體中文輸出，中英文與數字之間加半形空格。不要重複 user prompt 內容。不要寫 markdown 表格。`
