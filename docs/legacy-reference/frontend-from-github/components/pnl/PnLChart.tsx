'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { DailyStats } from '@/types';

interface Props {
  history: DailyStats[];
}

export function PnLChart({ history }: Props) {
  const data = [...history].reverse().map((d) => ({
    date: d.date.slice(5), // MM-DD
    pnl: parseFloat(d.realized_pnl.toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} width={60}
          tickFormatter={(v) => `$${v}`} />
        <Tooltip
          contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6 }}
          labelStyle={{ color: '#9ca3af' }}
          formatter={(v) => [`$${Number(v).toFixed(2)}`, 'P&L']}
        />
        <ReferenceLine y={0} stroke="#374151" />
        <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.pnl >= 0 ? '#22c55e' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
