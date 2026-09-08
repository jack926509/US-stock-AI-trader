"use client"

import { useMemo, useReducer, useRef, useState } from "react"
import { Sparkles, Pause, RefreshCw, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseSseStream } from "@/lib/agents/sse-parser"
import type { AgentEvent, AgentId, AgentPhase } from "@/lib/agents/types"
import { AGENT_LABELS, AGENT_META } from "@/lib/agents/types"
import {
  AgentCard,
  type AgentStatus,
  type AgentGroup,
} from "@/components/deep-analysis/AgentCard"
import { PhaseProgress, type PhaseStatus } from "@/components/deep-analysis/PhaseProgress"

interface Props {
  symbol: string
}

type AgentState = Record<AgentId, { status: AgentStatus; content: string; errorMessage?: string }>

const ALL_AGENTS: AgentId[] = [
  "buffett", "lynch", "wood", "burry", "ackman", "taleb",
  "bull", "bear", "manager",
  "aggressive", "conservative", "neutral", "portfolio",
]

const AGENT_GROUP: Record<AgentId, AgentGroup> = ALL_AGENTS.reduce((acc, id) => {
  acc[id] = AGENT_META[id].group
  return acc
}, {} as Record<AgentId, AgentGroup>)

const initialAgents: AgentState = ALL_AGENTS.reduce((acc, id) => {
  acc[id] = { status: "pending", content: "" }
  return acc
}, {} as AgentState)

const initialPhases: Record<AgentPhase, PhaseStatus> = {
  data: "done",
  masters: "pending",
  debate: "pending",
  risk: "pending",
  portfolio: "pending",
}

type Action = { type: "reset" } | { type: "event"; event: AgentEvent }

function reducer(
  state: { agents: AgentState; phases: Record<AgentPhase, PhaseStatus>; errors: string[] },
  action: Action,
) {
  if (action.type === "reset") {
    return { agents: { ...initialAgents }, phases: { ...initialPhases }, errors: [] }
  }
  const e = action.event
  switch (e.type) {
    case "phase_start":
      return { ...state, phases: { ...state.phases, [e.phase]: "running" as PhaseStatus } }
    case "phase_complete":
      return { ...state, phases: { ...state.phases, [e.phase]: "done" as PhaseStatus } }
    case "agent_start":
      return {
        ...state,
        agents: {
          ...state.agents,
          [e.agent]: { ...state.agents[e.agent], status: "running" as AgentStatus, content: "" },
        },
      }
    case "agent_chunk":
      return {
        ...state,
        agents: {
          ...state.agents,
          [e.agent]: {
            ...state.agents[e.agent],
            status: "running" as AgentStatus,
            content: state.agents[e.agent].content + e.text,
          },
        },
      }
    case "agent_complete":
      return {
        ...state,
        agents: {
          ...state.agents,
          [e.agent]: {
            status: state.agents[e.agent].status === "error" ? "error" : "done",
            content: e.content,
            errorMessage: state.agents[e.agent].errorMessage,
          } as AgentState[AgentId],
        },
      }
    case "error": {
      const errors = [...state.errors, e.agent ? `${AGENT_LABELS[e.agent]}：${e.message}` : e.message]
      if (e.agent) {
        return {
          ...state,
          errors,
          agents: {
            ...state.agents,
            [e.agent]: {
              ...state.agents[e.agent],
              status: "error" as AgentStatus,
              errorMessage: e.message,
            },
          },
        }
      }
      return { ...state, errors }
    }
    case "done":
      return state
  }
}

type GroupFilter = "all" | AgentGroup

const GROUP_TABS: { id: GroupFilter; label: string; count: number }[] = [
  { id: "all", label: "全部", count: 13 },
  { id: "masters", label: "投資大師", count: 6 },
  { id: "debate", label: "辯論", count: 3 },
  { id: "risk", label: "風險", count: 3 },
  { id: "pm", label: "PM 整合", count: 1 },
]

