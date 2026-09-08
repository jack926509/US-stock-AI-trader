'use client';
import { useState } from 'react';
import { usePolling } from '@/hooks/usePolling';
import { api } from '@/lib/apiClient';
import { Signal } from '@/types';
import { SignalTypeBadge, StatusBadge } from '@/components/signals/SignalBadge';

function SignalRow({ signal }: { signal: Signal }) {
  const [expanded, setExpanded] = useState(false);
  const indicators = signal.python_indicators ? JSON.parse(signal.python_indicators) : null;

  return (
    <>
      <tr
        className="border-b border-gray-800/50 hover:bg-gray-900/50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-3 pr-3 font-bold text-white">{signal.ticker}</td>
        <td className="py-3 pr-3">
          <span className={`text-xs font-semibold ${signal.action === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
            {signal.action.toUpperCase()}
          </span>
        </td>
        <td className="py-3 pr-3"><SignalTypeBadge type={signal.signal_type} /></td>
        <td className="py-3 pr-3 text-gray-400 text-xs">{signal.timeframe}</td>
        <td className="py-3 pr-3 font-mono text-right">${signal.entry_price.toFixed(2)}</td>
        <td className="py-3 pr-3 font-mono text-right text-blue-300">{signal.rr_ratio.toFixed(2)}</td>
        <td className="py-3 pr-3 text-right">
          {signal.python_confidence !== null
            ? <span className="text-xs font-mono">{(signal.python_confidence * 100).toFixed(0)}%</span>
            : <span className="text-gray-600 text-xs">—</span>}
        </td>
        <td className="py-3 pr-3"><StatusBadge status={signal.status} /></td>
        <td className="py-3 text-right text-gray-500 text-xs">
          {new Date(signal.received_at).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </td>
        <td className="py-3 pl-2 text-gray-600">{expanded ? '▲' : '▼'}</td>
      </tr>

      {expanded && (
        <tr className="bg-gray-900/60">
          <td colSpan={10} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-gray-400 font-semibold mb-2">風控參數</div>
                <div className="space-y-1 text-gray-300">
                  <div>進場: <span className="font-mono">${signal.entry_price.toFixed(2)}</span></div>
                  <div>止損: <span className="font-mono text-red-400">${signal.stop_loss.toFixed(2)}</span></div>
                  <div>止盈: <span className="font-mono text-green-400">${signal.take_profit.toFixed(2)}</span></div>
                  <div>R:R: <span className="font-mono">{signal.rr_ratio.toFixed(2)}</span></div>
                  {signal.rejection_reason && (
                    <div className="text-orange-400">拒絕原因: {signal.rejection_reason}</div>
                  )}
                </div>
              </div>

              {indicators && (
                <div>
                  <div className="text-gray-400 font-semibold mb-2">技術指標（Python）</div>
                  <div className="space-y-1 text-gray-300">
                    <div>MA 趨勢: <span className="font-mono">{indicators.ma_trend}</span></div>
                    <div>RSI: <span className="font-mono">{indicators.rsi_value} ({indicators.rsi_zone})</span></div>
                    <div>MACD 交叉: <span className="font-mono">{indicators.macd_cross}</span></div>
                  </div>
                </div>
              )}

              {signal.claude_analysis && (
                <div className="md:col-span-2">
                  <div className="text-gray-400 font-semibold mb-2">Claude SMC 分析</div>
                  <div className="text-gray-300 leading-relaxed">{signal.claude_analysis}</div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const STATUS_FILTERS = [
  { value: '', label: '全部' },
  { value: 'ordered', label: '已下單' },
  { value: 'validated', label: '已驗證' },
  { value: 'rejected', label: '已拒絕' },
  { value: 'skipped_risk', label: '風控拒絕' },
];

export default function SignalsPage() {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: signals, loading, refresh } = usePolling(
    () => api.getSignals(200, statusFilter || undefined),
    30_000,
    [statusFilter]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-xl font-bold text-white">訊號歷史</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button onClick={refresh} className="text-blue-400 text-sm hover:text-blue-300">刷新</button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        {loading && !signals && <div className="text-gray-500 text-center py-8">載入中...</div>}
        {signals && signals.length === 0 && (
          <div className="text-gray-500 text-center py-8">尚無訊號記錄</div>
        )}
        {signals && signals.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="pb-3 pr-3">股票</th>
                  <th className="pb-3 pr-3">方向</th>
                  <th className="pb-3 pr-3">類型</th>
                  <th className="pb-3 pr-3">時框</th>
                  <th className="pb-3 pr-3 text-right">進場</th>
                  <th className="pb-3 pr-3 text-right">R:R</th>
                  <th className="pb-3 pr-3 text-right">信心度</th>
                  <th className="pb-3 pr-3">狀態</th>
                  <th className="pb-3 text-right">時間</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {signals.map((s) => <SignalRow key={s.id} signal={s} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
