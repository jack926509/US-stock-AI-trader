import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { TabNav } from '@/components/layout/TabNav';

const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'US Stock AI Trader',
  description: 'Automated trading dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className={mono.variable}>
      <body className="bg-gray-950 text-gray-100 min-h-screen font-mono antialiased">
        <Navbar />
        <TabNav />
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
