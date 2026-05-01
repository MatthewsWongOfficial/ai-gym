import Link from "next/link"
import { BookOpen, ArrowLeft } from "lucide-react"
import { getRecentBlogs, formatBlogDate, getCategoryColor } from "@/lib/services/blogService"

export default async function BlogNotFound() {
  const recentBlogs = await getRecentBlogs(6)

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

        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-stone-800/50 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-stone-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Blog Post Not Found</h1>
          <p className="text-stone-400 max-w-md mx-auto">
            This article may have been removed or the URL is incorrect. Check out our recent articles below.
          </p>
        </div>

        {recentBlogs.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Recent Articles</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group bg-stone-900/50 border border-stone-800/50 rounded-xl p-4 hover:border-teal-500/30 transition-all"
                >
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border capitalize mb-2 ${getCategoryColor(blog.category)}`}>
                    {blog.category}
                  </span>
                  <h3 className="font-medium text-white group-hover:text-teal-400 transition-colors line-clamp-2 text-sm">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-2">
                    {formatBlogDate(blog.created_at)}
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
