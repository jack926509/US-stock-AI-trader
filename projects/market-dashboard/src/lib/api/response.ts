import { validateSymbol } from "@/lib/validations"
import type { ApiErrorCode } from "@/types"

export class ApiRouteError extends Error {
  code: ApiErrorCode
  status: number

  constructor(message: string, code: ApiErrorCode, status = 500) {
    super(message)
    this.name = "ApiRouteError"
    this.code = code
    this.status = status
  }
}

export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, init)
}

export function cacheHeaders(seconds: number, staleWhileRevalidate = seconds): HeadersInit {
  return {
    "cache-control": `public, s-maxage=${seconds}, stale-while-revalidate=${staleWhileRevalidate}`,
  }
}

export function jsonError(error: string, code: ApiErrorCode, status = 500): Response {
  return Response.json({ error, code }, { status })
}

export function normalizeSymbol(raw: unknown): string {
  if (typeof raw !== "string") {
    throw new ApiRouteError("Invalid symbol", "INVALID_SYMBOL", 400)
  }
  const symbol = raw.trim().toUpperCase()
  if (!validateSymbol(symbol)) {
    throw new ApiRouteError("Invalid symbol", "INVALID_SYMBOL", 400)
  }
  return symbol
}

export function parseSymbolsParam(raw: string | null): string[] {
  if (!raw) return []
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(validateSymbol)
    )
  )
}

export function handleApiError(context: string, err: unknown): Response {
  if (err instanceof ApiRouteError) {
    return jsonError(err.message, err.code, err.status)
  }
  console.error(context, err)
  return jsonError("Internal server error", "API_ERROR", 500)
}
