export interface Position {
  symbol: string;
  qty: number;
  side: "long" | "short";
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPl: number;
  unrealizedPlPct: number;
  costBasis: number;
}

export interface Signal {
  id: string;
  ticker: string;
  action: "buy" | "sell";
  signal_type: string;
  timeframe: string;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  rr_ratio: number;
  strength: "high" | "medium" | "low";
  python_validated: number | null;
  python_confidence: number | null;
  python_indicators: string | null;
  claude_analysis: string | null;
  status: "pending" | "validated" | "rejected" | "ordered" | "skipped_risk";
  rejection_reason: string | null;
  received_at: string;
  source_timestamp: string;
}

export interface DailyStats {
  date: string;
  starting_equity: number;
  realized_pnl: number;
  unrealized_pnl: number;
  trades_taken: number;
  trades_won: number;
  daily_stop_hit: number;
  updated_at: string;
}

export interface Account {
  equity: number;
  buyingPower: number;
  cash: number;
  portfolioValue: number;
  daytradeCount: number;
  status: string;
  dailyStopHit: boolean;
}

export interface BacktestStats {
  totalTrades: number;
  winRate: number;
  avgRR: number;
  totalPnl: number;
  maxDrawdown: number;
  bestTrade: number;
  worstTrade: number;
  trades: TradeResult[];
}

export interface TradeResult {
  id: string;
  order_id: string;
  ticker: string;
  action: string;
  entry_price: number;
  exit_price: number;
  qty: number;
  pnl: number;
  pnl_pct: number;
  rr_achieved: number;
  hold_duration_s: number | null;
  closed_at: string;
}
