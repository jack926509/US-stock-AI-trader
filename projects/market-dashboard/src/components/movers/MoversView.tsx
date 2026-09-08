"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Activity, ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react"
import { TickerBar } from "@/components/design/TickerBar"
import { Navbar } from "@/components/dashboard/Navbar"
import { SectionHeader } from "@/components/design/SectionHeader"
import { fmtCap } from "@/lib/format"
import type { Quote } from "@/types"

interface MoversData {
  gainers: Quote[]
  losers: Quote[]
  active: Quote[]
}

export function MoversView() {
  const { data, isPending, isError } = useQuery<MoversData>({
    queryKey: ["movers"],
    queryFn: () => fetch("/api/movers").then((r) => r.json()),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  })

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TickerBar />
      <Navbar breadcrumb={[{ label: "儀表板", href: "/" }, { label: "Movers" }]} />

      <main className="flex-1 px-4 pb-12 pt-5 sm:px-8">
        <div className="mb-4">
          <h1 className="font-serif text-2xl font-bold">今日熱度</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            從美股大型權值股 50 檔池中挑出漲幅、跌幅與活躍度前 10 名（60 秒更新一次）。
          </p>
        </div>

        {isPending && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-brand" />
          </div>
        )}

        {isError && (
          <div className="rounded-md border border-down/40 bg-down/5 p-4 text-sm">
            報價載入失敗，60 秒後自動重試。
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <MoverColumn
              eyebrow="TOP GAINERS · 漲幅榜"
              title="領漲股"
              icon={<ArrowUpRight size={14} className="text-up" />}
              quotes={data.gainers}
            />
            <MoverColumn
              eyebrow="TOP LOSERS · 跌幅榜"
              title="領跌股"
              icon={<ArrowDownRight size={14} className="text-down" />}
              quotes={data.losers}
            />
            <MoverColumn
              eyebrow="MOST ACTIVE · 活躍度"
              title="最活躍"
              icon={<Activity size={14} className="text-brand" />}
              quotes={data.active}
            />
          </div>
        )}
      </main>
    </div>
  )
}

function MoverColumn({
  eyebrow,
  title,
  icon,
  quotes,
}: {
  eyebrow: string
  title: string
  icon: React.ReactNode
  quotes: Quote[]
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-hair bg-card">
      <SectionHeader
        eyebrow={eyebrow}
        title={
          <span className="flex items-center gap-1.5">
            {icon}
            {title}
          </span>
        }
      />
      <div className="divide-y divide-hair-soft">
        {quotes.length === 0 && (
          <p className="px-[18px] py-8 text-center text-xs text-muted-foreground">無資料</p>
        )}
        {quotes.map((q, i) => {
          const up = q.changePercentage >= 0
          return (
            <Link
              key={q.symbol}
              href={`/stock/${q.symbol}`}
              className="grid grid-cols-[24px_60px_1fr_70px] items-center gap-2 px-[18px] py-2.5 hover:bg-paper"
            >
              <span className="font-mono text-[10px] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[13px] font-bold text-brand">{q.symbol}</span>
              <span className="text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                ${q.price.toFixed(2)}
                <span className="ml-2 text-[10px]">{fmtCap(q.marketCap ?? null)}</span>
              </span>
              <span
                className={
                  "text-right font-mono text-[12px] font-bold tabular-nums " +
                  (up ? "text-up" : "text-down")
                }
              >
                {up ? "+" : ""}
                {q.changePercentage.toFixed(2)}%
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
