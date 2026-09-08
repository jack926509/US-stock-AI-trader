import type { FmpKeyMetrics, FmpRatios, FmpIncomeStatement } from "@/lib/api/fmp"

type Sector = "Technology" | "Financials" | "Utilities" | "Energy" | "Healthcare" | "default"

interface SectorBenchmark {
  debtEquityGood: number
  grossMarginGood: number
  peGood: number
  roeGood: number
  currentRatioGood: number
  fcfYieldGood: number
}

// 各產業「良好」閾值 — 避免跨行業比較失真
const SECTOR_BENCHMARKS: Record<Sector, SectorBenchmark> = {
  Technology: { debtEquityGood: 0.5,  grossMarginGood: 0.60, peGood: 30, roeGood: 0.20, currentRatioGood: 1.5, fcfYieldGood: 0.03 },
  Financials: { debtEquityGood: 8.0,  grossMarginGood: 0.30, peGood: 15, roeGood: 0.12, currentRatioGood: 1.2, fcfYieldGood: 0.04 },
  Utilities:  { debtEquityGood: 1.5,  grossMarginGood: 0.35, peGood: 18, roeGood: 0.10, currentRatioGood: 1.2, fcfYieldGood: 0.04 },
  Energy:     { debtEquityGood: 0.8,  grossMarginGood: 0.40, peGood: 12, roeGood: 0.12, currentRatioGood: 1.3, fcfYieldGood: 0.05 },
  Healthcare: { debtEquityGood: 0.4,  grossMarginGood: 0.65, peGood: 25, roeGood: 0.15, currentRatioGood: 2.0, fcfYieldGood: 0.04 },
  default:    { debtEquityGood: 0.7,  grossMarginGood: 0.45, peGood: 20, roeGood: 0.15, currentRatioGood: 1.5, fcfYieldGood: 0.04 },
}

const SECTOR_LABELS: Record<Sector, string> = {
  Technology: "科技業",
  Financials: "金融業",
  Utilities:  "公用事業",
  Energy:     "能源業",
  Healthcare: "醫療保健",
  default:    "綜合標準",
}

export interface ScoreDimension {
  name: string
  label: string
  score: number
  weight: number
}

export interface ScoreResult {
  total: number
  grade: string
  dimensions: ScoreDimension[]
  sector: Sector
  sectorLabel: string
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)))
}

function scoreHigher(value: number, good: number, excellent?: number): number {
  if (!value || isNaN(value) || value <= 0) return 30
  const exc = excellent ?? good * 1.5
  if (value >= exc) return 95
  if (value >= good) return 75
  if (value >= good * 0.5) return 55
  return 30
}

function scoreLower(value: number, good: number): number {
  if (value == null || isNaN(value) || value < 0) return 50
  if (value === 0) return 95
  if (value <= good * 0.5) return 95
  if (value <= good) return 75
  if (value <= good * 1.5) return 55
  if (value <= good * 2.5) return 35
  return 15
}

function scorePE(pe: number, goodPE: number): number {
  if (!pe || pe <= 0 || pe > 500) return 40
  if (pe < goodPE * 0.4) return 60 // potential value trap
  if (pe <= goodPE * 0.8) return 85
  if (pe <= goodPE * 1.3) return 70
  if (pe <= goodPE * 2.0) return 50
  if (pe <= goodPE * 3.0) return 30
  return 15
}

function getSector(sectorStr?: string): Sector {
  if (!sectorStr) return "default"
  const s = sectorStr.toLowerCase()
  if (s.includes("tech") || s.includes("software") || s.includes("semiconductor") || s.includes("information")) return "Technology"
  if (s.includes("financ") || s.includes("bank") || s.includes("insurance")) return "Financials"
  if (s.includes("utili")) return "Utilities"
  if (s.includes("energy") || s.includes("oil") || s.includes("gas")) return "Energy"
  if (s.includes("health") || s.includes("pharma") || s.includes("biotech") || s.includes("medical")) return "Healthcare"
  return "default"
}

