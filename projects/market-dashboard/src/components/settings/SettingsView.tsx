"use client"

import { useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Download, Trash2, Upload } from "lucide-react"
import { TickerBar } from "@/components/design/TickerBar"
import { Navbar } from "@/components/dashboard/Navbar"
import { SectionHeader } from "@/components/design/SectionHeader"
import { Button } from "@/components/ui/button"
import { getWatchlist, setWatchlist } from "@/lib/watchlist"
import type { WatchlistItem } from "@/types"

export function SettingsView() {
  const fileRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { data: watchlist = [], isError } = useQuery<WatchlistItem[]>({ queryKey: ["watchlist"], queryFn: getWatchlist, staleTime: Infinity })

  function exportData() {
    const blob = new Blob([JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), watchlist }, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob); const link = document.createElement("a")
    link.href = url; link.download = `美股研究自選股_${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url)
  }

  async function importData(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      if (file.size > 128 * 1024) throw new Error("檔案超過 128 KB")
      const parsed = JSON.parse(await file.text())
      if (!parsed || !Array.isArray(parsed.watchlist)) throw new Error("備份格式不正確")
      const saved = await setWatchlist(parsed.watchlist)
      queryClient.setQueryData(["watchlist"], saved); toast.success(`已匯入 ${saved.length} 檔，重複代號已合併`)
    } catch (error) { toast.error(error instanceof Error ? `匯入失敗：${error.message}` : "匯入失敗") }
    event.target.value = ""
  }

  async function clearAll() {
    if (!window.confirm("確定清除伺服器端自選股？此操作無法復原。")) return
    try { const saved = await setWatchlist([]); queryClient.setQueryData(["watchlist"], saved); toast.success("已清除自選股") }
    catch (error) { toast.error(error instanceof Error ? error.message : "清除失敗") }
  }

  return <div className="flex min-h-screen flex-col bg-background text-foreground"><TickerBar /><Navbar breadcrumb={[{ label: "儀表板", href: "/" }, { label: "設定" }]} />
    <main className="flex-1 px-4 pb-12 pt-5 sm:px-8"><section className="overflow-hidden rounded-xl border border-hair bg-card"><SectionHeader eyebrow="LOCAL STORAGE" title="自選股備份" />
      <div className="p-5"><p className="text-sm">目前共 <b>{watchlist.length}</b> 檔。資料由本機 Node 服務以私有檔案保存。</p>{isError && <p className="mt-2 text-sm text-down">本機自選股服務未啟用；請由專案根目錄執行 npm run dev 或 npm start。</p>}
        <div className="mt-4 flex flex-wrap gap-3"><Button onClick={exportData} variant="outline"><Download size={14} /> 匯出 JSON</Button><Button onClick={() => fileRef.current?.click()} variant="outline"><Upload size={14} /> 匯入 JSON</Button><Button onClick={clearAll} variant="outline" className="text-down"><Trash2 size={14} /> 清除</Button><input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importData} /></div>
      </div><p className="border-t border-hair-soft px-5 py-3 text-xs text-muted-foreground">此模式只綁定 127.0.0.1，尚未提供公開部署所需的帳號驗證。舊版瀏覽器自選股會在首次開啟首頁時自動遷移。</p>
    </section></main></div>
}
