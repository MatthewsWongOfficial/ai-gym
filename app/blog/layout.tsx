import type { Metadata } from "next"
import Script from "next/script"
import { getRecentBlogs } from "@/lib/services/blogService"

export const metadata: Metadata = {
  title: "Fitness Blog | AI GymBro - Expert Tips & Guides",
  description:
    "Explore our fitness blog for expert workout tips, nutrition guides, and health advice. Stay informed with daily articles on training, recovery, and healthy living.",
  keywords: [
    "fitness blog",
    "workout tips",
    "nutrition advice",
    "gym blog",
    "health articles",
    "exercise guides",
    "training tips",
    "fitness articles",
  ],
  alternates: {
    canonical: "https://aigymbro.web.id/blog",
    types: {
      "application/rss+xml": "https://aigymbro.web.id/blog/feed.xml",
    },
  },
  openGraph: {
    title: "Fitness Blog | AI GymBro",
    description:
      "Expert workout tips, nutrition guides, and health advice. Daily articles on training, recovery, and healthy living.",
    url: "https://aigymbro.web.id/blog",
    siteName: "AI GymBro",
    type: "website",
    images: [
      {
        url: "https://aigymbro.web.id/og-image/blog.png",
        width: 1200,
        height: 630,
        alt: "AI GymBro Fitness Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fitness Blog | AI GymBro",
    description:
      "Expert workout tips, nutrition guides, and health advice. Daily articles on training, recovery, and healthy living.",
    images: ["https://aigymbro.web.id/og-image/blog.png"],
  },
}

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const recentBlogs = await getRecentBlogs(20)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "AI GymBRO Fitness Blog",
    description: "Expert workout tips, nutrition guides, and health advice for your fitness journey.",
    url: "https://aigymbro.web.id/blog",
    publisher: {
      "@type": "Organization",
      name: "AI GymBRO",
      url: "https://aigymbro.web.id",
      logo: {
        "@type": "ImageObject",
        url: "https://aigymbro.web.id/android-chrome-512x512.png",
      },
    },
    blogPost: recentBlogs.map((blog, index) => ({
      "@type": "BlogPosting",
      position: index + 1,
      headline: blog.title,
      description: blog.excerpt,
      url: `https://aigymbro.web.id/blog/${blog.slug}`,
      datePublished: blog.created_at,
      author: {
        "@type": "Person",
        name: "Matthews Wong",
        url: "https://matthewswong.com",
      },
    })),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://aigymbro.web.id/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://aigymbro.web.id/blog" },
    ],
  }

  return (
    <>
      <Script
        id="blog-list-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="blog-breadcrumb-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  )
}
