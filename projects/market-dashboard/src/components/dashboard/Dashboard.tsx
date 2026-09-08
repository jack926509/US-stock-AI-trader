"use client"

import { useEffect, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { TickerBar } from "@/components/design/TickerBar"
import { CommandLine } from "@/components/design/CommandLine"
import { Navbar } from "./Navbar"
import { IndicesStrip } from "./IndicesStrip"
import { SidePanel } from "./SidePanel"
import { WatchlistTable } from "./WatchlistTable"
import { clearLegacyWatchlist, getWatchlist, migrateLegacyWatchlist, readLegacyWatchlist } from "@/lib/watchlist"
import { MarketOverview } from "./MarketOverview"
import type { Quote, WatchlistItem } from "@/types"

type WatchlistEntry = WatchlistItem & { quote: Quote | null }

export function Dashboard() {
  const queryClient = useQueryClient()
  const { data: watchlist = [], isPending: watchlistLoading, isError: watchlistError, isSuccess: watchlistSuccess } = useQuery<WatchlistItem[]>({ queryKey: ["watchlist"], queryFn: getWatchlist, staleTime: Infinity })
  useEffect(() => {
    const legacy = readLegacyWatchlist()
    if (!legacy || !watchlistSuccess || watchlist.length > 0 || watchlistLoading) return
    migrateLegacyWatchlist(legacy).then((saved) => {
      clearLegacyWatchlist(); queryClient.setQueryData(["watchlist"], saved)
    }).catch(() => undefined)
  }, [queryClient, watchlist.length, watchlistLoading, watchlistSuccess])
  const symbols = useMemo(() => watchlist.map((w) => w.symbol), [watchlist])
  // sort 讓 watchlist 順序變動但內容相同時不觸發新 query（穩定 cache key）
  const symbolKey = useMemo(() => [...symbols].sort().join(","), [symbols])

  const { data: quotes = [], isLoading, isFetching, isError } = useQuery<Quote[]>({
    queryKey: ["quotes", symbolKey],
    queryFn: async () => {
      if (!symbolKey) return []
      const res = await fetch(`/api/stocks?symbols=${encodeURIComponent(symbolKey)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json() as Promise<Quote[]>
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    enabled: symbols.length > 0,
  })

  const data: WatchlistEntry[] = useMemo(() => {
    const map = new Map(quotes.map((q) => [q.symbol, q]))
    return watchlist.map((w) => ({ ...w, quote: map.get(w.symbol) ?? null }))
  }, [watchlist, quotes])

  function handleRefresh() {
    void queryClient.invalidateQueries({ queryKey: ["quotes"] })
    void queryClient.invalidateQueries({ queryKey: ["market-indices"] })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TickerBar />
      <Navbar onRefresh={handleRefresh} isRefreshing={isFetching} />
      <CommandLine />

      <main className="flex-1 px-4 pb-12 pt-3.5 sm:px-8">
        <IndicesStrip />
        <MarketOverview />

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-5">
            <WatchlistTable data={data} isLoading={watchlistLoading || isLoading} isError={watchlistError || isError} />
          </div>
          <aside className="flex flex-col gap-5">
            <SidePanel data={data} />
          </aside>
        </div>
      </main>
    </div>
  )
}
