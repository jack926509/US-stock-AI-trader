'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/positions', label: '即時持倉' },
  { href: '/pnl', label: '每日 P&L' },
  { href: '/signals', label: '訊號歷史' },
  { href: '/backtest', label: '回測績效' },
];

export function TabNav() {
  const pathname = usePathname();
  return (
    <nav className="flex border-b border-gray-700">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              active
                ? 'border-b-2 border-blue-400 text-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
