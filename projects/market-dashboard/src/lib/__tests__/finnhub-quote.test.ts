import { describe, expect, it } from "vitest"
import { normalizeFinnhubQuote, type FinnhubQuoteRaw } from "@/lib/api/finnhub"

const now = new Date("2026-08-07T20:10:00Z")
const base: FinnhubQuoteRaw = { c: 100, d: 1, dp: 1.01, h: 102, l: 98, o: 99, pc: 99, t: now.getTime() / 1000 }

describe("Finnhub 報價正規化", () => {
  it("缺漲跌值時由現價與前收推導，缺52週資料保留null", () => {
    const quote = normalizeFinnhubQuote("AAA", { ...base, d: null, dp: null }, {}, null, now)
    expect(quote).toMatchObject({ change: 1, yearHigh: null, yearLow: null, freshness: "live" })
    expect(quote?.changePercentage).toBeCloseTo(1.0101, 3)
  })
  it("拒絕Infinity價格與缺少核心OHLC", () => {
    expect(normalizeFinnhubQuote("AAA", { ...base, c: Infinity }, {}, null, now)).toBeNull()
    expect(normalizeFinnhubQuote("AAA", { ...base, h: null }, {}, null, now)).toBeNull()
  })
  it("依供應商timestamp標示延遲或過期", () => {
    const delayed = normalizeFinnhubQuote("AAA", { ...base, t: Date.parse("2026-08-07T19:00:00Z") / 1000 }, {}, null, now)
    const stale = normalizeFinnhubQuote("AAA", { ...base, t: Date.parse("2026-07-20T20:00:00Z") / 1000 }, {}, null, now)
    expect(delayed?.freshness).toBe("delayed"); expect(stale?.freshness).toBe("stale")
  })
})