export function DeepAnalysisClient({ symbol }: Props) {
  const [{ agents, phases, errors }, dispatch] = useReducer(reducer, {
    agents: { ...initialAgents },
    phases: { ...initialPhases },
    errors: [],
  })
  const [isStreaming, setIsStreaming] = useState(false)
  const [filter, setFilter] = useState<GroupFilter>("all")
  const abortRef = useRef<AbortController | null>(null)

  async function handleStart() {
    if (isStreaming) {
      abortRef.current?.abort()
      return
    }
    abortRef.current = new AbortController()
    dispatch({ type: "reset" })
    setIsStreaming(true)

    try {
      const res = await fetch(`/api/deep-analysis/${symbol}`, {
        method: "POST",
        signal: abortRef.current.signal,
      })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)
      for await (const event of parseSseStream(res.body)) {
        dispatch({ type: "event", event })
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        dispatch({
          type: "event",
          event: { type: "error", message: `串流中斷：${err.message}` },
        })
      }
    } finally {
      setIsStreaming(false)
    }
  }

  // Stats
  const reportedAgents = ALL_AGENTS.filter((id) => agents[id].status === "done")
  const totalReported = reportedAgents.length

  // 共識行 — done 數量、進度
  const consensusStats = useMemo(() => {
    const done = totalReported
    return [
      {
        l: "REPORTED",
        v: `${done} / 13`,
        sub: done === 13 ? "all in" : `${13 - done} remain`,
        c: done === 13 ? "var(--up)" : "var(--brand)",
      },
      {
        l: "PHASE",
        v: phases.portfolio === "done"
          ? "DONE"
          : phases.risk !== "pending"
            ? "RISK"
            : phases.debate !== "pending"
              ? "DEBATE"
              : phases.masters !== "pending"
                ? "MASTERS"
                : "READY",
        sub: isStreaming ? "streaming" : "idle",
        c: "var(--ink)",
        badge: true,
      },
      {
        l: "ERRORS",
        v: errors.length === 0 ? "0" : String(errors.length),
        sub: errors.length === 0 ? "clean run" : "see notes",
        c: errors.length === 0 ? "var(--up)" : "var(--down)",
      },
      {
        l: "ELAPSED",
        v: isStreaming ? "—" : phases.portfolio === "done" ? "DONE" : "—",
        sub: isStreaming ? "live stream" : "—",
        c: "var(--brand)",
      },
    ]
  }, [totalReported, phases, errors, isStreaming])

  const filteredAgents =
    filter === "all" ? ALL_AGENTS : ALL_AGENTS.filter((id) => AGENT_GROUP[id] === filter)

  const portfolio = agents.portfolio

  return (
    <section className="overflow-hidden rounded-xl border border-hair bg-card">
      {/* Header — large title + brand accent rule */}
      <div className="relative border-b border-hair px-5 py-5 sm:px-6">
        <div className="absolute left-0 top-5 bottom-5 w-[3px] bg-brand" />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
              <span
                className={cn(
                  "size-1.5 rounded-full bg-brand shadow-[0_0_8px] shadow-brand",
                  isStreaming && "animate-dot-pulse",
                )}
              />
              CLAUDE 4.6 · {isStreaming ? "LIVE STREAM" : "READY"}
            </div>
            <h2 className="mt-1.5 font-serif text-2xl font-semibold tracking-tight">
              13 位 AI 代理人深度分析
            </h2>
            <div className="mt-1 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
              {symbol} · {totalReported} of 13 reported
            </div>
          </div>
          <button
            onClick={handleStart}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold tracking-[0.04em] transition-colors",
              isStreaming
                ? "bg-down text-white hover:opacity-90"
                : portfolio.content
                  ? "bg-ink text-ink-foreground hover:opacity-90"
                  : "bg-brand text-white hover:opacity-90",
            )}
          >
            {isStreaming ? (
              <>
                <Pause size={14} /> PAUSE STREAM
              </>
            ) : portfolio.content ? (
              <>
                <RefreshCw size={14} /> 重新分析
              </>
            ) : (
              <>
                <Sparkles size={14} /> 啟動深度分析
              </>
            )}
          </button>
        </div>

        {/* 4-phase stepper */}
        <div className="mt-5">
          <PhaseProgress phases={phases} />
        </div>
      </div>

      {/* Consensus row */}
      <div className="grid grid-cols-2 border-b border-hair bg-white sm:grid-cols-4">
        {consensusStats.map((k, i) => (
          <div
            key={k.l}
            className={
              "px-4 py-4 sm:px-5 " +
              (i < consensusStats.length - 1
                ? "border-b border-hair-soft sm:border-b-0 sm:[&:nth-child(2)]:border-r-0 sm:border-r " +
                  "[&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r " +
                  "sm:[&:nth-child(4)]:border-r-0"
                : "")
            }
          >
            <div className="font-mono text-[9.5px] font-bold tracking-[0.12em] text-muted-foreground">
              {k.l}
            </div>
            <div
              className={
                "mt-1.5 font-mono font-bold leading-tight tabular-nums " +
                (k.badge ? "inline-block rounded px-3 py-0.5 text-base" : "text-[26px]")
              }
              style={{
                color: k.badge ? "#fff" : k.c,
                background: k.badge ? k.c : "transparent",
                letterSpacing: k.badge ? undefined : "-0.02em",
              }}
            >
              {k.v}
            </div>
            <div className="mt-1 font-mono text-[10.5px] text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Group filter pills */}
      <div className="flex flex-wrap gap-2 border-b border-hair bg-card px-4 py-3 sm:px-6">
        {GROUP_TABS.map((g) => {
          const active = filter === g.id
          return (
            <button
              key={g.id}
              onClick={() => setFilter(g.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-colors",
                active
                  ? "border-ink bg-ink text-ink-foreground"
                  : "border-hair bg-white text-foreground hover:border-foreground",
              )}
            >
              {g.label}
              <span className="ml-1.5 font-mono opacity-60">{g.count}</span>
            </button>
          )
        })}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="border-b border-down/30 bg-down/[0.05] px-5 py-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-down" />
            <div className="flex-1 space-y-1">
              <p className="text-xs font-medium text-down">分析過程發生錯誤</p>
              {errors.map((m, i) => (
                <p key={i} className="font-mono text-[11px] text-down">
                  {m}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Agents grid */}
      <div className="grid grid-cols-1 gap-3.5 bg-paper p-4 md:grid-cols-2 sm:p-5 xl:grid-cols-3">
        {filteredAgents
          .filter((id) => id !== "portfolio")
          .map((id) => (
            <AgentCard
              key={id}
              meta={AGENT_META[id]}
              status={agents[id].status}
              content={agents[id].content}
              errorMessage={agents[id].errorMessage}
              compact
            />
          ))}
      </div>

      {/* Portfolio Manager — full-width final report */}
      {(filter === "all" || filter === "pm") && (
        <div className="border-t border-hair bg-paper p-4 sm:p-5">
          <div className="mb-3">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
              FINAL REPORT · PORTFOLIO MANAGER
            </div>
            <h3 className="mt-1 font-serif text-base font-semibold tracking-tight">
              投組經理最終決策
            </h3>
          </div>
          <AgentCard
            meta={AGENT_META.portfolio}
            status={portfolio.status}
            content={portfolio.content}
            errorMessage={portfolio.errorMessage}
          />
        </div>
      )}

      {/* Empty state if not started */}
      {!isStreaming && totalReported === 0 && (
        <div className="border-t border-hair bg-card px-6 py-10 text-center">
          <p className="font-serif text-base font-semibold text-foreground">尚未啟動深度分析</p>
          <p className="mt-1 text-xs text-muted-foreground">
            點上方「啟動深度分析」按鈕開始 13 代理人 SSE 串流
          </p>
        </div>
      )}
    </section>
  )
}
