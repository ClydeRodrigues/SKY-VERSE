"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import StarFieldCanvas, { StarFieldCanvasHandle } from "@/components/star-field-canvas"
import AnalysisCharts from "@/components/analysis-charts"
import { useRef } from "react"
import { getObservation } from "@/lib/storage"
import type { SavedObservation } from "@/types"

function DetailedReportContent() {
  const params = useParams()
  const id = params.id as string
  const [observation, setObservation] = useState<SavedObservation | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const chartsRef = useRef<any>(null)
  const starFieldRef = useRef<StarFieldCanvasHandle>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const loaded = getObservation(id)
    if (!loaded) {
      setError("This observation report could not be loaded. Please verify archive integrity.")
      setIsLoading(false)
      return
    }
    setObservation(loaded)
    setIsLoading(false)
  }, [id])

  const handleDownloadPDF = async () => {
    if (!observation) return

    // Export chart images
    let chartImages: { title: string; image: string }[] = []
    if (chartsRef.current && chartsRef.current.exportCharts) {
      chartImages = chartsRef.current.exportCharts()
    }
    // Export star field image
    let starFieldImage: string | null = null
    if (starFieldRef.current && starFieldRef.current.exportImage) {
      starFieldImage = starFieldRef.current.exportImage()
    }
    if (starFieldImage) {
      chartImages.unshift({ title: 'Star Field Visualization', image: starFieldImage })
    }

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis: observation.analysis,
          originalImage: observation.originalImageBase64,
          timestamp: observation.timestamp,
          observationId: observation.id,
          charts: chartImages,
        }),
      })

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `skyverse-observation-${observation.id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download PDF:", error)
      alert("Failed to generate PDF report")
    }
  }

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-[#0f0f1e] flex items-center justify-center">
          <p className="text-[#a0a0b0]">Loading observation...</p>
        </div>
      </>
    )
  }

  if (error || !observation) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-[#0f0f1e] px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 text-[#00d9ff] hover:text-[#00b8d4] mb-8 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Archive
            </Link>
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-8 text-center">
              <p className="text-red-400 font-semibold">{error}</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#0f0f1e] px-2 py-8">
        <div className="max-w-screen-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 text-[#00d9ff] hover:text-[#00b8d4] mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Archive
            </Link>

            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="text-xs font-semibold text-[#00d9ff] uppercase tracking-wider mb-2">
                  Observation {observation.id.substring(0, 8)}
                </p>
                <h1 className="text-3xl font-bold text-[#e8e8f0]">Celestial Observation Report</h1>
                <p className="text-[#a0a0b0] mt-2">{new Date(observation.timestamp).toLocaleString()}</p>
              </div>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 rounded-lg bg-[#00d9ff] px-4 py-3 text-[#0f0f1e] font-semibold hover:bg-[#00b8d4] transition-colors"
              >
                <Download size={20} />
                Download PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-8">
              {/* Original Image */}
              {observation.originalImageBase64 && (
                <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] overflow-hidden">
                  <div className="p-4 border-b border-[#3a3a4f]">
                    <p className="text-sm font-semibold text-[#e8e8f0]">Original Image</p>
                  </div>
                  <div className="p-4 bg-[#0f0f1e] flex items-center justify-center max-h-96">
                    <img
                      src={observation.originalImageBase64 || "/placeholder.svg"}
                      alt="Original observation"
                      className="max-w-full max-h-full rounded"
                    />
                  </div>
                </div>
              )}

              {/* Star Field Visualization */}
              <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] overflow-hidden" style={{minHeight:'480px'}}>
                <div className="p-4 border-b border-[#3a3a4f]">
                  <p className="text-sm font-semibold text-[#e8e8f0]">Star Field with Constellation Map</p>
                </div>
                <div className="p-4 bg-[#0f0f1e]">
                  <StarFieldCanvas ref={starFieldRef} analysis={observation.analysis} showHeatmap={true} showConstellations={true} />
                </div>
              </div>

              {/* Charts */}
              <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] overflow-hidden" style={{minHeight:'480px'}}>
                <div className="p-4 border-b border-[#3a3a4f]">
                  <p className="text-sm font-semibold text-[#e8e8f0]">Analysis Metrics</p>
                </div>
                <div className="p-6 bg-[#0f0f1e]">
                  <AnalysisCharts ref={chartsRef} analysis={observation.analysis} />
                </div>
              </div>

              {/* Analysis Summary */}
              <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] overflow-hidden" style={{minHeight:'480px'}}>
                <div className="p-4 border-b border-[#3a3a4f]">
                  <p className="text-sm font-semibold text-[#e8e8f0]">Observation Summary</p>
                </div>
                <div className="p-6 bg-[#0f0f1e]">
                  <p className="text-[#a0a0b0] leading-relaxed mb-4">{observation.analysis.summary}</p>

                  {observation.analysis.constellations && observation.analysis.constellations.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-[#00d9ff] mb-2 uppercase tracking-wide">
                        Detected Constellations
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {observation.analysis.constellations.map((c) => (
                          <span
                            key={c.name}
                            className="px-3 py-1 rounded-full bg-[#00d9ff]/10 text-[#00d9ff] text-sm font-medium"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - PDF Preview & Key Metrics */}
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] overflow-hidden">
                <div className="p-4 border-b border-[#3a3a4f]">
                  <p className="text-sm font-semibold text-[#e8e8f0]">Key Metrics</p>
                </div>
                <div className="p-6 bg-[#0f0f1e] space-y-6">
                  <div>
                    <p className="text-xs text-[#a0a0b0] mb-1 uppercase tracking-wide">Stars Detected</p>
                    <p className="text-3xl font-bold text-[#00d9ff]">{observation.analysis.starCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#a0a0b0] mb-1 uppercase tracking-wide">Discovery Score</p>
                    <p className="text-3xl font-bold text-[#51cf66]">{observation.analysis.discoveryScore}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#a0a0b0] mb-1 uppercase tracking-wide">Clusters Found</p>
                    <p className="text-3xl font-bold text-[#ffa94d]">{observation.analysis.clusterCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#a0a0b0] mb-1 uppercase tracking-wide">Anomalies</p>
                    <p className="text-3xl font-bold text-[#ff7675]">{observation.analysis.anomalyCount}</p>
                  </div>
                </div>
              </div>

              {/* Observation Metadata */}
              <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] overflow-hidden">
                <div className="p-4 border-b border-[#3a3a4f]">
                  <p className="text-sm font-semibold text-[#e8e8f0]">Metadata</p>
                </div>
                <div className="p-4 bg-[#0f0f1e] space-y-3 text-sm">
                  <div>
                    <p className="text-[#a0a0b0] text-xs uppercase tracking-wide mb-1">Observation ID</p>
                    <p className="text-[#e8e8f0] font-mono text-xs break-all">{observation.id}</p>
                  </div>
                  <div>
                    <p className="text-[#a0a0b0] text-xs uppercase tracking-wide mb-1">Created</p>
                    <p className="text-[#e8e8f0]">{new Date(observation.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function DetailedReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f1e]" />}>
      <DetailedReportContent />
    </Suspense>
  )
}
