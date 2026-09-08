import { getFinancialSnapshot } from "@/lib/api/finnhub"
import {
  cacheHeaders,
  handleApiError,
  jsonError,
  jsonOk,
  normalizeSymbol,
} from "@/lib/api/response"

export async function GET(_req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  try {
    const { symbol: raw } = await params
    const symbol = normalizeSymbol(raw)
    const snap = await getFinancialSnapshot(symbol)
    if (!snap) {
      return jsonError("Not found", "NOT_FOUND", 404)
    }
    return jsonOk(snap, { headers: cacheHeaders(3600, 3600) })
  } catch (err) {
    return handleApiError("[GET /api/financials]", err)
  }
}
