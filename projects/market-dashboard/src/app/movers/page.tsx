import type { Metadata } from "next"
import { MoversView } from "@/components/movers/MoversView"

export const metadata: Metadata = {
  title: "Movers · US Stock Analyzer",
  description: "今日漲跌幅排行與活躍度",
}

export default function MoversPage() {
  return <MoversView />
}
