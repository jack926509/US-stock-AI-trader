"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSymbolSearch } from "@/hooks/useSymbolSearch"

export function CommandLine() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { results, searching } = useSymbolSearch(query, { debounceMs: 300, limit: 8 })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === "Escape") {
        inputRef.current?.blur()
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("mousedown", onClick)
    return () => window.removeEventListener("mousedown", onClick)
  }, [])

  useEffect(() => {
    setActiveIdx(results.length > 0 ? 0 : -1)
  }, [results])

  useEffect(() => {
    if (activeIdx < 0) return
    const el = listRef.current?.querySelector<HTMLButtonElement>(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIdx])

  function navigate(symbol: string) {
    const sym = symbol.trim().toUpperCase()
    if (!sym) return
    setOpen(false)
    setQuery("")
    router.push(`/stock/${sym}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (results.length === 0) return
      setActiveIdx((i) => (i + 1) % results.length)
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (results.length === 0) return
      setActiveIdx((i) => (i <= 0 ? results.length - 1 : i - 1))
      return
    }
    if (e.key === "Enter") {
      e.preventDefault()
      const picked = activeIdx >= 0 ? results[activeIdx]?.symbol : results[0]?.symbol
      navigate(picked ?? query)
    }
  }

  return (
    <div className="px-4 pb-1 pt-3.5 sm:px-8" ref={wrapRef}>
      <div className="relative flex h-11 items-center overflow-hidden rounded-lg bg-ink text-ink-foreground">
        <div className="flex h-full shrink-0 items-center gap-2 bg-brand px-3.5 font-mono text-[11px] font-bold tracking-[0.1em] text-white">
          <span>⌕</span>
          <span>CMD</span>
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="輸入代號或公司名稱... 例：NVDA、TSLA、AAPL"
          className="h-full flex-1 bg-transparent px-3.5 font-mono text-[13px] text-[#F4EFE6] placeholder:text-white/40 outline-none"
          aria-activedescendant={activeIdx >= 0 ? `cmdline-opt-${activeIdx}` : undefined}
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="cmdline-listbox"
        />
        <div className="hidden shrink-0 px-3.5 font-mono text-[10px] text-white/50 lg:block">⌘K</div>
      </div>

      {open && (results.length > 0 || searching) && (
        <div className="relative">
          <div
            ref={listRef}
            id="cmdline-listbox"
            role="listbox"
            className="absolute z-30 mt-1 max-h-[320px] w-full overflow-y-auto rounded-lg border border-hair bg-card shadow-lg sm:w-[640px]"
          >
            {searching && (
              <div className="px-4 py-3 font-mono text-[11px] text-muted-foreground">搜尋中…</div>
            )}
            {!searching &&
              results.map((r, i) => {
                const active = i === activeIdx
                return (
                  <button
                    key={r.symbol + r.exchange}
                    id={`cmdline-opt-${i}`}
                    data-idx={i}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => navigate(r.symbol)}
                    className={
                      "flex w-full items-center justify-between border-t border-hair-soft px-4 py-2.5 text-left first:border-t-0 " +
                      (active ? "bg-paper" : "hover:bg-paper")
                    }
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[13px] font-bold text-brand">{r.symbol}</span>
                      <span className="truncate text-xs text-foreground">{r.name}</span>
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {r.exchange}
                    </span>
                  </button>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
