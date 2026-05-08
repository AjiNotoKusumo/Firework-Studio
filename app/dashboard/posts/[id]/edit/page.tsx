"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PostForm } from "@/components/dashboard/post-form"
import { type Post } from "@/lib/posts-data"
import { Spinner } from "@/components/ui/spinner"
import { PostPreview } from "@/components/dashboard/post-preview"
import Image from 'next/image';
import { TrendingUp, Flame, Sparkles } from 'lucide-react';
import AiSuggestModal from "@/components/dashboard/ai-suggest-modal"
import { TrendingPostModal } from "@/components/dashboard/trending-post-modal"
import StoryboardPreviewModal from "@/components/dashboard/ai-generated-modal"

interface TrendingPost {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  status: 'trending' | 'growing' | 'stable';
  platform: 'instagram' | 'twitter';
  author: {
    name: string;
    avatar?: string;
  };
}

const trendingPosts : TrendingPost[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7',
    caption: 'Viral hook + clean aesthetic 🔥',
    likes: 12000,
    comments: 800,
    shares: 320,
    status: 'trending',
    platform: 'instagram',
    author: { name: 'Creator A' },
  },
  {
    id: '2',
    imageUrl:
      'https://images.unsplash.com/photo-1774246651781-d0cf98fb2fd9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0',
    caption: 'Minimal content wins attention',
    likes: 8700,
    comments: 500,
    shares: 210,
    status: 'growing',
    platform: 'instagram',
    author: { name: 'Creator B' },
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
    caption: 'Bold messaging + contrast',
    likes: 5400,
    comments: 300,
    shares: 150,
    status: 'stable',
    platform: 'twitter',
    author: { name: 'Creator C' },
  },
];

const statusConfig = {
  trending: { label: 'Trending', className: 'bg-[#FFD54F] text-[#2E2E2E]' },
  growing: { label: 'Growing', className: 'bg-[#A7D7A0] text-[#2E2E2E]' },
  stable: { label: 'Stable', className: 'bg-[#CFEFFF] text-[#2E2E2E]' },
};

const formatNumber = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

