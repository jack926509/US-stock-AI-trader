import { describe, expect, it } from "vitest"
import { MARKET_QUERY_KEYS } from "@/lib/query-keys"

describe("市場快取契約", () => {
  it("統一報價與EOD總覽不共用React Query cache", () => {
    expect(MARKET_QUERY_KEYS.unifiedQuotes).not.toEqual(MARKET_QUERY_KEYS.eodOverview)
  })
})
