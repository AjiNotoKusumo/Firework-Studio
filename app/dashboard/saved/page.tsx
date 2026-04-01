"use client"

import { useEffect, useState } from "react"
import { PostCard } from "@/components/dashboard/post-card"
import { TrendingPostModal } from "@/components/dashboard/trending-post-modal"
import { Bookmark } from "lucide-react"

// Mock saved posts data (these are external/trending posts saved by user)
const savedPostsData = [
  {
    id: "saved-1",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    caption: "Mountain sunrise vibes - nature's alarm clock never disappoints",
    likes: 24500,
    comments: 1820,
    shares: 3200,
    status: "trending" as const,
    platform: "instagram" as const,
    author: { name: "NatureExplorer", avatar: "" },
    url: "https://www.instagram.com/p/EXAMPLE1"
  },
  {
    id: "saved-2",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    caption: "Ocean waves and salty air - the best therapy money can't buy",
    likes: 31200,
    comments: 2340,
    shares: 4500,
    status: "trending" as const,
    platform: "instagram" as const,
    author: { name: "CoastalDreamer", avatar: "" },
    url: "https://www.instagram.com/p/EXAMPLE2"
  },
  {
    id: "saved-3",
    imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop",
    caption: "Valley views that take your breath away - hiking is worth it",
    likes: 22300,
    comments: 1560,
    shares: 2800,
    status: "trending" as const,
    platform: "instagram" as const,
    author: { name: "TrailBlazer", avatar: "" },
    url: "https://www.instagram.com/p/EXAMPLE3"
  },
]

type SavedPost = typeof savedPostsData[number]

export default function SavedPage() {
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [postsId, setPostsId] = useState<string[]>([])
  const [selectedPost, setSelectedPost] = useState<SavedPost | null>(null)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const fetchSavedPosts = async () => {
    try {
      const response = await fetch("/api/posts/trending")
      if(!response.ok) {
        throw new Error("Failed to fetch saved posts")
      }

      const data = await response.json()      

      const postData  = data.data

      setSavedPosts(postData)
    } catch (error) {
      console.error("Failed to fetch saved posts:", error)
    }
  }

  
  const handleUnsavePost = (postId: string) => {
    setSavedPosts(prev => prev.filter(p => p.id !== postId))
    setSelectedPost(null)
  }

  useEffect(() => {
    fetchSavedPosts()
  }, [])

  return (
    <div className="p-8">
      {savedPosts.length > 0 ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{savedPosts.length} saved posts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPosts.map((post) => (
              <button 
                key={post.id} 
                onClick={() => {
                  setSelectedPost(post.postData);
                  setSelectedPostId(post.id);
                }}
                className="text-left transition-transform hover:scale-[1.02]"
              >
                <PostCard {...post.postData} />
              </button>
            ))}
          </div>

          {/* Post Modal */}
          <TrendingPostModal
            post={selectedPost}
            open={!!selectedPost}
            onOpenChange={(open) => !open && setSelectedPost(null)}
            onSave={handleUnsavePost}
            isSaved={true}
            postId={selectedPostId as string}
            fetchSavedPosts={fetchSavedPosts}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="rounded-[20px] bg-secondary p-6 mb-6">
            <Bookmark className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No saved posts yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Start exploring trending content and save posts you want to reference later for your content inspiration.
          </p>
        </div>
      )}
    </div>
  )
}
