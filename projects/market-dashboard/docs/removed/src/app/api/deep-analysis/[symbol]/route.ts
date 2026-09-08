// 深度分析 SSE endpoint —
// POST: 觸發多代理人深度分析，以 Server-Sent Events 串流各代理人進度與輸出。
// GET:  列出該 symbol 的歷史深度分析報告。

import { db } from "@/lib/db"
import { deepAnalysisReports } from "@/lib/db/schema"
import { validateSymbol } from "@/lib/validations"
import { runDeepAnalysis, DEEP_PROMPT_VERSION } from "@/lib/agents/orchestrator"
import type { AgentEvent, AnalysisContext } from "@/lib/agents/types"
import { getQuote, getCompanyProfile } from "@/lib/api/fmp"
import { getFinnhubProfile, getFinnhubQuote } from "@/lib/api/finnhub"
import {
  buildFinancialSummary,
  buildKeyMetricsSummary,
  buildNewsSummary,
  buildPeerSummary,
  buildEarningsSurprisesSummary,
  buildAnalystConsensusSummary,
  buildInsiderTradingSummary,
  buildMacroContext,
  parseRating,
  parseTargetPrice,
} from "@/lib/api/context-builders"
import { eq, desc } from "drizzle-orm"

// ── 把 AgentEvent 編成 SSE 格式 ────────────────────────────────────
function formatSse(event: AgentEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
}

// ── GET — 歷史深度報告列表 ────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: raw } = await params
    const symbol = raw.toUpperCase()
    if (!validateSymbol(symbol)) {
      return Response.json({ error: "Invalid symbol", code: "INVALID_SYMBOL" }, { status: 400 })
    }

    const reports = await db
      .select()
      .from(deepAnalysisReports)
      .where(eq(deepAnalysisReports.symbol, symbol))
      .orderBy(desc(deepAnalysisReports.createdAt))
      .limit(10)

    return Response.json(reports)
  } catch (err) {
    console.error("[GET /api/deep-analysis]", err)
    return Response.json({ error: "Failed to fetch reports", code: "API_ERROR" }, { status: 500 })
  }
}

// ── POST — 觸發深度分析（SSE 串流） ───────────────────────────────
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol: raw } = await params
  const symbol = raw.toUpperCase()

  if (!validateSymbol(symbol)) {
    return Response.json({ error: "Invalid symbol", code: "INVALID_SYMBOL" }, { status: 400 })
  }

  // 蒐集完整脈絡資料 — 與單一分析師 pipeline 共用 context-builders。
  const [
    fmpProfile, fmpQuote,
    financialSummary, keyMetricsSummary, newsSummary, peerSummary,
    earningsSurprises, analystConsensus, insiderTrading,
  ] = await Promise.all([
    getCompanyProfile(symbol).catch(() => null),
    getQuote(symbol).catch(() => null),
    buildFinancialSummary(symbol),
    buildKeyMetricsSummary(symbol),
    buildNewsSummary(symbol),
    buildPeerSummary(symbol),
    buildEarningsSurprisesSummary(symbol),
    buildAnalystConsensusSummary(symbol),
    buildInsiderTradingSummary(symbol),
  ])

  let companyName = fmpProfile?.companyName ?? symbol
  let price = fmpProfile?.price ?? fmpQuote?.price ?? 0
  let yearHigh = fmpQuote?.yearHigh ?? 0
  let yearLow = fmpQuote?.yearLow ?? 0
  if (!fmpProfile) {
    const fh = await getFinnhubProfile(symbol).catch(() => null)
    if (fh) companyName = fh.name
  }
  if (!fmpQuote) {
    const fhq = await getFinnhubQuote(symbol).catch(() => null)
    if (fhq) {
      price = fhq.price
      yearHigh = fhq.yearHigh
      yearLow = fhq.yearLow
    }
  }

  const week52Position = price > 0 && yearHigh > yearLow
    ? `${((price - yearLow) / (yearHigh - yearLow) * 100).toFixed(0)}% 位置（距52週低 +${((price - yearLow) / yearLow * 100).toFixed(1)}%，距52週高 -${((yearHigh - price) / yearHigh * 100).toFixed(1)}%）`
    : "N/A"

  const ctx: AnalysisContext = {
    symbol,
    companyName,
    price,
    marketCap: fmpProfile?.marketCap && fmpProfile.marketCap > 0
      ? `$${(fmpProfile.marketCap / 1e9).toFixed(1)}B`
      : "N/A",
    pe: fmpQuote?.pe ?? null,
    range52w: yearHigh && yearLow ? `$${yearLow.toFixed(2)} – $${yearHigh.toFixed(2)}` : "N/A",
    week52Position,
    financialSummary,
    keyMetricsSummary,
    newsSummary,
    peerSummary,
    earningsSurprises,
    analystConsensus,
    insiderTrading,
    macroContext: buildMacroContext(),
  }

  const startedAt = Date.now()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let finalContent = ""
      let sections: unknown = null

      try {
        for await (const event of runDeepAnalysis(ctx)) {
          controller.enqueue(encoder.encode(formatSse(event)))
          if (event.type === "done") {
            finalContent = event.finalContent
            sections = event.sections
          }
        }
      } catch (err) {
        console.error("[POST /api/deep-analysis stream]", err)
        const errEvent: AgentEvent = {
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        }
        controller.enqueue(encoder.encode(formatSse(errEvent)))
      } finally {
        if (finalContent.length > 100 && sections) {
          try {
            const rating = parseRating(finalContent)
            const { low, high } = parseTargetPrice(finalContent)
            await db.insert(deepAnalysisReports).values({
              symbol,
              finalContent,
              sections: JSON.stringify(sections),
              rating,
              targetPriceLow: low,
              targetPriceHigh: high,
              modelVersion: "claude-sonnet-4-6",
              promptVersion: DEEP_PROMPT_VERSION,
              durationMs: Date.now() - startedAt,
            })
          } catch (dbErr) {
            console.error("[POST /api/deep-analysis] DB save failed:", dbErr)
          }
        }
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no", // 確保 Zeabur / nginx 不要 buffer
      "Connection": "keep-alive",
    },
  })
}
