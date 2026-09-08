"use client"

import { useMemo } from "react"
import { calculateScore } from "@/lib/scoring"
import type { FmpKeyMetrics, FmpRatios, FmpIncomeStatement } from "@/lib/api/fmp"
import type { ScoreDimension } from "@/lib/scoring"

interface Props {
  keyMetrics: FmpKeyMetrics[]
  ratios: FmpRatios[]
  income?: FmpIncomeStatement[]
  sector?: string
  isLoading?: boolean
}

const DIM_EN: Record<string, string> = {
  獲利能力: "PROFIT",
  成長性: "GROWTH",
  估值合理: "VALUE",
  估值: "VALUE",
  財務健康: "HEALTH",
  現金流: "CASH",
}

function dimColorClass(score: number): string {
  if (score >= 70) return "text-up-neon"
  if (score >= 50) return "text-brand"
  if (score >= 35) return "text-white/50"
  return "text-down-neon"
}

function dimColor(score: number): string {
  if (score >= 70) return "var(--up-neon)"
  if (score >= 50) return "var(--brand)"
  if (score >= 35) return "rgba(255,255,255,0.5)"
  return "var(--down-neon)"
}

function gradeBadge(grade: string): { label: string; bg: string; color: string } {
  if (grade.startsWith("A")) {
    return { label: "STRONG", bg: "var(--up-neon)", color: "#1A1A1A" }
  }
  if (grade.startsWith("B")) {
    return { label: "GOOD", bg: "var(--up)", color: "#fff" }
  }
  if (grade === "C") {
    return { label: "NEUTRAL", bg: "rgba(255,255,255,0.15)", color: "#fff" }
  }
  return { label: "WEAK", bg: "var(--down-neon)", color: "#1A1A1A" }
}

function DimensionRow({ dim }: { dim: ScoreDimension }) {
  const en = DIM_EN[dim.label] ?? dim.name.toUpperCase()
  const c = dimColor(dim.score)
  const tenScale = (dim.score / 10).toFixed(1)
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-[100px]">
        <div className="text-xs font-semibold text-[#F4EFE6]">{dim.label}</div>
        <div className="font-mono text-[9px] tracking-[0.06em] text-white/40">
          {en}
        </div>
      </div>
      <div className="h-[5px] flex-1 rounded-sm bg-white/10">
        <div
          className="h-full rounded-sm transition-all duration-700"
          style={{ width: `${dim.score}%`, background: c }}
        />
      </div>
      <span className={"w-9 text-right font-mono text-sm font-bold " + dimColorClass(dim.score)}>
        {tenScale}
      </span>
    </div>
  )
}

export function ScoreCard({ keyMetrics, ratios, income, sector, isLoading }: Props) {
  const result = useMemo(() => {
    if (!keyMetrics.length && !ratios.length) return null
    return calculateScore(keyMetrics, ratios, sector, income)
  }, [keyMetrics, ratios, sector, income])

  if (isLoading) {
    return (
      <section className="overflow-hidden rounded-xl bg-ink p-[18px] text-ink-foreground">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-white/10" />
          ))}
        </div>
      </section>
    )
  }

  if (!result) {
    return (
      <section className="overflow-hidden rounded-xl bg-ink p-[18px] text-center text-ink-foreground">
        <p className="text-sm text-white/70">無法計算評分</p>
        <p className="mt-1 text-xs text-white/40">財務數據不足</p>
      </section>
    )
  }

  const tenScale = (result.total / 10).toFixed(1)
  const badge = gradeBadge(result.grade)

  return (
    <section className="relative overflow-hidden rounded-xl bg-ink p-[18px] text-ink-foreground">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
        COMPOSITE SCORE · {result.sectorLabel.toUpperCase()}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className="font-mono text-[56px] font-bold leading-none tabular-nums"
          style={{ letterSpacing: "-0.03em" }}
        >
          {tenScale}
        </span>
        <span className="font-mono text-lg text-white/50">/ 10</span>
        <span
          className="ml-auto rounded px-2.5 py-1 font-mono text-xs font-bold"
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-2.5">
        {result.dimensions.map((dim) => (
          <DimensionRow key={dim.name} dim={dim} />
        ))}
      </div>
    </section>
  )
}
