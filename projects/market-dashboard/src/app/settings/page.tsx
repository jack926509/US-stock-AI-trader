import type { Metadata } from "next"
import { SettingsView } from "@/components/settings/SettingsView"

export const metadata: Metadata = {
  title: "設定 · US Stock Analyzer",
  description: "主題、資料備份、本機儲存管理",
}

export default function SettingsPage() {
  return <SettingsView />
}
