"use client"

import Link from "next/link"
import type { Quote } from "@/types"
import type { WatchlistItem } from "@/types"

type WatchlistEntry = WatchlistItem & { quote: Quote | null }

interface SidePanelProps {
  data: WatchlistEntry[]
}

// 黑卡 AI Brief — v2 設計的右欄主視覺
export function SidePanel({ data }: SidePanelProps) {
  const withQuotes = data.filter(
    (d): d is WatchlistEntry & { quote: Quote } => d.quote !== null,
  )

  const buys = withQuotes.filter((d) => d.quote.changePercentage >= 1.5).length
  const sells = withQuotes.filter((d) => d.quote.changePercentage <= -1.5).length
  const holds = withQuotes.length - buys - sells

  const topGainer = [...withQuotes]
    .sort((a, b) => b.quote.changePercentage - a.quote.changePercentage)[0]
  const topLoser = [...withQuotes]
    .sort((a, b) => a.quote.changePercentage - b.quote.changePercentage)[0]

  const briefLines: string[] = []
  if (topGainer) {
    briefLines.push(
      `本日領漲 ${topGainer.symbol}（${topGainer.quote.changePercentage >= 0 ? "+" : ""}${topGainer.quote.changePercentage.toFixed(2)}%）`,
    )
  }
  if (topLoser && topLoser.symbol !== topGainer?.symbol) {
    briefLines.push(
      `表現最弱 ${topLoser.symbol}（${topLoser.quote.changePercentage.toFixed(2)}%）`,
    )
  }
  briefLines.push(`追蹤清單共 ${data.length} 檔，買訊 ${buys} / 持有 ${holds} / 賣訊 ${sells}。`)

  const brief = briefLines.join("，") + "。"

  // 用追蹤清單第一檔當深度分析入口（最常見場景）
  const primarySymbol = data[0]?.symbol

  return (
    <section className="relative overflow-hidden rounded-xl bg-ink p-[18px] text-ink-foreground">
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
        <span className="size-1.5 animate-dot-pulse rounded-full bg-brand shadow-[0_0_8px] shadow-brand" />
        AI BRIEF · CLAUDE 4.6
      </div>
      <h3 className="mb-1 mt-2 font-serif text-lg font-semibold tracking-tight">今日投組摘要</h3>
      <div className="font-mono text-[10px] text-white/50">
        {new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}{" "}
        EDT · 規則摘要
      </div>
      <p className="mt-3 text-[12.5px] leading-relaxed text-white/90">
        {brief}{" "}
        <span className="font-bold text-brand">
          打開個股頁可由 Claude Sonnet 4.6 給出完整分析報告。
        </span>
      </p>

      <div className="mt-3.5 grid grid-cols-3 gap-2.5">
        {[
          { l: "BUY", v: buys, c: "text-up-neon" },
          { l: "HOLD", v: holds, c: "text-white/70" },
          { l: "SELL", v: sells, c: "text-down-neon" },
        ].map((k) => (
          <div
            key={k.l}
            className="rounded-lg border border-white/[0.08] bg-white/[0.05] px-3 py-2.5"
          >
            <div className="font-mono text-[9px] font-bold tracking-[0.1em] text-white/50">
              {k.l}
            </div>
            <div className={"mt-0.5 font-mono text-[22px] font-bold tabular-nums " + k.c}>
              {k.v}
            </div>
          </div>
        ))}
      </div>

      {primarySymbol ? (
        <Link
          href={`/stock/${primarySymbol}`}
          className="mt-3.5 flex w-full items-center justify-between rounded-lg bg-brand px-3.5 py-3 text-xs font-bold tracking-[0.04em] text-white"
        >
          <span>打開 {primarySymbol} 個股頁分析</span>
          <span>→</span>
        </Link>
      ) : (
        <div className="mt-3.5 rounded-lg border border-white/[0.08] bg-white/[0.05] px-3.5 py-3 text-center text-[11px] text-white/50">
          先新增追蹤股票或持股以啟用個股分析
        </div>
      )}
    </section>
  )
}
