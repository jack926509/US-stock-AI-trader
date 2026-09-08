"use client"

import { useEffect, useRef } from "react"

interface Props {
  symbol: string  // TradingView format: "NASDAQ:AAPL"
  width?: number | string
  height?: number
}

export default function TradingViewTechAnalysis({ symbol, width = "100%", height = 425 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ""

    const widgetDiv = document.createElement("div")
    widgetDiv.className = "tradingview-widget-container__widget"

    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
    script.async = true
    script.innerHTML = JSON.stringify({
      interval: "1D",
      width,
      isTransparent: false,
      height,
      symbol,
      showIntervalTabs: true,
      displayMode: "single",
      locale: "zh_TW",
      colorTheme: "light",
    })

    container.appendChild(widgetDiv)
    container.appendChild(script)

    return () => {
      if (container) container.innerHTML = ""
    }
  }, [symbol, width, height])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full overflow-hidden rounded-lg"
      style={{ height }}
    />
  )
}
