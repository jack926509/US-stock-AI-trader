import { NextRequest, NextResponse } from "next/server"

// ── Simple in-memory rate limiter ─────────────────────────────
// Per-IP, sliding window. Resets across serverless cold starts
// (acceptable for abuse prevention, not billing-grade enforcement).
const rateMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs })
    return false
  }

  if (entry.count >= limit) return true
  entry.count++
  return false
}

// ── Basic Auth (optional password protection) ─────────────────
function checkBasicAuth(req: NextRequest): boolean {
  const password = process.env.SITE_PASSWORD
  if (!password) return true // No password set → open access

  const auth = req.headers.get("authorization")
  if (!auth?.startsWith("Basic ")) return false

  const decoded = Buffer.from(auth.slice(6), "base64").toString()
  // Accept any username, check password only
  const [, pass] = decoded.split(":")
  return pass === password
}

export function proxy(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
  const { pathname } = req.nextUrl

  // ── Rate limit API routes ────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    // Deep analysis POST (10 Claude calls per run): 2 per 60s per IP
    const isDeepAnalysisPost =
      pathname.startsWith("/api/deep-analysis") && req.method === "POST"
    const key = isDeepAnalysisPost ? `deep:${ip}` : ip
    const limit = isDeepAnalysisPost ? 2 : 60

    if (isRateLimited(key, limit, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": "60" } }
      )
    }
  }

  // ── Basic Auth (whole site) ──────────────────────────────────
  if (!checkBasicAuth(req)) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="US Stock Analyzer"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Apply to all routes except static files and _next internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
