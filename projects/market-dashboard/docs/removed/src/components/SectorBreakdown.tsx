"use client"

import { SectionHeader } from "@/components/design/SectionHeader"
import type { FmpQuote } from "@/lib/api/fmp"
import type { Watchlist } from "@/lib/db/schema"

type WatchlistEntry = Watchlist & { quote: FmpQuote | null }

const SECTOR_COLORS = ["#CC785C", "#1A1A1A", "#8B6F47", "#A85C44", "#6B6357", "#D4956A"]

interface SectorBreakdownProps {
  data: WatchlistEntry[]
}

export function SectorBreakdown({ data }: SectorBreakdownProps) {
  const sectorMap = new Map<string, number>()
  for (const item of data) {
    const sector = item.sector ?? "Other"
    sectorMap.set(sector, (sectorMap.get(sector) ?? 0) + 1)
  }
  const sectors = Array.from(sectorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], i) => ({
      name,
      count,
      color: SECTOR_COLORS[i % SECTOR_COLORS.length],
    }))
  const total = sectors.reduce((s, x) => s + x.count, 0)

  // HHI 指數（赫芬達爾指數）— 集中度衡量
  const hhi = total > 0 ? sectors.reduce((s, x) => s + Math.pow((x.count / total) * 100, 2), 0) : 0
  const concentrated = hhi >= 2500

  return (
    <section className="overflow-hidden rounded-xl border border-hair bg-card">
      <SectionHeader eyebrow="ALLOCATION · GICS" title="產業分佈" />
      <div className="flex flex-col gap-3 px-4 py-4 sm:px-[18px]">
        {total === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">尚無資料</div>
        ) : (
          sectors.map((s) => {
            const pct = (s.count / total) * 100
            return (
              <div key={s.name}>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <span
                      className="size-2 rounded-sm"
                      style={{ background: s.color }}
                    />
                    {s.name}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {s.count} · <strong className="text-foreground">{pct.toFixed(0)}%</strong>
                  </span>
                </div>
                <div className="h-1.5 rounded-sm bg-black/[0.05]">
                  <div
                    className="h-full rounded-sm"
                    style={{ width: `${pct}%`, background: s.color }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
      {total > 0 && (
        <div className="grid grid-cols-2 gap-2.5 border-t border-hair-soft bg-black/[0.02] px-[18px] py-3">
          <div>
            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              HHI 集中度
            </div>
            <div className="font-mono text-base font-bold tabular-nums">{Math.round(hhi)}</div>
            <div
              className={"font-mono text-[10px] " + (concentrated ? "text-down" : "text-up")}
            >
              {concentrated ? "偏集中" : "分散良好"}
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              產業數
            </div>
            <div className="font-mono text-base font-bold tabular-nums">{sectors.length}</div>
            <div className="font-mono text-[10px] text-muted-foreground">非 0 計數</div>
          </div>
        </div>
      )}
    </section>
  )
}
