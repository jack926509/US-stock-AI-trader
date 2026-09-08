import { describe, it, expect } from "vitest"
import { parseRating, parseTargetPrice } from "../analysis"

describe("parseRating", () => {
  it("parses all five rating levels (half-width colon)", () => {
    expect(parseRating("評級: Strong Buy")).toBe("Strong Buy")
    expect(parseRating("評級: Buy")).toBe("Buy")
    expect(parseRating("評級: Hold")).toBe("Hold")
    expect(parseRating("評級: Sell")).toBe("Sell")
    expect(parseRating("評級: Strong Sell")).toBe("Strong Sell")
  })

  it("accepts full-width colon", () => {
    expect(parseRating("評級：Strong Buy")).toBe("Strong Buy")
    expect(parseRating("評級：Hold")).toBe("Hold")
  })

  it("is case-insensitive on the rating word", () => {
    expect(parseRating("評級: strong buy")).toBe("Strong Buy")
    expect(parseRating("評級: STRONG SELL")).toBe("Strong Sell")
    expect(parseRating("評級: hold")).toBe("Hold")
  })

  it("tolerates multiple spaces between Strong and Buy/Sell", () => {
    expect(parseRating("評級: Strong  Buy")).toBe("Strong Buy")
    expect(parseRating("評級: Strong   Sell")).toBe("Strong Sell")
  })

  it("finds the rating inside a longer markdown report", () => {
    const md = `# AAPL 投資分析\n\n## 結論摘要\n- 評級: Buy\n- 目標價: $180-$210\n`
    expect(parseRating(md)).toBe("Buy")
  })

  it("returns null when no rating present", () => {
    expect(parseRating("")).toBeNull()
    expect(parseRating("沒有評級資訊")).toBeNull()
    expect(parseRating("評級: Maybe")).toBeNull()
  })
})

describe("parseTargetPrice", () => {
  it("parses dollar-sign + hyphen range", () => {
    expect(parseTargetPrice("目標價: $100-$200")).toEqual({ low: 100, high: 200 })
  })

  it("parses with surrounding whitespace", () => {
    expect(parseTargetPrice("目標價: $100 - $200")).toEqual({ low: 100, high: 200 })
  })

  it("parses with en-dash", () => {
    expect(parseTargetPrice("目標價: $100–$200")).toEqual({ low: 100, high: 200 })
  })

  it("parses with tilde", () => {
    expect(parseTargetPrice("目標價: $100~$200")).toEqual({ low: 100, high: 200 })
  })

  it("accepts full-width colon", () => {
    expect(parseTargetPrice("目標價：$150-$180")).toEqual({ low: 150, high: 180 })
  })

  it("strips thousand separators", () => {
    expect(parseTargetPrice("目標價: $1,000-$2,500")).toEqual({ low: 1000, high: 2500 })
  })

  it("parses decimals", () => {
    expect(parseTargetPrice("目標價: $182.50-$210.75")).toEqual({ low: 182.5, high: 210.75 })
  })

  it("works without dollar signs", () => {
    expect(parseTargetPrice("目標價: 100-200")).toEqual({ low: 100, high: 200 })
  })

  it("finds target price inside a longer markdown report", () => {
    const md = `## 結論摘要\n- 評級: Buy\n- 目標價: $180-$210\n- 倉位: 5%\n`
    expect(parseTargetPrice(md)).toEqual({ low: 180, high: 210 })
  })

  it("returns nulls when no target price present", () => {
    expect(parseTargetPrice("")).toEqual({ low: null, high: null })
    expect(parseTargetPrice("沒有目標價")).toEqual({ low: null, high: null })
  })
})
