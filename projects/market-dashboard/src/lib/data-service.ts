import { getQuote as getFinnhubQuote } from "@/lib/api/finnhub"
import { getHistory, historyToQuote } from "@/lib/market-data"
import type { Quote } from "@/types"

export const COMPANY_UNIVERSE = [
  ["AAPL", "Apple", "科技"], ["MSFT", "Microsoft", "科技"], ["NVDA", "NVIDIA", "科技"], ["AMZN", "Amazon", "非必需消費"], ["GOOGL", "Alphabet", "通訊"], ["META", "Meta", "通訊"], ["TSLA", "Tesla", "非必需消費"], ["JPM", "JPMorgan", "金融"], ["BAC", "Bank of America", "金融"], ["XOM", "Exxon Mobil", "能源"], ["CVX", "Chevron", "能源"], ["LLY", "Eli Lilly", "醫療"], ["JNJ", "Johnson & Johnson", "醫療"], ["WMT", "Walmart", "必需消費"], ["COST", "Costco", "必需消費"], ["CAT", "Caterpillar", "工業"], ["GE", "GE Aerospace", "工業"], ["NEE", "NextEra Energy", "公用事業"], ["LIN", "Linde", "原物料"], ["PLD", "Prologis", "房地產"],
] as const
export const INDEX_UNIVERSE = [["SPY", "S&P 500 ETF"], ["QQQ", "NASDAQ 100 ETF"], ["DIA", "道瓊工業 ETF"]] as const
export const SECTOR_ETFS = [["XLK", "科技"], ["XLF", "金融"], ["XLE", "能源"], ["XLV", "醫療"], ["XLY", "非必需消費"], ["XLP", "必需消費"], ["XLI", "工業"], ["XLB", "原物料"], ["XLU", "公用事業"], ["XLRE", "房地產"], ["XLC", "通訊"]] as const

export function knownName(symbol: string): string {
  return [...COMPANY_UNIVERSE, ...INDEX_UNIVERSE, ...SECTOR_ETFS].find(([ticker]) => ticker === symbol)?.[1] ?? symbol
}
export async function getUnifiedQuote(symbol: string): Promise<Quote | null> {
  if (process.env.FINNHUB_API_KEY) {
    const quote = await getFinnhubQuote(symbol)
    if (quote && quote.freshness !== "stale") return quote
  }
  return historyToQuote(await getHistory(symbol), knownName(symbol))
}
export async function getUnifiedQuotes(symbols: string[]): Promise<Quote[]> {
  const settled = await Promise.allSettled([...new Set(symbols.map((symbol) => symbol.toUpperCase()))].map(getUnifiedQuote))
  return settled.flatMap((item) => item.status === "fulfilled" && item.value ? [item.value] : [])
}
