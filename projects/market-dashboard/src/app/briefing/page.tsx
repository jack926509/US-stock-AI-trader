import type { Metadata } from "next"
import { BriefingView } from "@/components/briefing/BriefingView"

export const metadata: Metadata = {
  title: "每日簡報 · US Stock Analyzer",
  description: "持股、追蹤清單與市場熱度的早晨摘要",
}

export default function BriefingPage() {
  return <BriefingView />
}
