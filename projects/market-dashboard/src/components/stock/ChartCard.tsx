"use client"

import { TradingViewWidget } from "@/components/charts/TradingViewWidget.dynamic"
import { TradingViewTechAnalysis } from "@/components/charts/TradingViewTechAnalysis.dynamic"
import type { Quote } from "@/types"

interface Props {
  tvSymbol: string
  quote?: Quote | null
}

function f2(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "—"
  return v.toFixed(2)
}

export function ChartCard({ tvSymbol, quote }: Props) {
  const vwap =
    quote && quote.dayHigh && quote.dayLow && quote.price
      ? (quote.dayHigh + quote.dayLow + quote.price) / 3
      : null

  return (
    <section className="overflow-hidden rounded-xl border border-hair bg-card">
      <div className="border-b border-hair-soft px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        Chart · TradingView
      </div>

      {/* TradingView chart */}
      <div className="grid grid-cols-1 gap-px bg-hair-soft xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 bg-card p-3 sm:p-4">
          <TradingViewWidget symbol={tvSymbol} height={400} />
        </div>
        <div className="bg-card p-3 sm:p-4">
          <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            TECH ANALYSIS · TRADINGVIEW
          </div>
          <TradingViewTechAnalysis symbol={tvSymbol} width="100%" height={360} />
        </div>
      </div>

      {/* OHLC strip */}
      <div className="grid grid-cols-4 gap-x-3 gap-y-2.5 border-t border-hair-soft bg-black/[0.02] px-4 py-2.5 sm:grid-cols-7 sm:px-[18px]">
        {[
          ["OPEN", f2(quote?.open)],
          ["HIGH", f2(quote?.dayHigh)],
          ["LOW", f2(quote?.dayLow)],
          ["CLOSE", f2(quote?.price)],
          ["VWAP", f2(vwap)],
          ["52W H", f2(quote?.yearHigh)],
          ["52W L", f2(quote?.yearLow)],
        ].map(([l, v]) => (
          <div key={l}>
            <div className="font-mono text-[9px] font-bold tracking-[0.1em] text-muted-foreground">
              {l}
            </div>
            <div className="mt-0.5 font-mono text-[13px] font-bold tabular-nums">{v}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
