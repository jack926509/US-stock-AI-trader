"use client"

import { useQuery } from "@tanstack/react-query"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { LogoTile } from "@/components/design/LogoTile"
import { SectionHeader } from "@/components/design/SectionHeader"
import { fmtCap, UP_COLOR, DOWN_COLOR } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { PeerData } from "@/app/api/peers/[symbol]/route"

interface Props {
  symbol: string
}

function fmt(v: number | null, decimals = 1, suffix = "x"): string {
  if (v == null || isNaN(v) || v === 0) return "—"
  return v.toFixed(decimals) + suffix
}

function fmtPctVal(v: number | null): string {
  if (v == null || isNaN(v)) return "—"
  return (v * 100).toFixed(1) + "%"
}

interface ColDef {
  key: keyof PeerData
  label: string
  format: (v: number | null) => string
  higherBetter: boolean
}

const COLUMNS: ColDef[] = [
  { key: "peRatio",       label: "P/E",        format: (v) => fmt(v, 1, "x"), higherBetter: false },
  { key: "pbRatio",       label: "P/B",        format: (v) => fmt(v, 1, "x"), higherBetter: false },
  { key: "psRatio",       label: "P/S",        format: (v) => fmt(v, 1, "x"), higherBetter: false },
  { key: "evToEbitda",    label: "EV/EBITDA",  format: (v) => fmt(v, 1, "x"), higherBetter: false },
  { key: "roe",           label: "ROE",        format: fmtPctVal,              higherBetter: true },
  { key: "grossMargin",   label: "毛利率",      format: fmtPctVal,              higherBetter: true },
  { key: "revenueGrowth", label: "營收成長",    format: fmtPctVal,              higherBetter: true },
]

function getRankings(peers: PeerData[], col: ColDef): (number | null)[] {
  const vals = peers.map((p) => p[col.key] as number | null)
  const positives = vals
    .map((v, i) => ({ v: v as number, i }))
    .filter(({ v }) => v != null && !isNaN(v) && v > 0)
  const negatives = vals
    .map((v, i) => ({ v: v as number, i }))
    .filter(({ v }) => v != null && !isNaN(v) && v < 0)

  if (col.higherBetter) {
    positives.sort((a, b) => b.v - a.v)
    negatives.sort((a, b) => b.v - a.v)
  } else {
    positives.sort((a, b) => a.v - b.v)
    negatives.sort((a, b) => a.v - b.v)
  }

  const ranks: (number | null)[] = new Array(vals.length).fill(null)
  let rank = 1
  for (const { i } of positives) ranks[i] = rank++
  for (const { i } of negatives) ranks[i] = rank++
  return ranks
}

function normalizeForRadar(peers: PeerData[], col: ColDef): number[] {
  const vals = peers.map((p) => p[col.key] as number | null)
  const valid = vals.filter((v): v is number => v != null && !isNaN(v) && v !== 0)
  if (valid.length === 0) return vals.map(() => 50)
  const min = Math.min(...valid)
  const max = Math.max(...valid)
  if (min === max) return vals.map(() => 75)
  return vals.map((v) => {
    if (v == null || isNaN(v) || v === 0) return 50
    const normalized = ((v - min) / (max - min)) * 100
    return col.higherBetter ? normalized : 100 - normalized
  })
}

const RADAR_COLORS = ["#CC785C", "#1A1A1A", "#8B6F47", "#A85C44", "#6B6357", "#D4956A"]

function ScorePill({ rank, total }: { rank: number | null; total: number }) {
  if (rank == null) return <span className="text-stone-400">—</span>
  const isBest = rank === 1
  const isWorst = rank === total && total > 1
  let bg = "rgba(0,0,0,0.06)"
  let color = "#666"
  if (isBest) {
    bg = UP_COLOR
    color = "#fff"
  } else if (isWorst) {
    bg = "rgba(255,71,87,0.12)"
    color = DOWN_COLOR
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-full px-2 py-0.5 font-num text-[11px] font-bold tabular-nums"
      style={{ background: bg, color }}
    >
      #{rank}
    </span>
  )
}