function getGrade(score: number): string {
  if (score >= 85) return "A+"
  if (score >= 75) return "A"
  if (score >= 65) return "B+"
  if (score >= 55) return "B"
  if (score >= 45) return "C"
  return "D"
}

export function calculateScore(
  keyMetrics: FmpKeyMetrics[],
  ratios: FmpRatios[],
  sectorStr?: string,
  income?: FmpIncomeStatement[]
): ScoreResult {
  const sector = getSector(sectorStr)
  const bm = SECTOR_BENCHMARKS[sector]
  const km = keyMetrics[0]
  const r = ratios[0]

  // ── 獲利能力 (25%) ──────────────────────────────────────────────────────
  const roeScore = scoreHigher(r?.returnOnEquity ?? km?.roe ?? 0, bm.roeGood, bm.roeGood * 2)
  const netMarginScore = scoreHigher(r?.netProfitMargin ?? 0, 0.10, 0.20)
  const grossMarginScore = scoreHigher(r?.grossProfitMargin ?? 0, bm.grossMarginGood, bm.grossMarginGood * 1.3)
  const profitability = clamp((roeScore + netMarginScore + grossMarginScore) / 3)

  // ── 成長動能 (25%) — 優先使用 YoY 營收成長率，無資料時降回 PEG ─────────
  let growthScore = 50
  const rev0 = income?.[0]?.revenue
  const rev1 = income?.[1]?.revenue
  if (rev0 && rev1 && rev1 > 0) {
    const yoyGrowth = (rev0 - rev1) / rev1
    if (yoyGrowth >= 0.30) growthScore = 90
    else if (yoyGrowth >= 0.15) growthScore = 75
    else if (yoyGrowth >= 0.05) growthScore = 60
    else if (yoyGrowth >= 0) growthScore = 45
    else growthScore = 25
  } else if (km?.pegRatio && km.pegRatio > 0 && km.pegRatio <= 10) {
    if (km.pegRatio <= 1.0) growthScore = 90
    else if (km.pegRatio <= 1.5) growthScore = 75
    else if (km.pegRatio <= 2.5) growthScore = 60
    else growthScore = 40
  }
  const growth = clamp(growthScore)

  // ── 估值合理性 (20%) ────────────────────────────────────────────────────
  const peScore = scorePE(km?.peRatio ?? r?.priceToEarningsRatio ?? 0, bm.peGood)
  const pbScore = scoreLower(km?.pbRatio ?? 0, 3)
  const psScore = scoreLower(km?.psRatio ?? 0, 5)
  const valuation = clamp((peScore + pbScore + psScore) / 3)

  // ── 財務健康 (15%) ──────────────────────────────────────────────────────
  const deScore = scoreLower(r?.debtEquityRatio ?? km?.debtToEquity ?? 0, bm.debtEquityGood)
  const crScore = scoreHigher(r?.currentRatio ?? km?.currentRatio ?? 0, bm.currentRatioGood)
  const icScore = scoreHigher(r?.interestCoverage ?? 0, 5, 10)
  const health = clamp((deScore + crScore + icScore) / 3)

  // ── 現金流品質 (15%) ────────────────────────────────────────────────────
  const fcfScore = scoreHigher(km?.freeCashFlowYield ?? 0, bm.fcfYieldGood, bm.fcfYieldGood * 2)
  const cashflow = clamp((fcfScore + 50) / 2)

  const total = clamp(
    profitability * 0.25 +
    growth * 0.25 +
    valuation * 0.20 +
    health * 0.15 +
    cashflow * 0.15
  )

  return {
    total,
    grade: getGrade(total),
    sector,
    sectorLabel: SECTOR_LABELS[sector],
    dimensions: [
      { name: "profitability", label: "獲利能力", score: profitability, weight: 25 },
      { name: "growth",        label: "成長動能", score: growth,        weight: 25 },
      { name: "valuation",     label: "估值合理", score: valuation,     weight: 20 },
      { name: "health",        label: "財務健康", score: health,        weight: 15 },
      { name: "cashflow",      label: "現金流",   score: cashflow,      weight: 15 },
    ],
  }
}
