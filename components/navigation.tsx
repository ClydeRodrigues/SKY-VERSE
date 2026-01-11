"use client"


import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [loginModal, setLoginModal] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/analyze";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50 shadow-lg shadow-black/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group relative select-none">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#6b5bff] to-[#3fc3ff] shadow-lg relative animate-spin-slow">
            {/* Unique space logo: planet + ring + sparkle */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="block">
              <circle cx="16" cy="16" r="10" fill="url(#planetGradient)" filter="url(#glow)" />
              <ellipse cx="16" cy="20" rx="12" ry="4" fill="none" stroke="#3fc3ff" strokeWidth="2" opacity="0.7" />
              <circle cx="24" cy="10" r="2" fill="#fff" opacity="0.8">
                <animate attributeName="r" values="2;3;2" dur="1.2s" repeatCount="indefinite" />
              </circle>
              <defs>
                <radialGradient id="planetGradient" cx="0" cy="0" r="1" gradientTransform="translate(16 16) scale(10)">
                  <stop stopColor="#6b5bff" />
                  <stop offset="1" stopColor="#3fc3ff" />
                </radialGradient>
                <filter id="glow" x="0" y="0" width="32" height="32">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#6b5bff" floodOpacity="0.7" />
                </filter>
              </defs>
            </svg>
          </div>
          <span className="font-bold text-lg text-foreground tracking-wide hidden sm:inline animate-text-glow">SKYVERSE</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg text-sm font-semibold bg-transparent transition-all focus:outline-none ${
              isActive("/") ? "gradient-underline text-foreground" : "text-secondary hover:text-foreground"
            }`}
          >
            Analyze
          </Link>
          <Link
            href="/reports"
            className={`px-4 py-2 rounded-lg text-sm font-semibold bg-transparent transition-all focus:outline-none ${
              isActive("/reports") ? "gradient-underline text-foreground" : "text-secondary hover:text-foreground"
            }`}
          >
            Reports
          </Link>
          <button
            className={`ml-2 px-4 py-2 rounded-lg text-sm font-semibold accent-gradient shadow-md transition-all focus:outline-none`}
            onClick={() => setLoginModal(true)}
          >
            Login
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden flex items-center p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          <span className="block w-6 h-0.5 bg-foreground mb-1 rounded transition-all" />
          <span className="block w-6 h-0.5 bg-foreground mb-1 rounded transition-all" />
          <span className="block w-6 h-0.5 bg-foreground rounded transition-all" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-panel px-4 py-4 space-y-2 animate-fade-in">
          <Link href="/" className={`block py-2 text-base font-semibold ${isActive("/") ? "gradient-underline text-foreground" : "text-secondary hover:text-foreground"}`}>Analyze</Link>
          <Link href="/reports" className={`block py-2 text-base font-semibold ${isActive("/reports") ? "gradient-underline text-foreground" : "text-secondary hover:text-foreground"}`}>Reports</Link>
          <button className="w-full accent-gradient py-2 rounded-lg font-semibold mt-2" onClick={() => setLoginModal(true)}>Login</button>
        </div>
      )}

      {/* Login Modal Placeholder */}
      {loginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
          <div className="modal relative">
            <button className="absolute top-2 right-2 text-xl text-secondary hover:text-foreground" onClick={() => setLoginModal(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            {/* Login form will be implemented in a later step */}
            <div className="text-secondary">Login form coming soon...</div>
          </div>
        </div>
      )}
    </nav>
  );
}
