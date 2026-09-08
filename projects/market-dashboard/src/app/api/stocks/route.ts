import { getUnifiedQuotes } from "@/lib/data-service"
import { cacheHeaders, handleApiError, jsonOk, parseSymbolsParam } from "@/lib/api/response"
import type { NextRequest } from "next/server"

// GET /api/stocks?symbols=AAPL,TSLA,NVDA
// 批次回傳指定 symbol 的最新報價，給持股與追蹤清單共用。
// 自選股由本機持久化 API 維護；此路由只統一回報價與來源狀態。
export async function GET(req: NextRequest) {
  const symbols = parseSymbolsParam(req.nextUrl.searchParams.get("symbols"))

  if (symbols.length === 0) return jsonOk([])

  try {
    const quotes = await getUnifiedQuotes(symbols)
    return jsonOk(quotes, { headers: cacheHeaders(30, 60) })
  } catch (err) {
    return handleApiError("[GET /api/stocks]", err)
  }
}
