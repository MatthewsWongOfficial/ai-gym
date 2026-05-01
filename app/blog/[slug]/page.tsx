import { notFound } from "next/navigation"
import { getBlogBySlug, getRecentBlogs, getRelatedBlogs, getAdjacentBlogs, getBlogs } from "@/lib/services/blogService"
import BlogPostClient from "./blog-post-client"

export const revalidate = 3600

export async function generateStaticParams() {
  const blogs = await getBlogs(100)
  return blogs.map((blog) => ({ slug: blog.slug }))
}

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
