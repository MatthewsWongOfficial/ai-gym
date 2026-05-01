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
  // Process tables first
  const tableRegex = /^\|(.+)\|\s*\n\|[-\s|:]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm
  const withTables = content.replace(tableRegex, (_match, headerLine, bodyLines) => {
    const headers = headerLine.split("|").map((h: string) => h.trim()).filter(Boolean)
    const rows = bodyLines.trim().split("\n").map((line: string) =>
      line.split("|").map((c: string) => c.trim()).filter(Boolean)
    )
    const headerHtml = headers
      .map((h: string) => `<th class="px-4 py-3 text-left text-sm font-semibold text-white border-b border-stone-700">${formatInline(h)}</th>`)
      .join("")
    const bodyHtml = rows
      .map((row: string[]) =>
        `<tr>${row.map((cell: string) => `<td class="px-4 py-3 text-sm text-stone-300 border-b border-stone-800">${formatInline(cell)}</td>`).join("")}</tr>`
      )
      .join("")
    return `\n\n<div class="overflow-x-auto my-6"><table class="w-full border-collapse bg-stone-900/50 border border-stone-800/50 rounded-xl overflow-hidden"><thead class="bg-stone-800/50"><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>\n\n`
  })

  // Process code blocks first (preserve them)
  const codeBlocks: string[] = []
  const withCodeBlocks = withTables.replace(/```([\s\S]*?)```/g, (_match, code) => {
    codeBlocks.push(`<pre class="bg-stone-800 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm text-stone-300">${code}</code></pre>`)
    return `\n\n__CODEBLOCK_${codeBlocks.length - 1}__\n\n`
  })

  // Split into blocks by double newline
  const blocks = withCodeBlocks.split(/\n\n+/)
  
  const rendered = blocks.map(block => {
    const trimmed = block.trim()
    if (!trimmed) return ""

    // Restore code blocks
    const codeMatch = trimmed.match(/^__CODEBLOCK_(\d+)__$/)
    if (codeMatch) return codeBlocks[parseInt(codeMatch[1])]

    // Horizontal rule
    if (/^---+$/.test(trimmed)) return '<hr class="border-stone-800 my-8" />'

    // Headings — h1 in content becomes h2 (page title is already h1)
    if (/^### /.test(trimmed)) {
      const text = trimmed.replace(/^### /, "")
      const id = slugify(text.replace(/\*\*/g, ""))
      return `<h3 id="${id}" class="text-base font-semibold text-stone-200 mt-8 mb-3 pb-2 border-b border-stone-800/50 scroll-mt-24">${formatInline(text)}</h3>`
    }
    if (/^## /.test(trimmed)) {
      const text = trimmed.replace(/^## /, "")
      const id = slugify(text.replace(/\*\*/g, ""))
      return `<h2 id="${id}" class="text-lg font-bold text-white mt-10 mb-4 pb-2 border-b border-teal-500/30 scroll-mt-24">${formatInline(text)}</h2>`
    }
    // # in content → h2 (avoid multiple h1 on page)
    if (/^# /.test(trimmed)) {
      const text = trimmed.replace(/^# /, "")
      const id = slugify(text.replace(/\*\*/g, ""))
      return `<h2 id="${id}" class="text-lg font-bold text-white mt-10 mb-4 pb-2 border-b border-teal-500/30 scroll-mt-24">${formatInline(text)}</h2>`
    }

    // Unordered list
    if (/^[-*] /.test(trimmed)) {
      const items = trimmed.split("\n").map(line => {
        const itemText = line.replace(/^\s*[-*]\s+/, "")
        return `<li class="text-stone-300 leading-7">${formatInline(itemText)}</li>`
      }).join("")
      return `<ul class="list-disc pl-5 mb-5 space-y-2 marker:text-teal-500">${items}</ul>`
    }

    // Ordered list
    if (/^\d+\. /.test(trimmed)) {
      const items = trimmed.split("\n").map(line => {
        const itemText = line.replace(/^\d+\.\s+/, "")
        return `<li class="text-stone-300 leading-7">${formatInline(itemText)}</li>`
      }).join("")
      return `<ol class="list-decimal pl-5 mb-5 space-y-2 marker:text-teal-500">${items}</ol>`
    }

    // Already processed HTML (tables, divs)
    if (/^<(div|table|pre|ul|ol|h[1-6])/.test(trimmed)) return trimmed

    // Regular paragraph
    return `<p class="text-stone-300 leading-7 mb-5">${formatInline(trimmed.replace(/\n/g, "<br />"))}</p>`
  }).join("")

  return rendered
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold italic">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-stone-800 px-1 py-0.5 rounded text-teal-400 text-xs">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-teal-400 hover:text-teal-300 underline">$1</a>')
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
  const relatedSlugs = new Set(relatedBlogs.map(b => b.slug))
  const moreArticles = recentBlogs.filter(b => b.slug !== blog.slug && !relatedSlugs.has(b.slug))

  return (
    <div className="min-h-screen bg-stone-950 pt-20 pb-12">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a8a29e05_1px,transparent_1px),linear-gradient(to_bottom,#a8a29e05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <nav aria-label="Breadcrumb">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-stone-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </nav>

        <article className="bg-stone-900/50 border border-stone-800/50 rounded-2xl overflow-hidden" itemScope itemType="https://schema.org/BlogPosting">
          <header className="p-6 sm:p-8 border-b border-stone-800/50">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Link
                href={`/blog/category/${blog.category}`}
                className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${getCategoryColor(blog.category)}`}
              >
                {blog.category}
              </Link>
              <span className="flex items-center gap-1.5 text-sm text-stone-500">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>{blog.read_time} min read</span>
              </span>
              <time
                dateTime={blog.created_at}
                className="flex items-center gap-1.5 text-sm text-stone-500"
                itemProp="datePublished"
              >
                <Calendar className="w-4 h-4" aria-hidden="true" />
                {formatBlogDate(blog.created_at)}
              </time>
              <meta itemProp="dateModified" content={blog.updated_at} />
              {blog.updated_at !== blog.created_at && (
                <span className="text-xs text-stone-600">
                  (Updated {formatBlogDate(blog.updated_at)})
                </span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4" itemProp="headline">
              {blog.title}
            </h1>
            
            <p className="text-lg text-stone-400" itemProp="description">
              {blog.excerpt}
            </p>

            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Tag className="w-4 h-4 text-stone-500" aria-hidden="true" />
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

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-stone-800/50" itemProp="author" itemScope itemType="https://schema.org/Person">
              <img 
                src="/images/matthews-wong.jpeg" 
                alt="Matthews Wong"
                width={40}
                height={40}
                loading="lazy"
                className="w-10 h-10 rounded-full object-cover border-2 border-teal-500/30"
              />
              <div>
                <p className="text-sm font-medium text-white" itemProp="name">Matthews Wong</p>
                <a href="https://matthewswong.com" target="_blank" rel="noopener noreferrer" className="text-xs text-teal-400 hover:text-teal-300" itemProp="url">
                  matthewswong.com
                </a>
              </div>
            </div>
          </header>

          <div className="p-6 sm:p-8">
            {/* Table of Contents */}
            {(() => {
              const headings = extractHeadings(blog.content)
              if (headings.length >= 3) {
                return (
                  <nav className="mb-8 p-4 bg-stone-800/30 border border-stone-700/50 rounded-xl" aria-label="Table of contents">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-teal-400 mb-3 uppercase tracking-wider">
                      <List className="w-4 h-4" aria-hidden="true" />
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

            <aside className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-amber-300/90">
                <span className="font-medium">Disclaimer:</span> I am just a gym enthusiast sharing my knowledge and experience. 
                If you find any incorrect information, please feel free to comment on our{" "}
                <a href="/forum" className="text-amber-400 hover:text-amber-300 underline">forums</a>.
              </p>
            </aside>

            <section 
              className="prose prose-invert max-w-none text-stone-300"
              itemProp="articleBody"
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdown(blog.content)
              }}
            />

            {/* Cross-links to tools */}
            <aside className="mt-8 p-4 bg-stone-800/30 border border-stone-700/50 rounded-xl">
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
            </aside>
          </div>
        </article>

        {/* Prev/Next Navigation */}
        {(adjacentBlogs.prev || adjacentBlogs.next) && (
          <nav className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Blog post navigation">
            {adjacentBlogs.prev && (
              <Link
                href={`/blog/${adjacentBlogs.prev.slug}`}
                className="group flex items-center gap-3 bg-stone-900/50 border border-stone-800/50 rounded-xl p-4 hover:border-teal-500/30 transition-all"
                rel="prev"
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
                rel="next"
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
          </nav>
        )}

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <section className="mt-12" aria-label="Related articles">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-400" aria-hidden="true" />
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
                  <time dateTime={post.created_at} className="text-xs text-stone-500 mt-2 block">
                    {formatBlogDate(post.created_at)} · {post.read_time} min read
                  </time>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* More Articles */}
        {moreArticles.length > 0 && (
          <section className="mt-12" aria-label="More articles">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-400" aria-hidden="true" />
              More Articles
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {moreArticles.slice(0, 4).map((post) => (
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
                  <time dateTime={post.created_at} className="text-xs text-stone-500 mt-2 block">
                    {formatBlogDate(post.created_at)}
                  </time>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
