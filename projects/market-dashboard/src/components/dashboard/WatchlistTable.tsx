"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertCircle, Trash2 } from "lucide-react"
import { LogoTile } from "@/components/design/LogoTile"
import { Sparkline } from "@/components/design/Sparkline"
import { SectionHeader } from "@/components/design/SectionHeader"
import { fmtCap, changeColor, makeSpark } from "@/lib/format"
import { getWatchlist, setWatchlist } from "@/lib/watchlist"
import type { Quote, WatchlistItem } from "@/types"

type WatchlistEntry = WatchlistItem & { quote: Quote | null }

interface WatchlistSectionProps {
  data: WatchlistEntry[]
  isLoading: boolean
  isError?: boolean
}

const SECTOR_FILTERS = [
  { id: "all", label: "全部" },
  { id: "Technology", label: "科技" },
  { id: "Consumer Cyclical", label: "消費" },
  { id: "Communication Services", label: "通訊" },
  { id: "Financial Services", label: "金融" },
] as const

export function WatchlistTable({ data, isLoading, isError }: WatchlistSectionProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<(typeof SECTOR_FILTERS)[number]["id"]>("all")

  const sorted = useMemo(() => {
    const list = filter === "all" ? data : data.filter((d) => d.sector === filter)
    return [...list].sort(
      (a, b) => (b.quote?.changePercentage ?? 0) - (a.quote?.changePercentage ?? 0)
    )
  }, [data, filter])

  function handleDelete(e: React.MouseEvent, symbol: string) {
    e.stopPropagation()
    const prev = getWatchlist()
    setWatchlist(prev.filter((w) => w.symbol !== symbol))
    toast.success(`已移除 ${symbol}`, {
      action: { label: "復原", onClick: () => setWatchlist(prev) },
    })
  }

  if (isLoading) {
    return (
      <section className="border-hair bg-card overflow-hidden rounded-xl border">
        <div className="border-hair-soft border-b px-[18px] py-3.5">
          <div className="h-4 w-32 animate-pulse rounded bg-black/[0.06]" />
        </div>
        <div className="space-y-1 p-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-black/[0.04]" />
          ))}
        </div>
      </section>
    )
  }

  if (data.length === 0) {
    return (
      <section className="border-hair bg-card overflow-hidden rounded-xl border">
        <SectionHeader eyebrow="WATCHLIST" title="追蹤清單" />
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground">追蹤清單為空</p>
          <p className="text-muted-foreground/70 mt-1 text-sm">點擊右上角「新增股票」開始追蹤</p>
        </div>
      </section>
    )
  }

  return (
    <section className="border-hair bg-card overflow-hidden rounded-xl border">
      <SectionHeader
        eyebrow={`WATCHLIST · ${data.length} ISSUES`}
        title="追蹤清單"
        right={
          <div className="flex flex-wrap gap-1.5">
            {SECTOR_FILTERS.map((c) => {
              const active = filter === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setFilter(c.id)}
                  className={
                    "rounded-full border px-2.5 py-1 text-[11px] font-semibold " +
                    (active
                      ? "border-ink bg-ink text-ink-foreground"
                      : "border-hair text-foreground hover:border-foreground")
                  }
                >
                  {c.label}
                </button>
              )
            })}
          </div>
        }
      />

      {isError && (
        <div className="border-down/30 bg-down/5 flex items-start gap-2 border-b px-[18px] py-2.5 text-xs">
          <AlertCircle size={14} className="text-down mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">報價載入失敗</span>
            <span className="text-muted-foreground ml-2">將於 60 秒後自動重試</span>
          </div>
        </div>
      )}

      {/* desktop table */}
      <div className="hidden lg:block">
        <div
          className="bg-ink text-ink-foreground grid items-center gap-2.5 px-[18px] py-2 font-mono text-[9.5px] font-bold tracking-[0.1em] uppercase"
          style={{ gridTemplateColumns: "32px 1fr 90px 90px 110px 80px 70px 90px 70px 24px" }}
        >
          <span>#</span>
          <span>代號 · 名稱</span>
          <span className="text-right">現價</span>
          <span className="text-right">漲跌</span>
          <span className="text-right">30D</span>
          <span className="text-right">市值</span>
          <span className="text-right">P/E</span>
          <span className="text-right">52W</span>
          <span className="text-right">%</span>
          <span />
        </div>
        {sorted.map((row, i) => {
          const q = row.quote
          const pct = q?.changePercentage ?? 0
          const up = pct >= 0
          const color = changeColor(pct)
          const points = makeSpark(
            [...row.symbol].reduce((a, c) => a + c.charCodeAt(0), 0),
            pct
          )
          const range = q ? q.yearHigh - q.yearLow : 0
          const pos = q && range > 0 ? Math.max(0, Math.min(1, (q.price - q.yearLow) / range)) : 0.5
          return (
            <div
              key={row.symbol}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/stock/${row.symbol}`)}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/stock/${row.symbol}`)}
              className={
                "hover:bg-paper grid cursor-pointer items-center gap-2.5 px-[18px] py-3 " +
                (i === 0 ? "" : "border-hair-soft border-t")
              }
              style={{ gridTemplateColumns: "32px 1fr 90px 90px 110px 80px 70px 90px 70px 24px" }}
            >
              <span className="text-muted-foreground font-mono text-[11px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex min-w-0 items-center gap-2.5">
                <LogoTile symbol={row.symbol} src={q?.logo ?? row.logo} size={28} />
                <div className="min-w-0">
                  <div className="font-mono text-[13px] leading-tight font-bold">{row.symbol}</div>
                  <div className="text-muted-foreground truncate text-[11px]">{row.name}</div>
                </div>
              </div>
              <span className="text-right font-mono text-[13px] font-semibold tabular-nums">
                {q ? q.price.toFixed(2) : "—"}
              </span>
              <span
                className="text-right font-mono text-xs tabular-nums"
                style={{ color: q ? color : undefined }}
              >
                {q ? `${q.change >= 0 ? "+" : ""}${q.change.toFixed(2)}` : "—"}
              </span>
              <div className="flex justify-end">
                <Sparkline points={points} color={color} width={100} height={22} fill />
              </div>
              <span className="text-muted-foreground text-right font-mono text-[11px]">
                {fmtCap(q?.marketCap ?? null)}
              </span>
              <span className="text-muted-foreground text-right font-mono text-[11px]">
                {q?.pe ? q.pe.toFixed(1) : "—"}
              </span>
              <div className="self-center">
                <div className="relative h-1 rounded-sm bg-black/[0.06]">
                  <div
                    className="absolute top-0 bottom-0 left-0 rounded-sm"
                    style={{ width: `${pos * 100}%`, background: color }}
                  />
                  <div
                    className="bg-foreground absolute -top-0.5 h-2 w-px"
                    style={{ left: `${pos * 100}%` }}
                  />
                </div>
                <div className="text-muted-foreground mt-1 flex justify-between font-mono text-[9px]">
                  <span>{q?.yearLow.toFixed(0) ?? "—"}</span>
                  <span>{q?.yearHigh.toFixed(0) ?? "—"}</span>
                </div>
              </div>
              <span className="text-right">
                <span
                  className="inline-block min-w-[52px] rounded px-1.5 py-1 text-center font-mono text-[11px] font-bold text-white"
                  style={{ background: color }}
                >
                  {up ? "+" : ""}
                  {pct.toFixed(2)}
                </span>
              </span>
              <button
                onClick={(e) => handleDelete(e, row.symbol)}
                className="text-muted-foreground/60 hover:text-down transition-colors"
                title="移除"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )
        })}
      </div>

      {/* mobile cards */}
      <div className="divide-hair-soft divide-y lg:hidden">
        {sorted.map((row) => {
          const q = row.quote
          const pct = q?.changePercentage ?? 0
          const up = pct >= 0
          const color = changeColor(pct)
          const points = makeSpark(
            [...row.symbol].reduce((a, c) => a + c.charCodeAt(0), 0),
            pct
          )
          return (
            <div key={row.symbol} className="hover:bg-paper px-4 py-3">
              <button
                onClick={() => router.push(`/stock/${row.symbol}`)}
                className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 text-left"
              >
                <LogoTile symbol={row.symbol} src={q?.logo ?? row.logo} size={32} />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-sm font-bold">{row.symbol}</span>
                    <span className="text-foreground font-mono text-xs tabular-nums">
                      {q ? q.price.toFixed(2) : "—"}
                    </span>
                  </div>
                  <div className="text-muted-foreground truncate text-[11px]">{row.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkline points={points} color={color} width={56} height={20} />
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-[11px] font-bold text-white tabular-nums"
                    style={{ background: color }}
                  >
                    {up ? "+" : ""}
                    {pct.toFixed(2)}
                  </span>
                </div>
              </button>
              <div className="mt-1.5 flex justify-end">
                <button
                  onClick={(e) => handleDelete(e, row.symbol)}
                  className="text-muted-foreground hover:text-down flex items-center gap-1 font-mono text-[10px]"
                >
                  <Trash2 size={11} />
                  移除
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
