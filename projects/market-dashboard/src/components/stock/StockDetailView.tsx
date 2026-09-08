"use client"

import { useQuery } from "@tanstack/react-query"
import { TickerBar } from "@/components/design/TickerBar"
import { Navbar } from "@/components/dashboard/Navbar"
import { StockHeader } from "./StockHeader"
import { ChartCard } from "./ChartCard"
import { RightTabs } from "./RightTabs"
import type { Profile, Quote } from "@/types"

interface Props {
  symbol: string
}

function getTVSymbol(symbol: string, exchange?: string): string {
  if (!exchange) return symbol
  const e = exchange.toUpperCase()
  if (e.includes("NASDAQ")) return `NASDAQ:${symbol}`
  if (e.includes("NYSE")) return `NYSE:${symbol}`
  if (e.includes("AMEX") || e.includes("ARCA")) return `AMEX:${symbol}`
  return symbol
}

export function StockDetailView({ symbol }: Props) {
  const { data: profile } = useQuery<Profile>({
    queryKey: ["profile", symbol],
    queryFn: () =>
      fetch(`/api/profile/${symbol}`).then((r) => {
        if (!r.ok) throw new Error("Profile fetch failed")
        return r.json()
      }),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  })

  const { data: quotes } = useQuery<Quote[]>({
    queryKey: ["quotes", symbol],
    queryFn: () =>
      fetch(`/api/stocks?symbols=${symbol}`).then((r) => r.json()),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  })
  const quote = quotes?.[0] ?? null

  const tvSymbol = getTVSymbol(symbol, profile?.exchange ?? profile?.exchangeFullName)

  return (
    <div className="animate-fade-in-up flex min-h-screen flex-col bg-background text-foreground">
      <TickerBar />
      <Navbar
        breadcrumb={[
          { label: "儀表板", href: "/" },
          { label: "追蹤清單", href: "/" },
          { label: symbol },
        ]}
      />

      <StockHeader
        profile={profile ?? null}
        symbol={symbol}
        price={quote?.price ?? profile?.price}
        changePercentage={quote?.changePercentage ?? profile?.changePercentage}
        change={quote?.change ?? profile?.change}
        asOf={quote?.asOf}
        source={quote?.source}
      />

      <main className="flex-1 px-4 pb-12 pt-5 sm:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ChartCard tvSymbol={tvSymbol} quote={quote ?? undefined} />
            <StockStrategyCard symbol={symbol} />
          </div>
          <aside className="flex flex-col gap-5">
            <RightTabs symbol={symbol} profile={profile ?? null} quote={quote ?? null} />
          </aside>
        </div>
      </main>
    </div>
  )
}

function StockStrategyCard({ symbol }: { symbol: string }) {
  const { data, isPending } = useQuery<Array<{ signals: Array<{ label: string; state: string; reason: string; evidence: Record<string, string | number> }>; asOf: string | null; source: string }>>({
    queryKey: ["strategies", symbol],
    queryFn: () => fetch(`/api/strategies?symbols=${symbol}`).then((response) => {
      if (!response.ok) throw new Error("策略資料載入失敗")
      return response.json()
    }),
    staleTime: 5 * 60 * 1000,
  })
  const scan = data?.[0]
  return <section className="overflow-hidden rounded-xl border border-hair bg-card">
    <div className="border-b border-hair-soft px-[18px] py-3.5"><div className="font-mono text-[10px] font-bold tracking-[0.12em] text-muted-foreground">RULE-BASED · 無 AI</div><h2 className="mt-0.5 font-serif text-lg font-bold">策略條件檢查</h2></div>
    {isPending ? <p className="p-6 text-sm text-muted-foreground">讀取已收盤日線…</p> : <div className="grid gap-px bg-hair-soft sm:grid-cols-2">
      {scan?.signals.map((signal) => <div key={signal.label} className="bg-card p-4"><div className="flex items-center justify-between"><h3 className="font-bold">{signal.label}</h3><span className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${signal.state === "hit" ? "bg-up text-white" : signal.state === "miss" ? "bg-muted text-muted-foreground" : "bg-down/10 text-down"}`}>{signal.state === "hit" ? "符合" : signal.state === "miss" ? "未符合" : "資料不足"}</span></div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{signal.reason}</p>{Object.keys(signal.evidence).length > 0 && <div className="mt-2 flex flex-wrap gap-1">{Object.entries(signal.evidence).map(([key, value]) => <span key={key} className="rounded bg-paper px-1.5 py-1 font-mono text-[10px]">{key} {value}</span>)}</div>}</div>)}
      {!scan && <p className="bg-card p-6 text-sm text-muted-foreground">策略資料目前無法取得。</p>}
    </div>}
    {scan && <div className="border-t border-hair-soft px-4 py-2 font-mono text-[10px] text-muted-foreground">資料：{scan.source} · 截至 {scan.asOf ?? "無資料"}</div>}
  </section>
}
