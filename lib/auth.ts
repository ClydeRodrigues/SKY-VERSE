"use client"

import type { User } from "@/types"

const USERS_STORAGE_KEY = "skyverse_users"
const CURRENT_USER_KEY = "skyverse_current_user"

export function initializeSampleUsers() {
  const existing = localStorage.getItem(USERS_STORAGE_KEY)
  if (!existing) {
    const sampleUsers: Record<string, { password: string; email: string }> = {
      demo: {
        email: "demo@skyverse.com",
        password: "Demo123!",
      },
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(sampleUsers))
  }
}

export function register(email: string, password: string): { success: boolean; error?: string } {
  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Invalid email format" }
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" }
  }

  const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "{}")
  if (users[email.toLowerCase()]) {
    return { success: false, error: "This email is already registered" }
  }

  users[email.toLowerCase()] = { email, password }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

  return { success: true }
}

export function login(email: string, password: string): { success: boolean; error?: string; user?: User } {
  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "{}")
  const user = users[email.toLowerCase()]

  if (!user || user.password !== password) {
    return { success: false, error: "Invalid email or password" }
  }

  const userData: User = {
    id: Math.random().toString(36).substring(2),
    email: user.email,
    loginTime: new Date().toISOString(),
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData))
  return { success: true, user: userData }
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function getCurrentUser(): User | null {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY)
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}
