import type { WatchlistItem } from "@/types"

const LEGACY_KEY = "watchlist_v1"

async function responseJson(response: Response): Promise<WatchlistItem[]> {
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new Error(body?.error ?? `HTTP ${response.status}`)
  return Array.isArray(body) ? body : []
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  return responseJson(await fetch("/api/watchlist", { cache: "no-store" }))
}

export async function setWatchlist(items: WatchlistItem[]): Promise<WatchlistItem[]> {
  return responseJson(await fetch("/api/watchlist", {
    method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(items),
  }))
}

async function mutate(operation: "add" | "remove" | "migrate", payload: unknown): Promise<WatchlistItem[]> {
  return responseJson(await fetch("/api/watchlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ operation, payload }) }))
}
export const addWatchlistItem = (item: Omit<WatchlistItem, "addedAt"> & { addedAt?: string }) => mutate("add", { ...item, addedAt: item.addedAt ?? new Date().toISOString() })
export const removeWatchlistItem = (symbol: string) => mutate("remove", symbol)
export const migrateLegacyWatchlist = (items: unknown[]) => mutate("migrate", items)

export function readLegacyWatchlist(): unknown[] | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(LEGACY_KEY)
  if (!raw) return null
  try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : null } catch { return null }
}

export function clearLegacyWatchlist(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(LEGACY_KEY)
}
