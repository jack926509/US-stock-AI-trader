import { describe, expect, it, vi } from "vitest"
import { POST } from "@/app/api/analysis/[symbol]/route"

describe("AI runtime 停用", () => {
  it("即使存在假金鑰仍回 410 且不外呼", async () => {
    process.env.ANTHROPIC_API_KEY = "fake-key"; const spy = vi.spyOn(globalThis, "fetch")
    const response = await POST(); expect(response.status).toBe(410); expect(spy).not.toHaveBeenCalled(); spy.mockRestore()
  })
})
