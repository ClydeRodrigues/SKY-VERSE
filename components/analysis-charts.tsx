"use client"

import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { useRef, useImperativeHandle, forwardRef } from "react"
import type { Star, AnalysisResult } from "@/types"

interface AnalysisChartsProps {
  analysis?: AnalysisResult
  stars?: Star[]
  clusterCount?: number
  anomalyCount?: number
  discoveryScore?: number
  exportMode?: boolean
  onExportImages?: (images: { title: string; image: string }[]) => void
}

const AnalysisCharts = forwardRef(function AnalysisCharts({
  analysis,
  stars: propsStars,
  clusterCount: propsClusterCount,
  anomalyCount: propsAnomalyCount,
  discoveryScore: propsDiscoveryScore,
  exportMode = false,
  onExportImages,
}: AnalysisChartsProps, ref) {
  const stars = propsStars || analysis?.stars || []
  const clusterCount = propsClusterCount ?? analysis?.clusterCount ?? 0
  const anomalyCount = propsAnomalyCount ?? analysis?.anomalyCount ?? 0
  const discoveryScore = propsDiscoveryScore ?? analysis?.discoveryScore ?? 0

  // Prepare brightness distribution data
  const brightnessData = Array.from({ length: 10 }, (_, i) => ({
    brightness: `${i}-${i + 1}`,
    count: stars.filter((s) => s.brightness >= i && s.brightness < i + 1).length,
  }))

  // Cluster size data
  const clusterData = Array.from({ length: clusterCount }, (_, i) => ({
    cluster: `Cluster ${i + 1}`,
    size: Math.floor(Math.random() * 20) + 5,
    density: Math.random() * 100,
  }))

  // Anomaly score data
  const anomalyData = stars
    .filter((_, i) => i % Math.ceil(stars.length / 10) === 0)
    .map((star, i) => ({
      id: i,
      ra: Math.round(star.ra),
      anomalyScore: Math.random() * 100,
      brightness: Math.round(star.brightness * 10),
    }))

  // Refs for chart containers
  const brightnessRef = useRef<HTMLDivElement>(null)
  const clusterRef = useRef<HTMLDivElement>(null)
  const anomalyRef = useRef<HTMLDivElement>(null)

  // Export method for parent
  useImperativeHandle(ref, () => ({
    exportCharts: () => {
      const images: { title: string; image: string }[] = []
      if (brightnessRef.current) {
        const svg = brightnessRef.current.querySelector('svg')
        if (svg) {
          const data = new XMLSerializer().serializeToString(svg)
          const base64 = window.btoa(unescape(encodeURIComponent(data)))
          images.push({ title: 'Brightness Distribution', image: `data:image/svg+xml;base64,${base64}` })
        }
      }
      if (clusterRef.current) {
        const svg = clusterRef.current.querySelector('svg')
        if (svg) {
          const data = new XMLSerializer().serializeToString(svg)
          const base64 = window.btoa(unescape(encodeURIComponent(data)))
          images.push({ title: 'Cluster Size Comparison', image: `data:image/svg+xml;base64,${base64}` })
        }
      }
      if (anomalyRef.current) {
        const svg = anomalyRef.current.querySelector('svg')
        if (svg) {
          const data = new XMLSerializer().serializeToString(svg)
          const base64 = window.btoa(unescape(encodeURIComponent(data)))
          images.push({ title: 'Anomaly Score Analysis', image: `data:image/svg+xml;base64,${base64}` })
        }
      }
      if (onExportImages) onExportImages(images)
      return images
    }
  }))

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
      {/* Brightness Distribution */}
      <div ref={brightnessRef} className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] p-6 h-full flex flex-col">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#a0a0b0]">Brightness Distribution</h3>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={brightnessData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a4f" />
            <XAxis dataKey="brightness" stroke="#a0a0b0" style={{ fontSize: "12px" }} />
            <YAxis stroke="#a0a0b0" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a2e",
                border: "1px solid #3a3a4f",
                borderRadius: "6px",
              }}
              labelStyle={{ color: "#a0a0b0" }}
            />
            <Bar dataKey="count" fill="#00d9ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cluster Size Comparison */}
      <div ref={clusterRef} className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] p-6 h-full flex flex-col">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#a0a0b0]">Cluster Size Comparison</h3>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clusterData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a4f" />
            <XAxis dataKey="cluster" stroke="#a0a0b0" style={{ fontSize: "12px" }} />
            <YAxis stroke="#a0a0b0" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a2e",
                border: "1px solid #3a3a4f",
                borderRadius: "6px",
              }}
              labelStyle={{ color: "#a0a0b0" }}
            />
            <Bar dataKey="size" fill="#51cf66" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Anomaly Score Scatter */}
      <div ref={anomalyRef} className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] p-6 h-full flex flex-col">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#a0a0b0]">Anomaly Score Analysis</h3>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a4f" />
            <XAxis type="number" dataKey="ra" stroke="#a0a0b0" style={{ fontSize: "12px" }} />
            <YAxis type="number" dataKey="anomalyScore" stroke="#a0a0b0" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a2e",
                border: "1px solid #3a3a4f",
                borderRadius: "6px",
              }}
              labelStyle={{ color: "#a0a0b0" }}
            />
            <Scatter dataKey="anomalyScore" data={anomalyData} fill="#ff6b6b" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Discovery Score Gauge */}
      <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] p-6 h-full flex items-center justify-center">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#a0a0b0]">Discovery Score</h3>
        <div className="flex items-center justify-center w-full h-full">
          <div className="relative w-40 h-40 lg:w-56 lg:h-56">
            <svg viewBox="0 0 120 120" className="w-full h-full">
              {/* Background arc */}
              <circle cx="60" cy="60" r="50" fill="none" stroke="#3a3a4f" strokeWidth="8" />

              {/* Score arc */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#51cf66"
                strokeWidth="8"
                strokeDasharray={`${(discoveryScore / 100) * 314} 314`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />

              {/* Center text */}
              <text
                x="60"
                y="60"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#51cf66"
                fontSize="28"
                fontWeight="bold"
              >
                {discoveryScore}%
              </text>
              <text x="60" y="80" textAnchor="middle" dominantBaseline="middle" fill="#a0a0b0" fontSize="12">
                Score
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
})
export default AnalysisCharts