export function PeerComparison({ symbol }: Props) {
  const { data: peers = [], isLoading } = useQuery<PeerData[]>({
    queryKey: ["peers", symbol],
    queryFn: () => fetch(`/api/peers/${symbol}`).then((r) => r.json()),
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  })

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-xl border border-hair bg-card p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-black/[0.05]" />
        ))}
      </div>
    )
  }

  if (!peers.length) {
    return (
      <div className="rounded-xl border border-hair bg-card py-10 text-center text-sm text-muted-foreground">
        無同業比較資料
      </div>
    )
  }

  const radarData = COLUMNS.map((col) => {
    const normalized = normalizeForRadar(peers, col)
    const entry: Record<string, unknown> = { subject: col.label }
    peers.forEach((p, i) => { entry[p.symbol] = Math.round(normalized[i]) })
    return entry
  })

  const rankingsByCol = COLUMNS.map((col) => getRankings(peers, col))
  const avgRanks: (number | null)[] = peers.map((_, peerIdx) => {
    const ranks = rankingsByCol.map((arr) => arr[peerIdx]).filter((r): r is number => r != null)
    return ranks.length === 0 ? null : ranks.reduce((a, b) => a + b, 0) / ranks.length
  })
  const overallRanks: (number | null)[] = (() => {
    const indexed = avgRanks
      .map((avg, i) => ({ avg, i }))
      .filter((x): x is { avg: number; i: number } => x.avg != null)
      .sort((a, b) => a.avg - b.avg)
    const out: (number | null)[] = new Array(peers.length).fill(null)
    indexed.forEach(({ i }, rank) => { out[i] = rank + 1 })
    return out
  })()
  const bestIdx = overallRanks.indexOf(1)
  const targetIdx = peers.findIndex((p) => p.isTarget)

  return (
    <div className="space-y-5">
      {/* Best peer summary */}
      {peers.length > 1 && bestIdx >= 0 && (
        <div
          className="rounded-xl border px-4 py-3"
          style={{ borderColor: "rgba(0,110,63,0.25)", background: "rgba(0,110,63,0.06)" }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">綜合最划算：</span>
              <span className="font-mono font-bold" style={{ color: UP_COLOR }}>
                {peers[bestIdx].symbol}
              </span>
              <span className="ml-1 text-muted-foreground">
                平均排名 #{avgRanks[bestIdx]!.toFixed(1)} / 共 {peers.length} 檔
              </span>
            </div>
            {targetIdx >= 0 && targetIdx !== bestIdx && overallRanks[targetIdx] != null && (
              <div className="text-muted-foreground">
                {peers[targetIdx].symbol} 排名{" "}
                <span className="font-mono font-bold text-foreground">#{overallRanks[targetIdx]}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Radar chart */}
      {peers.length > 1 && (
        <div className="overflow-hidden rounded-xl border border-hair bg-card">
          <SectionHeader
            eyebrow="PEER RADAR · NORMALIZED 0–100"
            title="多維度雷達比較"
          />
          <div className="p-4">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(0,0,0,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#6B6357", fontSize: 11 }} />
              {peers.map((p, i) => (
                <Radar
                  key={p.symbol}
                  name={p.symbol}
                  dataKey={p.symbol}
                  stroke={RADAR_COLORS[i % RADAR_COLORS.length]}
                  fill={RADAR_COLORS[i % RADAR_COLORS.length]}
                  fillOpacity={p.isTarget ? 0.18 : 0.05}
                  strokeWidth={p.isTarget ? 2 : 1.5}
                />
              ))}
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#1A1A1A",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            {peers.map((p, i) => (
              <div key={p.symbol} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-4 rounded-full"
                  style={{ background: RADAR_COLORS[i % RADAR_COLORS.length] }}
                />
                <span className={cn("font-mono text-xs", p.isTarget ? "font-bold text-foreground" : "text-muted-foreground")}>
                  {p.symbol}
                </span>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* Comparison table */}
      <div className="overflow-hidden rounded-xl border border-hair bg-card">
        <SectionHeader
          eyebrow={`PEER COMPARISON · ${peers.length} ISSUES`}
          title="同業關鍵指標"
          right={<span className="font-mono text-[10px] text-muted-foreground">FMP v4 · 自動匹配</span>}
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11.5px]">
            <thead>
              <tr className="bg-ink text-ink-foreground">
                <th className="px-3 py-2.5 text-left font-mono text-[9.5px] font-bold uppercase tracking-[0.1em]">
                  RANK
                </th>
                <th className="px-3 py-2.5 text-left font-mono text-[9.5px] font-bold uppercase tracking-[0.1em]">
                  PEER
                </th>
                <th className="px-3 py-2.5 text-right font-mono text-[9.5px] font-bold uppercase tracking-[0.1em]">
                  MCAP
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key as string}
                    className="px-3 py-2.5 text-right font-mono text-[9.5px] font-bold uppercase tracking-[0.1em]"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-mono text-[9.5px] font-bold uppercase tracking-[0.1em]">
                  SCORE
                </th>
              </tr>
            </thead>
            <tbody>
              {peers.map((peer, peerIdx) => {
                const isTarget = !!peer.isTarget
                return (
                  <tr
                    key={peer.symbol}
                    className="border-t border-hair-soft transition-colors hover:bg-paper"
                    style={{ background: isTarget ? "rgba(204,120,92,0.07)" : undefined }}
                  >
                    <td className="px-3 py-3">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded font-mono text-[11px] font-bold"
                        style={{
                          background: overallRanks[peerIdx] === 1 ? "var(--brand)" : "rgba(0,0,0,0.06)",
                          color: overallRanks[peerIdx] === 1 ? "#fff" : "var(--foreground)",
                        }}
                      >
                        {overallRanks[peerIdx] ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <LogoTile symbol={peer.symbol} size={26} />
                        <div className="min-w-0">
                          <div
                            className="font-mono text-[12.5px] font-bold"
                            style={{ color: isTarget ? "var(--brand)" : "var(--foreground)" }}
                          >
                            {peer.symbol}
                          </div>
                          <div className="max-w-[140px] truncate text-[10.5px] text-muted-foreground">
                            {peer.companyName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-xs text-muted-foreground">
                      {fmtCap(peer.marketCap)}
                    </td>
                    {COLUMNS.map((col, colIdx) => {
                      const rankings = rankingsByCol[colIdx]
                      const rank = rankings[peerIdx]
                      const total = rankings.filter((r) => r != null).length
                      const isBest = rank === 1 && total > 1
                      const isWorst = rank === total && total > 1
                      return (
                        <td key={col.key as string} className="px-3 py-3 text-right">
                          <span
                            className="inline-flex items-center gap-1 font-mono tabular-nums"
                            style={{
                              color: isBest ? UP_COLOR : isWorst ? DOWN_COLOR : "var(--foreground)",
                              fontWeight: isBest ? 700 : 500,
                            }}
                          >
                            {col.format(peer[col.key] as number | null)}
                          </span>
                        </td>
                      )
                    })}
                    <td className="px-3 py-3 text-right">
                      <ScorePill rank={overallRanks[peerIdx]} total={peers.length} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-hair-soft bg-paper px-4 py-2 font-mono text-[10px] text-muted-foreground">
          綠色 = 同業最優 · 紅色 = 同業最差 · 排名依 P/E、P/B、P/S、EV/EBITDA、ROE、毛利率、營收成長 7 項平均
        </div>
      </div>
    </div>
  )
}
