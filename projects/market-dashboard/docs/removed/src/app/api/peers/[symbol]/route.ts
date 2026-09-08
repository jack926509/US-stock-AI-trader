import axios from "axios"
import { validateSymbol } from "@/lib/validations"
import { getFinnhubProfile, getFinnhubQuote, getFinnhubPeers } from "@/lib/api/finnhub"

// Fetch YoY revenue growth from Finnhub /stock/metric (no FMP daily limit)
async function getFinnhubRevenueGrowth(symbol: string): Promise<number | null> {
  try {
    const key = process.env.FINNHUB_API_KEY
    if (!key) return null
    const { data } = await axios.get<{ metric: Record<string, unknown> }>(
      `https://finnhub.io/api/v1/stock/metric`,
      { params: { symbol, metric: "all", token: key }, timeout: 5000 }
    )
    const m = data?.metric
    if (!m) return null
    // Finnhub returns revenue growth in % (0–100); convert to decimal
    const raw = Number(m.revenueGrowthTTMYoy ?? m.revenueGrowthQuarterlyYoy ?? m.revenueGrowth3Y ?? m.revenueGrowth5Y)
    return isFinite(raw) && raw !== 0 ? raw / 100 : null
  } catch {
    return null
  }
}

// ─── Curated industry peer map (last-resort fallback) ─────────────────────────
const CURATED_PEERS: Record<string, string[]> = {
  // Airlines
  DAL: ["UAL","AAL","LUV","JBLU","ALK","SAVE","ALGT"],
  UAL: ["DAL","AAL","LUV","JBLU","ALK","SAVE"],
  AAL: ["DAL","UAL","LUV","JBLU","ALK","SAVE"],
  LUV: ["DAL","UAL","AAL","JBLU","ALK","SAVE"],
  JBLU: ["DAL","UAL","AAL","LUV","ALK","SAVE"],
  ALK: ["DAL","UAL","AAL","LUV","JBLU"],
  // Big Tech
  AAPL: ["MSFT","GOOGL","META","AMZN","NVDA"],
  MSFT: ["AAPL","GOOGL","META","AMZN","NVDA"],
  GOOGL: ["AAPL","MSFT","META","AMZN"],
  META:  ["AAPL","MSFT","GOOGL","SNAP","PINS"],
  AMZN: ["MSFT","GOOGL","AAPL","WMT","COST"],
  NVDA: ["AMD","INTC","QCOM","AVGO","MU"],
  AMD:  ["NVDA","INTC","QCOM","AVGO","MU"],
  INTC: ["NVDA","AMD","QCOM","AVGO","MU"],
  // EV / Auto
  TSLA: ["F","GM","RIVN","LCID","NIO","LI"],
  F:    ["GM","TSLA","STLA","HMC","TM"],
  GM:   ["F","TSLA","STLA","HMC","TM"],
  // Financials
  JPM: ["BAC","WFC","C","GS","MS"],
  BAC: ["JPM","WFC","C","GS","MS"],
  WFC: ["JPM","BAC","C","USB","PNC"],
  GS:  ["MS","JPM","BAC","C","BX"],
  MS:  ["GS","JPM","BAC","C","BX"],
  // Energy
  XOM: ["CVX","COP","OXY","SLB","EOG"],
  CVX: ["XOM","COP","OXY","SLB","EOG"],
  // Pharma / Biotech
  JNJ: ["PFE","ABBV","MRK","LLY","BMY"],
  PFE: ["JNJ","ABBV","MRK","LLY","BMY","MRNA"],
  LLY: ["JNJ","PFE","ABBV","MRK","BMY"],
  // Retail
  WMT: ["AMZN","COST","TGT","HD","LOW"],
  COST: ["WMT","TGT","BJ","AMZN"],
  TGT: ["WMT","COST","AMZN","KR"],
  // Streaming / Media
  NFLX: ["DIS","PARA","WBD","SPOT","ROKU"],
  DIS:  ["NFLX","PARA","WBD","CMCSA"],
}

const FMP_STABLE = "https://financialmodelingprep.com/stable"
const FMP_V3 = "https://financialmodelingprep.com/api/v3"

function apiKey() {
  const key = process.env.FMP_API_KEY
  if (!key) throw new Error("FMP_API_KEY is not set")
  return key
}

