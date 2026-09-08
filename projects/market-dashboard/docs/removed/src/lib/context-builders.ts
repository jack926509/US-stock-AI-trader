// 共用脈絡建構器 —
// 從 src/app/api/analysis/[symbol]/route.ts 抽出的資料整理函式，
// 供「單一分析師」與「深度多代理人」兩條 pipeline 共用，避免重複維護。

import axios from "axios"
import { db } from "@/lib/db"
import { financialCache } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import {
  getIncomeStatements,
  getBalanceSheets,
  getCashFlowStatements,
  getKeyMetrics,
  getFinancialRatios,
} from "@/lib/api/fmp"
import type { PeerData } from "@/app/api/peers/[symbol]/route"

// ─── SQLite cache fallback ────────────────────────────────────────
async function readCache<T>(symbol: string, reportType: string): Promise<T[]> {
  try {
    const rows = await db
      .select()
      .from(financialCache)
      .where(and(
        eq(financialCache.symbol, symbol),
        eq(financialCache.reportType, reportType),
        eq(financialCache.period, "annual"),
        eq(financialCache.fiscalYear, "list_annual"),
      ))
      .limit(1)
    if (rows.length > 0) return JSON.parse(rows[0].data) as T[]
  } catch { /* ignore */ }
  return []
}

// ─── 數字格式化 ───────────────────────────────────────────────────
export function fmtB(n: number) {
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(1) + "T"
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1) + "B"
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + "M"
  return n.toFixed(0)
}

// ─── 財務摘要（3 年 + 資本配置） ──────────────────────────────────
export async function buildFinancialSummary(symbol: string): Promise<string> {
  let [income, cashflow, balance] = await Promise.all([
    getIncomeStatements(symbol, "annual", 4),
    getCashFlowStatements(symbol, "annual", 3),
    getBalanceSheets(symbol, "annual", 3),
  ])

  if (!income.length) income = await readCache(symbol, "income")
  if (!cashflow.length) cashflow = await readCache(symbol, "cashflow")
  if (!balance.length) balance = await readCache(symbol, "balance")

  if (!income.length) return "（無法取得財務數據）"

  const lines: string[] = []
  for (let i = 0; i < Math.min(3, income.length); i++) {
    const inc = income[i]
    const cf = cashflow[i]
    const bal = balance[i]
    const prev = income[i + 1]
    const year = inc.date.substring(0, 4)

    const revYoY = prev && prev.revenue > 0
      ? ` (${((inc.revenue - prev.revenue) / prev.revenue * 100).toFixed(1)}% YoY)`
      : ""
    const niYoY = prev && Math.abs(prev.netIncome) > 0
      ? ` (${((inc.netIncome - prev.netIncome) / Math.abs(prev.netIncome) * 100).toFixed(1)}% YoY)`
      : ""
    const gmDelta = prev
      ? ` (${((inc.grossProfitRatio - prev.grossProfitRatio) * 100).toFixed(1)}pp YoY)`
      : ""

    lines.push(
      `${year}: 營收 ${fmtB(inc.revenue)}${revYoY}, 毛利率 ${(inc.grossProfitRatio * 100).toFixed(1)}%${gmDelta}, ` +
      `淨利率 ${(inc.netIncomeRatio * 100).toFixed(1)}%, 淨利 ${fmtB(inc.netIncome)}${niYoY}` +
      (cf ? `, FCF ${fmtB(cf.freeCashFlow)}` : "") +
      (bal ? `, 總負債 ${fmtB(bal.totalDebt)}, 現金 ${fmtB(bal.cashAndCashEquivalents)}` : "")
    )
  }

  if (cashflow.length) {
    const cf0 = cashflow[0]
    const year0 = cf0.date.substring(0, 4)
    const capParts: string[] = []
    if (cf0.commonStockRepurchased && cf0.commonStockRepurchased < 0)
      capParts.push(`股票回購 ${fmtB(Math.abs(cf0.commonStockRepurchased))}`)
    if (cf0.dividendsPaid && cf0.dividendsPaid < 0)
      capParts.push(`股息 ${fmtB(Math.abs(cf0.dividendsPaid))}`)
    if (cf0.capitalExpenditure)
      capParts.push(`資本支出 ${fmtB(Math.abs(cf0.capitalExpenditure))}`)
    if (capParts.length)
      lines.push(`${year0} 資本配置: ${capParts.join(", ")}`)
  }

  return lines.join("\n").slice(0, 2500)
}

