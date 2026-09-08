'use client';
import { useState } from 'react';
import { usePolling } from '@/hooks/usePolling';
import { api } from '@/lib/apiClient';

function fmt(n: number, digits = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function pnlColor(v: number) {
  if (v > 0) return 'text-green-400';
  if (v < 0) return 'text-red-400';
  return 'text-gray-300';
}

export default function BacktestPage() {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString().split('T')[0];

  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);

  const { data: stats, loading } = usePolling(
    () => api.getBacktest(from, to),
    120_000,
    [from, to]
  );

  const metrics = [
    { label: '總交易次數', value: stats?.totalTrades ?? '—', color: 'text-white' },
    { label: '勝率', value: stats ? `${(stats.winRate * 100).toFixed(1)}%` : '—', color: 'text-white' },
    { label: '平均 R:R', value: stats ? stats.avgRR.toFixed(2) : '—', color: 'text-blue-300' },
    { label: '總損益', value: stats ? `${stats.totalPnl >= 0 ? '+' : ''}$${fmt(stats.totalPnl)}` : '—', color: stats ? pnlColor(stats.totalPnl) : 'text-white' },
    { label: '最大虧損', value: stats ? `-$${fmt(stats.maxDrawdown)}` : '—', color: 'text-red-400' },
    { label: '最佳交易', value: stats ? `+$${fmt(stats.bestTrade)}` : '—', color: 'text-green-400' },
    { label: '最差交易', value: stats ? `-$${fmt(Math.abs(stats.worstTrade))}` : '—', color: 'text-red-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-xl font-bold text-white">回測績效統計</h1>
        <div className="flex items-center gap-3 text-sm">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-gray-200 text-sm"
          />
          <span className="text-gray-500">至</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-gray-200 text-sm"
          />
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-gray-900 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">{m.label}</div>
            <div className={`text-2xl font-bold font-mono ${m.color}`}>
              {loading && !stats ? '...' : String(m.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Trade results table */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="text-gray-400 text-sm mb-4">逐筆交易記錄</div>
        {loading && !stats && <div className="text-gray-500 text-center py-8">載入中...</div>}
        {stats && stats.totalTrades === 0 && (
          <div className="text-gray-600 text-center py-8">所選期間無交易記錄</div>
        )}
        {stats && stats.trades.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="pb-3 pr-4">股票</th>
                  <th className="pb-3 pr-4">方向</th>
                  <th className="pb-3 pr-4 text-right">進場</th>
                  <th className="pb-3 pr-4 text-right">出場</th>
                  <th className="pb-3 pr-4 text-right">持倉量</th>
                  <th className="pb-3 pr-4 text-right">損益</th>
                  <th className="pb-3 pr-4 text-right">報酬率</th>
                  <th className="pb-3 pr-4 text-right">實際 R:R</th>
                  <th className="pb-3 text-right">結算時間</th>
                </tr>
              </thead>
              <tbody>
                {stats.trades.map((t) => (
                  <tr key={t.id} className="border-b border-gray-800/40 hover:bg-gray-800/30">
                    <td className="py-2 pr-4 font-bold text-white">{t.ticker}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs font-semibold ${t.action === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right font-mono">${fmt(t.entry_price)}</td>
                    <td className="py-2 pr-4 text-right font-mono">${fmt(t.exit_price)}</td>
                    <td className="py-2 pr-4 text-right font-mono">{t.qty}</td>
                    <td className={`py-2 pr-4 text-right font-mono ${pnlColor(t.pnl)}`}>
                      {t.pnl >= 0 ? '+' : ''}${fmt(t.pnl)}
                    </td>
                    <td className={`py-2 pr-4 text-right font-mono ${pnlColor(t.pnl_pct)}`}>
                      {(t.pnl_pct * 100).toFixed(2)}%
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-blue-300">{t.rr_achieved.toFixed(2)}</td>
                    <td className="py-2 text-right text-gray-400 text-xs">
                      {new Date(t.closed_at).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
