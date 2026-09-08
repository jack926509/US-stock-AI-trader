import { getQuotes } from "@/lib/api/finnhub"
import { cacheHeaders, handleApiError, jsonOk, parseSymbolsParam } from "@/lib/api/response"
import type { NextRequest } from "next/server"

// GET /api/stocks?symbols=AAPL,TSLA,NVDA
// 批次回傳指定 symbol 的最新報價，給持股與追蹤清單共用。
// Watchlist 與 Portfolio 都改由前端 localStorage 維護，後端只回報價。
export async function GET(req: NextRequest) {
  const symbols = parseSymbolsParam(req.nextUrl.searchParams.get("symbols"))

  if (symbols.length === 0) return jsonOk([])

  try {
    const quotes = await getQuotes(symbols)
    return jsonOk(quotes, { headers: cacheHeaders(30, 60) })
  } catch (err) {
    return handleApiError("[GET /api/stocks]", err)
  }
}
