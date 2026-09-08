"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ExternalLink, Loader2 } from "lucide-react"
import { fmtMoney } from "@/lib/format"
import { QuoteSheet } from "./QuoteSheet"
import type { Profile, Quote } from "@/types"

type TabId = "quote" | "financials" | "news" | "peers"

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "quote", label: "報價" },
  { id: "financials", label: "財報" },
  { id: "news", label: "新聞" },
  { id: "peers", label: "同類股" },
]

interface Props {
  symbol: string
  profile: Profile | null
  quote: Quote | null
}

interface FinancialSnapshotDTO {
  peTTM: number
  peAnnual: number
  pbAnnual: number
  psTTM: number
  roeTTM: number
  roaTTM: number
  netMarginTTM: number
  grossMarginTTM: number
  debtToEquity: number
  currentRatio: number
  revenueGrowth3Y: number
  epsGrowth3Y: number
  dividendYield: number
}

interface NewsItemDTO {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  image: string
  publishedAt: string
}

interface PeerDTO {
  symbol: string
  name: string
  price: number | null
  changePercentage: number | null
  marketCap: number | null
}

export function RightTabs({ symbol, profile, quote }: Props) {
  const [tab, setTab] = useState<TabId>("quote")

  return (
    <section className="overflow-hidden rounded-xl border border-hair bg-card">
      <div className="flex border-b border-hair-soft">
        {TABS.map((t) => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "relative flex-1 px-2 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.1em] transition-colors " +
                (active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {t.label}
              {active && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 bg-brand" />
              )}
            </button>
          )
        })}
      </div>

      <div className="p-0">
        {tab === "quote" && <QuotePanel profile={profile} quote={quote} />}
        {tab === "financials" && <FinancialsPanel symbol={symbol} />}
        {tab === "news" && <NewsPanel symbol={symbol} />}
        {tab === "peers" && <PeersPanel symbol={symbol} />}
      </div>
    </section>
  )
}

function QuotePanel({ profile, quote }: { profile: Profile | null; quote: Quote | null }) {
  return (
    <div className="-mt-px [&>section]:rounded-none [&>section]:border-0">
      <QuoteSheet profile={profile} quote={quote} />
    </div>
  )
}

function f2(v: number | null | undefined): string {
  if (v == null || !isFinite(v) || v === 0) return "—"
  return v.toFixed(2)
}

function pct(v: number | null | undefined): string {
  if (v == null || !isFinite(v) || v === 0) return "—"
  if (Math.abs(v) >= 1) return `${v.toFixed(2)}%`
  return `${(v * 100).toFixed(2)}%`
}

function FinancialsPanel({ symbol }: { symbol: string }) {
  const { data, isPending, isError } = useQuery<FinancialSnapshotDTO>({
    queryKey: ["financials", symbol],
    queryFn: () =>
      fetch(`/api/financials/${symbol}`).then((r) => {
        if (!r.ok) throw new Error("financials")
        return r.json()
      }),
    staleTime: 60 * 60 * 1000,
  })

  if (isPending) return <PanelSpinner />
  if (isError || !data) return <PanelEmpty msg="財報資料目前無法取得" />

  const groups: Array<{ title: string; rows: Array<[string, string]> }> = [
    {
      title: "估值",
      rows: [
        ["P/E TTM", f2(data.peTTM)],
        ["P/E Annual", f2(data.peAnnual)],
        ["P/B", f2(data.pbAnnual)],
        ["P/S TTM", f2(data.psTTM)],
      ],
    },
    {
      title: "獲利能力",
      rows: [
        ["ROE TTM", pct(data.roeTTM)],
        ["ROA TTM", pct(data.roaTTM)],
        ["毛利率 TTM", pct(data.grossMarginTTM)],
        ["淨利率 TTM", pct(data.netMarginTTM)],
      ],
    },
    {
      title: "財務健康",
      rows: [
        ["Debt/Equity", f2(data.debtToEquity)],
        ["Current Ratio", f2(data.currentRatio)],
        ["股息殖利率", pct(data.dividendYield)],
      ],
    },
    {
      title: "成長",
      rows: [
        ["營收 3Y CAGR", pct(data.revenueGrowth3Y)],
        ["EPS 3Y CAGR", pct(data.epsGrowth3Y)],
      ],
    },
  ]

  return (
    <div className="divide-y divide-hair-soft">
      {groups.map((g) => (
        <div key={g.title} className="px-[18px] py-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {g.title}
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {g.rows.map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-hair-soft/40 pb-1 text-xs">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-mono font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}

function NewsPanel({ symbol }: { symbol: string }) {
  const { data, isPending, isError } = useQuery<NewsItemDTO[]>({
    queryKey: ["news", symbol],
    queryFn: () => fetch(`/api/news/${symbol}`).then((r) => r.json()),
    staleTime: 10 * 60 * 1000,
  })

  if (isPending) return <PanelSpinner />
  if (isError) return <PanelEmpty msg="新聞載入失敗" />
  if (!data || data.length === 0) return <PanelEmpty msg="近 7 天無相關新聞" />

  return (
    <div className="divide-y divide-hair-soft">
      {data.slice(0, 12).map((n) => (
        <a
          key={n.id}
          href={n.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-[18px] py-2.5 hover:bg-paper"
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-brand">
              {n.source}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {new Date(n.publishedAt).toLocaleString("zh-TW", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <h3 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug">
            {n.headline}
            <ExternalLink size={11} className="ml-1 inline opacity-50" />
          </h3>
        </a>
      ))}
    </div>
  )
}

function PeersPanel({ symbol }: { symbol: string }) {
  const { data, isPending, isError } = useQuery<PeerDTO[]>({
    queryKey: ["peers", symbol],
    queryFn: () => fetch(`/api/peers/${symbol}`).then((r) => r.json()),
    staleTime: 60 * 60 * 1000,
  })

  if (isPending) return <PanelSpinner />
  if (isError) return <PanelEmpty msg="同類股載入失敗" />
  if (!data || data.length === 0) return <PanelEmpty msg="無同類股資料" />

  return (
    <div className="divide-y divide-hair-soft">
      {data.map((p) => {
        const up = (p.changePercentage ?? 0) >= 0
        return (
          <Link
            key={p.symbol}
            href={`/stock/${p.symbol}`}
            className="grid grid-cols-[80px_1fr_70px_60px] items-center gap-2 px-[18px] py-2.5 hover:bg-paper"
          >
            <span className="font-mono text-[12px] font-bold text-brand">{p.symbol}</span>
            <span className="truncate text-[11px] text-muted-foreground">{p.name}</span>
            <span className="text-right font-mono text-[11px] tabular-nums">
              {p.price != null ? `$${fmtMoney(p.price)}` : "—"}
            </span>
            <span
              className={
                "text-right font-mono text-[11px] font-bold tabular-nums " +
                (up ? "text-up" : "text-down")
              }
            >
              {p.changePercentage != null
                ? `${up ? "+" : ""}${p.changePercentage.toFixed(2)}%`
                : "—"}
            </span>
          </Link>
        )
      })}
      <div className="px-[18px] py-2 font-mono text-[10px] text-muted-foreground/70">
        資料來源：Finnhub peer mapping
      </div>
    </div>
  )
}

function PanelSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 size={20} className="animate-spin text-muted-foreground" />
    </div>
  )
}

function PanelEmpty({ msg }: { msg: string }) {
  return <div className="px-[18px] py-10 text-center text-xs text-muted-foreground">{msg}</div>
}
