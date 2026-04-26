'use client';
import { usePolling } from '@/hooks/usePolling';
import { api } from '@/lib/apiClient';
import { PositionTable } from '@/components/positions/PositionTable';

export default function PositionsPage() {
  const { data: positions, loading, error, refresh } = usePolling(
    () => api.getPositions(),
    15_000
  );

  const totalPnl = positions?.reduce((s, p) => s + p.unrealizedPl, 0) ?? 0;
  const totalValue = positions?.reduce((s, p) => s + p.marketValue, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">即時持倉</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>每 15 秒自動刷新</span>
          <button onClick={refresh} className="text-blue-400 hover:text-blue-300">手動刷新</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">持倉數量</div>
          <div className="text-2xl font-bold text-white">{positions?.length ?? 0} / 5</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">總市值</div>
          <div className="text-2xl font-bold font-mono text-white">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">未實現損益</div>
          <div className={`text-2xl font-bold font-mono ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg p-6">
        {loading && !positions && <div className="text-gray-500 text-center py-8">載入中...</div>}
        {error && <div className="text-red-400 text-center py-8">無法連線到後端: {error}</div>}
        {positions && <PositionTable positions={positions} onClose={refresh} />}
      </div>
    </div>
  );
}
