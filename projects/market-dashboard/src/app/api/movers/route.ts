import { getUnifiedQuotes } from "@/lib/data-service"
import { cacheHeaders, handleApiError, jsonOk } from "@/lib/api/response"

// 固定樣本池（大型權值 + 高關注）；Finnhub 免費版無 movers endpoint，改以池內排序
const UNIVERSE = [
  "AAPL",
  "MSFT",
  "NVDA",
  "AMZN",
  "GOOGL",
  "META",
  "TSLA",
  "AVGO",
  "BRK.B",
  "JPM",
  "V",
  "MA",
  "JNJ",
  "WMT",
  "PG",
  "XOM",
  "UNH",
  "HD",
  "LLY",
  "ABBV",
  "MRK",
  "KO",
  "PEP",
  "COST",
  "CSCO",
  "NFLX",
  "AMD",
  "INTC",
  "ORCL",
  "CRM",
  "ADBE",
  "QCOM",
  "PFE",
  "ABT",
  "TMO",
  "DHR",
  "MCD",
  "DIS",
  "BAC",
  "WFC",
  "GS",
  "MS",
  "C",
  "BLK",
  "SPGI",
  "AXP",
  "CAT",
  "BA",
  "GE",
  "RTX",
]

// GET /api/movers — 回傳 gainers / losers / active 三組
export async function GET() {
  try {
    const quotes = await getUnifiedQuotes(UNIVERSE)
    if (quotes.length === 0) {
      return jsonOk({ gainers: [], losers: [], active: [] }, { headers: cacheHeaders(30, 60) })
    }
    const enriched = quotes.filter((q) => q.price > 0)
    const sortedByChange = [...enriched].sort((a, b) => b.changePercentage - a.changePercentage)
    const gainers = sortedByChange.slice(0, 10)
    const losers = sortedByChange.slice(-10).reverse()
    const active = [...enriched]
      .filter((quote) => quote.volume != null && quote.averageVolume20 != null && quote.averageVolume20 > 0)
      .sort((a, b) => (b.volume! / b.averageVolume20!) - (a.volume! / a.averageVolume20!))
      .slice(0, 10)

    return jsonOk({ gainers, losers, active }, { headers: cacheHeaders(30, 60) })
  } catch (err) {
    return handleApiError("[GET /api/movers]", err)
  }
}