export default function EditPostPage() {
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [isTrendingModalOpen, setIsTrendingModalOpen] = useState(false);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<any | null>(null);

  const [formData, setFormData] = useState<Partial<Post>>({
    images: [],
    caption: '',
    platform: 'instagram',
    postType: 'carousel',
    scheduledAt: '',
    hashtags: [],
    status: 'draft',
  });

  const fetchIdeas = async () => {
    try {
      const response = await fetch(`/api/ai/planning/${params.id}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }

      const data = await response.json()

      setIdeas(data)
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
    }
  }

  const handleSaveTrending = () => {
    if (!selectedPost) return;
    setFormData((prev) => ({
      ...prev,
      images: [selectedPost.imageUrl],
      caption: selectedPost.caption,
      platform: selectedPost.platform,
    }));
    setIsTrendingModalOpen(false);
  };

  const openTrendingModal = (post: any) => {
    setSelectedPost(post);
    setIsTrendingModalOpen(true);
  };

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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`)
        if (!response.ok) {
          throw new Error("Post not found")
        }
        const data = await response.json()

        setFormData({
          images: data.media.map((img: any) => img.url) || [],
          caption: data.caption || '',
          platform: data.platform || 'instagram',
          postType: data.postType || 'carousel',
          scheduledAt: data.scheduledAt || '',
          hashtags: data.hashtags || [],
          status: data.status || 'draft',
        });

        setPost(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPost()
    }

    fetchSavedPosts()
    fetchIdeas()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-88px)] flex items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-[calc(100vh-88px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Post not found</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return <>
    <div className="p-6 space-y-6">
      {/* ═══ TOP: Create Post Panel ═══ */}
      <div className="rounded-[20px] bg-card shadow-sm border border-border overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[600px]">
          <div className="border-r border-border overflow-y-auto">
            <PostForm mode="edit" initialData={post} formData={formData} setFormData={setFormData} />
          </div>

          <div className="hidden lg:flex items-center justify-center bg-muted/40 p-8">
            <PostPreview formData={formData} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-full bg-[#FFD54F]/20 flex items-center justify-center">
            <Flame className="h-3.5 w-3.5 text-[#F59E0B]" />
          </div>
          <h3 className="text-sm font-semibold">Trending Inspirations</h3>
          <span className="text-xs text-muted-foreground">— click to use as inspiration</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {savedPosts.map((post) => {
            // const status = statusConfig[post.status];
            return (
              <button
                key={post.id}
                onClick={() => openTrendingModal(post)}
                className="group flex-shrink-0 w-[160px] rounded-[14px] border border-border bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left">
                <div className="relative w-full aspect-square">
                  <Image
                    src={post.postData.imageUrl}
                    alt={post.postData.caption}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* <span
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.className}`}>
                    {status.label}
                  </span> */}
                </div>

                <div className="p-2.5">
                  <p className="text-xs line-clamp-2 mb-1.5">{post.postData.caption}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>{formatNumber(post.postData.likes)} likes</span>
                  </div>
                </div>
              </button>
            );
          })}

          {ideas.map((idea) => (
            <button
              key={idea.id}
              onClick={() => setSelectedIdea(idea)}
              className="group flex-shrink-0 w-[160px] text-left rounded-[20px] bg-white border border-pink-100 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl">
              {/* Image */}
              <div className="relative w-full aspect-square overflow-hidden">
                <img
                  src={idea.scenes?.[0].scene.image || 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg'}
                  alt="idea"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Content */}
              <div className="p-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-pink-500" />
                  <span className="text-xs font-medium text-pink-500">AI Idea</span>
                </div>

                <h3 className="text-sm font-semibold text-foreground line-clamp-2">{idea.concept.hook}</h3>

                <p className="text-xs text-muted-foreground mt-2">
                  {idea.scenes.length} scenes • {idea.structure}
                </p>
              </div>
            </button>
          ))}

          {/* 🤖 AI BUTTON */}
          <button
            className="group relative flex-shrink-0 w-[160px] rounded-[14px] border border-border bg-card overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            onClick={() => setIsAiModalOpen(true)}>
            {/* Animated gradient border glow */}
            <div className="absolute inset-0 rounded-[14px] p-[1px] opacity-0 group-hover:opacity-100 transition">
              <div className="w-full h-full rounded-[14px] bg-[conic-gradient(from_180deg_at_50%_50%,#ff00cc,#3333ff,#00ffee,#ff00cc)] blur-[6px] opacity-40" />
            </div>

            {/* Subtle inner background shift */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition" />

            {/* Status badge */}
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
              Fire Up 💥
            </span>

            {/* AI core */}
            <div className="flex flex-col items-center justify-center w-full aspect-square gap-2">
              {/* Pulsing AI node */}
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition" />
                <span className="absolute inset-0 rounded-full border border-primary/40 animate-ping opacity-0 group-hover:opacity-100" />

                <div className="relative w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-semibold tracking-wider group-hover:scale-110 transition">
                  AI
                </div>
              </div>

              {/* Dynamic text */}
              <p className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition">
                Generate idea
              </p>
            </div>

            {/* Bottom micro hint */}
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-[10px] text-muted-foreground group-hover:text-primary transition">
                Smart suggestion ready
              </p>
            </div>

            {/* Scan line effect */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-full left-0 w-full h-full bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[scan_1.2s_linear]"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Trending Modal */}
      <TrendingPostModal
        post={selectedPost}
        open={isTrendingModalOpen}
        onOpenChange={setIsTrendingModalOpen}
        onSave={handleSaveTrending}
      />

      {/* 🤖 AI Modal */}
      <AiSuggestModal
        open={isAiModalOpen}
        onOpenChange={setIsAiModalOpen}
        onSubmit={(data : any) => {
          console.log('AI INPUT:', data);
        }}
        postId={params.id as string}
        fetchIdeas={fetchIdeas}
      />

      <StoryboardPreviewModal
        open={!!selectedIdea}
        onOpenChange={(open) => !open && setSelectedIdea(null)}
        storyboardData={{
          concept: selectedIdea?.concept,
          globalStyle: selectedIdea?.globalStyle,
          structure: { type: selectedIdea?.structure },
          scenes: selectedIdea?.scenes.map((s: any) => s.scene),
        }}
        planId={selectedIdea?.id}
        postId={params.id as string}
      />
    </div>
  </> 
  
}
