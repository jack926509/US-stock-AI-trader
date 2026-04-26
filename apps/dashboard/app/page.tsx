import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">歡迎</h2>
      <p className="text-gray-600">請從上方頁籤選擇要查看的內容。</p>
      <p className="text-sm text-gray-500">
        目前處於 <span className="font-mono">Phase 0</span>—環境與骨架。
        各頁籤實作將在 Phase 3 完成；下方連結先建好路由。
      </p>
      <ul className="list-disc pl-6 text-sm">
        <li><Link href="/positions" className="text-blue-600 hover:underline">即時持倉</Link></li>
        <li><Link href="/pnl" className="text-blue-600 hover:underline">每日 P&L</Link></li>
        <li><Link href="/signals" className="text-blue-600 hover:underline">訊號歷史</Link></li>
        <li><Link href="/backtest" className="text-blue-600 hover:underline">回測績效</Link></li>
      </ul>
    </div>
  );
}
