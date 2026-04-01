'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PostForm } from '@/components/dashboard/post-form';
import { PostPreview } from '@/components/dashboard/post-preview';
import { TrendingPostModal } from '@/components/dashboard/trending-post-modal';
import AiSuggestModal from '@/components/dashboard/ai-suggest-modal';
import { type Post } from '@/lib/posts-data';
import { TrendingUp, Flame, Sparkles } from 'lucide-react';
import { TrendingPost } from '@/types';
import StoryboardPreviewModal from '@/components/dashboard/ai-generated-modal';
import { useRouter } from 'next/navigation';

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

// ---------------- MOCK DATA ----------------
const redzoneIdeasData = [
  {
    id: 'idea-1',
    imageUrl: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=400&h=400&fit=crop',
    storyboard: {
      concept: {
        title: 'Stop Ruining Your Morning Hydration',
        hook: "You're drinking water wrong every morning",
      },
      globalStyle: {
        visualStyle: 'High-energy, bold captions',
        colorPalette: 'Warm tones, high contrast',
      },
      structure: { type: 'video' as const },
      scenes: [
        {
          id: 1,
          purpose: 'hook',
          description: 'Close-up intense stare holding water',
          startTime: 0,
          endTime: 3,
          camera: 'Close-up',
          motion: 'Static',
          emotion: 'Urgency',
          soundEffect: { name: 'Whoosh' },
        },
        {
          id: 2,
          purpose: 'build',
          description: 'Quick cuts showing wrong habits',
          startTime: 3,
          endTime: 7,
          camera: 'Fast cuts',
          motion: 'Dynamic',
          emotion: 'Informative',
          soundEffect: { name: 'Pop' },
        },
        {
          id: 3,
          purpose: 'payoff',
          description: 'Show correct method clearly',
          startTime: 7,
          endTime: 12,
          camera: 'Medium shot',
          motion: 'Smooth',
          emotion: 'Relief',
          soundEffect: { name: 'Chime' },
        },
      ],
    },
  },
];



type RedzoneIdea = (typeof redzoneIdeasData)[number];

export default function CreatePostPage() {
    
  const [formData, setFormData] = useState<Partial<Post>>({
    images: [],
    caption: '',
    platform: 'instagram',
    postType: 'carousel',
    scheduledAt: '',
    hashtags: [],
    status: 'draft',
  });

  const [selectedPost, setSelectedPost] = useState<TrendingPost | null>(null);
  const [isTrendingModalOpen, setIsTrendingModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [ideas] = useState<RedzoneIdea[]>(redzoneIdeasData);
  const [selectedIdea, setSelectedIdea] = useState<RedzoneIdea | null>(null);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [postId, setPostId] = useState<any>('');
  const router = useRouter();
  const trendingPosts: TrendingPost[] = [
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
      url: 'https://example.com/post/1',
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
      url: 'https://example.com/post/2',
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
      url: 'https://example.com/post/3',
    },
  ];

  const createInstance = async () => {
    try {
      const existingId = localStorage.getItem('creatingPostId');

      if (existingId && existingId !== 'pending') {
        setPostId(existingId);
        return;
      }

      if (existingId === 'pending') {
        return;
      }

      localStorage.setItem('creatingPostId', 'pending');

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to create post instance');
      }

      const post = await res.json();

      localStorage.setItem('creatingPostId', post.data.id);
      setPostId(post.data.id);

    } catch (error) {
      console.log('Error creating post instance:', error);
      router.push('/dashboard/planning');
    }
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

  const openTrendingModal = (post: TrendingPost) => {
    setSelectedPost(post);
    setIsTrendingModalOpen(true);
  };

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

  useEffect(() => {
    fetchSavedPosts();
    createInstance();
  }, [])


  return (
    <div className="p-6 space-y-6">
      {/* ═══ TOP: Create Post Panel ═══ */}
      <div className="rounded-[20px] bg-card shadow-sm border border-border overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[600px]">
          <div className="border-r border-border overflow-y-auto">
            <PostForm formData={formData} setFormData={setFormData} mode="create" postId={postId} />
          </div>

          <div className="hidden lg:flex items-center justify-center bg-muted/40 p-8">
            <PostPreview formData={formData} />
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM: Trending Inspirations ═══ */}
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
                onClick={() => openTrendingModal(post.postData)}
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
                  src={idea.imageUrl}
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

                <h3 className="text-sm font-semibold text-foreground line-clamp-2">{idea.storyboard.concept.hook}</h3>

                <p className="text-xs text-muted-foreground mt-2">
                  {idea.storyboard.scenes.length} scenes • {idea.storyboard.structure.type}
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
        onSubmit={(data: any) => {
          console.log('AI INPUT:', data);
        }}
        postId={postId}
      />

      {/* Storyboard Preview Modal */}
      <StoryboardPreviewModal
        open={!!selectedIdea}
        onOpenChange={(open) => !open && setSelectedIdea(null)}
        storyboardData={selectedIdea?.storyboard ?? null}
      />
    </div>
  );
}
