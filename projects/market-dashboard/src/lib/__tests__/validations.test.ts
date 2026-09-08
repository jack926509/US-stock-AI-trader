import { describe, it, expect } from "vitest"
import { validateSymbol } from "../validations"

describe("validateSymbol", () => {
  it("accepts standard 1-5 letter symbols", () => {
    expect(validateSymbol("AAPL")).toBe(true)
    expect(validateSymbol("META")).toBe(true)
    expect(validateSymbol("SPY")).toBe(true)
    expect(validateSymbol("T")).toBe(true)
    expect(validateSymbol("GOOGL")).toBe(true)
  })

  it("accepts symbols with dot suffix (BRK.B, BF.A)", () => {
    expect(validateSymbol("BRK.B")).toBe(true)
    expect(validateSymbol("BF.A")).toBe(true)
    expect(validateSymbol("BRK.A")).toBe(true)
  })

  it("rejects lowercase symbols", () => {
    expect(validateSymbol("aapl")).toBe(false)
    expect(validateSymbol("Aapl")).toBe(false)
  })

  it("rejects symbols longer than 5 letters", () => {
    expect(validateSymbol("TOOLNG")).toBe(false)
  })

  it("rejects empty string", () => {
    expect(validateSymbol("")).toBe(false)
  })

  it("rejects symbols with spaces or special characters", () => {
    expect(validateSymbol("AAPL ")).toBe(false)
    expect(validateSymbol("AA-PL")).toBe(false)
    expect(validateSymbol("AA/PL")).toBe(false)
  })

  it("rejects non-string types", () => {
    expect(validateSymbol(null)).toBe(false)
    expect(validateSymbol(undefined)).toBe(false)
    expect(validateSymbol(123)).toBe(false)
    expect(validateSymbol({})).toBe(false)
  })

  it("rejects invalid dot suffix patterns", () => {
    expect(validateSymbol("BRK.")).toBe(false)
    expect(validateSymbol("BRK.BAD")).toBe(false)
    expect(validateSymbol(".B")).toBe(false)
  })
})
