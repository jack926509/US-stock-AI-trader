import type { Metadata } from "next"
import { Geist, Geist_Mono, JetBrains_Mono, Noto_Sans_TC, Source_Serif_4, Noto_Serif_TC } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

// Claude Design 標題字體 — Source Serif 4（英數）+ Noto Serif TC（中文）
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

export const metadata: Metadata = {
  title: "US Stock Analyzer",
  description: "美股分析系統 — 財報、AI 分析、華爾街視角",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} ${notoSansTC.variable} ${sourceSerif.variable} ${notoSerifTC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
