"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Trophy, 
  Camera, 
  Upload, 
  X, 
  Loader2,
  Crown,
  Clock,
  Dumbbell,
  ImageIcon,
  ChevronDown
} from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { LeaderboardSkeleton } from "@/components/ui/skeleton-loaders"
import {
  getLeaderboard,
  getRecentCompletions,
  getTransformations,
  uploadMealPhoto,
  createMealCompletion,
  uploadTransformationPhoto,
  createTransformation,
  type LeaderboardEntry,
  type MealCompletion,
  type WorkoutTransformation
} from "@/lib/services/leaderboardService"
import { BackToTop } from "@/components/back-to-top"

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = document.createElement("img")
    img.onload = () => {
      const canvas = document.createElement("canvas")
      let { width, height } = img
      const maxDim = 1200
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = (height / width) * maxDim
          width = maxDim
        } else {
          width = (width / height) * maxDim
          height = maxDim
        }
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name, { type: "image/jpeg" }) : file),
        "image/jpeg",
        0.8
      )
    }
    img.src = URL.createObjectURL(file)
  })
}

type ProofItem = 
  | { type: "meal"; data: MealCompletion; date: Date }
  | { type: "transform"; data: WorkoutTransformation; date: Date }

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [recentCompletions, setRecentCompletions] = useState<MealCompletion[]>([])
  const [transformations, setTransformations] = useState<WorkoutTransformation[]>([])
  const [loading, setLoading] = useState(true)
  
  // Meal upload state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Transformation upload state
  const [showTransformModal, setShowTransformModal] = useState(false)
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const [afterFile, setAfterFile] = useState<File | null>(null)
  const [beforePreview, setBeforePreview] = useState<string | null>(null)
  const [afterPreview, setAfterPreview] = useState<string | null>(null)
  const [transformDescription, setTransformDescription] = useState("")
  const [transformDuration, setTransformDuration] = useState("")
  const [uploadingTransform, setUploadingTransform] = useState(false)
  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)
  
  // View modals
  const [viewTransform, setViewTransform] = useState<WorkoutTransformation | null>(null)
  const [viewMeal, setViewMeal] = useState<MealCompletion | null>(null)
  
  // Proofs display
  const [showAllProofs, setShowAllProofs] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [lb, completions, transforms] = await Promise.all([
        getLeaderboard(50),
        getRecentCompletions(50),
        getTransformations(20),
      ])
      setLeaderboard(lb)
      setRecentCompletions(completions)
      setTransformations(transforms)
      setLoading(false)
    }
    loadData()
  }, [])

  // Combine and sort all proofs by date
  const allProofs: ProofItem[] = [
    ...recentCompletions.map(m => ({ type: "meal" as const, data: m, date: new Date(m.completed_at) })),
    ...transformations.map(t => ({ type: "transform" as const, data: t, date: new Date(t.created_at) }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime())
  
  const visibleProofs = showAllProofs ? allProofs : allProofs.slice(0, 9)
  const hasMoreProofs = allProofs.length > 9

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    if (!user || !selectedFile) return
    setUploading(true)
    const photoUrl = await uploadMealPhoto(user.id, selectedFile)
    if (photoUrl) {
      const completion = await createMealCompletion(user.id, photoUrl, description)
      if (completion) {
        setShowUploadModal(false)
        setSelectedFile(null)
        setPreviewUrl(null)
        setDescription("")
        setShowSuccessModal(true)
      }
    }
    setUploading(false)
  }

  const closeModal = () => {
    setShowUploadModal(false)
    setSelectedFile(null)
    setPreviewUrl(null)
    setDescription("")
  }

  const handleBeforeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBeforeFile(file)
      setBeforePreview(URL.createObjectURL(file))
    }
  }

  const handleAfterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAfterFile(file)
      setAfterPreview(URL.createObjectURL(file))
    }
  }

  const handleTransformUpload = async () => {
    if (!user || !beforeFile || !afterFile) return
    setUploadingTransform(true)
    const [compressedBefore, compressedAfter] = await Promise.all([
      compressImage(beforeFile),
      compressImage(afterFile),
    ])
    const [beforeUrl, afterUrl] = await Promise.all([
      uploadTransformationPhoto(user.id, compressedBefore, "before"),
      uploadTransformationPhoto(user.id, compressedAfter, "after"),
    ])
    if (beforeUrl && afterUrl) {
      const transformation = await createTransformation(user.id, beforeUrl, afterUrl, transformDescription, transformDuration)
      if (transformation) {
        closeTransformModal()
        setShowSuccessModal(true)
      }
    }
    setUploadingTransform(false)
  }

  const closeTransformModal = () => {
    setShowTransformModal(false)
    setBeforeFile(null)
    setAfterFile(null)
    setBeforePreview(null)
    setAfterPreview(null)
    setTransformDescription("")
    setTransformDuration("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 pt-20 pb-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative mb-6 p-4 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 backdrop-blur-sm border border-teal-500/20 rounded-2xl" />
            <div className="relative">
              <div className="h-6 w-32 bg-stone-800/50 rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-stone-800/50 rounded animate-pulse" />
            </div>
          </div>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wide">Rankings</h2>
            </div>
            <LeaderboardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-20 pb-8">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Header with Glassmorphism */}
        <div className="relative mb-6 p-4 rounded-2xl overflow-hidden">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 backdrop-blur-sm border border-teal-500/20 rounded-2xl" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Leaderboard</h1>
              <p className="text-xs text-stone-400">Upload proofs to climb the ranks</p>
            </div>
            
            {user && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-teal-500/20"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Meal</span>
                </button>
                <button
                  onClick={() => setShowTransformModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-800/80 hover:bg-stone-700 text-white text-sm font-medium rounded-lg border border-stone-700/50 transition-all"
                >
                  <Dumbbell className="w-4 h-4" />
                  <span className="hidden sm:inline">Transform</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rankings Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wide">Rankings</h2>
            <span className="text-xs text-stone-600">({leaderboard.length} members)</span>
          </div>
          
          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 text-center">
                <Trophy className="w-10 h-10 text-stone-800 mx-auto mb-2" />
                <p className="text-stone-500 text-sm">No rankings yet. Be the first!</p>
              </div>
            ) : (
              leaderboard.slice(0, 10).map((entry, idx) => {
                const isTop3 = idx < 3
                // Gold, Silver, Bronze for top 3
                const rankColors = [
                  "from-amber-400 to-amber-600 text-amber-900",
                  "from-stone-300 to-stone-400 text-stone-800", 
                  "from-amber-600 to-amber-700 text-amber-100"
                ]
                
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      isTop3 
                        ? "bg-stone-900 border border-stone-800" 
                        : "bg-stone-900/50"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isTop3 
                        ? `bg-gradient-to-br ${rankColors[idx]}` 
                        : "bg-stone-800 text-stone-500"
                    }`}>
                      {idx === 0 ? <Crown className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${isTop3 ? "text-white" : "text-stone-400"}`}>
                        {entry.username}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className={`text-base font-bold ${isTop3 ? "text-teal-400" : "text-stone-500"}`}>
                        {entry.completion_count}
                      </span>
                      <span className="text-[10px] text-stone-600">proofs</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Proofs Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-teal-400" />
              <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wide">Recent Proofs</h2>
              {allProofs.length > 0 && (
                <span className="text-xs text-stone-600">({allProofs.length})</span>
              )}
            </div>
          </div>
          
          {allProofs.length === 0 ? (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 text-center">
              <Camera className="w-10 h-10 text-stone-800 mx-auto mb-2" />
              <p className="text-stone-500 text-sm">No proofs uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {visibleProofs.map((proof) => {
                if (proof.type === "meal") {
                  const meal = proof.data
                  return (
                    <div
                      key={`meal-${meal.id}`}
                      onClick={() => setViewMeal(meal)}
                      className="cursor-pointer bg-stone-900 border border-stone-800 rounded-lg overflow-hidden active:scale-[0.98] transition-transform"
                    >
                      <div className="aspect-square relative">
                        <Image
                          src={meal.photo_url}
                          alt="Meal"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 33vw, 200px"
                        />
                        <div className="absolute top-1 left-1 z-10">
                          <span className="flex items-center gap-0.5 px-1 py-0.5 bg-emerald-500 text-[8px] font-bold text-white rounded">
                            <Camera className="w-2 h-2" />
                          </span>
                        </div>
                      </div>
                      <div className="p-1.5">
                        <p className="font-medium text-white text-[11px] truncate">{meal.username}</p>
                        <p className="text-[9px] text-stone-600">{formatDate(meal.completed_at)}</p>
                      </div>
                    </div>
                  )
                } else {
                  const transform = proof.data
                  return (
                    <div
                      key={`transform-${transform.id}`}
                      onClick={() => setViewTransform(transform)}
                      className="cursor-pointer bg-stone-900 border border-stone-800 rounded-lg overflow-hidden active:scale-[0.98] transition-transform"
                    >
                      <div className="aspect-square relative">
                        <div className="absolute inset-0 grid grid-cols-2">
                          <div className="relative bg-stone-950">
                            <Image
                              src={transform.before_photo_url}
                              alt="Before"
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 16vw, 100px"
                            />
                          </div>
                          <div className="relative bg-stone-950">
                            <Image
                              src={transform.after_photo_url}
                              alt="After"
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 16vw, 100px"
                            />
                          </div>
                        </div>
                        <div className="absolute top-1 left-1 z-10">
                          <span className="flex items-center gap-0.5 px-1 py-0.5 bg-teal-500 text-[8px] font-bold text-white rounded">
                            <Dumbbell className="w-2 h-2" />
                          </span>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 flex justify-center">
                          <div className="w-4 h-4 -mb-2 bg-stone-900 rotate-45"></div>
                        </div>
                      </div>
                      <div className="p-1.5">
                        <p className="font-medium text-white text-[11px] truncate">{transform.username}</p>
                        <p className="text-[9px] text-stone-600">
                          {transform.duration || formatDate(transform.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                }
              })}
            </div>
          )}
          
          {/* Show More / Show Less Button */}
          {hasMoreProofs && (
            <button
              onClick={() => setShowAllProofs(!showAllProofs)}
              className="w-full mt-3 py-3 flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-white text-sm font-medium rounded-xl transition-all"
            >
              <span>{showAllProofs ? "Show Less" : `Show All ${allProofs.length} Proofs`}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAllProofs ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        {/* Not logged in prompt */}
        {!user && (
          <div className="mt-6 bg-stone-900 border border-teal-500/20 rounded-xl p-5 text-center">
            <p className="text-stone-400 text-sm mb-3">Sign in to upload proofs and join the leaderboard</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-teal-500/20"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-end sm:items-center justify-center">
          <div className="bg-stone-900 border-t sm:border border-stone-800 sm:rounded-2xl p-5 w-full sm:max-w-md sm:mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Upload Meal Proof</h3>
              <button onClick={closeModal} className="p-2 text-stone-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-stone-500 text-sm mb-4">Share a photo of your healthy meal to earn a proof on the leaderboard.</p>

            {previewUrl ? (
              <div className="mb-4">
                <div className="aspect-square relative rounded-xl overflow-hidden mb-2">
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null) }}
                  className="text-sm text-stone-500 hover:text-white"
                >
                  Change photo
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-700 rounded-xl p-10 text-center cursor-pointer hover:border-teal-500/50 transition-colors mb-4"
              >
                <Camera className="w-10 h-10 text-stone-700 mx-auto mb-2" />
                <p className="text-stone-500">Tap to select photo</p>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

            <div className="mb-5">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)"
                rows={2}
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:border-teal-500/50 resize-none text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3 text-stone-500 font-medium">
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 disabled:from-stone-700 disabled:to-stone-700 text-white disabled:text-stone-500 font-semibold rounded-xl transition-all"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload Proof"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transformation Upload Modal */}
      {showTransformModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-end sm:items-center justify-center">
          <div className="bg-stone-900 border-t sm:border border-stone-800 sm:rounded-2xl p-5 w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Upload Transformation</h3>
              <button onClick={closeTransformModal} className="p-2 text-stone-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-stone-500 text-sm mb-4">Share your before &amp; after photos to inspire others and earn a proof.</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-xs text-stone-500 mb-2 text-center">Before</p>
                {beforePreview ? (
                  <div className="relative">
                    <img src={beforePreview} alt="Before" className="w-full aspect-[3/4] object-cover rounded-xl" />
                    <button
                      onClick={() => { setBeforeFile(null); setBeforePreview(null) }}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => beforeInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-700 rounded-xl aspect-[3/4] flex flex-col items-center justify-center cursor-pointer hover:border-teal-500/50 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-stone-700 mb-1" />
                    <p className="text-stone-600 text-xs">Tap to add</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-2 text-center">After</p>
                {afterPreview ? (
                  <div className="relative">
                    <img src={afterPreview} alt="After" className="w-full aspect-[3/4] object-cover rounded-xl" />
                    <button
                      onClick={() => { setAfterFile(null); setAfterPreview(null) }}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => afterInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-700 rounded-xl aspect-[3/4] flex flex-col items-center justify-center cursor-pointer hover:border-teal-500/50 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-stone-700 mb-1" />
                    <p className="text-stone-600 text-xs">Tap to add</p>
                  </div>
                )}
              </div>
            </div>

            <input ref={beforeInputRef} type="file" accept="image/*" onChange={handleBeforeSelect} className="hidden" />
            <input ref={afterInputRef} type="file" accept="image/*" onChange={handleAfterSelect} className="hidden" />

            <input
              value={transformDuration}
              onChange={(e) => setTransformDuration(e.target.value)}
              placeholder="Duration (e.g. 3 months)"
              className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:border-teal-500/50 mb-3 text-sm"
            />

            <textarea
              value={transformDescription}
              onChange={(e) => setTransformDescription(e.target.value)}
              placeholder="Share your journey (optional)"
              rows={2}
              className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:border-teal-500/50 resize-none mb-5 text-sm"
            />

            <div className="flex gap-3">
              <button onClick={closeTransformModal} className="flex-1 py-3 text-stone-500 font-medium">
                Cancel
              </button>
              <button
                onClick={handleTransformUpload}
                disabled={!beforeFile || !afterFile || uploadingTransform}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 disabled:from-stone-700 disabled:to-stone-700 text-white disabled:text-stone-500 font-semibold rounded-xl transition-all"
              >
                {uploadingTransform ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload Proof"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-xs w-full text-center">
            <div className="w-14 h-14 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Proof Uploaded!</h3>
            <p className="text-stone-500 text-sm mb-5">Awaiting admin approval. Once approved, it will count toward your ranking.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* View Transformation Modal */}
      {viewTransform && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setViewTransform(null)}>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-teal-500 text-[10px] font-bold text-white rounded flex items-center gap-1">
                  <Dumbbell className="w-2.5 h-2.5" /> TRANSFORM
                </span>
                <span className="text-white font-medium text-sm">{viewTransform.username}</span>
              </div>
              <button onClick={() => setViewTransform(null)} className="p-2 text-stone-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex">
              <div className="w-1/2 relative aspect-[3/4] bg-stone-950">
                <Image src={viewTransform.before_photo_url} alt="Before" fill className="object-contain" sizes="(max-width: 768px) 50vw, 256px" />
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded z-10">Before</span>
              </div>
              <div className="w-1/2 relative aspect-[3/4] bg-stone-950">
                <Image src={viewTransform.after_photo_url} alt="After" fill className="object-contain" sizes="(max-width: 768px) 50vw, 256px" />
                <span className="absolute bottom-2 right-2 px-2 py-1 bg-teal-500 text-white text-xs font-medium rounded z-10">After</span>
              </div>
            </div>
            {(viewTransform.description || viewTransform.duration) && (
              <div className="p-4 border-t border-stone-800">
                {viewTransform.duration && (
                  <p className="text-teal-400 text-sm font-medium mb-2">{viewTransform.duration}</p>
                )}
                {viewTransform.description && (
                  <p className="text-stone-300 text-sm">{viewTransform.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Meal Modal */}
      {viewMeal && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setViewMeal(null)}>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-emerald-500 text-[10px] font-bold text-white rounded flex items-center gap-1">
                  <Camera className="w-2.5 h-2.5" /> MEAL
                </span>
                <span className="text-white font-medium text-sm">{viewMeal.username}</span>
              </div>
              <button onClick={() => setViewMeal(null)} className="p-2 text-stone-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full aspect-square">
              <Image src={viewMeal.photo_url} alt="Meal" fill className="object-cover" sizes="(max-width: 768px) 100vw, 448px" />
            </div>
            {viewMeal.description && (
              <div className="p-4 border-t border-stone-800">
                <p className="text-stone-300 text-sm">{viewMeal.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <BackToTop />
    </div>
  )
}
