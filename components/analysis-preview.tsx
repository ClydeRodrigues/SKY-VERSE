"use client"

import { ArrowLeft, Download, Save } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { AnalysisResult } from "@/types"
import { saveObservation } from "@/lib/storage"
import StarFieldCanvas from "./star-field-canvas"
import AnalysisCharts from "./analysis-charts"

interface AnalysisPreviewProps {
  analysis: AnalysisResult
  originalImage: string | null
  onNewAnalysis: () => void
}

export default function AnalysisPreview({ analysis, originalImage, onNewAnalysis }: AnalysisPreviewProps) {
  const router = useRouter()
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const [isSavingToArchive, setIsSavingToArchive] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true)
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis,
          originalImage,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error("PDF generation failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `skyverse-report-${Date.now()}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading PDF:", error)
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  const handleSaveToArchive = async () => {
    setIsSavingToArchive(true)
    try {
      const observationId = `OBS-${Date.now()}`
      saveObservation({
        id: observationId,
        timestamp: analysis.timestamp || new Date().toISOString(),
        originalImageBase64: originalImage || undefined,
        analysis,
      })

      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        // Optionally navigate to the new report
        router.push(`/report/${observationId}`)
      }, 1500)
    } catch (error) {
      console.error("Error saving to archive:", error)
    } finally {
      setIsSavingToArchive(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1e] px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#e8e8f0]">Analysis Results</h1>
            <p className="text-xs text-[#a0a0b0] mt-1">
              {analysis.timestamp ? new Date(analysis.timestamp).toLocaleString() : ""}
            </p>
          </div>
          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-2 rounded-lg bg-[#1a1a2e] px-4 py-2 text-[#a0a0b0] hover:text-[#00d9ff] transition-colors"
          >
            <ArrowLeft size={16} />
            New Analysis
          </button>
        </div>

        {/* Image Comparison */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
          {originalImage && (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#a0a0b0]">
                Original Image
              </label>
              <div className="overflow-hidden rounded-lg border border-[#3a3a4f]">
                <img
                  src={originalImage || "/placeholder.svg"}
                  alt="Original"
                  className="h-auto w-full object-cover max-h-96"
                />
              </div>
            </div>
          )}

          <div className="h-[min(60vh,40rem)] w-full">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#a0a0b0]">
              Star Field Visualization
            </label>
            {analysis.stars && analysis.constellations && (
              <StarFieldCanvas analysis={analysis} showHeatmap={false} showConstellations={true} />
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a0a0b0]">Total Stars</p>
            <p className="text-2xl font-bold text-[#00d9ff]">{analysis.starCount || 0}</p>
          </div>

          <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a0a0b0]">Clusters</p>
            <p className="text-2xl font-bold text-[#00d9ff]">{analysis.clusterCount || 0}</p>
          </div>

          <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a0a0b0]">Anomalies</p>
            <p className="text-2xl font-bold text-[#ff6b6b]">{analysis.anomalyCount || 0}</p>
          </div>

          <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a0a0b0]">Discovery Score</p>
            <p className="text-2xl font-bold text-[#51cf66]">{analysis.discoveryScore || 0}%</p>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8 rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#a0a0b0]">Observation Summary</h2>
          <p className="text-sm leading-relaxed text-[#a0a0b0]">
            {analysis.summary || "Analysis complete. Review detailed data and visualizations below."}
          </p>
        </div>

        {analysis.stars && (
          <div className="mb-8">
            <h2 className="mb-6 text-lg font-semibold text-[#e8e8f0]">Detailed Analysis</h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-stretch">
              <div className="h-[min(60vh,40rem)] w-full">
                <AnalysisCharts analysis={analysis} />
              </div>
              <div className="hidden lg:block" />
            </div>
          </div>
        )}

        {/* Success Message */}
        {saveSuccess && (
          <div className="fixed top-4 right-4 rounded-lg bg-[#51cf66] text-[#0f0f1e] px-6 py-3 font-semibold flex items-center gap-2 animate-pulse">
            <Save size={18} />
            Observation saved to archive!
          </div>
        )}

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleSaveToArchive}
            disabled={isSavingToArchive || saveSuccess}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#51cf66] px-6 py-3 font-semibold text-[#0f0f1e] hover:bg-[#40c057] disabled:opacity-50 transition-colors"
          >
            <Save size={18} />
            {isSavingToArchive ? "Saving..." : saveSuccess ? "Saved!" : "Save to Archive"}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF}
            className="flex items-center justify-center gap-2 rounded-lg border border-[#3a3a4f] px-6 py-3 font-semibold text-[#a0a0b0] hover:border-[#00d9ff] hover:text-[#00d9ff] disabled:opacity-50 transition-colors"
          >
            <Download size={18} />
            {isDownloadingPDF ? "Generating..." : "Download Report"}
          </button>
        </div>
      </div>
    </div>
  )
}
