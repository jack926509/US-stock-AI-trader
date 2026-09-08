import type { ReactNode } from "react"

interface SectionHeaderProps {
  eyebrow: string
  title: ReactNode
  right?: ReactNode
  className?: string
}

export function SectionHeader({ eyebrow, title, right, className }: SectionHeaderProps) {
  return (
    <div
      className={
        "flex flex-wrap items-end justify-between gap-3 border-b border-hair-soft px-4 pt-3.5 pb-3 sm:px-[18px] " +
        (className ?? "")
      }
    >
      <div>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
          {eyebrow}
        </div>
        <h3 className="mt-1 font-serif text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      {right}
    </div>
  )
}
