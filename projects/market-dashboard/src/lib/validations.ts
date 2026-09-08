/**
 * 驗證股票代碼格式：
 * - 標準格式：1-5 個大寫英文字母（AAPL、META、SPY）
 * - 含後綴格式：主體 + 點 + 1-2 個大寫字母（BRK.B、BF.A）
 * 所有接受 symbol 參數的 API Route 必須先呼叫此函式
 */
export function validateSymbol(symbol: unknown): symbol is string {
  if (typeof symbol !== "string") return false
  return /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/.test(symbol)
}
