import { Metadata } from "next"
import { getThread, getReplies } from "@/lib/services/forumService"
import ThreadClient from "./thread-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const thread = await getThread(resolvedParams.category, resolvedParams.slug)
  
  if (!thread) {
    return { title: "Thread Not Found | AI GymBRO" }
  }
  
  return {
    title: `${thread.title} | AI GymBRO Forum`,
    description: thread.content?.slice(0, 200) || "Join the discussion on AI GymBRO Forum",
  }
}

export const revalidate = 10 // fairly dynamic

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const resolvedParams = await params
  
  // First get the thread
  const thread = await getThread(resolvedParams.category, resolvedParams.slug)

  if (!thread) {
    return (
      <div className="min-h-screen bg-stone-950 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Thread not found</h1>
        </div>
      </div>
    )
  }

  // Load replies concurrently or immediately after
  const replies = await getReplies(thread.id)

  return (
    <ThreadClient 
      initialThread={thread} 
      initialReplies={replies} 
      categorySlug={resolvedParams.category} 
    />
  )
}
