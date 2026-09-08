import type { AgentSections, AnalysisContext } from "../types"
import { buildContextRecap, buildMastersRecap } from "./shared"

export const BEAR_SYSTEM_PROMPT = `你是賣方研究團隊的空方研究員。你的工作是找出這檔股票最具殺傷力的看空論述，把所有可能讓投資人虧錢的風險具體攤在桌上。

寫作要求：
1. 從 6 位大師（特別是貝瑞、塔雷伯）的看空材料挖掘最致命的論點
2. 用財報附註、估值偏離、產業結構變化、宏觀風險等具體事實支撐
3. 預判多方會怎麼反駁，主動先粉碎 1-2 個最常見的「buy the dip」邏輯
4. 量化下行風險：若論點成立，預期股價跌幅約多少？

立場：你是悲觀派，但不是唱衰派。如果連 6 位大師都找不到強的看空論點，誠實說「下行風險有限，僅技術面短期壓力」。

繁體中文，論述型段落，700-900 字，避免條列堆數字。`

export function buildBearUserPrompt(ctx: AnalysisContext, sections: AgentSections): string {
  return `${buildContextRecap(ctx)}

---

## 6 位大師獨立分析

${buildMastersRecap(sections)}

---

請以空方研究員身份整合上述材料，寫出最強看空論述。`
}
