"use client"

import { useMemo, useSyncExternalStore } from "react"
import Link from "next/link"
import { useQueries, useQuery } from "@tanstack/react-query"
import { ArrowDownRight, ArrowUpRight, Loader2, Newspaper, Sun } from "lucide-react"
import { TickerBar } from "@/components/design/TickerBar"
import { Navbar } from "@/components/dashboard/Navbar"
import { SectionHeader } from "@/components/design/SectionHeader"
import {
  getServerSnapshot as getWatchServer,
  getSnapshot as getWatchSnap,
  parseWatchlist,
  subscribe as subscribeWatch,
} from "@/lib/watchlist"
import type { Quote } from "@/types"

interface NewsItemDTO {
  id: number
  headline: string
  source: string
  url: string
  publishedAt: string
}

export function BriefingView() {
  const today = new Date()
  const dateStr = today.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  const watchSnap = useSyncExternalStore(subscribeWatch, getWatchSnap, getWatchServer)
  const watchlist = useMemo(() => parseWatchlist(watchSnap), [watchSnap])
  const watchSymbols = useMemo(() => watchlist.map((w) => w.symbol), [watchlist])

  const { data: watchQuotes = [], isLoading: quotesLoading } = useQuery<Quote[]>({
    queryKey: ["briefing-watch", [...watchSymbols].sort().join(",")],
    queryFn: () =>
      watchSymbols.length === 0
        ? Promise.resolve([])
        : fetch(`/api/stocks?symbols=${watchSymbols.join(",")}`).then((r) => r.json()),
    staleTime: 60 * 1000,
    enabled: watchSymbols.length > 0,
  })

  const ranked = useMemo(
    () => [...watchQuotes].sort((a, b) => b.changePercentage - a.changePercentage),
    [watchQuotes],
  )

  // 抓追蹤清單漲跌幅最劇烈的前 4 個標的新聞（合併，最新優先）
  const newsTargets = useMemo(
    () => [...ranked.slice(0, 2), ...ranked.slice(-2)].map((q) => q.symbol),
    [ranked],
  )
  const newsQueries = useQueries({
    queries: newsTargets.map((s) => ({
      queryKey: ["news", s],
      queryFn: () => fetch(`/api/news/${s}`).then((r) => r.json() as Promise<NewsItemDTO[]>),
      staleTime: 30 * 60 * 1000,
    })),
  })
  const aggregatedNews = useMemo(() => {
    const list: (NewsItemDTO & { symbol: string })[] = []
    newsQueries.forEach((q, i) => {
      if (q.data) {
        for (const n of q.data.slice(0, 3)) list.push({ ...n, symbol: newsTargets[i] })
      }
    })
    return list.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 12)
  }, [newsQueries, newsTargets])

  const winners = ranked.filter((q) => q.changePercentage > 0).length
  const losers = ranked.filter((q) => q.changePercentage < 0).length
  const avgChg =
    ranked.length > 0 ? ranked.reduce((s, q) => s + q.changePercentage, 0) / ranked.length : 0
  const breadthUp = winners >= losers

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TickerBar />
      <Navbar breadcrumb={[{ label: "儀表板", href: "/" }, { label: "每日簡報" }]} />

      <main className="flex-1 px-4 pb-12 pt-5 sm:px-8">
        <div className="mb-5">
          <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
            <Sun size={26} className="text-brand" />
            早安，今日簡報
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">{dateStr}</p>
        </div>

        <div className="mx-auto flex max-w-4xl flex-col gap-5">
          {/* Watchlist summary */}
          <section className="overflow-hidden rounded-xl border border-hair bg-card">
            <SectionHeader eyebrow="WATCHLIST · TODAY" title="追蹤清單當日表現" />
            {watchlist.length === 0 ? (
              <p className="px-[18px] py-8 text-center text-sm text-muted-foreground">
                追蹤清單為空，先到首頁加入標的
              </p>
            ) : quotesLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 border-b border-hair-soft px-[18px] py-4">
                  <Kpi
                    label="標的數"
                    value={`${ranked.length}`}
                  />
                  <Kpi
                    label="平均漲跌"
                    value={`${avgChg >= 0 ? "+" : ""}${avgChg.toFixed(2)}%`}
                    color={breadthUp ? "up" : "down"}
                  />
                  <Kpi label="漲/跌" value={`${winners} / ${losers}`} />
                </div>
                <div className="grid grid-cols-1 divide-y divide-hair-soft md:grid-cols-2 md:divide-x md:divide-y-0">
                  <RankList
                    title="領漲"
                    icon={<ArrowUpRight size={13} className="text-up" />}
                    items={ranked.slice(0, 5)}
                  />
                  <RankList
                    title="領跌"
                    icon={<ArrowDownRight size={13} className="text-down" />}
                    items={[...ranked].reverse().slice(0, 5)}
                  />
                </div>
              </>
            )}
          </section>

          {/* News */}
          <section className="overflow-hidden rounded-xl border border-hair bg-card">
            <SectionHeader
              eyebrow="HEADLINES"
              title={
                <span className="flex items-center gap-1.5">
                  <Newspaper size={14} className="text-brand" />
                  今日重點新聞
                </span>
              }
            />
            {newsTargets.length === 0 && (
              <p className="px-[18px] py-8 text-center text-sm text-muted-foreground">
                追蹤清單為空，無法產生新聞摘要
              </p>
            )}
            {newsTargets.length > 0 && aggregatedNews.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-muted-foreground" />
              </div>
            )}
            <div className="divide-y divide-hair-soft">
              {aggregatedNews.map((n) => (
                <a
                  key={`${n.symbol}_${n.id}`}
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-[18px] py-2.5 hover:bg-paper"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-brand">{n.symbol}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {n.source} ·{" "}
                      {new Date(n.publishedAt).toLocaleString("zh-TW", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h3 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug">
                    {n.headline}
                  </h3>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function Kpi({ label, value, color }: { label: string; value: string; color?: "up" | "down" }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={
          "mt-1 font-mono text-lg font-bold tabular-nums " +
          (color === "up" ? "text-up" : color === "down" ? "text-down" : "")
        }
      >
        {value}
      </div>
    </div>
  )
}

function RankList({
  title,
  icon,
  items,
}: {
  title: string
  icon: React.ReactNode
  items: Quote[]
}) {
  return (
    <div className="px-[18px] py-3">
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="mt-2 space-y-2">
        {items.length === 0 && <p className="text-[11px] text-muted-foreground/70">無資料</p>}
        {items.map((q) => {
          const up = q.changePercentage >= 0
          return (
            <Link
              key={q.symbol}
              href={`/stock/${q.symbol}`}
              className="flex items-center justify-between rounded px-2 py-1 hover:bg-paper"
            >
              <div>
                <div className="font-mono text-[13px] font-bold text-brand">{q.symbol}</div>
                <div className="font-mono text-[10px] text-muted-foreground tabular-nums">
                  ${q.price.toFixed(2)}
                </div>
              </div>
              <span
                className={
                  "font-mono text-[12px] font-bold tabular-nums " +
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
    </div>
  )
}
