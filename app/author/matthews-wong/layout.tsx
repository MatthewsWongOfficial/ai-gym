import type { Metadata } from "next"
import Script from "next/script"

export const metadata: Metadata = {
  title: "Matthews Wong - Fitness Writer & AI GymBRO Founder",
  description:
    "Matthews Wong is the founder and developer of AI GymBRO, a fitness enthusiast from Indonesia who writes about workout programming, nutrition, and AI-powered fitness tools.",
  keywords: [
    "Matthews Wong",
    "AI GymBRO founder",
    "fitness writer",
    "Indonesia fitness",
    "AI fitness developer",
    "workout author",
  ],
  alternates: {
    canonical: "https://aigymbro.web.id/author/matthews-wong",
  },
  openGraph: {
    title: "Matthews Wong - Fitness Writer & AI GymBRO Founder",
    description:
      "Founder and developer of AI GymBRO. Fitness enthusiast writing about workout programming, nutrition, and AI-powered fitness tools.",
    url: "https://aigymbro.web.id/author/matthews-wong",
    siteName: "AI GymBRO",
    type: "profile",
    images: [{ url: "https://aigymbro.web.id/og-image/main.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Matthews Wong - AI GymBRO Founder",
    description: "Fitness enthusiast and developer writing about workout programming, nutrition, and AI fitness.",
    images: ["https://aigymbro.web.id/og-image/main.png"],
    creator: "@MatthewsWong",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: "Matthews Wong",
      alternateName: "matthewswong",
      description:
        "Founder and developer of AI GymBRO. Fitness enthusiast from Indonesia who writes about workout programming, nutrition, and AI-powered fitness tools.",
      url: "https://aigymbro.web.id/author/matthews-wong",
      image: "https://aigymbro.web.id/images/matthews-wong.jpeg",
      jobTitle: "Founder & Developer",
      worksFor: {
        "@type": "Organization",
        name: "AI GymBRO",
        url: "https://aigymbro.web.id",
      },
      address: {
        "@type": "PostalAddress",
        addressCountry: "ID",
        addressLocality: "Indonesia",
      },
      sameAs: [
        "https://matthewswong.com",
        "https://linkedin.com/in/matthewswong",
        "https://github.com/matthewswong",
      ],
      knowsAbout: [
        "Fitness Training",
        "Workout Programming",
        "Nutrition Planning",
        "Artificial Intelligence",
        "Web Development",
      ],
    },
  }

  return (
    <>
      <Script
        id="author-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
