import dynamic from "next/dynamic"
import { TradingViewSkeleton } from "./TradingViewSkeleton"

export const TradingViewTechAnalysis = dynamic(() => import("./TradingViewTechAnalysis"), {
  ssr: false,
  loading: () => <TradingViewSkeleton height={425} />,
})
