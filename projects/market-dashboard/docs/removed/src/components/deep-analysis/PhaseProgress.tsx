"use client"

import type { AgentPhase } from "@/lib/agents/types"

const PHASES: { id: AgentPhase; n: number; label: string; description: string }[] = [
  { id: "masters", n: 1, label: "6 位投資大師", description: "MASTERS · 6" },
  { id: "debate", n: 2, label: "3 方辯論", description: "DEBATE · 3" },
  { id: "risk", n: 3, label: "3 風險分析", description: "RISK · 3" },
  { id: "portfolio", n: 4, label: "投組整合", description: "PM · 1" },
]

export type PhaseStatus = "pending" | "running" | "done"

interface Props {
  phases: Record<AgentPhase, PhaseStatus>
}

// v2 4 階段 stepper — 圓圈編號 + 中間連接線
export function PhaseProgress({ phases }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-y-3">
      {PHASES.map((p, i) => {
        const status = phases[p.id]
        const active = status === "running"
        const done = status === "done"
        const isLast = i === PHASES.length - 1
        return (
          <div key={p.id} className="flex flex-1 items-center gap-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className={
                  "flex size-8 items-center justify-center rounded-full font-mono text-[13px] font-bold " +
                  (active
                    ? "border-2 border-brand bg-brand text-white"
                    : done
                      ? "border-2 border-up bg-up/10 text-up"
                      : "border border-hair bg-card text-muted-foreground")
                }
              >
                {p.n}
              </div>
              <div>
                <div
                  className={
                    "text-xs font-semibold " +
                    (active || done ? "text-foreground" : "text-muted-foreground")
                  }
                >
                  {p.label}
                </div>
                <div className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground">
                  {p.description}
                </div>
              </div>
            </div>
            {!isLast && (
              <div
                className={
                  "mx-3 h-px flex-1 transition-colors " +
                  (done ? "bg-up" : "bg-hair")
                }
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
