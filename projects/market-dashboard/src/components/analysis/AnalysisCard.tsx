"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Sparkles, Loader2, RefreshCw, AlertCircle, History, Trash2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { SectionHeader } from "@/components/design/SectionHeader"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  addHistory,
  getHistoryBySymbol,
  removeHistory,
  type HistoryEntry,
} from "@/lib/analysisHistory"
import type { AnalysisReport } from "@/types"

interface Props {
  symbol: string
}

const CACHE_TTL_MS = 60 * 60 * 1000

interface CacheEntry {
  report: AnalysisReport
  expires: number
}

function cacheKey(symbol: string): string {
  return `analysis:${symbol.toUpperCase()}`
}

function readCache(symbol: string): AnalysisReport | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(cacheKey(symbol))
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    if (entry.expires < Date.now()) {
      window.sessionStorage.removeItem(cacheKey(symbol))
      return null
    }
    return entry.report
  } catch {
    return null
  }
}

function writeCache(symbol: string, report: AnalysisReport): void {
  if (typeof window === "undefined") return
  try {
    const entry: CacheEntry = { report, expires: Date.now() + CACHE_TTL_MS }
    window.sessionStorage.setItem(cacheKey(symbol), JSON.stringify(entry))
  } catch {
    // sessionStorage 滿時靜默忽略；下次重新分析即可重建
  }
}

const RATING_BADGE: Record<NonNullable<AnalysisReport["rating"]>, { label: string; bg: string }> = {
  "Strong Buy": { label: "強力買進", bg: "#10A37F" },
  Buy: { label: "買進", bg: "#34A853" },
  Hold: { label: "持有", bg: "#A88B5C" },
  Sell: { label: "賣出", bg: "#D55F3E" },
  "Strong Sell": { label: "強力賣出", bg: "#B33A2A" },
}

