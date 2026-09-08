"use client"

import { useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

export type AgentStatus = "pending" | "running" | "done" | "error"
export type AgentGroup = "masters" | "debate" | "risk" | "pm"

export interface AgentCardMeta {
  zh: string
  en: string
  tagline: string
  group: AgentGroup
}

interface Props {
  meta: AgentCardMeta
  status: AgentStatus
  content: string
  errorMessage?: string
  /** 大師卡用 compact (max-h-72)，PM 整合卡用 full */
  compact?: boolean
}

const GROUP_CONFIG: Record<
  AgentGroup,
  { accent: string; label: string }
> = {
  masters: { accent: "#3B6F4D", label: "MASTER" },
  debate: { accent: "#7A5BD9", label: "DEBATE" },
  risk: { accent: "#C25B3F", label: "RISK" },
  pm: { accent: "var(--brand)", label: "PM" },
}

const STATE_CONFIG: Record<
  AgentStatus,
  { label: string; bg: string; color: string; border: string }
> = {
  pending: {
    label: "排隊中",
    bg: "var(--paper)",
    color: "var(--muted-foreground)",
    border: "var(--hair)",
  },
  running: {
    label: "生成中",
    bg: "var(--brand)",
    color: "#fff",
    border: "var(--brand)",
  },
  done: {
    label: "完成",
    bg: "var(--up)",
    color: "#fff",
    border: "var(--up)",
  },
  error: {
    label: "失敗",
    bg: "var(--down)",
    color: "#fff",
    border: "var(--down)",
  },
}

export function AgentCard({ meta, status, content, errorMessage, compact }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { zh, en, tagline, group } = meta
  const groupCfg = GROUP_CONFIG[group]
  const stateCfg = STATE_CONFIG[status]

  useEffect(() => {
    if (status === "running" && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [content, status])

  const isPending = status === "pending"
  const isActive = status === "running"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[10px] border bg-white transition-all",
        isActive ? "border-brand shadow-[0_0_0_3px_rgba(204,120,92,0.10)]" : "border-hair",
        isPending && "opacity-70",
      )}
    >
      {/* Group accent rule (left edge) */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: groupCfg.accent }}
      />

      <div className="flex items-center gap-2.5 p-3.5 pl-4">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded font-serif text-sm font-bold",
            group === "pm"
              ? "bg-brand text-white"
              : "border border-hair bg-background text-foreground",
          )}
        >
          {zh.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="font-mono text-[9px] font-bold tracking-[0.1em]"
            style={{ color: groupCfg.accent }}
          >
            {groupCfg.label}
          </div>
          <div className="truncate font-serif text-[13px] font-semibold text-foreground">
            {zh}
            <span className="ml-1.5 font-sans text-[10px] font-normal text-muted-foreground">· {en}</span>
          </div>
          <div className="mt-0.5 truncate text-[10.5px] leading-snug text-muted-foreground">
            {tagline}
          </div>
        </div>
        <span
          className="shrink-0 whitespace-nowrap rounded px-2 py-1 font-mono text-[9px] font-bold tracking-[0.06em]"
          style={{
            background: stateCfg.bg,
            color: stateCfg.color,
            border: isPending ? "1px solid " + stateCfg.border : "none",
          }}
        >
          {status === "error" ? "失敗" : stateCfg.label}
        </span>
      </div>

      {(content || isActive || status === "error") && (
        <div
          ref={scrollRef}
          className={cn(
            "overflow-y-auto border-t border-hair-soft px-4 py-3",
            compact ? "max-h-72" : "max-h-[60vh]",
            isPending && "hidden",
          )}
          style={{ background: isActive ? "rgba(204,120,92,0.04)" : "var(--paper)" }}
        >
          {status === "error" && errorMessage && (
            <p className="font-mono text-[11px] text-down">{errorMessage}</p>
          )}
          {content && (
            <div className="prose prose-sm prose-stone max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="mt-4 font-serif text-base font-semibold text-foreground first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mt-4 border-b border-hair-soft pb-1.5 font-serif text-sm font-semibold text-foreground first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mt-3 text-sm font-semibold text-foreground first:mt-0">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/85">
                      {children}
                    </p>
                  ),
                  li: ({ children }) => (
                    <li className="text-[12.5px] leading-relaxed text-foreground/85">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  table: ({ children }) => (
                    <div className="my-3 overflow-x-auto">
                      <table className="w-full text-xs">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-hair bg-paper px-2.5 py-1.5 text-left text-foreground">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-hair px-2.5 py-1.5 text-foreground/85">
                      {children}
                    </td>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
          {isActive && (
            <span className="mt-1 inline-block h-3.5 w-0.5 animate-caret-pulse bg-brand" />
          )}
        </div>
      )}

      {isPending && (
        <div className="border-t border-hair-soft border-dashed bg-paper px-4 py-3 text-center font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
          排隊中 · QUEUED
        </div>
      )}
    </div>
  )
}
