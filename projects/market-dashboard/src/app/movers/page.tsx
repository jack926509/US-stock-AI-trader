import type { Metadata } from "next"
import { MoversView } from "@/components/movers/MoversView"

export const metadata: Metadata = {
  title: "Movers · US Stock Analyzer",
  description: "已收盤日線漲跌幅與相對均量排行",
}

export default function MoversPage() {
  return <MoversView />
}
