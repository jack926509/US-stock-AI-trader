"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import type { Quote } from "@/types"

interface TickerItem {
  sym: string
  v: number
  d: number
}

function nowEDT(): string {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
  return fmt.format(new Date())
}

export function TickerBar() {
  const [time, setTime] = useState(nowEDT())

  useEffect(() => {
    const id = setInterval(() => setTime(nowEDT()), 1000)
    return () => clearInterval(id)
  }, [])

  const { data } = useQuery<Quote[]>({
    queryKey: ["market-indices"],
    queryFn: () => fetch("/api/market").then((r) => r.json()),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  })

  const items: TickerItem[] = (Array.isArray(data) ? data : []).map((q) => ({
    sym: q.symbol,
    v: q.price,
    d: q.changePercentage,
  }))

  if (items.length === 0) return null

  // 軌道複製兩份做無縫循環
  const track = [...items, ...items]

  return (
    <div className="relative flex h-8 items-center overflow-hidden border-b border-white/[0.08] bg-[#0E0E0E] whitespace-nowrap">
      <div className="relative z-[2] flex h-full shrink-0 items-center gap-1.5 bg-brand px-3 font-mono text-[10px] font-bold tracking-[0.12em] text-white">
        <span className="inline-block size-1.5 rounded-full bg-up-neon shadow-[0_0_6px] shadow-up-neon" />
        LIVE · {time} EDT
      </div>
      <div className="relative flex h-full flex-1 items-center overflow-hidden">
        <div className="inline-flex animate-ticker-scroll pl-4">
          {track.map((it, i) => {
            const up = it.d >= 0
            return (
              <Link
                key={`${it.sym}-${i}`}
                href={`/stock/${it.sym}`}
                className="mr-6 inline-flex items-baseline gap-[7px] rounded px-1 font-mono text-[11px] transition-colors hover:bg-white/[0.06]"
              >
                <span className="font-bold tracking-[0.04em] text-[#F4EFE6]">{it.sym}</span>
                <span className="text-[#F4EFE6] tabular-nums">
                  {it.v.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className={"font-semibold " + (up ? "text-up-neon" : "text-down-neon")}>
                  {up ? "▲" : "▼"} {Math.abs(it.d).toFixed(2)}%
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
