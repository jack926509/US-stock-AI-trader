"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import type { Quote } from "@/types"

interface Overview {
  sectors: Quote[]
  breadth: { advancers: number; decliners: number; unchanged: number; available: number; total: number; unavailable: number }
  abnormalVolume: Array<{ symbol: string; name: string; ratio: number; changePercentage: number }>
  meta: { source: string; asOf: string | null; message: string }
}

export function MarketOverview() {
  const { data, isPending, isError } = useQuery<Overview>({ queryKey: ["overview"], queryFn: async () => { const response = await fetch("/api/overview"); if (!response.ok) throw new Error("overview"); return response.json() }, staleTime: 5 * 60 * 1000 })
  return <section className="mt-5 overflow-hidden rounded-xl border border-hair bg-card">
    <div className="flex flex-wrap items-end justify-between gap-2 border-b border-hair-soft px-[18px] py-3.5"><div><div className="font-mono text-[10px] font-bold tracking-[0.12em] text-muted-foreground">MARKET OVERVIEW · 已收盤日線</div><h2 className="font-serif text-lg font-bold">市場總覽</h2></div>{data && <div className="font-mono text-[10px] text-muted-foreground">{data.meta.source} · {data.meta.asOf ?? "無資料"}</div>}</div>
    {isPending && <p className="p-5 text-sm text-muted-foreground">正在讀取市場日線…</p>}
    {isError && <p className="p-5 text-sm text-down">市場資料目前無法取得，未以模擬數值替代。</p>}
    {data && <div className="grid gap-px bg-hair-soft lg:grid-cols-3">
      <div className="bg-card p-4"><h3 className="font-bold">市場廣度</h3><div className="mt-3 flex gap-5 font-mono"><span className="text-up">上漲 {data.breadth.advancers}</span><span className="text-down">下跌 {data.breadth.decliners}</span><span>平盤 {data.breadth.unchanged}</span></div><p className="mt-2 text-[11px] text-muted-foreground">涵蓋 {data.breadth.available}/{data.breadth.total}；缺漏 {data.breadth.unavailable} 檔不計入平盤。</p></div>
      <div className="bg-card p-4"><h3 className="font-bold">產業 ETF</h3><div className="mt-2 grid grid-cols-2 gap-1">{data.sectors.slice(0, 6).map((item) => <span key={item.symbol} className="flex justify-between rounded bg-paper px-2 py-1 font-mono text-[11px]"><b>{item.name}</b><span className={item.changePercentage >= 0 ? "text-up" : "text-down"}>{item.changePercentage >= 0 ? "+" : ""}{item.changePercentage.toFixed(2)}%</span></span>)}</div></div>
      <div className="bg-card p-4"><h3 className="font-bold">異常量</h3><div className="mt-2 space-y-1">{data.abnormalVolume.slice(0, 5).map((item) => <Link key={item.symbol} href={`/stock/${item.symbol}`} className="flex justify-between rounded px-2 py-1 font-mono text-[11px] hover:bg-paper"><b>{item.symbol}</b><span>{item.ratio.toFixed(2)}× 20日均量</span></Link>)}{data.abnormalVolume.length === 0 && <p className="text-xs text-muted-foreground">目前無符合 1.5 倍量且資料完整的樣本。</p>}</div></div>
    </div>}
    {data && <p className="border-t border-hair-soft px-4 py-2 text-[10px] text-muted-foreground">{data.meta.message}</p>}
  </section>
}
