import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import type { WatchlistItem } from "@/types"
import { validateSymbol } from "@/lib/validations"

const FILE = resolve(process.cwd(), ".local-data", "watchlist.json")
const MAX_ITEMS = 200
const MAX_BODY_BYTES = 128 * 1024
let writeChain = Promise.resolve()

export function assertLocalWatchlistMode(request: Request): void {
  if (!process.env.LOCAL_WATCHLIST_SESSION || process.env.LOCAL_WATCHLIST_SESSION.length < 32) throw new Error("LOCAL_MODE_DISABLED")
  const host = new URL(request.url).hostname
  if (host !== "127.0.0.1" && host !== "localhost" && host !== "[::1]") throw new Error("LOCAL_MODE_DISABLED")
  const rawHost = (request.headers.get("host") ?? "").replace(/^\[::1\](?=:|$)/, "localhost")
  const hostName = rawHost.split(":")[0]
  if (hostName !== "127.0.0.1" && hostName !== "localhost") throw new Error("LOCAL_MODE_DISABLED")
  if (request.method !== "GET") {
    const origin = request.headers.get("origin")
    if (origin) {
      const originUrl = new URL(origin)
      const normalizedOrigin = originUrl.hostname === "[::1]" ? "localhost" : originUrl.hostname
      if ((normalizedOrigin !== "localhost" && normalizedOrigin !== "127.0.0.1") || originUrl.host.replace(/^\[::1\]/, "localhost") !== rawHost) throw new Error("LOCAL_MODE_DISABLED")
    }
  }
}

export function normalizeWatchlist(input: unknown): WatchlistItem[] {
  if (!Array.isArray(input)) throw new Error("INVALID_WATCHLIST")
  if (input.length > MAX_ITEMS) throw new Error("WATCHLIST_TOO_LARGE")
  const seen = new Set<string>()
  const result: WatchlistItem[] = []
  for (const value of input) {
    if (!value || typeof value !== "object") throw new Error("INVALID_WATCHLIST")
    const raw = value as Record<string, unknown>
    const symbol = typeof raw.symbol === "string" ? raw.symbol.trim().toUpperCase() : ""
    if (!validateSymbol(symbol)) throw new Error("INVALID_WATCHLIST")
    if (seen.has(symbol)) continue
    seen.add(symbol)
    result.push({
      symbol,
      name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim().slice(0, 120) : symbol,
      logo: typeof raw.logo === "string" && raw.logo.length <= 500 ? raw.logo : null,
      sector: typeof raw.sector === "string" && raw.sector.length <= 100 ? raw.sector : null,
      addedAt: typeof raw.addedAt === "string" && !Number.isNaN(Date.parse(raw.addedAt)) ? new Date(raw.addedAt).toISOString() : new Date().toISOString(),
    })
  }
  return result
}

export async function readWatchlist(): Promise<WatchlistItem[]> {
  try {
    const raw = await readFile(FILE, "utf8")
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) throw new Error("WATCHLIST_TOO_LARGE")
    return normalizeWatchlist(JSON.parse(raw))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
    throw error
  }
}

export async function writeWatchlist(input: unknown): Promise<WatchlistItem[]> {
  const normalized = normalizeWatchlist(input)
  const operation = () => writeNormalized(normalized)
  writeChain = writeChain.then(operation, operation)
  await writeChain
  return normalized
}

async function writeNormalized(normalized: WatchlistItem[]): Promise<void> {
    await mkdir(dirname(FILE), { recursive: true, mode: 0o700 })
    const temporary = `${FILE}.${process.pid}.${Date.now()}.tmp`
    const serialized = JSON.stringify(normalized)
    if (Buffer.byteLength(serialized) > MAX_BODY_BYTES) throw new Error("WATCHLIST_TOO_LARGE")
    await writeFile(temporary, serialized, { mode: 0o600 })
    await rename(temporary, FILE)
    await chmod(FILE, 0o600)
}

export async function mutateWatchlist(operation: "add" | "remove" | "migrate", payload: unknown): Promise<WatchlistItem[]> {
  let result: WatchlistItem[] = []
  const mutation = async () => {
    const current = await readWatchlist()
    if (operation === "remove") {
      const symbol = typeof payload === "string" ? payload.toUpperCase() : ""
      result = current.filter((item) => item.symbol !== symbol)
    } else if (operation === "add") {
      const [item] = normalizeWatchlist([payload])
      result = normalizeWatchlist([...current.filter((entry) => entry.symbol !== item.symbol), item])
    } else {
      result = current.length ? current : normalizeWatchlist(payload)
    }
    await writeNormalized(result)
  }
  writeChain = writeChain.then(mutation, mutation)
  await writeChain
  return result
}
