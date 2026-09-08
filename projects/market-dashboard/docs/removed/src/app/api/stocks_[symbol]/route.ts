import { db } from "@/lib/db"
import { stockPrices, watchlist } from "@/lib/db/schema"
import { validateSymbol } from "@/lib/validations"
import { eq } from "drizzle-orm"

// DELETE /api/stocks/[symbol] — 移除追蹤標的
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const upper = symbol.toUpperCase()

  if (!validateSymbol(upper)) {
    return Response.json({ error: "Invalid stock symbol", code: "INVALID_SYMBOL" }, { status: 400 })
  }

  try {
    const deleted = await db.delete(watchlist).where(eq(watchlist.symbol, upper)).returning()

    if (deleted.length === 0) {
      return Response.json({ error: "Stock not found", code: "NOT_FOUND" }, { status: 404 })
    }

    // 同時清除價格快取
    await db.delete(stockPrices).where(eq(stockPrices.symbol, upper))

    return Response.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/stocks/[symbol]]", err)
    return Response.json({ error: "Failed to remove stock", code: "API_ERROR" }, { status: 500 })
  }
}

// PATCH /api/stocks/[symbol] — 更新備註
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const upper = symbol.toUpperCase()

  if (!validateSymbol(upper)) {
    return Response.json({ error: "Invalid stock symbol", code: "INVALID_SYMBOL" }, { status: 400 })
  }

  try {
    const body = (await req.json()) as { notes?: unknown }
    const notes = typeof body.notes === "string" ? body.notes : null

    const updated = await db
      .update(watchlist)
      .set({ notes })
      .where(eq(watchlist.symbol, upper))
      .returning()

    if (updated.length === 0) {
      return Response.json({ error: "Stock not found", code: "NOT_FOUND" }, { status: 404 })
    }

    return Response.json(updated[0])
  } catch (err) {
    console.error("[PATCH /api/stocks/[symbol]]", err)
    return Response.json({ error: "Failed to update notes", code: "API_ERROR" }, { status: 500 })
  }
}
