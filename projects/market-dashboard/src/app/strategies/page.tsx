import type { Metadata } from "next"
import { StrategyScanner } from "@/components/strategies/StrategyScanner"

export const metadata: Metadata = { title: "策略掃描 · 美股研究台", description: "可解釋的日線規則掃描" }
export default function StrategiesPage() { return <StrategyScanner /> }
