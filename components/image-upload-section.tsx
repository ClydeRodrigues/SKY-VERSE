"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, AlertCircle } from "lucide-react"

interface ImageUploadSectionProps {
  uploadedImage: string | null
  onUpload: (file: File, preview: string) => void
  onAnalyze: () => void
  isAnalyzing: boolean
}

export default function ImageUploadSection({
  uploadedImage,
  onUpload,
  onAnalyze,
  isAnalyzing,
}: ImageUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLikelyNightSkyImage = async (file: File): Promise<boolean> => {
    // Lightweight client-side check to block obvious non-night-sky images.
    // Heuristic: mostly dark background + some small bright points (stars).
    const bitmap = await createImageBitmap(file)

    const targetW = 256
    const scale = Math.min(1, targetW / bitmap.width)
    const w = Math.max(1, Math.floor(bitmap.width * scale))
    const h = Math.max(1, Math.floor(bitmap.height * scale))

    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return false

    ctx.drawImage(bitmap, 0, 0, w, h)
    const { data } = ctx.getImageData(0, 0, w, h)

    const n = w * h
    let dark = 0
    let bright = 0
    let veryBright = 0
    let sum = 0
    let sumSq = 0

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!
      const g = data[i + 1]!
      const b = data[i + 2]!
      // perceived luminance (0..255)
      const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
      sum += y
      sumSq += y * y

      if (y < 40) dark++
      if (y > 180) bright++
      if (y > 230) veryBright++
    }

    const mean = sum / n
    const variance = Math.max(0, sumSq / n - mean * mean)
    const std = Math.sqrt(variance)

    const darkFrac = dark / n
    const brightFrac = bright / n
    const veryBrightFrac = veryBright / n

    // Night sky tends to be:
    // - predominantly dark
    // - with sparse bright pixels (stars), not large bright regions
    // - decent contrast (std)
    const looksNightSky =
      darkFrac >= 0.55 &&
      brightFrac >= 0.001 &&
      brightFrac <= 0.12 &&
      veryBrightFrac <= 0.02 &&
      mean <= 110 &&
      std >= 25

    return looksNightSky
  }

  const handleFile = async (file: File) => {
    setError(null)

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG or PNG)")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    try {
      const ok = await isLikelyNightSkyImage(file)
      if (!ok) {
        setError("Only star/constellation night-sky images are allowed. Please upload a clear night-sky photo.")
        return
      }
    } catch {
      setError("Couldn't validate this image. Please try a different night-sky image.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const preview = e.target?.result as string
      onUpload(file, preview)
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      void handleFile(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      void handleFile(file)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header - CHANGE: cleaner typography and breathing room */}
        <div className="mb-16 text-center">
          <h1 className="mb-3 text-5xl font-bold text-[#e8e8f0]">SKYVERSE</h1>
          <p className="text-base text-[#a0a0b0] font-light">Professional Celestial Image Analysis</p>
        </div>

        {/* Upload Area - CHANGE: improved spacing and less aggressive styling */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#a0a0b0]">
              Upload Night-Sky Image
            </label>
            {uploadedImage && <span className="text-xs text-[#51cf66] font-medium">✓ Ready to analyze</span>}
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
              dragActive ? "border-[#00d9ff] bg-[#00d9ff]/5" : "border-[#2a2a3e] hover:border-[#00d9ff]/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto mb-4 flex items-center gap-2 rounded-lg bg-[#1a1a2e] px-6 py-3 text-[#00d9ff] hover:bg-[#25263b] transition-colors"
            >
              <Upload size={18} />
              Choose File
            </button>

            <p className="text-xs text-[#a0a0b0]">or drag and drop JPG / PNG image here</p>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#ff6b6b]/10 p-3">
              <AlertCircle size={16} className="text-[#ff6b6b]" />
              <p className="text-xs text-[#ff6b6b]">{error}</p>
            </div>
          )}
        </div>

        {/* Image Preview */}
        {uploadedImage && (
          <div className="mb-8">
            <div className="mb-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#a0a0b0]">Preview</label>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-[#3a3a4f] bg-[#1a1a2e]">
              <img
                src={uploadedImage || "/placeholder.svg"}
                alt="Uploaded image"
                className="h-auto w-full object-cover max-h-96"
              />
            </div>
          </div>
        )}

        {/* Analyze Button */}
        {uploadedImage && (
          <div className="mb-8">
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="w-full rounded-lg bg-[#00d9ff] px-6 py-3 font-semibold text-[#0f0f1e] hover:bg-[#00b8d4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0f0f1e] border-r-transparent"></div>
                  Analyzing Image...
                </span>
              ) : (
                "Analyze Image"
              )}
            </button>
          </div>
        )}

        {/* Info Text */}
        {!uploadedImage && (
          <div className="rounded-lg border border-[#3a3a4f] bg-[#1a1a2e] p-4">
            <p className="text-xs text-[#a0a0b0] leading-relaxed">
              Upload a night-sky image (JPG or PNG) to extract stellar positions, detect constellations, and analyze
              celestial phenomena. Our system will generate detailed visualizations and a comprehensive report.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
