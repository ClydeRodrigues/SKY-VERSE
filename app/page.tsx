"use client"


import { useState } from "react"
import Navigation from "@/components/navigation"
import SpaceBackground from "@/components/space-background"
import ImageUploadSection from "@/components/image-upload-section"
import AnalysisPreview from "@/components/analysis-preview"
import type { AnalysisResult } from "@/types"

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const handleImageUpload = (file: File, preview: string) => {
    setUploadedImage(preview)
    setImageFile(file)
    setAnalysisResult(null)
  }

  const handleAnalyze = async () => {
    if (!imageFile) return

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append("image", imageFile)

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setAnalysisResult(data)
    } catch (error) {
      console.error("Error analyzing image:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <>
      <SpaceBackground />
      <Navigation />
      <main className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-12 pb-24">
        {/* Hero Section */}
        <section className="relative z-10 flex flex-col items-center text-center mb-16 mt-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 animate-fade-in text-shadow-lg">Discover the Universe</h1>
          <p className="text-lg sm:text-xl text-secondary mb-8 animate-fade-in delay-100">Advanced Celestial Analysis</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 animate-fade-in delay-200">
            <button className="btn accent-gradient shadow-lg" onClick={() => window.scrollTo({top: 400, behavior: 'smooth'})}>Analyze Image</button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl animate-fade-in delay-300">
          <div className="card flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6b5bff] to-[#3fc3ff] flex items-center justify-center mb-3 shadow-lg">
              <span className="text-2xl">★</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Star Detection</h3>
            <p className="text-secondary">Detect stars, clusters, and anomalies in your images with advanced AI.</p>
          </div>
          <div className="card flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6b5bff] to-[#3fc3ff] flex items-center justify-center mb-3 shadow-lg">
              <span className="text-2xl">✦</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Constellation Recognition</h3>
            <p className="text-secondary">Automatically map constellations and visualize celestial patterns.</p>
          </div>
          <div className="card flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6b5bff] to-[#3fc3ff] flex items-center justify-center mb-3 shadow-lg">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Detailed Reports</h3>
            <p className="text-secondary">Download JSON/PDF reports with interactive charts and in-depth analysis.</p>
          </div>
        </section>

        {/* Analysis Section (Image Upload/Preview) */}
        <section className="relative z-10 w-full max-w-2xl mt-16 animate-fade-in delay-500">
          {!analysisResult ? (
            <ImageUploadSection
              uploadedImage={uploadedImage}
              onUpload={handleImageUpload}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />
          ) : (
            <AnalysisPreview
              analysis={analysisResult}
              originalImage={uploadedImage}
              onNewAnalysis={() => {
                setAnalysisResult(null)
                setUploadedImage(null)
                setImageFile(null)
              }}
            />
          )}
        </section>
      </main>
    </>
  )
}
