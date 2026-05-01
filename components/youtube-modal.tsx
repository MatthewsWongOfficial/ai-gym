"use client"

import { X } from "lucide-react"

interface YouTubeModalProps {
  isOpen: boolean
  onClose: () => void
  searchQuery: string
}

export function YouTubeModal({ isOpen, onClose, searchQuery }: YouTubeModalProps) {
  if (!isOpen) return null

  const embedUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(searchQuery)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl bg-stone-900 border border-stone-700/50 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-stone-800/50 border-b border-stone-700/50">
          <p className="text-sm font-medium text-white truncate pr-4">
            YouTube: {searchQuery}
          </p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-700/50 hover:bg-stone-600/50 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`YouTube search: ${searchQuery}`}
          />
        </div>
      </div>
    </div>
  )
}
