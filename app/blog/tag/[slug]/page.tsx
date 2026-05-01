import type { Metadata } from "next"
import Script from "next/script"
import { notFound } from "next/navigation"
import { getBlogsByTag, getAllTags } from "@/lib/services/blogService"
import BlogListClient from "../../blog-list-client"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags.map((tag) => ({ slug: tag.replace(/\s+/g, "-") }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tag = slug.replace(/-/g, " ")
  const blogs = await getBlogsByTag(tag, 1)

  if (blogs.length === 0) {
    return { title: "Tag Not Found | AI GymBRO" }
  }

  const title = `${tag.charAt(0).toUpperCase() + tag.slice(1)} Articles | AI GymBRO Blog`
  const description = `Browse ${blogs.length}+ articles about ${tag} including workout tips, nutrition advice, and fitness guides.`

  return {
    metadataBase: new URL("https://aigymbro.web.id"),
    title,
    description,
    keywords: [tag, `${tag} articles`, `${tag} tips`, "fitness blog", "workout guides"],
    alternates: {
      canonical: `https://aigymbro.web.id/blog/tag/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://aigymbro.web.id/blog/tag/${slug}`,
      siteName: "AI GymBRO",
      type: "website",
      images: [{ url: "https://aigymbro.web.id/og-image/blog.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://aigymbro.web.id/og-image/blog.png"],
    },
    robots: { index: true, follow: true },
  }
}

export default async function BlogTagPage({ params }: Props) {
  const { slug } = await params
  const tag = slug.replace(/-/g, " ")
  const blogs = await getBlogsByTag(tag, 100)

  if (blogs.length === 0) {
    notFound()
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Articles`,
    description: `Articles about ${tag} on AI GymBRO fitness blog.`,
    url: `https://aigymbro.web.id/blog/tag/${slug}`,
    isPartOf: { "@type": "WebSite", name: "AI GymBRO", url: "https://aigymbro.web.id" },
    hasPart: blogs.map((blog) => ({
      "@type": "BlogPosting",
      headline: blog.title,
      url: `https://aigymbro.web.id/blog/${blog.slug}`,
      datePublished: blog.created_at,
      author: { "@type": "Person", name: "Matthews Wong" },
    })),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://aigymbro.web.id/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://aigymbro.web.id/blog" },
        { "@type": "ListItem", position: 3, name: tag.charAt(0).toUpperCase() + tag.slice(1), item: `https://aigymbro.web.id/blog/tag/${slug}` },
      ],
    },
  }

  return (
    <>
      <Script id="tag-json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogListClient initialBlogs={blogs} />
    </>
  )
}
