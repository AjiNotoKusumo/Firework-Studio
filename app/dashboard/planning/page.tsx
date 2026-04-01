"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { type Post } from "@/lib/posts-data"
import { Spinner } from "@/components/ui/spinner"

export default function PlanningPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts")
      
      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }

      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-88px)] flex items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 relative min-h-[calc(100vh-88px)]">
      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/dashboard/posts/${post.id}`}
            className="block rounded-[20px] bg-card p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all hover:scale-[1.02]"
          >
            <div className="relative aspect-square rounded-[16px] overflow-hidden bg-secondary">
              <Image
                src={post.media && post.media?.length > 0 ? post.media[0].url : "https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg"}
                alt={post.caption}
                fill
                className="object-cover"
              />
              {post.media!.length > 1 && (
                <div className="absolute top-3 right-3 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                  +{post.media!.length - 1}
                </div>
              )}
              <div className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-medium ${
                post.status === "published" 
                  ? "bg-[#A7D7A0] text-[#2E2E2E]"
                  : post.status === "scheduled"
                    ? "bg-[#CFEFFF] text-[#0EA5E9]" 
                    : "bg-[#FFD54F] text-[#2E2E2E]"
              }`}>
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </div>
            </div>
            <p className="mt-4 text-sm text-foreground line-clamp-2">{post.caption}</p>
            {post.scheduledAt && post.status === "scheduled" && (
              <p className="mt-2 text-xs text-muted-foreground">
                Scheduled for {new Date(post.scheduledAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            )}
            {post.scheduledAt && Date.now() >= new Date(post.scheduledAt).getTime() && (
              <p className="mt-2 text-xs text-muted-foreground">
                Published at {new Date(post.scheduledAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            )}
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-secondary p-6 mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
          <p className="text-muted-foreground mb-4">Create your first post to get started</p>
          <Link
            href="/dashboard/posts/create"
            className="rounded-[16px] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create Post
          </Link>
        </div>
      )}

      {/* Floating Add Button */}
      <Link
        href="/dashboard/posts/create"
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </Link>
    </div>
  )
}
