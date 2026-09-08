"use client"

import { useEffect, useRef, useState } from "react"

export interface SearchResult {
  symbol: string
  name: string
  logo?: string
  exchange: string
}

interface Options {
  debounceMs?: number
  limit?: number
}

export function useSymbolSearch(
  query: string,
  { debounceMs = 300, limit }: Options = {}
): { results: SearchResult[]; searching: boolean } {
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!query.trim()) {
      setResults([])
      setSearching(false)
      return
    }

    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      setSearching(true)
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`, {
          signal: ctrl.signal,
        })
        const data = (await res.json()) as SearchResult[]
        if (ctrl.signal.aborted) return
        const list = Array.isArray(data) ? data : []
        setResults(limit ? list.slice(0, limit) : list)
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        setResults([])
      } finally {
        if (!ctrl.signal.aborted) setSearching(false)
      }
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, debounceMs, limit])

  return { results, searching }
}
