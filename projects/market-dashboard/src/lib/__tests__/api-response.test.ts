import { describe, expect, it } from "vitest"
import {
  ApiRouteError,
  cacheHeaders,
  handleApiError,
  jsonError,
  normalizeSymbol,
  parseSymbolsParam,
} from "@/lib/api/response"

describe("api response helpers", () => {
  it("normalizes and validates route symbols", () => {
    expect(normalizeSymbol("aapl")).toBe("AAPL")
    expect(normalizeSymbol(" brk.b ")).toBe("BRK.B")
    expect(() => normalizeSymbol("TOOLNG")).toThrow(ApiRouteError)
  })

  it("parses, validates, and deduplicates comma-separated symbols", () => {
    expect(parseSymbolsParam("aapl, msft, AAPL, invalid-symbol, brk.b")).toEqual([
      "AAPL",
      "MSFT",
      "BRK.B",
    ])
    expect(parseSymbolsParam(null)).toEqual([])
  })

  it("emits consistent json error bodies", async () => {
    const res = jsonError("Invalid symbol", "INVALID_SYMBOL", 400)
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({
      error: "Invalid symbol",
      code: "INVALID_SYMBOL",
    })
  })

  it("builds shared cache-control headers", () => {
    expect(cacheHeaders(30, 60)).toEqual({
      "cache-control": "public, s-maxage=30, stale-while-revalidate=60",
    })
  })

  it("maps ApiRouteError without logging as an internal error", async () => {
    const res = handleApiError("[test]", new ApiRouteError("Stock not found", "NOT_FOUND", 404))
    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toEqual({
      error: "Stock not found",
      code: "NOT_FOUND",
    })
  })
})
