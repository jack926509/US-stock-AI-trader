import { StockDetailView } from "@/components/stock/StockDetailView"
import { validateSymbol } from "@/lib/validations"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ symbol: string }>
}

export default async function StockPage({ params }: Props) {
  const { symbol: raw } = await params
  const symbol = raw.toUpperCase()

  if (!validateSymbol(symbol)) {
    notFound()
  }

  return <StockDetailView symbol={symbol} />
}

export async function generateMetadata({ params }: Props) {
  const { symbol: raw } = await params
  const symbol = raw.toUpperCase()
  return { title: `${symbol} — US Stock Analyzer` }
}
