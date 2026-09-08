"use client"

import { SectionHeader } from "@/components/design/SectionHeader"
import { fmtCap } from "@/lib/format"
import type { Profile, Quote } from "@/types"

interface Props {
  profile: Profile | null
  quote?: Quote | null
}

function f2(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "—"
  return v.toFixed(2)
}

// Bloomberg DES (Description) 風格報價單
export function QuoteSheet({ profile, quote }: Props) {
  const rows: Array<[string, string]> = [
    ["OPEN", f2(quote?.open)],
    ["HIGH", f2(quote?.dayHigh)],
    ["LOW", f2(quote?.dayLow)],
    ["PREV CLOSE", f2(quote?.previousClose)],
    ["52W HIGH", f2(quote?.yearHigh)],
    ["52W LOW", f2(quote?.yearLow)],
    ["MARKET CAP", profile?.marketCap ? fmtCap(profile.marketCap) : "—"],
    ["EXCHANGE", profile?.exchange ?? quote?.exchange ?? "—"],
    ["P/E TTM", quote?.pe ? f2(quote.pe) : "—"],
    ["SECTOR", profile?.sector ?? "—"],
    ["INDUSTRY", profile?.industry ?? "—"],
    ["COUNTRY", profile?.country ?? "—"],
    ["WEBSITE", profile?.website ? new URL(profile.website).host : "—"],
    ["SYMBOL", profile?.symbol ?? quote?.symbol ?? "—"],
  ]

  return (
    <section className="overflow-hidden rounded-xl border border-hair bg-card">
      <SectionHeader eyebrow="DESCRIPTION · DES" title="報價單" />
      <div>
        {rows.map(([l, v], i) => (
          <div
            key={l}
            className={
              "flex items-center justify-between gap-3 px-4 py-2 font-mono text-[11px] sm:px-[18px] " +
              (i === 0 ? "" : "border-t border-hair-soft")
            }
          >
            <span className="font-bold tracking-[0.04em] text-muted-foreground">{l}</span>
            <span className="truncate text-right font-semibold text-foreground">{v}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
