import { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"

const baseUrl = "https://aigymbro.web.id"

const BLOG_CATEGORIES = ["fitness", "nutrition", "recovery", "mindset", "workout"]

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return null
  }
  return createClient(url, key)
}

interface BlogRow {
  slug: string
  updated_at: string
}

interface CategoryRow {
  slug: string
}

interface ThreadRow {
  slug: string
  category_slug: string
  updated_at: string
}

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/workout-plan`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/meal-plan`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/forum`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/author/matthews-wong`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]

  // Blog category pages
  const blogCategoryPages: MetadataRoute.Sitemap = BLOG_CATEGORIES.map((category) => ({
    url: `${baseUrl}/blog/category/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  let blogPages: MetadataRoute.Sitemap = []
  let forumCategoryPages: MetadataRoute.Sitemap = []
  let forumThreadPages: MetadataRoute.Sitemap = []

  const supabase = getSupabaseClient()
  
  if (supabase) {
    try {
      const { data: blogs } = await supabase
        .from("blogs")
        .select("slug, updated_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(100)

      if (blogs) {
        blogPages = (blogs as BlogRow[]).map((blog) => ({
          url: `${baseUrl}/blog/${blog.slug}`,
          lastModified: new Date(blog.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }))
      }

      const { data: categories } = await supabase
        .from("forum_categories")
        .select("slug")
        .order("sort_order")

      if (categories) {
        forumCategoryPages = (categories as CategoryRow[]).map((category) => ({
          url: `${baseUrl}/forum/${category.slug}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.6,
        }))
      }

      const { data: threads } = await supabase
        .from("forum_threads_with_author")
        .select("slug, category_slug, updated_at")
        .order("created_at", { ascending: false })
        .limit(200)

      if (threads) {
        forumThreadPages = (threads as ThreadRow[]).map((thread) => ({
          url: `${baseUrl}/forum/${thread.category_slug}/${thread.slug}`,
          lastModified: new Date(thread.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.5,
        }))
      }
    } catch {
      // If database fetch fails, continue with static pages only
    }
  }

  return [...staticPages, ...blogCategoryPages, ...blogPages, ...forumCategoryPages, ...forumThreadPages]
}
