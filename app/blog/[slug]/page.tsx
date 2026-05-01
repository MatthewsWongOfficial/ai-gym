import { notFound } from "next/navigation"
import { getBlogBySlug, getRecentBlogs, getRelatedBlogs, getAdjacentBlogs } from "@/lib/services/blogService"
import BlogPostClient from "./blog-post-client"

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const blog = await getBlogBySlug(slug)

  if (!blog) {
    notFound()
  }

  const [recentBlogs, relatedBlogs, adjacent] = await Promise.all([
    getRecentBlogs(5),
    getRelatedBlogs(slug, blog.category, blog.tags || [], 4),
    getAdjacentBlogs(slug, blog.created_at),
  ])

  return (
    <BlogPostClient
      blog={blog}
      recentBlogs={recentBlogs}
      relatedBlogs={relatedBlogs}
      adjacentBlogs={adjacent}
    />
  )
}
