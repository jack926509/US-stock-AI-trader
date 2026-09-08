// AI 分析報告歷史 — localStorage 持久化
// 不取代 sessionStorage 快取（後者只在 session 內存活）；本檔提供跨 session 查閱

import type { AnalysisReport } from "@/types"

export interface HistoryEntry extends AnalysisReport {
  id: string
}

const KEY = "analysis_history_v1"
const MAX_ENTRIES = 50

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (h): h is HistoryEntry =>
        h &&
        typeof h.id === "string" &&
        typeof h.symbol === "string" &&
        typeof h.content === "string" &&
        typeof h.generatedAt === "string",
    )
  } catch {
    return []
  }
}

function write(list: HistoryEntry[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // quota 滿時放棄寫入
  }
}

export function getHistory(): HistoryEntry[] {
  return read().sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
}

export function getHistoryBySymbol(symbol: string): HistoryEntry[] {
  const upper = symbol.toUpperCase()
  return getHistory().filter((h) => h.symbol === upper)
}

export function addHistory(report: AnalysisReport): HistoryEntry {
  const entry: HistoryEntry = {
    ...report,
    id: `${report.symbol}_${report.generatedAt}`,
  }
  const list = read()
  // 同 generatedAt 視為同一筆，避免重覆
  const filtered = list.filter((h) => h.id !== entry.id)
  filtered.unshift(entry)
  write(filtered.slice(0, MAX_ENTRIES))
  return entry
}

export function removeHistory(id: string): void {
  write(read().filter((h) => h.id !== id))
}

export function clearHistory(): void {
  write([])
}
