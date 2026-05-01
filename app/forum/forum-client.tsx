"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MessageCircle, Dumbbell, Utensils, TrendingUp, HelpCircle, Plus, Eye, MessageSquare, Clock, Megaphone, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { type ForumCategory, type ForumThread } from "@/lib/services/forumService"
import { useAuth } from "@/lib/hooks/useAuth"

const iconMap: Record<string, React.ReactNode> = {
  MessageCircle: <MessageCircle className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
  Utensils: <Utensils className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  HelpCircle: <HelpCircle className="w-5 h-5" />,
  Megaphone: <Megaphone className="w-5 h-5" />,
}

const colorMap: Record<string, string> = {
  teal: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  violet: "bg-violet-500/20 text-violet-400 border-violet-500/30",
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

interface ForumClientProps {
  initialCategories: ForumCategory[]
  initialThreads: ForumThread[]
  totalThreads: number
  currentPage: number
  searchQuery?: string
  currentCategory?: string
  currentCategoryName?: string
}

export default function ForumClient({ initialCategories, initialThreads, totalThreads, currentPage, searchQuery, currentCategory, currentCategoryName }: ForumClientProps) {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState(searchQuery || "")
  const { user } = useAuth()

  const limit = 20
  const totalPages = Math.ceil(totalThreads / limit)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    let query = `/forum${currentCategory ? `/${currentCategory}` : ''}?page=1`
    if (searchInput.trim()) {
      query += `&q=${encodeURIComponent(searchInput.trim())}`
    }
    router.push(query)
  }

  const navigateToPage = (newPage: number) => {
    let query = `/forum${currentCategory ? `/${currentCategory}` : ''}?page=${newPage}`
    if (searchQuery) query += `&q=${encodeURIComponent(searchQuery)}`
    router.push(query)
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {currentCategoryName ? currentCategoryName : "Community Forum"}
            </h1>
            <p className="text-stone-400 mt-1">
              {currentCategoryName ? "Join the discussion in this category" : "Connect, share, and learn with fellow fitness enthusiasts"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <form onSubmit={handleSearch} className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search discussions..."
                className="w-full bg-stone-900/80 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
              />
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>
            
            {user ? (
              <Link
                href={`/forum/new${currentCategory ? `?category=${currentCategory}` : ''}`}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-medium rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                New Thread
              </Link>
            ) : (
              <Link
                href="/auth/login?redirect=/forum"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-medium rounded-xl transition-all whitespace-nowrap"
              >
                Sign in to post
              </Link>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Categories Sidebar */}
          {!currentCategory && (
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-white mb-4">Categories</h2>
              <div className="space-y-2">
                {initialCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/forum/${category.slug}`}
                    className="flex items-center gap-3 p-4 bg-stone-900/80 border border-stone-800/50 rounded-xl hover:border-teal-500/30 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorMap[category.color] || colorMap.teal}`}>
                      {iconMap[category.icon] || <MessageCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white group-hover:text-teal-400 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-stone-500 truncate mt-0.5">{category.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Threads List */}
          <div className={currentCategory ? "lg:col-span-3" : "lg:col-span-2"}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Discussions</h2>
              {searchQuery && (
                <span className="text-sm text-stone-400">
                  Showing results for &quot;{searchQuery}&quot;
                </span>
              )}
            </div>

            <div className="space-y-3">
              {initialThreads.length === 0 ? (
                <div className="text-center py-16 bg-stone-900/80 border border-stone-800/50 rounded-2xl">
                  <MessageSquare className="w-12 h-12 text-stone-700 mx-auto mb-3" />
                  <p className="text-stone-400">No discussions found.</p>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchInput("")
                        router.push(`/forum${currentCategory ? `/${currentCategory}` : ''}`)
                      }}
                      className="mt-4 text-teal-400 hover:text-teal-300 text-sm font-medium"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                initialThreads.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/forum/${thread.category_slug}/${thread.slug}`}
                    className="block p-5 bg-stone-900/60 border border-stone-800/60 rounded-2xl hover:border-teal-500/40 hover:bg-stone-900/90 transition-all group"
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-stone-300">
                          {thread.author_username?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase rounded-md border ${colorMap[thread.category_color || "teal"]}`}>
                            {thread.category_name}
                          </span>
                          {thread.is_pinned && (
                            <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500">
                              Pinned
                            </span>
                          )}
                          {thread.is_locked && (
                            <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500">
                              Locked
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-base font-semibold text-stone-100 group-hover:text-teal-400 transition-colors leading-tight mb-1">
                          {thread.title}
                        </h3>
                        <p className="text-sm text-stone-400 line-clamp-1 mb-3">
                          {thread.content}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-stone-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(thread.created_at)}
                          </span>
                          <span className="text-stone-300">
                            by {thread.author_username}
                          </span>
                          <div className="flex items-center gap-3 ml-auto text-stone-400">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {thread.views}
                            </span>
                            <span className="flex items-center gap-1 hover:text-teal-400 transition-colors">
                              <MessageSquare className="w-3.5 h-3.5" />
                              {thread.reply_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => navigateToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-stone-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => navigateToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
