import { getBlogs } from "@/lib/services/blogService"

const baseUrl = "https://aigymbro.web.id"

export async function GET() {
  const blogs = await getBlogs(20)

  const items = blogs
    .map(
      (blog) => `
    <item>
      <title><![CDATA[${blog.title}]]></title>
      <description><![CDATA[${blog.excerpt}]]></description>
      <link>${baseUrl}/blog/${blog.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${blog.slug}</guid>
      <pubDate>${new Date(blog.created_at).toUTCString()}</pubDate>
      <category>${blog.category}</category>
      <author>Matthews Wong</author>
    </item>`
    )
    .join("")

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI GymBRO Fitness Blog</title>
    <description>Expert workout tips, nutrition guides, and health advice for your fitness journey.</description>
    <link>${baseUrl}/blog</link>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>Matthews Wong (https://matthewswong.com)</managingEditor>
    <webMaster>Matthews Wong (https://matthewswong.com)</webMaster>
    <copyright>Copyright ${new Date().getFullYear()} AI GymBRO</copyright>
    <image>
      <url>${baseUrl}/android-chrome-512x512.png</url>
      <title>AI GymBRO</title>
      <link>${baseUrl}</link>
    </image>
    ${items}
  </channel>
</rss>`

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
