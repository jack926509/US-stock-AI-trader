// 辯論層 / 風險層共用 user prompt builder。
// 把先前各代理人的輸出整理成一個明確結構，後段代理人才能基於前面的真實
// 內容（不是想像）做反駁或整合。

import type { AgentSections, AnalysisContext } from "../types"
import { MASTER_LABELS } from "../types"

export function buildContextRecap(ctx: AnalysisContext): string {
  return `# 標的: ${ctx.symbol} ${ctx.companyName}
- 股價 $${ctx.price.toFixed(2)} | 市值 ${ctx.marketCap} | P/E ${ctx.pe ?? "N/A"} | 52週 ${ctx.range52w}
- ${ctx.week52Position}

## 估值與獲利核心指標
${ctx.keyMetricsSummary}

## 財務摘要
${ctx.financialSummary}

## 同業比較
${ctx.peerSummary}

## 內部人交易
${ctx.insiderTrading}

## 分析師共識
${ctx.analystConsensus}

## 近期新聞
${ctx.newsSummary}`
}

export function buildMastersRecap(sections: AgentSections): string {
  const lines: string[] = []
  for (const [id, label] of Object.entries(MASTER_LABELS)) {
    const content = sections.masters[id as keyof typeof MASTER_LABELS]
    if (content) {
      lines.push(`### ${label}\n${content}`)
    }
  }
  return lines.join("\n\n")
}

export function buildDebateRecap(sections: AgentSections): string {
  const parts: string[] = []
  if (sections.debate.bull) parts.push(`### 多方研究員\n${sections.debate.bull}`)
  if (sections.debate.bear) parts.push(`### 空方研究員\n${sections.debate.bear}`)
  if (sections.debate.manager) parts.push(`### 研究主管裁決\n${sections.debate.manager}`)
  return parts.join("\n\n")
}

export function buildRiskRecap(sections: AgentSections): string {
  const parts: string[] = []
  if (sections.risk.aggressive) parts.push(`### 激進派風險分析師\n${sections.risk.aggressive}`)
  if (sections.risk.conservative) parts.push(`### 保守派風險分析師\n${sections.risk.conservative}`)
  if (sections.risk.neutral) parts.push(`### 中立派風險分析師\n${sections.risk.neutral}`)
  return parts.join("\n\n")
}
