"use client"

import type { SavedObservation } from "@/types"

const STORAGE_KEY = "skyverse_observations"

export function saveObservation(observation: SavedObservation): void {
  try {
    const existing = getObservations()
    const updated = [observation, ...existing.filter((o) => o.id !== observation.id)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error("Failed to save observation:", error)
  }
}

export function getObservations(): SavedObservation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Failed to load observations:", error)
    return []
  }
}

export function getObservation(id: string): SavedObservation | null {
  const observations = getObservations()
  return observations.find((o) => o.id === id) || null
}

export function deleteObservation(id: string): void {
  try {
    const existing = getObservations()
    const updated = existing.filter((o) => o.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error("Failed to delete observation:", error)
  }
}
