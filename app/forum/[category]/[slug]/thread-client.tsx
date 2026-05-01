"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, MessageSquare, Clock, Send, Lock, AlertCircle } from "lucide-react"
import { getThread, getReplies, createReply, type ForumThread, type ForumReply } from "@/lib/services/forumService"
import { useAuth } from "@/lib/hooks/useAuth"

const colorMap: Record<string, string> = {
  teal: "bg-teal-500/20 text-teal-400",
  emerald: "bg-emerald-500/20 text-emerald-400",
  amber: "bg-amber-500/20 text-amber-400",
  rose: "bg-rose-500/20 text-rose-400",
  blue: "bg-blue-500/20 text-blue-400",
  violet: "bg-violet-500/20 text-violet-400",
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ThreadClient({ 
  initialThread, 
  initialReplies, 
  categorySlug 
}: { 
  initialThread: ForumThread
  initialReplies: ForumReply[]
  categorySlug: string 
}) {
  const [thread, setThread] = useState<ForumThread | null>(initialThread)
  const [replies, setReplies] = useState<ForumReply[]>(initialReplies)
  const [replyContent, setReplyContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    setThread(initialThread)
    setReplies(initialReplies)
  }, [initialThread, initialReplies])

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !thread || !replyContent.trim()) return

    setSubmitting(true)
    setError(null)

    const newReply = await createReply(thread.id, replyContent.trim(), user.id)
    
    if (newReply) {
      setReplies([...replies, { ...newReply, author_username: user.email?.split("@")[0] || "User" }])
      setReplyContent("")
    } else {
      setError("Failed to post reply. Please try again.")
    }
    
    setSubmitting(false)
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-stone-950 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Thread not found</h1>
          <Link href="/forum" className="text-teal-400 hover:underline">
            Back to Forum
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-stone-500 mb-6">
          <Link href="/forum" className="hover:text-white transition-colors">Forum</Link>
          <span>/</span>
          <Link href={`/forum/${categorySlug}`} className="hover:text-white transition-colors">
            {thread.category_name}
          </Link>
          <span>/</span>
          <span className="text-stone-400 truncate">{thread.title}</span>
        </div>

        {/* Thread */}
        <article className="bg-stone-900/80 border border-stone-800/50 rounded-2xl overflow-hidden mb-6">
          {/* Thread Header */}
          <div className="p-6 border-b border-stone-800/50">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colorMap[thread.category_color || "teal"]}`}>
                {thread.category_name}
              </span>
              {thread.is_locked && (
                <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-stone-700 text-stone-400">
                  <Lock className="w-3 h-3" />
                  Locked
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">{thread.title}</h1>
            <div className="flex items-center gap-4 text-sm text-stone-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center">
                  <span className="text-xs font-medium text-stone-400">
                    {thread.author_username?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
                <span className="text-stone-300">{thread.author_username}</span>
              </div>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDate(thread.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {thread.views}
              </span>
            </div>
          </div>
          
          {/* Thread Content */}
          <div className="p-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-stone-300 whitespace-pre-wrap">{thread.content}</p>
            </div>
          </div>
        </article>

        {/* Replies Section */}
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
            <MessageSquare className="w-5 h-5 text-teal-400" />
            Replies ({replies.length})
          </h2>

          {replies.length === 0 ? (
            <div className="text-center py-8 bg-stone-900/50 border border-stone-800/50 rounded-xl">
              <p className="text-stone-500">No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply, index) => (
                <div
                  key={reply.id}
                  className="bg-stone-900/80 border border-stone-800/50 rounded-xl p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-stone-400">
                        {reply.author_username?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-white">{reply.author_username}</span>
                        <span className="text-xs text-stone-600">{formatDate(reply.created_at)}</span>
                        <span className="text-xs text-stone-700">#{index + 1}</span>
                      </div>
                      <p className="text-stone-300 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        {thread.is_locked ? (
          <div className="flex items-center gap-3 p-4 bg-stone-900/50 border border-stone-800/50 rounded-xl text-stone-500">
            <Lock className="w-5 h-5" />
            <span>This thread is locked. No new replies can be posted.</span>
          </div>
        ) : user ? (
          <form onSubmit={handleSubmitReply} className="bg-stone-900/80 border border-stone-800/50 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4">Post a Reply</h3>
            
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              rows={4}
              className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/50 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:border-teal-500/50 resize-none"
              required
            />
            
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 disabled:from-stone-700 disabled:to-stone-700 text-white font-medium rounded-xl transition-all disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? "Posting..." : "Post Reply"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-stone-900/80 border border-stone-800/50 rounded-xl p-6 text-center">
            <p className="text-stone-400 mb-4">Sign in to join the discussion</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-medium rounded-xl transition-all"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href={`/forum/${categorySlug}`}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {thread.category_name}
          </Link>
        </div>
      </div>
    </div>
  )
}
