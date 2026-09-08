import { getHistory } from "@/lib/market-data"
import { scanStrategies } from "@/lib/strategies"
import { parseSymbolsParam } from "@/lib/api/response"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"
export async function GET(request: NextRequest) {
  const symbols = parseSymbolsParam(request.nextUrl.searchParams.get("symbols")).slice(0, 200)
  if (!symbols.length) return Response.json([])
  const spy = await getHistory("SPY")
  return Response.json(await Promise.all(symbols.map(async (symbol) => {
    const history = symbol === "SPY" ? spy : await getHistory(symbol)
    return scanStrategies(symbol, history.bars, spy.bars, history.meta, spy.meta)
  })), { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" } })
}
