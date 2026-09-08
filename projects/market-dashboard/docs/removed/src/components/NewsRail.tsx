"use client"

import { useQuery } from "@tanstack/react-query"
import { SectionHeader } from "@/components/design/SectionHeader"
import type { NewsItem } from "@/types/index"

const SENT = {
  positive: { bar: "var(--up)", label: "正面" },
  negative: { bar: "var(--down)", label: "負面" },
  neutral: { bar: "var(--muted-foreground)", label: "中立" },
} as const

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 60) return `${diffMin} 分鐘前`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH} 小時前`
  const diffD = Math.floor(diffH / 24)
  return `${diffD} 天前`
}

export function NewsRail() {
  const { data, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["news", "SPY"],
    queryFn: () => fetch("/api/news/SPY").then((r) => r.json()),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  })

  const items = (Array.isArray(data) ? data : []).slice(0, 6)

  return (
    <section className="overflow-hidden rounded-xl border border-hair bg-card">
      <SectionHeader
        eyebrow="NEWSWIRE · LIVE"
        title="市場新聞"
        right={
          <span className="font-mono text-[10px] font-semibold text-muted-foreground">
            每 30 分鐘更新
          </span>
        }
      />
      {isLoading ? (
        <div className="space-y-2 p-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-black/[0.04]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="px-6 py-10 text-center text-xs text-muted-foreground">暫無市場新聞</div>
      ) : (
        items.map((n, i) => {
          const s = SENT[n.sentiment] ?? SENT.neutral
          return (
            <a
              key={n.url + n.publishedAt}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className={
                "grid grid-cols-[3px_1fr] gap-2.5 px-4 py-3 hover:bg-paper sm:px-[18px] " +
                (i === 0 ? "" : "border-t border-hair-soft")
              }
            >
              <div className="rounded-sm" style={{ background: s.bar }} />
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[9.5px] font-bold tracking-[0.04em] text-muted-foreground">
                    {n.source.toUpperCase()}
                  </span>
                  <span className="text-[9.5px] text-muted-foreground">·</span>
                  <span className="text-[9.5px] text-muted-foreground">
                    {timeAgo(n.publishedAt)}
                  </span>
                  <span
                    className="ml-auto font-mono text-[9px] font-bold"
                    style={{ color: s.bar }}
                  >
                    {s.label}
                  </span>
                </div>
                <div className="text-[12.5px] font-medium leading-snug">{n.title}</div>
              </div>
            </a>
          )
        })
      )}
    </section>
  )
}
