// MVP 共用型別 — Finnhub 為唯一資料來源，欄位以實際可取得為準

export interface Quote {
  symbol: string
  name: string
  logo?: string
  price: number
  change: number
  changePercentage: number
  dayLow: number
  dayHigh: number
  yearHigh: number | null
  yearLow: number | null
  marketCap: number | null
  open: number
  previousClose: number
  pe?: number
  exchange: string
  volume?: number
  averageVolume20?: number
  asOf?: string | null
  source?: string
  freshness?: "live" | "delayed" | "stale"
}

export interface Profile {
  symbol: string
  companyName: string
  sector: string
  industry: string
  exchange: string
  exchangeFullName: string
  image: string
  website: string
  marketCap: number
  price: number
  change: number
  changePercentage: number
  country: string
}

// 追蹤清單（本機 Node server 私有檔案持久化）
export interface WatchlistItem {
  symbol: string
  name: string
  logo?: string | null
  sector?: string | null
  addedAt: string
}

// AI 分析報告（不持久化，每次 fetch 重新生成）
export type AnalysisRating = "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell"

export interface AnalysisReport {
  symbol: string
  content: string // Markdown
  rating?: AnalysisRating | null
  targetPriceLow?: number | null
  targetPriceHigh?: number | null
  generatedAt: string
}

// API 錯誤
export type ApiErrorCode = "INVALID_SYMBOL" | "NOT_FOUND" | "API_ERROR" | "RATE_LIMIT"

export interface ApiError {
  error: string
  code: ApiErrorCode
}
