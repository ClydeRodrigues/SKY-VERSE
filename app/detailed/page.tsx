import { Suspense } from "react"
import Navigation from "@/components/navigation"
import DetailedAnalysisContent from "@/components/detailed-analysis-content"

export default function DetailedAnalysisPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#0f0f1e] px-4 py-8">
        <Suspense fallback={<div className="text-center py-8 text-[#a0a0b0]">Loading...</div>}>
          <DetailedAnalysisContent />
        </Suspense>
      </div>
    </>
  )
}
