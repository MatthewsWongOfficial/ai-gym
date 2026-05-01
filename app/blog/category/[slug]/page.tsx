import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBlogsByCategory } from "@/lib/services/blogService"
import BlogListClient from "../../blog-list-client"

const VALID_CATEGORIES = ["fitness", "nutrition", "recovery", "mindset", "workout"]

const CATEGORY_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  fitness: {
    title: "Fitness Articles | AI GymBRO Blog",
    description: "Browse our collection of fitness articles covering strength training, muscle building, exercise techniques, and workout programming.",
    keywords: ["fitness articles", "strength training", "muscle building", "exercise guides", "workout tips"],
  },
  nutrition: {
    title: "Nutrition Articles | AI GymBRO Blog",
    description: "Explore nutrition articles about meal planning, macros, supplements, protein, and healthy eating for fitness goals.",
    keywords: ["nutrition articles", "meal planning", "macros", "protein", "diet tips", "supplements"],
  },
  recovery: {
    title: "Recovery Articles | AI GymBRO Blog",
    description: "Read about recovery techniques including sleep, stretching, foam rolling, rest days, and injury prevention.",
    keywords: ["recovery articles", "muscle recovery", "stretching", "foam rolling", "rest days", "sleep"],
  },
  mindset: {
    title: "Mindset Articles | AI GymBRO Blog",
    description: "Discover articles on fitness motivation, mental toughness, goal setting, and building a sustainable exercise habit.",
    keywords: ["fitness motivation", "mental toughness", "goal setting", "mindset", "habit building"],
  },
  workout: {
    title: "Workout Articles | AI GymBRO Blog",
    description: "Find workout guides, training splits, exercise routines, and programming tips for all fitness levels.",
    keywords: ["workout guides", "training splits", "exercise routines", "workout programs", "gym tips"],
  },
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  if (!VALID_CATEGORIES.includes(slug)) {
    return { title: "Category Not Found | AI GymBRO" }
  }

  const meta = CATEGORY_META[slug]

  return {
    metadataBase: new URL("https://aigymbro.web.id"),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: `https://aigymbro.web.id/blog/category/${slug}`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://aigymbro.web.id/blog/category/${slug}`,
      siteName: "AI GymBRO",
      type: "website",
      images: [{ url: "https://aigymbro.web.id/og-image/blog.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["https://aigymbro.web.id/og-image/blog.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params

  if (!VALID_CATEGORIES.includes(slug)) {
    notFound()
  }

  const blogs = await getBlogsByCategory(slug, 100)

  return <BlogListClient initialBlogs={blogs} />
}
