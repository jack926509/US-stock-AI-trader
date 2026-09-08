import type { DailyBar, DataMeta } from "@/lib/market-data"

export type StrategyId = "ma-breakout" | "volume-breakout" | "pullback" | "relative-strength"
export type StrategyState = "hit" | "miss" | "unavailable"

export interface StrategySignal {
  id: StrategyId
  label: string
  state: StrategyState
  reason: string
  evidence: Record<string, number | string>
}

export interface ScanResult {
  symbol: string
  asOf: string | null
  source: string
  signals: StrategySignal[]
}

const round = (value: number) => Math.round(value * 100) / 100
const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length

function unavailable(id: StrategyId, label: string, reason: string): StrategySignal {
  return { id, label, state: "unavailable", reason, evidence: {} }
}

function validBars(bars: DailyBar[]): boolean {
  return bars.every((bar, index) =>
    /^\d{4}-\d{2}-\d{2}$/.test(bar.date) &&
    (index === 0 || bars[index - 1].date < bar.date) &&
    [bar.open, bar.high, bar.low, bar.close].every(Number.isFinite) &&
    (bar.volume == null || (Number.isFinite(bar.volume) && bar.volume >= 0)) &&
    bar.open > 0 && bar.high > 0 && bar.low > 0 && bar.close > 0 &&
    bar.high >= Math.max(bar.open, bar.close, bar.low) && bar.low <= Math.min(bar.open, bar.close, bar.high)
  )
}

export function scanStrategies(symbol: string, bars: DailyBar[], benchmarkBars: DailyBar[], meta: DataMeta, benchmarkMeta: DataMeta = meta): ScanResult {
  const definitions: Array<[StrategyId, string]> = [
    ["ma-breakout", "均線突破"],
    ["volume-breakout", "量增突破"],
    ["pullback", "多頭回檔"],
    ["relative-strength", "相對強勢"],
  ]
  if (meta.status === "unavailable" || meta.freshness === "stale") {
    return { symbol, asOf: meta.asOf, source: meta.source, signals: definitions.map(([id, label]) => unavailable(id, label, meta.message ?? "行情不可用")) }
  }
  if (!validBars(bars)) {
    return { symbol, asOf: meta.asOf, source: meta.source, signals: definitions.map(([id, label]) => unavailable(id, label, "日線包含缺值、重複日期或無效 OHLCV")) }
  }
  if (bars.length < 65) {
    return { symbol, asOf: meta.asOf, source: meta.source, signals: definitions.map(([id, label]) => unavailable(id, label, `日線僅 ${bars.length} 根，至少需要 65 根已收盤資料`)) }
  }

  const latest = bars.at(-1)!
  const previous = bars.at(-2)!
  const prior20 = bars.slice(-21, -1)
  const latestSma20 = average(bars.slice(-20).map((bar) => bar.close))
  const latestSma50 = average(bars.slice(-50).map((bar) => bar.close))
  const previousSma50 = average(bars.slice(-51, -1).map((bar) => bar.close))
  const priorHigh20 = Math.max(...prior20.map((bar) => bar.high))
  const volumeValues = prior20.map((bar) => bar.volume)
  const priorVolume20 = volumeValues.every((value): value is number => value != null && value > 0) ? average(volumeValues) : NaN
  const volumeRatio = Number.isFinite(priorVolume20) && latest.volume != null ? latest.volume / priorVolume20 : NaN

  const maHit = previous.close <= previousSma50 && latest.close > latestSma50
  const ma: StrategySignal = {
    id: "ma-breakout",
    label: "均線突破",
    state: maHit ? "hit" : "miss",
    reason: maHit ? "收盤價由 50 日均線下方穿越至上方" : "未同時符合前一日在線下、最新收盤在線上的穿越條件",
    evidence: { 前收: round(previous.close), 前日均線50: round(previousSma50), 最新收盤: round(latest.close), 均線50: round(latestSma50) },
  }

  const missingVolume = latest.volume == null || latest.volume <= 0 || prior20.some((bar) => bar.volume == null || bar.volume <= 0)
  const volumeHit = !missingVolume && Number.isFinite(volumeRatio) && latest.close > priorHigh20 && volumeRatio >= 1.5
  const volume: StrategySignal = missingVolume || !Number.isFinite(priorVolume20) || priorVolume20 <= 0
    ? unavailable("volume-breakout", "量增突破", "最新或前 20 日成交量缺漏，無法判斷")
    : {
        id: "volume-breakout",
        label: "量增突破",
        state: volumeHit ? "hit" : "miss",
        reason: volumeHit ? "收盤突破前 20 日高點，且成交量至少為前 20 日均量 1.5 倍" : "尚未同時突破前高與達成 1.5 倍量",
        evidence: { 最新收盤: round(latest.close), 前20日最高: round(priorHigh20), 成交量倍數: round(volumeRatio) },
      }

  const distance20 = (latest.close - latestSma20) / latestSma20
  const pullbackHit = latestSma20 > latestSma50 && latest.low <= latestSma20 * 1.01 && latest.close >= latestSma20 && distance20 <= 0.03
  const pullback: StrategySignal = {
    id: "pullback",
    label: "多頭回檔",
    state: pullbackHit ? "hit" : "miss",
    reason: pullbackHit ? "20 日均線高於 50 日均線，盤中回測 20 日線後收回，收盤距離不超過 3%" : "多頭排列、回測與收回 20 日線條件未全部成立",
    evidence: { 最新最低: round(latest.low), 最新收盤: round(latest.close), 均線20: round(latestSma20), 均線50: round(latestSma50), 距均線20百分比: round(distance20 * 100) },
  }

  const benchmarkByDate = new Map(benchmarkBars.map((bar) => [bar.date, bar.close]))
  const aligned = bars.filter((bar) => benchmarkByDate.has(bar.date)).slice(-64)
  let relative: StrategySignal
  if (benchmarkMeta.status === "unavailable" || benchmarkMeta.freshness === "stale") {
    relative = unavailable("relative-strength", "相對強勢", "SPY 基準資料缺漏或過期")
  } else if (benchmarkBars.at(-1)?.date !== latest.date) {
    relative = unavailable("relative-strength", "相對強勢", `SPY 與個股最新交易日未對齊（${benchmarkBars.at(-1)?.date ?? "無資料"} / ${latest.date}）`)
  } else if (aligned.length < 64) {
    relative = unavailable("relative-strength", "相對強勢", `與 SPY 對齊後僅 ${aligned.length} 個交易日，至少需要 64 日`)
  } else {
    const start = aligned[0]
    const end = aligned.at(-1)!
    const stockReturn = end.close / start.close - 1
    const benchmarkReturn = benchmarkByDate.get(end.date)! / benchmarkByDate.get(start.date)! - 1
    const excess = stockReturn - benchmarkReturn
    const hit = excess >= 0.05
    relative = {
      id: "relative-strength",
      label: "相對強勢",
      state: hit ? "hit" : "miss",
      reason: hit ? "近 63 個共同交易日報酬領先 SPY 至少 5 個百分點" : "近 63 個共同交易日尚未領先 SPY 5 個百分點",
      evidence: { 個股報酬百分比: round(stockReturn * 100), SPY報酬百分比: round(benchmarkReturn * 100), 超額報酬百分點: round(excess * 100), 對齊交易日: aligned.length },
    }
  }

  return { symbol, asOf: latest.date, source: meta.source, signals: [ma, volume, pullback, relative] }
}
