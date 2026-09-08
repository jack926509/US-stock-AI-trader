import { sql } from "drizzle-orm"
import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

export const watchlist = sqliteTable("watchlist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  sector: text("sector"),
  addedAt: text("added_at").default(sql`CURRENT_TIMESTAMP`),
  notes: text("notes"),
})

export const financialCache = sqliteTable(
  "financial_cache",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    symbol: text("symbol").notNull(),
    reportType: text("report_type").notNull(), // 'income' | 'balance' | 'cashflow'
    period: text("period").notNull(),          // 'annual' | 'quarterly'
    fiscalYear: text("fiscal_year").notNull(),
    data: text("data").notNull(),              // JSON 字串
    fetchedAt: text("fetched_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    uniqueIndex("financial_cache_unique").on(
      t.symbol,
      t.reportType,
      t.period,
      t.fiscalYear
    ),
  ]
)

export const stockPrices = sqliteTable("stock_prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull().unique(),
  price: real("price"),
  changePercent: real("change_percent"),
  marketCap: real("market_cap"),
  peRatio: real("pe_ratio"),
  week52High: real("week_52_high"),
  week52Low: real("week_52_low"),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
})

export const analysisReports = sqliteTable("analysis_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull(),
  content: text("content").notNull(),         // 完整 Markdown 分析報告
  rating: text("rating"),                     // 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
  targetPriceLow: real("target_price_low"),
  targetPriceHigh: real("target_price_high"),
  modelVersion: text("model_version").notNull(), // e.g. 'claude-sonnet-4-6'
  promptVersion: text("prompt_version").notNull(), // e.g. 'v1.0'
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
})

// 深度分析報告（多代理人辯論版）
// sections JSON 結構：
// {
//   masters: { buffett, lynch, wood, burry, ackman, taleb },
//   debate:  { bull, bear, manager },
//   risk:    { aggressive, conservative, neutral, portfolio }
// }
export const deepAnalysisReports = sqliteTable("deep_analysis_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull(),
  finalContent: text("final_content").notNull(),  // 投組經理最終整合 Markdown
  sections: text("sections").notNull(),           // 各代理人輸出 JSON
  rating: text("rating"),
  targetPriceLow: real("target_price_low"),
  targetPriceHigh: real("target_price_high"),
  modelVersion: text("model_version").notNull(),
  promptVersion: text("prompt_version").notNull(),
  durationMs: integer("duration_ms"),             // 整段流程耗時，方便觀察
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
})

export type Watchlist = typeof watchlist.$inferSelect
export type NewWatchlist = typeof watchlist.$inferInsert
export type FinancialCache = typeof financialCache.$inferSelect
export type StockPrices = typeof stockPrices.$inferSelect
export type AnalysisReport = typeof analysisReports.$inferSelect
export type DeepAnalysisReport = typeof deepAnalysisReports.$inferSelect
