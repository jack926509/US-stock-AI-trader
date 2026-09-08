import axios from "axios"

const BASE_URL = "https://financialmodelingprep.com/stable"

function apiKey() {
  const key = process.env.FMP_API_KEY
  if (!key) throw new Error("FMP_API_KEY is not set")
  return key
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FmpSearchResult {
  symbol: string
  name: string
  currency: string
  exchangeFullName: string
  exchange: string // e.g. "NASDAQ", "NYSE"
}

export interface FmpProfile {
  symbol: string
  companyName: string
  sector: string
  industry: string
  exchange: string
  exchangeFullName: string
  description: string
  image: string
  website: string
  marketCap: number
  beta: number
  price: number
  change: number
  changePercentage: number
  country: string
}

export interface FmpQuote {
  symbol: string
  name: string
  price: number
  changePercentage: number // note: stable API uses camelCase without extra 's'
  change: number
  dayLow: number
  dayHigh: number
  yearHigh: number
  yearLow: number
  marketCap: number
  exchange: string
  open: number
  previousClose: number
  volume: number
  pe?: number // from ratios-ttm, optionally merged
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchStocks(query: string): Promise<FmpSearchResult[]> {
  const { data } = await axios.get<FmpSearchResult[]>(`${BASE_URL}/search-symbol`, {
    params: { query, apikey: apiKey() },
  })
  return Array.isArray(data) ? data : []
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getCompanyProfile(symbol: string): Promise<FmpProfile | null> {
  try {
    const { data } = await axios.get<FmpProfile[]>(`${BASE_URL}/profile`, {
      params: { symbol, apikey: apiKey() },
    })
    return Array.isArray(data) && data.length > 0 ? data[0] : null
  } catch {
    return null
  }
}

// ─── Quote (single symbol only on free tier) ─────────────────────────────────

export async function getQuote(symbol: string): Promise<FmpQuote | null> {
  try {
    const { data } = await axios.get<FmpQuote[]>(`${BASE_URL}/quote`, {
      params: { symbol, apikey: apiKey() },
    })
    return Array.isArray(data) && data.length > 0 ? data[0] : null
  } catch {
    return null
  }
}

// Fetch multiple quotes concurrently (each is a separate API call on free tier)
export async function getQuotes(symbols: string[]): Promise<FmpQuote[]> {
  if (symbols.length === 0) return []
  const results = await Promise.allSettled(symbols.map((s) => getQuote(s)))
  return results
    .filter((r): r is PromiseFulfilledResult<FmpQuote> => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value)
}

// ─── Market Indices (ETF proxies) ─────────────────────────────────────────────

export async function getMarketIndices(): Promise<FmpQuote[]> {
  // SPY ≈ S&P 500, QQQ ≈ NASDAQ 100, DIA ≈ Dow Jones
  return getQuotes(["SPY", "QQQ", "DIA"])
}

// ─── Financial Statements ─────────────────────────────────────────────────────

export interface FmpIncomeStatement {
  date: string
  symbol: string
  reportedCurrency: string
  revenue: number
  costOfRevenue: number
  grossProfit: number
  grossProfitRatio: number
  operatingExpenses: number
  operatingIncome: number
  operatingIncomeRatio: number
  netIncome: number
  netIncomeRatio: number
  eps: number
  epsDiluted: number
  ebitda: number
  weightedAverageShsOut: number
}

export interface FmpBalanceSheet {
  date: string
  symbol: string
  totalAssets: number
  totalLiabilities: number
  totalStockholdersEquity: number
  cashAndCashEquivalents: number
  shortTermInvestments: number
  inventory: number
  totalDebt: number
  longTermDebt: number
  retainedEarnings: number
  goodwill: number
}

export interface FmpCashFlowStatement {
  date: string
  symbol: string
  operatingCashFlow: number
  capitalExpenditure: number
  freeCashFlow: number
  dividendsPaid: number
  commonStockRepurchased: number
  netCashUsedForInvestingActivites: number
  netCashUsedProvidedByFinancingActivities: number
}

export interface FmpKeyMetrics {
  date: string
  symbol: string
  revenuePerShare: number
  netIncomePerShare: number
  roe: number
  roa: number
  roic: number
  debtToEquity: number
  currentRatio: number
  quickRatio: number
  peRatio: number
  pbRatio: number
  psRatio: number
  evToEbitda: number
  pegRatio: number
  freeCashFlowYield: number
  earningsYield: number
  dividendYield: number
}

export interface FmpRatios {
  date: string
  symbol: string
  grossProfitMargin: number
  operatingProfitMargin: number
  netProfitMargin: number
  returnOnEquity: number
  returnOnAssets: number
  returnOnCapitalEmployed: number
  debtEquityRatio: number
  currentRatio: number
  quickRatio: number
  interestCoverage: number
  priceToEarningsRatio: number
  priceToBookRatioTTM: number
  priceToSalesRatioTTM: number
  enterpriseValueMultiple: number
}

async function fetchFinancials<T>(endpoint: string, symbol: string, period = "annual", limit = 5): Promise<T[]> {
  try {
    const { data } = await axios.get<T[]>(`${BASE_URL}/${endpoint}`, {
      params: { symbol, period, limit, apikey: apiKey() },
    })
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function getIncomeStatements(symbol: string, period = "annual", limit = 5) {
  return fetchFinancials<FmpIncomeStatement>("income-statement", symbol, period, limit)
}

export function getBalanceSheets(symbol: string, period = "annual", limit = 5) {
  return fetchFinancials<FmpBalanceSheet>("balance-sheet-statement", symbol, period, limit)
}

export function getCashFlowStatements(symbol: string, period = "annual", limit = 5) {
  return fetchFinancials<FmpCashFlowStatement>("cash-flow-statement", symbol, period, limit)
}

export function getKeyMetrics(symbol: string, period = "annual", limit = 5) {
  return fetchFinancials<FmpKeyMetrics>("key-metrics", symbol, period, limit)
}

export function getFinancialRatios(symbol: string, period = "annual", limit = 5) {
  return fetchFinancials<FmpRatios>("ratios", symbol, period, limit)
}
