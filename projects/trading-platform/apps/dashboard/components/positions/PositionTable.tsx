"use client";
import { Position } from "@/types";
import { api } from "@/lib/apiClient";
import { useState } from "react";

interface Props {
  positions: Position[];
  onClose: () => void;
}

function pnlColor(val: number) {
  if (val > 0) return "text-green-400";
  if (val < 0) return "text-red-400";
  return "text-gray-400";
}

function fmt(n: number, digits = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function PositionTable({ positions, onClose }: Props) {
  const [closing, setClosing] = useState<string | null>(null);

  async function handleClose(symbol: string) {
    if (!confirm(`確認平倉 ${symbol}？`)) return;
    setClosing(symbol);
    try {
      await api.closePosition(symbol);
      onClose();
    } catch (e) {
      alert(`平倉失敗: ${e instanceof Error ? e.message : e}`);
    } finally {
      setClosing(null);
    }
  }

  if (positions.length === 0) {
    return <div className="text-center py-16 text-gray-500">目前無持倉</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-left">
            <th className="pb-3 pr-4">股票</th>
            <th className="pb-3 pr-4">方向</th>
            <th className="pb-3 pr-4 text-right">持倉量</th>
            <th className="pb-3 pr-4 text-right">均價</th>
            <th className="pb-3 pr-4 text-right">現價</th>
            <th className="pb-3 pr-4 text-right">市值</th>
            <th className="pb-3 pr-4 text-right">未實現損益</th>
            <th className="pb-3 text-right">報酬率</th>
            <th className="pb-3"></th>
          </tr>
        </thead>
        <tbody>
          {positions.map((p) => (
            <tr key={p.symbol} className="border-b border-gray-800/50 hover:bg-gray-900/40">
              <td className="py-3 pr-4 font-bold text-white">{p.symbol}</td>
              <td className="py-3 pr-4">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    p.side === "long" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                  }`}
                >
                  {p.side === "long" ? "LONG" : "SHORT"}
                </span>
              </td>
              <td className="py-3 pr-4 text-right font-mono">{p.qty}</td>
              <td className="py-3 pr-4 text-right font-mono">${fmt(p.avgEntryPrice)}</td>
              <td className="py-3 pr-4 text-right font-mono">${fmt(p.currentPrice)}</td>
              <td className="py-3 pr-4 text-right font-mono">${fmt(p.marketValue)}</td>
              <td className={`py-3 pr-4 text-right font-mono ${pnlColor(p.unrealizedPl)}`}>
                {p.unrealizedPl >= 0 ? "+" : ""}${fmt(p.unrealizedPl)}
              </td>
              <td className={`py-3 text-right font-mono ${pnlColor(p.unrealizedPlPct)}`}>
                {(p.unrealizedPlPct * 100).toFixed(2)}%
              </td>
              <td className="py-3 pl-4">
                <button
                  onClick={() => handleClose(p.symbol)}
                  disabled={closing === p.symbol}
                  className="text-xs px-3 py-1 rounded border border-red-800 text-red-400 hover:bg-red-900/40 disabled:opacity-40 transition-colors"
                >
                  {closing === p.symbol ? "..." : "平倉"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
