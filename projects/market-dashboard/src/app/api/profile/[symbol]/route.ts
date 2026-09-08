import { getProfile } from "@/lib/api/finnhub"
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

    const profile = await getProfile(symbol)
    if (!profile) {
      return jsonError("Stock not found", "NOT_FOUND", 404)
    }
    return jsonOk(profile, { headers: cacheHeaders(3600, 3600) })
  } catch (err) {
    return handleApiError("[GET /api/profile]", err)
  }
}
