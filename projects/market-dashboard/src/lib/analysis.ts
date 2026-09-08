// 全能型 AI 分析師 — 單一 Claude 呼叫，輸出完整投資決策報告
// 取代原 13 代理人 4 階段架構，用一支 prompt 處理。
// 解析器（parseRating / parseTargetPrice）保留與原 Portfolio Manager 相同的字串格式。

import Anthropic from "@anthropic-ai/sdk"
import { fmtCap } from "@/lib/format"
import type { AnalysisRating, Quote, Profile } from "@/types"
import type { FinancialSnapshot } from "@/lib/api/finnhub"

export const MODEL = "claude-sonnet-4-6"
export const PROMPT_VERSION = "mvp-v1.0"

const SYSTEM_PROMPT = `你是一位全能型有價分析師。整合價值、成長、技術、風險四種視角，給投資人一份可以直接執行的決策報告。

寫作要求：
1. 給明確結論，不是「整理資料」
2. 用 Markdown，結構固定如下（解析器會抓字串）
3. 報告字數 1000-1500 字
4. 繁體中文，中英文與數字間加半形空格

## 必要結構（嚴格遵守）

\`\`\`
# <標的> 投資分析

## 結論摘要
- 評級：<Strong Buy | Buy | Hold | Sell | Strong Sell>
- 目標價：$<low>-$<high>
- 建議倉位：<X>%（最多 10%）
- 持有期間：<短期 / 中期 / 長期>
- 信心度：<低 / 中 / 高>

## 核心論點
（3-4 段論述型段落。整合估值、成長、競爭力、產業趨勢。）

## 多空對比

### 看多
（3-4 點，每點一句話，量化效益。）

### 看空
（3-4 點，每點一句話，量化下行風險。）

## 主要 Catalysts（看多催化劑）
（3-4 點，每點一句話，附預期時點。）

## 主要 Risks（看空風險）
（3-4 點，每點一句話，附量化下行幅度。）

## 倉位執行建議
（一段論述：分批進場節奏、停損位置、加碼條件、再評估時點。）

## 失效信號（什麼情況立刻翻盤）
（2-3 點明確觸發條件。）
\`\`\`

不要寫 disclaimer 或免責聲明，由前端統一加。`

interface AnalysisInput {
  symbol: string
  profile: Profile | null
  quote: Quote | null
  snapshot: FinancialSnapshot | null
}

// Finnhub margin/return 多為小數（0.18 = 18%）或百分比（18 = 18%）— 以絕對值大小判斷
function fmtFinnhubPct(v: number): string {
  if (Math.abs(v) >= 1) return `${v.toFixed(2)}%`
  return `${(v * 100).toFixed(2)}%`
}

