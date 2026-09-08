// SSE 解析器 — 把 ReadableStream<Uint8Array> 解成一個個 AgentEvent。
// 用途：前端 Client 元件用 fetch POST 拿到 SSE response.body 後丟進來。

import type { AgentEvent } from "./types"

export async function* parseSseStream(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<AgentEvent, void, void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // SSE 事件以 \n\n 分隔；split 後保留最後一塊（可能未完）
    const blocks = buffer.split("\n\n")
    buffer = blocks.pop() ?? ""

    for (const block of blocks) {
      const trimmed = block.trim()
      if (!trimmed) continue
      const dataLine = trimmed.split("\n").find((l) => l.startsWith("data:"))
      if (!dataLine) continue
      const json = dataLine.slice(5).trim()
      try {
        yield JSON.parse(json) as AgentEvent
      } catch {
        // 忽略破損的事件（網路碎片化偶發）
      }
    }
  }
}