export interface PeerData {
  symbol: string
  companyName: string
  marketCap: number
  price: number
  peRatio: number | null
  pbRatio: number | null
  psRatio: number | null
  evToEbitda: number | null
  roe: number | null
  grossMargin: number | null
  revenueGrowth: number | null
  sector: string
  isTarget: boolean
}

async function fetchPeerData(symbol: string): Promise<PeerData | null> {
  try {
    // Fetch FMP data + Finnhub revenue growth in parallel
    const [profileRes, metricsRes, ratiosRes, revenueGrowth] = await Promise.allSettled([
      axios.get<Record<string, unknown>[]>(`${FMP_STABLE}/profile`, {
        params: { symbol, apikey: apiKey() },
        timeout: 8000,
      }),
      axios.get<Record<string, unknown>[]>(`${FMP_STABLE}/key-metrics`, {
        params: { symbol, period: "annual", limit: 1, apikey: apiKey() },
        timeout: 8000,
      }),
      axios.get<Record<string, unknown>[]>(`${FMP_STABLE}/ratios`, {
        params: { symbol, period: "annual", limit: 1, apikey: apiKey() },
        timeout: 8000,
      }),
      getFinnhubRevenueGrowth(symbol), // Finnhub: no daily limit
    ])

    const profileData = profileRes.status === "fulfilled" ? profileRes.value.data : null
    const profile = Array.isArray(profileData) ? profileData[0] : null
    const revGrowth = revenueGrowth.status === "fulfilled" ? revenueGrowth.value : null

    // FMP unavailable — Finnhub fallback for basic data
    if (!profile) {
      const [fhProf, fhQuote] = await Promise.all([
        getFinnhubProfile(symbol).catch(() => null),
        getFinnhubQuote(symbol).catch(() => null),
      ])
      if (!fhProf && !fhQuote) return null

      // Use Finnhub /stock/metric for financial ratios in fallback path
      const { getFinnhubKeyMetrics } = await import("@/lib/api/finnhub")
      const { keyMetrics: fhKm, ratios: fhRt } = await getFinnhubKeyMetrics(symbol).catch(() => ({ keyMetrics: null, ratios: null }))

      return {
        symbol,
        companyName: fhProf?.name ?? symbol,
        marketCap: fhQuote?.marketCap ?? 0,
        price: fhQuote?.price ?? 0,
        sector: fhProf?.finnhubIndustry ?? "",
        peRatio: fhQuote?.pe ?? fhKm?.peRatio ?? null,
        pbRatio: fhKm?.pbRatio ?? null,
        psRatio: fhKm?.psRatio ?? null,
        evToEbitda: fhKm?.evToEbitda ?? null,
        roe: fhKm?.roe ?? fhRt?.returnOnEquity ?? null,
        grossMargin: fhRt?.grossProfitMargin ?? null,
        revenueGrowth: revGrowth,
        isTarget: false,
      }
    }

    const km = metricsRes.status === "fulfilled" && Array.isArray(metricsRes.value.data)
      ? metricsRes.value.data[0] ?? null : null
    const rt = ratiosRes.status === "fulfilled" && Array.isArray(ratiosRes.value.data)
      ? ratiosRes.value.data[0] ?? null : null

    function num(v: unknown): number | null {
      const n = Number(v)
      return v != null && !isNaN(n) && isFinite(n) && n !== 0 ? n : null
    }

    return {
      symbol,
      companyName: String(profile.companyName ?? symbol),
      marketCap: Number(profile.marketCap ?? 0),
      price: Number(profile.price ?? 0),
      sector: String(profile.sector ?? ""),
      // Try multiple field name variants (stable API vs v3 naming differ)
      peRatio: num(km?.peRatio) ?? num(rt?.priceToEarningsRatio) ?? num(rt?.peRatio),
      pbRatio: num(km?.pbRatio) ?? num(km?.priceToBookRatio) ?? num(rt?.priceToBookRatioTTM) ?? num(rt?.priceToBookRatio),
      psRatio: num(km?.psRatio) ?? num(km?.priceToSalesRatio) ?? num(rt?.priceToSalesRatioTTM) ?? num(rt?.priceToSalesRatio),
      evToEbitda: num(km?.evToEbitda) ?? num(km?.enterpriseValueOverEBITDA) ?? num(rt?.enterpriseValueMultiple),
      roe: num(km?.roe) ?? num(km?.returnOnEquity) ?? num(rt?.returnOnEquity),
      grossMargin: num(rt?.grossProfitMargin) ?? num(km?.grossProfitMargin),
      revenueGrowth: revGrowth, // from Finnhub TTM YoY
      isTarget: false,
    }
  } catch {
    return null
  }
}

