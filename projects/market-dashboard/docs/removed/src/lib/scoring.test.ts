import { describe, it, expect } from "vitest"
import { calculateScore } from "../scoring"
import type { FmpKeyMetrics, FmpRatios } from "../api/fmp"

function makeKm(overrides: Partial<FmpKeyMetrics> = {}): FmpKeyMetrics {
  return {
    symbol: "TEST",
    date: "2024-12-31",
    revenuePerShare: 10,
    netIncomePerShare: 1.5,
    roe: 0.18,
    roa: 0.10,
    roic: 0.14,
    debtToEquity: 0.5,
    currentRatio: 1.8,
    quickRatio: 1.4,
    peRatio: 20,
    pbRatio: 3,
    psRatio: 4,
    evToEbitda: 12,
    pegRatio: 1.2,
    freeCashFlowYield: 0.05,
    earningsYield: 0.05,
    dividendYield: 0.01,
    ...overrides,
  }
}

function makeRatios(overrides: Partial<FmpRatios> = {}): FmpRatios {
  return {
    symbol: "TEST",
    date: "2024-12-31",
    grossProfitMargin: 0.55,
    operatingProfitMargin: 0.20,
    netProfitMargin: 0.15,
    returnOnEquity: 0.18,
    returnOnAssets: 0.10,
    returnOnCapitalEmployed: 0.14,
    debtEquityRatio: 0.5,
    currentRatio: 1.8,
    quickRatio: 1.4,
    interestCoverage: 8,
    priceToEarningsRatio: 20,
    priceToBookRatioTTM: 3,
    priceToSalesRatioTTM: 4,
    enterpriseValueMultiple: 12,
    ...overrides,
  }
}

describe("calculateScore", () => {
  it("returns a total score between 0 and 100", () => {
    const result = calculateScore([makeKm()], [makeRatios()])
    expect(result.total).toBeGreaterThanOrEqual(0)
    expect(result.total).toBeLessThanOrEqual(100)
  })

  it("returns higher score for strong financials", () => {
    const km = makeKm({ peRatio: 12, pegRatio: 0.8, freeCashFlowYield: 0.08, debtToEquity: 0.1 })
    const r = makeRatios({ grossProfitMargin: 0.70, netProfitMargin: 0.25, returnOnEquity: 0.35, interestCoverage: 20 })
    const strong = calculateScore([km], [r])

    const kmWeak = makeKm({ peRatio: 80, pegRatio: 5, freeCashFlowYield: 0.01, debtToEquity: 3 })
    const rWeak = makeRatios({ grossProfitMargin: 0.10, netProfitMargin: 0.02, returnOnEquity: 0.05, debtEquityRatio: 3 })
    const weak = calculateScore([kmWeak], [rWeak])

    expect(strong.total).toBeGreaterThan(weak.total)
  })

  it("returns A-range grade for excellent financials", () => {
    const km = makeKm({ peRatio: 12, pegRatio: 0.8, freeCashFlowYield: 0.08, debtToEquity: 0.1 })
    const r = makeRatios({ grossProfitMargin: 0.70, netProfitMargin: 0.25, returnOnEquity: 0.35, interestCoverage: 20 })
    const result = calculateScore([km], [r])
    expect(["A+", "A", "B+"]).toContain(result.grade)
  })

  it("detects Technology sector", () => {
    const result = calculateScore([makeKm()], [makeRatios()], "Information Technology")
    expect(result.sector).toBe("Technology")
    expect(result.sectorLabel).toBe("科技業")
  })

  it("detects Financials sector", () => {
    const result = calculateScore([makeKm()], [makeRatios()], "Financials")
    expect(result.sector).toBe("Financials")
  })

  it("falls back to default sector for unknown sector", () => {
    const result = calculateScore([makeKm()], [makeRatios()], "Consumer Staples")
    expect(result.sector).toBe("default")
  })

  it("returns 5 dimensions with weights summing to 100", () => {
    const result = calculateScore([makeKm()], [makeRatios()])
    expect(result.dimensions).toHaveLength(5)
    const total = result.dimensions.reduce((sum, d) => sum + d.weight, 0)
    expect(total).toBe(100)
  })

  it("handles empty arrays without throwing", () => {
    expect(() => calculateScore([], [])).not.toThrow()
    const result = calculateScore([], [])
    expect(result.total).toBeGreaterThanOrEqual(0)
    expect(result.total).toBeLessThanOrEqual(100)
  })
})
