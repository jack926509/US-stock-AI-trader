"use client"

export function TradingViewSkeleton({ height = 500 }: { height?: number }) {
  return (
    <div
      className="w-full animate-pulse rounded-lg bg-black/[0.04] ring-1 ring-black/[0.08]"
      style={{ height }}
    >
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <div className="h-3 w-32 rounded bg-black/[0.08]" />
        <div className="h-2 w-20 rounded bg-black/5" />
      </div>
    </div>
  )
}
