import { COMPANY_UNIVERSE, INDEX_UNIVERSE, SECTOR_ETFS } from "@/lib/data-service"
import { expectedLastCompletedTradingDate, getHistory, historyToQuote } from "@/lib/market-data"

export const runtime = "nodejs"
export async function GET() {
  const expectedDate = expectedLastCompletedTradingDate()
  const entries = [...INDEX_UNIVERSE, ...SECTOR_ETFS, ...COMPANY_UNIVERSE]
  const unique = [...new Map(entries.map((entry) => [entry[0], entry])).values()]
  const results = await Promise.all(unique.map(async ([symbol, name]) => {
    const history = await getHistory(symbol)
    return { symbol, name, history, quote: historyToQuote(history, name) }
  }))
  const map = new Map<string, (typeof results)[number]>(results.map((item) => [item.symbol, item]))
  const usable = (symbol: string) => { const item = map.get(symbol); return item?.history.meta.status === "ok" && item.history.meta.asOf === expectedDate ? item : null }
  const indices = INDEX_UNIVERSE.flatMap(([symbol]) => usable(symbol)?.quote ? [usable(symbol)!.quote!] : [])
  const sectors = SECTOR_ETFS.flatMap(([symbol, name]) => usable(symbol)?.quote ? [{ ...usable(symbol)!.quote!, name }] : []).sort((a, b) => b.changePercentage - a.changePercentage)
  const companies = COMPANY_UNIVERSE.flatMap(([symbol, name, sector]) => {
    const item = usable(symbol); return item?.quote ? [{ ...item.quote, name, sector, history: item.history }] : []
  })
  const advancers = companies.filter((item) => item.change > 0).length
  const decliners = companies.filter((item) => item.change < 0).length
  const unchanged = companies.filter((item) => item.change === 0).length
  const abnormalVolume = companies.flatMap((item) => {
    const latest = item.history.bars.at(-1); const prior = item.history.bars.slice(-21, -1)
    if (!latest || prior.length < 20 || latest.volume == null || latest.volume <= 0 || prior.some((bar) => bar.volume == null || bar.volume <= 0)) return []
    const average = prior.reduce((sum, bar) => sum + (bar.volume ?? 0), 0) / 20; const ratio = latest.volume / average
    return ratio >= 1.5 ? [{ symbol: item.symbol, name: item.name, ratio, volume: latest.volume, averageVolume20: average, changePercentage: item.changePercentage }] : []
  }).sort((a, b) => b.ratio - a.ratio)
  return Response.json({ indices, sectors, breadth: { advancers, decliners, unchanged, available: companies.length, total: COMPANY_UNIVERSE.length, unavailable: COMPANY_UNIVERSE.length - companies.length }, abnormalVolume,
    meta: { source: "Yahoo Finance Chart", freshness: "delayed", asOf: expectedDate, message: `市場廣度採固定 20 檔跨產業大型股樣本；只計入更新至 ${expectedDate} 的已收盤日線。異常量為最新成交量除以前 20 日均量。` },
  }, { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" } })
}
