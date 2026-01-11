export interface Star {
  ra: number
  dec: number
  brightness: number
}

export interface Constellation {
  name: string
  stars: number[]
}

export interface AnalysisResult {
  starCount: number
  clusterCount: number
  anomalyCount: number
  discoveryScore: number
  summary: string
  timestamp?: string
  stars?: Star[]
  constellations?: Constellation[]
}

export interface SavedObservation {
  id: string
  timestamp: string
  originalImageBase64?: string
  analysis: AnalysisResult
  starOverlayImageUrl?: string
  heatmapImageUrl?: string
}

export interface User {
  id: string
  email: string
  loginTime: string
}
