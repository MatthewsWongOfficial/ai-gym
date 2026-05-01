"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)

    // Add minimal pulse animation
    const styleId = "not-found-animations"
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style")
      style.id = styleId
      style.textContent = `
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .pulse-glow-animation {
          animation: pulse-glow 2s infinite;
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  // If not mounted yet, return a placeholder to prevent hydration issues
  if (!mounted) {
    return <div className="min-h-screen bg-black"></div>
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-16 px-4">
      {/* Static Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
        <div className="absolute inset-0 bg-black bg-[radial-gradient(circle_at_center,rgba(0,220,130,0.15),transparent_80%)]" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(0,200,255,0.1),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(100,0,255,0.07),transparent_70%)]" />
        
        {/* Static decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 bg-emerald-500/30 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full opacity-10 bg-cyan-500/30 blur-3xl" />
        <div className="absolute top-2/3 right-1/4 w-72 h-72 rounded-full opacity-15 bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="z-10 flex flex-col items-center justify-center text-center">
        {/* Logo */}
        <div className="mb-6">
          <h1 className="text-5xl md:text-6xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500">
              AI Gym<span className="text-white">BRO</span>
            </span>
          </h1>
        </div>

        {/* 404 Message */}
        <div className="mb-8">
          <h2 className="text-7xl md:text-8xl font-bold text-white mb-2">404</h2>
          <p className="text-xl text-gray-300">Page not found</p>
        </div>

        {/* Message and Button */}
        <div className="relative max-w-md">
          <div
            className="absolute -inset-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-md pulse-glow-animation"
          />
          <div className="relative bg-gray-900/80 backdrop-blur-sm px-8 py-6 rounded-xl border border-emerald-500/30">
            <p className="text-gray-200 text-lg mb-6">
              Looks like you've missed your workout spot. Let's get you back on track!
            </p>
            
            <Link href="/" className="inline-block bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-emerald-700/30">
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}