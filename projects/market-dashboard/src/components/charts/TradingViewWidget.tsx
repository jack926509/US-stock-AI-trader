"use client"

import { useEffect, useRef } from "react"

interface Props {
  symbol: string   // TradingView format: "NASDAQ:AAPL"
  height?: number
  interval?: string
}

export default function TradingViewWidget({ symbol, height = 500, interval = "D" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear previous widget + any leftover scripts
    container.innerHTML = ""

    const widgetDiv = document.createElement("div")
    widgetDiv.className = "tradingview-widget-container__widget"
    widgetDiv.style.height = `${height - 32}px`
    widgetDiv.style.width = "100%"

    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.async = true
    // TradingView reads config from script.innerHTML
    script.innerHTML = JSON.stringify({
      symbol,
      interval,
      timezone: "Asia/Taipei",
      theme: "light",
      style: "1",
      locale: "zh_TW",
      toolbar_bg: "#ffffff",
      enable_publishing: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      studies: [
        "MASimple@tv-basicstudies",
        "RSI@tv-basicstudies",
        "MACD@tv-basicstudies",
      ],
      show_popup_button: true,
      popup_width: "1000",
      popup_height: "650",
      width: "100%",
      height,
      hide_top_toolbar: false,
      hide_legend: false,
      support_host: "https://www.tradingview.com",
    })

    container.appendChild(widgetDiv)
    container.appendChild(script)

    return () => {
      if (container) container.innerHTML = ""
    }
  }, [symbol, height, interval])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full overflow-hidden rounded-lg"
      style={{ height }}
    />
  )
}
