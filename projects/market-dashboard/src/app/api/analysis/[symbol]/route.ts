// 目前版本只提供可重現的規則策略；即使環境誤設模型金鑰也不會外呼。
export async function POST() {
  return Response.json({ error: "AI 分析未啟用", code: "FEATURE_DISABLED" }, { status: 410 })
}
