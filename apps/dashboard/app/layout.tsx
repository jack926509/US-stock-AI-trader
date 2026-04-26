import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "美股 AI 自動化交易系統",
  description: "Paper Trading Dashboard",
};

const tabs = [
  { href: "/positions", label: "即時持倉" },
  { href: "/pnl", label: "每日 P&L" },
  { href: "/signals", label: "訊號歷史" },
  { href: "/backtest", label: "回測績效" },
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <h1 className="text-lg font-semibold">美股 AI 自動化交易系統</h1>
            <nav className="mt-3 flex gap-4 text-sm">
              {tabs.map((t) => (
                <Link key={t.href} href={t.href} className="text-gray-600 hover:text-gray-900">
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
