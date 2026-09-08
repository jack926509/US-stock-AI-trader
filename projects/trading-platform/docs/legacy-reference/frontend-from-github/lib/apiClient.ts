const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${path} returned ${res.status}`);
  return res.json();
}

export const api = {
  getPositions: () => apiFetch<import('@/types').Position[]>('/api/positions'),
  getSignals: (limit = 100, status?: string) =>
    apiFetch<import('@/types').Signal[]>(`/api/signals?limit=${limit}${status ? `&status=${status}` : ''}`),
  getSignal: (id: string) => apiFetch<import('@/types').Signal>(`/api/signals/${id}`),
  getDailyPnl: (date?: string) =>
    apiFetch<import('@/types').DailyStats>(`/api/pnl/daily${date ? `?date=${date}` : ''}`),
  getPnlHistory: (days = 30) => apiFetch<import('@/types').DailyStats[]>(`/api/pnl/history?days=${days}`),
  getAccount: () => apiFetch<import('@/types').Account>('/api/account'),
  getHealth: () => apiFetch<{ status: string; marketOpen: boolean; timestamp: string }>('/api/health'),
  getBacktest: (from?: string, to?: string) =>
    apiFetch<import('@/types').BacktestStats>(`/api/backtest${from && to ? `?from=${from}&to=${to}` : ''}`),
  closePosition: (symbol: string) =>
    fetch(`${BASE_URL}/api/positions/${symbol}`, { method: 'DELETE' }).then((r) => r.json()),
};
