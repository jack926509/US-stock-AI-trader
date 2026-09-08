"use client"

import { useQuery } from "@tanstack/react-query"
import { TickerBar } from "@/components/design/TickerBar"
import { Navbar } from "@/components/dashboard/Navbar"
import { StockHeader } from "./StockHeader"
import { ChartCard } from "./ChartCard"
import { RightTabs } from "./RightTabs"
import { AnalysisCard } from "@/components/analysis/AnalysisCard"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"
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
      />

      <main className="flex-1 px-4 pb-12 pt-5 sm:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ChartCard tvSymbol={tvSymbol} quote={quote ?? undefined} />
            <ErrorBoundary>
              <AnalysisCard symbol={symbol} />
            </ErrorBoundary>
          </div>
          <aside className="flex flex-col gap-5">
            <RightTabs symbol={symbol} profile={profile ?? null} quote={quote ?? null} />
          </aside>
        </div>
      </main>
    </div>
  )
}
