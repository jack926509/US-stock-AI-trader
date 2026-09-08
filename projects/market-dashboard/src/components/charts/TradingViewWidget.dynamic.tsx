import dynamic from "next/dynamic"
import { TradingViewSkeleton } from "./TradingViewSkeleton"

export const TradingViewWidget = dynamic(() => import("./TradingViewWidget"), {
  ssr: false,
  loading: () => <TradingViewSkeleton height={500} />,
})
