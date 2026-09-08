import { describe, expect, it } from "vitest"
import { expectedLastCompletedTradingDate, isCompletedDailyBar, parseYahooHistory } from "@/lib/market-data"

function payload(timestamp: number, volume: number | null = 100) { return { chart: { result: [{ timestamp: [timestamp], indicators: { quote: [{ open: [100], high: [102], low: [99], close: [101], volume: [volume] }] } }] } } }

describe("日線資料完整性", () => {
  it("盤中 bar 不進入策略，早收盤日依 13:00 判斷", () => {
    const ts = Date.parse("2026-08-07T14:00:00Z") / 1000
    expect(parseYahooHistory("AAA", payload(ts), new Date("2026-08-07T19:55:00Z")).bars).toHaveLength(0)
    expect(isCompletedDailyBar("2026-11-27", new Date("2026-11-27T18:01:00Z"))).toBe(true)
    expect(parseYahooHistory("AAA", payload(ts), new Date("2026-08-07T20:01:00Z"), new Date("2026-08-07T19:55:00Z")).bars).toHaveLength(0)
  })
  it("null 成交量不會被轉成零量真值", () => {
    const ts = Date.parse("2026-08-06T14:00:00Z") / 1000
    expect(parseYahooHistory("AAA", payload(ts, null), new Date("2026-08-07T21:00:00Z")).bars[0].volume).toBeNull()
  })
  it("假日後保守判斷應完成交易日", () => {
    expect(expectedLastCompletedTradingDate(new Date("2026-09-08T14:00:00Z"))).toBe("2026-09-04")
  })
})
