import { Metadata } from "next"
import { getCategoryBySlug, getThreads } from "@/lib/services/forumService"
import ForumClient from "../forum-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const category = await getCategoryBySlug(resolvedParams.category)
  
  if (!category) {
    return { title: "Category Not Found | AI GymBRO" }
  }
  
  return {
    title: `${category.name} | AI GymBRO Forum`,
    description: category.description,
  }
}

export const revalidate = 60

export default async function CategoryIndex({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page) : 1
  const search = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : undefined

  const [category, { threads, total }] = await Promise.all([
    getCategoryBySlug(resolvedParams.category),
    getThreads(resolvedParams.category, 20, page, search),
  ])

  if (!category) {
    return (
      <div className="min-h-screen bg-stone-950 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Category not found</h1>
        </div>
      </div>
    )
  }

  return (
    <ForumClient
      initialCategories={[]} 
      initialThreads={threads}
      totalThreads={total}
      currentPage={page}
      searchQuery={search}
      currentCategory={category.slug}
      currentCategoryName={category.name}
    />
  )
}
