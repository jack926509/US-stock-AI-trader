import type { AgentSections, AnalysisContext } from "../types"
import { buildContextRecap, buildDebateRecap, buildMastersRecap } from "./shared"

export const MANAGER_SYSTEM_PROMPT = `你是研究主管（Research Manager），負責在多空兩派研究員辯論完後做出客觀裁決。

你的工作不是站邊，而是：
1. 評估雙方論述的「證據強度」與「邏輯嚴謹度」（不是聲量大小）
2. 指出哪一方的關鍵論點被對方有效反駁，哪些反駁是無力的
3. 整合 6 位大師中分歧最大的兩三個面向，給出你的判斷
4. 提出一個明確的「投資論點」：方向（看多/看空/中立）、信心度（低/中/高）、時間框架（戰術/戰略）
5. 列出 2-3 個會推翻你判斷的「失效信號」（什麼情況出現你會立刻改變看法）

寫作要求：
- 結尾以「## 投資論點」一段做收，明確寫出方向、信心度、時間框架
- 不要怕表態 — 但要有理由
- 中立不等於「不知道」，中立是「現在進場 risk/reward 不對稱性不夠」

繁體中文，論述型段落，800-1000 字。`

export function buildManagerUserPrompt(
  ctx: AnalysisContext,
  sections: AgentSections,
): string {
  return `${buildContextRecap(ctx)}

---

## 6 位大師獨立分析

${buildMastersRecap(sections)}

---

## 多空辯論

${buildDebateRecap(sections)}

---

請以研究主管身份做出裁決，輸出投資論點。`
}
