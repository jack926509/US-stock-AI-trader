import { searchSymbols, getProfile } from "@/lib/api/finnhub"
import { cacheHeaders, handleApiError, jsonOk } from "@/lib/api/response"
import { validateSymbol } from "@/lib/validations"
import type { NextRequest } from "next/server"
import { COMPANY_UNIVERSE, INDEX_UNIVERSE, SECTOR_ETFS } from "@/lib/data-service"

// GET /api/stocks/search?q=apple — 供 AddStockDialog 搜尋
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim()
  if (!query || query.length < 1) return jsonOk([])

  try {
    const local = [...COMPANY_UNIVERSE, ...INDEX_UNIVERSE, ...SECTOR_ETFS]
      .filter(([symbol, name]) => symbol.toLowerCase().includes(query.toLowerCase()) || name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10).map(([symbol, name]) => ({ symbol, name, currency: "USD", exchange: "US", exchangeFullName: "US Exchange" }))
    if (!process.env.FINNHUB_API_KEY && local.length > 0) return jsonOk(local)
    const results = await searchSymbols(query)
    if (results.length > 0) return jsonOk(results, { headers: cacheHeaders(300, 300) })

    // Fallback: 若 query 像 symbol，直接拿 profile 補一筆
    const upper = query.toUpperCase()
    if (validateSymbol(upper)) {
      if (!process.env.FINNHUB_API_KEY) return jsonOk([{ symbol: upper, name: upper, currency: "USD", exchange: "US", exchangeFullName: "US Exchange" }])
      const profile = await getProfile(upper)
      if (profile) {
        return jsonOk(
          [
            {
              symbol: profile.symbol,
              name: profile.companyName,
              logo: profile.image || undefined,
              currency: "USD",
              exchange: profile.exchange || "US",
              exchangeFullName: profile.exchangeFullName || "US Exchange",
            },
          ],
          { headers: cacheHeaders(300, 300) }
        )
      }
    }
    return jsonOk([], { headers: cacheHeaders(60, 60) })
  } catch (err) {
    return handleApiError("[GET /api/stocks/search]", err)
  }
}