// ─── 新聞情緒分類 + 摘要 ──────────────────────────────────────────
const POS_KEYWORDS = /beat|record|growth|surge|gain|rise|profit|strong|upgrade|buy|exceed|outperform|launch|new|innovation|partnership|expansion/i
const NEG_KEYWORDS = /miss|fall|decline|loss|cut|downgrade|sell|weak|risk|concern|lawsuit|investigation|recall|layoff|debt|warning|disappoints/i

export function classifyNewsSentiment(text: string): string {
  const pos = (text.match(POS_KEYWORDS) || []).length
  const neg = (text.match(NEG_KEYWORDS) || []).length
  if (pos > neg) return "positive"
  if (neg > pos) return "negative"
  return "neutral"
}

export async function buildNewsSummary(symbol: string): Promise<string> {
  try {
    const key = process.env.FINNHUB_API_KEY
    if (!key) return "（無法取得新聞）"

    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - 30)
    const fmt = (d: Date) => d.toISOString().split("T")[0]

    const { data } = await axios.get<Array<{ headline: string; summary?: string; datetime: number; url: string }>>(
      "https://finnhub.io/api/v1/company-news",
      { params: { symbol, from: fmt(fromDate), to: fmt(toDate), token: key } }
    )

    if (!Array.isArray(data) || !data.length) return "（近期無重大新聞）"

    return data
      .filter((n) => n.headline && n.url)
      .slice(0, 10)
      .map((n, i) => {
        const date = new Date(n.datetime * 1000).toISOString().substring(0, 10)
        const summary = (n.summary ?? n.headline).slice(0, 200)
        const sentiment = classifyNewsSentiment(`${n.headline} ${n.summary ?? ""}`)
        return `${i + 1}. [${date}][${sentiment}] ${n.headline}\n   ${summary}`
      })
      .join("\n")
      .slice(0, 2000)
  } catch {
    return "（無法取得新聞）"
  }
}

// ─── 估值 / 獲利核心指標 ──────────────────────────────────────────
export async function buildKeyMetricsSummary(symbol: string): Promise<string> {
  let [kms, ratios] = await Promise.all([
    getKeyMetrics(symbol, "annual", 1).catch(() => []),
    getFinancialRatios(symbol, "annual", 1).catch(() => []),
  ])

  if (!kms.length) kms = await readCache(symbol, "keyMetrics")
  if (!ratios.length) ratios = await readCache(symbol, "ratios")

  const km = kms[0]
  const r = ratios[0]
  if (!km && !r) return "（無法取得核心指標）"

  const parts: string[] = []
  if (km) {
    if (km.peRatio) parts.push(`P/E: ${km.peRatio.toFixed(1)}x`)
    if (km.pbRatio) parts.push(`P/B: ${km.pbRatio.toFixed(1)}x`)
    if (km.psRatio) parts.push(`P/S: ${km.psRatio.toFixed(1)}x`)
    if (km.evToEbitda) parts.push(`EV/EBITDA: ${km.evToEbitda.toFixed(1)}x`)
    if (km.pegRatio) parts.push(`PEG: ${km.pegRatio.toFixed(2)}`)
    if (km.dividendYield) parts.push(`Dividend Yield: ${(km.dividendYield * 100).toFixed(2)}%`)
  }
  if (r) {
    if (r.returnOnEquity) parts.push(`ROE: ${(r.returnOnEquity * 100).toFixed(1)}%`)
    if (r.returnOnAssets) parts.push(`ROA: ${(r.returnOnAssets * 100).toFixed(1)}%`)
    if (r.grossProfitMargin) parts.push(`毛利率: ${(r.grossProfitMargin * 100).toFixed(1)}%`)
    if (r.netProfitMargin) parts.push(`淨利率: ${(r.netProfitMargin * 100).toFixed(1)}%`)
    if (r.debtEquityRatio) parts.push(`D/E: ${r.debtEquityRatio.toFixed(2)}`)
    if (r.currentRatio) parts.push(`流動比率: ${r.currentRatio.toFixed(2)}`)
  }
  return parts.join(" | ").slice(0, 500)
}

