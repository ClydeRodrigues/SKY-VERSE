"use client"

import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import StarFieldCanvas from "./star-field-canvas"

export default function DetailedAnalysisContent() {
  const searchParams = useSearchParams()

  const mockStars = Array.from({ length: 150 }, (_, i) => ({
    ra: Math.random() * 360,
    dec: Math.random() * 180 - 90,
    brightness: Math.random() * 10,
  }))

  const mockConstellations = [
    { name: "Orion", stars: [0, 1, 2, 3, 4, 5, 6] },
    { name: "Ursa Major", stars: [10, 11, 12, 13, 14, 15] },
    { name: "Cassiopeia", stars: [20, 21, 22, 23, 24] },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/" className="rounded-lg bg-[#1a1a2e] p-2 text-[#a0a0b0] hover:text-[#00d9ff] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#e8e8f0]">Detailed Star Field Analysis</h1>
          <p className="text-sm text-[#a0a0b0] mt-1">
            Complete visualization with all detected stars and constellations
          </p>
        </div>
      </div>

      {/* Main Star Field */}
      <div className="mb-8">
        <label className="mb-4 block text-sm font-semibold uppercase tracking-widest text-[#a0a0b0]">
          Star Field (RA vs DEC)
        </label>
        <div className="flex justify-center">
          <StarFieldCanvas
            stars={mockStars}
            constellations={mockConstellations}
            width={800}
            height={600}
            showHeatmap={false}
            downloadable={true}
          />
        </div>
      </div>

      {/* Density Heatmap */}
      <div className="mb-8">
        <label className="mb-4 block text-sm font-semibold uppercase tracking-widest text-[#a0a0b0]">
          Density Heatmap
        </label>
        <div className="flex justify-center">
          <StarFieldCanvas
            stars={mockStars}
            constellations={[]}
            width={800}
            height={600}
            showHeatmap={true}
            downloadable={true}
          />
        </div>
      </div>

      {/* Star Catalog */}
      <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#e8e8f0]">Detected Constellations</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {mockConstellations.map((constellation, idx) => (
            <div key={idx} className="rounded-lg border border-[#3a3a4f] bg-[#25263b] p-4">
              <h3 className="font-semibold text-[#00d9ff] mb-2">{constellation.name}</h3>
              <p className="text-sm text-[#a0a0b0]">{constellation.stars.length} primary stars</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
