// 深度分析 orchestrator —
// 把流程切成 4 個階段，用 async generator 一邊跑一邊吐 SSE 事件。
//
// 階段順序：
//   1. masters    — 6 位大師「並行」分析
//   2. debate     — Bull / Bear「並行」→ Research Manager 裁決
//   3. risk       — Aggressive / Conservative「並行」→ Neutral 折衷
//   4. portfolio  — Portfolio Manager 整合所有觀點，輸出最終決策
//
// 並行的部分用 EventQueue 把多個 task 的 chunk 交織成單一事件流。

import type { AgentEvent, AgentId, AgentSections, AnalysisContext } from "./types"
import { AGENT_LABELS, MASTER_LABELS } from "./types"
import { EventQueue } from "./event-queue"
import { runAgent } from "./runner"

import { buildMasterUserPrompt } from "./masters/shared"
import { BUFFETT_SYSTEM_PROMPT } from "./masters/buffett"
import { LYNCH_SYSTEM_PROMPT } from "./masters/lynch"
import { WOOD_SYSTEM_PROMPT } from "./masters/wood"
import { BURRY_SYSTEM_PROMPT } from "./masters/burry"
import { ACKMAN_SYSTEM_PROMPT } from "./masters/ackman"
import { TALEB_SYSTEM_PROMPT } from "./masters/taleb"

import { BULL_SYSTEM_PROMPT, buildBullUserPrompt } from "./debate/bull"
import { BEAR_SYSTEM_PROMPT, buildBearUserPrompt } from "./debate/bear"
import { MANAGER_SYSTEM_PROMPT, buildManagerUserPrompt } from "./debate/manager"

import { AGGRESSIVE_SYSTEM_PROMPT, buildAggressiveUserPrompt } from "./risk/aggressive"
import { CONSERVATIVE_SYSTEM_PROMPT, buildConservativeUserPrompt } from "./risk/conservative"
import { NEUTRAL_SYSTEM_PROMPT, buildNeutralUserPrompt } from "./risk/neutral"
import { PORTFOLIO_SYSTEM_PROMPT, buildPortfolioUserPrompt } from "./risk/portfolio"

export const DEEP_PROMPT_VERSION = "deep-v1.0"

type MasterId = keyof typeof MASTER_LABELS

const MASTERS: MasterId[] = Object.keys(MASTER_LABELS) as MasterId[]

const MASTER_PROMPTS: Record<MasterId, string> = {
  buffett: BUFFETT_SYSTEM_PROMPT,
  lynch: LYNCH_SYSTEM_PROMPT,
  wood: WOOD_SYSTEM_PROMPT,
  burry: BURRY_SYSTEM_PROMPT,
  ackman: ACKMAN_SYSTEM_PROMPT,
  taleb: TALEB_SYSTEM_PROMPT,
}

// 把單一代理人的 stream 包成「push 事件到 queue」的標準動作。
async function runWithQueue(opts: {
  queue: EventQueue<AgentEvent>
  phase: "masters" | "debate" | "risk" | "portfolio"
  agent: AgentId
  systemPrompt: string
  userPrompt: string
  maxTokens: number
}): Promise<string> {
  const { queue, phase, agent, systemPrompt, userPrompt, maxTokens } = opts
  queue.push({ type: "agent_start", phase, agent, label: AGENT_LABELS[agent] })
  try {
    const content = await runAgent({
      systemPrompt,
      userPrompt,
      maxTokens,
      onChunk: (text) => queue.push({ type: "agent_chunk", agent, text }),
    })
    queue.push({ type: "agent_complete", agent, content })
    return content
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown agent error"
    const fallback = `（${AGENT_LABELS[agent]} 執行失敗：${message}）`
    queue.push({ type: "error", agent, message })
    queue.push({ type: "agent_complete", agent, content: fallback })
    return fallback
  }
}

