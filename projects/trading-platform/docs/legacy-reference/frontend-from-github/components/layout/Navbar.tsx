'use client';
import { usePolling } from '@/hooks/usePolling';
import { api } from '@/lib/apiClient';

export function Navbar() {
  const { data: account } = usePolling(() => api.getAccount(), 30_000);
  const { data: health } = usePolling(() => api.getHealth(), 15_000);

  const marketOpen = health?.marketOpen ?? false;
  const equity = account?.equity ?? 0;
  const dailyStopHit = account?.dailyStopHit ?? false;

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-white font-bold text-lg">US Stock AI Trader</span>
        <span className="text-xs text-gray-500">Paper Trading</span>
      </div>

      <div className="flex items-center gap-6 text-sm">
        {dailyStopHit && (
          <span className="bg-red-900 text-red-300 px-3 py-1 rounded text-xs font-semibold">
            日損停止
          </span>
        )}
        <div className="text-right">
          <div className="text-gray-400 text-xs">帳戶淨值</div>
          <div className="text-white font-mono font-semibold">
            ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${marketOpen ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}
          />
          <span className={marketOpen ? 'text-green-400' : 'text-gray-500'}>
            {marketOpen ? '市場開盤' : '市場休市'}
          </span>
        </div>
      </div>
    </header>
  );
}
