"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { AddStockDialog } from "./AddStockDialog"

interface NavbarProps {
  onRefresh?: () => void
  isRefreshing?: boolean
  /** 麵包屑模式 — 個股詳情頁顯示「‹ 返回 · 儀表板 · NVDA」 */
  breadcrumb?: { label: string; href?: string }[]
}

export function Navbar({ onRefresh, isRefreshing, breadcrumb }: NavbarProps) {
  const router = useRouter()

  if (breadcrumb && breadcrumb.length > 0) {
    return (
      <header className="flex items-center gap-5 border-b border-hair bg-background px-4 py-3 sm:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          ‹ 返回
        </button>
        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-muted-foreground/60">·</span>}
              {b.href ? (
                <Link href={b.href} className="hover:text-foreground">
                  {b.label}
                </Link>
              ) : (
                <span className="font-bold text-foreground">{b.label}</span>
              )}
            </span>
          ))}
        </span>
      </header>
    )
  }

  return (
    <header className="flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-hair bg-background px-4 py-3.5 sm:px-8">
      <Link href="/" className="flex items-baseline gap-2.5">
        <span className="font-serif text-xl font-bold tracking-tight">US Stock Analyzer</span>
        <span className="hidden font-mono text-[10px] tracking-[0.1em] text-muted-foreground sm:inline">
          MVP · TERMINAL
        </span>
      </Link>

      <nav className="hidden items-center gap-1 md:flex">
        {[
          { href: "/", label: "儀表板" },
          { href: "/briefing", label: "簡報" },
          { href: "/movers", label: "Movers" },
          { href: "/settings", label: "設定" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-paper hover:text-foreground"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-md border border-hair bg-card px-3 py-1.5 font-mono text-[11px] font-semibold sm:flex">
          <span className="size-1.5 rounded-full bg-up shadow-[0_0_6px] shadow-up" />
          已連線 · 60S
        </span>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex h-9 items-center gap-1.5 rounded-md border border-hair bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
            刷新
          </button>
        )}
        <AddStockDialog />
        <div className="flex size-8 items-center justify-center rounded-lg bg-ink font-serif text-xs font-bold text-ink-foreground">
          J
        </div>
      </div>
    </header>
  )
}