export async function* runDeepAnalysis(
  ctx: AnalysisContext
): AsyncGenerator<AgentEvent, void, void> {
  const sections: AgentSections = {
    masters: {},
    debate: {},
    risk: {},
  }

  // ── 階段 1: 6 位大師並行 ────────────────────────────────────────
  yield { type: "phase_start", phase: "masters" }

  {
    const queue = new EventQueue<AgentEvent>()
    const userPrompt = buildMasterUserPrompt(ctx)

    const tasks = MASTERS.map(async (m) => {
      const content = await runWithQueue({
        queue,
        phase: "masters",
        agent: m,
        systemPrompt: MASTER_PROMPTS[m],
        userPrompt,
        maxTokens: 1500,
      })
      sections.masters[m] = content
    })

    const settled = Promise.allSettled(tasks).finally(() => queue.close())
    for await (const evt of queue.iter()) yield evt
    await settled
  }

  yield { type: "phase_complete", phase: "masters" }

  // ── 階段 2: Bull / Bear 並行 → Manager 裁決 ─────────────────────
  yield { type: "phase_start", phase: "debate" }

  {
    const queue = new EventQueue<AgentEvent>()
    const tasks = [
      runWithQueue({
        queue,
        phase: "debate",
        agent: "bull",
        systemPrompt: BULL_SYSTEM_PROMPT,
        userPrompt: buildBullUserPrompt(ctx, sections),
        maxTokens: 1800,
      }).then((content) => { sections.debate.bull = content }),
      runWithQueue({
        queue,
        phase: "debate",
        agent: "bear",
        systemPrompt: BEAR_SYSTEM_PROMPT,
        userPrompt: buildBearUserPrompt(ctx, sections),
        maxTokens: 1800,
      }).then((content) => { sections.debate.bear = content }),
    ]
    const settled = Promise.allSettled(tasks).finally(() => queue.close())
    for await (const evt of queue.iter()) yield evt
    await settled
  }

  // Manager 看到 bull + bear 後再裁決，逐字 yield
  {
    const queue = new EventQueue<AgentEvent>()
    const task = runWithQueue({
      queue,
      phase: "debate",
      agent: "manager",
      systemPrompt: MANAGER_SYSTEM_PROMPT,
      userPrompt: buildManagerUserPrompt(ctx, sections),
      maxTokens: 2000,
    }).then((content) => { sections.debate.manager = content })
    const settled = task.finally(() => queue.close())
    for await (const evt of queue.iter()) yield evt
    await settled
  }

  yield { type: "phase_complete", phase: "debate" }

  // ── 階段 3: Aggressive / Conservative 並行 → Neutral 折衷 ────
  yield { type: "phase_start", phase: "risk" }

  {
    const queue = new EventQueue<AgentEvent>()
    const tasks = [
      runWithQueue({
        queue,
        phase: "risk",
        agent: "aggressive",
        systemPrompt: AGGRESSIVE_SYSTEM_PROMPT,
        userPrompt: buildAggressiveUserPrompt(ctx, sections),
        maxTokens: 1500,
      }).then((content) => { sections.risk.aggressive = content }),
      runWithQueue({
        queue,
        phase: "risk",
        agent: "conservative",
        systemPrompt: CONSERVATIVE_SYSTEM_PROMPT,
        userPrompt: buildConservativeUserPrompt(ctx, sections),
        maxTokens: 1500,
      }).then((content) => { sections.risk.conservative = content }),
    ]
    const settled = Promise.allSettled(tasks).finally(() => queue.close())
    for await (const evt of queue.iter()) yield evt
    await settled
  }

  // Neutral 看完激進與保守後寫折衷方案
  {
    const queue = new EventQueue<AgentEvent>()
    const task = runWithQueue({
      queue,
      phase: "risk",
      agent: "neutral",
      systemPrompt: NEUTRAL_SYSTEM_PROMPT,
      userPrompt: buildNeutralUserPrompt(ctx, sections),
      maxTokens: 1500,
    }).then((content) => { sections.risk.neutral = content })
    const settled = task.finally(() => queue.close())
    for await (const evt of queue.iter()) yield evt
    await settled
  }

  yield { type: "phase_complete", phase: "risk" }

  // ── 階段 4: Portfolio Manager 整合 ──────────────────────────────
  yield { type: "phase_start", phase: "portfolio" }

  let finalContent = ""
  {
    const queue = new EventQueue<AgentEvent>()
    const task = runWithQueue({
      queue,
      phase: "portfolio",
      agent: "portfolio",
      systemPrompt: PORTFOLIO_SYSTEM_PROMPT,
      userPrompt: buildPortfolioUserPrompt(ctx, sections),
      maxTokens: 4096,
    }).then((content) => {
      sections.risk.portfolio = content
      finalContent = content
    })
    const settled = task.finally(() => queue.close())
    for await (const evt of queue.iter()) yield evt
    await settled
  }

  yield { type: "phase_complete", phase: "portfolio" }

  yield { type: "done", finalContent, sections }
}

export type { AgentEvent, AgentSections, AnalysisContext } from "./types"
