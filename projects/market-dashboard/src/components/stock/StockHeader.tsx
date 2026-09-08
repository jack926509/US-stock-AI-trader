"use client"

import { ExternalLink } from "lucide-react"
import { LogoTile } from "@/components/design/LogoTile"
import { fmtCap, changeColor } from "@/lib/format"
import type { Profile } from "@/types"

interface StockHeaderProps {
  profile: Profile | null
  symbol: string
  price?: number
  changePercentage?: number
  change?: number
}

export function StockHeader({
  profile,
  symbol,
  price,
  changePercentage,
  change,
}: StockHeaderProps) {
  const displayPrice = price ?? profile?.price ?? 0
  const displayChange = change ?? profile?.change ?? 0
  const displayChangePct = changePercentage ?? profile?.changePercentage ?? 0
  const up = displayChangePct >= 0
  const color = changeColor(displayChangePct)

  const metaLine = [profile?.country ?? "US", profile?.exchange, profile?.sector, profile?.industry]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase()

  return (
    <>
      {/* Big header */}
      <div className="border-hair bg-background border-b px-4 py-5 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-[18px]">
          <LogoTile symbol={symbol} src={profile?.image} size={64} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <h1
                className="font-mono text-3xl font-bold tracking-tight"
                style={{ letterSpacing: "-0.01em" }}
              >
                {symbol}
              </h1>
              <span className="font-serif text-lg font-medium">{profile?.companyName ?? "—"}</span>
              {metaLine && (
                <span className="text-muted-foreground font-mono text-[11px] tracking-[0.06em]">
                  {metaLine}
                </span>
              )}
              {profile?.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div className="mt-3.5 flex flex-wrap items-end gap-x-6 gap-y-3">
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-muted-foreground font-mono text-base">$</span>
                  <span
                    className="font-mono text-[44px] leading-[0.95] font-bold tabular-nums sm:text-[56px]"
                    style={{ letterSpacing: "-0.03em" }}
                  >
                    {displayPrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-muted-foreground mt-1 font-mono text-[11px]">
                  LAST · UPDATED 60S
                </div>
              </div>

              {/* Change pill */}
              <div>
                <div
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-base font-bold text-white"
                  style={{ background: color }}
                >
                  {up ? "▲" : "▼"} {displayChange >= 0 ? "+" : ""}
                  {displayChange.toFixed(2)} {displayChangePct >= 0 ? "+" : ""}
                  {displayChangePct.toFixed(2)}%
                </div>
                {profile?.marketCap ? (
                  <div className="text-muted-foreground mt-1 font-mono text-[11px]">
                    MCAP {fmtCap(profile.marketCap)}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