export function AnalysisCard({ symbol }: Props) {
  const [report, setReport] = useState<AnalysisReport | null>(() => readCache(symbol))
  const [fromCache, setFromCache] = useState<boolean>(() => readCache(symbol) !== null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyList, setHistoryList] = useState<HistoryEntry[]>([])

  useEffect(() => {
    const cached = readCache(symbol)
    setReport(cached)
    setFromCache(cached !== null)
  }, [symbol])

  useEffect(() => {
    if (historyOpen) setHistoryList(getHistoryBySymbol(symbol))
  }, [historyOpen, symbol])

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/analysis/${symbol}?stream=1`, { method: "POST" })
      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(err?.error ?? "分析失敗")
      }
      setReport({
        symbol,
        content: "",
        rating: null,
        targetPriceLow: null,
        targetPriceHigh: null,
        generatedAt: new Date().toISOString(),
      })
      setFromCache(false)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ""
      let live = ""
      let final: AnalysisReport | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split("\n")
        buf = lines.pop() ?? ""
        for (const line of lines) {
          const t = line.trim()
          if (!t) continue
          let ev: {
            type: string
            text?: string
            report?: AnalysisReport
            message?: string
          }
          try {
            ev = JSON.parse(t)
          } catch {
            continue
          }
          if (ev.type === "chunk" && ev.text) {
            live += ev.text
            setReport((prev) =>
              prev ? { ...prev, content: live } : { symbol, content: live, rating: null, targetPriceLow: null, targetPriceHigh: null, generatedAt: new Date().toISOString() },
            )
          } else if (ev.type === "done" && ev.report) {
            final = ev.report
          } else if (ev.type === "error") {
            throw new Error(ev.message ?? "分析失敗")
          }
        }
      }
      if (!final) throw new Error("分析未完成（串流中斷）")
      return final
    },
    onSuccess: (data) => {
      setReport(data)
      setFromCache(false)
      writeCache(symbol, data)
      addHistory(data)
    },
  })

  const loading = mutation.isPending
  const error = mutation.error?.message
  const badge = report?.rating ? RATING_BADGE[report.rating] : null
  const streaming = loading && (report?.content?.length ?? 0) > 0

  return (
    <section className="overflow-hidden rounded-xl border border-hair bg-card">
      <SectionHeader
        eyebrow="AI ANALYSIS · CLAUDE SONNET 4.6"
        title="全能型有價分析師"
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-1 rounded-md border border-hair px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
              title="查看歷史報告"
            >
              <History size={12} />
              歷史
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-[11px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : report ? <RefreshCw size={12} /> : <Sparkles size={12} />}
              {loading ? "分析中..." : report ? "重新分析" : "開始分析"}
            </button>
          </div>
        }
      />

      <div className="p-5">
        {!report && !loading && !error && (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Sparkles size={28} className="opacity-60" />
            <p className="text-sm">點擊「開始分析」由 Claude Sonnet 4.6 給出評級、目標價、多空對比與倉位建議</p>
            <p className="font-mono text-[11px] text-muted-foreground/70">預估耗時 20-40 秒</p>
          </div>
        )}

        {loading && !report?.content && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Loader2 size={28} className="animate-spin text-brand" />
            <p className="text-sm">Claude 正在分析 {symbol}...</p>
            <p className="font-mono text-[11px] text-muted-foreground">串流即將開始</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-2 rounded-md border border-down/40 bg-down/5 p-3 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-down" />
            <div>
              <div className="font-semibold">分析失敗</div>
              <p className="mt-1 text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {report?.content && (
          <article className="space-y-3">
            {(badge || streaming) && (
              <div className="flex flex-wrap items-center gap-2">
                {badge && !streaming && (
                  <span
                    className="rounded-md px-3 py-1.5 font-mono text-xs font-bold tracking-wide text-white"
                    style={{ background: badge.bg }}
                  >
                    {badge.label} · {report.rating}
                  </span>
                )}
                {!streaming && report.targetPriceLow != null && report.targetPriceHigh != null && (
                  <span className="font-mono text-xs text-muted-foreground">
                    目標價 ${report.targetPriceLow}-${report.targetPriceHigh}
                  </span>
                )}
                {streaming && (
                  <span className="flex items-center gap-1.5 rounded-md bg-brand/10 px-2.5 py-1 font-mono text-[11px] font-bold text-brand">
                    <Loader2 size={11} className="animate-spin" />
                    串流分析中...
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                  {fromCache && !streaming && (
                    <span className="rounded border border-hair px-1.5 py-0.5 tracking-wide">
                      已快取
                    </span>
                  )}
                  {!streaming && new Date(report.generatedAt).toLocaleString("zh-TW")}
                </span>
              </div>
            )}
            <div className="prose prose-sm max-w-none font-serif prose-headings:font-serif prose-headings:font-semibold prose-p:leading-relaxed prose-table:text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.content}</ReactMarkdown>
            </div>
            {!loading && (
              <p className="border-t border-hair-soft pt-3 font-mono text-[10px] text-muted-foreground/70">
                本分析由 AI 生成，僅供研究參考，不構成投資建議。
              </p>
            )}
          </article>
        )}
      </div>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="border-black/[0.1] bg-white text-stone-900 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-stone-900">分析歷史 · {symbol}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {historyList.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                尚無歷史報告。完成一次分析後會自動保存。
              </p>
            )}
            <div className="divide-y divide-black/[0.06]">
              {historyList.map((h) => {
                const b = h.rating ? RATING_BADGE[h.rating] : null
                return (
                  <div key={h.id} className="flex items-center justify-between gap-3 py-2.5">
                    <button
                      onClick={() => {
                        setReport(h)
                        setFromCache(false)
                        writeCache(symbol, h)
                        setHistoryOpen(false)
                      }}
                      className="flex flex-1 items-center gap-3 rounded px-2 py-1 text-left hover:bg-black/[0.04]"
                    >
                      {b && (
                        <span
                          className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white"
                          style={{ background: b.bg }}
                        >
                          {h.rating}
                        </span>
                      )}
                      {h.targetPriceLow != null && h.targetPriceHigh != null && (
                        <span className="font-mono text-[11px] text-stone-600">
                          ${h.targetPriceLow}-${h.targetPriceHigh}
                        </span>
                      )}
                      <span className="ml-auto font-mono text-[11px] text-stone-500">
                        {new Date(h.generatedAt).toLocaleString("zh-TW")}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        removeHistory(h.id)
                        setHistoryList(getHistoryBySymbol(symbol))
                      }}
                      className="text-stone-400 hover:text-down"
                      title="刪除此筆"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
