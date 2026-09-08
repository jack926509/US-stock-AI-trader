import { describe, expect, it } from "vitest"
import { assertLocalWatchlistMode, normalizeWatchlist } from "@/lib/watchlist-store"

describe("本機自選股", () => {
  it("正規化代號並去重", () => {
    expect(normalizeWatchlist([{ symbol: " aapl ", name: "Apple" }, { symbol: "AAPL", name: "duplicate" }])).toMatchObject([{ symbol: "AAPL", name: "Apple" }])
  })
  it("拒絕超量與錯誤代號", () => {
    expect(() => normalizeWatchlist(Array.from({ length: 201 }, (_, i) => ({ symbol: `A${i}`, name: "x" })))).toThrow("WATCHLIST_TOO_LARGE")
    expect(() => normalizeWatchlist([{ symbol: "BAD/SYMBOL" }])).toThrow("INVALID_WATCHLIST")
  })
  it("拒絕偽造 Host 與跨來源寫入", () => {
    process.env.LOCAL_WATCHLIST_SESSION = "x".repeat(32)
    expect(() => assertLocalWatchlistMode(new Request("http://localhost/api/watchlist", { headers: { host: "attacker.example" } }))).toThrow("LOCAL_MODE_DISABLED")
    expect(() => assertLocalWatchlistMode(new Request("http://localhost/api/watchlist", { method: "PUT", headers: { host: "localhost", origin: "http://attacker.example" } }))).toThrow("LOCAL_MODE_DISABLED")
  })
})