// ─── 同業比較表 ───────────────────────────────────────────────────
export async function buildPeerSummary(symbol: string): Promise<string> {
  try {
    const FMP_STABLE = "https://financialmodelingprep.com/stable"
    const key = process.env.FMP_API_KEY
    if (!key) return "（無法取得同業數據）"

    let peerSymbols: string[] = []
    try {
      const { data } = await axios.get<Array<{ peersList: string[] }>>(
        "https://financialmodelingprep.com/api/v4/stock_peers",
        { params: { symbol, apikey: key }, timeout: 6000 }
      )
      if (Array.isArray(data) && data[0]?.peersList) {
        peerSymbols = data[0].peersList.slice(0, 4)
      }
    } catch { /* ignore */ }

    const allSymbols = [symbol, ...peerSymbols.filter((s) => s !== symbol)].slice(0, 5)

    const results = await Promise.allSettled(
      allSymbols.map(async (sym): Promise<PeerData | null> => {
        try {
          const [profRes, kmRes, rtRes] = await Promise.allSettled([
            axios.get<Record<string, unknown>[]>(`${FMP_STABLE}/profile`, { params: { symbol: sym, apikey: key }, timeout: 6000 }),
            axios.get<Record<string, unknown>[]>(`${FMP_STABLE}/key-metrics`, { params: { symbol: sym, period: "annual", limit: 1, apikey: key }, timeout: 6000 }),
            axios.get<Record<string, unknown>[]>(`${FMP_STABLE}/ratios`, { params: { symbol: sym, period: "annual", limit: 1, apikey: key }, timeout: 6000 }),
          ])
          const prof = profRes.status === "fulfilled" && Array.isArray(profRes.value.data) ? profRes.value.data[0] : null
          if (!prof) return null
          const km = kmRes.status === "fulfilled" && Array.isArray(kmRes.value.data) ? kmRes.value.data[0] : null
          const rt = rtRes.status === "fulfilled" && Array.isArray(rtRes.value.data) ? rtRes.value.data[0] : null
          const n = (v: unknown) => { const x = Number(v); return v != null && !isNaN(x) && isFinite(x) && x !== 0 ? x : null }
          return {
            symbol: sym, companyName: String(prof.companyName ?? sym),
            marketCap: Number(prof.marketCap ?? 0), price: Number(prof.price ?? 0),
            sector: String(prof.sector ?? ""), isTarget: sym === symbol,
            peRatio: n(km?.peRatio) ?? n(rt?.priceToEarningsRatio),
            pbRatio: n(km?.pbRatio), psRatio: n(km?.psRatio),
            evToEbitda: n(km?.evToEbitda) ?? n(rt?.enterpriseValueMultiple),
            roe: n(km?.roe) ?? n(rt?.returnOnEquity),
            grossMargin: n(rt?.grossProfitMargin), revenueGrowth: null,
          }
        } catch { return null }
      })
    )

    const peers = results.map((r) => r.status === "fulfilled" ? r.value : null).filter((p): p is PeerData => p !== null)
    if (!peers.length) return "（無同業數據）"

    const fmt = (v: number | null, d = 1, sfx = "x") => v != null ? v.toFixed(d) + sfx : "N/A"
    const fmtPct = (v: number | null) => v != null ? (v * 100).toFixed(1) + "%" : "N/A"
    const fmtCap = (v: number) => v >= 1e12 ? `$${(v / 1e12).toFixed(1)}T` : v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : "N/A"

    const header = "公司 | 市值 | P/E | P/B | P/S | EV/EBITDA | ROE | 毛利率"
    const rows = peers.map((p) =>
      `${p.symbol}${p.isTarget ? "★" : ""} | ${fmtCap(p.marketCap)} | ${fmt(p.peRatio)} | ${fmt(p.pbRatio)} | ${fmt(p.psRatio)} | ${fmt(p.evToEbitda)} | ${fmtPct(p.roe)} | ${fmtPct(p.grossMargin)}`
    )
    return [header, ...rows].join("\n").slice(0, 800)
  } catch {
    return "（無法取得同業數據）"
  }
}

