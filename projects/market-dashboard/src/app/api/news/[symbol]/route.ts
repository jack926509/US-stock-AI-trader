import { getCompanyNews } from "@/lib/api/finnhub"
import { cacheHeaders, handleApiError, jsonOk, normalizeSymbol } from "@/lib/api/response"

export async function GET(_req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  try {
    const { symbol: raw } = await params
    const symbol = normalizeSymbol(raw)
    const news = await getCompanyNews(symbol, 7)
    return jsonOk(news, { headers: cacheHeaders(600, 600) })
  } catch (err) {
    return handleApiError("[GET /api/news]", err)
  }
}
