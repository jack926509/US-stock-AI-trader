"use client"

import Image from "next/image"
import { useState } from "react"

const HUES = ["#CC785C", "#1A1A1A", "#8B6F47", "#6B6357", "#A85C44"] as const

interface LogoTileProps {
  symbol: string
  src?: string | null
  size?: number
  className?: string
}

export function LogoTile({ symbol, src, size = 28, className }: LogoTileProps) {
  const [failed, setFailed] = useState(false)

  const hash = [...symbol].reduce((a, c) => a + c.charCodeAt(0), 0)
  const bg = HUES[hash % HUES.length]
  const label = symbol.slice(0, symbol.length > 4 ? 3 : 2)
  const radius = size * 0.22

  if (!src || failed) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: bg,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.36,
          fontWeight: 700,
          fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
          letterSpacing: "-0.02em",
          flexShrink: 0,
        }}
      >
        {label}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={`${symbol} logo`}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      unoptimized
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        objectFit: "contain",
        background: "#fff",
        flexShrink: 0,
      }}
    />
  )
}
