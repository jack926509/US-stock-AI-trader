import { assertLocalWatchlistMode, mutateWatchlist, readWatchlist, writeWatchlist } from "@/lib/watchlist-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function errorResponse(error: unknown): Response {
  const message = error instanceof Error ? error.message : "UNKNOWN"
  if (message === "LOCAL_MODE_DISABLED") return Response.json({ error: "自選股服務只在受控本機啟動模式提供" }, { status: 403 })
  if (message === "WATCHLIST_TOO_LARGE") return Response.json({ error: "自選股資料超過限制" }, { status: 413 })
  if (message === "INVALID_WATCHLIST" || error instanceof SyntaxError) return Response.json({ error: "自選股格式無效" }, { status: 400 })
  console.error("[watchlist]", error)
  return Response.json({ error: "自選股儲存失敗" }, { status: 500 })
}

export async function GET(request: Request) {
  try {
    assertLocalWatchlistMode(request)
    return Response.json(await readWatchlist(), { headers: { "cache-control": "private, no-store" } })
  } catch (error) { return errorResponse(error) }
}

export async function PUT(request: Request) {
  try {
    assertLocalWatchlistMode(request)
    const body = await request.text()
    if (Buffer.byteLength(body) > 128 * 1024) throw new Error("WATCHLIST_TOO_LARGE")
    return Response.json(await writeWatchlist(JSON.parse(body)), { headers: { "cache-control": "private, no-store" } })
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: Request) {
  try {
    assertLocalWatchlistMode(request)
    const body = await request.text()
    if (Buffer.byteLength(body) > 128 * 1024) throw new Error("WATCHLIST_TOO_LARGE")
    const parsed = JSON.parse(body) as { operation?: "add" | "remove" | "migrate"; payload?: unknown }
    if (!parsed.operation || !["add", "remove", "migrate"].includes(parsed.operation)) throw new Error("INVALID_WATCHLIST")
    return Response.json(await mutateWatchlist(parsed.operation, parsed.payload), { headers: { "cache-control": "private, no-store" } })
  } catch (error) { return errorResponse(error) }
}
