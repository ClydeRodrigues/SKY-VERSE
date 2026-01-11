"use client"

import type { SavedObservation } from "@/types"
import { Eye, Download, Trash2 } from "lucide-react"
import Link from "next/link"

interface ObservationCardProps {
  observation: SavedObservation
  onDelete: (id: string) => void
  onDownloadPDF: (observation: SavedObservation) => void
}

export default function ObservationCard({ observation, onDelete, onDownloadPDF }: ObservationCardProps) {
  const date = new Date(observation.timestamp)
  const formattedDate = date.toLocaleDateString()
  const formattedTime = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] overflow-hidden hover:border-[#00d9ff] transition-colors">
      {/* Image Thumbnail */}
      {observation.originalImageBase64 && (
        <div className="w-full h-32 bg-[#0f0f1e] overflow-hidden flex items-center justify-center">
          <img
            src={observation.originalImageBase64 || "/placeholder.svg"}
            alt="Observation thumbnail"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#00d9ff] uppercase tracking-wider mb-2">
              Observation {observation.id.substring(0, 8)}
            </p>
            <p className="text-sm text-[#a0a0b0]">
              {formattedDate} at {formattedTime}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-t border-b border-[#3a3a4f]">
          <div>
            <p className="text-xs text-[#a0a0b0] mb-1 uppercase tracking-wide">Stars Detected</p>
            <p className="text-2xl font-bold text-[#00d9ff]">{observation.analysis.starCount}</p>
          </div>
          <div>
            <p className="text-xs text-[#a0a0b0] mb-1 uppercase tracking-wide">Discovery Score</p>
            <p className="text-2xl font-bold text-[#51cf66]">{observation.analysis.discoveryScore}%</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/report/${observation.id}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#00d9ff] px-4 py-2 text-[#0f0f1e] font-semibold hover:bg-[#00b8d4] transition-colors text-sm"
          >
            <Eye size={16} />
            <span>View Details</span>
          </Link>
          <button
            onClick={() => onDownloadPDF(observation)}
            className="flex items-center justify-center gap-2 rounded-lg border border-[#3a3a4f] px-4 py-2 text-[#a0a0b0] hover:bg-[#25263b] transition-colors"
            title="Download PDF report"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => onDelete(observation.id)}
            className="flex items-center justify-center gap-2 rounded-lg border border-[#3a3a4f] px-4 py-2 text-[#a0a0b0] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors"
            title="Delete observation"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
