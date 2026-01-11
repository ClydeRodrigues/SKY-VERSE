"use client"

import { useState, useEffect } from "react"
import { Archive } from "lucide-react"
import Navigation from "@/components/navigation"
import ObservationCard from "@/components/observation-card"
import { getObservations, deleteObservation } from "@/lib/storage"
import type { SavedObservation } from "@/types"

export default function ReportsPage() {
  const [observations, setObservations] = useState<SavedObservation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load observations from localStorage
    const loaded = getObservations()
    setObservations(loaded)
    setIsLoading(false)
  }, [])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this observation?")) {
      deleteObservation(id)
      setObservations(observations.filter((o) => o.id !== id))
    }
  }

  const handleDownloadPDF = async (observation: SavedObservation) => {
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis: observation.analysis,
          originalImage: observation.originalImageBase64,
          timestamp: observation.timestamp,
          observationId: observation.id,
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

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#0f0f1e] px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <Archive size={32} className="text-[#00d9ff]" />
              <h1 className="text-4xl font-bold text-[#e8e8f0]">Observation Reports Archive</h1>
            </div>
            <p className="text-[#a0a0b0]">
              Browse and manage your celestial analysis observations. Each report contains detailed stellar metrics,
              visualizations, and constellation identifications.
            </p>
          </div>

          {/* Reports Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-[#a0a0b0]">Loading archive...</p>
            </div>
          ) : observations.length === 0 ? (
            <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] p-12 text-center">
              <Archive size={48} className="mx-auto text-[#a0a0b0] mb-4 opacity-50" />
              <p className="text-[#e8e8f0] font-semibold mb-2">No Observations Yet</p>
              <p className="text-[#a0a0b0]">
                Upload and analyze a celestial image to create your first observation report.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {observations.map((observation) => (
                <ObservationCard
                  key={observation.id}
                  observation={observation}
                  onDelete={handleDelete}
                  onDownloadPDF={handleDownloadPDF}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