// ─── EPS Beat / Miss 紀錄 ────────────────────────────────────────
export async function buildEarningsSurprisesSummary(symbol: string): Promise<string> {
  try {
    const key = process.env.FMP_API_KEY
    if (!key) return ""
    const { data } = await axios.get<Array<{
      date: string
      actualEarningResult: number
      estimatedEarning: number
    }>>(`https://financialmodelingprep.com/api/v3/earnings-surprises/${symbol}`, {
      params: { apikey: key },
      timeout: 6000,
    })
    if (!Array.isArray(data) || !data.length) return "（無 EPS 驚喜記錄）"
    return data.slice(0, 4).map((e) => {
      const surprise = e.actualEarningResult - e.estimatedEarning
      const pct = e.estimatedEarning !== 0
        ? ((surprise / Math.abs(e.estimatedEarning)) * 100).toFixed(1)
        : "N/A"
      const beat = surprise >= 0 ? "✓ Beat" : "✗ Miss"
      return `${e.date}: EPS 實際 $${e.actualEarningResult?.toFixed(2)} vs 預期 $${e.estimatedEarning?.toFixed(2)} → ${beat} (${pct}%)`
    }).join("\n")
  } catch {
    return ""
  }
}

// ─── 分析師共識 ───────────────────────────────────────────────────
export async function buildAnalystConsensusSummary(symbol: string): Promise<string> {
  try {
    const key = process.env.FMP_API_KEY
    if (!key) return "（無法取得分析師共識）"

    const [estRes, gradesRes] = await Promise.allSettled([
      axios.get<Array<Record<string, unknown>>>(
        `https://financialmodelingprep.com/stable/analyst-estimates`,
        { params: { symbol, limit: 1, apikey: key }, timeout: 6000 }
      ),
      axios.get<Array<Record<string, unknown>>>(
        `https://financialmodelingprep.com/stable/grades-consensus`,
        { params: { symbol, apikey: key }, timeout: 6000 }
      ),
    ])

    const parts: string[] = []

    if (gradesRes.status === "fulfilled" && Array.isArray(gradesRes.value.data) && gradesRes.value.data.length) {
      const g = gradesRes.value.data[0]
      const total = [g.strongBuy, g.buy, g.hold, g.sell, g.strongSell].reduce(
        (s: number, v) => s + Number(v ?? 0), 0
      )
      if (total > 0) {
        parts.push(
          `評級分布（${total} 位分析師）: 強買 ${g.strongBuy ?? 0} / 買入 ${g.buy ?? 0} / 持有 ${g.hold ?? 0} / 賣出 ${g.sell ?? 0} / 強賣 ${g.strongSell ?? 0}`
        )
        if (g.consensus) parts.push(`共識評級: ${g.consensus}`)
      }
    }

    if (estRes.status === "fulfilled" && Array.isArray(estRes.value.data) && estRes.value.data.length) {
      const e = estRes.value.data[0]
      const n = (v: unknown) => { const x = Number(v); return isFinite(x) && x !== 0 ? x : null }
      const revAvg = n(e.estimatedRevenueAvg)
      const epsAvg = n(e.estimatedEpsAvg)
      const epsLow = n(e.estimatedEpsLow)
      const epsHigh = n(e.estimatedEpsHigh)
      if (revAvg) parts.push(`下期預期營收: ${fmtB(revAvg)}`)
      if (epsAvg) parts.push(`下期預期EPS: $${epsAvg.toFixed(2)} (區間 $${epsLow?.toFixed(2) ?? "N/A"} – $${epsHigh?.toFixed(2) ?? "N/A"})`)
    }

    return parts.length ? parts.join("\n") : "（無分析師共識數據）"
  } catch {
    return "（無法取得分析師共識）"
  }
}

