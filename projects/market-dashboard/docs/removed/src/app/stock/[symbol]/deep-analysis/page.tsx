import { validateSymbol } from "@/lib/validations"
import { notFound } from "next/navigation"
import { DeepAnalysisClient } from "./DeepAnalysisClient"
import { TickerBar } from "@/components/design/TickerBar"
import { Navbar } from "@/components/dashboard/Navbar"

interface Props {
  params: Promise<{ symbol: string }>
}

export default async function DeepAnalysisPage({ params }: Props) {
  const { symbol: raw } = await params
  const symbol = raw.toUpperCase()

  if (!validateSymbol(symbol)) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TickerBar />
      <Navbar
        breadcrumb={[
          { label: "儀表板", href: "/" },
          { label: symbol, href: `/stock/${symbol}` },
          { label: "深度分析" },
        ]}
      />
      <main className="flex-1 px-4 py-6 sm:px-8">
        <DeepAnalysisClient symbol={symbol} />
      </main>
    </div>
  )
}

export async function generateMetadata({ params }: Props) {
  const { symbol: raw } = await params
  const symbol = raw.toUpperCase()
  return { title: `${symbol} 深度分析 — US Stock Analyzer` }
}
