import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin text-brand" />
        <p className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground">LOADING...</p>
      </div>
    </main>
  )
}