// ─── 內部人交易 ───────────────────────────────────────────────────
export async function buildInsiderTradingSummary(symbol: string): Promise<string> {
  try {
    const key = process.env.FMP_API_KEY
    if (!key) return "（無法取得內部人交易）"
    const { data } = await axios.get<Array<{
      transactionDate: string
      securitiesTransacted: number
      price: number
      acquistionOrDisposition: string
    }>>(`https://financialmodelingprep.com/stable/insider-trading`, {
      params: { symbol, limit: 30, apikey: key },
      timeout: 6000,
    })
    if (!Array.isArray(data) || !data.length) return "（近期無內部人交易記錄）"

    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - 6)
    const recent = data.filter((t) => new Date(t.transactionDate) >= cutoff)
    if (!recent.length) return "（近6個月無內部人交易）"

    let buyCount = 0, sellCount = 0, buyValue = 0, sellValue = 0
    for (const t of recent) {
      const value = (t.securitiesTransacted ?? 0) * (t.price ?? 0)
      if (t.acquistionOrDisposition === "A") { buyCount++; buyValue += value }
      else { sellCount++; sellValue += value }
    }

    const parts: string[] = []
    if (buyCount) parts.push(`買入 ${buyCount} 筆 (${fmtB(buyValue)})`)
    if (sellCount) parts.push(`賣出 ${sellCount} 筆 (${fmtB(sellValue)})`)
    const signal = buyValue > sellValue * 2 ? "積極買入 🟢"
      : sellValue > buyValue * 2 ? "積極賣出 🔴"
      : buyValue > sellValue ? "偏多 🟡"
      : sellValue > buyValue ? "偏空 🟠"
      : "中性"

    return `近6個月內部人交易: ${parts.join(", ")} → 信號: ${signal}`
  } catch {
    return "（無法取得內部人交易）"
  }
}

// ─── 宏觀錨點（季度硬編碼） ───────────────────────────────────────
export function buildMacroContext(): string {
  const now = new Date()
  const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`
  return [
    `宏觀環境（${quarter}）:`,
    `聯準會基準利率 4.25–4.50%，市場預期 2026 年降息 1–2 次`,
    `10年期美債殖利率約 4.3%（科技/成長股折現率壓力仍存）`,
    `美元指數相對強勢（不利跨國企業海外收入換算）`,
    `標普500 Forward P/E 約 21x（歷史均值 ~16x，整體估值偏高）`,
    `主要系統性風險: 關稅政策不確定性、AI 資本支出回報期疑慮`,
  ].join(" | ")
}

// ─── 報告解析（給 DB 用）──────────────────────────────────────────
export function parseRating(content: string): string | null {
  const patterns = ["Strong Buy", "Strong Sell", "Buy", "Sell", "Hold"]
  for (const p of patterns) {
    if (content.includes(p)) return p
  }
  return null
}

export function parseTargetPrice(content: string): { low: number | null; high: number | null } {
  const rangeMatch = content.match(/\$(\d+(?:\.\d+)?)\s*[-–]\s*\$(\d+(?:\.\d+)?)/)
  if (rangeMatch) {
    return { low: parseFloat(rangeMatch[1]), high: parseFloat(rangeMatch[2]) }
  }
  const singleMatch = content.match(/目標價[：:]\s*\$(\d+(?:\.\d+)?)/)
  if (singleMatch) {
    const p = parseFloat(singleMatch[1])
    return { low: p, high: p }
  }
  return { low: null, high: null }
}
