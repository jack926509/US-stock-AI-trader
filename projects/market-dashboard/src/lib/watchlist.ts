// 追蹤清單 — localStorage 唯一持久化（與 portfolio.ts 同模式）
// 個人單機使用，跨裝置不同步可接受。

import type { WatchlistItem } from "@/types"

const KEY = "watchlist_v1"
const SERVER_SNAPSHOT = "[]"

const listeners = new Set<() => void>()
let cachedSnapshot = SERVER_SNAPSHOT
let cacheValid = false

function readRaw(): string {
  if (typeof window === "undefined") return SERVER_SNAPSHOT
  return window.localStorage.getItem(KEY) ?? SERVER_SNAPSHOT
}

export function getSnapshot(): string {
  if (typeof window === "undefined") return SERVER_SNAPSHOT
  if (!cacheValid) {
    cachedSnapshot = readRaw()
    cacheValid = true
  }
  return cachedSnapshot
}

export function getServerSnapshot(): string {
  return SERVER_SNAPSHOT
}

export function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cacheValid = false
      listeners.forEach((cb) => cb())
    }
  }
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage)
  }
  return () => {
    listeners.delete(callback)
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage)
    }
  }
}

export function parseWatchlist(snapshot: string): WatchlistItem[] {
  try {
    const parsed = JSON.parse(snapshot)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (w): w is WatchlistItem =>
        w &&
        typeof w.symbol === "string" &&
        typeof w.name === "string" &&
        typeof w.addedAt === "string"
    )
  } catch {
    return []
  }
}

export function getWatchlist(): WatchlistItem[] {
  return parseWatchlist(getSnapshot())
}

export function setWatchlist(list: WatchlistItem[]): void {
  if (typeof window === "undefined") return
  cachedSnapshot = JSON.stringify(list)
  cacheValid = true
  window.localStorage.setItem(KEY, cachedSnapshot)
  listeners.forEach((cb) => cb())
}

export function addToWatchlist(item: Omit<WatchlistItem, "addedAt">): WatchlistItem[] {
  const current = getWatchlist()
  const upper = item.symbol.toUpperCase()
  if (current.find((w) => w.symbol === upper)) return current
  const next = [...current, { ...item, symbol: upper, addedAt: new Date().toISOString() }]
  setWatchlist(next)
  return next
}

export function removeFromWatchlist(symbol: string): WatchlistItem[] {
  const upper = symbol.toUpperCase()
  const next = getWatchlist().filter((w) => w.symbol !== upper)
  setWatchlist(next)
  return next
}
