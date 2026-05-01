import { getBlogs } from "@/lib/services/blogService"

const baseUrl = "https://aigymbro.web.id"

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

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
      <category>${escapeXml(blog.category)}</category>
      <dc:creator><![CDATA[Matthews Wong]]></dc:creator>
      <content:encoded><![CDATA[<p>${escapeXml(blog.excerpt)}</p><p>Read the full article at <a href="${baseUrl}/blog/${blog.slug}">${baseUrl}/blog/${blog.slug}</a></p>]]></content:encoded>
      ${blog.cover_image ? `<enclosure url="${escapeXml(blog.cover_image)}" type="image/png" />` : ""}
    </item>`
    )
    .join("")

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>AI GymBRO Fitness Blog</title>
    <description>Expert workout tips, nutrition guides, and health advice for your fitness journey.</description>
    <link>${baseUrl}/blog</link>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>matthewswong@${baseUrl.replace("https://", "")} (Matthews Wong)</managingEditor>
    <webMaster>matthewswong@${baseUrl.replace("https://", "")} (Matthews Wong)</webMaster>
    <copyright>Copyright ${new Date().getFullYear()} AI GymBRO</copyright>
    <image>
      <url>${baseUrl}/android-chrome-512x512.png</url>
      <title>AI GymBRO</title>
      <link>${baseUrl}</link>
    </image>
    <ttl>60</ttl>
    ${items}
  </channel>
</rss>`

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
