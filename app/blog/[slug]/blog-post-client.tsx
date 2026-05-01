"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight, Clock, Calendar, Tag, BookOpen, AlertTriangle, List } from "lucide-react"
import { formatBlogDate, getCategoryColor, type Blog, type BlogSummary } from "@/lib/services/blogService"

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = []
  const regex = /^(#{2,3})\s+(.*$)/gim
  let match
  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].replace(/\*\*/g, "").trim()
    headings.push({ id: slugify(text), text, level })
  }
  return headings
}

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.*$)/gim, (_match, p1) => {
      const id = slugify(p1.replace(/\*\*/g, ""))
      return `<h3 id="${id}" class="text-lg font-bold text-white mt-6 mb-3 scroll-mt-24">${p1}</h3>`
    })
    .replace(/^## (.*$)/gim, (_match, p1) => {
      const id = slugify(p1.replace(/\*\*/g, ""))
      return `<h2 id="${id}" class="text-xl font-bold text-white mt-8 mb-4 scroll-mt-24">${p1}</h2>`
    })
    .replace(/^# (.*$)/gim, (_match, p1) => {
      const id = slugify(p1.replace(/\*\*/g, ""))
      return `<h1 id="${id}" class="text-2xl font-bold text-white mt-8 mb-4 scroll-mt-24">${p1}</h1>`
    })
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold italic">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 mb-2 text-stone-300">$1</li>')
    .replace(/(<li.*<\/li>)\n(?=<li)/g, '$1')
    .replace(/(<li.*<\/li>)(?!\n<li)/g, '<ul class="list-disc list-inside mb-4 space-y-1">$1</ul>')
    .replace(/^\d+\.\s+(.*$)/gim, '<li class="ml-4 mb-2 text-stone-300">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-teal-400 hover:text-teal-300 underline">$1</a>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-stone-800 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm text-stone-300">$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-stone-800 px-1.5 py-0.5 rounded text-teal-400 text-sm">$1</code>')
    .replace(/\n\n/g, '</p><p class="text-stone-300 leading-relaxed mb-4">')
    .replace(/\n/g, '<br />')
}

interface AdjacentBlog {
  slug: string
  title: string
}

interface BlogPostClientProps {
  blog: Blog
  recentBlogs: BlogSummary[]
  relatedBlogs: BlogSummary[]
  adjacentBlogs: {
    prev: AdjacentBlog | null
    next: AdjacentBlog | null
  }
}

