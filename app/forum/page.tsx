import { Metadata } from "next"
import { getCategories, getThreads } from "@/lib/services/forumService"
import ForumClient from "./forum-client"

export const metadata: Metadata = {
  title: "Forum | AI GymBRO",
  description: "Join the community to discuss workouts, nutrition, and fitness tips.",
}

export const revalidate = 60 // regenerate every 60s

export default async function ForumIndex({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page) : 1
  const search = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined

  const [categories, { threads, total }] = await Promise.all([
    getCategories(),
    getThreads(undefined, 20, page, search),
  ])

  return (
    <ForumClient
      initialCategories={categories}
      initialThreads={threads}
      totalThreads={total}
      currentPage={page}
      searchQuery={search}
    />
  )
}
