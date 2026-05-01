import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Navbar } from "../components/Navbar"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL("https://aigymbro.web.id"),
  title: "AI GymBRO - Personalized AI Workout & Meal Plans | Fitness Training",
  description: "Transform your fitness with AI GymBRO's personalized workout plans, custom meal plans, and expert fitness training powered by artificial intelligence. Founded and Developed by Matthews Wong from Indonesia.",
  keywords: "AI workout plans, fitness AI, personalized meal plans, gym training app, custom workout generator, fitness meal planning, strength training AI, muscle building app, weight loss program, AI fitness coach",
  authors: [{ name: "Matthews Wong" }],
  creator: "Matthews Wong",
  publisher: "AI GymBRO",
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "AI GymBRO - Personalized AI Workout & Meal Plans",
    description: "Get custom workout and meal plans tailored to your fitness goals using advanced AI technology. Founded and Developed by Matthews Wong from Indonesia.",
    type: "website",
    locale: "en_US",
    url: "https://aigymbro.web.id",
    siteName: "AI GymBRO",
    images: [
      {
        url: "/og-image/main.png",
        width: 1200,
        height: 630,
        alt: "AI GymBRO - Your AI Fitness Partner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI GymBRO - Personalized AI Workout & Meal Plans",
    description: "Custom AI-generated fitness and nutrition plans for your goals. Founded by Matthews Wong from Indonesia.",
    images: ["/og-image/main.png"],
    creator: "@MatthewsWong",
    site: "@AIGymBRO",
  },
  category: "Health & Fitness",
  applicationName: "AI GymBRO",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://aigymbro.web.id/#website",
      url: "https://aigymbro.web.id",
      name: "AI GymBRO",
      description: "Personalized AI Workout & Meal Plans | Fitness Training",
      inLanguage: "en-US",
      publisher: {
        "@id": "https://aigymbro.web.id/#person"
      },
      mainEntity: {
        "@id": "https://aigymbro.web.id/#webapp"
      },
      hasPart: [
        {
          "@type": "WebPage",
          "@id": "https://aigymbro.web.id/#homepage",
          url: "https://aigymbro.web.id/",
          name: "AI GymBRO - Home",
          description: "Transform your fitness with AI-powered workout and meal plans"
        },
        {
          "@type": "WebPage",
          "@id": "https://aigymbro.web.id/about#webpage",
          url: "https://aigymbro.web.id/about",
          name: "About AI GymBRO",
          description: "Learn about AI GymBRO and Matthews Wong, the founder from Indonesia"
        },
        {
          "@type": "WebPage",
          "@id": "https://aigymbro.web.id/workout-plan#webpage",
          url: "https://aigymbro.web.id/workout-plan",
          name: "AI Workout Plans",
          description: "Generate personalized workout plans using artificial intelligence"
        },
        {
          "@type": "WebPage",
          "@id": "https://aigymbro.web.id/meal-plan#webpage",
          url: "https://aigymbro.web.id/meal-plan",
          name: "AI Meal Plans",
          description: "Create custom meal plans tailored to your fitness goals"
        }
      ]
    },
    {
      "@type": "Person",
      "@id": "https://aigymbro.web.id/#person",
      name: "Matthews Wong",
      jobTitle: "AI Fitness App Developer",
      address: {
        "@type": "PostalAddress",
        addressCountry: "ID",
        addressLocality: "Indonesia"
      },
      url: "https://matthewswong.com",
      sameAs: [
        "https://matthewswong.com",
        "https://linkedin.com/in/matthewswong",
        "https://github.com/matthewswong"
      ],
      knowsAbout: [
        "Artificial Intelligence",
        "Fitness Training",
        "Web Development",
        "Nutrition Planning"
      ]
    },
    {
      "@type": "WebApplication",
      "@id": "https://aigymbro.web.id/#webapp",
      name: "AI GymBRO",
      description: "Transform your fitness with AI GymBRO's personalized workout plans, custom meal plans, and expert fitness training powered by artificial intelligence.",
      url: "https://aigymbro.web.id",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock"
      },
      creator: {
        "@id": "https://aigymbro.web.id/#person"
      },
      featureList: [
        "AI-powered workout plan generation",
        "Personalized meal planning",
        "Custom fitness training programs",
        "Progress tracking",
        "Nutrition guidance",
        "Exercise recommendations"
      ],
      screenshot: "https://aigymbro.web.id/android-chrome-512x512.png",
      mainEntityOfPage: [
        "https://aigymbro.web.id/",
        "https://aigymbro.web.id/about",
        "https://aigymbro.web.id/workout-plan",
        "https://aigymbro.web.id/meal-plan"
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://aigymbro.web.id/#organization",
      name: "AI GymBRO",
      url: "https://aigymbro.web.id",
      logo: {
        "@type": "ImageObject",
        url: "https://aigymbro.web.id/android-chrome-512x512.png",
        width: 512,
        height: 512
      },
      founder: {
        "@id": "https://aigymbro.web.id/#person"
      },
      foundingDate: "2024",
      foundingLocation: {
        "@type": "Place",
        name: "Indonesia"
      },
      areaServed: "Worldwide",
      knowsAbout: [
        "Fitness Training",
        "Artificial Intelligence",
        "Nutrition Planning",
        "Health & Wellness"
      ]
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://aigymbro.web.id/#app",
      name: "AI GymBRO",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "150",
        bestRating: "5",
        worstRating: "1"
      },
      author: {
        "@id": "https://aigymbro.web.id/#person"
      },
      url: "https://aigymbro.web.id"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://aigymbro.web.id/#breadcrumbs",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://aigymbro.web.id/"
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "About",
          item: "https://aigymbro.web.id/about"
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Workout Plans",
          item: "https://aigymbro.web.id/workout-plan"
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Meal Plans",
          item: "https://aigymbro.web.id/meal-plan"
        }
      ]
    }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Favicon and App Icons */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#0f172a" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="googlebot" content="index,follow" />
        <meta name="bingbot" content="index,follow" />
        
        {/* JSON-LD Structured Data */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
        
        {/* Google Analytics (replace with your actual GA4 ID) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GTM-KMV59MWT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GTM-KMV59MWT');
          `}
        </Script>
        
        {/* Web Vitals Tracking */}
        <Script id="web-vitals" strategy="afterInteractive">
          {`
            if (typeof window !== 'undefined') {
              function sendToGA(metric) {
                gtag('event', metric.name, {
                  event_category: 'Web Vitals',
                  event_label: metric.id,
                  value: Math.round(metric.name === 'CLS' ? metric.delta * 1000 : metric.delta),
                  non_interaction: true,
                });
              }
              import('https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.iife.js').then(function(module) {
                module.onLCP(sendToGA);
                module.onINP(sendToGA);
                module.onCLS(sendToGA);
                module.onFCP(sendToGA);
                module.onTTFB(sendToGA);
              });
            }
          `}
        </Script>
      </head>
      <body className={`${jakarta.className} ${jakarta.variable} min-h-screen bg-stone-950 text-stone-50 antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Skip to content
        </a>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Navbar />
          <main id="main-content">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}