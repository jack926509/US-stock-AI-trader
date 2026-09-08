// 設計稿風格的格式化 helpers — Claude Design 數字呈現

export function fmtMoney(v: number, digits = 0): string {
  return v.toLocaleString(undefined, { maximumFractionDigits: digits })
}

export function fmtCap(v: number | null | undefined): string {
  if (!v) return "—"
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`
  return `$${v.toFixed(0)}`
}

export function fmtPct(v: number, digits = 2): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`
}

export function fmtPrice(v: number): string {
  return `$${v.toFixed(2)}`
}

// Claude Design 漲跌色：綠 #006e3f / 紅 #c62828
export const UP_COLOR = "#006e3f"
export const DOWN_COLOR = "#c62828"

export function changeColor(v: number): string {
  return v >= 0 ? UP_COLOR : DOWN_COLOR
}

// Sparkline 用的偽隨機 30 點走勢生成器
export function makeSpark(seed: number, trend = 0, volatility = 0.04): number[] {
  let v = 100
  const out: number[] = []
  let s = seed
  for (let i = 0; i < 30; i++) {
    s = (s * 9301 + 49297) % 233280
    const r = (s / 233280 - 0.5) * 2
    v = v * (1 + r * volatility + trend * 0.005)
    out.push(v)
  }
  return out
}
