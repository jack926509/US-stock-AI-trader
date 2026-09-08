import type { Quote } from "@/types"

export type DataFreshness = "live" | "delayed" | "stale"
export type DataStatus = "ok" | "partial" | "unavailable"

export interface DataMeta {
  source: "Finnhub" | "Yahoo Finance Chart"
  asOf: string | null
  freshness: DataFreshness
  status: DataStatus
  message?: string
}

export interface DailyBar {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number | null
}

export interface HistoryResult {
  symbol: string
  bars: DailyBar[]
  meta: DataMeta
}

const YAHOO_HOSTS = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]
const HISTORY_TTL_MS = 15 * 60 * 1000
const historyCache = new Map<string, { expires: number; value: Promise<HistoryResult> }>()
let activeYahoo = 0
const yahooQueue: Array<() => void> = []

async function withYahooSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (activeYahoo >= 4) await new Promise<void>((resolve) => yahooQueue.push(resolve))
  activeYahoo += 1
  try {
    return await fn()
  } finally {
    activeYahoo -= 1
    yahooQueue.shift()?.()
  }
}

function finite(value: unknown): number | null {
  if (value == null || value === "") return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function nyParts(now: Date): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now)
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ""
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    minutes: Number(value("hour")) * 60 + Number(value("minute")),
  }
}

const EARLY_CLOSES: Record<string, number> = {
  "2026-11-27": 13 * 60,
  "2026-12-24": 13 * 60,
}

const MARKET_HOLIDAYS_2026 = new Set([
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25",
  "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
])

function isTradingDate(date: string): boolean {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay()
  return day !== 0 && day !== 6 && !MARKET_HOLIDAYS_2026.has(date)
}

function previousDate(date: string): string {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() - 1)
  return value.toISOString().slice(0, 10)
}

export function expectedLastCompletedTradingDate(now = new Date()): string {
  const ny = nyParts(now)
  const close = EARLY_CLOSES[ny.date] ?? 16 * 60
  let candidate = isTradingDate(ny.date) && ny.minutes >= close + 15 ? ny.date : previousDate(ny.date)
  while (!isTradingDate(candidate)) candidate = previousDate(candidate)
  return candidate
}

/** 日 K 只在美東收盤後才可進入策略。 */
export function isCompletedDailyBar(date: string, now = new Date()): boolean {
  const ny = nyParts(now)
  if (date < ny.date) return true
  if (date > ny.date) return false
  return ny.minutes >= (EARLY_CLOSES[date] ?? 16 * 60)
}

function yahooSymbol(symbol: string): string {
  return symbol.toUpperCase().replaceAll(".", "-")
}

