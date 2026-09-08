import { describe, expect, it } from "vitest"
import { scanStrategies } from "@/lib/strategies"
import type { DailyBar, DataMeta } from "@/lib/market-data"

const meta: DataMeta = { source: "Yahoo Finance Chart", asOf: "2026-08-07", freshness: "delayed", status: "ok" }
function bars(closes: number[], volumes?: number[]): DailyBar[] {
  return closes.map((close, index) => ({ date: new Date(Date.UTC(2026, 0, index + 1)).toISOString().slice(0, 10), open: close, high: close + 1, low: close - 1, close, volume: volumes?.[index] ?? 100 }))
}
const signal = (result: ReturnType<typeof scanStrategies>, id: string) => result.signals.find((item) => item.id === id)!

describe("可解釋策略掃描", () => {
  it("辨識 50 日均線向上穿越並提供數值證據", () => {
    const stock = bars([...Array(63).fill(100), 90, 102]); const result = scanStrategies("AAA", stock, stock, meta, meta)
    expect(signal(result, "ma-breakout").state).toBe("hit"); expect(signal(result, "ma-breakout").evidence).toHaveProperty("均線50")
  })
  it("量增突破排除訊號日本身計算前高與均量", () => {
    const stock = bars([...Array(64).fill(100), 103], [...Array(64).fill(100), 160])
    expect(signal(scanStrategies("AAA", stock, stock, meta, meta), "volume-breakout").state).toBe("hit")
  })
  it("辨識多頭排列中回測並收回 20 日線", () => {
    const closes = [...Array(45).fill(80), ...Array(20).fill(100)]
    const stock = bars(closes); stock.at(-1)!.low = 99
    expect(signal(scanStrategies("AAA", stock, stock, meta, meta), "pullback").state).toBe("hit")
  })
  it("依共同交易日辨識相對 SPY 強勢", () => {
    const stock = bars([...Array(64).fill(100), 110]); const spy = bars(Array(65).fill(100))
    expect(signal(scanStrategies("AAA", stock, spy, meta, meta), "relative-strength").state).toBe("hit")
  })
  it("平盤資料的四個策略都不會命中", () => {
    const flat = bars(Array(65).fill(100)); const result = scanStrategies("AAA", flat, flat, meta, meta)
    expect(result.signals.every((item) => item.state !== "hit")).toBe(true)
  })
  it("缺量、基準未對齊、過期與 NaN 不產生假訊號", () => {
    const stock = bars(Array(65).fill(100)); stock.at(-1)!.volume = 0
    expect(signal(scanStrategies("AAA", stock, bars(Array(64).fill(100)), meta, meta), "volume-breakout").state).toBe("unavailable")
    const gap = bars([...Array(64).fill(100), 103], [...Array(64).fill(100), 200]); gap[50].high = 200; gap[50].volume = null
    expect(signal(scanStrategies("AAA", gap, gap, meta, meta), "volume-breakout").state).toBe("unavailable")
    expect(signal(scanStrategies("AAA", stock, bars(Array(64).fill(100)), meta, meta), "relative-strength").state).toBe("unavailable")
    expect(scanStrategies("AAA", stock, stock, { ...meta, freshness: "stale" }, meta).signals.every((item) => item.state === "unavailable")).toBe(true)
    stock[2].close = Number.NaN
    expect(scanStrategies("AAA", stock, stock, meta, meta).signals.every((item) => item.state === "unavailable")).toBe(true)
  })
})
