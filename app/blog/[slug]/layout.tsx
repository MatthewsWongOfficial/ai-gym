import type { Metadata } from "next"
import Script from "next/script"
import { getBlogBySlug } from "@/lib/services/blogService"

type Props = {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

function extractFAQFromContent(content: string): { question: string; answer: string }[] {
  if (!content) return []

  const faqs: { question: string; answer: string }[] = []
  const questionPatterns = /^(#{2,3})\s+(how|what|why|when|can|is|are|do|does|should|will)\s+.+/i
  const lines = content.split("\n")

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (questionPatterns.test(line)) {
      const question = line.replace(/^#{2,3}\s+/, "").replace(/[?.]$/, "").trim()
      let answer = ""
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim()
        if (nextLine.startsWith("#")) break
        if (nextLine && !nextLine.startsWith("-") && !nextLine.startsWith("*")) {
          answer = nextLine.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").slice(0, 300)
          break
        }
      }
      if (question && answer) {
        faqs.push({ question, answer })
      }
    }
  }

  return faqs.slice(0, 5)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)

  if (!blog) {
    return {
      title: "Blog Post Not Found | AI GymBRO",
      description: "The requested blog post could not be found.",
    }
  }

  const title = `${blog.title} | AI GymBRO Blog`
  const baseDescription = blog.excerpt || `Learn about ${blog.title.toLowerCase()} with practical tips and expert advice.`
  const description = baseDescription.length < 140
    ? `${baseDescription} Read the full ${blog.category} article on AI GymBRO.`
    : baseDescription.slice(0, 155)
  const ogImageUrl = `https://aigymbro.web.id/api/og/blog?title=${encodeURIComponent(blog.title)}&category=${encodeURIComponent(blog.category)}&date=${encodeURIComponent(new Date(blog.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }))}`

  return {
    metadataBase: new URL("https://aigymbro.web.id"),
    title,
    description,
    keywords: [
      ...(blog.tags || []),
      blog.category,
      "fitness blog",
      "nutrition tips",
      "AI fitness",
      "health advice",
      "workout tips",
    ],
    authors: [
      {
        name: blog.author || "AI GymBRO",
        url: "https://www.matthewswong.com",
      },
    ],
    creator: blog.author || "AI GymBRO",
    publisher: "AI GymBRO",
    category: "Health & Fitness",
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: blog.created_at,
      modifiedTime: blog.updated_at,
      authors: [blog.author || "AI GymBRO"],
      tags: blog.tags,
      siteName: "AI GymBRO",
      locale: "en_US",
      url: `https://aigymbro.web.id/blog/${slug}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `https://aigymbro.web.id/blog/${slug}`,
    },
  }
}

export default async function BlogPostLayout({ children, params }: Props) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)

  const ogImageUrl = blog
    ? `https://aigymbro.web.id/api/og/blog?title=${encodeURIComponent(blog.title)}&category=${encodeURIComponent(blog.category)}&date=${encodeURIComponent(new Date(blog.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }))}`
    : "https://aigymbro.web.id/og-image/blog.png"

  const articleJsonLd = blog
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: blog.title,
        description: blog.excerpt,
        datePublished: blog.created_at,
        dateModified: blog.updated_at,
        author: {
          "@type": "Person",
          name: blog.author || "Matthews Wong",
          url: "https://matthewswong.com",
        },
        publisher: {
          "@type": "Organization",
          name: "AI GymBRO",
          url: "https://aigymbro.web.id",
          logo: {
            "@type": "ImageObject",
            url: "https://aigymbro.web.id/android-chrome-512x512.png",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://aigymbro.web.id/blog/${slug}`,
        },
        image: { "@type": "ImageObject", url: ogImageUrl, width: 1200, height: 630 },
        keywords: blog.tags?.join(", "),
        articleSection: blog.category,
        wordCount: blog.content?.split(/\s+/).length || 0,
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://aigymbro.web.id/" },
            { "@type": "ListItem", position: 2, name: "Blog", item: "https://aigymbro.web.id/blog" },
            { "@type": "ListItem", position: 3, name: blog.title, item: `https://aigymbro.web.id/blog/${slug}` },
          ],
        },
      }
    : null

  const faqs = blog ? extractFAQFromContent(blog.content) : []
  const faqJsonLd = faqs.length >= 2
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null

  return (
    <>
      {articleJsonLd && (
        <Script
          id="blog-post-json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      {faqJsonLd && (
        <Script
          id="blog-faq-json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {children}
    </>
  )
}
