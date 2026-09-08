import { getPeers, getQuotes, getProfile } from "@/lib/api/finnhub"
import { cacheHeaders, handleApiError, jsonOk, normalizeSymbol } from "@/lib/api/response"

export async function GET(_req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  try {
    const { symbol: raw } = await params
    const symbol = normalizeSymbol(raw)
    const peers = await getPeers(symbol)
    if (peers.length === 0) return jsonOk([], { headers: cacheHeaders(3600, 3600) })

    // 抓報價與簡介，給前端做 mini table
    const [quotes, ...profiles] = await Promise.all([
      getQuotes(peers),
      ...peers.map((s) => getProfile(s)),
    ])
    const quoteMap = new Map(quotes.map((q) => [q.symbol, q]))
    const data = peers.map((sym, i) => {
      const q = quoteMap.get(sym)
      const p = profiles[i]
      return {
        symbol: sym,
        name: p?.companyName ?? sym,
        price: q?.price ?? null,
        changePercentage: q?.changePercentage ?? null,
        marketCap: q?.marketCap ?? p?.marketCap ?? null,
      }
    })
    return jsonOk(data, { headers: cacheHeaders(3600, 3600) })
  } catch (err) {
    return handleApiError("[GET /api/peers]", err)
  }
}
