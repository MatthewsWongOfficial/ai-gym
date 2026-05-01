import { getBlogs } from "@/lib/services/blogService"
import BlogListClient from "./blog-list-client"

export const revalidate = 3600

export default async function BlogPage() {
  const blogs = await getBlogs(100)

  return <BlogListClient initialBlogs={blogs} />
}
