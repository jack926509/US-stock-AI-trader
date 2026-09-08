"use client"

import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error)
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-[#faf6f1] p-8 ring-1 ring-black/[0.08]">
          <p className="text-sm text-stone-500">此區塊載入失敗，請重新整理頁面。</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="rounded-lg px-3 py-1.5 text-xs text-stone-600 ring-1 ring-black/[0.1] hover:bg-black/5 transition-colors"
          >
            重試
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
