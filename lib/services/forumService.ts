import { supabase } from "@/lib/supabase"

export interface ForumCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  sort_order: number
  thread_count?: number
  is_admin_only?: boolean
}

export interface ForumThread {
  id: string
  category_id: string
  user_id: string
  title: string
  slug: string
  content: string
  views: number
  is_pinned: boolean
  is_locked: boolean
  created_at: string
  updated_at: string
  author_username?: string
  author_avatar?: string
  category_name?: string
  category_slug?: string
  category_color?: string
  reply_count?: number
  last_reply_at?: string
}

export interface ForumReply {
  id: string
  thread_id: string
  user_id: string
  content: string
  is_solution: boolean
  created_at: string
  updated_at: string
  author_username?: string
  author_avatar?: string
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100)
    .replace(/^-|-$/g, "")
}

export async function getCategories(): Promise<ForumCategory[]> {
  const { data, error } = await supabase
    .from("forum_categories")
    .select("id, name, slug, description, icon, color, sort_order, is_admin_only")
    .order("sort_order")

  if (error) {
    return []
  }

  return data || []
}

export async function getThreads(categorySlug?: string, limit = 20, page = 1, searchQuery?: string): Promise<{ threads: ForumThread[], total: number }> {
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from("forum_threads_with_author")
    .select("id, category_id, user_id, title, slug, content, views, is_pinned, is_locked, created_at, updated_at, author_username, category_name, category_slug, category_color, reply_count", { count: 'exact' })
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (categorySlug) {
    query = query.eq("category_slug", categorySlug)
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return { threads: [], total: 0 }
  }

  return { threads: data || [], total: count || 0 }
}

export async function getThread(categorySlug: string, threadSlug: string): Promise<ForumThread | null> {
  const { data, error } = await supabase
    .from("forum_threads_with_author")
    .select("id, category_id, user_id, title, slug, content, views, is_pinned, is_locked, created_at, updated_at, author_username, author_avatar, category_name, category_slug, category_color, reply_count")
    .eq("category_slug", categorySlug)
    .eq("slug", threadSlug)
    .maybeSingle()

  if (error) {
    return null
  }

  // Increment views in background (non-blocking)
  if (data) {
    supabase
      .from("forum_threads")
      .update({ views: (data.views || 0) + 1 })
      .eq("id", data.id)
      .then()
  }

  return data
}

export async function getReplies(threadId: string): Promise<ForumReply[]> {
  const { data, error } = await supabase
    .from("forum_replies_with_author")
    .select("id, thread_id, user_id, content, is_solution, created_at, updated_at, author_username, author_avatar")
    .eq("thread_id", threadId)
    .order("created_at")

  if (error) {
    return []
  }

  return data || []
}

export async function createThread(
  categoryId: string,
  title: string,
  content: string,
  userId: string
): Promise<ForumThread | null> {
  const slug = generateSlug(title) + "-" + Date.now().toString(36)

  const { data, error } = await supabase
    .from("forum_threads")
    .insert({
      category_id: categoryId,
      user_id: userId,
      title,
      slug,
      content,
    })
    .select()
    .single()

  if (error) {
    return null
  }

  return data
}

export async function createReply(
  threadId: string,
  content: string,
  userId: string
): Promise<ForumReply | null> {
  const { data, error } = await supabase
    .from("forum_replies")
    .insert({
      thread_id: threadId,
      user_id: userId,
      content,
    })
    .select()
    .single()

  if (error) {
    return null
  }

  return data
}

export async function getCategoryBySlug(slug: string): Promise<ForumCategory | null> {
  const { data, error } = await supabase
    .from("forum_categories")
    .select("id, name, slug, description, icon, color, sort_order, is_admin_only")
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    return null
  }

  return data
}
