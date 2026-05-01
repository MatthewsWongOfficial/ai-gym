"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { formatBlogDate, getCategoryColor, type Blog } from "@/lib/services/blogService"
import { BackToTop } from "@/components/back-to-top"

const BLOGS_PER_PAGE = 9

interface BlogListClientProps {
  initialBlogs: Blog[]
}

export default function BlogListClient({ initialBlogs }: BlogListClientProps) {
  const [blogs] = useState<Blog[]>(initialBlogs)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const categories = ["all", "fitness", "nutrition", "recovery", "mindset", "workout"]
  
  const filteredBlogs = selectedCategory && selectedCategory !== "all"
    ? blogs.filter(blog => blog.category === selectedCategory)
    : blogs

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  const totalPages = Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE)
  const startIndex = (currentPage - 1) * BLOGS_PER_PAGE
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + BLOGS_PER_PAGE)

  return (
    <div className="min-h-screen bg-stone-950 pt-20 pb-12">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a8a29e05_1px,transparent_1px),linear-gradient(to_bottom,#a8a29e05_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Fitness{" "}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Blog
            </span>
          </h1>
          
          <p className="text-stone-400 text-lg max-w-lg mx-auto">
            Sharing tips, workout guides, and nutrition advice to fuel your fitness journey.
          </p>
        </div>

        <div className="relative mb-10">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap sm:justify-center sm:overflow-visible">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === "all" ? null : category)}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm font-semibold transition-all duration-200 capitalize whitespace-nowrap flex-shrink-0 ${
                  (category === "all" && !selectedCategory) || selectedCategory === category
                    ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25"
                    : "bg-stone-800/60 text-stone-400 hover:bg-stone-700/60 hover:text-white border border-stone-700/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-stone-800/50 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-stone-600" />
            </div>
            <h3 className="text-xl font-semibold text-stone-300 mb-2">No articles found</h3>
            <p className="text-stone-500">Check back soon for new content!</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedBlogs.map((blog, index) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className={`group relative bg-gradient-to-b from-stone-900/80 to-stone-900/40 border border-stone-800/60 rounded-2xl overflow-hidden hover:border-teal-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/10 sm:hover:-translate-y-1 ${
                    index === 0 && currentPage === 1 ? "sm:col-span-2" : ""
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative p-5 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <span className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold border capitalize ${getCategoryColor(blog.category)}`}>
                        {blog.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-stone-500">
                        <Clock className="w-3.5 h-3.5" />
                        {blog.read_time} min
                      </span>
                    </div>
                    
                    <h2 className={`font-bold text-white mb-2 sm:mb-3 group-hover:text-teal-400 transition-colors leading-tight ${
                      index === 0 && currentPage === 1 ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
                    }`}>
                      {blog.title}
                    </h2>
                    
                    <p className={`text-stone-400 mb-4 sm:mb-5 line-clamp-2 ${index === 0 && currentPage === 1 ? "text-sm sm:text-base" : "text-sm"}`}>
                      {blog.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-stone-800/50">
                      <time dateTime={blog.created_at} className="text-xs text-stone-500 font-medium">
                        {formatBlogDate(blog.created_at)}
                      </time>
                      <span className="flex items-center gap-1.5 text-teal-400 text-sm font-semibold group-hover:gap-2.5 transition-all">
                        Read
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-stone-800/60 border border-stone-700/50 text-stone-400 hover:text-white hover:bg-stone-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const showPage = page === 1 || page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    const showEllipsis = page === currentPage - 2 || page === currentPage + 2
                    
                    if (!showPage && !showEllipsis) return null
                    if (showEllipsis) return <span key={page} className="px-1 text-stone-500">...</span>
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                          currentPage === page
                            ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25"
                            : "bg-stone-800/60 border border-stone-700/50 text-stone-400 hover:text-white hover:bg-stone-700/60"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-stone-800/60 border border-stone-700/50 text-stone-400 hover:text-white hover:bg-stone-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <p className="text-center text-sm text-stone-500 mt-4">
              Showing {startIndex + 1}-{Math.min(startIndex + BLOGS_PER_PAGE, filteredBlogs.length)} of {filteredBlogs.length} articles
            </p>
          </>
        )}
      </div>
      <BackToTop />
    </div>
  )
}
