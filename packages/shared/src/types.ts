// 訊號來源
export type SignalSource = "tradingview" | "python";

// 方向
export type Direction = "long" | "short";

// 訊號類型（TradingView 端與 Python 端共用詞彙）
export type SignalType =
  | "BOS"
  | "CHoCH"
  | "OB"
  | "FVG"
  | "LIQ_SWEEP"
  | "MA_CROSS"
  | "RSI_DIVERGENCE"
  | "MACD_CROSS";

// 從 TradingView Pine Script alert_message 進來的 JSON 結構
export interface TradingViewSignalPayload {
  secret: string;
  symbol: string;
  timeframe: string; // "5m" | "15m" | "1h" | "4h" | "1D"
  direction: Direction;
  signal_type: SignalType;
  price: number;
  high: number;
  low: number;
  volume: number;
  time: string; // ISO 8601
}

// Python Engine POST 進來的 JSON 結構
export interface PythonSignalPayload {
  token: string;
  symbol: string;
  timeframe: string;
  direction: Direction;
  signal_type: SignalType;
  indicators: {
    ma50?: number;
    ma200?: number;
    rsi?: number;
    macd?: number;
    macd_signal?: number;
  };
  price: number;
  time: string; // ISO 8601
}

// Claude API 結構化輸出
export interface ClaudeSmcEvaluation {
  bos: { detected: boolean; level?: number };
  choch: { detected: boolean };
  order_block: { top?: number; bottom?: number };
  fvg: { filled: boolean; top?: number; bottom?: number };
  liquidity_sweep: { detected: boolean; side?: Direction };
  confidence: number; // 0–100
  rationale: string;
}

// 風控規則參數
export interface RiskParams {
  riskPctPerTrade: number; // 預設 0.01
  maxOpenPositions: number; // 預設 3
  dailyLossHaltPct: number; // 預設 0.03
  kellyMultiplier: number; // 預設 0.25
  winRateDefault: number; // 預設 0.50
  avgRrDefault: number; // 預設 1.5
  minConfidence: number; // 預設 60
  minRR: number; // 預設 2.0
}
