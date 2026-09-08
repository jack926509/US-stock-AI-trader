"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error("[app/error]", error)
  }, [error])

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-down/10 text-down">
        <AlertTriangle size={28} />
      </div>
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">系統發生錯誤</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "未預期的錯誤。請稍候重試，或回到首頁。"}
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[10px] text-muted-foreground/70">
            digest · {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-2.5">
        <button
          onClick={() => unstable_retry()}
          className="flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-bold text-white hover:opacity-90"
        >
          <RefreshCw size={13} />
          重試
        </button>
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-md border border-hair px-4 py-2 text-xs font-medium text-foreground hover:bg-paper"
        >
          <Home size={13} />
          回首頁
        </Link>
      </div>
    </main>
  )
}
