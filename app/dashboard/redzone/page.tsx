'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import StoryboardPreviewModal from '@/components/dashboard/ai-generated-modal';

// ---------------- MOCK DATA ----------------

// ---------------- PAGE ----------------
export default function RedzonePage() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);

  const fetchIdeas = async () => {
    try {
      const response = await fetch("/api/ai/planning")
      
      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }

      const data = await response.json()

      console.log(data);
      

      setIdeas(data)
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
    }
  }

  useEffect(() => {
    fetchIdeas()
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF0F3] p-8">
      {/* Header Info */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{ideas.length} AI storyboard ideas</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => (
          <button
            key={idea.id}
            onClick={() => setSelectedIdea(idea)}
            className="group text-left rounded-[20px] bg-white border border-pink-100 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl">
            {/* Image */}
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={idea.scenes?.find((s: any) => s.scene?.image)?.scene.image || 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg'}
                alt="idea"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* soft glow */}
              <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content */}
            <div className="p-4">
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
      </div>

      {/* Empty State */}
      {ideas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="rounded-[20px] bg-pink-100 p-6 mb-6">
            <Sparkles className="h-12 w-12 text-pink-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No ideas yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Generate AI storyboard ideas from trending content and they’ll show up here.
          </p>
        </div>
      )}

      {/* Modal */}
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
        fetchIdeas={fetchIdeas}
      />
    </div>
  );
}
