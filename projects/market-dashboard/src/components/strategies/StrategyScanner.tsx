"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Navbar } from "@/components/dashboard/Navbar"
import { TickerBar } from "@/components/design/TickerBar"
import { getWatchlist } from "@/lib/watchlist"
import type { WatchlistItem } from "@/types"

interface Signal { id: string; label: string; state: "hit" | "miss" | "unavailable"; reason: string; evidence: Record<string, number | string> }
interface Result { symbol: string; asOf: string | null; source: string; signals: Signal[] }

export function StrategyScanner() {
  const { data: watchlist = [], isError: watchlistError } = useQuery<WatchlistItem[]>({ queryKey: ["watchlist"], queryFn: getWatchlist, staleTime: Infinity })
  const key = watchlist.map((item) => item.symbol).sort().join(",")
  const { data = [], isPending, isError } = useQuery<Result[]>({ queryKey: ["strategy-scan", key], queryFn: async () => { const response = await fetch(`/api/strategies?symbols=${encodeURIComponent(key)}`); if (!response.ok) throw new Error("scan"); return response.json() }, enabled: Boolean(key), staleTime: 5 * 60 * 1000 })
  const hits = data.flatMap((result) => result.signals.filter((signal) => signal.state === "hit").map((signal) => ({ result, signal })))
  return <div className="min-h-screen bg-background"><TickerBar /><Navbar breadcrumb={[{ label: "儀表板", href: "/" }, { label: "策略掃描" }]} /><main className="px-4 pb-12 pt-5 sm:px-8">
    <h1 className="font-serif text-3xl font-bold">策略掃描</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">以自選股的已收盤日線檢查均線突破、量增突破、多頭回檔與相對 SPY 強勢。這是條件篩選，不是投資建議或下單訊號。</p>
    <div className="mt-5 rounded-xl border border-hair bg-card p-4 text-xs text-muted-foreground"><b className="text-foreground">固定規則：</b> 50 日均線穿越；突破前 20 日高點且達 1.5 倍量；20 日線在 50 日線上並回測收回；63 個共同交易日領先 SPY 5 個百分點。最新、前高與均量視窗分開，避免偷看當日值。</div>
    {watchlistError && <p className="mt-5 text-down">本機自選股服務未啟用。</p>}{!key && !watchlistError && <p className="mt-5 rounded-xl border border-hair bg-card p-8 text-center text-muted-foreground">自選股為空，先回首頁新增股票。</p>}
    {key && isPending && <p className="mt-5 text-muted-foreground">掃描日線中…</p>}{isError && <p className="mt-5 text-down">歷史資料載入失敗，未產生模擬訊號。</p>}
    {data.length > 0 && <><div className="mt-5 font-mono text-xs">符合條件 {hits.length} 組 / 掃描 {data.length} 檔</div><div className="mt-3 grid gap-4 lg:grid-cols-2">{data.map((result) => <section key={result.symbol} className="overflow-hidden rounded-xl border border-hair bg-card"><div className="flex items-center justify-between border-b border-hair-soft px-4 py-3"><Link href={`/stock/${result.symbol}`} className="font-mono text-lg font-bold text-brand">{result.symbol}</Link><span className="font-mono text-[10px] text-muted-foreground">{result.asOf ?? "無資料"}</span></div><div className="divide-y divide-hair-soft">{result.signals.map((signal) => <div key={signal.id} className="p-3"><div className="flex justify-between"><b>{signal.label}</b><span className={signal.state === "hit" ? "text-up" : signal.state === "unavailable" ? "text-down" : "text-muted-foreground"}>{signal.state === "hit" ? "符合" : signal.state === "miss" ? "未符合" : "資料不足"}</span></div><p className="mt-1 text-xs text-muted-foreground">{signal.reason}</p><div className="mt-1 font-mono text-[10px] text-muted-foreground">{Object.entries(signal.evidence).map(([k, v]) => `${k} ${v}`).join(" · ")}</div></div>)}</div></section>)}</div></>}
  </main></div>
}
