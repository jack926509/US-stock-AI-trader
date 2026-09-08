"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Download, Trash2, Upload } from "lucide-react"
import { TickerBar } from "@/components/design/TickerBar"
import { Navbar } from "@/components/dashboard/Navbar"
import { SectionHeader } from "@/components/design/SectionHeader"
import { Button } from "@/components/ui/button"
import { getWatchlist, setWatchlist } from "@/lib/watchlist"
import { clearHistory, getHistory } from "@/lib/analysisHistory"

const STORAGE_KEYS = ["watchlist_v1", "analysis_history_v1"]

interface Stats {
  watchlist: number
  analyses: number
  bytes: number
}

function computeStats(): Stats {
  let bytes = 0
  if (typeof window !== "undefined") {
    for (const k of STORAGE_KEYS) {
      const v = window.localStorage.getItem(k)
      if (v) bytes += v.length
    }
  }
  return {
    watchlist: getWatchlist().length,
    analyses: getHistory().length,
    bytes,
  }
}

export function SettingsView() {
  const [stats, setStats] = useState<Stats>({ watchlist: 0, analyses: 0, bytes: 0 })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setStats(computeStats())
  }, [])

  function refresh() {
    setStats(computeStats())
  }

  function handleExportAll() {
    const dump = {
      version: 1,
      exportedAt: new Date().toISOString(),
      watchlist: getWatchlist(),
      analyses: getHistory(),
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `us-stock-analyzer-backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("已匯出全部資料")
  }

  function handleImportAll(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const ok = window.confirm("匯入將覆蓋目前所有本機資料（追蹤清單、分析歷史）。確定？")
    if (!ok) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result ?? ""))
        if (Array.isArray(raw.watchlist)) setWatchlist(raw.watchlist)
        if (Array.isArray(raw.analyses)) {
          window.localStorage.setItem("analysis_history_v1", JSON.stringify(raw.analyses))
        }
        toast.success("匯入完成")
        refresh()
      } catch (err) {
        toast.error(err instanceof Error ? `匯入失敗：${err.message}` : "匯入失敗")
      }
    }
    reader.readAsText(f)
    if (fileRef.current) fileRef.current.value = ""
  }

  function handleClearAll() {
    const ok = window.confirm("清除全部本機資料？此操作無法復原，建議先匯出備份。")
    if (!ok) return
    for (const k of STORAGE_KEYS) {
      window.localStorage.removeItem(k)
    }
    setWatchlist([])
    clearHistory()
    toast.success("已清除全部")
    refresh()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TickerBar />
      <Navbar breadcrumb={[{ label: "儀表板", href: "/" }, { label: "設定" }]} />

      <main className="flex-1 px-4 pb-12 pt-5 sm:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Storage stats */}
          <section className="overflow-hidden rounded-xl border border-hair bg-card lg:col-span-2">
            <SectionHeader eyebrow="STORAGE" title="本機儲存統計" />
            <div className="grid grid-cols-2 gap-3 p-5 text-sm md:grid-cols-3">
              <Stat label="追蹤清單" value={stats.watchlist} />
              <Stat label="分析報告" value={stats.analyses} />
              <Stat label="總大小" value={`${(stats.bytes / 1024).toFixed(1)} KB`} />
            </div>
          </section>

          {/* Backup */}
          <section className="overflow-hidden rounded-xl border border-hair bg-card lg:col-span-2">
            <SectionHeader eyebrow="BACKUP" title="備份與還原" />
            <div className="flex flex-wrap gap-3 p-5">
              <Button onClick={handleExportAll} variant="outline" className="gap-1.5">
                <Download size={14} /> 匯出全部（JSON）
              </Button>
              <Button onClick={() => fileRef.current?.click()} variant="outline" className="gap-1.5">
                <Upload size={14} /> 匯入備份
              </Button>
              <Button onClick={handleClearAll} variant="outline" className="gap-1.5 border-down/40 text-down hover:bg-down/5">
                <Trash2 size={14} /> 清除全部
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleImportAll}
              />
            </div>
            <div className="border-t border-hair-soft px-5 py-3 font-mono text-[10px] text-muted-foreground/70">
              所有資料僅存於此瀏覽器的 localStorage，沒有伺服器備份；跨裝置請手動匯出/匯入。
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function Stat({ label, value, span2 }: { label: string; value: number | string; span2?: boolean }) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-xl font-bold tabular-nums">{value}</div>
    </div>
  )
}