// Fallback: sector-based screener when v4/stock_peers is unavailable
async function getPeersFromScreener(
  sector: string,
  exchange: string,
  targetSymbol: string,
  targetMarketCap: number,
): Promise<string[]> {
  try {
    interface ScreenerItem { symbol: string; marketCap: number; isEtf: boolean }
    const exchangeShort = exchange.includes("NASDAQ") ? "NASDAQ"
      : exchange.includes("NYSE") ? "NYSE"
      : exchange
    const { data } = await axios.get<ScreenerItem[]>(`${FMP_V3}/stock-screener`, {
      params: {
        sector,
        exchange: exchangeShort,
        isEtf: false,
        limit: 30,
        apikey: apiKey(),
      },
      timeout: 8000,
    })
    if (!Array.isArray(data) || data.length === 0) return []

    return data
      .filter((s) => s.symbol !== targetSymbol && !s.isEtf && s.marketCap > 0)
      .sort((a, b) => {
        const diffA = Math.abs(Math.log(a.marketCap / Math.max(targetMarketCap, 1)))
        const diffB = Math.abs(Math.log(b.marketCap / Math.max(targetMarketCap, 1)))
        return diffA - diffB
      })
      .slice(0, 5)
      .map((s) => s.symbol)
  } catch {
    return []
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: raw } = await params
    const symbol = raw.toUpperCase()

    if (!validateSymbol(symbol)) {
      return Response.json({ error: "Invalid symbol" }, { status: 400 })
    }

    // Fetch target profile first
    let targetSector = ""
    let targetExchange = ""
    let targetMarketCap = 0
    try {
      const { data } = await axios.get<Record<string, unknown>[]>(`${FMP_STABLE}/profile`, {
        params: { symbol, apikey: apiKey() },
        timeout: 8000,
      })
      const p = Array.isArray(data) ? data[0] : null
      if (p) {
        targetSector = String(p.sector ?? "")
        targetExchange = String(p.exchange ?? p.exchangeFullName ?? "")
        targetMarketCap = Number(p.marketCap ?? 0)
      }
    } catch { /* ignore */ }

    // ── 1. FMP v4/stock_peers (industry-level, best quality) ──────────────────
    let peerSymbols: string[] = []
    try {
      const { data } = await axios.get<Array<{ peersList: string[] }>>(
        `https://financialmodelingprep.com/api/v4/stock_peers`,
        { params: { symbol, apikey: apiKey() }, timeout: 8000 }
      )
      if (Array.isArray(data) && data[0]?.peersList) {
        peerSymbols = data[0].peersList.slice(0, 7)
      }
    } catch { /* may not be available on free tier */ }

    // ── 2. Finnhub /stock/peers (industry-level, free, reliable) ──────────────
    if (peerSymbols.length === 0) {
      peerSymbols = await getFinnhubPeers(symbol)
    }

    // ── 3. FMP sector screener (sector-level, broader) ────────────────────────
    if (peerSymbols.length === 0 && targetSector) {
      peerSymbols = await getPeersFromScreener(targetSector, targetExchange, symbol, targetMarketCap)
    }

    // ── 4. Curated map (hardcoded last resort) ─────────────────────────────────
    if (peerSymbols.length === 0 && CURATED_PEERS[symbol]) {
      peerSymbols = CURATED_PEERS[symbol]
    }

    const allSymbols = [symbol, ...peerSymbols.filter((s) => s !== symbol)].slice(0, 8)
    const results = await Promise.all(allSymbols.map((s) => fetchPeerData(s)))
    const peers = results.filter(Boolean) as PeerData[]

    if (peers.length > 0) peers[0].isTarget = true

    return Response.json(peers)
  } catch (err) {
    console.error("[GET /api/peers]", err)
    return Response.json({ error: "Failed to fetch peers" }, { status: 500 })
  }
}
