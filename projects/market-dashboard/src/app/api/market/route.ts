import { getMarketIndices } from "@/lib/api/finnhub"
import { cacheHeaders, handleApiError, jsonError, jsonOk } from "@/lib/api/response"

// GET /api/market — S&P 500 (SPY) / NASDAQ 100 (QQQ) / Dow Jones (DIA)
export async function GET() {
  try {
    const data = await getMarketIndices()
    if (data.length === 0) {
      return jsonError("Failed to fetch market data", "API_ERROR", 500)
    }
    return jsonOk(data, { headers: cacheHeaders(30, 60) })
  } catch (err) {
    return handleApiError("[GET /api/market]", err)
  }
}