async function requestYahoo(symbol: string, range: string): Promise<{ payload: unknown; capturedAt: Date }> {
  return withYahooSlot(async () => {
    let lastError: unknown
    for (const host of YAHOO_HOSTS) {
      try {
        const url = new URL(`https://${host}/v8/finance/chart/${encodeURIComponent(yahooSymbol(symbol))}`)
        url.searchParams.set("range", range)
        url.searchParams.set("interval", "1d")
        url.searchParams.set("events", "div,splits")
        const response = await fetch(url, {
          headers: { "user-agent": "Mozilla/5.0 US-stock-research/1.0", accept: "application/json" },
          signal: AbortSignal.timeout(10_000),
          cache: "no-store",
        })
        if (!response.ok) throw new Error(`Yahoo HTTP ${response.status}`)
        return { payload: await response.json(), capturedAt: new Date() }
      } catch (error) {
        lastError = error
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Yahoo 歷史資料無法取得")
  })
}

export function parseYahooHistory(symbol: string, payload: unknown, now = new Date(), capturedAt = now): HistoryResult {
  const result = (payload as { chart?: { result?: Array<Record<string, unknown>> } })?.chart?.result?.[0]
  const timestamps = (result?.timestamp as number[] | undefined) ?? []
  const quote = ((result?.indicators as { quote?: Array<Record<string, unknown[]>> } | undefined)?.quote?.[0])
  const bars: DailyBar[] = []
  let priceGap = false
  for (let i = 0; i < timestamps.length; i += 1) {
    const date = new Date(timestamps[i] * 1000).toLocaleDateString("en-CA", { timeZone: "America/New_York" })
    if (!isCompletedDailyBar(date, capturedAt)) continue
    const open = finite(quote?.open?.[i])
    const high = finite(quote?.high?.[i])
    const low = finite(quote?.low?.[i])
    const close = finite(quote?.close?.[i])
    const rawVolume = finite(quote?.volume?.[i])
    const volume = rawVolume != null && rawVolume >= 0 ? rawVolume : null
    if (open == null || high == null || low == null || close == null || open <= 0 || high <= 0 || low <= 0 || close <= 0) { priceGap = true; continue }
    bars.push({ date, open, high, low, close, volume })
  }
  bars.sort((a, b) => a.date.localeCompare(b.date))
  const asOf = bars.at(-1)?.date ?? null
  const expected = expectedLastCompletedTradingDate(now)
  const stale = asOf == null || asOf < expected || priceGap
  return {
    symbol,
    bars,
    meta: bars.length
      ? {
          source: "Yahoo Finance Chart",
          asOf,
          freshness: stale ? "stale" : "delayed",
          status: stale ? "partial" : "ok",
          message: priceGap ? "已完成日線含價格缺值；策略停用" : stale ? `最後日線 ${asOf}，應至少更新至 ${expected}；策略停用` : "公開日線資料；非即時報價",
        }
      : {
          source: "Yahoo Finance Chart",
          asOf: null,
          freshness: "stale",
          status: "unavailable",
          message: "歷史行情目前無法取得",
        },
  }
}

export async function getHistory(symbol: string, days = 260): Promise<HistoryResult> {
  const range = days <= 70 ? "3mo" : days <= 140 ? "6mo" : days <= 260 ? "1y" : "2y"
  const key = `${symbol}:${range}`
  const hit = historyCache.get(key)
  if (hit && hit.expires > Date.now()) return hit.value
  const value = requestYahoo(symbol, range)
    .then(({ payload, capturedAt }) => parseYahooHistory(symbol, payload, new Date(), capturedAt))
    .catch(() => ({
      symbol,
      bars: [],
      meta: {
        source: "Yahoo Finance Chart" as const,
        asOf: null,
        freshness: "stale" as const,
        status: "unavailable" as const,
        message: "公開日線資料連線失敗，未以模擬值替代",
      },
    }))
  historyCache.set(key, { expires: Date.now() + HISTORY_TTL_MS, value })
  return value
}

export function historyToQuote(history: HistoryResult, name?: string): Quote | null {
  const latest = history.bars.at(-1)
  const previous = history.bars.at(-2)
  if (!latest || !previous) return null
  const previousClose = previous.close
  return {
    symbol: history.symbol,
    name: name ?? history.symbol,
    price: latest.close,
    change: latest.close - previousClose,
    changePercentage: ((latest.close - previousClose) / previousClose) * 100,
    dayLow: latest.low,
    dayHigh: latest.high,
    yearHigh: Math.max(...history.bars.slice(-252).map((bar) => bar.high)),
    yearLow: Math.min(...history.bars.slice(-252).map((bar) => bar.low)),
    marketCap: 0,
    open: latest.open,
    previousClose,
    exchange: "",
    volume: latest.volume ?? undefined,
    averageVolume20: history.bars.length >= 21 && history.bars.slice(-21, -1).every((bar) => bar.volume != null && bar.volume > 0) ? history.bars.slice(-21, -1).reduce((sum, bar) => sum + (bar.volume ?? 0), 0) / 20 : undefined,
    asOf: history.meta.asOf,
    source: history.meta.source,
    freshness: history.meta.freshness,
  }
}