export default function BlogPostClient({ blog, recentBlogs, relatedBlogs, adjacentBlogs }: BlogPostClientProps) {
  const filteredRecent = recentBlogs.filter(b => b.slug !== blog.slug)

  return (
    <div className="min-h-screen bg-stone-950 pt-20 pb-12">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a8a29e05_1px,transparent_1px),linear-gradient(to_bottom,#a8a29e05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-stone-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <article className="bg-stone-900/50 border border-stone-800/50 rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-stone-800/50">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${getCategoryColor(blog.category)}`}>
                {blog.category}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-stone-500">
                <Clock className="w-4 h-4" />
                {blog.read_time} min read
              </span>
              <span className="flex items-center gap-1.5 text-sm text-stone-500">
                <Calendar className="w-4 h-4" />
                {formatBlogDate(blog.created_at)}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {blog.title}
            </h1>
            
            <p className="text-lg text-stone-400">
              {blog.excerpt}
            </p>

            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Tag className="w-4 h-4 text-stone-500" />
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-stone-800/50 text-stone-400 text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-stone-800/50">
              <img 
                src="/images/matthews-wong.jpeg" 
                alt="Matthews Wong"
                className="w-10 h-10 rounded-full object-cover border-2 border-teal-500/30"
              />
              <div>
                <p className="text-sm font-medium text-white">Matthews Wong</p>
                <a href="https://matthewswong.com" target="_blank" rel="noopener noreferrer" className="text-xs text-teal-400 hover:text-teal-300">
                  matthewswong.com
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Table of Contents */}
            {(() => {
              const headings = extractHeadings(blog.content)
              if (headings.length >= 3) {
                return (
                  <nav className="mb-8 p-4 bg-stone-800/30 border border-stone-700/50 rounded-xl">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                      <List className="w-4 h-4 text-teal-400" />
                      Table of Contents
                    </h2>
                    <ul className="space-y-1.5">
                      {headings.map((heading) => (
                        <li key={heading.id} className={heading.level === 3 ? "ml-4" : ""}>
                          <a
                            href={`#${heading.id}`}
                            className="text-sm text-stone-400 hover:text-teal-400 transition-colors"
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )
              }
              return null
            })()}

            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300/90">
                <span className="font-medium">Disclaimer:</span> I am just a gym enthusiast sharing my knowledge and experience. 
                If you find any incorrect information, please feel free to comment on our{" "}
                <a href="/forum" className="text-amber-400 hover:text-amber-300 underline">forums</a>.
              </p>
            </div>

            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: `<p class="text-stone-300 leading-relaxed mb-4">${renderMarkdown(blog.content)}</p>` 
              }}
            />

            {/* Cross-links to tools */}
            <div className="mt-8 p-4 bg-stone-800/30 border border-stone-700/50 rounded-xl">
              <p className="text-sm text-stone-400 mb-3">
                <strong className="text-white">Put this into practice:</strong> Try our AI-powered tools to create personalized plans based on what you learned.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/workout-plan"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-lg text-sm text-teal-400 hover:bg-teal-500/20 transition-colors"
                >
                  Generate Workout Plan
                </Link>
                <Link
                  href="/meal-plan"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  Generate Meal Plan
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Prev/Next Navigation */}
        {(adjacentBlogs.prev || adjacentBlogs.next) && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adjacentBlogs.prev && (
              <Link
                href={`/blog/${adjacentBlogs.prev.slug}`}
                className="group flex items-center gap-3 bg-stone-900/50 border border-stone-800/50 rounded-xl p-4 hover:border-teal-500/30 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-stone-500 group-hover:text-teal-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-stone-500 mb-1">Previous</p>
                  <p className="text-sm font-medium text-white group-hover:text-teal-400 transition-colors truncate">
                    {adjacentBlogs.prev.title}
                  </p>
                </div>
              </Link>
            )}
            {adjacentBlogs.next && (
              <Link
                href={`/blog/${adjacentBlogs.next.slug}`}
                className="group flex items-center justify-end gap-3 bg-stone-900/50 border border-stone-800/50 rounded-xl p-4 hover:border-teal-500/30 transition-all sm:col-start-2"
              >
                <div className="min-w-0 text-right">
                  <p className="text-xs text-stone-500 mb-1">Next</p>
                  <p className="text-sm font-medium text-white group-hover:text-teal-400 transition-colors truncate">
                    {adjacentBlogs.next.title}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-stone-500 group-hover:text-teal-400 flex-shrink-0" />
              </Link>
            )}
          </div>
        )}

        {/* Related Posts (server-rendered, same category) */}
        {relatedBlogs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-400" />
              Related Articles
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedBlogs.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-stone-900/50 border border-stone-800/50 rounded-xl p-4 hover:border-teal-500/30 transition-all"
                >
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border capitalize mb-2 ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                  <h3 className="font-medium text-white group-hover:text-teal-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-2">
                    {formatBlogDate(post.created_at)} · {post.read_time} min read
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* More Articles */}
        {filteredRecent.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-400" />
              More Articles
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredRecent.slice(0, 4).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-stone-900/50 border border-stone-800/50 rounded-xl p-4 hover:border-teal-500/30 transition-all"
                >
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border capitalize mb-2 ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                  <h3 className="font-medium text-white group-hover:text-teal-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-2">
                    {formatBlogDate(post.created_at)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
