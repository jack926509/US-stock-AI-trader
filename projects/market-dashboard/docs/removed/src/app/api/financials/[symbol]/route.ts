import { db } from "@/lib/db"
import { financialCache } from "@/lib/db/schema"
import {
  getIncomeStatements,
  getBalanceSheets,
  getCashFlowStatements,
  getKeyMetrics,
  getFinancialRatios,
} from "@/lib/api/fmp"
import { getFinnhubKeyMetrics } from "@/lib/api/finnhub"
import { validateSymbol } from "@/lib/validations"
import { and, eq } from "drizzle-orm"

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function isCacheValid(fetchedAt: string | null): boolean {
  if (!fetchedAt) return false
  return Date.now() - new Date(fetchedAt).getTime() < CACHE_TTL_MS
}

async function getCachedOrFetch<T>(
  symbol: string,
  reportType: string,
  period: string,
  fetcher: () => Promise<T>
): Promise<T | null> {
  const cacheKey = `list_${period}`

  const cached = await db
    .select()
    .from(financialCache)
    .where(
      and(
        eq(financialCache.symbol, symbol),
        eq(financialCache.reportType, reportType),
        eq(financialCache.period, period),
        eq(financialCache.fiscalYear, cacheKey)
      )
    )
    .limit(1)

  if (cached.length > 0 && isCacheValid(cached[0].fetchedAt)) {
    return JSON.parse(cached[0].data) as T
  }

  const fresh = await fetcher()

  const hasData = Array.isArray(fresh) ? (fresh as unknown[]).length > 0 : fresh != null
  if (hasData) {
    await db
      .insert(financialCache)
      .values({
        symbol,
        reportType,
        period,
        fiscalYear: cacheKey,
        data: JSON.stringify(fresh),
      })
      .onConflictDoUpdate({
        target: [
          financialCache.symbol,
          financialCache.reportType,
          financialCache.period,
          financialCache.fiscalYear,
        ],
        set: {
          data: JSON.stringify(fresh),
          fetchedAt: new Date().toISOString(),
        },
      })
    return fresh
  }

  // Fresh fetch returned empty (likely API quota) — fall back to stale cache
  if (cached.length > 0) {
    return JSON.parse(cached[0].data) as T
  }

  return fresh
}

// GET /api/financials/[symbol]?period=annual|quarterly
export async function GET(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: rawSymbol } = await params
    const symbol = rawSymbol.toUpperCase()

    if (!validateSymbol(symbol)) {
      return Response.json({ error: "Invalid symbol", code: "INVALID_SYMBOL" }, { status: 400 })
    }

    const url = new URL(req.url)
    const period = url.searchParams.get("period") === "quarterly" ? "quarterly" : "annual"

    // keyMetrics and ratios are always annual (used for scoring & overview)
    const [income, balance, cashflow, keyMetrics, ratios] = await Promise.all([
      getCachedOrFetch(symbol, "income", period, () => getIncomeStatements(symbol, period, 5)),
      getCachedOrFetch(symbol, "balance", period, () => getBalanceSheets(symbol, period, 5)),
      getCachedOrFetch(symbol, "cashflow", period, () => getCashFlowStatements(symbol, period, 5)),
      getCachedOrFetch(symbol, "keyMetrics", "annual", () => getKeyMetrics(symbol, "annual", 5)),
      getCachedOrFetch(symbol, "ratios", "annual", () => getFinancialRatios(symbol, "annual", 5)),
    ])

    // If FMP keyMetrics/ratios unavailable (quota), fall back to Finnhub metric endpoint
    let resolvedKeyMetrics = keyMetrics ?? []
    let resolvedRatios = ratios ?? []
    if (!resolvedKeyMetrics.length || !resolvedRatios.length) {
      const fhMetrics = await getFinnhubKeyMetrics(symbol)
      if (!resolvedKeyMetrics.length && fhMetrics.keyMetrics) resolvedKeyMetrics = [fhMetrics.keyMetrics]
      if (!resolvedRatios.length && fhMetrics.ratios) resolvedRatios = [fhMetrics.ratios]
    }

    return Response.json({
      income: income ?? [],
      balance: balance ?? [],
      cashflow: cashflow ?? [],
      keyMetrics: resolvedKeyMetrics,
      ratios: resolvedRatios,
    })
  } catch (err) {
    console.error("[GET /api/financials]", err)
    return Response.json({ error: "Failed to fetch financial data", code: "API_ERROR" }, { status: 500 })
  }
}
