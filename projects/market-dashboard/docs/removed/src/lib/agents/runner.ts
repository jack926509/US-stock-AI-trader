// Claude streaming runner —
// 共用的 Anthropic Messages stream 包裝。每次呼叫一個代理人都走這個函式，
// 透過 emit callback 把 chunk 即時送回 orchestrator，最後回傳完整內容。

import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface RunAgentOptions {
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
  // 收到一塊 text delta 時呼叫；orchestrator 用它包成 SSE event_chunk。
  onChunk?: (text: string) => void
}

export async function runAgent({
  systemPrompt,
  userPrompt,
  maxTokens = 1500,
  onChunk,
}: RunAgentOptions): Promise<string> {
  let full = ""
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  })

  for await (const chunk of stream) {
    if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
      const text = chunk.delta.text
      full += text
      onChunk?.(text)
    }
  }

  return full
}
