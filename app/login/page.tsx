"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Mail, AlertCircle, LogIn } from "lucide-react"
import Navigation from "@/components/navigation"
import { login, register, initializeSampleUsers } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    initializeSampleUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 400))

    if (isRegistering) {
      const result = register(email, password)
      if (result.success) {
        setError("")
        setEmail("")
        setPassword("")
        setIsRegistering(false)
        alert("Account created successfully! Please log in.")
      } else {
        setError(result.error || "Registration failed")
      }
    } else {
      const result = login(email, password)
      if (result.success) {
        setError("")
        router.push("/reports")
      } else {
        setError(result.error || "Login failed")
      }
    }

    setIsLoading(false)
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#0f0f1e] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-[#1a1a2e] border border-[#3a3a4f] rounded-xl p-8 shadow-2xl shadow-[#00d9ff]/10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#00d9ff]/10 border border-[#00d9ff]/30 mx-auto mb-4">
                <LogIn size={24} className="text-[#00d9ff]" />
              </div>
              <h1 className="text-2xl font-bold text-[#e8e8f0] mb-2">
                {isRegistering ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-[#a0a0b0]">
                {isRegistering ? "Join Skyverse to analyze celestial images" : "Sign in to your Skyverse account"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 rounded-lg p-3 mb-6 flex gap-3">
                <AlertCircle size={20} className="text-[#ff6b6b] flex-shrink-0 mt-0.5" />
                <p className="text-[#ff6b6b] text-sm">{error}</p>
              </div>
            )}

            {/* Demo Credentials */}
            {!isRegistering && (
              <div className="bg-[#00d9ff]/5 border border-[#00d9ff]/20 rounded-lg p-3 mb-6">
                <p className="text-[#a0a0b0] text-xs font-semibold uppercase tracking-wide mb-2">Demo Credentials</p>
                <p className="text-[#e8e8f0] text-sm">
                  Email: <span className="font-mono text-[#00d9ff]">demo@skyverse.com</span>
                </p>
                <p className="text-[#e8e8f0] text-sm">
                  Password: <span className="font-mono text-[#00d9ff]">Demo123!</span>
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#e8e8f0] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#0f0f1e] border border-[#3a3a4f] rounded-lg pl-10 pr-4 py-2.5 text-[#e8e8f0] placeholder-[#6a6a7a] focus:outline-none focus:border-[#00d9ff] focus:ring-2 focus:ring-[#00d9ff]/20 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[#e8e8f0] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0f0f1e] border border-[#3a3a4f] rounded-lg pl-10 pr-10 py-2.5 text-[#e8e8f0] placeholder-[#6a6a7a] focus:outline-none focus:border-[#00d9ff] focus:ring-2 focus:ring-[#00d9ff]/20 transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0b0] hover:text-[#e8e8f0] transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full bg-[#00d9ff] text-[#0f0f1e] py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00b8d4] active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#0f0f1e]/30 border-t-[#0f0f1e] rounded-full animate-spin" />
                    {isRegistering ? "Creating..." : "Signing in..."}
                  </div>
                ) : isRegistering ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Toggle Register/Login */}
            <div className="text-center">
              <p className="text-[#a0a0b0] text-sm">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering)
                    setError("")
                    setEmail("")
                    setPassword("")
                  }}
                  disabled={isLoading}
                  className="ml-2 text-[#00d9ff] hover:text-[#00b8d4] font-semibold transition-colors disabled:opacity-50"
                >
                  {isRegistering ? "Sign in" : "Register"}
                </button>
              </p>
            </div>

            {/* Back Link */}
            <div className="mt-6 pt-6 border-t border-[#3a3a4f]">
              <Link href="/" className="text-[#a0a0b0] hover:text-[#e8e8f0] text-sm transition-colors">
                ← Back to Analyze
              </Link>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-[#6a6a7a] text-xs mt-6">
            Demo account provided for testing. In production, use a proper auth provider.
          </p>
        </div>
      </div>
    </>
  )
}
