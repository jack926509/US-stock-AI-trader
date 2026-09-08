import { UP_COLOR } from "@/lib/format"

interface SparklineProps {
  points: number[]
  color?: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
}

export function Sparkline({
  points,
  color = UP_COLOR,
  width = 80,
  height = 24,
  fill = false,
  className,
}: SparklineProps) {
  if (!points || points.length < 2) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const step = width / (points.length - 1)
  const path = points
    .map((p, i) => {
      const x = i * step
      const y = height - ((p - min) / range) * height
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ display: "block", overflow: "visible" }}
    >
      {fill && (
        <path
          d={`${path} L${width},${height} L0,${height} Z`}
          fill={color}
          opacity={0.12}
        />
      )}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
