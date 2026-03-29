'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PostForm } from '@/components/dashboard/post-form';
import { PostPreview } from '@/components/dashboard/post-preview';
import { TrendingPostModal } from '@/components/dashboard/trending-post-modal';
import AiSuggestModal from '@/components/dashboard/ai-suggest-modal';
import { type Post } from '@/lib/posts-data';
import { TrendingUp, Flame } from 'lucide-react';

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

export default function CreatePostPage() {
  const [formData, setFormData] = useState<Partial<Post>>({
    images: [],
    caption: '',
    platform: 'instagram',
    postType: 'post',
    strategy: '',
    scheduledDate: '',
    autoPost: true,
    shareToPlatforms: [],
  });

  const [selectedPost, setSelectedPost] = useState<TrendingPost | null>(null);
  const [isTrendingModalOpen, setIsTrendingModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

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

  return (
    <div className="p-6 space-y-6">
      {/* ═══ TOP: Create Post Panel ═══ */}
      <div className="rounded-[20px] bg-card shadow-sm border border-border overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[600px]">
          <div className="border-r border-border overflow-y-auto">
            <PostForm formData={formData} setFormData={setFormData} mode="create" />
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
          {trendingPosts.map((post) => {
            const status = statusConfig[post.status];
            return (
              <button
                key={post.id}
                onClick={() => openTrendingModal(post)}
                className="group flex-shrink-0 w-[160px] rounded-[14px] border border-border bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left">
                <div className="relative w-full aspect-square">
                  <Image
                    src={post.imageUrl}
                    alt={post.caption}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="p-2.5">
                  <p className="text-xs line-clamp-2 mb-1.5">{post.caption}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>{formatNumber(post.likes)} likes</span>
                  </div>
                </div>
              </button>
            );
          })}
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
        onSubmit={(data) => {
          console.log('AI INPUT:', data);
        }}
      />
    </div>
  );
}
