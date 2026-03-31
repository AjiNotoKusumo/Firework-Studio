'use client';

import { useState } from 'react';
import { PostCard } from '@/components/dashboard/post-card';
import { TrendingPostModal } from '@/components/dashboard/trending-post-modal';
import { Flame, Sparkles } from 'lucide-react';

// Mock AI-generated storyboard ideas
const redzoneIdeasData = [
  {
    id: 'idea-1',
    imageUrl: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=400&h=400&fit=crop',
    caption: "Hook: 'You’re drinking water WRONG every morning' → fast cuts + bold captions",
    likes: 0,
    comments: 0,
    shares: 0,
    status: 'idea' as const,
    platform: 'instagram' as const,
    author: { name: 'AI Suggestion', avatar: '' },
  },
  {
    id: 'idea-2',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=400&fit=crop',
    caption: 'Story: Before vs After productivity routine → cinematic transitions + voiceover',
    likes: 0,
    comments: 0,
    shares: 0,
    status: 'idea' as const,
    platform: 'instagram' as const,
    author: { name: 'AI Suggestion', avatar: '' },
  },
  {
    id: 'idea-3',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop',
    caption: 'Trend remix: Use viral sound but flip meaning with unexpected ending',
    likes: 0,
    comments: 0,
    shares: 0,
    status: 'idea' as const,
    platform: 'instagram' as const,
    author: { name: 'AI Suggestion', avatar: '' },
  },
];

type RedzoneIdea = (typeof redzoneIdeasData)[number];

export default function RedzonePage() {
  const [ideas, setIdeas] = useState(redzoneIdeasData);
  const [selectedIdea, setSelectedIdea] = useState<RedzoneIdea | null>(null);

  const handleRemoveIdea = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    setSelectedIdea(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#FFE4EC] via-[#FFF0F3] to-[#ff9ab8] p-8">
      {ideas.length > 0 ?
        <>
          {/* 🔥 Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{ideas.length} AI ideas to spark your next post</p>
            </div>
          </div>

          {/* 🔥 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <button
                key={idea.id}
                onClick={() => setSelectedIdea(idea)}
                className="relative text-left transition-transform hover:scale-[1.02]">
                {/* 🔥 subtle glow effect */}
                <div className="absolute inset-0 rounded-[20px] bg-red-500/10 blur-xl opacity-0 hover:opacity-100 transition" />

                <PostCard {...idea} />
              </button>
            ))}
          </div>

          {/* Modal (reuse yours) */}
          <TrendingPostModal
            post={selectedIdea}
            open={!!selectedIdea}
            onOpenChange={(open) => !open && setSelectedIdea(null)}
            onSave={handleRemoveIdea}
            isSaved={false}
          />
        </>
      : <div className="flex flex-col items-center justify-center py-20">
          <div className="rounded-[20px] bg-red-100 p-6 mb-6">
            <Flame className="h-12 w-12 text-red-500" />
          </div>

          <h3 className="text-xl font-semibold text-foreground mb-2">You're out of ideas</h3>

          <p className="text-muted-foreground text-center max-w-md mb-6">
            Your content might be cooling off — jump into Redzone and generate fresh, high-performing ideas.
          </p>

          <button className="flex items-center gap-2 px-5 py-3 rounded-[14px] bg-red-500 text-white hover:bg-red-600 transition">
            <Sparkles className="h-4 w-4" />
            Generate Ideas
          </button>
        </div>
      }
    </div>
  );
}
