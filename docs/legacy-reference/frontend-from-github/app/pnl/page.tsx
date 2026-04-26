'use client';
import { usePolling } from '@/hooks/usePolling';
import { api } from '@/lib/apiClient';
import { PnLChart } from '@/components/pnl/PnLChart';

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pnlColor(v: number) {
  if (v > 0) return 'text-green-400';
  if (v < 0) return 'text-red-400';
  return 'text-gray-300';
}

export default function PnLPage() {
  const { data: today, loading } = usePolling(() => api.getDailyPnl(), 30_000);
  const { data: history } = usePolling(() => api.getPnlHistory(30), 60_000);

  const winRate = today && today.trades_taken > 0
    ? ((today.trades_won / today.trades_taken) * 100).toFixed(1)
    : '—';

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">每日 P&amp;L</h1>

      {/* Today summary */}
      {today?.daily_stop_hit === 1 && (
        <div className="bg-red-900/40 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm font-semibold">
          🛑 今日已達最大虧損限制（3%），交易暫停至明日
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '今日已實現損益', value: today ? `${today.realized_pnl >= 0 ? '+' : ''}$${fmt(today.realized_pnl)}` : '—', color: today ? pnlColor(today.realized_pnl) : 'text-gray-300' },
          { label: '未實現損益', value: today ? `${today.unrealized_pnl >= 0 ? '+' : ''}$${fmt(today.unrealized_pnl)}` : '—', color: today ? pnlColor(today.unrealized_pnl) : 'text-gray-300' },
          { label: '今日交易次數', value: today?.trades_taken ?? '—', color: 'text-white' },
          { label: '勝率', value: winRate === '—' ? '—' : `${winRate}%`, color: 'text-white' },
        ].map((card) => (
          <div key={card.label} className="bg-gray-900 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">{card.label}</div>
            <div className={`text-2xl font-bold font-mono ${card.color}`}>{loading && !today ? '...' : String(card.value)}</div>
          </div>
        ))}
      </div>

      {/* 30-day chart */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="text-gray-400 text-sm mb-4">近 30 日每日損益</div>
        {history && history.length > 0 ? (
          <PnLChart history={history} />
        ) : (
          <div className="text-gray-600 text-center py-12">尚無歷史資料</div>
        )}
      </div>

      {/* History table */}
      {history && history.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-4">日報表</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="pb-2 pr-4">日期</th>
                <th className="pb-2 pr-4 text-right">起始淨值</th>
                <th className="pb-2 pr-4 text-right">已實現</th>
                <th className="pb-2 pr-4 text-right">交易</th>
                <th className="pb-2 text-right">勝率</th>
              </tr>
            </thead>
            <tbody>
              {history.map((d) => (
                <tr key={d.date} className="border-b border-gray-800/40 hover:bg-gray-800/30">
                  <td className="py-2 pr-4 text-gray-300">{d.date}</td>
                  <td className="py-2 pr-4 text-right font-mono">${fmt(d.starting_equity)}</td>
                  <td className={`py-2 pr-4 text-right font-mono ${pnlColor(d.realized_pnl)}`}>
                    {d.realized_pnl >= 0 ? '+' : ''}${fmt(d.realized_pnl)}
                  </td>
                  <td className="py-2 pr-4 text-right">{d.trades_taken}</td>
                  <td className="py-2 text-right">
                    {d.trades_taken > 0 ? `${((d.trades_won / d.trades_taken) * 100).toFixed(0)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
