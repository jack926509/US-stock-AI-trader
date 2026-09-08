import { getFinancialSnapshot, getProfile, getQuote } from "@/lib/api/finnhub"
import {
  MODEL,
  PROMPT_VERSION,
  parseRating,
  parseTargetPrice,
  runAnalysis,
  runAnalysisStream,
} from "@/lib/analysis"
import { ApiRouteError, handleApiError, jsonError, normalizeSymbol } from "@/lib/api/response"
import type { AnalysisReport } from "@/types"

export const maxDuration = 60

type AnalysisResponse = AnalysisReport & { model: string; promptVersion: string }

// 防多分頁 / 重整 race：同一 symbol 同時間只跑一次（一次 Claude call ~$0.02-0.04）
const inflight = new Map<string, Promise<AnalysisResponse>>()

async function buildAnalysisInput(symbol: string) {
  const [profile, quote, snapshot] = await Promise.all([
    getProfile(symbol),
    getQuote(symbol),
    getFinancialSnapshot(symbol),
  ])

  if (!profile && !quote) {
    throw new ApiRouteError("Stock not found", "NOT_FOUND", 404)
  }

  return { symbol, profile, quote, snapshot }
}

function toReport(symbol: string, content: string): AnalysisResponse {
  const rating = parseRating(content)
  const { low, high } = parseTargetPrice(content)

  return {
    symbol,
    content,
    rating,
    targetPriceLow: low,
    targetPriceHigh: high,
    generatedAt: new Date().toISOString(),
    model: MODEL,
    promptVersion: PROMPT_VERSION,
  }
}

async function generateReport(symbol: string): Promise<AnalysisResponse> {
  const input = await buildAnalysisInput(symbol)
  const content = await runAnalysis(input)
  return toReport(symbol, content)
}

async function generateReportStream(
  symbol: string,
  onText: (delta: string) => void
): Promise<AnalysisResponse> {
  const input = await buildAnalysisInput(symbol)
  const content = await runAnalysisStream(input, onText)
  return toReport(symbol, content)
}

function getOrCreateReport(symbol: string): Promise<AnalysisResponse> {
  const existing = inflight.get(symbol)
  if (existing) return existing

  const promise = generateReport(symbol).finally(() => {
    inflight.delete(symbol)
  })
  inflight.set(symbol, promise)
  return promise
}

async function replayStreamingResponse(promise: Promise<AnalysisResponse>): Promise<Response> {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"))
      try {
        const report = await promise
        send({ type: "chunk", text: report.content })
        send({ type: "done", report })
      } catch (err) {
        if (err instanceof ApiRouteError) {
          send({ type: "error", code: err.code, message: err.message })
        } else {
          console.error("[POST /api/analysis stream replay]", err)
          send({ type: "error", code: "API_ERROR", message: "Failed to generate analysis" })
        }
      } finally {
        controller.close()
      }
    },
  })
  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  })
}

async function streamingResponse(symbol: string): Promise<Response> {
  const existing = inflight.get(symbol)
  if (existing) return replayStreamingResponse(existing)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"))
      try {
        const promise = generateReportStream(symbol, (delta) =>
          send({ type: "chunk", text: delta })
        ).finally(() => {
          inflight.delete(symbol)
        })
        inflight.set(symbol, promise)
        const report = await promise
        send({ type: "done", report })
      } catch (err) {
        if (err instanceof ApiRouteError) {
          send({ type: "error", code: err.code, message: err.message })
        } else {
          console.error("[POST /api/analysis stream]", err)
          send({ type: "error", code: "API_ERROR", message: "Failed to generate analysis" })
        }
      } finally {
        controller.close()
      }
    },
  })
  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  })
}

// POST /api/analysis/[symbol] — 觸發全能型 AI 分析
// 預設一次性 JSON 回傳；加 ?stream=1 進入 NDJSON 串流模式。
export async function POST(req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  try {
    const { symbol: raw } = await params
    const symbol = normalizeSymbol(raw)

    const wantStream = new URL(req.url).searchParams.get("stream") === "1"
    if (wantStream) {
      return streamingResponse(symbol)
    }

    const report = await getOrCreateReport(symbol)
    return Response.json(report)
  } catch (err) {
    if (err instanceof ApiRouteError) {
      return jsonError(err.message, err.code, err.status)
    }
    return handleApiError("[POST /api/analysis]", err)
  }
}
