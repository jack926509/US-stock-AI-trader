"use client"

import { useQuery } from "@tanstack/react-query"
import { Sparkline } from "@/components/design/Sparkline"
import { changeColor, makeSpark } from "@/lib/format"
import type { Quote } from "@/types"

function symbolSeed(s: string): number {
  return [...s].reduce((a, c) => a + c.charCodeAt(0), 0)
}

function IndexCard({ quote, isLast }: { quote: Quote; isLast: boolean }) {
  const up = quote.changePercentage >= 0
  const color = changeColor(quote.changePercentage)
  const points = makeSpark(symbolSeed(quote.symbol), quote.changePercentage > 0 ? 0.4 : -0.4, 0.018)

  return (
    <div
      className={
        "grid grid-cols-[1fr_auto] gap-3 px-4 py-3.5 sm:px-[18px] " +
        (isLast ? "" : "border-b border-hair-soft sm:border-b-0 sm:border-r")
      }
    >
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-bold tracking-[0.04em]">{quote.symbol}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{quote.name}</span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span
            className="font-mono text-[22px] font-bold tabular-nums"
            style={{ letterSpacing: "-0.02em" }}
          >
            {quote.price.toFixed(2)}
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums" style={{ color }}>
            {quote.change >= 0 ? "+" : ""}
            {quote.change.toFixed(2)}
          </span>
          <span
            className="rounded-sm px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-white"
            style={{ background: color }}
          >
            {up ? "+" : ""}
            {quote.changePercentage.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="self-center">
        <Sparkline points={points} color={color} width={130} height={44} fill />
      </div>
    </div>
  )
}

function IndexCardSkeleton({ isLast }: { isLast: boolean }) {
  return (
    <div
      className={
        "grid grid-cols-[1fr_auto] gap-3 px-4 py-3.5 sm:px-[18px] " +
        (isLast ? "" : "border-b border-hair-soft sm:border-b-0 sm:border-r")
      }
    >
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-black/[0.06]" />
        <div className="h-6 w-32 animate-pulse rounded bg-black/[0.06]" />
      </div>
      <div className="h-9 w-[130px] animate-pulse rounded bg-black/[0.06]" />
    </div>
  )
}

export function IndicesStrip() {
  const { data, isLoading } = useQuery<Quote[]>({
    queryKey: ["market-indices"],
    queryFn: () => fetch("/api/market").then((r) => r.json()),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  })

  const quotes = Array.isArray(data) ? data : []
  const showSkeleton = isLoading || quotes.length === 0

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-hair bg-card sm:grid-cols-3">
      {showSkeleton
        ? [0, 1, 2].map((i) => <IndexCardSkeleton key={i} isLast={i === 2} />)
        : quotes.map((q, i) => <IndexCard key={q.symbol} quote={q} isLast={i === quotes.length - 1} />)}
    </div>
  )
}
