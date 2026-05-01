import Link from "next/link"
import { getBlogs, formatBlogDate, getCategoryColor } from "@/lib/services/blogService"
import { BookOpen, MapPin, Globe, Github, Linkedin, ArrowRight, Clock } from "lucide-react"

export default async function AuthorPage() {
  const blogs = await getBlogs(20)

  return (
    <div className="min-h-screen bg-stone-950 pt-20 pb-12">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a8a29e05_1px,transparent_1px),linear-gradient(to_bottom,#a8a29e05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Author Header */}
        <div className="bg-stone-900/50 border border-stone-800/50 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src="/images/matthews-wong.jpeg"
              alt="Matthews Wong"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-teal-500/30"
            />
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Matthews Wong</h1>
              <p className="text-teal-400 font-medium mb-3">Founder & Developer, AI GymBRO</p>
              <p className="text-stone-400 mb-4">
                Fitness enthusiast from Indonesia who writes about workout programming, nutrition, and
                AI-powered fitness tools. Building AI GymBRO to help people achieve their fitness goals
                with personalized plans.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Indonesia
                </span>
                <a href="https://matthewswong.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300">
                  <Globe className="w-4 h-4" />
                  matthewswong.com
                </a>
                <a href="https://github.com/matthewswong" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                <a href="https://linkedin.com/in/matthewswong" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            Articles by Matthews Wong
          </h2>

          <div className="grid gap-4">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group bg-stone-900/50 border border-stone-800/50 rounded-xl p-5 hover:border-teal-500/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${getCategoryColor(blog.category)}`}>
                    {blog.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Clock className="w-3.5 h-3.5" />
                    {blog.read_time} min
                  </span>
                  <span className="text-xs text-stone-500">
                    {formatBlogDate(blog.created_at)}
                  </span>
                </div>
                <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors mb-1">
                  {blog.title}
                </h3>
                <p className="text-sm text-stone-400 line-clamp-2">{blog.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