function buildUserPrompt({ symbol, profile, quote, snapshot }: AnalysisInput): string {
  const name = profile?.companyName ?? symbol
  const price = quote?.price ?? profile?.price ?? 0
  const change = quote?.changePercentage ?? profile?.changePercentage ?? 0
  const sector = profile?.sector || "N/A"
  const industry = profile?.industry || "N/A"
  const mcap = fmtCap(quote?.marketCap ?? profile?.marketCap ?? snapshot?.marketCap ?? 0)
  const yearHigh = snapshot?.week52High ?? quote?.yearHigh ?? 0
  const yearLow = snapshot?.week52Low ?? quote?.yearLow ?? 0
  const week52Pos =
    price > 0 && yearHigh > yearLow
      ? `${(((price - yearLow) / (yearHigh - yearLow)) * 100).toFixed(0)}% 位置（距 52 週低 +${(
          ((price - yearLow) / yearLow) *
          100
        ).toFixed(1)}%，距 52 週高 -${(((yearHigh - price) / yearHigh) * 100).toFixed(1)}%）`
      : "N/A"

  const valuation = snapshot
    ? `- P/E (TTM)：${snapshot.peTTM || "N/A"}
- P/E (Annual)：${snapshot.peAnnual || "N/A"}
- P/B：${snapshot.pbAnnual || "N/A"}
- P/S：${snapshot.psTTM || "N/A"}`
    : "（無資料）"

  const profitability = snapshot
    ? `- ROE (TTM)：${snapshot.roeTTM ? fmtFinnhubPct(snapshot.roeTTM) : "N/A"}
- ROA (TTM)：${snapshot.roaTTM ? fmtFinnhubPct(snapshot.roaTTM) : "N/A"}
- 毛利率 (TTM)：${snapshot.grossMarginTTM ? fmtFinnhubPct(snapshot.grossMarginTTM) : "N/A"}
- 淨利率 (TTM)：${snapshot.netMarginTTM ? fmtFinnhubPct(snapshot.netMarginTTM) : "N/A"}`
    : "（無資料）"

  const health = snapshot
    ? `- Debt/Equity：${snapshot.debtToEquity || "N/A"}
- Current Ratio：${snapshot.currentRatio || "N/A"}
- 股息殖利率：${snapshot.dividendYield ? fmtFinnhubPct(snapshot.dividendYield) : "N/A"}`
    : "（無資料）"

  const growth = snapshot
    ? `- 營收 3Y CAGR：${snapshot.revenueGrowth3Y ? fmtFinnhubPct(snapshot.revenueGrowth3Y) : "N/A"}
- EPS 3Y CAGR：${snapshot.epsGrowth3Y ? fmtFinnhubPct(snapshot.epsGrowth3Y) : "N/A"}`
    : "（無資料）"

  return `# 分析標的：${symbol} ${name}

## 即時行情
- 股價：$${price.toFixed(2)}（今日 ${change >= 0 ? "+" : ""}${change.toFixed(2)}%）
- 市值：${mcap}
- 產業：${sector} / ${industry}
- 52 週區間：$${yearLow.toFixed(2)} – $${yearHigh.toFixed(2)}
- 52 週相對位置：${week52Pos}

## 估值
${valuation}

## 獲利能力
${profitability}

## 財務健康
${health}

## 成長性
${growth}

---

請以全能型有價分析師身份，輸出完整投資決策報告。嚴格遵守 system prompt 指定的 Markdown 結構，特別是「結論摘要」中的評級與目標價字串格式（解析器會抓 "Strong Buy/Buy/Hold/Sell/Strong Sell" 與 "$<數字>-$<數字>"）。`
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

const RATING_RE =
  /評級[：:]\s*(Strong\s*Buy|Strong\s*Sell|Buy|Sell|Hold)/i

export function parseRating(content: string): AnalysisRating | null {
  const m = RATING_RE.exec(content)
  if (!m) return null
  const raw = m[1].replace(/\s+/g, " ").trim()
  const lower = raw.toLowerCase()
  if (lower === "strong buy") return "Strong Buy"
  if (lower === "strong sell") return "Strong Sell"
  if (lower === "buy") return "Buy"
  if (lower === "sell") return "Sell"
  if (lower === "hold") return "Hold"
  return null
}

const TARGET_RE = /目標價[：:]\s*\$?([\d,.]+)\s*[-–~]\s*\$?([\d,.]+)/

export function parseTargetPrice(content: string): { low: number | null; high: number | null } {
  const m = TARGET_RE.exec(content)
  if (!m) return { low: null, high: null }
  const low = Number(m[1].replace(/,/g, ""))
  const high = Number(m[2].replace(/,/g, ""))
  return {
    low: isFinite(low) ? low : null,
    high: isFinite(high) ? high : null,
  }
}

// ─── Runner ──────────────────────────────────────────────────────────────────

export async function runAnalysis(input: AnalysisInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set")

  const client = new Anthropic({ apiKey })
  const userPrompt = buildUserPrompt(input)

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  })

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")

  return text
}

export async function runAnalysisStream(
  input: AnalysisInput,
  onText: (delta: string) => void,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set")

  const client = new Anthropic({ apiKey })
  const userPrompt = buildUserPrompt(input)

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  })

  stream.on("text", (delta) => onText(delta))
  return stream.finalText()
}
