// Finnhub 為 MVP 唯一資料來源
// 免費額度：60 req/分鐘
// 端點分布：/quote · /stock/profile2 · /stock/metric · /search · /stock/financials-reported

import axios from "axios"
import type { Quote, Profile } from "@/types"

const BASE_URL = "https://finnhub.io/api/v1"
const FINNHUB_TIMEOUT_MS = 8000
const MAX_CONCURRENT_FINNHUB_REQUESTS = 4
const MAX_FINNHUB_ATTEMPTS = 3

let activeRequests = 0
const requestQueue: Array<() => void> = []

async function withFinnhubSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (activeRequests >= MAX_CONCURRENT_FINNHUB_REQUESTS) {
    await new Promise<void>((resolve) => requestQueue.push(resolve))
  }

  activeRequests += 1
  try {
    return await fn()
  } finally {
    activeRequests -= 1
    requestQueue.shift()?.()
  }
}

async function finnhubGet<T>(
  path: string,
  params: Record<string, string | number>,
  timeout = FINNHUB_TIMEOUT_MS
): Promise<T> {
  return withFinnhubSlot(async () => {
    let lastError: unknown
    for (let attempt = 1; attempt <= MAX_FINNHUB_ATTEMPTS; attempt += 1) {
      try {
        const { data } = await axios.get<T>(`${BASE_URL}${path}`, {
          params: { ...params, token: apiKey() },
          timeout,
        })
        return data
      } catch (err) {
        lastError = err
        if (!shouldRetryFinnhub(err) || attempt === MAX_FINNHUB_ATTEMPTS) break
        await sleep(250 * attempt)
      }
    }
    throw lastError
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shouldRetryFinnhub(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false
  const status = err.response?.status
  return (
    err.code === "ECONNABORTED" ||
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  )
}

function apiKey() {
  const key = process.env.FINNHUB_API_KEY
  if (!key) throw new Error("FINNHUB_API_KEY is not set")
  return key
}

// ─── 共用：error log + TTL cache ──────────────────────────────────────────────

function logError(op: string, symbol: string, err: unknown): void {
  if (axios.isAxiosError(err)) {
    console.warn(`[finnhub.${op}] ${symbol} failed`, {
      status: err.response?.status,
      code: err.code,
      msg: err.message,
    })
  } else {
    console.warn(`[finnhub.${op}] ${symbol} failed`, err)
  }
}

// profile2 與 metric 一天才更新一次 → 1 小時 TTL 足夠；quote 不快取（價格秒級變動）
// 儲存 promise 本身：並行呼叫自動共用同一個 in-flight request
const CACHE_TTL_MS = 60 * 60 * 1000
const cache = new Map<string, { promise: Promise<unknown>; expires: number }>()

function cached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  if (hit && hit.expires > Date.now()) return hit.promise as Promise<T>
  const promise = fetcher().catch((err) => {
    cache.delete(key)
    throw err
  })
  cache.set(key, { promise, expires: Date.now() + CACHE_TTL_MS })
  return promise as Promise<T>
}

// ─── Raw response shapes ─────────────────────────────────────────────────────

export interface FinnhubQuoteRaw {
  c: number | null // current price
  d: number | null // change
  dp: number | null // change percent
  h: number | null // day high
  l: number | null // day low
  o: number | null // open
  pc: number | null // previous close
  t: number | null // timestamp
}

interface FinnhubProfileRaw {
  name: string
  ticker: string
  exchange: string
  finnhubIndustry: string
  marketCapitalization: number // 單位：百萬美元
  logo: string
  weburl: string
  country: string
}

interface FinnhubMetricRaw {
  metric: Record<string, number | null | undefined>
}

interface FinnhubSearchRaw {
  count: number
  result: Array<{
    description: string
    displaySymbol: string
    symbol: string
    type: string
  }>
}

// ─── Raw fetchers (profile/metric 走 1 小時 cache) ─────────────────────────────

async function fetchQuoteRaw(symbol: string): Promise<FinnhubQuoteRaw> {
  return finnhubGet<FinnhubQuoteRaw>("/quote", { symbol })
}

function fetchProfileRaw(symbol: string): Promise<FinnhubProfileRaw> {
  return cached(`profile:${symbol}`, async () => {
    return finnhubGet<FinnhubProfileRaw>("/stock/profile2", { symbol })
  })
}

function fetchMetricRaw(symbol: string): Promise<FinnhubMetricRaw> {
  return cached(`metric:${symbol}`, async () => {
    return finnhubGet<FinnhubMetricRaw>("/stock/metric", { symbol, metric: "all" })
  })
}

// ─── Quote (含 metric 補齊 52W / P/E) ─────────────────────────────────────────

export async function getQuote(symbol: string): Promise<Quote | null> {
  try {
    const [quoteRes, metricRes, profileRes] = await Promise.allSettled([
      fetchQuoteRaw(symbol),
      fetchMetricRaw(symbol),
      fetchProfileRaw(symbol),
    ])

    if (quoteRes.status === "rejected") logError("getQuote/quote", symbol, quoteRes.reason)
    if (metricRes.status === "rejected") logError("getQuote/metric", symbol, metricRes.reason)
    if (profileRes.status === "rejected") logError("getQuote/profile", symbol, profileRes.reason)

    const quote = quoteRes.status === "fulfilled" ? quoteRes.value : null
    const metric = metricRes.status === "fulfilled" ? metricRes.value?.metric : null
    const profile = profileRes.status === "fulfilled" ? profileRes.value : null
    return normalizeFinnhubQuote(symbol, quote, metric, profile)
  } catch (err) {
    logError("getQuote", symbol, err)
    return null
  }
}

function validNumber(value: unknown, positive = false): number | null {
  if (value == null || value === "") return null
  const number = Number(value)
  return Number.isFinite(number) && (!positive || number > 0) ? number : null
}

export function normalizeFinnhubQuote(symbol: string, quote: FinnhubQuoteRaw | null, metric?: Record<string, number | null | undefined> | null, profile?: FinnhubProfileRaw | null, now = new Date()): Quote | null {
  const price = validNumber(quote?.c, true)
  const previousClose = validNumber(quote?.pc, true)
  const dayHigh = validNumber(quote?.h, true)
  const dayLow = validNumber(quote?.l, true)
  const open = validNumber(quote?.o, true)
  const timestamp = validNumber(quote?.t, true)
  if (price == null || previousClose == null || dayHigh == null || dayLow == null || open == null || timestamp == null) return null
  const reportedChange = validNumber(quote?.d)
  const reportedPercentage = validNumber(quote?.dp)
  const change = reportedChange ?? price - previousClose
  const changePercentage = reportedPercentage ?? (change / previousClose) * 100
  const ageMs = now.getTime() - timestamp * 1000
  if (!Number.isFinite(ageMs) || ageMs < -5 * 60 * 1000) return null
  const freshness = ageMs <= 15 * 60 * 1000 ? "live" : ageMs <= 7 * 86_400_000 ? "delayed" : "stale"
  return {
      symbol,
      name: profile?.name ?? symbol,
      logo: profile?.logo || undefined,
      price,
      change,
      changePercentage,
      dayLow,
      dayHigh,
      yearHigh: validNumber(metric?.["52WeekHigh"], true),
      yearLow: validNumber(metric?.["52WeekLow"], true),
      marketCap: validNumber(profile?.marketCapitalization, true) == null ? null : validNumber(profile?.marketCapitalization, true)! * 1_000_000,
      open,
      previousClose,
      pe: validNumber(metric?.peTTM ?? metric?.peAnnual, true) ?? undefined,
      exchange: profile?.exchange ?? "",
      asOf: new Date(timestamp * 1000).toISOString(),
      source: "Finnhub",
      freshness,
    }
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getProfile(symbol: string): Promise<Profile | null> {
  try {
    const [p, q] = await Promise.all([fetchProfileRaw(symbol), fetchQuoteRaw(symbol)])
    if (!p?.ticker) return null

    return {
      symbol: p.ticker,
      companyName: p.name,
      sector: p.finnhubIndustry || "",
      industry: p.finnhubIndustry || "",
      exchange: p.exchange || "",
      exchangeFullName: p.exchange || "",
      image: p.logo || "",
      website: p.weburl || "",
      marketCap: (p.marketCapitalization ?? 0) * 1_000_000,
      price: q?.c ?? 0,
      change: q?.d ?? 0,
      changePercentage: q?.dp ?? 0,
      country: p.country || "",
    }
  } catch (err) {
    logError("getProfile", symbol, err)
    return null
  }
}

// ─── Market Indices ──────────────────────────────────────────────────────────

// 三大指數 ETF — 顯示名稱（給 TickerBar / IndicesStrip 共用）
export const INDEX_NAMES: Record<string, string> = {
  SPY: "S&P 500",
  QQQ: "NASDAQ 100",
  DIA: "Dow Jones",
}

export async function getMarketIndices(): Promise<Quote[]> {
  const symbols = Object.keys(INDEX_NAMES)
  const results = await Promise.allSettled(symbols.map(getQuote))
  return results
    .map((r, i) => {
      if (r.status !== "fulfilled" || !r.value) return null
      const q = r.value
      q.name = INDEX_NAMES[symbols[i]] ?? symbols[i]
      return q
    })
    .filter((q): q is Quote => q !== null)
}

// ─── Symbol Search (含 fallback 至 symbol-only profile 查) ────────────────────

export interface SearchHit {
  symbol: string
  name: string
  logo?: string
  currency: string
  exchange: string
  exchangeFullName: string
}

export async function searchSymbols(query: string): Promise<SearchHit[]> {
  try {
    const data = await finnhubGet<FinnhubSearchRaw>("/search", { q: query, exchange: "US" }, 6000)
    if (!Array.isArray(data?.result)) return []
    return data.result
      .filter((r) => r.type === "Common Stock" || r.type === "ETP")
      .slice(0, 10)
      .map((r) => ({
        symbol: r.displaySymbol || r.symbol,
        name: r.description,
        logo: undefined,
        currency: "USD",
        exchange: "US",
        exchangeFullName: "US Exchange",
      }))
  } catch (err) {
    logError("searchSymbols", query, err)
    return []
  }
}

// ─── Batch Quotes（追蹤清單 / 持股用） ────────────────────────────────────────

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  const uniqueSymbols = Array.from(new Set(symbols.map((s) => s.trim().toUpperCase())))
  const results = await Promise.allSettled(uniqueSymbols.map(getQuote))
  return results
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((q): q is Quote => q !== null)
}

// ─── 給 AI 分析用的精簡基本面摘要 ─────────────────────────────────────────────

export interface FinancialSnapshot {
  symbol: string
  // 估值
  peTTM: number | null
  peAnnual: number | null
  pbAnnual: number | null
  psTTM: number | null
  // 獲利能力
  roeTTM: number | null
  roaTTM: number | null
  netMarginTTM: number | null
  grossMarginTTM: number | null
  // 財務健康
  debtToEquity: number | null
  currentRatio: number | null
  // 成長
  revenueGrowth3Y: number | null
  epsGrowth3Y: number | null
  // 規模
  marketCap: number | null
  // 區間
  week52High: number | null
  week52Low: number | null
  dividendYield: number | null
  nextEarningsDate: string | null
}

// ─── 公司新聞 ────────────────────────────────────────────────────────────────

export interface NewsItem {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  image: string
  publishedAt: string
  category: string
}

interface FinnhubNewsRaw {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  image: string
  datetime: number
  category: string
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function getCompanyNews(symbol: string, days = 7): Promise<NewsItem[]> {
  try {
    const to = new Date()
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000)
    const data = await finnhubGet<FinnhubNewsRaw[]>("/company-news", {
      symbol,
      from: isoDate(from),
      to: isoDate(to),
    })
    return (data ?? []).slice(0, 20).map((n) => ({
      id: n.id,
      headline: n.headline,
      summary: n.summary,
      source: n.source,
      url: n.url,
      image: n.image,
      publishedAt: new Date(n.datetime * 1000).toISOString(),
      category: n.category,
    }))
  } catch (err) {
    logError("getCompanyNews", symbol, err)
    return []
  }
}

// ─── 同業 peers ──────────────────────────────────────────────────────────────

export async function getPeers(symbol: string): Promise<string[]> {
  try {
    const data = await finnhubGet<string[]>("/stock/peers", { symbol })
    return (data ?? []).filter((s) => s && s !== symbol).slice(0, 8)
  } catch (err) {
    logError("getPeers", symbol, err)
    return []
  }
}

// ─── 給 AI 分析用的精簡基本面摘要（API route 重用） ───────────────────────────

export async function getFinancialSnapshot(symbol: string): Promise<FinancialSnapshot | null> {
  try {
    const data = await fetchMetricRaw(symbol)
    const m = data?.metric
    if (!m) return null

    const n = (v: unknown): number | null => {
      const x = Number(v)
      return v != null && v !== "" && !isNaN(x) && isFinite(x) ? x : null
    }

    return {
      symbol,
      peTTM: n(m.peTTM),
      peAnnual: n(m.peAnnual),
      pbAnnual: n(m.pbAnnual),
      psTTM: n(m.psTTM),
      roeTTM: n(m.roeTTM),
      roaTTM: n(m.roaTTM),
      netMarginTTM: n(m.netProfitMarginTTM),
      grossMarginTTM: n(m.grossMarginTTM),
      debtToEquity: n(m["totalDebt/totalEquityAnnual"]),
      currentRatio: n(m.currentRatioAnnual),
      revenueGrowth3Y: n(m.revenueGrowth3Y),
      epsGrowth3Y: n(m.epsGrowth3Y),
      marketCap: n(m.marketCapitalization) == null ? null : n(m.marketCapitalization)! * 1_000_000,
      week52High: n(m["52WeekHigh"]),
      week52Low: n(m["52WeekLow"]),
      dividendYield: n(m.currentDividendYieldTTM),
      nextEarningsDate: await getNextEarningsDate(symbol),
    }
  } catch (err) {
    logError("getFinancialSnapshot", symbol, err)
    return null
  }
}

interface FinnhubEarningsCalendarRaw { earningsCalendar?: Array<{ date?: string; symbol?: string }> }
export async function getNextEarningsDate(symbol: string): Promise<string | null> {
  try {
    const from = new Date(); const to = new Date(from.getTime() + 120 * 86_400_000)
    const data = await finnhubGet<FinnhubEarningsCalendarRaw>("/calendar/earnings", { symbol, from: isoDate(from), to: isoDate(to) })
    return data.earningsCalendar?.map((item) => item.date).filter((date): date is string => Boolean(date)).sort()[0] ?? null
  } catch (error) { logError("getNextEarningsDate", symbol, error); return null }
}
