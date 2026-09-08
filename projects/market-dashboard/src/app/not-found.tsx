import Link from "next/link"
import { Search, Home } from "lucide-react"

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <div className="font-mono text-[80px] font-bold leading-none text-brand">404</div>
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">找不到頁面</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          這頁可能已移除、URL 拼錯，或股票代號不存在。
        </p>
      </div>
      <div className="flex gap-2.5">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-bold text-white hover:opacity-90"
        >
          <Home size={13} />
          回首頁
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-md border border-hair px-4 py-2 text-xs font-medium text-foreground hover:bg-paper"
        >
          <Search size={13} />
          搜尋股票
        </Link>
      </div>
    </main>
  )
}
